
(function patchAppV310() {

    const tryInit = () => {
        if (!window.App || !window.Utils || !window.Router) {
            setTimeout(tryInit, 300);
            return;
        }

        if (App.__nyanWorldsPatched) return;
        App.__nyanWorldsPatched = true;

        const origInit = App.initNewSystems?.bind(App);

        App.initNewSystems = function () {
            if (origInit) origInit();
            _initNyanWorldsSystems();
        };

        const mainApp = document.getElementById('main-app');
        if (mainApp && mainApp.classList.contains('visible')) {
            _initNyanWorldsSystems();
        }

    };

    function _initNyanWorldsSystems() {
        safeInit('StateManager', 50);
        safeInit('Presence', 100);
        safeInit('Integrations', 200);
        safeInit('ProfileV2', 300);
        safeInit('V310Rewards', 340);

        fixProfileTabs();
    }

    function safeInit(name, delay) {
        setTimeout(() => {
            try {
                const mod = window[name];
                if (mod && typeof mod.init === 'function') {
                    mod.init();
                }
            } catch (err) {
                console.warn(`[NyanWorlds] erro ao iniciar ${name}`, err);
            }
        }, delay);
    }

    function fixProfileTabs() {
        if (!window.Profile) return;

        if (typeof Profile.renderTabs !== 'function') {
            Profile.renderTabs = function () {
                const tabs = [
                    { id: 'profile', label: 'Perfil' },
                    { id: 'stats', label: 'Estatisticas' },
                ];

                return `<div class="profile-tabs" style="margin-bottom:1.25rem;">
                    ${tabs.map(t => `
                        <button class="profile-tab ${Profile._tab === t.id ? 'active' : ''}"
                            onclick="Profile._setTab('${t.id}')">
                            ${t.label}
                        </button>`).join('')}
                </div>`;
            };

        }

        if (typeof Profile._renderTabs !== 'function') {
            Profile._renderTabs = function () {
                return Profile.renderTabs();
            };
        }

        Profile.__nyanPatched = true;
    }

    function _injectSuggestionsInHome() {
        try {
            if (!window.Integrations) return;

            if (document.getElementById('nyan-smart-suggestions')) return;

            const toolContainer = document.getElementById('tool-container');
            if (!toolContainer) return;

            if (typeof Integrations.renderSuggestionsWidget !== 'function') return;

            const html = Integrations.renderSuggestionsWidget();
            if (!html) return;

            const wrapper = document.createElement('div');
            wrapper.id = 'nyan-smart-suggestions';
            wrapper.innerHTML = html;

            toolContainer.insertBefore(wrapper, toolContainer.firstChild);
        } catch (err) {
            console.warn('[NyanWorlds] erro ao injetar sugestoes', err);
        }
    }

    const patchRouterForHome = () => {
        if (!window.Router) {
            setTimeout(patchRouterForHome, 400);
            return;
        }

        if (Router.__nyanPatched) return;
        Router.__nyanPatched = true;

        const origRender = Router.render?.bind(Router);

        Router.render = function () {
            try {
                if (origRender) origRender();
            } catch (err) {
                console.error('[Router] erro no render original', err);

                const container = document.getElementById('tool-container');
                if (container) {
                    container.innerHTML = `
                        <div style="padding:20px;">
                            Erro ao renderizar tela
                        </div>
                    `;
                }
            }

            if (Router.currentRoute === 'home') {
                _injectSuggestionsInHome();
            }
        };
    };

    patchRouterForHome();
    setTimeout(tryInit, 100);

})();
