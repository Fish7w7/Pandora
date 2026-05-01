const Events = {
    _tab: 'overview',
    _clockTimer: null,
    _clockInterval: 30 * 1000,

    TABS: [
        { id: 'overview',  label: 'Visao Geral' },
        { id: 'missions',  label: 'Missoes'     },
        { id: 'shop',      label: 'Loja'        },
        { id: 'history',   label: 'Historico'   },
    ],

    init() {
        window.NyanLiveOps?.init?.();
        this._onUpdate = this._onUpdate || (() => this.refresh());
        window.addEventListener('nyan:liveops-updated', this._onUpdate);
        this._startClock();
        return () => this.cleanup();
    },

    cleanup() {
        if (this._onUpdate) window.removeEventListener('nyan:liveops-updated', this._onUpdate);
        this._stopClock();
    },

    _startClock() {
        if (this._clockTimer) return;
        this._clockTimer = setInterval(() => this.refresh(), this._clockInterval);
    },

    _stopClock() {
        if (!this._clockTimer) return;
        clearInterval(this._clockTimer);
        this._clockTimer = null;
    },

    refresh() {
        if (window.Router?.currentRoute !== 'events') return;
        const container = document.getElementById('tool-container');
        if (container) container.innerHTML = this.render();
    },

    switchTab(tab) {
        if (this.TABS.some((t) => t.id === tab)) this._tab = tab;
        this.refresh();
    },

    claim(eventId, missionId) {
        const result = window.NyanLiveOps?.claimMissionReward?.(eventId, missionId) || { ok: false, reason: 'Live Ops indisponivel.' };
        if (!result.ok) window.Utils?.showNotification?.(result.reason || 'Nao foi possivel resgatar.', 'warning');
        this.refresh();
    },

    buy(eventId, itemId) {
        const result = window.NyanLiveOps?.purchaseShopItem?.(eventId, itemId) || { ok: false, reason: 'Live Ops indisponivel.' };
        if (!result.ok) window.Utils?.showNotification?.(result.reason || 'Nao foi possivel comprar.', 'warning');
        this.refresh();
    },

    render() {
        window.NyanLiveOps?.init?.();
        const active   = window.NyanLiveOps?.getCurrentEvent?.()   || null;
        const upcoming = window.NyanLiveOps?.getUpcomingEvents?.() || [];
        const ended    = window.NyanLiveOps?.getEndedEvents?.()    || [];
        const event    = active || upcoming[0] || ended[0] || null;

        return `
            <div class="ev-shell">
                ${this._renderStyle()}
                ${this._renderHero(active, upcoming)}
                ${!active ? this._renderEmptyState(upcoming, ended) : ''}
                ${event   ? this._renderTabs(event, active)         : ''}
            </div>
        `;
    },

    /* ─── Hero ─────────────────────────────────────────────────── */

    _renderHero(active, upcoming = []) {
        const event = active || upcoming[0] || null;

        if (!event) {
            return `
                <div class="nyan-card ev-hero ev-hero--empty">
                    <div class="ev-hero__body">
                        <span class="ev-kicker-pill ev-kicker-pill--idle">Sem evento ativo</span>
                        <h1 class="ev-hero__title">Eventos</h1>
                        <p class="ev-hero__desc">Missoes temporarias, loja de evento, recompensas sazonais e integracao com Clas.</p>
                    </div>
                </div>
            `;
        }

        const summary  = window.NyanLiveOps.getProgressSummary(event);
        const isActive = !!active;
        const timeLabel = isActive
            ? this._formatDuration(Math.max(0, event.endAt - Date.now()))
            : this._formatDate(event.startAt);
        const timeCaption = isActive ? 'Tempo restante' : 'Proximo evento';
        const bonus = isActive && event.clanBonusMultiplier > 1
            ? `<span class="ev-hero__bonus">+${Math.round((event.clanBonusMultiplier - 1) * 100)}% pontos de Cla</span>`
            : '';

        return `
            <div class="nyan-card ev-hero ${isActive ? 'ev-hero--active' : 'ev-hero--upcoming'}">
                <div class="ev-hero__body">
                    <div class="ev-hero__kicker">
                        <span class="ev-kicker-pill ${isActive ? 'ev-kicker-pill--active' : 'ev-kicker-pill--upcoming'}">
                            ${isActive ? '<span class="ev-pulse"></span> Ao vivo' : 'Em breve'}
                        </span>
                        <span class="ev-type-label">${this._escape(event.type)}</span>
                    </div>
                    <h1 class="ev-hero__title">${this._escape(event.name)}</h1>
                    <p class="ev-hero__desc">${this._escape(event.description || 'Missoes temporarias, loja de evento e recompensas sazonais.')}</p>
                    <div class="ev-hero__progress">
                        <div class="ev-progress-meta">
                            <span>Progresso geral</span>
                            <strong>${summary.progress}%</strong>
                        </div>
                        <div class="ev-track ev-track--hero"><div style="width:${summary.progress}%"></div></div>
                        <span class="ev-muted">${summary.completed} de ${summary.total} missoes concluidas</span>
                    </div>
                </div>
                <div class="ev-hero__aside">
                    <span class="ev-hero__aside-label">${timeCaption}</span>
                    <strong class="ev-hero__aside-value">${timeLabel}</strong>
                    ${bonus}
                </div>
            </div>
        `;
    },

    /* ─── Empty state ───────────────────────────────────────────── */

    _renderEmptyState(upcoming, ended) {
        return `
            <div class="nyan-card ev-empty">
                <div class="ev-empty__icon">📭</div>
                <h2>Nenhum evento ativo agora</h2>
                <p>Quando uma operacao comecar, as missoes, recompensas e loja temporaria aparecem aqui.</p>
                ${upcoming.length ? `
                    <div class="ev-list-compact">
                        ${upcoming.slice(0, 2).map((e) => this._renderCompactEvent(e, 'Proximo')).join('')}
                    </div>
                ` : ''}
                ${!upcoming.length && ended.length ? `
                    <button class="ev-btn ev-btn--ghost" onclick="Events.switchTab('history')">Ver historico</button>
                ` : ''}
            </div>
        `;
    },

    /* ─── Tabs shell ────────────────────────────────────────────── */

    _renderTabs(event, active) {
        const tab = this._tab;
        const body = tab === 'missions' ? this._renderMissions(event)
                   : tab === 'shop'     ? this._renderShop(event, active)
                   : tab === 'history'  ? this._renderHistory()
                   :                     this._renderOverview(event, active);

        return `
            <div class="ev-tabs-shell">
                <div class="ev-tabs" role="tablist">
                    ${this.TABS.map((t) => `
                        <button class="ev-tab ${tab === t.id ? 'ev-tab--active' : ''}"
                                role="tab"
                                aria-selected="${tab === t.id}"
                                onclick="Events.switchTab('${t.id}')">
                            ${t.label}
                        </button>
                    `).join('')}
                </div>
                <div class="ev-tab-body">
                    ${body}
                </div>
            </div>
        `;
    },

    /* ─── Overview ──────────────────────────────────────────────── */

    _renderOverview(event, active) {
        const upcoming = window.NyanLiveOps.getUpcomingEvents();
        const ended    = window.NyanLiveOps.getEndedEvents();
        const summary  = window.NyanLiveOps.getProgressSummary(event);
        const timeline = [...(active ? [active] : []), ...upcoming, ...ended].slice(0, 3);
        const missions = (event.missions || []).slice(0, 3);
        const shopItems = (event.eventShop || []).slice(0, 3);

        return `
            <div class="ev-overview-grid">
                <!-- left: missions feature -->
                <section class="nyan-card ev-panel">
                    <div class="ev-panel-head">
                        <div>
                            <h3 class="ev-panel-title">Missoes do evento</h3>
                            <span class="ev-panel-sub">${summary.completed} de ${summary.total} concluidas</span>
                        </div>
                        <button class="ev-btn ev-btn--ghost ev-btn--sm" onclick="Events.switchTab('missions')">Ver todas</button>
                    </div>
                    <div class="ev-stack">
                        ${missions.map((m) => this._renderMissionRow(event, m, false)).join('')
                          || this._renderSmallEmpty('Sem missoes cadastradas.')}
                    </div>
                </section>

                <!-- right column -->
                <div class="ev-side-col">
                    <!-- shop -->
                    <section class="nyan-card ev-panel ev-panel--compact">
                        <div class="ev-panel-head">
                            <div>
                                <h3 class="ev-panel-title">Loja</h3>
                                <span class="ev-panel-sub">${active ? 'Aberta agora' : 'Indisponivel'}</span>
                            </div>
                            <button class="ev-btn ev-btn--ghost ev-btn--sm" onclick="Events.switchTab('shop')">Ver loja</button>
                        </div>
                        <div class="ev-stack ev-stack--tight">
                            ${shopItems.map((item) => this._renderShopRow(event, item, active, true)).join('')
                              || this._renderSmallEmpty('Loja temporaria indisponivel.')}
                        </div>
                    </section>

                    <!-- timeline -->
                    <section class="nyan-card ev-panel ev-panel--compact ev-panel--muted">
                        <div class="ev-panel-head">
                            <h3 class="ev-panel-title">Linha do tempo</h3>
                        </div>
                        <div class="ev-list-compact">
                            ${timeline.map((item) => {
                                const lbl = item.active ? 'Ativo' : item.startAt > Date.now() ? 'Proximo' : 'Encerrado';
                                return this._renderCompactEvent(item, lbl);
                            }).join('') || this._renderSmallEmpty('Sem historico.')}
                        </div>
                    </section>
                </div>
            </div>
        `;
    },

    /* ─── Missions tab ──────────────────────────────────────────── */

    _renderMissions(event) {
        return `
            <section class="nyan-card ev-panel">
                <div class="ev-panel-head">
                    <h3 class="ev-panel-title">Missoes especiais</h3>
                    <span class="nyan-badge">${(event.missions || []).length} missoes</span>
                </div>
                <div class="ev-stack">
                    ${(event.missions || []).map((m) => this._renderMissionRow(event, m, true)).join('')
                      || this._renderSmallEmpty('Sem missoes neste evento.')}
                </div>
            </section>
        `;
    },

    _renderMissionRow(event, mission, expanded = false) {
        const pct      = Math.min(100, Math.round((Number(mission.progress || 0) / Math.max(1, Number(mission.target || 1))) * 100));
        const reward   = this._formatReward(mission.reward);
        const canClaim = mission.completed && !mission.claimed;

        const stateKey   = mission.claimed ? 'claimed' : canClaim ? 'claimable' : mission.completed ? 'complete' : 'progress';
        const stateLabel = mission.claimed ? '✓ Resgatada' : mission.completed ? '✓ Concluida' : 'Em progresso';

        const action = mission.claimed
            ? `<span class="ev-mission-done">✓ Resgatada</span>`
            : canClaim
                ? `<button class="ev-btn ev-btn--claim" onclick="Events.claim(${this._jsArg(event.id)},${this._jsArg(mission.id)})">Resgatar</button>`
                : `<span class="ev-mission-pct">${pct}%</span>`;

        return `
            <div class="ev-mission ev-mission--${stateKey}">
                <div class="ev-mission__main">
                    <div class="ev-mission__info">
                        <div class="ev-mission__title-row">
                            <span class="ev-mission__name">${this._escape(mission.title)}</span>
                            <span class="ev-status ev-status--${stateKey}">${stateLabel}</span>
                        </div>
                        ${expanded ? `<div class="ev-mission__desc">${this._escape(mission.description)}</div>` : ''}
                        <div class="ev-mission__reward">${reward}</div>
                    </div>
                    <div class="ev-mission__action">${action}</div>
                </div>
                <div class="ev-progress-row">
                    <div class="ev-track"><div style="width:${pct}%"></div></div>
                    <span class="ev-progress-nums">${mission.progress}/${mission.target}</span>
                </div>
            </div>
        `;
    },

    /* ─── Shop tab ──────────────────────────────────────────────── */

    _renderShop(event, active) {
        return `
            <section class="nyan-card ev-panel">
                <div class="ev-panel-head">
                    <h3 class="ev-panel-title">Loja temporaria</h3>
                    <span class="nyan-badge ${active ? 'ev-badge--open' : ''}">${active ? 'Aberta' : 'Encerrada'}</span>
                </div>
                <div class="ev-stack">
                    ${(event.eventShop || []).map((item) => this._renderShopRow(event, item, active)).join('')
                      || this._renderSmallEmpty('Nenhum item temporario nesta loja.')}
                </div>
            </section>
        `;
    },

    _renderShopRow(event, item, active, compact = false) {
        const owned    = !!(item.itemId && window.Inventory?.owns?.(item.itemId));
        const disabled = !active || item.purchased || owned;
        const label    = owned ? '✓ Obtido' : item.purchased ? '✓ Comprado' : active ? 'Comprar' : 'Encerrado';
        const stateKey = owned || item.purchased ? 'owned' : active ? 'buyable' : 'closed';

        const action = disabled
            ? `<span class="ev-shop-chip ev-shop-chip--${stateKey}">${label}</span>`
            : `<button class="ev-btn ev-btn--buy" onclick="Events.buy(${this._jsArg(event.id)},${this._jsArg(item.id)})">Comprar</button>`;

        return `
            <div class="ev-shop-row ev-shop-row--${stateKey} ${compact ? 'ev-shop-row--compact' : ''}">
                <div class="ev-shop-row__info">
                    <span class="ev-shop-row__name">${this._escape(item.name)}</span>
                    <span class="ev-shop-row__meta">${item.limited ? 'Limitado' : 'Recorrente'} · ${Number(item.price || 0).toLocaleString('pt-BR')} chips</span>
                </div>
                ${action}
            </div>
        `;
    },

    /* ─── History tab ───────────────────────────────────────────── */

    _renderHistory() {
        const ended   = window.NyanLiveOps.getEndedEvents();
        const rewards = window.NyanLiveOps.getRewardHistory();
        return `
            <div class="ev-history-grid">
                <section class="nyan-card ev-panel ev-panel--compact">
                    <div class="ev-panel-head">
                        <h3 class="ev-panel-title">Eventos encerrados</h3>
                        <span class="ev-count-chip">${ended.length}</span>
                    </div>
                    <div class="ev-list-compact">
                        ${ended.map((e) => this._renderCompactEvent(e, 'Encerrado')).join('')
                          || this._renderSmallEmpty('Nenhum evento encerrado ainda.')}
                    </div>
                </section>
                <section class="nyan-card ev-panel ev-panel--compact">
                    <div class="ev-panel-head">
                        <h3 class="ev-panel-title">Historico de recompensas</h3>
                        <span class="ev-count-chip">${Math.min(rewards.length, 12)}</span>
                    </div>
                    <div class="ev-list-compact">
                        ${rewards.slice(0, 12).map((item) => `
                            <div class="ev-compact-row">
                                <div>
                                    <strong class="ev-compact-row__name">${this._escape(item.label || item.id)}</strong>
                                    <span class="ev-compact-row__meta">${this._formatDate(item.at)}</span>
                                </div>
                                <span class="ev-source-chip">${this._escape(item.source || 'reward')}</span>
                            </div>
                        `).join('') || this._renderSmallEmpty('Nenhuma recompensa registrada.')}
                    </div>
                </section>
            </div>
        `;
    },

    /* ─── Compact event row ─────────────────────────────────────── */

    _renderCompactEvent(event, label) {
        const summary = window.NyanLiveOps.getProgressSummary(event);
        const isActive = label === 'Ativo';
        return `
            <div class="ev-compact-row">
                <div>
                    <strong class="ev-compact-row__name">${this._escape(event.name)}</strong>
                    <span class="ev-compact-row__meta">${this._formatDate(event.startAt)} – ${this._formatDate(event.endAt)}</span>
                </div>
                <span class="ev-source-chip ${isActive ? 'ev-source-chip--active' : ''}">
                    ${label}${summary.total ? ` · ${summary.completed}/${summary.total}` : ''}
                </span>
            </div>
        `;
    },

    /* ─── Utilities ─────────────────────────────────────────────── */

    _renderSmallEmpty(text) {
        return `<div class="ev-small-empty">${text}</div>`;
    },

    _formatReward(reward = {}) {
        const parts = [];
        if (reward.chips)                     parts.push(`+${Number(reward.chips).toLocaleString('pt-BR')} chips`);
        if (reward.xp)                        parts.push(`+${Number(reward.xp).toLocaleString('pt-BR')} XP`);
        if (reward.itemId || reward.titleId) {
            const item = window.Inventory?.getItem?.(reward.itemId || reward.titleId);
            parts.push(item?.name || 'Item');
        }
        if (reward.badgeId) {
            const badge = window.Badges?.getBadge?.(reward.badgeId);
            parts.push(badge?.name || 'Badge');
        }
        return parts.length ? parts.join(' · ') : 'Sem recompensa';
    },

    _formatDuration(ms) {
        const totalMinutes = Math.max(0, Math.floor(ms / 60000));
        const days  = Math.floor(totalMinutes / 1440);
        const hours = Math.floor((totalMinutes % 1440) / 60);
        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h ${totalMinutes % 60}min`;
    },

    _formatDate(ts) {
        if (!ts) return '-';
        return new Date(Number(ts)).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    },

    _escape(value = '') {
        return window.Utils?.escapeHTML?.(String(value || '')) || String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    _jsArg(value = '') {
        return this._escape(JSON.stringify(String(value ?? '')));
    },

    /* ─── Styles ─────────────────────────────────────────────────── */

    _renderStyle() {
        return `
            <style>
                /* ── Shell ── */
                .ev-shell { display:grid; gap:0.85rem; padding-bottom:1.25rem; }

                /* ── Hero ── */
                .ev-hero {
                    display:grid;
                    grid-template-columns: minmax(0,1fr) 164px;
                    gap:1rem;
                    align-items:center;
                    padding:1.1rem 1.25rem;
                    overflow:hidden;
                    background:linear-gradient(135deg, rgba(168,85,247,0.10) 0%, rgba(20,184,166,0.06) 100%), var(--nyan-surface);
                    border-color:rgba(168,85,247,0.18);
                }
                .ev-hero--active  { box-shadow:0 12px 32px rgba(168,85,247,0.10); border-color:rgba(168,85,247,0.26); }
                .ev-hero--empty   { grid-template-columns:1fr; padding:1.3rem 1.25rem; }

                .ev-hero__body    { min-width:0; display:grid; gap:0.28rem; align-content:center; }
                .ev-hero__kicker  { display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; }
                .ev-hero__title   { margin:0.22rem 0 0; font-family:var(--font-display,'Syne',sans-serif); font-size:1.75rem; font-weight:900; line-height:1.1; color:var(--nyan-text); letter-spacing:0; }
                .ev-hero__desc    { margin:0; color:var(--nyan-muted); font-size:0.82rem; line-height:1.48; max-width:680px; }
                .ev-hero__bonus   { display:inline-block; color:#0f766e; font-size:0.66rem; font-weight:900; }
                body.dark-theme .ev-hero__bonus { color:#5eead4; }

                .ev-hero__progress  { margin-top:0.7rem; display:grid; gap:0.28rem; max-width:640px; }
                .ev-progress-meta   { display:flex; align-items:center; justify-content:space-between; gap:0.5rem; }
                .ev-progress-meta span  { color:var(--nyan-muted); font-size:0.68rem; font-weight:800; }
                .ev-progress-meta strong { color:var(--theme-primary); font-size:0.9rem; font-weight:900; }

                .ev-hero__aside {
                    display:grid; place-items:center; align-content:center; gap:0.18rem;
                    text-align:center; padding:0.85rem 0.75rem; border-radius:12px;
                    border:1px solid var(--nyan-border);
                    background:rgba(255,255,255,0.48);
                    min-height:108px;
                }
                body.dark-theme .ev-hero__aside { background:rgba(255,255,255,0.05); }
                .ev-hero__aside-label { color:var(--nyan-muted); font-size:0.6rem; font-weight:900; text-transform:uppercase; letter-spacing:0.07em; }
                .ev-hero__aside-value { color:var(--nyan-text); font-size:1.28rem; font-weight:900; line-height:1.08; }

                /* ── Progress tracks ── */
                .ev-track {
                    height:5px; background:var(--nyan-surface); border:1px solid var(--nyan-border);
                    border-radius:999px; overflow:hidden; flex:1; min-width:64px;
                }
                .ev-track--hero { height:9px; background:rgba(255,255,255,0.46); border-color:rgba(255,255,255,0.2); }
                body.dark-theme .ev-track--hero { background:rgba(255,255,255,0.08); }
                .ev-track div { height:100%; background:linear-gradient(90deg,#14b8a6,#60a5fa); border-radius:999px; transition:width 0.22s ease; }

                /* ── Kicker pills ── */
                .ev-kicker-pill {
                    display:inline-flex; align-items:center; gap:0.32rem;
                    height:22px; padding:0 0.56rem; border-radius:999px;
                    font-size:0.62rem; font-weight:900; line-height:1; letter-spacing:0.04em; text-transform:uppercase;
                    border:1px solid var(--nyan-border); color:var(--nyan-muted);
                    background:var(--nyan-surface-soft);
                }
                .ev-kicker-pill--active   { color:#0f766e; border-color:rgba(20,184,166,0.3); background:rgba(20,184,166,0.1); }
                .ev-kicker-pill--upcoming { color:var(--theme-primary); border-color:rgba(168,85,247,0.22); background:rgba(168,85,247,0.08); }
                .ev-kicker-pill--idle     { color:var(--nyan-muted); }
                body.dark-theme .ev-kicker-pill--active { color:#5eead4; }

                .ev-pulse {
                    display:inline-block; width:6px; height:6px; border-radius:50%;
                    background:#10b981; box-shadow:0 0 0 0 rgba(16,185,129,0.5);
                    animation:ev-pulse 1.8s ease-out infinite;
                }
                @keyframes ev-pulse {
                    0%   { box-shadow:0 0 0 0 rgba(16,185,129,0.48); }
                    70%  { box-shadow:0 0 0 7px rgba(16,185,129,0); }
                    100% { box-shadow:0 0 0 0 rgba(16,185,129,0); }
                }

                .ev-type-label {
                    font-size:0.62rem; font-weight:900; text-transform:uppercase;
                    letter-spacing:0.06em; color:var(--theme-primary); opacity:0.8;
                }

                /* ── Tabs ── */
                .ev-tabs-shell { display:grid; gap:0.75rem; }
                .ev-tabs {
                    display:flex; gap:0.28rem; flex-wrap:wrap;
                    padding:0.25rem; width:max-content; max-width:100%;
                    background:var(--nyan-surface-soft); border:1px solid var(--nyan-border); border-radius:12px;
                }
                .ev-tab {
                    appearance:none; height:32px; padding:0 0.82rem; border-radius:9px;
                    border:1px solid transparent; background:transparent;
                    color:var(--nyan-muted); font-family:'DM Sans',sans-serif; font-size:0.72rem; font-weight:900;
                    cursor:pointer; white-space:nowrap; line-height:1;
                    transition:background 0.15s, color 0.15s, box-shadow 0.15s;
                }
                .ev-tab:hover { color:var(--nyan-text); background:var(--nyan-surface); }
                .ev-tab--active {
                    color:#fff; background:linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
                    box-shadow:0 6px 16px rgba(168,85,247,0.22);
                }

                /* ── Overview grid ── */
                .ev-overview-grid {
                    display:grid;
                    grid-template-columns:minmax(0,1.55fr) minmax(268px,0.85fr);
                    gap:0.85rem; align-items:start;
                }
                .ev-side-col { display:grid; gap:0.75rem; min-width:0; }

                /* ── History grid ── */
                .ev-history-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:0.85rem; align-items:start; }

                /* ── Panels ── */
                .ev-panel { padding:0.95rem; }
                .ev-panel--compact { padding:0.78rem; }
                .ev-panel--muted { background:var(--nyan-surface-soft); border-color:var(--nyan-border); }

                .ev-panel-head {
                    display:flex; align-items:center; justify-content:space-between; gap:0.75rem;
                    margin-bottom:0.68rem;
                }
                .ev-panel-title { margin:0; font-family:var(--font-display,'Syne',sans-serif); font-size:0.95rem; font-weight:900; color:var(--nyan-text); line-height:1.2; }
                .ev-panel-sub   { display:block; margin-top:0.1rem; color:var(--nyan-muted); font-size:0.65rem; font-weight:800; }

                /* ── Stacks ── */
                .ev-stack       { display:grid; gap:0.5rem; }
                .ev-stack--tight { gap:0.38rem; }
                .ev-list-compact { display:grid; gap:0.38rem; }

                /* ── Buttons ── */
                .ev-btn {
                    appearance:none; display:inline-flex; align-items:center; justify-content:center; gap:0.3rem;
                    height:32px; padding:0 0.82rem; border-radius:9px; border:1px solid transparent;
                    font-family:'DM Sans',sans-serif; font-size:0.72rem; font-weight:900; line-height:1;
                    white-space:nowrap; cursor:pointer; flex:0 0 auto;
                    transition:transform 0.15s, box-shadow 0.15s, background 0.15s;
                }
                .ev-btn--sm { height:28px; padding:0 0.64rem; font-size:0.68rem; }
                .ev-btn--ghost {
                    color:var(--theme-primary);
                    background:rgba(168,85,247,0.08);
                    border-color:rgba(168,85,247,0.2);
                }
                .ev-btn--ghost:hover { background:rgba(168,85,247,0.14); transform:translateY(-1px); }
                .ev-btn--claim,
                .ev-btn--buy {
                    color:#fff;
                    background:linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
                    box-shadow:0 6px 16px rgba(168,85,247,0.2);
                }
                .ev-btn--claim:hover,
                .ev-btn--buy:hover { transform:translateY(-1px); box-shadow:0 8px 20px rgba(168,85,247,0.28); }
                .ev-btn--claim { min-width:84px; }
                .ev-btn--buy   { min-width:78px; }

                /* ── Count chip ── */
                .ev-count-chip {
                    display:inline-flex; align-items:center; justify-content:center;
                    height:20px; padding:0 0.48rem; border-radius:999px; min-width:24px;
                    font-size:0.62rem; font-weight:900; line-height:1;
                    background:var(--nyan-surface); border:1px solid var(--nyan-border); color:var(--nyan-muted);
                }

                /* ── Badge open ── */
                .ev-badge--open { color:#0f766e; border-color:rgba(20,184,166,0.25); background:rgba(20,184,166,0.1); }
                body.dark-theme .ev-badge--open { color:#5eead4; }

                /* ── Mission rows ── */
                .ev-mission {
                    border:1px solid var(--nyan-border);
                    border-left:3px solid var(--nyan-border);
                    background:var(--nyan-surface-soft);
                    border-radius:10px; padding:0.68rem;
                    min-width:0;
                    transition:border-color 0.16s, background 0.16s, transform 0.16s, box-shadow 0.16s;
                }
                .ev-mission:hover { transform:translateY(-1px); box-shadow:0 8px 22px rgba(15,23,42,0.07); }

                .ev-mission--progress  { border-left-color:var(--nyan-border); }
                .ev-mission--complete  { border-left-color:rgba(20,184,166,0.5); }
                .ev-mission--claimable {
                    border-left-color:#14b8a6;
                    background:rgba(20,184,166,0.06);
                    border-color:rgba(20,184,166,0.22);
                }
                .ev-mission--claimed   { border-left-color:#10b981; opacity:0.8; }

                .ev-mission__main      { display:flex; align-items:flex-start; justify-content:space-between; gap:0.65rem; }
                .ev-mission__info      { min-width:0; flex:1; display:grid; gap:0.12rem; }
                .ev-mission__title-row { display:flex; align-items:center; gap:0.45rem; flex-wrap:wrap; }
                .ev-mission__name      { font-size:0.82rem; font-weight:900; color:var(--nyan-text); line-height:1.25; }
                .ev-mission__desc      { font-size:0.7rem; color:var(--nyan-muted); line-height:1.42; margin-top:0.1rem; }
                .ev-mission__reward    { font-size:0.7rem; font-weight:900; color:var(--theme-primary); margin-top:0.1rem; }
                .ev-mission__action    { flex:0 0 auto; display:flex; align-items:center; padding-top:1px; }

                .ev-mission-done { color:#10b981; font-size:0.7rem; font-weight:900; white-space:nowrap; }
                .ev-mission-pct  { color:var(--nyan-muted); font-size:0.72rem; font-weight:900; white-space:nowrap; }

                /* ── Status chips ── */
                .ev-status {
                    display:inline-flex; align-items:center; height:18px; padding:0 0.38rem;
                    border-radius:999px; border:1px solid var(--nyan-border);
                    font-size:0.58rem; font-weight:900; line-height:1; white-space:nowrap;
                    background:var(--nyan-surface); color:var(--nyan-muted);
                }
                .ev-status--claimable,
                .ev-status--complete  { color:#0f766e; border-color:rgba(20,184,166,0.25); background:rgba(20,184,166,0.1); }
                .ev-status--claimed   { color:#64748b; border-color:transparent; background:transparent; }
                body.dark-theme .ev-status--claimable,
                body.dark-theme .ev-status--complete  { color:#5eead4; }

                /* ── Progress row ── */
                .ev-progress-row     { display:flex; align-items:center; gap:0.5rem; margin-top:0.48rem; }
                .ev-progress-nums    { color:var(--nyan-muted); font-size:0.64rem; font-weight:800; white-space:nowrap; }
                .ev-muted            { color:var(--nyan-muted); font-size:0.68rem; font-weight:800; }

                /* ── Shop rows ── */
                .ev-shop-row {
                    display:flex; align-items:center; justify-content:space-between; gap:0.65rem;
                    padding:0.6rem 0.68rem; border-radius:10px;
                    border:1px solid var(--nyan-border); background:var(--nyan-surface-soft);
                    transition:border-color 0.15s, background 0.15s, transform 0.15s, box-shadow 0.15s;
                }
                .ev-shop-row--compact { padding:0.46rem 0.56rem; }
                .ev-shop-row--buyable:hover { transform:translateY(-1px); box-shadow:0 8px 20px rgba(15,23,42,0.07); border-color:rgba(168,85,247,0.24); }
                .ev-shop-row--owned   { opacity:0.78; }

                .ev-shop-row__info { min-width:0; flex:1; display:grid; gap:0.08rem; }
                .ev-shop-row__name { font-size:0.8rem; font-weight:900; color:var(--nyan-text); }
                .ev-shop-row__meta { font-size:0.66rem; color:var(--nyan-muted); }

                .ev-shop-chip {
                    display:inline-flex; align-items:center; justify-content:center;
                    height:28px; padding:0 0.56rem; border-radius:8px; flex:0 0 auto;
                    font-size:0.64rem; font-weight:900; line-height:1; white-space:nowrap;
                    border:1px solid var(--nyan-border); color:var(--nyan-muted); background:var(--nyan-surface);
                }
                .ev-shop-chip--owned { color:#10b981; border-color:rgba(16,185,129,0.22); background:rgba(16,185,129,0.08); }
                .ev-shop-chip--closed { opacity:0.7; }

                /* ── Compact rows (timeline / history) ── */
                .ev-compact-row {
                    display:flex; align-items:center; justify-content:space-between; gap:0.6rem;
                    padding:0.5rem 0.6rem; border-radius:8px;
                    border:1px solid var(--nyan-border); background:var(--nyan-surface-soft);
                }
                .ev-compact-row__name { display:block; font-size:0.76rem; font-weight:900; color:var(--nyan-text); line-height:1.25; }
                .ev-compact-row__meta { display:block; font-size:0.64rem; color:var(--nyan-muted); margin-top:0.06rem; }
                .ev-source-chip {
                    display:inline-flex; align-items:center; height:20px; padding:0 0.44rem;
                    border-radius:6px; flex:0 0 auto;
                    font-size:0.6rem; font-weight:900; line-height:1; white-space:nowrap;
                    color:var(--theme-primary); background:rgba(168,85,247,0.08);
                    border:1px solid rgba(168,85,247,0.14);
                }
                .ev-source-chip--active { color:#0f766e; background:rgba(20,184,166,0.1); border-color:rgba(20,184,166,0.2); }
                body.dark-theme .ev-source-chip--active { color:#5eead4; }

                /* ── Small empty ── */
                .ev-small-empty {
                    padding:0.72rem; border-radius:8px; text-align:center;
                    color:var(--nyan-muted); font-size:0.72rem; font-weight:800;
                    border:1px dashed var(--nyan-border); background:var(--nyan-surface-soft);
                }

                /* ── Empty state ── */
                .ev-empty {
                    display:grid; gap:0.6rem; justify-items:center; text-align:center; padding:2rem 1.5rem;
                }
                .ev-empty__icon { font-size:2.4rem; line-height:1; }
                .ev-empty h2 { margin:0; font-family:var(--font-display,'Syne',sans-serif); font-size:1.18rem; font-weight:900; color:var(--nyan-text); }
                .ev-empty p  { margin:0; max-width:480px; color:var(--nyan-muted); font-size:0.84rem; line-height:1.52; }

                /* ── Tab body ── */
                .ev-tab-body { display:grid; gap:0; }

                /* ── Responsive ── */
                @media (max-width:920px) {
                    .ev-overview-grid,
                    .ev-history-grid { grid-template-columns:1fr; }
                    .ev-tabs { width:100%; justify-content:stretch; }
                    .ev-tab  { flex:1; justify-content:center; }
                }
                @media (max-width:760px) {
                    .ev-hero { grid-template-columns:1fr; padding:1rem; }
                    .ev-hero__aside { min-height:0; padding:0.72rem; text-align:left; justify-items:start; width:100%; }
                    .ev-hero__title { font-size:1.48rem; }
                    .ev-mission__main { flex-direction:column; }
                    .ev-mission__action { width:100%; }
                    .ev-mission__action .ev-btn { width:100%; }
                    .ev-shop-row { flex-direction:column; align-items:flex-start; }
                    .ev-shop-row .ev-shop-chip,
                    .ev-shop-row .ev-btn { width:100%; }
                }
            </style>
        `;
    },
};

window.Events = Events;
