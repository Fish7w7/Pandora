// ============================================
// SISTEMA DE LISTA DE TAREFAS - NyanTools にゃん~
// Com modais customizados (sem prompt)
// ============================================

const Tasks = {
    tasks: [],
    filter: 'all',
    sortBy: 'created',
    modalOpen: false,
    currentTask: null,
    
    render() {
        this.loadTasks();
        const stats = this.getStats();
        
        return `
            <div class="max-w-6xl mx-auto">
                <!-- Header -->
                <div class="text-center mb-8">
                    <div class="inline-block mb-4">
                        <div class="text-7xl animate-bounce-slow">✅</div>
                    </div>
                    <h1 class="text-5xl font-black mb-3 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        Lista de Tarefas
                    </h1>
                    <p class="text-gray-600 text-lg font-semibold">Organize e acompanhe suas atividades にゃん~</p>
                </div>
                
                <!-- Estatísticas -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    ${this.renderStatsCards(stats)}
                </div>
                
                <!-- Barra de Ações -->
                <div class="bg-white rounded-2xl shadow-2xl p-6 mb-6">
                    <div class="flex flex-col md:flex-row gap-4 mb-4">
                        <button onclick="Tasks.openCreateModal()" 
                                class="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                            <span class="text-2xl">+</span>
                            <span>Nova Tarefa</span>
                        </button>
                        
                        <div class="flex gap-2 flex-1">
                            <button onclick="Tasks.setFilter('all')" 
                                    class="flex-1 px-4 py-2 rounded-xl font-bold transition-all ${this.filter === 'all' ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}">
                                📋 Todas (${stats.total})
                            </button>
                            <button onclick="Tasks.setFilter('active')" 
                                    class="flex-1 px-4 py-2 rounded-xl font-bold transition-all ${this.filter === 'active' ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}">
                                ⏳ Ativas (${stats.active})
                            </button>
                            <button onclick="Tasks.setFilter('completed')" 
                                    class="flex-1 px-4 py-2 rounded-xl font-bold transition-all ${this.filter === 'completed' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}">
                                ✅ Concluídas (${stats.completed})
                            </button>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-3">
                        <span class="text-gray-700 font-semibold">Ordenar por:</span>
                        <select onchange="Tasks.setSortBy(this.value)" 
                                class="px-4 py-2 border-2 border-gray-300 rounded-xl font-semibold cursor-pointer">
                            <option value="created" ${this.sortBy === 'created' ? 'selected' : ''}>⏰ Data de Criação</option>
                            <option value="priority" ${this.sortBy === 'priority' ? 'selected' : ''}>🔴 Prioridade</option>
                            <option value="title" ${this.sortBy === 'title' ? 'selected' : ''}>🔤 Título (A-Z)</option>
                        </select>
                        
                        ${this.tasks.length > 0 ? `
                            <button onclick="Tasks.clearCompleted()" 
                                    class="ml-auto text-red-600 hover:text-red-800 font-bold text-sm transition-all">
                                🗑️ Limpar Concluídas
                            </button>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Lista de Tarefas -->
                ${this.renderTasksList()}
                
                <!-- Modal -->
                ${this.renderModal()}
            </div>
        `;
    },
    
    renderStatsCards(stats) {
        return `
            <div class="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-4 text-white shadow-xl text-center">
                <div class="text-4xl mb-2">📋</div>
                <div class="text-3xl font-black">${stats.total}</div>
                <div class="text-sm font-semibold opacity-90">Total</div>
            </div>
            
            <div class="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-4 text-white shadow-xl text-center">
                <div class="text-4xl mb-2">⏳</div>
                <div class="text-3xl font-black">${stats.active}</div>
                <div class="text-sm font-semibold opacity-90">Ativas</div>
            </div>
            
            <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-white shadow-xl text-center">
                <div class="text-4xl mb-2">✅</div>
                <div class="text-3xl font-black">${stats.completed}</div>
                <div class="text-sm font-semibold opacity-90">Concluídas</div>
            </div>
            
            <div class="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-4 text-white shadow-xl text-center">
                <div class="text-4xl mb-2">📊</div>
                <div class="text-3xl font-black">${stats.percentage}%</div>
                <div class="text-sm font-semibold opacity-90">Progresso</div>
            </div>
        `;
    },
    
    renderTasksList() {
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            const messages = {
                all: { icon: '📋', title: 'Nenhuma tarefa ainda', subtitle: 'Comece criando sua primeira tarefa!' },
                active: { icon: '⏳', title: 'Nenhuma tarefa ativa', subtitle: 'Todas as tarefas foram concluídas!' },
                completed: { icon: '✅', title: 'Nenhuma tarefa concluída', subtitle: 'Marque tarefas como concluídas!' }
            };
            
            const msg = messages[this.filter];
            
            return `
                <div class="bg-white rounded-2xl shadow-2xl p-16 text-center">
                    <div class="text-8xl mb-6 opacity-50">${msg.icon}</div>
                    <h3 class="text-3xl font-bold text-gray-800 mb-3">${msg.title}</h3>
                    <p class="text-gray-600 mb-6">${msg.subtitle}</p>
                    ${this.filter === 'all' ? `
                        <button onclick="Tasks.openCreateModal()" 
                                class="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all">
                            📝 Criar Primeira Tarefa
                        </button>
                    ` : ''}
                </div>
            `;
        }
        
        return `
            <div class="space-y-4">
                ${filteredTasks.map(task => this.renderTaskCard(task)).join('')}
            </div>
        `;
    },
    
    renderTaskCard(task) {
        const priorityColors = {
            high: 'border-red-400 bg-gradient-to-br from-red-50 to-rose-50',
            medium: 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50',
            low: 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50'
        };
        
        const priorityEmojis = {
            high: '🔴',
            medium: '🟡',
            low: '🟢'
        };
        
        const colorClass = priorityColors[task.priority] || priorityColors.medium;
        
        return `
            <div class="${colorClass} rounded-2xl p-6 shadow-lg border-2 transform hover:scale-102 hover:shadow-2xl transition-all ${task.completed ? 'opacity-60' : ''}">
                <div class="flex items-start gap-4">
                    <input type="checkbox" 
                           ${task.completed ? 'checked' : ''}
                           onchange="Tasks.toggleComplete('${task.id}')"
                           class="w-6 h-6 mt-1 accent-green-600 cursor-pointer flex-shrink-0">
                    
                    <div class="flex-1">
                        <div class="flex items-start justify-between gap-4 mb-2">
                            <h3 class="text-xl font-bold text-gray-800 ${task.completed ? 'line-through opacity-60' : ''}">
                                ${task.title}
                            </h3>
                            <div class="flex items-center gap-2 flex-shrink-0">
                                <span class="text-2xl" title="${task.priority} priority">
                                    ${priorityEmojis[task.priority]}
                                </span>
                                <button onclick="Tasks.openEditModal('${task.id}')" 
                                        class="p-2 hover:bg-white/50 rounded-lg transition-all"
                                        title="Editar">
                                    ✏️
                                </button>
                                <button onclick="Tasks.deleteTask('${task.id}')" 
                                        class="p-2 hover:bg-red-200 rounded-lg transition-all"
                                        title="Excluir">
                                    🗑️
                                </button>
                            </div>
                        </div>
                        
                        ${task.description ? `
                            <p class="text-gray-700 mb-3 ${task.completed ? 'line-through opacity-60' : ''}">
                                ${task.description}
                            </p>
                        ` : ''}
                        
                        <div class="flex items-center gap-4 text-sm text-gray-600">
                            <span>📅 ${this.formatDate(task.created)}</span>
                            ${task.completed ? `
                                <span class="text-green-700 font-semibold">
                                    ✅ Concluída em ${this.formatDate(task.completedAt)}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderModal() {
        if (!this.modalOpen) return '';
        
        const isEdit = this.currentTask !== null;
        const title = isEdit ? this.currentTask.title : '';
        const description = isEdit ? this.currentTask.description : '';
        const priority = isEdit ? this.currentTask.priority : 'medium';
        
        return `
            <div id="tasks-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn" onclick="if(event.target.id === 'tasks-modal') Tasks.closeModal()">
                <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 transform animate-scaleIn">
                    <div class="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-t-3xl text-white">
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
                    
                    <form onsubmit="Tasks.saveTask(event)" class="p-6 space-y-6">
                        <div>
                            <label class="block text-gray-800 font-bold mb-3 text-lg">📌 Título</label>
                            <input type="text" 
                                   id="task-title"
                                   value="${title}"
                                   placeholder="Ex: Estudar JavaScript..."
                                   required
                                   class="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 outline-none transition-all text-lg font-semibold">
                        </div>
                        
                        <div>
                            <label class="block text-gray-800 font-bold mb-3 text-lg">📄 Descrição (opcional)</label>
                            <textarea id="task-description"
                                      placeholder="Detalhes sobre a tarefa..."
                                      rows="4"
                                      class="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 outline-none transition-all text-lg resize-none">${description}</textarea>
                        </div>
                        
                        <div>
                            <label class="block text-gray-800 font-bold mb-3 text-lg">🔴 Prioridade</label>
                            <div class="grid grid-cols-3 gap-3">
                                <label class="relative cursor-pointer">
                                    <input type="radio" 
                                           name="priority" 
                                           value="high" 
                                           ${priority === 'high' ? 'checked' : ''}
                                           class="peer sr-only">
                                    <div class="peer-checked:border-red-500 peer-checked:bg-red-50 border-2 border-gray-300 rounded-xl p-4 text-center transition-all hover:border-red-300">
                                        <div class="text-3xl mb-2">🔴</div>
                                        <div class="font-bold">Alta</div>
                                    </div>
                                </label>
                                <label class="relative cursor-pointer">
                                    <input type="radio" 
                                           name="priority" 
                                           value="medium" 
                                           ${priority === 'medium' ? 'checked' : ''}
                                           class="peer sr-only">
                                    <div class="peer-checked:border-yellow-500 peer-checked:bg-yellow-50 border-2 border-gray-300 rounded-xl p-4 text-center transition-all hover:border-yellow-300">
                                        <div class="text-3xl mb-2">🟡</div>
                                        <div class="font-bold">Média</div>
                                    </div>
                                </label>
                                <label class="relative cursor-pointer">
                                    <input type="radio" 
                                           name="priority" 
                                           value="low" 
                                           ${priority === 'low' ? 'checked' : ''}
                                           class="peer sr-only">
                                    <div class="peer-checked:border-green-500 peer-checked:bg-green-50 border-2 border-gray-300 rounded-xl p-4 text-center transition-all hover:border-green-300">
                                        <div class="text-3xl mb-2">🟢</div>
                                        <div class="font-bold">Baixa</div>
                                    </div>
                                </label>
                            </div>
                        </div>
                        
                        <div class="flex gap-3">
                            <button type="button" 
                                    onclick="Tasks.closeModal()"
                                    class="flex-1 px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold text-lg transition-all">
                                ❌ Cancelar
                            </button>
                            <button type="submit"
                                    class="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all">
                                ✅ ${isEdit ? 'Salvar' : 'Criar'}
                            </button>
                        </div>
                    </form>
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
        
        const title = document.getElementById('task-title').value.trim();
        const description = document.getElementById('task-description').value.trim();
        const priority = document.querySelector('input[name="priority"]:checked').value;
        
        if (!title) {
            Utils.showNotification('⚠️ Digite um título', 'warning');
            return;
        }
        
        if (this.currentTask) {
            this.currentTask.title = title;
            this.currentTask.description = description;
            this.currentTask.priority = priority;
            Utils.showNotification('✅ Tarefa atualizada! にゃん~', 'success');
        } else {
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
        }
        
        this.saveTasks();
        this.closeModal();
    },
    
    toggleComplete(id) {
        const task = this.tasks.find(t => t.id === id);
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
        const confirmed = confirm('🗑️ Deseja realmente excluir esta tarefa?');
        if (!confirmed) return;
        
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
        
        filtered.sort((a, b) => {
            if (this.sortBy === 'priority') {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            } else if (this.sortBy === 'title') {
                return a.title.localeCompare(b.title);
            } else {
                return b.created - a.created;
            }
        });
        
        return filtered;
    },
    
    getStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const active = total - completed;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        return { total, completed, active, percentage };
    },
    
    clearCompleted() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        if (completedCount === 0) {
            Utils.showNotification('⚠️ Nenhuma tarefa concluída para limpar', 'warning');
            return;
        }
        
        const confirmed = confirm(`🗑️ Deseja excluir ${completedCount} tarefa${completedCount > 1 ? 's' : ''} concluída${completedCount > 1 ? 's' : ''}?`);
        if (!confirmed) return;
        
        this.tasks = this.tasks.filter(t => !t.completed);
        this.saveTasks();
        Utils.showNotification(`🗑️ ${completedCount} tarefa${completedCount > 1 ? 's' : ''} excluída${completedCount > 1 ? 's' : ''}! にゃん~`, 'info');
        Router.render();
    },
    
    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
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