
const Presence = {

    KEY: 'nyan_presence_state',
    HISTORY_KEY: 'nyan_presence_history',
    IDLE_TIMEOUT: 3 * 60 * 1000,
    AWAY_TIMEOUT: 10 * 60 * 1000,
    SYNC_INTERVAL: 30 * 1000,

    _idleTimer:    null,
    _awayTimer:    null,
    _syncInterval: null,
    _lastActivity: Date.now(),
    _currentStatus: 'online',
    _currentContext: null,

    ROUTE_CONTEXTS: {
        'home':          { status: 'online',   label: 'Na home',          icon: '🏠' },
        'password':      { status: 'online',   label: 'Gerando senhas',    icon: '🔑' },
        'weather':       { status: 'online',   label: 'Vendo o clima',     icon: '🌤️' },
        'translator':    { status: 'online',   label: 'Traduzindo',        icon: '🌍' },
        'ai-assistant':  { status: 'online',   label: 'Usando IA',         icon: '🤖' },
        'mini-game':     { status: 'playing',  label: 'Jogando Cobrinha',  icon: '🐍' },
        'temp-email':    { status: 'online',   label: 'Com email temporário', icon: '📧' },
        'music':         { status: 'online',   label: 'Ouvindo música',    icon: '🎵' },
        'notes':         { status: 'focused',  label: 'Escrevendo notas',  icon: '📝' },
        'tasks':         { status: 'focused',  label: 'Gerenciando tarefas', icon: '✅' },
        'missions':      { status: 'online',   label: 'Nas missões',       icon: '📋' },
        'shop':          { status: 'online',   label: 'Na loja',           icon: '🛍️' },
        'offline':       { status: 'playing',  label: 'Zona Offline',      icon: '📶' },
        'settings':      { status: 'online',   label: 'Nas configurações', icon: '⚙️' },
        'friends':       { status: 'online',   label: 'Vendo amigos',      icon: '👥' },
        'chat':          { status: 'online',   label: 'No chat',           icon: '💬' },
        'leaderboard':   { status: 'online',   label: 'Vendo o placar',    icon: '🏆' },
        'feed':          { status: 'online',   label: 'No feed',           icon: '📰' },
        'challenges':    { status: 'playing',  label: 'Em desafios',       icon: '⚔️' },
        'profile':       { status: 'online',   label: 'No perfil',         icon: '👤' },
    },

    GAME_CONTEXTS: {
        'typeracer': { status: 'playing', label: 'Jogando Type Racer',  icon: '⌨️' },
        'game2048':  { status: 'playing', label: 'Jogando 2048',        icon: '🔢' },
        'flappy':    { status: 'playing', label: 'Jogando Flappy Nyan', icon: '🐱' },
        'quiz':      { status: 'playing', label: 'No Quiz Diário',      icon: '🧠' },
        'termo':     { status: 'playing', label: 'Jogando Termo',       icon: '🔤' },
        'forca':     { status: 'playing', label: 'Jogando Forca',       icon: '🎯' },
        'snake':     { status: 'playing', label: 'Jogando Cobrinha',    icon: '🐍' },
        'slot':      { status: 'playing', label: 'No Caça-Níquel',      icon: '🎰' },
        'tictactoe': { status: 'playing', label: 'Jogando Jogo da Velha', icon: '❌' },
    },

    STATUS_CONFIG: {
        online:   { color: '#4ade80', dot: '#4ade80', label: 'Online'   },
        playing:  { color: '#a855f7', dot: '#a855f7', label: 'Jogando'  },
        focused:  { color: '#3b82f6', dot: '#3b82f6', label: 'Focado'   },
        away:     { color: '#fbbf24', dot: '#fbbf24', label: 'Ausente'  },
        idle:     { color: '#94a3b8', dot: '#94a3b8', label: 'Inativo'  },
        offline:  { color: '#64748b', dot: '#64748b', label: 'Offline'  },
    },

    init() {
        this._setupActivityTracking();
        this._patchRouter();
        this._patchOfflineZone();
        this._startSyncInterval();
        this._restoreState();

        const currentRoute = window.Router?.currentRoute || 'home';
        this.updateFromRoute(currentRoute);

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this._setStatus('idle', { label: 'Fora do app', icon: '😴' });
            } else {
                this._resetIdleTimers();
                const route = window.Router?.currentRoute || 'home';
                this.updateFromRoute(route);
            }
        });

    },

    _setupActivityTracking() {
        const reset = () => {
            this._lastActivity = Date.now();
            this._resetIdleTimers();
            if (this._currentStatus === 'idle' || this._currentStatus === 'away') {
                const route = window.Router?.currentRoute || 'home';
                this.updateFromRoute(route);
            }
        };

        ['mousemove','keydown','click','scroll','touchstart'].forEach(event => {
            document.addEventListener(event, reset, { passive: true });
        });
    },

    _resetIdleTimers() {
        clearTimeout(this._idleTimer);
        clearTimeout(this._awayTimer);

        this._idleTimer = setTimeout(() => {
            const lastActive = Date.now() - this._lastActivity;
            if (lastActive >= this.IDLE_TIMEOUT - 1000) {
                this._setStatus('away', {
                    label: `Ausente há ${Math.floor(lastActive / 60000)}min`,
                    icon: '💤'
                });
            }
        }, this.IDLE_TIMEOUT);

        this._awayTimer = setTimeout(() => {
            this._setStatus('idle', { label: 'Inativo', icon: '😴' });
        }, this.AWAY_TIMEOUT);
    },

    _patchRouter() {
        const tryPatch = () => {
            if (!window.Router) { setTimeout(tryPatch, 500); return; }

            const origNavigate = Router.navigate.bind(Router);
            Router.navigate = (toolId) => {
                origNavigate(toolId);
                setTimeout(() => this.updateFromRoute(toolId), 100);
            };
        };
        setTimeout(tryPatch, 200);
    },

    _patchOfflineZone() {
        const tryPatch = () => {
            if (!window.OfflineZone) { setTimeout(tryPatch, 1000); return; }

            const origInitGame = OfflineZone._initGame?.bind(OfflineZone);
            if (!origInitGame) return;

            OfflineZone._initGame = (gameId) => {
                origInitGame(gameId);
                const ctx = this.GAME_CONTEXTS[gameId];
                if (ctx) this._setContext(ctx);
            };
        };
        setTimeout(tryPatch, 500);
    },

    updateFromRoute(route) {
        if (route === 'offline' && window.OfflineZone?._insideGame && window.OfflineZone?.currentGame) {
            const gameCtx = this.GAME_CONTEXTS[OfflineZone.currentGame];
            if (gameCtx) { this._setContext(gameCtx); return; }
        }

        const ctx = this.ROUTE_CONTEXTS[route] || { status: 'online', label: 'No NyanTools', icon: '🐱' };
        this._setContext(ctx);
    },

    _setContext(ctx) {
        this._currentContext = ctx;
        this._setStatus(ctx.status, ctx);
    },

    _setStatus(status, context = null) {
        this._currentStatus = status;
        const cfg = this.STATUS_CONFIG[status] || this.STATUS_CONFIG.online;

        const state = {
            status,
            label:     context?.label || cfg.label,
            icon:      context?.icon  || '🐱',
            color:     cfg.color,
            updatedAt: Date.now(),
        };
        this._saveState(state);

        this._updateSidebarUI(state);

        if (window.NyanFirebase?.isReady?.() && window.NyanAuth?.isOnline?.()) {
            this._syncToFirebase(status, state.label);
        }

        window.dispatchEvent(new CustomEvent('nyan:presence-changed', { detail: state }));

    },

    _updateSidebarUI(state) {
        const dot    = document.getElementById('sidebar-presence-dot');
        const status = document.getElementById('sidebar-online-status');

        if (dot) {
            dot.style.background  = state.color;
            dot.style.boxShadow   = `0 0 6px ${state.color}99`;
            dot.title = `Status: ${state.label}`;
        }

        if (status) {
            const tag = window.Utils?.loadData?.('nyan_online_tag');
            if (tag) {
                status.textContent = tag;
            } else {
                status.textContent = state.label;
            }
        }
    },

    _syncToFirebase(status, label) {
        const uid = window.NyanAuth?.getUID?.();
        if (!uid) return;

        const update = {
            status,
            presenceLabel:  label,
            presenceUpdated: window.NyanFirebase.fn.serverTimestamp(),
        };

        window.NyanFirebase.updateDoc(`users/${uid}`, update).catch(() => {});

        if (window.NyanFirebase.rtdb && window.NyanFirebase.fn.ref && window.NyanFirebase.fn.set) {
            window.NyanFirebase.fn.set(
                window.NyanFirebase.fn.ref(window.NyanFirebase.rtdb, `presence/${uid}`),
                {
                    online:   status !== 'offline' && status !== 'idle',
                    status,
                    label,
                    lastSeen: window.NyanFirebase.fn.serverTimestampRTDB(),
                }
            ).catch(() => {});
        }
    },

    _startSyncInterval() {
        this._syncInterval = setInterval(() => {
            const state = this.getState();
            if (state && window.NyanFirebase?.isReady?.() && window.NyanAuth?.isOnline?.()) {
                this._syncToFirebase(state.status, state.label);
            }
        }, this.SYNC_INTERVAL);
    },

    _saveState(state) {
        window.Utils?.saveData?.(this.KEY, state);
    },

    _restoreState() {
        const saved = window.Utils?.loadData?.(this.KEY);
        if (saved) {
            this._currentStatus  = saved.status  || 'online';
            this._currentContext = saved;
        }
    },

    getState() {
        return window.Utils?.loadData?.(this.KEY) || {
            status: 'online', label: 'Online', icon: '🐱', color: '#4ade80'
        };
    },

    getCurrentStatus() { return this._currentStatus; },
    getCurrentLabel()  { return this._currentContext?.label || 'Online'; },
    getCurrentIcon()   { return this._currentContext?.icon  || '🐱'; },

    async getFriendPresence(uid) {
        if (!window.NyanFirebase?.isReady?.()) return null;
        try {
            const profile = await window.NyanFirebase.getDoc(`users/${uid}`);
            if (!profile) return null;
            return {
                status:       profile.status       || 'offline',
                presenceLabel: profile.presenceLabel || null,
                lastSeen:     profile.lastSeen,
            };
        } catch { return null; }
    },

    destroy() {
        clearTimeout(this._idleTimer);
        clearTimeout(this._awayTimer);
        clearInterval(this._syncInterval);
    },
};

Presence._resolvePresenceRoute = function() {
    const route = window.Router?.currentRoute || 'home';
    if (route === 'offline' && window.OfflineZone?._insideGame && window.OfflineZone?.currentGame) {
        return `game:${window.OfflineZone.currentGame}`;
    }
    return route;
};

Presence._syncToFirebase = function(status, label) {
    const uid = window.NyanAuth?.getUID?.();
    if (!uid) return;

    const route = this._resolvePresenceRoute();
    const contextIcon = this.getCurrentIcon?.() || '🐱';

    const update = {
        status,
        presenceLabel: label,
        presenceRoute: route,
        presenceIcon: contextIcon,
        presenceUpdated: window.NyanFirebase.fn.serverTimestamp(),
    };

    window.NyanFirebase.updateDoc(`users/${uid}`, update).catch(() => {});

    if (window.NyanFirebase.rtdb && window.NyanFirebase.fn.ref && window.NyanFirebase.fn.set) {
        window.NyanFirebase.fn.set(
            window.NyanFirebase.fn.ref(window.NyanFirebase.rtdb, `presence/${uid}`),
            {
                online: status !== 'offline' && status !== 'idle',
                status,
                label,
                route,
                icon: contextIcon,
                lastSeen: window.NyanFirebase.fn.serverTimestampRTDB(),
            }
        ).catch(() => {});
    }
};

Presence.updateFromRoute = function(route) {
    this._currentRoute = route || 'home';

    if (this._currentRoute === 'offline' && window.OfflineZone?._insideGame && window.OfflineZone?.currentGame) {
        const gameId = window.OfflineZone.currentGame;
        const gameCtx = this.GAME_CONTEXTS?.[gameId];
        if (gameCtx) return this._setContext({ ...gameCtx, route: `game:${gameId}` });
    }

    const ctx = this.ROUTE_CONTEXTS?.[this._currentRoute] || { status: 'online', label: 'No NyanTools', icon: '🐱' };
    this._setContext({ ...ctx, route: this._currentRoute });
};

Presence._setContext = function(ctx) {
    const next = { ...(ctx || {}) };
    if (!next.route) {
        if (next.status === 'playing' && window.OfflineZone?.currentGame) {
            next.route = `game:${window.OfflineZone.currentGame}`;
        } else {
            next.route = this._currentRoute || 'home';
        }
    }
    this._currentContext = next;
    this._setStatus(next.status || 'online', next);
};

Presence._setStatus = function(status, context = null) {
    this._currentStatus = status;
    const cfg = this.STATUS_CONFIG?.[status] || this.STATUS_CONFIG?.online || { color: '#4ade80', label: 'Online' };

    const state = {
        status,
        label: context?.label || cfg.label,
        icon: context?.icon || '🐱',
        route: context?.route || this._currentRoute || 'home',
        color: cfg.color,
        updatedAt: Date.now(),
    };

    this._saveState(state);
    this._updateSidebarUI(state);

    if (window.NyanFirebase?.isReady?.() && window.NyanAuth?.isOnline?.()) {
        this._syncToFirebase(status, state.label, state.route);
    }

    window.dispatchEvent(new CustomEvent('nyan:presence-changed', { detail: state }));
};

Presence._syncToFirebase = function(status, label, forcedRoute = null) {
    const uid = window.NyanAuth?.getUID?.();
    if (!uid) return;

    const route = forcedRoute || this._currentContext?.route || this._currentRoute || 'home';
    const contextIcon = this.getCurrentIcon?.() || '🐱';

    const update = {
        status,
        presenceLabel: label,
        presenceRoute: route,
        presenceIcon: contextIcon,
        presenceUpdated: window.NyanFirebase.fn.serverTimestamp(),
    };

    window.NyanFirebase.updateDoc(`users/${uid}`, update).catch(() => {});

    if (window.NyanFirebase.rtdb && window.NyanFirebase.fn.ref && window.NyanFirebase.fn.set) {
        window.NyanFirebase.fn.set(
            window.NyanFirebase.fn.ref(window.NyanFirebase.rtdb, `presence/${uid}`),
            {
                online: status !== 'offline' && status !== 'idle',
                status,
                label,
                route,
                icon: contextIcon,
                lastSeen: window.NyanFirebase.fn.serverTimestampRTDB(),
            }
        ).catch(() => {});
    }
};

Presence._patchOfflineZone = function() {
    const tryPatch = () => {
        if (!window.OfflineZone) { setTimeout(tryPatch, 1000); return; }
        const origInitGame = window.OfflineZone._initGame?.bind(window.OfflineZone);
        if (!origInitGame) return;

        window.OfflineZone._initGame = (gameId) => {
            origInitGame(gameId);
            this._currentRoute = 'offline';
            const ctx = this.GAME_CONTEXTS?.[gameId];
            if (ctx) this._setContext({ ...ctx, route: `game:${gameId}` });
        };
    };
    setTimeout(tryPatch, 500);
};

window.Presence = Presence;

(function finalizePresenceV310() {
    if (!window.Presence || Presence.__v310Finalized) return;
    Presence.__v310Finalized = true;

    Presence.ROUTE_MONITOR_INTERVAL = 900;
    Presence._routeMonitor = null;
    Presence._lastPacketHash = '';
    Presence._lastPacketAt = 0;

    Presence._resolveLiveRoute = function() {
        const route = window.Router?.currentRoute || 'home';
        if (route === 'offline' && window.OfflineZone?._insideGame && window.OfflineZone?.currentGame) {
            return `game:${window.OfflineZone.currentGame}`;
        }
        return route;
    };

    const __origSetStatus = Presence._setStatus?.bind(Presence);
    Presence._setStatus = function(status, context = null) {
        const route = context?.route || this._resolveLiveRoute();
        const label = context?.label || '';
        const icon = context?.icon || '';
        const hash = `${status}|${label}|${route}|${icon}`;
        const now = Date.now();

        if (hash === this._lastPacketHash && (now - this._lastPacketAt) < 400) return;
        this._lastPacketHash = hash;
        this._lastPacketAt = now;

        __origSetStatus?.(status, { ...(context || {}), route });
    };

    Presence._startRouteMonitor = function() {
        if (this._routeMonitor) clearInterval(this._routeMonitor);
        this._routeMonitor = setInterval(() => {
            const liveRoute = this._resolveLiveRoute();
            if (!liveRoute) return;

            const current = this._currentContext?.route || this._currentRoute || 'home';
            if (current !== liveRoute) {
                if (liveRoute.startsWith('game:')) {
                    this._currentRoute = 'offline';
                    this.updateFromRoute('offline');
                    return;
                }
                this._currentRoute = liveRoute;
                this.updateFromRoute(liveRoute);
            }
        }, this.ROUTE_MONITOR_INTERVAL);
    };

    const __origInit = Presence.init?.bind(Presence);
    Presence.init = function() {
        if (this.__v310InitDone) return;
        this.__v310InitDone = true;
        __origInit?.();
        this._startRouteMonitor?.();
    };

    const __origDestroy = Presence.destroy?.bind(Presence);
    Presence.destroy = function() {
        if (this._routeMonitor) {
            clearInterval(this._routeMonitor);
            this._routeMonitor = null;
        }
        __origDestroy?.();
        this.__v310InitDone = false;
    };
})();
