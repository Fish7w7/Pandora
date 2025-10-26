const AutoUpdater = {
    currentVersion: '2.3.2',
    updateUrl: 'https://raw.githubusercontent.com/Fish7w7/Pandora/main/version.json',
    githubReleasesUrl: 'https://github.com/Fish7w7/Pandora/releases',
    checking: false,
    updateAvailable: false,
    latestVersion: null,
    minCheckInterval: 5 * 60 * 1000,
    
    render() {
        const lastCheck = Utils.loadData('last_update_check');
        const canCheck = this.canCheckNow();
        
        return `
            <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                    <h1 class="text-5xl font-black text-gray-800 mb-3">🔄 Atualizações</h1>
                    <p class="text-gray-600 text-lg">Mantenha seu NyanTools sempre atualizado にゃん~</p>
                </div>
                
                <!-- Versão Atual -->
                <div class="bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl p-8 text-white shadow-2xl mb-6">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center gap-4">
                            <div class="text-6xl">🐱</div>
                            <div>
                                <h2 class="text-3xl font-black">NyanTools</h2>
                                <p class="text-purple-100">にゃん~ Your purr-fect toolkit</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-sm text-purple-100 mb-1">Versão Atual</div>
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
                            ${!canCheck ? 'disabled' : ''}
                            class="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-xl shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                        <span class="text-3xl">🔍</span>
                        <span id="check-btn-text">Verificar Atualizações</span>
                    </button>
                    <p class="text-sm text-gray-500 mt-3" id="last-check-info">
                        ${this.getLastCheckText(lastCheck)}
                    </p>
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
                            <div class="text-purple-100 text-sm">O app irá verificar por atualizações toda vez que você abrir (respeitando o limite de 5 minutos)</div>
                        </div>
                    </label>
                    
                    <div class="bg-white/10 rounded-xl p-4">
                        <div class="text-sm text-purple-100 mb-2">ℹ️ Como funciona:</div>
                        <ul class="text-sm text-purple-50 space-y-1 ml-4">
                            <li>• O sistema verifica atualizações no GitHub</li>
                            <li>• Intervalo mínimo de 5 minutos entre verificações</li>
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
                    <p class="text-gray-600 text-lg font-semibold">Verificando atualizações... にゃん~</p>
                    <p class="text-sm text-gray-500 mt-2">Conectando ao GitHub...</p>
                </div>
            `;
        }
        
        if (this.updateAvailable) {
            return `
                <div class="bg-gradient-to-br from-green-50 to-emerald-50 border-3 border-green-300 rounded-2xl p-8">
                    <div class="flex items-start gap-4 mb-6">
                        <div class="text-6xl">🎉</div>
                        <div class="flex-1">
                            <h3 class="text-3xl font-black text-green-800 mb-2">Nova Atualização Disponível! にゃん~</h3>
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
                <h3 class="text-2xl font-bold text-gray-800 mb-2">Você está atualizado! にゃん~</h3>
                <p class="text-gray-600">Versão ${this.currentVersion} é a mais recente</p>
            </div>
        `;
    },
    
    renderChangelog() {
        const changelog = [
            {
                version: '2.3.2',
                date: '2025-10-27',
                changes: [
                    "🎮 NOVOS JOGOS: Termo e Forca totalmente funcionais!",
                    "⚙️ Sistema de Configurações completo com 5 abas",
                    "🌙 Tema Escuro implementado e funcional",
                    "🐛 Bug do Jogo da Velha corrigido (símbolos invertidos)",
                    "✨ Melhorias de performance e estabilidade",
                    "💾 Sistema de backup e restore de dados",
                    "🎨 Interface aprimorada em todos os jogos"
                ]
            },
            {
                version: '2.1.0',
                date: '2025-10-26',
                changes: [
                    '🐱 Rebranding completo para NyanTools',
                    '🎨 Nova identidade visual kawaii',
                    '🎌 Interface em tema japonês にゃん~',
                    '✨ Ícone do gatinho em todo o app',
                    '🔧 Correções e melhorias gerais'
                ]
            }
        ];
        
        return changelog.map(release => `
            <div class="border-l-4 border-purple-500 pl-6 pb-6">
                <div class="flex items-center gap-3 mb-3">
                    <span class="px-4 py-1 bg-purple-100 text-purple-800 rounded-full font-bold">v${release.version}</span>
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
        if (autoCheck && this.canCheckNow()) {
            setTimeout(() => {
                this.checkForUpdates(true);
            }, 3000);
        }
    },
    
    canCheckNow() {
        const lastCheck = Utils.loadData('last_update_check');
        if (!lastCheck) return true;
        
        const timeSinceLastCheck = Date.now() - lastCheck.date;
        return timeSinceLastCheck >= this.minCheckInterval;
    },
    
    getLastCheckText(lastCheck) {
        if (!lastCheck) {
            return '⏱️ Nenhuma verificação realizada ainda';
        }
        
        const now = Date.now();
        const diff = now - lastCheck.date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) {
            return '⏱️ Verificado agora mesmo';
        } else if (minutes < 60) {
            return `⏱️ Última verificação há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
        } else if (hours < 24) {
            return `⏱️ Última verificação há ${hours} hora${hours > 1 ? 's' : ''}`;
        } else {
            return `⏱️ Última verificação há ${days} dia${days > 1 ? 's' : ''}`;
        }
    },
    
    updateButtonState() {
        const btn = document.getElementById('check-updates-btn');
        const btnText = document.getElementById('check-btn-text');
        const infoText = document.getElementById('last-check-info');
        
        if (!btn) return;
        
        const canCheck = this.canCheckNow();
        const lastCheck = Utils.loadData('last_update_check');
        
        btn.disabled = !canCheck;
        
        if (infoText) {
            infoText.textContent = this.getLastCheckText(lastCheck);
        }
        
        if (!canCheck && btnText) {
            const timeLeft = this.minCheckInterval - (Date.now() - lastCheck.date);
            const minutesLeft = Math.ceil(timeLeft / 60000);
            btnText.textContent = `Aguarde ${minutesLeft} min`;
        } else if (btnText) {
            btnText.textContent = 'Verificar Atualizações';
        }
    },
    
    async checkForUpdates(silent = false) {
        if (this.checking) {
            if (!silent) {
                Utils.showNotification('⏱️ Verificação já em andamento... にゃん~', 'info');
            }
            return;
        }
        
        if (!this.canCheckNow()) {
            const lastCheck = Utils.loadData('last_update_check');
            const timeLeft = this.minCheckInterval - (Date.now() - lastCheck.date);
            const minutesLeft = Math.ceil(timeLeft / 60000);
            
            if (!silent) {
                Utils.showNotification(
                    `⏱️ Aguarde ${minutesLeft} minuto${minutesLeft > 1 ? 's' : ''} にゃん~`,
                    'warning'
                );
            }
            return;
        }
        
        this.checking = true;
        this.updateAvailable = false;
        
        if (!silent) {
            Router.render();
        }
        
        try {
            const response = await fetch(this.updateUrl, {
                method: 'GET',
                cache: 'no-cache',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Erro HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            Utils.saveData('last_update_check', { 
                date: Date.now(),
                version: this.currentVersion 
            });
            
            if (this.compareVersions(data.version, this.currentVersion) > 0) {
                this.updateAvailable = true;
                this.latestVersion = data;
                
                if (!silent) {
                    Utils.showNotification('🎉 Nova atualização: v' + data.version + ' にゃん~', 'success');
                } else {
                    this.showUpdateNotification(data.version);
                }
            } else {
                if (!silent) {
                    Utils.showNotification('✅ Você está atualizado! にゃん~', 'success');
                }
            }
            
        } catch (error) {
            console.error('❌ Erro:', error);
            if (!silent) {
                Utils.showNotification('❌ Erro ao verificar atualizações', 'error');
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
        
        Utils.showNotification('🌐 Abrindo página de download... にゃん~', 'info');
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
        notification.className = 'fixed bottom-4 right-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white px-6 py-4 rounded-xl shadow-2xl z-50 max-w-sm animate-fadeIn';
        notification.innerHTML = `
            <div class="flex items-start gap-3">
                <span class="text-3xl">🐱</span>
                <div class="flex-1">
                    <div class="font-bold text-lg mb-1">Nova atualização! にゃん~</div>
                    <div class="text-sm text-purple-100 mb-3">Versão ${version} disponível</div>
                    <div class="flex gap-2">
                        <button onclick="Router.navigate('updates'); this.closest('.fixed').remove();" 
                                class="px-4 py-2 bg-white text-purple-600 rounded-lg font-bold text-sm hover:bg-purple-50 transition-all">
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
            enabled ? '✅ Verificação automática ativada にゃん~' : '❌ Verificação automática desativada',
            enabled ? 'success' : 'info'
        );
    }
};

window.AutoUpdater = AutoUpdater;