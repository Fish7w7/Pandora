const NyanStorage = {
    SOURCES: Object.freeze({
        ECONOMY: 'Economy',
        INVENTORY: 'Inventory',
        PROFILE: 'Profile/Auth',
        CLANS: 'Clans',
        LIVEOPS: 'LiveOps',
        UPDATER: 'Updater',
        UI: 'UI',
        TOOL: 'Tool',
        SYSTEM: 'System',
    }),

    MANIFEST: {
        nyan_economy: { owner: 'Economy', source: 'Economy', critical: true },
        nyan_inventory: { owner: 'Inventory', source: 'Inventory', critical: true },
        nyan_profile_avatar: { owner: 'Profile/Auth', source: 'Profile/Auth' },
        nyan_online_uid: { owner: 'Profile/Auth', source: 'Profile/Auth', critical: true },
        nyan_online_tag: { owner: 'Profile/Auth', source: 'Profile/Auth', critical: true },
        nyan_online_email: { owner: 'Profile/Auth', source: 'Profile/Auth', sensitive: true },
        nyan_online_pwd: { owner: 'Profile/Auth', source: 'Profile/Auth', sensitive: true },
        'nyan.squads': { owner: 'Clans', source: 'Clans', critical: true },
        nyan_liveops_state_v315: { owner: 'LiveOps', source: 'LiveOps', critical: true },
        update_pending_state_v1: { owner: 'Updater', source: 'Updater' },
        update_notice_state: { owner: 'Updater', source: 'Updater' },
        update_reminder_state: { owner: 'Updater', source: 'Updater' },
        version_cache: { owner: 'Updater', source: 'Updater' },
        tasks: { owner: 'Tasks', source: 'Tool' },
        notes: { owner: 'Notes', source: 'Tool' },
        dashboard_stats: { owner: 'Dashboard', source: 'Tool' },
        app_theme: { owner: 'Settings', source: 'UI' },
        app_color_theme: { owner: 'Settings', source: 'UI' },
    },

    get(key, fallback = null) {
        const safeKey = String(key || '').trim();
        if (!safeKey) return fallback;
        try {
            const raw = localStorage.getItem(safeKey);
            if (raw === null || raw === undefined || raw === '') return fallback;
            return this._decode(raw);
        } catch (err) {
            console.warn('[NyanStorage] leitura invalida:', safeKey, err?.message || err);
            return fallback;
        }
    },

    _decode(raw) {
        try {
            return JSON.parse(raw);
        } catch (_) {
            return raw;
        }
    },

    set(key, value) {
        const safeKey = String(key || '').trim();
        if (!safeKey) return false;
        try {
            localStorage.setItem(safeKey, JSON.stringify(value));
            window.dispatchEvent(new CustomEvent('nyan:storage-changed', {
                detail: { key: safeKey, owner: this.getMeta(safeKey).owner || 'unknown' },
            }));
            return true;
        } catch (err) {
            console.error('[NyanStorage] erro ao salvar:', safeKey, err);
            return false;
        }
    },

    remove(key) {
        const safeKey = String(key || '').trim();
        if (!safeKey) return false;
        try {
            localStorage.removeItem(safeKey);
            window.dispatchEvent(new CustomEvent('nyan:storage-removed', {
                detail: { key: safeKey, owner: this.getMeta(safeKey).owner || 'unknown' },
            }));
            return true;
        } catch (err) {
            console.warn('[NyanStorage] erro ao remover:', safeKey, err?.message || err);
            return false;
        }
    },

    register(key, meta = {}) {
        const safeKey = String(key || '').trim();
        if (!safeKey) return;
        this.MANIFEST[safeKey] = {
            ...(this.MANIFEST[safeKey] || {}),
            ...(meta || {}),
        };
    },

    getMeta(key) {
        return this.MANIFEST[String(key || '').trim()] || {};
    },

    getSourceOfTruth(key) {
        return this.getMeta(key).source || 'Legacy';
    },

    safeNumber(key, fallback = 0) {
        const value = Number(this.get(key, fallback));
        return Number.isFinite(value) ? value : fallback;
    },
};

window.NyanStorage = NyanStorage;
