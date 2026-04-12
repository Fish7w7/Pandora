const PasswordGenerator = {
    config: {
        length: 16,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        mode: 'random'
    },

    state: {
        currentPassword: '',
        history: [],
        maxHistory: 10,
        _copyTimer: null
    },

    CHAR_SETS: Object.freeze({
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers:   '0123456789',
        symbols:   '!@#$%^&*()_+-=[]{}|;:,.<>?'
    }),

    WORDS: [
        'tigre','nuvem','pedra','foguete','oceano','cidade','estrela','floresta',
        'dragao','espada','castelo','trovao','cristal','vulcao','templo','jardim',
        'sombra','chama','gelo','vento','chuva','monte','rio','pico','vale',
        'lobo','aguia','corvo','leao','onca','touro','falcao','cobra','urso','raposa'
    ],

    STRENGTH: Object.freeze({
        veryStrong: { min: 80, label: 'Muito Forte', color: '#22c55e' },
        strong:     { min: 60, label: 'Forte',       color: '#3b82f6' },
        medium:     { min: 40, label: 'Média',        color: '#f59e0b' },
        weak:       { min: 0,  label: 'Fraca',        color: '#ef4444' }
    }),

    render() {
        this.loadHistory();
        this.config.length = this.config.mode === 'passphrase' ? 4 : 16;
        this.state.currentPassword = this._buildPassword();

        const d = document.body.classList.contains('dark-theme');
        const info     = this.getStrengthInfo(this.calculateStrength());
        const strength = this.calculateStrength();

        setTimeout(() => {
            const slider = document.getElementById('pwd-length');
            if (slider) { slider.value = this.config.length; this._updateSliderTrack(); }
        }, 0);

        return `<style>
            .pwd-root{max-width:560px;margin:0 auto;font-family:'DM Sans',sans-serif}
            .pwd-display{position:relative;background:${d?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)'};border:1.5px solid ${d?'rgba(255,255,255,0.09)':'rgba(0,0,0,0.08)'};border-radius:16px;padding:1.25rem 1.5rem;margin-bottom:0.75rem}
            .pwd-text{font-family:'JetBrains Mono','Fira Code','Courier New',monospace;font-size:clamp(0.9rem,2.5vw,1.15rem);font-weight:700;letter-spacing:0.04em;word-break:break-all;line-height:1.6;color:${d?'#e2e8f0':'#1e293b'};min-height:2.4em;padding-right:3.5rem}
            .pwd-copy-btn{position:absolute;top:50%;right:1rem;transform:translateY(-50%);width:36px;height:36px;border-radius:10px;background:${d?'rgba(168,85,247,0.15)':'rgba(168,85,247,0.1)'};border:1px solid ${d?'rgba(168,85,247,0.3)':'rgba(168,85,247,0.2)'};color:#a855f7;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s;font-size:1rem}
            .pwd-copy-btn:hover{background:rgba(168,85,247,0.25);transform:translateY(-50%) scale(1.08)}
            .pwd-copy-btn.copied{background:rgba(34,197,94,0.2);border-color:rgba(34,197,94,0.4);color:#22c55e}
            .pwd-strength-row{display:flex;align-items:center;gap:0.75rem;margin-bottom:1.5rem}
            .pwd-strength-track{flex:1;height:5px;border-radius:99px;background:${d?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.07)'};overflow:hidden}
            .pwd-strength-fill{height:100%;border-radius:99px;transition:width 0.5s cubic-bezier(0.34,1.56,0.64,1),background 0.3s}
            .pwd-strength-label{font-size:0.72rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;min-width:72px;text-align:right}
            .pwd-section{background:${d?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)'};border:1px solid ${d?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.06)'};border-radius:14px;padding:1.25rem;margin-bottom:0.75rem}
            .pwd-section-label{font-size:0.68rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${d?'rgba(255,255,255,0.3)':'rgba(0,0,0,0.35)'};margin-bottom:0.875rem;display:block}
            .pwd-length-row{display:flex;align-items:center;gap:1rem}
            .pwd-length-num{font-size:1.6rem;font-weight:900;font-variant-numeric:tabular-nums;color:#a855f7;min-width:2.5rem;text-align:center;line-height:1}
            .pwd-slider{flex:1;-webkit-appearance:none;appearance:none;height:5px;border-radius:99px;outline:none;cursor:pointer}
            .pwd-slider::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#a855f7,#ec4899);box-shadow:0 2px 8px rgba(168,85,247,0.4);cursor:pointer}
            .pwd-slider-marks{display:flex;justify-content:space-between;margin-top:0.5rem;font-size:0.65rem;color:${d?'rgba(255,255,255,0.2)':'rgba(0,0,0,0.25)'};font-weight:600}
            .pwd-mode-toggle{display:grid;grid-template-columns:1fr 1fr;gap:0.375rem;background:${d?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)'};border-radius:10px;padding:0.25rem;margin-bottom:0.75rem}
            .pwd-mode-btn{padding:0.5rem;border-radius:8px;border:none;font-size:0.78rem;font-weight:700;cursor:pointer;transition:all 0.18s;font-family:'DM Sans',sans-serif;color:${d?'rgba(255,255,255,0.4)':'rgba(0,0,0,0.4)'};background:transparent}
            .pwd-mode-btn.active{background:${d?'rgba(168,85,247,0.2)':'white'};color:${d?'#c084fc':'#7c3aed'};box-shadow:${d?'none':'0 1px 4px rgba(0,0,0,0.1)'};border:1px solid ${d?'rgba(168,85,247,0.3)':'rgba(168,85,247,0.2)'}}
            .pwd-toggles{display:grid;grid-template-columns:1fr 1fr;gap:0.5rem}
            .pwd-toggle{display:flex;align-items:center;gap:0.625rem;padding:0.625rem 0.875rem;border-radius:10px;cursor:pointer;border:1.5px solid ${d?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.07)'};background:transparent;transition:all 0.15s;font-family:'DM Sans',sans-serif;color:${d?'rgba(255,255,255,0.5)':'rgba(0,0,0,0.45)'};font-size:0.82rem;font-weight:600}
            .pwd-toggle.on{border-color:rgba(168,85,247,0.4);background:rgba(168,85,247,0.08);color:${d?'#c084fc':'#7c3aed'}}
            .pwd-toggle-dot{width:8px;height:8px;border-radius:50%;background:currentColor;flex-shrink:0;opacity:0.5;transition:opacity 0.15s}
            .pwd-toggle.on .pwd-toggle-dot{opacity:1}
            .pwd-toggle-mono{font-family:monospace;font-size:0.75rem;margin-left:auto;opacity:0.5}
            .pwd-generate-btn{width:100%;padding:0.875rem;background:linear-gradient(135deg,#a855f7,#ec4899);border:none;border-radius:12px;color:white;font-size:0.95rem;font-weight:800;cursor:pointer;letter-spacing:0.02em;font-family:'DM Sans',sans-serif;box-shadow:0 4px 20px rgba(168,85,247,0.35);transition:all 0.15s;display:flex;align-items:center;justify-content:center;gap:0.5rem;margin-bottom:0.75rem}
            .pwd-generate-btn:hover{transform:translateY(-1px);box-shadow:0 6px 24px rgba(168,85,247,0.45)}
            .pwd-actions{display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-bottom:0.75rem}
            .pwd-action-btn{padding:0.625rem;border-radius:10px;font-size:0.78rem;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;border:1px solid ${d?'rgba(255,255,255,0.09)':'rgba(0,0,0,0.08)'};background:${d?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.02)'};color:${d?'rgba(255,255,255,0.55)':'rgba(0,0,0,0.5)'};transition:all 0.15s;display:flex;align-items:center;justify-content:center;gap:0.4rem}
            .pwd-action-btn:hover{background:${d?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.05)'};color:${d?'white':'#1e293b'}}
            .pwd-history-item{display:flex;align-items:center;gap:0.75rem;padding:0.75rem;border-radius:10px;background:${d?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)'};border:1px solid ${d?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)'};margin-bottom:0.5rem}
            .pwd-history-pw{flex:1;font-family:monospace;font-size:0.78rem;font-weight:700;color:${d?'#e2e8f0':'#1e293b'};word-break:break-all;line-height:1.4}
            .pwd-history-meta{font-size:0.65rem;color:${d?'rgba(255,255,255,0.25)':'rgba(0,0,0,0.3)'};white-space:nowrap}
            .pwd-history-copy{width:28px;height:28px;border-radius:7px;border:none;background:${d?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.05)'};color:${d?'rgba(255,255,255,0.4)':'rgba(0,0,0,0.4)'};cursor:pointer;font-size:0.8rem;display:flex;align-items:center;justify-content:center;transition:all 0.15s;flex-shrink:0}
            .pwd-history-copy:hover{background:rgba(168,85,247,0.15);color:#a855f7}
        </style>

        <div class="pwd-root">
            <div style="text-align:center;margin-bottom:1.5rem;">
                <div style="font-size:2.8rem;margin-bottom:0.5rem;">🔑</div>
                <h1 style="font-family:'Syne',sans-serif;font-size:1.8rem;font-weight:900;background:linear-gradient(135deg,#a855f7,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin:0 0 0.25rem;">Gerador de Senhas</h1>
                <p style="font-size:0.82rem;color:${d?'rgba(255,255,255,0.35)':'rgba(0,0,0,0.4)'};font-weight:500;">Senhas seguras com crypto API にゃん~</p>
            </div>

            <div class="pwd-display">
                <div class="pwd-text" id="pwd-text">${this._colorize(this.state.currentPassword)}</div>
                <button class="pwd-copy-btn" id="pwd-copy-btn" onclick="PasswordGenerator.copy()" title="Copiar senha">⎘</button>
            </div>

            <div class="pwd-strength-row">
                <div class="pwd-strength-track">
                    <div class="pwd-strength-fill" style="width:${strength}%;background:${info.color};"></div>
                </div>
                <div class="pwd-strength-label" style="color:${info.color};">${info.label}</div>
            </div>

            <div class="pwd-section">
                <div class="pwd-section-label">Modo</div>
                <div class="pwd-mode-toggle">
                    <button class="pwd-mode-btn ${this.config.mode==='random'?'active':''}" onclick="PasswordGenerator.setMode('random')">🎲 Aleatória</button>
                    <button class="pwd-mode-btn ${this.config.mode==='passphrase'?'active':''}" onclick="PasswordGenerator.setMode('passphrase')">💬 Frase-Senha</button>
                </div>
                ${this.config.mode==='passphrase'?`<div style="font-size:0.72rem;color:${d?'rgba(255,255,255,0.3)':'rgba(0,0,0,0.35)'};line-height:1.8;">Palavras separadas por hífen — fácil de memorizar.<br>Ex: <span style="font-family:monospace;color:#a855f7;">tigre-nuvem-cristal-vulcao</span></div>`:''}
            </div>

            <div class="pwd-section">
                <div class="pwd-section-label">Comprimento</div>
                <div class="pwd-length-row">
                    <input type="range" class="pwd-slider" id="pwd-length"
                           min="${this.config.mode==='passphrase'?3:8}" max="${this.config.mode==='passphrase'?8:64}"
                           value="${this.config.length}" oninput="PasswordGenerator.setLength(this.value)">
                    <div class="pwd-length-num" id="pwd-length-num">${this.config.length}</div>
                </div>
                <div class="pwd-slider-marks">
                    ${this.config.mode==='passphrase'?'<span>3</span><span>8 palavras</span>':'<span>8</span><span>16</span><span>32</span><span>64</span>'}
                </div>
            </div>

            ${this.config.mode==='random'?`
            <div class="pwd-section">
                <div class="pwd-section-label">Caracteres</div>
                <div class="pwd-toggles">
                    ${[['uppercase','Maiúsculas','ABC'],['lowercase','Minúsculas','abc'],['numbers','Números','123'],['symbols','Símbolos','!@#']].map(([id,label,ex])=>`
                    <button class="pwd-toggle ${this.config[id]?'on':''}" onclick="PasswordGenerator.toggleType('${id}')">
                        <div class="pwd-toggle-dot"></div>
                        <span>${label}</span>
                        <span class="pwd-toggle-mono">${ex}</span>
                    </button>`).join('')}
                </div>
            </div>`:''}

            <button class="pwd-generate-btn" onclick="PasswordGenerator.generate()">
                <span>⚡</span><span>Gerar Nova Senha</span>
            </button>

            <div class="pwd-actions">
                <button class="pwd-action-btn" onclick="PasswordGenerator.saveToHistory()">💾 Salvar no histórico</button>
                <button class="pwd-action-btn" onclick="PasswordGenerator.analyzePassword()">🔍 Analisar</button>
            </div>

            ${this._renderHistory()}
        </div>`;
    },

    _renderHistory() {
        if (!this.state.history.length) return '';
        const d = document.body.classList.contains('dark-theme');
        const muted = d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';
        const items = this.state.history.map((item, i) => {
            const info = this.getStrengthInfo(item.strength);
            return `<div class="pwd-history-item">
                <div style="width:6px;height:6px;border-radius:50%;background:${info.color};flex-shrink:0;margin-top:2px;"></div>
                <div style="flex:1;min-width:0;">
                    <div class="pwd-history-pw">${item.password}</div>
                    <div class="pwd-history-meta">${info.label} · ${item.date}</div>
                </div>
                <button class="pwd-history-copy" onclick="PasswordGenerator.copyFromHistory(${i})" title="Copiar">⎘</button>
            </div>`;
        }).join('');
        return `<div class="pwd-section" style="margin-top:0.25rem;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.875rem;">
                <div class="pwd-section-label" style="margin-bottom:0;">Histórico (${this.state.history.length})</div>
                <button onclick="PasswordGenerator.clearHistory()" style="font-size:0.68rem;font-weight:700;color:${muted};background:none;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;transition:color 0.15s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='${muted}'">Limpar</button>
            </div>
            ${items}
        </div>`;
    },

    _colorize(pw) {
        if (!pw) return '<span style="opacity:0.3">Gerando...</span>';
        const d = document.body.classList.contains('dark-theme');
        return pw.split('').map(c => {
            const color = /[A-Z]/.test(c) ? (d?'#93c5fd':'#2563eb')
                        : /[0-9]/.test(c) ? (d?'#86efac':'#16a34a')
                        : /[^a-z]/.test(c) ? '#ec4899'
                        : (d?'#e2e8f0':'#1e293b');
            return `<span style="color:${color}">${c}</span>`;
        }).join('');
    },

    setMode(mode) {
        this.config.mode = mode;
        this.config.length = mode === 'passphrase' ? 4 : 16;
        Router?.render();
    },

    setLength(val) {
        this.config.length = parseInt(val);
        const numEl = document.getElementById('pwd-length-num');
        if (numEl) numEl.textContent = val;
        this._updateSliderTrack();
        this.state.currentPassword = this._buildPassword();
        this._updateDisplay();
    },

    _updateSliderTrack() {
        const s = document.getElementById('pwd-length');
        if (!s) return;
        const pct = ((s.value - s.min) / (s.max - s.min)) * 100;
        const d = document.body.classList.contains('dark-theme');
        s.style.background = `linear-gradient(to right,#a855f7 ${pct}%,${d?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'} ${pct}%)`;
    },

    toggleType(id) {
        const active = ['uppercase','lowercase','numbers','symbols'].filter(k => this.config[k]).length;
        if (active === 1 && this.config[id]) {
            Utils?.showNotification('⚠️ Pelo menos um tipo deve estar ativo', 'warning');
            return;
        }
        this.config[id] = !this.config[id];
        this.state.currentPassword = this._buildPassword();
        Router?.render();
    },

    generate() {
        this.state.currentPassword = this._buildPassword();
        const el = document.getElementById('pwd-text');
        if (el) {
            el.style.transition = 'opacity 0.1s';
            el.style.opacity = '0';
            setTimeout(() => { el.innerHTML = this._colorize(this.state.currentPassword); el.style.opacity = '1'; }, 80);
        }
        this._updateDisplay();
        Utils?.showNotification('✅ Senha gerada!', 'success');
    },

    _buildPassword() {
        if (this.config.mode === 'passphrase') {
            const arr = new Uint32Array(this.config.length);
            crypto.getRandomValues(arr);
            return Array.from(arr, n => this.WORDS[n % this.WORDS.length]).join('-');
        }
        const chars = Object.keys(this.CHAR_SETS).filter(k => this.config[k]).map(k => this.CHAR_SETS[k]).join('');
        if (!chars) return '';
        const arr = new Uint32Array(this.config.length);
        crypto.getRandomValues(arr);
        return Array.from(arr, n => chars[n % chars.length]).join('');
    },

    _updateDisplay() {
        const el = document.getElementById('pwd-text');
        if (el) el.innerHTML = this._colorize(this.state.currentPassword);
        const fill  = document.querySelector('.pwd-strength-fill');
        const label = document.querySelector('.pwd-strength-label');
        if (fill && label) {
            const s    = this.calculateStrength();
            const info = this.getStrengthInfo(s);
            fill.style.width      = s + '%';
            fill.style.background = info.color;
            label.style.color     = info.color;
            label.textContent     = info.label;
        }
    },

    _copyText(text, msg) {
        navigator.clipboard.writeText(text).then(() => {
            Utils?.showNotification(msg, 'success');
        }).catch(() => {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.cssText = 'position:fixed;opacity:0;';
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); Utils?.showNotification(msg, 'success'); } catch (_) {}
            document.body.removeChild(ta);
        });
    },

    copy() {
        if (!this.state.currentPassword) return;
        this._copyText(this.state.currentPassword, '📋 Senha copiada!');
        const btn = document.getElementById('pwd-copy-btn');
        if (btn) {
            btn.classList.add('copied'); btn.textContent = '✓';
            clearTimeout(this.state._copyTimer);
            this.state._copyTimer = setTimeout(() => { btn.classList.remove('copied'); btn.textContent = '⎘'; }, 2000);
        }
    },

    copyFromHistory(i) {
        const item = this.state.history[i];
        if (item) this._copyText(item.password, '📋 Copiado do histórico!');
    },

    saveToHistory() {
        if (!this.state.currentPassword) { Utils?.showNotification('⚠️ Gere uma senha primeiro', 'warning'); return; }
        if (this.state.history[0]?.password === this.state.currentPassword) { Utils?.showNotification('⚠️ Senha já está no histórico', 'info'); return; }
        this.state.history.unshift({
            password: this.state.currentPassword,
            strength: this.calculateStrength(),
            date: new Date().toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })
        });
        if (this.state.history.length > this.state.maxHistory) this.state.history.pop();
        this.saveHistoryToStorage();
        Utils?.showNotification('💾 Salva no histórico!', 'success');
        Router?.render();
    },

    clearHistory() {
        if (!this.state.history.length) return;
        document.getElementById('pwd-clear-modal')?.remove();
        const modal = document.createElement('div');
        modal.id = 'pwd-clear-modal';
        modal.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.65);animation:ncFadeIn 0.2s ease;';
        modal.innerHTML = `<style>@keyframes ncFadeIn{from{opacity:0}to{opacity:1}}@keyframes ncUp{from{opacity:0;transform:translateY(16px) scale(0.97)}to{opacity:1;transform:none}}</style>
            <div style="background:linear-gradient(145deg,#0e0e1a,#14102a);border:1px solid rgba(168,85,247,0.25);border-radius:16px;padding:1.75rem;width:100%;max-width:300px;margin:0 1rem;box-shadow:0 32px 80px rgba(0,0,0,0.7);animation:ncUp 0.25s cubic-bezier(0.34,1.56,0.64,1);font-family:'DM Sans',sans-serif;">
                <div style="font-size:1.8rem;margin-bottom:0.75rem;">🗑️</div>
                <div style="font-size:1rem;font-weight:800;color:white;margin-bottom:0.375rem;font-family:'Syne',sans-serif;">Limpar histórico?</div>
                <div style="font-size:0.8rem;color:rgba(255,255,255,0.45);margin-bottom:1.5rem;">As ${this.state.history.length} senhas salvas serão removidas.</div>
                <div style="display:flex;gap:0.625rem;">
                    <button id="pwd-clear-cancel" style="flex:1;padding:0.6rem;border-radius:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);font-size:0.875rem;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;">Cancelar</button>
                    <button id="pwd-clear-confirm" style="flex:1;padding:0.6rem;border-radius:10px;background:rgba(239,68,68,0.85);border:1px solid rgba(239,68,68,0.4);color:white;font-size:0.875rem;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;">Limpar</button>
                </div>
            </div>`;
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
        modal.querySelector('#pwd-clear-cancel').addEventListener('click', () => modal.remove());
        modal.querySelector('#pwd-clear-confirm').addEventListener('click', () => {
            modal.remove();
            this.state.history = [];
            this.saveHistoryToStorage();
            Utils?.showNotification('🗑️ Histórico limpo!', 'info');
            Router?.render();
        });
        document.body.appendChild(modal);
    },

    analyzePassword() {
        if (!this.state.currentPassword) { Utils?.showNotification('⚠️ Gere uma senha primeiro', 'warning'); return; }
        const pw = this.state.currentPassword;
        const s  = this.calculateStrength();
        const info = this.getStrengthInfo(s);
        const hasUpper = /[A-Z]/.test(pw), hasLower = /[a-z]/.test(pw);
        const hasNum   = /[0-9]/.test(pw), hasSym = /[^A-Za-z0-9]/.test(pw);
        const types    = [hasUpper, hasLower, hasNum, hasSym].filter(Boolean).length;
        const len      = pw.length;
        const crackTime = len<8||types<2?'Segundos':len<12||types<3?'Horas a dias':len<16?'Semanas a meses':len<20?'Décadas':'Milhões de anos';
        const recs = [...(len<16?['Aumentar para 16+ caracteres']:[]),...(types<4?['Ativar todos os tipos de caracteres']:[]),...(!hasSym?['Adicionar símbolos especiais']:[])];

        document.getElementById('pwd-analyze-modal')?.remove();
        const modal = document.createElement('div');
        modal.id = 'pwd-analyze-modal';
        modal.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);animation:ncFadeIn 0.2s ease;';
        modal.innerHTML = `<style>@keyframes ncFadeIn{from{opacity:0}to{opacity:1}}@keyframes ncUp{from{opacity:0;transform:translateY(16px) scale(0.97)}to{opacity:1;transform:none}}</style>
            <div style="background:linear-gradient(145deg,#0e0e1a,#14102a);border:1px solid rgba(168,85,247,0.25);border-radius:20px;padding:1.75rem;width:100%;max-width:360px;margin:0 1rem;box-shadow:0 32px 80px rgba(0,0,0,0.7);animation:ncUp 0.28s cubic-bezier(0.34,1.2,0.64,1);font-family:'DM Sans',sans-serif;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem;">
                    <div style="font-family:'Syne',sans-serif;font-size:1rem;font-weight:900;color:white;">🔍 Análise</div>
                    <button onclick="document.getElementById('pwd-analyze-modal').remove()" style="width:28px;height:28px;border-radius:8px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);cursor:pointer;font-size:13px;">✕</button>
                </div>
                <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:1rem;margin-bottom:0.75rem;">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.625rem;">
                        <span style="font-size:0.72rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.3);">Força</span>
                        <span style="font-size:0.85rem;font-weight:800;color:${info.color};">${info.label} · ${s}/100</span>
                    </div>
                    <div style="height:4px;background:rgba(255,255,255,0.08);border-radius:99px;overflow:hidden;">
                        <div style="height:100%;width:${s}%;background:${info.color};border-radius:99px;"></div>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-bottom:0.75rem;">
                    ${[['Comprimento',len+' chars'],['Tempo p/ quebrar',crackTime],['Maiúsculas',hasUpper?'✅':'❌'],['Minúsculas',hasLower?'✅':'❌'],['Números',hasNum?'✅':'❌'],['Símbolos',hasSym?'✅':'❌']].map(([k,v])=>`
                    <div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:0.625rem;">
                        <div style="font-size:0.65rem;color:rgba(255,255,255,0.3);font-weight:600;margin-bottom:0.2rem;">${k}</div>
                        <div style="font-size:0.82rem;font-weight:700;color:white;">${v}</div>
                    </div>`).join('')}
                </div>
                ${recs.length?`<div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:10px;padding:0.75rem;margin-bottom:0.75rem;"><div style="font-size:0.68rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:rgba(245,158,11,0.7);margin-bottom:0.5rem;">Recomendações</div>${recs.map(r=>`<div style="font-size:0.75rem;color:rgba(255,255,255,0.5);margin-bottom:0.2rem;">• ${r}</div>`).join('')}</div>`:`<div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);border-radius:10px;padding:0.75rem;margin-bottom:0.75rem;"><div style="font-size:0.82rem;font-weight:700;color:#22c55e;">✅ Senha excelente!</div></div>`}
                <button onclick="document.getElementById('pwd-analyze-modal').remove()" style="width:100%;padding:0.6rem;background:rgba(168,85,247,0.15);border:1px solid rgba(168,85,247,0.25);border-radius:10px;color:#c084fc;font-size:0.82rem;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;">Fechar</button>
            </div>`;
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
        document.body.appendChild(modal);
    },

    calculateStrength() {
        if (this.config.mode === 'passphrase') {
            return this.config.length >= 6 ? 90 : this.config.length >= 5 ? 80 : this.config.length >= 4 ? 65 : 45;
        }
        return Math.min(Math.min(this.config.length * 2, 40) + ['uppercase','lowercase','numbers','symbols'].filter(t => this.config[t]).length * 15, 100);
    },

    getStrengthInfo(s) { return Object.values(this.STRENGTH).find(x => s >= x.min); },

    loadHistory() {
        try { const s = localStorage.getItem('password_history'); if (s) this.state.history = JSON.parse(s); } catch (_) {}
    },

    saveHistoryToStorage() {
        try { localStorage.setItem('password_history', JSON.stringify(this.state.history)); } catch (_) {}
    },

    init() { this.loadHistory(); }
};

window.PasswordGenerator = PasswordGenerator;
