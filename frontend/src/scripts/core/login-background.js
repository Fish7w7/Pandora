/* ═══════════════════════════════════════════════════════
   LOGIN-BACKGROUND.JS v1.2 — NyanTools にゃん~
   v3.5.0 "First Impression" — Feature #67
   Estrelas via Math.random() — sem seed, sem diagonal
   ═══════════════════════════════════════════════════════ */

const LoginBackground = {

    _periods: {
        dawn: {
            orb1: { color: 'rgba(30, 27, 75, 0.45)',   w: '380px', h: '380px' },
            orb2: { color: 'rgba(55, 48, 163, 0.3)',   w: '320px', h: '320px' },
            orb3: { color: 'rgba(99, 102, 241, 0.15)', w: '190px', h: '190px' },
            bg: '#04040a', stars: true, label: 'Madrugada',
        },
        morning: {
            orb1: { color: 'rgba(245, 158, 11, 0.28)', w: '420px', h: '420px' },
            orb2: { color: 'rgba(249, 115, 22, 0.22)', w: '360px', h: '360px' },
            orb3: { color: 'rgba(252, 211, 77, 0.15)', w: '200px', h: '200px' },
            bg: '#0a0605', stars: false, label: 'Manhã',
        },
        afternoon: {
            orb1: { color: 'rgba(139, 92, 246, 0.28)', w: '400px', h: '400px' },
            orb2: { color: 'rgba(236, 72, 153, 0.22)', w: '350px', h: '350px' },
            orb3: { color: 'rgba(14, 165, 233, 0.15)', w: '200px', h: '200px' },
            bg: '#0a0a0f', stars: false, label: 'Tarde',
        },
        evening: {
            orb1: { color: 'rgba(109, 40, 217, 0.32)', w: '400px', h: '400px' },
            orb2: { color: 'rgba(131, 24, 67, 0.26)',  w: '350px', h: '350px' },
            orb3: { color: 'rgba(30, 64, 175, 0.18)',  w: '195px', h: '195px' },
            bg: '#060408', stars: true, label: 'Noite',
        },
    },

    _getPeriod() {
        const h = new Date().getHours();
        if (h >= 0 && h < 6)   return 'dawn';
        if (h >= 6 && h < 12)  return 'morning';
        if (h >= 12 && h < 18) return 'afternoon';
        return 'evening';
    },

    _injectStars(loginScreen) {
        if (document.getElementById('login-bg-stars')) return;

        const container = document.createElement('div');
        container.id = 'login-bg-stars';
        container.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:0;overflow:hidden;';

        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
        container.appendChild(canvas);
        loginScreen.insertBefore(container, loginScreen.firstChild);

        // Render após inserção para ter dimensões reais
        requestAnimationFrame(() => {
            canvas.width  = loginScreen.offsetWidth  || window.innerWidth;
            canvas.height = loginScreen.offsetHeight || window.innerHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Math.random() — sem seed, sem correlação, sem diagonal
            // Seguro porque é render único (não há loop contínuo)
            for (let i = 0; i < 80; i++) {
                const x  = Math.random() * canvas.width;
                const y  = Math.random() * canvas.height;
                const r  = Math.random() * 1.2 + 0.4;
                const op = Math.random() * 0.5 + 0.15;

                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${op.toFixed(2)})`;
                ctx.fill();
            }
        });
    },

    _removeStars() {
        document.getElementById('login-bg-stars')?.remove();
    },

    apply() {
        const loginScreen = document.getElementById('login-screen');
        if (!loginScreen) return;

        const period = this._getPeriod();
        const cfg    = this._periods[period];

        loginScreen.style.transition      = 'background-color 1.2s ease';
        loginScreen.style.backgroundColor = cfg.bg;
        loginScreen.setAttribute('data-period', period);

        const selectors = ['.orb-1', '.orb-2', '.orb-3'];
        const configs   = [cfg.orb1, cfg.orb2, cfg.orb3];
        selectors.forEach((sel, i) => {
            const orb = loginScreen.querySelector(sel);
            if (!orb) return;
            orb.style.transition = 'background 1.2s ease, width 1.2s ease, height 1.2s ease';
            orb.style.background = configs[i].color;
            orb.style.width      = configs[i].w;
            orb.style.height     = configs[i].h;
        });

        if (cfg.stars) {
            this._injectStars(loginScreen);
        } else {
            this._removeStars();
        }

        console.log(`🌅 LoginBackground v1.2: "${cfg.label}"`);
    },

    init() {
        setTimeout(() => this.apply(), 50);

        const observer = new MutationObserver(() => {
            const ls = document.getElementById('login-screen');
            if (ls && !ls.classList.contains('hidden')) this.apply();
        });
        observer.observe(document.body, {
            attributes: true, subtree: true, attributeFilter: ['class'],
        });

        console.log('🌅 LoginBackground v1.2 inicializado');
    },
};

window.LoginBackground = LoginBackground;