// Sistema de Atalhos de Teclado にゃん~ - v3.0.0 - Phoenix Update
const KeyboardShortcuts = {
    shortcuts: {
        // Mapeamento de atalhos para IDs do router antigo
        'ctrl+1': { tool: 'home', name: 'Dashboard' },
        'ctrl+2': { tool: 'password', name: 'Gerador de Senhas' },
        'ctrl+3': { tool: 'weather', name: 'Clima' },
        'ctrl+4': { tool: 'translator', name: 'Tradutor' },
        'ctrl+5': { tool: 'ai-assistant', name: 'Assistente IA' },
        'ctrl+6': { tool: 'mini-game', name: 'Mini Game' },
        'ctrl+7': { tool: 'temp-email', name: 'Email Temporário' },
        'ctrl+8': { tool: 'music', name: 'Player de Música' },
        'ctrl+9': { tool: 'offline', name: 'Zona Offline' },
        'ctrl+0': { tool: 'notes', name: 'Notas Rápidas' },
        'ctrl+t': { tool: 'tasks', name: 'Tarefas' },
        'ctrl+s': { tool: 'settings', name: 'Configurações' },
        'ctrl+/': { action: 'showHelp', name: 'Mostrar Atalhos' },
        'escape': { action: 'closeModals', name: 'Fechar Modais' }
    },
    
    isModalOpen: false,
    
    init() {
        console.log('⌨️ Inicializando Atalhos de Teclado v3.0.2...');
        this.setupListeners();
        console.log('✅ Atalhos ativados! Pressione Ctrl+/ para ver todos.');
    },
    
    setupListeners() {
        document.addEventListener('keydown', (e) => {
            // Ignorar se estiver digitando em input/textarea
            if (this.isTyping(e.target)) return;
            
            const key = this.getKeyCombo(e);
            const shortcut = this.shortcuts[key];
            
            if (shortcut) {
                e.preventDefault();
                e.stopPropagation();
                this.executeShortcut(shortcut);
            }
        });
    },
    
    isTyping(element) {
        return element.tagName === 'INPUT' || 
               element.tagName === 'TEXTAREA' || 
               element.contentEditable === 'true';
    },
    
    getKeyCombo(e) {
        const parts = [];
        
        if (e.ctrlKey || e.metaKey) parts.push('ctrl');
        if (e.shiftKey) parts.push('shift');
        if (e.altKey) parts.push('alt');
        
        const key = e.key.toLowerCase();
        if (key !== 'control' && key !== 'shift' && key !== 'alt' && key !== 'meta') {
            parts.push(key);
        }
        
        return parts.join('+');
    },
    
    executeShortcut(shortcut) {
        if (shortcut.tool) {
            this.navigateToTool(shortcut.tool, shortcut.name);
        } else if (shortcut.action === 'showHelp') {
            this.showHelpModal();
        } else if (shortcut.action === 'closeModals') {
            this.closeAllModals();
        }
    },
    
    navigateToTool(toolId, toolName) {
        // Usar o Router global
        if (window.Router && typeof Router.navigate === 'function') {
            Router.navigate(toolId);
            
            // Feedback visual
            this.showFlash(toolName);
            
            console.log(`⚡ Navegando para: ${toolName}`);
        } else {
            console.error('❌ Router não está disponível');
        }
    },
    
    showFlash(toolName) {
        const flash = document.createElement('div');
        flash.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl shadow-2xl font-bold z-50 animate-flash';
        flash.innerHTML = `
            <div class="flex items-center gap-2">
                <span>⚡</span>
                <span>${toolName}</span>
            </div>
        `;
        
        document.body.appendChild(flash);
        
        setTimeout(() => {
            flash.remove();
        }, 1500);
    },
    
    showHelpModal() {
        if (this.isModalOpen) return;
        
        const modal = document.createElement('div');
        modal.id = 'shortcuts-modal';
        modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn';
        modal.onclick = (e) => {
            if (e.target === modal) this.closeHelpModal();
        };
        
        modal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-slideUp">
                <div class="sticky top-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white p-6 rounded-t-2xl">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <span class="text-4xl">⌨️</span>
                            <h2 class="text-3xl font-black">Atalhos de Teclado</h2>
                        </div>
                        <button onclick="KeyboardShortcuts.closeHelpModal()" 
                                class="text-white/80 hover:text-white text-2xl font-bold transition-colors">
                            ✕
                        </button>
                    </div>
                    <p class="text-white/90 mt-2">Navegue mais rápido pelo NyanTools にゃん~</p>
                </div>
                
                <div class="p-6">
                    <div class="mb-6">
                        <h3 class="text-xl font-black text-gray-800 mb-3 flex items-center gap-2">
                            <span>🛠️</span>
                            <span>Ferramentas</span>
                        </h3>
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
                        <h3 class="text-xl font-black text-gray-800 mb-3 flex items-center gap-2">
                            <span>⚡</span>
                            <span>Ações Rápidas</span>
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            ${this.renderShortcutItem('Ctrl + T', 'Tarefas', '✅')}
                            ${this.renderShortcutItem('Ctrl + S', 'Configurações', '⚙️')}
                            ${this.renderShortcutItem('Ctrl + /', 'Mostrar Atalhos', '❓')}
                            ${this.renderShortcutItem('Esc', 'Fechar Modais', '❌')}
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
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                <div class="flex items-center gap-2">
                    <span class="text-xl">${icon}</span>
                    <span class="font-semibold text-gray-700">${description}</span>
                </div>
                <kbd class="px-3 py-1 bg-white rounded-lg border-2 border-gray-300 text-sm font-bold text-gray-700 shadow-sm">
                    ${keys}
                </kbd>
            </div>
        `;
    },
    
    closeHelpModal() {
        const modal = document.getElementById('shortcuts-modal');
        if (modal) {
            modal.remove();
            this.isModalOpen = false;
        }
    },
    
    closeAllModals() {
        this.closeHelpModal();
        
        // Fechar outros modais se existirem
        const modals = document.querySelectorAll('[id$="-modal"]');
        modals.forEach(modal => modal.remove());
    }
};

// CSS adicional para animações
const style = document.createElement('style');
style.textContent = `
    @keyframes flash {
        0%, 100% { opacity: 0; transform: translate(-50%, -20px); }
        10%, 90% { opacity: 1; transform: translate(-50%, 0); }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideUp {
        from { opacity: 0; transform: translateY(50px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .animate-flash {
        animation: flash 1.5s ease-in-out;
    }
    
    .animate-fadeIn {
        animation: fadeIn 0.3s ease-out;
    }
    
    .animate-slideUp {
        animation: slideUp 0.3s ease-out;
    }
    
    kbd {
        font-family: monospace;
    }
`;
document.head.appendChild(style);

window.KeyboardShortcuts = KeyboardShortcuts;