// JOGO DA VELHA - NyanTools にゃん~
// Versão Otimizada v2.0

const TicTacToe = {
    // Estado do jogo
    board: Array(9).fill(null),
    currentPlayer: 'X',
    gameMode: null,
    difficulty: 'medium',
    gameOver: false,
    winner: null,
    scores: { X: 0, O: 0, draws: 0 },
    
    difficultyConfig: {
        easy: { icon: '😊', label: 'Fácil', desc: 'Mayara é lerda' },
        medium: { icon: '🤔', label: 'Médio', desc: 'Mayara usa estratégia básica' },
        hard: { icon: '😈', label: 'Difícil', desc: 'Mayara pós-término' }
    },
    
    winningLines: [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
        [0, 4, 8], [2, 4, 6]             // Diagonais
    ],
    
    // ══════════════════════════════
    // RENDER PRINCIPAL
    // ══════════════════════════════
    
    render() {
        if (!this.gameMode) {
            return this.renderModeSelection();
        }
        
        return `
            <div class="max-w-4xl mx-auto">
                ${this.renderHeader()}
                ${this.renderScoreBoard()}
                ${this.renderGameContainer()}
                ${this.gameMode === 'pvc' ? this.renderDifficultySettings() : ''}
            </div>
        `;
    },
    
    renderModeSelection() {
        return `
            <div class="max-w-4xl mx-auto">
                ${this.renderModeHeader()}
                ${this.renderModeCards()}
            </div>
        `;
    },
    
    renderModeHeader() {
        return `
            <div class="text-center mb-12">
                <div class="text-8xl mb-6">🎮</div>
                <h1 class="text-5xl font-black text-gray-800 mb-4">Jogo da Velha にゃん~</h1>
                <p class="text-xl text-gray-600">Escolha o modo de jogo</p>
            </div>
        `;
    },
    
    renderModeCards() {
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                ${this.renderPvPCard()}
                ${this.renderPvCCard()}
            </div>
        `;
    },
    
    renderPvPCard() {
        return `
            <button onclick="TicTacToe.selectMode('pvp')" 
                    class="group bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl p-12 text-white shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all">
                <div class="text-8xl mb-6 group-hover:scale-110 transition-transform">👥</div>
                <h2 class="text-3xl font-black mb-4">2 Jogadores</h2>
                <p class="text-purple-100 text-lg mb-6">Jogue contra um amigo no mesmo computador</p>
                ${this.renderModeFeatures([
                    'Modo clássico',
                    'Revezamento de turnos',
                    'Placar de vitórias'
                ])}
            </button>
        `;
    },
    
    renderPvCCard() {
        return `
            <button onclick="TicTacToe.selectMode('pvc')" 
                    class="group bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl p-12 text-white shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 transition-all">
                <div class="text-8xl mb-6 group-hover:scale-110 transition-transform">🤖</div>
                <h2 class="text-3xl font-black mb-4">vs Mayara</h2>
                <p class="text-blue-100 text-lg mb-6">Desafie a inteligência da Mayara (ela é meio burra...)</p>
                ${this.renderModeFeatures([
                    '3 níveis de dificuldade',
                    'Mayara inteligente (Minimax)',
                    'Desafio progressivo'
                ])}
            </button>
        `;
    },
    
    renderModeFeatures(features) {
        return `
            <div class="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div class="text-sm space-y-2">
                    ${features.map(feature => `
                        <div class="flex items-center gap-2">
                            <span>✔</span>
                            <span>${feature}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    renderHeader() {
        const modeName = this.gameMode === 'pvp' ? '👥 Modo: 2 Jogadores' : `🤖 Modo: vs Mayara (${this.difficultyConfig[this.difficulty].label})`;
        
        return `
            <div class="flex items-center justify-between mb-8">
                <div>
                    <h1 class="text-4xl font-black text-gray-800 flex items-center gap-3">
                        <span class="text-red-500">❌</span>
                        <span>Jogo da Velha</span>
                        <span class="text-blue-500">⭕</span>
                    </h1>
                    <p class="text-gray-600 mt-2">${modeName}</p>
                </div>
                <button onclick="TicTacToe.changeMode()" 
                        class="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-bold transition-all flex items-center gap-2">
                    <span>🔄</span>
                    <span>Trocar Modo</span>
                </button>
            </div>
        `;
    },
    
    renderScoreBoard() {
        return `
            <div class="grid grid-cols-3 gap-4 mb-8">
                ${this.renderScoreCard('X', this.gameMode === 'pvp' ? 'Jogador X' : 'Você', 'from-red-500 to-pink-600', '❌')}
                ${this.renderScoreCard('draws', 'Empates', 'from-gray-500 to-gray-600', '🤝')}
                ${this.renderScoreCard('O', this.gameMode === 'pvp' ? 'Jogador O' : 'Mayara', 'from-blue-500 to-cyan-600', '⭕')}
            </div>
        `;
    },
    
    renderScoreCard(key, label, gradient, emoji) {
        const score = key === 'draws' ? this.scores.draws : this.scores[key];
        
        return `
            <div class="bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white text-center shadow-xl">
                <div class="text-5xl mb-2">${emoji}</div>
                <div class="text-sm font-semibold opacity-90">${label}</div>
                <div class="text-4xl font-black">${score}</div>
            </div>
        `;
    },
    
    renderGameContainer() {
        return `
            <div class="bg-white rounded-3xl shadow-2xl p-8">
                ${this.renderGameStatus()}
                ${this.renderBoard()}
                ${this.renderControls()}
            </div>
        `;
    },
    
    renderGameStatus() {
        if (this.gameOver) {
            return this.renderGameOverStatus();
        }
        return this.renderActiveStatus();
    },
    
    renderGameOverStatus() {
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
        }
        
        const winnerName = this.getWinnerName();
        const emoji = this.winner === 'X' ? '❌' : '⭕';
        const gradient = this.winner === 'X' ? 'from-red-50 to-pink-50 border-red-300' : 'from-blue-50 to-cyan-50 border-blue-300';
        
        return `
            <div class="bg-gradient-to-br ${gradient} border-3 rounded-2xl p-8 mb-8 animate-fadeIn">
                <div class="text-center">
                    <div class="text-8xl mb-4 animate-bounce">${emoji}</div>
                    <h3 class="text-3xl font-black text-gray-800 mb-2">${winnerName}!</h3>
                    <p class="text-gray-700">Parabéns pela vitória にゃん~</p>
                </div>
            </div>
        `;
    },
    
    renderActiveStatus() {
        const currentPlayerName = this.getCurrentPlayerName();
        const emoji = this.currentPlayer === 'X' ? '❌' : '⭕';
        const gradient = this.currentPlayer === 'X' ? 'from-red-500 to-pink-600' : 'from-blue-500 to-cyan-600';
        
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
    
    renderBoard() {
        return `
            <div class="max-w-xl mx-auto mb-8">
                <div class="grid grid-cols-3 gap-4">
                    ${this.board.map((cell, index) => this.renderCell(cell, index)).join('')}
                </div>
            </div>
        `;
    },
    
    renderCell(cell, index) {
        const isEmpty = cell === null;
        const symbol = cell === 'X' ? '❌' : (cell === 'O' ? '⭕' : '');
        const bgColor = cell === 'X' ? 'from-red-100 to-pink-100' : (cell === 'O' ? 'from-blue-100 to-cyan-100' : 'from-gray-100 to-gray-200');
        const hoverEffect = isEmpty && !this.gameOver ? 'hover:from-purple-100 hover:to-pink-100 hover:scale-110 cursor-pointer' : 'cursor-not-allowed';
        
        return `
            <button 
                onclick="TicTacToe.makeMove(${index})"
                ${!isEmpty || this.gameOver ? 'disabled' : ''}
                class="aspect-square bg-gradient-to-br ${bgColor} rounded-2xl shadow-lg ${hoverEffect} transition-all transform active:scale-95 flex items-center justify-center text-7xl font-bold">
                ${symbol}
            </button>
        `;
    },
    
    renderControls() {
        return `
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
                    ${Object.entries(this.difficultyConfig).map(([level, config]) => 
                        this.renderDifficultyCard(level, config)
                    ).join('')}
                </div>
            </div>
        `;
    },
    
    renderDifficultyCard(level, config) {
        const isActive = this.difficulty === level;
        const borderClass = isActive ? 'bg-green-100 border-green-500' : 'bg-gray-50 border-gray-200 hover:border-green-300';
        
        return `
            <button onclick="TicTacToe.setDifficulty('${level}')" 
                    class="p-6 rounded-xl border-3 transition-all ${borderClass}">
                <div class="text-4xl mb-3">${config.icon}</div>
                <div class="font-bold text-lg mb-2">${config.label}</div>
                <div class="text-sm text-gray-600">${config.desc}</div>
            </button>
        `;
    },
    
    // ══════════════════════════════
    // CONTROLE DO JOGO
    // ══════════════════════════════
    
    selectMode(mode) {
        this.gameMode = mode;
        this.resetGame();
        Router?.render();
    },
    
    changeMode() {
        this.gameMode = null;
        this.resetGame();
        this.resetScores();
        Router?.render();
    },
    
    setDifficulty(level) {
        this.difficulty = level;
        this.resetGame();
        Router?.render();
    },
    
    makeMove(index) {
        if (this.board[index] !== null || this.gameOver) return;
        if (this.gameMode === 'pvc' && this.currentPlayer === 'O') return;
        
        this.board[index] = this.currentPlayer;
        
        if (this.checkWinner()) {
            this.endGame(this.currentPlayer);
        } else if (this.board.every(cell => cell !== null)) {
            this.endGame('draw');
        } else {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            
            if (this.gameMode === 'pvc' && this.currentPlayer === 'O') {
                Router?.render();
                setTimeout(() => this.aiMove(), 500);
                return;
            }
        }
        
        Router?.render();
    },
    
    aiMove() {
        if (this.gameOver) return;
        
        const move = this.getAIMove();
        
        if (move !== null) {
            this.board[move] = 'O';
            
            if (this.checkWinner()) {
                this.endGame('O');
            } else if (this.board.every(cell => cell !== null)) {
                this.endGame('draw');
            } else {
                this.currentPlayer = 'X';
            }
            
            Router?.render();
        }
    },
    
    getAIMove() {
        switch(this.difficulty) {
            case 'easy':
                return this.getRandomMove();
            case 'medium':
                return this.getMediumMove();
            case 'hard':
                return this.getMinimaxMove();
        }
    },
    
    // ══════════════════════════════
    // ESTRATÉGIAS DE IA
    // ══════════════════════════════
    
    getRandomMove() {
        const available = this.board.map((cell, i) => cell === null ? i : null).filter(i => i !== null);
        return available[Math.floor(Math.random() * available.length)];
    },
    
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
        
        // 2. Bloquear vitória
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
        
        // 3. Centro
        if (this.board[4] === null) return 4;
        
        // 4. Cantos
        const corners = [0, 2, 6, 8].filter(i => this.board[i] === null);
        if (corners.length > 0) {
            return corners[Math.floor(Math.random() * corners.length)];
        }
        
        // 5. Qualquer
        return this.getRandomMove();
    },
    
    getMinimaxMove() {
        const emptyCells = this.board.filter(cell => cell === null).length;
        
        // Primeira jogada
        if (emptyCells === 9) {
            return Math.random() < 0.7 ? 4 : [0, 2, 6, 8][Math.floor(Math.random() * 4)];
        }
        
        // Segunda jogada
        if (emptyCells === 8) {
            if (this.board[4] === 'X') {
                const corners = [0, 2, 6, 8];
                return corners[Math.floor(Math.random() * corners.length)];
            }
            if ([0, 2, 6, 8].some(i => this.board[i] === 'X')) {
                return 4;
            }
        }
        
        let bestScore = -Infinity;
        let bestMove = null;
        const moveOrder = [4, 0, 2, 6, 8, 1, 3, 5, 7];
        
        for (let i of moveOrder) {
            if (this.board[i] === null) {
                this.board[i] = 'O';
                let score = this.minimax(0, false, -Infinity, Infinity);
                this.board[i] = null;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        return bestMove;
    },
    
    minimax(depth, isMaximizing, alpha, beta) {
        const winner = this.checkWinnerForMinimax();
        if (winner === 'O') return 10 - depth;
        if (winner === 'X') return depth - 10;
        if (this.board.every(cell => cell !== null)) return 0;
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i of [4, 0, 2, 6, 8, 1, 3, 5, 7]) {
                if (this.board[i] === null) {
                    this.board[i] = 'O';
                    let score = this.minimax(depth + 1, false, alpha, beta);
                    this.board[i] = null;
                    bestScore = Math.max(score, bestScore);
                    alpha = Math.max(alpha, score);
                    if (beta <= alpha) break;
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i of [4, 0, 2, 6, 8, 1, 3, 5, 7]) {
                if (this.board[i] === null) {
                    this.board[i] = 'X';
                    let score = this.minimax(depth + 1, true, alpha, beta);
                    this.board[i] = null;
                    bestScore = Math.min(score, bestScore);
                    beta = Math.min(beta, score);
                    if (beta <= alpha) break;
                }
            }
            return bestScore;
        }
    },
    
    // ══════════════════════════════
    // UTILITÁRIOS
    // ══════════════════════════════
    
    checkWinner() {
        return this.winningLines.some(line => {
            const [a, b, c] = line;
            return this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c];
        });
    },
    
    checkWinnerForMinimax() {
        for (let line of this.winningLines) {
            const [a, b, c] = line;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                return this.board[a];
            }
        }
        return null;
    },
    
    endGame(winner) {
        this.gameOver = true;
        this.winner = winner;
        
        if (winner === 'draw') {
            this.scores.draws++;
            Utils.showNotification?.('🤝 Empate! にゃん~', 'info');
        } else {
            this.scores[winner]++;
            const emoji = winner === 'X' ? '❌' : '⭕';
            Utils.showNotification?.(`${emoji} Vitória! にゃん~`, 'success');
        }
    },
    
    getCurrentPlayerName() {
        if (this.gameMode === 'pvc' && this.currentPlayer === 'O') {
            return 'Mayara';
        }
        return this.gameMode === 'pvp' ? `Jogador ${this.currentPlayer}` : 'Você';
    },
    
    getWinnerName() {
        if (this.gameMode === 'pvc') {
            return this.winner === 'X' ? 'Você Venceu' : 'Mayara Venceu';
        }
        return `Jogador ${this.winner} Venceu`;
    },
    
    resetGame() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.winner = null;
        Router?.render();
    },
    
    resetScores() {
        this.scores = { X: 0, O: 0, draws: 0 };
        Router?.render();
    }
};

window.TicTacToe = TicTacToe;