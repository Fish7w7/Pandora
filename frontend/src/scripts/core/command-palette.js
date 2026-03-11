/* ═══════════════════════════════════════════════════════
   COMMAND-PALETTE.JS v1.0 — NyanTools にゃん~
   Ctrl+P — Busca universal: ferramentas, notas, tarefas, ações
   ═══════════════════════════════════════════════════════ */

const CommandPalette = {
    isOpen: false,
    selectedIndex: 0,
    currentItems: [],
    _query: '',


    init() {
        this._injectHTML();
        this._setupListeners();
        console.log('🔍 CommandPalette v1.0 inicializado — Ctrl+P para abrir');
    },

    // ──────────────────────────────────────────────────────
    // HTML
    // ──────────────────────────────────────────────────────

    _injectHTML() {
        if (document.getElementById('cmd-overlay')) return;

        const el = document.createElement('div');
        el.id = 'cmd-overlay';
        el.innerHTML = `
            <div id="cmd-panel" role="dialog" aria-modal="true" aria-label="Command Palette">

                <!-- Input -->
                <div id="cmd-input-wrap">
                    <svg id="cmd-search-icon" width="17" height="17" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input id="cmd-input"
                           type="text"
                           placeholder="Buscar ferramentas, notas, tarefas, ações..."
                           autocomplete="off"
                           spellcheck="false">
                    <span id="cmd-kbd-esc">ESC</span>
                </div>

                <!-- Resultados -->
                <div id="cmd-results" role="listbox"></div>

                <!-- Vazio -->
                <div id="cmd-empty">
                    <div id="cmd-empty-icon">🔍</div>
                    <div id="cmd-empty-text">Nenhum resultado para "<span id="cmd-empty-query"></span>"</div>
                </div>

                <!-- Footer -->
                <div id="cmd-footer">
                    <div class="cmd-footer-hint">
                        <kbd>↑</kbd><kbd>↓</kbd> navegar
                    </div>
                    <div class="cmd-footer-sep"></div>
                    <div class="cmd-footer-hint">
                        <kbd>↵</kbd> selecionar
                    </div>
                    <div class="cmd-footer-sep"></div>
                    <div class="cmd-footer-hint">
                        <kbd>ESC</kbd> fechar
                    </div>
                    <div style="flex:1"></div>
                    <div class="cmd-footer-hint" style="opacity:0.6;">
                        🐱 NyanTools
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(el);
    },

    // ──────────────────────────────────────────────────────
    // LISTENERS
    // ──────────────────────────────────────────────────────

    _setupListeners() {
        // Ctrl+P para abrir
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
                const isTyping = ['INPUT','TEXTAREA'].includes(e.target.tagName) ||
                                 e.target.contentEditable === 'true';
                if (!isTyping) {
                    e.preventDefault();
                    this.isOpen ? this.close() : this.open();
                }
            }

            if (!this.isOpen) return;

            if (e.key === 'Escape')    { e.preventDefault(); this.close(); }
            if (e.key === 'ArrowDown') { e.preventDefault(); this._moveSelection(1); }
            if (e.key === 'ArrowUp')   { e.preventDefault(); this._moveSelection(-1); }
            if (e.key === 'Enter')     { e.preventDefault(); this._executeSelected(); }
        });

        document.getElementById('cmd-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'cmd-overlay') this.close();
        });

        // Input de busca — com debounce para não re-renderizar a cada tecla
        let _debounceTimer = null;
        document.getElementById('cmd-input').addEventListener('input', (e) => {
            this._query = e.target.value;
            const overlay = document.getElementById('cmd-overlay');
            overlay.classList.toggle('has-query', this._query.length > 0);

            clearTimeout(_debounceTimer);
            _debounceTimer = setTimeout(() => {
                this.selectedIndex = 0;
                this._render();
            }, 60);
        });
    },

    // ──────────────────────────────────────────────────────
    // OPEN / CLOSE
    // ──────────────────────────────────────────────────────

    open() {
        this.isOpen = true;
        this._query = '';
        this.selectedIndex = 0;

        const overlay = document.getElementById('cmd-overlay');
        const input   = document.getElementById('cmd-input');
        const results = document.getElementById('cmd-results');

        overlay.classList.add('open');
        overlay.classList.remove('has-query');
        input.value = '';
        input.focus();

        // Delegação de eventos no container — registrada uma vez por abertura
        const clickHandler = (e) => {
            const item = e.target.closest('.cmd-item');
            if (!item) return;
            this.selectedIndex = parseInt(item.dataset.idx, 10);
            this._executeSelected();
        };
        const hoverHandler = (e) => {
            const item = e.target.closest('.cmd-item');
            if (!item) return;
            const idx = parseInt(item.dataset.idx, 10);
            if (idx === this.selectedIndex) return;
            this.selectedIndex = idx;
            this._updateSelection();
        };

        // Limpar listeners anteriores e re-registrar
        const fresh = results.cloneNode(false);
        results.parentNode.replaceChild(fresh, results);
        fresh.addEventListener('click', clickHandler);
        fresh.addEventListener('mouseover', hoverHandler);

        this._render();
    },

    close() {
        this.isOpen = false;
        document.getElementById('cmd-overlay').classList.remove('open', 'has-query');
    },

    toggle() {
        this.isOpen ? this.close() : this.open();
    },

    // ──────────────────────────────────────────────────────
    // DATA SOURCES
    // ──────────────────────────────────────────────────────

    _getTools() {
        const tools = window.App?.tools || [];
        const shortcuts = {
            'home':         'Ctrl+1', 'password':     'Ctrl+2',
            'weather':      'Ctrl+3', 'translator':   'Ctrl+4',
            'ai-assistant': 'Ctrl+5', 'mini-game':    'Ctrl+6',
            'temp-email':   'Ctrl+7', 'music':        'Ctrl+8',
            'offline':      'Ctrl+9', 'notes':        'Ctrl+0',
            'tasks':        'Ctrl+T', 'settings':     'Ctrl+S',
        };
        return tools.map(t => ({
            type:     'tool',
            id:       t.id,
            icon:     t.icon,
            name:     t.name,
            sub:      t.description,
            shortcut: shortcuts[t.id] || null,
            action:   () => { Router?.navigate(t.id); this.close(); }
        }));
    },

    _getNotes() {
        try {
            const raw = Utils?.loadData('notes') || [];
            return raw.slice(0, 20).map(n => ({
                type:   'note',
                id:     n.id,
                icon:   '📝',
                name:   n.title || 'Sem título',
                sub:    n.content?.replace(/\n/g, ' ').slice(0, 60) || '',
                action: () => { Router?.navigate('notes'); this.close(); }
            }));
        } catch { return []; }
    },

    _getTasks() {
        try {
            const raw = Utils?.loadData('tasks') || [];
            return raw
                .filter(t => !t.completed)
                .slice(0, 20)
                .map(t => ({
                    type:   'task',
                    id:     t.id,
                    icon:   t.priority === 'high' ? '🔴' : t.priority === 'medium' ? '🟡' : '🟢',
                    name:   t.title || 'Sem título',
                    sub:    t.description || `Prioridade ${t.priority || 'normal'}`,
                    action: () => { Router?.navigate('tasks'); this.close(); }
                }));
        } catch { return []; }
    },

    _getActions() {
        const theme   = Utils?.loadData('app_theme') || 'light';
        const isDark  = theme === 'dark';
        const isFocus = window.FocusMode?.active || false;

        return [
            {
                type: 'action', icon: isDark ? '☀️' : '🌙',
                name: isDark ? 'Ativar tema claro' : 'Ativar tema escuro',
                sub:  'Aparência',
                action: () => {
                    Settings?.setTheme(isDark ? 'light' : 'dark');
                    this.close();
                }
            },
            {
                type: 'action', icon: isFocus ? '👁️' : '🎯',
                name: isFocus ? 'Desativar Modo Foco' : 'Ativar Modo Foco',
                sub:  'Visualização · Ctrl+Shift+F',
                shortcut: 'Ctrl+Shift+F',
                action: () => { FocusMode?.toggle(); this.close(); }
            },
            {
                type: 'action', icon: '📤',
                name: 'Exportar backup',
                sub:  'Dados · salvar .json',
                action: () => { Settings?.exportData(); this.close(); }
            },
            {
                type: 'action', icon: '🔄',
                name: 'Verificar atualizações',
                sub:  'Sistema',
                action: () => {
                    Router?.navigate('settings');
                    setTimeout(() => Settings?.switchTab?.('updates'), 150);
                    this.close();
                }
            },
            {
                type: 'action', icon: '⌨️',
                name: 'Ver atalhos de teclado',
                sub:  'Ajuda · Ctrl+/',
                shortcut: 'Ctrl+/',
                action: () => { KeyboardShortcuts?.showHelpModal(); this.close(); }
            },
            {
                type: 'action', icon: '🚪',
                name: 'Sair da conta',
                sub:  'Sessão',
                action: () => { this.close(); setTimeout(() => App?.handleLogout(), 150); }
            },
        ];
    },

    // ──────────────────────────────────────────────────────
    // BUSCA / FILTRO
    // ──────────────────────────────────────────────────────

    _match(item, q) {
        if (!q) return true;
        const haystack = `${item.name} ${item.sub || ''}`.toLowerCase();
        return haystack.includes(q.toLowerCase());
    },

    _highlight(text, q) {
        if (!q) return text;
        const idx = text.toLowerCase().indexOf(q.toLowerCase());
        if (idx === -1) return text;
        return text.slice(0, idx)
             + `<span class="cmd-highlight">${text.slice(idx, idx + q.length)}</span>`
             + text.slice(idx + q.length);
    },

    // ──────────────────────────────────────────────────────
    // RENDER
    // ──────────────────────────────────────────────────────

    _render() {
        const q       = this._query.trim();
        const results  = document.getElementById('cmd-results');
        const empty    = document.getElementById('cmd-empty');
        const emptyQ   = document.getElementById('cmd-empty-query');

        const tools   = this._getTools().filter(i => this._match(i, q));
        const notes   = this._getNotes().filter(i => this._match(i, q));
        const tasks   = this._getTasks().filter(i => this._match(i, q));
        const actions = this._getActions().filter(i => this._match(i, q));

        // Lista plana para navegação por teclado
        this.currentItems = [...tools, ...notes, ...tasks, ...actions];

        // Clamp selectedIndex
        if (this.selectedIndex >= this.currentItems.length) {
            this.selectedIndex = 0;
        }

        const totalResults = this.currentItems.length;

        if (totalResults === 0) {
            results.innerHTML = '';
            results.style.display = 'none';
            empty.classList.add('show');
            emptyQ.textContent = q;
            return;
        }

        empty.classList.remove('show');
        results.style.display = '';

        let html = '';
        let globalIdx = 0;

        const renderGroup = (label, items) => {
            if (!items.length) return;

            html += `<div class="cmd-group">`;
            html += `<div class="cmd-group-label">${label}</div>`;

            items.forEach(item => {
                const isSelected = globalIdx === this.selectedIndex;
                const shortcutHTML = item.shortcut
                    ? `<span class="cmd-item-kbd">${item.shortcut}</span>`
                    : '';
                html += `
                    <div class="cmd-item ${isSelected ? 'selected' : ''}"
                         data-idx="${globalIdx}"
                         role="option"
                         aria-selected="${isSelected}">
                        <div class="cmd-item-icon">${item.icon}</div>
                        <div class="cmd-item-body">
                            <div class="cmd-item-name">${this._highlight(item.name, q)}</div>
                            ${item.sub ? `<div class="cmd-item-sub">${item.sub}</div>` : ''}
                        </div>
                        ${shortcutHTML}
                        <svg class="cmd-item-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"/>
                            <polyline points="12 5 19 12 12 19"/>
                        </svg>
                    </div>
                `;
                globalIdx++;
            });

            html += `</div>`;

            // Divider entre grupos
            html += `<div class="cmd-divider"></div>`;
        };

        if (!q) {
            // Sem query: mostrar tudo organizado
            renderGroup('Ferramentas', tools);
            if (notes.length) renderGroup('Notas Recentes', notes.slice(0, 3));
            if (tasks.length) renderGroup('Tarefas Ativas', tasks.slice(0, 3));
            renderGroup('Ações', actions);
        } else {
            // Com query: agrupar apenas os que têm resultado
            if (tools.length)   renderGroup('Ferramentas', tools);
            if (notes.length)   renderGroup('Notas', notes.slice(0, 5));
            if (tasks.length)   renderGroup('Tarefas', tasks.slice(0, 5));
            if (actions.length) renderGroup('Ações', actions);
        }

        results.innerHTML = html;

        this._scrollToSelected();
    },

    // ──────────────────────────────────────────────────────
    // NAVEGAÇÃO POR TECLADO
    // ──────────────────────────────────────────────────────

    _moveSelection(delta) {
        const total = this.currentItems.length;
        if (!total) return;
        this.selectedIndex = (this.selectedIndex + delta + total) % total;
        this._updateSelection();
        this._scrollToSelected();
    },

    _updateSelection() {
        document.querySelectorAll('.cmd-item').forEach(el => {
            const isSelected = parseInt(el.dataset.idx, 10) === this.selectedIndex;
            el.classList.toggle('selected', isSelected);
            el.setAttribute('aria-selected', isSelected);
        });
    },

    _scrollToSelected() {
        const selected = document.querySelector('.cmd-item.selected');
        if (selected) {
            selected.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    },

    // ──────────────────────────────────────────────────────
    // EXECUTAR
    // ──────────────────────────────────────────────────────

    _executeSelected() {
        const item = this.currentItems[this.selectedIndex];
        if (item?.action) item.action();
    },
};

// ─── INTEGRAÇÃO COM KEYBOARD SHORTCUTS ───────────────────
if (window.KeyboardShortcuts) {
    KeyboardShortcuts.shortcuts['ctrl+p'] = {
        action: 'openCommandPalette',
        name:   'Command Palette'
    };

    const _origExec = KeyboardShortcuts.executeShortcut.bind(KeyboardShortcuts);
    KeyboardShortcuts.executeShortcut = function(shortcut) {
        if (shortcut.action === 'openCommandPalette') {
            CommandPalette.toggle();
            return;
        }
        _origExec(shortcut);
    };
}

// ─── EXPORT ──────────────────────────────────────────────
window.CommandPalette = CommandPalette;