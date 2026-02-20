// Game 2048 - NyanTools Edition にゃん~ - DARK MODE FIXED
const Game2048 = {
    grid: [],
    score: 0,
    bestScore: 0,
    size: 4,
    gameState: 'idle',
    history: [],
    canUndo: false,
    
    // CORES AJUSTADAS PARA DARK MODE
    tileColors: {
        // 2 e 4 agora são mais escuros para funcionar no dark mode
        2: { bg: 'from-slate-300 to-slate-400', text: 'text-slate-800 dark:text-slate-900' },
        4: { bg: 'from-slate-400 to-slate-500', text: 'text-white' },
        8: { bg: 'from-orange-400 to-orange-500', text: 'text-white' },
        16: { bg: 'from-orange-500 to-orange-600', text: 'text-white' },
        32: { bg: 'from-red-500 to-red-600', text: 'text-white' },
        64: { bg: 'from-red-600 to-red-700', text: 'text-white' },
        128: { bg: 'from-yellow-400 to-yellow-500', text: 'text-white' },
        256: { bg: 'from-yellow-500 to-amber-500', text: 'text-white' },
        512: { bg: 'from-amber-500 to-orange-600', text: 'text-white' },
        1024: { bg: 'from-purple-500 to-purple-600', text: 'text-white' },
        2048: { bg: 'from-purple-600 to-pink-600', text: 'text-white' },
        4096: { bg: 'from-pink-600 to-rose-600', text: 'text-white' }
    },
    
    render() {
        this.loadGameState();
        
        return `
            <div class="max-w-2xl mx-auto">
                ${this.renderHeader()}
                ${this.renderScoreBoard()}
                ${this.renderGameBoard()}
                ${this.renderControls()}
                ${this.renderStats()}
            </div>
        `;
    },
    
    renderHeader() {
        return `
            <div class="text-center mb-4">
                <div class="inline-flex items-center gap-3 mb-2">
                    <div class="text-4xl">🎯</div>
                    <h1 class="text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                        2048 にゃん~
                    </h1>
                </div>
                <p class="text-gray-600 dark:text-gray-300 text-sm">Una os números e chegue ao 2048!</p>
            </div>
        `;
    },
    
    renderScoreBoard() {
        return `
            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 mb-4 border dark:border-slate-700">
                <div class="flex items-center justify-between gap-4">
                    <div class="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white px-4 py-3 rounded-lg text-center shadow-md">
                        <div class="text-xs font-semibold opacity-90">Pontuação</div>
                        <div class="text-2xl font-black" id="current-score">${this.score}</div>
                    </div>
                    <div class="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-3 rounded-lg text-center shadow-md">
                        <div class="text-xs font-semibold opacity-90">🏆 Recorde</div>
                        <div class="text-2xl font-black">${this.bestScore}</div>
                    </div>
                    <button onclick="Game2048.undo()" 
                            id="undo-btn"
                            ${!this.canUndo ? 'disabled' : ''}
                            class="px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold transition-all flex items-center gap-2 border dark:border-slate-600">
                        <span>↩️</span>
                        <span class="hidden sm:inline">Desfazer</span>
                    </button>
                </div>
            </div>
        `;
    },
    
    renderGameBoard() {
        return `
            <div class="bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-4 mb-4 shadow-2xl border-2 dark:border-slate-700">
                <div id="game-grid" class="grid grid-cols-4 gap-3">
                    ${Array(16).fill(0).map((_, i) => {
                        const row = Math.floor(i / 4);
                        const col = i % 4;
                        const value = this.grid[row]?.[col] || 0;
                        
                        return this.renderTile(value, row, col);
                    }).join('')}
                </div>
            </div>
        `;
    },
    
    renderTile(value, row, col) {
        if (value === 0) {
            return `
                <div class="w-24 h-24 bg-slate-700/40 dark:bg-slate-950/60 rounded-lg border border-slate-600/30 dark:border-slate-800/50"></div>
            `;
        }
        
        const colors = this.tileColors[value] || this.tileColors[4096];
        const fontSize = value >= 1000 ? 'text-2xl' : value >= 100 ? 'text-3xl' : 'text-4xl';
        
        return `
            <div class="w-24 h-24 bg-gradient-to-br ${colors.bg} ${colors.text} rounded-lg shadow-xl flex items-center justify-center font-black ${fontSize} animate-tile-appear transform hover:scale-105 transition-all border-2 border-white/20"
                 data-row="${row}" data-col="${col}" data-value="${value}">
                ${value}
            </div>
        `;
    },
    
    renderControls() {
        return `
            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 mb-4 border dark:border-slate-700">
                <div class="grid grid-cols-2 gap-3 mb-4">
                    <button onclick="Game2048.newGame()" 
                            class="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2">
                        <span>🎮</span>
                        <span>Novo Jogo</span>
                    </button>
                    <button onclick="Game2048.continueGame()" 
                            id="continue-btn"
                            ${this.gameState === 'idle' ? 'disabled' : ''}
                            class="bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        <span>▶️</span>
                        <span>Continuar</span>
                    </button>
                </div>
                
                <div class="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                    <div></div>
                    ${this.renderArrowButton('up')}
                    <div></div>
                    ${this.renderArrowButton('left')}
                    <div class="flex items-center justify-center">
                        <div class="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs font-bold border dark:border-slate-600">
                            WASD
                        </div>
                    </div>
                    ${this.renderArrowButton('right')}
                    <div></div>
                    ${this.renderArrowButton('down')}
                    <div></div>
                </div>
            </div>
        `;
    },
    
    renderArrowButton(direction) {
        const arrows = {
            up: '⬆️',
            down: '⬇️',
            left: '⬅️',
            right: '➡️'
        };
        
        const keys = {
            up: 'W/↑',
            down: 'S/↓',
            left: 'A/←',
            right: 'D/→'
        };
        
        return `
            <button onclick="Game2048.move('${direction}')"
                    class="bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 py-3 rounded-lg transition-all transform hover:scale-110 active:scale-95 group">
                <div class="text-2xl">${arrows[direction]}</div>
                <div class="text-xs text-slate-500 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 font-semibold">${keys[direction]}</div>
            </button>
        `;
    },
    
    renderStats() {
        const stats = Utils.loadData('game_2048_stats') || {
            gamesPlayed: 0,
            gamesWon: 0,
            bestTile: 0,
            totalScore: 0
        };
        
        const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
        
        return `
            <div class="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl shadow-xl p-4 text-white">
                <div class="flex items-center justify-between text-sm">
                    <div class="text-center flex-1">
                        <div class="text-2xl font-black">${stats.gamesPlayed}</div>
                        <div class="text-xs opacity-90">Jogos</div>
                    </div>
                    <div class="text-center flex-1">
                        <div class="text-2xl font-black">${stats.gamesWon}</div>
                        <div class="text-xs opacity-90">Vitórias</div>
                    </div>
                    <div class="text-center flex-1">
                        <div class="text-2xl font-black">${winRate}%</div>
                        <div class="text-xs opacity-90">Taxa</div>
                    </div>
                    <div class="text-center flex-1">
                        <div class="text-2xl font-black">${stats.bestTile || 0}</div>
                        <div class="text-xs opacity-90">Melhor Tile</div>
                    </div>
                </div>
            </div>
        `;
    },
    
    init() {
        this.loadGameState();
        this.setupKeyboardListeners();
        
        if (this.gameState === 'idle') {
            this.newGame();
        }
    },
    
    setupKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.gameState !== 'playing') return;
            
            const keyMap = {
                'ArrowUp': 'up',
                'ArrowDown': 'down',
                'ArrowLeft': 'left',
                'ArrowRight': 'right',
                'w': 'up',
                'W': 'up',
                's': 'down',
                'S': 'down',
                'a': 'left',
                'A': 'left',
                'd': 'right',
                'D': 'right'
            };
            
            if (keyMap[e.key]) {
                e.preventDefault();
                this.move(keyMap[e.key]);
            }
            
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                this.undo();
            }
        });
    },
    
    newGame() {
        this.grid = Array(4).fill(0).map(() => Array(4).fill(0));
        this.score = 0;
        this.gameState = 'playing';
        this.history = [];
        this.canUndo = false;
        
        this.addRandomTile();
        this.addRandomTile();
        
        this.saveGameState();
        this.updateUI();
    },
    
    continueGame() {
        if (this.gameState === 'won') {
            this.gameState = 'playing';
            this.updateUI();
        }
    },
    
    addRandomTile() {
        const emptyCells = [];
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[row][col] = Math.random() < 0.9 ? 2 : 4;
        }
    },
    
    move(direction) {
        if (this.gameState !== 'playing') return;
        
        this.history.push({
            grid: JSON.parse(JSON.stringify(this.grid)),
            score: this.score
        });
        
        if (this.history.length > 10) {
            this.history.shift();
        }
        
        let moved = false;
        
        if (direction === 'left') moved = this.moveLeft();
        if (direction === 'right') moved = this.moveRight();
        if (direction === 'up') moved = this.moveUp();
        if (direction === 'down') moved = this.moveDown();
        
        if (moved) {
            this.addRandomTile();
            this.canUndo = true;
            this.checkGameState();
            this.saveGameState();
            this.updateUI();
        } else {
            this.history.pop();
        }
    },
    
    moveLeft() {
        let moved = false;
        
        for (let i = 0; i < 4; i++) {
            const row = this.grid[i].filter(val => val !== 0);
            const newRow = [];
            
            for (let j = 0; j < row.length; j++) {
                if (j < row.length - 1 && row[j] === row[j + 1]) {
                    newRow.push(row[j] * 2);
                    this.score += row[j] * 2;
                    j++;
                } else {
                    newRow.push(row[j]);
                }
            }
            
            while (newRow.length < 4) {
                newRow.push(0);
            }
            
            if (JSON.stringify(this.grid[i]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            
            this.grid[i] = newRow;
        }
        
        return moved;
    },
    
    moveRight() {
        this.reverseGrid();
        const moved = this.moveLeft();
        this.reverseGrid();
        return moved;
    },
    
    moveUp() {
        this.transposeGrid();
        const moved = this.moveLeft();
        this.transposeGrid();
        return moved;
    },
    
    moveDown() {
        this.transposeGrid();
        const moved = this.moveRight();
        this.transposeGrid();
        return moved;
    },
    
    reverseGrid() {
        for (let i = 0; i < 4; i++) {
            this.grid[i].reverse();
        }
    },
    
    transposeGrid() {
        const newGrid = Array(4).fill(0).map(() => Array(4).fill(0));
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                newGrid[j][i] = this.grid[i][j];
            }
        }
        
        this.grid = newGrid;
    },
    
    undo() {
        if (!this.canUndo || this.history.length === 0) return;
        
        const lastState = this.history.pop();
        this.grid = lastState.grid;
        this.score = lastState.score;
        this.canUndo = this.history.length > 0;
        
        this.updateUI();
        this.saveGameState();
    },
    
    checkGameState() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 2048 && this.gameState === 'playing') {
                    this.gameState = 'won';
                    this.updateStats(true);
                    setTimeout(() => {
                        Utils.showNotification('🎉 Você ganhou! Chegou ao 2048! にゃん~', 'success');
                    }, 500);
                    return;
                }
            }
        }
        
        if (!this.canMove()) {
            this.gameState = 'lost';
            this.updateStats(false);
            setTimeout(() => {
                Utils.showNotification('💀 Game Over! Pontuação: ' + this.score, 'error');
            }, 500);
        }
    },
    
    canMove() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) return true;
            }
        }
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const current = this.grid[i][j];
                
                if (j < 3 && current === this.grid[i][j + 1]) return true;
                if (i < 3 && current === this.grid[i + 1][j]) return true;
            }
        }
        
        return false;
    },
    
    updateStats(won) {
        const stats = Utils.loadData('game_2048_stats') || {
            gamesPlayed: 0,
            gamesWon: 0,
            bestTile: 0,
            totalScore: 0
        };
        
        stats.gamesPlayed++;
        if (won) stats.gamesWon++;
        stats.totalScore += this.score;
        
        let maxTile = 0;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                maxTile = Math.max(maxTile, this.grid[i][j]);
            }
        }
        
        stats.bestTile = Math.max(stats.bestTile, maxTile);
        
        Utils.saveData('game_2048_stats', stats);
    },
    
    loadGameState() {
        const saved = Utils.loadData('game_2048_state');
        
        if (saved) {
            this.grid = saved.grid;
            this.score = saved.score;
            this.gameState = saved.gameState;
            this.history = saved.history || [];
            this.canUndo = this.history.length > 0;
        }
        
        this.bestScore = Utils.loadData('game_2048_highscore') || 0;
    },
    
    saveGameState() {
        Utils.saveData('game_2048_state', {
            grid: this.grid,
            score: this.score,
            gameState: this.gameState,
            history: this.history
        });
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            Utils.saveData('game_2048_highscore', this.bestScore);
        }
    },
    
    updateUI() {
        const scoreEl = document.getElementById('current-score');
        if (scoreEl) scoreEl.textContent = this.score;
        
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) {
            undoBtn.disabled = !this.canUndo;
        }
        
        const continueBtn = document.getElementById('continue-btn');
        if (continueBtn) {
            continueBtn.disabled = this.gameState === 'idle';
        }
        
        const gridEl = document.getElementById('game-grid');
        if (gridEl) {
            gridEl.innerHTML = Array(16).fill(0).map((_, i) => {
                const row = Math.floor(i / 4);
                const col = i % 4;
                const value = this.grid[row]?.[col] || 0;
                return this.renderTile(value, row, col);
            }).join('');
        }
    }
};

window.Game2048 = Game2048;