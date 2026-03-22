/* ═══════════════════════════════════════════════════════
   LOGIN-INTRO.JS v2.0 — NyanTools にゃん~

   REGRAS:
   1. Efeito aparece DENTRO da intro (não depois, não no login)
   2. Efeito só funciona se o tema atual BATE com o tema da intro comprada
      - Sakura  → tema pink    (se usuário mudou o tema depois, sem efeito)
      - Midnight → tema indigo
      - Neon    → tema teal
      - Chamas  → tema red
   3. Usuário sem a intro comprada + tema certo → sem efeito
   4. Intro termina → efeito some junto
   5. Overlay NÃO persiste na tela de login
   ═══════════════════════════════════════════════════════ */

const LoginIntro = {

    STORAGE_KEY: 'nyan_intro_last_shown',
    _el:         null,
    _callback:   null,
    _skipped:    false,

    // Mapa: id do item de tema → tema que ele exige estar ativo
    EFFECT_THEME_MAP: {
        sakura:  'pink',
        stars:   'indigo',
        glitch:  'teal',
        fire:    'red',
    },

    // ── VERIFICAÇÕES ─────────────────────────────────────

    _shouldPlay() {
        return window.Utils?.loadData('intro_disabled') !== true;
    },

    // Retorna o efeito ativo SE:
    //   a) o item de tema correspondente está EQUIPADO no inventário
    //   b) E o tema atual da UI BATE com o tema do item
    // Caso contrário retorna null
    _getActiveEffect() {
        if (!window.Inventory) return null;

        const equippedTheme = window.Inventory.getEquippedItem('theme');
        if (!equippedTheme?.effect) return null;

        const effect      = equippedTheme.effect;           // ex: 'sakura'
        const requiredTheme = this.EFFECT_THEME_MAP[effect]; // ex: 'pink'
        if (!requiredTheme) return null;

        const currentTheme = window.Utils?.loadData('app_color_theme') || 'purple';
        if (currentTheme !== requiredTheme) return null;     // tema trocado → sem efeito

        return effect;
    },

    // Cor de destaque da intro baseada no tema ativo
    _getThemeColor() {
        const effect = this._getActiveEffect();
        if (effect) {
            const effectColors = {
                sakura: '#f472b6',
                glitch: '#22d3ee',
                stars:  '#818cf8',
                fire:   '#ef4444',
            };
            if (effectColors[effect]) return effectColors[effect];
        }
        const theme = window.Utils?.loadData('app_color_theme') || 'purple';
        const map = {
            purple:'#a855f7', blue:'#3b82f6', green:'#10b981', red:'#ef4444',
            orange:'#f97316', pink:'#ec4899', teal:'#14b8a6', indigo:'#6366f1',
        };
        return map[theme] || '#a855f7';
    },

    // ── CRIAR OVERLAY DE EFEITO ──────────────────────────
    // Retorna um elemento DOM para ser anexado DENTRO de #login-intro-screen
    // (z-index abaixo do conteúdo da intro mas visível na tela preta)

    _createEffectOverlay(effect) {
        const container = document.createElement('div');
        container.id = 'intro-effect-overlay';
        container.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:1;overflow:hidden;';

        if (effect === 'sakura') {
            const style = document.createElement('style');
            style.textContent = `
                @keyframes sakuraPetal {
                    0%   { transform:translateY(-30px) translateX(0) rotate(0deg);      opacity:0; }
                    8%   { opacity:1; }
                    50%  { transform:translateY(50vh) translateX(20px) rotate(360deg);  opacity:0.9; }
                    100% { transform:translateY(110vh) translateX(-15px) rotate(720deg); opacity:0; }
                }
                .intro-sakura-petal { position:absolute; animation:sakuraPetal ease-in-out infinite; }
            `;
            container.appendChild(style);
            const petals  = ['🌸','🌸','🌺','🌸','🌸','🌸','🌺','🌸','🌸','🌸','🌺','🌸','🌸','🌸','🌸','🌸'];
            const sizes   = ['1rem','1.3rem','0.9rem','1.5rem','1.1rem','0.8rem','1.4rem','1.2rem',
                              '1rem','1.3rem','0.9rem','1.5rem','1.1rem','0.8rem','1.4rem','1.2rem'];
            for (let i = 0; i < 16; i++) {
                const p = document.createElement('div');
                p.className = 'intro-sakura-petal';
                p.textContent = petals[i];
                p.style.fontSize          = sizes[i];
                p.style.left              = `${3 + i * 6}%`;
                p.style.animationDuration = `${4 + (i % 5) * 0.8}s`;
                p.style.animationDelay    = `${i * 0.18}s`;
                container.appendChild(p);
            }
            return container;
        }

        if (effect === 'stars') {
            const style = document.createElement('style');
            style.textContent = `
                @keyframes introStarTwinkle {
                    0%,100% { opacity:0.1;  transform:scale(0.6) rotate(0deg);  filter:brightness(0.8); }
                    50%     { opacity:1;    transform:scale(1.4) rotate(20deg);  filter:brightness(1.5); }
                }
                @keyframes introStarDrift {
                    0%,100% { transform:translateY(0) scale(1); opacity:0.6; }
                    50%     { transform:translateY(-8px) scale(1.2); opacity:1; }
                }
                .intro-star { position:absolute; animation-timing-function:ease-in-out; animation-iteration-count:infinite; }
            `;
            container.appendChild(style);
            const starTypes = ['⭐','✨','🌟','💫','✦','★','⭐','✨','🌟','💫',
                                '✦','★','⭐','✨','🌟','💫','✦','★','⭐','✨',
                                '🌟','💫','✦','★','⭐'];
            const sizes = ['0.7rem','1rem','1.2rem','0.8rem','0.6rem','1.1rem','0.9rem','1.3rem',
                           '0.7rem','1rem','1.2rem','0.8rem','0.6rem','1.1rem','0.9rem','1.3rem',
                           '0.7rem','1rem','1.2rem','0.8rem','1.2rem','0.8rem','0.6rem','1.1rem','0.9rem'];
            for (let i = 0; i < 25; i++) {
                const s = document.createElement('div');
                s.className = 'intro-star';
                s.textContent = starTypes[i];
                s.style.fontSize          = sizes[i];
                s.style.left              = `${(i * 71 + 13) % 95}%`;
                s.style.top               = `${(i * 53 + 7)  % 90}%`;
                s.style.animationName     = i % 3 === 0 ? 'introStarDrift' : 'introStarTwinkle';
                s.style.animationDuration = `${1.2 + (i % 4) * 0.6}s`;
                s.style.animationDelay    = `${i * 0.14}s`;
                container.appendChild(s);
            }
            return container;
        }

        if (effect === 'glitch') {
            const style = document.createElement('style');
            style.textContent = `
                @keyframes introGlitchShift {
                    0%,80%,100% { opacity:1; transform:none; filter:none; }
                    82% { transform:translateX(-6px) skewX(-2deg); filter:hue-rotate(90deg) brightness(1.3); }
                    84% { transform:translateX(6px)  skewX(2deg);  filter:hue-rotate(-90deg) brightness(0.8); }
                    86% { transform:translateX(-3px);               filter:none; }
                    88% { transform:translateX(3px);                filter:none; }
                }
                @keyframes introScanMove {
                    0%   { transform:translateY(-100%); opacity:0; }
                    10%  { opacity:0.8; }
                    90%  { opacity:0.8; }
                    100% { transform:translateY(100vh); opacity:0; }
                }
                @keyframes introScanBlink {
                    0%,100% { opacity:0; }
                    50%     { opacity:0.5; }
                }
                .intro-glitch-overlay {
                    position:absolute; inset:0; pointer-events:none;
                    background:linear-gradient(135deg,rgba(20,184,166,0.08),rgba(99,102,241,0.08));
                    animation:introGlitchShift 2.5s infinite;
                }
                .intro-scan-move {
                    position:absolute; left:0; right:0; height:3px;
                    background:linear-gradient(90deg,transparent,rgba(20,184,166,0.7),rgba(99,102,241,0.7),transparent);
                    animation:introScanMove linear infinite; pointer-events:none;
                }
                .intro-scan-static {
                    position:absolute; left:0; right:0; height:1px;
                    background:rgba(20,184,166,0.25);
                    animation:introScanBlink ease-in-out infinite;
                }
            `;
            container.appendChild(style);
            const overlay = document.createElement('div');
            overlay.className = 'intro-glitch-overlay';
            container.appendChild(overlay);
            for (let i = 0; i < 3; i++) {
                const line = document.createElement('div');
                line.className = 'intro-scan-move';
                line.style.animationDuration = `${3 + i * 1.2}s`;
                line.style.animationDelay    = `${i * 1.1}s`;
                container.appendChild(line);
            }
            for (let i = 0; i < 8; i++) {
                const line = document.createElement('div');
                line.className = 'intro-scan-static';
                line.style.top              = `${10 + i * 11}%`;
                line.style.animationDelay   = `${i * 0.4}s`;
                line.style.animationDuration= `${2 + (i % 3) * 0.5}s`;
                container.appendChild(line);
            }
            return container;
        }

        if (effect === 'fire') {
            const style = document.createElement('style');
            style.textContent = `
                @keyframes introFireSpark {
                    0%   { transform:translateY(0) translateX(0) scale(1) rotate(0deg);       opacity:1; }
                    40%  { transform:translateY(-50px) translateX(8px) scale(0.8) rotate(15deg); opacity:0.8; }
                    100% { transform:translateY(-110px) translateX(-5px) scale(0) rotate(-10deg); opacity:0; }
                }
                @keyframes introFireFlicker {
                    0%,100% { opacity:0.7; transform:scaleY(1); }
                    50%     { opacity:1;   transform:scaleY(1.15); }
                }
                .intro-fire-spark   { position:absolute; animation:introFireSpark ease-out infinite; }
                .intro-fire-flicker { position:absolute; animation:introFireFlicker ease-in-out infinite; }
            `;
            container.appendChild(style);
            const sparkE = ['🔥','✨','🔥','🌟','🔥','✨','🔥','🔥','✨','🔥','🌟','🔥','🔥','✨','🔥','🔥'];
            const sparkS = ['1.4rem','0.8rem','1.1rem','0.7rem','1.3rem','0.9rem','1.5rem','1.0rem',
                             '1.2rem','0.8rem','1.4rem','0.7rem','1.1rem','0.9rem','1.3rem','1.0rem'];
            for (let i = 0; i < 16; i++) {
                const s = document.createElement('div');
                s.className = 'intro-fire-spark';
                s.textContent = sparkE[i];
                s.style.fontSize          = sparkS[i];
                s.style.left              = `${4 + i * 6}%`;
                s.style.bottom            = `${2 + (i % 5) * 4}%`;
                s.style.animationDuration = `${0.9 + (i % 4) * 0.3}s`;
                s.style.animationDelay    = `${i * 0.12}s`;
                container.appendChild(s);
            }
            for (let i = 0; i < 8; i++) {
                const f = document.createElement('div');
                f.className = 'intro-fire-flicker';
                f.textContent = '🔥';
                f.style.fontSize          = `${1.2 + (i % 3) * 0.4}rem`;
                f.style.left              = `${5 + i * 12}%`;
                f.style.bottom            = '0';
                f.style.animationDuration = `${0.6 + (i % 3) * 0.2}s`;
                f.style.animationDelay    = `${i * 0.1}s`;
                container.appendChild(f);
            }
            return container;
        }

        return null;
    },

    // ── BUILD DA TELA DE INTRO ───────────────────────────

    _build() {
        const color      = this._getThemeColor();
        const colorFaded = color + '44';

        const el = document.createElement('div');
        el.id = 'login-intro-screen';
        el.style.cssText = `
            position:fixed; inset:0; z-index:99999;
            background:#000008;
            display:flex; flex-direction:column;
            align-items:center; justify-content:center;
            gap:0; cursor:pointer; user-select:none;
            overflow:hidden;
        `;

        el.innerHTML = `
            <style>
                #login-intro-screen * { box-sizing:border-box; }
                #intro-icon {
                    font-size:72px; line-height:1; opacity:0; position:relative; z-index:2;
                    transform:scale(0.3) rotate(-15deg);
                    animation:introIconIn 0.65s cubic-bezier(0.34,1.56,0.64,1) 0.15s forwards;
                    filter:drop-shadow(0 0 28px ${color}88);
                }
                @keyframes introIconIn { to { opacity:1; transform:scale(1) rotate(0deg); } }
                #intro-title {
                    font-family:'Syne',sans-serif; font-weight:900; font-size:3rem;
                    letter-spacing:-0.03em; color:white; margin-top:18px;
                    display:flex; gap:0; overflow:hidden; position:relative; z-index:2;
                }
                .intro-letter { opacity:0; transform:translateY(12px); animation:introLetterIn 0.22s ease forwards; }
                @keyframes introLetterIn { to { opacity:1; transform:translateY(0); } }
                #intro-sub {
                    font-family:'DM Sans',sans-serif; font-size:1rem; font-weight:500;
                    letter-spacing:0.22em; margin-top:10px; opacity:0; position:relative; z-index:2;
                    animation:introSubIn 0.5s ease 1.55s forwards;
                }
                @keyframes introSubIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
                #intro-sub::after {
                    content:''; position:absolute; inset:-4px -12px;
                    background:radial-gradient(ellipse at 50% 50%, ${colorFaded}, transparent 70%);
                    border-radius:99px; animation:introSubGlow 1.2s ease 1.7s both;
                }
                @keyframes introSubGlow { from{opacity:0;transform:scale(0.6)} 50%{opacity:1;transform:scale(1.2)} to{opacity:0.6;transform:scale(1)} }
                #intro-line {
                    width:0; height:1.5px; position:relative; z-index:2;
                    background:linear-gradient(90deg,transparent,${color},transparent);
                    margin-top:20px; animation:introLineGrow 0.5s ease 0.85s forwards;
                }
                @keyframes introLineGrow { to { width:180px; } }
                #intro-skip {
                    position:absolute; bottom:32px; left:50%; transform:translateX(-50%);
                    font-family:'DM Sans',sans-serif; font-size:0.7rem; z-index:2;
                    color:rgba(255,255,255,0.2); letter-spacing:0.12em;
                    opacity:0; animation:introSkipIn 0.4s ease 1.8s forwards;
                }
                @keyframes introSkipIn { to { opacity:1; } }
                #login-intro-screen.fade-out { animation:introFadeOut 0.6s ease forwards; }
                @keyframes introFadeOut { from{opacity:1} to{opacity:0;pointer-events:none} }
            </style>
            <div id="intro-icon">🐱</div>
            <div id="intro-title"></div>
            <div id="intro-line"></div>
            <div id="intro-sub" style="color:${color};">にゃん~</div>
            <div id="intro-skip">clique para pular</div>
        `;
        return el;
    },

    _animateTitle() {
        const titleEl   = document.getElementById('intro-title');
        if (!titleEl) return;
        const text      = 'NyanTools';
        const baseDelay = 0.78;
        const perChar   = 0.072;
        text.split('').forEach((char, i) => {
            const span = document.createElement('span');
            span.className = 'intro-letter';
            span.textContent = char;
            span.style.animationDelay = `${(baseDelay + i * perChar).toFixed(3)}s`;
            titleEl.appendChild(span);
        });
    },

    // ── FINISH ───────────────────────────────────────────

    _finish() {
        if (this._skipped) return;
        this._skipped = true;
        const el = document.getElementById('login-intro-screen');
        if (!el) { this._callback?.(); return; }
        el.classList.add('fade-out');
        setTimeout(() => {
            el.remove(); // remove junto com o #intro-effect-overlay que está dentro dele
            this._callback?.();
        }, 620);
    },

    // ── RUN ──────────────────────────────────────────────

    run(callback) {
        this._callback = callback;
        this._skipped  = false;

        if (!this._shouldPlay()) { callback?.(); return; }

        this._el = this._build();
        document.body.appendChild(this._el);

        // Injetar efeito DENTRO da tela de intro (não no body separado)
        // Só funciona se tema ativo bate com o efeito comprado
        const activeEffect = this._getActiveEffect();
        if (activeEffect) {
            const effectOverlay = this._createEffectOverlay(activeEffect);
            if (effectOverlay) {
                this._el.appendChild(effectOverlay); // filho da intro, some com ela
            }
        }

        this._animateTitle();
        this._el.addEventListener('click', () => this._finish());
        setTimeout(() => this._finish(), 4500);
    },

    // ── SETTINGS ─────────────────────────────────────────

    setEnabled(enabled) {
        window.Utils?.saveData('intro_disabled', !enabled);
        window.Utils?.showNotification(enabled ? '🎬 Intro ativada' : '🎬 Intro desativada', 'info');
    },

    isEnabled() {
        return window.Utils?.loadData('intro_disabled') !== true;
    },

    renderSettingsRow() {
        const enabled = this.isEnabled();
        return `
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div class="flex items-center gap-3">
                    <span class="text-2xl">🎬</span>
                    <div>
                        <div class="font-semibold text-gray-800 text-sm flex items-center gap-2">
                            Intro Animada
                            <span style="display:inline-flex;align-items:center;font-size:0.7rem;font-weight:700;background:linear-gradient(135deg,rgba(168,85,247,0.15),rgba(236,72,153,0.15));border:1px solid rgba(168,85,247,0.3);color:#c084fc;border-radius:99px;padding:2px 8px;letter-spacing:0.04em;text-transform:uppercase;">NOVO</span>
                        </div>
                        <div class="text-xs text-gray-500">Exibir animação ao abrir · efeito ativo quando tema bate com a intro comprada</div>
                    </div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox"
                           ${enabled ? 'checked' : ''}
                           onchange="LoginIntro.setEnabled(this.checked)"
                           class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-300 peer-checked:bg-blue-500 rounded-full transition-colors peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow"></div>
                </label>
            </div>
        `;
    },
};

window.LoginIntro = LoginIntro;