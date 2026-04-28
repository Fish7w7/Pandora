

const AutoUpdater = {
    currentVersion: window.VersionManager?.getVersion?.() || window.NYAN_VERSION || '3.14.0',
    updateUrl: 'https://api.github.com/repos/Fish7w7/Pandora/releases/latest',
    githubReleasesUrl: 'https://github.com/Fish7w7/Pandora/releases',
    checking: false,
    updateAvailable: false,
    latestVersion: null,
    minCheckInterval: 5 * 60 * 1000,
    downloading: false,
    downloadProgress: 0,
    downloadSpeed: 0,
    downloadRemaining: 0,
    downloadedBytes: 0,
    totalBytes: 0,
    _devMode: false,
    _isDevEnv: false,  
    _devEnvChecked: false,
    _simulating: false,
    _statusListenerRegistered: false,
    _progressListenerRegistered: false,
    _nativeResponded: false,
    _initialized: false,
    _uiRenderScheduled: false,
    _uiRenderNeedsNav: false,
    _proactiveBannerVersion: '',
    _importantModalVersion: '',
    _checkInFlightPromise: null,
    _sessionNotifiedVersion: '',
    _lastVersionSource: '',
    pendingStateStorageKey: 'update_pending_state_v1',
    launchNoticeCooldownMs: 12 * 60 * 60 * 1000,


      changelog: [
    {
        version: '3.14.0',
        date: '2026-04-28T12:00:00',
        label: 'Atual',
        labelColor: 'bg-green-500',
        author: 'Gabriel',
        changes: [
            { type: '🧱', text: 'Nyan Core finaliza versao, updater, storage, lifecycle e UI em uma base unica' },
            { type: '🚀', text: 'Boot do app estabilizado: tema, VersionManager e Firebase agora iniciam sem quebrar a tela' },
            { type: '🔄', text: 'App, Updater, preload e metadados usam a mesma versao 3.14.0' },
            { type: '💾', text: 'Camada NyanStorage adicionada para novos acessos seguros sem migracao agressiva' },
            { type: '🧭', text: 'NyanLifecycle adiciona cleanup para rotas, timers, listeners e subscriptions' },
            { type: '🛡️', text: 'Clãs deixam de gerar reload infinito e spam de permissao em leituras sociais' },
            { type: '💰', text: 'Desafios de Clã agora pagam o premio ao cofre vencedor uma unica vez' },
            { type: '🎨', text: 'UI de Clãs recebeu tabs limpas, badges revisados, ranking melhorado e textos ajustados' },
            { type: '📴', text: 'Modo offline agora mostra uma tela amigavel para usuario final, sem instrucoes de Firebase' },
            { type: '⚡', text: 'Listas grandes foram limitadas para reduzir render pesado em telas sociais e loja' },
            { type: '🗓️', text: 'NyanLiveOps fica pronto para eventos futuros sem ativar eventos nesta versao' },
        ]
    },
    {
        version: '3.13.3',
        date: '2026-04-26T12:00:00',
        label: '',
        labelColor: 'bg-green-500',
        author: 'Gabriel & Clara',
        changes: [
            { type: '🎯', text: 'Metas diarias e semanais do Clã com progresso coletivo por pontos, partidas, quizzes e ranking' },
            { type: '💰', text: 'Recompensas de metas distribuem chips entre membros e debitam o cofre sem saldo negativo' },
            { type: '⚔️', text: 'Desafios de 24h entre Clãs com placar sincronizado para os dois lados e limite de um desafio ativo' },
            { type: '🛠️', text: 'Corrigido desafio aparecendo apenas para quem desafia; ambos os Clãs agora enxergam a disputa' },
            { type: '🧩', text: 'HUB de Clãs redesenhado com header forte, Visao Geral, abas reais e sidebar mais leve' },
            { type: '📌', text: 'Visao Geral resume top metas, atividade recente, desafio atual e ranking compacto' },
            { type: '🎨', text: 'Layout visual unificado com grid principal/sidebar, cards padronizados e sidebar com scroll interno' },
            { type: '🧹', text: 'Sistema de convites por amigos removido; entrada por codigo e pedidos de Clãs privados continuam' },
            { type: '🔌', text: 'Hooks de metas, recompensas e desafios adicionados para integracoes futuras' },
        ]
    },
],

    render() {
        if (!this._devEnvChecked) {
            this._devEnvChecked = true;
            if (window.electronAPI?.isDevEnvironment) {
                window.electronAPI.isDevEnvironment().then(({ isDev }) => {
                    this._isDevEnv = !!isDev;
                    if (isDev) {
                        this._queueUIRender();
                    }
                }).catch(() => { this._isDevEnv = false; });
            }
        }

        try {
            return `
                <div class="space-y-5">
                    ${this.renderHero()}
                    ${this.renderStatusCard()}
                    ${this.renderChangelog()}
                    ${this.renderAutoCheckSetting()}
                    ${this._devMode ? this.renderDevPanel() : ''}
                </div>
            `;
        } catch (err) {
            console.error('❌ AutoUpdater.render() erro:', err);
            return `
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                    <div class="text-5xl mb-3">🔄</div>
                    <p class="font-black text-gray-800 mb-1">Sistema de Atualizações</p>
                    <p class="text-gray-500 text-sm mb-4">Versão atual: ${this.currentVersion}</p>
                    <button onclick="Router?.render()"
                            class="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all">
                        🔄 Recarregar
                    </button>
                </div>
            `;
        }
    },

    renderHero() {
        const lastCheck = Utils.loadData('last_update_check');
        const canCheck  = this.canCheckNow();
        const isDev = this._devMode && this._isDevEnv;
        const sourceLabel = this._getVersionSourceLabel();

        const latestEntry = this.changelog[0];
        let daysSince = null;
        if (latestEntry?.date) {
            const dateStr  = latestEntry.date.split('T')[0]; // 'YYYY-MM-DD'
            const [y, m, d] = dateStr.split('-').map(Number);
            const releaseDate = new Date(y, m - 1, d); // local time, sem UTC
            const today       = new Date();
            today.setHours(0, 0, 0, 0);
            daysSince = Math.max(0, Math.floor((today - releaseDate) / 86400000));
        }

        return `
            <div class="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden">
                <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 10% 50%, #8b5cf6, transparent 60%), radial-gradient(circle at 90% 50%, #ec4899, transparent 60%)"></div>
                <div class="relative flex items-center justify-between gap-4 flex-wrap">
                    <div class="flex items-center gap-4">
                        <div class="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl">🐱</div>
                        <div>
                            <div class="flex items-center gap-2 flex-wrap">
                                <div class="text-xs text-gray-400 uppercase tracking-widest font-semibold">NyanTools にゃん~</div>
                                ${isDev ? `<span class="text-xs font-black bg-orange-500 text-white px-2 py-0.5 rounded-full">DEV BUILD</span>` : ''}
                            </div>
                            <div class="text-2xl font-black">Versão ${this.currentVersion}</div>
                            <div class="flex items-center gap-3 mt-0.5 flex-wrap">
                                <div class="text-xs text-gray-400">${this._getLastCheckText(lastCheck)}</div>
                                ${daysSince !== null ? `<div class="text-xs text-gray-500">${daysSince === 0 ? '· atualizado hoje' : '· atualizado há ' + daysSince + (daysSince === 1 ? ' dia' : ' dias')}</div>` : ''}
                                <div class="text-xs text-gray-500">· fonte detecção: ${sourceLabel}</div>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        ${isDev ? `
                            <button onclick="AutoUpdater._toggleDevSimulation()"
                                    class="flex items-center gap-1.5 px-3 py-2 bg-orange-500/20 border border-orange-500/40 text-orange-300 rounded-xl font-bold text-xs hover:bg-orange-500/30 transition-all">
                                <span>🧪</span><span>${this._simulating ? 'Parar Sim.' : 'Simular DL'}</span>
                            </button>
                            <button onclick="AutoUpdater._forceCheck()"
                                    class="flex items-center gap-1.5 px-3 py-2 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-xl font-bold text-xs hover:bg-purple-500/30 transition-all">
                                <span>⚡</span><span>Force Check</span>
                            </button>
                        ` : ''}
                        <button onclick="AutoUpdater.checkForUpdates()"
                                id="check-updates-btn"
                                ${!canCheck || this.checking ? 'disabled' : ''}
                                class="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 rounded-xl font-bold text-sm hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg">
                            <span class="${this.checking ? 'animate-spin' : ''}">🔍</span>
                            <span>${this.checking ? 'Verificando...' : 'Verificar'}</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    renderStatusCard() {
        if (this.downloading || this._simulating) {
            const speedStr   = this._formatSpeed(this.downloadSpeed);
            const remaining  = this._formatRemaining(this.downloadRemaining);
            const pct        = this.downloadProgress;
            const downloaded = this._formatBytes(this.downloadedBytes);
            const total      = this._formatBytes(this.totalBytes);

            const isDarkMode = document.body.classList.contains('dark-theme');
            const cardBg     = isDarkMode ? 'rgba(255,255,255,0.05)' : '#ffffff';
            const cardBorder = isDarkMode ? 'rgba(255,255,255,0.1)'  : '#e5e7eb';
            const trackBg   = isDarkMode ? 'rgba(255,255,255,0.1)'  : '#f3f4f6';
            const cardShadow = isDarkMode ? 'none' : '0 1px 3px rgba(0,0,0,0.08)';

            return `
                <div style="border-radius:1rem; border:1px solid ${cardBorder}; padding:1.25rem 1.5rem; background:${cardBg}; box-shadow:${cardShadow};">
                    <div style="display:flex; align-items:center; justify-content:space-between; gap:0.75rem; margin-bottom:0.875rem;">
                        <div style="display:flex; align-items:center; gap:0.75rem;">
                            <span style="font-size:1.4rem;" class="animate-bounce">📥</span>
                            <div>
                                <div style="font-weight:900; font-size:0.95rem;">Baixando Atualização</div>
                                <div style="font-size:0.8rem; opacity:0.55; margin-top:0.1rem;" id="download-status">
                                    ${downloaded} / ${total}${speedStr ? ' · ' + speedStr : ''}${remaining ? ' · ~' + remaining + ' restantes' : ''}
                                </div>
                            </div>
                        </div>
                        <div style="font-weight:900; color:#3b82f6; font-size:1.1rem; flex-shrink:0;" id="download-pct">${pct}%</div>
                    </div>
                    <div style="height:6px; background:${trackBg}; border-radius:999px; overflow:hidden;">
                        <div id="download-progress-bar"
                             style="height:100%; width:${pct}%; background:linear-gradient(90deg,#3b82f6,#06b6d4); border-radius:999px; transition:width 0.3s ease;"></div>
                    </div>
                </div>
            `;
        }

        if (this.checking) {
            const isDark = document.body.classList.contains('dark-theme');
            return `
                <div style="border-radius:1rem; border:1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}; padding:2rem 1.5rem; background:${isDark ? 'rgba(255,255,255,0.05)' : '#ffffff'}; box-shadow:${isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.08)'}; text-align:center;">
                    <div class="loader mx-auto mb-3"></div>
                    <p style="font-weight:600; opacity:0.6;">Verificando atualizações... にゃん~</p>
                </div>
            `;
        }

        if (this.updateAvailable) {
            const asset = this.getDownloadAsset();

            let releaseChanges = this.latestVersion?.body
                ? this._parseReleaseBody(this.latestVersion.body)
                : [];

            if (releaseChanges.length === 0) {
                const latestTag = (this.latestVersion?.tag_name || '').replace('v', '');
                const localEntry = this.changelog.find(c => c.version === latestTag);
                if (localEntry?.changes?.length > 0) {
                    releaseChanges = localEntry.changes.map(c => `${c.type} ${c.text}`);
                }
            }

            const hasChanges = releaseChanges.length > 0;
            const isDark = document.body.classList.contains('dark-theme');

            const card = isDark ? {
                bg:         'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.08))',
                border:     '2px solid rgba(16,185,129,0.35)',
                title:      '#6ee7b7',
                subtitle:   '#34d399',
                strong:     '#a7f3d0',
                boxBg:      'rgba(255,255,255,0.06)',
                labelClr:   '#6ee7b7',
                textClr:    '#d1fae5',
                moreClr:    '#4ade80',
                assetBg:    'rgba(255,255,255,0.07)',
                assetName:  '#e5e7eb',
                assetSize:  '#9ca3af',
                btnSnooze:  'background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.7); border:1px solid rgba(255,255,255,0.15);',
                btnDetails: 'background:rgba(16,185,129,0.1); color:#6ee7b7; border:1px solid rgba(16,185,129,0.3);',
            } : {
                bg:         'linear-gradient(135deg, #ecfdf5, #f0fdfa)',
                border:     '2px solid #6ee7b7',
                title:      '#065f46',
                subtitle:   '#047857',
                strong:     '#065f46',
                boxBg:      'rgba(255,255,255,0.75)',
                labelClr:   '#047857',
                textClr:    '#065f46',
                moreClr:    '#059669',
                assetBg:    'rgba(255,255,255,0.75)',
                assetName:  '#1f2937',
                assetSize:  '#6b7280',
                btnSnooze:  'background:#fff; color:#374151; border:1px solid #d1d5db;',
                btnDetails: 'background:#fff; color:#047857; border:1px solid #6ee7b7;',
            };

            return `
                <div style="background:${card.bg}; border:${card.border}; border-radius:1rem; padding:1.5rem;">
                    <div style="display:flex; align-items:flex-start; gap:1rem;">
                        <div style="width:3rem; height:3rem; background:#10b981; border-radius:0.75rem; display:flex; align-items:center; justify-content:center; font-size:1.5rem; flex-shrink:0;">🎉</div>
                        <div style="flex:1; min-width:0;">
                            <div style="font-weight:900; color:${card.title}; font-size:1.1rem;">Nova versão disponível!</div>
                            <div style="color:${card.subtitle}; font-size:0.875rem; margin-top:0.125rem; margin-bottom:0.75rem;">
                                <strong style="color:${card.strong};">${this.latestVersion?.tag_name}</strong> pronta para instalar
                                ${this.latestVersion?._fromFallback ? `<span style="font-size:0.75rem; margin-left:0.25rem;">(via fallback)</span>` : ''}
                            </div>

                            ${hasChanges ? `
                                <div style="background:${card.boxBg}; border-radius:0.75rem; padding:0.75rem; margin-bottom:0.75rem;">
                                    <div style="font-size:0.7rem; font-weight:900; color:${card.labelClr}; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:0.5rem;">O que há de novo</div>
                                    ${releaseChanges.slice(0, 4).map(c => `
                                        <div style="font-size:0.75rem; color:${card.textClr}; display:flex; align-items:flex-start; gap:0.375rem; margin-bottom:0.25rem;">
                                            <span style="flex-shrink:0;">•</span><span>${c}</span>
                                        </div>`).join('')}
                                    ${releaseChanges.length > 4 ? `<div style="font-size:0.75rem; color:${card.moreClr}; margin-top:0.25rem;">+${releaseChanges.length - 4} mais...</div>` : ''}
                                </div>
                            ` : ''}

                            ${asset ? `
                                <div style="display:flex; align-items:center; gap:0.5rem; background:${card.assetBg}; border-radius:0.5rem; padding:0.5rem 0.75rem; margin-bottom:0.75rem; font-size:0.875rem;">
                                    <span>📦</span>
                                    <span style="font-weight:600; color:${card.assetName};">${asset.name}</span>
                                    <span style="color:${card.assetSize}; margin-left:auto;">${this._formatBytes(asset.size)}</span>
                                </div>
                            ` : ''}

                            <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                                <button onclick="AutoUpdater._confirmDownload()"
                                        style="flex:1; min-width:140px; background:#10b981; color:#fff; border:none; padding:0.625rem 1rem; border-radius:0.75rem; font-weight:700; font-size:0.875rem; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:0.5rem; box-shadow:0 4px 14px rgba(16,185,129,0.35); transition:filter 0.15s;"
                                        onmouseover="this.style.filter='brightness(1.1)'"
                                        onmouseout="this.style.filter=''">
                                    <span>⬇️</span><span>Baixar e Instalar</span>
                                </button>
                                <button onclick="AutoUpdater._snoozeUpdate()"
                                        style="${card.btnSnooze} padding:0.625rem 1rem; border-radius:0.75rem; font-weight:700; font-size:0.875rem; cursor:pointer;">
                                    🔕 Lembrar amanhã
                                </button>
                                <button onclick="AutoUpdater.viewReleaseNotes()"
                                        style="${card.btnDetails} padding:0.625rem 1rem; border-radius:0.75rem; font-weight:700; font-size:0.875rem; cursor:pointer;">
                                    📖 Detalhes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4"
                 style="background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.1); border-radius:1rem; padding:1.5rem; display:flex; align-items:center; gap:1rem;">
                <div style="width:3rem; height:3rem; background:rgba(16,185,129,0.15); border-radius:0.75rem; display:flex; align-items:center; justify-content:center; font-size:1.5rem; flex-shrink:0; border:1px solid rgba(16,185,129,0.3);">✅</div>
                <div>
                    <div style="font-weight:900;">Você está atualizado!</div>
                    <div style="font-size:0.875rem; opacity:0.6;">Versão ${this.currentVersion} é a mais recente にゃん~</div>
                </div>
            </div>
        `;
    },

    renderChangelog() {
        const installLog = Utils.loadData('update_install_log') || [];
        const releases = this.changelog;

        return `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div class="flex items-center gap-3 mb-5">
                    <span class="text-2xl">📝</span>
                    <h3 class="font-black text-gray-800">Histórico de Versões</h3>
                </div>

                <div class="space-y-6">
                    ${releases.map((release, i) => `
                        <div class="relative pl-6 ${i < releases.length - 1 ? 'pb-6' : ''}">
                            ${i < releases.length - 1 ? `<div class="absolute left-[9px] top-5 bottom-0 w-0.5 bg-gray-100"></div>` : ''}
                            <div class="absolute left-0 top-1 w-[18px] h-[18px] rounded-full border-2 border-gray-200 bg-white flex items-center justify-center">
                                <div class="w-2 h-2 rounded-full ${i === 0 ? 'bg-emerald-500' : 'bg-gray-300'}"></div>
                            </div>

                            <div class="flex items-center gap-2 mb-2 flex-wrap">
                                <span class="font-black text-gray-800">v${release.version}</span>
                                ${release.label ? `<span class="text-xs font-bold px-2 py-0.5 rounded-full text-white ${release.labelColor}">${release.label}</span>` : ''}
                                <span class="text-xs text-gray-400">${new Date(release.date).toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric' })}</span>
                                ${release.author ? `<span class="text-xs text-gray-400">· <span class="inline-flex items-center gap-1 bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full">👤 ${release.author}</span></span>` : ''}
                                ${installLog.find(l => l.to === release.version) ? `<span class="text-xs bg-blue-100 text-blue-600 font-bold px-2 py-0.5 rounded-full">📦 instalado</span>` : ''}
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
                            <div class="text-xs text-gray-500">Avisos leves de nova versao continuam no boot; esta opcao controla checagens extras</div>
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

    renderDevPanel() {
        if (!this._isDevEnv) return '';

        return `
            <div class="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5">
                <div class="flex items-center gap-2 mb-3">
                    <span class="text-lg">🔧</span>
                    <span class="font-black text-orange-800 text-sm uppercase tracking-wide">Dev Tools — Updater</span>
                </div>
                <div class="grid grid-cols-2 gap-2 text-xs">
                    <div style="background:rgba(255,255,255,0.08); border-radius:0.5rem; padding:0.5rem;">
                        <div style="font-size:0.7rem; font-weight:700; opacity:0.5; margin-bottom:0.2rem;">Versão atual</div>
                        <div style="font-weight:900;">${this.currentVersion}</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.08); border-radius:0.5rem; padding:0.5rem;">
                        <div style="font-size:0.7rem; font-weight:700; opacity:0.5; margin-bottom:0.2rem;">Rate limit</div>
                        <div style="font-weight:900;">${this.canCheckNow() ? '✅ Livre' : '⏱️ Em cooldown'}</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.08); border-radius:0.5rem; padding:0.5rem;">
                        <div style="font-size:0.7rem; font-weight:700; opacity:0.5; margin-bottom:0.2rem;">Update disponível</div>
                        <div style="font-weight:900;">${this.updateAvailable ? '✅ Sim' : '❌ Não'}</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.08); border-radius:0.5rem; padding:0.5rem;">
                        <div style="font-size:0.7rem; font-weight:700; opacity:0.5; margin-bottom:0.2rem;">Electron API</div>
                        <div style="font-weight:900;">${window.electronAPI?.isReady ? '✅ OK' : '❌ Indisponível'}</div>
                    </div>
                </div>
                <p class="text-xs text-orange-600 mt-3 font-semibold">
                    💡 Ctrl+Shift+U para sair do modo dev · Os botões Force Check e Simular DL aparecem no hero
                </p>
            </div>
        `;
    },

    _queueUIRender({ withNav = false } = {}) {
        this._uiRenderNeedsNav = this._uiRenderNeedsNav || !!withNav;
        if (this._uiRenderScheduled) return;
        this._uiRenderScheduled = true;
        const flush = () => {
            this._uiRenderScheduled = false;
            if (this._uiRenderNeedsNav) {
                this._uiRenderNeedsNav = false;
                App?.renderNavMenu?.();
            }
            Router?.render?.();
        };
        if (typeof window.requestAnimationFrame === 'function') {
            window.requestAnimationFrame(flush);
        } else {
            window.setTimeout(flush, 0);
        }
    },

    _escapeHtml(value = '') {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },

    _normalizeSourceTag(source = '') {
        const safe = String(source || '').trim().toLowerCase();
        if (!safe) return '';
        if (safe.includes('native')) return 'native';
        if (safe.includes('cache') || safe.includes('storage')) return 'cache';
        if (safe.includes('fallback')) return 'fallback';
        if (safe.includes('github') || safe.includes('launch') || safe.includes('manual') || safe.includes('background')) return 'github';
        return safe;
    },

    _setVersionSource(source = '') {
        this._lastVersionSource = this._normalizeSourceTag(source);
    },

    _getVersionSourceLabel() {
        const tag = this._normalizeSourceTag(this._lastVersionSource || '');
        if (tag === 'native') return 'Native updater';
        if (tag === 'cache') return 'Cache local';
        if (tag === 'fallback') return 'GitHub fallback';
        if (tag === 'github') return 'GitHub API';
        return 'Indefinida';
    },

    _normalizeCheckOptions(input = false) {
        if (typeof input === 'object' && input !== null) {
            return {
                silentNoUpdate: input.silentNoUpdate === true,
                notifyOnAvailable: input.notifyOnAvailable !== false,
                force: input.force === true,
                source: String(input.source || 'manual'),
            };
        }

        const silent = input === true;
        return {
            silentNoUpdate: silent,
            notifyOnAvailable: !silent,
            force: false,
            source: silent ? 'background' : 'manual',
        };
    },

    _loadVersionCache() {
        const cache = Utils.loadData('version_cache');
        if (!cache?.data) return null;

        const timestamp = Number(cache.timestamp || 0);
        const expiresIn = Number(cache.expiresIn || 0);
        if (timestamp > 0 && expiresIn > 0 && Date.now() - timestamp <= expiresIn) {
            return cache.data;
        }

        return cache.data || null;
    },

    _getSnoozeUntil() {
        return Math.max(0, Number(Utils.loadData('update_snooze') || 0));
    },

    _isSnoozed() {
        const snoozeUntil = this._getSnoozeUntil();
        if (!snoozeUntil) return false;
        if (Date.now() < snoozeUntil) return true;
        Utils.removeData('update_snooze');
        return false;
    },

    _normalizeVersion(version = '') {
        return String(version || '').trim().replace(/^v/i, '');
    },

    _getPendingVersion() {
        return this._normalizeVersion(this.latestVersion?.tag_name || this.latestVersion?.version || '');
    },

    _getPendingState() {
        const raw = Utils.loadData(this.pendingStateStorageKey);
        if (!raw || typeof raw !== 'object') return null;
        const version = this._normalizeVersion(raw.version || '');
        const seenAt = Number(raw.seenAt || raw.at || 0);
        const source = this._normalizeSourceTag(raw.source || '');
        if (!version) {
            Utils.removeData(this.pendingStateStorageKey);
            return null;
        }
        if (!this._devMode && this.compareVersions(version, this.currentVersion) <= 0) {
            Utils.removeData(this.pendingStateStorageKey);
            return null;
        }
        return {
            version,
            seenAt: Number.isFinite(seenAt) && seenAt > 0 ? seenAt : Date.now(),
            source: source || 'cache',
        };
    },

    _savePendingState(version = '', source = '') {
        const safe = this._normalizeVersion(version);
        if (!safe) return;
        const safeSource = this._normalizeSourceTag(source || this._lastVersionSource || '');
        Utils.saveData(this.pendingStateStorageKey, {
            version: safe,
            seenAt: Date.now(),
            source: safeSource || 'cache',
        });
    },

    _clearPendingState() {
        Utils.removeData(this.pendingStateStorageKey);
    },

    _restorePendingStateFromStorage() {
        const pending = this._getPendingState();
        if (!pending) return false;
        this._setVersionSource(pending.source || 'cache');
        const currentPending = this._getPendingVersion();
        if (!currentPending || currentPending !== pending.version) {
            this.latestVersion = {
                tag_name: `v${pending.version}`,
                version: pending.version,
                html_url: this.githubReleasesUrl,
                body: '',
                _fromStorage: true,
            };
        }
        this.updateAvailable = true;
        return true;
    },

    hasPendingUpdate() {
        if (this.updateAvailable === true) return true;
        return !!this._getPendingState();
    },

    _cleanupStaleUpdateStateForCurrentVersion() {
        const current = this._normalizeVersion(this.currentVersion || '');
        if (!current) return;

        const clearIfOlderOrEqual = (storageKey = '') => {
            const stored = this._normalizeVersion(Utils.loadData(storageKey) || '');
            if (!stored) return;
            if (this.compareVersions(stored, current) <= 0) {
                Utils.removeData(storageKey);
            }
        };

        clearIfOlderOrEqual('update_ignored_version');
        clearIfOlderOrEqual('update_important_modal_seen');

        const reminder = Utils.loadData('update_reminder_state');
        if (reminder && typeof reminder === 'object') {
            const reminderVersion = this._normalizeVersion(reminder.version || '');
            if (!reminderVersion || this.compareVersions(reminderVersion, current) <= 0) {
                Utils.removeData('update_reminder_state');
            }
        }

        const notice = Utils.loadData('update_notice_state');
        if (notice && typeof notice === 'object') {
            const noticeVersion = this._normalizeVersion(notice.version || '');
            if (!noticeVersion || this.compareVersions(noticeVersion, current) <= 0) {
                Utils.removeData('update_notice_state');
            }
        }

        const pending = this._getPendingState();
        if (pending && this.compareVersions(pending.version, current) <= 0) {
            this._clearPendingState();
        }

        const cache = Utils.loadData('version_cache');
        if (cache?.data && typeof cache.data === 'object') {
            const cachedVersion = this._normalizeVersion(cache.data.tag_name || cache.data.version || '');
            if (cachedVersion && this.compareVersions(cachedVersion, current) <= 0) {
                Utils.removeData('version_cache');
            }
        }
    },

    _getIgnoredVersion() {
        return this._normalizeVersion(Utils.loadData('update_ignored_version') || '');
    },

    _isVersionIgnored(version = '') {
        const safe = this._normalizeVersion(version);
        if (!safe) return false;
        return this._getIgnoredVersion() === safe;
    },

    _getReminderState() {
        const raw = Utils.loadData('update_reminder_state');
        if (!raw || typeof raw !== 'object') return null;
        const version = this._normalizeVersion(raw.version || '');
        const until = Number(raw.until || 0);
        if (!version || !Number.isFinite(until) || until <= 0) {
            Utils.removeData('update_reminder_state');
            return null;
        }
        if (Date.now() >= until) {
            Utils.removeData('update_reminder_state');
            return null;
        }
        return { version, until };
    },

    _isReminderActive(version = '') {
        const safe = this._normalizeVersion(version);
        if (!safe) return false;
        const reminder = this._getReminderState();
        if (!reminder) return false;
        return reminder.version === safe;
    },

    _setReminderForVersion(version = '', hours = 24) {
        const safe = this._normalizeVersion(version);
        if (!safe) return;
        const safeHours = Math.max(1, Number(hours) || 24);
        Utils.saveData('update_reminder_state', {
            version: safe,
            until: Date.now() + (safeHours * 60 * 60 * 1000),
        });
    },

    _clearReminderForVersion(version = '') {
        const reminder = this._getReminderState();
        const safe = this._normalizeVersion(version);
        if (!reminder) return;
        if (!safe || reminder.version === safe) {
            Utils.removeData('update_reminder_state');
        }
    },

    _ignoreVersion(version = '') {
        const safe = this._normalizeVersion(version);
        if (!safe) return;
        Utils.saveData('update_ignored_version', safe);
        this._clearReminderForVersion(safe);
    },

    _hasShownImportantModal(version = '') {
        const safe = this._normalizeVersion(version);
        if (!safe) return false;
        return this._normalizeVersion(Utils.loadData('update_important_modal_seen') || '') === safe;
    },

    _markImportantModalShown(version = '') {
        const safe = this._normalizeVersion(version);
        if (!safe) return;
        Utils.saveData('update_important_modal_seen', safe);
    },

    _shouldSuppressProactiveNotice(version = '') {
        const safe = this._normalizeVersion(version);
        if (!safe) return true;
        if (this._isVersionIgnored(safe)) return true;
        if (this._isReminderActive(safe)) return true;
        return false;
    },

    _getReleaseHighlights(limit = 3, version = '') {
        const parsedLimit = Math.floor(Number(limit));
        const safeLimit = Number.isFinite(parsedLimit)
            ? Math.max(1, Math.min(10, parsedLimit))
            : 3;
        const targetVersion = this._normalizeVersion(version || this._getPendingVersion());
        let highlights = this.latestVersion?.body
            ? this._parseReleaseBody(this.latestVersion.body)
            : [];
        if (!highlights.length && targetVersion) {
            const localEntry = this.changelog.find((entry) => this._normalizeVersion(entry?.version || '') === targetVersion);
            if (localEntry?.changes?.length) {
                highlights = localEntry.changes.map((entry) => `${entry.type} ${entry.text}`);
            }
        }
        return highlights.slice(0, safeLimit);
    },

    _isImportantUpdate(version = '') {
        const safe = this._normalizeVersion(version);
        if (!safe) return false;
        const cur = this._normalizeVersion(this.currentVersion);
        const nextParts = safe.split('.').map((n) => Number(n) || 0);
        const curParts = cur.split('.').map((n) => Number(n) || 0);
        const majorBump = (nextParts[0] || 0) > (curParts[0] || 0);
        const minorBump = (nextParts[0] || 0) === (curParts[0] || 0)
            && (nextParts[1] || 0) > (curParts[1] || 0);
        return majorBump || minorBump;
    },

    _ensurePromptStyles() {
        if (document.getElementById('nyan-update-prompt-style')) return;
        const style = document.createElement('style');
        style.id = 'nyan-update-prompt-style';
        style.textContent = `
            #nyan-update-banner {
                position: fixed;
                right: 1rem;
                bottom: 1rem;
                z-index: 99995;
                width: min(440px, calc(100vw - 2rem));
                border-radius: 16px;
                border: 1px solid rgba(16, 185, 129, 0.35);
                background: linear-gradient(145deg, rgba(5, 16, 26, 0.96), rgba(8, 22, 36, 0.96));
                box-shadow: 0 24px 70px rgba(0, 0, 0, 0.5);
                color: #e2e8f0;
                font-family: 'DM Sans', sans-serif;
                backdrop-filter: blur(8px);
            }
            #nyan-update-banner .upd-btn,
            #nyan-update-important-modal .upd-btn {
                border-radius: 10px;
                font-size: 0.75rem;
                font-weight: 800;
                padding: 0.5rem 0.72rem;
                cursor: pointer;
                border: 1px solid transparent;
                transition: all 0.15s ease;
            }
            #nyan-update-banner .upd-btn-primary,
            #nyan-update-important-modal .upd-btn-primary {
                background: linear-gradient(135deg, #10b981, #059669);
                color: #ffffff;
                border-color: rgba(16, 185, 129, 0.35);
            }
            #nyan-update-banner .upd-btn-secondary,
            #nyan-update-important-modal .upd-btn-secondary {
                background: rgba(255, 255, 255, 0.06);
                color: #cbd5e1;
                border-color: rgba(255, 255, 255, 0.15);
            }
            #nyan-update-banner .upd-btn:hover,
            #nyan-update-important-modal .upd-btn:hover { filter: brightness(1.08); }
            #nyan-update-important-modal {
                position: fixed;
                inset: 0;
                z-index: 99996;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(2, 6, 23, 0.72);
            }
        `;
        document.head.appendChild(style);
    },

    _removeProactiveBanner() {
        document.getElementById('nyan-update-banner')?.remove();
        this._proactiveBannerVersion = '';
    },

    _closeImportantModal() {
        document.getElementById('nyan-update-important-modal')?.remove();
        this._importantModalVersion = '';
    },

    _dismissProactiveUpdateUI() {
        this._removeProactiveBanner();
        this._closeImportantModal();
    },

    _openUpdatesCenter() {
        if (window.Settings) {
            window.Settings.currentTab = 'updates';
        }
        if (window.Router?.navigate) {
            window.Router.navigate('settings');
            return;
        }
        this._queueUIRender({ withNav: true });
    },

    _showProactiveBanner(version = '') {
        const safe = this._normalizeVersion(version);
        if (!safe) return;
        if (this._proactiveBannerVersion === safe && document.getElementById('nyan-update-banner')) return;
        this._ensurePromptStyles();
        this._removeProactiveBanner();

        const highlights = this._getReleaseHighlights(2, safe);
        const card = document.createElement('div');
        card.id = 'nyan-update-banner';
        card.innerHTML = `
            <div style="padding:0.9rem 0.95rem;">
                <div style="display:flex;align-items:flex-start;gap:0.65rem;">
                    <div style="width:34px;height:34px;border-radius:10px;background:rgba(16,185,129,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;">⬆️</div>
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:0.9rem;font-weight:900;color:#a7f3d0;">Nova versão disponível (v${safe})</div>
                        <div style="font-size:0.72rem;opacity:0.8;margin-top:0.15rem;">Atualização detectada ao iniciar. Deseja atualizar agora?</div>
                        ${highlights.length ? `<div style="margin-top:0.45rem;font-size:0.68rem;opacity:0.86;display:grid;gap:0.14rem;">${highlights.map((line) => `<div>• ${this._escapeHtml(line)}</div>`).join('')}</div>` : ''}
                    </div>
                </div>
                <div style="display:flex;gap:0.42rem;margin-top:0.72rem;flex-wrap:wrap;">
                    <button id="upd-banner-now" class="upd-btn upd-btn-primary">Atualizar agora</button>
                    <button id="upd-banner-details" class="upd-btn upd-btn-secondary">Ver detalhes</button>
                    <button id="upd-banner-later" class="upd-btn upd-btn-secondary">Lembrar depois</button>
                </div>
            </div>
        `;

        card.querySelector('#upd-banner-now')?.addEventListener('click', () => {
            this._removeProactiveBanner();
            this._openUpdatesCenter();
            this._confirmDownload();
        });
        card.querySelector('#upd-banner-details')?.addEventListener('click', () => {
            this._removeProactiveBanner();
            this._openUpdatesCenter();
        });
        card.querySelector('#upd-banner-later')?.addEventListener('click', () => {
            this._setReminderForVersion(safe, 24);
            this._removeProactiveBanner();
            Utils.showNotification('🔕 Lembrete de atualização reagendado para amanhã.', 'info');
        });

        document.body.appendChild(card);
        this._proactiveBannerVersion = safe;
    },

    _showImportantUpdateModal(version = '') {
        const safe = this._normalizeVersion(version);
        if (!safe) return;
        if (this._importantModalVersion === safe && document.getElementById('nyan-update-important-modal')) return;
        this._ensurePromptStyles();
        this._closeImportantModal();
        this._markImportantModalShown(safe);

        const highlights = this._getReleaseHighlights(4, safe);
        const modal = document.createElement('div');
        modal.id = 'nyan-update-important-modal';
        modal.innerHTML = `
            <div style="width:min(520px, calc(100vw - 2rem));border-radius:18px;border:1px solid rgba(56,189,248,0.35);background:linear-gradient(145deg,#0b1321,#111827);padding:1.25rem 1.25rem 1.1rem;color:#e5e7eb;font-family:'DM Sans',sans-serif;box-shadow:0 30px 80px rgba(0,0,0,0.6);">
                <div style="display:flex;align-items:center;gap:0.55rem;margin-bottom:0.55rem;">
                    <span style="font-size:1.3rem;">🚀</span>
                    <div style="font-size:1.03rem;font-weight:900;">Atualização importante disponível (v${safe})</div>
                </div>
                <div style="font-size:0.78rem;opacity:0.82;line-height:1.55;">
                    Esta versão traz mudanças relevantes. Você pode atualizar agora ou revisar os detalhes antes.
                </div>
                <div style="margin-top:0.7rem;border-radius:12px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);padding:0.68rem 0.75rem;font-size:0.72rem;display:grid;gap:0.2rem;">
                    ${highlights.length ? highlights.map((line) => `<div>• ${this._escapeHtml(line)}</div>`).join('') : '<div>Sem detalhes extras desta versão.</div>'}
                </div>
                <div style="display:flex;gap:0.45rem;flex-wrap:wrap;margin-top:0.8rem;">
                    <button id="upd-important-now" class="upd-btn upd-btn-primary">Atualizar agora</button>
                    <button id="upd-important-details" class="upd-btn upd-btn-secondary">Ver detalhes</button>
                    <button id="upd-important-later" class="upd-btn upd-btn-secondary">Lembrar depois</button>
                    <button id="upd-important-ignore" class="upd-btn upd-btn-secondary">Ignorar versão</button>
                </div>
            </div>
        `;

        modal.addEventListener('click', (event) => {
            if (event.target === modal) this._closeImportantModal();
        });
        modal.querySelector('#upd-important-now')?.addEventListener('click', () => {
            this._closeImportantModal();
            this._removeProactiveBanner();
            this._openUpdatesCenter();
            this._confirmDownload();
        });
        modal.querySelector('#upd-important-details')?.addEventListener('click', () => {
            this._closeImportantModal();
            this._openUpdatesCenter();
        });
        modal.querySelector('#upd-important-later')?.addEventListener('click', () => {
            this._setReminderForVersion(safe, 24);
            this._closeImportantModal();
            this._removeProactiveBanner();
            Utils.showNotification('🔕 Lembrete de atualização reagendado para amanhã.', 'info');
        });
        modal.querySelector('#upd-important-ignore')?.addEventListener('click', () => {
            this._ignoreVersion(safe);
            this._closeImportantModal();
            this._removeProactiveBanner();
            Utils.showNotification(`🗂️ Versão v${safe} marcada como ignorada.`, 'info');
        });

        document.body.appendChild(modal);
        this._importantModalVersion = safe;
    },

    _handleProactiveUpdateAvailable(version = '', options = {}) {
        const safe = this._normalizeVersion(version);
        if (!safe) return;
        if (this._shouldSuppressProactiveNotice(safe)) {
            this._dismissProactiveUpdateUI();
            return;
        }
        const alreadyInUpdatesCenter = window.Router?.currentRoute === 'settings'
            && window.Settings?.currentTab === 'updates';
        if (alreadyInUpdatesCenter) return;
        this._showProactiveBanner(safe);
        if (this._isImportantUpdate(safe) && !this._hasShownImportantModal(safe)) {
            this._showImportantUpdateModal(safe);
        }
    },

    _shouldNotifyUpdate(version = '', source = 'manual') {
        const safe = this._normalizeVersion(version);
        if (!safe) return false;
        if (this._normalizeVersion(this._sessionNotifiedVersion) === safe) return false;
        if (this._isSnoozed()) return false;
        if (this._isVersionIgnored(safe)) return false;
        if (this._isReminderActive(safe)) return false;

        const notice = Utils.loadData('update_notice_state');
        if (notice && this._normalizeVersion(notice.version) === safe) {
            const elapsed = Date.now() - Number(notice.at || 0);
            if (Number.isFinite(elapsed) && elapsed < this.launchNoticeCooldownMs) {
                return false;
            }
        }

        if (source === 'manual') return true;
        return true;
    },

    _markUpdateNotified(version = '') {
        const safe = this._normalizeVersion(version);
        if (!safe) return;
        this._sessionNotifiedVersion = safe;
        Utils.saveData('update_notice_state', { version: safe, at: Date.now() });
    },

    _restoreProactiveUpdateUIIfNeeded() {
        const pendingVersion = this._getPendingVersion() || this._getPendingState()?.version || '';
        if (!pendingVersion || !this.hasPendingUpdate()) {
            this._dismissProactiveUpdateUI();
            return;
        }
        if (this._shouldSuppressProactiveNotice(pendingVersion)) {
            this._dismissProactiveUpdateUI();
            return;
        }

        const alreadyInUpdatesCenter = window.Router?.currentRoute === 'settings'
            && window.Settings?.currentTab === 'updates';
        if (alreadyInUpdatesCenter) return;

        if (!document.getElementById('nyan-update-banner')) {
            this._showProactiveBanner(pendingVersion);
        }
        if (this._isImportantUpdate(pendingVersion)
            && !this._hasShownImportantModal(pendingVersion)
            && !document.getElementById('nyan-update-important-modal')) {
            this._showImportantUpdateModal(pendingVersion);
        }
    },

    _syncUpdateUI() {
        this._queueUIRender({ withNav: true });
        window.setTimeout(() => this._restoreProactiveUpdateUIIfNeeded(), 0);
    },

    async init() {
        if (this._initialized) return;
        this._initialized = true;
        window.VersionManager?.syncModules?.();

        if (window.App?.version) {
            this.currentVersion = window.App.version;
        } else if (window.electronAPI?.getAppVersion) {
            this.currentVersion = window.electronAPI.getAppVersion();
        } else {
            const versionPaths = ['./version.json', '../version.json'];
            for (const vpath of versionPaths) {
                try {
                    const res = await fetch(vpath);
                    if (!res.ok) continue;
                    const data = await res.json();
                    if (data.version) { this.currentVersion = data.version; break; }
                } catch (_) {}
            }
        }

        if (window.electronAPI?.onUpdaterStatus && !this._statusListenerRegistered) {
                this._statusListenerRegistered = true;
            this._statusUnsubscribe = window.electronAPI.onUpdaterStatus((status) => {
                this._handleNativeStatus(status);
            });
        }

        this._cleanupStaleUpdateStateForCurrentVersion();
        this._restorePendingStateFromStorage();

        const cachedVersion = this._loadVersionCache();
        if (cachedVersion) {
            this._processVersionData(cachedVersion, {
                silentNoUpdate: true,
                notifyOnAvailable: false,
                source: 'launch-cache',
            });
        }

        if (this.canCheckNow()) {
            setTimeout(() => this.checkForUpdates({
                silentNoUpdate: true,
                notifyOnAvailable: true,
                source: 'launch',
            }), 3000);
        }
    },

    _handleNativeStatus(status) {
        switch (status.event) {
            case 'checking':
                this.checking = true;
                this._queueUIRender();
                break;

            case 'update-available':
                this.checking = false;
                this._nativeResponded = true;
                clearTimeout(this._nativeFallbackTimer); // cancela fallback desnecessário
                this.updateAvailable = true;
                this._setVersionSource('native');
                this.downloading = false;  // usuário decide quando baixar
                this.latestVersion = {
                    tag_name: `v${status.version}`,
                    name: `NyanTools v${status.version}`,
                    body: status.releaseNotes || '',
                    html_url: this.githubReleasesUrl,
                    _fromNativeUpdater: true
                };
                const nativeVersion = this._normalizeVersion(status.version || '');
                this._savePendingState(nativeVersion, 'native');
                Utils.saveData('last_update_check', { date: Date.now(), version: this.currentVersion });
                if (this._shouldNotifyUpdate(nativeVersion, 'native')) {
                    this._markUpdateNotified(nativeVersion);
                    Utils.showNotification(`🎉 Nova versão disponível: v${nativeVersion}`, 'success');
                }
                this._handleProactiveUpdateAvailable(nativeVersion, { source: 'native' });
                this._syncUpdateUI();
                break;

            case 'up-to-date':
                this.checking = false;
                this._nativeResponded = true; // cancela o fallback timer
                clearTimeout(this._nativeFallbackTimer);
                this.updateAvailable = false;
                this._setVersionSource('native');
                this.latestVersion = null;
                this._clearPendingState();
                this._dismissProactiveUpdateUI();
                this._syncUpdateUI();
                break;

            case 'update-downloaded':
                this.downloading = false;
                this.downloadProgress = 100;
                this._logInstall(this.currentVersion, status.version || '');
                this._setVersionSource('native');
                this._clearPendingState();
                this._dismissProactiveUpdateUI();
                Utils.showNotification(`🎉 v${status.version} baixada! Reiniciando em 5s...`, 'success');
                this._syncUpdateUI();
                break;

            case 'error':
                this.checking  = false;
                this.downloading = false;
                console.warn('[Updater] Erro nativo:', status.message);
                this._syncUpdateUI();
                break;
        }
    },

    canCheckNow(force = false) {
        if (force) return true;
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

    async checkForUpdates(input = false) {
        const options = this._normalizeCheckOptions(input);

        if (this._checkInFlightPromise) {
            if (!options.silentNoUpdate) Utils.showNotification('⏱️ Verificação em andamento...', 'info');
            return this._checkInFlightPromise;
        }

        if (this.checking) {
            if (!options.silentNoUpdate) Utils.showNotification('⏱️ Verificação em andamento...', 'info');
            return null;
        }

        if (!this.canCheckNow(options.force) && !this._devMode) {
            if (!options.silentNoUpdate) {
                const lastCheck   = Utils.loadData('last_update_check');
                const minutesLeft = Math.ceil((this.minCheckInterval - (Date.now() - lastCheck.date)) / 60000);
                Utils.showNotification(`⏱️ Aguarde ${minutesLeft} min para verificar novamente`, 'warning');
            }
            return null;
        }

        const run = async () => {
            this.checking = true;
            this._nativeResponded = false;
            if (!options.silentNoUpdate) this._queueUIRender();

            try {
                let data;

                if (window.electronAPI?.isReady) {
                    const result = await window.electronAPI.checkForUpdates();

                    if (!result.success) {
                        if (result.rateLimited) {
                            if (!options.silentNoUpdate) Utils.showNotification('⏱️ Aguarde alguns minutos para verificar novamente', 'warning');
                            return null;
                        }
                        throw new Error(result.error || 'Falha na verificação');
                    }

                    data = result.data;
                } else {
                    const res = await fetch(this.updateUrl, {
                        headers: { 'Accept': 'application/vnd.github.v3+json' }
                    });
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    data = await res.json();
                }

                this._cacheVersion(data);
                Utils.saveData('last_update_check', { date: Date.now(), version: this.currentVersion });
                this._processVersionData(data, options);
                return data;

            } catch (error) {
                console.error('❌ Erro ao verificar atualizações:', error);
                const cached = this._loadVersionCache();
                if (cached) {
                    this._processVersionData(cached, { ...options, source: `${options.source}:cache` });
                    return cached;
                }
                if (!options.silentNoUpdate) Utils.showNotification('❌ Erro ao verificar atualizações', 'error');
                return null;
            } finally {
                this.checking = false;
                if (!options.silentNoUpdate) this._queueUIRender();
            }
        };

        this._checkInFlightPromise = run().finally(() => {
            this._checkInFlightPromise = null;
        });
        return this._checkInFlightPromise;
    },

    _processVersionData(data, options = {}) {
        if (!data) return;

        if (data.usingNativeUpdater) return;

        const latest = this._normalizeVersion(data.tag_name || data.version || '');
        if (!latest) return;
        const detectedSource = this._normalizeSourceTag(
            options.source
            || (data._fromFallback ? 'fallback' : '')
            || 'github'
        );
        this._setVersionSource(detectedSource);

        if (this.compareVersions(latest, this.currentVersion) > 0 || this._devMode) {
            this.updateAvailable = true;
            this.latestVersion   = data;
            this._savePendingState(latest, detectedSource);
            if (options.notifyOnAvailable && this._shouldNotifyUpdate(latest, options.source || 'manual')) {
                this._markUpdateNotified(latest);
                const changes = this._parseReleaseBody(data.body || '').slice(0, 3);
                const preview = changes.length > 0 ? '\n' + changes.map(c => `• ${c}`).join('\n') : '';
                Utils.showNotification(`🎉 Nova versão disponível: v${latest}${preview}`, 'success');
            }
            this._handleProactiveUpdateAvailable(latest, options);
        } else {
            this.updateAvailable = false;
            this.latestVersion = null;
            this._clearPendingState();
            this._dismissProactiveUpdateUI();
            if (!options.silentNoUpdate) {
            Utils.showNotification('✅ Você está na versão mais recente!', 'success');
            }
        }
        this._syncUpdateUI();
    },

    _cacheVersion(data) {
        Utils.saveData('version_cache', { data, timestamp: Date.now(), expiresIn: 3600000 });
    },

    compareVersions(v1, v2) {
        const p1 = String(v1).split('.').map(Number);
        const p2 = String(v2).split('.').map(Number);
        for (let i = 0; i < 3; i++) {
            if ((p1[i] || 0) > (p2[i] || 0)) return 1;
            if ((p1[i] || 0) < (p2[i] || 0)) return -1;
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

    _confirmDownload() {
        const version = this.latestVersion?.tag_name || 'nova versão';
        document.getElementById('nyan-update-confirm')?.remove();

        const modal = document.createElement('div');
        modal.id = 'nyan-update-confirm';
        modal.style.cssText = `
            position:fixed;inset:0;z-index:99999;
            display:flex;align-items:center;justify-content:center;
            background:rgba(0,0,0,0.7);
            animation:ucFadeIn 0.2s ease;
        `;
        modal.innerHTML = `
            <style>
                @keyframes ucFadeIn  { from{opacity:0} to{opacity:1} }
                @keyframes ucSlideUp { from{opacity:0;transform:translateY(24px) scale(0.96)} to{opacity:1;transform:none} }
                #uc-card { animation:ucSlideUp 0.28s cubic-bezier(0.34,1.56,0.64,1); }
                #uc-cancel:hover { background:rgba(255,255,255,0.1)!important; color:white!important; }
                #uc-confirm:hover { filter:brightness(1.12); }
            </style>
            <div id="uc-card" style="
                background:linear-gradient(145deg,#0e0e1a,#14102a);
                border:1px solid rgba(168,85,247,0.3);
                border-radius:20px; padding:2rem;
                width:100%; max-width:380px; margin:0 1rem;
                box-shadow:0 32px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(168,85,247,0.1), inset 0 1px 0 rgba(255,255,255,0.05);
                font-family:'DM Sans',sans-serif;
            ">
                <div style="width:52px;height:52px;border-radius:14px;background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.3);display:flex;align-items:center;justify-content:center;font-size:1.6rem;margin-bottom:1.25rem;">⬇️</div>

                <div style="font-size:1.05rem;font-weight:800;color:white;margin-bottom:0.4rem;font-family:'Syne',sans-serif;">
                    Instalar ${version}?
                </div>
                <div style="font-size:0.82rem;color:rgba(255,255,255,0.45);line-height:1.6;margin-bottom:0.75rem;">
                    O app será baixado e instalado automaticamente.<br>
                    Ao terminar, o NyanTools reinicia sozinho. にゃん~
                </div>

                <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:0.65rem 0.9rem;margin-bottom:1.5rem;display:flex;align-items:center;gap:0.6rem;">
                    <span style="font-size:1rem;">💾</span>
                    <span style="font-size:0.78rem;color:rgba(255,255,255,0.5);">Seus dados não serão apagados</span>
                </div>

                <div style="display:flex;gap:0.625rem;">
                    <button id="uc-cancel" style="
                        flex:1;padding:0.65rem;border-radius:10px;
                        background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);
                        color:rgba(255,255,255,0.55);font-size:0.875rem;font-weight:600;
                        cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;">Agora não</button>
                    <button id="uc-confirm" style="
                        flex:1;padding:0.65rem;border-radius:10px;
                        background:linear-gradient(135deg,#10b981,#059669);
                        border:1px solid rgba(16,185,129,0.4);
                        color:white;font-size:0.875rem;font-weight:700;
                        cursor:pointer;font-family:'DM Sans',sans-serif;
                        box-shadow:0 4px 16px rgba(16,185,129,0.3);transition:filter 0.15s;">⬇️ Baixar agora</button>
                </div>
            </div>
        `;

        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
        modal.querySelector('#uc-cancel').addEventListener('click', () => modal.remove());
        modal.querySelector('#uc-confirm').addEventListener('click', () => {
            modal.remove();
            this.downloadAndInstall();
        });

        document.body.appendChild(modal);
    },

    async downloadAndInstall() {
        this.downloading      = true;
        this.downloadProgress = 0;
        this.downloadedBytes  = 0;
        this.totalBytes       = 0;

        if (window.electronAPI?.onDownloadProgress && !this._progressListenerRegistered) {
            this._progressListenerRegistered = true;
            this._progressUnsubscribe = window.electronAPI.onDownloadProgress((data) => {
                this.downloadProgress  = data.progress  || 0;
                this.downloadedBytes   = data.downloadedBytes || 0;
                this.totalBytes        = data.totalBytes || 0;
                this.downloadSpeed     = data.speedBps   || 0;
                this.downloadRemaining = data.remainingSecs || 0;

                const bar    = document.getElementById('download-progress-bar');
                const pctEl  = document.getElementById('download-pct');
                const status = document.getElementById('download-status');

                if (bar) bar.style.width = this.downloadProgress + '%';
                if (pctEl) pctEl.textContent = this.downloadProgress + '%';
                if (status) {
                    const speedStr  = this._formatSpeed(this.downloadSpeed);
                    const remaining = this._formatRemaining(this.downloadRemaining);
                    status.textContent = `${this._formatBytes(this.downloadedBytes)} / ${this._formatBytes(this.totalBytes)}`
                        + (speedStr  ? ` · ${speedStr}`  : '')
                        + (remaining ? ` · ~${remaining} restantes` : '');
                }
            });
        }

        this._queueUIRender();
        await new Promise(r => setTimeout(r, 80));

        try {
            if (this._nativeResponded && window.electronAPI?.startUpdateDownload) {
                const result = await window.electronAPI.startUpdateDownload();
                if (!result?.success) throw new Error(result?.error || 'Falha ao iniciar download nativo');
                return;
            }

            const asset = this.getDownloadAsset();

            if (asset?.browser_download_url) {
                await this._downloadFileDirect(asset.browser_download_url, asset.name, asset.size);
                return;
            }

            console.warn('[Updater] Nenhum asset encontrado, abrindo GitHub como fallback');
            const url = this.latestVersion?.html_url || this.githubReleasesUrl;
            if (window.electronAPI?.openExternal) {
                window.electronAPI.openExternal(url);
            } else {
                window.open(url, '_blank');
            }
            Utils.showNotification('🌐 Abrindo página de download...', 'info');
            this.downloading = false;
            this._queueUIRender();

        } catch (error) {
            console.error('❌ Erro ao iniciar download:', error);
            Utils.showNotification('❌ Erro ao iniciar download: ' + error.message, 'error');
            this.downloading = false;
            this._queueUIRender();
        }
    },

    async _downloadFileDirect(url, filename, totalSize) {
        if (window.electronAPI?.startDownloadFireAndForget) {
            if (totalSize) this.totalBytes = totalSize;
            window.electronAPI.startDownloadFireAndForget(url, filename);
            return;
        }
        if (window.electronAPI?.downloadAndInstall) {
            if (totalSize) this.totalBytes = totalSize;
            const result = await window.electronAPI.downloadAndInstall(url, filename);
            if (!result?.success) throw new Error(result?.error || 'Falha no download');
            return;
        }
        const fallbackUrl = this.latestVersion?.html_url || this.githubReleasesUrl;
        window.open(fallbackUrl, '_blank');
        this.downloading = false;
        this._queueUIRender();
    },

    viewReleaseNotes() {
        const url = this.latestVersion?.html_url || this.githubReleasesUrl;
        if (window.electronAPI?.openExternal) {
            window.electronAPI.openExternal(url);
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
            enabled ? '✅ Verificação automática ativada' : '❌ Verificação automática desativada',
            enabled ? 'success' : 'info'
        );
    },

    _snoozeUpdate() {
        const pendingVersion = this._getPendingVersion();
        if (pendingVersion) {
            this._setReminderForVersion(pendingVersion, 24);
        } else {
            const tomorrow = Date.now() + 86400000;
            Utils.saveData('update_snooze', tomorrow);
        }
        this._dismissProactiveUpdateUI();
        Utils.showNotification('🔕 Lembrete agendado para amanhã', 'info');
        this._syncUpdateUI();
    },

    _logInstall(fromVersion, toVersion) {
        const log = Utils.loadData('update_install_log') || [];
        log.unshift({
            from: fromVersion,
            to:   toVersion,
            date: new Date().toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })
        });
        if (log.length > 20) log.splice(20);
        Utils.saveData('update_install_log', log);
    },

    _parseReleaseBody(body) {
        if (!body) return [];
        const lines = body.split('\n');
        const results = [];

        for (const raw of lines) {
            const l = raw.trim();
            if (/^[-*•]\s+/.test(l)) {
                const text = l.replace(/^[-*•]\s+/, '').replace(/\*\*/g, '').trim();
                if (text.length > 0) results.push(text);
            }
            else if (/^[✨🐛⚡🔧🎉🏆⭐🎯🐾]\s+/.test(l)) {
                const text = l.replace(/\*\*/g, '').trim();
                if (text.length > 0) results.push(text);
            }
            if (results.length >= 10) break;
        }

        return results;
    },

    _formatBytes(bytes) {
        if (!bytes || bytes === 0) return '0 B';
        const k     = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i     = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
    },

    _formatSpeed(bps) {
        if (!bps || bps <= 0) return '';
        if (bps >= 1024 * 1024) return `${(bps / 1024 / 1024).toFixed(1)} MB/s`;
        if (bps >= 1024)        return `${(bps / 1024).toFixed(0)} KB/s`;
        return `${Math.round(bps)} B/s`;
    },

    _formatRemaining(secs) {
        if (!secs || secs <= 0) return '';
        if (secs < 60) return `${secs}s`;
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return s > 0 ? `${m}m ${s}s` : `${m}m`;
    },

    async _forceCheck() {
        const backup = this.minCheckInterval;
        this.minCheckInterval = 0;
        if (window.electronAPI?.isReady) {
            try { await window.electronAPI.resetUpdateCooldown(); } catch (_) {}
        }

        this.checkForUpdates(false).finally(() => {
            this.minCheckInterval = backup;
        });
    },

    _toggleDevSimulation() {
        if (this._simulating) {
            this._simulating     = false;
            this.downloading     = false;
            this.downloadProgress = 0;
            this.downloadSpeed   = 0;
            this.downloadRemaining = 0;
            clearInterval(this._simInterval);
            this._queueUIRender();
            return;
        }

        this._simulating      = true;
        this.downloading      = false;
        this.downloadProgress = 0;
        this.downloadedBytes  = 0;
        this.totalBytes       = 80 * 1024 * 1024;
        this._queueUIRender();

        let pct = 0;
        this._simInterval = setInterval(() => {
            pct = Math.min(pct + Math.random() * 4, 100);
            this.downloadProgress  = Math.round(pct);
            this.downloadedBytes   = Math.round((pct / 100) * this.totalBytes);
            this.downloadSpeed     = (1.5 + Math.random() * 3) * 1024 * 1024; // 1.5–4.5 MB/s
            this.downloadRemaining = Math.ceil(((100 - pct) / 100 * this.totalBytes) / this.downloadSpeed);

            const bar    = document.getElementById('download-progress-bar');
            const status = document.getElementById('download-status');
            const pctEl  = document.getElementById('download-pct');
            if (!bar) { this._queueUIRender(); return; }
            bar.style.width = Math.round(pct) + '%';
            if (pctEl)  pctEl.textContent  = Math.round(pct) + '%';
            if (status) {
                status.textContent = `${this._formatBytes(this.downloadedBytes)} / ${this._formatBytes(this.totalBytes)}`
                    + ` · ${this._formatSpeed(this.downloadSpeed)}`
                    + ` · ~${this._formatRemaining(this.downloadRemaining)} restantes`;
            }

            if (pct >= 100) {
                clearInterval(this._simInterval);
                this._simulating     = false;
                this.downloading     = false;
                this.downloadProgress = 100;
                Utils.showNotification('✅ Simulação concluída!', 'success');
                this._queueUIRender();
            }
        }, 200);
    },

    cleanup(options = {}) {
        const full = options === true || options.full === true;
        document.getElementById('nyan-update-confirm')?.remove();
        if (!full) return;

        clearInterval(this._simInterval);
        clearTimeout(this._nativeFallbackTimer);
        clearTimeout(this._noticeTimer);
        if (typeof this._statusUnsubscribe === 'function') {
            try { this._statusUnsubscribe(); } catch (_) {}
        }
        if (typeof this._progressUnsubscribe === 'function') {
            try { this._progressUnsubscribe(); } catch (_) {}
        }
        this._statusListenerRegistered = false;
        this._progressListenerRegistered = false;
        this._statusUnsubscribe = null;
        this._progressUnsubscribe = null;
        this._initialized = false;
        document.getElementById('nyan-update-banner')?.remove();
        document.getElementById('nyan-update-important-modal')?.remove();
    }
};

window.AutoUpdater = AutoUpdater;
