/* ══════════════════════════════════════════════════
   APP.JS  v3.0.0
   Core da Aplicação com Dashboard e Tracking
 ═══════════════════════════════════════════════════*/

const App = {
    version: '3.1.2', 
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
        
        this.applyThemeOnStart();
        
        setTimeout(() => {
            this.hideLoading();
            this.checkAuth();
            
            if (window.AutoUpdater?.getAutoCheckSetting?.()) {
                setTimeout(() => AutoUpdater.checkForUpdates(true), 3000);
            }
        }, 2500);
        
        this.setupGlobalListeners();
    },
    
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
    
    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (!loadingScreen) return;
        
        loadingScreen.style.opacity = '0';
        setTimeout(() => loadingScreen.style.display = 'none', 500);
    },
    
    checkAuth() {
        const savedUser = Auth.getStoredUser();
        savedUser ? this.showMainApp(savedUser) : this.showLogin();
    },
    
    showLogin() {
        const loginScreen = document.getElementById('login-screen');
        if (!loginScreen) return;
        
        loginScreen.classList.remove('hidden');
        
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
        if (mainApp) mainApp.classList.add('visible');
        if (userDisplay) userDisplay.textContent = user.username;
        
        this.renderNavMenu();
        Router.navigate('home');
        this.initNewSystems();
        this.checkWhatsNew();
    },
    
    // Verificar se a versão mudou e mostrar "O que há de novo"
    checkWhatsNew() {
        const lastSeenVersion = Utils.loadData('last_seen_version');
        const currentVersion  = this.version;

        if (lastSeenVersion && lastSeenVersion !== currentVersion) {
            setTimeout(() => this._showWhatsNewModal(lastSeenVersion, currentVersion), 1200);
        }

        // Sempre atualizar a versão vista
        Utils.saveData('last_seen_version', currentVersion);
    },

    _showWhatsNewModal(fromVersion, toVersion) {
        const modal = document.getElementById('whats-new-modal');
        if (!modal) return;

        // Preencher versão
        const versionEl = modal.querySelector('[data-whats-new-version]');
        if (versionEl) versionEl.textContent = `v${toVersion}`;

        const fromEl = modal.querySelector('[data-whats-new-from]');
        if (fromEl) fromEl.textContent = `v${fromVersion}`;

        const listEl = modal.querySelector('[data-whats-new-list]');
        if (listEl && window.AutoUpdater) {
            const release = AutoUpdater.changelog.find(r => r.version === toVersion);
            if (release) {
                listEl.innerHTML = release.changes.map(c => `
                    <div class="flex items-start gap-2.5 py-2" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <span class="shrink-0 mt-0.5 text-base leading-none">${c.type}</span>
                        <span class="text-sm text-gray-300 leading-snug">${c.text}</span>
                    </div>
                `).join('');
            }
        }

        modal.classList.remove('hidden');
        modal.querySelector('[data-whats-new-card]')?.classList.add('whats-new-enter');
    },

    initNewSystems() {
        if (window.Dashboard) {
            console.log('📊 Inicializando Dashboard...');
            Dashboard.init();
        } else {
            console.warn('⚠️ Dashboard não encontrado');
        }
        
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
        
        // Limpar intervalo anterior se existir
        if (this._activityInterval) {
            clearInterval(this._activityInterval);
        }
        
        // Atualizar a cada minuto
        this._activityInterval = setInterval(() => {
            if (window.Dashboard) {
                const today = new Date().toISOString().split('T')[0];
                const dayOfWeek = new Date().getDay();
                
                Dashboard.stats.totalTime++;
                Dashboard.stats.weeklyActivity[dayOfWeek] = 
                    (Dashboard.stats.weeklyActivity[dayOfWeek] || 0) + 1;

                if (!Dashboard.stats.dailyActivity) Dashboard.stats.dailyActivity = {};
                Dashboard.stats.dailyActivity[today] =
                    (Dashboard.stats.dailyActivity[today] || 0) + 1;
                
                if (Dashboard.stats.totalTime % 5 === 0) {
                    Dashboard.saveStats();
                    console.log('💾 Stats salvas:', Dashboard.stats.totalTime, 'minutos');
                }

                if (Router.currentRoute === 'home' && Dashboard.refreshWeeklyChart) {
                    Dashboard.refreshWeeklyChart();
                }
            }
        }, 60000); // 1 minuto
    },
    
    // Renderizar menu de navegação
    renderNavMenu() {
        const navMenu = document.getElementById('nav-menu');
        if (!navMenu) return;
        
        const hasUpdate = window.AutoUpdater?.updateAvailable;
        navMenu.innerHTML = this.tools.map(tool => `
            <div class="nav-item flex items-center p-3 mb-2 rounded-lg cursor-pointer ${this.currentTool === tool.id ? 'active' : ''}"
                 data-tool="${tool.id}"
                 onclick="Router.navigate('${tool.id}')">
                <span class="text-2xl mr-3">${tool.icon}</span>
                <div class="flex-1">
                    <span class="font-medium block">${tool.name}</span>
                    <span class="text-xs text-white/70">${tool.description}</span>
                </div>
                ${hasUpdate && tool.id === 'settings' ? '<span class="nav-update-badge" title="Atualização disponível"></span>' : ''}
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
    
    // Listeners globais
    setupGlobalListeners() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
        
        // Status de conexão
        window.addEventListener('online', () => this.handleConnectionChange(true));
        window.addEventListener('offline', () => this.handleConnectionChange(false));
    },
    
    // Handler de logout
    handleLogout() {
        if (!confirm('Deseja realmente sair? にゃん~')) return;
        
        console.log('🚪 Fazendo logout...');
        
        // Parar tracking antes de tudo
        if (this._activityInterval) {
            clearInterval(this._activityInterval);
            this._activityInterval = null;
        }
        
        // Limpar estado do app
        this.user = null;
        this.currentTool = 'home';
        
        Auth.logout();
        
        const loginForm = document.getElementById('login-form');
        if (loginForm) loginForm.reset();
        
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

// Easter Egg (Tem que arrumar depois, pq tá bugado)
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