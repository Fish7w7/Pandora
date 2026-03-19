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

    // Itens especiais de comida
    foodTypes: {
        normal: { color: '#ef4444', glow: 'rgba(239,68,68,0.6)',  points: 10, symbol: '🍎', chance: 1.00 },
        star:   { color: '#f59e0b', glow: 'rgba(245,158,11,0.7)', points: 20, symbol: '⭐', chance: 0.20 },
        gem:    { color: '#8b5cf6', glow: 'rgba(139,92,246,0.8)', points: 30, symbol: '💎', chance: 0.07 },
    },
    currentFoodType: 'normal',
    _stars: null,

    // Cores do jogo
    colors: {
        background:         '#080d1a',
        bgGlow1:            'rgba(16,185,129,0.04)',
        bgGlow2:            'rgba(139,92,246,0.04)',
        grid:               'rgba(148,163,184,0.05)',
        snakeHead:          '#10b981',
        snakeBody:          '#059669',
        snakeBodyGradient:  '#047857',
        food:               '#ef4444',
        foodGlow:           'rgba(239,68,68,0.5)'
    },
    
    render() {
        this.highScore = Utils.loadData('snake_highscore') || 0;
        
        return `
            <div class="max-w-3xl mx-auto" style="position:relative;">
                <!-- Fundo decorativo — visível só no tema claro -->
                <div style="
                    position:fixed; inset:0; z-index:-1; pointer-events:none;
                    background: radial-gradient(ellipse at 30% 20%, rgba(16,185,129,0.06) 0%, transparent 50%),
                                radial-gradient(ellipse at 70% 80%, rgba(5,150,105,0.04) 0%, transparent 50%);
                "></div>
                ${this.renderHeader()}
                ${this.renderGameContainer()}
                ${this.renderStats()}
            </div>
        `;
    },
    
    renderHeader() {
        return `
            <div class="text-center mb-4">
                <div class="inline-flex items-center gap-3 mb-1">
                    <div class="text-3xl">🐍</div>
                    <h1 class="text-2xl font-black bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        Cobrinha にゃん~
                    </h1>
                </div>
                <p class="text-gray-500 dark:text-gray-400 text-xs">Use as setas do teclado ou clique nos botões</p>
            </div>
        `;
    },

    renderGameContainer() {
        return `
            <div style="
                background: linear-gradient(135deg, #0d1117 0%, #0f172a 50%, #0d1117 100%);
                border: 1px solid rgba(16,185,129,0.15);
                border-radius: 20px;
                padding: 1rem;
                margin-bottom: 1rem;
                box-shadow: 0 0 40px rgba(16,185,129,0.05), 0 20px 60px rgba(0,0,0,0.5);
            ">
                ${this.renderScoreDisplay()}
                ${this.renderCanvas()}
                ${this.renderControls()}
            </div>
        `;
    },

    renderScoreDisplay() {
        const foodType = this.foodTypes[this.currentFoodType] || this.foodTypes.normal;
        const multiplierBadge = this.currentFoodType !== 'normal'
            ? `<span style="
                background: linear-gradient(135deg, ${foodType.color}33, ${foodType.color}22);
                border: 1px solid ${foodType.color}66;
                color: ${foodType.color};
                font-size: 0.65rem; font-weight: 800;
                padding: 2px 8px; border-radius: 999px;
                margin-left: 0.5rem;
              ">${foodType.symbol} x${foodType.points / 10}</span>`
            : '';

        return `
            <div style="display:flex; gap:0.75rem; margin-bottom:0.75rem;">
                <div style="
                    flex:1; background:linear-gradient(135deg,rgba(16,185,129,0.15),rgba(5,150,105,0.1));
                    border:1px solid rgba(16,185,129,0.2); border-radius:12px; padding:0.625rem 0.875rem;
                ">
                    <div style="font-size:0.65rem; font-weight:700; color:rgba(16,185,129,0.7); text-transform:uppercase; letter-spacing:0.08em;">Pontuação</div>
                    <div style="font-size:1.4rem; font-weight:900; color:white; line-height:1;" id="score">0</div>
                    ${multiplierBadge}
                </div>
                <div style="
                    flex:1; background:linear-gradient(135deg,rgba(245,158,11,0.15),rgba(217,119,6,0.1));
                    border:1px solid rgba(245,158,11,0.2); border-radius:12px; padding:0.625rem 0.875rem;
                ">
                    <div style="font-size:0.65rem; font-weight:700; color:rgba(245,158,11,0.7); text-transform:uppercase; letter-spacing:0.08em;">🏆 Recorde</div>
                    <div style="font-size:1.4rem; font-weight:900; color:white; line-height:1;">${this.highScore}</div>
                </div>
            </div>
        `;
    },

    renderCanvas() {
        return `
            <div style="position:relative; border-radius:12px; overflow:hidden; margin-bottom:0.75rem;
                        box-shadow: 0 0 0 1px rgba(16,185,129,0.1), inset 0 0 40px rgba(0,0,0,0.4);">
                <canvas id="game-canvas" width="400" height="400"
                        style="display:block; margin:0 auto; image-rendering:pixelated; image-rendering:crisp-edges; background:#080d1a; border-radius:4px;">
                </canvas>
                <div id="game-overlay" style="
                    display:none; position:absolute; inset:0; align-items:center; justify-content:center;
                    background:rgba(0,0,0,0.65); backdrop-filter:blur(4px);
                ">
                    <div style="text-align:center; color:white;">
                        <div style="font-size:3rem; margin-bottom:0.5rem;">⏸️</div>
                        <div style="font-size:1.2rem; font-weight:900;">Pausado</div>
                        <div style="font-size:0.75rem; opacity:0.6; margin-top:0.25rem;">Pressione Iniciar para continuar</div>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderControls() {
        return `
            <div style="display:flex; gap:0.5rem;">
                <button id="start-btn" onclick="MiniGame.startGame()" style="
                    flex:1; background:linear-gradient(135deg,#10b981,#059669);
                    border:none; border-radius:10px; color:white;
                    padding:0.6rem; font-size:0.875rem; font-weight:700;
                    cursor:pointer; display:flex; align-items:center; justify-content:center; gap:0.375rem;
                    box-shadow:0 4px 16px rgba(16,185,129,0.3);
                ">▶ Iniciar</button>
                <button id="pause-btn" onclick="MiniGame.pauseGame()" style="
                    flex:1; background:linear-gradient(135deg,#f59e0b,#d97706);
                    border:none; border-radius:10px; color:white;
                    padding:0.6rem; font-size:0.875rem; font-weight:700;
                    cursor:pointer; display:flex; align-items:center; justify-content:center; gap:0.375rem;
                    box-shadow:0 4px 16px rgba(245,158,11,0.3);
                ">⏸ Pausar</button>
            </div>
        `;
    },

    renderStats() {
        return `
            <div style="
                background:linear-gradient(135deg,#0d1117,#0f172a);
                border:1px solid rgba(255,255,255,0.07);
                border-radius:16px; padding:0.875rem; text-align:center;
            ">
                <div style="font-size:0.65rem; font-weight:800; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.3); margin-bottom:0.75rem;">Controles</div>
                <div style="display:flex; flex-direction:column; align-items:center; gap:0.375rem;">
                    <button onclick="MiniGame.changeDirection('up')" style="
                        width:36px; height:36px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);
                        border-radius:8px; color:white; cursor:pointer; font-size:0.875rem;
                    ">↑</button>
                    <div style="display:flex; gap:0.375rem;">
                        <button onclick="MiniGame.changeDirection('left')" style="
                            width:36px; height:36px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);
                            border-radius:8px; color:white; cursor:pointer; font-size:0.875rem;
                        ">←</button>
                        <button onclick="MiniGame.changeDirection('down')" style="
                            width:36px; height:36px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);
                            border-radius:8px; color:white; cursor:pointer; font-size:0.875rem;
                        ">↓</button>
                        <button onclick="MiniGame.changeDirection('right')" style="
                            width:36px; height:36px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);
                            border-radius:8px; color:white; cursor:pointer; font-size:0.875rem;
                        ">→</button>
                    </div>
                </div>
                <div style="margin-top:0.75rem; font-size:0.65rem; color:rgba(255,255,255,0.2);">
                    Use setas ou WASD · Espaço para pausar
                </div>
                <div style="margin-top:0.5rem; display:flex; justify-content:center; gap:1rem;">
                    <span style="font-size:0.65rem; color:rgba(255,255,255,0.25);">🍎 +10pts</span>
                    <span style="font-size:0.65rem; color:rgba(245,158,11,0.5);">⭐ +20pts</span>
                    <span style="font-size:0.65rem; color:rgba(139,92,246,0.5);">💎 +30pts</span>
                </div>
            </div>
        `;
    },
    
    init() {
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) { console.error('Canvas não encontrado'); return; }
        this.ctx = this.canvas.getContext('2d');
        this._generateStars();
        this.resetGame();
        this.setupKeyboardListeners();
        this.draw();
        console.log('🐍 Cobrinha inicializado');
    },

    _generateStars() {
        this._stars = Array.from({ length: 40 }, () => ({
            x: Math.random() * 400,
            y: Math.random() * 400,
            r: Math.random() * 1.2 + 0.3,
            a: Math.random() * 0.5 + 0.1,
        }));
    },

    draw() {
        if (!this.ctx) return;
        this.drawBackground();
        this.drawGrid();
        this.drawFood();
        this.drawSnake();
    },

    drawBackground() {
        const ctx = this.ctx;
        // Fundo base
        ctx.fillStyle = this.colors.background;
        ctx.fillRect(0, 0, 400, 400);

        // Brilhos atmosféricos nos cantos
        const g1 = ctx.createRadialGradient(0, 0, 0, 0, 0, 200);
        g1.addColorStop(0, this.colors.bgGlow1);
        g1.addColorStop(1, 'transparent');
        ctx.fillStyle = g1;
        ctx.fillRect(0, 0, 400, 400);

        const g2 = ctx.createRadialGradient(400, 400, 0, 400, 400, 220);
        g2.addColorStop(0, this.colors.bgGlow2);
        g2.addColorStop(1, 'transparent');
        ctx.fillStyle = g2;
        ctx.fillRect(0, 0, 400, 400);

        // Estrelas
        if (this._stars) {
            this._stars.forEach(s => {
                ctx.globalAlpha = s.a;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;
        }
    },

    drawGrid() {
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 0.5;
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
            const cs = this.config.cellSize;

            if (isHead) {
                this.ctx.shadowBlur = 16;
                this.ctx.shadowColor = this.colors.snakeHead;
                const gradient = this.ctx.createRadialGradient(x+cs/2, y+cs/2, 2, x+cs/2, y+cs/2, cs/2);
                gradient.addColorStop(0, '#34d399');
                gradient.addColorStop(1, this.colors.snakeHead);
                this.ctx.fillStyle = gradient;
                this._roundRect(x+1, y+1, cs-2, cs-2, 5);
                this.ctx.shadowBlur = 0;

                // Olhos
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(x+5, y+6, 3, 3);
                this.ctx.fillRect(x+12, y+6, 3, 3);
                this.ctx.fillStyle = '#000000';
                this.ctx.fillRect(x+6, y+7, 2, 2);
                this.ctx.fillRect(x+13, y+7, 2, 2);
            } else {
                const ratio = index / this.snake.length;
                this.ctx.shadowBlur = 4;
                this.ctx.shadowColor = this.colors.snakeBody;
                const gradient = this.ctx.createLinearGradient(x, y, x+cs, y+cs);
                gradient.addColorStop(0, this.colors.snakeBody);
                gradient.addColorStop(1, this.colors.snakeBodyGradient);
                this.ctx.fillStyle = gradient;
                this.ctx.globalAlpha = 1 - (ratio * 0.35);
                this._roundRect(x+2, y+2, cs-4, cs-4, 4);
                this.ctx.globalAlpha = 1;

                // Escama sutil no centro
                if (index % 2 === 0) {
                    this.ctx.fillStyle = 'rgba(255,255,255,0.06)';
                    this._roundRect(x+5, y+5, cs-10, cs-10, 2);
                }
            }
        });
        this.ctx.shadowBlur = 0;
    },

    // Helper: retângulo com bordas arredondadas
    _roundRect(x, y, w, h, r) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + r, y);
        this.ctx.lineTo(x + w - r, y);
        this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        this.ctx.lineTo(x + w, y + h - r);
        this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.ctx.lineTo(x + r, y + h);
        this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        this.ctx.lineTo(x, y + r);
        this.ctx.quadraticCurveTo(x, y, x + r, y);
        this.ctx.closePath();
        this.ctx.fill();
    },

    drawFood() {
        const ft = this.foodTypes[this.currentFoodType] || this.foodTypes.normal;
        const x = this.food.x * this.config.cellSize + 10;
        const y = this.food.y * this.config.cellSize + 10;
        const pulse = Math.sin(Date.now() / 220) * 2 + 8;

        this.ctx.shadowBlur = this.currentFoodType === 'gem' ? 30 : 18;
        this.ctx.shadowColor = ft.glow;
        this.ctx.fillStyle = ft.color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, pulse, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        // Brilho
        this.ctx.fillStyle = 'rgba(255,255,255,0.35)';
        this.ctx.beginPath();
        this.ctx.arc(x - 2, y - 2, 3, 0, Math.PI * 2);
        this.ctx.fill();

        // Haste da maçã / detalhe
        this.ctx.fillStyle = '#10b981';
        this.ctx.fillRect(x - 1, y - pulse - 2, 2, 3);

        // Anel extra para itens especiais
        if (this.currentFoodType !== 'normal') {
            this.ctx.strokeStyle = ft.color;
            this.ctx.lineWidth = 1.5;
            this.ctx.globalAlpha = 0.4;
            this.ctx.beginPath();
            this.ctx.arc(x, y, pulse + 5, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.globalAlpha = 1;
        }
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
        if (overlay) overlay.style.display = 'flex';
    },

    hideOverlay() {
        const overlay = document.getElementById('game-overlay');
        if (overlay) overlay.style.display = 'none';
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
            const ft = this.foodTypes[this.currentFoodType] || this.foodTypes.normal;
            this.score += ft.points;
            this.updateScore();

            if (this.currentFoodType !== 'normal') {
                Utils.showNotification?.(`${ft.symbol} +${ft.points} pontos! にゃん~`, 'success');
            }

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

    spawnFood() {
        const r = Math.random();
        if (r < this.foodTypes.gem.chance) {
            this.currentFoodType = 'gem';
        } else if (r < this.foodTypes.star.chance) {
            this.currentFoodType = 'star';
        } else {
            this.currentFoodType = 'normal';
        }
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