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

    _spinning:   false,
    _result:     null,
    _reels:      ['🐱','🐱','🐱'],
    _lastWin:    0,
    _spinMode:   1,      // 1, 5 ou 10 giros
    _spinQueue:  0,      // giros restantes na fila
    _totalWin:   0,      // acumulado da sequência
    _totalCost:  0,      // custo total da sequência

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

    // Retorna o saldo atual de chips (sem efeitos colaterais)
    getChips() {
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
        if (this._spinning || this._spinQueue > 0) return;
        const total = this.COST * this._spinMode;
        if (this.getChips() < total) return;

        // Iniciar sequência
        this._spinQueue  = this._spinMode;
        this._totalWin   = 0;
        this._totalCost  = 0;
        // Desabilitar botão imediatamente para toda a sequência
        const btn = document.getElementById('slot-btn');
        if (btn) { btn.disabled = true; btn.style.opacity = '0.5'; btn.style.cursor = 'not-allowed'; }
        this._spinSequence();
    },

    setSpinMode(n) {
        if (this._spinQueue > 0 || this._spinning) return; // bloqueado durante sequência
        this._spinMode = n;
        // Atualizar visual dos botões
        [1, 5, 10].forEach(v => {
            const btn = document.getElementById(`spin-mode-${v}`);
            if (!btn) return;
            const active = v === n;
            btn.style.background = active ? 'var(--theme-primary,#a855f7)' : 'transparent';
            btn.style.color      = active ? 'white' : 'var(--theme-primary,#a855f7)';
        });
        // Atualizar custo no botão principal
        const mainBtn = document.getElementById('slot-btn');
        if (mainBtn) {
            const cost = this.COST * n;
            const canSpin = !this._spinning && this.getChips() >= cost;
            mainBtn.textContent = canSpin
                ? `🎰 ${n > 1 ? `${n}x ` : ''}Girar (${cost} chips)`
                : 'Chips insuficientes';
        }
    },

    _spinSequence() {
        if (this._spinQueue <= 0 || this.getChips() < this.COST) {
            // Sequência finalizada — mostrar resumo
            this._spinning = false;
            this._showSequenceResult();
            return;
        }

        const isTurbo = this._spinMode > 1;
        const animDuration = isTurbo ? (this._spinMode >= 10 ? 200 : 400) : 1800;

        this._spinning  = true;
        this._result    = null;
        this._lastWin   = 0;
        this._spinQueue--;
        this._debitSpin();
        this._totalCost += this.COST;

        const r0 = this.SYMBOLS[Math.floor(Math.random() * this.SYMBOLS.length)];
        const r1 = this.SYMBOLS[Math.floor(Math.random() * this.SYMBOLS.length)];
        const r2 = this.SYMBOLS[Math.floor(Math.random() * this.SYMBOLS.length)];
        const final = [r0, r1, r2];

        if (isTurbo) {
            // Turbo: animação rápida simultânea
            this._animateTurbo(final, animDuration, () => {
                this._reels = final;
                this._evalResultSilent(final);
                this._spinning = false;
                this._updateChipsOnly();
                // Pequena pausa entre giros no modo turbo
                setTimeout(() => this._spinSequence(), this._spinMode >= 10 ? 80 : 150);
            });
        } else {
            // Normal: animação completa
            this._animateReel(0, final[0], 800);
            this._animateReel(1, final[1], 1300);
            this._animateReel(2, final[2], animDuration, () => {
                this._reels = final;
                this._evalResult(final);
                this._spinning = false;
            });
            this._updateReelAnimation();
        }
    },

    _animateTurbo(final, duration, onDone) {
        // Todos os reels giram e param juntos
        [0, 1, 2].forEach(i => {
            const el = document.getElementById(`reel-${i}`);
            if (!el) return;
            const interval = setInterval(() => {
                el.textContent = this.SYMBOLS[Math.floor(Math.random() * this.SYMBOLS.length)];
            }, 40);
            setTimeout(() => {
                clearInterval(interval);
                el.textContent = final[i];
                if (i === 2 && onDone) onDone();
            }, duration);
        });
    },

    _evalResultSilent(reels) {
        // Versão silenciosa para uso em sequências turbo (sem _updateUI completo)
        const [a, b, c] = reels;
        if (a === '🐱' && b === '🐱' && c === '🐱') {
            this._lastWin = this.COST * this.PAYOUTS.jackpot;
            this._result  = 'jackpot';
            window.Economy?.grant?.('slot_jackpot');
            window.Missions?.track?.({ event: 'slot_jackpot' });
        } else if (a === b && b === c) {
            this._lastWin = this.COST * this.PAYOUTS.three;
            this._result  = 'three';
        } else if (a === b || b === c || a === c) {
            this._lastWin = this.COST * this.PAYOUTS.two;
            this._result  = 'two';
        } else {
            this._lastWin = 0;
            this._result  = 'nothing';
        }
        if (this._lastWin > 0) this._creditWin(this._lastWin);
        this._totalWin += this._lastWin;
        window.Missions?.track?.({ event: 'play_game', game: 'slot' });
    },

    _updateChipsOnly() {
        const el = document.getElementById('slot-chips');
        if (el) el.textContent = this.getChips().toLocaleString('pt-BR');
        // Mostrar progresso da sequência
        const resultEl = document.getElementById('slot-result');
        const remaining = this._spinQueue;
        if (resultEl && remaining > 0) {
            const c = this._colors();
            resultEl.innerHTML = `<div style="font-size:0.75rem;color:${c.muted};">
                Girando... ${this._spinMode - remaining}/${this._spinMode}
                ${this._totalWin > 0 ? ` · +${this._totalWin} ganhos` : ''}
            </div>`;
        }
    },

    _showSequenceResult() {
        if (this._spinMode === 1) return;

        const net   = this._totalWin - this._totalCost;
        const d     = document.body.classList.contains('dark-theme');
        const bgCol = d ? '#1e1e2e' : '#ffffff';
        const muteC = d ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';
        const xCol  = d ? 'rgba(255,255,255,0.3)'  : 'rgba(0,0,0,0.3)';

        let icon, title, subtitle, color;
        if (this._totalWin === 0) {
            icon     = '😿';
            title    = 'Sem sorte nos ' + this._spinMode + ' giros';
            subtitle = '-' + this._totalCost.toLocaleString('pt-BR') + ' chips gastos';
            color    = '#f87171';
        } else if (net > 0) {
            icon     = '🎉';
            title    = 'Lucro de +' + net.toLocaleString('pt-BR') + ' chips!';
            subtitle = 'Ganhou ' + this._totalWin.toLocaleString('pt-BR') + ' · Gastou ' + this._totalCost.toLocaleString('pt-BR');
            color    = '#4ade80';
        } else if (net === 0) {
            icon     = '😐';
            title    = 'Empatou — saldo igual';
            subtitle = 'Ganhou ' + this._totalWin.toLocaleString('pt-BR') + ' · Gastou ' + this._totalCost.toLocaleString('pt-BR');
            color    = '#fbbf24';
        } else {
            icon     = '💸';
            title    = 'Perdeu ' + Math.abs(net).toLocaleString('pt-BR') + ' chips líquido';
            subtitle = 'Ganhou ' + this._totalWin.toLocaleString('pt-BR') + ' · Gastou ' + this._totalCost.toLocaleString('pt-BR');
            color    = '#f87171';
        }

        document.getElementById('slot-summary-banner')?.remove();
        const banner = document.createElement('div');
        banner.id = 'slot-summary-banner';
        banner.style.cssText =
            'margin-top:0.75rem;border-radius:12px;' +
            'background:' + color + '18;' +
            'border:1px solid ' + color + '44;' +
            'padding:0.6rem 0.875rem;' +
            'display:flex;align-items:center;gap:0.625rem;' +
            "font-family:'DM Sans',sans-serif;width:100%;box-sizing:border-box;" +
            'opacity:0;transition:opacity 0.25s;';

        banner.innerHTML =
            '<div style="font-size:2rem;line-height:1;flex-shrink:0;">' + icon + '</div>' +
            '<div style="flex:1;">' +
                '<div style="font-size:0.95rem;font-weight:900;color:' + color + ';font-family:Syne,sans-serif;margin-bottom:0.15rem;">' + title + '</div>' +
                '<div style="font-size:0.72rem;color:' + muteC + ';">' + this._spinMode + '× giros · ' + subtitle + '</div>' +
            '</div>' +
            '<button onclick="document.getElementById(\'slot-summary-banner\').remove()"' +
                ' style="background:none;border:none;cursor:pointer;font-size:1rem;' +
                'color:' + xCol + ';padding:0;line-height:1;flex-shrink:0;">✕</button>';

        // Inserir abaixo do botão, dentro da página
        const slotBtn = document.getElementById('slot-btn');
        if (slotBtn && slotBtn.parentNode) {
            slotBtn.parentNode.insertBefore(banner, slotBtn.nextSibling);
        } else {
            document.body.appendChild(banner);
        }

        requestAnimationFrame(() => { banner.style.opacity = '1'; });

        setTimeout(() => {
            if (!banner.parentNode) return;
            banner.style.opacity = '0';
            setTimeout(() => banner.remove(), 250);
        }, 4000);

        this._updateUI();
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

        this._totalWin  = this._lastWin;
        this._totalCost = this.COST;
        // Slot não dá bônus play_game — tem sistema próprio de chips
        window.Missions?.track?.({ event: 'play_game', game: 'slot' });
        this._updateUI();
    },

    _refreshChipsDisplay() {
        const el = document.getElementById('slot-chips');
        if (el) el.textContent = this.getChips().toLocaleString('pt-BR');
        // Atualizar botão também
        const btn = document.getElementById('slot-btn');
        if (btn && !this._spinning && this._spinQueue <= 0) {
            const canSpin = this.getChips() >= this.COST;
            btn.disabled = !canSpin;
            btn.style.opacity = canSpin ? '1' : '0.5';
        }
    },

    _updateUI() {
        const c     = this._colors();
        const chips = this.getChips();

        const chipsEl = document.getElementById('slot-chips');
        if (chipsEl) chipsEl.textContent = chips.toLocaleString('pt-BR');

        // Re-atualizar em múltiplos momentos para capturar level up e bônus assíncronos
        clearTimeout(this._chipsRefreshTimer);
        clearTimeout(this._chipsRefreshTimer2);
        this._chipsRefreshTimer = setTimeout(() => {
            const el = document.getElementById('slot-chips');
            if (el) el.textContent = this.getChips().toLocaleString('pt-BR');
        }, 200);
        // Segunda atualização para garantir captura de level up (que pode vir com delay)
        this._chipsRefreshTimer2 = setTimeout(() => {
            const el = document.getElementById('slot-chips');
            if (el) el.textContent = this.getChips().toLocaleString('pt-BR');
        }, 600);

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
            const busy         = this._spinning || this._spinQueue > 0;
            const canSpin      = !busy && chips >= this.COST * this._spinMode;
            btn.disabled       = !canSpin;
            btn.style.opacity  = canSpin ? '1' : '0.5';
            btn.style.cursor   = canSpin ? 'pointer' : 'not-allowed';
            const cost         = this.COST * this._spinMode;
            const modeLabel    = this._spinMode > 1 ? this._spinMode + '\u00d7 ' : '';
            btn.textContent    = busy ? 'Girando...' : canSpin
                ? '\uD83C\uDFB0 ' + modeLabel + 'Girar (' + cost + ' chips)'
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

            <!-- Seletor de modo -->
            <div style="display:flex;gap:0.5rem;margin-bottom:0.625rem;">
                ${[1,5,10].map(n => {
                    const cost = this.COST * n;
                    const active = this._spinMode === n;
                    const enough = chips >= cost;
                    const label = n === 1 ? '1× Normal' : n === 5 ? '5× Turbo' : '10× Ultra';
                    const desc  = n === 1 ? '' : n === 5 ? '⚡' : '⚡⚡';
                    return `<button id="spin-mode-${n}" onclick="SlotMachine.setSpinMode(${n})"
                        style="flex:1;padding:0.5rem 0.25rem;border-radius:10px;border:1.5px solid var(--theme-primary,#a855f7);
                            cursor:pointer;font-size:0.7rem;font-weight:800;
                            font-family:var(--font-display,'Syne',sans-serif);transition:all 0.15s;
                            background:${active ? 'var(--theme-primary,#a855f7)' : 'transparent'};
                            color:${active ? 'white' : 'var(--theme-primary,#a855f7)'};
                            opacity:${enough ? '1' : '0.4'};">
                        ${desc} ${label}<br>
                        <span style="font-size:0.62rem;font-weight:600;opacity:0.8;">${cost} chips</span>
                    </button>`;
                }).join('')}
            </div>

            <!-- Botão principal -->
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
                🎰 ${this._spinMode > 1 ? `${this._spinMode}× ` : ''}Girar (${this.COST * this._spinMode} chips)
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
        // Bônus diário — verificar uma vez ao iniciar
        const bonusGranted = this._checkDailyBonus();
        if (bonusGranted) {
            setTimeout(() => {
                Utils.showNotification?.(
                    `🎰 Bônus diário: +${this._DAILY_BONUS} chips! にゃん~`,
                    'success'
                );
                this._refreshChipsDisplay();
            }, 500);
        }

        // Listener para atualizar display quando chips mudam externamente (level up, etc.)
        window._slotChipsListener && window.removeEventListener('nyan:chips-changed', window._slotChipsListener);
        window._slotChipsListener = () => this._refreshChipsDisplay();
        window.addEventListener('nyan:chips-changed', window._slotChipsListener);

        this._spinning = false;
        this._result   = null;
        this._reels    = ['🐱', '🐱', '🐱'];
        // Dispara verificação de bônus diário ao abrir o jogo
        this.getChips();
    },
};

window.SlotMachine = SlotMachine;