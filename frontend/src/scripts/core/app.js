const App = {
    version: '2.0.2',
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
        { id: 'updates', name: 'Atualizações', icon: '🔄', description: 'Verificar atualizações' }
    ],
    
    init() {
        console.log('🐱 NyanTools v' + this.version + ' iniciando... にゃん~');
        
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
                ${tool.id === 'updates' && typeof AutoUpdater !== 'undefined' && AutoUpdater.updateAvailable ? 
                    '<span class="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">NEW</span>' 
                    : ''}
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