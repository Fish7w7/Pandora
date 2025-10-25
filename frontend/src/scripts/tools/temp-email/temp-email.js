// Email Temporário - Solução Híbrida (Web + Geração Local)
const TempEmail = {
    currentEmail: null,
    messages: [],
    
    render() {
        return `
            <div class="max-w-5xl mx-auto">
                <div class="text-center mb-8">
                    <h1 class="text-5xl font-black text-gray-800 mb-3">📧 Email Temporário</h1>
                    <p class="text-gray-600 text-lg">Escolha a melhor opção para você</p>
                </div>
                
                <!-- Opção 1: Abrir em Janela Externa -->
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
                        <button onclick="TempEmail.openExternal('https://temp-mail.org')" 
                                class="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-6 rounded-xl transition-all transform hover:scale-105 group">
                            <div class="text-4xl mb-3">📬</div>
                            <div class="font-bold text-xl mb-2">Temp-Mail</div>
                            <div class="text-blue-100 text-sm mb-3">Interface moderna</div>
                            <div class="bg-white/20 group-hover:bg-white/30 py-2 px-4 rounded-lg font-bold text-sm">
                                🌐 Abrir no Navegador
                            </div>
                        </button>
                        
                        <button onclick="TempEmail.openExternal('https://www.minuteinbox.com')" 
                                class="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-6 rounded-xl transition-all transform hover:scale-105 group">
                            <div class="text-4xl mb-3">⏱️</div>
                            <div class="font-bold text-xl mb-2">MinuteInbox</div>
                            <div class="text-blue-100 text-sm mb-3">Rápido e simples</div>
                            <div class="bg-white/20 group-hover:bg-white/30 py-2 px-4 rounded-lg font-bold text-sm">
                                🌐 Abrir no Navegador
                            </div>
                        </button>
                        
                        <button onclick="TempEmail.openExternal('https://tempail.com')" 
                                class="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-6 rounded-xl transition-all transform hover:scale-105 group">
                            <div class="text-4xl mb-3">⚡</div>
                            <div class="font-bold text-xl mb-2">Tempail</div>
                            <div class="text-blue-100 text-sm mb-3">Sem anúncios</div>
                            <div class="bg-white/20 group-hover:bg-white/30 py-2 px-4 rounded-lg font-bold text-sm">
                                🌐 Abrir no Navegador
                            </div>
                        </button>
                    </div>
                </div>
                
                <!-- Opção 2: Gerador Simples -->
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
                    
                    ${this.currentEmail ? `
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
                    ` : `
                        <button onclick="TempEmail.generateSimple()" 
                                class="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-5 rounded-xl font-bold text-xl shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all">
                            ✨ Gerar Email Aleatório
                        </button>
                    `}
                </div>
                
                <!-- Opção 3: Email Real Descartável -->
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
                    
                    <div class="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                        <div class="space-y-3 text-purple-50">
                            <div class="flex items-start gap-3">
                                <span class="text-2xl">📧</span>
                                <div>
                                    <strong>seuemail+teste@gmail.com</strong><br>
                                    <span class="text-sm">Crie variações infinitas do seu email!</span>
                                </div>
                            </div>
                            <div class="flex items-start gap-3">
                                <span class="text-2xl">✅</span>
                                <div>
                                    <strong>Vantagens:</strong> Recebe no seu email real, pode filtrar, criar regras
                                </div>
                            </div>
                            <div class="flex items-start gap-3">
                                <span class="text-2xl">💡</span>
                                <div>
                                    <strong>Exemplo:</strong> seuemail+netflix@gmail.com, seuemail+facebook@gmail.com
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Info Cards -->
                <div class="space-y-6">
                    <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-white shadow-2xl">
                        <div class="flex items-start gap-4">
                            <div class="text-5xl">💡</div>
                            <div>
                                <h3 class="text-2xl font-black mb-3">Qual opção escolher?</h3>
                                <ul class="text-green-100 space-y-2">
                                    <li><strong>🚀 Opção 1:</strong> Melhor experiência - interface completa</li>
                                    <li><strong>🎲 Opção 2:</strong> Rápido - só copiar o email</li>
                                    <li><strong>🎯 Opção 3:</strong> Mais seguro - usa seu email real</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
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
                </div>
            </div>
        `;
    },
    
    init() {
        const saved = Utils.loadData('temp_email_simple');
        if (saved && saved.email) {
            this.currentEmail = saved.email;
        }
    },
    
    openExternal(url) {
        // Tentar abrir no navegador padrão do sistema
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
        // Domínios populares de email temporário
        const domains = [
            'tempmail.com',
            'guerrillamail.com',
            'mailinator.com',
            'maildrop.cc',
            'throwaway.email'
        ];
        
        // Gerar username aleatório
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let username = 'temp';
        for (let i = 0; i < 8; i++) {
            username += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // Escolher domínio aleatório
        const domain = domains[Math.floor(Math.random() * domains.length)];
        
        this.currentEmail = `${username}@${domain}`;
        
        Utils.saveData('temp_email_simple', { 
            email: this.currentEmail,
            created: Date.now() 
        });
        
        Utils.showNotification('✅ Email gerado! Copie e use onde precisar', 'success');
        Router.render();
    },
    
    openInboxPage() {
        if (!this.currentEmail) return;
        
        // Extrair domínio do email
        const domain = this.currentEmail.split('@')[1];
        const username = this.currentEmail.split('@')[0];
        
        // URLs diretas para verificar inbox
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