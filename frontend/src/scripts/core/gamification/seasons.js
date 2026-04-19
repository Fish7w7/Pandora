const Seasons = {
    KEY: 'nyan_season_current',
    HISTORY_KEY: 'nyan_season_history',
    EVENT_NOTICE_KEY: 'nyan_weekend_event_notice',
    RANKING_FILTER_KEY: 'nyan_season_ranking_filter',

    RANKING_SYNC_COOLDOWN: 15000,
    _lastRankingSyncAt: 0,
    _rankingFilter: 'global',

    CONFIG: [
        {
            id: 'season_1',
            name: 'Temporada 1 - Despertar',
            icon: '\u{1F338}',
            startDate: Date.parse('2026-04-15T00:00:00-03:00'),
            endDate: Date.parse('2026-05-15T23:59:59-03:00'),
        },
    ],

    TIERS: [
        { tier: 1, id: 'bronze', label: 'Bronze', xp: 0, reward: 'Badge sazonal' },
        { tier: 2, id: 'silver', label: 'Prata', xp: 500, reward: 'Titulo sazonal' },
        { tier: 3, id: 'gold', label: 'Ouro', xp: 1500, reward: 'Borda exclusiva' },
        { tier: 4, id: 'platinum', label: 'Platina', xp: 3500, reward: 'Item especial raro' },
    ],

    REWARD_CONFIG: {
        season_1: {
            tiers: {
                1: [
                    { type: 'chips', amount: 120, label: '+120 chips' },
                    { type: 'badge', badgeId: 'badge_season1', label: 'Badge da temporada' },
                ],
                2: [
                    { type: 'chips', amount: 180, label: '+180 chips' },
                    { type: 'item', itemId: 'title_season1_silver', label: 'Titulo Aurora da Temporada' },
                ],
                3: [
                    { type: 'chips', amount: 260, label: '+260 chips' },
                    { type: 'item', itemId: 'border_season1', label: 'Borda Fronteira S1' },
                ],
                4: [
                    { type: 'chips', amount: 420, label: '+420 chips' },
                    { type: 'item', itemId: 'particle_season1_petals', label: 'Particulas Petalas S1' },
                ],
            },
            final: [
                { type: 'chips', amount: 650, label: '+650 chips' },
                { type: 'item', itemId: 'title_season1_champion', label: 'Titulo Despertar Supremo' },
            ],
        },
    },

    WEEKEND_EVENTS: [
        { id: 'xp_boost', name: 'Fim de Semana XP x2', multiplier: 2, affects: 'xp' },
        { id: 'chip_boost', name: 'Chuva de Chips', multiplier: 1.5, affects: 'chips' },
        { id: 'quiz_night', name: 'Noite do Quiz', bonus: 'quiz_score_x2', affects: 'xp' },
        { id: 'type_challenge', name: 'Desafio do Digitador', bonus: 'typeracer_bonus', affects: 'xp' },
    ],

    _seed(str) {
        let h = 5381;
        for (let i = 0; i < str.length; i++) {
            h = ((h << 5) + h) ^ str.charCodeAt(i);
        }
        return Math.abs(h);
    },

    _collectionPath(seasonId) {
        return `leaderboards/season_${seasonId}/scores`;
    },

    _getWeekStart(date = new Date()) {
        const d = new Date(date);
        const day = d.getDay();
        const monday = new Date(d);
        monday.setDate(d.getDate() - ((day + 6) % 7));
        const y = monday.getFullYear();
        const m = String(monday.getMonth() + 1).padStart(2, '0');
        const dd = String(monday.getDate()).padStart(2, '0');
        return `${y}-${m}-${dd}`;
    },

    _today() {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${dd}`;
    },

    _stateFromConfig(cfg, prev = {}) {
        const seasonXP = Math.max(0, Number(prev.seasonXP || 0));
        const claimedTiers = this._normalizeClaimedTiers(prev.claimedTiers);
        const rewardFlags = prev.rewardFlags && typeof prev.rewardFlags === 'object'
            ? { ...prev.rewardFlags }
            : {};
        const finalClaimed = prev.claimed === true || prev.finalRewardClaimed === true;
        return {
            id: cfg.id,
            name: cfg.name,
            icon: cfg.icon,
            startDate: cfg.startDate,
            endDate: cfg.endDate,
            seasonXP,
            tier: this.getTierByXP(seasonXP),
            claimed: finalClaimed,
            finalRewardClaimed: finalClaimed,
            claimedTiers,
            rewardFlags,
        };
    },

    _activeConfig(now = Date.now()) {
        return this.CONFIG.find((c) => now >= c.startDate && now <= c.endDate)
            || this.CONFIG[this.CONFIG.length - 1]
            || null;
    },

    load() {
        try {
            const raw = localStorage.getItem(this.KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (_) {
            return null;
        }
    },

    save(state) {
        try {
            localStorage.setItem(this.KEY, JSON.stringify(state));
        } catch (e) {
            console.error('[Seasons] Erro ao salvar temporada:', e);
        }
    },

    _archiveIfChanged(prevState, nextState) {
        if (!prevState || !nextState) return;
        if (prevState.id === nextState.id) return;

        const history = Utils.loadData(this.HISTORY_KEY) || [];
        history.unshift({ ...prevState, archivedAt: Date.now() });
        while (history.length > 12) history.pop();
        Utils.saveData(this.HISTORY_KEY, history);
    },

    ensureCurrentSeason() {
        const cfg = this._activeConfig();
        if (!cfg) return null;

        const state = this.load();
        const needsReset = !state || state.id !== cfg.id || !state.startDate || !state.endDate;

        if (!needsReset) {
            const hydrated = this._stateFromConfig(cfg, state);
            this._migrateLegacySeasonRewards(hydrated);
            this._enforceSeasonRewardOwnership(hydrated);
            this.save(hydrated);
            return hydrated;
        }

        const next = this._stateFromConfig(cfg);
        this._migrateLegacySeasonRewards(next);
        this._enforceSeasonRewardOwnership(next);
        this._archiveIfChanged(state, next);
        this.save(next);
        return next;
    },

    getCurrentSeason() {
        return this.ensureCurrentSeason();
    },

    getTierByXP(xp = 0) {
        const safe = Math.max(0, Number(xp || 0));
        let current = 1;
        this.TIERS.forEach((t) => {
            if (safe >= t.xp) current = t.tier;
        });
        return current;
    },

    getTier() {
        return this.getCurrentSeason()?.tier || 1;
    },

    _normalizeClaimedTiers(raw = null) {
        const normalized = {};
        this.TIERS.forEach((t) => {
            normalized[Number(t.tier)] = false;
        });

        if (Array.isArray(raw)) {
            raw.forEach((tier) => {
                const key = Number(tier);
                if (Object.prototype.hasOwnProperty.call(normalized, key)) {
                    normalized[key] = true;
                }
            });
            return normalized;
        }

        if (raw && typeof raw === 'object') {
            Object.keys(raw).forEach((tier) => {
                const key = Number(tier);
                if (Object.prototype.hasOwnProperty.call(normalized, key)) {
                    normalized[key] = raw[tier] === true;
                }
            });
        }

        return normalized;
    },

    _isTierClaimed(state, tier = 0) {
        const key = Number(tier);
        const map = this._normalizeClaimedTiers(state?.claimedTiers);
        return map[key] === true;
    },

    _setTierClaimed(state, tier = 0, claimed = true) {
        if (!state) return;
        const key = Number(tier);
        const map = this._normalizeClaimedTiers(state.claimedTiers);
        if (Object.prototype.hasOwnProperty.call(map, key)) {
            map[key] = claimed === true;
            state.claimedTiers = map;
        }
    },

    _seasonRewardConfig(seasonId = '') {
        return this.REWARD_CONFIG[String(seasonId || '')] || null;
    },

    _tierRewardEntries(seasonId = '', tier = 0) {
        const cfg = this._seasonRewardConfig(seasonId);
        if (!cfg?.tiers) return [];
        const entries = cfg.tiers[Number(tier)] || [];
        return Array.isArray(entries) ? entries : [];
    },

    _finalRewardEntries(seasonId = '') {
        const cfg = this._seasonRewardConfig(seasonId);
        const entries = cfg?.final || [];
        return Array.isArray(entries) ? entries : [];
    },

    _rewardEntryLabel(entry = {}) {
        if (entry.label) return String(entry.label);
        if (entry.type === 'chips') {
            const amount = Math.max(0, Math.round(Number(entry.amount || 0)));
            return `+${amount} chips`;
        }
        if (entry.type === 'badge') {
            const badge = window.Badges?.getBadge?.(entry.badgeId);
            return badge?.name || String(entry.badgeId || 'Badge sazonal');
        }
        if (entry.type === 'item') {
            const item = window.Inventory?.getItem?.(entry.itemId);
            return item?.name || String(entry.itemId || 'Item sazonal');
        }
        if (entry.type === 'flag') {
            return String(entry.key || 'Insignia sazonal');
        }
        return 'Recompensa sazonal';
    },

    _tierRewardText(seasonId = '', tier = 0, fallback = '') {
        const entries = this._tierRewardEntries(seasonId, tier);
        if (!entries.length) return fallback || 'Sem recompensa configurada';
        return entries.map((entry) => this._rewardEntryLabel(entry)).join(' | ');
    },

    _claimableTiers(state = null) {
        const s = state || this.getCurrentSeason();
        if (!s) return [];
        const achievedTier = Math.max(1, Number(s.tier || 1));
        return this.TIERS
            .map((t) => Number(t.tier))
            .filter((tier) => tier <= achievedTier && !this._isTierClaimed(s, tier));
    },

    _applyRewardEntries(entries = [], state = null) {
        const list = Array.isArray(entries) ? entries : [];
        const s = state || this.getCurrentSeason();
        const grantedLabels = [];
        let economyChanged = false;

        list.forEach((entry) => {
            if (!entry || typeof entry !== 'object') return;
            if (entry.type === 'chips') {
                const amount = Math.max(0, Math.round(Number(entry.amount || 0)));
                if (amount <= 0) return;
                if (window.Economy?.grantChips) {
                    window.Economy.grantChips(amount);
                    economyChanged = true;
                }
                grantedLabels.push(this._rewardEntryLabel(entry));
                return;
            }

            if (entry.type === 'badge') {
                const badgeId = String(entry.badgeId || '').trim();
                if (!badgeId || !window.Badges?.unlock) return;
                const wasOwned = window.Badges?.owns?.(badgeId) === true;
                const unlocked = window.Badges.unlock(badgeId, { silent: true });
                if (unlocked || wasOwned) {
                    grantedLabels.push(this._rewardEntryLabel(entry));
                }
                return;
            }

            if (entry.type === 'item') {
                const itemId = String(entry.itemId || '').trim();
                if (!itemId || !window.Inventory?.unlockItem) return;
                const unlocked = window.Inventory.unlockItem(itemId);
                const item = window.Inventory?.getItem?.(itemId);
                if (unlocked) {
                    grantedLabels.push(item?.name || this._rewardEntryLabel(entry));
                }
                return;
            }

            if (entry.type === 'flag') {
                const key = String(entry.key || '').trim();
                if (!key || !s) return;
                if (!s.rewardFlags || typeof s.rewardFlags !== 'object') {
                    s.rewardFlags = {};
                }
                if (s.rewardFlags[key] === true) return;
                s.rewardFlags[key] = true;
                grantedLabels.push(this._rewardEntryLabel(entry));
            }
        });

        return { grantedLabels, economyChanged };
    },

    _syncAfterClaim(economyChanged = false) {
        if (!window.NyanAuth?._syncLocalProfile) return;
        window.NyanAuth._syncLocalProfile({ includeEconomy: economyChanged === true }).catch(() => {});
    },

    _migrateLegacySeasonRewards(state = null) {
        const s = state || this.load();
        if (!s || String(s.id || '') !== 'season_1') return false;

        const hasLegacyFlag = s.rewardFlags?.season1_badge === true;
        const bronzeClaimed = this._isTierClaimed(s, 1);
        const hadLegacyTitle = window.Inventory?.owns?.('title_season1_badge') === true;
        if (!hasLegacyFlag && !bronzeClaimed && !hadLegacyTitle) return false;

        let changed = false;
        if (window.Badges?.unlock) {
            const unlockedBadge = window.Badges.unlock('badge_season1', { silent: true, skipSync: true });
            if (unlockedBadge) changed = true;
        }
        if (hadLegacyTitle && window.Inventory?.revokeItem) {
            const revokedLegacy = window.Inventory.revokeItem('title_season1_badge', { silent: true });
            if (revokedLegacy) changed = true;
        }
        if (!s.rewardFlags || typeof s.rewardFlags !== 'object') {
            s.rewardFlags = {};
        }
        if (hasLegacyFlag) {
            s.rewardFlags.season1_badge_migrated = true;
        }
        return changed;
    },

    _enforceSeasonRewardOwnership(state = null) {
        const s = state || this.load();
        if (!s || String(s.id || '') !== 'season_1') return false;
        if (!window.Inventory?.owns || !window.Inventory?.revokeItem) return false;

        let changed = false;

        const bronzeAllowed = this._isTierClaimed(s, 1);
        if (!bronzeAllowed) {
            if (window.Badges?.owns?.('badge_season1') && window.Badges?.revoke) {
                const revokedBadge = window.Badges.revoke('badge_season1', { silent: true, skipSync: true });
                if (revokedBadge) changed = true;
            }
            if (window.Inventory.owns('title_season1_badge')) {
                const revokedLegacy = window.Inventory.revokeItem('title_season1_badge', { silent: true });
                if (revokedLegacy) changed = true;
            }
        }

        const checks = [
            {
                itemId: 'particle_season1_petals',
                allowed: this._isTierClaimed(s, 4),
            },
            {
                itemId: 'title_season1_champion',
                allowed: s.finalRewardClaimed === true || s.claimed === true,
            },
        ];

        checks.forEach((entry) => {
            if (!entry || entry.allowed) return;
            if (!window.Inventory.owns(entry.itemId)) return;
            const revoked = window.Inventory.revokeItem(entry.itemId, { silent: true });
            if (revoked) changed = true;
        });

        return changed;
    },

    isActive(state = null) {
        const s = state || this.getCurrentSeason();
        if (!s) return false;
        const now = Date.now();
        return now >= Number(s.startDate || 0) && now <= Number(s.endDate || 0);
    },

    getProgress() {
        const s = this.getCurrentSeason();
        if (!s) return null;

        const currentTier = this.TIERS.find((t) => t.tier === s.tier) || this.TIERS[0];
        const nextTier = this.TIERS.find((t) => t.tier === s.tier + 1) || null;
        const floor = currentTier?.xp || 0;
        const ceil = nextTier?.xp || this.TIERS[this.TIERS.length - 1].xp;
        const inTierXP = Math.max(0, (s.seasonXP || 0) - floor);
        const span = Math.max(1, ceil - floor);
        const pct = nextTier ? Math.min(100, Math.round((inTierXP / span) * 100)) : 100;

        return {
            seasonXP: s.seasonXP || 0,
            tier: s.tier,
            currentTier,
            nextTier,
            progressPct: pct,
            toNext: nextTier ? Math.max(0, nextTier.xp - (s.seasonXP || 0)) : 0,
        };
    },

    getRemainingText() {
        const s = this.getCurrentSeason();
        if (!s) return '-';
        const now = Date.now();
        const end = Number(s.endDate || 0);

        if (now > end) return 'encerrada';

        const diff = end - now;
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);

        if (days <= 0) {
            const mins = Math.max(0, Math.floor((diff % 3600000) / 60000));
            return `${hours}h ${mins}m`;
        }
        return `${days}d ${hours}h`;
    },

    getActiveWeekendEvent(date = new Date()) {
        const d = new Date(date);
        const day = d.getDay();
        if (day !== 0 && day !== 6) return null;

        const weekSeed = this._seed(this._getWeekStart(d) + '_weekend_event');
        const idx = weekSeed % this.WEEKEND_EVENTS.length;
        return this.WEEKEND_EVENTS[idx] || null;
    },

    getGrantModifiers(action, meta = {}) {
        const event = this.getActiveWeekendEvent();
        if (!event) {
            return { xpMultiplier: 1, chipsMultiplier: 1, event: null };
        }

        let xpMultiplier = 1;
        let chipsMultiplier = 1;

        if (event.id === 'xp_boost') xpMultiplier = Number(event.multiplier || 1);
        if (event.id === 'chip_boost') chipsMultiplier = Number(event.multiplier || 1);

        if (event.id === 'quiz_night') {
            const actionKey = String(action || '').toLowerCase();
            if (actionKey.includes('quiz')) xpMultiplier = 2;
        }

        if (event.id === 'type_challenge') {
            const storageKey = String(meta.storageKey || '').toLowerCase();
            const isTypeRace = storageKey.includes('typeracer') || storageKey.includes('type');
            if (action === 'beat_record' && isTypeRace) xpMultiplier = 2;
        }

        return { xpMultiplier, chipsMultiplier, event };
    },

    _trackWeekendNotice(event) {
        if (!event) return;
        const key = `${this._today()}_${event.id}`;
        const seen = Utils.loadData(this.EVENT_NOTICE_KEY);
        if (seen === key) return;

        Utils.saveData(this.EVENT_NOTICE_KEY, key);
        Utils.showNotification?.(`Evento ativo: ${event.name}`, 'info');
    },

    addXP(amount, source = {}) {
        const gain = Math.max(0, Math.round(Number(amount || 0)));
        if (!gain) return { changed: false, tierUp: false };

        const season = this.getCurrentSeason();
        if (!season || !this.isActive(season)) return { changed: false, tierUp: false };

        const prevTier = season.tier || 1;
        season.seasonXP = (season.seasonXP || 0) + gain;
        season.tier = this.getTierByXP(season.seasonXP);
        this.save(season);

        this.syncRanking().catch(() => {});

        const tierUp = season.tier > prevTier;
        if (tierUp) {
            const newTierLabel = this.TIERS.find((t) => t.tier === season.tier)?.label || `Tier ${season.tier}`;
            Utils.showNotification?.(`Tier sazonal alcancado: ${newTierLabel}! Recompensa pronta para resgatar.`, 'success');
        }

        const weekend = this.getActiveWeekendEvent();
        if (weekend && source?.fromGrant === true) {
            this._trackWeekendNotice(weekend);
        }

        this._refreshSidebarWidget();
        if (window.Router?.currentRoute === 'season') {
            window.Router.render();
        }

        return { changed: true, tierUp, tier: season.tier, seasonXP: season.seasonXP };
    },

    canClaim() {
        const s = this.getCurrentSeason();
        if (!s) return false;
        if (s.claimed || s.finalRewardClaimed) return false;
        return Date.now() > Number(s.endDate || 0);
    },

    claimTier(tier = 0, options = {}) {
        const s = this.getCurrentSeason();
        const safeTier = Number(tier);
        if (!s || !Number.isFinite(safeTier)) return false;

        const tierCfg = this.TIERS.find((t) => Number(t.tier) === safeTier);
        if (!tierCfg) return false;
        if (Number(s.tier || 1) < safeTier) {
            if (!options.silent) {
                Utils.showNotification?.('Este tier ainda nao foi alcancado.', 'warning');
            }
            return false;
        }
        if (this._isTierClaimed(s, safeTier)) {
            if (!options.silent) {
                Utils.showNotification?.(`Recompensa de ${tierCfg.label} ja foi resgatada.`, 'info');
            }
            return false;
        }

        const entries = this._tierRewardEntries(s.id, safeTier);
        const result = this._applyRewardEntries(entries, s);
        this._setTierClaimed(s, safeTier, true);
        this.save(s);

        if (!options.skipSync) this._syncAfterClaim(result.economyChanged);
        this.syncRanking(true).catch(() => {});
        this._refreshSidebarWidget();
        if (!options.skipRender && window.Router?.currentRoute === 'season') window.Router.render();

        if (!options.silent) {
            const labels = result.grantedLabels.length
                ? result.grantedLabels.join(' | ')
                : `Recompensa de ${tierCfg.label}`;
            Utils.showNotification?.(`Tier ${tierCfg.label} resgatado: ${labels}`, 'success');
        }
        return true;
    },

    claimAllTierRewards(options = {}) {
        const s = this.getCurrentSeason();
        if (!s) return false;

        const tiers = this._claimableTiers(s);
        if (!tiers.length) {
            if (!options.silent) {
                Utils.showNotification?.('Nenhuma recompensa de tier disponivel no momento.', 'info');
            }
            return false;
        }

        let economyChanged = false;
        const labels = [];
        tiers.forEach((tier) => {
            const tierEntries = this._tierRewardEntries(s.id, tier);
            const result = this._applyRewardEntries(tierEntries, s);
            if (result.economyChanged) economyChanged = true;
            if (result.grantedLabels?.length) labels.push(...result.grantedLabels);
            this._setTierClaimed(s, tier, true);
        });

        this.save(s);
        if (!options.skipSync) this._syncAfterClaim(economyChanged);
        this.syncRanking(true).catch(() => {});
        this._refreshSidebarWidget();
        if (!options.skipRender && window.Router?.currentRoute === 'season') window.Router.render();

        if (!options.silent) {
            const text = labels.length ? labels.join(' | ') : 'Pacote de tiers resgatado';
            Utils.showNotification?.(`Recompensas de tier resgatadas: ${text}`, 'success');
        }
        return true;
    },

    claim() {
        const s = this.getCurrentSeason();
        if (!s) return false;

        if (!this.canClaim()) {
            Utils.showNotification?.('A recompensa final so pode ser resgatada apos o fim da temporada.', 'warning');
            return false;
        }

        const claimedTierBundle = this.claimAllTierRewards({ silent: true, skipSync: true, skipRender: true });

        const finalEntries = this._finalRewardEntries(s.id);
        const finalResult = this._applyRewardEntries(finalEntries, s);
        s.finalRewardClaimed = true;
        s.claimed = true;
        this.save(s);

        this._syncAfterClaim(claimedTierBundle || finalResult.economyChanged);
        this.syncRanking(true).catch(() => {});
        this._refreshSidebarWidget();
        if (window.Router?.currentRoute === 'season') window.Router.render();

        if (finalResult.grantedLabels.length > 0) {
            Utils.showNotification?.(`Pacote final resgatado: ${finalResult.grantedLabels.join(' | ')}`, 'success');
        } else {
            Utils.showNotification?.('Pacote final da temporada resgatado!', 'success');
        }
        return true;
    },
    getRankingFilter() {
        return this._rankingFilter === 'friends' ? 'friends' : 'global';
    },

    setRankingFilter(filter = 'global') {
        this._rankingFilter = filter === 'friends' ? 'friends' : 'global';
        Utils.saveData(this.RANKING_FILTER_KEY, this._rankingFilter);

        if (window.Router?.currentRoute === 'season') {
            window.Router.render();
        }
    },

    async syncRanking(force = false) {
        const now = Date.now();
        if (!force && now - this._lastRankingSyncAt < this.RANKING_SYNC_COOLDOWN) return false;
        if (!window.NyanFirebase?.isReady?.()) return false;

        const season = this.getCurrentSeason();
        const uid = String(window.NyanFirebase?.auth?.currentUser?.uid || window.NyanAuth?.getUID?.() || '').trim();
        if (!season || !uid) return false;

        const profile = window.NyanAuth?.currentUser || {};
        const path = `${this._collectionPath(season.id)}/${uid}`;

        const remote = await window.NyanFirebase.getDoc(path).catch(() => null);
        if (remote) {
            const remoteXP = Math.max(0, Number(remote.seasonXP || 0));
            const localXP = Math.max(0, Number(season.seasonXP || 0));
            if (remoteXP > localXP) {
                season.seasonXP = remoteXP;
                season.tier = this.getTierByXP(remoteXP);
                this.save(season);
                this._refreshSidebarWidget?.();
                if (window.Router?.currentRoute === 'season') {
                    window.Router.render();
                }
            }
        }

        const ok = await window.NyanFirebase.setDoc(path, {
            uid,
            seasonId: season.id,
            seasonXP: Number(season.seasonXP || 0),
            tier: Number(season.tier || 1),
            claimed: season.claimed === true,
            finalRewardClaimed: season.finalRewardClaimed === true,
            claimedTiers: this._normalizeClaimedTiers(season.claimedTiers),
            level: Number(window.Economy?.getLevel?.() || 1),
            nyanTag: profile.nyanTag || window.NyanAuth?.getNyanTag?.() || '',
            username: profile.username || window.Auth?.getStoredUser?.()?.username || 'Jogador',
            avatar: profile.avatar || Utils.loadData('nyan_profile_avatar') || null,
            updatedAt: window.NyanFirebase.fn.serverTimestamp(),
        }, true);
        if (!ok) return false;

        this._lastRankingSyncAt = now;
        return true;
    },

    async _loadGlobalRanking(path, myUID, seasonXP) {
        const { query, collection, orderBy, limit, getDocs } = window.NyanFirebase.fn;
        const snap = await getDocs(query(
            collection(window.NyanFirebase.db, path),
            orderBy('seasonXP', 'desc'),
            limit(10)
        ));

        const scores = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const hasMe = scores.some((s) => s.uid === myUID);

        if (!hasMe && myUID && seasonXP > 0) {
            const profile = window.NyanAuth?.currentUser || {};
            scores.push({
                uid: myUID,
                seasonXP,
                tier: this.getTier(),
                level: Number(window.Economy?.getLevel?.() || 1),
                nyanTag: profile.nyanTag || window.NyanAuth?.getNyanTag?.() || '',
                username: profile.username || 'Voce',
                avatar: profile.avatar || Utils.loadData('nyan_profile_avatar') || null,
            });
        }

        scores.sort((a, b) => Number(b.seasonXP || 0) - Number(a.seasonXP || 0));
        return scores.slice(0, 10);
    },

    async _loadFriendsRanking(path, myUID, seasonXP) {
        const { query, collection, where, getDocs } = window.NyanFirebase.fn;
        const fsSnap = await getDocs(query(
            collection(window.NyanFirebase.db, 'friendships'),
            where('users', 'array-contains', myUID)
        ));

        const friendUIDs = fsSnap.docs
            .map((d) => (d.data().users || []).find((u) => u !== myUID))
            .filter(Boolean);

        const uniqueUIDs = Array.from(new Set([myUID, ...friendUIDs]));
        const docs = await Promise.all(
            uniqueUIDs.map(async (uid) => {
                const entry = await window.NyanFirebase.getDoc(`${path}/${uid}`).catch(() => null);
                if (!entry) return null;
                return { uid, ...entry };
            })
        );

        const scores = docs.filter(Boolean);
        const hasMe = scores.some((s) => s.uid === myUID);

        if (!hasMe && seasonXP > 0) {
            const profile = window.NyanAuth?.currentUser || {};
            scores.push({
                uid: myUID,
                seasonXP,
                tier: this.getTier(),
                level: Number(window.Economy?.getLevel?.() || 1),
                nyanTag: profile.nyanTag || window.NyanAuth?.getNyanTag?.() || '',
                username: profile.username || 'Voce',
                avatar: profile.avatar || Utils.loadData('nyan_profile_avatar') || null,
            });
        }

        scores.sort((a, b) => Number(b.seasonXP || 0) - Number(a.seasonXP || 0));
        return scores.slice(0, 10);
    },

    async loadRanking() {
        const table = document.getElementById('season-ranking-table');
        if (!table) return;

        const renderState = (message) => {
            table.innerHTML = `<div class="season-ranking-state">${message}</div>`;
        };

        if (!window.NyanAuth?.isOnline?.() || !window.NyanFirebase?.isReady?.()) {
            renderState('Fique online para ver o ranking sazonal.');
            return;
        }

        const season = this.getCurrentSeason();
        const myUID = window.NyanAuth?.getUID?.();
        if (!season || !myUID) {
            renderState('Sem dados de temporada para ranking.');
            return;
        }

        renderState('Carregando ranking...');

        try {
            const path = this._collectionPath(season.id);
            const myXP = Number(season.seasonXP || 0);
            const filter = this.getRankingFilter();

            const scores = filter === 'friends'
                ? await this._loadFriendsRanking(path, myUID, myXP)
                : await this._loadGlobalRanking(path, myUID, myXP);

            if (!scores.length) {
                renderState('Nenhum score sazonal registrado ainda.');
                return;
            }

            const medals = ['\u{1F947}', '\u{1F948}', '\u{1F949}'];
            const rows = scores.map((s, idx) => {
                const uid = s.uid || s.id || '';
                const isMe = uid === myUID;
                const score = Number(s.seasonXP || 0);
                const tier = this.TIERS.find((t) => t.tier === Number(s.tier || 1));
                const rank = medals[idx] || `#${idx + 1}`;
                const userLabel = s.username || 'Jogador';
                const tagLabel = s.nyanTag || 'Sem nyanTag';

                return `
                <div class="season-ranking-row ${isMe ? 'is-me' : ''}">
                    <div class="season-ranking-left">
                        <div class="season-ranking-pos ${idx < 3 ? 'is-medal' : ''}">
                            ${rank}
                        </div>
                        <div class="season-ranking-user">
                            <div class="season-ranking-name-wrap">
                                <span class="season-ranking-name">${userLabel}</span>
                                ${isMe ? '<span class="season-ranking-you">Voce</span>' : ''}
                            </div>
                            <div class="season-ranking-tag">${tagLabel}</div>
                        </div>
                    </div>
                    <div class="season-ranking-right">
                        <div class="season-ranking-xp">${score.toLocaleString('pt-BR')} XP</div>
                        <div class="season-ranking-meta">${tier?.label || 'Bronze'} | Lv ${Number(s.level || 1)}</div>
                    </div>
                </div>`;
            }).join('');

            table.innerHTML = `<div class="season-ranking-list">${rows}</div>`;
        } catch (err) {
            console.error('[Seasons] Falha ao carregar ranking:', err);
            renderState('Erro ao carregar ranking sazonal.');
        }
    },
    renderSidebarWidget() {
        const s = this.getCurrentSeason();
        if (!s) return '';
        const p = this.getProgress();
        const seasonCap = this.TIERS[this.TIERS.length - 1].xp;
        const pctTotal = Math.min(100, Math.round(((p?.seasonXP || 0) / seasonCap) * 100));
        const tierLabel = p?.currentTier?.label || 'Bronze';
        const weekend = this.getActiveWeekendEvent();
        const subtitle = weekend
            ? weekend.name
            : `Termina em ${this.getRemainingText()}`;

        return `
        <div id="season-sidebar-widget" style="
            margin:0 0.5rem 0.375rem;
            padding:0.625rem 0.75rem;
            border-radius:10px;
            background:rgba(236,72,153,0.15);
            border:1px solid rgba(236,72,153,0.32);
            cursor:pointer;
            transition:background 0.18s ease, border-color 0.18s ease;
        " onclick="Router.navigate('season')"
           onmouseover="this.style.background='rgba(236,72,153,0.23)'"
           onmouseout="this.style.background='rgba(236,72,153,0.15)'">

            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.4rem;">
                <span style="font-size:0.6rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.62);font-family:'DM Sans',sans-serif;">
                    ${s.icon} Temporada
                </span>
                <span class="season-tier-text" style="font-size:0.68rem;font-weight:800;color:#fda4af;font-family:'Syne',sans-serif;">
                    ${tierLabel}
                </span>
            </div>

            <div style="height:4px;background:rgba(255,255,255,0.12);border-radius:99px;overflow:hidden;margin-bottom:0.4rem;">
                <div class="season-progress-bar" style="height:100%;width:${pctTotal}%;background:linear-gradient(90deg,#fb7185,#f97316);border-radius:99px;transition:width 0.4s ease;"></div>
            </div>

            <div class="season-subtitle" style="font-size:0.69rem;font-weight:600;color:rgba(255,255,255,0.8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.3;">
                ${subtitle}
            </div>

        </div>`;
    },

    _refreshSidebarWidget() {
        const el = document.getElementById('season-sidebar-widget');
        if (!el) return;

        const p = this.getProgress();
        const s = this.getCurrentSeason();
        if (!p || !s) return;

        const cap = this.TIERS[this.TIERS.length - 1].xp;
        const pct = Math.min(100, Math.round(((p.seasonXP || 0) / cap) * 100));
        const tierText = el.querySelector('.season-tier-text');
        const bar = el.querySelector('.season-progress-bar');
        const subtitle = el.querySelector('.season-subtitle');
        const event = this.getActiveWeekendEvent();

        if (tierText) tierText.textContent = p.currentTier?.label || 'Bronze';
        if (bar) bar.style.width = `${pct}%`;
        if (subtitle) {
            subtitle.textContent = event ? event.name : `Termina em ${this.getRemainingText()}`;
        }
    },

    render() {
        const s = this.getCurrentSeason();
        if (!s) {
            return `<div style="max-width:620px;margin:0 auto;font-family:'DM Sans',sans-serif;text-align:center;padding:2rem;opacity:0.65;">Sem temporada ativa no momento.</div>`;
        }

        const d = document.body.classList.contains('dark-theme');
        const text = d ? '#f1f5f9' : '#0f172a';
        const sub = d ? 'rgba(255,255,255,0.66)' : 'rgba(15,23,42,0.72)';
        const muted = d ? 'rgba(255,255,255,0.52)' : 'rgba(15,23,42,0.52)';
        const card = d ? 'rgba(10,14,23,0.88)' : '#ffffff';
        const panel = d ? 'rgba(255,255,255,0.03)' : 'rgba(248,250,252,0.92)';
        const border = d ? 'rgba(255,255,255,0.09)' : 'rgba(15,23,42,0.09)';
        const borderStrong = d ? 'rgba(255,255,255,0.17)' : 'rgba(15,23,42,0.15)';
        const glowA = d ? 'rgba(251,113,133,0.26)' : 'rgba(251,113,133,0.22)';
        const glowB = d ? 'rgba(249,115,22,0.24)' : 'rgba(249,115,22,0.2)';

        const p = this.getProgress();
        const event = this.getActiveWeekendEvent();
        const remainingText = this.getRemainingText();
        const status = this.isActive(s) ? `Ativa - termina em ${remainingText}` : 'Temporada encerrada';
        const progressPct = Math.min(100, Math.max(0, Number(p?.progressPct || 0)));
        const seasonCap = this.TIERS[this.TIERS.length - 1].xp || 1;
        const seasonPct = Math.min(100, Math.round(((p?.seasonXP || 0) / seasonCap) * 100));
        const nextTierText = p?.nextTier
            ? `Faltam ${p.toNext} XP para ${p.nextTier.label}`
            : 'Tier maximo atingido nesta temporada!';

        const claimReady = this.canClaim();
        const claimLabel = s.claimed ? 'Recompensa final ja resgatada' : (claimReady ? 'Resgatar recompensa final' : 'Disponivel ao final da temporada');
        const claimableTiers = this._claimableTiers(s);
        const finalRewardText = this._finalRewardEntries(s.id).map((entry) => this._rewardEntryLabel(entry)).join(' | ') || 'Pacote final sazonal';
        const claimableTiersText = claimableTiers.length > 0
            ? `${claimableTiers.length} recompensa${claimableTiers.length > 1 ? 's' : ''} de tier pronta${claimableTiers.length > 1 ? 's' : ''} para resgate.`
            : 'Sem recompensas de tier pendentes no momento.';

        const tierCards = this.TIERS.map((tier) => {
            const achieved = (s.tier || 1) >= tier.tier;
            const isCurrent = (s.tier || 1) === tier.tier;
            const claimed = this._isTierClaimed(s, tier.tier);
            const canClaimTier = achieved && !claimed;
            const rewardText = this._tierRewardText(s.id, tier.tier, tier.reward);
            return `
            <article class="season-tier-card ${achieved ? 'is-achieved' : ''} ${isCurrent ? 'is-current' : ''}">
                <div class="season-tier-top">
                    <div class="season-tier-name">${tier.label}</div>
                    <div class="season-tier-xp">${tier.xp} XP</div>
                </div>
                <div class="season-tier-reward">${rewardText}</div>
                <div class="season-tier-bottom">
                    <div class="season-tier-state">${claimed ? 'Resgatado' : (isCurrent ? 'Atual' : (achieved ? 'Concluido' : 'Em progresso'))}</div>
                    <button class="season-tier-claim-btn" onclick="Seasons.claimTier(${tier.tier})" ${canClaimTier ? '' : 'disabled'}>
                        ${claimed ? 'Resgatado' : (canClaimTier ? 'Resgatar' : 'Bloqueado')}
                    </button>
                </div>
            </article>`;
        }).join('');

        const filter = this.getRankingFilter();

        return `
        <style>
            .season-page {
                max-width: 760px;
                margin: 0 auto;
                font-family: 'DM Sans', sans-serif;
                color: var(--season-text);
            }
            .season-shell {
                position: relative;
                padding: 1.05rem;
                border-radius: 22px;
                border: 1px solid var(--season-border-strong);
                background: var(--season-card);
                box-shadow: 0 16px 42px rgba(15, 23, 42, 0.2);
                overflow: hidden;
            }
            .season-shell::before,
            .season-shell::after {
                content: '';
                position: absolute;
                pointer-events: none;
                border-radius: 999px;
                filter: blur(2px);
            }
            .season-shell::before {
                width: 190px;
                height: 190px;
                top: -96px;
                right: -52px;
                background: radial-gradient(circle at center, var(--season-glow-a), transparent 72%);
            }
            .season-shell::after {
                width: 230px;
                height: 230px;
                bottom: -136px;
                left: -70px;
                background: radial-gradient(circle at center, var(--season-glow-b), transparent 74%);
            }
            .season-hero {
                position: relative;
                z-index: 1;
                display: grid;
                grid-template-columns: auto 1fr auto;
                gap: 0.9rem;
                align-items: center;
                margin-bottom: 0.95rem;
            }
            .season-icon-bubble {
                width: 64px;
                height: 64px;
                border-radius: 17px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.9rem;
                border: 1px solid var(--season-border-strong);
                background: linear-gradient(145deg, rgba(251, 113, 133, 0.22), rgba(249, 115, 22, 0.22));
                box-shadow: 0 10px 25px rgba(251, 113, 133, 0.22);
                animation: seasonPulse 3.8s ease-in-out infinite;
            }
            .season-status-chip {
                display: inline-flex;
                align-items: center;
                gap: 0.35rem;
                padding: 0.22rem 0.62rem;
                border-radius: 999px;
                font-size: 0.62rem;
                font-weight: 800;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                color: #fef2f2;
                background: linear-gradient(120deg, rgba(251, 113, 133, 0.88), rgba(249, 115, 22, 0.85));
                border: 1px solid rgba(255, 255, 255, 0.25);
            }
            .season-status-chip.is-ended {
                color: var(--season-sub);
                background: var(--season-panel);
                border-color: var(--season-border);
            }
            .season-title {
                margin: 0.42rem 0 0.22rem;
                font-size: 1.78rem;
                line-height: 1.08;
                font-weight: 900;
                font-family: 'Syne', sans-serif;
                background: linear-gradient(132deg, #fb7185 0%, #f97316 52%, #f59e0b 100%);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .season-subtitle {
                margin: 0;
                font-size: 0.76rem;
                color: var(--season-sub);
            }
            .season-tier-chip {
                min-width: 120px;
                padding: 0.62rem 0.74rem;
                border-radius: 14px;
                border: 1px solid var(--season-border);
                background: var(--season-panel);
                text-align: right;
            }
            .season-tier-chip-label {
                font-size: 0.61rem;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                color: var(--season-muted);
                margin-bottom: 0.18rem;
            }
            .season-tier-chip-value {
                margin: 0;
                font-size: 1.05rem;
                font-weight: 900;
                font-family: 'Syne', sans-serif;
                color: var(--theme-primary, #a855f7);
            }
            .season-metric-grid {
                position: relative;
                z-index: 1;
                display: grid;
                grid-template-columns: 1.5fr 1fr;
                gap: 0.72rem;
                margin-bottom: 0.85rem;
            }
            .season-panel {
                border-radius: 16px;
                padding: 0.85rem;
                border: 1px solid var(--season-border);
                background: var(--season-panel);
            }
            .season-panel-title {
                font-size: 0.72rem;
                font-weight: 800;
                letter-spacing: 0.06em;
                text-transform: uppercase;
                color: var(--season-muted);
                margin-bottom: 0.45rem;
            }
            .season-progress-head {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 0.5rem;
                margin-bottom: 0.45rem;
                font-size: 0.8rem;
                color: var(--season-text);
                font-weight: 700;
            }
            .season-progress-head strong {
                font-family: 'Syne', sans-serif;
                font-size: 0.95rem;
                color: var(--theme-primary, #a855f7);
            }
            .season-progress-track {
                height: 9px;
                border-radius: 999px;
                overflow: hidden;
                background: rgba(148, 163, 184, 0.2);
                margin-bottom: 0.44rem;
            }
            .season-progress-fill {
                height: 100%;
                border-radius: 999px;
                width: var(--season-progress-pct);
                background: linear-gradient(90deg, #fb7185, #f97316, #f59e0b);
                box-shadow: 0 0 12px rgba(251, 113, 133, 0.32);
                transition: width 0.45s ease;
            }
            .season-progress-meta {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 0.4rem;
                font-size: 0.69rem;
                color: var(--season-muted);
            }
            .season-summary-list {
                list-style: none;
                padding: 0;
                margin: 0;
                display: grid;
                gap: 0.46rem;
            }
            .season-summary-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 0.6rem;
                font-size: 0.73rem;
                color: var(--season-sub);
                padding-bottom: 0.38rem;
                border-bottom: 1px dashed var(--season-border);
            }
            .season-summary-item:last-child {
                border-bottom: none;
                padding-bottom: 0;
            }
            .season-summary-item strong {
                color: var(--season-text);
                font-weight: 800;
            }
            .season-event-panel {
                position: relative;
                z-index: 1;
                margin-bottom: 0.88rem;
                padding: 0.78rem 0.85rem;
                border-radius: 14px;
                border: 1px solid rgba(245, 158, 11, 0.34);
                background: linear-gradient(135deg, rgba(245, 158, 11, 0.16), rgba(251, 191, 36, 0.08));
            }
            .season-event-title {
                font-size: 0.68rem;
                font-weight: 800;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                color: var(--season-muted);
            }
            .season-event-name {
                margin-top: 0.24rem;
                font-size: 0.93rem;
                font-weight: 800;
                color: var(--season-text);
            }
            .season-event-sub {
                margin-top: 0.2rem;
                font-size: 0.72rem;
                color: var(--season-sub);
            }
            .season-tier-grid {
                position: relative;
                z-index: 1;
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 0.66rem;
                margin-bottom: 0.88rem;
            }
            .season-tier-card {
                padding: 0.75rem;
                border-radius: 14px;
                border: 1px solid var(--season-border);
                background: var(--season-panel);
                transition: transform 0.2s ease, border-color 0.2s ease;
            }
            .season-tier-card:hover {
                transform: translateY(-1px);
                border-color: var(--season-border-strong);
            }
            .season-tier-card.is-achieved {
                border-color: rgba(74, 222, 128, 0.42);
                background: linear-gradient(130deg, rgba(74, 222, 128, 0.14), var(--season-panel));
            }
            .season-tier-card.is-current {
                border-color: rgba(168, 85, 247, 0.34);
                box-shadow: 0 0 0 1px rgba(168, 85, 247, 0.14) inset;
            }
            .season-tier-top {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 0.6rem;
                margin-bottom: 0.25rem;
            }
            .season-tier-name {
                font-size: 0.86rem;
                font-weight: 800;
                color: var(--season-text);
                font-family: 'Syne', sans-serif;
            }
            .season-tier-xp {
                font-size: 0.68rem;
                font-weight: 700;
                color: var(--season-muted);
            }
            .season-tier-reward {
                font-size: 0.73rem;
                color: var(--season-sub);
                margin-bottom: 0.4rem;
            }
            .season-tier-bottom {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 0.55rem;
            }
            .season-tier-state {
                font-size: 0.63rem;
                font-weight: 800;
                letter-spacing: 0.06em;
                text-transform: uppercase;
                color: var(--theme-primary, #a855f7);
            }
            .season-tier-claim-btn {
                border: 1px solid var(--season-border);
                border-radius: 8px;
                background: transparent;
                color: var(--season-sub);
                padding: 0.28rem 0.55rem;
                font-size: 0.62rem;
                font-weight: 800;
                cursor: pointer;
                transition: border-color 0.18s ease, color 0.18s ease, background 0.18s ease;
            }
            .season-tier-claim-btn:hover:not(:disabled) {
                border-color: rgba(74, 222, 128, 0.5);
                color: #86efac;
                background: rgba(74, 222, 128, 0.08);
            }
            .season-tier-claim-btn:disabled {
                opacity: 0.55;
                cursor: not-allowed;
            }
            .season-reward-panel {
                position: relative;
                z-index: 1;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 0.9rem;
                flex-wrap: wrap;
                margin-bottom: 0.88rem;
            }
            .season-reward-title {
                font-size: 0.9rem;
                font-weight: 800;
                color: var(--season-text);
                margin: 0 0 0.17rem;
            }
            .season-reward-subtitle {
                font-size: 0.72rem;
                color: var(--season-sub);
                margin: 0;
            }
            .season-reward-list {
                margin: 0.32rem 0 0.14rem;
                font-size: 0.7rem;
                color: var(--season-text);
                font-weight: 700;
                line-height: 1.4;
            }
            .season-reward-tier-note {
                margin: 0;
                font-size: 0.66rem;
                color: var(--season-muted);
            }
            .season-reward-actions {
                display: flex;
                gap: 0.46rem;
                flex-wrap: wrap;
                align-items: center;
            }
            .season-claim-alt-btn {
                border: 1px solid var(--season-border);
                border-radius: 11px;
                padding: 0.58rem 0.82rem;
                font-size: 0.72rem;
                font-weight: 800;
                font-family: 'DM Sans', sans-serif;
                color: var(--season-sub);
                background: var(--season-panel);
                cursor: pointer;
                transition: all 0.18s ease;
            }
            .season-claim-alt-btn:hover:not(:disabled) {
                border-color: rgba(74, 222, 128, 0.44);
                color: #86efac;
                background: rgba(74, 222, 128, 0.08);
            }
            .season-claim-alt-btn:disabled {
                opacity: 0.55;
                cursor: not-allowed;
            }
            .season-claim-btn {
                border: none;
                border-radius: 11px;
                padding: 0.58rem 1.05rem;
                font-size: 0.74rem;
                font-weight: 800;
                font-family: 'DM Sans', sans-serif;
                color: #fff;
                cursor: pointer;
                background: linear-gradient(135deg, #fb7185, #f97316);
                box-shadow: 0 9px 18px rgba(249, 115, 22, 0.3);
                transition: transform 0.18s ease, opacity 0.2s ease, box-shadow 0.2s ease;
            }
            .season-claim-btn:hover:not(:disabled) {
                transform: translateY(-1px);
                box-shadow: 0 12px 22px rgba(249, 115, 22, 0.36);
            }
            .season-claim-btn:disabled {
                opacity: 0.46;
                cursor: not-allowed;
                box-shadow: none;
            }
            .season-ranking-panel {
                position: relative;
                z-index: 1;
                border-radius: 16px;
                border: 1px solid var(--season-border);
                background: var(--season-panel);
                overflow: hidden;
            }
            .season-ranking-head {
                padding: 0.86rem;
                border-bottom: 1px solid var(--season-border);
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 0.6rem;
                flex-wrap: wrap;
            }
            .season-ranking-title {
                margin: 0;
                font-size: 0.87rem;
                font-weight: 800;
                color: var(--season-text);
            }
            .season-ranking-subtitle {
                margin: 0.12rem 0 0;
                font-size: 0.67rem;
                color: var(--season-muted);
            }
            .season-filter-group {
                display: flex;
                gap: 0.42rem;
            }
            .season-filter-btn {
                border: 1px solid var(--season-border);
                border-radius: 10px;
                background: transparent;
                color: var(--season-sub);
                padding: 0.34rem 0.72rem;
                font-size: 0.67rem;
                font-weight: 800;
                cursor: pointer;
                transition: all 0.18s ease;
            }
            .season-filter-btn.is-active {
                border-color: transparent;
                color: #fff;
                background: var(--theme-primary, #a855f7);
            }
            .season-ranking-list {
                display: grid;
            }
            .season-ranking-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 0.7rem;
                padding: 0.76rem 0.86rem;
                border-bottom: 1px solid var(--season-border);
                transition: background 0.18s ease;
            }
            .season-ranking-row:nth-child(even) {
                background: rgba(148, 163, 184, 0.06);
            }
            .season-ranking-row:last-child {
                border-bottom: none;
            }
            .season-ranking-row:hover {
                background: rgba(168, 85, 247, 0.08);
            }
            .season-ranking-row.is-me {
                background: rgba(168, 85, 247, 0.16);
            }
            .season-ranking-left {
                display: flex;
                align-items: center;
                gap: 0.68rem;
                min-width: 0;
            }
            .season-ranking-pos {
                width: 33px;
                text-align: center;
                font-size: 0.74rem;
                font-weight: 900;
                color: var(--season-muted);
                flex-shrink: 0;
            }
            .season-ranking-pos.is-medal {
                font-size: 1rem;
                color: var(--season-text);
            }
            .season-ranking-user {
                min-width: 0;
            }
            .season-ranking-name-wrap {
                display: flex;
                align-items: center;
                gap: 0.34rem;
                min-width: 0;
            }
            .season-ranking-name {
                font-size: 0.79rem;
                font-weight: 800;
                color: var(--season-text);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 220px;
            }
            .season-ranking-you {
                flex-shrink: 0;
                font-size: 0.57rem;
                font-weight: 800;
                padding: 0.12rem 0.38rem;
                border-radius: 999px;
                color: #fff;
                background: var(--theme-primary, #a855f7);
            }
            .season-ranking-tag {
                font-size: 0.65rem;
                color: var(--season-sub);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 230px;
            }
            .season-ranking-right {
                flex-shrink: 0;
                text-align: right;
            }
            .season-ranking-xp {
                font-size: 0.9rem;
                font-weight: 900;
                font-family: 'Syne', sans-serif;
                color: var(--theme-primary, #a855f7);
                line-height: 1.1;
            }
            .season-ranking-meta {
                font-size: 0.63rem;
                color: var(--season-muted);
                margin-top: 0.16rem;
            }
            .season-ranking-state {
                padding: 1rem;
                text-align: center;
                font-size: 0.76rem;
                color: var(--season-muted);
            }
            .season-animate {
                animation: seasonRise 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
            }
            .season-animate.delay-1 { animation-delay: 0.05s; }
            .season-animate.delay-2 { animation-delay: 0.09s; }
            .season-animate.delay-3 { animation-delay: 0.12s; }
            .season-animate.delay-4 { animation-delay: 0.16s; }
            @keyframes seasonRise {
                from { opacity: 0; transform: translateY(8px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes seasonPulse {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-2px) scale(1.01); }
            }
            @media (max-width: 760px) {
                .season-shell { padding: 0.85rem; border-radius: 18px; }
                .season-hero {
                    grid-template-columns: 1fr;
                    gap: 0.65rem;
                    text-align: left;
                }
                .season-tier-chip {
                    text-align: left;
                    min-width: 0;
                    width: 100%;
                }
                .season-title { font-size: 1.48rem; }
                .season-metric-grid { grid-template-columns: 1fr; }
                .season-tier-grid { grid-template-columns: 1fr; }
                .season-reward-panel { align-items: flex-start; }
                .season-ranking-row { padding: 0.72rem 0.68rem; }
                .season-ranking-name, .season-ranking-tag { max-width: 150px; }
                .season-ranking-right { min-width: 96px; }
                .season-ranking-xp { font-size: 0.8rem; }
            }
        </style>
        <div class="season-page" style="
            --season-text:${text};
            --season-sub:${sub};
            --season-muted:${muted};
            --season-card:${card};
            --season-panel:${panel};
            --season-border:${border};
            --season-border-strong:${borderStrong};
            --season-glow-a:${glowA};
            --season-glow-b:${glowB};
            --season-progress-pct:${progressPct}%;
        ">
            <section class="season-shell">
                <header class="season-hero season-animate">
                    <div class="season-icon-bubble">${s.icon}</div>
                    <div>
                        <div class="season-status-chip ${this.isActive(s) ? '' : 'is-ended'}">${status}</div>
                        <h1 class="season-title">${s.name}</h1>
                        <p class="season-subtitle">${event ? `Evento ativo: ${event.name}` : 'Complete missoes e atividades para subir de tier.'}</p>
                    </div>
                    <div class="season-tier-chip">
                        <div class="season-tier-chip-label">Tier atual</div>
                        <p class="season-tier-chip-value">${p?.currentTier?.label || 'Bronze'}</p>
                    </div>
                </header>

                <div class="season-metric-grid season-animate delay-1">
                    <section class="season-panel">
                        <div class="season-panel-title">Progresso sazonal</div>
                        <div class="season-progress-head">
                            <span>${p?.seasonXP || 0} XP acumulado</span>
                            <strong>${seasonPct}%</strong>
                        </div>
                        <div class="season-progress-track">
                            <div class="season-progress-fill"></div>
                        </div>
                        <div class="season-progress-meta">
                            <span>${nextTierText}</span>
                            <span>${p?.nextTier ? p.nextTier.label : 'Cap maximo'}</span>
                        </div>
                    </section>
                    <section class="season-panel">
                        <div class="season-panel-title">Resumo rapido</div>
                        <ul class="season-summary-list">
                            <li class="season-summary-item"><span>Status</span><strong>${this.isActive(s) ? 'Ativa' : 'Encerrada'}</strong></li>
                            <li class="season-summary-item"><span>Tempo restante</span><strong>${this.isActive(s) ? remainingText : 'Finalizada'}</strong></li>
                            <li class="season-summary-item"><span>Progresso total</span><strong>${seasonPct}%</strong></li>
                        </ul>
                    </section>
                </div>

                ${event ? `<section class="season-event-panel season-animate delay-2">
                    <div class="season-event-title">Evento de fim de semana</div>
                    <div class="season-event-name">${event.name}</div>
                    <div class="season-event-sub">Ativo enquanto durar o fim de semana.</div>
                </section>` : ''}

                <div class="season-tier-grid season-animate delay-2">
                    ${tierCards}
                </div>

                <section class="season-panel season-reward-panel season-animate delay-3">
                    <div>
                        <h3 class="season-reward-title">Recompensa final</h3>
                        <p class="season-reward-subtitle">${claimLabel}</p>
                        <p class="season-reward-list">${finalRewardText}</p>
                        <p class="season-reward-tier-note">${claimableTiersText}</p>
                    </div>
                    <div class="season-reward-actions">
                        <button
                            class="season-claim-alt-btn"
                            onclick="Seasons.claimAllTierRewards()"
                            ${claimableTiers.length > 0 ? '' : 'disabled'}
                        >
                            Resgatar tiers (${claimableTiers.length})
                        </button>
                        <button class="season-claim-btn" onclick="Seasons.claim()" ${claimReady ? '' : 'disabled'}>
                            Resgatar final
                        </button>
                    </div>
                </section>

                <section class="season-ranking-panel season-animate delay-4">
                    <div class="season-ranking-head">
                        <div>
                            <h3 class="season-ranking-title">Ranking sazonal</h3>
                            <p class="season-ranking-subtitle">Top 10 jogadores desta temporada</p>
                        </div>
                        <div class="season-filter-group">
                            <button onclick="Seasons.setRankingFilter('global')" class="season-filter-btn ${filter === 'global' ? 'is-active' : ''}">Global</button>
                            <button onclick="Seasons.setRankingFilter('friends')" class="season-filter-btn ${filter === 'friends' ? 'is-active' : ''}">Amigos</button>
                        </div>
                    </div>
                    <div id="season-ranking-table"></div>
                </section>
            </section>
        </div>`;
    },
    init() {
        this.ensureCurrentSeason();

        const savedFilter = Utils.loadData(this.RANKING_FILTER_KEY);
        this._rankingFilter = savedFilter === 'friends' ? 'friends' : 'global';

        this.syncRanking().catch(() => {});

        if (window.Router?.currentRoute === 'season') {
            setTimeout(() => this.loadRanking(), 90);
        }
    },

    debug: {
        addXP(amount = 100) {
            return Seasons.addXP(amount, { source: 'debug' });
        },
        state() {
            console.table(Seasons.getCurrentSeason());
        },
        reset() {
            localStorage.removeItem(Seasons.KEY);
            Utils.removeData(Seasons.HISTORY_KEY);
        },
    },
};

window.Seasons = Seasons;

