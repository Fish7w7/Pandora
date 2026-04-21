const Economy = {
    KEY: 'nyan_economy',

    XP_BASE: 120,
    XP_LINEAR: 40,
    XP_QUADRATIC: 2,
    MAX_TOTAL_XP: 2147483647,
    MAX_LEVEL_SOFT_CAP: 5000,
    REMOTE_SYNC_DEBOUNCE: 1400,
    _remoteSyncTimer: null,

    MILESTONES: {
        10: { title: 'Veterano にゃん~',  reward: 'particle_veteran_spark' },
        25: { title: 'Mestre にゃん~',    reward: 'title_master_nyan'      },
        50: { title: 'Lendário にゃん~',  reward: 'border_star'            },
    },

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

    _defaults() {
        return { chips: 0, xp: 0, level: 1, xpToNext: this.xpForLevel(1), totalXP: 0 };
    },

    _sanitizeInt(value, fallback = 0, min = 0, max = this.MAX_TOTAL_XP) {
        const n = Number(value);
        if (!Number.isFinite(n)) return fallback;
        const parsed = Math.round(n);
        return Math.max(min, Math.min(max, parsed));
    },

    _totalXPFromLegacyLevel(level = 1, xp = 0) {
        const safeLevel = this._sanitizeInt(level, 1, 1, this.MAX_LEVEL_SOFT_CAP);
        let total = this._sanitizeInt(xp, 0, 0, this.MAX_TOTAL_XP);
        for (let lvl = 1; lvl < safeLevel; lvl++) {
            total += this.xpForLevel(lvl);
            if (total >= this.MAX_TOTAL_XP) return this.MAX_TOTAL_XP;
        }
        return this._sanitizeInt(total, 0, 0, this.MAX_TOTAL_XP);
    },

    _normalizeState(state = {}) {
        const normalized = { ...this._defaults() };
        normalized.chips = this._sanitizeInt(state.chips, 0, 0, this.MAX_TOTAL_XP);

        let totalXP = Number(state.totalXP);
        const hasLegacyLevelData = Number(state.level) > 1 || Number(state.xp) > 0;
        if (!Number.isFinite(totalXP) || (totalXP <= 0 && hasLegacyLevelData)) {
            totalXP = this._totalXPFromLegacyLevel(state.level, state.xp);
        }
        normalized.totalXP = this._sanitizeInt(totalXP, 0, 0, this.MAX_TOTAL_XP);

        const levelData = this.calcLevel(normalized.totalXP);
        normalized.level = levelData.level;
        normalized.xp = levelData.xp;
        normalized.xpToNext = levelData.xpToNext;
        return normalized;
    },

    ensureLevelRewards(level = null, options = {}) {
        const safeLevel = this._sanitizeInt(level ?? this.getLevel(), 1, 1, this.MAX_LEVEL_SOFT_CAP);
        const granted = [];

        Object.entries(this.MILESTONES).forEach(([lvl, milestone]) => {
            const milestoneLevel = Number(lvl);
            if (milestoneLevel > safeLevel) return;

            const rewardId = String(milestone?.reward || '').trim();
            if (!rewardId || !window.Inventory?.unlockItem || window.Inventory.owns?.(rewardId)) return;

            const unlocked = window.Inventory.unlockItem(rewardId, { skipSync: options.skipSync === true });
            if (unlocked) {
                granted.push({ level: milestoneLevel, rewardId, milestone });
            }
        });

        if (granted.length > 0) {
            window.Inventory?.applyAll?.();
        }

        return granted;
    },

    load() {
        try {
            const raw = localStorage.getItem(this.KEY);
            if (!raw) return { ...this._defaults() };

            const parsed = JSON.parse(raw) || {};
            const source = { ...this._defaults(), ...parsed };
            const normalized = this._normalizeState(source);

            const shouldSave =
                source.chips !== normalized.chips ||
                source.totalXP !== normalized.totalXP ||
                source.level !== normalized.level ||
                source.xp !== normalized.xp ||
                source.xpToNext !== normalized.xpToNext;

            if (shouldSave) this.save(normalized, { skipSync: true });
            return normalized;
        } catch (e) {
            return { ...this._defaults() };
        }
    },

    save(state, options = {}) {
        try { localStorage.setItem(this.KEY, JSON.stringify(state)); }
        catch (e) { console.error('[Economy] Erro ao salvar:', e); }
        if (!options.skipSync) this._scheduleRemoteSync();
    },

    _scheduleRemoteSync() {
        if (!window.NyanAuth?._syncLocalProfile || !window.NyanAuth?.isOnline?.() || !window.NyanFirebase?.isReady?.()) {
            return;
        }
        if (this._remoteSyncTimer) {
            clearTimeout(this._remoteSyncTimer);
        }
        this._remoteSyncTimer = setTimeout(() => {
            this._remoteSyncTimer = null;
            window.NyanAuth._syncLocalProfile({ includeEconomy: true }).catch(() => {});
        }, this.REMOTE_SYNC_DEBOUNCE);
    },

    _migrate() {
        ['slot_chips', 'slot_balance'].forEach(key => {
            const val = localStorage.getItem(key);
            if (val !== null) {
                const amount = parseInt(val, 10) || 0;
                if (amount > 0) {
                    const state = this.load();
                    state.chips += amount;
                    this.save(state);
                }
                localStorage.removeItem(key);
            }
        });
    },

    xpForLevel(level) {
        const lvl = Math.max(1, this._sanitizeInt(level, 1, 1, this.MAX_LEVEL_SOFT_CAP));
        const step = lvl - 1;
        return this.XP_BASE + (step * this.XP_LINEAR) + Math.floor((step * step) * this.XP_QUADRATIC);
    },

    calcLevel(totalXP) {
        const safeXP = this._sanitizeInt(totalXP, 0, 0, this.MAX_TOTAL_XP);
        let level = 1;
        let remaining = safeXP;
        while (level < this.MAX_LEVEL_SOFT_CAP) {
            const needed = this.xpForLevel(level);
            if (remaining < needed) break;
            remaining -= needed;
            level++;
        }
        return { level, xp: remaining, xpToNext: this.xpForLevel(level) };
    },

    grant(action, multiplier = 1, meta = {}) {
        const reward = this.REWARDS[action];
        if (!reward) return { leveledUp: false, newLevel: 1, milestonesReached: [] };

        const state = this.load();
        const oldLevel = state.level;

        const seasonMods = window.Seasons?.getGrantModifiers?.(action, meta) || {
            xpMultiplier: 1,
            chipsMultiplier: 1,
            event: null,
        };

        const xpAward = Math.round((reward.xp || 0) * multiplier * (seasonMods.xpMultiplier || 1));
        const chipsAward = Math.round((reward.chips || 0) * multiplier * (seasonMods.chipsMultiplier || 1));

        state.totalXP = (state.totalXP || 0) + xpAward;
        state.chips += chipsAward;

        const { level, xp, xpToNext } = this.calcLevel(state.totalXP);
        state.level = level;
        state.xp = xp;
        state.xpToNext = xpToNext;
        this.save(state);

        const milestonesReached = [];
        for (let lvl = oldLevel + 1; lvl <= level; lvl++) {
            if (this.MILESTONES[lvl]) {
                milestonesReached.push(lvl);
                this._onMilestone(lvl, this.MILESTONES[lvl]);
            }
        }

        const leveledUp = level > oldLevel;
        if (leveledUp) this._onLevelUp(level, xpAward, chipsAward);
        else if (xpAward > 0 || chipsAward > 0) this._onGrant(xpAward, chipsAward, action);

        if (xpAward > 0 && window.Seasons?.addXP) {
            window.Seasons.addXP(xpAward, {
                fromGrant: true,
                action,
                event: seasonMods.event?.id || null,
            });
        }

        this._refreshUI();
        return { leveledUp, newLevel: level, milestonesReached, xpAward, chipsAward, weekendEvent: seasonMods.event || null };
    },

    grantChips(amount) {
        const state = this.load();
        state.chips += amount;
        this.save(state);
        this._refreshUI();
    },

    spendChips(amount) {
        const state = this.load();
        if (state.chips < amount) return false;
        state.chips -= amount;
        this.save(state);
        this._refreshUI();
        return true;
    },

    getStreakMultiplier() {
        const streak = Utils.loadData('dashboard_stats')?.dailyStreak || 0;
        return (streak > 0 && streak % 3 === 0) ? 1.5 : 1;
    },

    checkRecord(storageKey, newScore, higherIsBetter = true) {
        if (!newScore || newScore <= 0) return false;
        const current = Utils.loadData(storageKey);
        const isRecord = current === null
            ? true
            : higherIsBetter ? newScore > current : newScore < current;

        if (isRecord) {
            const mult = this.getStreakMultiplier();
            this.grant('beat_record', mult, { storageKey, newScore });
            window.Missions?.track?.({ event: 'beat_record', storageKey, newScore });
        }
        return isRecord;
    },

    getState()        { return this.load(); },
    getLevel()        { return this.load().level; },
    getChips()        { return this.load().chips; },
    getXP()           { const s = this.load(); return { xp: s.xp, xpToNext: s.xpToNext, totalXP: s.totalXP || 0 }; },
    getLevelProgress() {
        const s = this.load();
        return s.xpToNext ? Math.min(Math.round((s.xp / s.xpToNext) * 100), 100) : 0;
    },

    _onGrant(xp, chips, action) {
        if (['play_game'].includes(action)) return;
        const parts = [];
        if (xp > 0)    parts.push(`+${xp} XP`);
        if (chips > 0) parts.push(`+${chips} chips`);
        if (parts.length && window.Utils?.showNotification) Utils.showNotification(`⚡ ${parts.join(' · ')}`, 'info');
    },

    _onLevelUp(level, xp, chips) {
        if (window.Utils?.showNotification) {
            Utils.showNotification(`🎉 Nível ${level} atingido! +${xp} XP · +${chips} chips`, 'success');
        }
        this._updateSidebarBadge(level);
    },

    _onMilestone(level, milestone) {
        const rewardId = String(milestone?.reward || '').trim();
        const rewardItem = rewardId ? window.Inventory?.getItem?.(rewardId) : null;
        const unlocked = rewardId && window.Inventory?.unlockItem
            ? window.Inventory.unlockItem(rewardId)
            : false;

        if (unlocked && window.Utils?.showNotification) {
            const rewardLabel = rewardItem?.name || milestone?.title || 'Recompensa de nivel';
            Utils.showNotification(`🏆 Recompensa de nivel recebida: "${rewardLabel}"`, 'success');
        }
    },

    _updateSidebarBadge(level) {
        let badge = document.getElementById('economy-level-badge');
        const userInfo = document.querySelector('.sidebar-user');
        if (!userInfo) return;
        if (!badge) {
            badge = document.createElement('div');
            badge.id = 'economy-level-badge';
            badge.style.cssText = `
                display:inline-flex;flex-direction:column;align-items:center;justify-content:center;
                min-width:34px;height:34px;padding:0 6px;border-radius:10px;
                font-family:'Syne',sans-serif;background:rgba(0,0,0,0.25);
                border:1px solid rgba(255,255,255,0.2);color:white;
                margin-left:auto;flex-shrink:0;gap:0;line-height:1;
            `;
            const chevron = userInfo.querySelector('.sidebar-user-chevron');
            if (chevron) userInfo.insertBefore(badge, chevron);
            else userInfo.appendChild(badge);
        }
        badge.innerHTML = `
            <span style="font-size:0.52rem;font-weight:700;letter-spacing:0.06em;opacity:0.7;text-transform:uppercase;line-height:1;">NV</span>
            <span style="font-size:0.85rem;font-weight:900;line-height:1.1;">${level}</span>
        `;
    },

    _updateXPBar() {
        const bar = document.getElementById('economy-xp-bar');
        if (bar) bar.style.width = this.getLevelProgress() + '%';
    },

    _refreshUI() {
        const s = this.load();
        this._updateSidebarBadge(s.level);
        this._updateXPBar();
        const chipsEl = document.getElementById('economy-chips-display');
        if (chipsEl) chipsEl.textContent = s.chips.toLocaleString('pt-BR');
        const xpEl = document.getElementById('economy-xp-display');
        if (xpEl) xpEl.textContent = `${s.xp} / ${s.xpToNext} XP`;
    },

    renderProfileBlock() {
        const s   = this.load();
        const pct = this.getLevelProgress();
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
                <div style="background:var(--p-accent-soft);border:1px solid var(--p-accent-border);border-radius:12px;padding:1rem;text-align:center;">
                    <div style="font-size:0.6rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:var(--p-text-muted);margin-bottom:0.4rem;">Nível</div>
                    <div id="economy-level-display" style="font-size:2rem;font-weight:900;font-family:'Syne',sans-serif;color:var(--p-accent);line-height:1;">${s.level}</div>
                </div>
                <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:12px;padding:1rem;text-align:center;">
                    <div style="font-size:0.6rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:var(--p-text-muted);margin-bottom:0.4rem;">Chips</div>
                    <div id="economy-chips-display" style="font-size:1.5rem;font-weight:900;font-family:'Syne',sans-serif;color:#b45309;line-height:1;">${s.chips.toLocaleString('pt-BR')}</div>
                </div>
                <div style="background:var(--p-bg-subtle);border:1px solid var(--p-border);border-radius:12px;padding:1rem;text-align:center;">
                    <div style="font-size:0.6rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:var(--p-text-muted);margin-bottom:0.4rem;">XP total</div>
                    <div style="font-size:1.2rem;font-weight:900;font-family:'Syne',sans-serif;color:var(--p-text);line-height:1;">${(s.totalXP || 0).toLocaleString('pt-BR')}</div>
                </div>
            </div>
            <div style="margin-bottom:0.5rem;">
                <div style="display:flex;justify-content:space-between;margin-bottom:0.4rem;">
                    <span style="font-size:0.72rem;font-weight:600;color:var(--p-text-sub);">XP para nível ${s.level + 1}</span>
                    <span id="economy-xp-display" style="font-size:0.72rem;font-weight:700;color:var(--p-accent);">${s.xp} / ${s.xpToNext} XP</span>
                </div>
                <div style="height:6px;background:var(--p-sep);border-radius:99px;overflow:hidden;">
                    <div id="economy-xp-bar" style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--p-accent),var(--p-pink));border-radius:99px;transition:width 0.5s cubic-bezier(0.34,1.2,0.64,1);"></div>
                </div>
            </div>
            <p style="font-size:0.7rem;color:var(--p-text-muted);margin-top:0.625rem;">${milestoneHint}</p>
        </div>`;
    },

    init() {
        this._migrate();
        const s = this.load();
        this.ensureLevelRewards(s.level, { skipSync: true });
        this._updateSidebarBadge(s.level);
    },

    debug: {
        addXP(amount) {
            const state = Economy.load();
            state.totalXP = (state.totalXP || 0) + amount;
            const { level, xp, xpToNext } = Economy.calcLevel(state.totalXP);
            Object.assign(state, { level, xp, xpToNext });
            Economy.save(state);
            Economy.ensureLevelRewards(level);
            Economy._refreshUI();
        },
        addChips(amount) { Economy.grantChips(amount); },
        reset() { localStorage.removeItem(Economy.KEY); },
        state() { console.table(Economy.load()); },
    },
};

window.Economy = Economy;
