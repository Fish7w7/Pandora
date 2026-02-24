// Mini Game - Cobrinha v3.0.0 FIXED にゃん~
const MiniGame = {
    canvas: null,
    ctx: null,
    snake: [],
    food: {},
    direction: 'right',
    nextDirection: 'right',
    score: 0,
    highScore: 0,
    gameLoop: null,
    isPlaying: false,
    isPaused: false,
    _keydownHandler: null,
    _isGameOver: false,
    
    // Configurações do jogo
    config: {
        gridSize: 20,
        cellSize: 20,
        speed: 100,
        initialSnakeLength: 3
    },
    
    // Cores do jogo (tema dark otimizado)
    colors: {
        background: '#0f172a',
        grid: 'rgba(148, 163, 184, 0.1)',
        snakeHead: '#10b981',
        snakeBody: '#059669',
        snakeBodyGradient: '#047857',
        food: '#ef4444',
        foodGlow: 'rgba(239, 68, 68, 0.5)'
    },
    
    render() {
        this.highScore = Utils.loadData('snake_highscore') || 0;
        
        return `
            <div class="max-w-3xl mx-auto">
                ${this.renderHeader()}
                ${this.renderGameContainer()}
                ${this.renderStats()}
            </div>
        `;
    },
    
    renderHeader() {
        return `
            <div class="text-center mb-4">
                <div class="inline-flex items-center gap-3 mb-2">
                    <div class="text-4xl">🐍</div>
                    <h1 class="text-3xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        Cobrinha にゃん~
                    </h1>
                </div>
                <p class="text-gray-600 dark:text-gray-400 text-sm">Use as setas do teclado ou clique nos botões</p>
            </div>
        `;
    },
    
    renderGameContainer() {
        return `
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 mb-4 border dark:border-gray-700">
                ${this.renderScoreDisplay()}
                ${this.renderCanvas()}
                ${this.renderControls()}
            </div>
        `;
    },
    
    renderScoreDisplay() {
        return `
            <div class="flex justify-between items-center mb-4 gap-3">
                <div class="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-xl shadow-md">
                    <div class="text-xs font-semibold opacity-90">Pontuação</div>
                    <div class="text-2xl font-black" id="score">0</div>
                </div>
                <div class="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white px-4 py-3 rounded-xl shadow-md">
                    <div class="text-xs font-semibold opacity-90">🏆 Recorde</div>
                    <div class="text-2xl font-black">${this.highScore}</div>
                </div>
            </div>
        `;
    },
    
    renderCanvas() {
        return `
            <div class="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-3 shadow-inner mb-4">
                <canvas id="game-canvas" width="400" height="400" 
                        class="mx-auto rounded-lg shadow-2xl border border-slate-700"
                        style="image-rendering: pixelated; image-rendering: crisp-edges; display: block;">
                </canvas>
                <div id="game-overlay" class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl hidden">
                    <div class="text-center text-white">
                        <div class="text-6xl mb-4">⏸️</div>
                        <div class="text-2xl font-bold">Pausado</div>
                        <div class="text-sm mt-2 opacity-75">Pressione Iniciar para continuar</div>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderControls() {
        return `
            <div class="flex flex-col gap-3 mb-4">
                <div class="flex gap-2">
                    <button id="start-btn" 
                            onclick="MiniGame.startGame()" 
                            class="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                        <span class="text-xl">▶️</span>
                        <span>Iniciar</span>
                    </button>
                    <button id="pause-btn" 
                            onclick="MiniGame.pauseGame()" 
                            class="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                        <span class="text-xl">⏸️</span>
                        <span>Pausar</span>
                    </button>
                </div>
            </div>
        `;
    },
    
    renderStats() {
        return `
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 text-center border dark:border-gray-700">
                <div class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Controles</div>
                <div class="flex justify-center gap-2">
                    <button onclick="MiniGame.changeDirection('up')" 
                            class="w-12 h-12 bg-gray-200 dark:bg-gray-700 hover:bg-green-500 dark:hover:bg-green-600 hover:text-white rounded-lg transition-all flex items-center justify-center">
                        <span class="text-xl">⬆️</span>
                    </button>
                </div>
                <div class="flex justify-center gap-2 mt-2">
                    <button onclick="MiniGame.changeDirection('left')" 
                            class="w-12 h-12 bg-gray-200 dark:bg-gray-700 hover:bg-green-500 dark:hover:bg-green-600 hover:text-white rounded-lg transition-all flex items-center justify-center">
                        <span class="text-xl">⬅️</span>
                    </button>
                    <button onclick="MiniGame.changeDirection('down')" 
                            class="w-12 h-12 bg-gray-200 dark:bg-gray-700 hover:bg-green-500 dark:hover:bg-green-600 hover:text-white rounded-lg transition-all flex items-center justify-center">
                        <span class="text-xl">⬇️</span>
                    </button>
                    <button onclick="MiniGame.changeDirection('right')" 
                            class="w-12 h-12 bg-gray-200 dark:bg-gray-700 hover:bg-green-500 dark:hover:bg-green-600 hover:text-white rounded-lg transition-all flex items-center justify-center">
                        <span class="text-xl">➡️</span>
                    </button>
                </div>
                <div class="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    Use setas ou WASD • Espaço para pausar
                </div>
            </div>
        `;
    },
    
    init() {
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) {
            console.error('Canvas não encontrado');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.resetGame();
        this.setupKeyboardListeners();
        this.draw();
        
        console.log('🐍 Cobrinha inicializado');
    },
    
    setupKeyboardListeners() {
        if (this._keydownHandler) {
            document.removeEventListener('keydown', this._keydownHandler);
            this._keydownHandler = null;
        }

        this._keydownHandler = (e) => {
            if (!document.getElementById('game-canvas')) {
                document.removeEventListener('keydown', this._keydownHandler);
                this._keydownHandler = null;
                this.cleanup();
                return;
            }

            if (this._isGameOver) {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    this._isGameOver = false;
                    this.startGame();
                }
                return; 
            }

            if (!this.isPlaying || this.isPaused) {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    if (!this.isPlaying) {
                        this.startGame();
                    } else if (this.isPaused) {
                        this.resumeGame();
                    }
                }
                return;
            }
            
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
                this.changeDirection(keyMap[e.key]);
            }
            
            if (e.key === 'p' || e.key === 'P' || e.key === ' ') {
                e.preventDefault();
                this.pauseGame();
            }
        };

        document.addEventListener('keydown', this._keydownHandler);
    },
    
    resetGame() {
        this.config.speed = 100;
        this.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.isPaused = false;
        this._isGameOver = false; 
        this.spawnFood();
        this.updateScore();
        this.hideOverlay();
    },
    
    startGame() {
        this.resetGame();
        
        this.isPlaying = true;
        this.isPaused = false;
        this._isGameOver = false; 
        this.hideOverlay();
        
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        
        this.gameLoop = setInterval(() => {
            if (!this.isPaused) {
                this.update();
                this.draw();
            }
        }, this.config.speed);
        
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.innerHTML = '<span class="text-xl">🔄</span><span>Reiniciar</span>';
        }

        // FIX: Garante que o botão de pause resete visualmente ao reiniciar
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.innerHTML = '<span class="text-xl">⏸️</span><span>Pausar</span>';
        }
    },
    
    pauseGame() {
        if (!this.isPlaying) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.showOverlay();
        } else {
            this.hideOverlay();
        }
        
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            if (this.isPaused) {
                pauseBtn.innerHTML = '<span class="text-xl">▶️</span><span>Continuar</span>';
            } else {
                pauseBtn.innerHTML = '<span class="text-xl">⏸️</span><span>Pausar</span>';
            }
        }
    },
    
    resumeGame() {
        this.isPaused = false;
        this.hideOverlay();
        
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.innerHTML = '<span class="text-xl">⏸️</span><span>Pausar</span>';
        }
    },
    
    showOverlay() {
        const overlay = document.getElementById('game-overlay');
        if (overlay) overlay.classList.remove('hidden');
    },
    
    hideOverlay() {
        const overlay = document.getElementById('game-overlay');
        if (overlay) overlay.classList.add('hidden');
    },
    
    update() {
        this.direction = this.nextDirection;
        const head = this.getNewHead();
        
        if (this.checkCollision(head)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.spawnFood();
            
            if (this.score % 50 === 0 && this.config.speed > 50) {
                this.config.speed -= 5;
                clearInterval(this.gameLoop);
                this.gameLoop = setInterval(() => {
                    if (!this.isPaused) {
                        this.update();
                        this.draw();
                    }
                }, this.config.speed);
            }
        } else {
            this.snake.pop();
        }
    },
    
    getNewHead() {
        const head = { ...this.snake[0] };
        
        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        
        return head;
    },
    
    checkCollision(head) {
        if (head.x < 0 || head.x >= this.config.gridSize ||
            head.y < 0 || head.y >= this.config.gridSize) {
            return true;
        }
        
        return this.snake.some(segment => segment.x === head.x && segment.y === head.y);
    },
    
    draw() {
        if (!this.ctx) return;
        
        this.drawBackground();
        this.drawGrid();
        this.drawFood();
        this.drawSnake();
    },
    
    drawBackground() {
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, 400, 400);
    },
    
    drawGrid() {
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.config.gridSize; i++) {
            const pos = i * this.config.cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(pos, 0);
            this.ctx.lineTo(pos, 400);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(0, pos);
            this.ctx.lineTo(400, pos);
            this.ctx.stroke();
        }
    },
    
    drawSnake() {
        this.snake.forEach((segment, index) => {
            const isHead = index === 0;
            const x = segment.x * this.config.cellSize;
            const y = segment.y * this.config.cellSize;
            
            if (isHead) {
                const gradient = this.ctx.createRadialGradient(
                    x + 10, y + 10, 2,
                    x + 10, y + 10, 10
                );
                gradient.addColorStop(0, '#34d399');
                gradient.addColorStop(1, this.colors.snakeHead);
                
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = this.colors.snakeHead;
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(x + 1, y + 1, 18, 18);
                
                this.ctx.shadowBlur = 0;
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(x + 5, y + 6, 3, 3);
                this.ctx.fillRect(x + 12, y + 6, 3, 3);
                this.ctx.fillStyle = '#000000';
                this.ctx.fillRect(x + 6, y + 7, 2, 2);
                this.ctx.fillRect(x + 13, y + 7, 2, 2);
            } else {
                const ratio = index / this.snake.length;
                this.ctx.shadowBlur = 5;
                this.ctx.shadowColor = this.colors.snakeBody;
                
                const gradient = this.ctx.createLinearGradient(x, y, x + 20, y + 20);
                gradient.addColorStop(0, this.colors.snakeBody);
                gradient.addColorStop(1, this.colors.snakeBodyGradient);
                
                this.ctx.fillStyle = gradient;
                this.ctx.globalAlpha = 1 - (ratio * 0.3);
                this.ctx.fillRect(x + 2, y + 2, 16, 16);
                this.ctx.globalAlpha = 1;
            }
        });
        
        this.ctx.shadowBlur = 0;
    },
    
    drawFood() {
        const x = this.food.x * this.config.cellSize + 10;
        const y = this.food.y * this.config.cellSize + 10;
        
        const pulseSize = Math.sin(Date.now() / 200) * 2 + 8;
        
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = this.colors.foodGlow;
        
        this.ctx.fillStyle = this.colors.food;
        this.ctx.beginPath();
        this.ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.beginPath();
        this.ctx.arc(x - 2, y - 2, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#10b981';
        this.ctx.fillRect(x - 1, y - pulseSize - 2, 2, 3);
    },
    
    spawnFood() {
        do {
            this.food = {
                x: Math.floor(Math.random() * this.config.gridSize),
                y: Math.floor(Math.random() * this.config.gridSize)
            };
        } while (this.snake.some(s => s.x === this.food.x && s.y === this.food.y));
    },
    
    changeDirection(newDirection) {
        if (!this.isPlaying || this.isPaused || this._isGameOver) return;
        
        const opposites = {
            'up': 'down', 'down': 'up',
            'left': 'right', 'right': 'left'
        };
        
        if (opposites[newDirection] !== this.direction) {
            this.nextDirection = newDirection;
        }
    },
    
    updateScore() {
        const scoreEl = document.getElementById('score');
        if (scoreEl) scoreEl.textContent = this.score;
    },
    
    gameOver() {
        if (this._isGameOver) return; 
        this._isGameOver = true;
        
        this.isPlaying = false;
        this.isPaused = false;
        
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        
        this.hideOverlay();
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            Utils.saveData('snake_highscore', this.highScore);
            Utils.showNotification('🎉 Novo recorde: ' + this.score + ' pontos! にゃん~', 'success');
        } else {
            Utils.showNotification('💀 Game Over! Pontuação: ' + this.score, 'error');
        }
        
        this.config.speed = 100;
        
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.innerHTML = '<span class="text-xl">▶️</span><span>Iniciar</span>';
        }
        
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.innerHTML = '<span class="text-xl">⏸️</span><span>Pausar</span>';
        }
    },
    
    cleanup() {
        this.isPlaying = false;
        this.isPaused = false;
        this._isGameOver = false;
        
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        
        if (this._keydownHandler) {
            document.removeEventListener('keydown', this._keydownHandler);
            this._keydownHandler = null;
        }
        
        console.log('🐍 Cobrinha cleanup executado');
    }
};

window.MiniGame = MiniGame;