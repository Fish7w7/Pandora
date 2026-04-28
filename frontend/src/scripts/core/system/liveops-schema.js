const NyanLiveOps = {
    version: 1,
    enabled: false,
    eventTypes: Object.freeze(['temporary_event', 'special_mission', 'seasonal_reward']),

    normalizeEvent(raw = {}) {
        const startsAt = Date.parse(raw.startsAt || '');
        const endsAt = Date.parse(raw.endsAt || '');
        return {
            id: String(raw.id || '').trim(),
            type: this.eventTypes.includes(raw.type) ? raw.type : 'temporary_event',
            title: String(raw.title || '').trim(),
            startsAt: Number.isFinite(startsAt) ? raw.startsAt : '',
            endsAt: Number.isFinite(endsAt) ? raw.endsAt : '',
            rewards: Array.isArray(raw.rewards) ? raw.rewards : [],
            missions: Array.isArray(raw.missions) ? raw.missions : [],
            enabled: raw.enabled === true,
        };
    },

    isActive(event = {}, now = Date.now()) {
        if (!event.enabled) return false;
        const start = Date.parse(event.startsAt || '');
        const end = Date.parse(event.endsAt || '');
        if (Number.isFinite(start) && now < start) return false;
        if (Number.isFinite(end) && now > end) return false;
        return true;
    },
};

window.NyanLiveOps = NyanLiveOps;
