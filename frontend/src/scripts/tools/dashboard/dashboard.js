// ============================================
// DASHBOARD INICIAL - NyanTools にゃん~
// Sistema completo com estatísticas e widgets
// ============================================

const Dashboard = {
    stats: {
        totalUses: 0,
        favoriteTools: [],
        lastAccess: null,
        weatherData: null,
        recentNotes: [],
        pendingTasks: []
    },
    
    render() {
        this.loadStats();
        const greeting = this.getGreeting();
        const currentTheme = Utils.loadData('app_color_theme') || 'purple';
        
        return `
            <div class="max-w-7xl mx-auto">
                <!-- Header Premium com Saudação -->
                <div class="relative mb-8 overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 blur-3xl opacity-20 -z-10"></div>
                    <div class="bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                        <!-- Partículas decorativas -->
                        <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        <div class="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
                        
                        <div class="relative flex items-center justify-between">
                            <div class="flex items-center gap-6">
                                <div class="text-8xl animate-bounce-slow">🐱</div>
                                <div>
                                    <h1 class="text-5xl font-black mb-2">${greeting}!</h1>
                                    <p class="text-2xl text-purple-100 font-semibold">Bem-vindo de volta, ${App.user.username}! にゃん~</p>
                                    <p class="text-purple-200 mt-2">${this.getCurrentDateTime()}</p>
                                </div>
                            </div>
                            <div class="hidden md:block text-6xl opacity-50">✨</div>
                        </div>
                    </div>
                </div>
                
                <!-- Cards de Estatísticas -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    ${this.renderStatsCards()}
                </div>
                
                <!-- Grid Principal -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <!-- Acesso Rápido -->
                    <div class="lg:col-span-2">
                        ${this.renderQuickAccess()}
                    </div>
                    
                    <!-- Clima Widget -->
                    <div>
                        ${this.renderWeatherWidget()}
                    </div>
                </div>
                
                <!-- Segunda Linha -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <!-- Notas Recentes -->
                    ${this.renderRecentNotes()}
                    
                    <!-- Tarefas Pendentes -->
                    ${this.renderPendingTasks()}
                </div>
                
                <!-- Dicas e Novidades -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    ${this.renderTipsCard()}
                    ${this.renderWhatsNew()}
                </div>
            </div>
        `;
    },
    
    renderStatsCards() {
        const tools = App.tools.filter(t => t.id !== 'home');
        const gamesPlayed = (Utils.loadData('termo_state') ? 1 : 0) + 
                           (Utils.loadData('forca_state') ? 1 : 0);
        
        return `
            <!-- Total de Ferramentas -->
            <div class="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all">
                <div class="flex items-center justify-between mb-4">
                    <div class="text-5xl">🛠️</div>
                    <div class="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold">
                        Disponível
                    </div>
                </div>
                <div class="text-4xl font-black mb-1">${tools.length}</div>
                <div class="text-blue-100 font-semibold">Ferramentas</div>
            </div>
            
            <!-- Jogos Jogados -->
            <div class="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all">
                <div class="flex items-center justify-between mb-4">
                    <div class="text-5xl">🎮</div>
                    <div class="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold">
                        Offline
                    </div>
                </div>
                <div class="text-4xl font-black mb-1">${gamesPlayed}</div>
                <div class="text-purple-100 font-semibold">Jogos Ativos</div>
            </div>
            
            <!-- Tema Atual -->
            <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all">
                <div class="flex items-center justify-between mb-4">
                    <div class="text-5xl">🎨</div>
                    <div class="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold">
                        Tema
                    </div>
                </div>
                <div class="text-2xl font-black mb-1 capitalize">${this.getThemeName()}</div>
                <div class="text-green-100 font-semibold">Personalizado</div>
            </div>
            
            <!-- Status Online -->
            <div class="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all">
                <div class="flex items-center justify-between mb-4">
                    <div class="text-5xl">${App.isOnline ? '🟢' : '🔴'}</div>
                    <div class="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold">
                        Status
                    </div>
                </div>
                <div class="text-2xl font-black mb-1">${App.isOnline ? 'Online' : 'Offline'}</div>
                <div class="text-orange-100 font-semibold">Conexão</div>
            </div>
        `;
    },
    
    renderQuickAccess() {
        const favorites = this.getFavoriteTools();
        
        return `
            <div class="bg-white rounded-2xl shadow-2xl p-8">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-3xl font-black text-gray-800 flex items-center gap-3">
                        <span>⚡</span>
                        <span>Acesso Rápido</span>
                    </h2>
                    <button onclick="Dashboard.customizeFavorites()" 
                            class="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-xl font-bold text-sm transition-all">
                        ⚙️ Personalizar
                    </button>
                </div>
                
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    ${favorites.map(tool => `
                        <button onclick="Router.navigate('${tool.id}')" 
                                class="group bg-gradient-to-br from-gray-50 to-gray-100 hover:from-purple-50 hover:to-pink-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all text-center border-2 border-gray-200 hover:border-purple-300">
                            <div class="text-5xl mb-3 group-hover:scale-110 transition-transform">${tool.icon}</div>
                            <div class="font-bold text-gray-800 mb-1">${tool.name}</div>
                            <div class="text-xs text-gray-600">${tool.description}</div>
                        </button>
                    `).join('')}
                </div>
                
                <div class="mt-6 pt-6 border-t-2 border-gray-200">
                    <button onclick="Router.navigate('home')" 
                            class="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold hover:shadow-xl transform hover:scale-105 transition-all">
                        📂 Ver Todas as Ferramentas
                    </button>
                </div>
            </div>
        `;
    },
    
    renderWeatherWidget() {
        const apiKey = Utils.loadData('weather_api_key');
        
        if (!apiKey || !apiKey.key) {
            return `
                <div class="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-8 text-white shadow-2xl h-full flex flex-col justify-center">
                    <div class="text-center">
                        <div class="text-7xl mb-4">🌤️</div>
                        <h3 class="text-2xl font-black mb-3">Clima Local</h3>
                        <p class="text-blue-100 mb-6">Configure sua API Key para ver o clima!</p>
                        <button onclick="Router.navigate('weather')" 
                                class="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:shadow-xl transform hover:scale-105 transition-all">
                            ⚙️ Configurar
                        </button>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-8 text-white shadow-2xl h-full">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-2xl font-black">🌤️ Clima</h3>
                    <button onclick="Router.navigate('weather')" 
                            class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-bold text-sm transition-all">
                        Ver Mais
                    </button>
                </div>
                
                <div class="text-center">
                    <div class="text-6xl mb-4">⏳</div>
                    <p class="text-orange-100 mb-4">Carregando dados do clima...</p>
                    <button onclick="Dashboard.loadWeather()" 
                            class="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition-all">
                        🔄 Atualizar
                    </button>
                </div>
            </div>
        `;
    },
    
    renderRecentNotes() {
        const notes = Utils.loadData('notes') || [];
        const recentNotes = notes.slice(-3).reverse();
        
        return `
            <div class="bg-white rounded-2xl shadow-2xl p-8">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-3xl font-black text-gray-800 flex items-center gap-3">
                        <span>📝</span>
                        <span>Notas Recentes</span>
                    </h2>
                    <button onclick="Router.navigate('notes')" 
                            class="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-xl font-bold text-sm transition-all">
                        + Nova Nota
                    </button>
                </div>
                
                ${recentNotes.length > 0 ? `
                    <div class="space-y-3">
                        ${recentNotes.map((note, i) => `
                            <div class="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-200 hover:border-yellow-400 transition-all transform hover:scale-102">
                                <div class="flex items-start justify-between gap-3">
                                    <div class="flex-1">
                                        <div class="font-bold text-gray-800 mb-1 line-clamp-1">${note.title || 'Sem título'}</div>
                                        <div class="text-sm text-gray-600 line-clamp-2">${note.content}</div>
                                    </div>
                                    <div class="text-2xl">${i === 0 ? '📌' : '📄'}</div>
                                </div>
                                <div class="flex items-center justify-between mt-3 pt-3 border-t border-yellow-200">
                                    <span class="text-xs text-gray-500">${Utils.formatDate(note.created)}</span>
                                    <button onclick="Router.navigate('notes')" 
                                            class="text-xs text-yellow-700 hover:text-yellow-900 font-bold">
                                        Abrir →
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="text-center py-12">
                        <div class="text-7xl mb-4 opacity-50">📝</div>
                        <p class="text-gray-500 mb-4">Nenhuma nota ainda</p>
                        <button onclick="Router.navigate('notes')" 
                                class="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-bold hover:shadow-xl transform hover:scale-105 transition-all">
                            ✍️ Criar Primeira Nota
                        </button>
                    </div>
                `}
            </div>
        `;
    },
    
    renderPendingTasks() {
        const tasks = Utils.loadData('tasks') || [];
        const pendingTasks = tasks.filter(t => !t.completed).slice(0, 5);
        
        return `
            <div class="bg-white rounded-2xl shadow-2xl p-8">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-3xl font-black text-gray-800 flex items-center gap-3">
                        <span>✅</span>
                        <span>Tarefas Pendentes</span>
                    </h2>
                    <button onclick="Router.navigate('tasks')" 
                            class="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-xl font-bold text-sm transition-all">
                        + Nova Tarefa
                    </button>
                </div>
                
                ${pendingTasks.length > 0 ? `
                    <div class="space-y-3">
                        ${pendingTasks.map(task => `
                            <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 hover:border-green-400 transition-all">
                                <div class="flex items-start gap-3">
                                    <input type="checkbox" 
                                           onchange="Dashboard.toggleTask('${task.id}')"
                                           class="w-5 h-5 mt-1 accent-green-600 cursor-pointer">
                                    <div class="flex-1">
                                        <div class="font-bold text-gray-800 mb-1">${task.title}</div>
                                        ${task.description ? `<div class="text-sm text-gray-600">${task.description}</div>` : ''}
                                    </div>
                                    <div class="text-2xl">${this.getPriorityEmoji(task.priority)}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="text-center py-12">
                        <div class="text-7xl mb-4 opacity-50">✅</div>
                        <p class="text-gray-500 mb-4">Nenhuma tarefa pendente!</p>
                        <button onclick="Router.navigate('tasks')" 
                                class="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-xl transform hover:scale-105 transition-all">
                            📋 Criar Primeira Tarefa
                        </button>
                    </div>
                `}
            </div>
        `;
    },
    
    renderTipsCard() {
        const tips = [
            { icon: '🔑', text: 'Use o Gerador de Senhas para criar senhas super seguras!' },
            { icon: '🎮', text: 'Jogue Termo e Forca offline - nova palavra todo dia!' },
            { icon: '🎵', text: 'O Player de Música toca em segundo plano!' },
            { icon: '🌍', text: 'O Tradutor funciona em 12+ idiomas diferentes!' },
            { icon: '🤖', text: 'Configure sua API do Gemini no Assistente IA!' }
        ];
        
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        
        return `
            <div class="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-8 text-white shadow-2xl">
                <div class="flex items-start gap-4">
                    <div class="text-6xl">${randomTip.icon}</div>
                    <div class="flex-1">
                        <h3 class="text-2xl font-black mb-3">💡 Dica do Dia</h3>
                        <p class="text-yellow-50 text-lg leading-relaxed">${randomTip.text}</p>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderWhatsNew() {
        return `
            <div class="bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-2xl p-8 text-white shadow-2xl">
                <div class="flex items-start gap-4">
                    <div class="text-6xl">🎉</div>
                    <div class="flex-1">
                        <h3 class="text-2xl font-black mb-3">✨ Novidades v${App.version}</h3>
                        <ul class="space-y-2 text-purple-100">
                            <li class="flex items-center gap-2">
                                <span>🎨</span>
                                <span>8 Temas de cores disponíveis!</span>
                            </li>
                            <li class="flex items-center gap-2">
                                <span>📊</span>
                                <span>Dashboard inicial completo</span>
                            </li>
                            <li class="flex items-center gap-2">
                                <span>🎮</span>
                                <span>Jogos Termo e Forca funcionando</span>
                            </li>
                        </ul>
                        <button onclick="Router.navigate('updates')" 
                                class="mt-4 w-full py-2 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition-all">
                            Ver Changelog Completo →
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    // ============================================
    // MÉTODOS AUXILIARES
    // ============================================
    
    getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bom dia';
        if (hour < 18) return 'Boa tarde';
        return 'Boa noite';
    },
    
    getCurrentDateTime() {
        const now = new Date();
        const date = now.toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const time = now.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        return `${date} • ${time}`;
    },
    
    getThemeName() {
        const themeNames = {
            purple: 'Roxo',
            blue: 'Azul',
            green: 'Verde',
            red: 'Vermelho',
            orange: 'Laranja',
            pink: 'Rosa',
            teal: 'Turquesa',
            indigo: 'Índigo'
        };
        const theme = Utils.loadData('app_color_theme') || 'purple';
        return themeNames[theme] || 'Padrão';
    },
    
    getFavoriteTools() {
        const saved = Utils.loadData('favorite_tools');
        if (saved && Array.isArray(saved)) {
            return saved.map(id => App.tools.find(t => t.id === id)).filter(Boolean);
        }
        
        // Padrão: 6 primeiras ferramentas (exceto home)
        return App.tools.filter(t => t.id !== 'home').slice(0, 6);
    },
    
    getPriorityEmoji(priority) {
        const emojis = {
            high: '🔴',
            medium: '🟡',
            low: '🟢'
        };
        return emojis[priority] || '⚪';
    },
    
    loadStats() {
        this.stats.totalUses = Utils.loadData('total_app_uses') || 0;
        this.stats.lastAccess = Utils.loadData('last_access');
        
        // Incrementar contador de usos
        this.stats.totalUses++;
        Utils.saveData('total_app_uses', this.stats.totalUses);
        Utils.saveData('last_access', Date.now());
    },
    
    init() {
        console.log('📊 Dashboard inicializado');
        this.loadStats();
    },
    
    customizeFavorites() {
        Utils.showNotification('⚙️ Personalização em breve! にゃん~', 'info');
        // TODO: Implementar modal de seleção de favoritos
    },
    
    toggleTask(taskId) {
        const tasks = Utils.loadData('tasks') || [];
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            Utils.saveData('tasks', tasks);
            Utils.showNotification('✅ Tarefa concluída! にゃん~', 'success');
            Router.render();
        }
    },
    
    loadWeather() {
        Utils.showNotification('🌤️ Carregando clima... にゃん~', 'info');
        Router.navigate('weather');
    }
};

window.Dashboard = Dashboard;