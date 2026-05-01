const Router = {
    currentRoute: 'home',

    routes: {
        'home':          null,
        'password':      'PasswordGenerator',
        'weather':       'Weather',
        'translator':    'Translator',
        'ai-assistant':  'AIAssistant',
        'mini-game':     'MiniGame',
        'temp-email':    'TempEmail',
        'music':         'MusicPlayer',
        'offline':       'OfflineZone',
        'settings':      'Settings',
        'updates':       'AutoUpdater',
        'notes':         'Notes',
        'tasks':         'Tasks',
        'missions':      'Missions',
        'season':        'Seasons',
        'events':        'Events',
        'shop':          'Shop',
        'dev-lab':       'DevLab',
        'squads':        'SquadsUI',
        'profile':       'Profile',
        'friends':       'Friends',
        'profile-public':'Friends',
        'chat':          'Chat',
        'leaderboard':   'Leaderboard',
        'feed':          'Feed',
        'challenges':    'Challenges',
    },

    _history: ['home'],
    _historyIdx: 0,

    _emitRouteChanged(to, from) {
        window.dispatchEvent(new CustomEvent('nyan:route-changed', {
            detail: { from, to, at: Date.now() },
        }));
    },

    navigate(toolId) {
        if (toolId === 'dev-lab' && !window.DevSecurity?.canShowTool?.()) {
            const snap = window.DevSecurity?.snapshot?.() || {};
            const msg = snap.isDevEnv
                ? 'Acesso dev indisponivel para esta conta.'
                : 'Dev Lab disponivel apenas em ambiente developer.';
            Utils.showNotification?.(msg, 'error');
            return;
        }
        if (toolId === this.currentRoute) return;
        const previousRoute = this.currentRoute;
        this.currentRoute = toolId;
        if (toolId !== 'home') {
            Utils.saveData('last_tool_route', toolId);
            Utils.saveData('last_tool_route_at', Date.now());
        }
        App.updateActiveNav(toolId);

        if (window.Dashboard && toolId !== 'home') Dashboard.trackToolAccess(toolId);
        if (window.Integrations?.trackToolUsage) {
            Integrations.trackToolUsage(toolId);
        } else if (window.Missions) {
            Missions.track({ event: 'open_tool', tool: toolId });
        } else if (window.NyanLiveOps?.track) {
            NyanLiveOps.track({ event: 'open_tool', tool: toolId, key: `open:${toolId}:${Date.now()}` });
        }
        if (window.Achievements?.checkNightOwl) Achievements.checkNightOwl();

        if (this._historyIdx < this._history.length - 1) {
            this._history = this._history.slice(0, this._historyIdx + 1);
        }
        this._history.push(toolId);
        this._historyIdx = this._history.length - 1;
        this.render();
        this._emitRouteChanged(toolId, previousRoute);
    },

    back() {
        if (this._historyIdx <= 0) return;
        const previousRoute = this.currentRoute;
        this._historyIdx--;
        this.currentRoute = this._history[this._historyIdx];
        App.updateActiveNav(this.currentRoute);
        this.render();
        this._emitRouteChanged(this.currentRoute, previousRoute);
    },

    forward() {
        if (this._historyIdx >= this._history.length - 1) return;
        const previousRoute = this.currentRoute;
        this._historyIdx++;
        this.currentRoute = this._history[this._historyIdx];
        App.updateActiveNav(this.currentRoute);
        this.render();
        this._emitRouteChanged(this.currentRoute, previousRoute);
    },

    canGoBack()    { return this._historyIdx > 0; },
    canGoForward() { return this._historyIdx < this._history.length - 1; },

    render() {
        const container = document.getElementById('tool-container');
        if (!container || !App.user) return;

        this._beforeRenderRoute();

        const navEffect = window.Inventory?.getNavEffect?.();
        if (navEffect) this._applyNavEffect(container, navEffect);

        container.innerHTML = '';

        if (this.currentRoute === 'home') {
            if (window.Dashboard) {
                container.innerHTML = window.Dashboard.render();
                window.Dashboard._refreshSuggestionsWidget?.();
                if (window.Dashboard.init) {
                    const schedule = window.NyanLifecycle?.setTimeout?.bind(window.NyanLifecycle) || ((_, fn, delay) => setTimeout(fn, delay));
                    schedule('route:home', () => {
                        const cleanup = window.Dashboard.init();
                        if (typeof cleanup === 'function') {
                            window.NyanLifecycle?.trackCleanup?.('route:home', cleanup);
                        }
                    }, 100);
                }
            } else {
                container.innerHTML = this.renderHome();
            }
            return;
        }

        const toolName = this.routes[this.currentRoute];
        if (toolName && window[toolName]) {
            const tool = window[toolName];
            container.innerHTML = tool.render();
            if (tool.init) {
                const cleanup = tool.init();
                if (typeof cleanup === 'function') {
                    window.NyanLifecycle?.trackCleanup?.(`route:${this.currentRoute}`, cleanup);
                }
            }
        } else {
            container.innerHTML = this.renderNotFound();
        }
        this.attachMiniPlayer(container);
    },

    _beforeRenderRoute() {
        if (this._mountedRoute) {
            const previousRoute = this._mountedRoute;
            const previousToolName = this.routes[previousRoute];
            const previousTool = previousToolName ? window[previousToolName] : null;
            window.NyanLifecycle?.cleanupScope?.(`route:${previousRoute}`);
            try {
                previousTool?.cleanup?.({
                    full: false,
                    route: previousRoute,
                    nextRoute: this.currentRoute,
                });
            } catch (err) {
                console.warn('[Router] cleanup falhou:', err);
            }
        }
        window.NyanLifecycle?.enterRoute?.(this.currentRoute);
        this._mountedRoute = this.currentRoute;
    },

    attachMiniPlayer(container) {
        if (this.currentRoute !== 'music' && window.MusicPlayer?.isPlaying && window.MusicPlayer?.currentSong) {
            const route = this.currentRoute;
            const schedule = window.NyanLifecycle?.setTimeout?.bind(window.NyanLifecycle) || ((_, fn, delay) => setTimeout(fn, delay));
            schedule(`route:${route}`, () => {
                if (this.currentRoute !== route) return;
                document.getElementById('mini-player')?.remove();
                if (window.MusicPlayer.renderMiniPlayer) {
                    container.insertAdjacentHTML('beforeend', window.MusicPlayer.renderMiniPlayer());
                }
            }, 100);
        }
    },

    renderHome() {
        const tools = (App.getVisibleTools ? App.getVisibleTools() : App.tools).filter(t => t.id !== 'home');
        const username = App.user?.username || 'Usuário';
        return `
            <div class="max-w-6xl mx-auto">
                <div class="mb-8">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="text-7xl animate-bounce-slow">🐱</div>
                        <div>
                            <h1 class="text-4xl font-bold text-gray-800 mb-2">にゃん~ Bem-vindo ao NyanTools!</h1>
                            <p class="text-gray-600">Olá, <strong>${username}</strong>! Escolha uma ferramenta abaixo para começar.</p>
                        </div>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${tools.map(tool => this.renderToolCard(tool)).join('')}
                </div>
                ${this.renderTipCard()}
            </div>`;
    },

    renderToolCard(tool) {
        return `
            <div class="tool-card bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transform hover:scale-105 transition-all"
                 onclick="Router.navigate('${tool.id}')">
                <div class="text-5xl mb-4">${tool.icon}</div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">${tool.name}</h3>
                <p class="text-gray-600 text-sm">${tool.description}</p>
            </div>`;
    },

    renderTipCard() {
        return `
            <div class="mt-12 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-xl p-6 text-white shadow-2xl">
                <div class="flex items-start gap-4">
                    <div class="text-5xl">💡</div>
                    <div>
                        <h3 class="text-2xl font-bold mb-2">💡 Dica do Dia にゃん~</h3>
                        <p>Use o <strong>Gerador de Senhas</strong> para criar senhas seguras e únicas para cada site! 🔐✨</p>
                        <p class="mt-2 text-sm text-purple-100">🎵 <strong>Música em background!</strong> Inicie uma música e continue navegando nas outras abas!</p>
                        <p class="mt-2 text-sm text-purple-100">⌨️ <strong>Atalhos de teclado!</strong> Pressione Ctrl+/ para ver todos os comandos!</p>
                    </div>
                </div>
            </div>`;
    },

    renderNotFound() {
        return `
            <div class="text-center py-20">
                <div class="text-8xl mb-4">🐱❓</div>
                <h2 class="text-3xl font-bold text-gray-800 mb-2">Página não encontrada にゃん~</h2>
                <p class="text-gray-600 mb-6">A ferramenta que você procura não existe.</p>
                <button onclick="Router.navigate('home')" class="btn-primary">🏠 Voltar ao Início</button>
            </div>`;
    },

    _applyNavEffect(container, effectId) {
        const effects = {
            effect_slide: () => {
                container.style.transition = 'none';
                container.style.transform  = 'translateX(32px)';
                container.style.opacity    = '0';
                requestAnimationFrame(() => {
                    container.style.transition = 'transform 0.28s cubic-bezier(0.34,1.2,0.64,1), opacity 0.2s ease';
                    container.style.transform  = 'translateX(0)';
                    container.style.opacity    = '1';
                });
            },
            effect_zoom: () => {
                container.style.transition = 'none';
                container.style.transform  = 'scale(0.94)';
                container.style.opacity    = '0';
                requestAnimationFrame(() => {
                    container.style.transition = 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease';
                    container.style.transform  = 'scale(1)';
                    container.style.opacity    = '1';
                });
            },
            effect_flip: () => {
                container.style.transition      = 'none';
                container.style.transformOrigin = 'center center';
                container.style.transform       = 'perspective(900px) rotateY(-28deg) scale(0.94)';
                container.style.opacity         = '0';
                requestAnimationFrame(() => {
                    container.style.transition = 'transform 0.38s cubic-bezier(0.34,1.2,0.64,1), opacity 0.25s ease';
                    container.style.transform  = 'perspective(900px) rotateY(0deg) scale(1)';
                    container.style.opacity    = '1';
                });
            },
            effect_bundle_nebula_311: () => {
                container.style.transition      = 'none';
                container.style.transformOrigin = 'center center';
                container.style.transform       = 'perspective(1000px) translateY(12px) scale(0.96) rotateX(10deg)';
                container.style.opacity         = '0';
                container.style.filter          = 'blur(5px) saturate(1.2)';
                requestAnimationFrame(() => {
                    container.style.transition = 'transform 0.42s cubic-bezier(0.34,1.2,0.64,1), opacity 0.26s ease, filter 0.42s ease';
                    container.style.transform  = 'perspective(1000px) translateY(0) scale(1) rotateX(0deg)';
                    container.style.opacity    = '1';
                    container.style.filter     = 'blur(0) saturate(1)';
                });
            },
        };
        const applyDefault = () => {
            container.style.transition = 'none';
            container.style.opacity    = '0';
            requestAnimationFrame(() => {
                container.style.transition = 'opacity 0.18s ease';
                container.style.opacity    = '1';
            });
        };
        (effects[effectId] || applyDefault)();
    },

    init() {
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'ArrowLeft')  { e.preventDefault(); this.back(); }
            if (e.altKey && e.key === 'ArrowRight') { e.preventDefault(); this.forward(); }
        });
    }
};

window.Router = Router;
