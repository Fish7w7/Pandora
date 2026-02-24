// GERADOR DE SENHAS ULTRA OTIMIZADO
// Performance maximizada + features completas

const PasswordGenerator = {
    config: {
        length: 16,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true
    },
    
    state: {
        currentPassword: '',
        history: [],
        maxHistory: 10
    },
    
    // Cache de elementos DOM
    cache: {},
    
    // Conjuntos de caracteres (imutáveis)
    CHAR_SETS: Object.freeze({
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    }),
    
    // Configurações de força (imutáveis)
    STRENGTH: Object.freeze({
        veryStrong: { min: 80, emoji: '🟢', label: 'Muito Forte', color: 'green', gradient: 'from-green-500 to-emerald-600' },
        strong: { min: 60, emoji: '🔵', label: 'Forte', color: 'blue', gradient: 'from-blue-500 to-cyan-600' },
        medium: { min: 40, emoji: '🟡', label: 'Média', color: 'yellow', gradient: 'from-yellow-500 to-orange-600' },
        weak: { min: 0, emoji: '🔴', label: 'Fraca', color: 'red', gradient: 'from-red-500 to-pink-600' }
    }),
    
    // Templates HTML otimizados
    templates: {
        checkboxOption(opt) {
            // Cores por cor — inline style para funcionar igual em light E dark mode
            const palettes = {
                blue:   { border: '#2563eb', gradFrom: '#eff6ff', gradTo: '#dbeafe', badge: '#2563eb' },
                green:  { border: '#16a34a', gradFrom: '#f0fdf4', gradTo: '#dcfce7', badge: '#16a34a' },
                purple: { border: '#7c3aed', gradFrom: '#f5f3ff', gradTo: '#ede9fe', badge: '#7c3aed' },
                orange: { border: '#ea580c', gradFrom: '#fff7ed', gradTo: '#fed7aa', badge: '#ea580c' }
            };
            const p = palettes[opt.color] || palettes.blue;

            const cardStyleOn  = `border: 4px solid ${p.border}; background: linear-gradient(135deg, ${p.gradFrom}, ${p.gradTo}); box-shadow: 0 20px 40px -12px rgba(0,0,0,0.15);`;
            const cardStyleOff = `border: 4px solid #d1d5db; background: #ffffff;`;
            const badgeStyleOn  = `background: ${p.badge}; opacity: 1; transform: scale(1);`;
            const badgeStyleOff = `background: ${p.badge}; opacity: 0; transform: scale(0.7);`;

            const cardStyle  = opt.checked ? cardStyleOn  : cardStyleOff;
            const badgeStyle = opt.checked ? badgeStyleOn : badgeStyleOff;

            return `
                <div class="pwd-card relative overflow-hidden rounded-2xl cursor-pointer transition-shadow hover:shadow-xl"
                     id="card_${opt.id}"
                     data-id="${opt.id}"
                     data-on="${cardStyleOn.replace(/"/g, '&quot;')}"
                     data-off="${cardStyleOff.replace(/"/g, '&quot;')}"
                     onclick="PasswordGenerator._cardClick(this)"
                     style="${cardStyle}">

                    <input type="checkbox" id="${opt.id}" ${opt.checked ? 'checked' : ''} class="sr-only">

                    <div class="flex items-center gap-4 p-6">
                        <div class="text-5xl">${opt.icon}</div>
                        <div class="flex-1">
                            <div class="font-black text-xl mb-1" style="color:#1f2937">${opt.label}</div>
                            <div class="text-sm mb-2" style="color:#4b5563">${opt.desc}</div>
                            <div class="font-mono font-bold text-lg" style="color:#6b7280">${opt.example}</div>
                        </div>
                    </div>

                    <div class="pwd-badge absolute top-4 right-4 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg pointer-events-none transition-all"
                         style="${badgeStyle}">
                        ✓ ATIVO
                    </div>
                </div>
            `;
        },
        
        historyItem(item, index, strengthInfo) {
            return `
                <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-200 hover:border-gray-300 transition-all">
                    <div class="flex items-center gap-4">
                        <div class="text-3xl">${strengthInfo.emoji}</div>
                        <code class="flex-1 font-mono font-bold text-gray-800 break-all text-sm">${item.password}</code>
                        <button onclick="PasswordGenerator.copyFromHistory(${index})" 
                                class="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transform hover:scale-105 transition-all">
                            📋
                        </button>
                    </div>
                    <div class="flex items-center justify-between mt-3 pt-3 border-t-2 border-gray-200">
                        <span class="text-sm font-bold text-${strengthInfo.color}-700">${strengthInfo.label}</span>
                        <span class="text-xs text-gray-500">${item.date}</span>
                    </div>
                </div>
            `;
        }
    },
    
    // Renderização principal
    render() {
        return `
            <div class="max-w-4xl mx-auto">
                ${this.renderHeader()}
                ${this.renderMainCard()}
                ${this.renderHistory()}
                ${this.renderTips()}
            </div>
        `;
    },
    
    renderHeader() {
        return `
            <div class="text-center mb-8">
                <div class="inline-block mb-4">
                    <div class="relative">
                        <div class="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full blur-xl opacity-50"></div>
                        <div class="relative text-7xl animate-bounce-slow">🔐</div>
                    </div>
                </div>
                <h1 class="text-5xl font-black mb-3 bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 bg-clip-text text-transparent">
                    Gerador de Senhas
                </h1>
                <p class="text-gray-600 text-lg font-semibold">Crie senhas ultra-seguras にゃん~</p>
            </div>
        `;
    },
    
    renderMainCard() {
        const strengthInfo = this.getStrengthInfo(this.calculateStrength());
        
        return `
            <div class="relative mb-8">
                <div class="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-20"></div>
                <div class="relative bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100">
                    
                    <!-- Header -->
                    <div class="text-center mb-6">
                        <div class="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-3 rounded-full border-2 border-blue-200">
                            <span class="text-2xl">⚙️</span>
                            <span class="text-blue-900 font-black text-lg">Configurações</span>
                        </div>
                    </div>
                    
                    <!-- Length Slider -->
                    <div class="mb-8">
                        <div class="flex justify-between items-center mb-4">
                            <label class="text-gray-800 font-black text-xl">Comprimento</label>
                            <div class="bg-gradient-to-r ${strengthInfo.gradient} text-white px-6 py-3 rounded-xl font-black text-2xl shadow-lg">
                                <span id="length-display">${this.config.length}</span>
                            </div>
                        </div>
                        
                        <input type="range" id="password-length" min="8" max="64" value="${this.config.length}" 
                            class="w-full h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400 rounded-full appearance-none cursor-pointer slider shadow-inner">
                        
                        <div class="flex justify-between text-sm font-bold text-gray-600 mt-3">
                            <span>🔴 Fraca (8)</span>
                            <span>🟡 Média (16)</span>
                            <span>🔵 Forte (32)</span>
                            <span>🟢 Ultra (64)</span>
                        </div>
                    </div>
                    
                    <!-- Checkboxes -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        ${this.renderCheckboxes()}
                    </div>
                    
                    <!-- Generate Button -->
                    <button onclick="PasswordGenerator.generate()" 
                            class="group w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-6 rounded-2xl font-black text-2xl shadow-2xl hover:shadow-pink-500/50 transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 mb-8 relative overflow-hidden">
                        <div class="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span class="relative text-4xl">🎲</span>
                        <span class="relative">Gerar Senha Segura</span>
                        <span class="relative text-2xl">✨</span>
                    </button>
                    
                    <!-- Result -->
                    <div id="password-result" class="hidden">
                        ${this.renderResult()}
                    </div>
                </div>
            </div>
        `;
    },
    
    renderCheckboxes() {
        const options = [
            { id: 'uppercase', label: 'Maiúsculas', desc: 'A-Z', example: 'ABCD', color: 'blue', checked: this.config.uppercase, icon: '🔠' },
            { id: 'lowercase', label: 'Minúsculas', desc: 'a-z', example: 'abcd', color: 'green', checked: this.config.lowercase, icon: '🔡' },
            { id: 'numbers', label: 'Números', desc: '0-9', example: '1234', color: 'purple', checked: this.config.numbers, icon: '🔢' },
            { id: 'symbols', label: 'Símbolos', desc: '!@#$%', example: '!@#$', color: 'orange', checked: this.config.symbols, icon: '🔣' }
        ];
        
        return options.map(opt => this.templates.checkboxOption(opt)).join('');
    },
    
    renderResult() {
        return `
            <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 mb-6 shadow-inner border-2 border-gray-700">
                <div class="flex items-center justify-between mb-4 flex-wrap gap-4">
                    <code class="text-2xl md:text-3xl font-mono font-black text-green-400 break-all flex-1 select-all tracking-wider" id="generated-password"></code>
                    <button onclick="PasswordGenerator.copy()" 
                            class="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-black shadow-xl hover:shadow-2xl transform hover:scale-110 active:scale-95 transition-all flex items-center gap-2">
                        <span class="text-xl">📋</span>
                        <span>Copiar</span>
                    </button>
                </div>
                
                <div class="flex items-center justify-between mb-4">
                    <div id="password-strength" class="font-black text-xl"></div>
                    <button onclick="PasswordGenerator.generate()" 
                            class="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-2">
                        <span>🔄</span>
                        <span>Nova</span>
                    </button>
                </div>
                
                <div id="strength-meter" class="bg-gray-700 rounded-full h-6 overflow-hidden shadow-inner"></div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <button onclick="PasswordGenerator.saveToHistory()" 
                        class="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center gap-2">
                    <span class="text-xl">💾</span>
                    <span>Salvar</span>
                </button>
                
                <button onclick="PasswordGenerator.analyzePassword()" 
                        class="px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center gap-2">
                    <span class="text-xl">🔍</span>
                    <span>Analisar</span>
                </button>
            </div>
        `;
    },
    
    renderHistory() {
        if (this.state.history.length === 0) return '';
        
        const historyItems = this.state.history.map((item, i) => {
            const info = this.getStrengthInfo(item.strength);
            return this.templates.historyItem(item, i, info);
        }).join('');
        
        return `
            <div class="bg-white rounded-3xl shadow-2xl p-8 mb-8 border-2 border-gray-100">
                <div class="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <h2 class="text-2xl md:text-3xl font-black text-gray-800 flex items-center gap-3">
                        <span class="text-4xl">📜</span>
                        <span>Histórico</span>
                        <span class="text-lg font-normal text-gray-500">(${this.state.history.length})</span>
                    </h2>
                    <button onclick="PasswordGenerator.clearHistory()" 
                            class="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl font-bold transition-all">
                        🗑️ Limpar
                    </button>
                </div>
                
                <div class="space-y-3">
                    ${historyItems}
                </div>
            </div>
        `;
    },
    
    renderTips() {
        const tips = [
            { icon: '🔐', title: 'Senhas Únicas', desc: 'Uma senha diferente por conta' },
            { icon: '📏', title: 'Comprimento', desc: 'Mínimo 16 caracteres' },
            { icon: '🔠', title: 'Variedade', desc: 'Misture tipos de caracteres' },
            { icon: '🚫', title: 'Evite Padrões', desc: 'Sem dados pessoais' },
            { icon: '💾', title: 'Gerenciador', desc: 'Use um gerenciador confiável' },
            { icon: '🔄', title: 'Atualize', desc: 'Mude regularmente' }
        ];
        
        return `
            <div class="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
                <div class="flex items-start gap-4 mb-6">
                    <div class="text-6xl">💡</div>
                    <div>
                        <h3 class="text-3xl font-black mb-2">Dicas de Segurança</h3>
                        <p class="text-blue-100 text-lg">Proteja suas contas にゃん~</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${tips.map(tip => `
                        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                            <div class="text-4xl mb-2">${tip.icon}</div>
                            <div class="font-bold text-lg mb-1">${tip.title}</div>
                            <div class="text-sm text-blue-100">${tip.desc}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    

    // Toggle de card — funciona igual em light e dark mode
    _cardClick(card) {
        const id = card.dataset.id;
        const checkbox = document.getElementById(id);
        if (!checkbox) return;

        const checked = !checkbox.checked;
        checkbox.checked = checked;
        this.config[id] = checked;

        card.style.cssText = checked ? card.dataset.on : card.dataset.off;

        const badge = card.querySelector('.pwd-badge');
        if (badge) {
            badge.style.opacity   = checked ? '1' : '0';
            badge.style.transform = checked ? 'scale(1)' : 'scale(0.7)';
        }
    },

    // Inicialização
    init() {
        this.loadHistory();
        this.cacheElements();
        this.attachListeners();
    },
    
    cacheElements() {
        this.cache = {
            lengthSlider: document.getElementById('password-length'),
            lengthDisplay: document.getElementById('length-display'),
            uppercase: document.getElementById('uppercase'),
            lowercase: document.getElementById('lowercase'),
            numbers: document.getElementById('numbers'),
            symbols: document.getElementById('symbols'),
            result: document.getElementById('password-result'),
            password: document.getElementById('generated-password'),
            strength: document.getElementById('password-strength'),
            meter: document.getElementById('strength-meter')
        };
    },
    
    attachListeners() {
        // Slider otimizado com requestAnimationFrame
        let rafId = null;
        this.cache.lengthSlider?.addEventListener('input', (e) => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                this.config.length = parseInt(e.target.value);
                if (this.cache.lengthDisplay) {
                    this.cache.lengthDisplay.textContent = this.config.length;
                }
            });
        });  
    },
    
    // Geração de senha com crypto API
    generate() {
        const chars = this.buildCharset();
        
        if (!chars) {
            this.config.lowercase = true;
            if (this.cache.lowercase) this.cache.lowercase.checked = true;
            Utils.showNotification('⚠️ Selecione ao menos um tipo', 'warning');
            return this.generate();
        }
        
        this.state.currentPassword = this.generateSecurePassword(chars);
        this.displayPassword();
        Utils.showNotification('✅ Senha gerada!', 'success');
    },
    
    buildCharset() {
        return Object.keys(this.CHAR_SETS)
            .filter(key => this.config[key])
            .map(key => this.CHAR_SETS[key])
            .join('');
    },
    
    generateSecurePassword(chars) {
        const length = this.config.length;
        const array = new Uint32Array(length);
        
        // Usa crypto API para segurança máxima
        crypto.getRandomValues(array);
        
        return Array.from(array, num => chars[num % chars.length]).join('');
    },
    
    displayPassword() {
        this.cache.result?.classList.remove('hidden');
        if (this.cache.password) {
            this.cache.password.textContent = this.state.currentPassword;
        }
        
        this.updateStrength();
        
        setTimeout(() => {
            this.cache.result?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    },
    
    updateStrength() {
        const strength = this.calculateStrength();
        const info = this.getStrengthInfo(strength);
        
        // Atualiza display
        if (this.cache.strength) {
            this.cache.strength.innerHTML = `
                <span class="flex items-center gap-2">
                    <span class="text-3xl">${info.emoji}</span>
                    <span class="text-${info.color}-400">${info.label}</span>
                    <span class="text-gray-400">(${strength})</span>
                </span>
            `;
        }
        
        // Atualiza meter
        if (this.cache.meter) {
            this.cache.meter.innerHTML = `
                <div class="bg-gradient-to-r ${info.gradient} h-full transition-all duration-1000 flex items-center justify-end px-3" 
                     style="width: ${strength}%">
                    <span class="text-white font-bold text-sm">${strength}%</span>
                </div>
            `;
        }
    },
    
    calculateStrength() {
        let score = Math.min(this.config.length * 2, 40);
        
        const types = ['uppercase', 'lowercase', 'numbers', 'symbols'];
        score += types.filter(t => this.config[t]).length * 15;
        
        return Math.min(score, 100);
    },
    
    getStrengthInfo(strength) {
        return Object.values(this.STRENGTH).find(s => strength >= s.min);
    },
    
    // Ações
    copy() {
        if (!this.state.currentPassword) {
            Utils?.showNotification('❌ Nenhuma senha gerada', 'error');
            return;
        }
        
        // Tenta usar a API moderna primeiro
        navigator.clipboard.writeText(this.state.currentPassword).then(() => {
            Utils?.showNotification('📋 Senha copiada!', 'success');
        }).catch(() => {
            // Fallback para método compatível com navegadores antigos
            const textarea = document.createElement('textarea');
            textarea.value = this.state.currentPassword;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                Utils?.showNotification('📋 Senha copiada!', 'success');
            } catch (err) {
                Utils?.showNotification('❌ Erro ao copiar', 'error');
            }
            document.body.removeChild(textarea);
        });
    },
    
    saveToHistory() {
        if (!this.state.currentPassword) {
            Utils.showNotification('⚠️ Gere uma senha primeiro', 'warning');
            return;
        }
        
        const item = {
            password: this.state.currentPassword,
            strength: this.calculateStrength(),
            date: new Date().toLocaleString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit', 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        };
        
        this.state.history.unshift(item);
        
        if (this.state.history.length > this.state.maxHistory) {
            this.state.history.pop();
        }
        
        this.saveHistoryToStorage();
        Utils.showNotification('💾 Salva no histórico!', 'success');
        Router.render();
    },
    
    copyFromHistory(index) {
        const item = this.state.history[index];
        if (item && item.password) {
            // Copia para o clipboard
            navigator.clipboard.writeText(item.password).then(() => {
                Utils?.showNotification('📋 Senha copiada do histórico!', 'success');
            }).catch(() => {
                // Fallback para método antigo
                const textarea = document.createElement('textarea');
                textarea.value = item.password;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    document.execCommand('copy');
                    Utils?.showNotification('📋 Senha copiada do histórico!', 'success');
                } catch (err) {
                    Utils?.showNotification('❌ Erro ao copiar', 'error');
                }
                document.body.removeChild(textarea);
            });
        } else {
            Utils?.showNotification('❌ Senha não encontrada', 'error');
        }
    },
    
    clearHistory() {
        if (!confirm('🗑️ Limpar todo o histórico?')) return;
        
        this.state.history = [];
        this.saveHistoryToStorage();
        Utils.showNotification('🗑️ Histórico limpo!', 'info');
        Router.render();
    },
    
    analyzePassword() {
        const strength = this.calculateStrength();
        const info = this.getStrengthInfo(strength);
        
        const types = {
            uppercase: this.config.uppercase,
            lowercase: this.config.lowercase,
            numbers: this.config.numbers,
            symbols: this.config.symbols
        };
        
        const enabledTypes = Object.values(types).filter(Boolean).length;
        
        const message = `
🔍 ANÁLISE DA SENHA

${info.emoji} Força: ${info.label} (${strength}/100)

📊 Composição:
• Comprimento: ${this.config.length} caracteres
• Maiúsculas: ${types.uppercase ? '✅' : '❌'}
• Minúsculas: ${types.lowercase ? '✅' : '❌'}
• Números: ${types.numbers ? '✅' : '❌'}
• Símbolos: ${types.symbols ? '✅' : '❌'}

💡 Variedade: ${enabledTypes}/4 tipos

⏱️ Tempo estimado para quebrar:
${this.estimateCrackTime()}

${this.getRecommendations(strength, enabledTypes)}
        `.trim();
        
        alert(message);
    },
    
    estimateCrackTime() {
        const length = this.config.length;
        const types = ['uppercase', 'lowercase', 'numbers', 'symbols'];
        const enabledTypes = types.filter(t => this.config[t]).length;
        
        if (length < 8) return '⚠️ Segundos a minutos (MUITO FRACA)';
        if (length < 12 && enabledTypes < 3) return '⚠️ Minutos a horas (FRACA)';
        if (length < 16) return '🟡 Dias a semanas (MÉDIA)';
        if (length < 20) return '🔵 Anos (FORTE)';
        return '🟢 Milhões de anos (MUITO FORTE)';
    },
    
    getRecommendations(strength, types) {
        const recs = [];
        
        if (strength < 60) recs.push('• Aumente o comprimento para 16+');
        if (types < 4) recs.push('• Ative todos os tipos de caracteres');
        if (this.config.length < 16) recs.push('• Use no mínimo 16 caracteres');
        
        return recs.length > 0 
            ? `\n🎯 Recomendações:\n${recs.join('\n')}`
            : '\n✅ Excelente! Senha muito segura!';
    },
    
    // Persistência
    loadHistory() {
        try {
            const saved = localStorage.getItem('password_history');
            if (saved) {
                this.state.history = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Erro ao carregar histórico:', e);
        }
    },
    
    saveHistoryToStorage() {
        try {
            localStorage.setItem('password_history', JSON.stringify(this.state.history));
        } catch (e) {
            console.error('Erro ao salvar histórico:', e);
        }
    }
};

// Export global
window.PasswordGenerator = PasswordGenerator;