/* ═══════════════════════════════════════════════════════
   FOCUS-MODE.JS v1.0 — NyanTools にゃん~
   Modo Apresentação / Foco — Ctrl+Shift+F
   ═══════════════════════════════════════════════════════ */

const FocusMode = {
    active: false,
    peeking: false,
    _peekTimeout: null,
    _toastTimeout: null,
    STORAGE_KEY: 'focus_mode_active',

    init() {
        this._injectHTML();
        this._setupListeners();

        // Restaurar estado salvo
        const saved = Utils?.loadData(this.STORAGE_KEY);
        if (saved === true) {
            setTimeout(() => this.enable(true), 200);
        }

        console.log('🎯 FocusMode v1.0 inicializado — Ctrl+Shift+F para ativar');
    },

    // ──────────────────────────────────────────────────────
    // HTML INJECTION
    // ──────────────────────────────────────────────────────

    _injectHTML() {
        // Focus Header (barra superior em modo foco)
        if (!document.getElementById('focus-header')) {
            const header = document.createElement('div');
            header.id = 'focus-header';
            header.innerHTML = `
                <!-- Logo / Voltar à sidebar -->
                <button id="focus-logo-btn" onclick="FocusMode.disable()" title="Sair do Modo Foco">
                    <span class="focus-cat">🐱</span>
                    <span>NyanTools</span>
                </button>

                <!-- Tool indicator -->
                <div style="display:flex;align-items:center;gap:0.75rem;">
                    <div class="focus-header-sep"></div>
                    <div id="focus-tool-indicator">
                        <span class="focus-tool-icon" id="focus-icon">📊</span>
                        <span class="focus-tool-name" id="focus-name">Dashboard</span>
                    </div>
                </div>

                <!-- Spacer -->
                <div style="flex:1;"></div>

                <!-- User info -->
                <div id="focus-user-info">
                    <span>にゃん~</span>
                    <div class="focus-header-sep"></div>
                    <span class="focus-username" id="focus-username">Usuário</span>
                </div>

                <div class="focus-header-sep"></div>

                <!-- Sair do modo foco -->
                <button id="focus-exit-btn" onclick="FocusMode.disable()" title="Sair do Modo Foco (Ctrl+Shift+F)">
                    <span>Sair do Foco</span>
                    <kbd>Ctrl+Shift+F</kbd>
                </button>
            `;
            document.body.appendChild(header);
        }

        // Peek zone (zona de hover na borda esquerda)
        if (!document.getElementById('focus-peek-zone')) {
            const peekZone = document.createElement('div');
            peekZone.id = 'focus-peek-zone';
            document.body.appendChild(peekZone);
        }

        // Overlay (fundo escuro quando sidebar aparece em peek)
        if (!document.getElementById('focus-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'focus-overlay';
            document.body.appendChild(overlay);
        }

        // Toast de feedback
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

        // Toggle button na sidebar
        this._injectSidebarToggle();
    },

    _injectSidebarToggle() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar || document.getElementById('focus-toggle-btn')) return;

        sidebar.style.position = 'relative';

        const btn = document.createElement('button');
        btn.id = 'focus-toggle-btn';
        btn.title = 'Modo Foco (Ctrl+Shift+F)';
        btn.onclick = () => this.toggle();
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"/>
            </svg>
        `;
        sidebar.appendChild(btn);
    },

    // ──────────────────────────────────────────────────────
    // EVENT LISTENERS
    // ──────────────────────────────────────────────────────

    _setupListeners() {
        // Peek zone — hover na borda esquerda
        const peekZone = document.getElementById('focus-peek-zone');
        if (peekZone) {
            peekZone.addEventListener('mouseenter', () => this._startPeek());
            peekZone.addEventListener('mouseleave', () => this._schedulePeekEnd());
        }

        // Sidebar — manter peek enquanto mouse está sobre ela
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.addEventListener('mouseenter', () => {
                if (this.active) this._startPeek();
            });
            sidebar.addEventListener('mouseleave', () => {
                if (this.active) this._schedulePeekEnd();
            });
        }

        // Overlay — clicar fecha o peek
        const overlay = document.getElementById('focus-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => this._endPeek());
        }
        this._patchRouter();
    },

    _patchRouter() {
        if (!window.Router) {
            // Tentar novamente depois
            setTimeout(() => this._patchRouter(), 500);
            return;
        }

        const originalNavigate = Router.navigate.bind(Router);
        Router.navigate = (toolId) => {
            originalNavigate(toolId);
            // Atualizar indicador após navegação
            setTimeout(() => this._updateToolIndicator(toolId), 50);
            // Se estava no peek, fechar sidebar
            if (this.active && this.peeking) {
                setTimeout(() => this._endPeek(), 300);
            }
        };
    },

    // ──────────────────────────────────────────────────────
    // TOGGLE / ENABLE / DISABLE
    // ──────────────────────────────────────────────────────

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

        console.log('🎯 Modo Foco: ON');
    },

    disable() {
        this.active = false;
        this.peeking = false;
        document.body.classList.remove('focus-mode', 'sidebar-peek');
        Utils?.saveData(this.STORAGE_KEY, false);
        this._showToast('👁️', 'Modo Foco desativado');
        console.log('🎯 Modo Foco: OFF');
    },

    // ──────────────────────────────────────────────────────
    // PEEK (hover sidebar)
    // ──────────────────────────────────────────────────────

    _startPeek() {
        if (!this.active) return;
        clearTimeout(this._peekTimeout);
        this.peeking = true;
        document.body.classList.add('sidebar-peek');
    },

    _schedulePeekEnd() {
        if (!this.active) return;
        clearTimeout(this._peekTimeout);
        this._peekTimeout = setTimeout(() => this._endPeek(), 400);
    },

    _endPeek() {
        if (!this.active) return;
        this.peeking = false;
        document.body.classList.remove('sidebar-peek');
    },

    // ──────────────────────────────────────────────────────
    // UI UPDATES
    // ──────────────────────────────────────────────────────

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
            'offline':      { icon: '📶', name: 'Zona Offline' },
            'settings':     { icon: '⚙️', name: 'Configurações' },
            'updates':      { icon: '🔄', name: 'Atualizações' },
        };

        const tool = toolMap[toolId] || { icon: '🐱', name: toolId };
        iconEl.textContent = tool.icon;
        nameEl.textContent = tool.name;

        // Pequena animação de fade
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

    // ──────────────────────────────────────────────────────
    // TOAST
    // ──────────────────────────────────────────────────────

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

    // ──────────────────────────────────────────────────────
    // RENDER no Settings (opcional, para a aba de config)
    // ──────────────────────────────────────────────────────

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

// ─── INTEGRAÇÃO COM KEYBOARD SHORTCUTS ───────────────────
// Adiciona Ctrl+Shift+F ao sistema de atalhos existente
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
    // Fallback: listener direto
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
            // Não ativar se estiver digitando
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

// ─── EXPORT ──────────────────────────────────────────────
window.FocusMode = FocusMode;

// Auto-init quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
    });
}