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
        // Carregar configurações salvas
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
                    
                    <div class="mt-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                        <div class="flex items-start gap-3">
                            <span class="text-2xl">🚧</span>
                            <div class="flex-1">
                                <p class="text-yellow-800 font-semibold">Em Desenvolvimento</p>
                                <p class="text-yellow-700 text-sm">O tema escuro está sendo implementado e estará disponível em breve!</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Cor de Destaque -->
                <div class="bg-white rounded-2xl shadow-2xl p-8">
                    <div class="flex items-start gap-4 mb-6">
                        <div class="text-5xl">🎨</div>
                        <div class="flex-1">
                            <h3 class="text-2xl font-black text-gray-800 mb-2">Cor de Destaque</h3>
                            <p class="text-gray-600 mb-6">Personalize as cores da interface</p>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        ${this.renderColorOption('purple', '💜', 'Roxo', 'from-purple-500 to-pink-600', accentColor)}
                        ${this.renderColorOption('blue', '💙', 'Azul', 'from-blue-500 to-cyan-600', accentColor)}
                        ${this.renderColorOption('green', '💚', 'Verde', 'from-green-500 to-emerald-600', accentColor)}
                        ${this.renderColorOption('red', '❤️', 'Vermelho', 'from-red-500 to-pink-600', accentColor)}
                        ${this.renderColorOption('orange', '🧡', 'Laranja', 'from-orange-500 to-yellow-600', accentColor)}
                        ${this.renderColorOption('pink', '💖', 'Rosa', 'from-pink-500 to-rose-600', accentColor)}
                        ${this.renderColorOption('teal', '💎', 'Turquesa', 'from-teal-500 to-cyan-600', accentColor)}
                        ${this.renderColorOption('indigo', '💠', 'Índigo', 'from-indigo-500 to-purple-600', accentColor)}
                    </div>
                    
                    <div class="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                        <div class="flex items-start gap-3">
                            <span class="text-2xl">🚧</span>
                            <div class="flex-1">
                                <p class="text-blue-800 font-semibold">Em Desenvolvimento</p>
                                <p class="text-blue-700 text-sm">As cores personalizadas estarão disponíveis em breve!</p>
                            </div>
                        </div>
                    </div>
                </div>
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
        return `
            <div class="space-y-6">
                <!-- Info do App -->
                <div class="bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl p-8 text-white shadow-2xl">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center gap-4">
                            <div class="text-7xl">🐱</div>
                            <div>
                                <h2 class="text-4xl font-black">NyanTools</h2>
                                <p class="text-purple-100 text-lg">にゃん~ Your purr-fect toolkit</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-sm text-purple-100 mb-1">Versão</div>
                            <div class="text-4xl font-black">v${App.version}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Créditos -->
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
                        <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <span class="text-3xl">📧</span>
                            <div>
                                <div class="font-bold text-gray-800">kik73261@gmail.com</div>
                                <div class="text-sm text-gray-600">Email de Contato</div>
                            </div>
                        </div>
                        <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <span class="text-3xl">🌐</span>
                            <div>
                                <a href="https://github.com/Fish7w7/Pandora" target="_blank" class="font-bold text-blue-600 hover:underline">github.com/Fish7w7/Pandora</a>
                                <div class="text-sm text-gray-600">Repositório GitHub</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Tecnologias -->
                <div class="bg-white rounded-2xl shadow-2xl p-8">
                    <h3 class="text-2xl font-black text-gray-800 mb-6">🛠️ Tecnologias</h3>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div class="p-4 bg-blue-50 rounded-xl text-center">
                            <div class="text-3xl mb-2">⚛️</div>
                            <div class="font-bold text-gray-800">Electron</div>
                            <div class="text-xs text-gray-600">v27.0.0</div>
                        </div>
                        <div class="p-4 bg-cyan-50 rounded-xl text-center">
                            <div class="text-3xl mb-2">🎨</div>
                            <div class="font-bold text-gray-800">Tailwind CSS</div>
                            <div class="text-xs text-gray-600">v3.x</div>
                        </div>
                        <div class="p-4 bg-yellow-50 rounded-xl text-center">
                            <div class="text-3xl mb-2">📜</div>
                            <div class="font-bold text-gray-800">JavaScript</div>
                            <div class="text-xs text-gray-600">ES6+</div>
                        </div>
                        <div class="p-4 bg-green-50 rounded-xl text-center">
                            <div class="text-3xl mb-2">🤖</div>
                            <div class="font-bold text-gray-800">Google Gemini</div>
                            <div class="text-xs text-gray-600">API</div>
                        </div>
                        <div class="p-4 bg-orange-50 rounded-xl text-center">
                            <div class="text-3xl mb-2">🌤️</div>
                            <div class="font-bold text-gray-800">OpenWeather</div>
                            <div class="text-xs text-gray-600">API</div>
                        </div>
                        <div class="p-4 bg-purple-50 rounded-xl text-center">
                            <div class="text-3xl mb-2">🎵</div>
                            <div class="font-bold text-gray-800">YouTube</div>
                            <div class="text-xs text-gray-600">API</div>
                        </div>
                    </div>
                </div>
                
                <!-- Licença -->
                <div class="bg-white rounded-2xl shadow-2xl p-8">
                    <h3 class="text-2xl font-black text-gray-800 mb-4">📄 Licença</h3>
                    <div class="bg-gray-50 rounded-xl p-6">
                        <p class="text-gray-700 mb-4">
                            Este projeto está licenciado sob a <strong>Licença MIT</strong>.
                        </p>
                        <p class="text-sm text-gray-600">
                            Copyright © ${new Date().getFullYear()} Fish7w7. Todos os direitos reservados.
                        </p>
                    </div>
                </div>
                
                <!-- Links Úteis -->
                <div class="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-8 text-white shadow-2xl">
                    <h3 class="text-2xl font-black mb-6">🔗 Links Úteis</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <a href="https://github.com/Fish7w7/Pandora/issues" target="_blank" 
                           class="flex items-center gap-3 p-4 bg-white/20 hover:bg-white/30 rounded-xl transition-all">
                            <span class="text-2xl">🐛</span>
                            <span class="font-bold">Reportar Bug</span>
                        </a>
                        <a href="https://github.com/Fish7w7/Pandora/discussions" target="_blank" 
                           class="flex items-center gap-3 p-4 bg-white/20 hover:bg-white/30 rounded-xl transition-all">
                            <span class="text-2xl">💬</span>
                            <span class="font-bold">Sugestões</span>
                        </a>
                        <a href="https://github.com/Fish7w7/Pandora" target="_blank" 
                           class="flex items-center gap-3 p-4 bg-white/20 hover:bg-white/30 rounded-xl transition-all">
                            <span class="text-2xl">⭐</span>
                            <span class="font-bold">Dar Star no GitHub</span>
                        </a>
                        <a href="https://github.com/Fish7w7/Pandora/releases" target="_blank" 
                           class="flex items-center gap-3 p-4 bg-white/20 hover:bg-white/30 rounded-xl transition-all">
                            <span class="text-2xl">📦</span>
                            <span class="font-bold">Releases</span>
                        </a>
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
        // TODO: Implementar aplicação da cor
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
        // Converter bytes para KB
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
                    
                    // Confirmar antes de sobrescrever
                    const confirmed = confirm('⚠️ Isso irá sobrescrever todos os dados atuais. Continuar?');
                    if (!confirmed) return;
                    
                    // Importar dados
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
        
        // Remover apenas dados de cache, não configurações
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
        
        // Limpar tudo
        localStorage.clear();
        
        Utils.showNotification('🗑️ Todos os dados foram apagados! Recarregando...', 'info');
        setTimeout(() => location.reload(), 1500);
    },
    
    loadSettings() {
        // Carregar configurações salvas ao iniciar
        const theme = Utils.loadData('app_theme') || 'light';
        const accentColor = Utils.loadData('accent_color') || 'purple';
        
        // TODO: Aplicar tema e cores
        console.log('⚙️ Configurações carregadas:', { theme, accentColor });
    }
};

window.Settings = Settings;