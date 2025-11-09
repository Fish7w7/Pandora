// ============================================
// 📶 ZONA OFFLINE - NyanTools にゃん~
// Versão Otimizada v2.0
// ============================================

const OfflineZone = {
    currentGame: null,
    
    // Configuração dos jogos
    games: {
        tictactoe: {
            name: 'Jogo da Velha',
            icon: '❌⭕',
            desc: '2 Jogadores ou vs Mayara 🤖',
            gradient: 'from-blue-500 to-cyan-600',
            shadow: 'hover:shadow-blue-500/50'
        },
        snake: {
            name: 'Jogo da Cobrinha',
            icon: '🐍',
            desc: 'Clássico jogo arcade',
            gradient: 'from-green-500 to-emerald-600',
            shadow: 'hover:shadow-green-500/50'
        },
        termo: {
            name: 'Termo',
            icon: '📤',
            desc: 'Wordle em português • Nova palavra a cada 24h',
            gradient: 'from-yellow-400 to-orange-500',
            shadow: 'hover:shadow-yellow-500/50'
        },
        forca: {
            name: 'Forca',
            icon: '🎯',
            desc: 'Adivinhe a palavra • Nova palavra a cada 24h',
            gradient: 'from-indigo-500 to-blue-600',
            shadow: 'hover:shadow-indigo-500/50'
        },
        flappy: {
            name: 'Flappy Bird',
            icon: '🦅',
            desc: 'O jogo mais viciante de todos!',
            gradient: 'from-orange-400 to-red-500',
            shadow: 'hover:shadow-orange-500/50'
        },
        memory: {
            name: 'Memória',
            icon: '🧠',
            desc: 'Encontre os pares',
            gradient: 'from-purple-500 to-pink-600',
            shadow: '',
            comingSoon: true
        }
    },
    
    // ============================================
    // RENDER PRINCIPAL
    // ============================================
    
    render() {
        if (this.currentGame) {
            return this.renderGame();
        }
        
        return `
            <div class="max-w-6xl mx-auto">
                ${this.renderHeader()}
                ${this.renderGamesGrid()}
                ${this.renderInfoBox()}
            </div>
        `;
    },
    
    renderHeader() {
        const isOnline = App?.isOnline ?? true;
        const statusColor = isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
        const statusDot = isOnline ? 'bg-green-500' : 'bg-red-500';
        const statusText = isOnline ? '🟢 Online' : '🔴 Offline - Aproveite os jogos!';
        
        return `
            <div class="text-center mb-8">
                <h1 class="text-5xl font-black text-gray-800 mb-3">📶 Zona Offline</h1>
                <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusColor}">
                    <div class="w-3 h-3 rounded-full ${statusDot} animate-pulse"></div>
                    <span class="font-semibold">${statusText}</span>
                </div>
            </div>
        `;
    },
    
    renderGamesGrid() {
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${Object.entries(this.games).map(([id, game]) => 
                    this.renderGameCard(id, game)
                ).join('')}
            </div>
        `;
    },
    
    renderGameCard(id, game) {
        if (game.comingSoon) {
            return this.renderComingSoonCard(game);
        }
        
        return `
            <div class="group bg-gradient-to-br ${game.gradient} rounded-2xl p-6 text-white shadow-xl ${game.shadow} hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
                 onclick="OfflineZone.startGame('${id}')">
                <div class="text-6xl mb-4 group-hover:scale-110 transition-transform">${game.icon}</div>
                <h3 class="text-2xl font-bold mb-2">${game.name}</h3>
                <p class="text-white/90 mb-4 text-sm">${game.desc}</p>
                <button class="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                    <span>▶️</span>
                    <span>Jogar</span>
                </button>
            </div>
        `;
    },
    
    renderComingSoonCard(game) {
        return `
            <div class="bg-gradient-to-br ${game.gradient} rounded-2xl p-6 text-white shadow-xl opacity-60 cursor-not-allowed">
                <div class="text-6xl mb-4">${game.icon}</div>
                <h3 class="text-2xl font-bold mb-2">${game.name}</h3>
                <p class="text-white/90 mb-4 text-sm">${game.desc}</p>
                <button class="w-full bg-white/20 py-3 rounded-xl font-bold flex items-center justify-center gap-2" disabled>
                    <span>🚧</span>
                    <span>Em Breve</span>
                </button>
            </div>
        `;
    },
    
    renderInfoBox() {
        return `
            <div class="mt-8 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                <div class="flex items-start gap-4">
                    <div class="text-4xl">💡</div>
                    <div>
                        <h3 class="text-xl font-bold text-blue-900 mb-2">Jogos Offline</h3>
                        <p class="text-blue-800">
                            Todos os jogos funcionam sem conexão à internet! Perfeito para quando você está sem wifi ou dados móveis.
                        </p>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderGame() {
        const game = this.games[this.currentGame];
        if (!game) return '';
        
        return `
            <div class="max-w-4xl mx-auto">
                ${this.renderGameHeader(game)}
                ${this.renderGameContent()}
            </div>
        `;
    },
    
    renderGameHeader(game) {
        return `
            <div class="flex items-center justify-between mb-6">
                <h1 class="text-4xl font-black text-gray-800">${game.icon} ${game.name}</h1>
                <button onclick="OfflineZone.backToMenu()" 
                        class="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-bold transition-all flex items-center gap-2">
                    <span>⬅️</span>
                    <span>Voltar</span>
                </button>
            </div>
        `;
    },
    
    renderGameContent() {
        const renderers = {
            tictactoe: () => TicTacToe?.render() || this.renderLoading('Jogo da Velha'),
            snake: () => MiniGame?.render() || this.renderLoading('Cobrinha'),
            termo: () => Termo?.render() || this.renderLoading('Termo'),
            forca: () => Forca?.render() || this.renderLoading('Forca'),
            flappy: () => FlappyBird?.render() || this.renderLoading('Flappy Bird')
        };
        
        const renderer = renderers[this.currentGame];
        return renderer ? renderer() : '';
    },
    
    renderLoading(gameName) {
        return `<p class="text-center text-gray-600">Carregando ${gameName}...</p>`;
    },
    
    // ============================================
    // CONTROLE DE JOGOS
    // ============================================
    
    init() {
        // Não faz nada - método de compatibilidade
    },
    
    startGame(game) {
        this.currentGame = game;
        
        // Inicializar jogo específico
        this.initializeGame(game);
        
        Router?.render();
        
        // Post-render initialization
        if (game === 'snake') {
            setTimeout(() => MiniGame?.init(), 100);
        } else if (game === 'flappy') {
            setTimeout(() => FlappyBird?.init(), 100);
        }
    },
    
    initializeGame(game) {
        const initializers = {
            tictactoe: () => {
                if (TicTacToe) {
                    TicTacToe.gameMode = null;
                    TicTacToe.resetGame();
                    TicTacToe.resetScores();
                }
            },
            snake: () => {
                MiniGame?.resetGame();
            },
            termo: () => {
                if (Termo) {
                    Termo.isReady = false;
                    Router?.render();
                    setTimeout(() => Termo.init(), 100);
                }
            },
            forca: () => {
                if (Forca) {
                    Forca.isReady = false;
                    Router?.render();
                    setTimeout(() => Forca.init(), 100);
                }
            },
            flappy: () => {
                // Inicializado no post-render
            }
        };
        
        const initializer = initializers[game];
        if (initializer) initializer();
    },
    
    backToMenu() {
        this.currentGame = null;
        Router?.render();
    }
};

window.OfflineZone = OfflineZone;