const App = {
    version: '2.3.2',
    user: null,
    currentTool: 'home',
    isOnline: navigator.onLine,
    
    tools: [
        { id: 'home', name: 'InÃ­cio', icon: 'ðŸ ', description: 'PÃ¡gina inicial' },
        { id: 'password', name: 'Gerador de Senhas', icon: 'ðŸ”‘', description: 'Crie senhas seguras' },
        { id: 'weather', name: 'Clima', icon: 'ðŸŒ¤ï¸', description: 'Veja a temperatura local' },
        { id: 'translator', name: 'Tradutor', icon: 'ðŸŒ', description: 'Traduza textos rapidamente' },
        { id: 'ai-assistant', name: 'Assistente IA', icon: 'ðŸ¤–', description: 'Perguntas e respostas' },
        { id: 'mini-game', name: 'Mini Game', icon: 'ðŸŽ®', description: 'Jogue e se divirta' },
        { id: 'temp-email', name: 'Email TemporÃ¡rio', icon: 'ðŸ“§', description: 'Emails descartÃ¡veis' },
        { id: 'music', name: 'Player de MÃºsica', icon: 'ðŸŽµ', description: 'OuÃ§a suas mÃºsicas' },
        { id: 'offline', name: 'Zona Offline', icon: 'ðŸ“¶', description: 'Jogos sem internet' },
        { id: 'settings', name: 'ConfiguraÃ§Ãµes', icon: 'âš™ï¸', description: 'Personalize o app' }
    ],
    
    init() {
        console.log('ðŸ± NyanTools v' + this.version + ' iniciando... ã«ã‚ƒã‚“~');
        
        // ðŸ”§ FIX BUG 1: Aplicar tema salvo ANTES de mostrar o app
        this.applyThemeOnStart();
        
        setTimeout(() => {
            this.hideLoading();
            this.checkAuth();
            
            if (typeof AutoUpdater !== 'undefined' && AutoUpdater.getAutoCheckSetting()) {
                setTimeout(() => {
                    AutoUpdater.checkForUpdates(true);
                }, 3000);
            }
        }, 2500);
        
        this.setupGlobalListeners();
    },
    
   applyThemeOnStart() {
    // Aplicar tema mÃºltiplas vezes para garantir
    const applyTheme = () => {
        const savedTheme = Utils.loadData('app_theme') || 'light';
        console.log('ðŸŽ¨ Aplicando tema:', savedTheme);
        
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            console.log('âœ… Tema escuro aplicado');
        } else {
            document.body.classList.remove('dark-theme');
            console.log('âœ… Tema claro aplicado');
        }
        
        // Garantir que o valor estÃ¡ salvo
        Utils.saveData('app_theme', savedTheme);
    };
    
    // Aplicar AGORA
    applyTheme();
    
    // Aplicar novamente apÃ³s 100ms (garantia)
    setTimeout(applyTheme, 100);
    
    // Aplicar quando a janela carregar completamente
    window.addEventListener('load', applyTheme);
},
    
    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    },
    
    checkAuth() {
        const savedUser = Auth.getStoredUser();
        if (savedUser) {
            this.user = savedUser;
            this.showMainApp();
        } else {
            this.showLogin();
        }
    },
    
    showLogin() {
        document.getElementById('login-screen').classList.remove('hidden');
        // ðŸ”§ FIX BUG 3: Focar no input de username apÃ³s mostrar o login
        setTimeout(() => {
            const usernameInput = document.getElementById('login-username');
            if (usernameInput) {
                usernameInput.focus();
                console.log('âœ… Foco no input de username');
            }
        }, 300);
    },
    
    showMainApp() {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        document.getElementById('user-display').textContent = this.user.username;
        
        this.renderNavMenu();
        Router.navigate('home');
    },
    
    renderNavMenu() {
        const navMenu = document.getElementById('nav-menu');
        navMenu.innerHTML = this.tools.map(tool => `
            <div class="nav-item flex items-center p-3 mb-2 rounded-lg cursor-pointer ${this.currentTool === tool.id ? 'active' : ''}"
                 data-tool="${tool.id}"
                 onclick="Router.navigate('${tool.id}')">
                <span class="text-2xl mr-3">${tool.icon}</span>
                <div class="flex-1">
                    <span class="font-medium block">${tool.name}</span>
                    <span class="text-xs text-white/70">${tool.description}</span>
                </div>
            </div>
        `).join('');
    },
    
    updateActiveNav(toolId) {
        this.currentTool = toolId;
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.dataset.tool === toolId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    },
    
    setupGlobalListeners() {
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            if (confirm('Deseja realmente sair? ã«ã‚ƒã‚“~')) {
                Auth.logout();
                
                // ðŸ”§ FIX BUG 3: Recarregar a pÃ¡gina de forma limpa
                console.log('ðŸšª Fazendo logout e limpando estado...');
                
                // Limpar formulÃ¡rio antes de recarregar
                const loginForm = document.getElementById('login-form');
                if (loginForm) loginForm.reset();
                
                // Recarregar pÃ¡gina
                location.reload();
            }
        });
        
        window.addEventListener('online', () => {
            this.isOnline = true;
            Utils.showNotification('âœ… ConexÃ£o restaurada! ã«ã‚ƒã‚“~', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            Utils.showNotification('âš ï¸ VocÃª estÃ¡ offline ã«ã‚ƒã‚“~', 'warning');
        });
    },
    
    getTool(toolId) {
        return this.tools.find(t => t.id === toolId);
    }
};

function showEasterEgg() {
    const messages = [
        "ðŸ± NYAN NYAN! ã«ã‚ƒã‚“~",
        "",
        "Bem-vindo ao NyanTools!",
        "Sua caixa de ferramentas kawaii ðŸŽŒ",
        "",
        "âš ï¸ AVISO IMPORTANTE âš ï¸",
        "Em caso de investigaÃ§Ã£o policial, eu declaro que nÃ£o tenho envolvimento com este grupo e nÃ£o sei como estou no mesmo, provavelmente fui inserido por terceiros, declaro que estou disposto a colaborar com as investigaÃ§Ãµes e estou disposto a me apresentar a depoimento se necessÃ¡rio.",
        "",
        "Use o NyanTools com responsabilidade! ã«ã‚ƒã‚“~ ðŸ±âœ¨"
    ];
    
    alert(messages.join('\n'));
    
    document.getElementById('sidebar').classList.add('shake');
    setTimeout(() => {
        document.getElementById('sidebar').classList.remove('shake');
    }, 500);
}

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

window.App = App;