const VersionManager = {
    version: '3.14.0',
    codename: 'Nyan Core',
    releaseDate: '2026-04-26',
    previousVersion: '3.13.3',

    getVersion() {
        return this.version;
    },

    getDisplayName() {
        return `NyanTools v${this.version}`;
    },

    getReleaseLabel() {
        return `v${this.version} "${this.codename}"`;
    },

    applyToDocument() {
        const label = this.getDisplayName();
        document.documentElement.setAttribute('data-app-version', this.version);
        document.title = `${label} - ${this.codename}`;
        document.querySelectorAll('[data-app-version]').forEach((el) => {
            if (el === document.documentElement) return;
            el.textContent = `v${this.version}`;
        });
    },

    syncModules() {
        if (window.App) window.App.version = this.version;
        if (window.AutoUpdater) window.AutoUpdater.currentVersion = this.version;
    },

    init() {
        this.applyToDocument();
        this.syncModules();
    },
};

window.NYAN_VERSION = VersionManager.version;
window.VersionManager = VersionManager;
