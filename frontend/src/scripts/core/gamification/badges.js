const Badges = {
    KEY: 'nyan_badges',
    MAX_SHOWCASE: 4,

    CATALOG: [
        {
            id: 'badge_season1',
            name: 'Badge da Temporada',
            icon: '\u{1F396}\uFE0F',
            rarity: 'seasonal',
            description: 'Insignia da Temporada 1 - Despertar',
            source: { type: 'season', id: 'season_1' },
        },
        {
            id: 'badge_patchday_310',
            name: 'Patch Day v3.10',
            icon: '\u{1F6E0}\uFE0F',
            rarity: 'event',
            description: 'Participou do evento especial Patch Day v3.10',
            source: { type: 'event', id: 'v310_patch_day' },
        },
        {
            id: 'badge_security_sentinel_v310',
            name: 'Sentinela v3.10',
            icon: '\u{1F6E1}\uFE0F',
            rarity: 'exclusive',
            description: 'Identificou e neutralizou uma vulnerabilidade critica de integridade.',
            source: { type: 'exclusive', id: 'v310_security_integrity' },
        },
        {
            id: 'badge_quiz_perfect',
            name: 'Quiz Perfeito',
            icon: '\u{1F9E0}',
            rarity: 'achievement',
            description: 'Conquista: Genio nyan~',
            source: { type: 'achievement', id: 'quiz_perfect' },
        },
        {
            id: 'badge_social_butterfly',
            name: 'Borboleta Social',
            icon: '\u{1F98B}',
            rarity: 'achievement',
            description: 'Conquista: Borboleta Social',
            source: { type: 'achievement', id: 'social_butterfly' },
        },
    ],

    RARITY_META: {
        achievement: {
            label: 'Conquista',
            light: { text: '#065f46', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.28)' },
            dark: { text: '#6ee7b7', bg: 'rgba(16,185,129,0.18)', border: 'rgba(16,185,129,0.35)' },
        },
        seasonal: {
            label: 'Temporada',
            light: { text: '#9d174d', bg: 'rgba(244,114,182,0.12)', border: 'rgba(244,114,182,0.3)' },
            dark: { text: '#f9a8d4', bg: 'rgba(244,114,182,0.2)', border: 'rgba(244,114,182,0.38)' },
        },
        event: {
            label: 'Evento',
            light: { text: '#0f766e', bg: 'rgba(45,212,191,0.12)', border: 'rgba(45,212,191,0.28)' },
            dark: { text: '#5eead4', bg: 'rgba(45,212,191,0.18)', border: 'rgba(45,212,191,0.35)' },
        },
        exclusive: {
            label: 'Exclusivo',
            light: { text: '#0f766e', bg: 'rgba(34,211,238,0.12)', border: 'rgba(20,184,166,0.34)' },
            dark: { text: '#99f6e4', bg: 'rgba(8,47,73,0.62)', border: 'rgba(45,212,191,0.45)' },
        },
    },

    _defaults() {
        return { owned: [], equipped: null, showcase: [] };
    },

    _getLegacyTitleBadgeId(titleId = '') {
        const safeId = String(titleId || '').trim();
        if (!safeId) return null;
        if (safeId === 'title_season1_badge') return 'badge_season1';
        if (safeId === 'title_security_sentinel_v310' || safeId === 'title_bug_hunter_v310') {
            return 'badge_security_sentinel_v310';
        }
        return null;
    },

    load() {
        const data = Utils.loadData(this.KEY) || this._defaults();
        const owned = Array.isArray(data.owned)
            ? Array.from(new Set(data.owned.map((id) => String(id || '').trim()).filter(Boolean)))
            : [];
        const equipped = owned.includes(String(data.equipped || '')) ? String(data.equipped) : null;
        let showcase = Array.isArray(data.showcase)
            ? Array.from(new Set(data.showcase.map((id) => String(id || '').trim()).filter((id) => owned.includes(id))))
            : [];
        showcase = showcase.slice(0, this.MAX_SHOWCASE);
        if (!showcase.length && equipped && owned.includes(equipped)) {
            showcase = [equipped];
        }
        return { owned, equipped, showcase };
    },

    save(data) {
        Utils.saveData(this.KEY, data);
    },

    getBadge(badgeId) {
        const id = String(badgeId || '').trim();
        if (!id) return null;
        return this.CATALOG.find((b) => b.id === id) || null;
    },

    getRarityMeta(rarity = '') {
        return this.RARITY_META[String(rarity || '').trim()] || this.RARITY_META.achievement;
    },

    getBadgeChipStyle(badge = null, dark = false, active = false) {
        const rarity = badge?.rarity || 'achievement';
        const meta = this.getRarityMeta(rarity);
        const tone = dark ? meta.dark : meta.light;
        const activeShadow = active
            ? (dark ? '0 0 10px rgba(255,255,255,0.16)' : '0 0 8px rgba(15,23,42,0.08)')
            : 'none';
        return `
            color:${tone.text};
            background:${tone.bg};
            border:1px solid ${tone.border};
            box-shadow:${activeShadow};
        `;
    },

    owns(badgeId) {
        return this.load().owned.includes(String(badgeId || '').trim());
    },

    getOwnedBadgeIds() {
        return this.load().owned;
    },

    getOwnedBadges() {
        return this.getOwnedBadgeIds().map((id) => this.getBadge(id)).filter(Boolean);
    },

    getShowcaseIds() {
        return this.load().showcase || [];
    },

    getShowcaseBadges() {
        return this.getShowcaseIds().map((id) => this.getBadge(id)).filter(Boolean);
    },

    getEquippedId() {
        return this.load().equipped || null;
    },

    getEquippedBadge() {
        const equippedId = this.getEquippedId();
        return equippedId ? this.getBadge(equippedId) : null;
    },

    unlock(badgeId, options = {}) {
        const badge = this.getBadge(badgeId);
        if (!badge) return false;

        const data = this.load();
        if (data.owned.includes(badge.id)) return false;

        data.owned.push(badge.id);
        if (!data.equipped && options.autoEquip !== false) {
            data.equipped = badge.id;
        }
        if (!Array.isArray(data.showcase)) data.showcase = [];
        if (data.showcase.length < this.MAX_SHOWCASE && !data.showcase.includes(badge.id)) {
            data.showcase.push(badge.id);
        }
        this.save(data);

        if (!options.skipSync) this._syncBadgeData();
        if (!options.silent) {
            Utils.showNotification?.(`${badge.icon} Badge desbloqueada: ${badge.name}`, 'success');
        }
        return true;
    },

    unlockByAchievement(achievementId, options = {}) {
        const safeAch = String(achievementId || '').trim();
        if (!safeAch) return false;

        const matches = this.CATALOG.filter((b) => b.source?.type === 'achievement' && b.source?.id === safeAch);
        let changed = false;
        matches.forEach((b) => {
            const ok = this.unlock(b.id, { ...options, silent: true });
            if (ok) changed = true;
        });
        if (changed && !options.silent) {
            Utils.showNotification?.('Nova badge de conquista desbloqueada!', 'success');
        }
        return changed;
    },

    syncFromAchievements(unlockedMap = {}, options = {}) {
        const unlocked = unlockedMap && typeof unlockedMap === 'object' ? unlockedMap : {};
        let changed = false;
        Object.keys(unlocked).forEach((achId) => {
            const ok = this.unlockByAchievement(achId, { ...options, silent: true });
            if (ok) changed = true;
        });
        if (changed && !options.skipSync) this._syncBadgeData();
        return changed;
    },

    syncEventBadges(options = {}) {
        if (!window.Inventory?.owns) return false;

        const participatedPatchDay = [
            'title_patchday_310',
            'border_patchday_310',
            'theme_patchpulse_intro',
        ].some((itemId) => window.Inventory.owns(itemId));

        if (!participatedPatchDay) return false;
        return this.unlock('badge_patchday_310', options);
    },

    revoke(badgeId, options = {}) {
        const safeId = String(badgeId || '').trim();
        if (!safeId) return false;

        const data = this.load();
        if (!data.owned.includes(safeId)) return false;

        data.owned = data.owned.filter((id) => id !== safeId);
        data.showcase = (Array.isArray(data.showcase) ? data.showcase : []).filter((id) => id !== safeId);
        if (data.equipped === safeId) {
            data.equipped = data.owned[0] || null;
        }
        if (!data.showcase.length && data.equipped) {
            data.showcase = [data.equipped];
        }
        this.save(data);

        if (!options.skipSync) this._syncBadgeData();
        if (!options.silent) {
            const badge = this.getBadge(safeId);
            Utils.showNotification?.(`Badge removida: ${badge?.name || safeId}`, 'info');
        }
        return true;
    },

    equip(badgeId, options = {}) {
        const badge = this.getBadge(badgeId);
        if (!badge) return false;

        const data = this.load();
        if (!data.owned.includes(badge.id)) {
            Utils.showNotification?.('Voce nao possui esta badge.', 'warning');
            return false;
        }

        data.equipped = badge.id;
        data.showcase = Array.isArray(data.showcase) ? data.showcase : [];
        if (!data.showcase.includes(badge.id)) {
            data.showcase = [badge.id, ...data.showcase].slice(0, this.MAX_SHOWCASE);
        }
        this.save(data);
        if (!options.skipSync) this._syncBadgeData();
        if (!options.silent) {
            Utils.showNotification?.(`${badge.icon} Badge ativa: ${badge.name}`, 'success');
        }
        return true;
    },

    unequip(options = {}) {
        const data = this.load();
        if (!data.equipped) return false;
        data.equipped = null;
        this.save(data);
        if (!options.skipSync) this._syncBadgeData();
        return true;
    },

    setShowcase(ids = [], options = {}) {
        const data = this.load();
        const desired = Array.isArray(ids) ? ids : [];
        const normalized = Array.from(new Set(
            desired
                .map((id) => String(id || '').trim())
                .filter((id) => data.owned.includes(id))
        )).slice(0, this.MAX_SHOWCASE);

        data.showcase = normalized;
        if (data.equipped && !data.showcase.includes(data.equipped) && data.showcase.length < this.MAX_SHOWCASE) {
            data.showcase.unshift(data.equipped);
            data.showcase = data.showcase.slice(0, this.MAX_SHOWCASE);
        }
        this.save(data);
        if (!options.skipSync) this._syncBadgeData();
        return true;
    },

    toggleShowcase(badgeId, options = {}) {
        const safeId = String(badgeId || '').trim();
        if (!safeId) return false;
        const data = this.load();
        if (!data.owned.includes(safeId)) {
            Utils.showNotification?.('Voce nao possui esta insignia.', 'warning');
            return false;
        }

        let showcase = Array.isArray(data.showcase) ? [...data.showcase] : [];
        if (showcase.includes(safeId)) {
            if (data.equipped === safeId) {
                if (!options.silent) {
                    Utils.showNotification?.('A insignia em destaque precisa continuar no perfil.', 'warning');
                }
                return false;
            }
            showcase = showcase.filter((id) => id !== safeId);
            if (!options.silent) {
                Utils.showNotification?.('Insignia ocultada do perfil.', 'info');
            }
        } else {
            if (showcase.length >= this.MAX_SHOWCASE) {
                if (!options.silent) {
                    Utils.showNotification?.(`Voce pode exibir ate ${this.MAX_SHOWCASE} insignias.`, 'warning');
                }
                return false;
            }
            showcase.push(safeId);
            if (!options.silent) {
                Utils.showNotification?.('Insignia adicionada ao perfil.', 'success');
            }
        }

        this.setShowcase(showcase, { skipSync: options.skipSync === true });
        return true;
    },

    _normalizeRemoteBadgeEntry(raw = null) {
        if (!raw || typeof raw !== 'object') return null;
        const remoteId = String(raw.id || raw.badgeId || '').trim();
        const id = this._getLegacyTitleBadgeId(remoteId) || remoteId;
        if (!id) return null;
        const local = this.getBadge(id);
        return {
            id,
            name: raw.name || local?.name || id,
            icon: raw.icon || local?.icon || '\u{1F396}\uFE0F',
            rarity: raw.rarity || local?.rarity || 'achievement',
        };
    },

    getProfileBadgeFromProfile(profile = null) {
        if (profile && typeof profile === 'object') {
            const fromObj = this._normalizeRemoteBadgeEntry(profile.profileBadge);
            if (fromObj) return fromObj;

            const id = String(profile.profileBadgeId || '').trim();
            if (id) {
                const local = this.getBadge(id);
                return local || { id, name: id, icon: '\u{1F396}\uFE0F', rarity: 'achievement' };
            }

            const legacyTitleId = String(
                profile.profileTitleId ||
                profile.profileTitle?.id ||
                profile.specialTitle?.id ||
                ''
            ).trim();
            const legacyBadgeId = this._getLegacyTitleBadgeId(legacyTitleId);
            if (legacyBadgeId) {
                const local = this.getBadge(legacyBadgeId);
                return local || {
                    id: legacyBadgeId,
                    name: legacyBadgeId === 'badge_security_sentinel_v310' ? 'Sentinela v3.10' : 'Badge da Temporada',
                    icon: legacyBadgeId === 'badge_security_sentinel_v310' ? '\u{1F6E1}\uFE0F' : '\u{1F396}\uFE0F',
                    rarity: legacyBadgeId === 'badge_security_sentinel_v310' ? 'exclusive' : 'seasonal',
                };
            }
            return null;
        }

        return this.getEquippedBadge();
    },

    getProfileBadgesFromProfile(profile = null) {
        if (profile && typeof profile === 'object') {
            const list = Array.isArray(profile.profileBadges)
                ? profile.profileBadges.map((entry) => this._normalizeRemoteBadgeEntry(entry)).filter(Boolean)
                : [];

            const byId = Object.fromEntries(list.map((badge) => [badge.id, badge]));
            const showcaseIds = Array.isArray(profile.profileBadgeShowcase)
                ? Array.from(new Set(
                    profile.profileBadgeShowcase
                        .map((id) => String(id || '').trim())
                        .filter(Boolean)
                )).slice(0, this.MAX_SHOWCASE)
                : [];
            if (showcaseIds.length) {
                const showcase = showcaseIds
                    .map((id) => byId[id] || this.getBadge(id) || null)
                    .filter(Boolean);
                if (showcase.length) return showcase;
            }

            if (list.length) return list.slice(0, this.MAX_SHOWCASE);

            const single = this.getProfileBadgeFromProfile(profile);
            return single ? [single] : [];
        }
        const showcase = this.getShowcaseBadges();
        if (showcase.length) return showcase.slice(0, this.MAX_SHOWCASE);
        const equipped = this.getEquippedBadge();
        return equipped ? [equipped] : [];
    },

    hydrateFromProfile(profile = null, options = {}) {
        if (!profile || typeof profile !== 'object') return false;

        const data = this.load();
        const ownedSet = new Set(data.owned);
        let changed = false;

        if (Array.isArray(profile.profileBadges)) {
            profile.profileBadges.forEach((entry) => {
                const normalized = this._normalizeRemoteBadgeEntry(entry);
                if (!normalized) return;
                if (!ownedSet.has(normalized.id)) {
                    ownedSet.add(normalized.id);
                    changed = true;
                }
            });
        }

        const legacyTitleId = String(
            profile.profileTitleId ||
            profile.profileTitle?.id ||
            profile.specialTitle?.id ||
            ''
        ).trim();

        let equippedId = String(profile.profileBadgeId || profile.profileBadge?.id || '').trim();
        if (!equippedId) {
            equippedId = this._getLegacyTitleBadgeId(legacyTitleId) || '';
        }
        if (equippedId) {
            const normalizedEquippedId = this._getLegacyTitleBadgeId(equippedId) || equippedId;
            equippedId = normalizedEquippedId;
        }
        if (equippedId && !ownedSet.has(equippedId)) {
            ownedSet.add(equippedId);
            changed = true;
        }

        const nextOwned = Array.from(ownedSet);
        const nextEquipped = equippedId && nextOwned.includes(equippedId) ? equippedId : (data.equipped || null);
        const remoteShowcase = Array.isArray(profile.profileBadgeShowcase)
            ? Array.from(new Set(
                profile.profileBadgeShowcase
                    .map((id) => String(id || '').trim())
                    .filter((id) => nextOwned.includes(id))
            )).slice(0, this.MAX_SHOWCASE)
            : [];

        let nextShowcase = Array.isArray(data.showcase)
            ? data.showcase.filter((id) => nextOwned.includes(id)).slice(0, this.MAX_SHOWCASE)
            : [];
        if (remoteShowcase.length) {
            nextShowcase = remoteShowcase;
        }
        if (!nextShowcase.length && nextEquipped && nextOwned.includes(nextEquipped)) {
            nextShowcase = [nextEquipped];
        }

        if (
            changed ||
            data.equipped !== nextEquipped ||
            data.owned.length !== nextOwned.length ||
            (data.showcase || []).join('|') !== nextShowcase.join('|')
        ) {
            this.save({ owned: nextOwned, equipped: nextEquipped, showcase: nextShowcase });
            if (!options.skipSync) this._syncBadgeData();
            return true;
        }
        return false;
    },

    _migrateLegacySeasonBadgeTitle() {
        if (!window.Inventory?.owns) return false;
        const hadLegacyTitle = window.Inventory.owns('title_season1_badge');
        if (!hadLegacyTitle) return false;
        const legacyWasEquipped = window.Inventory?.getEquipped?.('title') === 'title_season1_badge';

        this.unlock('badge_season1', { silent: true, skipSync: true });
        if (legacyWasEquipped) {
            this.equip('badge_season1', { silent: true, skipSync: true });
        }
        if (window.Inventory?.revokeItem) {
            window.Inventory.revokeItem('title_season1_badge', { silent: true });
        }
        return true;
    },

    _migrateLegacySentinelTitle() {
        if (!window.Inventory?.load || !window.Inventory?.save) return false;

        const legacyTitleIds = ['title_security_sentinel_v310', 'title_bug_hunter_v310'];
        const data = window.Inventory.load();
        const owned = Array.isArray(data?.owned) ? data.owned : [];
        const equippedTitleId = String(data?.equipped?.title || '').trim();
        const hadLegacyTitle = owned.some((id) => legacyTitleIds.includes(id)) || legacyTitleIds.includes(equippedTitleId);

        if (!hadLegacyTitle) return false;

        this.unlock('badge_security_sentinel_v310', { silent: true, skipSync: true, autoEquip: false });
        if (legacyTitleIds.includes(equippedTitleId)) {
            this.equip('badge_security_sentinel_v310', { silent: true, skipSync: true });
        }

        data.owned = owned.filter((id) => !legacyTitleIds.includes(id));
        if (legacyTitleIds.includes(equippedTitleId) && data.equipped) {
            delete data.equipped.title;
        }

        window.Inventory.save(data);
        return true;
    },

    _syncBadgeData() {
        if (!window.NyanAuth?.isOnline?.() || !window.NyanFirebase?.isReady?.()) return;
        const uid = window.NyanAuth?.getUID?.();
        if (!uid) return;

        const equipped = this.getEquippedBadge();
        const owned = this.getOwnedBadges();
        const showcase = this.getShowcaseIds();

        const payload = {
            profileBadgeId: equipped?.id || null,
            profileBadge: equipped
                ? { id: equipped.id, name: equipped.name, icon: equipped.icon, rarity: equipped.rarity || 'achievement' }
                : null,
            profileBadgeShowcase: showcase,
            profileBadges: owned.map((b) => ({
                id: b.id,
                name: b.name,
                icon: b.icon,
                rarity: b.rarity || 'achievement',
            })),
        };

        if (window.NyanAuth?.currentUser && typeof window.NyanAuth.currentUser === 'object') {
            Object.assign(window.NyanAuth.currentUser, payload);
        }

        window.NyanFirebase.updateDoc(`users/${uid}`, payload).catch(() => {});
    },

    init() {
        this._migrateLegacySeasonBadgeTitle();
        this._migrateLegacySentinelTitle();
        this.syncFromAchievements(Utils.loadData('nyan_achievements') || {}, { silent: true, skipSync: true });
        this.syncEventBadges({ silent: true, skipSync: true });
        this._syncBadgeData();
    },
};

window.Badges = Badges;
