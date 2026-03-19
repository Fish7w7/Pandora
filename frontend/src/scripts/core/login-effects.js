/* ═══════════════════════════════════════════════════════
   LOGIN-EFFECTS.JS v2.0 — NyanTools にゃん~
   v3.5.0 — Otimizado para software renderer
   ═══════════════════════════════════════════════════════ */

const LoginEffects = {

    _typeInterval: null,
    _setupDone:    false,

    _startTyping() {
        clearInterval(this._typeInterval);

        const subtitle = document.querySelector('#login-screen .text-white\\/40');
        if (!subtitle) return;

        const fullText = subtitle.dataset.originalText || subtitle.textContent.trim();
        subtitle.dataset.originalText = fullText;

        let cursor = document.getElementById('login-typing-cursor');
        if (!cursor) {
            cursor = document.createElement('span');
            cursor.id = 'login-typing-cursor';
            cursor.style.cssText = `
                display: inline-block;
                width: 2px; height: 0.82em;
                background: rgba(168,85,247,0.7);
                margin-left: 1px;
                vertical-align: middle;
                animation: loginCursorBlink 0.9s step-end infinite;
            `;
        }

        subtitle.textContent = '';
        subtitle.appendChild(cursor);

        let i = 0;
        this._typeInterval = setInterval(() => {
            if (i < fullText.length) {
                subtitle.insertBefore(document.createTextNode(fullText.charAt(i)), cursor);
                i++;
            } else {
                clearInterval(this._typeInterval);
                setTimeout(() => {
                    cursor?.remove();
                    subtitle.textContent = fullText;
                }, 2000);
            }
        }, 38);
    },

    _setupLogo() {
        const logoWrap = document.querySelector('#login-screen .inline-flex.items-center.justify-center');
        if (!logoWrap || logoWrap.id === 'login-logo-icon') return;
        logoWrap.id = 'login-logo-icon';
        logoWrap.style.animation = 'loginLogoEnter 0.65s cubic-bezier(0.34,1.56,0.64,1) 0.2s both';
    },

    _animateLogo(type) {
        const logo = document.getElementById('login-logo-icon');
        if (!logo) return;
        logo.style.animation = 'none';
        logo.offsetHeight;
        if (type === 'error')   logo.style.animation = 'loginLogoShake 0.48s ease both';
        if (type === 'success') logo.style.animation = 'loginLogoPulse 0.55s ease both';
    },

    _setInputOutline(el, color) {
        if (!el) return;
        el.style.outline       = color ? `2px solid ${color}` : 'none';
        el.style.outlineOffset = '0px';
    },

    _injectStyles() {
        if (document.getElementById('login-effects-style')) return;
        const style = document.createElement('style');
        style.id = 'login-effects-style';
        style.textContent = `
            @keyframes loginCursorBlink {
                0%, 100% { opacity: 1; }
                50%       { opacity: 0; }
            }
            @keyframes loginLogoEnter {
                0%   { transform: scale(0.55) rotate(-12deg); opacity: 0; }
                65%  { transform: scale(1.10) rotate(3deg);   opacity: 1; }
                80%  { transform: scale(0.97) rotate(-1deg); }
                100% { transform: scale(1)    rotate(0deg);   opacity: 1; }
            }
            @keyframes loginLogoShake {
                0%,100% { transform: translateX(0); }
                18%     { transform: translateX(-8px) rotate(-6deg); }
                36%     { transform: translateX(8px)  rotate(6deg); }
                54%     { transform: translateX(-5px) rotate(-3deg); }
                72%     { transform: translateX(5px)  rotate(3deg); }
                88%     { transform: translateX(-2px) rotate(-1deg); }
            }
            @keyframes loginLogoPulse {
                0%   { transform: scale(1); }
                35%  { transform: scale(1.2); filter: brightness(1.25); }
                65%  { transform: scale(0.97); }
                100% { transform: scale(1); filter: brightness(1); }
            }
        `;
        document.head.appendChild(style);
    },

    _setupListeners() {
        const u  = document.getElementById('login-username');
        const p  = document.getElementById('login-password');
        const f  = document.getElementById('login-form');
        const er = document.getElementById('login-error');
        const ls = document.getElementById('login-screen');

        if (!u || !p) return;

        u.addEventListener('focus', () => this._setInputOutline(u, 'rgba(168,85,247,0.6)'));
        u.addEventListener('blur',  () => this._setInputOutline(u, null));
        p.addEventListener('focus', () => this._setInputOutline(p, 'rgba(99,102,241,0.6)'));
        p.addEventListener('blur',  () => this._setInputOutline(p, null));

        if (er) {
            new MutationObserver(() => {
                if (!er.classList.contains('hidden')) {
                    this._animateLogo('error');
                    this._setInputOutline(u, 'rgba(239,68,68,0.6)');
                    this._setInputOutline(p, 'rgba(239,68,68,0.6)');
                    setTimeout(() => {
                        this._setInputOutline(u, null);
                        this._setInputOutline(p, null);
                    }, 2000);
                }
            }).observe(er, { attributes: true, attributeFilter: ['class'] });
        }

        if (ls) {
            new MutationObserver((ms) => {
                ms.forEach(m => {
                    if (m.attributeName === 'class' && ls.classList.contains('hidden')) {
                        this._animateLogo('success');
                    }
                });
            }).observe(ls, { attributes: true, attributeFilter: ['class'] });
        }

        this._setupDone = true;
    },

    inject() {
        this._injectStyles();
        this._setupLogo();
        this._startTyping();
        setTimeout(() => this._setupListeners(), 400);
        console.log('✨ LoginEffects v2: injetado');
    },

    init() {
        setTimeout(() => {
            const ls = document.getElementById('login-screen');
            if (ls && !ls.classList.contains('hidden')) this.inject();
        }, 120);

        const observer = new MutationObserver(() => {
            const ls = document.getElementById('login-screen');
            if (ls && !ls.classList.contains('hidden')) {
                this._setupDone = false;
                setTimeout(() => this.inject(), 180);
            }
        });
        observer.observe(document.body, {
            attributes: true, subtree: true, attributeFilter: ['class'],
        });

        console.log('✨ LoginEffects v2.0 inicializado');
    },
};

window.LoginEffects = LoginEffects;