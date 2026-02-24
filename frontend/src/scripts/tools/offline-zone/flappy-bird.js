// FLAPPY NYAN - NyanTools にゃん~
// Versão Melhorada v3.0


const FlappyBird = {
    canvas: null,
    ctx: null,

    isPlaying: false,
    gameOver: false,
    isPaused: false,
    score: 0,
    highScore: 0,

    bird: {
        x: 80, y: 250, width: 36, height: 26,
        velocity: 0, gravity: 0.42, jumpStrength: -8,
        rotation: 0, maxRotation: 80, minRotation: -25,
        wingAngle: 0
    },

    pipes: [],
    pipeWidth: 68,
    pipeGap: 185,
    pipeSpeed: 2,
    pipeFrequency: 115,
    frameCount: 0,

    clouds: [],
    groundOffset: 0,

    colors: {
        white: '#FFFFFF', black: '#000000'
    },

    particles: [],
    maxParticles: 40,
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
                    <div class="text-5xl animate-bounce">🐱</div>
                    <h1 class="text-4xl font-black bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                        Flappy Nyan
                    </h1>
                </div>
                <p class="text-gray-600 font-semibold">Desvie dos canos! にゃん~</p>
            </div>
        `;
    },

    renderScoreDisplay() {
        return `
            <div class="grid grid-cols-2 gap-3 mb-4">
                <div class="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-4 text-white shadow-xl text-center">
                    <div class="text-xs font-semibold opacity-80 mb-1 tracking-widest">PONTUAÇÃO</div>
                    <div class="text-5xl font-black" id="flappy-score">0</div>
                </div>
                <div class="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-4 text-white shadow-xl text-center">
                    <div class="text-xs font-semibold opacity-80 mb-1 tracking-widest">🏆 RECORDE</div>
                    <div class="text-5xl font-black" id="flappy-highscore">${this.highScore}</div>
                </div>
            </div>
        `;
    },

    renderCanvasContainer() {
        return `
            <div class="rounded-2xl shadow-2xl mb-4 relative overflow-hidden border-4 border-sky-400" style="background:#29B6F6;">
                <canvas id="flappy-canvas"
                        class="mx-auto cursor-pointer relative z-10 touch-none"
                        style="display:block; image-rendering: crisp-edges; max-width:100%;">
                </canvas>
                <div id="flappy-overlay" class="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <div class="text-center bg-black/60 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-2xl border border-white/20">
                        <div class="text-5xl mb-3">🐱</div>
                        <div class="text-3xl font-black text-white mb-2" style="text-shadow:2px 2px 8px #000;">PRONTO?</div>
                        <div class="text-base font-semibold text-yellow-300">Clique ou Espaço para voar!</div>
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
                        class="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all text-lg">
                    ▶️ Iniciar
                </button>
                <button onclick="FlappyBird.togglePause()"
                        id="flappy-pause-btn"
                        style="display:none;"
                        class="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all text-lg">
                    ⏸️ Pausar
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
                <div class="mt-3 text-center text-gray-500 text-sm">
                    <strong>Dica:</strong> Toque rápido e ritmado para manter altitude!
                </div>
            </div>
        `;
    },

    // ============================================
    // INICIALIZAÇÃO
    // ============================================

    init() {
        this.canvas = document.getElementById('flappy-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.setupCanvas();
        this.initClouds();
        this.setupEventListeners();
        this.drawInitialState();
    },

    setupCanvas() {
        const container = this.canvas.parentElement;
        const maxWidth = Math.min(container.clientWidth - 8, 480);
        this.canvas.width = maxWidth;
        this.canvas.height = Math.min(580, window.innerHeight * 0.62);
        this.bird.x = this.canvas.width * 0.2;
        this.bird.y = this.canvas.height / 2;
    },

    initClouds() {
        this.clouds = [];
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width,
                y: 20 + Math.random() * (this.canvas.height * 0.3),
                size: 28 + Math.random() * 32,
                speed: 0.25 + Math.random() * 0.35,
                alpha: 0.55 + Math.random() * 0.35
            });
        }
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

        this.canvas.addEventListener('click', handleInput);
        this.canvas.addEventListener('touchstart', handleInput, { passive: false });

        this.keyHandler = (e) => {
            // Auto-remove se o canvas não estiver mais na página
            if (!document.getElementById('flappy-canvas')) {
                document.removeEventListener('keydown', this.keyHandler);
                this.keyHandler = null;
                if (this.animationFrame) {
                    cancelAnimationFrame(this.animationFrame);
                    this.animationFrame = null;
                }
                this.isPlaying = false;
                return;
            }
            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
                handleInput(e);
            } else if (e.code === 'KeyP' && this.isPlaying && !this.gameOver) {
                e.preventDefault();
                this.togglePause();
            }
        };
        document.addEventListener('keydown', this.keyHandler);

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (!this.isPlaying) {
                    this.setupCanvas();
                    this.initClouds();
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

        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }

        this.score = 0;
        this.bird.y = this.canvas.height / 2;
        this.bird.velocity = 0;
        this.bird.rotation = 0;
        this.bird.wingAngle = 0;
        this.pipes = [];
        this.particles = [];
        this.frameCount = 0;
        this.pipeSpeed = 2;
        this.groundOffset = 0;
        this.updateScore();

        this.isPlaying = true;
        this.gameOver = false;
        this.isPaused = false;

        this.updateUI({ overlay: 'none', startBtn: '🔄 Reiniciar', pauseBtn: 'block' });
        this.flap();

        this.lastTime = performance.now();
        this.animationFrame = requestAnimationFrame((t) => this.gameLoop(t));

        Utils.showNotification?.('🐱 Boa sorte! にゃん~', 'success');
    },

    togglePause() {
        if (!this.isPlaying || this.gameOver) return;
        this.isPaused = !this.isPaused;

        const btn = document.getElementById('flappy-pause-btn');
        if (this.isPaused) {
            if (btn) btn.innerHTML = '▶️ Continuar';
            this.drawPauseOverlay();
        } else {
            if (btn) btn.innerHTML = '⏸️ Pausar';
            // BUG FIX: retomar loop via requestAnimationFrame, não chamada direta
            this.lastTime = performance.now();
            this.animationFrame = requestAnimationFrame((t) => this.gameLoop(t));
        }
    },

    restartGame() {
        this.gameOver = false;
        this.isPlaying = false;
        this.drawInitialState();
        setTimeout(() => this.startGame(), 80);
    },

    flap() {
        this.bird.velocity = this.bird.jumpStrength;
        this.bird.wingAngle = -1.2;

        if (this.particles.length < this.maxParticles) {
            for (let i = 0; i < 4; i++) {
                this.particles.push({
                    x: this.bird.x + 4,
                    y: this.bird.y + this.bird.height / 2,
                    vx: -1.5 - Math.random() * 1.5,
                    vy: (Math.random() - 0.5) * 3,
                    life: 1,
                    size: 2 + Math.random() * 2,
                    color: '#FFF9C4'
                });
            }
        }
    },

    // ============================================
    // LOOP DE JOGO
    // ============================================

    gameLoop(currentTime = 0) {
        if (!this.isPlaying || this.isPaused || this.gameOver) return;

        const deltaTime = Math.min((currentTime - this.lastTime) / 16.67, 2.5);
        this.lastTime = currentTime;

        this.update(deltaTime);
        if (!this.gameOver) {
            this.draw();
            this.animationFrame = requestAnimationFrame((t) => this.gameLoop(t));
        }
    },

    update(deltaTime = 1) {
        this.updateBird(deltaTime);
        this.updatePipes(deltaTime);
        this.updateParticles(deltaTime);
        this.updateClouds(deltaTime);
    },

    updateBird(deltaTime) {
        if (this.gameOver) return;
        this.bird.velocity += this.bird.gravity * deltaTime;
        this.bird.y += this.bird.velocity * deltaTime;

        const targetRotation = Math.min(Math.max(this.bird.velocity * 4, this.bird.minRotation), this.bird.maxRotation);
        this.bird.rotation += (targetRotation - this.bird.rotation) * 0.15;

        // Asa: bate rápido ao pular, relaxa gradualmente
        this.bird.wingAngle += 0.18 * deltaTime;
        if (this.bird.wingAngle > 0.4) this.bird.wingAngle = 0.4;

        const groundY = this.canvas.height - 60;
        if (this.bird.y + this.bird.height >= groundY || this.bird.y <= 0) {
            this.endGame();
        }
    },

    updatePipes(deltaTime) {
        if (this.gameOver) return;
        this.frameCount++;
        // Spawn baseado em distância mínima, não em frames fixos
        // Garante espaçamento consistente independente da velocidade
        const minDistance = 220; // px mínimos entre canos
        const lastPipe = this.pipes[this.pipes.length - 1];
        const canSpawn = !lastPipe || lastPipe.x <= this.canvas.width - minDistance;
        if (canSpawn && this.frameCount > 60) {
            this.spawnPipe();
        }

        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.pipeSpeed * deltaTime;

            if (!pipe.scored && pipe.x + this.pipeWidth < this.bird.x) {
                pipe.scored = true;
                this.score++;
                this.updateScore();
                this.createScoreEffect();

                if (this.score % 10 === 0 && this.pipeSpeed < 4.5) {
                    this.pipeSpeed += 0.3;
                    Utils.showNotification?.('🔥 Mais rápido!', 'info');
                }
            }

            if (pipe.x + this.pipeWidth < -15) {
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
            p.vy += 0.1 * deltaTime;
            p.life -= 0.018 * deltaTime;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    },

    updateClouds(deltaTime) {
        for (const c of this.clouds) {
            c.x -= c.speed * deltaTime;
            if (c.x + c.size * 2 < 0) {
                c.x = this.canvas.width + c.size;
                c.y = 20 + Math.random() * (this.canvas.height * 0.28);
                c.size = 28 + Math.random() * 32;
            }
        }
    },

    spawnPipe() {
        const margin = 80;
        const maxTop = this.canvas.height - 60 - this.pipeGap - margin;
        const topHeight = margin + Math.random() * (maxTop - margin);
        this.pipes.push({ x: this.canvas.width + 4, topHeight, scored: false });
    },

    checkCollision(pipe) {
        const hitbox = {
            x: this.bird.x + 8,
            y: this.bird.y + 5,
            w: this.bird.width - 16,
            h: this.bird.height - 10
        };
        if (hitbox.x + hitbox.w > pipe.x + 4 && hitbox.x < pipe.x + this.pipeWidth - 4) {
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
        this.drawParticles();
        this.drawBird();
        this.drawScore();
    },

    drawInitialState() {
        if (!this.canvas) return;
        this.bird.y = this.canvas.height / 2;
        this.bird.rotation = 0;
        this.drawBackground();
        this.drawGround();
        this.drawBird();
    },

    drawBackground() {
        const grad = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height - 60);
        grad.addColorStop(0, '#1E88E5');
        grad.addColorStop(0.5, '#42A5F5');
        grad.addColorStop(1, '#B3E5FC');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawClouds();
    },

    drawClouds() {
        const ctx = this.ctx;
        for (const c of this.clouds) {
            ctx.save();
            ctx.globalAlpha = c.alpha;
            ctx.fillStyle = '#FFFFFF';
            const s = c.size;
            ctx.beginPath();
            ctx.arc(c.x, c.y, s * 0.55, 0, Math.PI * 2);
            ctx.arc(c.x + s * 0.42, c.y - s * 0.2, s * 0.68, 0, Math.PI * 2);
            ctx.arc(c.x + s * 0.88, c.y, s * 0.5, 0, Math.PI * 2);
            ctx.arc(c.x + s * 0.2, c.y + s * 0.28, s * 0.44, 0, Math.PI * 2);
            ctx.arc(c.x + s * 0.65, c.y + s * 0.28, s * 0.44, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    },

    drawGround() {
        const ctx = this.ctx;
        const groundY = this.canvas.height - 60;

        // Base terra
        ctx.fillStyle = '#795548';
        ctx.fillRect(0, groundY + 13, this.canvas.width, 47);

        // Listras estáticas
        ctx.fillStyle = '#5D4037';
        for (let i = 0; i < this.canvas.width; i += 40) {
            ctx.fillRect(i, groundY + 18, 20, 42);
        }

        // Grama
        ctx.fillStyle = '#66BB6A';
        ctx.fillRect(0, groundY, this.canvas.width, 15);
        ctx.fillStyle = '#43A047';
        ctx.fillRect(0, groundY + 5, this.canvas.width, 5);

        // Detalhes de grama (pequenos tufos)
        ctx.fillStyle = '#81C784';
        for (let i = 8; i < this.canvas.width; i += 22) {
            ctx.fillRect(i, groundY - 3, 4, 6);
            ctx.fillRect(i + 9, groundY - 2, 3, 4);
        }
    },

    drawBird() {
        const ctx = this.ctx;
        const b = this.bird;
        ctx.save();
        ctx.translate(b.x + b.width / 2, b.y + b.height / 2);
        ctx.rotate(b.rotation * Math.PI / 180);

        // Asa com animação de batida
        const wingY = Math.sin(b.wingAngle * 10) * 6;
        ctx.fillStyle = '#FF8F00';
        ctx.strokeStyle = '#E65100';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(-5, wingY, 9, 5, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Sombra do corpo
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 3;

        // Corpo com gradiente radial
        const bodyGrad = ctx.createRadialGradient(-5, -5, 1, 0, 0, b.width / 2);
        bodyGrad.addColorStop(0, '#FFF176');
        bodyGrad.addColorStop(0.5, '#FFD700');
        bodyGrad.addColorStop(1, '#FF8F00');
        ctx.fillStyle = bodyGrad;
        ctx.strokeStyle = '#E65100';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, b.width / 2, b.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.shadowColor = 'transparent';

        // Barriga brilhante
        ctx.fillStyle = 'rgba(255,255,255,0.28)';
        ctx.beginPath();
        ctx.ellipse(2, 3, b.width / 4.5, b.height / 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Olho branco
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(7, -4, 6, 0, Math.PI * 2);
        ctx.fill();

        // Pupila
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(8.5, -4, 3.2, 0, Math.PI * 2);
        ctx.fill();

        // Brilho olho
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(9.8, -5.5, 1.4, 0, Math.PI * 2);
        ctx.fill();

        // Bico
        ctx.fillStyle = '#FF7043';
        ctx.beginPath();
        ctx.moveTo(13, -2);
        ctx.lineTo(21, -4);
        ctx.lineTo(21, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#E64A19';
        ctx.beginPath();
        ctx.moveTo(13, 0);
        ctx.lineTo(21, 0);
        ctx.lineTo(19, 3.5);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    },

    drawPipe(pipe) {
        const ctx = this.ctx;
        const pw = this.pipeWidth;
        const capW = pw + 10;
        const capH = 22;
        const groundY = this.canvas.height - 60;

        const makeGrad = (x) => {
            const g = ctx.createLinearGradient(x, 0, x + pw, 0);
            g.addColorStop(0, '#A5D6A7');
            g.addColorStop(0.15, '#66BB6A');
            g.addColorStop(0.5, '#388E3C');
            g.addColorStop(0.85, '#2E7D32');
            g.addColorStop(1, '#1B5E20');
            return g;
        };
        const makeCapGrad = (x) => {
            const g = ctx.createLinearGradient(x - 5, 0, x - 5 + capW, 0);
            g.addColorStop(0, '#C8E6C9');
            g.addColorStop(0.15, '#81C784');
            g.addColorStop(0.5, '#43A047');
            g.addColorStop(0.85, '#388E3C');
            g.addColorStop(1, '#1B5E20');
            return g;
        };

        // ---- CANO SUPERIOR ----
        const topBodyH = pipe.topHeight - capH;

        ctx.fillStyle = makeGrad(pipe.x);
        ctx.fillRect(pipe.x, 0, pw, topBodyH);

        // Highlight lateral esquerdo
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(pipe.x + 5, 0, 7, topBodyH);

        // Borda escura direita
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(pipe.x + pw - 5, 0, 5, topBodyH);

        // Tampa superior
        ctx.fillStyle = makeCapGrad(pipe.x);
        this.roundRect(ctx, pipe.x - 5, topBodyH, capW, capH, 5);
        ctx.fill();
        ctx.strokeStyle = '#1B5E20';
        ctx.lineWidth = 1.5;
        this.roundRect(ctx, pipe.x - 5, topBodyH, capW, capH, 5);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        this.roundRect(ctx, pipe.x - 2, topBodyH + 3, capW - 10, capH / 2, 3);
        ctx.fill();

        // ---- CANO INFERIOR ----
        const bottomCapY = pipe.topHeight + this.pipeGap;
        const bottomBodyY = bottomCapY + capH;
        const bottomBodyH = groundY - bottomBodyY;

        ctx.fillStyle = makeCapGrad(pipe.x);
        this.roundRect(ctx, pipe.x - 5, bottomCapY, capW, capH, 5);
        ctx.fill();
        ctx.strokeStyle = '#1B5E20';
        ctx.lineWidth = 1.5;
        this.roundRect(ctx, pipe.x - 5, bottomCapY, capW, capH, 5);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        this.roundRect(ctx, pipe.x - 2, bottomCapY + 3, capW - 10, capH / 2, 3);
        ctx.fill();

        ctx.fillStyle = makeGrad(pipe.x);
        ctx.fillRect(pipe.x, bottomBodyY, pw, bottomBodyH);

        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(pipe.x + 5, bottomBodyY, 7, bottomBodyH);

        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(pipe.x + pw - 5, bottomBodyY, 5, bottomBodyH);
    },

    roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    },

    drawParticles() {
        const ctx = this.ctx;
        for (const p of this.particles) {
            ctx.globalAlpha = p.life * 0.9;
            ctx.fillStyle = p.color || '#FFD700';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    },

    drawScore() {
        const ctx = this.ctx;
        ctx.textAlign = 'center';
        ctx.font = 'bold 40px "Arial Black", Arial';

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillText(this.score, this.canvas.width / 2 + 2, 52);

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.strokeText(this.score, this.canvas.width / 2, 50);

        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(this.score, this.canvas.width / 2, 50);
    },

    drawPauseOverlay() {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.font = 'bold 44px Arial';
        ctx.textAlign = 'center';
        ctx.strokeText('⏸ PAUSADO', this.canvas.width / 2, this.canvas.height / 2 - 10);
        ctx.fillText('⏸ PAUSADO', this.canvas.width / 2, this.canvas.height / 2 - 10);
        ctx.font = 'bold 17px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.fillText('Pressione P para continuar', this.canvas.width / 2, this.canvas.height / 2 + 35);
    },

    // ============================================
    // FINALIZAÇÃO
    // ============================================

    endGame() {
        if (this.gameOver) return; // já processado, evita dupla chamada
        this.gameOver = true;
        this.isPlaying = false;
        this.isPaused = false;

        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }

        // Explosão de partículas coloridas
        for (let i = 0; i < 28; i++) {
            const angle = (Math.PI * 2 * i) / 28;
            const speed = 2 + Math.random() * 3.5;
            this.particles.push({
                x: this.bird.x + this.bird.width / 2,
                y: this.bird.y + this.bird.height / 2,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1,
                life: 1,
                size: 3 + Math.random() * 3,
                color: ['#FFD700', '#FF6347', '#FFA500', '#FF4500', '#FFF176'][Math.floor(Math.random() * 5)]
            });
        }

        const savedHighScore = Utils.loadData('flappy_bird_highscore') || 0;
        const isNewRecord = this.score > savedHighScore;

        if (isNewRecord && this.score > 0) {
            Utils.saveData?.('flappy_bird_highscore', this.score);
            this.highScore = this.score;
            const hsEl = document.getElementById('flappy-highscore');
            if (hsEl) hsEl.textContent = this.score;
        }

        // Animar partículas por um momento antes de mostrar game over
        let frames = 0;
        const animateParticles = () => {
            if (frames++ < 22) {
                this.draw();
                requestAnimationFrame(animateParticles);
            } else {
                this.drawGameOver(isNewRecord);
                const pauseBtn = document.getElementById('flappy-pause-btn');
                if (pauseBtn) pauseBtn.style.display = 'none';

                if (isNewRecord && this.score > 0) {
                    Utils.showNotification?.(`🏆 NOVO RECORDE! ${this.score} pontos!`, 'success');
                } else {
                    Utils.showNotification?.(`💀 Game Over! Score: ${this.score}`, 'error');
                }
            }
        };
        animateParticles();
    },

    drawGameOver(isNewRecord) {
        const ctx = this.ctx;
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;

        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Painel centralizado
        const panelW = Math.min(300, this.canvas.width - 40);
        const panelH = isNewRecord ? 240 : 210;
        ctx.fillStyle = 'rgba(20,20,40,0.85)';
        this.roundRect(ctx, cx - panelW / 2, cy - panelH / 2, panelW, panelH, 18);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 2;
        this.roundRect(ctx, cx - panelW / 2, cy - panelH / 2, panelW, panelH, 18);
        ctx.stroke();

        ctx.textAlign = 'center';

        // GAME OVER
        ctx.font = 'bold 44px "Arial Black", Arial';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 5;
        ctx.fillStyle = '#FF5252';
        ctx.strokeText('GAME OVER', cx, cy - panelH / 2 + 58);
        ctx.fillText('GAME OVER', cx, cy - panelH / 2 + 58);

        // Score
        ctx.font = 'bold 28px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(`Pontos: ${this.score}`, cx, cy - panelH / 2 + 105);
        ctx.fillText(`Pontos: ${this.score}`, cx, cy - panelH / 2 + 105);

        if (isNewRecord && this.score > 0) {
            ctx.font = 'bold 19px Arial';
            ctx.fillStyle = '#FFD700';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeText('🏆 NOVO RECORDE! 🏆', cx, cy - panelH / 2 + 145);
            ctx.fillText('🏆 NOVO RECORDE! 🏆', cx, cy - panelH / 2 + 145);
        }

        ctx.font = 'bold 15px Arial';
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText('Toque para jogar novamente', cx, cy + panelH / 2 - 20);
    },

    // ============================================
    // UTILITÁRIOS
    // ============================================

    createScoreEffect() {
        for (let i = 0; i < 10; i++) {
            const angle = (Math.PI * 2 * i) / 10;
            this.particles.push({
                x: this.bird.x + this.bird.width,
                y: this.bird.y,
                vx: Math.cos(angle) * 2.5,
                vy: Math.sin(angle) * 2.5,
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
        if (overlayEl && overlay !== undefined) overlayEl.style.display = overlay;

        const startBtnEl = document.getElementById('flappy-start-btn');
        if (startBtnEl && startBtn) startBtnEl.innerHTML = startBtn;

        const pauseBtnEl = document.getElementById('flappy-pause-btn');
        if (pauseBtnEl && pauseBtn !== undefined) pauseBtnEl.style.display = pauseBtn;
    },

    // ============================================
    // CLEANUP - chamado ao sair da tela
    // ============================================

    cleanup() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
            this.keyHandler = null;
        }
        this.isPlaying = false;
        this.gameOver = false;
        this.isPaused = false;
    }
};

window.FlappyBird = FlappyBird;