// Email Temporário Otimizado - Solução Híbrida にゃん~
const TempEmail = {
    currentEmail: null,
    messages: [],
    
    // Domínios disponíveis
    domains: [
        'tempmail.com',
        'guerrillamail.com',
        'mailinator.com',
        'maildrop.cc',
        'throwaway.email'
    ],
    
    // URLs dos serviços
    services: [
        { name: 'Temp-Mail', url: 'https://temp-mail.org', icon: '📬', desc: 'Interface moderna' },
        { name: 'MinuteInbox', url: 'https://www.minuteinbox.com', icon: '⏱️', desc: 'Rápido e simples' },
        { name: 'Tempail', url: 'https://tempail.com', icon: '⚡', desc: 'Sem anúncios' }
    ],
    
    render() {
        return `
            <div class="max-w-5xl mx-auto">
                ${this.renderHeader()}
                ${this.renderOnlineServices()}
                ${this.renderGenerator()}
                ${this.renderGmailTrick()}
                ${this.renderInfoCards()}
            </div>
        `;
    },
    
    renderHeader() {
        return `
            <div class="text-center mb-8">
                <h1 class="text-5xl font-black text-gray-800 mb-3">📧 Email Temporário</h1>
                <p class="text-gray-600 text-lg">Escolha a melhor opção para você</p>
            </div>
        `;
    },
    
    renderOnlineServices() {
        return `
            <div class="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-8 text-white shadow-2xl mb-6">
                <div class="flex items-start gap-4 mb-6">
                    <div class="text-6xl">🚀</div>
                    <div class="flex-1">
                        <h2 class="text-3xl font-black mb-3">Opção 1: Serviços Online (Recomendado)</h2>
                        <p class="text-blue-100 mb-4">
                            Abra estes serviços <strong>diretamente no seu navegador</strong> para melhor experiência:
                        </p>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    ${this.services.map(service => this.renderServiceCard(service)).join('')}
                </div>
            </div>
        `;
    },
    
    renderServiceCard(service) {
        return `
            <button onclick="TempEmail.openExternal('${service.url}')" 
                    class="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-6 rounded-xl transition-all transform hover:scale-105 group">
                <div class="text-4xl mb-3">${service.icon}</div>
                <div class="font-bold text-xl mb-2">${service.name}</div>
                <div class="text-blue-100 text-sm mb-3">${service.desc}</div>
                <div class="bg-white/20 group-hover:bg-white/30 py-2 px-4 rounded-lg font-bold text-sm">
                    🌐 Abrir no Navegador
                </div>
            </button>
        `;
    },
    
    renderGenerator() {
        return `
            <div class="bg-white rounded-2xl shadow-2xl p-8 mb-6">
                <div class="flex items-start gap-4 mb-6">
                    <div class="text-6xl">🎲</div>
                    <div class="flex-1">
                        <h2 class="text-3xl font-black text-gray-800 mb-3">Opção 2: Gerador de Email</h2>
                        <p class="text-gray-600 mb-4">
                            Gere um email aleatório para usar em cadastros. <strong>Nota:</strong> Você precisará acessar o domínio manualmente para ver as mensagens.
                        </p>
                    </div>
                </div>
                
                ${this.currentEmail ? this.renderGeneratedEmail() : this.renderGenerateButton()}
            </div>
        `;
    },
    
    renderGeneratedEmail() {
        return `
            <div class="bg-gradient-to-br from-green-50 to-emerald-50 border-3 border-green-300 rounded-2xl p-6 mb-4">
                <div class="text-sm text-green-700 mb-3 font-semibold">📧 Email gerado:</div>
                <div class="flex items-center gap-3 flex-wrap mb-4">
                    <code class="text-xl font-mono font-bold text-green-900 break-all flex-1">${this.currentEmail}</code>
                    <button onclick="TempEmail.copyEmail()" 
                            class="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                        📋 Copiar
                    </button>
                </div>
                <div class="flex gap-3">
                    <button onclick="TempEmail.openInboxPage()" 
                            class="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all">
                        📬 Abrir Caixa de Entrada
                    </button>
                    <button onclick="TempEmail.generateSimple()" 
                            class="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold transition-all">
                        🔄 Novo Email
                    </button>
                </div>
            </div>
        `;
    },
    
    renderGenerateButton() {
        return `
            <button onclick="TempEmail.generateSimple()" 
                    class="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-5 rounded-xl font-bold text-xl shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all">
                ✨ Gerar Email Aleatório
            </button>
        `;
    },
    
    renderGmailTrick() {
        return `
            <div class="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-8 text-white shadow-2xl mb-6">
                <div class="flex items-start gap-4 mb-6">
                    <div class="text-6xl">🎯</div>
                    <div class="flex-1">
                        <h2 class="text-3xl font-black mb-3">Opção 3: Use Gmail/Outlook + "+"</h2>
                        <p class="text-purple-100 mb-4">
                            <strong>Dica profissional:</strong> Use seu email real com o truque do "+":
                        </p>
                    </div>
                </div>
                
                ${this.renderGmailExamples()}
            </div>
        `;
    },
    
    renderGmailExamples() {
        const examples = [
            { icon: '📧', title: 'seuemail+teste@gmail.com', desc: 'Crie variações infinitas do seu email!' },
            { icon: '✅', title: 'Vantagens:', desc: 'Recebe no seu email real, pode filtrar, criar regras' },
            { icon: '💡', title: 'Exemplo:', desc: 'seuemail+netflix@gmail.com, seuemail+facebook@gmail.com' }
        ];
        
        return `
            <div class="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                <div class="space-y-3 text-purple-50">
                    ${examples.map(ex => `
                        <div class="flex items-start gap-3">
                            <span class="text-2xl">${ex.icon}</span>
                            <div>
                                <strong>${ex.title}</strong><br>
                                <span class="text-sm">${ex.desc}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    renderInfoCards() {
        return `
            <div class="space-y-6">
                ${this.renderComparisonCard()}
                ${this.renderSecurityCard()}
            </div>
        `;
    },
    
    renderComparisonCard() {
        const options = [
            { emoji: '🚀', title: 'Opção 1:', desc: 'Melhor experiência - interface completa' },
            { emoji: '🎲', title: 'Opção 2:', desc: 'Rápido - só copiar o email' },
            { emoji: '🎯', title: 'Opção 3:', desc: 'Mais seguro - usa seu email real' }
        ];
        
        return `
            <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-white shadow-2xl">
                <div class="flex items-start gap-4">
                    <div class="text-5xl">💡</div>
                    <div>
                        <h3 class="text-2xl font-black mb-3">Qual opção escolher?</h3>
                        <ul class="text-green-100 space-y-2">
                            ${options.map(opt => `
                                <li><strong>${opt.emoji} ${opt.title}</strong> ${opt.desc}</li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderSecurityCard() {
        return `
            <div class="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-8 text-white shadow-2xl">
                <div class="flex items-start gap-4">
                    <div class="text-5xl">⚠️</div>
                    <div>
                        <h3 class="text-2xl font-black mb-3">Segurança</h3>
                        <p class="text-yellow-100 mb-3">
                            Emails temporários são <strong>públicos e inseguros</strong>.
                        </p>
                        <div class="text-yellow-50 text-sm space-y-1">
                            <div>✅ <strong>Use para:</strong> newsletters, cadastros de teste, downloads</div>
                            <div>❌ <strong>NÃO use para:</strong> bancos, documentos, redes sociais importantes</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    init() {
        const saved = Utils.loadData('temp_email_simple');
        if (saved?.email) {
            this.currentEmail = saved.email;
        }
    },
    
    openExternal(url) {
        if (typeof require !== 'undefined') {
            try {
                const { shell } = require('electron');
                shell.openExternal(url);
                Utils.showNotification('🌐 Abrindo no navegador...', 'success');
            } catch (e) {
                window.open(url, '_blank');
                Utils.showNotification('🌐 Abrindo em nova janela...', 'success');
            }
        } else {
            window.open(url, '_blank');
            Utils.showNotification('🌐 Abrindo em nova janela...', 'success');
        }
    },
    
    generateSimple() {
        const username = this.generateUsername();
        const domain = this.domains[Math.floor(Math.random() * this.domains.length)];
        
        this.currentEmail = `${username}@${domain}`;
        
        Utils.saveData('temp_email_simple', { 
            email: this.currentEmail,
            created: Date.now() 
        });
        
        Utils.showNotification('✅ Email gerado! Copie e use onde precisar', 'success');
        Router.render();
    },
    
    generateUsername() {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let username = 'temp';
        
        for (let i = 0; i < 8; i++) {
            username += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return username;
    },
    
    openInboxPage() {
        if (!this.currentEmail) return;
        
        const domain = this.currentEmail.split('@')[1];
        const username = this.currentEmail.split('@')[0];
        
        const inboxUrls = {
            'mailinator.com': `https://www.mailinator.com/v4/public/inboxes.jsp?to=${username}`,
            'maildrop.cc': `https://maildrop.cc/inbox/${username}`,
            'guerrillamail.com': 'https://www.guerrillamail.com',
            'tempmail.com': 'https://temp-mail.org',
            'throwaway.email': 'https://www.throwaway.email'
        };
        
        const url = inboxUrls[domain] || 'https://temp-mail.org';
        this.openExternal(url);
    },
    
    copyEmail() {
        Utils.copyToClipboard(this.currentEmail);
    }
};

window.TempEmail = TempEmail;