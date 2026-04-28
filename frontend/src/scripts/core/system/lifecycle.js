const NyanLifecycle = {
    _currentRoute: '',
    _cleanups: new Map(),
    _bootedModules: new Set(),

    _scopeKey(scope = 'global') {
        return String(scope || 'global');
    },

    trackCleanup(scope, cleanup) {
        if (typeof cleanup !== 'function') return cleanup;
        const key = this._scopeKey(scope);
        if (!this._cleanups.has(key)) this._cleanups.set(key, new Set());
        this._cleanups.get(key).add(cleanup);
        return cleanup;
    },

    addEvent(scope, target, type, handler, options) {
        if (!target || !type || typeof handler !== 'function') return null;
        target.addEventListener(type, handler, options);
        return this.trackCleanup(scope, () => target.removeEventListener(type, handler, options));
    },

    setTimeout(scope, fn, delay) {
        const id = window.setTimeout(fn, delay);
        this.trackCleanup(scope, () => window.clearTimeout(id));
        return id;
    },

    setInterval(scope, fn, delay) {
        const id = window.setInterval(fn, delay);
        this.trackCleanup(scope, () => window.clearInterval(id));
        return id;
    },

    cleanupScope(scope = 'global') {
        const key = this._scopeKey(scope);
        const cleanups = this._cleanups.get(key);
        if (!cleanups) return;
        cleanups.forEach((cleanup) => {
            try { cleanup(); } catch (err) { console.warn('[NyanLifecycle] cleanup falhou:', err); }
        });
        this._cleanups.delete(key);
    },

    enterRoute(route) {
        const next = String(route || 'home');
        if (this._currentRoute && this._currentRoute !== next) {
            this.cleanupScope(`route:${this._currentRoute}`);
        }
        this._currentRoute = next;
    },

    markModuleBooted(name) {
        const key = String(name || '').trim();
        if (!key) return false;
        if (this._bootedModules.has(key)) return false;
        this._bootedModules.add(key);
        return true;
    },

    cleanupAll() {
        Array.from(this._cleanups.keys()).forEach((scope) => this.cleanupScope(scope));
    },
};

window.NyanLifecycle = NyanLifecycle;
