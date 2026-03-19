/* ═══════════════════════════════════════════════════════
   LOGIN-PARTICLES.JS v3.1 — NyanTools にゃん~
   v3.5.0 — Render único, Math.random(), zero CPU
   ═══════════════════════════════════════════════════════ */

const LoginParticles = {

    MAX: 55,

    inject() {
        const ls = document.getElementById('login-screen');
        if (!ls || document.getElementById('login-particles-canvas')) return;

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
        const colors = [
            [168, 85,  247],
            [236, 72,  153],
            [99,  102, 241],
            [255, 255, 255],
        ];

        for (let i = 0; i < this.MAX; i++) {
            const x     = Math.random() * w;
            const y     = Math.random() * h;
            const r     = Math.random() * 1.6 + 0.5;
            const op    = Math.random() * 0.45 + 0.08;
            const c     = colors[Math.floor(Math.random() * colors.length)];
            const alpha = (c[0] === 255 ? op * 0.55 : op).toFixed(2);

            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
            ctx.fill();
        }

        console.log('✨ LoginParticles v3.1: render único');
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
        observer.observe(document.body, {
            attributes: true, subtree: true, attributeFilter: ['class'],
        });

        console.log('✨ LoginParticles v3.1 inicializado');
    },
};

window.LoginParticles = LoginParticles;