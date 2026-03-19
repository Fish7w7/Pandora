/* ═══════════════════════════════════════════════════════
   LOGIN-INTRO.JS v1.0 — NyanTools にゃん~
   ═══════════════════════════════════════════════════════ */

const LoginIntro = {

    STORAGE_KEY:  'nyan_intro_last_shown',
    _el:          null,
    _callback:    null,
    _skipped:     false,

    // ── VERIFICAR SE DEVE TOCAR ────────────────────────

    _shouldPlay() {
        const disabled = window.Utils?.loadData('intro_disabled');
        return disabled !== true;
    },

    _markShown() {
    },

    // ── TEMA ATUAL → COR DE DESTAQUE ──────────────────

    _getThemeColor() {
        const theme = window.Utils?.loadData('app_color_theme') || 'purple';
        const map = {
            purple: '#a855f7',
            blue:   '#3b82f6',
            green:  '#10b981',
            red:    '#ef4444',
            orange: '#f97316',
            pink:   '#ec4899',
            teal:   '#14b8a6',
            indigo: '#6366f1',
        };
        return map[theme] || '#a855f7';
    },

    // ── BUILD ─────────────────────────────────────────

    _build() {
        const color = this._getThemeColor();
        const colorFaded = color + '44'; // 27% opacity

        const el = document.createElement('div');
        el.id = 'login-intro-screen';
        el.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 99999;
            background: #000008;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0;
            cursor: pointer;
            user-select: none;
        `;

        el.innerHTML = `
            <style>
                #login-intro-screen * { box-sizing: border-box; }

                /* ── Ícone 🐱 ── */
                #intro-icon {
                    font-size: 72px;
                    line-height: 1;
                    opacity: 0;
                    transform: scale(0.3) rotate(-15deg);
                    animation: introIconIn 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s forwards;
                    filter: drop-shadow(0 0 28px ${color}88);
                }

                @keyframes introIconIn {
                    to { opacity: 1; transform: scale(1) rotate(0deg); }
                }

                /* ── "NyanTools" ── */
                #intro-title {
                    font-family: 'Syne', sans-serif;
                    font-weight: 900;
                    font-size: 3rem;
                    letter-spacing: -0.03em;
                    color: white;
                    margin-top: 18px;
                    display: flex;
                    gap: 0;
                    overflow: hidden;
                }

                .intro-letter {
                    opacity: 0;
                    transform: translateY(12px);
                    animation: introLetterIn 0.22s ease forwards;
                }

                @keyframes introLetterIn {
                    to { opacity: 1; transform: translateY(0); }
                }

                /* ── "にゃん~" ── */
                #intro-sub {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 1rem;
                    font-weight: 500;
                    letter-spacing: 0.22em;
                    margin-top: 10px;
                    opacity: 0;
                    animation: introSubIn 0.5s ease 1.55s forwards;
                    position: relative;
                }

                @keyframes introSubIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                /* Brilho em cima do texto にゃん~ */
                #intro-sub::after {
                    content: '';
                    position: absolute;
                    inset: -4px -12px;
                    background: radial-gradient(ellipse at 50% 50%, ${colorFaded}, transparent 70%);
                    border-radius: 99px;
                    animation: introSubGlow 1.2s ease 1.7s both;
                }

                @keyframes introSubGlow {
                    from { opacity: 0; transform: scale(0.6); }
                    50%  { opacity: 1; transform: scale(1.2); }
                    to   { opacity: 0.6; transform: scale(1); }
                }

                /* Linha divisória decorativa */
                #intro-line {
                    width: 0;
                    height: 1.5px;
                    background: linear-gradient(90deg, transparent, ${color}, transparent);
                    margin-top: 20px;
                    animation: introLineGrow 0.5s ease 0.85s forwards;
                }

                @keyframes introLineGrow {
                    to { width: 180px; }
                }

                /* Texto "clique para pular" */
                #intro-skip {
                    position: absolute;
                    bottom: 32px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.7rem;
                    color: rgba(255,255,255,0.2);
                    letter-spacing: 0.12em;
                    opacity: 0;
                    animation: introSkipIn 0.4s ease 1.8s forwards;
                }

                @keyframes introSkipIn {
                    to { opacity: 1; }
                }

                /* Fade out de tudo */
                #login-intro-screen.fade-out {
                    animation: introFadeOut 0.6s ease forwards;
                }

                @keyframes introFadeOut {
                    from { opacity: 1; }
                    to   { opacity: 0; pointer-events: none; }
                }
            </style>

            <div id="intro-icon">🐱</div>

            <div id="intro-title"></div>

            <div id="intro-line"></div>

            <div id="intro-sub" style="color: ${color};">にゃん~</div>

            <div id="intro-skip">clique para pular</div>
        `;

        return el;
    },

    // ── ANIMAR TÍTULO LETRA POR LETRA ─────────────────

    _animateTitle() {
        const titleEl = document.getElementById('intro-title');
        if (!titleEl) return;

        const text       = 'NyanTools';
        const baseDelay  = 0.78;
        const perChar    = 0.072;

        text.split('').forEach((char, i) => {
            const span = document.createElement('span');
            span.className = 'intro-letter';
            span.textContent = char;
            span.style.animationDelay = `${(baseDelay + i * perChar).toFixed(3)}s`;
            titleEl.appendChild(span);
        });
    },

    // ── FECHAR ────────────────────────────────────────

    _finish() {
        if (this._skipped) return;
        this._skipped = true;

        const el = document.getElementById('login-intro-screen');
        if (!el) {
            this._callback?.();
            return;
        }

        el.classList.add('fade-out');
        setTimeout(() => {
            el.remove();
            this._callback?.();
        }, 620);
    },

    // ── RUN ───────────────────────────────────────────

    run(callback) {
        this._callback = callback;
        this._skipped  = false;

        if (!this._shouldPlay()) {
            callback?.();
            return;
        }

        this._markShown();

        this._el = this._build();
        document.body.appendChild(this._el);

        this._animateTitle();

        this._el.addEventListener('click', () => this._finish());

        setTimeout(() => this._finish(), 2800);

        console.log('🎬 LoginIntro: intro iniciada');
    },

    // ── TOGGLE NAS CONFIGURAÇÕES ──────────────────────
    setEnabled(enabled) {
        window.Utils?.saveData('intro_disabled', !enabled);
        window.Utils?.showNotification(
            enabled ? '🎬 Intro ativada' : '🎬 Intro desativada',
            'info'
        );
    },

    isEnabled() {
        return window.Utils?.loadData('intro_disabled') !== true;
    },

    // Renderizar row para Settings → aba Aparência
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
                        <div class="text-xs text-gray-500">Exibir animação de abertura 1x por dia</div>
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