const Dashboard = {
    stats: {
        totalTime: 0,
        toolAccess: {},
        dailyStreak: 0,
        lastAccessDate: null,
        gameHighscores: {},
        notesStats: { total: 0, pinned: 0 },
        tasksStats: { total: 0, completed: 0 },
        weeklyActivity: {},
        weeklyHistory: {},
        currentWeekStart: null
    },

    _isDark() {
        return document.body.classList.contains('dark-theme');
    },

    _colors() {
        const d = this._isDark();
        return {
            card:    d ? 'rgba(255,255,255,0.04)' : '#ffffff',
            border:  d ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
            title:   d ? '#f1f5f9'                : '#0f172a',
            sub:     d ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)',
            muted:   d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)',
            inner:   d ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            innerBdr:d ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
            text:    d ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.65)',
        };
    },

    _section(icon, title, content, mb = true, defaultCollapsed = false) {
        const c         = this._colors();
        const collapseKey = 'dash_collapsed_' + title.replace(/[^a-zA-Z0-9]/g, '_');
        const savedCollapsed = Utils.loadData(collapseKey);
        const isCollapsed = (savedCollapsed === null || savedCollapsed === undefined)
            ? defaultCollapsed
            : savedCollapsed === true;
        const sectionId   = 'dash-section-' + Math.random().toString(36).slice(2, 7);
        return `
            <div style="
                background:${c.card}; border:1px solid ${c.border};
                border-radius:var(--radius-xl,18px);
                padding:1.125rem; ${mb ? 'margin-bottom:1rem;' : ''}
                box-shadow:0 1px 2px rgba(0,0,0,0.06);
            ">
                <h2 style="
                    font-family:var(--font-display,'Syne',sans-serif);
                    font-size:var(--text-lg,1.05rem); font-weight:900;
                    color:${c.title}; margin:0 ${isCollapsed ? '' : '0 1rem'};
                    display:flex; align-items:center; gap:0.5rem; cursor:pointer;
                    user-select:none;
                " onclick="Dashboard._toggleSection('${collapseKey}','${sectionId}',this)">
                    <span>${icon}</span>
                    <span style="flex:1;">${title}</span>
                    <span id="dash-chevron-${sectionId}" style="
                        font-size:0.75rem; color:${c.muted};
                        transition:transform 0.2s;
                        transform:rotate(${isCollapsed ? '-90deg' : '0deg'});
                    ">▾</span>
                </h2>
                <div id="${sectionId}" style="
                    overflow:hidden;
                    transition:max-height 0.3s ease, opacity 0.3s ease;
                    max-height:${isCollapsed ? '0' : '2000px'};
                    opacity:${isCollapsed ? '0' : '1'};
                ">
                    <div style="padding-top:0.35rem;">${content}</div>
                </div>
            </div>`;
    },

    _toggleSection(key, sectionId, header) {
        const el      = document.getElementById(sectionId);
        const chevron = document.getElementById('dash-chevron-' + sectionId);
        if (!el) return;
        const isNowCollapsed = el.style.maxHeight !== '0px' && el.style.maxHeight !== '';
        const willCollapse   = isNowCollapsed || el.style.maxHeight === '2000px';
        if (willCollapse) {
            el.style.maxHeight = '0';
            el.style.opacity   = '0';
            if (chevron) chevron.style.transform = 'rotate(-90deg)';
            header.style.marginBottom = '0';
            Utils.saveData(key, true);
        } else {
            el.style.maxHeight = '2000px';
            el.style.opacity   = '1';
            if (chevron) chevron.style.transform = 'rotate(0deg)';
            header.style.marginBottom = '1rem';
            Utils.saveData(key, false);
        }
    },
    
    init() {
        this.loadStats();
        this.updateStats();
        setTimeout(() => this.hydratePersonalizedHome(), 50);
    },
    
    render() {
        this.loadStats();
        this.updateStats();
        
        return `
            <div class="max-w-6xl mx-auto" style="padding-bottom:0.75rem;">
                ${this.renderHeader()}
                ${this.renderQuickStats()}
                ${this.renderPersonalizedHome()}
                ${this.renderActivitySection()}
                ${this.renderProductivitySection()}
                ${this.renderToolsUsage()}
                ${this.renderGamesSection()}
            </div>
        `;
    },

    refreshWeeklyChart() {
        const chartContainer = document.getElementById('weekly-chart-container');
        if (!chartContainer) return;
        chartContainer.innerHTML = this.renderWeeklyChartInner();
    },
    
    renderHeader() {
        const greeting = this.getGreeting();
        const username = (window.App?.user?.username) || Utils.loadData('current_user') || 'Usuário';
        
        return `
            <div class="text-center mb-6">
                <div class="inline-flex items-center gap-3 mb-2">
                    <div class="text-5xl animate-bounce-slow">📊</div>
                    <h1 class="text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                        ${greeting}, ${username}!
                    </h1>
                </div>
                <p class="text-gray-600 text-lg">Veja como você está usando o NyanTools にゃん~</p>
            </div>
        `;
    },

    renderPersonalizedHome() {
        const c = this._colors();
        const lastRoute = Utils.loadData('last_tool_route');
        const lastRouteAt = Utils.loadData('last_tool_route_at');
        const lastTool = lastRoute ? this.getToolInfo(lastRoute) : null;
        const lastSeen = lastRouteAt ? this.formatLastAccess(lastRouteAt) : 'agora há pouco';

        const missions = window.Missions?.getDailyMissions?.() || [];
        const nextMission = missions.find(m => !m.completed) || null;
        const notes = (Utils.loadData('notes') || []).slice(0, 3);
        const shortcuts = this.getDynamicShortcuts(4);

        const notesHtml = notes.length
            ? notes.map(n => `
                <button onclick="Router.navigate('notes')" style="
                    width:100%;text-align:left;padding:0.5rem 0.625rem;border-radius:10px;border:1px solid ${c.innerBdr};
                    background:${c.inner};color:${c.text};font-size:0.75rem;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
                ">📝 ${(n.title || 'Sem título')}</button>
            `).join('')
            : `<div style="font-size:0.72rem;color:${c.sub};">Sem notas recentes</div>`;

        const shortcutsHtml = shortcuts.map(s => `
            <button onclick="Router.navigate('${s.id}')" style="
                padding:0.5rem 0.625rem;border-radius:10px;border:1px solid ${c.innerBdr};background:${c.inner};
                color:${c.text};font-size:0.72rem;font-weight:700;cursor:pointer;
            ">${s.icon} ${s.name}</button>
        `).join('');

        return this._section('🌍', 'Nyan Worlds · Home personalizada', `
            <div style="display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:0.75rem;">
                <div style="background:${c.inner};border:1px solid ${c.innerBdr};border-radius:12px;padding:0.9rem;">
                    <div style="font-size:0.64rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${c.muted};margin-bottom:0.45rem;">Continuar de onde parou</div>
                    ${lastTool
                        ? `<button onclick="Router.navigate('${lastRoute}')" style="width:100%;text-align:left;border:none;background:transparent;cursor:pointer;padding:0;">
                                <div style="font-size:0.9rem;font-weight:800;color:${c.title};">${lastTool.icon} ${lastTool.name}</div>
                                <div style="font-size:0.72rem;color:${c.sub};margin-top:0.15rem;">Último acesso ${lastSeen}</div>
                           </button>`
                        : `<div style="font-size:0.75rem;color:${c.sub};">Ainda sem histórico recente</div>`
                    }
                </div>

                <div style="background:${c.inner};border:1px solid ${c.innerBdr};border-radius:12px;padding:0.9rem;">
                    <div style="font-size:0.64rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${c.muted};margin-bottom:0.45rem;">Missão do dia</div>
                    ${nextMission
                        ? `<button onclick="Router.navigate('missions')" style="width:100%;text-align:left;border:none;background:transparent;cursor:pointer;padding:0;">
                                <div style="font-size:0.85rem;font-weight:700;color:${c.title};">${nextMission.icon} ${nextMission.title}</div>
                                <div style="font-size:0.72rem;color:${c.sub};margin-top:0.15rem;">${nextMission.desc}</div>
                           </button>`
                        : `<button onclick="Router.navigate('missions')" style="width:100%;text-align:left;border:none;background:transparent;cursor:pointer;padding:0;">
                                <div style="font-size:0.85rem;font-weight:700;color:#22c55e;">✅ Tudo concluído hoje</div>
                                <div style="font-size:0.72rem;color:${c.sub};margin-top:0.15rem;">Abra missões para ver o desafio semanal</div>
                           </button>`
                    }
                </div>

                <div style="background:${c.inner};border:1px solid ${c.innerBdr};border-radius:12px;padding:0.9rem;">
                    <div style="font-size:0.64rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${c.muted};margin-bottom:0.45rem;">Amigos online</div>
                    <div id="dash-online-count" style="font-size:0.9rem;font-weight:800;color:${c.title};">Carregando...</div>
                    <div id="dash-online-list" style="font-size:0.72rem;color:${c.sub};margin-top:0.2rem;">Buscando presença em tempo real</div>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-top:0.75rem;">
                <div style="background:${c.inner};border:1px solid ${c.innerBdr};border-radius:12px;padding:0.9rem;">
                    <div style="font-size:0.64rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${c.muted};margin-bottom:0.45rem;">Notas recentes</div>
                    <div style="display:flex;flex-direction:column;gap:0.45rem;">
                        ${notesHtml}
                    </div>
                </div>

                <div style="background:${c.inner};border:1px solid ${c.innerBdr};border-radius:12px;padding:0.9rem;">
                    <div style="font-size:0.64rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${c.muted};margin-bottom:0.45rem;">Atalhos dinâmicos</div>
                    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.45rem;">
                        ${shortcutsHtml}
                    </div>
                </div>
            </div>
        `);
    },

    getDynamicShortcuts(limit = 4) {
        const normalizedAccess = this.normalizeToolAccess();
        const topIds = Object.entries(normalizedAccess)
            .sort((a, b) => b[1] - a[1])
            .map(([id]) => id)
            .filter(id => id !== 'home' && id !== 'profile')
            .slice(0, limit);

        const fallback = ['notes', 'tasks', 'offline', 'missions'];
        const chosen = [...new Set([...topIds, ...fallback])].slice(0, limit);
        return chosen.map(id => ({ id, ...this.getToolInfo(id) }));
    },

    formatLastAccess(timestamp) {
        const diff = Date.now() - Number(timestamp || 0);
        if (diff < 60000) return 'agora';
        if (diff < 3600000) return `há ${Math.floor(diff / 60000)} min`;
        if (diff < 86400000) return `há ${Math.floor(diff / 3600000)}h`;
        return `há ${Math.floor(diff / 86400000)} dia(s)`;
    },

    async hydratePersonalizedHome() {
        const countEl = document.getElementById('dash-online-count');
        const listEl  = document.getElementById('dash-online-list');
        if (!countEl || !listEl) return;

        if (!window.NyanAuth?.isOnline?.() || !window.NyanFirebase?.isReady?.()) {
            countEl.textContent = 'Offline social';
            listEl.textContent = 'Conecte a conta online para ver presença dos amigos';
            return;
        }

        const uid = NyanAuth.getUID?.();
        if (!uid) return;

        try {
            const { query, collection, where, getDocs, ref, get } = NyanFirebase.fn;
            const fsSnap = await getDocs(
                query(collection(NyanFirebase.db, 'friendships'), where('users', 'array-contains', uid))
            );

            const friendUIDs = fsSnap.docs.map(d => {
                const users = d.data().users || [];
                return users.find(u => u !== uid);
            }).filter(Boolean);

            if (friendUIDs.length === 0) {
                countEl.textContent = '0 online';
                listEl.textContent = 'Adicione amigos para ativar esta seção';
                return;
            }

            const onlineUIDs = [];
            for (const fuid of friendUIDs) {
                const snap = await get(ref(NyanFirebase.rtdb, `presence/${fuid}`)).catch(() => null);
                const data = snap?.val?.();
                if (data?.online === true) onlineUIDs.push(fuid);
            }

            if (onlineUIDs.length === 0) {
                countEl.textContent = '0 online';
                listEl.textContent = `${friendUIDs.length} amigo(s) no total`;
                return;
            }

            const profiles = await Promise.all(onlineUIDs.slice(0, 3).map(fuid => NyanFirebase.getDoc(`users/${fuid}`)));
            const names = profiles.filter(Boolean).map(p => p.username).filter(Boolean);
            countEl.textContent = `${onlineUIDs.length} online`;
            listEl.textContent = names.length ? names.join(' · ') : 'Amigos online agora';
        } catch (_) {
            countEl.textContent = 'Indisponível';
            listEl.textContent = 'Não foi possível carregar presença agora';
        }
    },
    
    renderQuickStats() {
        const mostUsedTool = this.getMostUsedTool();
        const streakEmoji = this.stats.dailyStreak >= 7 ? '🔥' : this.stats.dailyStreak >= 3 ? '⭐' : '📅';
        const normalizedAccess = this.normalizeToolAccess();
        const toolCount = Object.keys(normalizedAccess).length;
        const totalTools = 12;
        
        return `
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                ${this.renderStatCard('⏱️', 'Tempo Total', this.formatTime(this.stats.totalTime), 'from-blue-500 to-cyan-600')}
                ${this.renderStatCard(streakEmoji, 'Sequência', `${this.stats.dailyStreak} dias`, 'from-orange-500 to-amber-600')}
                ${this.renderStatCard('🛠️', 'Mais Usado', mostUsedTool.name, 'from-purple-500 to-pink-600')}
                ${this.renderStatCard('🎯', 'Ferramentas', `${toolCount}/${totalTools}`, 'from-green-500 to-emerald-600')}
            </div>
        `;
    },
    
    renderStatCard(icon, label, value, gradient) {
        return `
            <div style="
                background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));
                border-radius:var(--radius-lg,14px); padding:1.25rem;
                color:white; cursor:default;
                transition:transform var(--transition-base,0.2s), box-shadow var(--transition-base,0.2s);
                box-shadow:0 4px 14px var(--theme-shadow,rgba(168,85,247,0.25));
            "
            onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 24px var(--theme-shadow,rgba(168,85,247,0.35))'"
            onmouseout="this.style.transform='';this.style.boxShadow='0 4px 14px var(--theme-shadow,rgba(168,85,247,0.25))'">
                <div style="font-size:1.75rem;margin-bottom:0.5rem;line-height:1;">${icon}</div>
                <div style="font-size:var(--text-xs,0.68rem);font-weight:var(--weight-bold,700);opacity:0.8;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.25rem;">${label}</div>
                <div style="font-size:1.35rem;font-weight:var(--weight-black,900);font-family:var(--font-display,'Syne',sans-serif);line-height:1;">${value}</div>
            </div>
        `;
    },
    
    renderActivitySection() {
        return this._section('📅', 'Atividade Semanal', `
            <div id="weekly-chart-container">
                ${this.renderWeeklyChartInner()}
            </div>
            ${this.renderActivityCalendar()}
        `);
    },

    renderWeeklyChartInner() {
        const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const today = new Date();
        const currentDay = today.getDay();

        const weeklyUsage = [0, 0, 0, 0, 0, 0, 0];
        Object.keys(this.stats.weeklyActivity).forEach(key => {
            const dayIndex = parseInt(key);
            if (dayIndex >= 0 && dayIndex <= 6) {
                weeklyUsage[dayIndex] = this.stats.weeklyActivity[key] || 0;
            }
        });

        const maxUsage = Math.max(...weeklyUsage, 1);
        const totalWeek = weeklyUsage.reduce((a, b) => a + b, 0);

        const bars = weekDays.map((day, index) => {
            const usage = weeklyUsage[index];
            const isToday = currentDay === index;
            const hasData = usage > 0;

            const heightPct = hasData ? Math.max((usage / maxUsage) * 100, 8) : 3;

            let barBg, barOpacity;
            if (isToday && hasData) {
                barBg = 'linear-gradient(to top, #a855f7, #ec4899)';
                barOpacity = '1';
            } else if (isToday) {
                barBg = 'linear-gradient(to top, #a855f7, #ec4899)';
                barOpacity = '0.25';
            } else if (hasData) {
                barBg = 'linear-gradient(to top, rgba(168,85,247,0.7), rgba(236,72,153,0.7))';
                barOpacity = '1';
            } else {
                barBg = 'rgba(255,255,255,0.08)';
                barOpacity = '1';
            }

            const timeLabel = hasData
                ? `<div style="font-size:10px;font-weight:700;color:#d1d5db;margin-bottom:4px;text-align:center;">${this.formatTime(usage)}</div>`
                : '';

            const dayColor = isToday ? '#a855f7' : '#9ca3af';
            const dotStyle = isToday ? `<div style="width:5px;height:5px;border-radius:50%;background:#a855f7;margin:3px auto 0;"></div>` : '';

            return `
                <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;">
                    ${timeLabel}
                    <div style="width:100%;height:${heightPct}%;background:${barBg};opacity:${barOpacity};border-radius:6px 6px 0 0;transition:all 0.3s;"
                         onmouseenter="this.style.opacity='0.75'"
                         onmouseleave="this.style.opacity='${barOpacity}'"
                         title="${day}: ${this.formatTime(usage)}">
                    </div>
                    <div style="margin-top:8px;font-size:12px;font-weight:700;color:${dayColor};text-align:center;">
                        ${day}${dotStyle}
                    </div>
                </div>`;
        }).join('');

        const totalLabel = totalWeek > 0
            ? `<div style="text-align:center;font-size:12px;font-weight:600;color:#9ca3af;margin-top:10px;">Total esta semana: <span style="color:#c084fc;font-weight:800;">${this.formatTime(totalWeek)}</span></div>`
            : `<div style="text-align:center;font-size:12px;color:#6b7280;margin-top:10px;">Nenhuma atividade esta semana</div>`;

        return `
            <div style="margin-bottom:24px;">
                <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:8px;height:180px;">
                    ${bars}
                </div>
                ${totalLabel}
            </div>
        `;
    },
    
    renderActivityCalendar() {
        const today = new Date();
        const year  = today.getFullYear();
        const month = today.getMonth(); // 0-indexed
        const DAYS_LABEL = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

        const isDark = document.body.classList.contains('dark-theme');
        const c = isDark ? {
            border:      'rgba(255,255,255,0.07)',
            title:       '#e5e7eb',
            label:       '#9ca3af',
            badge_bg:    'rgba(168,85,247,0.2)',
            badge_color: '#c084fc',
            badge_bdr:   'rgba(168,85,247,0.3)',
            cell_empty:  'rgba(255,255,255,0.06)',
            cell_border: '1px solid rgba(255,255,255,0.1)',
            cell_future: 'rgba(255,255,255,0.03)',
        } : {
            border:      'rgba(0,0,0,0.07)',
            title:       '#374151',
            label:       '#6b7280',
            badge_bg:    'rgba(168,85,247,0.12)',
            badge_color: '#7c3aed',
            badge_bdr:   'rgba(168,85,247,0.25)',
            cell_empty:  '#e2e8f0',
            cell_border: '1px solid #cbd5e1',
            cell_future: '#f1f5f9',
        };

        const daysInMonth  = new Date(year, month + 1, 0).getDate();
        const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Dom
        const monthName = today.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        const totalCells = firstDayOfWeek + daysInMonth;
        const totalRows  = Math.ceil(totalCells / 7);

        let activeDays = 0;
        for (let d = 1; d <= daysInMonth; d++) {
            const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            if ((this.stats.dailyActivity?.[key] || 0) > 0) activeDays++;
        }

        const weekDayHeaders = DAYS_LABEL.map(l =>
            `<div style="text-align:center;font-size:11px;font-weight:700;color:${c.label};width:28px;">${l}</div>`
        ).join('');

        const rows = [];
        for (let row = 0; row < totalRows; row++) {
            const cells = [];
            for (let col = 0; col < 7; col++) {
                const cellIndex = row * 7 + col;
                const dayNum = cellIndex - firstDayOfWeek + 1;

                if (dayNum < 1 || dayNum > daysInMonth) {
                    cells.push(`<div style="width:28px;height:28px;"></div>`);
                    continue;
                }

                const dateKey  = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const cellDate = new Date(year, month, dayNum);
                const mins     = this.stats.dailyActivity?.[dateKey] || 0;
                const hasActivity = mins > 0;
                const isToday  = dayNum === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                const isFuture = cellDate > today;

                let bg, ring = '', opacity = '';
                if (isFuture) {
                    bg      = `background:${c.cell_future};`;
                    opacity = 'opacity:0.35;';
                } else if (isToday && hasActivity) {
                    bg   = 'background:linear-gradient(135deg,#a855f7,#ec4899);';
                    ring = 'outline:2.5px solid #ec4899;outline-offset:2px;';
                } else if (isToday) {
                    bg   = 'background:rgba(168,85,247,0.2);';
                    ring = 'outline:2.5px solid #a855f7;outline-offset:2px;';
                } else if (hasActivity) {
                    const intensity = Math.min(mins / 120, 1);
                    const alpha = 0.4 + intensity * 0.55;
                    bg = `background:rgba(34,197,94,${alpha.toFixed(2)});`;
                } else {
                    bg = `background:${c.cell_empty};`;
                }

                const borderStyle = (!hasActivity && !isToday && !isFuture) ? `border:${c.cell_border};` : '';
                const titleDate   = cellDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
                const titleMsg    = isFuture
                    ? titleDate
                    : hasActivity
                        ? `${titleDate} • ${this.formatTime(mins)}`
                        : `${titleDate} • sem atividade`;
                const numColor = isToday
                    ? 'white'
                    : hasActivity
                        ? 'rgba(255,255,255,0.9)'
                        : isDark ? 'rgba(255,255,255,0.4)' : '#64748b';
                const dayLabel = `<span style="font-size:8px;font-weight:700;color:${numColor};line-height:1;">${dayNum}</span>`;

                cells.push(`
                    <div style="width:28px;height:28px;border-radius:6px;${bg}${ring}${opacity}${borderStyle}
                                cursor:pointer;transition:transform 0.15s;position:relative;
                                display:flex;align-items:flex-start;justify-content:flex-end;padding:2px 3px;"
                         onmouseenter="this.style.transform='scale(1.25)'"
                         onmouseleave="this.style.transform='scale(1)'"
                         title="${titleMsg}">${isFuture ? '' : dayLabel}</div>
                `);
            }
            rows.push(`<div style="display:flex;gap:4px;">${cells.join('')}</div>`);
        }

        return `
            <div style="margin-top:24px;padding-top:20px;border-top:1px solid ${c.border}">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px;">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <span style="font-size:15px;font-weight:900;color:${c.title};letter-spacing:0.04em;">HISTÓRICO DE USO</span>
                        <span style="font-size:11px;font-weight:600;background:${c.badge_bg};color:${c.badge_color};padding:3px 10px;border-radius:20px;border:1px solid ${c.badge_bdr};text-transform:capitalize;">${monthName}</span>
                    </div>
                    <div style="display:flex;gap:20px;">
                        <div style="text-align:center;">
                            <div style="font-size:18px;font-weight:900;color:#a855f7;">${activeDays}</div>
                            <div style="font-size:10px;color:${c.label};font-weight:600;">DIAS ATIVOS</div>
                        </div>
                        <div style="text-align:center;">
                            <div style="font-size:18px;font-weight:900;color:#ec4899;">${this.stats.dailyStreak}</div>
                            <div style="font-size:10px;color:${c.label};font-weight:600;">SEQUÊNCIA</div>
                        </div>
                    </div>
                </div>

                <div style="display:flex;gap:4px;margin-bottom:4px;">
                    ${weekDayHeaders}
                </div>

                <div style="display:flex;flex-direction:column;gap:4px;">
                    ${rows.join('')}
                </div>

                <div style="display:flex;align-items:center;gap:16px;margin-top:12px;flex-wrap:wrap;">
                    <div style="display:flex;align-items:center;gap:5px;">
                        <div style="width:11px;height:11px;border-radius:3px;background:${c.cell_empty};border:${c.cell_border}"></div>
                        <span style="font-size:11px;color:${c.label};">Sem uso</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:5px;">
                        <div style="width:11px;height:11px;border-radius:3px;background:rgba(34,197,94,0.5);"></div>
                        <span style="font-size:11px;color:${c.label};">&lt; 30 min</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:5px;">
                        <div style="width:11px;height:11px;border-radius:3px;background:rgba(34,197,94,0.95);"></div>
                        <span style="font-size:11px;color:${c.label};">≥ 2h</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:5px;">
                        <div style="width:11px;height:11px;border-radius:3px;background:linear-gradient(135deg,#a855f7,#ec4899);"></div>
                        <span style="font-size:11px;color:${c.label};">Hoje</span>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderToolsUsage() {
        const normalizedAccess = this.normalizeToolAccess();
        const tools = Object.entries(normalizedAccess)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        const c = this._colors();

        const emptyContent = `
            <div style="text-align:center;padding:2rem 0;color:${c.muted};">
                <div style="font-size:2.5rem;margin-bottom:0.75rem;opacity:0.5;">📊</div>
                <p style="font-size:var(--text-sm,0.78rem);font-family:var(--font-body,'DM Sans',sans-serif);">Use as ferramentas para ver estatísticas aqui!</p>
            </div>`;

        if (tools.length === 0) return this._section('🛠️', 'Ferramentas Mais Usadas', emptyContent);

        const maxUsage = tools[0]?.[1] || 1;
        const rows = tools.map(([tool, count], index) => {
            const percentage = (count / maxUsage) * 100;
            const toolInfo   = this.getToolInfo(tool);
            return `
                <div style="margin-bottom:0.75rem;">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.3rem;">
                        <div style="display:flex;align-items:center;gap:0.5rem;">
                            <span style="font-size:1.1rem;">${toolInfo.icon}</span>
                            <span style="font-size:var(--text-base,0.875rem);font-weight:var(--weight-semibold,600);color:${c.title};font-family:var(--font-body,'DM Sans',sans-serif);">${toolInfo.name}</span>
                            ${index === 0 ? `<span style="font-size:0.65rem;font-weight:700;background:rgba(234,179,8,0.15);color:#ca8a04;border:1px solid rgba(234,179,8,0.3);padding:1px 7px;border-radius:99px;">🥇 Top</span>` : ''}
                        </div>
                        <span style="font-size:var(--text-xs,0.68rem);font-weight:700;color:${c.muted};">${count} ${count === 1 ? 'acesso' : 'acessos'}</span>
                    </div>
                    <div style="height:6px;background:${c.inner};border-radius:99px;overflow:hidden;">
                        <div style="height:100%;width:${percentage}%;background:linear-gradient(90deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));border-radius:99px;transition:width 0.5s ease;"></div>
                    </div>
                </div>`;
        }).join('');

        return this._section('🛠️', 'Ferramentas Mais Usadas', `<div>${rows}</div>`);
    },
    
    normalizeToolAccess() {
        const normalized = {};
        const idMap = {
            'password': 'password',
            'password-generator': 'password',
            'ai-assistant': 'ai-assistant',
            'ai-chat': 'ai-assistant',
            'mini-game': 'mini-game',
            'temp-email': 'temp-email',
            'music': 'music',
            'music-player': 'music',
            'offline': 'offline',
            'offline-zone': 'offline'
        };
        
        Object.entries(this.stats.toolAccess).forEach(([toolId, count]) => {
            const normalizedId = idMap[toolId] || toolId;
            if (!normalized[normalizedId]) normalized[normalizedId] = 0;
            normalized[normalizedId] += count;
        });
        
        const EXCLUDE = [
            'home', 'dashboard', 'settings', 'updates',
            'friends', 'chat', 'leaderboard', 'feed', 'challenges',
            'profile', 'profile-public', 'offline'
        ];
        EXCLUDE.forEach(k => delete normalized[k]);

        return normalized;
    },
    
    renderGamesSection() {
        const games = [
            { id: 'snake',     name: 'Cobrinha',    icon: '🐍', key: 'snake_highscore' },
            { id: 'termo',     name: 'Termo',        icon: '🔤', key: 'termo_best' },
            { id: '2048',      name: '2048',         icon: '🔢', key: 'game_2048_highscore' },
            { id: 'flappy',    name: 'Flappy Nyan',  icon: '🐱', key: 'flappy_bird_highscore' },
            { id: 'typeracer', name: 'Type Racer',   icon: '⌨️', key: 'typeracer_highscore' },
            { id: 'quiz',      name: 'Quiz Diário',  icon: '🧠', key: 'quiz_highscore' },
        ];
        
        return this._section('🎮', 'Recordes dos Jogos', `
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.75rem;">
                ${games.map(game => {
                    const c = this._colors();
                    const score        = Utils.loadData(game.key);
                    const displayScore = this.formatGameScore(game.id, score);
                    const hasScore     = score && displayScore !== '---';
                    const subtitles    = { snake:'Maior pontuação', termo:'Melhor tentativa', '2048':'Maior pontuação', flappy:'Maior distância', typeracer:'Maior WPM', quiz:'Maior pontuação', slot:'Maior saldo' };

                    return `
                        <div style="
                            background:${c.inner}; border:1px solid ${c.innerBdr};
                            border-radius:var(--radius-lg,14px); padding:1rem;
                            text-align:center; cursor:pointer;
                            transition:transform var(--transition-base,0.2s),box-shadow var(--transition-base,0.2s);
                        "
                        onclick="Router.navigate('offline')"
                        onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 18px rgba(0,0,0,0.1)'"
                        onmouseout="this.style.transform='';this.style.boxShadow=''">
                            <div style="font-size:1.75rem;margin-bottom:0.4rem;">${game.icon}</div>
                            <div style="font-size:var(--text-xs,0.68rem);font-weight:700;color:${c.sub};margin-bottom:0.3rem;">${game.name}</div>
                            <div style="font-size:1.15rem;font-weight:900;font-family:var(--font-display,'Syne',sans-serif);color:${hasScore ? 'var(--theme-primary,#a855f7)' : c.muted};">${displayScore}</div>
                            <div style="font-size:0.6rem;color:${c.muted};margin-top:2px;">${hasScore ? subtitles[game.id] || 'Recorde' : 'Ainda não jogou'}</div>
                        </div>`;
                }).join('')}
            </div>
        `);
    },

    renderProductivitySection() {
        return `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:1.25rem;">
                ${this.renderNotesCard()}
                ${this.renderTasksCard()}
            </div>
        `;
    },

    renderNotesCard() {
        const notes = Utils.loadData('notes') || [];
        this.stats.notesStats.total  = notes.length;
        this.stats.notesStats.pinned = notes.filter(n => n.pinned).length;
        const c = this._colors();

        return this._section('📝', 'Notas Rápidas', `
            <div style="display:flex;flex-direction:column;gap:0.625rem;">
                <div style="display:flex;align-items:center;justify-content:space-between;padding:0.625rem 0.75rem;background:${c.inner};border-radius:var(--radius-md,10px);">
                    <span style="font-size:var(--text-sm,0.78rem);font-weight:600;color:${c.text};">Total de notas</span>
                    <span style="font-size:1.2rem;font-weight:900;font-family:var(--font-display,'Syne',sans-serif);color:var(--theme-primary,#a855f7);">${this.stats.notesStats.total}</span>
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;padding:0.625rem 0.75rem;background:${c.inner};border-radius:var(--radius-md,10px);">
                    <span style="font-size:var(--text-sm,0.78rem);font-weight:600;color:${c.text};">📌 Fixadas</span>
                    <span style="font-size:1.1rem;font-weight:800;color:var(--theme-secondary,#ec4899);">${this.stats.notesStats.pinned}</span>
                </div>
                <button onclick="Router.navigate('notes')"
                    style="width:100%;padding:0.625rem;border-radius:var(--radius-md,10px);border:none;cursor:pointer;font-weight:700;font-size:var(--text-sm,0.78rem);font-family:var(--font-body,'DM Sans',sans-serif);background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));color:white;margin-top:0.25rem;transition:filter 0.15s;"
                    onmouseover="this.style.filter='brightness(1.1)'" onmouseout="this.style.filter=''">
                    Ver todas as notas →
                </button>
            </div>
        `, false);
    },

    renderTasksCard() {
        const tasks = Utils.loadData('tasks') || [];
        this.stats.tasksStats.total     = tasks.length;
        this.stats.tasksStats.completed = tasks.filter(t => t.completed).length;
        const completionRate = this.stats.tasksStats.total > 0
            ? Math.round((this.stats.tasksStats.completed / this.stats.tasksStats.total) * 100)
            : 0;
        const c = this._colors();

        return this._section('✅', 'Tarefas', `
            <div style="display:flex;flex-direction:column;gap:0.625rem;">
                <div style="display:flex;align-items:center;justify-content:space-between;padding:0.625rem 0.75rem;background:${c.inner};border-radius:var(--radius-md,10px);">
                    <span style="font-size:var(--text-sm,0.78rem);font-weight:600;color:${c.text};">Total de tarefas</span>
                    <span style="font-size:1.2rem;font-weight:900;font-family:var(--font-display,'Syne',sans-serif);color:var(--theme-primary,#a855f7);">${this.stats.tasksStats.total}</span>
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;padding:0.625rem 0.75rem;background:${c.inner};border-radius:var(--radius-md,10px);">
                    <span style="font-size:var(--text-sm,0.78rem);font-weight:600;color:${c.text};">✓ Concluídas</span>
                    <span style="font-size:1.1rem;font-weight:800;color:var(--theme-secondary,#ec4899);">${this.stats.tasksStats.completed}</span>
                </div>
                <div style="padding:0 0.25rem;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:0.35rem;">
                        <span style="font-size:var(--text-xs,0.68rem);font-weight:600;color:${c.sub};">Progresso</span>
                        <span style="font-size:var(--text-xs,0.68rem);font-weight:700;color:var(--theme-primary,#a855f7);">${completionRate}%</span>
                    </div>
                    <div style="height:5px;background:${c.inner};border-radius:99px;overflow:hidden;">
                        <div style="height:100%;width:${completionRate}%;background:linear-gradient(90deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));border-radius:99px;transition:width 0.5s;"></div>
                    </div>
                </div>
                <button onclick="Router.navigate('tasks')"
                    style="width:100%;padding:0.625rem;border-radius:var(--radius-md,10px);border:none;cursor:pointer;font-weight:700;font-size:var(--text-sm,0.78rem);font-family:var(--font-body,'DM Sans',sans-serif);background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));color:white;margin-top:0.25rem;transition:filter 0.15s;"
                    onmouseover="this.style.filter='brightness(1.1)'" onmouseout="this.style.filter=''">
                    Ver todas as tarefas →
                </button>
            </div>
        `, false);
    },

    getWeekStart() {
        const today = new Date();
        const sunday = new Date(today);
        sunday.setDate(today.getDate() - today.getDay());
        return sunday.toISOString().split('T')[0];
    },
    
    getGreeting() {
        const hour = new Date().getHours();
        if (hour >= 0  && hour < 6)  return '🌙 Boa madrugada';
        if (hour >= 6  && hour < 12) return '☀️ Bom dia';
        if (hour >= 12 && hour < 18) return '🌤️ Boa tarde';
        return '🌙 Boa noite';
    },
    
    formatTime(minutes) {
        if (minutes < 60) return `${Math.round(minutes)}min`;
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return `${hours}h ${mins}min`;
    },
    
    getMostUsedTool() {
        const normalizedAccess = this.normalizeToolAccess();
        const entries = Object.entries(normalizedAccess);
        if (entries.length === 0) return { name: 'Nenhum', count: 0 };
        
        const [toolId, count] = entries.reduce((a, b) => a[1] > b[1] ? a : b);
        const toolInfo = this.getToolInfo(toolId);
        return { name: toolInfo.name, count };
    },
    
    getToolInfo(toolId) {
        const tools = {
            'password': { name: 'Gerador de Senhas', icon: '🔑', gradient: 'from-blue-500 to-cyan-600' },
            'weather': { name: 'Clima', icon: '🌤️', gradient: 'from-blue-400 to-sky-500' },
            'translator': { name: 'Tradutor', icon: '🌍', gradient: 'from-green-500 to-teal-600' },
            'ai-assistant': { name: 'Assistente IA', icon: '🤖', gradient: 'from-purple-500 to-pink-600' },
            'mini-game': { name: 'Mini Game', icon: '🐍', gradient: 'from-green-600 to-emerald-700' },
            'temp-email': { name: 'Email Temporário', icon: '📧', gradient: 'from-indigo-500 to-purple-600' },
            'music': { name: 'Player de Música', icon: '🎵', gradient: 'from-pink-500 to-rose-600' },
            'offline': { name: 'Zona Offline', icon: '📶', gradient: 'from-gray-600 to-slate-700' },
            'notes': { name: 'Notas Rápidas', icon: '📝', gradient: 'from-yellow-500 to-orange-600' },
            'tasks': { name: 'Tarefas', icon: '✅', gradient: 'from-green-500 to-emerald-600' },
            'settings': { name: 'Configurações', icon: '⚙️', gradient: 'from-gray-500 to-slate-600' },
            'updates': { name: 'Atualizações', icon: '🔄', gradient: 'from-blue-500 to-indigo-600' }
        };
        return tools[toolId] || { name: toolId, icon: '🛠️', gradient: 'from-gray-400 to-gray-600' };
    },
    
    formatGameScore(gameId, score) {
        if (score === null || score === undefined) return '---';
        if (gameId === 'termo') {
            return (typeof score === 'number' && score > 0) ? `${score}/6` : '---';
        }
        if (gameId === '2048') {
            return (typeof score === 'number' && score > 0) ? score.toLocaleString('pt-BR') : '---';
        }
        if (gameId === 'typeracer') {
            return (typeof score === 'number' && score > 0) ? `${score} WPM` : '---';
        }
        if (gameId === 'quiz') {
            return (typeof score === 'number' && score > 0) ? `${score}/10` : '---';
        }
        if (gameId === 'slot') {
            return (typeof score === 'number' && score > 0) ? score.toLocaleString('pt-BR') : '---';
        }
        if (!score) return '---';
        return score.toString();
    },
    
    loadStats() {
        this.stats = Utils.loadData('dashboard_stats') || {
            totalTime: 0,
            toolAccess: {},
            dailyStreak: 0,
            lastAccessDate: null,
            gameHighscores: {},
            notesStats: { total: 0, pinned: 0 },
            tasksStats: { total: 0, completed: 0 },
            weeklyActivity: {},
            weeklyHistory: {},
            currentWeekStart: null,
            dailyActivity: {}
        };

        if (!this.stats.dailyActivity)    this.stats.dailyActivity = {};
        if (!this.stats.weeklyHistory)    this.stats.weeklyHistory = {};
        if (!this.stats.currentWeekStart) this.stats.currentWeekStart = null;
    },
    
    saveStats() {
        Utils.saveData('dashboard_stats', this.stats);
    },
    
    updateStats() {
        const today = new Date().toISOString().split('T')[0];
        const weekStart = this.getWeekStart();

        if (this.stats.currentWeekStart !== weekStart) {
            const hadData = Object.values(this.stats.weeklyActivity).some(v => v > 0);
            if (this.stats.currentWeekStart && hadData) {
                if (!this.stats.weeklyHistory) this.stats.weeklyHistory = {};
                this.stats.weeklyHistory[this.stats.currentWeekStart] = { ...this.stats.weeklyActivity };
                const histKeys = Object.keys(this.stats.weeklyHistory).sort();
                while (histKeys.length > 52) delete this.stats.weeklyHistory[histKeys.shift()];
            }
            this.stats.weeklyActivity = {};
            this.stats.currentWeekStart = weekStart;
        }

        if (this.stats.dailyActivity) {
            const rebuilt = {};
            const ws = new Date(weekStart + 'T00:00:00');
            for (let i = 0; i < 7; i++) {
                const d = new Date(ws);
                d.setDate(ws.getDate() + i);
                const key = d.toISOString().split('T')[0];
                const mins = this.stats.dailyActivity[key] || 0;
                if (mins > 0) rebuilt[i] = mins;
            }
            this.stats.weeklyActivity = rebuilt;
        }

        if (this.stats.lastAccessDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            if (this.stats.lastAccessDate === yesterdayStr) {
                this.stats.dailyStreak++;
            } else if (this.stats.lastAccessDate !== today) {
                this.stats.dailyStreak = 1;
            }
            this.stats.lastAccessDate = today;
        }

        if (!this.stats.dailyActivity) this.stats.dailyActivity = {};
        if (!this.stats.dailyActivity[today]) {
            this.stats.dailyActivity[today] = 1;
        }

        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 365);
        Object.keys(this.stats.dailyActivity).forEach(key => {
            if (new Date(key) < cutoff) delete this.stats.dailyActivity[key];
        });

        this.saveStats();
    },
    
    trackToolAccess(toolId) {
        if (!this.stats.toolAccess[toolId]) this.stats.toolAccess[toolId] = 0;
        this.stats.toolAccess[toolId]++;
        this.saveStats();
    },

    saveTermoBestScore(attempts) {
        if (!attempts || attempts < 1 || attempts > 6) return;
        const current = Utils.loadData('termo_best');
        if (!current || attempts < current) Utils.saveData('termo_best', attempts);
    },

    save2048Highscore(score) {
        if (!score || score <= 0) return;
        const current = Utils.loadData('game_2048_highscore') || 0;
        if (score > current) Utils.saveData('game_2048_highscore', score);
    }
};
