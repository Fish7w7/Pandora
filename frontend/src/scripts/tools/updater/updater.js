/* 
   UPDATER.JS v3.0 — NyanTools にゃん~
   Redesenhado com UI aprimorada
*/

const AutoUpdater = {
    currentVersion: '3.0.2',
    updateUrl: 'https://api.github.com/repos/Fish7w7/Pandora/releases/latest',
    githubReleasesUrl: 'https://github.com/Fish7w7/Pandora/releases',
    checking: false,
    updateAvailable: false,
    latestVersion: null,
    minCheckInterval: 5 * 60 * 1000, // 5 min
    downloading: false,
    downloadProgress: 0,

    // ============================================
    // CHANGELOG
    // ============================================

    // Array de changelog para updater.js
changelog: [
    {
        version: '3.0.2',
        date: '2026-02-22T12:00:00',
        label: 'Atual',
        labelColor: 'bg-green-500',
        author: 'Clara',
        changes: [
            { type: '✨', text: 'Dashboard: Histórico de Uso redesenhado com grid 5×7 e alinhamento correto por dia da semana' },
            { type: '✨', text: 'Dashboard: Gráfico semanal com barras proporcionais e labels de tempo visíveis no dark mode' },
            { type: '✨', text: 'Dashboard: Sequência do histórico sincronizada com o card de stats' },
            { type: '✨', text: 'Dashboard: Configurações e Atualizações removidas de Ferramentas Mais Usadas' },
            { type: '✨', text: 'Notificações: Tipos de Alerta com toggles individuais (Confirmações, Erros, Info, Alertas)' },
            { type: '✨', text: 'Notificações: Histórico Recente com últimas 20 entradas' },
            { type: '✨', text: 'Notificações: Toggle para ativar/desativar salvamento do histórico' },
            { type: '✨', text: 'Notificações: Botão para limpar histórico' },
            { type: '✨', text: 'Gerador de Senhas: Cards com visual idêntico em light e dark mode' },
            { type: '✨', text: 'Electron: Menu padrão removido (File/Edit/View/Window/Help)' }
        ]
    },
    {
        version: '3.0.1',
        date: '2026-02-21T12:00:00',
        label: null,
        labelColor: '',
        author: 'Clara',
        changes: [
            { type: '🐛', text: 'Cobrinha: spam de game over ao reiniciar corrigido' },
            { type: '🐛', text: 'Dashboard: bug de logout com tela desalinhada corrigido' },
            { type: '🐛', text: 'Dashboard: tracking de atividade limpo corretamente no logout' },
            { type: '🐛', text: 'Notas: dark mode completo implementado' },
            { type: '🐛', text: 'Notas: ordenação por pins corrigida' },
            { type: '🐛', text: 'Notas: formatação de data agora exibe o ano corretamente' },
            { type: '🐛', text: 'Tarefas: dark mode completo implementado' },
            { type: '🐛', text: 'Tarefas: classes de prioridade do Tailwind corrigidas (eram dinâmicas)' },
            { type: '🐛', text: 'Tarefas: prioridade padrão "média" ao criar nova tarefa' },
            { type: '🐛', text: 'Layout: conflito entre Tailwind hidden e CSS flex do #main-app corrigido' }
        ]
    },
],

    // ============================================
    // RENDER
    // ============================================

    render() {
        return `
            <div class="space-y-5">
                ${this.renderHero()}
                ${this.renderStatusCard()}
                ${this.renderChangelog()}
                ${this.renderAutoCheckSetting()}
            </div>
        `;
    },

    renderHero() {
        const lastCheck = Utils.loadData('last_update_check');
        const canCheck = this.canCheckNow();

        return `
            <div class="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl p-6 text-white flex items-center justify-between gap-4 shadow-2xl relative overflow-hidden">
                <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 10% 50%, #8b5cf6, transparent 60%), radial-gradient(circle at 90% 50%, #ec4899, transparent 60%)"></div>
                <div class="relative flex items-center gap-4">
                    <div class="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl">🐱</div>
                    <div>
                        <div class="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-0.5">NyanTools にゃん~</div>
                        <div class="text-2xl font-black">Versão ${this.currentVersion}</div>
                        <div class="text-xs text-gray-400 mt-0.5">${this._getLastCheckText(lastCheck)}</div>
                    </div>
                </div>
                <div class="relative shrink-0">
                    <button onclick="AutoUpdater.checkForUpdates()"
                            id="check-updates-btn"
                            ${!canCheck || this.checking ? 'disabled' : ''}
                            class="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 rounded-xl font-bold text-sm hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg">
                        <span class="${this.checking ? 'animate-spin' : ''}">🔍</span>
                        <span>${this.checking ? 'Verificando...' : 'Verificar'}</span>
                    </button>
                </div>
            </div>
        `;
    },

    renderStatusCard() {
        if (this.downloading) {
            return `
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div class="flex items-center gap-3 mb-5">
                        <span class="text-2xl animate-bounce">📥</span>
                        <div>
                            <div class="font-black text-gray-800">Baixando Atualização</div>
                            <div class="text-sm text-gray-500" id="download-status">Iniciando download...</div>
                        </div>
                        <div class="ml-auto font-black text-blue-600 text-lg">${this.downloadProgress}%</div>
                    </div>
                    <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div id="download-progress-bar"
                             class="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-300"
                             style="width:${this.downloadProgress}%"></div>
                    </div>
                </div>
            `;
        }

        if (this.checking) {
            return `
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                    <div class="loader mx-auto mb-3"></div>
                    <p class="text-gray-500 font-semibold">Verificando atualizações... にゃん~</p>
                </div>
            `;
        }

        if (this.updateAvailable) {
            const asset = this.getDownloadAsset();
            return `
                <div class="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-6">
                    <div class="flex items-start gap-4">
                        <div class="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-2xl shrink-0">🎉</div>
                        <div class="flex-1">
                            <div class="font-black text-emerald-800 text-lg">Nova versão disponível!</div>
                            <div class="text-emerald-700 text-sm mt-0.5 mb-4">
                                Versão <strong>${this.latestVersion?.tag_name}</strong> pronta para instalar
                            </div>
                            ${asset ? `
                                <div class="flex items-center gap-2 bg-white/60 rounded-lg px-3 py-2 mb-4 text-sm">
                                    <span>📦</span>
                                    <span class="font-semibold text-gray-800">${asset.name}</span>
                                    <span class="text-gray-500 ml-auto">${this.formatBytes(asset.size)}</span>
                                </div>
                            ` : ''}
                            <div class="flex gap-2">
                                <button onclick="AutoUpdater.downloadAndInstall()"
                                        class="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 px-4 rounded-xl font-bold text-sm hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                                    <span>⬇️</span><span>Baixar e Instalar</span>
                                </button>
                                <button onclick="AutoUpdater.viewReleaseNotes()"
                                        class="px-4 py-2.5 bg-white text-emerald-700 border border-emerald-300 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-all">
                                    📖 Detalhes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Up to date
        return `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
                <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl shrink-0">✅</div>
                <div>
                    <div class="font-black text-gray-800">Você está atualizado!</div>
                    <div class="text-sm text-gray-500">Versão ${this.currentVersion} é a mais recente にゃん~</div>
                </div>
            </div>
        `;
    },

    renderChangelog() {
        return `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div class="flex items-center gap-3 mb-5">
                    <span class="text-2xl">📝</span>
                    <h3 class="font-black text-gray-800">Histórico de Versões</h3>
                </div>

                <div class="space-y-6">
                    ${this.changelog.map((release, i) => `
                        <div class="relative pl-6 ${i < this.changelog.length - 1 ? 'pb-6' : ''}">
                            <!-- Linha vertical da timeline -->
                            ${i < this.changelog.length - 1 ? `<div class="absolute left-[9px] top-5 bottom-0 w-0.5 bg-gray-100"></div>` : ''}

                            <!-- Ponto da timeline -->
                            <div class="absolute left-0 top-1 w-[18px] h-[18px] rounded-full border-2 border-gray-200 bg-white flex items-center justify-center">
                                <div class="w-2 h-2 rounded-full ${i === 0 ? 'bg-emerald-500' : 'bg-gray-300'}"></div>
                            </div>

                            <div class="flex items-center gap-2 mb-2 flex-wrap">
                                <span class="font-black text-gray-800">v${release.version}</span>
                                ${release.label ? `<span class="text-xs font-bold px-2 py-0.5 rounded-full text-white ${release.labelColor}">${release.label}</span>` : ''}
                                <span class="text-xs text-gray-400">${new Date(release.date).toLocaleDateString('pt-BR', { day:'2-digit', month: 'short', year: 'numeric' })}</span>
                                ${release.author ? `<span class="text-xs text-gray-400 flex items-center gap-1">· <span class="inline-flex items-center gap-1 bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full">👤 ${release.author}</span></span>` : ''}
                            </div>

                            <div class="space-y-1.5">
                                ${release.changes.map(c => `
                                    <div class="flex items-start gap-2 text-sm text-gray-700">
                                        <span class="shrink-0 mt-0.5">${c.type}</span>
                                        <span>${c.text}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <a href="${this.githubReleasesUrl}" target="_blank"
                   class="mt-5 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-semibold transition-colors pt-4 border-t border-gray-100">
                    <span>Ver histórico completo no GitHub</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                </a>
            </div>
        `;
    },

    renderAutoCheckSetting() {
        const autoCheck = this.getAutoCheckSetting();
        return `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <span class="text-2xl">⚙️</span>
                        <div>
                            <div class="font-semibold text-gray-800 text-sm">Verificar automaticamente ao iniciar</div>
                            <div class="text-xs text-gray-500">O app verifica atualizações ao abrir</div>
                        </div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox"
                               ${autoCheck ? 'checked' : ''}
                               onchange="AutoUpdater.toggleAutoCheck(this.checked)"
                               class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-300 peer-checked:bg-blue-500 rounded-full transition-colors peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow"></div>
                    </label>
                </div>
            </div>
        `;
    },

    // ============================================
    // LÓGICA
    // ============================================

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

    _getLastCheckText(lastCheck) {
        if (!lastCheck) return 'Nenhuma verificação realizada';
        const diff = Date.now() - lastCheck.date;
        const m = Math.floor(diff / 60000);
        const h = Math.floor(diff / 3600000);
        const d = Math.floor(diff / 86400000);
        if (m < 1)  return 'Verificado agora';
        if (m < 60) return `Verificado há ${m} min`;
        if (h < 24) return `Verificado há ${h}h`;
        return `Verificado há ${d} dia${d > 1 ? 's' : ''}`;
    },

    // Mantido para compatibilidade
    getLastCheckText(lastCheck) { return this._getLastCheckText(lastCheck); },

    async checkForUpdates(silent = false) {
        if (this.checking) {
            if (!silent) Utils.showNotification('⏱️ Verificação em andamento...', 'info');
            return;
        }

        if (!this.canCheckNow()) {
            if (!silent) {
                const lastCheck = Utils.loadData('last_update_check');
                const minutesLeft = Math.ceil((this.minCheckInterval - (Date.now() - lastCheck.date)) / 60000);
                Utils.showNotification(`⏱️ Aguarde ${minutesLeft} min para verificar novamente`, 'warning');
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
            Utils.saveData('last_update_check', { date: Date.now(), version: this.currentVersion });
            this.processVersionData(data, silent);

        } catch (error) {
            console.error('❌ Erro ao verificar atualizações:', error);
            if (!silent) Utils.showNotification('❌ Erro ao verificar atualizações', 'error');
        } finally {
            this.checking = false;
            if (!silent) Router.render();
        }
    },

    processVersionData(data, silent) {
        if (!data) return;
        const latest = data.tag_name?.replace('v', '') || data.version?.replace('v', '');
        if (!latest) return;

        if (this.compareVersions(latest, this.currentVersion) > 0) {
            this.updateAvailable = true;
            this.latestVersion = data;
            if (!silent) Utils.showNotification(`🎉 Nova versão disponível: v${latest}`, 'success');
        } else if (!silent) {
            Utils.showNotification('✅ Você está na versão mais recente!', 'success');
        }
        if (!silent) Router.render();
    },

    cacheVersion(data) {
        Utils.saveData('version_cache', { data, timestamp: Date.now(), expiresIn: 3600000 });
    },

    compareVersions(v1, v2) {
        const p1 = v1.split('.').map(Number);
        const p2 = v2.split('.').map(Number);
        for (let i = 0; i < 3; i++) {
            if (p1[i] > p2[i]) return 1;
            if (p1[i] < p2[i]) return -1;
        }
        return 0;
    },

    getDownloadAsset() {
        if (!this.latestVersion?.assets) return null;
        const platform = this.getPlatform();
        return this.latestVersion.assets.find(a => {
            const n = a.name.toLowerCase();
            if (platform === 'win32'  && n.endsWith('.exe'))      return true;
            if (platform === 'darwin' && n.endsWith('.dmg'))      return true;
            if (platform === 'linux'  && n.endsWith('.appimage')) return true;
            return false;
        });
    },

    getPlatform() {
        if (typeof process !== 'undefined' && process.platform) return process.platform;
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes('win'))   return 'win32';
        if (ua.includes('mac'))   return 'darwin';
        if (ua.includes('linux')) return 'linux';
        return 'unknown';
    },

    formatBytes(bytes) {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
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
            if (window.electronAPI) {
                window.electronAPI.onDownloadProgress((data) => {
                    this.downloadProgress = data.progress;
                    const bar = document.getElementById('download-progress-bar');
                    const status = document.getElementById('download-status');
                    if (bar) bar.style.width = data.progress + '%';
                    if (status) status.textContent = `${this.formatBytes(data.downloadedBytes)} / ${this.formatBytes(data.totalBytes)}`;
                });

                const result = await window.electronAPI.downloadUpdate(asset.browser_download_url, asset.name);
                window.electronAPI.removeDownloadProgressListener();
                this.downloading = false;

                if (result.success) {
                    const install = await window.electronAPI.installUpdate(result.filePath);
                    if (install.success) Utils.showNotification('🎉 Instalando...', 'success');
                } else {
                    throw new Error(result.error);
                }
                Router.render();
                return;
            }

            // Fallback (sem Electron)
            window.open(asset.browser_download_url, '_blank');
            Utils.showNotification('🌐 Download iniciado no navegador!', 'success');
            this.downloading = false;
            Router.render();

        } catch (error) {
            console.error('❌ Erro no download:', error);
            Utils.showNotification('❌ Erro ao baixar atualização', 'error');
            this.downloading = false;
            Router.render();
        }
    },

    viewReleaseNotes() {
        const url = this.latestVersion?.html_url || this.githubReleasesUrl;
        try {
            const { shell } = require('electron');
            shell.openExternal(url);
        } catch {
            window.open(url, '_blank');
        }
    },

    getAutoCheckSetting() {
        return Utils.loadData('auto_check_updates') !== false;
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