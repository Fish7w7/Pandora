const Integrations = {

    KEY_FLOW_LOG: 'nyan_flow_log',
    MAX_LOG: 30,


    /**
     * Converte uma nota em tarefa.
     * Mantém a nota original intacta.
     */
    noteToTask(noteId) {
        const notes = window.Utils?.loadData('notes') || [];
        const note  = notes.find(n => n.id === noteId);
        if (!note) { window.Utils?.showNotification('❌ Nota não encontrada', 'error'); return null; }

        const tasks = window.Utils?.loadData('tasks') || [];

        const alreadyExists = tasks.some(t => t._sourceNoteId === noteId);
        if (alreadyExists) {
            window.Utils?.showNotification('⚠️ Já existe uma tarefa para esta nota', 'warning');
            return null;
        }

        const task = {
            id:           window.Utils?.generateId?.() || `task_${Date.now()}`,
            title:        note.title || 'Tarefa sem título',
            description:  note.content?.slice(0, 200) || '',
            priority:     'medium',
            completed:    false,
            created:      Date.now(),
            completedAt:  null,
            _sourceNoteId: noteId,   // Referência à nota de origem
            _fromIntegration: true,
        };

        tasks.unshift(task);
        window.Utils?.saveData('tasks', tasks);

        this._logFlow('note_to_task', { noteTitle: note.title, taskId: task.id });

        window.Missions?.track?.({ event: 'open_tool', tool: 'tasks' });

        window.Utils?.showNotification(`✅ Nota convertida em tarefa: "${task.title}"`, 'success');

        setTimeout(() => window.Router?.navigate('tasks'), 600);

        return task;
    },

    /**
     * Renderiza botão "→ Criar Tarefa" dentro de um card de nota.
     */
    renderNoteToTaskBtn(noteId) {
        const tasks = window.Utils?.loadData('tasks') || [];
        const exists = tasks.some(t => t._sourceNoteId === noteId);
        const d = document.body.classList.contains('dark-theme');

        if (exists) {
            return `<span style="font-size:0.62rem;font-weight:700;color:#4ade80;opacity:0.7;">✓ Tarefa criada</span>`;
        }

        return `<button
            onclick="event.stopPropagation();Integrations.noteToTask('${noteId}')"
            style="font-size:0.62rem;font-weight:700;padding:2px 8px;border-radius:99px;border:none;
                cursor:pointer;
                background:${d?'rgba(168,85,247,0.12)':'rgba(168,85,247,0.08)'};
                color:${d?'#c084fc':'#7c3aed'};
                border:1px solid rgba(168,85,247,0.25);
                font-family:'DM Sans',sans-serif;transition:background 0.15s;"
            title="Transformar nota em tarefa">
            → Criar tarefa
        </button>`;
    },


    /**
     * Hook chamado quando uma tarefa é concluída.
     * Distribui XP, chips e rastreia missões.
     */
    onTaskCompleted(task) {
        if (!task) return;

        const xpMap    = { high: 40, medium: 25, low: 15 };
        const chipsMap = { high: 20, medium: 12, low: 8  };
        const xp     = xpMap[task.priority]    || 20;
        const chips  = chipsMap[task.priority] || 10;

        if (window.Economy) {
            const state    = Economy.load();
            const oldLevel = state.level;

            state.totalXP  = (state.totalXP || 0) + xp;
            state.chips    = (state.chips || 0) + chips;

            const { level, xp: newXp, xpToNext } = Economy.calcLevel(state.totalXP);
            state.level    = level;
            state.xp       = newXp;
            state.xpToNext = xpToNext;
            Economy.save(state);

            if (level > oldLevel) {
                window.Utils?.showNotification?.(`🎉 Level Up! Nível ${level}!`, 'success');
            } else {
                window.Utils?.showNotification?.(`⚡ Tarefa concluída: +${xp} XP · +${chips} chips`, 'info');
            }

            Economy._refreshUI?.();
        }

        window.Missions?.track?.({
            event: 'task_completed',
            priority: task.priority,
            title:    task.title,
        });

        if (window.Presence) {
            window.Presence._setContext({ status: 'focused', label: 'Concluiu uma tarefa', icon: '✅' });
            setTimeout(() => {
                const route = window.Router?.currentRoute || 'tasks';
                window.Presence.updateFromRoute(route);
            }, 5000);
        }

        if (task._sourceNoteId && window.Achievements) {
            Achievements.checkAll();
        }

        this._logFlow('task_completed', {
            taskTitle: task.title,
            priority:  task.priority,
            xp, chips,
        });

    },

    /**
     * Hook chamado quando uma nota é criada.
     */
    onNoteCreated(note) {
        if (!note) return;

        if (window.Economy) {
            const state = Economy.load();
            state.totalXP = (state.totalXP || 0) + 5;
            state.chips   = (state.chips || 0) + 2;
            const { level, xp, xpToNext } = Economy.calcLevel(state.totalXP);
            Object.assign(state, { level, xp, xpToNext });
            Economy.save(state);
            Economy._refreshUI?.();
        }

        window.Missions?.track?.({ event: 'note_created', title: note.title });

        this._logFlow('note_created', { noteTitle: note.title });
    },


    /**
     * Registra uso de ferramenta para recomendações inteligentes.
     * Retorna os dados de frequência para uso na Home.
     */
    trackToolUsage(toolId) {
        const KEY = 'nyan_tool_frequency';
        const data = window.Utils?.loadData(KEY) || {};

        if (!data[toolId]) {
            data[toolId] = { count: 0, lastUsed: 0, sessions: [] };
        }

        data[toolId].count++;
        data[toolId].lastUsed = Date.now();

        data[toolId].sessions.push(Date.now());
        if (data[toolId].sessions.length > 10) data[toolId].sessions.shift();

        window.Utils?.saveData(KEY, data);
        return data;
    },

    getToolFrequency() {
        return window.Utils?.loadData('nyan_tool_frequency') || {};
    },

    /**
     * Retorna os top N tools mais usados (excluindo sistema/social).
     */
    getTopTools(n = 5) {
        const freq = this.getToolFrequency();
        const EXCLUDE = ['home','settings','profile','friends','chat','leaderboard','feed','challenges','profile-public'];

        return Object.entries(freq)
            .filter(([id]) => !EXCLUDE.includes(id))
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, n)
            .map(([id, data]) => ({ id, ...data }));
    },

    /**
     * Retorna sugestões de ação baseadas no contexto do usuário.
     */
    getSmartSuggestions() {
        const suggestions = [];
        const tasks  = window.Utils?.loadData('tasks')  || [];
        const notes  = window.Utils?.loadData('notes')  || [];
        const freq   = this.getToolFrequency();
        const lastRoute = window.Utils?.loadData('last_tool_route');

        const urgentTasks = tasks.filter(t => !t.completed && t.priority === 'high');
        if (urgentTasks.length > 0) {
            suggestions.push({
                type:   'task',
                icon:   '🔴',
                label:  `${urgentTasks.length} tarefa${urgentTasks.length > 1 ? 's' : ''} urgente${urgentTasks.length > 1 ? 's' : ''}`,
                action: "Router.navigate('tasks')",
                color:  'rgba(239,68,68,0.1)',
                border: 'rgba(239,68,68,0.25)',
            });
        }

        const noteWithoutTask = notes.find(n => {
            const tasks2 = window.Utils?.loadData('tasks') || [];
            return !tasks2.some(t => t._sourceNoteId === n.id);
        });
        if (noteWithoutTask) {
            suggestions.push({
                type:   'integration',
                icon:   '📝→✅',
                label:  `Converter "${(noteWithoutTask.title || 'nota').slice(0, 24)}" em tarefa`,
                action: `Integrations.noteToTask('${noteWithoutTask.id}')`,
                color:  'rgba(168,85,247,0.08)',
                border: 'rgba(168,85,247,0.2)',
            });
        }

        const missions  = window.Missions?.getDailyMissions?.() || [];
        const nextMission = missions.find(m => !m.completed);
        if (nextMission) {
            suggestions.push({
                type:   'mission',
                icon:   nextMission.icon,
                label:  nextMission.title,
                action: "Router.navigate('missions')",
                color:  'rgba(251,191,36,0.08)',
                border: 'rgba(251,191,36,0.2)',
            });
        }

        if (lastRoute && lastRoute !== 'home') {
            const tool = window.App?.tools?.find(t => t.id === lastRoute);
            if (tool) {
                suggestions.push({
                    type:   'continue',
                    icon:   tool.icon,
                    label:  `Continuar em ${tool.name}`,
                    action: `Router.navigate('${lastRoute}')`,
                    color:  'rgba(74,222,128,0.08)',
                    border: 'rgba(74,222,128,0.2)',
                });
            }
        }

        return suggestions.slice(0, 4);
    },


    /**
     * Injeta hooks nos módulos Tasks e Notes após carregamento.
     */
    patchModules() {
        const tryPatchTasks = () => {
            if (!window.Tasks) { setTimeout(tryPatchTasks, 500); return; }
            const orig = Tasks.toggleComplete.bind(Tasks);
            Tasks.toggleComplete = (taskId) => {
                orig(taskId);
                const tasks = window.Utils?.loadData('tasks') || [];
                const task  = tasks.find(t => t.id === taskId);
                if (task?.completed) {
                    setTimeout(() => Integrations.onTaskCompleted(task), 100);
                }
            };
        };

        const tryPatchNotes = () => {
            if (!window.Notes) { setTimeout(tryPatchNotes, 500); return; }
            const orig = Notes.createNote.bind(Notes);
            Notes.createNote = (title, content) => {
                orig(title, content);
                const notes = window.Utils?.loadData('notes') || [];
                const note  = notes[0]; // mais recente
                if (note) setTimeout(() => Integrations.onNoteCreated(note), 100);
            };
        };

        const tryPatchRouter = () => {
            if (!window.Router) { setTimeout(tryPatchRouter, 300); return; }
            const orig = Router.navigate.bind(Router);
            Router.navigate = (toolId) => {
                orig(toolId);
                Integrations.trackToolUsage(toolId);
            };
        };

        setTimeout(tryPatchTasks,  300);
        setTimeout(tryPatchNotes,  300);
        setTimeout(tryPatchRouter, 200);
    },


    _logFlow(type, data = {}) {
        const log = window.Utils?.loadData(this.KEY_FLOW_LOG) || [];
        log.unshift({ type, data, at: Date.now() });
        if (log.length > this.MAX_LOG) log.splice(this.MAX_LOG);
        window.Utils?.saveData(this.KEY_FLOW_LOG, log);
    },

    getFlowLog() {
        return window.Utils?.loadData(this.KEY_FLOW_LOG) || [];
    },


    renderSuggestionsWidget() {
        const suggestions = this.getSmartSuggestions();
        if (suggestions.length === 0) return '';

        const d     = document.body.classList.contains('dark-theme');
        const text  = d ? '#f1f5f9' : '#0f172a';
        const muted = d ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.32)';
        const bg    = d ? 'rgba(255,255,255,0.04)' : '#ffffff';
        const bdr   = d ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';

        const items = suggestions.map(s => `
            <button onclick="${s.action}"
                style="display:flex;align-items:center;gap:0.625rem;
                    padding:0.6rem 0.875rem;border-radius:12px;border:1px solid ${s.border};
                    background:${d ? s.color.replace('0.1','0.12') : s.color};
                    cursor:pointer;width:100%;text-align:left;
                    font-family:'DM Sans',sans-serif;
                    transition:transform 0.12s,box-shadow 0.12s;"
                onmouseover="this.style.transform='translateY(-1px)';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'"
                onmouseout="this.style.transform='';this.style.boxShadow=''">
                <span style="font-size:1rem;flex-shrink:0;">${s.icon}</span>
                <span style="font-size:0.78rem;font-weight:600;color:${text};
                    overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                    ${s.label}
                </span>
            </button>
        `).join('');

        return `
        <div style="background:${bg};border:1px solid ${bdr};border-radius:14px;padding:1rem;margin-bottom:0.75rem;">
            <div style="font-size:0.62rem;font-weight:800;letter-spacing:0.1em;
                text-transform:uppercase;color:${muted};margin-bottom:0.625rem;">
                ⚡ Sugestões para você
            </div>
            <div style="display:flex;flex-direction:column;gap:0.375rem;">
                ${items}
            </div>
        </div>`;
    },

    init() {
        this.patchModules();
    },
};

Integrations._isSuggestionsHidden = function() {
    return window.Utils?.loadData?.('home_suggestions_hidden') === true;
};

Integrations._setSuggestionsHidden = function(hidden) {
    window.Utils?.saveData?.('home_suggestions_hidden', !!hidden);
    if (window.Router?.currentRoute === 'home' && typeof window.Router.render === 'function') {
        window.Router.render();
    }
};

Integrations.renderSuggestionsWidget = function() {
    if (this._isSuggestionsHidden()) {
        const d = document.body.classList.contains('dark-theme');
        const muted = d ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.45)';
        const bg = d ? 'rgba(255,255,255,0.03)' : '#ffffff';
        const bdr = d ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
        return `
        <div style="
            background:${bg};border:1px solid ${bdr};border-radius:12px;
            padding:0.5rem 0.65rem;margin-bottom:0.55rem;
            display:flex;align-items:center;justify-content:space-between;gap:0.6rem;
        ">
            <span style="font-size:0.66rem;color:${muted};font-weight:700;">Sugestoes ocultas</span>
            <button onclick="Integrations._setSuggestionsHidden(false)"
                style="border:none;background:transparent;cursor:pointer;font-size:0.7rem;font-weight:800;color:${muted};">
                mostrar
            </button>
        </div>`;
    }

    const suggestions = this.getSmartSuggestions().slice(0, 3);
    if (suggestions.length === 0) return '';

    const d = document.body.classList.contains('dark-theme');
    const text = d ? '#f1f5f9' : '#0f172a';
    const muted = d ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)';
    const bg = d ? 'rgba(255,255,255,0.035)' : '#ffffff';
    const bdr = d ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

    const chips = suggestions.map((s) => `
        <button onclick="${s.action}"
            style="
                display:inline-flex;align-items:center;gap:0.4rem;
                padding:0.38rem 0.62rem;border-radius:999px;
                border:1px solid ${s.border || bdr};
                background:${d ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'};
                color:${text};font-size:0.72rem;font-weight:700;cursor:pointer;
                max-width:100%;
            "
            title="${s.label}"
            onmouseover="this.style.transform='translateY(-1px)'"
            onmouseout="this.style.transform=''">
            <span style="font-size:0.8rem;line-height:1;">${s.icon || '*'}</span>
            <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px;">${s.label}</span>
        </button>
    `).join('');

    return `
    <div style="
        background:${bg};border:1px solid ${bdr};border-radius:12px;
        padding:0.58rem 0.68rem;margin-bottom:0.55rem;
        display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;
    ">
        <span style="font-size:0.64rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${muted};">
            Sugestoes
        </span>
        <div style="display:flex;align-items:center;gap:0.35rem;flex-wrap:wrap;flex:1;min-width:0;">
            ${chips}
        </div>
        <button onclick="Integrations._setSuggestionsHidden(true)"
            style="
                border:none;background:transparent;cursor:pointer;
                font-size:0.72rem;font-weight:700;color:${muted};padding:0.2rem 0.35rem;border-radius:8px;
            "
            title="Ocultar sugestoes">
            ocultar
        </button>
    </div>`;
};

Integrations.onTaskCompleted = function(task) {
    if (!task) return;

    window.Missions?.track?.({
        event: 'task_completed',
        priority: task.priority,
        title: task.title,
    });

    if (window.Presence) {
        window.Presence._setContext({ status: 'focused', label: 'Concluiu uma tarefa', icon: '✅' });
        setTimeout(() => {
            const route = window.Router?.currentRoute || 'tasks';
            window.Presence.updateFromRoute(route);
        }, 5000);
    }

    if (task._sourceNoteId && window.Achievements) {
        Achievements.checkAll();
    }

    Integrations._logFlow?.('task_completed', {
        taskTitle: task.title,
        priority: task.priority,
    });
};

Integrations._emitConnectedAction = function(event, payload = {}) {
    try {
        window.Missions?.track?.({ event, ...payload });
    } catch (_) {}

    try {
        if (window.ProfileV2?.recordActivity) {
            const map = {
                task_created: 'task_created',
                task_completed: 'task_completed',
                note_to_task: 'note_to_task',
                note_created: 'note_created',
                tool_session: 'tool_session',
            };
            const type = map[event];
            if (type) window.ProfileV2.recordActivity(type, payload);
        }
    } catch (_) {}

    try {
        window.StateManager?.syncAll?.();
        window.StateManager?.updateMissionsBadge?.();
    } catch (_) {}
};

Integrations._taskCompletionSeen = Integrations._taskCompletionSeen || {};

const __nyanOrigOnTaskCompleted = Integrations.onTaskCompleted?.bind(Integrations);
Integrations.onTaskCompleted = function(task) {
    if (!task?.id) return;
    if (Integrations._taskCompletionSeen[task.id]) return;
    Integrations._taskCompletionSeen[task.id] = true;
    __nyanOrigOnTaskCompleted?.(task);
    Integrations._emitConnectedAction('task_completed', {
        taskId: task.id,
        title: task.title,
        priority: task.priority || 'medium',
    });
};

const __nyanOrigNoteToTask = Integrations.noteToTask?.bind(Integrations);
Integrations.noteToTask = function(noteId) {
    const task = __nyanOrigNoteToTask?.(noteId);
    if (task) {
        Integrations._emitConnectedAction('note_to_task', {
            noteId,
            taskId: task.id,
            title: task.title,
        });
        Integrations._emitConnectedAction('task_created', {
            taskId: task.id,
            title: task.title,
            source: 'note',
        });
    }
    return task;
};

const __nyanOrigOnNoteCreated = Integrations.onNoteCreated?.bind(Integrations);
Integrations.onNoteCreated = function(note) {
    __nyanOrigOnNoteCreated?.(note);
    if (!note) return;
    Integrations._emitConnectedAction('note_created', {
        noteId: note.id,
        title: note.title || 'nota',
    });
};

const __nyanOrigTrackToolUsage = Integrations.trackToolUsage?.bind(Integrations);
Integrations.trackToolUsage = function(toolId) {
    const data = __nyanOrigTrackToolUsage ? __nyanOrigTrackToolUsage(toolId) : {};
    const freq = data?.[toolId] || {};
    const count = Number(freq.count || 0);
    const uniqueTools = Object.keys(data || {}).filter((id) => (data[id]?.count || 0) > 0).length;

    Integrations._emitConnectedAction('open_tool', { tool: toolId });

    if (count > 0 && count % 5 === 0) {
        Integrations._emitConnectedAction('tool_session', {
            tool: toolId,
            count,
            uniqueTools,
        });
    }

    return data;
};

Integrations.getSmartSuggestions = function() {
    const suggestions = [];
    const tasks = window.Utils?.loadData('tasks') || [];
    const notes = window.Utils?.loadData('notes') || [];
    const lastRoute = window.Utils?.loadData('last_tool_route');
    const freq = this.getToolFrequency ? this.getToolFrequency() : {};
    const now = Date.now();

    const scorePush = (item) => {
        if (!item || !item.label) return;
        suggestions.push(item);
    };

    const urgent = tasks.filter((t) => !t.completed && t.priority === 'high');
    if (urgent.length > 0) {
        scorePush({
            id: 'urgent_tasks',
            icon: '!',
            label: `${urgent.length} tarefa${urgent.length > 1 ? 's' : ''} urgente${urgent.length > 1 ? 's' : ''}`,
            action: "Router.navigate('tasks')",
            color: 'rgba(239,68,68,0.1)',
            border: 'rgba(239,68,68,0.25)',
            score: 120 + urgent.length,
        });
    }

    const stale = tasks.filter((t) => !t.completed && (now - Number(t.created || now)) > 24 * 3600 * 1000);
    if (stale.length > 0) {
        scorePush({
            id: 'stale_tasks',
            icon: '⏳',
            label: `${stale.length} tarefa${stale.length > 1 ? 's' : ''} parada${stale.length > 1 ? 's' : ''} ha mais de 1 dia`,
            action: "Router.navigate('tasks')",
            color: 'rgba(245,158,11,0.1)',
            border: 'rgba(245,158,11,0.25)',
            score: 105 + stale.length,
        });
    }

    const missions = window.Missions?.getDailyMissions?.() || [];
    const nextMission = missions.find((m) => !m.completed);
    if (nextMission) {
        scorePush({
            id: 'mission_next',
            icon: nextMission.icon || '*',
            label: `Missao: ${nextMission.title}`,
            action: "Router.navigate('missions')",
            color: 'rgba(168,85,247,0.1)',
            border: 'rgba(168,85,247,0.25)',
            score: 95,
        });
    }

    const noteWithoutTask = notes.find((n) => {
        const allTasks = window.Utils?.loadData('tasks') || [];
        return !allTasks.some((t) => t._sourceNoteId === n.id);
    });
    if (noteWithoutTask) {
        scorePush({
            id: 'note_to_task',
            icon: '->',
            label: `Transformar "${(noteWithoutTask.title || 'nota').slice(0, 24)}" em tarefa`,
            action: `Integrations.noteToTask('${noteWithoutTask.id}')`,
            color: 'rgba(16,185,129,0.1)',
            border: 'rgba(16,185,129,0.25)',
            score: 90,
        });
    }

    if (lastRoute && lastRoute !== 'home') {
        const tool = window.App?.tools?.find((t) => t.id === lastRoute);
        if (tool) {
            scorePush({
                id: 'continue_last',
                icon: tool.icon || '>',
                label: `Continuar em ${tool.name}`,
                action: `Router.navigate('${lastRoute}')`,
                color: 'rgba(59,130,246,0.1)',
                border: 'rgba(59,130,246,0.25)',
                score: 80,
            });
        }
    }

    const topTool = Object.entries(freq)
        .filter(([id]) => !['home', 'profile', 'settings', 'friends', 'chat'].includes(id))
        .sort((a, b) => (b[1]?.count || 0) - (a[1]?.count || 0))[0];
    if (topTool && (topTool[1]?.count || 0) >= 3) {
        const tool = window.App?.tools?.find((t) => t.id === topTool[0]);
        if (tool) {
            scorePush({
                id: 'habit_tool',
                icon: tool.icon || '*',
                label: `Seu habito: ${tool.name}`,
                action: `Router.navigate('${tool.id}')`,
                color: 'rgba(236,72,153,0.1)',
                border: 'rgba(236,72,153,0.25)',
                score: 70,
            });
        }
    }

    const dedup = {};
    suggestions.forEach((s) => { dedup[s.id] = s; });
    return Object.values(dedup)
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 4)
        .map(({ score, ...rest }) => rest);
};

const __nyanOrigPatchModules = Integrations.patchModules?.bind(Integrations);
Integrations.patchModules = function() {
    __nyanOrigPatchModules?.();

    const tryPatchTaskCreate = () => {
        if (!window.Tasks || window.Tasks.__nyanTaskCreatePatched) {
            if (!window.Tasks) setTimeout(tryPatchTaskCreate, 400);
            return;
        }
        window.Tasks.__nyanTaskCreatePatched = true;

        const origCreateTask = window.Tasks.createTask?.bind(window.Tasks);
        if (!origCreateTask) return;

        window.Tasks.createTask = function(title, description, priority) {
            origCreateTask(title, description, priority);
            const created = window.Tasks.tasks?.[0];
            if (created) {
                Integrations._emitConnectedAction('task_created', {
                    taskId: created.id,
                    title: created.title,
                    priority: created.priority || priority || 'medium',
                    source: 'tasks',
                });
            }
        };
    };

    setTimeout(tryPatchTaskCreate, 300);
};

window.Integrations = Integrations;

(function finalizeIntegrationsV310() {
    if (!window.Integrations || Integrations.__v310Finalized) return;
    Integrations.__v310Finalized = true;

    Integrations.TASK_COMPLETION_LOCK_KEY = 'nyan_task_completion_lock_v310';
    Integrations.TASK_COMPLETION_LOCK_MAX = 600;
    Integrations._taskCompletionPersistentSeen = Integrations._taskCompletionPersistentSeen || {};

    Integrations._loadTaskCompletionLock = function() {
        const data = window.Utils?.loadData?.(this.TASK_COMPLETION_LOCK_KEY);
        return data && typeof data === 'object' ? data : {};
    };

    Integrations._saveTaskCompletionLock = function(lock) {
        if (!lock || typeof lock !== 'object') return;
        const entries = Object.entries(lock)
            .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))
            .slice(0, this.TASK_COMPLETION_LOCK_MAX);
        window.Utils?.saveData?.(this.TASK_COMPLETION_LOCK_KEY, Object.fromEntries(entries));
    };

    Integrations._markTaskCompletedOnce = function(taskId) {
        if (!taskId) return false;
        if (this._taskCompletionPersistentSeen[taskId]) return false;

        const lock = this._loadTaskCompletionLock();
        if (lock[taskId]) {
            this._taskCompletionPersistentSeen[taskId] = true;
            return false;
        }

        const now = Date.now();
        this._taskCompletionPersistentSeen[taskId] = true;
        lock[taskId] = now;
        this._saveTaskCompletionLock(lock);
        return true;
    };

    const __origEmitConnectedAction = Integrations._emitConnectedAction?.bind(Integrations);
    Integrations._emitConnectedAction = function(event, payload = {}) {
        __origEmitConnectedAction?.(event, payload);
        try {
            window.dispatchEvent(new CustomEvent('nyan:connected-action', {
                detail: { event, payload, at: Date.now() }
            }));
        } catch (_) {}
    };

    const __origOnTaskCompleted = Integrations.onTaskCompleted?.bind(Integrations);
    Integrations.onTaskCompleted = function(task) {
        if (!task?.id) return;
        if (!Integrations._markTaskCompletedOnce(task.id)) return;
        __origOnTaskCompleted?.(task);
    };

    const __origPatchModules = Integrations.patchModules?.bind(Integrations);
    Integrations.patchModules = function() {
        __origPatchModules?.();

        const tryPatchTaskCreate = () => {
            if (!window.Tasks || window.Tasks.__nyanTaskCreatePatchedV310b) {
                if (!window.Tasks) setTimeout(tryPatchTaskCreate, 350);
                return;
            }
            window.Tasks.__nyanTaskCreatePatchedV310b = true;

            const origCreateTask = window.Tasks.createTask?.bind(window.Tasks);
            if (!origCreateTask) return;

            window.Tasks.createTask = function(title, description, priority) {
                const beforeIds = new Set((window.Tasks.tasks || []).map((t) => t.id));
                origCreateTask(title, description, priority);
                const created = (window.Tasks.tasks || []).find((t) => !beforeIds.has(t.id));
                if (created) {
                    Integrations._emitConnectedAction('task_created', {
                        taskId: created.id,
                        title: created.title,
                        priority: created.priority || priority || 'medium',
                        source: 'tasks',
                    });
                }
            };
        };

        setTimeout(tryPatchTaskCreate, 300);
    };
})();
