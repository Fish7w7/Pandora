// Zona Offline - VERSÃO ESTILIZADA
const OfflineZone = {
    currentGame: null,
    ticTacToeBoard: Array(9).fill(null),
    ticTacToePlayer: 'X',
    
    render() {
        if (this.currentGame === 'tictactoe') {
            return this.renderTicTacToe();
        }
        if (this.currentGame === 'snake') {
            return this.renderSnake();
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
                        <p class="text-blue-100 mb-4">Jogo clássico para 2 jogadores</p>
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
                    
                    <!-- Termo (Em Breve) -->
                    <div class="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-xl opacity-60 cursor-not-allowed">
                        <div class="text-6xl mb-4">🔤</div>
                        <h3 class="text-2xl font-bold mb-2">Termo</h3>
                        <p class="text-yellow-100 mb-4">Wordle em português</p>
                        <button class="w-full bg-white/20 py-3 rounded-xl font-bold flex items-center justify-center gap-2" disabled>
                            <span>🚧</span>
                            <span>Em Breve</span>
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
                    
                    <!-- Forca (Em Breve) -->
                    <div class="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl opacity-60 cursor-not-allowed">
                        <div class="text-6xl mb-4">🎯</div>
                        <h3 class="text-2xl font-bold mb-2">Forca</h3>
                        <p class="text-indigo-100 mb-4">Adivinhe a palavra</p>
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
            this.ticTacToeBoard = Array(9).fill(null);
            this.ticTacToePlayer = 'X';
        }
        if (game === 'snake') {
            // Snake será inicializado no MiniGame
            MiniGame.resetGame();
        }
        Router.render();
        
        // Inicializar o jogo específico
        if (game === 'snake') {
            setTimeout(() => {
                MiniGame.init();
            }, 100);
        }
    },
    
    renderTicTacToe() {
        const winner = this.checkTicTacToeWinner();
        
        return `
            <div class="max-w-2xl mx-auto">
                <!-- Header com botão voltar -->
                <div class="flex items-center justify-between mb-8">
                    <h1 class="text-4xl font-black text-gray-800">⭕❌ Jogo da Velha</h1>
                    <button onclick="OfflineZone.backToMenu()" 
                            class="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-bold transition-all flex items-center gap-2">
                        <span>⬅️</span>
                        <span>Voltar</span>
                    </button>
                </div>
                
                <!-- Game Container -->
                <div class="bg-white rounded-2xl shadow-2xl p-8">
                    <!-- Status -->
                    <div class="text-center mb-8">
                        ${winner ? `
                            <div class="space-y-4">
                                <div class="text-6xl animate-bounce-slow">
                                    ${winner === 'draw' ? '🤝' : winner === 'X' ? '⭕' : '❌'}
                                </div>
                                <h2 class="text-3xl font-bold ${winner === 'draw' ? 'text-yellow-600' : 'text-green-600'}">
                                    ${winner === 'draw' ? '🤝 Empate!' : '🎉 Jogador ' + winner + ' Venceu!'}
                                </h2>
                                <button onclick="OfflineZone.startGame('tictactoe')" 
                                        class="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all">
                                    🔄 Jogar Novamente
                                </button>
                            </div>
                        ` : `
                            <div class="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r ${this.ticTacToePlayer === 'X' ? 'from-blue-500 to-cyan-600' : 'from-red-500 to-pink-600'} text-white rounded-xl shadow-lg">
                                <span class="text-2xl">${this.ticTacToePlayer === 'X' ? '⭕' : '❌'}</span>
                                <span class="text-xl font-bold">Vez do Jogador ${this.ticTacToePlayer}</span>
                            </div>
                        `}
                    </div>
                    
                    <!-- Board -->
                    <div class="grid grid-cols-3 gap-4 max-w-md mx-auto">
                        ${this.ticTacToeBoard.map((cell, index) => `
                            <button 
                                onclick="OfflineZone.ticTacToeMove(${index})"
                                class="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 hover:from-blue-100 hover:to-cyan-100 rounded-2xl text-6xl font-bold flex items-center justify-center transition-all transform hover:scale-105 shadow-lg ${winner ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
                                ${winner ? 'disabled' : ''}>
                                <span class="${cell === 'X' ? 'text-blue-600' : 'text-red-600'}">
                                    ${cell === 'X' ? '⭕' : cell === 'O' ? '❌' : ''}
                                </span>
                            </button>
                        `).join('')}
                    </div>
                </div>
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
    
    ticTacToeMove(index) {
        if (this.ticTacToeBoard[index] || this.checkTicTacToeWinner()) return;
        
        this.ticTacToeBoard[index] = this.ticTacToePlayer;
        this.ticTacToePlayer = this.ticTacToePlayer === 'X' ? 'O' : 'X';
        Router.render();
    },
    
    checkTicTacToeWinner() {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        
        for (let line of lines) {
            const [a, b, c] = line;
            if (this.ticTacToeBoard[a] && 
                this.ticTacToeBoard[a] === this.ticTacToeBoard[b] && 
                this.ticTacToeBoard[a] === this.ticTacToeBoard[c]) {
                return this.ticTacToeBoard[a];
            }
        }
        
        if (this.ticTacToeBoard.every(cell => cell !== null)) {
            return 'draw';
        }
        
        return null;
    },
    
    backToMenu() {
        this.currentGame = null;
        Router.render();
    }
};

window.OfflineZone = OfflineZone;