// Gerador de Senhas ESTILIZADO
const PasswordGenerator = {
    config: {
        length: 16,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true
    },
    
    generatedPassword: '',
    
    render() {
        return `
            <div class="max-w-3xl mx-auto">
                <div class="text-center mb-8">
                    <h1 class="text-5xl font-black text-gray-800 mb-3">🔑 Gerador de Senhas</h1>
                    <p class="text-gray-600 text-lg">Crie senhas fortes e seguras em segundos</p>
                </div>
                
                <div class="bg-white rounded-2xl shadow-2xl p-8 mb-6">
                    <div class="card-header text-center mb-6">
                        <div class="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                            <span class="text-blue-600">⚙️</span>
                            <span class="text-blue-900 font-bold">Configurações</span>
                        </div>
                    </div>
                    
                    <!-- Length Slider -->
                    <div class="mb-8">
                        <div class="flex justify-between items-center mb-3">
                            <label class="text-gray-700 font-bold text-lg">Comprimento</label>
                            <div class="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 rounded-lg font-black text-xl shadow-lg">
                                <span id="length-display">${this.config.length}</span>
                            </div>
                        </div>
                        <input type="range" id="password-length" min="8" max="64" value="${this.config.length}" 
                            class="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider">
                        <div class="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Fraca (8)</span>
                            <span>Média (16)</span>
                            <span>Forte (32)</span>
                            <span>Muito Forte (64)</span>
                        </div>
                    </div>
                    
                    <!-- Checkboxes Grid -->
                    <div class="grid grid-cols-2 gap-4 mb-8">
                        <label class="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl cursor-pointer hover:border-blue-400 transition-all group">
                            <input type="checkbox" id="uppercase" ${this.config.uppercase ? 'checked' : ''} class="w-6 h-6 accent-blue-600">
                            <div>
                                <span class="font-bold text-gray-800 block">Maiúsculas</span>
                                <span class="text-xs text-gray-600">A-Z</span>
                            </div>
                        </label>
                        <label class="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl cursor-pointer hover:border-green-400 transition-all group">
                            <input type="checkbox" id="lowercase" ${this.config.lowercase ? 'checked' : ''} class="w-6 h-6 accent-green-600">
                            <div>
                                <span class="font-bold text-gray-800 block">Minúsculas</span>
                                <span class="text-xs text-gray-600">a-z</span>
                            </div>
                        </label>
                        <label class="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl cursor-pointer hover:border-purple-400 transition-all group">
                            <input type="checkbox" id="numbers" ${this.config.numbers ? 'checked' : ''} class="w-6 h-6 accent-purple-600">
                            <div>
                                <span class="font-bold text-gray-800 block">Números</span>
                                <span class="text-xs text-gray-600">0-9</span>
                            </div>
                        </label>
                        <label class="flex items-center gap-3 p-4 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl cursor-pointer hover:border-orange-400 transition-all group">
                            <input type="checkbox" id="symbols" ${this.config.symbols ? 'checked' : ''} class="w-6 h-6 accent-orange-600">
                            <div>
                                <span class="font-bold text-gray-800 block">Símbolos</span>
                                <span class="text-xs text-gray-600">!@#$%</span>
                            </div>
                        </label>
                    </div>
                    
                    <!-- Generate Button -->
                    <button onclick="PasswordGenerator.generate()" 
                            class="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-5 rounded-xl font-bold text-xl shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 mb-6">
                        <span class="text-3xl">🎲</span>
                        <span>Gerar Senha Segura</span>
                    </button>
                    
                    <!-- Password Result -->
                    <div id="password-result" class="hidden animate-fadeIn">
                        <div class="bg-gradient-to-br from-green-50 to-emerald-50 border-3 border-green-300 rounded-2xl p-6 shadow-inner">
                            <div class="flex items-center justify-between mb-4">
                                <code class="text-2xl font-mono font-bold text-gray-800 break-all flex-1 select-all" id="generated-password"></code>
                                <button onclick="PasswordGenerator.copy()" 
                                        class="ml-4 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-xl transform hover:scale-110 active:scale-95 transition-all flex items-center gap-2 shrink-0">
                                    <span>📋</span>
                                    <span>Copiar</span>
                                </button>
                            </div>
                            <div class="flex items-center justify-between">
                                <div id="password-strength" class="font-bold text-lg"></div>
                                <button onclick="PasswordGenerator.generate()" 
                                        class="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 transition-colors">
                                    <span>🔄</span>
                                    <span>Gerar Nova</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Tips Card -->
                <div class="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-8 text-white shadow-2xl">
                    <div class="flex items-start gap-4">
                        <div class="text-5xl">💡</div>
                        <div>
                            <h3 class="text-2xl font-black mb-4">Dicas de Segurança</h3>
                            <ul class="space-y-2 text-blue-50">
                                <li class="flex items-center gap-2">
                                    <span class="text-xl">✓</span>
                                    <span>Use senhas diferentes para cada site</span>
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-xl">✓</span>
                                    <span>Senhas com 16+ caracteres são mais seguras</span>
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-xl">✓</span>
                                    <span>Inclua todos os tipos de caracteres</span>
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-xl">✓</span>
                                    <span>Nunca compartilhe suas senhas</span>
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-xl">✓</span>
                                    <span>Use um gerenciador de senhas</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    init() {
        // Listener para o slider de comprimento
        document.getElementById('password-length')?.addEventListener('input', (e) => {
            this.config.length = parseInt(e.target.value);
            document.getElementById('length-display').textContent = this.config.length;
        });
        
        // Listeners para checkboxes
        ['uppercase', 'lowercase', 'numbers', 'symbols'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', (e) => {
                this.config[id] = e.target.checked;
            });
        });
    },
    
    generate() {
        const chars = {
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        };
        
        let availableChars = '';
        Object.keys(this.config).forEach(key => {
            if (this.config[key] && chars[key]) {
                availableChars += chars[key];
            }
        });
        
        if (!availableChars) {
            availableChars = chars.lowercase;
            Utils.showNotification('⚠️ Selecione ao menos um tipo de caractere', 'warning');
        }
        
        let password = '';
        for (let i = 0; i < this.config.length; i++) {
            password += availableChars.charAt(Math.floor(Math.random() * availableChars.length));
        }
        
        this.generatedPassword = password;
        this.displayPassword();
    },
    
    displayPassword() {
        const resultDiv = document.getElementById('password-result');
        resultDiv.classList.remove('hidden');
        document.getElementById('generated-password').textContent = this.generatedPassword;
        
        // Calcular força da senha
        const strength = this.calculateStrength();
        const strengthEl = document.getElementById('password-strength');
        
        if (strength >= 80) {
            strengthEl.innerHTML = '<span class="flex items-center gap-2"><span class="text-2xl">🟢</span><span class="text-green-700">Muito Forte</span></span>';
        } else if (strength >= 60) {
            strengthEl.innerHTML = '<span class="flex items-center gap-2"><span class="text-2xl">🔵</span><span class="text-blue-700">Forte</span></span>';
        } else if (strength >= 40) {
            strengthEl.innerHTML = '<span class="flex items-center gap-2"><span class="text-2xl">🟡</span><span class="text-yellow-700">Média</span></span>';
        } else {
            strengthEl.innerHTML = '<span class="flex items-center gap-2"><span class="text-2xl">🔴</span><span class="text-red-700">Fraca</span></span>';
        }
        
        // Scroll suave até o resultado
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    },
    
    calculateStrength() {
        let strength = 0;
        
        // Comprimento
        strength += Math.min(this.config.length * 2, 40);
        
        // Variedade de caracteres
        if (this.config.uppercase) strength += 15;
        if (this.config.lowercase) strength += 15;
        if (this.config.numbers) strength += 15;
        if (this.config.symbols) strength += 15;
        
        return Math.min(strength, 100);
    },
    
    copy() {
        Utils.copyToClipboard(this.generatedPassword);
    }
};

window.PasswordGenerator = PasswordGenerator;