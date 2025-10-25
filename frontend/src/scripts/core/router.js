// Sistema de Roteamento
const Router = {
    currentRoute: 'home',
    
    // Navegar para uma ferramenta
    navigate(toolId) {
        this.currentRoute = toolId;
        App.updateActiveNav(toolId);
        this.render();
    },
    
    // Renderizar conteúdo
    render() {
        const container = document.getElementById('tool-container');
        container.innerHTML = '';
        container.classList.add('fade-in');
        
        switch(this.currentRoute) {
            case 'home':
                container.innerHTML = this.renderHome();
                break;
            case 'password':
                container.innerHTML = PasswordGenerator.render();
                PasswordGenerator.init();
                break;
            case 'weather':
                container.innerHTML = Weather.render();
                Weather.init();
                break;
            case 'translator':
                container.innerHTML = Translator.render();
                Translator.init();
                break;
            case 'ai-assistant':
                container.innerHTML = AIAssistant.render();
                AIAssistant.init();
                break;
            case 'mini-game':
                container.innerHTML = MiniGame.render();
                MiniGame.init();
                break;
            case 'temp-email':
                container.innerHTML = TempEmail.render();
                TempEmail.init();
                break;
            case 'music':
                container.innerHTML = MusicPlayer.render();
                MusicPlayer.init();
                break;
            case 'offline':
                container.innerHTML = OfflineZone.render();
                OfflineZone.init();
                break;
            default:
                container.innerHTML = this.renderNotFound();
        }
    },
    
    // Renderizar Home
    renderHome() {
        const tools = App.tools.filter(t => t.id !== 'home');
        
        return `
            <div class="max-w-6xl mx-auto">
                <div class="mb-8">
                    <h1 class="text-4xl font-bold text-gray-800 mb-2">🧰 Bem-vindo ao ToolBox!</h1>
                    <p class="text-gray-600">Olá, <strong>${App.user.username}</strong>! Escolha uma ferramenta abaixo para começar.</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${tools.map(tool => `
                        <div class="tool-card bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl"
                             onclick="Router.navigate('${tool.id}')">
                            <div class="text-5xl mb-4">${tool.icon}</div>
                            <h3 class="text-xl font-bold text-gray-800 mb-2">${tool.name}</h3>
                            <p class="text-gray-600 text-sm">${tool.description}</p>
                        </div>
                    `).join('')}
                </div>
                
                <div class="mt-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                    <h3 class="text-2xl font-bold mb-2">💡 Dica do Dia</h3>
                    <p>Use o <strong>Gerador de Senhas</strong> para criar senhas seguras e únicas para cada site!</p>
                </div>
            </div>
        `;
    },
    
    // Renderizar página não encontrada
    renderNotFound() {
        return `
            <div class="text-center py-20">
                <div class="text-8xl mb-4">🤔</div>
                <h2 class="text-3xl font-bold text-gray-800 mb-2">Página não encontrada</h2>
                <p class="text-gray-600 mb-6">A ferramenta que você procura não existe.</p>
                <button onclick="Router.navigate('home')" class="btn-primary">
                    Voltar ao Início
                </button>
            </div>
        `;
    }
};

window.Router = Router;