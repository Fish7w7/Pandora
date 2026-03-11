/* ══════════════════════════════════════════════════
   APP.JS  v3.2.0
   Core da Aplicação com Dashboard e Tracking
 ═══════════════════════════════════════════════════*/

const App = {
    version: '3.2.0', 
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
        const userAvatar = document.getElementById('user-avatar');
        
        if (loginScreen) loginScreen.classList.add('hidden');
        if (mainApp) mainApp.classList.add('visible');
        if (userDisplay) userDisplay.textContent = user.username;
        if (userAvatar) userAvatar.textContent = user.username.charAt(0).toUpperCase();
        
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

        // Usar sempre a versão anterior do changelog como referência,
        // evitando exibir versões intermediárias antigas salvas no localStorage
        const changelog = window.AutoUpdater?.changelog ?? [];
        const currentIdx = changelog.findIndex(r => r.version === toVersion);
        const previousEntry = currentIdx !== -1 ? changelog[currentIdx + 1] : null;
        const displayFrom = previousEntry?.version ?? fromVersion;

        // Preencher versão
        const versionEl = modal.querySelector('[data-whats-new-version]');
        if (versionEl) versionEl.textContent = `v${toVersion}`;

        const fromEl = modal.querySelector('[data-whats-new-from]');
        if (fromEl) fromEl.textContent = `v${displayFrom}`;

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

        // ── Modo Foco ────────────────────────────────────────
        if (window.FocusMode) {
            console.log('🎯 Inicializando Modo Foco...');
            FocusMode.init();
        } else {
            console.warn('⚠️ FocusMode não encontrado');
        }

        // ── Command Palette ──────────────────────────────────
        if (window.CommandPalette) {
            console.log('🔍 Inicializando Command Palette...');
            CommandPalette.init();
        } else {
            console.warn('⚠️ CommandPalette não encontrado');
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

        // Grupos de ferramentas
        const groups = [
            {
                label: null,
                items: ['home']
            },
            {
                label: 'Ferramentas',
                items: ['password', 'weather', 'translator', 'ai-assistant', 'temp-email']
            },
            {
                label: 'Entretenimento',
                items: ['mini-game', 'music', 'offline']
            },
            {
                label: 'Organização',
                items: ['notes', 'tasks']
            },
            {
                label: 'Sistema',
                items: ['settings']
            }
        ];

        const toolMap = Object.fromEntries(this.tools.map(t => [t.id, t]));

        navMenu.innerHTML = groups.map(group => {
            const items = group.items.map(id => {
                const tool = toolMap[id];
                if (!tool) return '';
                const isActive = this.currentTool === tool.id;
                const badge = hasUpdate && tool.id === 'settings'
                    ? `<span class="nav-update-dot" title="Atualização disponível"></span>`
                    : '';
                return `
                    <button class="nav-item ${isActive ? 'active' : ''}"
                            data-tool="${tool.id}"
                            onclick="Router.navigate('${tool.id}')"
                            title="${tool.description}">
                        <span class="nav-icon">${tool.icon}</span>
                        <span class="nav-label">${tool.name}</span>
                        ${badge}
                    </button>
                `;
            }).join('');

            const groupLabel = group.label
                ? `<div class="nav-group-label">${group.label}</div>`
                : '';

            return `<div class="nav-group">${groupLabel}${items}</div>`;
        }).join('');
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

        // Easter Egg — 5 cliques no logo da sidebar
        this._eggClicks = 0;
        this._eggTimeout = null;
        document.addEventListener('click', (e) => {
            const logo = e.target.closest('.sidebar-logo');
            if (!logo) return;

            clearTimeout(this._eggTimeout);
            this._eggClicks++;

            // Feedback visual a cada clique
            const icon = logo.querySelector('.sidebar-logo-icon');
            if (icon) {
                icon.style.transition = 'transform 0.15s cubic-bezier(0.34,1.56,0.64,1)';
                icon.style.transform = `rotate(${(this._eggClicks % 2 === 0 ? -1 : 1) * 15}deg) scale(1.2)`;
                setTimeout(() => { icon.style.transform = ''; }, 200);
            }

            if (this._eggClicks >= 5) {
                this._eggClicks = 0;
                showEasterEgg();
                return;
            }

            // Reset após 2.5s sem clique
            this._eggTimeout = setTimeout(() => {
                this._eggClicks = 0;
                if (icon) icon.style.transform = '';
            }, 2500);
        });
    },
    
    // Handler de logout
    handleLogout() {
        document.getElementById('logout-confirm-modal')?.remove();

        const modal = document.createElement('div');
        modal.id = 'logout-confirm-modal';
        modal.style.cssText = `
            position:fixed; inset:0; z-index:99999;
            display:flex; align-items:center; justify-content:center;
            background:rgba(0,0,0,0.65);
            animation:lcFadeIn 0.2s ease;
        `;
        modal.innerHTML = `
            <style>
                @keyframes lcFadeIn  { from{opacity:0} to{opacity:1} }
                @keyframes lcSlideUp { from{opacity:0;transform:translateY(20px) scale(0.97)} to{opacity:1;transform:none} }
                #lc-card { animation:lcSlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1); }
                #lc-cancel:hover  { background:rgba(255,255,255,0.1) !important; color:white !important; }
                #lc-confirm:hover { background:rgba(239,68,68,1) !important; }
            </style>
            <div id="lc-card" style="
                background:#0e0e16; border:1px solid rgba(255,255,255,0.09);
                border-radius:16px; padding:1.75rem;
                width:100%; max-width:320px; margin:0 1rem;
                box-shadow:0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05);
                font-family:'DM Sans',sans-serif;
            ">
                <div style="
                    width:48px; height:48px; border-radius:14px;
                    background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.2);
                    display:flex; align-items:center; justify-content:center;
                    font-size:1.4rem; margin-bottom:1rem;">🚪</div>
                <div style="font-size:1rem; font-weight:800; color:white; margin-bottom:0.375rem; font-family:'Syne',sans-serif;">
                    Sair da conta?</div>
                <div style="font-size:0.8rem; color:rgba(255,255,255,0.4); line-height:1.5; margin-bottom:1.5rem;">
                    Você será redirecionado para a tela de login. にゃん~</div>
                <div style="display:flex; gap:0.625rem;">
                    <button id="lc-cancel" style="
                        flex:1; padding:0.6rem; border-radius:10px;
                        background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);
                        color:rgba(255,255,255,0.6); font-size:0.875rem; font-weight:600;
                        cursor:pointer; font-family:'DM Sans',sans-serif;">Cancelar</button>
                    <button id="lc-confirm" style="
                        flex:1; padding:0.6rem; border-radius:10px;
                        background:rgba(239,68,68,0.85); border:1px solid rgba(239,68,68,0.4);
                        color:white; font-size:0.875rem; font-weight:700;
                        cursor:pointer; font-family:'DM Sans',sans-serif;
                        box-shadow:0 4px 16px rgba(239,68,68,0.3);">Sair</button>
                </div>
            </div>
        `;

        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        modal.querySelector('#lc-cancel').addEventListener('click', () => modal.remove());
        modal.querySelector('#lc-confirm').addEventListener('click', () => {
            modal.remove();
            this._doLogout();
        });

        document.body.appendChild(modal);
    },

    _doLogout() {
        console.log('🚪 Fazendo logout...');

        if (this._activityInterval) {
            clearInterval(this._activityInterval);
            this._activityInterval = null;
        }

        if (window.FocusMode?.active) FocusMode.disable();

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

// Easter Egg — ativado por 5 cliques no logo 🐱
function showEasterEgg() {
    // Remover modal anterior se existir
    document.getElementById('easter-egg-modal')?.remove();

    const modal = document.createElement('div');
    modal.id = 'easter-egg-modal';
    modal.style.cssText = `
        position: fixed; inset: 0; z-index: 99999;
        display: flex; align-items: center; justify-content: center;
        background: rgba(0,0,0,0.85);
        animation: eggFadeIn 0.3s ease;
    `;

    modal.innerHTML = `
        <style>
            @keyframes eggFadeIn { from { opacity:0 } to { opacity:1 } }
            @keyframes eggBounce { 0%,100% { transform:translateY(0) rotate(0deg) } 25% { transform:translateY(-12px) rotate(-8deg) } 75% { transform:translateY(-6px) rotate(8deg) } }
            @keyframes eggSlideUp { from { opacity:0; transform:translateY(40px) scale(0.9) } to { opacity:1; transform:translateY(0) scale(1) } }
            #egg-card { animation: eggSlideUp 0.4s cubic-bezier(0.34,1.56,0.64,1); }
            #egg-cat  { animation: eggBounce 1.2s ease-in-out infinite; display:inline-block; }
        </style>

        <div id="egg-card" style="
            background: #0d0d12;
            border: 1px solid rgba(168,85,247,0.3);
            border-radius: 20px;
            padding: 2rem 2.25rem;
            max-width: 420px;
            width: 90%;
            box-shadow: 0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(168,85,247,0.1), 0 0 60px rgba(168,85,247,0.1);
            font-family: 'DM Sans', sans-serif;
            color: #e5e7eb;
            position: relative;
        ">
            <!-- Fechar -->
            <button onclick="document.getElementById('easter-egg-modal').remove()" style="
                position:absolute; top:1rem; right:1rem;
                background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);
                color:rgba(255,255,255,0.4); border-radius:8px; width:28px; height:28px;
                cursor:pointer; font-size:14px; display:flex; align-items:center; justify-content:center;
                transition:all 0.2s;
            " onmouseover="this.style.color='white';this.style.background='rgba(255,255,255,0.12)'"
               onmouseout="this.style.color='rgba(255,255,255,0.4)';this.style.background='rgba(255,255,255,0.06)'">✕</button>

            <!-- Header -->
            <div style="text-align:center; margin-bottom:1.5rem;">
                <div id="egg-cat" style="font-size:3.5rem; margin-bottom:0.75rem;">🐱</div>
                <div style="
                    font-family:'Syne',sans-serif; font-size:1.4rem; font-weight:900;
                    background:linear-gradient(135deg,#a855f7,#ec4899);
                    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
                    background-clip:text; margin-bottom:0.25rem;
                ">NYAN NYAN!</div>
                <div style="font-size:0.75rem; color:rgba(255,255,255,0.3); letter-spacing:0.1em;">にゃん~ · Easter Egg Desbloqueado</div>
            </div>

            <!-- Divider -->
            <div style="height:1px; background:rgba(255,255,255,0.07); margin-bottom:1.25rem;"></div>

            <!-- Mensagem principal -->
            <div style="text-align:center; margin-bottom:1.25rem;">
                <p style="font-size:0.875rem; color:rgba(255,255,255,0.7); line-height:1.6; margin-bottom:0.5rem;">
                    Bem-vindo ao <strong style="color:white;">NyanTools</strong>!<br>
                    Sua caixa de ferramentas kawaii 🎌
                </p>
            </div>

            <!-- Card do aviso importante -->
            <div style="
                background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2);
                border-left:3px solid #ef4444; border-radius:10px;
                padding:0.875rem 1rem; margin-bottom:1.25rem;
            ">
                <div style="font-size:0.7rem; font-weight:800; letter-spacing:0.1em; text-transform:uppercase; color:#ef4444; margin-bottom:0.5rem;">
                    ⚠️ Aviso Importante
                </div>
                <p style="font-size:0.75rem; color:rgba(255,255,255,0.55); line-height:1.6; margin:0;">
                    Em caso de investigação policial, eu declaro que não tenho envolvimento com este grupo 
                    e não sei como estou no mesmo, provavelmente fui inserido por terceiros. 
                    Declaro estar disposto a colaborar com as investigações e a me apresentar a depoimento se necessário.
                </p>
            </div>

            <!-- Footer -->
            <div style="text-align:center;">
                <p style="font-size:0.7rem; color:rgba(255,255,255,0.25); margin-bottom:1rem;">
                    Use o NyanTools com responsabilidade! にゃん~ 🐱✨
                </p>
                <button onclick="document.getElementById('easter-egg-modal').remove()" style="
                    background:linear-gradient(135deg,#a855f7,#ec4899);
                    border:none; border-radius:10px; color:white;
                    padding:0.6rem 1.75rem; font-size:0.875rem; font-weight:700;
                    cursor:pointer; font-family:'DM Sans',sans-serif;
                    box-shadow:0 4px 20px rgba(168,85,247,0.4);
                    transition:all 0.2s;
                " onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 28px rgba(168,85,247,0.55)'"
                   onmouseout="this.style.transform='';this.style.boxShadow='0 4px 20px rgba(168,85,247,0.4)'">
                    Entendido にゃん~
                </button>
            </div>
        </div>
    `;

    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    document.body.appendChild(modal);

    // Chacoalhar a sidebar
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.style.transition = 'transform 0.1s ease';
        let i = 0;
        const shake = setInterval(() => {
            sidebar.style.transform = `translateX(${i % 2 === 0 ? 6 : -6}px)`;
            if (++i > 6) { clearInterval(shake); sidebar.style.transform = ''; }
        }, 60);
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => App.init());

// Exports
window.App = App;
window.showEasterEgg = showEasterEgg;