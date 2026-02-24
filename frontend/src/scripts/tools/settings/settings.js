// SISTEMA DE CONFIGURAÇÕES - NyanTools にゃん~
// Versão Renovada v3.0

// ============================================
// THEME MANAGER
// ============================================

const ThemeManager = {
    currentTheme: 'purple',

    themes: {
        purple: { name: 'Roxo Místico',     emoji: '💜', gradient: 'from-purple-500 via-pink-500 to-red-500',    preview: ['#a855f7','#ec4899','#ef4444'], desc: 'Vibrante e energético' },
        blue:   { name: 'Azul Oceano',      emoji: '💙', gradient: 'from-blue-500 via-cyan-500 to-purple-500',   preview: ['#3b82f6','#06b6d4','#8b5cf6'], desc: 'Calmo e profissional'  },
        green:  { name: 'Verde Natureza',   emoji: '💚', gradient: 'from-green-500 via-teal-500 to-lime-500',    preview: ['#10b981','#14b8a6','#84cc16'], desc: 'Fresco e natural'       },
        red:    { name: 'Vermelho Paixão',  emoji: '❤️', gradient: 'from-red-500 via-orange-500 to-pink-500',   preview: ['#ef4444','#f97316','#ec4899'], desc: 'Intenso e poderoso'    },
        orange: { name: 'Laranja Solar',    emoji: '🧡', gradient: 'from-orange-500 via-yellow-500 to-red-500',  preview: ['#f97316','#eab308','#ef4444'], desc: 'Quente e acolhedor'    },
        pink:   { name: 'Rosa Kawaii',      emoji: '💖', gradient: 'from-pink-500 via-rose-500 to-purple-500',   preview: ['#ec4899','#f43f5e','#a855f7'], desc: 'Doce e charmoso'       },
        teal:   { name: 'Turquesa Tropical',emoji: '💎', gradient: 'from-teal-500 via-cyan-500 to-green-500',    preview: ['#14b8a6','#06b6d4','#10b981'], desc: 'Refrescante e moderno' },
        indigo: { name: 'Índigo Noturno',   emoji: '💠', gradient: 'from-indigo-500 via-purple-500 to-blue-500', preview: ['#6366f1','#8b5cf6','#3b82f6'], desc: 'Elegante e profundo'   }
    },

    init() {
        const saved = Utils.loadData('app_color_theme') || 'purple';
        this.currentTheme = saved;
        this.applyTheme(saved, true);
    },

    applyTheme(themeId, silent = false) {
        if (!this.themes[themeId]) return;

        this.currentTheme = themeId;
        document.body.setAttribute('data-theme', themeId);
        Utils.saveData('app_color_theme', themeId);

        setTimeout(() => {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.style.background = 'linear-gradient(to bottom, var(--theme-primary-dark), var(--theme-primary), var(--theme-secondary))';
            }
        }, 50);

        if (!silent) {
            Utils.showNotification?.(`✨ Tema "${this.themes[themeId].name}" aplicado!`, 'success');
            this._refreshThemeCards();
        }
    },

    // Atualiza banner + cards sem re-render completo
    _refreshThemeCards() {
        const t = this.themes[this.currentTheme];
        const banner = document.getElementById('theme-banner');
        if (banner && t) {
            banner.className = `bg-gradient-to-r ${t.gradient} p-6 text-white`;
            const emojiEl = banner.querySelector('[data-theme-emoji]');
            const nameEl  = banner.querySelector('[data-theme-name]');
            const descEl  = banner.querySelector('[data-theme-desc]');
            if (emojiEl) emojiEl.textContent = t.emoji;
            if (nameEl)  nameEl.textContent  = t.name;
            if (descEl)  descEl.textContent  = t.desc;
        }

        document.querySelectorAll('[data-theme-card]').forEach(card => {
            const id = card.getAttribute('data-theme-card');
            const isActive = id === this.currentTheme;
            const badge = card.querySelector('[data-active-badge]');

            card.classList.toggle('ring-4', isActive);
            card.classList.toggle('ring-white', isActive);
            card.classList.toggle('scale-105', isActive);
            card.classList.toggle('shadow-2xl', isActive);

            if (isActive && !badge) {
                card.insertAdjacentHTML('beforeend', `
                    <div data-active-badge class="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-gray-800 px-2 py-0.5 rounded-full text-xs font-black shadow-lg flex items-center gap-1">
                        <span>✔</span><span>ATIVO</span>
                    </div>`);
            } else if (!isActive && badge) {
                badge.remove();
            }
        });
    }
};

// ============================================
// RENDER DE TEMAS (funções auxiliares)
// ============================================

function renderThemeSelector() {
    const currentId = Utils.loadData('app_color_theme') || 'purple';
    const theme = ThemeManager.themes[currentId];

    return `
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
            <!-- Banner tema atual -->
            <div id="theme-banner" class="bg-gradient-to-r ${theme.gradient} p-6 text-white">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl shadow-inner">
                        <span data-theme-emoji>${theme.emoji}</span>
                    </div>
                    <div>
                        <div class="text-xs font-bold uppercase tracking-widest opacity-80 mb-0.5">Tema Ativo</div>
                        <div data-theme-name class="text-2xl font-black">${theme.name}</div>
                        <div data-theme-desc class="text-sm opacity-80 mt-0.5">${theme.desc}</div>
                    </div>
                </div>
            </div>

            <!-- Grid de temas -->
            <div class="p-6">
                <p class="text-sm text-gray-500 font-semibold mb-4 uppercase tracking-wider">Escolha um tema</p>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    ${Object.entries(ThemeManager.themes).map(([id, t]) => {
                        const isActive = currentId === id;
                        return `
                            <button onclick="ThemeManager.applyTheme('${id}')"
                                    data-theme-card="${id}"
                                    class="relative group overflow-hidden rounded-xl transition-all duration-200 ${isActive ? 'ring-4 ring-white scale-105 shadow-2xl' : 'hover:scale-102 hover:shadow-lg'}">
                                <div class="bg-gradient-to-br ${t.gradient} p-4 text-white text-center">
                                    <div class="text-3xl mb-2 transition-transform group-hover:scale-110">${t.emoji}</div>
                                    <div class="text-xs font-bold leading-tight">${t.name}</div>
                                    <div class="flex justify-center gap-1 mt-2">
                                        ${t.preview.map(c => `<div class="w-3 h-3 rounded-full border border-white/50 shadow" style="background:${c}"></div>`).join('')}
                                    </div>
                                </div>
                                ${isActive ? `<div data-active-badge class="absolute top-1.5 right-1.5 bg-white/90 text-gray-800 px-1.5 py-0.5 rounded-full text-xs font-black shadow flex items-center gap-0.5"><span>✔</span><span>ATIVO</span></div>` : ''}
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
}

// ============================================
// SETTINGS PRINCIPAL
// ============================================

const Settings = {
    currentTab: 'appearance',

    tabs: [
        { id: 'appearance',    name: 'Aparência',      icon: '🎨' },
        { id: 'updates',       name: 'Atualizações',   icon: '🔄' },
        { id: 'notifications', name: 'Notificações',   icon: '🔔' },
        { id: 'data',          name: 'Dados',          icon: '💾' },
        { id: 'about',         name: 'Sobre',          icon: 'ℹ️'  }
    ],

    // ============================================
    // RENDER PRINCIPAL
    // ============================================

    render() {
        return `
            <div class="max-w-5xl mx-auto">
                ${this.renderHeader()}
                ${this.renderTabsNavigation()}
                <div id="settings-content">
                    ${this.renderTabContent()}
                </div>
            </div>
        `;
    },

    renderHeader() {
        return `
            <div class="flex items-center gap-4 mb-8">
                <div class="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl flex items-center justify-center text-3xl shadow-lg">⚙️</div>
                <div>
                    <h1 class="text-3xl font-black text-gray-800">Configurações</h1>
                    <p class="text-gray-500 text-sm mt-0.5">Personalize seu NyanTools にゃん~</p>
                </div>
            </div>
        `;
    },

    renderTabsNavigation() {
        return `
            <div class="flex gap-1 bg-gray-100 rounded-2xl p-1.5 mb-6 overflow-x-auto">
                ${this.tabs.map(tab => {
                    const isActive = this.currentTab === tab.id;
                    return `
                        <button onclick="Settings.switchTab('${tab.id}')"
                                class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap flex-1 justify-center
                                       ${isActive ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500 hover:text-gray-700'}">
                            <span>${tab.icon}</span>
                            <span>${tab.name}</span>
                        </button>
                    `;
                }).join('')}
            </div>
        `;
    },

    renderTabContent() {
        const renderers = {
            appearance:    () => this.renderAppearance(),
            updates:       () => this.renderUpdates(),
            notifications: () => this.renderNotifications(),
            data:          () => this.renderData(),
            about:         () => this.renderAbout()
        };
        return (renderers[this.currentTab] || (() => ''))();
    },

    // ============================================
    // TAB: APARÊNCIA
    // ============================================

    renderAppearance() {
        const theme = Utils.loadData('app_theme') || 'light';

        return `
            <div class="space-y-5">
                <!-- Modo claro/escuro -->
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div class="flex items-center gap-3 mb-5">
                        <span class="text-2xl">🌓</span>
                        <div>
                            <h3 class="font-black text-gray-800">Modo de Exibição</h3>
                            <p class="text-sm text-gray-500">Escolha entre modo claro ou escuro</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        ${this._renderModeCard('light', 'Claro', '☀️', 'Interface limpa e brilhante', 'from-gray-50 to-gray-100', theme, false)}
                        ${this._renderModeCard('dark',  'Escuro', '🌙', 'Reduz fadiga ocular', 'from-gray-700 to-gray-900', theme, true)}
                    </div>
                </div>

                <!-- Cores / Tema -->
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div class="flex items-center gap-3 mb-5">
                        <span class="text-2xl">🎨</span>
                        <div>
                            <h3 class="font-black text-gray-800">Cor do Tema</h3>
                            <p class="text-sm text-gray-500">Aplicada na sidebar, botões e destaques</p>
                        </div>
                    </div>
                    ${renderThemeSelector()}
                </div>
            </div>
        `;
    },

    _renderModeCard(id, name, emoji, desc, gradient, currentTheme, isDark) {
        const isActive = currentTheme === id;
        const textColor = isDark ? 'text-white' : 'text-gray-800';
        const subColor  = isDark ? 'text-gray-300' : 'text-gray-500';

        return `
            <button onclick="Settings.setTheme('${id}')"
                    class="relative group rounded-xl border-2 overflow-hidden transition-all
                           ${isActive ? 'border-blue-500 shadow-lg shadow-blue-100' : 'border-gray-200 hover:border-gray-300'}">
                <div class="bg-gradient-to-br ${gradient} p-6 text-center">
                    <div class="text-4xl mb-2">${emoji}</div>
                    <div class="font-bold ${textColor}">${name}</div>
                    <div class="text-xs mt-1 ${subColor}">${desc}</div>
                </div>
                ${isActive ? `<div class="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">✔ Ativo</div>` : ''}
            </button>
        `;
    },

    // ============================================
    // TAB: ATUALIZAÇÕES
    // ============================================

    renderUpdates() {
        return AutoUpdater?.render() || `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <div class="text-5xl mb-3">🔄</div>
                <p class="text-gray-500 font-semibold">Sistema de atualizações não disponível</p>
            </div>
        `;
    },

    // ============================================
    // TAB: NOTIFICAÇÕES
    // ============================================

    renderNotifications() {
        const notifEnabled = Utils.loadData('notifications_enabled') !== false;
        const soundEnabled = Utils.loadData('notification_sound') !== false;
        const historyEnabled = Utils.loadData('notification_history_enabled') !== false;
        const history = Utils.loadData('notification_history') || [];

        const notifTypes = [
            { id: 'notif_type_success', label: 'Confirmações',  desc: 'Ações concluídas com sucesso', icon: '✅' },
            { id: 'notif_type_error',   label: 'Erros',         desc: 'Falhas e erros do sistema',    icon: '❌' },
            { id: 'notif_type_info',    label: 'Informações',   desc: 'Dicas e avisos gerais',        icon: 'ℹ️' },
            { id: 'notif_type_warning', label: 'Alertas',       desc: 'Situações que requerem atenção', icon: '⚠️' },
        ];

        const typeRows = notifTypes.map(t => {
            const enabled = Utils.loadData(t.id) !== false;
            return this._renderToggleRow(t.label, t.desc, t.icon, enabled && notifEnabled,
                `Settings.toggleNotifType('${t.id}', this.checked)`, !notifEnabled);
        }).join('');

        const iconMap   = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        const borderMap = { success: 'border-green-200', error: 'border-red-200', warning: 'border-yellow-200', info: 'border-blue-200' };
        const bgMap     = { success: 'bg-green-50',      error: 'bg-red-50',      warning: 'bg-yellow-50',     info: 'bg-blue-50'    };

        const historyItems = !historyEnabled
            ? `<div class="text-center py-6 text-gray-400">
                   <div class="text-4xl mb-2">🔕</div>
                   <p class="text-sm">Histórico desativado nas configurações</p>
               </div>`
            : history.length === 0
            ? `<div class="text-center py-6 text-gray-400">
                   <div class="text-4xl mb-2">🔕</div>
                   <p class="text-sm">Nenhuma notificação no histórico</p>
               </div>`
            : [...history].reverse().slice(0, 20).map(n => `
                <div class="flex items-start gap-3 px-3 py-2.5 rounded-xl border ${bgMap[n.type] || 'bg-gray-50'} ${borderMap[n.type] || 'border-gray-200'}">
                    <span class="text-base mt-0.5">${iconMap[n.type] || '🔔'}</span>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-gray-800 truncate">${n.message}</p>
                        <p class="text-xs text-gray-500 mt-0.5">${n.time}</p>
                    </div>
                </div>`).join('');

        return `
            <div class="space-y-5">
                <!-- Configuração principal -->
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                    <div class="flex items-center gap-3 mb-2">
                        <span class="text-2xl">🔔</span>
                        <div>
                            <h3 class="font-black text-gray-800">Notificações</h3>
                            <p class="text-sm text-gray-500">Configure os alertas do aplicativo</p>
                        </div>
                    </div>
                    ${this._renderToggleRow('Ativar Notificações', 'Exibir alertas de ações e eventos', '📬', notifEnabled, 'Settings.toggleNotifications(this.checked)')}
                    ${this._renderToggleRow('Som de Notificação', 'Reproduzir som ao exibir alertas', '🔊', soundEnabled, 'Settings.toggleSound(this.checked)', !notifEnabled)}
                    ${this._renderToggleRow('Salvar Histórico', 'Registrar notificações no histórico recente', '📋', historyEnabled, 'Settings.toggleNotifHistory(this.checked)')}
                    <div class="pt-2 border-t border-gray-100 flex gap-3">
                        <button onclick="Settings.testNotification()"
                                ${!notifEnabled ? 'disabled' : ''}
                                class="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2">
                            <span>🧪</span>
                            <span>Testar Notificação</span>
                        </button>
                        <button onclick="Settings.clearNotificationHistory()"
                                ${history.length === 0 || !historyEnabled ? 'disabled' : ''}
                                class="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm flex items-center gap-2">
                            <span>🗑️</span>
                            <span>Limpar histórico</span>
                        </button>
                    </div>
                </div>

                <!-- Tipos de alerta -->
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div class="flex items-center gap-3 mb-4">
                        <span class="text-2xl">🎛️</span>
                        <div>
                            <h3 class="font-black text-gray-800">Tipos de Alerta</h3>
                            <p class="text-sm text-gray-500">Escolha quais tipos de notificação exibir</p>
                        </div>
                    </div>
                    <div class="space-y-2">${typeRows}</div>
                </div>

                <!-- Histórico -->
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-3">
                            <span class="text-2xl">📋</span>
                            <div>
                                <h3 class="font-black text-gray-800">Histórico Recente</h3>
                                <p class="text-sm text-gray-500">Últimas ${history.length} notificações</p>
                            </div>
                        </div>
                    </div>
                    <div class="space-y-2 max-h-56 overflow-y-auto">${historyItems}</div>
                </div>
            </div>
        `;
    },

    _renderToggleRow(title, desc, emoji, checked, onChange, disabled = false) {
        return `
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl ${disabled ? 'opacity-50' : ''}">
                <div class="flex items-center gap-3">
                    <span class="text-2xl">${emoji}</span>
                    <div>
                        <div class="font-semibold text-gray-800 text-sm">${title}</div>
                        <div class="text-xs text-gray-500">${desc}</div>
                    </div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer ${disabled ? 'pointer-events-none' : ''}">
                    <input type="checkbox"
                           ${checked ? 'checked' : ''}
                           ${disabled ? 'disabled' : ''}
                           onchange="${onChange}"
                           class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-300 peer-checked:bg-blue-500 rounded-full transition-colors peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow"></div>
                </label>
            </div>
        `;
    },

    // ============================================
    // TAB: DADOS
    // ============================================

    renderData() {
        const storageKB = this._getStorageKB();
        const maxKB = 5120; // 5MB estimado
        const pct = Math.min(Math.round((storageKB / maxKB) * 100), 100);
        const barColor = pct > 80 ? 'from-red-500 to-rose-600' : pct > 50 ? 'from-yellow-400 to-orange-500' : 'from-blue-500 to-cyan-500';
        const itemCount = Object.keys(localStorage).length;

        return `
            <div class="space-y-5">
                <!-- Uso de armazenamento -->
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div class="flex items-center gap-3 mb-5">
                        <span class="text-2xl">📊</span>
                        <div>
                            <h3 class="font-black text-gray-800">Armazenamento Local</h3>
                            <p class="text-sm text-gray-500">Dados salvos no seu navegador</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-3 gap-3 mb-5">
                        ${this._renderStatChip('💾', `${storageKB.toFixed(1)} KB`, 'Usado')}
                        ${this._renderStatChip('📦', `${itemCount}`, 'Entradas')}
                        ${this._renderStatChip('📈', `${pct}%`, 'Ocupado')}
                    </div>

                    <div class="space-y-1.5">
                        <div class="flex justify-between text-xs text-gray-500 font-semibold">
                            <span>Uso do Storage</span>
                            <span>${storageKB.toFixed(1)} KB / ~${maxKB} KB</span>
                        </div>
                        <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div class="h-full bg-gradient-to-r ${barColor} rounded-full transition-all" style="width:${pct}%"></div>
                        </div>
                        <p class="text-xs text-gray-400">Limite estimado do localStorage (~5 MB)</p>
                    </div>
                </div>

                <!-- Ações de dados -->
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div class="flex items-center gap-3 mb-5">
                        <span class="text-2xl">🔧</span>
                        <div>
                            <h3 class="font-black text-gray-800">Gerenciar Dados</h3>
                            <p class="text-sm text-gray-500">Backup, restauração e limpeza</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        ${this._renderDataBtn('exportData', '📤', 'Exportar Backup', 'Salvar dados em arquivo .json', 'from-emerald-500 to-teal-600')}
                        ${this._renderDataBtn('importData', '📥', 'Importar Backup', 'Restaurar dados de arquivo', 'from-blue-500 to-cyan-600')}
                        ${this._renderDataBtn('clearCache', '🧹', 'Limpar Cache', 'Remove dados temporários', 'from-amber-500 to-orange-500')}
                        ${this._renderDataBtn('resetAll',   '⚠️', 'Resetar Tudo',  'Apaga TODOS os dados', 'from-red-500 to-rose-600', true)}
                    </div>
                </div>
            </div>
        `;
    },

    _renderStatChip(icon, value, label) {
        return `
            <div class="bg-gray-50 rounded-xl p-3 text-center">
                <div class="text-xl mb-0.5">${icon}</div>
                <div class="font-black text-gray-800 text-lg leading-none">${value}</div>
                <div class="text-xs text-gray-500 mt-0.5">${label}</div>
            </div>
        `;
    },

    _renderDataBtn(action, icon, title, desc, gradient, danger = false) {
        return `
            <button onclick="Settings.${action}()"
                    class="flex items-center gap-4 p-4 bg-gradient-to-br ${gradient} text-white rounded-xl hover:shadow-lg hover:scale-[1.01] active:scale-95 transition-all text-left group">
                <div class="text-3xl group-hover:scale-110 transition-transform">${icon}</div>
                <div>
                    <div class="font-bold text-sm">${title}</div>
                    <div class="text-xs opacity-80">${desc}</div>
                </div>
            </button>
        `;
    },

    // ============================================
    // TAB: SOBRE
    // ============================================

    renderAbout() {
        const year = new Date().getFullYear();
        const techs = [
            { icon: '⚛️', name: 'Electron',       version: 'v27',   color: '#3b82f6' },
            { icon: '🎨', name: 'Tailwind CSS',   version: 'v3.x',  color: '#06b6d4' },
            { icon: '📜', name: 'JavaScript',     version: 'ES2022',color: '#eab308' },
            { icon: '🤖', name: 'Google Gemini',  version: 'API',   color: '#10b981' },
            { icon: '🌤️', name: 'OpenWeather',   version: 'API',   color: '#f97316' },
            { icon: '🎵', name: 'YouTube',        version: 'API',   color: '#ef4444' }
        ];

        const links = [
            { url: 'https://github.com/Fish7w7/Pandora/issues',     icon: '🐛', label: 'Reportar Bug'       },
            { url: 'https://github.com/Fish7w7/Pandora/discussions', icon: '💬', label: 'Sugerir Ideias'    },
            { url: 'https://github.com/Fish7w7/Pandora',            icon: '⭐', label: 'Dar Star no GitHub' },
            { url: 'https://github.com/Fish7w7/Pandora/releases',   icon: '📦', label: 'Ver Releases'       }
        ];

        return `
            <div class="space-y-5">
                <!-- Hero -->
                <div class="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl p-8 text-white shadow-2xl text-center relative overflow-hidden">
                    <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 20% 50%, #a855f7 0%, transparent 50%), radial-gradient(circle at 80% 50%, #ec4899 0%, transparent 50%)"></div>
                    <div class="relative">
                        <div class="text-7xl mb-4">🐱</div>
                        <h2 class="text-4xl font-black">NyanTools</h2>
                        <p class="text-gray-400 mt-1 mb-4">にゃん~ Sua caixa de ferramentas purr-feita!</p>
                        <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold">
                            <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                            Versão ${App?.version || '2.7.1'}
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <!-- Desenvolvedores -->
                    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 class="font-black text-gray-800 mb-4 flex items-center gap-2"><span>👥</span> Desenvolvedores</h3>
                        <div class="space-y-3">

                            <!-- Fish7w7 -->
                            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <span class="text-2xl">👨‍💻</span>
                                <div>
                                    <div class="font-bold text-gray-800">Gabriel</div>
                                    <div class="text-xs text-gray-500">Desenvolvedor Principal</div>
                                </div>
                            </div>
                            <a href="https://github.com/Fish7w7/Pandora" target="_blank"
                               class="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
                                <svg class="w-6 h-6 text-gray-700 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                    <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.165 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.951 0-1.093.39-1.988 1.03-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.818c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.026 2.747-1.026.546 1.379.202 2.398.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0 0 22 12c0-5.523-4.477-10-10-10Z" clip-rule="evenodd"/>
                                </svg>
                                <div>
                                    <div class="font-bold text-blue-600 text-sm">GitHub</div>
                                    <div class="text-xs text-gray-500">Fish7w7/Pandora</div>
                                </div>
                            </a>
                            <a href="mailto:kik73261@gmail.com"
                               class="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all">
                                <svg class="w-6 h-6 text-gray-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                </svg>
                                <div>
                                    <div class="font-bold text-gray-800 text-sm">Email</div>
                                    <div class="text-xs text-gray-500">kik73261@gmail.com</div>
                                </div>
                            </a>

                            <!-- Divisor -->
                            <div class="flex items-center gap-3 py-1">
                                <div class="flex-1 h-px bg-gray-100"></div>
                                <div class="flex-1 h-px bg-gray-100"></div>
                            </div>

                            <!-- Clara -->
                            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <span class="text-2xl">👩‍💻</span>
                                <div>
                                    <div class="font-bold text-gray-800">Clara</div>
                                    <div class="text-xs text-gray-500">Desenvolvedora Principal</div>
                                </div>
                            </div>
                            <a href="mailto:clara.mendes@proton.me"
                               class="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all">
                                <svg class="w-6 h-6 text-gray-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                </svg>
                                <div>
                                    <div class="font-bold text-gray-800 text-sm">Email</div>
                                    <div class="text-xs text-gray-500">clara.mendes@proton.me</div>
                                </div>
                            </a>

                        </div>
                    </div>

                    <!-- Links úteis -->
                    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 class="font-black text-gray-800 mb-4 flex items-center gap-2"><span>🔗</span> Links Úteis</h3>
                        <div class="space-y-2">
                            ${links.map(l => `
                                <a href="${l.url}" target="_blank"
                                   class="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all">
                                    <span class="text-xl">${l.icon}</span>
                                    <span class="font-semibold text-gray-800 text-sm">${l.label}</span>
                                    <svg class="w-4 h-4 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                    </svg>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Tecnologias -->
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 class="font-black text-gray-800 mb-4 flex items-center gap-2"><span>🛠️</span> Tecnologias</h3>
                    <div class="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        ${techs.map(t => `
                            <div class="bg-gray-50 rounded-xl p-3 text-center hover:bg-gray-100 transition-all group">
                                <div class="text-3xl mb-1.5 group-hover:scale-110 transition-transform">${t.icon}</div>
                                <div class="font-bold text-gray-800 text-xs">${t.name}</div>
                                <div class="text-gray-400 text-xs mt-0.5">${t.version}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Licença -->
                <div class="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <span class="text-2xl">📄</span>
                        <div>
                            <div class="font-bold text-gray-800 text-sm">Licença MIT</div>
                            <div class="text-xs text-gray-500">Copyright © ${year} Fish7w7</div>
                        </div>
                    </div>
                    <span class="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full font-semibold">Open Source</span>
                </div>
            </div>
        `;
    },

    // ============================================
    // ACTIONS
    // ============================================

    init() {
        this.loadSettings();
    },

    switchTab(tabId) {
        this.currentTab = tabId;
        Router?.render();
    },

    setTheme(theme) {
        Utils.saveData('app_theme', theme);
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            Utils.showNotification?.('🌙 Tema escuro ativado', 'success');
        } else {
            document.body.classList.remove('dark-theme');
            Utils.showNotification?.('☀️ Tema claro ativado', 'success');
        }
        Router?.render();
    },

    toggleNotifications(enabled) {
        Utils.saveData('notifications_enabled', enabled);
        Utils.showNotification?.(enabled ? '🔔 Notificações ativadas' : '🔕 Notificações desativadas', 'success');
        Router?.render();
    },

    toggleSound(enabled) {
        Utils.saveData('notification_sound', enabled);
        Utils.showNotification?.(enabled ? '🔊 Som ativado' : '🔇 Som desativado', 'success');
    },

    testNotification() {
        Utils.showNotification('🐱 Esta é uma notificação de teste にゃん~', 'success');
    },

    toggleNotifType(typeId, enabled) {
        Utils.saveData(typeId, enabled);
    },

    toggleNotifHistory(enabled) {
        Utils.saveData('notification_history_enabled', enabled);
        Utils.showNotification(enabled ? '📋 Histórico ativado' : '📋 Histórico desativado', 'info');
        Router?.render();
    },

    clearNotificationHistory() {
        Utils.saveData('notification_history', []);
        Router?.render();
    },

    toggleNotifType(typeId, enabled) {
        Utils.saveData(typeId, enabled);
        // Salva silenciosamente sem re-render (evita reset dos outros toggles)
    },

    clearNotificationHistory() {
        Utils.saveData('notification_history', []);
        Router?.render();
    },

    _getStorageKB() {
        let total = 0;
        for (let key in localStorage) {
            if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
                total += (localStorage[key].length + key.length) * 2; // UTF-16
            }
        }
        return total / 1024;
    },

    // Mantido para compatibilidade
    calculateStorageSize() {
        return `${this._getStorageKB().toFixed(2)} KB`;
    },

    exportData() {
        const data = {};
        for (let key in localStorage) {
            if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
                data[key] = localStorage[key];
            }
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nyantools-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        Utils.showNotification?.('📤 Backup exportado com sucesso!', 'success');
    },

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const data = JSON.parse(ev.target.result);
                    if (!confirm('⚠️ Isso irá sobrescrever todos os dados atuais. Continuar?')) return;
                    for (let key in data) localStorage.setItem(key, data[key]);
                    Utils.showNotification?.('📥 Backup importado! Recarregando...', 'success');
                    setTimeout(() => location.reload(), 1500);
                } catch {
                    Utils.showNotification?.('❌ Arquivo inválido ou corrompido', 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    },

    clearCache() {
        if (!confirm('🧹 Limpar cache? Suas configurações e dados serão preservados.')) return;
        let removed = 0;
        for (let key in localStorage) {
            if (key.includes('cache') || key.includes('temp') || key.includes('version_cache')) {
                localStorage.removeItem(key);
                removed++;
            }
        }
        Utils.showNotification?.(`🧹 ${removed} item(ns) de cache removido(s)!`, 'success');
        Router?.render();
    },

    resetAll() {
        if (!confirm('⚠️ ATENÇÃO: Isso irá apagar TODOS os dados do NyanTools!\n\nJogos, configurações, API keys e histórico serão perdidos.\n\nDeseja continuar?')) return;
        if (!confirm('🚨 Última chance! Esta ação NÃO PODE ser desfeita.\n\nTem certeza absoluta?')) return;
        localStorage.clear();
        Utils.showNotification?.('🗑️ Dados apagados! Recarregando...', 'info');
        setTimeout(() => location.reload(), 1500);
    },

    loadSettings() {

    }
};

// ============================================
// AUTO-INICIALIZAÇÃO
// ============================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
} else {
    ThemeManager.init();
}

window.ThemeManager = ThemeManager;
window.Settings = Settings;