/* ═══════════════════════════════════════════════════════
   SLOTMACHINE.JS v1.0.0 — NyanTools にゃん~
   v3.7.0 "Zona Arcade" —
   ═══════════════════════════════════════════════════════ */

const SlotMachine = {

    COST:     10,
    SYMBOLS:  ['🐱','🔑','🌤️','🤖','🎵','📝','⭐','💎'],
    PAYOUTS:  { two: 1, three: 5, jackpot: 50 },

    _spinning:  false,
    _result:    null,
    _reels:     ['🐱','🐱','🐱'],
    _lastWin:   0,

    // ── CHIPS — reset diário às 00h ────────────────────
    _CHIPS_KEY:  'nyan_chips',
    _CHIPS_DATE: 'nyan_chips_date',
    _CHIPS_START: 100,

    _getToday() {
        const d = new Date();
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    },

    getChips() {
        const saved = Utils.loadData(this._CHIPS_DATE);
        if (saved !== this._getToday()) {
            Utils.saveData(this._CHIPS_KEY, this._CHIPS_START);
            Utils.saveData(this._CHIPS_DATE, this._getToday());
            return this._CHIPS_START;
        }
        return Utils.loadData(this._CHIPS_KEY) ?? this._CHIPS_START;
    },

    setChips(n) {
        Utils.saveData(this._CHIPS_KEY, Math.max(0, n));
        Utils.saveData(this._CHIPS_DATE, this._getToday());
    },

    // ── HELPERS ───────────────────────────────────────
    _isDark() { return document.body.classList.contains('dark-theme'); },
    _colors() {
        const d = this._isDark();
        return {
            bg:     d ? 'rgba(255,255,255,0.04)' : '#ffffff',
            border: d ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
            text:   d ? '#f1f5f9'                : '#0f172a',
            sub:    d ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)',
            muted:  d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)',
            inner:  d ? 'rgba(255,255,255,0.06)' : '#f8fafc',
            reel:   d ? 'rgba(0,0,0,0.35)'       : '#f1f5f9',
        };
    },

    // ── SPIN ──────────────────────────────────────────
    spin() {
        if (this._spinning) return;
        const chips = this.getChips();
        if (chips < this.COST) return;

        this.setChips(chips - this.COST);
        this._spinning = true;
        this._result = null;
        this._lastWin = 0;
        this._totalSpins++;

        // Gerar resultado real
        const r0 = this.SYMBOLS[Math.floor(Math.random() * this.SYMBOLS.length)];
        const r1 = this.SYMBOLS[Math.floor(Math.random() * this.SYMBOLS.length)];
        const r2 = this.SYMBOLS[Math.floor(Math.random() * this.SYMBOLS.length)];
        const final = [r0, r1, r2];

        // Animação dos rolos — para um por um com delay
        this._animateReel(0, final[0], 800);
        this._animateReel(1, final[1], 1300);
        this._animateReel(2, final[2], 1800, () => {
            this._reels = final;
            this._evalResult(final);
            this._spinning = false;
            this._updateUI();
        });

        this._updateReelAnimation();
    },

    _animateReel(idx, finalSymbol, stopAt, onDone) {
        const el = document.getElementById(`reel-${idx}`);
        if (!el) return;

        let count = 0;
        const interval = setInterval(() => {
            el.textContent = this.SYMBOLS[Math.floor(Math.random() * this.SYMBOLS.length)];
            count++;
        }, 80);

        setTimeout(() => {
            clearInterval(interval);
            el.textContent = finalSymbol;
            if (onDone) onDone();
        }, stopAt);
    },

    _updateReelAnimation() {
        [0,1,2].forEach((i) => {
            const el = document.getElementById(`reel-${i}`);
            if (el) el.style.animation = 'none';
        });
    },

    _evalResult(reels) {
        const [a, b, c] = reels;
        if (a === '🐱' && b === '🐱' && c === '🐱') {
            this._result = 'jackpot';
            this._lastWin = this.COST * this.PAYOUTS.jackpot;
            Utils.saveData('slot_jackpot_hit', true);
            Achievements?.checkAll?.();
        } else if (a === b && b === c) {
            this._result = 'three';
            this._lastWin = this.COST * this.PAYOUTS.three;
        } else if (a === b || b === c || a === c) {
            this._result = 'two';
            this._lastWin = this.COST * this.PAYOUTS.two;
        } else {
            this._result = 'nothing';
            this._lastWin = 0;
        }
        if (this._lastWin > 0) {
            this.setChips(this.getChips() + this._lastWin);
        }
    },

    _updateUI() {
        const c = this._colors();
        const chips = this.getChips();
        const chipsEl = document.getElementById('slot-chips');
        if (chipsEl) chipsEl.textContent = chips.toLocaleString('pt-BR');
        const resultEl = document.getElementById('slot-result');
        if (resultEl) {
            if (this._result === 'jackpot') {
                resultEl.innerHTML = `<div style="font-size:1.5rem;font-weight:900;color:#f59e0b;animation:slotJackpot 0.5s ease infinite alternate;">🎊 JACKPOT! +${this._lastWin} chips 🎊</div>`;
            } else if (this._result === 'three') {
                resultEl.innerHTML = `<div style="font-size:1rem;font-weight:800;color:#4ade80;">Três iguais! +${this._lastWin} chips</div>`;
            } else if (this._result === 'two') {
                resultEl.innerHTML = `<div style="font-size:0.875rem;font-weight:700;color:#a855f7;">Par! +${this._lastWin} chips (aposta devolvida)</div>`;
            } else {
                resultEl.innerHTML = `<div style="font-size:0.8rem;color:${c.muted};">Sem sorte dessa vez... にゃん~</div>`;
            }
        }

        // Atualizar botão
        const btn = document.getElementById('slot-btn');
        if (btn) {
            const canSpin = chips >= this.COST;
            btn.disabled = false;
            btn.style.opacity = canSpin ? '1' : '0.5';
            btn.style.cursor = canSpin ? 'pointer' : 'not-allowed';
            btn.textContent = canSpin ? `🎰 Girar (${this.COST} chips)` : 'Chips insuficientes';
        }

        // Payline glow no jackpot
        const payline = document.getElementById('slot-payline');
        if (payline) {
            payline.style.background = this._result === 'jackpot'
                ? 'linear-gradient(90deg,transparent,#f59e0b,transparent)'
                : this._result === 'three'
                ? 'linear-gradient(90deg,transparent,#4ade80,transparent)'
                : 'linear-gradient(90deg,transparent,var(--theme-primary,#a855f7),transparent)';
            payline.style.opacity = this._result && this._result !== 'nothing' ? '1' : '0.3';
        }
    },

    // ── RENDER ────────────────────────────────────────
    render() {
        const c = this._colors();
        const chips = this.getChips();
        const canSpin = !this._spinning && chips >= this.COST;
        const best = Utils.loadData('slot_highscore') || 0;

        return `
        <style>
            @keyframes slotJackpot{from{transform:scale(1)}to{transform:scale(1.05)}}
            @keyframes reelSpin{0%{transform:translateY(0)}100%{transform:translateY(-20px)}}
            .slot-reel{transition:transform 0.1s;}
        </style>
        <div style="max-width:480px;margin:0 auto;font-family:var(--font-body,'DM Sans',sans-serif);">

            <!-- Header -->
            <div style="text-align:center;margin-bottom:1.5rem;">
                <div style="font-size:2.5rem;margin-bottom:0.4rem;">🎰</div>
                <h1 style="font-family:var(--font-display,'Syne',sans-serif);font-size:var(--text-2xl,2rem);font-weight:900;margin:0 0 0.25rem;
                    background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));
                    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Caça-Níquel</h1>
                <p style="font-size:var(--text-xs,0.68rem);color:${c.muted};margin:0;">Chips compartilhados com outros jogos de sorte にゃん~</p>
            </div>

            <!-- Saldo -->
            <div style="display:flex;justify-content:center;gap:1rem;margin-bottom:1.25rem;">
                <div style="background:${c.inner};border:1px solid ${c.border};border-radius:var(--radius-lg,14px);
                    padding:0.625rem 1.5rem;text-align:center;">
                    <div style="font-size:0.6rem;font-weight:700;color:${c.muted};text-transform:uppercase;letter-spacing:0.06em;">Chips hoje</div>
                    <div id="slot-chips" style="font-size:1.6rem;font-weight:900;font-family:var(--font-display,'Syne',sans-serif);
                        color:var(--theme-primary,#a855f7);">${chips.toLocaleString('pt-BR')}</div>
                </div>
                <div style="background:${c.inner};border:1px solid ${c.border};border-radius:var(--radius-lg,14px);
                    padding:0.625rem 1.25rem;text-align:center;">
                    <div style="font-size:0.6rem;font-weight:700;color:${c.muted};text-transform:uppercase;letter-spacing:0.06em;">Reset em</div>
                    <div style="font-size:1.1rem;font-weight:900;font-family:var(--font-display,'Syne',sans-serif);color:${c.text};">${(() => {
                        const now = new Date(); const mid = new Date(now); mid.setHours(24,0,0,0);
                        const diff = Math.round((mid-now)/60000);
                        return `${Math.floor(diff/60)}h${diff%60}m`;
                    })()}</div>
                </div>
            </div>

            <!-- Máquina -->
            <div style="background:${c.bg};border:2px solid ${c.border};border-radius:var(--radius-2xl,24px);padding:1.75rem;margin-bottom:1rem;position:relative;">

                <!-- Payline -->
                <div id="slot-payline" style="position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);
                    height:3px;background:linear-gradient(90deg,transparent,var(--theme-primary,#a855f7),transparent);
                    opacity:0.3;pointer-events:none;border-radius:99px;"></div>

                <!-- Rolos -->
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:1.25rem;">
                    ${[0,1,2].map(i => `
                    <div style="background:${c.reel};border-radius:var(--radius-lg,14px);border:2px solid ${c.border};
                        height:90px;display:flex;align-items:center;justify-content:center;
                        font-size:2.75rem;overflow:hidden;position:relative;">
                        <span id="reel-${i}" class="slot-reel" style="display:block;line-height:1;">${this._reels[i]}</span>
                    </div>`).join('')}
                </div>

                <!-- Resultado -->
                <div id="slot-result" style="text-align:center;min-height:32px;display:flex;align-items:center;justify-content:center;">
                    ${this._result === 'jackpot'
                        ? `<div style="font-size:1.5rem;font-weight:900;color:#f59e0b;">🎊 JACKPOT! +${this._lastWin} chips 🎊</div>`
                        : this._result === 'three'
                        ? `<div style="font-size:1rem;font-weight:800;color:#4ade80;">Três iguais! +${this._lastWin} chips</div>`
                        : this._result === 'two'
                        ? `<div style="font-size:0.875rem;font-weight:700;color:#a855f7;">Par! +${this._lastWin} chips (aposta devolvida)</div>`
                        : this._result === 'nothing'
                        ? `<div style="font-size:0.8rem;color:${c.muted};">Sem sorte... にゃん~</div>`
                        : `<div style="font-size:0.75rem;color:${c.muted};">Pressione Girar para jogar</div>`}
                </div>
            </div>

            <!-- Botão -->
            <button id="slot-btn" onclick="SlotMachine.spin()"
                ${!canSpin ? 'disabled' : ''}
                style="width:100%;padding:0.875rem;border-radius:var(--radius-lg,14px);border:none;
                    cursor:${canSpin?'pointer':'not-allowed'};font-weight:900;
                    font-size:var(--text-base,0.875rem);font-family:var(--font-display,'Syne',sans-serif);
                    background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));
                    color:white;letter-spacing:0.02em;opacity:${canSpin?'1':'0.5'};
                    transition:filter 0.15s,transform 0.1s;margin-bottom:1rem;"
                onmouseover="if(!this.disabled)this.style.filter='brightness(1.1)'"
                onmouseout="this.style.filter=''"
                onmousedown="if(!this.disabled)this.style.transform='scale(0.97)'"
                onmouseup="this.style.transform=''">
                🎰 Girar (${this.COST} chips)
            </button>

            <!-- Tabela de pagamentos -->
            <div style="background:${c.inner};border:1px solid ${c.border};border-radius:var(--radius-lg,14px);padding:0.875rem;">
                <div style="font-size:var(--text-xs,0.68rem);font-weight:700;color:${c.muted};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.625rem;">Tabela de pagamentos</div>
                <div style="display:flex;flex-direction:column;gap:0.3rem;">
                    ${[
                        ['🐱🐱🐱', 'Jackpot', `${this.COST * this.PAYOUTS.jackpot} chips`, '#f59e0b'],
                        ['⭐⭐⭐', 'Três iguais', `${this.COST * this.PAYOUTS.three} chips`, '#4ade80'],
                        ['🎵🎵💎', 'Par', `${this.COST * this.PAYOUTS.two} chips (aposta devolvida)`, '#a855f7'],
                    ].map(([sym, name, pay, col]) => `
                    <div style="display:flex;align-items:center;justify-content:space-between;font-size:var(--text-xs,0.7rem);">
                        <span style="font-size:0.9rem;">${sym}</span>
                        <span style="color:${c.muted};">${name}</span>
                        <span style="font-weight:700;color:${col};">${pay}</span>
                    </div>`).join('')}
                </div>
            </div>

            <div style="text-align:center;margin-top:0.75rem;">
                <button onclick="OfflineZone.backToMenu()"
                    style="font-size:var(--text-xs,0.68rem);color:${c.muted};background:none;border:none;
                        cursor:pointer;font-family:var(--font-body,'DM Sans',sans-serif);transition:color 0.15s;"
                    onmouseover="this.style.color='${c.colors?.text||'#f1f5f9'}'" onmouseout="this.style.color='${c.muted}'">
                    ← Voltar ao menu
                </button>
            </div>
        </div>`;
    },

    init() {
        this._spinning = false;
        this._result = null;
        this._reels = ['🐱', '🐱', '🐱'];
    },
};

window.SlotMachine = SlotMachine;