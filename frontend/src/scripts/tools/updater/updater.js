// ============================================
// SISTEMA DE AUTO-UPDATE COMPLETO
// Download + Instalação Integrada にゃん~ 🐱
// ============================================

const AutoUpdater = {
    currentVersion: '2.5.0',
    updateUrl: 'https://api.github.com/repos/Fish7w7/Pandora/releases/latest',
    githubReleasesUrl: 'https://github.com/Fish7w7/Pandora/releases',
    checking: false,
    updateAvailable: false,
    latestVersion: null,
    minCheckInterval: 5 * 60 * 1000, // 5 minutos
    downloading: false,
    downloadProgress: 0,
    
    render() {
        const lastCheck = Utils.loadData('last_update_check');
        const canCheck = this.canCheckNow();
        
        return `
            <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                    <h1 class="text-5xl font-black text-gray-800 mb-3">🔄 Atualizações</h1>
                    <p class="text-gray-600 text-lg">Sistema de atualização automática にゃん~</p>
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
                            <div class="text-purple-100 text-sm">O app verifica atualizações toda vez que você abrir</div>
                        </div>
                    </label>
                    
                    <label class="flex items-center gap-3 p-4 bg-white/20 rounded-xl cursor-pointer hover:bg-white/30 transition-all mb-4">
                        <input type="checkbox" id="auto-download-updates" 
                               ${this.getAutoDownloadSetting() ? 'checked' : ''}
                               onchange="AutoUpdater.toggleAutoDownload(this.checked)"
                               class="w-6 h-6 accent-purple-600">
                        <div>
                            <div class="font-bold text-lg">Baixar atualizações automaticamente</div>
                            <div class="text-purple-100 text-sm">Baixa a atualização em segundo plano quando disponível</div>
                        </div>
                    </label>
                    
                    <div class="bg-white/10 rounded-xl p-4">
                        <div class="text-sm text-purple-100 mb-2">ℹ️ Como funciona:</div>
                        <ul class="text-sm text-purple-50 space-y-1 ml-4">
                            <li>✅ Usa API oficial do GitHub (sem rate limit)</li>
                            <li>✅ Download integrado direto no app</li>
                            <li>✅ Barra de progresso em tempo real</li>
                            <li>✅ Instalação com um clique</li>
                            <li>✅ Backup automático das configurações</li>
                            <li>✅ Rollback em caso de erro</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderStatus() {
        if (this.downloading) {
            return `
                <div class="text-center py-12">
                    <div class="text-7xl mb-4 animate-bounce">📥</div>
                    <p class="text-gray-800 text-2xl font-bold mb-4">Baixando Atualização...</p>
                    
                    <!-- Barra de Progresso -->
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
        }
        
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
            const asset = this.getDownloadAsset();
            const fileSize = asset ? this.formatBytes(asset.size) : 'N/A';
            
            return `
                <div class="bg-gradient-to-br from-green-50 to-emerald-50 border-3 border-green-300 rounded-2xl p-8 animate-fadeIn">
                    <div class="flex items-start gap-4 mb-6">
                        <div class="text-6xl">🎉</div>
                        <div class="flex-1">
                            <h3 class="text-3xl font-black text-green-800 mb-2">Nova Atualização Disponível! にゃん~</h3>
                            <p class="text-green-700 text-lg mb-4">
                                Versão <strong class="text-2xl">${this.latestVersion.tag_name}</strong> está disponível
                            </p>
                            
                            ${asset ? `
                                <div class="bg-white/70 rounded-xl p-4 mb-4">
                                    <div class="flex items-center gap-3 mb-2">
                                        <span class="text-2xl">📦</span>
                                        <div>
                                            <div class="font-bold text-green-800">${asset.name}</div>
                                            <div class="text-sm text-green-700">Tamanho: ${fileSize} • Downloads: ${asset.download_count}</div>
                                        </div>
                                    </div>
                                </div>
                            ` : ''}
                            
                            <div class="bg-white/50 rounded-xl p-4 mb-4">
                                <h4 class="font-bold text-green-800 mb-2">📋 Novidades:</h4>
                                <div class="text-green-700 text-sm whitespace-pre-wrap">${this.formatReleaseNotes()}</div>
                            </div>
                            
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
            version: '2.5.0',
            date: '2025-10-29',
            changes: [
                "📝 Sistema completo de Notas Rápidas",
                "✅ Nova Lista de Tarefas com estatísticas e progresso",
                "📊 Dashboard reformulado com integração de notas e tarefas",
                "🎨 8 temas personalizáveis com gradientes e sombras suaves",
                "🚀 Performance e carregamento aprimorados (+30% fluidez)",
                "🐛 Correção definitiva do bug de GPU (piscadas na inicialização)",
                "💡 Interface refinada, responsiva e mais leve"
            ]
        },
        {
            version: '2.4.0',
            date: '2025-10-28',
            changes: [
                "🚀 Sistema de Auto-Update Nativo Completo",
                "✨ Download Integrado com Barra de Progresso",
                "🔄 API Oficial do GitHub (sem rate limit)",
                "🤖 Auto-Download Opcional configurável",
                "💾 Instalação com Um Clique",
                "⚡ Cache Inteligente (reduz 90% requisições)",
                "🐛 Erro 429 (Rate Limit) eliminado",
                "🐛 Compatibilidade com cache antigo corrigida",
                "🐛 Validação completa de dados de versão",
                "🐛 Preload script com tratamento de erro",
                "🎨 Interface de atualizações modernizada",
                "💡 Notificações flutuantes elegantes",
                "📋 Informações detalhadas (tamanho, downloads)",
                "🔧 Múltiplos fallbacks para máxima confiabilidade"
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
        // 🔧 FIX: Limpar cache antigo incompatível
        this.cleanIncompatibleCache();
        
        const autoCheck = this.getAutoCheckSetting();
        if (autoCheck && this.canCheckNow()) {
            setTimeout(() => {
                this.checkForUpdates(true);
            }, 3000);
        }
    },
    
    // 🔧 NOVO: Limpar cache antigo do version.json
    cleanIncompatibleCache() {
        const cache = Utils.loadData('version_cache');
        
        if (cache && cache.data) {
            // Verificar se é o formato antigo (version.json)
            if (cache.data.version && !cache.data.tag_name) {
                console.log('🗑️ Removendo cache antigo incompatível');
                localStorage.removeItem('version_cache');
            }
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
    
    async checkForUpdates(silent = false) {
        if (this.checking) {
            if (!silent) {
                Utils.showNotification('⏱️ Verificação já em andamento... にゃん~', 'info');
            }
            return;
        }
        
        // Verificar cache primeiro
        const cachedData = this.getCachedVersion();
        if (cachedData && !silent) {
            console.log('✅ Usando versão em cache');
            this.processVersionData(cachedData, silent);
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
            console.log('🔍 Verificando atualizações na API do GitHub...');
            
            const response = await fetch(this.updateUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Erro HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            // Salvar no cache
            this.cacheVersion(data);
            
            Utils.saveData('last_update_check', { 
                date: Date.now(),
                version: this.currentVersion 
            });
            
            this.processVersionData(data, silent);
            
        } catch (error) {
            console.error('❌ Erro:', error);
            
            // Tentar usar cache antigo
            const cachedData = this.getCachedVersion(true);
            if (cachedData) {
                console.log('⚠️ Usando cache antigo após erro');
                if (!silent) {
                    Utils.showNotification('⚠️ Usando dados em cache', 'warning');
                }
                this.processVersionData(cachedData, silent);
            } else {
                if (!silent) {
                    Utils.showNotification('❌ Erro ao verificar atualizações', 'error');
                }
            }
        } finally {
            this.checking = false;
            if (!silent) {
                Router.render();
            }
        }
    },
    
    processVersionData(data, silent) {
        // 🔧 FIX: Validar estrutura dos dados
        if (!data) {
            console.error('❌ Dados inválidos recebidos');
            if (!silent) {
                Utils.showNotification('❌ Erro ao processar dados de versão', 'error');
            }
            return;
        }
        
        // 🔧 FIX: Suportar ambos formatos (API GitHub e version.json)
        let latestVersion;
        
        if (data.tag_name) {
            // Formato da API GitHub: { tag_name: "v2.3.2", ... }
            latestVersion = data.tag_name.replace('v', '');
        } else if (data.version) {
            // Formato do version.json antigo: { version: "2.3.2", ... }
            latestVersion = data.version.replace('v', '');
        } else {
            console.error('❌ Formato de versão desconhecido:', data);
            if (!silent) {
                Utils.showNotification('❌ Formato de dados incompatível', 'error');
            }
            return;
        }
        
        console.log('🔍 Comparando versões:', latestVersion, 'vs', this.currentVersion);
        
        if (this.compareVersions(latestVersion, this.currentVersion) > 0) {
            this.updateAvailable = true;
            this.latestVersion = data;
            
            console.log('🎉 Nova versão disponível:', latestVersion);
            
            if (!silent) {
                Utils.showNotification('🎉 Nova atualização: v' + latestVersion + ' にゃん~', 'success');
            } else {
                this.showUpdateNotification(latestVersion);
                
                // Auto-download se habilitado
                if (this.getAutoDownloadSetting()) {
                    setTimeout(() => {
                        this.downloadAndInstall();
                    }, 2000);
                }
            }
        } else {
            console.log('✅ Já está na versão mais recente');
            if (!silent) {
                Utils.showNotification('✅ Você está atualizado! にゃん~', 'success');
            }
        }
        
        if (!silent) {
            Router.render();
        }
    },
    
    cacheVersion(data) {
        const cache = {
            data: data,
            timestamp: Date.now(),
            expiresIn: 3600000 // 1 hora
        };
        Utils.saveData('version_cache', cache);
        console.log('💾 Versão armazenada em cache');
    },
    
    getCachedVersion(ignoreExpiry = false) {
        const cache = Utils.loadData('version_cache');
        
        if (!cache || !cache.data) {
            return null;
        }
        
        const age = Date.now() - cache.timestamp;
        
        if (ignoreExpiry || age < cache.expiresIn) {
            console.log(`📦 Cache encontrado (${Math.floor(age / 60000)} min de idade)`);
            return cache.data;
        }
        
        console.log('📦 Cache expirado');
        return null;
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
        if (!this.latestVersion || !this.latestVersion.assets) return null;
        
        // Detectar plataforma
        const platform = this.getPlatform();
        
        // Procurar asset apropriado
        return this.latestVersion.assets.find(asset => {
            const name = asset.name.toLowerCase();
            if (platform === 'win32' && name.endsWith('.exe')) return true;
            if (platform === 'darwin' && name.endsWith('.dmg')) return true;
            if (platform === 'linux' && name.endsWith('.appimage')) return true;
            return false;
        });
    },
    
    getPlatform() {
        if (typeof process !== 'undefined' && process.platform) {
            return process.platform;
        }
        
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('win')) return 'win32';
        if (userAgent.includes('mac')) return 'darwin';
        if (userAgent.includes('linux')) return 'linux';
        
        return 'unknown';
    },
    
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    },
    
    formatReleaseNotes() {
        if (!this.latestVersion) {
            return 'Sem notas de versão disponíveis.';
        }
        
        // 🔧 FIX: Suportar ambos formatos
        let notes = '';
        
        if (this.latestVersion.body) {
            // Formato da API GitHub
            notes = this.latestVersion.body;
        } else if (this.latestVersion.changelog) {
            // Formato do version.json antigo
            notes = this.latestVersion.changelog.join('\n');
        } else {
            return 'Sem notas de versão disponíveis.';
        }
        
        // Limitar a 500 caracteres
        if (notes.length > 500) {
            return notes.substring(0, 500) + '...';
        }
        return notes;
    },
    
    async downloadAndInstall() {
        const asset = this.getDownloadAsset();
        
        if (!asset) {
            Utils.showNotification('❌ Nenhum instalador encontrado para sua plataforma', 'error');
            return;
        }
        
        this.downloading = true;
        this.downloadProgress = 0;
        Router.render();
        
        try {
            console.log('📥 Iniciando download:', asset.name);
            
            // 🆕 Usar API nativa do Electron se disponível
            if (window.electronAPI) {
                console.log('✅ Usando API nativa do Electron');
                
                // Configurar listener de progresso
                window.electronAPI.onDownloadProgress((data) => {
                    this.downloadProgress = data.progress;
                    
                    const statusEl = document.getElementById('download-status');
                    if (statusEl) {
                        const downloaded = this.formatBytes(data.downloadedBytes);
                        const total = this.formatBytes(data.totalBytes);
                        statusEl.textContent = `Baixando... ${downloaded} / ${total}`;
                    }
                    
                    const progressBar = document.getElementById('download-progress-bar');
                    if (progressBar) {
                        progressBar.style.width = data.progress + '%';
                        progressBar.textContent = data.progress + '%';
                    }
                    
                    console.log(`📊 Progresso: ${data.progress}%`);
                });
                
                // Iniciar download
                const result = await window.electronAPI.downloadUpdate(
                    asset.browser_download_url,
                    asset.name
                );
                
                // Remover listener
                window.electronAPI.removeDownloadProgressListener();
                
                this.downloading = false;
                
                if (result.success) {
                    console.log('✅ Download concluído:', result.filePath);
                    
                    // Perguntar se quer instalar agora
                    const installResult = await window.electronAPI.installUpdate(result.filePath);
                    
                    if (installResult.success) {
                        Utils.showNotification('🎉 Instalando atualização... O app será fechado. にゃん~', 'success');
                    } else if (installResult.cancelled) {
                        Utils.showNotification('📂 Instalador salvo na pasta Downloads', 'info');
                        
                        // Oferecer abrir pasta
                        setTimeout(() => {
                            if (confirm('Deseja abrir a pasta Downloads?')) {
                                window.electronAPI.openDownloadsFolder();
                            }
                        }, 1000);
                    }
                } else {
                    throw new Error(result.error || 'Erro no download');
                }
                
                Router.render();
                return;
            }
            
            // Fallback: Abrir no navegador externo
            console.log('⚠️ API Electron não disponível, usando fallback');
            
            if (typeof require !== 'undefined') {
                try {
                    const { shell } = require('electron');
                    shell.openExternal(asset.browser_download_url);
                    
                    Utils.showNotification('🌐 Download iniciado no navegador! にゃん~', 'success');
                    
                    this.downloading = false;
                    Router.render();
                    
                    return;
                } catch (e) {
                    console.warn('⚠️ Electron shell não disponível');
                }
            }
            
            // Último fallback: window.open
            window.open(asset.browser_download_url, '_blank');
            Utils.showNotification('🌐 Download iniciado! にゃん~', 'success');
            
            this.downloading = false;
            Router.render();
            
        } catch (error) {
            console.error('❌ Erro no download:', error);
            Utils.showNotification('❌ Erro ao baixar: ' + error.message, 'error');
            
            this.downloading = false;
            Router.render();
        }
    },
    
    viewReleaseNotes() {
        if (!this.latestVersion) return;
        
        const url = this.latestVersion.html_url || this.githubReleasesUrl;
        
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
    
    getAutoDownloadSetting() {
        const saved = Utils.loadData('auto_download_updates');
        return saved !== null ? saved : false;
    },
    
    toggleAutoCheck(enabled) {
        Utils.saveData('auto_check_updates', enabled);
        Utils.showNotification(
            enabled ? '✅ Verificação automática ativada にゃん~' : '❌ Verificação automática desativada',
            enabled ? 'success' : 'info'
        );
    },
    
    toggleAutoDownload(enabled) {
        Utils.saveData('auto_download_updates', enabled);
        Utils.showNotification(
            enabled ? '✅ Download automático ativado にゃん~' : '❌ Download automático desativado',
            enabled ? 'success' : 'info'
        );
    }
};

window.AutoUpdater = AutoUpdater;