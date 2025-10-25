// ToolBox - Aplicação Principal
// Inicialização e gerenciamento global

// Estado Global da Aplicação
const App = {
    version: '1.0.0',
    user: null,
    currentTool: 'home',
    isOnline: navigator.onLine,
    
    // Configuração de Ferramentas
    tools: [
        { id: 'home', name: 'Início', icon: '🏠', description: 'Página inicial' },
        { id: 'password', name: 'Gerador de Senhas', icon: '🔑', description: 'Crie senhas seguras' },
        { id: 'weather', name: 'Clima', icon: '🌤️', description: 'Veja a temperatura local' },
        { id: 'translator', name: 'Tradutor', icon: '🌐', description: 'Traduza textos rapidamente' },
        { id: 'ai-assistant', name: 'Assistente IA', icon: '🤖', description: 'Perguntas e respostas' },
        { id: 'mini-game', name: 'Mini Game', icon: '🎮', description: 'Jogue e se divirta' },
        { id: 'temp-email', name: 'Email Temporário', icon: '📧', description: 'Emails descartáveis' },
        { id: 'music', name: 'Player de Música', icon: '🎵', description: 'Ouça suas músicas' },
        { id: 'offline', name: 'Zona Offline', icon: '📶', description: 'Jogos sem internet' }
    ],
    
    // Inicializar aplicação
    init() {
        console.log('🧰 ToolBox v' + this.version + ' iniciando...');
        
        // Simular loading
        setTimeout(() => {
            this.hideLoading();
            this.checkAuth();
        }, 2500);
        
        // Listeners globais
        this.setupGlobalListeners();
    },
    
    // Esconder tela de loading
    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    },
    
    // Verificar autenticação
    checkAuth() {
        const savedUser = Auth.getStoredUser();
        if (savedUser) {
            this.user = savedUser;
            this.showMainApp();
        } else {
            this.showLogin();
        }
    },
    
    // Mostrar tela de login
    showLogin() {
        document.getElementById('login-screen').classList.remove('hidden');
    },
    
    // Mostrar aplicação principal
    showMainApp() {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        document.getElementById('user-display').textContent = this.user.username;
        
        // Renderizar menu de navegação
        this.renderNavMenu();
        
        // Carregar ferramenta inicial
        Router.navigate('home');
    },
    
    // Renderizar menu de navegação
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
    
    // Atualizar ferramenta ativa no menu
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
    
    // Setup de listeners globais
    setupGlobalListeners() {
        // Logout
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            if (confirm('Deseja realmente sair?')) {
                Auth.logout();
                location.reload();
            }
        });
        
        // Detectar status online/offline
        window.addEventListener('online', () => {
            this.isOnline = true;
            Utils.showNotification('✅ Conexão restaurada!', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            Utils.showNotification('⚠️ Você está offline', 'warning');
        });
    },
    
    // Obter ferramenta por ID
    getTool(toolId) {
        return this.tools.find(t => t.id === toolId);
    }
};

// Easter Egg da "investigação policial"
function showEasterEgg() {
    const messages = [
        "⚠️ AVISO IMPORTANTE ⚠️",
        "",
        "Em caso de investigação policial, eu declaro que não tenho envolvimento com este grupo e não sei como estou no mesmo, provavelmente fui inserido por terceiros, declaro que estou disposto a colaborar com as investigações e estou disposto a me apresentar a depoimento se necessário.",
        "",
        "Vc Foi Mogado, Sobra nada pro beta --- Use o ToolBox com responsabilidade!"
    ];
    
    alert(messages.join('\n'));
    
    // Efeito shake no sidebar
    document.getElementById('sidebar').classList.add('shake');
    setTimeout(() => {
        document.getElementById('sidebar').classList.remove('shake');
    }, 500);
}

// Inicializar aplicação quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Exportar para uso global
window.App = App;