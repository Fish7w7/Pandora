// Mini Game - Cobrinha Otimizado にゃん~
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
                <p class="text-gray-600 text-sm">Use as setas do teclado ou clique nos botões</p>
            </div>
        `;
    },
    
    renderGameContainer() {
        return `
            <div class="bg-white rounded-2xl shadow-xl p-4 mb-4">
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
            <div class="grid grid-cols-2 gap-3 mb-4">
                <button onclick="MiniGame.startGame()" id="start-btn"
                        class="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                    <span class="text-xl">▶️</span>
                    <span>Iniciar</span>
                </button>
                <button onclick="MiniGame.pauseGame()" id="pause-btn"
                        class="bg-gradient-to-r from-orange-500 to-amber-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                    <span class="text-xl">⏸️</span>
                    <span>Pausar</span>
                </button>
            </div>
            
            <div class="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                <div></div>
                ${this.renderArrowButton('up')}
                <div></div>
                ${this.renderArrowButton('left')}
                <div class="flex items-center justify-center">
                    <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs font-bold">
                        WASD
                    </div>
                </div>
                ${this.renderArrowButton('right')}
                <div></div>
                ${this.renderArrowButton('down')}
                <div></div>
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
            <button onclick="MiniGame.changeDirection('${direction}')"
                    class="bg-white border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 py-3 rounded-lg transition-all transform hover:scale-110 active:scale-95 group"
                    title="${keys[direction]}">
                <div class="text-2xl">${arrows[direction]}</div>
                <div class="text-xs text-gray-400 group-hover:text-green-600 font-semibold">${keys[direction]}</div>
            </button>
        `;
    },
    
    renderStats() {
        return `
            <div class="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl shadow-xl p-4 text-white">
                <div class="flex items-center justify-between text-sm">
                    <div class="flex items-center gap-2">
                        <span class="text-xl">💡</span>
                        <span class="font-semibold">Dica:</span>
                    </div>
                    <span class="opacity-90">Coma as maçãs vermelhas para crescer!</span>
                </div>
            </div>
        `;
    },
    
    init() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas?.getContext('2d');
        
        if (!this.canvas || !this.ctx) return;
        
        this.setupKeyboardListeners();
        this.resetGame();
        this.draw();
    },
    
    setupKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            if (!this.isPlaying || this.isPaused) {
                // Espaço ou Enter inicia/continua o jogo
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    if (!this.isPlaying) {
                        this.startGame();
                    } else if (this.isPaused) {
                        this.resumeGame();
                    }
                    return;
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
            
            // P ou Espaço pausa o jogo
            if (e.key === 'p' || e.key === 'P' || e.key === ' ') {
                e.preventDefault();
                this.pauseGame();
            }
        });
    },
    
    resetGame() {
        this.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.isPaused = false;
        this.spawnFood();
        this.updateScore();
        this.hideOverlay();
    },
    
    startGame() {
        if (this.isPlaying && !this.isPaused) {
            // Se já está jogando, reinicia
            this.pauseGame();
            this.resetGame();
        }
        
        this.isPlaying = true;
        this.isPaused = false;
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
        
        if (this.checkFoodCollision(head)) {
            this.score += 10;
            this.updateScore();
            this.spawnFood();
            
            // Aumenta velocidade gradualmente
            if (this.score % 50 === 0 && this.config.speed > 50) {
                clearInterval(this.gameLoop);
                this.config.speed -= 5;
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
        
        const moves = {
            up: () => head.y--,
            down: () => head.y++,
            left: () => head.x--,
            right: () => head.x++
        };
        
        moves[this.direction]();
        return head;
    },
    
    checkCollision(head) {
        return head.x < 0 || 
               head.x >= this.config.gridSize || 
               head.y < 0 || 
               head.y >= this.config.gridSize ||
               this.snake.some(segment => segment.x === head.x && segment.y === head.y);
    },
    
    checkFoodCollision(head) {
        return head.x === this.food.x && head.y === this.food.y;
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
                // Cabeça com gradiente e brilho
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
                
                // Olhos da cobrinha
                this.ctx.shadowBlur = 0;
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(x + 5, y + 6, 3, 3);
                this.ctx.fillRect(x + 12, y + 6, 3, 3);
                this.ctx.fillStyle = '#000000';
                this.ctx.fillRect(x + 6, y + 7, 2, 2);
                this.ctx.fillRect(x + 13, y + 7, 2, 2);
            } else {
                // Corpo com gradiente baseado na posição
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
        
        // Maçã com brilho pulsante
        const pulseSize = Math.sin(Date.now() / 200) * 2 + 8;
        
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = this.colors.foodGlow;
        
        // Corpo da maçã
        this.ctx.fillStyle = this.colors.food;
        this.ctx.beginPath();
        this.ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Reflexo
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.beginPath();
        this.ctx.arc(x - 2, y - 2, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Folhinha
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
        this.isPlaying = false;
        this.isPaused = false;
        
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        
        // IMPORTANTE: esconder overlay antes de mostrar notificação
        this.hideOverlay();
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            Utils.saveData('snake_highscore', this.highScore);
            Utils.showNotification('🎉 Novo recorde: ' + this.score + ' pontos! にゃん~', 'success');
        } else {
            Utils.showNotification('💀 Game Over! Pontuação: ' + this.score, 'error');
        }
        
        // Reset da velocidade
        this.config.speed = 100;
        
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.innerHTML = '<span class="text-xl">▶️</span><span>Iniciar</span>';
        }
    }
};

window.MiniGame = MiniGame;