// ============================================
// 🦅 FLAPPY BIRD - NyanTools にゃん~
// Versão Otimizada v2.0
// ============================================

const FlappyBird = {
    // Canvas e contexto
    canvas: null,
    ctx: null,
    
    // Estados do jogo
    isPlaying: false,
    gameOver: false,
    isPaused: false,
    score: 0,
    highScore: 0,
    
    // Configurações do pássaro (balanceadas)
    bird: {
        x: 80, y: 250, width: 34, height: 24,
        velocity: 0, gravity: 0.45, jumpStrength: -8.5,
        rotation: 0, maxRotation: 90, minRotation: -25
    },
    
    // Configurações dos canos (balanceadas)
    pipes: [],
    pipeWidth: 70,
    pipeGap: 200,
    pipeSpeed: 2,
    pipeFrequency: 110,
    frameCount: 0,
    
    // Sistema de cores centralizado
    colors: {
        sky: '#87CEEB', skyLight: '#E0F6FF',
        ground: '#DEB887', groundDark: '#CD853F',
        bird: '#FFD700', birdOutline: '#FFA500',
        pipe: '#228B22', pipeDark: '#1B5E20', pipeLight: '#2E7D32',
        white: '#FFFFFF', black: '#000000'
    },
    
    // Sistema de partículas
    particles: [],
    maxParticles: 30,
    
    // Animação
    animationFrame: null,
    lastTime: 0,
    
    // ============================================
    // RENDER PRINCIPAL
    // ============================================
    
    render() {
        this.highScore = Utils.loadData('flappy_bird_highscore') || 0;
        
        return `
            <div class="max-w-4xl mx-auto">
                ${this.renderHeader()}
                ${this.renderScoreDisplay()}
                ${this.renderCanvasContainer()}
                ${this.renderControls()}
                ${this.renderInfo()}
            </div>
        `;
    },
    
    renderHeader() {
        return `
            <div class="text-center mb-6">
                <div class="inline-flex items-center gap-3 mb-3">
                    <div class="text-5xl">🦅</div>
                    <h1 class="text-4xl font-black bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                        Flappy Bird
                    </h1>
                </div>
                <p class="text-gray-600 font-semibold">Teste seus reflexos! にゃん~</p>
            </div>
        `;
    },
    
    renderScoreDisplay() {
        return `
            <div class="grid grid-cols-2 gap-3 mb-4">
                <div class="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-4 text-white shadow-xl text-center">
                    <div class="text-xs font-semibold opacity-80 mb-1">PONTUAÇÃO</div>
                    <div class="text-5xl font-black" id="flappy-score">0</div>
                </div>
                <div class="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-4 text-white shadow-xl text-center">
                    <div class="text-xs font-semibold opacity-80 mb-1">🏆 RECORDE</div>
                    <div class="text-5xl font-black">${this.highScore}</div>
                </div>
            </div>
        `;
    },
    
    renderCanvasContainer() {
        return `
            <div class="bg-gradient-to-b from-sky-400 to-sky-300 rounded-2xl p-3 shadow-2xl mb-4 relative overflow-hidden">
                <canvas id="flappy-canvas" 
                        class="mx-auto rounded-lg shadow-xl cursor-pointer relative z-10 touch-none"
                        style="image-rendering: crisp-edges; max-width: 100%; display: block;">
                </canvas>
                
                <div id="flappy-overlay" class="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <div class="text-center bg-black/50 backdrop-blur-sm rounded-2xl p-6">
                        <div class="text-4xl font-black text-white mb-3" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                            PRONTO?
                        </div>
                        <div class="text-lg font-semibold text-white/90">
                            Toque para começar
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderControls() {
        return `
            <div class="flex gap-2 mb-4">
                <button onclick="FlappyBird.startGame()" 
                        id="flappy-start-btn"
                        class="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all">
                    ▶️ Iniciar
                </button>
                <button onclick="FlappyBird.togglePause()" 
                        id="flappy-pause-btn"
                        style="display: none;"
                        class="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all">
                    ⸏️ Pausar
                </button>
            </div>
        `;
    },
    
    renderInfo() {
        return `
            <div class="bg-white rounded-xl shadow-lg p-4">
                <div class="grid grid-cols-3 gap-3 text-center text-sm">
                    <div class="bg-blue-50 rounded-lg p-3">
                        <div class="text-2xl mb-1">🖱️</div>
                        <div class="font-bold text-blue-800">Click</div>
                    </div>
                    <div class="bg-purple-50 rounded-lg p-3">
                        <div class="text-2xl mb-1">⌨️</div>
                        <div class="font-bold text-purple-800">Espaço</div>
                    </div>
                    <div class="bg-green-50 rounded-lg p-3">
                        <div class="text-2xl mb-1">📱</div>
                        <div class="font-bold text-green-800">Touch</div>
                    </div>
                </div>
                
                <div class="mt-3 text-center text-gray-600 text-sm">
                    <strong>Dica:</strong> Timing é tudo! Toque rápido para controle preciso.
                </div>
            </div>
        `;
    },
    
    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    
    init() {
        console.log('🎮 Iniciando Flappy Bird...');
        
        this.canvas = document.getElementById('flappy-canvas');
        if (!this.canvas) {
            console.error('❌ Canvas não encontrado!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.setupCanvas();
        this.setupEventListeners();
        this.drawInitialState();
        
        console.log('✅ Flappy Bird inicializado!');
    },
    
    setupCanvas() {
        const container = this.canvas.parentElement;
        const maxWidth = Math.min(container.clientWidth - 24, 500);
        
        this.canvas.width = maxWidth;
        this.canvas.height = Math.min(600, window.innerHeight * 0.6);
        
        this.bird.x = this.canvas.width * 0.2;
        this.bird.y = this.canvas.height / 2;
    },
    
    setupEventListeners() {
        const handleInput = (e) => {
            e.preventDefault();
            
            if (!this.isPlaying && !this.gameOver) {
                this.startGame();
            } else if (this.isPlaying && !this.gameOver && !this.isPaused) {
                this.flap();
            } else if (this.gameOver) {
                this.restartGame();
            }
        };
        
        // Canvas events
        this.canvas.addEventListener('click', handleInput);
        this.canvas.addEventListener('touchstart', handleInput, { passive: false });
        
        // Keyboard
        this.keyHandler = (e) => {
            if (e.code === 'Space') {
                handleInput(e);
            } else if (e.code === 'KeyP' && this.isPlaying && !this.gameOver) {
                e.preventDefault();
                this.togglePause();
            }
        };
        document.addEventListener('keydown', this.keyHandler);
        
        // Responsividade
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (!this.isPlaying) {
                    this.setupCanvas();
                    this.drawInitialState();
                }
            }, 250);
        });
    },
    
    // ============================================
    // CONTROLE DO JOGO
    // ============================================
    
    startGame() {
        if (this.isPlaying) return;
        
        // Limpar estado anterior
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        // Reset completo
        this.score = 0;
        this.bird.y = this.canvas.height / 2;
        this.bird.velocity = 0;
        this.bird.rotation = 0;
        this.pipes = [];
        this.particles = [];
        this.frameCount = 0;
        this.pipeSpeed = 2;
        this.updateScore();
        
        // Estados
        this.isPlaying = true;
        this.gameOver = false;
        this.isPaused = false;
        
        // UI
        this.updateUI({ overlay: 'none', startBtn: '🔄 Reiniciar', pauseBtn: 'block' });
        
        // Primeiro pulo
        this.flap();
        
        // Loop
        this.lastTime = performance.now();
        this.animationFrame = requestAnimationFrame((time) => this.gameLoop(time));
        
        Utils.showNotification?.('🦅 Boa sorte! にゃん~', 'success');
    },
    
    togglePause() {
        if (!this.isPlaying || this.gameOver) return;
        
        this.isPaused = !this.isPaused;
        const btn = document.getElementById('flappy-pause-btn');
        
        if (this.isPaused) {
            btn.innerHTML = '▶️ Continuar';
            Utils.showNotification?.('⸏️ Pausado', 'info');
        } else {
            btn.innerHTML = '⸏️ Pausar';
            this.lastTime = performance.now();
            this.gameLoop();
        }
    },
    
    restartGame() {
        console.log('🔄 Reiniciando jogo...');
        this.gameOver = false;
        this.isPlaying = false;
        
        this.drawInitialState();
        setTimeout(() => this.startGame(), 100);
    },
    
    flap() {
        this.bird.velocity = this.bird.jumpStrength;
        
        // Partículas
        if (this.particles.length < this.maxParticles) {
            for (let i = 0; i < 3; i++) {
                this.particles.push({
                    x: this.bird.x,
                    y: this.bird.y + this.bird.height / 2,
                    vx: -2 - Math.random(),
                    vy: Math.random() * 4 - 2,
                    life: 1,
                    size: 2 + Math.random() * 2
                });
            }
        }
    },
    
    // ============================================
    // LOOP DE JOGO
    // ============================================
    
    gameLoop(currentTime = 0) {
        if (!this.isPlaying || this.isPaused) return;
        if (this.gameOver) {
            cancelAnimationFrame(this.animationFrame);
            return;
        }
        
        const deltaTime = Math.min((currentTime - this.lastTime) / 16.67, 2);
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.draw();
        
        if (this.isPlaying && !this.gameOver && !this.isPaused) {
            this.animationFrame = requestAnimationFrame((time) => this.gameLoop(time));
        }
    },
    
    update(deltaTime = 1) {
        // Pássaro
        this.updateBird(deltaTime);
        
        // Canos
        this.updatePipes(deltaTime);
        
        // Partículas
        this.updateParticles(deltaTime);
    },
    
    updateBird(deltaTime) {
        this.bird.velocity += this.bird.gravity * deltaTime;
        this.bird.y += this.bird.velocity * deltaTime;
        
        // Rotação
        const targetRotation = Math.min(Math.max(this.bird.velocity * 3, this.bird.minRotation), this.bird.maxRotation);
        this.bird.rotation += (targetRotation - this.bird.rotation) * 0.2;
        
        // Colisão chão/teto
        const groundY = this.canvas.height - 60;
        if (this.bird.y + this.bird.height > groundY || this.bird.y < 0) {
            this.endGame();
        }
    },
    
    updatePipes(deltaTime) {
        // Spawnar canos
        this.frameCount++;
        if (this.frameCount % this.pipeFrequency === 0) {
            this.spawnPipe();
        }
        
        // Atualizar canos
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.pipeSpeed * deltaTime;
            
            // Pontuação
            if (!pipe.scored && pipe.x + this.pipeWidth < this.bird.x) {
                pipe.scored = true;
                this.score++;
                this.updateScore();
                this.createScoreEffect();
                
                // Aumentar dificuldade
                if (this.score % 10 === 0 && this.pipeSpeed < 4) {
                    this.pipeSpeed += 0.25;
                }
            }
            
            // Remover/colisão
            if (pipe.x + this.pipeWidth < -10) {
                this.pipes.splice(i, 1);
            } else if (this.checkCollision(pipe)) {
                this.endGame();
                return;
            }
        }
    },
    
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;
            p.vy += 0.15 * deltaTime;
            p.life -= 0.015 * deltaTime;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    },
    
    spawnPipe() {
        const minGap = 80;
        const maxGap = this.canvas.height - 140;
        const topHeight = minGap + Math.random() * (maxGap - minGap - this.pipeGap);
        
        this.pipes.push({
            x: this.canvas.width,
            topHeight: topHeight,
            scored: false
        });
    },
    
    checkCollision(pipe) {
        const hitbox = {
            x: this.bird.x + 6,
            y: this.bird.y + 4,
            w: this.bird.width - 12,
            h: this.bird.height - 8
        };
        
        if (hitbox.x + hitbox.w > pipe.x && hitbox.x < pipe.x + this.pipeWidth) {
            if (hitbox.y < pipe.topHeight || hitbox.y + hitbox.h > pipe.topHeight + this.pipeGap) {
                return true;
            }
        }
        return false;
    },
    
    // ============================================
    // DESENHO
    // ============================================
    
    draw() {
        this.drawBackground();
        this.pipes.forEach(pipe => this.drawPipe(pipe));
        this.drawGround();
        this.drawBird();
        this.drawParticles();
        this.drawScore();
    },
    
    drawInitialState() {
        this.drawBackground();
        this.drawGround();
        this.drawBird();
    },
    
    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, this.colors.sky);
        gradient.addColorStop(1, this.colors.skyLight);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawClouds();
    },
    
    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        const positions = [
            [this.canvas.width * 0.2, this.canvas.height * 0.15, 40],
            [this.canvas.width * 0.6, this.canvas.height * 0.25, 50],
            [this.canvas.width * 0.85, this.canvas.height * 0.12, 35]
        ];
        
        positions.forEach(([x, y, size]) => {
            this.ctx.beginPath();
            this.ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
            this.ctx.arc(x + size * 0.4, y - 5, size * 0.6, 0, Math.PI * 2);
            this.ctx.arc(x + size * 0.8, y, size * 0.5, 0, Math.PI * 2);
            this.ctx.fill();
        });
    },
    
    drawGround() {
        const groundY = this.canvas.height - 60;
        
        this.ctx.fillStyle = this.colors.ground;
        this.ctx.fillRect(0, groundY, this.canvas.width, 60);
        
        this.ctx.fillStyle = '#9ACD32';
        this.ctx.fillRect(0, groundY, this.canvas.width, 12);
        
        this.ctx.fillStyle = this.colors.groundDark;
        for (let i = 0; i < this.canvas.width; i += 15) {
            this.ctx.fillRect(i, groundY + 12, 8, 48);
        }
    },
    
    drawBird() {
        this.ctx.save();
        this.ctx.translate(this.bird.x + this.bird.width / 2, this.bird.y + this.bird.height / 2);
        this.ctx.rotate(this.bird.rotation * Math.PI / 180);
        
        // Corpo
        this.ctx.fillStyle = this.colors.bird;
        this.ctx.strokeStyle = this.colors.birdOutline;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, this.bird.width / 2, this.bird.height / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Asa
        this.ctx.fillStyle = '#FFA500';
        this.ctx.beginPath();
        this.ctx.ellipse(-4, 0, 6, 10, -0.3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Olho
        this.ctx.fillStyle = this.colors.white;
        this.ctx.beginPath();
        this.ctx.arc(6, -3, 5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = this.colors.black;
        this.ctx.beginPath();
        this.ctx.arc(8, -3, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Bico
        this.ctx.fillStyle = '#FF6347';
        this.ctx.beginPath();
        this.ctx.moveTo(12, 0);
        this.ctx.lineTo(20, -2);
        this.ctx.lineTo(20, 2);
        this.ctx.fill();
        
        this.ctx.restore();
    },
    
    drawPipe(pipe) {
        const gradient = this.ctx.createLinearGradient(pipe.x, 0, pipe.x + this.pipeWidth, 0);
        gradient.addColorStop(0, this.colors.pipeLight);
        gradient.addColorStop(0.5, this.colors.pipe);
        gradient.addColorStop(1, this.colors.pipeDark);
        
        this.ctx.fillStyle = gradient;
        this.ctx.strokeStyle = this.colors.pipeDark;
        this.ctx.lineWidth = 2;
        
        // Superior
        this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight - 20);
        this.ctx.fillRect(pipe.x - 4, pipe.topHeight - 20, this.pipeWidth + 8, 20);
        this.ctx.strokeRect(pipe.x, 0, this.pipeWidth, pipe.topHeight - 20);
        this.ctx.strokeRect(pipe.x - 4, pipe.topHeight - 20, this.pipeWidth + 8, 20);
        
        // Inferior
        const bottomY = pipe.topHeight + this.pipeGap;
        this.ctx.fillRect(pipe.x - 4, bottomY, this.pipeWidth + 8, 20);
        this.ctx.fillRect(pipe.x, bottomY + 20, this.pipeWidth, this.canvas.height - bottomY - 80);
        this.ctx.strokeRect(pipe.x - 4, bottomY, this.pipeWidth + 8, 20);
        this.ctx.strokeRect(pipe.x, bottomY + 20, this.pipeWidth, this.canvas.height - bottomY - 80);
    },
    
    drawParticles() {
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = this.colors.bird;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
    },
    
    drawScore() {
        this.ctx.fillStyle = this.colors.white;
        this.ctx.strokeStyle = this.colors.black;
        this.ctx.lineWidth = 3;
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.strokeText(this.score, this.canvas.width / 2, 45);
        this.ctx.fillText(this.score, this.canvas.width / 2, 45);
    },
    
    // ============================================
    // FINALIZAÇÃO
    // ============================================
    
    endGame() {
        console.log('💀 Game Over! Score:', this.score);
        
        this.gameOver = true;
        this.isPlaying = false;
        this.isPaused = false;
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        // Explosão
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            this.particles.push({
                x: this.bird.x + this.bird.width / 2,
                y: this.bird.y + this.bird.height / 2,
                vx: Math.cos(angle) * (2 + Math.random() * 2),
                vy: Math.sin(angle) * (2 + Math.random() * 2),
                life: 1,
                size: 3 + Math.random() * 2,
                color: '#FF6347'
            });
        }
        
        const savedHighScore = Utils.loadData('flappy_bird_highscore') || 0;
        const isNewRecord = this.score > savedHighScore;
        
        setTimeout(() => {
            this.drawGameOver(isNewRecord);
            
            if (isNewRecord && this.score > 0) {
                Utils.showNotification?.(`🏆 NOVO RECORDE! ${this.score} pontos!`, 'success');
            } else {
                Utils.showNotification?.(`💀 Game Over! Score: ${this.score}`, 'error');
            }
            
            document.getElementById('flappy-pause-btn').style.display = 'none';
        }, 400);
    },
    
    drawGameOver(isNewRecord) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = this.colors.white;
        this.ctx.strokeStyle = this.colors.black;
        this.ctx.lineWidth = 4;
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.strokeText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 60);
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 60);
        
        this.ctx.font = 'bold 32px Arial';
        this.ctx.fillStyle = '#FFD700';
        this.ctx.strokeText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 - 10);
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 - 10);
        
        if (isNewRecord && this.score > 0) {
            this.ctx.font = 'bold 24px Arial';
            this.ctx.strokeText('🏆 NOVO RECORDE! 🏆', this.canvas.width / 2, this.canvas.height / 2 + 30);
            this.ctx.fillText('🏆 NOVO RECORDE! 🏆', this.canvas.width / 2, this.canvas.height / 2 + 30);
        }
        
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillStyle = this.colors.white;
        this.ctx.strokeText('Toque para jogar novamente', this.canvas.width / 2, this.canvas.height / 2 + 80);
        this.ctx.fillText('Toque para jogar novamente', this.canvas.width / 2, this.canvas.height / 2 + 80);
    },
    
    // ============================================
    // UTILITÁRIOS
    // ============================================
    
    createScoreEffect() {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            this.particles.push({
                x: this.canvas.width / 2,
                y: 45,
                vx: Math.cos(angle) * 2,
                vy: Math.sin(angle) * 2,
                life: 1,
                size: 3,
                color: '#FFD700'
            });
        }
    },
    
    updateScore() {
        const el = document.getElementById('flappy-score');
        if (el) el.textContent = this.score;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            Utils.saveData?.('flappy_bird_highscore', this.highScore);
        }
    },
    
    updateUI({ overlay, startBtn, pauseBtn }) {
        const overlayEl = document.getElementById('flappy-overlay');
        if (overlayEl && overlay) overlayEl.style.display = overlay;
        
        const startBtnEl = document.getElementById('flappy-start-btn');
        if (startBtnEl && startBtn) startBtnEl.innerHTML = startBtn;
        
        const pauseBtnEl = document.getElementById('flappy-pause-btn');
        if (pauseBtnEl && pauseBtn) pauseBtnEl.style.display = pauseBtn;
    }
};

window.FlappyBird = FlappyBird;