const V310Rewards = {
    TITLE: {
        id: 'title_security_sentinel_v310',
        name: 'Sentinela v3.10',
        icon: '🛡️',
        rarity: 'milestone',
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

    resolveProfileTitle(profile = null) {
        if (!profile) return null;
        const forceBugIcon = (id, icon) => (id === 'title_security_sentinel_v310' ? '🛡️' : icon);
        if (profile.specialTitle?.id) {
            return {
                id: profile.specialTitle.id,
                name: profile.specialTitle.name || this.TITLE.name,
                icon: forceBugIcon(profile.specialTitle.id, profile.specialTitle.icon || this.TITLE.icon),
                rarity: profile.specialTitle.rarity || this.TITLE.rarity,
            };
        }
        if (profile.profileTitle?.id) {
            return {
                id: profile.profileTitle.id,
                name: profile.profileTitle.name || 'Titulo',
                icon: profile.profileTitle.icon || '🏅',
                icon: forceBugIcon(profile.profileTitle.id, profile.profileTitle.icon || '🏅'),
                rarity: profile.profileTitle.rarity || 'common',
            };
        }
        return null;
    },

    resolveProfileTitle(profile = null) {
        if (!profile) return null;
        const forceSentinelIcon = (id, icon) => {
            if (id === 'title_security_sentinel_v310' || id === 'title_bug_hunter_v310') return '🛡️';
            return icon;
        };

        if (profile.specialTitle?.id) {
            return {
                id: profile.specialTitle.id,
                name: profile.specialTitle.name || this.TITLE.name,
                icon: forceSentinelIcon(profile.specialTitle.id, profile.specialTitle.icon || this.TITLE.icon),
                rarity: profile.specialTitle.rarity || this.TITLE.rarity,
            };
        }
        if (profile.profileTitle?.id) {
            return {
                id: profile.profileTitle.id,
                name: profile.profileTitle.name || 'Titulo',
                icon: forceSentinelIcon(profile.profileTitle.id, profile.profileTitle.icon || '🏅'),
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

            this._applyLocalExclusiveTitle();
            await this._syncExclusiveTitleToCloud(uid);
            this._lastGrantedUid = uid;
        } catch (_) {}
    },

    _applyLocalExclusiveTitle() {
        if (!window.Inventory) return;

        const legacyTitleId = 'title_bug_hunter_v310';
        const data = window.Inventory.load();
        data.owned = data.owned || [];
        data.equipped = data.equipped || {};

        data.owned = data.owned.filter((id) => id !== legacyTitleId);
        if (!data.owned.includes(this.TITLE.id)) data.owned.push(this.TITLE.id);
        if (data.equipped.title === legacyTitleId) data.equipped.title = this.TITLE.id;
        data.equipped.title = this.TITLE.id;

        window.Inventory.save(data);
    },

    async _syncExclusiveTitleToCloud(uid) {
        await window.NyanFirebase.updateDoc(`users/${uid}`, {
            specialTitle: {
                id: this.TITLE.id,
                name: this.TITLE.name,
                icon: this.TITLE.icon,
                rarity: this.TITLE.rarity,
                grantedAt: Date.now(),
                source: 'v3.10-security-reward',
            },
            profileTitleId: this.TITLE.id,
            profileTitle: {
                id: this.TITLE.id,
                name: this.TITLE.name,
                icon: this.TITLE.icon,
                rarity: this.TITLE.rarity,
            },
        }).catch(() => {});
    },
};

window.V310Rewards = V310Rewards;
