/* ═══════════════════════════════════════════════════════
   SLOTMACHINE.JS v1.1.0 — NyanTools にゃん~
   v3.8.0 "Nyan Economy" — Chips integrados ao Economy
   - Chips lidos/escritos via Economy (nyan_economy.chips)
   - Reset diário vira bônus de +100 chips, não sobrescrita
   - Jackpot e jogadas concedem XP via Economy.grant()
   ═══════════════════════════════════════════════════════ */

const SlotMachine = {

    COST:     10,
    SYMBOLS:  ['🐱','🔑','🌤️','🤖','🎵','📝','⭐','💎'],
    PAYOUTS:  { two: 1, three: 5, jackpot: 50 },

    _spinning:  false,
    _result:    null,
    _reels:     ['🐱','🐱','🐱'],
    _lastWin:   0,

    // ── CHIPS — integrado ao Economy ──────────────────
    // Chips vivem em nyan_economy.chips (permanentes, sem reset).
    // O bônus diário de +100 é SOMADO ao saldo existente,
    // nunca sobrescreve. Só é concedido uma vez por dia.
    _BONUS_DATE_KEY: 'nyan_slot_bonus_date',
    _DAILY_BONUS:    100,

    _getToday() {
        const d = new Date();
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    },

    // Verifica e concede bônus diário — retorna true se concedeu
    _checkDailyBonus() {
        const last = Utils.loadData(this._BONUS_DATE_KEY);
        if (last === this._getToday()) return false;

        if (window.Economy) {
            Economy.grantChips(this._DAILY_BONUS, 'Bônus diário Caça-Níquel');
        } else {
            const cur = parseInt(Utils.loadData('nyan_chips') || '0', 10);
            Utils.saveData('nyan_chips', cur + this._DAILY_BONUS);
        }

        Utils.saveData(this._BONUS_DATE_KEY, this._getToday());
        return true;
    },

    // Retorna o saldo atual de chips
    getChips() {
        const bonusGranted = this._checkDailyBonus();
        if (bonusGranted) {
            setTimeout(() => {
                Utils.showNotification?.(
                    `🎰 Bônus diário: +${this._DAILY_BONUS} chips! にゃん~`,
                    'success'
                );
            }, 500);
        }
        if (window.Economy) return Economy.getChips();
        return parseInt(Utils.loadData('nyan_chips') || '0', 10);
    },

    // Debita chips ao girar
    _debitSpin() {
        if (window.Economy) {
            Economy.spendChips(this.COST);
        } else {
            const cur = parseInt(Utils.loadData('nyan_chips') || '0', 10);
            Utils.saveData('nyan_chips', Math.max(0, cur - this.COST));
        }
    },

    // Credita chips ao ganhar
    _creditWin(amount) {
        if (window.Economy) {
            Economy.grantChips(amount, 'Caça-Níquel ganho');
        } else {
            const cur = parseInt(Utils.loadData('nyan_chips') || '0', 10);
            Utils.saveData('nyan_chips', cur + amount);
        }
    },

    // ── HELPERS ───────────────────────────────────────
    _isDark() { return document.body.classList.contains('dark-theme'); },
    _colors() {
        const d = this._isDark();
        return {
            bg:    d ? 'rgba(255,255,255,0.04)' : '#ffffff',
            border:d ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
            text:  d ? '#f1f5f9'                : '#0f172a',
            sub:   d ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)',
            muted: d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)',
            inner: d ? 'rgba(255,255,255,0.06)' : '#f8fafc',
            reel:  d ? 'rgba(0,0,0,0.35)'       : '#f1f5f9',
        };
    },

    // ── SPIN ──────────────────────────────────────────
    spin() {
        if (this._spinning) return;
        if (this.getChips() < this.COST) return;

        this._debitSpin();
        this._spinning = true;
        this._result   = null;
        this._lastWin  = 0;

        const r0 = this.SYMBOLS[Math.floor(Math.random() * this.SYMBOLS.length)];
        const r1 = this.SYMBOLS[Math.floor(Math.random() * this.SYMBOLS.length)];
        const r2 = this.SYMBOLS[Math.floor(Math.random() * this.SYMBOLS.length)];
        const final = [r0, r1, r2];

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
        const interval = setInterval(() => {
            el.textContent = this.SYMBOLS[Math.floor(Math.random() * this.SYMBOLS.length)];
        }, 80);
        setTimeout(() => {
            clearInterval(interval);
            el.textContent = finalSymbol;
            if (onDone) onDone();
        }, stopAt);
    },

    _updateReelAnimation() {
        [0,1,2].forEach(i => {
            const el = document.getElementById(`reel-${i}`);
            if (el) el.style.animation = 'none';
        });
    },

    _evalResult(reels) {
        const [a, b, c] = reels;

        if (a === '🐱' && b === '🐱' && c === '🐱') {
            this._result  = 'jackpot';
            this._lastWin = this.COST * this.PAYOUTS.jackpot;
            Utils.saveData('slot_jackpot_hit', true);
            Achievements?.checkAll?.();
            window.Economy?.grant?.('slot_jackpot');
            window.Missions?.track?.({ event: 'slot_jackpot' });
        } else if (a === b && b === c) {
            this._result  = 'three';
            this._lastWin = this.COST * this.PAYOUTS.three;
        } else if (a === b || b === c || a === c) {
            this._result  = 'two';
            this._lastWin = this.COST * this.PAYOUTS.two;
        } else {
            this._result  = 'nothing';
            this._lastWin = 0;
        }

        if (this._lastWin > 0) {
            this._creditWin(this._lastWin);
        }

        // XP por jogar + missão de giro
        window.Economy?.grant?.('play_game');
        window.Missions?.track?.({ event: 'play_game', game: 'slot' });
    },

    _updateUI() {
        const c     = this._colors();
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

        const btn = document.getElementById('slot-btn');
        if (btn) {
            const canSpin      = chips >= this.COST;
            btn.disabled       = !canSpin;
            btn.style.opacity  = canSpin ? '1' : '0.5';
            btn.style.cursor   = canSpin ? 'pointer' : 'not-allowed';
            btn.textContent    = canSpin
                ? `🎰 Girar (${this.COST} chips)`
                : 'Chips insuficientes';
        }

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
        const c       = this._colors();
        const chips   = this.getChips();
        const canSpin = !this._spinning && chips >= this.COST;

        // Tempo até o próximo bônus diário
        const now = new Date();
        const mid = new Date(now);
        mid.setHours(24, 0, 0, 0);
        const diff      = Math.round((mid - now) / 60000);
        const bonusTime = `${Math.floor(diff / 60)}h${diff % 60}m`;

        // Já recebeu bônus hoje?
        const bonusReceived = Utils.loadData(this._BONUS_DATE_KEY) === this._getToday();

        return `
        <style>
            @keyframes slotJackpot { from{transform:scale(1)} to{transform:scale(1.05)} }
            .slot-reel { transition:transform 0.1s; }
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

            <!-- Saldo + bônus -->
            <div style="display:flex;justify-content:center;gap:1rem;margin-bottom:1.25rem;">
                <div style="background:${c.inner};border:1px solid ${c.border};border-radius:var(--radius-lg,14px);
                    padding:0.625rem 1.5rem;text-align:center;">
                    <div style="font-size:0.6rem;font-weight:700;color:${c.muted};text-transform:uppercase;letter-spacing:0.06em;">Seus chips</div>
                    <div id="slot-chips" style="font-size:1.6rem;font-weight:900;font-family:var(--font-display,'Syne',sans-serif);
                        color:var(--theme-primary,#a855f7);">${chips.toLocaleString('pt-BR')}</div>
                </div>
                <div style="background:${c.inner};border:1px solid ${c.border};border-radius:var(--radius-lg,14px);
                    padding:0.625rem 1.25rem;text-align:center;">
                    <div style="font-size:0.6rem;font-weight:700;color:${c.muted};text-transform:uppercase;letter-spacing:0.06em;">
                        ${bonusReceived ? 'Próximo bônus' : 'Bônus disponível'}
                    </div>
                    <div style="font-size:1.1rem;font-weight:900;font-family:var(--font-display,'Syne',sans-serif);
                        color:${bonusReceived ? c.text : '#4ade80'};">
                        ${bonusReceived ? bonusTime : '+100 chips!'}
                    </div>
                </div>
            </div>

            <!-- Máquina -->
            <div style="background:${c.bg};border:2px solid ${c.border};border-radius:var(--radius-2xl,24px);padding:1.75rem;margin-bottom:1rem;position:relative;">
                <div id="slot-payline" style="position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);
                    height:3px;background:linear-gradient(90deg,transparent,var(--theme-primary,#a855f7),transparent);
                    opacity:0.3;pointer-events:none;border-radius:99px;"></div>

                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:1.25rem;">
                    ${[0,1,2].map(i => `
                    <div style="background:${c.reel};border-radius:var(--radius-lg,14px);border:2px solid ${c.border};
                        height:90px;display:flex;align-items:center;justify-content:center;
                        font-size:2.75rem;overflow:hidden;position:relative;">
                        <span id="reel-${i}" class="slot-reel" style="display:block;line-height:1;">${this._reels[i]}</span>
                    </div>`).join('')}
                </div>

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
                    cursor:${canSpin ? 'pointer' : 'not-allowed'};font-weight:900;
                    font-size:var(--text-base,0.875rem);font-family:var(--font-display,'Syne',sans-serif);
                    background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));
                    color:white;letter-spacing:0.02em;opacity:${canSpin ? '1' : '0.5'};
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
                        ['🐱🐱🐱', 'Jackpot',    `${this.COST * this.PAYOUTS.jackpot} chips`, '#f59e0b'],
                        ['⭐⭐⭐', 'Três iguais', `${this.COST * this.PAYOUTS.three} chips`,   '#4ade80'],
                        ['🎵🎵💎', 'Par',         `${this.COST * this.PAYOUTS.two} chips (aposta devolvida)`, '#a855f7'],
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
                    onmouseover="this.style.color='${c.text}'"
                    onmouseout="this.style.color='${c.muted}'">
                    ← Voltar ao menu
                </button>
            </div>
        </div>`;
    },

    init() {
        this._spinning = false;
        this._result   = null;
        this._reels    = ['🐱', '🐱', '🐱'];
        // Dispara verificação de bônus diário ao abrir o jogo
        this.getChips();
    },
};

window.SlotMachine = SlotMachine;