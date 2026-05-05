

const LoginParticles = {

    MAX: 50,
    MODE_KEY: 'nyan_login_particles_mode',

    getMode() {
        const saved = Utils.loadData(this.MODE_KEY) || 'normal';
        return ['normal', 'reduced', 'off'].includes(saved) ? saved : 'normal';
    },

    setMode(mode = 'normal') {
        const safe = ['normal', 'reduced', 'off'].includes(mode) ? mode : 'normal';
        Utils.saveData(this.MODE_KEY, safe);
        this.destroy();
        if (safe !== 'off') setTimeout(() => this.inject(), 60);
        Utils.showNotification?.(safe === 'off' ? 'Particulas do login desligadas.' : `Particulas do login: ${safe === 'reduced' ? 'reduzidas' : 'normais'}.`, 'info');
    },

    _maxParticles() {
        const mode = this.getMode();
        if (mode === 'off') return 0;
        if (mode === 'reduced') return Math.min(20, this.MAX);
        return this.MAX;
    },

    _isMidnightGold() {
        const savedTheme = Utils.loadData('app_color_theme');
        const activeTheme = document.body?.getAttribute?.('data-theme');
        return savedTheme === 'midnightGold'
            || activeTheme === 'midnightGold'
            || window.FinalSeason?.isFinalSeasonActive?.() === true;
    },

    _palette() {
        if (this._isMidnightGold()) {
            return {
                colors: [
                    [245, 158, 11],
                    [252, 211, 77],
                    [168, 85, 247],
                    [255, 255, 255],
                ],
                starChance: 0.34,
            };
        }

        return {
            colors: [
                [168, 85, 247],
                [236, 72, 153],
                [99, 102, 241],
                [255, 255, 255],
            ],
            starChance: 0.12,
        };
    },

    _drawStar(ctx, x, y, size, color, alpha) {
        ctx.save();
        ctx.translate(x, y);
        ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${alpha})`;
        ctx.lineWidth = Math.max(0.6, size * 0.22);
        ctx.beginPath();
        ctx.moveTo(-size, 0);
        ctx.lineTo(size, 0);
        ctx.moveTo(0, -size);
        ctx.lineTo(0, size);
        ctx.stroke();
        ctx.restore();
    },

    inject() {
        const ls = document.getElementById('login-screen');
        if (!ls || document.getElementById('login-particles-canvas')) return;
        const maxParticles = this._maxParticles();
        if (maxParticles <= 0) return;

        const canvas    = document.createElement('canvas');
        canvas.id       = 'login-particles-canvas';
        canvas.style.cssText = `
            position:absolute; inset:0;
            width:100%; height:100%;
            pointer-events:none; z-index:1;
        `;
        ls.insertBefore(canvas, ls.firstChild);

        const w = ls.offsetWidth  || window.innerWidth;
        const h = ls.offsetHeight || window.innerHeight;
        canvas.width  = w;
        canvas.height = h;

        const ctx    = canvas.getContext('2d');
        const palette = this._palette();
        const colors = palette.colors;

        for (let i = 0; i < maxParticles; i++) {
            const x     = Math.random() * w;
            const y     = Math.random() * h;
            const r     = Math.random() * 1.6 + 0.5;
            const op    = Math.random() * 0.45 + 0.08;
            const c     = colors[Math.floor(Math.random() * colors.length)];
            const alpha = (c[0] === 255 ? op * 0.55 : op).toFixed(2);

            if (Math.random() < palette.starChance) {
                this._drawStar(ctx, x, y, r * 2.8, c, alpha);
                continue;
            }

            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
            ctx.fill();
        }

    },

    destroy() {
        document.getElementById('login-particles-canvas')?.remove();
    },

    init() {
        setTimeout(() => {
            const ls = document.getElementById('login-screen');
            if (ls && !ls.classList.contains('hidden')) this.inject();
        }, 80);

        const observer = new MutationObserver(() => {
            const ls = document.getElementById('login-screen');
            if (!ls) return;
            if (!ls.classList.contains('hidden')) {
                if (!document.getElementById('login-particles-canvas')) {
                    setTimeout(() => this.inject(), 100);
                }
            } else {
                this.destroy();
            }
        });
        if (!document.body) return;
        observer.observe(document.body, {
            attributes: true, subtree: true, attributeFilter: ['class'],
        });

    },
};

window.LoginParticles = LoginParticles;
