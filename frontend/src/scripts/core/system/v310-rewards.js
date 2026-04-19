const V310Rewards = {
    BADGE: {
        id: 'badge_security_sentinel_v310',
        legacyTitleIds: ['title_security_sentinel_v310', 'title_bug_hunter_v310'],
        name: 'Sentinela v3.10',
        icon: '\u{1F6E1}\uFE0F',
        rarity: 'exclusive',
        description: 'Identificou e neutralizou uma vulnerabilidade critica de integridade.',
    },

    SECURITY_SENTINEL_ALLOWLIST: {
        tags: [
            'Lu#1244'
        ],
        uids: [],
    },

    get BUG_HUNTER_ALLOWLIST() {
        return this.SECURITY_SENTINEL_ALLOWLIST;
    },

    set BUG_HUNTER_ALLOWLIST(value) {
        this.SECURITY_SENTINEL_ALLOWLIST = value || { tags: [], uids: [] };
    },

    _initialized: false,
    _lastGrantedUid: null,

    init() {
        if (this._initialized) return;
        this._initialized = true;
        this._scheduleGrant(1200);
        this._scheduleGrant(4200);

        if (window.addEventListener) {
            window.addEventListener('nyan:online-ready', () => this._scheduleGrant(180));
            window.addEventListener('focus', () => this._scheduleGrant(120));
        }
    },

    setBugHunterAllowlist({ tags = [], uids = [] } = {}) {
        this.setSecuritySentinelAllowlist({ tags, uids });
    },

    setSecuritySentinelAllowlist({ tags = [], uids = [] } = {}) {
        const normalize = (value) => String(value || '').trim();
        const cleanTags = Array.from(new Set((tags || []).map(normalize).filter(Boolean)));
        const cleanUids = Array.from(new Set((uids || []).map(normalize).filter(Boolean)));
        this.SECURITY_SENTINEL_ALLOWLIST = { tags: cleanTags, uids: cleanUids };
        this._scheduleGrant(80);
    },

    _scheduleGrant(delay = 0) {
        setTimeout(() => this._grantIfAllowed(), Math.max(0, delay | 0));
    },

    _isLegacySentinelTitleId(value = '') {
        const safeValue = String(value || '').trim();
        return this.BADGE.legacyTitleIds.includes(safeValue);
    },

    resolveProfileTitle(profile = null) {
        if (!profile) return null;

        const specialTitleId = String(profile.specialTitle?.id || '').trim();
        const profileTitleId = String(profile.profileTitle?.id || profile.profileTitleId || '').trim();

        if (this._isLegacySentinelTitleId(specialTitleId) || this._isLegacySentinelTitleId(profileTitleId)) {
            return null;
        }

        if (profile.specialTitle?.id) {
            return {
                id: profile.specialTitle.id,
                name: profile.specialTitle.name || 'Titulo especial',
                icon: profile.specialTitle.icon || '\u{1F3C5}',
                rarity: profile.specialTitle.rarity || 'weekly',
            };
        }

        if (profile.profileTitle?.id) {
            return {
                id: profile.profileTitle.id,
                name: profile.profileTitle.name || 'Titulo',
                icon: profile.profileTitle.icon || '\u{1F3C5}',
                rarity: profile.profileTitle.rarity || 'common',
            };
        }

        return null;
    },

    _isAllowed(uid, tag) {
        const normalize = (value) => String(value || '').trim().toLowerCase();
        const normalizedUid = normalize(uid);
        const normalizedTag = normalize(tag);

        const uidAllowed = (this.SECURITY_SENTINEL_ALLOWLIST.uids || [])
            .map(normalize)
            .includes(normalizedUid);
        const tagAllowed = (this.SECURITY_SENTINEL_ALLOWLIST.tags || [])
            .map(normalize)
            .includes(normalizedTag);

        return uidAllowed || tagAllowed;
    },

    async _grantIfAllowed() {
        try {
            if (!window.NyanAuth?.isOnline?.() || !window.NyanFirebase?.isReady?.()) return;

            const uid = window.NyanAuth.getUID();
            const tag = window.NyanAuth.getNyanTag();
            if (!uid || !this._isAllowed(uid, tag)) return;
            if (this._lastGrantedUid === uid) return;

            this._applyLocalExclusiveBadge();
            await this._syncExclusiveBadgeToCloud(uid);
            this._lastGrantedUid = uid;
        } catch (_) {}
    },

    _applyLocalExclusiveBadge() {
        const badge = window.Badges?.getBadge?.(this.BADGE.id) || this.BADGE;

        if (window.Badges?.unlock) {
            window.Badges.unlock(badge.id, { silent: true, skipSync: true, autoEquip: false });
            window.Badges.equip?.(badge.id, { silent: true, skipSync: true });
        }

        if (window.Inventory?.load && window.Inventory?.save) {
            const data = window.Inventory.load();
            data.owned = Array.isArray(data.owned)
                ? data.owned.filter((id) => !this._isLegacySentinelTitleId(id))
                : [];
            data.equipped = data.equipped && typeof data.equipped === 'object' ? data.equipped : {};

            if (this._isLegacySentinelTitleId(data.equipped.title)) {
                delete data.equipped.title;
            }

            window.Inventory.save(data);
        }

        if (window.NyanAuth?.currentUser && typeof window.NyanAuth.currentUser === 'object') {
            const user = window.NyanAuth.currentUser;
            user.specialTitle = null;
            user.profileTitleId = null;
            user.profileTitle = null;
            user.profileBadgeId = badge.id;
            user.profileBadge = {
                id: badge.id,
                name: badge.name,
                icon: badge.icon,
                rarity: badge.rarity,
            };

            const currentBadges = Array.isArray(user.profileBadges) ? [...user.profileBadges] : [];
            if (!currentBadges.some((entry) => String(entry?.id || '').trim() === badge.id)) {
                currentBadges.unshift({
                    id: badge.id,
                    name: badge.name,
                    icon: badge.icon,
                    rarity: badge.rarity,
                });
            }
            user.profileBadges = currentBadges;

            const showcase = Array.isArray(user.profileBadgeShowcase) ? [...user.profileBadgeShowcase] : [];
            user.profileBadgeShowcase = Array.from(new Set([badge.id, ...showcase]))
                .slice(0, Number(window.Badges?.MAX_SHOWCASE || 4));
        }
    },

    async _syncExclusiveBadgeToCloud(uid) {
        const badge = window.Badges?.getBadge?.(this.BADGE.id) || this.BADGE;
        const ownedBadges = window.Badges?.getOwnedBadges?.() || [];
        const equippedBadge = window.Badges?.getEquippedBadge?.() || badge;
        const showcaseIds = window.Badges?.getShowcaseIds?.() || [];
        const maxShowcase = Number(window.Badges?.MAX_SHOWCASE || 4);

        const nextOwnedBadges = ownedBadges.some((entry) => entry?.id === badge.id)
            ? ownedBadges
            : [badge, ...ownedBadges];
        const nextShowcase = Array.from(new Set([equippedBadge.id, badge.id, ...showcaseIds]))
            .slice(0, maxShowcase);

        await window.NyanFirebase.updateDoc(`users/${uid}`, {
            specialTitle: null,
            profileTitleId: null,
            profileTitle: null,
            profileBadgeId: equippedBadge.id,
            profileBadge: {
                id: equippedBadge.id,
                name: equippedBadge.name,
                icon: equippedBadge.icon,
                rarity: equippedBadge.rarity || 'achievement',
            },
            profileBadgeShowcase: nextShowcase,
            profileBadges: nextOwnedBadges.map((entry) => ({
                id: entry.id,
                name: entry.name,
                icon: entry.icon,
                rarity: entry.rarity || 'achievement',
            })),
        }).catch(() => {});
    },
};

window.V310Rewards = V310Rewards;
