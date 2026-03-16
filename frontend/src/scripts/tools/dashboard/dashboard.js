// Dashboard - Estatísticas de Uso にゃん~ v3.0.1 
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
    
    init() {
        this.loadStats();
        this.updateStats();
        console.log('📊 Dashboard inicializado com sucesso!');
    },
    
    render() {
        this.loadStats();
        this.updateStats();
        
        return `
            <div class="max-w-7xl mx-auto">
                ${this.renderHeader()}
                ${this.renderQuickStats()}
                ${this.renderActivitySection()}
                ${this.renderToolsUsage()}
                ${this.renderGamesSection()}
                ${this.renderProductivitySection()}
            </div>
        `;
    },

    // ─── LIVE REFRESH ──────────────────────────────────────────────────────────
    // Chamado pelo app.js a cada minuto quando o usuário está na aba Dashboard.
    // Atualiza apenas o gráfico semanal no DOM, sem re-renderizar a página toda.
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
            <div class="bg-gradient-to-br ${gradient} rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
                <div class="text-4xl mb-2">${icon}</div>
                <div class="text-sm font-semibold opacity-90 mb-1">${label}</div>
                <div class="text-2xl font-black">${value}</div>
            </div>
        `;
    },
    
    renderActivitySection() {
        return `
            <div class="bg-white rounded-2xl shadow-xl p-6 mb-6">
                <h2 class="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                    <span>📅</span>
                    <span>Atividade Semanal</span>
                </h2>
                <div id="weekly-chart-container">
                    ${this.renderWeeklyChartInner()}
                </div>
                ${this.renderActivityCalendar()}
            </div>
        `;
    },

    // O HTML real do gráfico — separado para poder ser trocado no DOM pelo refreshWeeklyChart()
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

        // Calcular dias do mês
        const daysInMonth  = new Date(year, month + 1, 0).getDate();
        const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Dom
        const monthName = today.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

        // Construir grade: células vazias antes do dia 1 + dias do mês
        // Grade organizada em semanas (linhas), cada semana = 7 colunas
        const totalCells = firstDayOfWeek + daysInMonth;
        const totalRows  = Math.ceil(totalCells / 7);

        // Contar dias ativos no mês
        let activeDays = 0;
        for (let d = 1; d <= daysInMonth; d++) {
            const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            if ((this.stats.dailyActivity?.[key] || 0) > 0) activeDays++;
        }

        // Headers dos dias da semana
        const weekDayHeaders = DAYS_LABEL.map(l =>
            `<div style="text-align:center;font-size:11px;font-weight:700;color:${c.label};width:28px;">${l}</div>`
        ).join('');

        // Construir linhas da grade
        const rows = [];
        for (let row = 0; row < totalRows; row++) {
            const cells = [];
            for (let col = 0; col < 7; col++) {
                const cellIndex = row * 7 + col;
                const dayNum = cellIndex - firstDayOfWeek + 1;

                if (dayNum < 1 || dayNum > daysInMonth) {
                    // Célula vazia (fora do mês)
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
                    // Intensidade baseada em tempo: verde claro (<30min) → verde forte (≥120min)
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

                // Número do dia pequeno dentro da célula
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
        
        if (tools.length === 0) {
            return `
                <div class="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <h2 class="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                        <span>🛠️</span>
                        <span>Ferramentas Mais Usadas</span>
                    </h2>
                    <div class="text-center py-8 text-gray-500">
                        <div class="text-6xl mb-4">📊</div>
                        <p>Use as ferramentas para ver estatísticas aqui!</p>
                    </div>
                </div>
            `;
        }
        
        const maxUsage = tools[0]?.[1] || 1;
        
        return `
            <div class="bg-white rounded-2xl shadow-xl p-6 mb-6">
                <h2 class="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                    <span>🛠️</span>
                    <span>Ferramentas Mais Usadas</span>
                </h2>
                <div class="space-y-3">
                    ${tools.map(([tool, count], index) => {
                        const percentage = (count / maxUsage) * 100;
                        const toolInfo = this.getToolInfo(tool);
                        
                        return `
                            <div class="group">
                                <div class="flex items-center justify-between mb-1">
                                    <div class="flex items-center gap-2">
                                        <span class="text-xl">${toolInfo.icon}</span>
                                        <span class="font-bold text-gray-800">${toolInfo.name}</span>
                                        ${index === 0 ? '<span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-bold">🥇 Top</span>' : ''}
                                    </div>
                                    <span class="text-sm font-bold text-gray-600">${count} ${count === 1 ? 'acesso' : 'acessos'}</span>
                                </div>
                                <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div class="h-full bg-gradient-to-r ${toolInfo.gradient} rounded-full transition-all duration-500 group-hover:opacity-80"
                                         style="width: ${percentage}%">
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
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
        
        delete normalized.home;
        delete normalized.dashboard;
        delete normalized.settings;
        delete normalized.updates;

        return normalized;
    },
    
    renderGamesSection() {
        const games = [
            { id: 'snake', name: 'Cobrinha', icon: '🐍', key: 'snake_highscore' },
            { id: 'termo', name: 'Termo', icon: '🔤', key: 'termo_best' },
            { id: '2048', name: '2048', icon: '🔢', key: 'game_2048_highscore' },
            { id: 'flappy', name: 'Flappy Nyan', icon: '🐱', key: 'flappy_bird_highscore' }
        ];
        
        return `
            <div class="bg-white rounded-2xl shadow-xl p-6 mb-6">
                <h2 class="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                    <span>🎮</span>
                    <span>Recordes dos Jogos</span>
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    ${games.map(game => {
                        const score = Utils.loadData(game.key);
                        const displayScore = this.formatGameScore(game.id, score);
                        const hasScore = score && displayScore !== '---';
                        
                        const subtitles = {
                            'snake': 'Maior pontuação',
                            'termo': 'Melhor tentativa',
                            '2048': 'Maior pontuação',
                            'flappy': 'Maior distância'
                        };
                        const subtitle = subtitles[game.id] || 'Recorde pessoal';

                        return `
                            <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 text-center hover:shadow-lg transition-all">
                                <div class="text-4xl mb-2">${game.icon}</div>
                                <div class="font-bold text-gray-800 mb-1">${game.name}</div>
                                <div class="text-2xl font-black ${hasScore ? 'text-purple-600' : 'text-gray-400'}">${displayScore}</div>
                                ${hasScore ? `<div class="text-xs text-gray-500 mt-1">${subtitle}</div>` : '<div class="text-xs text-gray-400 mt-1">Ainda não jogou</div>'}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },
    
    renderProductivitySection() {
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${this.renderNotesCard()}
                ${this.renderTasksCard()}
            </div>
        `;
    },
    
    renderNotesCard() {
        const notes = Utils.loadData('notes') || [];
        this.stats.notesStats.total = notes.length;
        this.stats.notesStats.pinned = notes.filter(n => n.pinned).length;
        
        return `
            <div class="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-xl p-6 border-2 border-yellow-200">
                <h2 class="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
                    <span>📝</span>
                    <span>Notas Rápidas</span>
                </h2>
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-gray-700 font-semibold">Total de notas</span>
                        <span class="text-2xl font-black text-orange-600">${this.stats.notesStats.total}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-700 font-semibold">📌 Fixadas</span>
                        <span class="text-xl font-bold text-orange-500">${this.stats.notesStats.pinned}</span>
                    </div>
                    <button onclick="Router.navigate('notes')" 
                            class="w-full mt-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all">
                        Ver todas as notas →
                    </button>
                </div>
            </div>
        `;
    },
    
    renderTasksCard() {
        const tasks = Utils.loadData('tasks') || [];
        this.stats.tasksStats.total = tasks.length;
        this.stats.tasksStats.completed = tasks.filter(t => t.completed).length;
        const completionRate = this.stats.tasksStats.total > 0 
            ? Math.round((this.stats.tasksStats.completed / this.stats.tasksStats.total) * 100) 
            : 0;
        
        return `
            <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl p-6 border-2 border-green-200">
                <h2 class="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
                    <span>✅</span>
                    <span>Tarefas</span>
                </h2>
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-gray-700 font-semibold">Total de tarefas</span>
                        <span class="text-2xl font-black text-green-600">${this.stats.tasksStats.total}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-700 font-semibold">✓ Concluídas</span>
                        <span class="text-xl font-bold text-green-500">${this.stats.tasksStats.completed}</span>
                    </div>
                    <div>
                        <div class="flex items-center justify-between text-sm mb-1">
                            <span class="text-gray-600 font-semibold">Progresso</span>
                            <span class="text-green-600 font-bold">${completionRate}%</span>
                        </div>
                        <div class="h-3 rounded-full overflow-hidden" style="background: rgba(255,255,255,0.12);">
                            <div class="h-full rounded-full transition-all"
                                 style="width: ${completionRate}%; background: linear-gradient(to right, #4ade80, #22c55e);">
                            </div>
                        </div>
                    </div>
                    <button onclick="Router.navigate('tasks')" 
                            class="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all">
                        Ver todas as tarefas →
                    </button>
                </div>
            </div>
        `;
    },

    // ─── HELPERS ──────────────────────────────────────────────────────────────

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

        // ── Virada de semana ─────────────────────────────────────────────
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

        // ── Recalcular weeklyActivity a partir do dailyActivity ──────────
        // dailyActivity é a fonte de verdade (chave YYYY-MM-DD).
        // weeklyActivity (chave 0-6) é reconstruído para evitar divergência.
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

        // ── Streak diário ────────────────────────────────────────────────
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

        // ── Poda de dados antigos (365 dias) ─────────────────────────────
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

window.Dashboard = Dashboard;