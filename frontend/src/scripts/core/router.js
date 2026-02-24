/* 
   ROUTER.JS v3.0.0
   Sistema de Roteamento com Dashboard e 2048
 */

const Router = {
    currentRoute: 'home',
    
    // Mapa de rotas (otimizado - com Dashboard e 2048)
    routes: {
        'home': null, // Home é especial (Dashboard)
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
        'tasks': 'Tasks'
    },
    
    // Navegação otimizada
    navigate(toolId) {
        this.currentRoute = toolId;
        App.updateActiveNav(toolId);
        
        if (window.Dashboard && toolId !== 'home') {
            Dashboard.trackToolAccess(toolId);
        }
        
        this.render();
    },
    
    // Renderização otimizada
    render() {
        const container = document.getElementById('tool-container');
        if (!container) return;
        
        // Guard: não renderizar nada se não houver usuário autenticado
        if (!App.user) {
            console.warn('⚠️ Router.render() chamado sem usuário autenticado. Abortando.');
            return;
        }
        
        container.innerHTML = '';
        container.classList.add('fade-in');
        
        if (this.currentRoute === 'home') {
            if (window.Dashboard) {
                container.innerHTML = window.Dashboard.render();
                if (window.Dashboard.init) {
                    setTimeout(() => window.Dashboard.init(), 100);
                }
            } else {
                container.innerHTML = this.renderHome();
            }
            return;
        }
        
        // Outras rotas (usando mapa)
        const toolName = this.routes[this.currentRoute];
        
        if (toolName && window[toolName]) {
            const tool = window[toolName];
            container.innerHTML = tool.render();
            if (tool.init) tool.init();
        } else {
            container.innerHTML = this.renderNotFound();
        }
        
        // Mini player (se não estiver na aba de música)
        this.attachMiniPlayer(container);
    },
    
    // Anexar mini player (otimizado)
    attachMiniPlayer(container) {
        if (this.currentRoute !== 'music' && 
            window.MusicPlayer?.isPlaying && 
            window.MusicPlayer?.currentSong) {
            
            setTimeout(() => {
                // Remover mini player antigo
                document.getElementById('mini-player')?.remove();
                
                // Adicionar novo
                if (window.MusicPlayer.renderMiniPlayer) {
                    container.insertAdjacentHTML('beforeend', window.MusicPlayer.renderMiniPlayer());
                }
            }, 100);
        }
    },
    
    // Renderizar Home (fallback se Dashboard não existir)
    renderHome() {
        const tools = App.tools.filter(t => t.id !== 'home');
        const username = App.user?.username || 'Usuário';
        
        return `
            <div class="max-w-6xl mx-auto">
                <!-- Header -->
                <div class="mb-8">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="text-7xl animate-bounce-slow">🐱</div>
                        <div>
                            <h1 class="text-4xl font-bold text-gray-800 mb-2">にゃん~ Bem-vindo ao NyanTools!</h1>
                            <p class="text-gray-600">Olá, <strong>${username}</strong>! Escolha uma ferramenta abaixo para começar.</p>
                        </div>
                    </div>
                </div>
                
                <!-- Grid de Tools -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${tools.map(tool => this.renderToolCard(tool)).join('')}
                </div>
                
                <!-- Dica do Dia -->
                ${this.renderTipCard()}
            </div>
        `;
    },
    
    // Renderizar card de tool
    renderToolCard(tool) {
        return `
            <div class="tool-card bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transform hover:scale-105 transition-all"
                 onclick="Router.navigate('${tool.id}')">
                <div class="text-5xl mb-4">${tool.icon}</div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">${tool.name}</h3>
                <p class="text-gray-600 text-sm">${tool.description}</p>
            </div>
        `;
    },
    
    // Card de dica
    renderTipCard() {
        return `
            <div class="mt-12 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-xl p-6 text-white shadow-2xl">
                <div class="flex items-start gap-4">
                    <div class="text-5xl">💡</div>
                    <div>
                        <h3 class="text-2xl font-bold mb-2">💡 Dica do Dia にゃん~</h3>
                        <p>Use o <strong>Gerador de Senhas</strong> para criar senhas seguras e únicas para cada site! 🔐✨</p>
                        <p class="mt-2 text-sm text-purple-100">Novo na v3.0.2: Jogue <strong>2048</strong> na Zona Offline! 🎮</p>
                        <p class="mt-2 text-sm text-purple-100">🎵 <strong>Música em background!</strong> Inicie uma música e continue navegando nas outras abas!</p>
                        <p class="mt-2 text-sm text-purple-100">⌨️ <strong>Atalhos de teclado!</strong> Pressione Ctrl+/ para ver todos os comandos!</p>
                    </div>
                </div>
            </div>
        `;
    },
    
    // 404
    renderNotFound() {
        return `
            <div class="text-center py-20">
                <div class="text-8xl mb-4">🐱❓</div>
                <h2 class="text-3xl font-bold text-gray-800 mb-2">Página não encontrada にゃん~</h2>
                <p class="text-gray-600 mb-6">A ferramenta que você procura não existe.</p>
                <button onclick="Router.navigate('home')" class="btn-primary">
                    🏠 Voltar ao Início
                </button>
            </div>
        `;
    }
};

window.Router = Router;