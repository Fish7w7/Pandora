const DevSecurity = {
    _status: {
        isDevEnv: false,
        enabled: false,
        uidAllowed: false,
        unlocked: false,
        expiresAt: 0,
        lockoutRemainingMs: 0,
    },
    _refreshPromise: null,
    _devEnvPromise: null,
    _devEnvChecked: false,
    _lastUpdateSignature: '',

    _resolveUID() {
        return window.NyanAuth?.getUID?.() || Utils.loadData('nyan_online_uid') || '';
    },

    _hasBridge() {
        return !!window.electronAPI?.getDevSecurityStatus;
    },

    _emitUpdate(force = false) {
        const snap = this.snapshot();
        const signature = [
            snap.isDevEnv ? '1' : '0',
            snap.enabled ? '1' : '0',
            snap.uidAllowed ? '1' : '0',
            snap.unlocked ? '1' : '0',
            String(snap.expiresAt || 0),
            String(snap.lockoutRemainingMs || 0),
        ].join('|');

        if (!force && signature === this._lastUpdateSignature) return;
        this._lastUpdateSignature = signature;

        window.dispatchEvent(new CustomEvent('nyan:dev-security-updated', {
            detail: snap,
        }));
    },

    snapshot() {
        return {
            isDevEnv: !!this._status.isDevEnv,
            enabled: !!this._status.enabled,
            uidAllowed: !!this._status.uidAllowed,
            unlocked: !!this._status.unlocked && Date.now() < Number(this._status.expiresAt || 0),
            expiresAt: Number(this._status.expiresAt || 0),
            lockoutRemainingMs: Number(this._status.lockoutRemainingMs || 0),
            canShowTool: this.canShowTool(),
        };
    },

    canShowTool() {
        return !!this._status.isDevEnv;
    },

    isUnlocked() {
        if (!this._status.isDevEnv) return false;
        // Em ambiente dev, quando a seguranca nao esta configurada, libera o Dev Lab.
        if (!this._status.enabled) return true;
        return !!this._status.unlocked && Date.now() < Number(this._status.expiresAt || 0);
    },

    async init() {
        await this.refresh(true);
        if (!this._boundOnlineReady) {
            this._boundOnlineReady = true;
            window.addEventListener('nyan:online-ready', () => {
                this.refresh(true).catch(() => {});
            });
        }
        return this.snapshot();
    },

    async _refreshDevEnvironment(force = false) {
        if (!window.electronAPI?.isDevEnvironment) {
            this._status.isDevEnv = false;
            this._devEnvChecked = true;
            return false;
        }
        if (!force && this._devEnvChecked) return !!this._status.isDevEnv;
        if (!force && this._devEnvPromise) return this._devEnvPromise;

        this._devEnvPromise = (async () => {
            const r = await window.electronAPI.isDevEnvironment();
            this._status.isDevEnv = !!r?.isDev;
            this._devEnvChecked = true;
            return !!this._status.isDevEnv;
        })();

        try {
            return await this._devEnvPromise;
        } catch (_) {
            this._status.isDevEnv = false;
            this._devEnvChecked = true;
            return false;
        } finally {
            this._devEnvPromise = null;
        }
    },

    async refresh(force = false) {
        if (!force && this._refreshPromise) return this._refreshPromise;

        this._refreshPromise = (async () => {
            const isDevEnv = await this._refreshDevEnvironment(force);
            if (!isDevEnv) {
                this._status = {
                    isDevEnv: false,
                    enabled: false,
                    uidAllowed: false,
                    unlocked: false,
                    expiresAt: 0,
                    lockoutRemainingMs: 0,
                };
                this._emitUpdate();
                return this.snapshot();
            }

            if (!this._hasBridge()) {
                this._status = {
                    isDevEnv: true,
                    enabled: false,
                    uidAllowed: false,
                    unlocked: false,
                    expiresAt: 0,
                    lockoutRemainingMs: 0,
                };
                this._emitUpdate();
                return this.snapshot();
            }

            const uid = this._resolveUID();
            const r = await window.electronAPI.getDevSecurityStatus(uid);
            if (!r?.success) {
                this._status = {
                    isDevEnv: true,
                    enabled: false,
                    uidAllowed: false,
                    unlocked: false,
                    expiresAt: 0,
                    lockoutRemainingMs: 0,
                };
                this._emitUpdate();
                return this.snapshot();
            }

            this._status.isDevEnv = true;
            this._status.enabled = !!r.enabled;
            this._status.uidAllowed = !!r.uidAllowed;
            this._status.unlocked = !!r.unlocked && Date.now() < Number(r.expiresAt || 0);
            this._status.expiresAt = Number(r.expiresAt || 0);
            this._status.lockoutRemainingMs = Number(r.lockoutRemainingMs || 0);
            this._emitUpdate();
            return this.snapshot();
        })();

        try {
            return await this._refreshPromise;
        } finally {
            this._refreshPromise = null;
        }
    },

    async validateSession() {
        if (!this._hasBridge()) return false;
        if (!this._status.isDevEnv) return false;
        if (!this._status.enabled) return true;
        if (!this._status.uidAllowed) return false;
        if (!this.isUnlocked()) return false;

        const uid = this._resolveUID();
        const r = await window.electronAPI.validateDevSecurity(uid);
        if (r?.success && r.authorized) {
            this._status.unlocked = true;
            this._status.expiresAt = Number(r.expiresAt || this._status.expiresAt || 0);
            this._status.lockoutRemainingMs = 0;
            this._emitUpdate();
            return true;
        }

        this._status.unlocked = false;
        this._status.expiresAt = 0;
        this._emitUpdate();
        return false;
    },

    async promptUnlock() {
        await this.refresh(true);

        if (!this._status.isDevEnv) {
            Utils.showNotification?.('Dev Lab disponivel apenas em ambiente developer.', 'warning');
            return { success: false };
        }
        if (!this._status.enabled) {
            // Fallback dev-only: nao exige segredo quando a seguranca nao esta configurada.
            this._status.unlocked = true;
            this._status.expiresAt = Date.now() + 24 * 60 * 60 * 1000;
            this._status.lockoutRemainingMs = 0;
            this._emitUpdate();
            return { success: true, devBypass: true, expiresAt: this._status.expiresAt };
        }
        if (!this._status.uidAllowed) {
            Utils.showNotification?.('Este usuario nao possui permissao dev.', 'error');
            return { success: false };
        }
        if (this._status.lockoutRemainingMs > 0) {
            const secs = Math.ceil(this._status.lockoutRemainingMs / 1000);
            Utils.showNotification?.(`Bloqueado por tentativas invalidas. Aguarde ${secs}s.`, 'warning');
            return { success: false };
        }

        const passphrase = window.prompt('Digite a chave de acesso Dev:');
        if (passphrase === null) return { success: false, cancelled: true };

        const uid = this._resolveUID();
        const r = await window.electronAPI.unlockDevSecurity(uid, passphrase);
        if (r?.success) {
            this._status.unlocked = true;
            this._status.expiresAt = Number(r.expiresAt || 0);
            this._status.lockoutRemainingMs = 0;
            this._emitUpdate();
            Utils.showNotification?.('Acesso dev liberado com sucesso.', 'success');
            return { success: true, expiresAt: this._status.expiresAt };
        }

        this._status.unlocked = false;
        this._status.expiresAt = 0;
        this._status.lockoutRemainingMs = Number(r?.lockoutRemainingMs || 0);
        this._emitUpdate();
        Utils.showNotification?.(r?.error || 'Falha ao validar credencial dev.', 'error');
        return { success: false };
    },

    async ensureUnlocked(promptIfNeeded = true) {
        await this.refresh(true);
        if (await this.validateSession()) return true;
        if (!promptIfNeeded) return false;
        const unlock = await this.promptUnlock();
        if (!unlock?.success) return false;
        return this.validateSession();
    },

    async lock() {
        if (this._hasBridge()) {
            await window.electronAPI.lockDevSecurity();
        }
        this._status.unlocked = false;
        this._status.expiresAt = 0;
        this._emitUpdate();
    },
};

window.DevSecurity = DevSecurity;
