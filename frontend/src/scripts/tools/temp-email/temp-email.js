/* TEMP-EMAIL.JS v2.0.0 — NyanTools にゃん~ */

const TempEmail = {
    currentEmail: null,

    domains: ['tempmail.com','guerrillamail.com','mailinator.com','maildrop.cc','throwaway.email'],

    services: [
        { name: 'Temp-Mail',    url: 'https://temp-mail.org',           icon: '📬', desc: 'Interface moderna' },
        { name: 'MinuteInbox',  url: 'https://www.minuteinbox.com',      icon: '⏱️', desc: 'Rápido e simples' },
        { name: 'Tempail',      url: 'https://tempail.com',              icon: '⚡', desc: 'Sem anúncios' }
    ],

    render() {
        const d = document.body.classList.contains('dark-theme');
        const bg      = d ? 'rgba(255,255,255,0.04)' : '#ffffff';
        const border  = d ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
        const text    = d ? '#e2e8f0' : '#1e293b';
        const subtext = d ? 'rgba(255,255,255,0.4)'  : 'rgba(0,0,0,0.4)';
        const inputBg = d ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)';
        const label   = d ? 'rgba(255,255,255,0.3)'  : 'rgba(0,0,0,0.35)';

        return `<style>
            .te-root{max-width:620px;margin:0 auto;font-family:'DM Sans',sans-serif}
            .te-card{background:${bg};border:1px solid ${border};border-radius:18px;padding:1.5rem;margin-bottom:0.75rem}
            .te-label{font-size:0.68rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${label};margin-bottom:0.75rem;display:block}
            .te-btn{padding:0.625rem 1.25rem;border-radius:10px;border:none;font-size:0.82rem;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;display:flex;align-items:center;justify-content:center;gap:0.4rem}
            .te-btn-primary{background:linear-gradient(135deg,#a855f7,#ec4899);color:white;box-shadow:0 4px 16px rgba(168,85,247,0.3)}
            .te-btn-primary:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(168,85,247,0.4)}
            .te-btn-secondary{background:${d?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.05)'};border:1px solid ${border};color:${d?'rgba(255,255,255,0.6)':'rgba(0,0,0,0.55)'}}
            .te-btn-secondary:hover{background:${d?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.08)'};color:${d?'white':'#1e293b'}}
            .te-service-btn{display:flex;flex-direction:column;align-items:center;gap:0.375rem;padding:1rem 0.75rem;border-radius:12px;border:1px solid ${border};background:${inputBg};cursor:pointer;transition:all 0.15s;font-family:'DM Sans',sans-serif;color:${text};flex:1}
            .te-service-btn:hover{border-color:rgba(168,85,247,0.4);background:rgba(168,85,247,0.07)}
            .te-email-display{font-family:'JetBrains Mono','Fira Code','Courier New',monospace;font-size:1rem;font-weight:700;color:${text};word-break:break-all;line-height:1.5;padding:1rem;background:${inputBg};border:1px solid ${border};border-radius:10px;margin-bottom:0.75rem}
            .te-warn{font-size:0.72rem;color:${d?'rgba(255,165,0,0.7)':'rgba(180,100,0,0.8)'};background:${d?'rgba(255,165,0,0.08)':'rgba(255,165,0,0.08)'};border:1px solid rgba(255,165,0,0.2);border-radius:8px;padding:0.625rem 0.875rem;line-height:1.5}
        </style>

        <div class="te-root">

            <!-- Header -->
            <div style="text-align:center;margin-bottom:1.5rem;">
                <div style="font-size:2.8rem;margin-bottom:0.5rem;">📧</div>
                <h1 style="font-family:'Syne',sans-serif;font-size:1.8rem;font-weight:900;background:linear-gradient(135deg,#a855f7,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin:0 0 0.25rem;">Email Temporário</h1>
                <p style="font-size:0.82rem;color:${subtext};font-weight:500;">Três formas de proteger seu email real にゃん~</p>
            </div>

            <!-- Opção 1: Serviços externos -->
            <div class="te-card">
                <span class="te-label">Opção 1 — Serviços online (recomendado)</span>
                <p style="font-size:0.8rem;color:${subtext};margin-bottom:0.875rem;line-height:1.5;">
                    Abre no navegador com interface completa, caixa de entrada real e recebimento de emails.
                </p>
                <div style="display:flex;gap:0.5rem;">
                    ${this.services.map(s => `
                    <button class="te-service-btn" onclick="TempEmail.openExternal('${s.url}')">
                        <span style="font-size:1.5rem;">${s.icon}</span>
                        <span style="font-size:0.8rem;font-weight:700;">${s.name}</span>
                        <span style="font-size:0.68rem;color:${subtext};">${s.desc}</span>
                    </button>`).join('')}
                </div>
            </div>

            <!-- Opção 2: Gerador -->
            <div class="te-card">
                <span class="te-label">Opção 2 — Gerar email aleatório</span>
                <p style="font-size:0.8rem;color:${subtext};margin-bottom:0.875rem;line-height:1.5;">
                    Gera um endereço para usar em cadastros. Acesse o domínio manualmente para ver mensagens.
                </p>

                ${this.currentEmail ? `
                    <div class="te-email-display">${this.currentEmail}</div>
                    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                        <button class="te-btn te-btn-primary" onclick="TempEmail.copyEmail()" style="flex:1;">
                            📋 Copiar email
                        </button>
                        <button class="te-btn te-btn-secondary" onclick="TempEmail.openInboxPage()">
                            📬 Ver caixa
                        </button>
                        <button class="te-btn te-btn-secondary" onclick="TempEmail.generateSimple()">
                            🔄 Novo
                        </button>
                    </div>
                ` : `
                    <button class="te-btn te-btn-primary" style="width:100%;padding:0.875rem;" onclick="TempEmail.generateSimple()">
                        ✨ Gerar email aleatório
                    </button>
                `}
            </div>

            <!-- Opção 3: Gmail trick -->
            <div class="te-card">
                <span class="te-label">Opção 3 — Truque do Gmail / Outlook</span>
                <p style="font-size:0.8rem;color:${subtext};margin-bottom:0.875rem;line-height:1.5;">
                    Use seu email real com <code style="background:${inputBg};padding:1px 5px;border-radius:4px;font-size:0.78rem;">+tag</code> para criar variações infinitas que chegam na sua caixa normal.
                </p>
                <div style="background:${inputBg};border:1px solid ${border};border-radius:10px;padding:0.875rem;font-size:0.8rem;color:${subtext};line-height:1.8;">
                    <div style="font-family:monospace;color:${d?'#c084fc':'#7c3aed'};font-size:0.85rem;margin-bottom:0.5rem;">
                        seuemail+netflix@gmail.com<br>
                        seuemail+facebook@gmail.com<br>
                        seuemail+desconto@gmail.com
                    </div>
                    <div>✅ Recebe no email real · pode criar filtros e regras automáticas</div>
                </div>
            </div>

            <!-- Aviso de segurança -->
            <div class="te-warn">
                ⚠️ <strong>Emails temporários são públicos.</strong> Use para newsletters e cadastros de teste.
                Nunca use para bancos, redes sociais importantes ou documentos.
            </div>

        </div>`;
    },

    init() {
        const saved = Utils.loadData('temp_email_simple');
        if (saved?.email) this.currentEmail = saved.email;
    },

    openExternal(url) {
        if (window.electronAPI?.openExternal) {
            window.electronAPI.openExternal(url);
        } else {
            window.open(url, '_blank');
        }
        Utils.showNotification('🌐 Abrindo no navegador...', 'success');
    },

    generateSimple() {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let username = 'temp';
        for (let i = 0; i < 8; i++) username += chars[Math.floor(Math.random() * chars.length)];
        const domain = this.domains[Math.floor(Math.random() * this.domains.length)];
        this.currentEmail = `${username}@${domain}`;
        Utils.saveData('temp_email_simple', { email: this.currentEmail, created: Date.now() });
        Utils.showNotification('✅ Email gerado!', 'success');
        Router.render();
    },

    openInboxPage() {
        if (!this.currentEmail) return;
        const [username, domain] = this.currentEmail.split('@');
        const urls = {
            'mailinator.com':   `https://www.mailinator.com/v4/public/inboxes.jsp?to=${username}`,
            'maildrop.cc':      `https://maildrop.cc/inbox/${username}`,
            'guerrillamail.com': 'https://www.guerrillamail.com',
            'tempmail.com':     'https://temp-mail.org',
            'throwaway.email':  'https://www.throwaway.email'
        };
        this.openExternal(urls[domain] || 'https://temp-mail.org');
    },

    copyEmail() {
        if (this.currentEmail) Utils.copyToClipboard(this.currentEmail);
    }
};

window.TempEmail = TempEmail;