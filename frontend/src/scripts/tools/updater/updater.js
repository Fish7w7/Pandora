const AutoUpdater = {
    currentVersion: '2.0.0',
    updateUrl: 'https://raw.githubusercontent.com/Fish7w7/Pandora/main/version.json',
    githubReleasesUrl: 'https://github.com/Fish7w7/Pandora/releases',
    checking: false,
    updateAvailable: false,
    latestVersion: null,
    
    render() {
        return `
            <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                    <h1 class="text-5xl font-black text-gray-800 mb-3">🔄 Atualizações</h1>
                    <p class="text-gray-600 text-lg">Mantenha seu ToolBox sempre atualizado</p>
                </div>
                
                <!-- Versão Atual -->
                <div class="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-8 text-white shadow-2xl mb-6">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center gap-4">
                            <div class="text-6xl">🧰</div>
                            <div>
                                <h2 class="text-3xl font-black">ToolBox</h2>
                                <p class="text-blue-100">Sua caixa de ferramentas definitiva</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-sm text-blue-100 mb-1">Versão Atual</div>
                            <div class="text-4xl font-black">v${this.currentVersion}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Status da Atualização -->
                <div id="update-status" class="bg-white rounded-2xl shadow-2xl p-8 mb-6">
                    ${this.renderStatus()}
                </div>
                
                <!-- Botão Verificar -->
                <div class="text-center mb-6">
                    <button onclick="AutoUpdater.checkForUpdates()" 
                            id="check-updates-btn"
                            class="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-xl shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-3">
                        <span class="text-3xl">🔍</span>
                        <span>Verificar Atualizações</span>
                    </button>
                </div>
                
                <!-- Changelog -->
                <div class="bg-white rounded-2xl shadow-2xl p-8 mb-6">
                    <h3 class="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
                        <span>📝</span>
                        <span>Histórico de Versões</span>
                    </h3>
                    
                    <div class="space-y-6">
                        ${this.renderChangelog()}
                    </div>
                </div>
                
                <!-- Configurações -->
                <div class="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
                    <h3 class="text-2xl font-black mb-4 flex items-center gap-2">
                        <span>⚙️</span>
                        <span>Configurações</span>
                    </h3>
                    
                    <label class="flex items-center gap-3 p-4 bg-white/20 rounded-xl cursor-pointer hover:bg-white/30 transition-all mb-4">
                        <input type="checkbox" id="auto-check-updates" 
                               ${this.getAutoCheckSetting() ? 'checked' : ''}
                               onchange="AutoUpdater.toggleAutoCheck(this.checked)"
                               class="w-6 h-6 accent-purple-600">
                        <div>
                            <div class="font-bold text-lg">Verificar automaticamente ao iniciar</div>
                            <div class="text-purple-100 text-sm">O app irá verificar por atualizações toda vez que você abrir</div>
                        </div>
                    </label>
                    
                    <div class="bg-white/10 rounded-xl p-4">
                        <div class="text-sm text-purple-100 mb-2">ℹ️ Como funciona:</div>
                        <ul class="text-sm text-purple-50 space-y-1 ml-4">
                            <li>• O sistema verifica atualizações no GitHub</li>
                            <li>• Você será notificado quando houver nova versão</li>
                            <li>• Download manual do instalador atualizado</li>
                            <li>• Suas configurações são preservadas</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderStatus() {
        if (this.checking) {
            return `
                <div class="text-center py-12">
                    <div class="loader mx-auto mb-4"></div>
                    <p class="text-gray-600 text-lg font-semibold">Verificando atualizações...</p>
                </div>
            `;
        }
        
        if (this.updateAvailable) {
            return `
                <div class="bg-gradient-to-br from-green-50 to-emerald-50 border-3 border-green-300 rounded-2xl p-8">
                    <div class="flex items-start gap-4 mb-6">
                        <div class="text-6xl">🎉</div>
                        <div class="flex-1">
                            <h3 class="text-3xl font-black text-green-800 mb-2">Nova Atualização Disponível!</h3>
                            <p class="text-green-700 text-lg mb-4">
                                Versão <strong class="text-2xl">${this.latestVersion.version}</strong> está disponível
                            </p>
                            <div class="bg-white/50 rounded-xl p-4 mb-4">
                                <h4 class="font-bold text-green-800 mb-2">📋 Novidades:</h4>
                                <ul class="text-green-700 space-y-1">
                                    ${this.latestVersion.changelog.map(item => `<li>• ${item}</li>`).join('')}
                                </ul>
                            </div>
                            <div class="flex gap-3">
                                <button onclick="AutoUpdater.downloadUpdate()" 
                                        class="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                                    ⬇️ Baixar Atualização
                                </button>
                                <button onclick="AutoUpdater.viewReleaseNotes()" 
                                        class="px-6 py-4 bg-white text-green-700 border-2 border-green-300 rounded-xl font-bold hover:bg-green-50 transition-all">
                                    📖 Ver Detalhes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="text-center py-12">
                <div class="text-7xl mb-4">✅</div>
                <h3 class="text-2xl font-bold text-gray-800 mb-2">Você está atualizado!</h3>
                <p class="text-gray-600">Versão ${this.currentVersion} é a mais recente</p>
            </div>
        `;
    },
    
    renderChangelog() {
        const changelog = [
            {
                version: '2.0.0',
                date: '2025-01-26',
                changes: [
                    '🎨 Nova interface moderna com Tailwind CSS',
                    '🤖 Assistente IA com Google Gemini',
                    '🌤️ Sistema de clima com previsão de 5 dias',
                    '🔄 Sistema de auto-atualização',
                    '🎮 Zona offline com jogos'
                ]
            }
        ];
        
        return changelog.map(release => `
            <div class="border-l-4 border-blue-500 pl-6 pb-6">
                <div class="flex items-center gap-3 mb-3">
                    <span class="px-4 py-1 bg-blue-100 text-blue-800 rounded-full font-bold">v${release.version}</span>
                    <span class="text-gray-500 text-sm">${new Date(release.date).toLocaleDateString('pt-BR')}</span>
                </div>
                <ul class="space-y-2 text-gray-700">
                    ${release.changes.map(change => `<li>${change}</li>`).join('')}
                </ul>
            </div>
        `).join('');
    },
    
    init() {
        const autoCheck = this.getAutoCheckSetting();
        if (autoCheck) {
            setTimeout(() => {
                this.checkForUpdates(true);
            }, 3000);
        }
    },
    
    async checkForUpdates(silent = false) {
        if (this.checking) return;
        
        this.checking = true;
        this.updateAvailable = false;
        
        if (!silent) {
            Router.render();
        }
        
        try {
            const response = await fetch(this.updateUrl + '?t=' + Date.now());
            
            if (!response.ok) {
                throw new Error('Erro ao verificar atualizações');
            }
            
            const data = await response.json();
            
            if (this.compareVersions(data.version, this.currentVersion) > 0) {
                this.updateAvailable = true;
                this.latestVersion = data;
                
                if (!silent) {
                    Utils.showNotification('🎉 Nova atualização disponível: v' + data.version, 'success');
                } else {
                    this.showUpdateNotification(data.version);
                }
            } else {
                if (!silent) {
                    Utils.showNotification('✅ Você está na versão mais recente!', 'success');
                }
            }
            
            Utils.saveData('last_update_check', { 
                date: Date.now(),
                version: this.currentVersion 
            });
            
        } catch (error) {
            console.error('Erro ao verificar atualizações:', error);
            if (!silent) {
                Utils.showNotification('❌ Erro ao verificar atualizações. Tente novamente.', 'error');
            }
        } finally {
            this.checking = false;
            if (!silent) {
                Router.render();
            }
        }
    },
    
    compareVersions(v1, v2) {
        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);
        
        for (let i = 0; i < 3; i++) {
            if (parts1[i] > parts2[i]) return 1;
            if (parts1[i] < parts2[i]) return -1;
        }
        return 0;
    },
    
    downloadUpdate() {
        if (!this.latestVersion) return;
        
        const url = this.latestVersion.downloadUrl || this.githubReleasesUrl;
        
        if (typeof require !== 'undefined') {
            try {
                const { shell } = require('electron');
                shell.openExternal(url);
            } catch (e) {
                window.open(url, '_blank');
            }
        } else {
            window.open(url, '_blank');
        }
        
        Utils.showNotification('🌐 Abrindo página de download...', 'info');
    },
    
    viewReleaseNotes() {
        if (!this.latestVersion) return;
        
        const url = this.latestVersion.releaseNotesUrl || this.githubReleasesUrl;
        
        if (typeof require !== 'undefined') {
            try {
                const { shell } = require('electron');
                shell.openExternal(url);
            } catch (e) {
                window.open(url, '_blank');
            }
        } else {
            window.open(url, '_blank');
        }
    },
    
    showUpdateNotification(version) {
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl z-50 max-w-sm animate-fadeIn';
        notification.innerHTML = `
            <div class="flex items-start gap-3">
                <span class="text-3xl">🎉</span>
                <div class="flex-1">
                    <div class="font-bold text-lg mb-1">Nova atualização!</div>
                    <div class="text-sm text-green-100 mb-3">Versão ${version} disponível</div>
                    <div class="flex gap-2">
                        <button onclick="Router.navigate('updates'); this.closest('.fixed').remove();" 
                                class="px-4 py-2 bg-white text-green-600 rounded-lg font-bold text-sm hover:bg-green-50 transition-all">
                            Ver Detalhes
                        </button>
                        <button onclick="this.closest('.fixed').remove();" 
                                class="px-4 py-2 bg-white/20 text-white rounded-lg font-semibold text-sm hover:bg-white/30 transition-all">
                            Depois
                        </button>
                    </div>
                </div>
                <button onclick="this.closest('.fixed').remove();" 
                        class="text-white hover:bg-white/20 p-1 rounded transition-all">
                    ✕
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }
        }, 15000);
    },
    
    getAutoCheckSetting() {
        const saved = Utils.loadData('auto_check_updates');
        return saved !== null ? saved : true;
    },
    
    toggleAutoCheck(enabled) {
        Utils.saveData('auto_check_updates', enabled);
        Utils.showNotification(
            enabled ? '✅ Verificação automática ativada' : '❌ Verificação automática desativada',
            enabled ? 'success' : 'info'
        );
    }
};

window.AutoUpdater = AutoUpdater;