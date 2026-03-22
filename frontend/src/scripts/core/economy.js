/* ══════════════════════════════════════════════════
   ECONOMY.JS v1.1.0 — NyanTools にゃん~
   Sistema econômico central — XP, Nível, Chips
   v3.8.0 "Nyan Economy"
   [v1.1] checkRecord(), streak bônus automático
 ═══════════════════════════════════════════════════*/

const Economy = {

    KEY: 'nyan_economy',

    // ── CONFIGURAÇÕES ─────────────────────────────

    // XP necessário para o nível N (começa em 1)
    // Fórmula: Math.round(100 * Math.pow(1.4, level - 1))
    XP_BASE: 100,
    XP_MULTIPLIER: 1.4,

    // Marcos de nível com recompensas
    MILESTONES: {
        10: { title: 'Veterano にゃん~',   reward: 'border_paw'    },
        25: { title: 'Mestre にゃん~',     reward: 'border_crown'  },
        50: { title: 'Lendário にゃん~',   reward: 'border_star'   },
    },

    // Tabela de XP e chips por ação
    REWARDS: {
        play_game:        { xp: 10,  chips: 5   },
        beat_record:      { xp: 40,  chips: 20  },
        mission_easy:     { xp: 25,  chips: 15  },
        mission_medium:   { xp: 50,  chips: 30  },
        mission_hard:     { xp: 80,  chips: 60  },
        quiz_perfect:     { xp: 60,  chips: 35  },
        slot_jackpot:     { xp: 30,  chips: 0   },
        weekly_challenge: { xp: 200, chips: 100 },
    },

    // ── ESTADO PADRÃO ─────────────────────────────

    _defaults() {
        return {
            chips:     0,
            xp:        0,
            level:     1,
            xpToNext:  this.XP_BASE,
            totalXP:   0,
        };
    },

    // ── LOAD / SAVE ───────────────────────────────

    load() {
        try {
            const raw = localStorage.getItem(this.KEY);
            if (!raw) return { ...this._defaults() };
            const data = JSON.parse(raw);
            // Garantir que todos os campos existem (migração de versões antigas)
            return { ...this._defaults(), ...data };
        } catch (e) {
            console.error('[Economy] Erro ao carregar:', e);
            return { ...this._defaults() };
        }
    },

    save(state) {
        try {
            localStorage.setItem(this.KEY, JSON.stringify(state));
        } catch (e) {
            console.error('[Economy] Erro ao salvar:', e);
        }
    },

    // ── MIGRAÇÃO ──────────────────────────────────

    _migrate() {
        // Migrar slot_chips → nyan_economy.chips
        const slotChips = localStorage.getItem('slot_chips');
        if (slotChips !== null) {
            const amount = parseInt(slotChips, 10) || 0;
            if (amount > 0) {
                const state = this.load();
                state.chips += amount;
                this.save(state);
                console.log(`[Economy] Migrados ${amount} chips do Caça-Níquel`);
            }
            localStorage.removeItem('slot_chips');
        }

        // Migrar slot_balance (nome alternativo usado em algumas versões)
        const slotBalance = localStorage.getItem('slot_balance');
        if (slotBalance !== null) {
            const amount = parseInt(slotBalance, 10) || 0;
            if (amount > 0) {
                const state = this.load();
                state.chips += amount;
                this.save(state);
                console.log(`[Economy] Migrados ${amount} chips (slot_balance)`);
            }
            localStorage.removeItem('slot_balance');
        }
    },

    // ── CÁLCULO DE NÍVEL ──────────────────────────

    // XP necessário para passar DO nível N para o N+1
    xpForLevel(level) {
        return Math.round(this.XP_BASE * Math.pow(this.XP_MULTIPLIER, level - 1));
    },

    // Dado um XP total, retorna { level, xp (XP dentro do nível), xpToNext }
    calcLevel(totalXP) {
        let level = 1;
        let remaining = totalXP;

        while (true) {
            const needed = this.xpForLevel(level);
            if (remaining < needed) break;
            remaining -= needed;
            level++;
        }

        return {
            level,
            xp:      remaining,
            xpToNext: this.xpForLevel(level),
        };
    },

    // ── CONCEDER XP ───────────────────────────────

    /**
     * Concede XP e chips por uma ação.
     * @param {string} action  - chave da tabela REWARDS
     * @param {number} multiplier - multiplicador (ex: 1.5 para streak bônus)
     * @returns {{ leveledUp: boolean, newLevel: number, milestonesReached: string[] }}
     */
    grant(action, multiplier = 1) {
        const reward = this.REWARDS[action];
        if (!reward) {
            console.warn('[Economy] Ação desconhecida:', action);
            return { leveledUp: false, newLevel: 1, milestonesReached: [] };
        }

        const state   = this.load();
        const oldLevel = state.level;

        const xpGained    = Math.round(reward.xp    * multiplier);
        const chipsGained = Math.round(reward.chips * multiplier);

        state.totalXP = (state.totalXP || 0) + xpGained;
        state.chips  += chipsGained;

        const { level, xp, xpToNext } = this.calcLevel(state.totalXP);
        state.level   = level;
        state.xp      = xp;
        state.xpToNext = xpToNext;

        this.save(state);

        // Verificar marcos atingidos
        const milestonesReached = [];
        for (let lvl = oldLevel + 1; lvl <= level; lvl++) {
            if (this.MILESTONES[lvl]) {
                milestonesReached.push(lvl);
                this._onMilestone(lvl, this.MILESTONES[lvl]);
            }
        }

        const leveledUp = level > oldLevel;
        if (leveledUp) {
            this._onLevelUp(level, xpGained, chipsGained);
        } else if (xpGained > 0 || chipsGained > 0) {
            this._onGrant(xpGained, chipsGained, action);
        }

        // Atualizar UI se estiver visível
        this._refreshUI();

        return { leveledUp, newLevel: level, milestonesReached };
    },

    // Conceder chips diretamente (sem XP) — usado pela loja ao vender
    grantChips(amount, reason = '') {
        const state = this.load();
        state.chips += amount;
        this.save(state);
        if (reason) console.log(`[Economy] +${amount} chips — ${reason}`);
        this._refreshUI();
    },

    // Gastar chips — retorna false se saldo insuficiente
    spendChips(amount) {
        const state = this.load();
        if (state.chips < amount) return false;
        state.chips -= amount;
        this.save(state);
        this._refreshUI();
        return true;
    },

    // ── STREAK BÔNUS ──────────────────────────────
    // A cada 3 dias consecutivos de uso, o multiplicador
    // de recompensas sobe para 1.5×. Usa o streak do Dashboard.
    getStreakMultiplier() {
        const streak = Utils.loadData('dashboard_stats')?.dailyStreak || 0;
        if (streak > 0 && streak % 3 === 0) return 1.5;
        return 1;
    },

    // ── CHECK RECORD ──────────────────────────────
    /**
     * Verifica se um novo score bate o recorde salvo.
     * Se sim, concede beat_record com streak bônus automático.
     *
     * @param {string} storageKey  - chave do localStorage onde o recorde fica
     * @param {number} newScore    - pontuação recém obtida
     * @param {boolean} higherIsBetter - false para jogos onde menor é melhor (ex: Termo)
     * @returns {boolean} true se bateu o recorde
     *
     * Uso em qualquer jogo, uma linha:
     *   Economy.checkRecord('typeracer_highscore', wpm);
     *   Economy.checkRecord('termo_best', attempts, false);
     */
    checkRecord(storageKey, newScore, higherIsBetter = true) {
        if (!newScore || newScore <= 0) return false;

        const current = Utils.loadData(storageKey);
        const isRecord = current === null
            ? true
            : higherIsBetter
                ? newScore > current
                : newScore < current;

        if (isRecord) {
            const mult = this.getStreakMultiplier();
            this.grant('beat_record', mult);
            // Notificar o sistema de missões
            window.Missions?.track?.({ event: 'beat_record', storageKey, newScore });
            console.log(`[Economy] Recorde em "${storageKey}": ${current} → ${newScore}${mult > 1 ? ` (×${mult} streak)` : ''}`);
        }

        return isRecord;
    },

    // ── GETTERS ───────────────────────────────────

    getState() {
        return this.load();
    },

    getLevel() {
        return this.load().level;
    },

    getChips() {
        return this.load().chips;
    },

    getXP() {
        const s = this.load();
        return { xp: s.xp, xpToNext: s.xpToNext, totalXP: s.totalXP || 0 };
    },

    // Percentual de progresso para o próximo nível (0–100)
    getLevelProgress() {
        const s = this.load();
        if (!s.xpToNext) return 0;
        return Math.min(Math.round((s.xp / s.xpToNext) * 100), 100);
    },

    // ── CALLBACKS INTERNOS ────────────────────────

    _onGrant(xp, chips, action) {
        // Notificação discreta apenas para ações que o usuário iniciou conscientemente
        const SILENT = ['play_game'];
        if (SILENT.includes(action)) return;

        const parts = [];
        if (xp > 0)    parts.push(`+${xp} XP`);
        if (chips > 0) parts.push(`+${chips} chips`);
        if (parts.length && window.Utils?.showNotification) {
            Utils.showNotification(`⚡ ${parts.join(' · ')}`, 'info');
        }
    },

    _onLevelUp(level, xp, chips) {
        console.log(`[Economy] Level up! → ${level}`);
        if (window.Utils?.showNotification) {
            Utils.showNotification(
                `🎉 Nível ${level} atingido! +${xp} XP · +${chips} chips`,
                'success'
            );
        }
        // Atualizar badge na sidebar
        this._updateSidebarBadge(level);
    },

    _onMilestone(level, milestone) {
        console.log(`[Economy] Marco! Nível ${level} — "${milestone.title}"`);
        if (window.Utils?.showNotification) {
            Utils.showNotification(
                `🏆 Título desbloqueado: "${milestone.title}"`,
                'success'
            );
        }
        // Adicionar item ao inventário automaticamente
        if (window.Inventory?.unlockItem) {
            Inventory.unlockItem(milestone.reward);
        }
    },

    // ── ATUALIZAÇÃO DA UI ─────────────────────────

    _updateSidebarBadge(level) {
        let badge = document.getElementById('economy-level-badge');
        const userInfo = document.querySelector('.sidebar-user');
        if (!userInfo) return;

        if (!badge) {
            badge = document.createElement('div');
            badge.id = 'economy-level-badge';
            badge.style.cssText = `
                display: inline-flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-width: 34px;
                height: 34px;
                padding: 0 6px;
                border-radius: 10px;
                font-family: 'Syne', sans-serif;
                background: rgba(0,0,0,0.25);
                border: 1px solid rgba(255,255,255,0.2);
                color: white;
                margin-left: auto;
                flex-shrink: 0;
                gap: 0;
                line-height: 1;
            `;
            // Inserir antes do chevron
            const chevron = userInfo.querySelector('.sidebar-user-chevron');
            if (chevron) {
                userInfo.insertBefore(badge, chevron);
            } else {
                userInfo.appendChild(badge);
            }
        }

        badge.innerHTML = `
            <span style="font-size:0.52rem;font-weight:700;letter-spacing:0.06em;opacity:0.7;text-transform:uppercase;line-height:1;">NV</span>
            <span style="font-size:0.85rem;font-weight:900;line-height:1.1;">${level}</span>
        `;
    },

    _updateXPBar() {
        const bar = document.getElementById('economy-xp-bar');
        if (!bar) return;
        bar.style.width = this.getLevelProgress() + '%';
    },

    _refreshUI() {
        const s = this.load();
        this._updateSidebarBadge(s.level);
        this._updateXPBar();

        // Atualizar chips no perfil se aberto
        const chipsEl = document.getElementById('economy-chips-display');
        if (chipsEl) chipsEl.textContent = s.chips.toLocaleString('pt-BR');

        // Atualizar XP no perfil se aberto
        const xpEl = document.getElementById('economy-xp-display');
        if (xpEl) xpEl.textContent = `${s.xp} / ${s.xpToNext} XP`;
    },

    // ── RENDER — bloco para o perfil ──────────────

    renderProfileBlock() {
        const s    = this.load();
        const pct  = this.getLevelProgress();
        const next = this.xpForLevel(s.level);
        const milestone = Object.entries(this.MILESTONES)
            .filter(([lvl]) => parseInt(lvl) > s.level)
            .sort((a, b) => a[0] - b[0])[0];

        const milestoneHint = milestone
            ? `Próximo marco: nível ${milestone[0]} — "${milestone[1].title}"`
            : 'Todos os marcos atingidos! にゃん~';

        return `
        <div class="profile-card" id="economy-profile-block">
            <div class="profile-card-title">⚡ Progresso</div>

            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.75rem;margin-bottom:1.25rem;">
                <!-- Nível -->
                <div style="background:var(--p-accent-soft);border:1px solid var(--p-accent-border);border-radius:12px;padding:1rem;text-align:center;">
                    <div style="font-size:0.6rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:var(--p-text-muted);margin-bottom:0.4rem;">Nível</div>
                    <div id="economy-level-display" style="font-size:2rem;font-weight:900;font-family:'Syne',sans-serif;color:var(--p-accent);line-height:1;">${s.level}</div>
                </div>

                <!-- Chips -->
                <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:12px;padding:1rem;text-align:center;">
                    <div style="font-size:0.6rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:var(--p-text-muted);margin-bottom:0.4rem;">Chips</div>
                    <div id="economy-chips-display" style="font-size:1.5rem;font-weight:900;font-family:'Syne',sans-serif;color:#b45309;line-height:1;">${s.chips.toLocaleString('pt-BR')}</div>
                </div>

                <!-- XP total -->
                <div style="background:var(--p-bg-subtle);border:1px solid var(--p-border);border-radius:12px;padding:1rem;text-align:center;">
                    <div style="font-size:0.6rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:var(--p-text-muted);margin-bottom:0.4rem;">XP total</div>
                    <div style="font-size:1.2rem;font-weight:900;font-family:'Syne',sans-serif;color:var(--p-text);line-height:1;">${(s.totalXP || 0).toLocaleString('pt-BR')}</div>
                </div>
            </div>

            <!-- Barra de XP -->
            <div style="margin-bottom:0.5rem;">
                <div style="display:flex;justify-content:space-between;margin-bottom:0.4rem;">
                    <span style="font-size:0.72rem;font-weight:600;color:var(--p-text-sub);">XP para nível ${s.level + 1}</span>
                    <span id="economy-xp-display" style="font-size:0.72rem;font-weight:700;color:var(--p-accent);">${s.xp} / ${s.xpToNext} XP</span>
                </div>
                <div style="height:6px;background:var(--p-sep);border-radius:99px;overflow:hidden;">
                    <div id="economy-xp-bar"
                         style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--p-accent),var(--p-pink));border-radius:99px;transition:width 0.5s cubic-bezier(0.34,1.2,0.64,1);">
                    </div>
                </div>
            </div>

            <!-- Hint de próximo marco -->
            <p style="font-size:0.7rem;color:var(--p-text-muted);margin-top:0.625rem;">${milestoneHint}</p>
        </div>`;
    },

    // ── INIT ──────────────────────────────────────

    init() {
        this._migrate();

        const s = this.load();

        // Garantir que o totalXP está em sincronia (fix para saves antigos)
        if (!s.totalXP) {
            const recalc = this.calcLevel(0);
            // totalXP não existe → deixar zerado, sem sobrescrever chips/nível
        }

        this._updateSidebarBadge(s.level);

        console.log(
            `[Economy v1.0.0] Nível ${s.level} · ${s.xp}/${s.xpToNext} XP · ${s.chips} chips`
        );
    },

    // ── DEBUG (só em dev) ─────────────────────────

    debug: {
        addXP(amount) {
            const state = Economy.load();
            state.totalXP = (state.totalXP || 0) + amount;
            const { level, xp, xpToNext } = Economy.calcLevel(state.totalXP);
            state.level   = level;
            state.xp      = xp;
            state.xpToNext = xpToNext;
            Economy.save(state);
            Economy._refreshUI();
            console.log(`[Economy.debug] +${amount} XP → nível ${level}`);
        },
        addChips(amount) {
            Economy.grantChips(amount, 'debug');
            console.log(`[Economy.debug] +${amount} chips`);
        },
        reset() {
            localStorage.removeItem(Economy.KEY);
            console.log('[Economy.debug] Estado resetado');
        },
        state() {
            console.table(Economy.load());
        },
    },
};

window.Economy = Economy;