// Mini Game - Cobrinha ESTILIZADO
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
    
    render() {
        this.highScore = Utils.loadData('snake_highscore') || 0;
        
        return `
            <div class="bg-white rounded-2xl shadow-2xl p-8">
                <!-- Score Display -->
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
                
                <!-- Canvas Container -->
                <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 shadow-inner mb-6">
                    <canvas id="game-canvas" width="400" height="400" 
                            class="mx-auto rounded-xl shadow-2xl"
                            style="image-rendering: pixelated; image-rendering: crisp-edges;">
                    </canvas>
                </div>
                
                <!-- Controls -->
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
                
                <!-- Keyboard Controls -->
                <div class="bg-gray-100 rounded-xl p-6">
                    <h3 class="text-center font-bold text-gray-700 mb-4">⌨️ Controles</h3>
                    <div class="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                        <div></div>
                        <button onclick="MiniGame.changeDirection('up')"
                                class="bg-white border-2 border-gray-300 hover:border-green-500 py-3 rounded-lg font-bold text-2xl transition-all transform hover:scale-110 active:scale-95">
                            ⬆️
                        </button>
                        <div></div>
                        <button onclick="MiniGame.changeDirection('left')"
                                class="bg-white border-2 border-gray-300 hover:border-green-500 py-3 rounded-lg font-bold text-2xl transition-all transform hover:scale-110 active:scale-95">
                            ⬅️
                        </button>
                        <div></div>
                        <button onclick="MiniGame.changeDirection('right')"
                                class="bg-white border-2 border-gray-300 hover:border-green-500 py-3 rounded-lg font-bold text-2xl transition-all transform hover:scale-110 active:scale-95">
                            ➡️
                        </button>
                        <div></div>
                        <button onclick="MiniGame.changeDirection('down')"
                                class="bg-white border-2 border-gray-300 hover:border-green-500 py-3 rounded-lg font-bold text-2xl transition-all transform hover:scale-110 active:scale-95">
                            ⬇️
                        </button>
                        <div></div>
                    </div>
                    <p class="text-center text-sm text-gray-600 mt-4">
                        Use as setas do teclado ou clique nos botões
                    </p>
                </div>
            </div>
        `;
    },
    
    init() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas?.getContext('2d');
        
        if (!this.canvas || !this.ctx) return;
        
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
        
        this.resetGame();
        this.draw();
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
        }, 100);
        
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
        
        const head = { ...this.snake[0] };
        
        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        
        if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
            this.gameOver();
            return;
        }
        
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.spawnFood();
        } else {
            this.snake.pop();
        }
    },
    
    draw() {
        if (!this.ctx) return;
        
        // Background
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, 400, 400);
        
        // Grid lines (subtle)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= 20; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * 20, 0);
            this.ctx.lineTo(i * 20, 400);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * 20);
            this.ctx.lineTo(400, i * 20);
            this.ctx.stroke();
        }
        
        // Snake
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // Head with glow
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = '#4ade80';
                this.ctx.fillStyle = '#4ade80';
            } else {
                this.ctx.shadowBlur = 0;
                this.ctx.fillStyle = '#22c55e';
            }
            this.ctx.fillRect(segment.x * 20 + 2, segment.y * 20 + 2, 16, 16);
        });
        
        // Food with glow
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#ef4444';
        this.ctx.fillStyle = '#ef4444';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * 20 + 10,
            this.food.y * 20 + 10,
            8, 0, Math.PI * 2
        );
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    },
    
    spawnFood() {
        do {
            this.food = {
                x: Math.floor(Math.random() * 20),
                y: Math.floor(Math.random() * 20)
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