

const FocusMode = {
    active: false,
    peeking: false,
    _peekTimeout: null,
    _toastTimeout: null,
    STORAGE_KEY: 'focus_mode_active',

    init() {
        this._injectHTML();
        this._setupListeners();

        const saved = Utils?.loadData(this.STORAGE_KEY);
        if (saved === true) {
            setTimeout(() => this.enable(true), 200);
        }

    },


    _injectHTML() {
        if (!document.getElementById('focus-header')) {
            const header = document.createElement('div');
            header.id = 'focus-header';
            header.innerHTML = `
                <button id="focus-logo-btn" onclick="FocusMode.disable()" title="Sair do Modo Foco">
                    <span class="focus-cat">🐱</span>
                    <span>NyanTools</span>
                </button>

                <div style="display:flex;align-items:center;gap:0.75rem;">
                    <div class="focus-header-sep"></div>
                    <div id="focus-tool-indicator">
                        <span class="focus-tool-icon" id="focus-icon">📊</span>
                        <span class="focus-tool-name" id="focus-name">Dashboard</span>
                    </div>
                </div>

                <div style="flex:1;"></div>

                <div id="focus-user-info">
                    <span>にゃん~</span>
                    <div class="focus-header-sep"></div>
                    <span class="focus-username" id="focus-username">Usuário</span>
                </div>

                <div class="focus-header-sep"></div>

                <button id="focus-exit-btn" onclick="FocusMode.disable()" title="Sair do Modo Foco (Ctrl+Shift+F)">
                    <span>Sair do Foco</span>
                    <kbd>Ctrl+Shift+F</kbd>
                </button>
            `;
            document.body.appendChild(header);
        }

        if (!document.getElementById('focus-peek-zone')) {
            const peekZone = document.createElement('div');
            peekZone.id = 'focus-peek-zone';
            document.body.appendChild(peekZone);
        }

        if (!document.getElementById('focus-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'focus-overlay';
            document.body.appendChild(overlay);
        }

        if (!document.getElementById('focus-toast')) {
            const toast = document.createElement('div');
            toast.id = 'focus-toast';
            toast.innerHTML = `
                <span class="toast-icon" id="focus-toast-icon">🎯</span>
                <span id="focus-toast-text">Modo Foco ativado</span>
                <kbd>Ctrl+Shift+F</kbd>
            `;
            document.body.appendChild(toast);
        }
        this._injectSidebarToggle();
    },

    _injectSidebarToggle() {
        if (document.getElementById('focus-toggle-btn')) return;

        const logoRow = document.querySelector('#sidebar .sidebar-logo');
        if (!logoRow) return;

        const btn = document.createElement('button');
        btn.id    = 'focus-toggle-btn';
        btn.title = 'Modo Foco (Ctrl+Shift+F)';
        btn.onclick = () => this.toggle();
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"/>
            </svg>
        `;
        logoRow.appendChild(btn);
    },


    _setupListeners() {
        const peekZone = document.getElementById('focus-peek-zone');
        if (peekZone) {
            peekZone.addEventListener('mouseenter', () => this._startPeek());
            peekZone.addEventListener('mouseleave', () => this._schedulePeekEnd());
        }

        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.addEventListener('mouseenter', () => {
                if (this.active) this._startPeek();
            });
            sidebar.addEventListener('mouseleave', () => {
                if (this.active) this._schedulePeekEnd();
            });
        }

        const overlay = document.getElementById('focus-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => this._endPeek());
        }
        this._patchRouter();
    },

    _patchRouter() {
        if (!window.Router) {
            setTimeout(() => this._patchRouter(), 500);
            return;
        }

        const originalNavigate = Router.navigate.bind(Router);
        Router.navigate = (toolId) => {
            originalNavigate(toolId);
            setTimeout(() => this._updateToolIndicator(toolId), 50);
            if (this.active && this.peeking) {
                clearTimeout(this._peekTimeout);
                this._peekTimeout = setTimeout(() => this._endPeek(), 1200);
            }
        };
    },


    toggle() {
        this.active ? this.disable() : this.enable();
    },

    enable(silent = false) {
        this.active = true;
        document.body.classList.add('focus-mode');
        this._updateUserInfo();
        this._updateToolIndicator(window.Router?.currentRoute || 'home');
        Utils?.saveData(this.STORAGE_KEY, true);

        if (!silent) {
            this._showToast('🎯', 'Modo Foco ativado');
        }

    },

    disable() {
        this.active = false;
        this.peeking = false;
        document.body.classList.remove('focus-mode', 'sidebar-peek');
        Utils?.saveData(this.STORAGE_KEY, false);
        this._showToast('👁️', 'Modo Foco desativado');
    },


    _startPeek() {
        if (!this.active) return;
        clearTimeout(this._peekTimeout);

        document.body.classList.remove('sidebar-closing');

        this.peeking = true;
        document.body.classList.add('sidebar-peek');
    },

    _schedulePeekEnd() {
        if (!this.active) return;
        clearTimeout(this._peekTimeout);
        this._peekTimeout = setTimeout(() => this._endPeek(), 700);
    },

    _endPeek() {
        if (!this.active || !this.peeking) return;
        this.peeking = false;
        document.body.classList.add('sidebar-closing');
        setTimeout(() => {
            document.body.classList.remove('sidebar-peek');
            setTimeout(() => {
                document.body.classList.remove('sidebar-closing');
            }, 320);
        }, 150);
    },


    _updateUserInfo() {
        const usernameEl = document.getElementById('focus-username');
        if (usernameEl && window.App?.user?.username) {
            usernameEl.textContent = window.App.user.username;
        }
    },

    _updateToolIndicator(toolId) {
        const iconEl = document.getElementById('focus-icon');
        const nameEl = document.getElementById('focus-name');
        if (!iconEl || !nameEl) return;

        const toolMap = {
            'home':         { icon: '📊', name: 'Dashboard' },
            'password':     { icon: '🔑', name: 'Gerador de Senhas' },
            'weather':      { icon: '🌤️', name: 'Clima' },
            'translator':   { icon: '🌍', name: 'Tradutor' },
            'ai-assistant': { icon: '🤖', name: 'Assistente IA' },
            'mini-game':    { icon: '🎮', name: 'Mini Game' },
            'temp-email':   { icon: '📧', name: 'Email Temporário' },
            'music':        { icon: '🎵', name: 'Player de Música' },
            'notes':        { icon: '📝', name: 'Notas Rápidas' },
            'tasks':        { icon: '✅', name: 'Tarefas' },
            'missions':     { icon: '📋', name: 'Missões' },
            'shop':         { icon: '🛍️', name: 'Loja' },
            'offline':      { icon: '📶', name: 'Zona Offline' },
            'settings':     { icon: '⚙️', name: 'Configurações' },
            'updates':      { icon: '🔄', name: 'Atualizações' },
            'profile':      { icon: '👤', name: 'Perfil' },
        };

        const tool = toolMap[toolId] || { icon: '🐱', name: toolId };
        iconEl.textContent = tool.icon;
        nameEl.textContent = tool.name;

        const indicator = document.getElementById('focus-tool-indicator');
        if (indicator) {
            indicator.style.opacity = '0';
            indicator.style.transform = 'translateY(-4px)';
            requestAnimationFrame(() => {
                indicator.style.transition = 'opacity 0.2s, transform 0.2s';
                indicator.style.opacity = '1';
                indicator.style.transform = 'translateY(0)';
            });
        }
    },


    _showToast(icon, text) {
        const toast = document.getElementById('focus-toast');
        const toastIcon = document.getElementById('focus-toast-icon');
        const toastText = document.getElementById('focus-toast-text');

        if (!toast || !toastIcon || !toastText) return;

        clearTimeout(this._toastTimeout);

        toastIcon.textContent = icon;
        toastText.textContent = text;

        toast.classList.add('show');

        this._toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    },


    renderSettingsRow() {
        const isActive = this.active;
        return `
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div class="flex items-center gap-3">
                    <span class="text-2xl">🎯</span>
                    <div>
                        <div class="font-semibold text-gray-800 text-sm flex items-center gap-2">
                            Modo Foco
                            <span class="focus-mode-badge">NOVO</span>
                        </div>
                        <div class="text-xs text-gray-500">Esconde a sidebar para maximizar o espaço útil</div>
                    </div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox"
                           ${isActive ? 'checked' : ''}
                           onchange="FocusMode[this.checked ? 'enable' : 'disable']()"
                           class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-300 peer-checked:bg-blue-500 rounded-full transition-colors peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow"></div>
                </label>
            </div>
        `;
    }
};

if (window.KeyboardShortcuts) {
    KeyboardShortcuts.shortcuts['ctrl+shift+f'] = {
        action: 'toggleFocusMode',
        name: 'Modo Foco'
    };

    const originalExecute = KeyboardShortcuts.executeShortcut.bind(KeyboardShortcuts);
    KeyboardShortcuts.executeShortcut = function(shortcut) {
        if (shortcut.action === 'toggleFocusMode') {
            FocusMode.toggle();
            return;
        }
        originalExecute(shortcut);
    };
} else {
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
            const target = e.target;
            const isTyping = target.tagName === 'INPUT' ||
                             target.tagName === 'TEXTAREA' ||
                             target.contentEditable === 'true';
            if (!isTyping) {
                e.preventDefault();
                FocusMode.toggle();
            }
        }
    });
}

window.FocusMode = FocusMode;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
    });
}
