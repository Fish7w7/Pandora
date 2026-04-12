const Translator = {
    sourceLang: 'en',
    targetLang: 'pt',
    isTranslating: false,

    languages: [
        { code:'pt', name:'Português',  flag:'🇧🇷' },
        { code:'en', name:'Inglês',     flag:'🇺🇸' },
        { code:'es', name:'Espanhol',   flag:'🇪🇸' },
        { code:'fr', name:'Francês',    flag:'🇫🇷' },
        { code:'de', name:'Alemão',     flag:'🇩🇪' },
        { code:'it', name:'Italiano',   flag:'🇮🇹' },
        { code:'ja', name:'Japonês',    flag:'🇯🇵' },
        { code:'ko', name:'Coreano',    flag:'🇰🇷' },
        { code:'zh', name:'Chinês',     flag:'🇨🇳' },
        { code:'ru', name:'Russo',      flag:'🇷🇺' },
        { code:'ar', name:'Árabe',      flag:'🇸🇦' },
        { code:'hi', name:'Hindi',      flag:'🇮🇳' }
    ],

    render() {
        const d = document.body.classList.contains('dark-theme');
        const bg       = d ? 'rgba(255,255,255,0.04)' : '#ffffff';
        const border   = d ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
        const text     = d ? '#e2e8f0' : '#1e293b';
        const subtext  = d ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
        const inputBg  = d ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)';
        const inputBdr = d ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)';
        const selectBg = d ? 'rgba(255,255,255,0.06)' : '#f8fafc';
        const labelClr = d ? 'rgba(255,255,255,0.3)'  : 'rgba(0,0,0,0.35)';

        const srcLang  = this.languages.find(l => l.code === this.sourceLang);
        const tgtLang  = this.languages.find(l => l.code === this.targetLang);
        const selectOpts = (current) => this.languages.map(l =>
            `<option value="${l.code}" ${current === l.code ? 'selected' : ''}>${l.flag} ${l.name}</option>`
        ).join('');

        return `<style>
            .trl-root{max-width:860px;margin:0 auto;font-family:'DM Sans',sans-serif}
            .trl-card{background:${bg};border:1px solid ${border};border-radius:18px;padding:1.5rem;margin-bottom:0.75rem}
            .trl-label{font-size:0.68rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${labelClr};margin-bottom:0.625rem;display:block}
            .trl-select{width:100%;padding:0.625rem 0.875rem;background:${selectBg};border:1px solid ${inputBdr};border-radius:10px;font-size:0.9rem;font-weight:600;color:${text};outline:none;cursor:pointer;font-family:'DM Sans',sans-serif;transition:border-color 0.15s}
            .trl-select:focus{border-color:rgba(168,85,247,0.5)}
            .trl-textarea{width:100%;padding:0.875rem 1rem;background:${inputBg};border:1px solid ${inputBdr};border-radius:12px;font-size:0.925rem;font-weight:500;color:${text};outline:none;resize:none;font-family:'DM Sans',sans-serif;line-height:1.7;transition:border-color 0.15s;box-sizing:border-box}
            .trl-textarea:focus{border-color:rgba(168,85,247,0.45)}
            .trl-textarea::placeholder{color:${subtext};font-weight:400}
            .trl-textarea[readonly]{color:${d?'rgba(255,255,255,0.7)':'rgba(0,0,0,0.65)'};}
            .trl-btn{padding:0.625rem 1.25rem;border-radius:10px;border:none;font-size:0.82rem;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;display:flex;align-items:center;justify-content:center;gap:0.4rem}
            .trl-btn-primary{background:linear-gradient(135deg,#a855f7,#ec4899);color:white;box-shadow:0 4px 16px rgba(168,85,247,0.3)}
            .trl-btn-primary:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(168,85,247,0.4)}
            .trl-btn-secondary{background:${d?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.05)'};border:1px solid ${border};color:${d?'rgba(255,255,255,0.6)':'rgba(0,0,0,0.55)'};}
            .trl-btn-secondary:hover{background:${d?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.08)'};color:${d?'white':'#1e293b'}}
            .trl-swap-btn{width:36px;height:36px;border-radius:50%;background:${d?'rgba(168,85,247,0.15)':'rgba(168,85,247,0.1)'};border:1px solid rgba(168,85,247,${d?'0.3':'0.2'});color:#a855f7;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1rem;transition:all 0.2s;flex-shrink:0;align-self:flex-end;margin-bottom:2px}
            .trl-swap-btn:hover{background:rgba(168,85,247,0.25);transform:rotate(180deg)}
            .trl-char-count{font-size:0.68rem;font-weight:600;color:${subtext};text-align:right;margin-top:0.375rem}
        </style>

        <div class="trl-root">
            <div style="text-align:center;margin-bottom:1.5rem;">
                <div style="font-size:2.8rem;margin-bottom:0.5rem;">🌍</div>
                <h1 style="font-family:'Syne',sans-serif;font-size:1.8rem;font-weight:900;background:linear-gradient(135deg,#a855f7,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin:0 0 0.25rem;">Tradutor Universal</h1>
                <p style="font-size:0.82rem;color:${subtext};font-weight:500;">12 idiomas · tradução automática · síntese de voz にゃん~</p>
            </div>

            <div class="trl-card">
                <div style="display:flex;align-items:flex-end;gap:0.75rem;">
                    <div style="flex:1;">
                        <label class="trl-label">De</label>
                        <div style="display:flex;align-items:center;gap:0.5rem;">
                            <span style="font-size:1.4rem;">${srcLang.flag}</span>
                            <select id="source-lang" class="trl-select">${selectOpts(this.sourceLang)}</select>
                        </div>
                    </div>
                    <button class="trl-swap-btn" onclick="Translator.swap()" title="Inverter idiomas">⇄</button>
                    <div style="flex:1;">
                        <label class="trl-label">Para</label>
                        <div style="display:flex;align-items:center;gap:0.5rem;">
                            <span style="font-size:1.4rem;">${tgtLang.flag}</span>
                            <select id="target-lang" class="trl-select">${selectOpts(this.targetLang)}</select>
                        </div>
                    </div>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:0.75rem;">
                <div class="trl-card" style="padding-bottom:1rem;">
                    <label class="trl-label">Texto original</label>
                    <textarea id="source-text" class="trl-textarea" rows="8" placeholder="Digite ou cole o texto aqui..." oninput="Translator.updateUI()"></textarea>
                    <div class="trl-char-count" id="source-char-count">0 caracteres</div>
                </div>
                <div class="trl-card" style="padding-bottom:1rem;">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.625rem;">
                        <label class="trl-label" style="margin-bottom:0;">Tradução</label>
                        <span id="translation-status" style="font-size:0.72rem;font-weight:700;"></span>
                    </div>
                    <textarea id="translated-text" class="trl-textarea" rows="8" placeholder="A tradução aparecerá aqui..." readonly></textarea>
                    <div class="trl-char-count" style="opacity:0;">·</div>
                </div>
            </div>

            <div class="trl-card">
                <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                    <button class="trl-btn trl-btn-primary" onclick="Translator.translate()" style="flex:1;min-width:120px;">🔄 Traduzir</button>
                    <button class="trl-btn trl-btn-secondary" onclick="Translator.copy()">📋 Copiar</button>
                    <button class="trl-btn trl-btn-secondary" onclick="Translator.speak('source')">🔊 Ouvir original</button>
                    <button class="trl-btn trl-btn-secondary" onclick="Translator.speak('target')">🔊 Ouvir tradução</button>
                    <button class="trl-btn trl-btn-secondary" onclick="Translator.clear()">🗑️ Limpar</button>
                </div>
            </div>
        </div>`;
    },

    updateUI() {
        const input   = document.getElementById('source-text');
        const counter = document.getElementById('source-char-count');
        if (!input || !counter) return;
        const count = input.value.length;
        counter.textContent = `${count} caractere${count !== 1 ? 's' : ''}`;
        if (count > 3) this.autoTranslate();
    },

    init() {
        ['source-lang', 'target-lang'].forEach((id, i) => {
            document.getElementById(id)?.addEventListener('change', (e) => {
                this[i === 0 ? 'sourceLang' : 'targetLang'] = e.target.value;
                Router.render();
            });
        });
        document.getElementById('source-text')?.addEventListener('input', () => this.updateUI());
    },

    autoTranslate: Utils.debounce(function() { Translator.translate(); }, 1000),

    async translate() {
        const sourceText   = document.getElementById('source-text')?.value;
        const translatedEl = document.getElementById('translated-text');
        const statusEl     = document.getElementById('translation-status');
        if (!sourceText || !translatedEl) return;

        if (!sourceText.trim()) { translatedEl.value = ''; if (statusEl) statusEl.innerHTML = ''; return; }

        if (this.sourceLang === this.targetLang) {
            translatedEl.value = sourceText;
            if (statusEl) statusEl.innerHTML = '<span style="color:#f59e0b;">⚠️ Idiomas iguais</span>';
            return;
        }

        this.isTranslating = true;
        translatedEl.value = '⏳ Traduzindo...';
        if (statusEl) statusEl.innerHTML = '<span style="color:#a855f7;">🔄 Traduzindo...</span>';

        try {
            const url  = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceText)}&langpair=${this.sourceLang}|${this.targetLang}`;
            const data = await Utils.fetchAPI(url);
            if (data?.responseData?.translatedText) {
                translatedEl.value = data.responseData.translatedText;
                if (statusEl) { statusEl.innerHTML = '<span style="color:#22c55e;">✅ Concluído</span>'; setTimeout(() => { statusEl.innerHTML = ''; }, 2000); }
                window.Missions?.track?.({ event: 'open_tool', tool: 'translator' });
            } else {
                throw new Error('Resposta inválida');
            }
        } catch {
            translatedEl.value = '';
            if (statusEl) statusEl.innerHTML = '<span style="color:#ef4444;">❌ Erro</span>';
            Utils.showNotification('❌ Erro ao traduzir texto', 'error');
        } finally {
            this.isTranslating = false;
        }
    },

    swap() {
        const src = document.getElementById('source-text');
        const tgt = document.getElementById('translated-text');
        if (src && tgt) [src.value, tgt.value] = [tgt.value, ''];
        [this.sourceLang, this.targetLang] = [this.targetLang, this.sourceLang];
        Utils.showNotification('🔄 Idiomas invertidos!', 'info');
        Router.render();
    },

    copy() {
        const text = document.getElementById('translated-text')?.value;
        if (text && !text.startsWith('⏳') && !text.startsWith('❌')) Utils.copyToClipboard(text);
        else Utils.showNotification('❌ Nada para copiar', 'error');
    },

    clear() {
        ['source-text','translated-text'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
        const counter = document.getElementById('source-char-count');
        const status  = document.getElementById('translation-status');
        if (counter) counter.textContent = '0 caracteres';
        if (status)  status.innerHTML = '';
        Utils.showNotification('🗑️ Textos limpos!', 'info');
    },

    speak(which) {
        if (!window.speechSynthesis) { Utils.showNotification('❌ Síntese de voz não suportada', 'error'); return; }
        const text = document.getElementById(which === 'source' ? 'source-text' : 'translated-text')?.value;
        const lang = which === 'source' ? this.sourceLang : this.targetLang;
        if (!text || text.startsWith('⏳') || text.startsWith('❌')) { Utils.showNotification('❌ Nenhum texto para ouvir', 'error'); return; }
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(text);
        utt.lang  = { pt:'pt-BR',en:'en-US',es:'es-ES',fr:'fr-FR',de:'de-DE',it:'it-IT',ja:'ja-JP',ko:'ko-KR',zh:'zh-CN',ru:'ru-RU',ar:'ar-SA',hi:'hi-IN' }[lang] || lang;
        utt.rate  = 0.9;
        utt.onstart = () => Utils.showNotification('🔊 Reproduzindo...', 'info');
        utt.onerror = () => Utils.showNotification('❌ Erro ao reproduzir áudio', 'error');
        window.speechSynthesis.speak(utt);
    }
};

window.Translator = Translator;
