// Jogo da Velha COMPLETO com IA Melhorada にゃん~
const TicTacToe = {
    board: Array(9).fill(null),
    currentPlayer: 'X', // X = Jogador 1 ou Humano | O = Jogador 2 ou IA
    gameMode: null, // 'pvp' ou 'pvc'
    difficulty: 'medium', // 'easy', 'medium', 'hard'
    gameOver: false,
    winner: null,
    scores: {
        X: 0,
        O: 0,
        draws: 0
    },
    
    render() {
        // Se não escolheu modo, mostrar seleção
        if (!this.gameMode) {
            return this.renderModeSelection();
        }
        
        return `
            <div class="max-w-4xl mx-auto">
                <!-- Header -->
                <div class="flex items-center justify-between mb-8">
                    <div>
                        <h1 class="text-4xl font-black text-gray-800 flex items-center gap-3">
                            <span class="text-red-500">❌</span>
                            <span>Jogo da Velha</span>
                            <span class="text-blue-500">⭕</span>
                        </h1>
                        <p class="text-gray-600 mt-2">
                            ${this.gameMode === 'pvp' ? '👥 Modo: 2 Jogadores' : '🤖 Modo: vs Mayara (' + this.getDifficultyName() + ')'}
                        </p>
                    </div>
                    <button onclick="TicTacToe.changeMode()" 
                            class="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-bold transition-all flex items-center gap-2">
                        <span>🔄</span>
                        <span>Trocar Modo</span>
                    </button>
                </div>
                
                <!-- Placar -->
                <div class="grid grid-cols-3 gap-4 mb-8">
                    <div class="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-6 text-white text-center shadow-xl">
                        <div class="text-5xl mb-2">❌</div>
                        <div class="text-sm font-semibold opacity-90">${this.gameMode === 'pvp' ? 'Jogador X' : 'Você'}</div>
                        <div class="text-4xl font-black">${this.scores.X}</div>
                    </div>
                    <div class="bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl p-6 text-white text-center shadow-xl">
                        <div class="text-5xl mb-2">🤝</div>
                        <div class="text-sm font-semibold opacity-90">Empates</div>
                        <div class="text-4xl font-black">${this.scores.draws}</div>
                    </div>
                    <div class="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white text-center shadow-xl">
                        <div class="text-5xl mb-2">⭕</div>
                        <div class="text-sm font-semibold opacity-90">${this.gameMode === 'pvp' ? 'Jogador O' : 'Mayara'}</div>
                        <div class="text-4xl font-black">${this.scores.O}</div>
                    </div>
                </div>
                
                <!-- Game Container -->
                <div class="bg-white rounded-3xl shadow-2xl p-8">
                    ${this.renderGameStatus()}
                    
                    <!-- Tabuleiro -->
                    <div class="max-w-xl mx-auto mb-8">
                        <div class="grid grid-cols-3 gap-4">
                            ${this.board.map((cell, index) => this.renderCell(cell, index)).join('')}
                        </div>
                    </div>
                    
                    <!-- Controles -->
                    <div class="flex gap-4 justify-center">
                        <button onclick="TicTacToe.resetGame()" 
                                class="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                            <span>🔄</span>
                            <span>Novo Jogo</span>
                        </button>
                        <button onclick="TicTacToe.resetScores()" 
                                class="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                            <span>🗑️</span>
                            <span>Zerar Placar</span>
                        </button>
                    </div>
                </div>
                
                ${this.gameMode === 'pvc' ? this.renderDifficultySettings() : ''}
            </div>
        `;
    },
    
    renderModeSelection() {
        return `
            <div class="max-w-4xl mx-auto">
                <div class="text-center mb-12">
                    <div class="text-8xl mb-6">🎮</div>
                    <h1 class="text-5xl font-black text-gray-800 mb-4">Jogo da Velha にゃん~</h1>
                    <p class="text-xl text-gray-600">Escolha o modo de jogo</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <!-- Modo PvP -->
                    <button onclick="TicTacToe.selectMode('pvp')" 
                            class="group bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl p-12 text-white shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all">
                        <div class="text-8xl mb-6 group-hover:scale-110 transition-transform">👥</div>
                        <h2 class="text-3xl font-black mb-4">2 Jogadores</h2>
                        <p class="text-purple-100 text-lg mb-6">Jogue contra um amigo no mesmo computador</p>
                        <div class="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                            <div class="text-sm space-y-2">
                                <div class="flex items-center gap-2">
                                    <span>✔</span>
                                    <span>Modo clássico</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span>✔</span>
                                    <span>Revezamento de turnos</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span>✔</span>
                                    <span>Placar de vitórias</span>
                                </div>
                            </div>
                        </div>
                    </button>
                    
                    <!-- Modo vs Mayara -->
                    <button onclick="TicTacToe.selectMode('pvc')" 
                            class="group bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl p-12 text-white shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 transition-all">
                        <div class="text-8xl mb-6 group-hover:scale-110 transition-transform">🤖</div>
                        <h2 class="text-3xl font-black mb-4">vs Mayara</h2>
                        <p class="text-blue-100 text-lg mb-6">Desafie a inteligência da Mayara (ela é meio burra...)</p>
                        <div class="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                            <div class="text-sm space-y-2">
                                <div class="flex items-center gap-2">
                                    <span>✔</span>
                                    <span>3 níveis de dificuldade</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span>✔</span>
                                    <span>Mayara inteligente (Minimax)</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span>✔</span>
                                    <span>Desafio progressivo</span>
                                </div>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        `;
    },
    
    renderGameStatus() {
        if (this.gameOver) {
            if (this.winner === 'draw') {
                return `
                    <div class="bg-gradient-to-br from-yellow-50 to-orange-50 border-3 border-yellow-300 rounded-2xl p-8 mb-8 animate-fadeIn">
                        <div class="text-center">
                            <div class="text-8xl mb-4">🤝</div>
                            <h3 class="text-3xl font-black text-yellow-800 mb-2">Empate!</h3>
                            <p class="text-yellow-700">Ninguém venceu desta vez</p>
                        </div>
                    </div>
                `;
            } else {
                const winnerName = this.gameMode === 'pvc' 
                    ? (this.winner === 'X' ? 'Você Venceu' : 'Mayara Venceu')
                    : `Jogador ${this.winner} Venceu`;
                    
                const emoji = this.winner === 'X' ? '❌' : '⭕';
                const gradient = this.winner === 'X' 
                    ? 'from-red-50 to-pink-50 border-red-300' 
                    : 'from-blue-50 to-cyan-50 border-blue-300';
                    
                return `
                    <div class="bg-gradient-to-br ${gradient} border-3 rounded-2xl p-8 mb-8 animate-fadeIn">
                        <div class="text-center">
                            <div class="text-8xl mb-4 animate-bounce">${emoji}</div>
                            <h3 class="text-3xl font-black text-gray-800 mb-2">${winnerName}!</h3>
                            <p class="text-gray-700">Parabéns pela vitória にゃん~</p>
                        </div>
                    </div>
                `;
            }
        }
        
        const currentPlayerName = this.gameMode === 'pvc' && this.currentPlayer === 'O'
            ? 'Mayara'
            : (this.gameMode === 'pvp' ? `Jogador ${this.currentPlayer}` : 'Você');
            
        const emoji = this.currentPlayer === 'X' ? '❌' : '⭕';
        const gradient = this.currentPlayer === 'X'
            ? 'from-red-500 to-pink-600'
            : 'from-blue-500 to-cyan-600';
            
        return `
            <div class="text-center mb-8">
                <div class="inline-flex items-center gap-4 bg-gradient-to-r ${gradient} text-white px-8 py-4 rounded-2xl shadow-xl">
                    <div class="text-4xl">${emoji}</div>
                    <div class="text-left">
                        <div class="text-sm font-semibold opacity-90">Vez de:</div>
                        <div class="text-2xl font-black">${currentPlayerName}</div>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderCell(cell, index) {
        const isEmpty = cell === null;
        const symbol = cell === 'X' ? '❌' : (cell === 'O' ? '⭕' : '');
        const bgColor = cell === 'X' 
            ? 'from-red-100 to-pink-100' 
            : (cell === 'O' ? 'from-blue-100 to-cyan-100' : 'from-gray-100 to-gray-200');
        
        const hoverEffect = isEmpty && !this.gameOver 
            ? 'hover:from-purple-100 hover:to-pink-100 hover:scale-110 cursor-pointer' 
            : 'cursor-not-allowed';
        
        return `
            <button 
                onclick="TicTacToe.makeMove(${index})"
                ${!isEmpty || this.gameOver ? 'disabled' : ''}
                class="aspect-square bg-gradient-to-br ${bgColor} rounded-2xl shadow-lg ${hoverEffect} transition-all transform active:scale-95 flex items-center justify-center text-7xl font-bold">
                ${symbol}
            </button>
        `;
    },
    
    renderDifficultySettings() {
        return `
            <div class="mt-8 bg-white rounded-2xl shadow-2xl p-8">
                <h3 class="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
                    <span>🎚️</span>
                    <span>Dificuldade da Mayara</span>
                </h3>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onclick="TicTacToe.setDifficulty('easy')" 
                            class="p-6 rounded-xl border-3 transition-all ${this.difficulty === 'easy' ? 'bg-green-100 border-green-500' : 'bg-gray-50 border-gray-200 hover:border-green-300'}">
                        <div class="text-4xl mb-3">😊</div>
                        <div class="font-bold text-lg mb-2">Fácil</div>
                        <div class="text-sm text-gray-600">Mayara é lerda</div>
                    </button>
                    
                    <button onclick="TicTacToe.setDifficulty('medium')" 
                            class="p-6 rounded-xl border-3 transition-all ${this.difficulty === 'medium' ? 'bg-yellow-100 border-yellow-500' : 'bg-gray-50 border-gray-200 hover:border-yellow-300'}">
                        <div class="text-4xl mb-3">🤔</div>
                        <div class="font-bold text-lg mb-2">Médio</div>
                        <div class="text-sm text-gray-600">Mayara usa estratégia básica</div>
                    </button>
                    
                    <button onclick="TicTacToe.setDifficulty('hard')" 
                            class="p-6 rounded-xl border-3 transition-all ${this.difficulty === 'hard' ? 'bg-red-100 border-red-500' : 'bg-gray-50 border-gray-200 hover:border-red-300'}">
                        <div class="text-4xl mb-3">😈</div>
                        <div class="font-bold text-lg mb-2">Difícil</div>
                        <div class="text-sm text-gray-600">Mayara pós-término</div>
                    </button>
                </div>
            </div>
        `;
    },
    
    selectMode(mode) {
        this.gameMode = mode;
        this.resetGame();
        Router.render();
    },
    
    changeMode() {
        this.gameMode = null;
        this.resetGame();
        this.resetScores();
        Router.render();
    },
    
    setDifficulty(level) {
        this.difficulty = level;
        this.resetGame();
        Router.render();
    },
    
    getDifficultyName() {
        const names = {
            'easy': 'Fácil',
            'medium': 'Médio',
            'hard': 'Difícil'
        };
        return names[this.difficulty];
    },
    
    makeMove(index) {
        // Validações
        if (this.board[index] !== null || this.gameOver) return;
        
        // Se for modo IA e for turno da IA, ignorar
        if (this.gameMode === 'pvc' && this.currentPlayer === 'O') return;
        
        // Fazer jogada
        this.board[index] = this.currentPlayer;
        
        // Verificar vitória
        if (this.checkWinner()) {
            this.gameOver = true;
            this.winner = this.currentPlayer;
            this.scores[this.currentPlayer]++;
            Utils.showNotification(`${this.currentPlayer === 'X' ? '❌' : '⭕'} Vitória! にゃん~`, 'success');
        } else if (this.board.every(cell => cell !== null)) {
            this.gameOver = true;
            this.winner = 'draw';
            this.scores.draws++;
            Utils.showNotification('🤝 Empate! にゃん~', 'info');
        } else {
            // Trocar jogador
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            
            // Se for modo IA e agora é turno da IA
            if (this.gameMode === 'pvc' && this.currentPlayer === 'O') {
                Router.render();
                setTimeout(() => this.aiMove(), 500); // Delay para parecer mais natural
                return;
            }
        }
        
        Router.render();
    },
    
    aiMove() {
        if (this.gameOver) return;
        
        let move;
        
        switch(this.difficulty) {
            case 'easy':
                move = this.getRandomMove();
                break;
            case 'medium':
                move = this.getMediumMove();
                break;
            case 'hard':
                move = this.getMinimaxMove();
                break;
        }
        
        if (move !== null) {
            this.board[move] = 'O';
            
            // Verificar vitória da IA
            if (this.checkWinner()) {
                this.gameOver = true;
                this.winner = 'O';
                this.scores.O++;
                Utils.showNotification('🤖 Mayara Venceu! にゃん~', 'error');
            } else if (this.board.every(cell => cell !== null)) {
                this.gameOver = true;
                this.winner = 'draw';
                this.scores.draws++;
                Utils.showNotification('🤝 Empate! にゃん~', 'info');
            } else {
                this.currentPlayer = 'X';
            }
            
            Router.render();
        }
    },
    
    // IA Fácil: Jogada aleatória
    getRandomMove() {
        const available = [];
        this.board.forEach((cell, i) => {
            if (cell === null) available.push(i);
        });
        return available[Math.floor(Math.random() * available.length)];
    },
    
    // IA Média: Bloqueia vitória do jogador ou tenta vencer
    getMediumMove() {
        // 1. Tentar vencer
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                this.board[i] = 'O';
                if (this.checkWinner()) {
                    this.board[i] = null;
                    return i;
                }
                this.board[i] = null;
            }
        }
        
        // 2. Bloquear vitória do jogador
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                this.board[i] = 'X';
                if (this.checkWinner()) {
                    this.board[i] = null;
                    return i;
                }
                this.board[i] = null;
            }
        }
        
        // 3. Pegar centro se disponível
        if (this.board[4] === null) return 4;
        
        // 4. Pegar canto aleatório
        const corners = [0, 2, 6, 8].filter(i => this.board[i] === null);
        if (corners.length > 0) {
            return corners[Math.floor(Math.random() * corners.length)];
        }
        
        // 5. Qualquer posição disponível
        return this.getRandomMove();
    },
    
    // IA Difícil: Algoritmo Minimax Otimizado com Alpha-Beta Pruning (INVENCÍVEL)
    getMinimaxMove() {
        // Primeira jogada: sempre pegar centro ou canto aleatório
        const emptyCells = this.board.filter(cell => cell === null).length;
        if (emptyCells === 9) {
            return Math.random() < 0.7 ? 4 : [0, 2, 6, 8][Math.floor(Math.random() * 4)];
        }
        
        // Segunda jogada: otimizações estratégicas
        if (emptyCells === 8) {
            // Se jogador pegou centro, pegar canto oposto
            if (this.board[4] === 'X') {
                const corners = [0, 2, 6, 8];
                return corners[Math.floor(Math.random() * corners.length)];
            }
            // Se jogador pegou canto, pegar centro
            if ([0, 2, 6, 8].some(i => this.board[i] === 'X')) {
                return 4;
            }
        }
        
        let bestScore = -Infinity;
        let bestMove = null;
        
        // Priorizar jogadas por importância estratégica
        const moveOrder = this.getPriorityMoves();
        
        for (let i of moveOrder) {
            if (this.board[i] === null) {
                this.board[i] = 'O';
                let score = this.minimax(this.board, 0, false, -Infinity, Infinity);
                this.board[i] = null;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        return bestMove;
    },
    
    // Ordenar movimentos por importância estratégica (centro > cantos > bordas)
    getPriorityMoves() {
        const center = [4];
        const corners = [0, 2, 6, 8];
        const edges = [1, 3, 5, 7];
        return [...center, ...corners, ...edges];
    },
    
    // Minimax com poda Alpha-Beta para maior eficiência
    minimax(board, depth, isMaximizing, alpha, beta) {
        // Verificar estado terminal
        const winner = this.checkWinnerForMinimax();
        if (winner === 'O') {
            return 10 - depth; // Vitória da IA (quanto antes, melhor)
        }
        if (winner === 'X') {
            return depth - 10; // Vitória do jogador (quanto depois, melhor)
        }
        
        if (board.every(cell => cell !== null)) {
            return 0; // Empate
        }
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i of this.getPriorityMoves()) {
                if (board[i] === null) {
                    board[i] = 'O';
                    let score = this.minimax(board, depth + 1, false, alpha, beta);
                    board[i] = null;
                    bestScore = Math.max(score, bestScore);
                    alpha = Math.max(alpha, score);
                    if (beta <= alpha) break; // Poda Alpha-Beta
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i of this.getPriorityMoves()) {
                if (board[i] === null) {
                    board[i] = 'X';
                    let score = this.minimax(board, depth + 1, true, alpha, beta);
                    board[i] = null;
                    bestScore = Math.min(score, bestScore);
                    beta = Math.min(beta, score);
                    if (beta <= alpha) break; // Poda Alpha-Beta
                }
            }
            return bestScore;
        }
    },
    
    // Versão do checkWinner que retorna o vencedor
    checkWinnerForMinimax() {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
            [0, 4, 8], [2, 4, 6]             // Diagonais
        ];
        
        for (let line of lines) {
            const [a, b, c] = line;
            if (this.board[a] && 
                this.board[a] === this.board[b] && 
                this.board[a] === this.board[c]) {
                return this.board[a];
            }
        }
        
        return null;
    },
    
    checkWinner() {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
            [0, 4, 8], [2, 4, 6]             // Diagonais
        ];
        
        for (let line of lines) {
            const [a, b, c] = line;
            if (this.board[a] && 
                this.board[a] === this.board[b] && 
                this.board[a] === this.board[c]) {
                return true;
            }
        }
        
        return false;
    },
    
    resetGame() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.winner = null;
        Router.render();
    },
    
    resetScores() {
        this.scores = { X: 0, O: 0, draws: 0 };
        Router.render();
    }
};

window.TicTacToe = TicTacToe;