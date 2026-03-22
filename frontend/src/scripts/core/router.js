/* ═════════════════════════════════════════════
   ROUTER.JS v3.1.1
   FIX: efeito Flip corrigido
 ═══════════════════════════════════════════════*/

const Router = {
    currentRoute: 'home',

    routes: {
        'home': null,
        'password': 'PasswordGenerator',
        'weather': 'Weather',
        'translator': 'Translator',
        'ai-assistant': 'AIAssistant',
        'mini-game': 'MiniGame',
        'temp-email': 'TempEmail',
        'music': 'MusicPlayer',
        'offline': 'OfflineZone',
        'settings': 'Settings',
        'updates': 'AutoUpdater',
        'notes': 'Notes',
        'tasks': 'Tasks',
        'missions': 'Missions',
        'shop':     'Shop',
        'profile': 'Profile'
    },

    _history: ['home'],
    _historyIdx: 0,

    navigate(toolId) {
        if (toolId === this.currentRoute) return;
        this.currentRoute = toolId;
        App.updateActiveNav(toolId);

        if (window.Dashboard && toolId !== 'home') {
            Dashboard.trackToolAccess(toolId);
        }

        if (window.Missions) {
            Missions.track({ event: 'open_tool', tool: toolId });
        }

        if (this._historyIdx < this._history.length - 1) {
            this._history = this._history.slice(0, this._historyIdx + 1);
        }
        this._history.push(toolId);
        this._historyIdx = this._history.length - 1;

        this.render();
    },

    back() {
        if (this._historyIdx <= 0) return;
        this._historyIdx--;
        this.currentRoute = this._history[this._historyIdx];
        App.updateActiveNav(this.currentRoute);
        this.render();
    },

    forward() {
        if (this._historyIdx >= this._history.length - 1) return;
        this._historyIdx++;
        this.currentRoute = this._history[this._historyIdx];
        App.updateActiveNav(this.currentRoute);
        this.render();
    },

    canGoBack()    { return this._historyIdx > 0; },
    canGoForward() { return this._historyIdx < this._history.length - 1; },

    render() {
        const container = document.getElementById('tool-container');
        if (!container) return;
        if (!App.user) {
            console.warn('⚠️ Router.render() chamado sem usuário autenticado. Abortando.');
            return;
        }

        const navEffect = window.Inventory?.getNavEffect?.();
        if (navEffect) {
            this._applyNavEffect(container, navEffect);
        }

        container.innerHTML = '';

        if (this.currentRoute === 'home') {
            if (window.Dashboard) {
                container.innerHTML = window.Dashboard.render();
                if (window.Dashboard.init) setTimeout(() => window.Dashboard.init(), 100);
            } else {
                container.innerHTML = this.renderHome();
            }
            return;
        }

        const toolName = this.routes[this.currentRoute];
        if (toolName && window[toolName]) {
            const tool = window[toolName];
            container.innerHTML = tool.render();
            if (tool.init) tool.init();
        } else {
            container.innerHTML = this.renderNotFound();
        }
        this.attachMiniPlayer(container);
    },

    attachMiniPlayer(container) {
        if (this.currentRoute !== 'music' &&
            window.MusicPlayer?.isPlaying &&
            window.MusicPlayer?.currentSong) {
            setTimeout(() => {
                document.getElementById('mini-player')?.remove();
                if (window.MusicPlayer.renderMiniPlayer) {
                    container.insertAdjacentHTML('beforeend', window.MusicPlayer.renderMiniPlayer());
                }
            }, 100);
        }
    },

    renderHome() {
        const tools    = App.tools.filter(t => t.id !== 'home');
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

    // FIX: efeito Flip agora faz rotação lateral real (perspectiva 3D)
    // FIX: Zoom e Slide são distintos
    _applyNavEffect(container, effectId) {
        const effects = {
            effect_slide: () => {
                container.style.transition   = 'none';
                container.style.transform    = 'translateX(32px)';
                container.style.opacity      = '0';
                requestAnimationFrame(() => {
                    container.style.transition = 'transform 0.28s cubic-bezier(0.34,1.2,0.64,1), opacity 0.2s ease';
                    container.style.transform  = 'translateX(0)';
                    container.style.opacity    = '1';
                });
            },
            effect_zoom: () => {
                container.style.transition   = 'none';
                container.style.transform    = 'scale(0.94)';
                container.style.opacity      = '0';
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
        console.log('🧭 Router v3.1.1 inicializado');
    }
};

window.Router = Router;