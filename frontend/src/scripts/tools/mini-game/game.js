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
    
    // Configurações do jogo
    config: {
        gridSize: 20,
        cellSize: 20,
        speed: 100,
        initialSnakeLength: 3
    },
    
    // Cores do jogo
    colors: {
        background: '#1a1a2e',
        grid: 'rgba(255, 255, 255, 0.05)',
        snakeHead: '#4ade80',
        snakeBody: '#22c55e',
        food: '#ef4444'
    },
    
    render() {
        this.highScore = Utils.loadData('snake_highscore') || 0;
        
        return `
            <div class="bg-white rounded-2xl shadow-2xl p-8">
                ${this.renderScoreDisplay()}
                ${this.renderCanvas()}
                ${this.renderControls()}
                ${this.renderKeyboardHint()}
            </div>
        `;
    },
    
    renderScoreDisplay() {
        return `
            <div class="flex justify-between items-center mb-6">
                <div class="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg">
                    <div class="text-sm font-semibold opacity-90">Pontuação</div>
                    <div class="text-3xl font-black" id="score">0</div>
                </div>
                <div class="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-6 py-3 rounded-xl shadow-lg">
                    <div class="text-sm font-semibold opacity-90">🏆 Recorde</div>
                    <div class="text-3xl font-black">${this.highScore}</div>
                </div>
            </div>
        `;
    },
    
    renderCanvas() {
        return `
            <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 shadow-inner mb-6">
                <canvas id="game-canvas" width="400" height="400" 
                        class="mx-auto rounded-xl shadow-2xl"
                        style="image-rendering: pixelated; image-rendering: crisp-edges;">
                </canvas>
            </div>
        `;
    },
    
    renderControls() {
        return `
            <div class="flex gap-3 mb-6">
                <button onclick="MiniGame.startGame()" id="start-btn"
                        class="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center gap-2">
                    <span>▶️</span>
                    <span>Iniciar</span>
                </button>
                <button onclick="MiniGame.pauseGame()"
                        class="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center gap-2">
                    <span>⏸️</span>
                    <span>Pausar</span>
                </button>
            </div>
        `;
    },
    
    renderKeyboardHint() {
        return `
            <div class="bg-gray-100 rounded-xl p-6">
                <h3 class="text-center font-bold text-gray-700 mb-4">⌨️ Controles</h3>
                <div class="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                    ${this.renderArrowButton('', 1)}
                    ${this.renderArrowButton('up', 1)}
                    ${this.renderArrowButton('', 1)}
                    ${this.renderArrowButton('left', 2)}
                    ${this.renderArrowButton('', 2)}
                    ${this.renderArrowButton('right', 2)}
                    ${this.renderArrowButton('', 3)}
                    ${this.renderArrowButton('down', 3)}
                    ${this.renderArrowButton('', 3)}
                </div>
                <p class="text-center text-sm text-gray-600 mt-4">
                    Use as setas do teclado ou clique nos botões
                </p>
            </div>
        `;
    },
    
    renderArrowButton(direction, row) {
        if (!direction) return '<div></div>';
        
        const arrows = {
            up: '⬆️',
            down: '⬇️',
            left: '⬅️',
            right: '➡️'
        };
        
        return `
            <button onclick="MiniGame.changeDirection('${direction}')"
                    class="bg-white border-2 border-gray-300 hover:border-green-500 py-3 rounded-lg font-bold text-2xl transition-all transform hover:scale-110 active:scale-95">
                ${arrows[direction]}
            </button>
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
            if (!this.isPlaying) return;
            
            const keyMap = {
                'ArrowUp': 'up',
                'ArrowDown': 'down',
                'ArrowLeft': 'left',
                'ArrowRight': 'right'
            };
            
            if (keyMap[e.key]) {
                e.preventDefault();
                this.changeDirection(keyMap[e.key]);
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
        this.spawnFood();
        this.updateScore();
    },
    
    startGame() {
        if (this.isPlaying) return;
        
        this.resetGame();
        this.isPlaying = true;
        
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, this.config.speed);
        
        document.getElementById('start-btn').textContent = '🔄 Reiniciar';
    },
    
    pauseGame() {
        this.isPlaying = false;
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
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
        this.drawSnake();
        this.drawFood();
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
            if (index === 0) {
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = this.colors.snakeHead;
                this.ctx.fillStyle = this.colors.snakeHead;
            } else {
                this.ctx.shadowBlur = 0;
                this.ctx.fillStyle = this.colors.snakeBody;
            }
            
            this.ctx.fillRect(
                segment.x * this.config.cellSize + 2, 
                segment.y * this.config.cellSize + 2, 
                16, 16
            );
        });
    },
    
    drawFood() {
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = this.colors.food;
        this.ctx.fillStyle = this.colors.food;
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.config.cellSize + 10,
            this.food.y * this.config.cellSize + 10,
            8, 0, Math.PI * 2
        );
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
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
        this.pauseGame();
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            Utils.saveData('snake_highscore', this.highScore);
            Utils.showNotification('🎉 Novo recorde: ' + this.score + ' pontos!', 'success');
        } else {
            Utils.showNotification('💀 Game Over! Pontuação: ' + this.score, 'error');
        }
    }
};

window.MiniGame = MiniGame;