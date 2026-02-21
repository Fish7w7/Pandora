// Sistema de Lista de Tarefas v3.0.0 - Dark Mode + Bug Fixes にゃん~
const Tasks = {
    tasks: [],
    filter: 'all',
    sortBy: 'created',
    modalOpen: false,
    currentTask: null,
    
    // Emojis de prioridade
    priorityEmojis: {
        high: '🔴',
        medium: '🟡',
        low: '🟢'
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    render() {
        this.loadTasks();
        const stats = this.getStats();
        
        return `
            <div class="max-w-6xl mx-auto">
                ${this.renderHeader()}
                ${this.renderStatsCards(stats)}
                ${this.renderActionBar()}
                ${this.renderTasksList()}
                ${this.renderModal()}
            </div>
        `;
    },
    
    renderHeader() {
        return `
            <div class="text-center mb-8">
                <div class="inline-block mb-4">
                    <div class="text-7xl animate-bounce-slow">✅</div>
                </div>
                <h1 class="text-5xl font-black mb-3 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Lista de Tarefas
                </h1>
                <p class="text-gray-600 dark:text-gray-300 text-lg font-semibold">Organize e acompanhe suas atividades にゃん~</p>
            </div>
        `;
    },
    
    renderStatsCards(stats) {
        const cards = [
            { label: 'Total', value: stats.total, icon: '📋', gradient: 'from-blue-500 to-cyan-600' },
            { label: 'Ativas', value: stats.active, icon: '⏳', gradient: 'from-orange-500 to-red-600' },
            { label: 'Concluídas', value: stats.completed, icon: '✅', gradient: 'from-green-500 to-emerald-600' },
            { label: 'Progresso', value: `${stats.percentage}%`, icon: '📊', gradient: 'from-purple-500 to-pink-600' }
        ];
        
        return `
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                ${cards.map(card => this.renderStatCard(card)).join('')}
            </div>
        `;
    },
    
    renderStatCard({ label, value, icon, gradient }) {
        return `
            <div class="bg-gradient-to-br ${gradient} rounded-2xl p-4 text-white shadow-xl text-center">
                <div class="text-4xl mb-2">${icon}</div>
                <div class="text-3xl font-black">${value}</div>
                <div class="text-sm font-semibold opacity-90">${label}</div>
            </div>
        `;
    },
    
    renderActionBar() {
        return `
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 mb-6 border dark:border-gray-700">
                ${this.renderFilterButtons()}
                ${this.renderSortOptions()}
            </div>
        `;
    },
    
    renderFilterButtons() {
        const filters = [
            { id: 'all', label: 'Todas', icon: '📋', count: this.tasks.length, gradient: 'from-blue-500 to-cyan-600' },
            { id: 'active', label: 'Ativas', icon: '⏳', count: this.tasks.filter(t => !t.completed).length, gradient: 'from-orange-500 to-red-600' },
            { id: 'completed', label: 'Concluídas', icon: '✅', count: this.tasks.filter(t => t.completed).length, gradient: 'from-green-500 to-emerald-600' }
        ];
        
        return `
            <div class="flex flex-col md:flex-row gap-4 mb-4">
                <button onclick="Tasks.openCreateModal()" 
                        class="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                    <span class="text-2xl">+</span>
                    <span>Nova Tarefa</span>
                </button>
                
                <div class="flex gap-2 flex-1">
                    ${filters.map(f => `
                        <button onclick="Tasks.setFilter('${f.id}')" 
                                class="flex-1 px-4 py-2 rounded-xl font-bold transition-all ${
                                    this.filter === f.id 
                                    ? `bg-gradient-to-r ${f.gradient} text-white` 
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }">
                            ${f.icon} ${f.label} (${f.count})
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    renderSortOptions() {
        return `
            <div class="flex items-center gap-3">
                <span class="text-gray-700 dark:text-gray-300 font-semibold">Ordenar por:</span>
                <select onchange="Tasks.setSortBy(this.value)" 
                        class="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold cursor-pointer bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <option value="created" ${this.sortBy === 'created' ? 'selected' : ''}>⏰ Data de Criação</option>
                    <option value="priority" ${this.sortBy === 'priority' ? 'selected' : ''}>🔴 Prioridade</option>
                    <option value="title" ${this.sortBy === 'title' ? 'selected' : ''}>🔤 Título (A-Z)</option>
                </select>
                
                ${this.tasks.length > 0 ? `
                    <button onclick="Tasks.clearCompleted()" 
                            class="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-bold text-sm transition-all">
                        🗑️ Limpar Concluídas
                    </button>
                ` : ''}
            </div>
        `;
    },
    
    renderTasksList() {
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            return this.renderEmptyState();
        }
        
        return `
            <div class="space-y-4">
                ${filteredTasks.map(task => this.renderTaskCard(task)).join('')}
            </div>
        `;
    },
    
    renderEmptyState() {
        let message = '';
        let icon = '📋';
        
        if (this.filter === 'active') {
            message = 'Nenhuma tarefa ativa';
            icon = '✅';
        } else if (this.filter === 'completed') {
            message = 'Nenhuma tarefa concluída';
            icon = '⏳';
        } else {
            message = 'Nenhuma tarefa ainda';
        }
        
        return `
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-16 text-center border dark:border-gray-700">
                <div class="text-8xl mb-6 opacity-50">${icon}</div>
                <h3 class="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-3">${message}</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-6">
                    ${this.filter === 'all' ? 'Comece criando sua primeira tarefa!' : 'Ajuste o filtro para ver outras tarefas'}
                </p>
                ${this.filter === 'all' ? `
                    <button onclick="Tasks.openCreateModal()" 
                            class="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all">
                        ✏️ Criar Primeira Tarefa
                    </button>
                ` : ''}
            </div>
        `;
    },
    
    renderTaskCard(task) {
        const priorityBorder = {
            high: 'border-red-500',
            medium: 'border-yellow-500',
            low: 'border-green-500'
        };
        
        return `
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-8 ${priorityBorder[task.priority]} border dark:border-r dark:border-t dark:border-b dark:border-gray-700 transform hover:scale-102 transition-all ${task.completed ? 'opacity-60' : ''}">
                ${this.renderTaskHeader(task)}
                ${this.renderTaskContent(task)}
                ${this.renderTaskFooter(task)}
            </div>
        `;
    },
    
    renderTaskHeader(task) {
        return `
            <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3">
                    <button onclick="Tasks.toggleComplete('${task.id}')" 
                            class="w-8 h-8 rounded-lg border-2 ${
                                task.completed 
                                ? 'bg-green-500 border-green-500' 
                                : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                            } flex items-center justify-center transition-all">
                        ${task.completed ? '<span class="text-white text-lg">✓</span>' : ''}
                    </button>
                    <span class="text-2xl">${this.priorityEmojis[task.priority]}</span>
                </div>
                <div class="flex gap-2">
                    <button onclick="Tasks.openEditModal('${task.id}')" 
                            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                            title="Editar">
                        ✏️
                    </button>
                    <button onclick="Tasks.deleteTask('${task.id}')" 
                            class="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                            title="Excluir">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    },
    
    renderTaskContent(task) {
        return `
            <h3 class="font-bold text-xl text-gray-800 dark:text-gray-100 mb-2 ${task.completed ? 'line-through opacity-60' : ''}">
                ${this.escapeHtml(task.title)}
            </h3>
            ${task.description ? `
                <p class="text-gray-600 dark:text-gray-400 text-sm mb-3 ${task.completed ? 'line-through opacity-60' : ''}">
                    ${this.escapeHtml(task.description)}
                </p>
            ` : ''}
        `;
    },
    
    renderTaskFooter(task) {
        return `
            <div class="flex items-center justify-between pt-3 border-t-2 border-gray-200 dark:border-gray-700">
                <span class="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                    ${this.formatDate(task.created)}
                </span>
                ${task.completed && task.completedAt ? `
                    <span class="text-xs text-green-600 dark:text-green-400 font-bold">
                        ✅ Concluída ${this.formatDate(task.completedAt)}
                    </span>
                ` : ''}
            </div>
        `;
    },
    
    renderModal() {
        if (!this.modalOpen) return '';
        
        const isEdit = this.currentTask !== null;
        const title = isEdit ? this.currentTask.title : '';
        const description = isEdit ? this.currentTask.description : '';
        const priority = isEdit ? this.currentTask.priority : 'medium'; // Padrão: média
        
        return `
            <div id="tasks-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onclick="if(event.target.id === 'tasks-modal') Tasks.closeModal()">
                <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border dark:border-gray-700">
                    ${this.renderModalHeader(isEdit)}
                    ${this.renderModalForm(title, description, priority, isEdit)}
                </div>
            </div>
        `;
    },
    
    renderModalHeader(isEdit) {
        return `
            <div class="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-t-3xl text-white sticky top-0 z-10">
                <div class="flex items-center justify-between">
                    <h2 class="text-3xl font-black">${isEdit ? '✏️ Editar Tarefa' : '📝 Nova Tarefa'}</h2>
                    <button onclick="Tasks.closeModal()" 
                            class="text-white hover:bg-white/20 p-2 rounded-lg transition-all">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    },
    
    renderModalForm(title, description, priority, isEdit) {
        return `
            <form onsubmit="Tasks.saveTask(event); return false;" class="p-6 space-y-6">
                <div>
                    <label class="block text-gray-800 dark:text-gray-200 font-bold mb-3 text-lg">📌 Título</label>
                    <input type="text" 
                           id="task-title"
                           value="${this.escapeHtml(title)}"
                           placeholder="Ex: Estudar JavaScript..."
                           required
                           class="w-full px-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 dark:focus:ring-green-900/50 outline-none transition-all text-lg font-semibold bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                </div>
                
                <div>
                    <label class="block text-gray-800 dark:text-gray-200 font-bold mb-3 text-lg">📄 Descrição (opcional)</label>
                    <textarea id="task-description"
                              placeholder="Detalhes sobre a tarefa..."
                              rows="4"
                              class="w-full px-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 dark:focus:ring-green-900/50 outline-none transition-all text-lg resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">${this.escapeHtml(description)}</textarea>
                </div>
                
                ${this.renderPrioritySelector(priority)}
                
                <div class="flex gap-3">
                    <button type="button" 
                            onclick="Tasks.closeModal()"
                            class="flex-1 px-6 py-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-bold text-lg transition-all">
                        ❌ Cancelar
                    </button>
                    <button type="submit"
                            class="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all">
                        ✅ ${isEdit ? 'Salvar' : 'Criar'}
                    </button>
                </div>
            </form>
        `;
    },
    
    renderPrioritySelector(priority) {
        // BUG FIX: Classes dinâmicas não funcionam com Tailwind
        // Solução: usar classes fixas completas
        const priorities = [
            { 
                value: 'high', 
                emoji: '🔴', 
                label: 'Alta',
                checkedClasses: 'border-red-500 bg-red-50 dark:bg-red-900/20',
                hoverClasses: 'hover:border-red-300 dark:hover:border-red-700'
            },
            { 
                value: 'medium', 
                emoji: '🟡', 
                label: 'Média',
                checkedClasses: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
                hoverClasses: 'hover:border-yellow-300 dark:hover:border-yellow-700'
            },
            { 
                value: 'low', 
                emoji: '🟢', 
                label: 'Baixa',
                checkedClasses: 'border-green-500 bg-green-50 dark:bg-green-900/20',
                hoverClasses: 'hover:border-green-300 dark:hover:border-green-700'
            }
        ];
        
        return `
            <div>
                <label class="block text-gray-800 dark:text-gray-200 font-bold mb-3 text-lg">🔴 Prioridade</label>
                <div class="grid grid-cols-3 gap-3">
                    ${priorities.map(p => `
                        <label class="relative cursor-pointer">
                            <input type="radio" 
                                   name="priority" 
                                   value="${p.value}" 
                                   ${priority === p.value ? 'checked' : ''}
                                   class="peer sr-only">
                            <div class="peer-checked:${p.checkedClasses} border-2 border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center transition-all ${p.hoverClasses}">
                                <div class="text-3xl mb-2">${p.emoji}</div>
                                <div class="font-bold text-gray-800 dark:text-gray-200">${p.label}</div>
                            </div>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    openCreateModal() {
        this.currentTask = null;
        this.modalOpen = true;
        Router.render();
        setTimeout(() => document.getElementById('task-title')?.focus(), 100);
    },
    
    openEditModal(id) {
        this.currentTask = this.tasks.find(t => t.id === id);
        if (!this.currentTask) return;
        
        this.modalOpen = true;
        Router.render();
        setTimeout(() => document.getElementById('task-title')?.focus(), 100);
    },
    
    closeModal() {
        this.modalOpen = false;
        this.currentTask = null;
        Router.render();
    },
    
    saveTask(event) {
        event.preventDefault();
        
        const title = document.getElementById('task-title')?.value.trim();
        const description = document.getElementById('task-description')?.value.trim() || '';
        const priority = document.querySelector('input[name="priority"]:checked')?.value || 'medium';
        
        if (!title) {
            Utils.showNotification('⚠️ Digite um título', 'warning');
            return;
        }
        
        if (this.currentTask) {
            this.updateTask(title, description, priority);
        } else {
            this.createTask(title, description, priority);
        }
        
        this.saveTasks();
        this.closeModal();
    },
    
    createTask(title, description, priority) {
        const task = {
            id: Utils.generateId(),
            title,
            description,
            priority,
            completed: false,
            created: Date.now(),
            completedAt: null
        };
        this.tasks.unshift(task);
        Utils.showNotification('✅ Tarefa criada! にゃん~', 'success');
    },
    
    updateTask(title, description, priority) {
        const index = this.tasks.findIndex(t => t.id === this.currentTask.id);
        if (index !== -1) {
            this.tasks[index] = { ...this.tasks[index], title, description, priority };
            Utils.showNotification('✅ Tarefa atualizada! にゃん~', 'success');
        }
    },
    
    toggleComplete(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        task.completed = !task.completed;
        task.completedAt = task.completed ? Date.now() : null;
        
        this.saveTasks();
        Utils.showNotification(
            task.completed ? '✅ Tarefa concluída! にゃん~' : '⏳ Tarefa reaberta! にゃん~',
            task.completed ? 'success' : 'info'
        );
        Router.render();
    },
    
    deleteTask(id) {
        if (!confirm('🗑️ Deseja realmente excluir esta tarefa?')) return;
        
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        Utils.showNotification('🗑️ Tarefa excluída! にゃん~', 'info');
        Router.render();
    },
    
    setFilter(filter) {
        this.filter = filter;
        Router.render();
    },
    
    setSortBy(sortBy) {
        this.sortBy = sortBy;
        Router.render();
    },
    
    getFilteredTasks() {
        let filtered = [...this.tasks];
        
        if (this.filter === 'active') {
            filtered = filtered.filter(t => !t.completed);
        } else if (this.filter === 'completed') {
            filtered = filtered.filter(t => t.completed);
        }
        
        return this.sortTasks(filtered);
    },
    
    sortTasks(tasks) {
        return tasks.sort((a, b) => {
            if (this.sortBy === 'priority') {
                const order = { high: 0, medium: 1, low: 2 };
                return order[a.priority] - order[b.priority];
            }
            if (this.sortBy === 'title') {
                return a.title.localeCompare(b.title);
            }
            return b.created - a.created;
        });
    },
    
    getStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const active = total - completed;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        return { total, completed, active, percentage };
    },
    
    clearCompleted() {
        const count = this.tasks.filter(t => t.completed).length;
        if (count === 0) {
            Utils.showNotification('⚠️ Nenhuma tarefa concluída para limpar', 'warning');
            return;
        }
        
        if (!confirm(`🗑️ Deseja excluir ${count} tarefa${count > 1 ? 's' : ''} concluída${count > 1 ? 's' : ''}?`)) return;
        
        this.tasks = this.tasks.filter(t => !t.completed);
        this.saveTasks();
        Utils.showNotification(`🗑️ ${count} tarefa${count > 1 ? 's' : ''} excluída${count > 1 ? 's' : ''}! にゃん~`, 'info');
        Router.render();
    },
    
    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: 'short',
            year: 'numeric'
        });
    },
    
    loadTasks() {
        this.tasks = Utils.loadData('tasks') || [];
    },
    
    saveTasks() {
        Utils.saveData('tasks', this.tasks);
    },
    
    init() {
        this.loadTasks();
        this.modalOpen = false;
        console.log('✅ Tarefas carregadas:', this.tasks.length);
    }
};

window.Tasks = Tasks;