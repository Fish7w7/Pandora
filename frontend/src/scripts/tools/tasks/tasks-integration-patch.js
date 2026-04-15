
(function patchTasks() {
    const tryPatch = () => {
        if (!window.Tasks) { setTimeout(tryPatch, 500); return; }
        if (window.Tasks.__integrationPatched) return;
        window.Tasks.__integrationPatched = true;

        const origToggle = Tasks.toggleComplete.bind(Tasks);
        Tasks.toggleComplete = function(taskId) {
            const tasksBefore = window.Utils?.loadData('tasks') || [];
            const taskBefore  = tasksBefore.find(t => t.id === taskId);
            const wasCompleted = taskBefore?.completed;

            origToggle(taskId);

            const tasksAfter = window.Utils?.loadData('tasks') || [];
            const taskAfter  = tasksAfter.find(t => t.id === taskId);

            if (!wasCompleted && taskAfter?.completed) {
                window.Integrations?.onTaskCompleted?.(taskAfter);
                window.StateManager?.updateMissionsBadge?.();
            }
        };

        const origCreate = Tasks.createTask.bind(Tasks);
        Tasks.createTask = function(title, description, priority) {
            origCreate(title, description, priority);
            window.Integrations?.trackToolUsage?.('tasks');
        };

        const origEmpty = Tasks.renderEmptyState.bind(Tasks);
        Tasks.renderEmptyState = function() {
            const original = origEmpty();

            const notes = window.Utils?.loadData('notes') || [];
            if (notes.length === 0 || Tasks.filter !== 'all') return original;

            const d = document.body.classList.contains('dark-theme');
            const muted = d ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.32)';
            const hint = `
                <div style="margin-top:0.75rem;font-size:0.72rem;color:${muted};
                    display:flex;align-items:center;justify-content:center;gap:0.4rem;">
                    💡 Você tem ${notes.length} nota${notes.length > 1 ? 's' : ''} —
                    <button onclick="Router.navigate('notes')"
                        style="background:none;border:none;cursor:pointer;color:#a855f7;
                            font-weight:700;font-size:0.72rem;font-family:'DM Sans',sans-serif;
                            text-decoration:underline;">
                        converter em tarefa
                    </button>
                </div>`;

            return original.replace('</div>\n        ', `${hint}</div>\n        `);
        };

    };

    setTimeout(tryPatch, 600);
})();

(function finalizeTasksIntegrationV310() {
    const tryRefine = () => {
        if (!window.Tasks) { setTimeout(tryRefine, 450); return; }
        if (window.Tasks.__nyanTasksIntegrationFinalized) return;
        window.Tasks.__nyanTasksIntegrationFinalized = true;

        const origToggle = window.Tasks.toggleComplete?.bind(window.Tasks);
        if (origToggle) {
            window.Tasks.toggleComplete = function(taskId) {
                const before = window.Utils?.loadData('tasks') || [];
                const oldTask = before.find((t) => t.id === taskId);
                const wasCompleted = oldTask?.completed === true;

                origToggle(taskId);

                const after = window.Utils?.loadData('tasks') || [];
                const newTask = after.find((t) => t.id === taskId);
                if (!wasCompleted && newTask?.completed) {
                    window.StateManager?.updateMissionsBadge?.();
                }
            };
        }

    };

    setTimeout(tryRefine, 900);
})();
