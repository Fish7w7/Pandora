// ============================================
// SISTEMA DE TEMAS v2.5.1 にゃん~ - BUGFIX
// ============================================

function renderThemeSelector() {
    const currentTheme = Utils.loadData('app_color_theme') || 'purple';
    
    const themes = [
        {
            id: 'purple',
            name: 'Roxo Místico',
            emoji: '💜',
            gradient: 'from-purple-500 via-pink-500 to-red-500',
            preview: ['#a855f7', '#ec4899', '#ef4444'],
            description: 'Vibrante e energético'
        },
        {
            id: 'blue',
            name: 'Azul Oceano',
            emoji: '💙',
            gradient: 'from-blue-500 via-cyan-500 to-purple-500',
            preview: ['#3b82f6', '#06b6d4', '#8b5cf6'],
            description: 'Calmo e profissional'
        },
        {
            id: 'green',
            name: 'Verde Natureza',
            emoji: '💚',
            gradient: 'from-green-500 via-teal-500 to-lime-500',
            preview: ['#10b981', '#14b8a6', '#84cc16'],
            description: 'Fresco e natural'
        },
        {
            id: 'red',
            name: 'Vermelho Paixão',
            emoji: '❤️',
            gradient: 'from-red-500 via-orange-500 to-pink-500',
            preview: ['#ef4444', '#f97316', '#ec4899'],
            description: 'Intenso e poderoso'
        },
        {
            id: 'orange',
            name: 'Laranja Solar',
            emoji: '🧡',
            gradient: 'from-orange-500 via-yellow-500 to-red-500',
            preview: ['#f97316', '#eab308', '#ef4444'],
            description: 'Quente e acolhedor'
        },
        {
            id: 'pink',
            name: 'Rosa Kawaii',
            emoji: '💖',
            gradient: 'from-pink-500 via-rose-500 to-purple-500',
            preview: ['#ec4899', '#f43f5e', '#a855f7'],
            description: 'Doce e charmoso'
        },
        {
            id: 'teal',
            name: 'Turquesa Tropical',
            emoji: '💎',
            gradient: 'from-teal-500 via-cyan-500 to-green-500',
            preview: ['#14b8a6', '#06b6d4', '#10b981'],
            description: 'Refrescante e moderno'
        },
        {
            id: 'indigo',
            name: 'Índigo Noturno',
            emoji: '💠',
            gradient: 'from-indigo-500 via-purple-500 to-blue-500',
            preview: ['#6366f1', '#8b5cf6', '#3b82f6'],
            description: 'Elegante e profundo'
        }
    ];
    
    return `
        <div class="bg-white rounded-2xl shadow-2xl p-8">
            <div class="flex items-start gap-4 mb-6">
                <div class="text-5xl">🎨</div>
                <div class="flex-1">
                    <h3 class="text-2xl font-black text-gray-800 mb-2">Tema de Cores</h3>
                    <p class="text-gray-600 mb-6">Escolha um dos 8 esquemas de cores disponíveis</p>
                </div>
            </div>
            
            <!-- Preview do tema atual -->
            <div class="mb-8 p-6 rounded-2xl bg-gradient-to-r ${themes.find(t => t.id === currentTheme).gradient} text-white">
                <div class="flex items-center gap-4">
                    <div class="text-6xl">${themes.find(t => t.id === currentTheme).emoji}</div>
                    <div>
                        <div class="text-sm font-semibold opacity-90 mb-1">TEMA ATUAL</div>
                        <div class="text-3xl font-black">${themes.find(t => t.id === currentTheme).name}</div>
                        <div class="text-sm opacity-90 mt-1">${themes.find(t => t.id === currentTheme).description}</div>
                    </div>
                </div>
            </div>
            
            <!-- Grid de temas -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                ${themes.map(theme => `
                    <button onclick="ThemeManager.applyTheme('${theme.id}')" 
                            data-theme-card="${theme.id}"
                            class="relative group overflow-hidden rounded-2xl border-4 ${currentTheme === theme.id ? 'border-gray-800 scale-105' : 'border-gray-200'} transition-all hover:scale-105 hover:shadow-2xl">
                        
                        <div class="bg-gradient-to-br ${theme.gradient} p-6 text-white text-center">
                            <div class="text-5xl mb-3 transform group-hover:scale-110 transition-transform">${theme.emoji}</div>
                            <div class="font-bold text-lg mb-2">${theme.name}</div>
                            <div class="flex justify-center gap-1 mb-2">
                                ${theme.preview.map(color => `
                                    <div class="w-6 h-6 rounded-full border-2 border-white shadow-lg" style="background-color: ${color}"></div>
                                `).join('')}
                            </div>
                            <div class="text-xs opacity-90">${theme.description}</div>
                        </div>
                        
                        ${currentTheme === theme.id ? `
                            <div class="absolute top-2 right-2 bg-white text-gray-800 px-3 py-1 rounded-full text-xs font-black shadow-lg flex items-center gap-1">
                                <span>✓</span>
                                <span>ATIVO</span>
                            </div>
                        ` : ''}
                        
                        <div class="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all"></div>
                    </button>
                `).join('')}
            </div>
            
            <div class="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <div class="flex items-start gap-3">
                    <span class="text-3xl">💡</span>
                    <div class="flex-1">
                        <h4 class="font-bold text-blue-900 mb-2">Dicas de Personalização</h4>
                        <ul class="text-blue-800 text-sm space-y-1">
                            <li>✨ Os temas funcionam tanto no <strong>modo claro</strong> quanto no <strong>modo escuro</strong></li>
                            <li>🎨 As cores se aplicam automaticamente a: sidebar, botões, links, ícones e animações</li>
                            <li>💾 Sua escolha é salva automaticamente e permanece após reiniciar o app</li>
                            <li>🔄 Troca instantânea - veja a mudança em tempo real!</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Sistema de Configurações Completo にゃん~
const Settings = {
    currentTab: 'appearance',
    
    tabs: [
        { id: 'appearance', name: 'Aparência', icon: '🎨' },
        { id: 'updates', name: 'Atualizações', icon: '🔄' },
        { id: 'notifications', name: 'Notificações', icon: '🔔' },
        { id: 'data', name: 'Dados', icon: '💾' },
        { id: 'about', name: 'Sobre', icon: 'ℹ️' }
    ],
    
    render() {
        return `
            <div class="max-w-6xl mx-auto">
                <!-- Header -->
                <div class="text-center mb-8">
                    <div class="inline-block mb-4">
                        <div class="relative">
                            <div class="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-50"></div>
                            <div class="relative text-7xl animate-bounce-slow">⚙️</div>
                        </div>
                    </div>
                    <h1 class="text-5xl font-black mb-3 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                        Configurações
                    </h1>
                    <p class="text-gray-600 text-lg font-semibold">Personalize seu NyanTools にゃん~</p>
                </div>
                
                <!-- Tabs Navigation -->
                <div class="bg-white rounded-2xl shadow-2xl mb-6 p-4">
                    <div class="flex gap-2 overflow-x-auto pb-2">
                        ${this.tabs.map(tab => `
                            <button onclick="Settings.switchTab('${tab.id}')" 
                                    class="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                                        this.currentTab === tab.id 
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg scale-105' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }">
                                <span class="text-2xl">${tab.icon}</span>
                                <span>${tab.name}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Tab Content -->
                <div id="settings-content" class="animate-fadeIn">
                    ${this.renderTabContent()}
                </div>
            </div>
        `;
    },
    
    init() {
        // Carregar configurações salvas (mas NÃO reinicializar o tema)
        this.loadSettings();
    },
    
    renderTabContent() {
        switch(this.currentTab) {
            case 'appearance':
                return this.renderAppearance();
            case 'updates':
                return this.renderUpdates();
            case 'notifications':
                return this.renderNotifications();
            case 'data':
                return this.renderData();
            case 'about':
                return this.renderAbout();
            default:
                return '';
        }
    },
    
    renderAppearance() {
        const theme = Utils.loadData('app_theme') || 'light';
        const accentColor = Utils.loadData('accent_color') || 'purple';
        
        return `
            <div class="space-y-6">
                <!-- Tema Claro/Escuro -->
                <div class="bg-white rounded-2xl shadow-2xl p-8">
                    <div class="flex items-start gap-4 mb-6">
                        <div class="text-5xl">🌓</div>
                        <div class="flex-1">
                            <h3 class="text-2xl font-black text-gray-800 mb-2">Tema</h3>
                            <p class="text-gray-600 mb-6">Escolha entre modo claro ou escuro</p>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Tema Claro -->
                        <button onclick="Settings.setTheme('light')" 
                                class="group relative overflow-hidden rounded-2xl border-4 ${theme === 'light' ? 'border-purple-500' : 'border-gray-200'} transition-all hover:scale-105">
                            <div class="bg-gradient-to-br from-white to-gray-100 p-8 text-center">
                                <div class="text-6xl mb-4">☀️</div>
                                <h4 class="text-xl font-bold text-gray-800 mb-2">Tema Claro</h4>
                                <p class="text-sm text-gray-600">Interface brilhante e limpa</p>
                            </div>
                            ${theme === 'light' ? '<div class="absolute top-4 right-4 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold">✓ Ativo</div>' : ''}
                        </button>
                        
                        <!-- Tema Escuro -->
                        <button onclick="Settings.setTheme('dark')" 
                                class="group relative overflow-hidden rounded-2xl border-4 ${theme === 'dark' ? 'border-purple-500' : 'border-gray-200'} transition-all hover:scale-105">
                            <div class="bg-gradient-to-br from-gray-800 to-gray-900 p-8 text-center">
                                <div class="text-6xl mb-4">🌙</div>
                                <h4 class="text-xl font-bold text-white mb-2">Tema Escuro</h4>
                                <p class="text-sm text-gray-300">Reduz fadiga ocular</p>
                            </div>
                            ${theme === 'dark' ? '<div class="absolute top-4 right-4 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold">✓ Ativo</div>' : ''}
                        </button>
                    </div>
                </div>
                
                <!-- Cor de Destaque -->
                ${renderThemeSelector()}
            </div>
        `;
    },
    
    renderColorOption(id, emoji, name, gradient, current) {
        const isActive = current === id;
        return `
            <button onclick="Settings.setAccentColor('${id}')" 
                    class="relative group overflow-hidden rounded-2xl border-4 ${isActive ? 'border-gray-800' : 'border-gray-200'} transition-all hover:scale-105">
                <div class="bg-gradient-to-br ${gradient} p-6 text-center text-white">
                    <div class="text-4xl mb-2">${emoji}</div>
                    <div class="font-bold">${name}</div>
                </div>
                ${isActive ? '<div class="absolute top-2 right-2 bg-white text-gray-800 px-2 py-1 rounded-full text-xs font-bold">✓</div>' : ''}
            </button>
        `;
    },
    
    renderUpdates() {
        return `
            <div class="bg-white rounded-2xl shadow-2xl p-8">
                <div class="flex items-start gap-4 mb-6">
                    <div class="text-5xl">🔄</div>
                    <div class="flex-1">
                        <h3 class="text-2xl font-black text-gray-800 mb-2">Sistema de Atualizações</h3>
                        <p class="text-gray-600 mb-6">Gerencie como o NyanTools verifica atualizações</p>
                    </div>
                </div>
                
                ${AutoUpdater.render()}
            </div>
        `;
    },
    
    renderNotifications() {
        const notificationsEnabled = Utils.loadData('notifications_enabled') !== false;
        const soundEnabled = Utils.loadData('notification_sound') !== false;
        
        return `
            <div class="space-y-6">
                <!-- Habilitar Notificações -->
                <div class="bg-white rounded-2xl shadow-2xl p-8">
                    <div class="flex items-start gap-4 mb-6">
                        <div class="text-5xl">🔔</div>
                        <div class="flex-1">
                            <h3 class="text-2xl font-black text-gray-800 mb-2">Notificações</h3>
                            <p class="text-gray-600 mb-6">Controle as notificações do aplicativo</p>
                        </div>
                    </div>
                    
                    <div class="space-y-4">
                        <!-- Toggle Notificações -->
                        <label class="flex items-center justify-between p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl cursor-pointer hover:shadow-lg transition-all">
                            <div class="flex items-center gap-4">
                                <div class="text-4xl">📬</div>
                                <div>
                                    <div class="font-bold text-lg text-gray-800">Habilitar Notificações</div>
                                    <div class="text-sm text-gray-600">Receba alertas importantes do aplicativo</div>
                                </div>
                            </div>
                            <input type="checkbox" 
                                   ${notificationsEnabled ? 'checked' : ''}
                                   onchange="Settings.toggleNotifications(this.checked)"
                                   class="w-14 h-8 accent-blue-600 cursor-pointer">
                        </label>
                        
                        <!-- Toggle Som -->
                        <label class="flex items-center justify-between p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl cursor-pointer hover:shadow-lg transition-all ${!notificationsEnabled ? 'opacity-50 cursor-not-allowed' : ''}">
                            <div class="flex items-center gap-4">
                                <div class="text-4xl">🔊</div>
                                <div>
                                    <div class="font-bold text-lg text-gray-800">Som de Notificação</div>
                                    <div class="text-sm text-gray-600">Tocar um som ao mostrar notificações</div>
                                </div>
                            </div>
                            <input type="checkbox" 
                                   ${soundEnabled ? 'checked' : ''}
                                   ${!notificationsEnabled ? 'disabled' : ''}
                                   onchange="Settings.toggleSound(this.checked)"
                                   class="w-14 h-8 accent-purple-600 cursor-pointer">
                        </label>
                    </div>
                    
                    <!-- Teste de Notificação -->
                    <div class="mt-6">
                        <button onclick="Settings.testNotification()" 
                                ${!notificationsEnabled ? 'disabled' : ''}
                                class="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2">
                            <span>🧪</span>
                            <span>Testar Notificação</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderData() {
        const totalData = this.calculateStorageSize();
        
        return `
            <div class="space-y-6">
                <!-- Uso de Armazenamento -->
                <div class="bg-white rounded-2xl shadow-2xl p-8">
                    <div class="flex items-start gap-4 mb-6">
                        <div class="text-5xl">💾</div>
                        <div class="flex-1">
                            <h3 class="text-2xl font-black text-gray-800 mb-2">Gerenciar Dados</h3>
                            <p class="text-gray-600 mb-6">Controle os dados armazenados localmente</p>
                        </div>
                    </div>
                    
                    <!-- Storage Info -->
                    <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 mb-6">
                        <div class="flex items-center justify-between mb-4">
                            <span class="font-bold text-gray-800">📊 Uso de Armazenamento</span>
                            <span class="text-2xl font-black text-blue-600">${totalData}</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div class="bg-gradient-to-r from-blue-500 to-cyan-600 h-full rounded-full" style="width: 15%"></div>
                        </div>
                        <p class="text-sm text-gray-600 mt-2">Dados salvos localmente no navegador</p>
                    </div>
                    
                    <!-- Opções de Dados -->
                    <div class="space-y-4">
                        <!-- Exportar Dados -->
                        <button onclick="Settings.exportData()" 
                                class="w-full flex items-center justify-between p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl hover:shadow-lg transition-all group">
                            <div class="flex items-center gap-4">
                                <div class="text-4xl group-hover:scale-110 transition-transform">📤</div>
                                <div class="text-left">
                                    <div class="font-bold text-lg text-gray-800">Exportar Dados</div>
                                    <div class="text-sm text-gray-600">Baixar backup de suas configurações</div>
                                </div>
                            </div>
                            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                            </svg>
                        </button>
                        
                        <!-- Importar Dados -->
                        <button onclick="Settings.importData()" 
                                class="w-full flex items-center justify-between p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl hover:shadow-lg transition-all group">
                            <div class="flex items-center gap-4">
                                <div class="text-4xl group-hover:scale-110 transition-transform">📥</div>
                                <div class="text-left">
                                    <div class="font-bold text-lg text-gray-800">Importar Dados</div>
                                    <div class="text-sm text-gray-600">Restaurar backup anterior</div>
                                </div>
                            </div>
                            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                            </svg>
                        </button>
                        
                        <!-- Limpar Cache -->
                        <button onclick="Settings.clearCache()" 
                                class="w-full flex items-center justify-between p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl hover:shadow-lg transition-all group">
                            <div class="flex items-center gap-4">
                                <div class="text-4xl group-hover:scale-110 transition-transform">🧹</div>
                                <div class="text-left">
                                    <div class="font-bold text-lg text-gray-800">Limpar Cache</div>
                                    <div class="text-sm text-gray-600">Remover dados temporários</div>
                                </div>
                            </div>
                            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                            </svg>
                        </button>
                        
                        <!-- Resetar Tudo -->
                        <button onclick="Settings.resetAll()" 
                                class="w-full flex items-center justify-between p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl hover:shadow-lg transition-all group">
                            <div class="flex items-center gap-4">
                                <div class="text-4xl group-hover:scale-110 transition-transform">⚠️</div>
                                <div class="text-left">
                                    <div class="font-bold text-lg text-red-700">Resetar Tudo</div>
                                    <div class="text-sm text-red-600">Apagar TODOS os dados (não pode ser desfeito)</div>
                                </div>
                            </div>
                            <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderAbout() {
        const currentYear = new Date().getFullYear();
        
        return `
            <div class="space-y-6">
                <div class="bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-2xl p-8 text-white shadow-2xl text-center overflow-hidden relative">
                    <div class="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full opacity-50 blur-xl"></div>
                    <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full opacity-50 blur-xl"></div>
                    
                    <div class="relative">
                        <div class="text-8xl mb-4 animate-bounce-slow">🐱</div>
                        <h2 class="text-5xl font-black">NyanTools にゃん~</h2>
                        <p class="text-purple-100 text-xl mt-2 mb-6">Sua caixa de ferramentas purr-feita!</p>
                        <div class="inline-block bg-white/30 backdrop-blur-sm text-white text-lg font-black px-6 py-2 rounded-full shadow-lg">
                            Versão ${App.version}
                        </div>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    <div class="space-y-6 lg:col-span-1">
                        
                        <div class="bg-white rounded-2xl shadow-2xl p-8">
                            <h3 class="text-2xl font-black text-gray-800 mb-6">👤 Desenvolvedor</h3>
                            <div class="space-y-4">
                                <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                    <span class="text-3xl">👨‍💻</span>
                                    <div>
                                        <div class="font-bold text-gray-800">Fish7w7</div>
                                        <div class="text-sm text-gray-600">Desenvolvedor Principal</div>
                                    </div>
                                </div>
                                <a href="https://github.com/Fish7w7/Pandora" target="_blank" class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer">
                                    <svg class="w-8 h-8 text-gray-700" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.165 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.951 0-1.093.39-1.988 1.03-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.818c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.026 2.747-1.026.546 1.379.202 2.398.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0 0 22 12c0-5.523-4.477-10-10-10Z" clip-rule="evenodd" /></svg>
                                    <div>
                                        <div class="font-bold text-blue-600">GitHub</div>
                                        <div class="text-sm text-gray-600">Fish7w7/Pandora</div>
                                    </div>
                                </a>
                                <a href="mailto:kik73261@gmail.com" class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer">
                                    <svg class="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    <div>
                                        <div class="font-bold text-gray-800">Email</div>
                                        <div class="text-sm text-gray-600">kik73261@gmail.com</div>
                                    </div>
                                </a>
                            </div>
                        </div>

                        <div class="bg-white rounded-2xl shadow-2xl p-8">
                            <h3 class="text-2xl font-black text-gray-800 mb-6">🔗 Links Úteis</h3>
                            <div class="space-y-3">
                                <a href="https://github.com/Fish7w7/Pandora/issues" target="_blank" class="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all">
                                    <span class="text-2xl">🐛</span>
                                    <span class="font-bold text-gray-800">Reportar Bug</span>
                                </a>
                                <a href="https://github.com/Fish7w7/Pandora/discussions" target="_blank" class="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all">
                                    <span class="text-2xl">💬</span>
                                    <span class="font-bold text-gray-800">Sugerir Ideias</span>
                                </a>
                                <a href="https://github.com/Fish7w7/Pandora" target="_blank" class="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all">
                                    <span class="text-2xl">⭐</span>
                                    <span class="font-bold text-gray-800">Dar Star no GitHub</span>
                                </a>
                                <a href="https://github.com/Fish7w7/Pandora/releases" target="_blank" class="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all">
                                    <span class="text-2xl">📦</span>
                                    <span class="font-bold text-gray-800">Ver Releases</span>
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    <div class="space-y-6 lg:col-span-2">
                        
                        <div class="bg-white rounded-2xl shadow-2xl p-8">
                            <h3 class="text-2xl font-black text-gray-800 mb-6">🛠️ Tecnologias</h3>
                            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div class="p-4 bg-blue-50 rounded-xl text-center transition-all transform hover:scale-105">
                                    <div class="text-4xl mb-2">⚛️</div>
                                    <div class="font-bold text-gray-800">Electron</div>
                                    <div class="text-xs text-gray-600">v27.0.0</div>
                                </div>
                                <div class="p-4 bg-cyan-50 rounded-xl text-center transition-all transform hover:scale-105">
                                    <div class="text-4xl mb-2">🎨</div>
                                    <div class="font-bold text-gray-800">Tailwind CSS</div>
                                    <div class="text-xs text-gray-600">v3.x</div>
                                </div>
                                <div class="p-4 bg-yellow-50 rounded-xl text-center transition-all transform hover:scale-105">
                                    <div class="text-4xl mb-2">📜</div>
                                    <div class="font-bold text-gray-800">JavaScript</div>
                                    <div class="text-xs text-gray-600">ES6+</div>
                                </div>
                                <div class="p-4 bg-green-50 rounded-xl text-center transition-all transform hover:scale-105">
                                    <div class="text-4xl mb-2">🤖</div>
                                    <div class="font-bold text-gray-800">Google Gemini</div>
                                    <div class="text-xs text-gray-600">API</div>
                                </div>
                                <div class="p-4 bg-orange-50 rounded-xl text-center transition-all transform hover:scale-105">
                                    <div class="text-4xl mb-2">🌤️</div>
                                    <div class="font-bold text-gray-800">OpenWeather</div>
                                    <div class="text-xs text-gray-600">API</div>
                                </div>
                                <div class="p-4 bg-purple-50 rounded-xl text-center transition-all transform hover:scale-105">
                                    <div class="text-4xl mb-2">🎵</div>
                                    <div class="font-bold text-gray-800">YouTube</div>
                                    <div class="text-xs text-gray-600">API</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-white rounded-2xl shadow-2xl p-8">
                            <h3 class="text-2xl font-black text-gray-800 mb-4">📄 Licença</h3>
                            <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <p class="text-gray-700 mb-4">
                                    Este projeto está licenciado sob a <strong>Licença MIT</strong>.
                                </p>
                                <p class="text-sm text-gray-600">
                                    Copyright © ${currentYear} Fish7w7. Todos os direitos reservados.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        `;
    },
    
    switchTab(tabId) {
        this.currentTab = tabId;
        Router.render();
    },
    
    setTheme(theme) {
        Utils.saveData('app_theme', theme);
        
        // Aplicar tema
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            Utils.showNotification('🌙 Tema escuro ativado', 'success');
        } else {
            document.body.classList.remove('dark-theme');
            Utils.showNotification('☀️ Tema claro ativado', 'success');
        }
        
        Router.render();
    },
    
    setAccentColor(color) {
        Utils.saveData('accent_color', color);
        Utils.showNotification(`🎨 Cor de destaque alterada`, 'success');
        Router.render();
    },
    
    toggleNotifications(enabled) {
        Utils.saveData('notifications_enabled', enabled);
        Utils.showNotification(enabled ? '🔔 Notificações ativadas' : '🔕 Notificações desativadas', 'success');
        Router.render();
    },
    
    toggleSound(enabled) {
        Utils.saveData('notification_sound', enabled);
        Utils.showNotification(enabled ? '🔊 Som ativado' : '🔇 Som desativado', 'success');
    },
    
    testNotification() {
        Utils.showNotification('🐱 Esta é uma notificação de teste にゃん~', 'success');
    },
    
    calculateStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        const kb = (total / 1024).toFixed(2);
        return `${kb} KB`;
    },
    
    exportData() {
        const data = {};
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                data[key] = localStorage[key];
            }
        }
        
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `nyantools-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        Utils.showNotification('📤 Backup exportado com sucesso!', 'success');
    },
    
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    
                    const confirmed = confirm('⚠️ Isso irá sobrescrever todos os dados atuais. Continuar?');
                    if (!confirmed) return;
                    
                    for (let key in data) {
                        localStorage.setItem(key, data[key]);
                    }
                    
                    Utils.showNotification('📥 Backup importado! Recarregando...', 'success');
                    setTimeout(() => location.reload(), 1500);
                } catch (error) {
                    Utils.showNotification('❌ Erro ao importar: arquivo inválido', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    },
    
    clearCache() {
        const confirmed = confirm('🧹 Deseja limpar o cache? Configurações serão preservadas.');
        if (!confirmed) return;
        
        const keysToRemove = [];
        for (let key in localStorage) {
            if (key.includes('cache') || key.includes('temp')) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        Utils.showNotification('🧹 Cache limpo com sucesso!', 'success');
        Router.render();
    },
    
    resetAll() {
        const confirmed = confirm('⚠️ ATENÇÃO: Isso irá apagar TODOS os dados do aplicativo!\n\nTodos os jogos, configurações, API keys e dados salvos serão perdidos permanentemente.\n\nDeseja continuar?');
        if (!confirmed) return;
        
        const doubleConfirm = confirm('🚨 Última chance! Tem certeza absoluta?\n\nEsta ação NÃO PODE ser desfeita!');
        if (!doubleConfirm) return;
        
        localStorage.clear();
        
        Utils.showNotification('🗑️ Todos os dados foram apagados! Recarregando...', 'info');
        setTimeout(() => location.reload(), 1500);
    },
    
    loadSettings() {
        const theme = Utils.loadData('app_theme') || 'light';
        const accentColor = Utils.loadData('accent_color') || 'purple';
        console.log('⚙️ Configurações carregadas:', { theme, accentColor });
    }
};

// ============================================
// GERENCIADOR DE TEMAS - BUGFIX
// ============================================

const ThemeManager = {
    currentTheme: 'purple',
    
    init() {
        const savedTheme = Utils.loadData('app_color_theme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
            this.applyTheme(savedTheme, true);
        } else {
            this.applyTheme('purple', true);
        }
        console.log('🎨 Tema carregado:', this.currentTheme);
    },
    
// 🔧 BUGFIX: Não recarregar a página, apenas atualizar o visual
    applyTheme(themeId, silent = false) {
        const validThemes = ['purple', 'blue', 'green', 'red', 'orange', 'pink', 'teal', 'indigo'];
        if (!validThemes.includes(themeId)) {
            console.error('❌ Tema inválido:', themeId);
            return;
        }
        
        // Atualizar tema ANTES de salvar
        this.currentTheme = themeId;
        document.body.setAttribute('data-theme', themeId);
        Utils.saveData('app_color_theme', themeId);
        
        // Forçar aplicação na sidebar
        setTimeout(() => {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.style.backgroundImage = 'linear-gradient(to bottom, var(--theme-primary-dark), var(--theme-primary), var(--theme-secondary))';
                sidebar.style.background = 'linear-gradient(to bottom, var(--theme-primary-dark), var(--theme-primary), var(--theme-secondary))';
                console.log('🎨 Sidebar forçada:', themeId);
            }
        }, 50);
        
        if (!silent) {
            const themeNames = {
                purple: '💜 Roxo Místico',
                blue: '💙 Azul Oceano',
                green: '💚 Verde Natureza',
                red: '❤️ Vermelho Paixão',
                orange: '🧡 Laranja Solar',
                pink: '💖 Rosa Kawaii',
                teal: '💎 Turquesa Tropical',
                indigo: '💠 Índigo Noturno'
            };
            
            Utils.showNotification(`✨ Tema ${themeNames[themeId]} aplicado!`, 'success');
            
            // 🔧 FIX: Atualizar IMEDIATAMENTE o preview visual
            this.updateThemePreviewInstant();
        }
        
        console.log('✅ Tema aplicado:', themeId);
    },
    
    // 🆕 Nova função: Atualizar preview INSTANTÂNEO sem delay
    updateThemePreviewInstant() {
        const themes = {
            purple: { name: 'Roxo Místico', emoji: '💜', description: 'Vibrante e energético', gradient: 'from-purple-500 via-pink-500 to-red-500' },
            blue: { name: 'Azul Oceano', emoji: '💙', description: 'Calmo e profissional', gradient: 'from-blue-500 via-cyan-500 to-purple-500' },
            green: { name: 'Verde Natureza', emoji: '💚', description: 'Fresco e natural', gradient: 'from-green-500 via-teal-500 to-lime-500' },
            red: { name: 'Vermelho Paixão', emoji: '❤️', description: 'Intenso e poderoso', gradient: 'from-red-500 via-orange-500 to-pink-500' },
            orange: { name: 'Laranja Solar', emoji: '🧡', description: 'Quente e acolhedor', gradient: 'from-orange-500 via-yellow-500 to-red-500' },
            pink: { name: 'Rosa Kawaii', emoji: '💖', description: 'Doce e charmoso', gradient: 'from-pink-500 via-rose-500 to-purple-500' },
            teal: { name: 'Turquesa Tropical', emoji: '💎', description: 'Refrescante e moderno', gradient: 'from-teal-500 via-cyan-500 to-green-500' },
            indigo: { name: 'Índigo Noturno', emoji: '💠', description: 'Elegante e profundo', gradient: 'from-indigo-500 via-purple-500 to-blue-500' }
        };
        
        const currentTheme = themes[this.currentTheme];
        if (!currentTheme) return;
        
        // 1. Atualizar o banner "TEMA ATUAL"
        const currentBanner = document.querySelector('.mb-8.p-6.rounded-2xl.bg-gradient-to-r');
        if (currentBanner) {
            currentBanner.className = `mb-8 p-6 rounded-2xl bg-gradient-to-r ${currentTheme.gradient} text-white`;
            currentBanner.querySelector('.text-6xl').textContent = currentTheme.emoji;
            currentBanner.querySelector('.text-3xl.font-black').textContent = currentTheme.name;
            currentBanner.querySelector('.text-sm.opacity-90.mt-1').textContent = currentTheme.description;
        }
        
        // 2. Atualizar bordas e badges dos cards
        document.querySelectorAll('[data-theme-card]').forEach(card => {
            const themeId = card.getAttribute('data-theme-card');
            const badge = card.querySelector('.absolute.top-2.right-2');
            
            if (themeId === this.currentTheme) {
                // Ativar este card
                card.classList.add('border-gray-800', 'scale-105');
                card.classList.remove('border-gray-200');
                
                // Adicionar badge se não existir
                if (!badge) {
                    card.insertAdjacentHTML('beforeend', `
                        <div class="absolute top-2 right-2 bg-white text-gray-800 px-3 py-1 rounded-full text-xs font-black shadow-lg flex items-center gap-1">
                            <span>✓</span>
                            <span>ATIVO</span>
                        </div>
                    `);
                }
            } else {
                // Desativar outros cards
                card.classList.remove('border-gray-800', 'scale-105');
                card.classList.add('border-gray-200');
                
                // Remover badge se existir
                if (badge) badge.remove();
            }
        });
        
        console.log('🎨 Preview atualizado instantaneamente para:', this.currentTheme);
    },
};

// ============================================
// AUTO-INICIALIZAÇÃO
// ============================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🎨 Inicializando ThemeManager via DOMContentLoaded');
        ThemeManager.init();
    });
} else {
    console.log('🎨 Inicializando ThemeManager imediatamente');
    ThemeManager.init();
}

window.ThemeManager = ThemeManager;
window.Settings = Settings;