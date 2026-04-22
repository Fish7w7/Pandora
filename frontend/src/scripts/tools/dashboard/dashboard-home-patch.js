Dashboard.renderHeader = function() {
    const greeting = this.getGreeting();
    const username = (window.App?.user?.username) || Utils.loadData('current_user') || 'Usuario';
    const c = this._colors();

    return `
        <div style="
            margin-bottom:1rem;padding:0.95rem 1.1rem;border-radius:16px;
            background:${c.card};border:1px solid ${c.border};
            display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;
        ">
            <div>
                <h1 style="
                    margin:0;font-family:var(--font-display,'Syne',sans-serif);
                    font-size:1.65rem;font-weight:900;color:${c.title};letter-spacing:-0.02em;
                ">
                    ${greeting}, ${username}
                </h1>
                <p style="margin:0.25rem 0 0;font-size:0.8rem;color:${c.sub};">
                    Resumo rapido da sua atividade no NyanTools
                </p>
            </div>
            <div style="
                font-size:0.7rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;
                color:var(--theme-primary,#a855f7);background:rgba(168,85,247,0.14);
                border:1px solid rgba(168,85,247,0.26);padding:0.35rem 0.6rem;border-radius:999px;
            ">
                Dashboard
            </div>
        </div>
    `;
};

Dashboard.renderQuickStats = function() {
    const mostUsedTool = this.getMostUsedTool();
    const streakEmoji = this.stats.dailyStreak >= 7 ? '🔥' : this.stats.dailyStreak >= 3 ? '⭐' : '📅';
    const normalizedAccess = this.normalizeToolAccess();
    const toolCount = Object.keys(normalizedAccess).length;
    const totalTools = 12;

    return `
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3" style="margin-bottom:1rem;">
            ${this.renderStatCard('⏱️', 'Tempo total', this.formatTime(this.stats.totalTime))}
            ${this.renderStatCard(streakEmoji, 'Sequencia', `${this.stats.dailyStreak} dias`)}
            ${this.renderStatCard('🛠️', 'Mais usado', mostUsedTool.name)}
            ${this.renderStatCard('🎯', 'Ferramentas', `${toolCount}/${totalTools}`)}
        </div>
    `;
};

Dashboard.renderStatCard = function(icon, label, value) {
    const c = this._colors();
    return `
        <div style="
            background:${c.card};border:1px solid ${c.border};
            border-radius:var(--radius-lg,14px); padding:0.9rem 1rem;
            color:${c.title}; cursor:default;
            transition:transform var(--transition-base,0.2s), box-shadow var(--transition-base,0.2s);
            box-shadow:0 1px 2px rgba(0,0,0,0.06);
        "
        onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'"
        onmouseout="this.style.transform='';this.style.boxShadow='0 1px 2px rgba(0,0,0,0.06)'">
            <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.4rem;">
                <span style="
                    width:26px;height:26px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;
                    background:rgba(168,85,247,0.14);border:1px solid rgba(168,85,247,0.25);font-size:0.9rem;
                ">${icon}</span>
                <div style="font-size:0.66rem;font-weight:800;color:${c.sub};text-transform:uppercase;letter-spacing:0.08em;">${label}</div>
            </div>
            <div style="
                font-size:1.2rem;font-weight:var(--weight-black,900);
                font-family:var(--font-display,'Syne',sans-serif);line-height:1.1;
                color:${c.title};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
            ">${value}</div>
        </div>
    `;
};

Dashboard.renderPersonalizedHome = function() {
    const c = this._colors();
    const lastRoute = Utils.loadData('last_tool_route');
    const lastRouteAt = Utils.loadData('last_tool_route_at');
    const lastTool = lastRoute ? this.getToolInfo(lastRoute) : null;
    const lastSeen = lastRouteAt ? this.formatLastAccess(lastRouteAt) : 'agora ha pouco';
    const missions = window.Missions?.getDailyMissions?.() || [];
    const nextMission = missions.find(m => !m.completed) || null;
    const notes = (Utils.loadData('notes') || []).slice(0, 2);
    const shortcuts = this.getDynamicShortcuts(3);

    const notesHtml = notes.length
        ? notes.map(n => `
            <button onclick="Router.navigate('notes')" style="
                width:100%;text-align:left;padding:0.5rem 0.625rem;border-radius:10px;border:1px solid ${c.innerBdr};
                background:${c.inner};color:${c.text};font-size:0.74rem;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
            ">📝 ${(n.title || 'Sem titulo')}</button>
        `).join('')
        : `<div style="font-size:0.72rem;color:${c.sub};">Sem notas recentes</div>`;

    const shortcutsHtml = shortcuts.map(s => `
        <button onclick="Router.navigate('${s.id}')" style="
            padding:0.5rem 0.625rem;border-radius:10px;border:1px solid ${c.innerBdr};background:${c.inner};
            color:${c.text};font-size:0.72rem;font-weight:700;cursor:pointer;
        ">${s.icon} ${s.name}</button>
    `).join('');

    return this._section('🌍', 'Home personalizada', `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.65rem;">
            <div style="background:${c.inner};border:1px solid ${c.innerBdr};border-radius:12px;padding:0.9rem;">
                <div style="font-size:0.62rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${c.muted};margin-bottom:0.45rem;">Continuar</div>
                ${lastTool
                    ? `<button onclick="Router.navigate('${lastRoute}')" style="width:100%;text-align:left;border:none;background:transparent;cursor:pointer;padding:0;">
                            <div style="font-size:0.9rem;font-weight:800;color:${c.title};">${lastTool.icon} ${lastTool.name}</div>
                            <div style="font-size:0.72rem;color:${c.sub};margin-top:0.15rem;">Ultimo acesso ${lastSeen}</div>
                       </button>`
                    : `<div style="font-size:0.75rem;color:${c.sub};">Sem historico recente</div>`
                }
            </div>

            <div style="background:${c.inner};border:1px solid ${c.innerBdr};border-radius:12px;padding:0.9rem;">
                <div style="font-size:0.62rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${c.muted};margin-bottom:0.45rem;">Missao do dia</div>
                ${nextMission
                    ? `<button onclick="Router.navigate('missions')" style="width:100%;text-align:left;border:none;background:transparent;cursor:pointer;padding:0;">
                            <div style="font-size:0.85rem;font-weight:700;color:${c.title};">${nextMission.icon} ${nextMission.title}</div>
                            <div style="font-size:0.72rem;color:${c.sub};margin-top:0.15rem;">${nextMission.desc}</div>
                       </button>`
                    : `<button onclick="Router.navigate('missions')" style="width:100%;text-align:left;border:none;background:transparent;cursor:pointer;padding:0;">
                            <div style="font-size:0.85rem;font-weight:700;color:#22c55e;">✓ Tudo concluido hoje</div>
                            <div style="font-size:0.72rem;color:${c.sub};margin-top:0.15rem;">Abra missoes para ver o desafio semanal</div>
                       </button>`
                }
            </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.65rem;margin-top:0.65rem;">
            <div style="background:${c.inner};border:1px solid ${c.innerBdr};border-radius:12px;padding:0.9rem;">
                <div style="font-size:0.62rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${c.muted};margin-bottom:0.45rem;">Notas recentes</div>
                <div style="display:flex;flex-direction:column;gap:0.45rem;">
                    ${notesHtml}
                </div>
            </div>

            <div style="background:${c.inner};border:1px solid ${c.innerBdr};border-radius:12px;padding:0.9rem;">
                <div style="font-size:0.62rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${c.muted};margin-bottom:0.45rem;">Atalhos</div>
                <div style="display:grid;grid-template-columns:1fr;gap:0.45rem;">
                    ${shortcutsHtml}
                </div>
            </div>
        </div>

        <div style="margin-top:0.65rem;background:${c.inner};border:1px solid ${c.innerBdr};border-radius:12px;padding:0.9rem;">
            <div style="font-size:0.62rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${c.muted};margin-bottom:0.45rem;">Amigos online</div>
            <div id="dash-online-count" style="font-size:0.9rem;font-weight:800;color:${c.title};">Carregando...</div>
            <div id="dash-online-list" style="font-size:0.72rem;color:${c.sub};margin-top:0.2rem;">Buscando presenca em tempo real</div>
        </div>
    `);
};

Dashboard.renderToolsUsage = function() {
    const normalizedAccess = this.normalizeToolAccess();
    const tools = Object.entries(normalizedAccess)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);
    const c = this._colors();

    const emptyContent = `
        <div style="text-align:center;padding:1.4rem 0;color:${c.muted};">
            <p style="font-size:0.78rem;font-family:var(--font-body,'DM Sans',sans-serif);">Use as ferramentas para ver estatisticas aqui.</p>
        </div>`;

    if (tools.length === 0) return this._section('🛠️', 'Ferramentas mais usadas', emptyContent, true, true);

    const maxUsage = tools[0]?.[1] || 1;
    const rows = tools.map(([tool, count], index) => {
        const percentage = (count / maxUsage) * 100;
        const toolInfo = this.getToolInfo(tool);
        return `
            <div style="margin-bottom:0.7rem;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.3rem;">
                    <div style="display:flex;align-items:center;gap:0.5rem;">
                        <span style="font-size:1rem;">${toolInfo.icon}</span>
                        <span style="font-size:0.82rem;font-weight:700;color:${c.title};font-family:var(--font-body,'DM Sans',sans-serif);">${toolInfo.name}</span>
                        ${index === 0 ? `<span style="font-size:0.62rem;font-weight:700;background:rgba(234,179,8,0.15);color:#ca8a04;border:1px solid rgba(234,179,8,0.3);padding:1px 7px;border-radius:99px;">Top</span>` : ''}
                    </div>
                    <span style="font-size:0.66rem;font-weight:700;color:${c.muted};">${count}x</span>
                </div>
                <div style="height:6px;background:${c.inner};border-radius:99px;overflow:hidden;">
                    <div style="height:100%;width:${percentage}%;background:linear-gradient(90deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));border-radius:99px;"></div>
                </div>
            </div>`;
    }).join('');

    return this._section('🛠️', 'Ferramentas mais usadas', `<div>${rows}</div>`, true, true);
};

Dashboard.renderGamesSection = function() {
    const games = [
        { id: 'snake', name: 'Cobrinha', icon: '🐍', key: 'snake_highscore' },
        { id: 'termo', name: 'Termo', icon: '🔤', key: 'termo_best' },
        { id: '2048', name: '2048', icon: '🔢', key: 'game_2048_highscore' },
        { id: 'flappy', name: 'Flappy Nyan', icon: '🐱', key: 'flappy_bird_highscore' },
        { id: 'typeracer', name: 'Type Racer', icon: '⌨️', key: 'typeracer_highscore' },
        { id: 'quiz', name: 'Quiz Diario', icon: '🧠', key: 'quiz_highscore' },
    ];

    return this._section('🎮', 'Recordes dos jogos', `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.6rem;">
            ${games.map(game => {
                const c = this._colors();
                const score = Utils.loadData(game.key);
                const displayScore = this.formatGameScore(game.id, score);
                const hasScore = score && displayScore !== '---';
                return `
                    <div style="
                        background:${c.inner}; border:1px solid ${c.innerBdr}; border-radius:12px; padding:0.8rem;
                        text-align:center; cursor:pointer; transition:transform .15s;
                    "
                    onclick="Router.navigate('offline')"
                    onmouseover="this.style.transform='translateY(-2px)'"
                    onmouseout="this.style.transform=''">
                        <div style="font-size:1.3rem;margin-bottom:0.3rem;">${game.icon}</div>
                        <div style="font-size:0.68rem;font-weight:700;color:${c.sub};margin-bottom:0.2rem;">${game.name}</div>
                        <div style="font-size:1rem;font-weight:900;font-family:var(--font-display,'Syne',sans-serif);color:${hasScore ? 'var(--theme-primary,#a855f7)' : c.muted};">${displayScore}</div>
                    </div>`;
            }).join('')}
        </div>
    `, true, true);
};

Dashboard._homePrefsKey = 'dash_home_prefs_v1';

Dashboard._getHomePrefs = function() {
    const saved = Utils.loadData(this._homePrefsKey) || {};
    return {
        continueCard: saved.continueCard !== false,
        missionCard: saved.missionCard !== false,
        notesCard: saved.notesCard !== false,
        shortcutsCard: saved.shortcutsCard !== false,
        friendsCard: saved.friendsCard !== false,
    };
};

Dashboard._saveHomePrefs = function(next) {
    Utils.saveData(this._homePrefsKey, next);
};

Dashboard._refreshHomeCustomizeModal = function() {
    const modal = document.getElementById('dash-home-customize-modal');
    if (!modal) return;
    const prefs = this._getHomePrefs();
    const rows = modal.querySelectorAll('[data-pref-key]');
    rows.forEach((row) => {
        const key = row.getAttribute('data-pref-key');
        const badge = row.querySelector('[data-pref-badge]');
        if (!badge) return;
        const active = prefs[key] !== false;
        badge.textContent = active ? 'Ativo' : 'Oculto';
        badge.style.background = active ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.16)';
        badge.style.color = active ? '#22c55e' : '#f87171';
        badge.style.border = active ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.28)';
    });
};

Dashboard._toggleHomePref = function(key) {
    const prefs = this._getHomePrefs();
    prefs[key] = !prefs[key];
    this._saveHomePrefs(prefs);
    this._refreshHomeCustomizeModal();
    if (window.Router?.currentRoute === 'home') {
        const refreshed = this.refreshRealtime?.({ keepCustomizeModal: true });
        if (!refreshed) window.Router.render();
        setTimeout(() => this._refreshHomeCustomizeModal(), 0);
    }
};

Dashboard._openHomeCustomize = function() {
    document.getElementById('dash-home-customize-modal')?.remove();
    const d = document.body.classList.contains('dark-theme');
    const bg = d ? '#0e0e18' : '#ffffff';
    const text = d ? '#f1f5f9' : '#0f172a';
    const sub = d ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';
    const bdr = d ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    const prefs = this._getHomePrefs();

    const rows = [
        { key: 'continueCard', label: 'Continuar' },
        { key: 'missionCard', label: 'Missao do dia' },
        { key: 'notesCard', label: 'Notas recentes' },
        { key: 'shortcutsCard', label: 'Atalhos' },
        { key: 'friendsCard', label: 'Amigos online' },
    ];

    const modal = document.createElement('div');
    modal.id = 'dash-home-customize-modal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.62);display:flex;align-items:center;justify-content:center;padding:1rem;';

    const inner = document.createElement('div');
    inner.style.cssText = `width:100%;max-width:360px;background:${bg};border:1px solid ${bdr};border-radius:16px;padding:1rem;font-family:'DM Sans',sans-serif;`;
    inner.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem;">
            <div style="font-size:0.95rem;font-weight:900;color:${text};font-family:'Syne',sans-serif;">Personalizar Home</div>
            <button onclick="document.getElementById('dash-home-customize-modal').remove()"
                style="border:none;background:transparent;color:${sub};cursor:pointer;font-size:1rem;">X</button>
        </div>
        <p style="font-size:0.72rem;color:${sub};margin:0 0 0.75rem;">Escolha os blocos que voce quer ver.</p>
        ${rows.map(r => `
            <button onclick="Dashboard._toggleHomePref('${r.key}')"
                data-pref-key="${r.key}"
                style="
                    width:100%;margin-bottom:0.45rem;padding:0.55rem 0.65rem;border-radius:10px;
                    border:1px solid ${bdr};background:${d ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'};
                    color:${text};display:flex;align-items:center;justify-content:space-between;cursor:pointer;
                    font-size:0.78rem;font-weight:700;
                ">
                <span>${r.label}</span>
                <span style="
                    font-size:0.66rem;padding:0.12rem 0.4rem;border-radius:999px;
                    background:${prefs[r.key] ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.16)'};
                    color:${prefs[r.key] ? '#22c55e' : '#f87171'};
                    border:1px solid ${prefs[r.key] ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.28)'};
                " data-pref-badge>${prefs[r.key] ? 'Ativo' : 'Oculto'}</span>
            </button>
        `).join('')}
    `;

    modal.appendChild(inner);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
};

Dashboard.renderPersonalizedHome = function() {
    const c = this._colors();
    const prefs = this._getHomePrefs();
    const lastRoute = Utils.loadData('last_tool_route');
    const lastRouteAt = Utils.loadData('last_tool_route_at');
    const lastTool = lastRoute ? this.getToolInfo(lastRoute) : null;
    const lastSeen = lastRouteAt ? this.formatLastAccess(lastRouteAt) : 'agora ha pouco';
    const missions = window.Missions?.getDailyMissions?.() || [];
    const nextMission = missions.find(m => !m.completed) || null;
    const notes = (Utils.loadData('notes') || []).slice(0, 2);
    const shortcuts = this.getDynamicShortcuts(3);

    const notesHtml = notes.length
        ? notes.map(n => `
            <button onclick="Router.navigate('notes')" style="
                width:100%;text-align:left;padding:0.5rem 0.625rem;border-radius:10px;border:1px solid ${c.innerBdr};
                background:${c.inner};color:${c.text};font-size:0.74rem;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
            ">${(n.title || 'Sem titulo')}</button>
        `).join('')
        : `<div style="font-size:0.72rem;color:${c.sub};">Sem notas recentes</div>`;

    const shortcutsHtml = shortcuts.map(s => `
        <button onclick="Router.navigate('${s.id}')" style="
            padding:0.5rem 0.625rem;border-radius:10px;border:1px solid ${c.innerBdr};background:${c.inner};
            color:${c.text};font-size:0.72rem;font-weight:700;cursor:pointer;
        ">${s.name}</button>
    `).join('');

    const cards = [];

    if (prefs.continueCard) {
        cards.push(`
            <div style="background:${c.inner};border:1px solid ${c.innerBdr};border-radius:12px;padding:0.85rem;">
                <div style="font-size:0.62rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${c.muted};margin-bottom:0.4rem;">Continuar</div>
                ${lastTool
                    ? `<button onclick="Router.navigate('${lastRoute}')" style="width:100%;text-align:left;border:none;background:transparent;cursor:pointer;padding:0;">
                            <div style="font-size:0.9rem;font-weight:800;color:${c.title};">${lastTool.icon} ${lastTool.name}</div>
                            <div style="font-size:0.72rem;color:${c.sub};margin-top:0.15rem;">Ultimo acesso ${lastSeen}</div>
                       </button>`
                    : `<div style="font-size:0.75rem;color:${c.sub};">Sem historico recente</div>`
                }
            </div>
        `);
    }

    if (prefs.missionCard) {
        cards.push(`
            <div style="background:${c.inner};border:1px solid ${c.innerBdr};border-radius:12px;padding:0.85rem;">
                <div style="font-size:0.62rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${c.muted};margin-bottom:0.4rem;">Missao do dia</div>
                ${nextMission
                    ? `<button onclick="Router.navigate('missions')" style="width:100%;text-align:left;border:none;background:transparent;cursor:pointer;padding:0;">
                            <div style="font-size:0.85rem;font-weight:700;color:${c.title};">${nextMission.icon} ${nextMission.title}</div>
                            <div style="font-size:0.72rem;color:${c.sub};margin-top:0.15rem;">${nextMission.desc}</div>
                       </button>`
                    : `<button onclick="Router.navigate('missions')" style="width:100%;text-align:left;border:none;background:transparent;cursor:pointer;padding:0;">
                            <div style="font-size:0.85rem;font-weight:700;color:#22c55e;">Tudo concluido hoje</div>
                       </button>`
                }
            </div>
        `);
    }

    if (prefs.notesCard) {
        cards.push(`
            <div style="background:${c.inner};border:1px solid ${c.innerBdr};border-radius:12px;padding:0.85rem;">
                <div style="font-size:0.62rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${c.muted};margin-bottom:0.4rem;">Notas recentes</div>
                <div style="display:flex;flex-direction:column;gap:0.4rem;">${notesHtml}</div>
            </div>
        `);
    }

    if (prefs.shortcutsCard) {
        cards.push(`
            <div style="background:${c.inner};border:1px solid ${c.innerBdr};border-radius:12px;padding:0.85rem;">
                <div style="font-size:0.62rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${c.muted};margin-bottom:0.4rem;">Atalhos</div>
                <div style="display:grid;grid-template-columns:1fr;gap:0.4rem;">${shortcutsHtml}</div>
            </div>
        `);
    }

    if (prefs.friendsCard) {
        cards.push(`
            <div style="background:${c.inner};border:1px solid ${c.innerBdr};border-radius:12px;padding:0.85rem;">
                <div style="font-size:0.62rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${c.muted};margin-bottom:0.4rem;">Amigos online</div>
                <div id="dash-online-count" style="font-size:0.9rem;font-weight:800;color:${c.title};">Carregando...</div>
                <div id="dash-online-list" style="font-size:0.72rem;color:${c.sub};margin-top:0.15rem;">Buscando presenca em tempo real</div>
            </div>
        `);
    }

    const body = cards.length > 0
        ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;">${cards.join('')}</div>`
        : `<div style="background:${c.inner};border:1px dashed ${c.innerBdr};border-radius:12px;padding:1rem;text-align:center;color:${c.sub};font-size:0.78rem;">
            Nenhum bloco visivel. Clique em Personalizar para escolher o que mostrar.
           </div>`;

    return this._section('🏠', 'Home personalizada', `
        <div style="display:flex;justify-content:flex-end;margin-bottom:0.55rem;">
            <button onclick="Dashboard._openHomeCustomize()"
                style="
                    border:1px solid ${c.innerBdr};background:${c.inner};color:${c.text};
                    font-size:0.72rem;font-weight:700;padding:0.36rem 0.6rem;border-radius:9px;cursor:pointer;
                ">
                Personalizar
            </button>
        </div>
        ${body}
    `);
};

Dashboard.render = function() {
    this.loadStats();
    this.updateStats();

    return `
        <div id="dash-root" class="max-w-6xl mx-auto" style="padding-bottom:0.75rem;">
            <div id="dash-header-slot">${this.renderHeader()}</div>
            <div id="dash-quick-stats-slot">${this.renderQuickStats()}</div>
            <div id="dash-home-personalized-slot">${this.renderPersonalizedHome()}</div>
            <div id="dash-activity-slot">${this.renderActivitySection()}</div>
            <div id="dash-productivity-slot">${this.renderProductivitySection()}</div>
            <div id="dash-tools-slot">${this.renderToolsUsage()}</div>
            <div id="dash-games-slot">${this.renderGamesSection()}</div>
        </div>
    `;
};

Dashboard._refreshSuggestionsWidget = function() {
    if (window.Router?.currentRoute !== 'home') return;
    const toolContainer = document.getElementById('tool-container');
    if (!toolContainer || typeof window.Integrations?.renderSuggestionsWidget !== 'function') return;

    const html = window.Integrations.renderSuggestionsWidget();
    const existing = document.getElementById('nyan-smart-suggestions');

    if (!html) {
        existing?.remove();
        return;
    }

    if (existing) {
        existing.innerHTML = html;
        return;
    }

    const wrapper = document.createElement('div');
    wrapper.id = 'nyan-smart-suggestions';
    wrapper.innerHTML = html;

    const dashRoot = toolContainer.querySelector('#dash-root');
    if (dashRoot) {
        toolContainer.insertBefore(wrapper, dashRoot);
    } else {
        toolContainer.insertBefore(wrapper, toolContainer.firstChild);
    }
};

Dashboard.refreshRealtime = function(options = {}) {
    if (window.Router?.currentRoute !== 'home') return false;

    const toolContainer = document.getElementById('tool-container');
    if (!toolContainer) return false;
    const dashRoot = toolContainer.querySelector('#dash-root');
    if (!dashRoot) return false;

    this.loadStats();
    this.updateStats();

    const patchSlot = (id, html) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = html;
    };

    patchSlot('dash-header-slot', this.renderHeader());
    patchSlot('dash-quick-stats-slot', this.renderQuickStats());
    patchSlot('dash-home-personalized-slot', this.renderPersonalizedHome());
    patchSlot('dash-activity-slot', this.renderActivitySection());
    patchSlot('dash-productivity-slot', this.renderProductivitySection());
    patchSlot('dash-tools-slot', this.renderToolsUsage());
    patchSlot('dash-games-slot', this.renderGamesSection());

    this._refreshSuggestionsWidget?.();

    if (options.hydrate !== false) {
        setTimeout(() => this.hydratePersonalizedHome?.(), 60);
    }
    if (options.keepCustomizeModal) {
        setTimeout(() => this._refreshHomeCustomizeModal?.(), 0);
    }
    return true;
};

window.Dashboard = Dashboard;

(function finalizeDashboardV310() {
    if (!window.Dashboard || Dashboard.__v310RealtimeFinalized) return;
    Dashboard.__v310RealtimeFinalized = true;

    Dashboard._homeRefreshTimer = null;
    Dashboard._homeRefreshQueuedAt = 0;

    Dashboard.queueHomeRefresh = function() {
        if (window.Router?.currentRoute !== 'home') return;
        const now = Date.now();
        if (this._homeRefreshTimer && (now - this._homeRefreshQueuedAt) < 160) return;
        this._homeRefreshQueuedAt = now;
        if (this._homeRefreshTimer) clearTimeout(this._homeRefreshTimer);
        this._homeRefreshTimer = setTimeout(() => {
            this._homeRefreshTimer = null;
            if (window.Router?.currentRoute !== 'home') return;
            const refreshed = this.refreshRealtime?.();
            if (!refreshed) {
                window.Router.render();
                setTimeout(() => this.hydratePersonalizedHome?.(), 60);
            }
        }, 180);
    };

    const __origInit = Dashboard.init?.bind(Dashboard);
    Dashboard.init = function() {
        __origInit?.();
        if (this.__v310RealtimeListenersBound) return;
        this.__v310RealtimeListenersBound = true;

        window.addEventListener('nyan:connected-action', () => this.queueHomeRefresh());
        window.addEventListener('nyan:presence-changed', () => this.queueHomeRefresh());
        window.addEventListener('focus', () => this.queueHomeRefresh());
        window.addEventListener('visibilitychange', () => {
            if (!document.hidden) this.queueHomeRefresh();
        });
    };

    const __origToggleHomePref = Dashboard._toggleHomePref?.bind(Dashboard);
    Dashboard._toggleHomePref = function(key) {
        __origToggleHomePref?.(key);
        this.queueHomeRefresh?.();
    };
})();
