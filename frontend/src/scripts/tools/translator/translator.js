// Tradutor PREMIUM - Versão Otimizada
const Translator = {
    sourceLang: 'en',
    targetLang: 'pt',
    isTranslating: false,
    
    languages: [
        { code: 'pt', name: 'Português', flag: '🇧🇷', gradient: 'from-green-400 to-yellow-400' },
        { code: 'en', name: 'Inglês', flag: '🇺🇸', gradient: 'from-blue-500 to-red-500' },
        { code: 'es', name: 'Espanhol', flag: '🇪🇸', gradient: 'from-red-500 to-yellow-500' },
        { code: 'fr', name: 'Francês', flag: '🇫🇷', gradient: 'from-blue-600 to-red-600' },
        { code: 'de', name: 'Alemão', flag: '🇩🇪', gradient: 'from-black to-red-600' },
        { code: 'it', name: 'Italiano', flag: '🇮🇹', gradient: 'from-green-500 to-red-500' },
        { code: 'ja', name: 'Japonês', flag: '🇯🇵', gradient: 'from-white to-red-600' },
        { code: 'ko', name: 'Coreano', flag: '🇰🇷', gradient: 'from-blue-500 to-red-500' },
        { code: 'zh', name: 'Chinês', flag: '🇨🇳', gradient: 'from-red-600 to-yellow-400' },
        { code: 'ru', name: 'Russo', flag: '🇷🇺', gradient: 'from-white to-blue-600' },
        { code: 'ar', name: 'Árabe', flag: '🇸🇦', gradient: 'from-green-600 to-white' },
        { code: 'hi', name: 'Hindi', flag: '🇮🇳', gradient: 'from-orange-500 to-green-500' }
    ],
    
    render() {
        const [sourceLang, targetLang] = this.getCurrentLanguages();
        
        return `
            <div class="max-w-7xl mx-auto">
                ${this.renderHeader()}
                ${this.renderMainCard(sourceLang, targetLang)}
                ${this.renderInfoCard()}
            </div>
        `;
    },
    
    // Métodos de render consolidados
    renderHeader() {
        return `
            <div class="text-center mb-10 relative">
                <div class="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-3xl opacity-20 -z-10"></div>
                <div class="inline-block mb-4">
                    <div class="relative">
                        <div class="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-50"></div>
                        <div class="relative text-7xl animate-bounce-slow">🌍</div>
                    </div>
                </div>
                <h1 class="text-6xl font-black mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Tradutor Universal
                </h1>
                <p class="text-gray-600 text-xl font-semibold">Conectando você ao mundo em 12+ idiomas</p>
            </div>
        `;
    },
    
    renderMainCard(sourceLang, targetLang) {
        return `
            <div class="relative">
                <div class="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-20"></div>
                <div class="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 border-white/50">
                    ${this.renderLanguageSelectors(sourceLang, targetLang)}
                    ${this.renderTextAreas()}
                    ${this.renderActionButtons()}
                </div>
            </div>
        `;
    },
    
    renderLanguageSelectors(sourceLang, targetLang) {
        return `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                ${this.renderLangSelect('source', sourceLang, 'DE:', 'blue')}
                ${this.renderSwapButton()}
                ${this.renderLangSelect('target', targetLang, 'PARA:', 'green')}
            </div>
        `;
    },
    
    renderLangSelect(type, lang, label, color) {
        const colorClass = color === 'blue' ? 'from-blue-50 to-cyan-50 border-blue-200' : 'from-green-50 to-emerald-50 border-green-200';
        
        return `
            <div class="relative group">
                <label class="block text-gray-800 font-black mb-3 text-lg flex items-center gap-3">
                    <div class="w-10 h-10 bg-gradient-to-br ${lang.gradient} rounded-xl flex items-center justify-center text-2xl shadow-lg transform group-hover:scale-110 transition-all">
                        ${lang.flag}
                    </div>
                    <span>${label}</span>
                </label>
                <select id="${type}-lang" class="w-full px-6 py-4 bg-gradient-to-br ${colorClass} border-3 rounded-2xl focus:border-${color}-500 focus:ring-4 focus:ring-${color}-200 outline-none transition-all text-lg font-bold cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105">
                    ${this.languages.map(l => `<option value="${l.code}" ${this[type + 'Lang'] === l.code ? 'selected' : ''}>${l.flag} ${l.name}</option>`).join('')}
                </select>
            </div>
        `;
    },
    
    renderSwapButton() {
        return `
            <div class="flex items-end justify-center">
                <button onclick="Translator.swap()" 
                        class="group w-full md:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transform hover:scale-110 hover:rotate-180 transition-all duration-500 flex items-center justify-center gap-3">
                    <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                    </svg>
                    <span class="hidden md:inline">Inverter</span>
                </button>
            </div>
        `;
    },
    
    renderTextAreas() {
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                ${this.renderTextArea('source', 'blue', 'TEXTO ORIGINAL', '✍️', false)}
                ${this.renderTextArea('translated', 'green', 'TRADUÇÃO', '✨', true)}
            </div>
        `;
    },
    
    renderTextArea(type, color, label, icon, readonly) {
        const isSource = type === 'source';
        const colorGradient = color === 'blue' ? 'from-blue-50 via-cyan-50 to-blue-100 border-blue-300' : 'from-green-50 via-emerald-50 to-green-100 border-green-300';
        
        return `
            <div class="relative group">
                <label class="block text-gray-800 font-black mb-4 flex items-center gap-3 text-lg">
                    <div class="w-10 h-10 bg-gradient-to-br from-${color}-500 to-${color === 'blue' ? 'cyan' : 'emerald'}-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        ${icon}
                    </div>
                    <span>${label}</span>
                    ${!isSource ? '<span id="translation-status" class="ml-auto"></span>' : ''}
                </label>
                <div class="relative">
                    <textarea id="${type}-text" 
                        class="w-full h-80 px-6 py-6 bg-gradient-to-br ${colorGradient} border-3 rounded-2xl ${isSource ? 'focus:border-' + color + '-500 focus:ring-4 focus:ring-' + color + '-200' : ''} outline-none transition-all resize-none text-lg leading-relaxed shadow-inner font-${isSource ? 'semibold' : 'bold'}" 
                        ${readonly ? 'readonly' : ''}
                        placeholder="${isSource ? 'Digite ou cole seu texto aqui...\n\n💡 Dica: A tradução acontece automaticamente enquanto você digita!' : 'A tradução aparecerá aqui...'}"></textarea>
                    <div class="absolute bottom-4 right-4 ${isSource ? 'bg-blue-600' : 'flex gap-2'}">
                        ${isSource ? '<div id="source-char-count" class="text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg">0 caracteres</div>' : `
                            <button onclick="Translator.copy()" 
                                    class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-110 transition-all flex items-center gap-2">
                                <span class="text-xl">📋</span>
                                <span>Copiar</span>
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    },
    
    renderActionButtons() {
        const buttons = [
            { onclick: 'translate()', icon: '🔄', label: 'Traduzir', color: 'from-blue-600 to-cyan-600' },
            { onclick: 'clear()', icon: '🗑️', label: 'Limpar', color: 'from-gray-600 to-gray-700' },
            { onclick: "speak('source')", icon: '🔊', label: 'Ouvir', color: 'from-purple-600 to-pink-600' },
            { onclick: "speak('target')", icon: '🎵', label: 'Ouvir', color: 'from-orange-600 to-red-600' }
        ];
        
        return `
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                ${buttons.map(btn => `
                    <button onclick="Translator.${btn.onclick}" 
                            class="bg-gradient-to-r ${btn.color} text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group">
                        <span class="text-2xl">${btn.icon}</span>
                        <span>${btn.label}</span>
                    </button>
                `).join('')}
            </div>
        `;
    },
    
    renderInfoCard() {
        const features = [
            { icon: '✅', text: 'Tradução automática em tempo real enquanto você digita' },
            { icon: '🌍', text: 'Suporte para mais de <strong>12 idiomas</strong> principais' },
            { icon: '🔊', text: 'Síntese de voz para ouvir as traduções' },
            { icon: '⚡', text: 'API <strong>MyMemory</strong> (gratuita e ilimitada para uso pessoal)' }
        ];
        
        return `
            <div class="mt-8 relative">
                <div class="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-30"></div>
                <div class="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
                    <div class="flex items-start gap-6">
                        <div class="text-6xl flex-shrink-0">ℹ️</div>
                        <div>
                            <h3 class="text-3xl font-black mb-4">Sobre a Tradução Premium</h3>
                            <div class="space-y-3 text-lg">
                                ${features.map(f => `
                                    <p class="flex items-center gap-3">
                                        <span class="text-2xl">${f.icon}</span>
                                        <span>${f.text}</span>
                                    </p>
                                `).join('')}
                            </div>
                            <div class="mt-6 p-4 bg-white/20 backdrop-blur-xl rounded-2xl">
                                <p class="text-sm font-semibold">
                                    <strong>💡 Dica Pro:</strong> Para traduções mais precisas e profissionais, configure sua própria API key do Google Translate ou DeepL nas configurações.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Métodos auxiliares consolidados
    getCurrentLanguages() {
        return [
            this.languages.find(l => l.code === this.sourceLang),
            this.languages.find(l => l.code === this.targetLang)
        ];
    },
    
    updateUI() {
        const input = document.getElementById('source-text');
        const counter = document.getElementById('source-char-count');
        
        if (input && counter) {
            const count = input.value.length;
            counter.textContent = `${count} caracteres`;
            if (count > 3) this.autoTranslate();
        }
    },
    
    init() {
        ['source-lang', 'target-lang'].forEach((id, idx) => {
            document.getElementById(id)?.addEventListener('change', (e) => {
                this[idx === 0 ? 'sourceLang' : 'targetLang'] = e.target.value;
                Router.render();
            });
        });
        
        const sourceText = document.getElementById('source-text');
        if (sourceText) {
            sourceText.addEventListener('input', (e) => {
                this.updateUI();
            });
        }
    },
    
    autoTranslate: Utils.debounce(function() {
        Translator.translate();
    }, 1000),
    
    async translate() {
        const sourceText = document.getElementById('source-text')?.value;
        const translatedText = document.getElementById('translated-text');
        const statusSpan = document.getElementById('translation-status');
        
        if (!sourceText || !translatedText) return;
        
        if (!sourceText.trim()) {
            translatedText.value = '';
            statusSpan.innerHTML = '';
            return;
        }
        
        if (this.sourceLang === this.targetLang) {
            translatedText.value = sourceText;
            statusSpan.innerHTML = '<span class="text-yellow-600 font-bold flex items-center gap-2"><span>⚠️</span><span>Idiomas iguais</span></span>';
            return;
        }
        
        this.isTranslating = true;
        translatedText.value = '⏳ Traduzindo...';
        statusSpan.innerHTML = '<span class="text-blue-600 font-bold flex items-center gap-2 animate-pulse"><span>🔄</span><span>Traduzindo...</span></span>';
        
        try {
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceText)}&langpair=${this.sourceLang}|${this.targetLang}`;
            const data = await Utils.fetchAPI(url);
            
            if (data?.responseData?.translatedText) {
                translatedText.value = data.responseData.translatedText;
                statusSpan.innerHTML = '<span class="text-green-600 font-bold flex items-center gap-2"><span>✅</span><span>Concluído!</span></span>';
                setTimeout(() => statusSpan.innerHTML = '', 2000);
            } else {
                throw new Error('Erro na tradução');
            }
        } catch (error) {
            translatedText.value = '❌ Erro ao traduzir. Tente novamente.';
            statusSpan.innerHTML = '<span class="text-red-600 font-bold flex items-center gap-2"><span>❌</span><span>Erro!</span></span>';
            Utils.showNotification('❌ Erro ao traduzir texto', 'error');
        } finally {
            this.isTranslating = false;
        }
    },
    
    swap() {
        const sourceText = document.getElementById('source-text');
        const translatedText = document.getElementById('translated-text');
        
        [sourceText.value, translatedText.value] = [translatedText.value, ''];
        [this.sourceLang, this.targetLang] = [this.targetLang, this.sourceLang];
        
        Utils.showNotification('🔄 Idiomas invertidos!', 'info');
        Router.render();
    },
    
    copy() {
        const text = document.getElementById('translated-text')?.value;
        if (text && text !== '⏳ Traduzindo...' && !text.startsWith('❌')) {
            Utils.copyToClipboard(text);
        } else {
            Utils.showNotification('❌ Nada para copiar', 'error');
        }
    },
    
    clear() {
        ['source-text', 'translated-text'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        
        const counter = document.getElementById('source-char-count');
        const status = document.getElementById('translation-status');
        
        if (counter) counter.textContent = '0 caracteres';
        if (status) status.innerHTML = '';
        
        Utils.showNotification('🗑️ Textos limpos!', 'info');
    },
    
    speak(which) {
        if (!window.speechSynthesis) {
            Utils.showNotification('❌ Síntese de voz não suportada', 'error');
            return;
        }
        
        const text = document.getElementById(which === 'source' ? 'source-text' : 'translated-text')?.value;
        const lang = which === 'source' ? this.sourceLang : this.targetLang;
        
        if (!text || text === '⏳ Traduzindo...' || text.startsWith('❌')) {
            Utils.showNotification('❌ Nenhum texto para ouvir', 'error');
            return;
        }
        
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.getLangCode(lang);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        
        utterance.onstart = () => Utils.showNotification('🔊 Reproduzindo áudio...', 'info');
        utterance.onerror = () => Utils.showNotification('❌ Erro ao reproduzir áudio', 'error');
        
        window.speechSynthesis.speak(utterance);
    },
    
    getLangCode(code) {
        const map = {
            pt: 'pt-BR', en: 'en-US', es: 'es-ES', fr: 'fr-FR',
            de: 'de-DE', it: 'it-IT', ja: 'ja-JP', ko: 'ko-KR',
            zh: 'zh-CN', ru: 'ru-RU', ar: 'ar-SA', hi: 'hi-IN'
        };
        return map[code] || code;
    }
};

window.Translator = Translator;