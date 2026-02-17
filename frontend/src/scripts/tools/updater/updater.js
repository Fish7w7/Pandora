/* ========================================
   UPDATER.JS OPTIMIZED v2.7.0
   Reduzido de 780 → 420 linhas (-46%)
   ======================================== */

const AutoUpdater = {
    currentVersion: '2.7.1',
    updateUrl: 'https://api.github.com/repos/Fish7w7/Pandora/releases/latest',
    githubReleasesUrl: 'https://github.com/Fish7w7/Pandora/releases',
    checking: false,
    updateAvailable: false,
    latestVersion: null,
    minCheckInterval: 5 * 60 * 1000, // 5 minutos
    downloading: false,
    downloadProgress: 0,
    
    // Changelog consolidado
    changelog: [
        {
            version: '2.7.1',
            date: '2026-02-17',
            changes: [
                "🔒 Segurança: API Keys do Gemini e OpenWeather removidas do código-fonte",
                "🔒 API Keys agora configuradas pelo usuário via interface (localStorage)",
                "🐛 termo.js: função evaluateGuess duplicada removida",
                "🐛 tictactoe.js: aspas quebradas na notificação de vitória corrigidas",
                "🔧 version.json: encoding UTF-8 corrigido",
                "⚡ main.js: clearCache agora assíncrono com async/await e try/catch"
            ]
        },
        {
            version: '2.7.0',
            date: '2025-11-06',
            changes: [
                "⚡ Performance: Otimização geral de 52% nos CSS e 19% nos JS",
                "🎨 Dark Theme: Correções de visibilidade e contraste",
                "🚀 Carregamento: Sistema de scripts em batches otimizado",
                "🔧 Router: Eliminado switch gigante com mapa de rotas",
                "💾 Auth: Validação consolidada e error handling robusto",
                "🎯 Animations: GPU acceleration e will-change adicionados",
                "📱 Mobile: Desabilita animações caras automaticamente"
            ]
        },
    ],
    
    render() {
        return `
            <div class="max-w-4xl mx-auto">
                ${this.renderHeader()}
                ${this.renderStatus()}
                ${this.renderCheckButton()}
                ${this.renderChangelog()}
                ${this.renderSettings()}
            </div>
        `;
    },
    
    renderHeader() {
        return `
            <div class="text-center mb-8">
                <h1 class="text-5xl font-black text-gray-800 mb-3">🔄 Atualizações</h1>
                <p class="text-gray-600 text-lg">Sistema de atualização automática にゃん~</p>
            </div>
            
            <div class="bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl p-8 text-white shadow-2xl mb-6">
                <div class="flex items-center justify-between">
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
        `;
    },
    
    renderStatus() {
        let content = '';
        
        if (this.downloading) {
            content = `
                <div class="text-center py-12">
                    <div class="text-7xl mb-4 animate-bounce">📥</div>
                    <p class="text-gray-800 text-2xl font-bold mb-4">Baixando Atualização...</p>
                    <div class="max-w-md mx-auto mb-4">
                        <div class="w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
                            <div id="download-progress-bar" 
                                 class="bg-gradient-to-r from-blue-500 to-cyan-600 h-full rounded-full transition-all duration-300 flex items-center justify-center text-white text-sm font-bold"
                                 style="width: ${this.downloadProgress}%">
                                ${this.downloadProgress}%
                            </div>
                        </div>
                    </div>
                    <p class="text-gray-600 text-sm" id="download-status">Iniciando download...</p>
                </div>
            `;
        } else if (this.checking) {
            content = `
                <div class="text-center py-12">
                    <div class="loader mx-auto mb-4"></div>
                    <p class="text-gray-600 text-lg font-semibold">Verificando atualizações... にゃん~</p>
                </div>
            `;
        } else if (this.updateAvailable) {
            const asset = this.getDownloadAsset();
            content = `
                <div class="bg-gradient-to-br from-green-50 to-emerald-50 border-3 border-green-300 rounded-2xl p-8 animate-fadeIn">
                    <div class="flex items-start gap-4">
                        <div class="text-6xl">🎉</div>
                        <div class="flex-1">
                            <h3 class="text-3xl font-black text-green-800 mb-2">Nova Atualização! にゃん~</h3>
                            <p class="text-green-700 text-lg mb-4">
                                Versão <strong class="text-2xl">${this.latestVersion.tag_name}</strong>
                            </p>
                            ${asset ? `
                                <div class="bg-white/70 rounded-xl p-4 mb-4">
                                    <div class="flex items-center gap-3">
                                        <span class="text-2xl">📦</span>
                                        <div>
                                            <div class="font-bold text-green-800">${asset.name}</div>
                                            <div class="text-sm text-green-700">${this.formatBytes(asset.size)}</div>
                                        </div>
                                    </div>
                                </div>
                            ` : ''}
                            <div class="flex gap-3">
                                <button onclick="AutoUpdater.downloadAndInstall()" 
                                        class="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center gap-2">
                                    <span class="text-2xl">⬇️</span>
                                    <span>Baixar e Instalar</span>
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
        } else {
            content = `
                <div class="text-center py-12">
                    <div class="text-7xl mb-4">✅</div>
                    <h3 class="text-2xl font-bold text-gray-800 mb-2">Você está atualizado! にゃん~</h3>
                    <p class="text-gray-600">Versão ${this.currentVersion} é a mais recente</p>
                </div>
            `;
        }
        
        return `<div id="update-status" class="bg-white rounded-2xl shadow-2xl p-8 mb-6">${content}</div>`;
    },
    
    renderCheckButton() {
        const lastCheck = Utils.loadData('last_update_check');
        const canCheck = this.canCheckNow();
        
        return `
            <div class="text-center mb-6">
                <button onclick="AutoUpdater.checkForUpdates()" 
                        id="check-updates-btn"
                        ${!canCheck ? 'disabled' : ''}
                        class="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-xl shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                    <span class="text-3xl">🔍</span>
                    <span>Verificar Atualizações</span>
                </button>
                <p class="text-sm text-gray-500 mt-3">${this.getLastCheckText(lastCheck)}</p>
            </div>
        `;
    },
    
    renderChangelog() {
        return `
            <div class="bg-white rounded-2xl shadow-2xl p-8 mb-6">
                <h3 class="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
                    <span>📝</span>
                    <span>Histórico de Versões</span>
                </h3>
                <div class="space-y-6">
                    ${this.changelog.map(release => `
                        <div class="border-l-4 border-purple-500 pl-6 pb-6">
                            <div class="flex items-center gap-3 mb-3">
                                <span class="px-4 py-1 bg-purple-100 text-purple-800 rounded-full font-bold">v${release.version}</span>
                                <span class="text-gray-500 text-sm">${new Date(release.date).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <ul class="space-y-2 text-gray-700">
                                ${release.changes.map(change => `<li>${change}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    renderSettings() {
        return `
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
                        <div class="text-purple-100 text-sm">O app verifica atualizações ao abrir</div>
                    </div>
                </label>
            </div>
        `;
    },
    
    init() {
        this.cleanIncompatibleCache();
        
        if (this.getAutoCheckSetting() && this.canCheckNow()) {
            setTimeout(() => this.checkForUpdates(true), 3000);
        }
    },
    
    cleanIncompatibleCache() {
        const cache = Utils.loadData('version_cache');
        if (cache?.data?.version && !cache.data.tag_name) {
            localStorage.removeItem('version_cache');
        }
    },
    
    canCheckNow() {
        const lastCheck = Utils.loadData('last_update_check');
        if (!lastCheck) return true;
        return Date.now() - lastCheck.date >= this.minCheckInterval;
    },
    
    getLastCheckText(lastCheck) {
        if (!lastCheck) return '⏱️ Nenhuma verificação realizada';
        
        const diff = Date.now() - lastCheck.date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return '⏱️ Verificado agora';
        if (minutes < 60) return `⏱️ Há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
        if (hours < 24) return `⏱️ Há ${hours} hora${hours > 1 ? 's' : ''}`;
        return `⏱️ Há ${days} dia${days > 1 ? 's' : ''}`;
    },
    
    async checkForUpdates(silent = false) {
        if (this.checking) {
            if (!silent) Utils.showNotification('⏱️ Verificação em andamento...', 'info');
            return;
        }
        
        if (!this.canCheckNow()) {
            if (!silent) {
                const lastCheck = Utils.loadData('last_update_check');
                const timeLeft = this.minCheckInterval - (Date.now() - lastCheck.date);
                const minutesLeft = Math.ceil(timeLeft / 60000);
                Utils.showNotification(`⏱️ Aguarde ${minutesLeft} minuto${minutesLeft > 1 ? 's' : ''}`, 'warning');
            }
            return;
        }
        
        this.checking = true;
        if (!silent) Router.render();
        
        try {
            const response = await fetch(this.updateUrl, {
                headers: { 'Accept': 'application/vnd.github.v3+json' }
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            this.cacheVersion(data);
            
            Utils.saveData('last_update_check', { 
                date: Date.now(),
                version: this.currentVersion 
            });
            
            this.processVersionData(data, silent);
            
        } catch (error) {
            console.error('❌ Erro:', error);
            if (!silent) Utils.showNotification('❌ Erro ao verificar atualizações', 'error');
        } finally {
            this.checking = false;
            if (!silent) Router.render();
        }
    },
    
    processVersionData(data, silent) {
        if (!data) return;
        
        const latestVersion = data.tag_name?.replace('v', '') || data.version?.replace('v', '');
        if (!latestVersion) return;
        
        if (this.compareVersions(latestVersion, this.currentVersion) > 0) {
            this.updateAvailable = true;
            this.latestVersion = data;
            
            if (!silent) {
                Utils.showNotification(`🎉 Nova atualização: v${latestVersion}`, 'success');
            }
        } else if (!silent) {
            Utils.showNotification('✅ Você está atualizado!', 'success');
        }
        
        if (!silent) Router.render();
    },
    
    cacheVersion(data) {
        Utils.saveData('version_cache', {
            data,
            timestamp: Date.now(),
            expiresIn: 3600000
        });
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
    
    getDownloadAsset() {
        if (!this.latestVersion?.assets) return null;
        
        const platform = this.getPlatform();
        return this.latestVersion.assets.find(asset => {
            const name = asset.name.toLowerCase();
            if (platform === 'win32' && name.endsWith('.exe')) return true;
            if (platform === 'darwin' && name.endsWith('.dmg')) return true;
            if (platform === 'linux' && name.endsWith('.appimage')) return true;
            return false;
        });
    },
    
    getPlatform() {
        if (typeof process !== 'undefined' && process.platform) return process.platform;
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes('win')) return 'win32';
        if (ua.includes('mac')) return 'darwin';
        if (ua.includes('linux')) return 'linux';
        return 'unknown';
    },
    
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    },
    
    async downloadAndInstall() {
        const asset = this.getDownloadAsset();
        if (!asset) {
            Utils.showNotification('❌ Nenhum instalador encontrado', 'error');
            return;
        }
        
        this.downloading = true;
        this.downloadProgress = 0;
        Router.render();
        
        try {
            if (window.electronAPI) {
                window.electronAPI.onDownloadProgress((data) => {
                    this.downloadProgress = data.progress;
                    const statusEl = document.getElementById('download-status');
                    if (statusEl) {
                        statusEl.textContent = `${this.formatBytes(data.downloadedBytes)} / ${this.formatBytes(data.totalBytes)}`;
                    }
                    const progressBar = document.getElementById('download-progress-bar');
                    if (progressBar) {
                        progressBar.style.width = data.progress + '%';
                        progressBar.textContent = data.progress + '%';
                    }
                });
                
                const result = await window.electronAPI.downloadUpdate(asset.browser_download_url, asset.name);
                window.electronAPI.removeDownloadProgressListener();
                
                this.downloading = false;
                
                if (result.success) {
                    const installResult = await window.electronAPI.installUpdate(result.filePath);
                    if (installResult.success) {
                        Utils.showNotification('🎉 Instalando...', 'success');
                    }
                } else {
                    throw new Error(result.error);
                }
                
                Router.render();
                return;
            }
            
            // Fallback
            if (typeof require !== 'undefined') {
                const { shell } = require('electron');
                shell.openExternal(asset.browser_download_url);
            } else {
                window.open(asset.browser_download_url, '_blank');
            }
            
            Utils.showNotification('🌐 Download iniciado!', 'success');
            this.downloading = false;
            Router.render();
            
        } catch (error) {
            console.error('❌ Erro:', error);
            Utils.showNotification('❌ Erro no download', 'error');
            this.downloading = false;
            Router.render();
        }
    },
    
    viewReleaseNotes() {
        const url = this.latestVersion?.html_url || this.githubReleasesUrl;
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
    
    getAutoCheckSetting() {
        return Utils.loadData('auto_check_updates') !== false;
    },
    
    toggleAutoCheck(enabled) {
        Utils.saveData('auto_check_updates', enabled);
        Utils.showNotification(
            enabled ? '✅ Verificação automática ativada' : '❌ Verificação desativada',
            enabled ? 'success' : 'info'
        );
    }
};

window.AutoUpdater = AutoUpdater;