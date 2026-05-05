

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

    isThemeUnlocked(themeId) {
        const theme = this.themes[themeId];
        if (!theme) return false;
        if (!theme.unlockItem) return true;
        if (window.Inventory?.owns?.(theme.unlockItem)) return true;
        const inventory = Utils.loadData(window.Inventory?.KEY || 'nyan_inventory') || {};
        return Array.isArray(inventory.owned) && inventory.owned.includes(theme.unlockItem);
    },

    _resolveTheme(themeId) {
        const safeId = this.themes[themeId] ? themeId : 'purple';
        return this.isThemeUnlocked(safeId) ? safeId : 'purple';
    },

    init() {
        const saved = Utils.loadData('app_color_theme') || 'purple';
        const resolved = this._resolveTheme(saved);
        if (resolved !== saved) Utils.saveData('app_color_theme', resolved);
        this.currentTheme = resolved;
        this.applyTheme(resolved, true);
    },

    applyTheme(themeId, silent = false) {
        if (!this.themes[themeId]) return;
        if (!this.isThemeUnlocked(themeId)) {
            if (!silent) {
                Utils.showNotification?.('Tema bloqueado. Resgate o item na loja ou pela recompensa da temporada.', 'warning');
                this._refreshThemeCards();
            }
            return false;
        }

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

    _refreshThemeCards() {
        const t = this.themes[this.currentTheme];
        const banner = document.getElementById('theme-banner');
        if (banner && t) {
            banner.className = `bg-gradient-to-r ${t.gradient} p-4 text-white`;
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

            card.classList.toggle('ring-2', isActive);
            card.classList.toggle('ring-white', isActive);
            card.classList.toggle('shadow-xl', isActive);

            if (isActive && !badge) {
                card.insertAdjacentHTML('beforeend', `
                    <div data-active-badge class="absolute top-1.5 right-1.5 bg-white/90 backdrop-blur-sm text-gray-800 px-1.5 py-0.5 rounded-full text-[0.62rem] font-black shadow flex items-center gap-0.5">
                        <span>✔</span><span>ATIVO</span>
                    </div>`);
            } else if (!isActive && badge) {
                badge.remove();
            }
        });
    }
};


function renderThemeSelector() {
    const currentId = ThemeManager._resolveTheme(Utils.loadData('app_color_theme') || 'purple');
    const theme = ThemeManager.themes[currentId];
    const availableThemes = Object.entries(ThemeManager.themes)
        .filter(([id]) => ThemeManager.isThemeUnlocked(id));

    return `
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
            <div id="theme-banner" class="bg-gradient-to-r ${theme.gradient} p-4 text-white">
                <div class="flex items-center gap-3">
                    <div class="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl shadow-inner">
                        <span data-theme-emoji>${theme.emoji}</span>
                    </div>
                    <div>
                        <div class="text-[0.62rem] font-bold uppercase tracking-widest opacity-80 mb-0.5">Tema Ativo</div>
                        <div data-theme-name class="text-xl font-black">${theme.name}</div>
                        <div data-theme-desc class="text-xs opacity-80 mt-0.5">${theme.desc}</div>
                    </div>
                </div>
            </div>

            <div class="p-4">
                <p class="text-xs text-gray-500 font-semibold mb-3 uppercase tracking-wider">Escolha um tema</p>
                <div class="grid grid-cols-4 gap-2">
                    ${availableThemes.map(([id, t]) => {
                        const isActive = currentId === id;
                        return `
                            <button onclick="ThemeManager.applyTheme('${id}')"
                                    data-theme-card="${id}"
                                    class="relative group overflow-hidden rounded-xl transition-all duration-200 ${isActive ? 'ring-2 ring-white shadow-xl' : 'hover:shadow-lg'}">
                                <div class="bg-gradient-to-br ${t.gradient} p-3 text-white text-center">
                                    <div class="text-2xl mb-1 transition-transform group-hover:scale-110">${t.emoji}</div>
                                    <div class="text-xs font-bold leading-tight">${t.name}</div>
                                    <div class="flex justify-center gap-1 mt-1.5">
                                        ${t.preview.map(c => `<div class="w-2.5 h-2.5 rounded-full border border-white/50 shadow" style="background:${c}"></div>`).join('')}
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


const Settings = {
    currentTab: 'appearance',

    tabs: [
        { id: 'appearance',    name: 'Aparência',      icon: '🎨' },
        { id: 'interface',     name: 'Interface',      icon: '🖥️' },
        { id: 'updates',       name: 'Atualizações',   icon: '🔄' },
        { id: 'notifications', name: 'Notificações',   icon: '🔔' },
        { id: 'data',          name: 'Dados',          icon: '💾' },
        { id: 'about',         name: 'Sobre',          icon: 'ℹ️'  }
    ],


    render() {
        return `
            <div class="max-w-5xl mx-auto" style="font-size:0.94rem;">
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
            <div class="flex items-center gap-3 mb-5">
                <div class="w-11 h-11 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center text-2xl shadow-lg">⚙️</div>
                <div>
                    <h1 class="text-2xl font-black text-gray-800">Configurações</h1>
                    <p class="text-gray-500 text-xs mt-0.5">Personalize seu NyanTools にゃん~</p>
                </div>
            </div>
        `;
    },

    renderTabsNavigation() {
        const hasPendingUpdate = window.AutoUpdater?.hasPendingUpdate?.() ?? !!window.AutoUpdater?.updateAvailable;
        return `
            <div class="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4 overflow-x-auto">
                ${this.tabs.map(tab => {
                    const isActive = this.currentTab === tab.id;
                    const updateBadge = hasPendingUpdate && tab.id === 'updates'
                        ? `<span title="Atualização pendente" style="width:8px;height:8px;border-radius:999px;background:#ef4444;box-shadow:0 0 0 3px rgba(239,68,68,0.18);animation:pulse 2s infinite;"></span>`
                        : '';
                    return `
                        <button onclick="Settings.switchTab('${tab.id}')"
                                class="flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-xs transition-all whitespace-nowrap flex-1 justify-center
                                       ${isActive ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500 hover:text-gray-700'}">
                            <span>${tab.icon}</span>
                            <span>${tab.name}</span>
                            ${updateBadge}
                        </button>
                    `;
                }).join('')}
            </div>
        `;
    },

    renderTabContent() {
        const renderers = {
            appearance:    () => this.renderAppearance(),
            interface:     () => this.renderInterface(),
            updates:       () => this.renderUpdates(),
            notifications: () => this.renderNotifications(),
            data:          () => this.renderData(),
            about:         () => this.renderAbout()
        };
        return (renderers[this.currentTab] || (() => ''))();
    },


    renderAppearance() {
        const theme = Utils.loadData('app_theme') || 'light';
        const focusActive = window.FocusMode?.active || false;

        return `
            <div class="space-y-4">
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div class="flex items-center gap-2.5 mb-3">
                        <span class="text-xl">🌓</span>
                        <div>
                            <h3 class="font-black text-gray-800 text-sm">Modo de Exibição</h3>
                            <p class="text-xs text-gray-500">Escolha entre modo claro ou escuro</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-2.5">
                        ${this._renderModeCard('light', 'Claro', '☀️', 'Interface limpa e brilhante', 'from-gray-50 to-gray-100', theme, false)}
                        ${this._renderModeCard('dark',  'Escuro', '🌙', 'Reduz fadiga ocular', 'from-gray-700 to-gray-900', theme, true)}
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div class="flex items-center gap-2.5 mb-3">
                        <span class="text-xl">🎨</span>
                        <div>
                            <h3 class="font-black text-gray-800 text-sm">Cor do Tema</h3>
                            <p class="text-xs text-gray-500">Aplicada na sidebar, botões e destaques</p>
                        </div>
                    </div>
                    ${renderThemeSelector()}
                </div>

            </div>
        `;
    },


    renderInterface() {
        const focusActive = window.FocusMode?.active || false;
        const introEnabled = window.LoginIntro?.isEnabled?.() ?? true;
        const particleMode = window.LoginParticles?.getMode?.() || 'normal';
        const finalMusicMeta = window.FinalSeasonMusic?.getSettingsMeta?.() || {
            title: "It's Been a Long, Long Time",
            artist: 'Harry James',
            enabled: Utils.loadData('final_season_music_enabled') !== false,
            available: false,
            hasUrl: false,
            volume: Number(Utils.loadData('final_season_music_volume') || 1),
            status: 'Aguardando link',
        };
        const d = document.body.classList.contains('dark-theme');
        const bg     = d ? 'rgba(255,255,255,0.04)' : '#ffffff';
        const border = d ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
        const text   = d ? '#f1f5f9'                : '#0f172a';
        const sub    = d ? 'rgba(255,255,255,0.45)' : '#6b7280';
        const chip   = d ? 'rgba(255,255,255,0.06)' : '#f9fafb';

        function mkToggle(label, desc, icon, checked, onchange, disabled = false) {
            const knob = checked ? '21px' : '3px';
            const track = checked ? 'var(--theme-primary,#a855f7)' : (d ? 'rgba(255,255,255,0.12)' : '#d1d5db');
            const disabledAttr = disabled ? 'disabled' : '';
            const opacity = disabled ? '0.55' : '1';
            const cursor = disabled ? 'not-allowed' : 'pointer';
            return '<div style="display:flex;align-items:center;justify-content:space-between;padding:0.58rem 0.7rem;background:' + chip + ';border-radius:10px;gap:0.7rem;opacity:' + opacity + ';">'
                + '<div style="display:flex;align-items:center;gap:0.55rem;min-width:0;">'
                + '<span style="font-size:1rem;">' + icon + '</span>'
                + '<div>'
                + '<div style="font-size:0.78rem;font-weight:700;color:' + text + ';">' + label + '</div>'
                + '<div style="font-size:0.66rem;color:' + sub + ';">' + desc + '</div>'
                + '</div></div>'
                + '<label style="position:relative;display:inline-block;width:40px;height:22px;flex-shrink:0;">'
                + '<input type="checkbox" ' + (checked ? 'checked' : '') + ' ' + disabledAttr + ' onchange="' + onchange + '" style="opacity:0;width:0;height:0;position:absolute;">'
                + '<span style="position:absolute;inset:0;border-radius:99px;cursor:' + cursor + ';transition:0.2s;background:' + track + ';">'
                + '<span style="position:absolute;width:16px;height:16px;border-radius:50%;background:white;top:3px;transition:0.2s;left:' + knob + ';box-shadow:0 1px 4px rgba(0,0,0,0.25);"></span>'
                + '</span></label>'
                + '</div>';
        }

        function mkChip(icon, title, body) {
            return '<div style="background:' + chip + ';border-radius:9px;padding:0.55rem;text-align:center;">'
                + '<div style="font-size:1.05rem;margin-bottom:0.16rem;">' + icon + '</div>'
                + '<div style="font-size:0.68rem;font-weight:700;color:' + text + ';">' + title + '</div>'
                + '<div style="font-size:0.62rem;color:' + sub + ';margin-top:0.14rem;">' + body + '</div>'
                + '</div>';
        }

        function mkCard(icon, title, desc, content) {
            return '<div style="background:' + bg + ';border:1px solid ' + border + ';border-radius:12px;padding:0.95rem;">'
                + '<div style="display:flex;align-items:center;gap:0.55rem;margin-bottom:0.7rem;">'
                + '<span style="font-size:1.2rem;">' + icon + '</span>'
                + '<div>'
                + '<h3 style="font-family:Syne,sans-serif;font-weight:800;font-size:0.85rem;color:' + text + ';margin:0;">' + title + '</h3>'
                + '<p style="font-size:0.68rem;color:' + sub + ';margin:0.08rem 0 0;">' + desc + '</p>'
                + '</div></div>'
                + content
                + '</div>';
        }

        function mkParticleOption(id, label, desc) {
            const active = particleMode === id;
            return "<button onclick=\"Settings.setLoginParticlesMode('" + id + "')\" style=\"text-align:left;border:1px solid "
                + (active ? 'var(--theme-primary,#a855f7)' : border)
                + ';background:' + (active ? 'rgba(168,85,247,0.14)' : chip)
                + ';border-radius:10px;padding:0.55rem;cursor:pointer;">'
                + '<div style="font-size:0.7rem;font-weight:900;color:' + text + ';">' + label + '</div>'
                + '<div style="font-size:0.62rem;color:' + sub + ';line-height:1.32;margin-top:0.12rem;">' + desc + '</div>'
                + '</button>';
        }

        const focusCard = mkCard('🎯', 'Modo Foco', 'Esconde a sidebar para maximizar o espaço de trabalho',
            mkToggle('Ativar Modo Foco', 'A sidebar some e o conteúdo ocupa toda a largura', '🎯',
                     focusActive, "FocusMode[this.checked?'enable':'disable']()")
            + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.45rem;margin-top:0.65rem;">'
            + mkChip('⌨️', 'Atalho', '<kbd style="font-family:monospace;font-size:0.7rem;">Ctrl+Shift+F</kbd>')
            + mkChip('🖱️', 'Sidebar temporária', 'Passe o mouse na borda esquerda')
            + mkChip('💾', 'Estado salvo', 'Reabre no mesmo modo')
            + '</div>'
        );

        const introCard = mkCard('🎬', 'Intro Animada', 'Animação de abertura exibida ao iniciar o app',
            mkToggle('Exibir intro ao abrir', 'Animação com logo e nome do app ao iniciar', '🎬',
                     introEnabled, 'LoginIntro?.setEnabled?.(this.checked)')
            + '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.45rem;margin-top:0.65rem;">'
            + mkChip('⏱️', 'Duração', '~4.5 segundos')
            + mkChip('🖱️', 'Pular', 'Clique em qualquer lugar')
            + '</div>'
        );

        const particlesCard = mkCard('✨', 'Particulas do Login', 'Ajuste visual leve para PCs mais fracos',
            '<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0.45rem;">'
            + mkParticleOption('normal', 'Normal', 'Ate 50 particulas no login.')
            + mkParticleOption('reduced', 'Reduzido', 'Menos particulas para aliviar o app.')
            + mkParticleOption('off', 'Desligado', 'Remove as particulas do login.')
            + '</div>'
        );

        const finalMusicDisabled = !finalMusicMeta.available || !finalMusicMeta.hasUrl;
        const finalMusicCard = mkCard('\u{1F3B5}', 'Musica Final', 'Trilha global da Final Season',
            mkToggle('Tocar Last Meow', 'Toca ate o fim da Final Season e para sozinha depois.', '\u{1F3BC}',
                     finalMusicMeta.enabled && !finalMusicDisabled,
                     'FinalSeasonMusic?.setEnabled?.(this.checked)',
                     finalMusicDisabled)
            + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.45rem;margin-top:0.65rem;">'
            + mkChip('\u{1F3B7}', 'Faixa', finalMusicMeta.title)
            + mkChip('\u{1F464}', 'Artista', finalMusicMeta.artist)
            + mkChip('\u{1F4A1}', 'Status', finalMusicMeta.status)
            + '</div>'
            + '<div style="display:flex;align-items:center;gap:0.65rem;margin-top:0.7rem;background:' + chip + ';border-radius:10px;padding:0.55rem 0.7rem;">'
            + '<span style="font-size:0.72rem;font-weight:800;color:' + sub + ';min-width:42px;">Volume</span>'
            + '<input type="range" min="1" max="100" value="' + finalMusicMeta.volume + '" '
            + (finalMusicDisabled ? 'disabled ' : '')
            + 'oninput="FinalSeasonMusic?.setVolume?.(this.value)" style="flex:1;accent-color:#f59e0b;">'
            + '<button ' + (finalMusicDisabled ? 'disabled ' : '')
            + 'onclick="FinalSeasonMusic?.togglePlay?.()" style="border:1px solid ' + border + ';background:' + bg + ';color:' + text + ';border-radius:8px;padding:0.36rem 0.6rem;font-size:0.66rem;font-weight:800;cursor:' + (finalMusicDisabled ? 'not-allowed' : 'pointer') + ';opacity:' + (finalMusicDisabled ? '0.55' : '1') + ';">Tocar/Pausar</button>'
            + '</div>'
        );

        return '<div style="display:flex;flex-direction:column;gap:0.8rem;">' + focusCard + introCard + particlesCard + finalMusicCard + '</div>';
    },

        _renderModeCard(id, name, emoji, desc, gradient, currentTheme, isDark) {
        const isActive = currentTheme === id;
        const textColor = isDark ? 'text-white' : 'text-gray-800';
        const subColor  = isDark ? 'text-gray-300' : 'text-gray-500';

        return `
            <button onclick="Settings.setTheme('${id}')"
                    class="relative group rounded-xl border-2 overflow-hidden transition-all
                           ${isActive ? 'border-blue-500 shadow-lg shadow-blue-100' : 'border-gray-200 hover:border-gray-300'}">
                <div class="bg-gradient-to-br ${gradient} p-4 text-center">
                    <div class="text-2xl mb-1">${emoji}</div>
                    <div class="font-bold text-sm ${textColor}">${name}</div>
                    <div class="text-[0.68rem] mt-0.5 ${subColor}">${desc}</div>
                </div>
                ${isActive ? `<div class="absolute top-2 right-2 bg-blue-500 text-white text-[0.62rem] font-bold px-2 py-0.5 rounded-full">✔ Ativo</div>` : ''}
            </button>
        `;
    },


    renderUpdates() {
        const updatesContent = AutoUpdater?.render() || `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
                <div class="text-3xl mb-2">🔄</div>
                <p class="text-gray-500 font-semibold text-sm">Sistema de atualizações não disponível</p>
            </div>
        `;
        return updatesContent;
    },


    renderNotifications() {
        const notifEnabled = Utils.loadData('notifications_enabled') !== false;
        const soundEnabled = Utils.loadData('notification_sound') !== false;
        const historyEnabled = Utils.loadData('notification_history_enabled') !== false;
        const silentMode = Utils.loadData('silent_mode_enabled') === true;
        const history = Utils.loadData('notification_history') || [];

        const notifTypes = [
            { id: 'notif_type_success', label: 'Confirmações',  desc: 'Ações concluídas com sucesso', icon: '✅' },
            { id: 'notif_type_error',   label: 'Erros',         desc: 'Falhas e erros do sistema',    icon: '❌' },
            { id: 'notif_type_info',    label: 'Informações',   desc: 'Dicas e avisos gerais',        icon: 'ℹ️' },
            { id: 'notif_type_warning', label: 'Alertas',       desc: 'Situações que requerem atenção', icon: '⚠️' },
        ];

        const typeRows = notifTypes.map(t => {
            const enabled = Utils.loadData(t.id) !== false;
            return this._renderToggleRow(t.label, t.desc, t.icon, enabled && notifEnabled && !silentMode,
                `Settings.toggleNotifType('${t.id}', this.checked)`, !notifEnabled || silentMode);
        }).join('');

        const iconMap   = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        const borderMap = { success: 'border-green-200', error: 'border-red-200', warning: 'border-yellow-200', info: 'border-blue-200' };
        const bgMap     = { success: 'bg-green-50',      error: 'bg-red-50',      warning: 'bg-yellow-50',     info: 'bg-blue-50'    };

        const historyItems = silentMode
            ? `<div class="text-center py-4 text-gray-400">
                   <div class="text-2xl mb-1">🕯️</div>
                   <p class="text-xs">Modo Silencioso ativo</p>
               </div>`
            : !historyEnabled
            ? `<div class="text-center py-4 text-gray-400">
                   <div class="text-2xl mb-1">🔕</div>
                   <p class="text-xs">Histórico desativado nas configurações</p>
               </div>`
            : history.length === 0
            ? `<div class="text-center py-4 text-gray-400">
                   <div class="text-2xl mb-1">🔕</div>
                   <p class="text-xs">Nenhuma notificação no histórico</p>
               </div>`
            : [...history].reverse().slice(0, 20).map(n => `
                <div class="flex items-start gap-2.5 px-3 py-2 rounded-lg border ${bgMap[n.type] || 'bg-gray-50'} ${borderMap[n.type] || 'border-gray-200'}">
                    <span class="text-sm mt-0.5">${iconMap[n.type] || '🔔'}</span>
                    <div class="flex-1 min-w-0">
                        <p class="text-xs font-semibold text-gray-800 truncate">${n.message}</p>
                        <p class="text-xs text-gray-500 mt-0.5">${n.time}</p>
                    </div>
                </div>`).join('');

        return `
            <div class="space-y-4">
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
                    <div class="flex items-center gap-2.5 mb-1">
                        <span class="text-xl">🔔</span>
                        <div>
                            <h3 class="font-black text-gray-800 text-sm">Notificações</h3>
                            <p class="text-xs text-gray-500">Configure os alertas do aplicativo</p>
                        </div>
                    </div>
                    ${this._renderToggleRow('Modo Silencioso', 'Desativa toasts, sons e badges de missão', '🕯️', silentMode, 'Settings.toggleSilentMode(this.checked)')}
                    <div class="border-t border-gray-100"></div>
                    ${this._renderToggleRow('Ativar Notificações', 'Exibir alertas de ações e eventos', '📬', notifEnabled && !silentMode, 'Settings.toggleNotifications(this.checked)', silentMode)}
                    ${this._renderToggleRow('Som de Notificação', 'Reproduzir som ao exibir alertas', '🔊', soundEnabled && !silentMode, 'Settings.toggleSound(this.checked)', !notifEnabled || silentMode)}
                    ${this._renderToggleRow('Salvar Histórico', 'Registrar notificações no histórico recente', '📋', historyEnabled && !silentMode, 'Settings.toggleNotifHistory(this.checked)', silentMode)}
                    <div class="pt-2 border-t border-gray-100 flex gap-2.5">
                        <button onclick="Settings.testNotification()"
                                ${!notifEnabled || silentMode ? 'disabled' : ''}
                                class="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-bold text-sm hover:shadow-lg hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2">
                            <span>🧪</span>
                            <span>Testar Notificação</span>
                        </button>
                        <button onclick="Settings.clearNotificationHistory()"
                                ${history.length === 0 || !historyEnabled ? 'disabled' : ''}
                                class="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed text-xs flex items-center gap-2">
                            <span>🗑️</span>
                            <span>Limpar histórico</span>
                        </button>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div class="flex items-center gap-2.5 mb-3">
                        <span class="text-xl">🎛️</span>
                        <div>
                            <h3 class="font-black text-gray-800 text-sm">Tipos de Alerta</h3>
                            <p class="text-xs text-gray-500">Escolha quais tipos de notificação exibir</p>
                        </div>
                    </div>
                    <div class="space-y-2">${typeRows}</div>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-2.5">
                            <span class="text-xl">📋</span>
                            <div>
                                <h3 class="font-black text-gray-800 text-sm">Histórico Recente</h3>
                                <p class="text-xs text-gray-500">Últimas ${history.length} notificações</p>
                            </div>
                        </div>
                    </div>
                    <div class="space-y-1.5 max-h-48 overflow-y-auto">${historyItems}</div>
                </div>
            </div>
        `;
    },

    _renderToggleRow(title, desc, emoji, checked, onChange, disabled = false) {
        return `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg ${disabled ? 'opacity-50' : ''}">
                <div class="flex items-center gap-2.5 min-w-0">
                    <span class="text-xl">${emoji}</span>
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


    renderData() {
        const storageKB = this._getStorageKB();
        const maxKB = 5120; // 5MB estimado
        const pct = Math.min(Math.round((storageKB / maxKB) * 100), 100);
        const barColor = pct > 80 ? 'from-red-500 to-rose-600' : pct > 50 ? 'from-yellow-400 to-orange-500' : 'from-blue-500 to-cyan-500';
        const itemCount = Object.keys(localStorage).length;

        return `
            <div class="space-y-4">
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div class="flex items-center gap-2.5 mb-3">
                        <span class="text-xl">📊</span>
                        <div>
                            <h3 class="font-black text-gray-800 text-sm">Armazenamento Local</h3>
                            <p class="text-xs text-gray-500">Dados salvos no seu navegador</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-3 gap-2.5 mb-3">
                        ${this._renderStatChip('💾', `${storageKB.toFixed(1)} KB`, 'Usado')}
                        ${this._renderStatChip('📦', `${itemCount}`, 'Entradas')}
                        ${this._renderStatChip('📈', `${pct}%`, 'Ocupado')}
                    </div>

                    <div class="space-y-1">
                        <div class="flex justify-between text-xs text-gray-500 font-semibold">
                            <span>Uso do Storage</span>
                            <span>${storageKB.toFixed(1)} KB / ~${maxKB} KB</span>
                        </div>
                        <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div class="h-full bg-gradient-to-r ${barColor} rounded-full transition-all" style="width:${pct}%"></div>
                        </div>
                        <p class="text-xs text-gray-400">Limite estimado do localStorage (~5 MB)</p>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div class="flex items-center gap-2.5 mb-3">
                        <span class="text-xl">🔧</span>
                        <div>
                            <h3 class="font-black text-gray-800 text-sm">Gerenciar Dados</h3>
                            <p class="text-xs text-gray-500">Backup, restauração e limpeza</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-2.5">
                        ${this._renderDataBtn('exportData', '📤', 'Exportar Backup', 'Salvar dados em arquivo .json', 'from-emerald-500 to-teal-600')}
                        ${this._renderDataBtn('exportJourney', '\u{1F31F}', 'Exportar Jornada', 'Salvar memoria da Final Season', 'from-purple-600 to-amber-500')}
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
            <div class="bg-gray-50 rounded-lg p-2.5 text-center">
                <div class="text-lg mb-0.5">${icon}</div>
                <div class="font-black text-gray-800 text-base leading-none">${value}</div>
                <div class="text-xs text-gray-500 mt-0.5">${label}</div>
            </div>
        `;
    },

    _renderDataBtn(action, icon, title, desc, gradient, danger = false) {
        return `
            <button onclick="Settings.${action}()"
                    class="no-ripple flex items-center gap-3 p-3 bg-gradient-to-br ${gradient} text-white rounded-lg hover:shadow-lg hover:scale-[1.01] active:scale-95 transition-all text-left group">
                <div class="text-2xl group-hover:scale-110 transition-transform">${icon}</div>
                <div>
                    <div class="font-bold text-sm">${title}</div>
                    <div class="text-xs opacity-80">${desc}</div>
                </div>
            </button>
        `;
    },


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
            <div class="space-y-4">
                <div class="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl p-5 text-white shadow-xl text-center relative overflow-hidden">
                    <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 20% 50%, #a855f7 0%, transparent 50%), radial-gradient(circle at 80% 50%, #ec4899 0%, transparent 50%)"></div>
                    <div class="relative">
                        <div class="text-5xl mb-2">🐱</div>
                        <h2 class="text-2xl font-black">NyanTools</h2>
                        <p class="text-gray-400 text-sm mt-1 mb-3">にゃん~ Sua caixa de ferramentas purr-feita!</p>
                        <div class="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold">
                            <span style="width:8px;height:8px;border-radius:50%;background:#34d399;display:inline-block;animation:aboutPulse 2s ease-in-out infinite;"></span>
                            Versão ${App?.version || window.NYAN_VERSION || '3.16.0'}
                        </div>
                        <style>@keyframes aboutPulse{0%,100%{opacity:1}50%{opacity:0.35}}</style>
                    </div>
                </div>

                ${window.FinalSeason?.renderLegacySettingsCard?.() || ''}

                <div class="grid grid-cols-2 gap-3">
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <h3 class="font-black text-gray-800 text-sm mb-3 flex items-center gap-2"><span>👥</span> Desenvolvedores</h3>
                        <div class="space-y-2.5">

                            <div class="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-lg">
                                <span class="text-xl">👨‍💻</span>
                                <div>
                                    <div class="font-bold text-gray-800 text-sm">Gabriel</div>
                                    <div class="text-xs text-gray-500">Desenvolvedor Principal</div>
                                </div>
                            </div>
                            <a href="https://github.com/Fish7w7/Pandora" target="_blank"
                               class="flex items-center gap-2.5 p-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all cursor-pointer">
                                <svg class="w-5 h-5 text-gray-700 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                    <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.165 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.951 0-1.093.39-1.988 1.03-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.818c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.026 2.747-1.026.546 1.379.202 2.398.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0 0 22 12c0-5.523-4.477-10-10-10Z" clip-rule="evenodd"/>
                                </svg>
                                <div>
                                    <div class="font-bold text-blue-600 text-sm">GitHub</div>
                                    <div class="text-xs text-gray-500">Fish7w7/Pandora</div>
                                </div>
                            </a>
                            <a href="mailto:kik73261@gmail.com"
                               class="flex items-center gap-2.5 p-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all">
                                <svg class="w-5 h-5 text-gray-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                </svg>
                                <div>
                                    <div class="font-bold text-gray-800 text-sm">Email</div>
                                    <div class="text-xs text-gray-500">kik73261@gmail.com</div>
                                </div>
                            </a>

                            <div class="flex items-center gap-3 py-1">
                                <div class="flex-1 h-px bg-gray-100"></div>
                                <div class="flex-1 h-px bg-gray-100"></div>
                            </div>

                            <div class="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-lg">
                                <span class="text-xl">👩‍💻</span>
                                <div>
                                    <div class="font-bold text-gray-800 text-sm">Clara</div>
                                    <div class="text-xs text-gray-500">Desenvolvedora Principal</div>
                                </div>
                            </div>
                            <a href="mailto:clara.mendes@proton.me"
                               class="flex items-center gap-2.5 p-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all">
                                <svg class="w-5 h-5 text-gray-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                </svg>
                                <div>
                                    <div class="font-bold text-gray-800 text-sm">Email</div>
                                    <div class="text-xs text-gray-500">clara.mendes@proton.me</div>
                                </div>
                            </a>

                        </div>
                    </div>

                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <h3 class="font-black text-gray-800 text-sm mb-3 flex items-center gap-2"><span>🔗</span> Links Úteis</h3>
                        <div class="space-y-2">
                            ${links.map(l => `
                                <a href="${l.url}" target="_blank"
                                   class="flex items-center gap-2.5 p-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all">
                                    <span class="text-lg">${l.icon}</span>
                                    <span class="font-semibold text-gray-800 text-sm">${l.label}</span>
                                    <svg class="w-4 h-4 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                    </svg>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <h3 class="font-black text-gray-800 text-sm mb-3 flex items-center gap-2"><span>🛠️</span> Tecnologias</h3>
                    <div class="grid grid-cols-6 gap-2">
                        ${techs.map(t => `
                            <div class="bg-gray-50 rounded-lg p-2.5 text-center hover:bg-gray-100 transition-all group">
                                <div class="text-xl mb-1 group-hover:scale-110 transition-transform">${t.icon}</div>
                                <div class="font-bold text-gray-800 text-xs">${t.name}</div>
                                <div class="text-gray-400 text-xs mt-0.5">${t.version}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                        <span class="text-xl">📄</span>
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
        if (window.MiniGame?.cleanup) MiniGame.cleanup();
        Router?.render();
    },

    setLoginParticlesMode(mode) {
        window.LoginParticles?.setMode?.(mode);
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

    toggleSilentMode(enabled) {
        Utils.saveData('silent_mode_enabled', enabled);
        this.applySilentMode();
        if (!enabled) Utils.showNotification?.('🕯️ Modo Silencioso desativado', 'info');
        Router?.render();
    },

    applySilentMode() {
        const enabled = Utils.loadData('silent_mode_enabled') === true;
        document.body?.classList.toggle('nyan-silent-mode', enabled);
        if (enabled) document.getElementById('notifications-container')?.remove();
        if (enabled) {
            window.FinalSeasonMusic?.pause?.({ manual: false });
        } else {
            window.FinalSeasonMusic?.refresh?.();
        }
        return enabled;
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

    _getStorageKB() {
        let total = 0;
        for (let key in localStorage) {
            if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
                total += (localStorage[key].length + key.length) * 2; // UTF-16
            }
        }
        return total / 1024;
    },

    calculateStorageSize() {
        return `${this._getStorageKB().toFixed(2)} KB`;
    },

    _confirm(opts) {
        return new Promise(function(resolve) {
            var d   = document.body.classList.contains('dark-theme');
            var bg  = d ? '#1a1a2e' : '#ffffff';
            var txt = d ? '#f1f5f9' : '#0f172a';
            var sub = d ? 'rgba(255,255,255,0.5)' : '#6b7280';
            var confirmBg = opts.danger
                ? 'linear-gradient(135deg,#ef4444,#dc2626)'
                : 'linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899))';

            var overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);';
            overlay.innerHTML = '<div style="background:' + bg + ';border-radius:20px;padding:2rem;max-width:420px;width:90%;'
                + 'box-shadow:0 32px 80px rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.08);">'
                + '<div style="font-size:2.5rem;text-align:center;margin-bottom:1rem;">' + (opts.icon || '❓') + '</div>'
                + '<h3 style="font-family:Syne,sans-serif;font-weight:800;font-size:1.1rem;color:' + txt + ';text-align:center;margin:0 0 0.5rem;">' + opts.title + '</h3>'
                + '<p style="font-size:0.82rem;color:' + sub + ';text-align:center;line-height:1.6;margin:0 0 1.75rem;">' + opts.message + '</p>'
                + '<div style="display:flex;gap:0.75rem;">'
                + '<button id="modal-cancel" style="flex:1;padding:0.75rem;border-radius:10px;border:1px solid rgba(255,255,255,0.12);'
                + 'background:rgba(255,255,255,0.06);color:' + sub + ';font-weight:700;font-size:0.85rem;cursor:pointer;font-family:DM Sans,sans-serif;">Cancelar</button>'
                + '<button id="modal-confirm" style="flex:1;padding:0.75rem;border-radius:10px;border:none;'
                + 'background:' + confirmBg + ';color:white;font-weight:700;font-size:0.85rem;cursor:pointer;font-family:DM Sans,sans-serif;">'
                + (opts.confirm || 'Confirmar') + '</button>'
                + '</div></div>';

            document.body.appendChild(overlay);
            function close(val) { overlay.remove(); resolve(val); }
            overlay.querySelector('#modal-cancel').onclick  = function() { close(false); };
            overlay.querySelector('#modal-confirm').onclick = function() { close(true); };
            overlay.onclick = function(e) { if (e.target === overlay) close(false); };
        });
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

    exportJourney() {
        if (window.FinalSeason?.exportJourney) {
            window.FinalSeason.exportJourney('json');
            return;
        }
        Utils.showNotification?.('Memorial ainda nao disponivel.', 'warning');
    },

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async (ev) => {
                try {
                    const data = JSON.parse(ev.target.result);
                    const ok = await Settings._confirm({ icon:'📥', title:'Importar Backup', message:'Isso irá sobrescrever todos os dados atuais com os dados do arquivo selecionado.', confirm:'Importar', danger:false });
                    if (!ok) return;
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

    async clearCache() {
        const ok = await Settings._confirm({ icon:'🧹', title:'Limpar Cache', message:'Remove dados temporários. Suas configurações e dados de jogo serão preservados.', confirm:'Limpar', danger:false });
        if (!ok) return;
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

    async resetAll() {
        const ok1 = await Settings._confirm({ icon:'⚠️', title:'Resetar Tudo', message:'Isso irá apagar TODOS os dados do NyanTools. Jogos, configurações, API keys e histórico serão perdidos para sempre.', confirm:'Continuar', danger:true });
        if (!ok1) return;
        const ok2 = await Settings._confirm({ icon:'🚨', title:'Última Chance', message:'Esta ação NÃO PODE ser desfeita. Tem certeza absoluta?', confirm:'Apagar Tudo', danger:true });
        if (!ok2) return;
        localStorage.clear();
        Utils.showNotification?.('🗑️ Dados apagados! Recarregando...', 'info');
        setTimeout(() => location.reload(), 1500);
    },

    loadSettings() {
        this.applySilentMode();
    }
};


ThemeManager.themes.midnightGold = {
    name: 'Midnight Gold',
    emoji: '\u2728',
    gradient: 'from-[#10091f] via-purple-700 to-amber-500',
    preview: ['#10091f', '#a855f7', '#f59e0b'],
    desc: 'Final Season v3.16',
    unlockItem: 'theme_midnight_gold'
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
} else {
    ThemeManager.init();
}

window.ThemeManager = ThemeManager;
window.Settings = Settings;
