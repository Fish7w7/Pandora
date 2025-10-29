// Zona Offline - VERSÃO ATUALIZADA COM IA
const OfflineZone = {
    currentGame: null,
    
    render() {
        if (this.currentGame === 'tictactoe') {
            return this.renderTicTacToe();
        }
        if (this.currentGame === 'snake') {
            return this.renderSnake();
        }
        if (this.currentGame === 'termo') {
            return this.renderTermo();
        }
        if (this.currentGame === 'forca') {
            return this.renderForca();
        }
        
        return `
            <div class="max-w-6xl mx-auto">
                <!-- Header -->
                <div class="text-center mb-8">
                    <h1 class="text-5xl font-black text-gray-800 mb-3">📶 Zona Offline</h1>
                    <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full ${App.isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                        <div class="w-3 h-3 rounded-full ${App.isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse"></div>
                        <span class="font-semibold">${App.isOnline ? '🟢 Online' : '🔴 Offline - Aproveite os jogos!'}</span>
                    </div>
                </div>
                
                <!-- Games Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Jogo da Velha -->
                    <div class="group bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
                         onclick="OfflineZone.startGame('tictactoe')">
                        <div class="text-6xl mb-4 group-hover:scale-110 transition-transform">⭕❌</div>
                        <h3 class="text-2xl font-bold mb-2">Jogo da Velha</h3>
                        <p class="text-blue-100 mb-4">2 Jogadores ou vs Mayara 🤖</p>
                        <button class="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                            <span>▶️</span>
                            <span>Jogar</span>
                        </button>
                    </div>
                    
                    <!-- Jogo da Cobrinha -->
                    <div class="group bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
                         onclick="OfflineZone.startGame('snake')">
                        <div class="text-6xl mb-4 group-hover:scale-110 transition-transform">🐍</div>
                        <h3 class="text-2xl font-bold mb-2">Jogo da Cobrinha</h3>
                        <p class="text-green-100 mb-4">Clássico jogo arcade</p>
                        <button class="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                            <span>▶️</span>
                            <span>Jogar</span>
                        </button>
                    </div>
                    
                    <!-- Termo -->
                    <div class="group bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
                         onclick="OfflineZone.startGame('termo')">
                        <div class="text-6xl mb-4 group-hover:scale-110 transition-transform">🔤</div>
                        <h3 class="text-2xl font-bold mb-2">Termo</h3>
                        <p class="text-yellow-100 mb-4">Wordle em português • Nova palavra a cada 24h</p>
                        <button class="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                            <span>▶️</span>
                            <span>Jogar</span>
                        </button>
                    </div>
                    
                    <!-- Forca -->
                    <div class="group bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
                         onclick="OfflineZone.startGame('forca')">
                        <div class="text-6xl mb-4 group-hover:scale-110 transition-transform">🎯</div>
                        <h3 class="text-2xl font-bold mb-2">Forca</h3>
                        <p class="text-indigo-100 mb-4">Adivinhe a palavra • Nova palavra a cada 24h</p>
                        <button class="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                            <span>▶️</span>
                            <span>Jogar</span>
                        </button>
                    </div>
                    
                    <!-- Quiz (Em Breve) -->
                    <div class="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl opacity-60 cursor-not-allowed">
                        <div class="text-6xl mb-4">❓</div>
                        <h3 class="text-2xl font-bold mb-2">Quiz</h3>
                        <p class="text-purple-100 mb-4">Teste seus conhecimentos</p>
                        <button class="w-full bg-white/20 py-3 rounded-xl font-bold flex items-center justify-center gap-2" disabled>
                            <span>🚧</span>
                            <span>Em Breve</span>
                        </button>
                    </div>
                    
                    <!-- Jogo da Memória (Em Breve) -->
                    <div class="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6 text-white shadow-xl opacity-60 cursor-not-allowed">
                        <div class="text-6xl mb-4">🧠</div>
                        <h3 class="text-2xl font-bold mb-2">Memória</h3>
                        <p class="text-red-100 mb-4">Encontre os pares</p>
                        <button class="w-full bg-white/20 py-3 rounded-xl font-bold flex items-center justify-center gap-2" disabled>
                            <span>🚧</span>
                            <span>Em Breve</span>
                        </button>
                    </div>
                </div>
                
                <!-- Info Box -->
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
            </div>
        `;
    },
    
    init() {},
    
    startGame(game) {
        this.currentGame = game;
        
        if (game === 'tictactoe') {
            // ✨ NOVO: Reset completo do jogo da velha
            TicTacToe.gameMode = null;
            TicTacToe.resetGame();
            TicTacToe.resetScores();
        }
        
        if (game === 'snake') {
            MiniGame.resetGame();
        }
        
        if (game === 'termo') {
            if (typeof Termo !== 'undefined') {
                Termo.isReady = false;
                Router.render();
                setTimeout(() => Termo.init(), 100);
                return;
            }
        }
        
        if (game === 'forca') {
            if (typeof Forca !== 'undefined') {
                Forca.isReady = false;
                Router.render();
                setTimeout(() => Forca.init(), 100);
                return;
            }
        }
        
        Router.render();
        
        if (game === 'snake') {
            setTimeout(() => {
                MiniGame.init();
            }, 100);
        }
    },
    
    renderTicTacToe() {
        return `
            <div class="max-w-4xl mx-auto">
                <div class="flex items-center justify-between mb-6">
                    <h1 class="text-4xl font-black text-gray-800">⭕❌ Jogo da Velha</h1>
                    <button onclick="OfflineZone.backToMenu()" 
                            class="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-bold transition-all flex items-center gap-2">
                        <span>⬅️</span>
                        <span>Voltar</span>
                    </button>
                </div>
                ${TicTacToe.render()}
            </div>
        `;
    },
    
    renderSnake() {
        return `
            <div class="max-w-3xl mx-auto">
                <div class="flex items-center justify-between mb-6">
                    <h1 class="text-4xl font-black text-gray-800">🐍 Jogo da Cobrinha</h1>
                    <button onclick="OfflineZone.backToMenu()" 
                            class="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-bold transition-all flex items-center gap-2">
                        <span>⬅️</span>
                        <span>Voltar</span>
                    </button>
                </div>
                ${MiniGame.render()}
            </div>
        `;
    },
    
    renderTermo() {
        return `
            <div class="max-w-3xl mx-auto">
                <div class="flex items-center justify-between mb-6">
                    <h1 class="text-4xl font-black text-gray-800">🔤 Termo</h1>
                    <button onclick="OfflineZone.backToMenu()" 
                            class="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-bold transition-all flex items-center gap-2">
                        <span>⬅️</span>
                        <span>Voltar</span>
                    </button>
                </div>
                ${typeof Termo !== 'undefined' ? Termo.render() : '<p class="text-center text-gray-600">Carregando Termo...</p>'}
            </div>
        `;
    },
    
    renderForca() {
        return `
            <div class="max-w-3xl mx-auto">
                <div class="flex items-center justify-between mb-6">
                    <h1 class="text-4xl font-black text-gray-800">🎯 Forca</h1>
                    <button onclick="OfflineZone.backToMenu()" 
                            class="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-bold transition-all flex items-center gap-2">
                        <span>⬅️</span>
                        <span>Voltar</span>
                    </button>
                </div>
                ${typeof Forca !== 'undefined' ? Forca.render() : '<p class="text-center text-gray-600">Carregando Forca...</p>'}
            </div>
        `;
    },
    
    backToMenu() {
        this.currentGame = null;
        Router.render();
    }
};

window.OfflineZone = OfflineZone;