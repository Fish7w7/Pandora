const StateManager = {

    _state: {},
    _subscribers: {},
    _renderQueue: new Set(),
    _renderScheduled: false,

    set(key, value) {
        const prev = this._state[key];
        this._state[key] = value;

        if (JSON.stringify(prev) !== JSON.stringify(value)) {
            this._notify(key, value, prev);
        }
    },

    get(key, fallback = null) {
        return key in this._state ? this._state[key] : fallback;
    },

    subscribe(key, fn) {
        if (!this._subscribers[key]) this._subscribers[key] = [];
        this._subscribers[key].push(fn);
        return () => {
            this._subscribers[key] = this._subscribers[key].filter(f => f !== fn);
        };
    },

    _notify(key, value, prev) {
        (this._subscribers[key] || []).forEach(fn => {
            try { fn(value, prev); } catch(e) { console.error(`[StateManager] subscriber ${key} erro:`, e); }
        });
        window.dispatchEvent(new CustomEvent('nyan:state-changed', { detail: { key, value, prev } }));
    },

    /**
     * Agenda um re-render para o próximo frame.
     * Múltiplas chamadas no mesmo frame colapsam em 1.
     */
    scheduleRender(toolId = null) {
        if (toolId) this._renderQueue.add(toolId);

        if (!this._renderScheduled) {
            this._renderScheduled = true;
            requestAnimationFrame(() => {
                this._renderScheduled = false;
                const queue = [...this._renderQueue];
                this._renderQueue.clear();

                const currentRoute = window.Router?.currentRoute;
                if (queue.length === 0 || queue.includes(currentRoute)) {
                    window.Router?.render();
                }
            });
        }
    },

    KEYS: {
        USER:           'user',
        PRESENCE:       'presence',
        ECONOMY:        'economy',
        MISSIONS:       'missions',
        FRIENDS_ONLINE: 'friends_online',
        NOTIFICATIONS:  'notifications_queue',
        CURRENT_GAME:   'current_game',
        TOOL_HISTORY:   'tool_history',
    },

    hydrate() {
        const presence = window.Utils?.loadData('nyan_presence_state');
        if (presence) this.set(this.KEYS.PRESENCE, presence);

        const economy = window.Economy?.getState?.();
        if (economy) this.set(this.KEYS.ECONOMY, economy);

        const missions = window.Missions?.getDailyMissions?.();
        if (missions) this.set(this.KEYS.MISSIONS, missions);

        const user = window.Auth?.getStoredUser?.();
        if (user) this.set(this.KEYS.USER, user);

    },

    /**
     * Atualiza apenas elementos específicos da sidebar
     * sem re-renderizar toda a interface.
     */
    updateSidebarElement(elementId, fn) {
        const el = document.getElementById(elementId);
        if (el) { try { fn(el); } catch(e) {} }
    },

    /**
     * Atualiza o badge de missões sem re-render.
     */
    updateMissionsBadge() {
        const pending = window.Missions?.getPendingCount?.() || 0;
        this.updateSidebarElement('missions-nav-badge', el => {
            if (pending > 0) {
                el.textContent    = pending;
                el.style.display  = 'inline-flex';
            } else {
                el.style.display  = 'none';
            }
        });

        const widget = document.getElementById('missions-sidebar-widget');
        if (widget && window.Missions) {
            const missions  = window.Missions.getDailyMissions();
            const doneCount = missions.filter(m => m.completed).length;
            const total     = missions.length;
            const pct       = total > 0 ? Math.round((doneCount / total) * 100) : 0;
            const bar  = widget.querySelector('.missions-progress-bar');
            const text = widget.querySelector('.missions-progress-text');
            if (bar)  bar.style.width   = pct + '%';
            if (text) text.textContent  = `${doneCount}/${total}`;
        }
    },

    /**
     * Atualiza chips e XP sem re-render.
     */
    updateEconomyUI() {
        const state = window.Economy?.getState?.();
        if (!state) return;

        this.updateSidebarElement('economy-chips-display', el => {
            el.textContent = state.chips.toLocaleString('pt-BR');
        });
        this.updateSidebarElement('economy-xp-bar', el => {
            el.style.width = window.Economy?.getLevelProgress?.() + '%';
        });
        this.updateSidebarElement('economy-xp-display', el => {
            el.textContent = `${state.xp} / ${state.xpToNext} XP`;
        });
    },

    /**
     * Garante que todos os módulos principais tenham
     * seus dados sincronizados com o localStorage.
     */
    syncAll() {
        const ecoState = window.Economy?.getState?.();
        if (ecoState) this.set(this.KEYS.ECONOMY, ecoState);

        const missionData = window.Missions?.getDailyMissions?.();
        if (missionData) this.set(this.KEYS.MISSIONS, missionData);

        const presenceData = window.Presence?.getState?.();
        if (presenceData) this.set(this.KEYS.PRESENCE, presenceData);
    },

    init() {
        setTimeout(() => this.hydrate(), 500);

        setInterval(() => this.syncAll(), 120000);

        window.addEventListener('nyan:presence-changed', (e) => {
            this.set(this.KEYS.PRESENCE, e.detail);
        });

    },
};

window.StateManager = StateManager;
