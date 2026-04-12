const KeyboardShortcuts = {
    shortcuts: {
        'ctrl+1': { tool: 'home',         name: 'Dashboard'         },
        'ctrl+2': { tool: 'password',     name: 'Gerador de Senhas' },
        'ctrl+3': { tool: 'weather',      name: 'Clima'             },
        'ctrl+4': { tool: 'translator',   name: 'Tradutor'          },
        'ctrl+5': { tool: 'ai-assistant', name: 'Assistente IA'     },
        'ctrl+6': { tool: 'mini-game',    name: 'Mini Game'         },
        'ctrl+7': { tool: 'temp-email',   name: 'Email Temporário'  },
        'ctrl+8': { tool: 'music',        name: 'Player de Música'  },
        'ctrl+9': { tool: 'offline',      name: 'Zona Offline'      },
        'ctrl+0': { tool: 'notes',        name: 'Notas Rápidas'     },
        'ctrl+t': { tool: 'tasks',        name: 'Tarefas'           },
        'ctrl+s': { tool: 'settings',     name: 'Configurações'     },
        'ctrl+u': { tool: 'profile',      name: 'Perfil'            },
        'ctrl+/': { action: 'showHelp',         name: 'Mostrar Atalhos'  },
        'escape': { action: 'closeModals',       name: 'Fechar Modais'    },
        'ctrl+shift+u': { action: 'toggleDevMode',  name: 'Dev Mode (Updater)' },
        'ctrl+shift+f': { action: 'toggleFocusMode', name: 'Modo Foco'         },
    },

    isModalOpen: false,

    init() {
        this.setupListeners();
    },

    setupListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.isTyping(e.target)) return;
            const key = this.getKeyCombo(e);
            const shortcut = this.shortcuts[key];
            if (shortcut) { e.preventDefault(); e.stopPropagation(); this.executeShortcut(shortcut); }
        });
    },

    isTyping(element) {
        return element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.contentEditable === 'true';
    },

    getKeyCombo(e) {
        const parts = [];
        if (e.ctrlKey || e.metaKey) parts.push('ctrl');
        if (e.shiftKey) parts.push('shift');
        if (e.altKey) parts.push('alt');
        const key = e.key.toLowerCase();
        if (!['control', 'shift', 'alt', 'meta'].includes(key)) parts.push(key);
        return parts.join('+');
    },

    executeShortcut(shortcut) {
        if (shortcut.tool) {
            this.navigateToTool(shortcut.tool, shortcut.name);
        } else if (shortcut.action === 'showHelp') {
            this.showHelpModal();
        } else if (shortcut.action === 'closeModals') {
            this.closeAllModals();
        } else if (shortcut.action === 'toggleFocusMode') {
            if (window.FocusMode) FocusMode.toggle();
        } else if (shortcut.action === 'toggleDevMode') {
            if (window.AutoUpdater) {
                if (!AutoUpdater._isDevEnv) return;
                AutoUpdater._devMode = !AutoUpdater._devMode;
                Utils?.showNotification(AutoUpdater._devMode ? '🔧 Dev mode ativado' : '🔧 Dev mode desativado', 'info');
                Router?.render();
            }
        }
    },

    navigateToTool(toolId, toolName) {
        if (window.Router && typeof Router.navigate === 'function') {
            Router.navigate(toolId);
            const tool = window.App?.tools?.find(t => t.id === toolId);
            this.showFlash(toolName, tool?.icon || '⚡');
        }
    },

    showFlash(toolName, toolIcon = '⚡') {
        document.getElementById('kb-flash-toast')?.remove();
        const flash = document.createElement('div');
        flash.id = 'kb-flash-toast';
        flash.innerHTML = `
            <span class="kb-flash-icon">${toolIcon}</span>
            <span class="kb-flash-text">${toolName}</span>
            <kbd class="kb-flash-kbd">⌨️</kbd>
        `;

        if (!document.getElementById('kb-flash-style')) {
            const style = document.createElement('style');
            style.id = 'kb-flash-style';
            style.textContent = `
                #kb-flash-toast {
                    position:fixed;bottom:1.5rem;left:50%;
                    transform:translateX(-50%) translateY(80px);
                    z-index:9999;display:flex;align-items:center;gap:0.625rem;
                    padding:0.6rem 1rem 0.6rem 0.75rem;
                    background:rgba(15,15,20,0.96);
                    border:1px solid rgba(255,255,255,0.1);border-radius:12px;
                    box-shadow:0 8px 32px rgba(0,0,0,0.4),0 0 0 1px rgba(255,255,255,0.04);
                    font-family:'DM Sans',sans-serif;font-size:0.8rem;font-weight:600;
                    color:rgba(255,255,255,0.85);white-space:nowrap;pointer-events:none;
                    opacity:0;transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1),opacity 0.25s ease;
                }
                #kb-flash-toast.show { transform:translateX(-50%) translateY(0);opacity:1; }
                #kb-flash-toast.hide { transform:translateX(-50%) translateY(12px);opacity:0;transition:transform 0.2s ease,opacity 0.2s ease; }
                .kb-flash-icon { font-size:1rem;line-height:1;display:flex;align-items:center;justify-content:center;width:28px;height:28px;background:rgba(255,255,255,0.08);border-radius:7px;flex-shrink:0; }
                .kb-flash-text { color:rgba(255,255,255,0.9); }
                .kb-flash-kbd { font-size:0.65rem;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);border-radius:5px;padding:2px 6px;font-family:monospace;color:rgba(255,255,255,0.35);margin-left:0.125rem; }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(flash);
        requestAnimationFrame(() => requestAnimationFrame(() => flash.classList.add('show')));
        setTimeout(() => {
            flash.classList.remove('show');
            flash.classList.add('hide');
            setTimeout(() => flash.remove(), 250);
        }, 1400);
    },

    showHelpModal() {
        if (this.isModalOpen) return;
        const modal = document.createElement('div');
        modal.id = 'shortcuts-modal';
        modal.className = 'fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fadeIn';
        modal.onclick = (e) => { if (e.target === modal) this.closeHelpModal(); };

        modal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-slideUp">
                <div class="sticky top-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white p-6 rounded-t-2xl">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <span class="text-4xl">⌨️</span>
                            <h2 class="text-3xl font-black">Atalhos de Teclado</h2>
                        </div>
                        <button onclick="KeyboardShortcuts.closeHelpModal()" class="text-white/80 hover:text-white text-2xl font-bold">✕</button>
                    </div>
                    <p class="text-white/90 mt-2">Navegue mais rápido pelo NyanTools にゃん~</p>
                </div>
                <div class="p-6">
                    <div class="mb-6">
                        <h3 class="text-xl font-black text-gray-800 mb-3 flex items-center gap-2"><span>🛠️</span><span>Ferramentas</span></h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            ${this.renderShortcutItem('Ctrl + 1', 'Dashboard', '📊')}
                            ${this.renderShortcutItem('Ctrl + 2', 'Gerador de Senhas', '🔑')}
                            ${this.renderShortcutItem('Ctrl + 3', 'Clima', '🌤️')}
                            ${this.renderShortcutItem('Ctrl + 4', 'Tradutor', '🌍')}
                            ${this.renderShortcutItem('Ctrl + 5', 'Assistente IA', '🤖')}
                            ${this.renderShortcutItem('Ctrl + 6', 'Mini Game', '🎮')}
                            ${this.renderShortcutItem('Ctrl + 7', 'Email Temporário', '📧')}
                            ${this.renderShortcutItem('Ctrl + 8', 'Player de Música', '🎵')}
                            ${this.renderShortcutItem('Ctrl + 9', 'Zona Offline', '📶')}
                            ${this.renderShortcutItem('Ctrl + 0', 'Notas Rápidas', '📝')}
                        </div>
                    </div>
                    <div class="mb-6">
                        <h3 class="text-xl font-black text-gray-800 mb-3 flex items-center gap-2"><span>⚡</span><span>Ações Rápidas</span></h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            ${this.renderShortcutItem('Ctrl + P', 'Command Palette', '🔍')}
                            ${this.renderShortcutItem('Ctrl + T', 'Tarefas', '✅')}
                            ${this.renderShortcutItem('Ctrl + S', 'Configurações', '⚙️')}
                            ${this.renderShortcutItem('Ctrl + U', 'Perfil', '👤')}
                            ${this.renderShortcutItem('Ctrl + /', 'Mostrar Atalhos', '❓')}
                            ${this.renderShortcutItem('Esc', 'Fechar Modais', '❌')}
                            ${this.renderShortcutItem('Ctrl + Shift + F', 'Modo Foco', '🎯')}
                        </div>
                    </div>
                    <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-blue-200">
                        <div class="flex items-start gap-3">
                            <span class="text-2xl">💡</span>
                            <div>
                                <h4 class="font-bold text-gray-800 mb-1">Dica</h4>
                                <p class="text-sm text-gray-600">
                                    Atalhos não funcionam quando você está digitando em campos de texto.
                                    Use <kbd class="px-2 py-1 bg-white rounded border shadow-sm">Ctrl + /</kbd> a qualquer momento para ver esta ajuda!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        this.isModalOpen = true;
    },

    renderShortcutItem(keys, description, icon) {
        return `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                <div class="flex items-center gap-2">
                    <span class="text-xl">${icon}</span>
                    <span class="font-semibold text-gray-700">${description}</span>
                </div>
                <kbd class="px-3 py-1 bg-white rounded-lg border-2 border-gray-300 text-sm font-bold text-gray-700 shadow-sm">${keys}</kbd>
            </div>
        `;
    },

    closeHelpModal() {
        document.getElementById('shortcuts-modal')?.remove();
        this.isModalOpen = false;
    },

    closeAllModals() {
        this.closeHelpModal();
        document.querySelectorAll('[id$="-modal"]').forEach(modal => modal.remove());
    }
};

const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
    @keyframes slideUp { from{opacity:0;transform:translateY(50px)} to{opacity:1;transform:translateY(0)} }
    .animate-fadeIn  { animation:fadeIn 0.3s ease-out; }
    .animate-slideUp { animation:slideUp 0.3s ease-out; }
    kbd { font-family:monospace; }
`;
document.head.appendChild(style);

window.KeyboardShortcuts = KeyboardShortcuts;
