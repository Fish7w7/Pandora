/* ========================================
   APP.JS  v3.0.0
   Core da Aplicação com Dashboard e Tracking
   ======================================== */

const App = {
    version: '3.0.0', 
    user: null,
    currentTool: 'home',
    isOnline: navigator.onLine,
    
    // Lista de ferramentas
    tools: [
        { id: 'home', name: 'Dashboard', icon: '📊', description: 'Visão geral' },
        { id: 'password', name: 'Gerador de Senhas', icon: '🔑', description: 'Crie senhas seguras' },
        { id: 'weather', name: 'Clima', icon: '🌤️', description: 'Veja a temperatura local' },
        { id: 'translator', name: 'Tradutor', icon: '🌍', description: 'Traduza textos rapidamente' },
        { id: 'ai-assistant', name: 'Assistente IA', icon: '🤖', description: 'Perguntas e respostas' },
        { id: 'mini-game', name: 'Mini Game', icon: '🎮', description: 'Jogue e se divirta' },
        { id: 'temp-email', name: 'Email Temporário', icon: '📧', description: 'Emails descartáveis' },
        { id: 'music', name: 'Player de Música', icon: '🎵', description: 'Ouça suas músicas' },
        { id: 'notes', name: 'Notas Rápidas', icon: '📝', description: 'Organize suas ideias' },
        { id: 'tasks', name: 'Lista de Tarefas', icon: '✅', description: 'Gerencie tarefas' },
        { id: 'offline', name: 'Zona Offline', icon: '📶', description: 'Jogos sem internet' },
        { id: 'settings', name: 'Configurações', icon: '⚙️', description: 'Personalize o app' }
    ],
    
    // Inicialização principal
    init() {
        console.log(`🐱 NyanTools v${this.version} iniciando... にゃん~`);
        
        // Aplicar tema antes de mostrar
        this.applyThemeOnStart();
        
        // Delay para loading screen
        setTimeout(() => {
            this.hideLoading();
            this.checkAuth();
            
            // Auto-update check (se habilitado)
            if (window.AutoUpdater?.getAutoCheckSetting?.()) {
                setTimeout(() => AutoUpdater.checkForUpdates(true), 3000);
            }
        }, 2500);
        
        // Listeners globais
        this.setupGlobalListeners();
    },
    
    // Aplicar tema ao iniciar (otimizado)
    applyThemeOnStart() {
        const applyTheme = () => {
            const savedTheme = window.Utils?.loadData('app_theme') || 'light';
            console.log('🎨 Aplicando tema:', savedTheme);
            
            document.body.classList.toggle('dark-theme', savedTheme === 'dark');
            
            if (window.Utils?.saveData) {
                window.Utils.saveData('app_theme', savedTheme);
            }
        };
        
        applyTheme();
        setTimeout(applyTheme, 100);
        window.addEventListener('load', applyTheme, { once: true });
    },
    
    // Esconder loading
    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (!loadingScreen) return;
        
        loadingScreen.style.opacity = '0';
        setTimeout(() => loadingScreen.style.display = 'none', 500);
    },
    
    // Verificar autenticação
    checkAuth() {
        const savedUser = Auth.getStoredUser();
        savedUser ? this.showMainApp(savedUser) : this.showLogin();
    },
    
    // Mostrar tela de login
    showLogin() {
        const loginScreen = document.getElementById('login-screen');
        if (!loginScreen) return;
        
        loginScreen.classList.remove('hidden');
        
        // Setup do formulário e foco
        setTimeout(() => {
            if (typeof window.setupLoginForm === 'function') {
                window.setupLoginForm();
                console.log('🔧 setupLoginForm() chamado');
            }
            
            const usernameInput = document.getElementById('login-username');
            if (usernameInput) {
                usernameInput.focus();
                console.log('✅ Foco no input de username');
            }
        }, 300);
    },
    
    // Mostrar app principal
    showMainApp(user = this.user) {
        this.user = user;
        
        const loginScreen = document.getElementById('login-screen');
        const mainApp = document.getElementById('main-app');
        const userDisplay = document.getElementById('user-display');
        
        if (loginScreen) loginScreen.classList.add('hidden');
        if (mainApp) mainApp.classList.remove('hidden');
        if (userDisplay) userDisplay.textContent = user.username;
        
        this.renderNavMenu();
        Router.navigate('home');       
        this.initNewSystems();
    },
    
    initNewSystems() {
        // Inicializar Dashboard
        if (window.Dashboard) {
            console.log('📊 Inicializando Dashboard...');
            Dashboard.init();
        } else {
            console.warn('⚠️ Dashboard não encontrado');
        }
        
        // Inicializar Atalhos de Teclado
        if (window.KeyboardShortcuts) {
            console.log('⌨️ Inicializando Atalhos de Teclado...');
            KeyboardShortcuts.init();
        } else {
            console.warn('⚠️ KeyboardShortcuts não encontrado');
        }
        
        // Iniciar tracking de atividade
        this.startActivityTracking();
    },
    
    startActivityTracking() {
        console.log('⏱️ Iniciando tracking de atividade...');
        
        // Atualizar a cada minuto
        setInterval(() => {
            if (window.Dashboard) {
                const today = new Date().toISOString().split('T')[0];
                const dayOfWeek = new Date().getDay();
                
                Dashboard.stats.totalTime++;
                Dashboard.stats.weeklyActivity[dayOfWeek] = 
                    (Dashboard.stats.weeklyActivity[dayOfWeek] || 0) + 1;
                
                // Salvar a cada 5 minutos
                if (Dashboard.stats.totalTime % 5 === 0) {
                    Dashboard.saveStats();
                    console.log('💾 Stats salvas:', Dashboard.stats.totalTime, 'minutos');
                }
            }
        }, 60000); // 1 minuto
    },
    
    // Renderizar menu de navegação (otimizado)
    renderNavMenu() {
        const navMenu = document.getElementById('nav-menu');
        if (!navMenu) return;
        
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
    
    // Atualizar navegação ativa
    updateActiveNav(toolId) {
        this.currentTool = toolId;
        
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.tool === toolId);
        });
    },
    
    // Listeners globais (otimizado)
    setupGlobalListeners() {
        // Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
        
        // Status de conexão
        window.addEventListener('online', () => this.handleConnectionChange(true));
        window.addEventListener('offline', () => this.handleConnectionChange(false));
    },
    
    // Handler de logout (otimizado)
    handleLogout() {
        if (!confirm('Deseja realmente sair? にゃん~')) return;
        
        console.log('🚪 Fazendo logout...');
        Auth.logout();
        
        // Limpar formulário
        const loginForm = document.getElementById('login-form');
        if (loginForm) loginForm.reset();
        
        // Recarregar página
        location.reload();
    },
    
    // Handler de mudança de conexão
    handleConnectionChange(isOnline) {
        this.isOnline = isOnline;
        
        if (window.Utils?.showNotification) {
            const message = isOnline 
                ? '✅ Conexão restaurada! にゃん~' 
                : '⚠️ Você está offline にゃん~';
            const type = isOnline ? 'success' : 'warning';
            
            window.Utils.showNotification(message, type);
        }
    },
    
    // Obter tool por ID
    getTool(toolId) {
        return this.tools.find(t => t.id === toolId);
    }
};

// Easter Egg (otimizado)
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
    
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.add('shake');
        setTimeout(() => sidebar.classList.remove('shake'), 500);
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => App.init());

// Exports
window.App = App;
window.showEasterEgg = showEasterEgg;