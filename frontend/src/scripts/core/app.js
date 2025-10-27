const App = {
    version: '2.3.2',
    user: null,
    currentTool: 'home',
    isOnline: navigator.onLine,
    
    tools: [
        { id: 'home', name: 'Início', icon: '🏠', description: 'Página inicial' },
        { id: 'password', name: 'Gerador de Senhas', icon: '🔑', description: 'Crie senhas seguras' },
        { id: 'weather', name: 'Clima', icon: '🌤️', description: 'Veja a temperatura local' },
        { id: 'translator', name: 'Tradutor', icon: '🌍', description: 'Traduza textos rapidamente' },
        { id: 'ai-assistant', name: 'Assistente IA', icon: '🤖', description: 'Perguntas e respostas' },
        { id: 'mini-game', name: 'Mini Game', icon: '🎮', description: 'Jogue e se divirta' },
        { id: 'temp-email', name: 'Email Temporário', icon: '📧', description: 'Emails descartáveis' },
        { id: 'music', name: 'Player de Música', icon: '🎵', description: 'Ouça suas músicas' },
        { id: 'offline', name: 'Zona Offline', icon: '📶', description: 'Jogos sem internet' },
        { id: 'settings', name: 'Configurações', icon: '⚙️', description: 'Personalize o app' }
    ],
    
    init() {
        console.log('🐱 NyanTools v' + this.version + ' iniciando... にゃん~');
        
        // 🔧 FIX BUG 1: Aplicar tema salvo ANTES de mostrar o app
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
        // Aplicar tema múltiplas vezes para garantir
        const applyTheme = () => {
            const savedTheme = Utils.loadData('app_theme') || 'light';
            console.log('🎨 Aplicando tema:', savedTheme);
            
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-theme');
                console.log('✅ Tema escuro aplicado');
            } else {
                document.body.classList.remove('dark-theme');
                console.log('✅ Tema claro aplicado');
            }
            
            // Garantir que o valor está salvo
            Utils.saveData('app_theme', savedTheme);
        };
        
        // Aplicar AGORA
        applyTheme();
        
        // Aplicar novamente após 100ms (garantia)
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
        
        // 🔧 FIX: Chamar setupLoginForm após mostrar a tela
        setTimeout(() => {
            if (typeof window.setupLoginForm === 'function') {
                window.setupLoginForm();
                console.log('🔧 setupLoginForm() chamado');
            } else {
                console.error('❌ setupLoginForm não encontrado!');
            }
            
            const usernameInput = document.getElementById('login-username');
            if (usernameInput) {
                usernameInput.focus();
                console.log('✅ Foco no input de username');
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
            if (confirm('Deseja realmente sair? にゃん~')) {
                Auth.logout();
                
                // 🔧 FIX: Recarregar a página de forma limpa
                console.log('🚪 Fazendo logout e limpando estado...');
                
                // Limpar formulário antes de recarregar
                const loginForm = document.getElementById('login-form');
                if (loginForm) loginForm.reset();
                
                // Recarregar página
                location.reload();
            }
        });
        
        window.addEventListener('online', () => {
            this.isOnline = true;
            Utils.showNotification('✅ Conexão restaurada! にゃん~', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            Utils.showNotification('⚠️ Você está offline にゃん~', 'warning');
        });
    },
    
    getTool(toolId) {
        return this.tools.find(t => t.id === toolId);
    }
};

function showEasterEgg() {
    const messages = [
        "🐱 NYAN NYAN! にゃん~",
        "",
        "Bem-vindo ao NyanTools!",
        "Sua caixa de ferramentas kawaii 🎌",
        "",
        "⚠️ AVISO IMPORTANTE ⚠️",
        "Em caso de investigação policial, eu declaro que não tenho envolvimento com este grupo e não sei como estou no mesmo, provavelmente fui inserido por terceiros, declaro que estou disposto a colaborar com as investigações e estou disposto a me apresentar a depoimento se necessário.",
        "",
        "Use o NyanTools com responsabilidade! にゃん~ 🐱✨"
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