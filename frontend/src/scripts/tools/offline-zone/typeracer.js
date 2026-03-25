/* ═══════════════════════════════════════════════════════
   TYPERACER.JS v1.0.0 — NyanTools にゃん~
   v3.7.0 "Zona Arcade" —
   ═══════════════════════════════════════════════════════ */

const TypeRacer = {

    mode: null, phase: 'menu',
    phrase: '', typed: '',
    startTime: null, endTime: null,
    errors: 0, totalTyped: 0, wpmLive: 0,
    timerLeft: 60,
    _timerInterval: null, _wpmInterval: null,
    wordSpeeds: [], penaltyScore: 0,
    marathonResults: [],

    phrases: [
        "A prática leva à perfeição.",
        "Quem não arrisca não petisca.",
        "Devagar se vai ao longe.",
        "A união faz a força.",
        "Antes tarde do que nunca.",
        "O tempo é o melhor remédio.",
        "Cada cabeça, uma sentença.",
        "Gato escaldado tem medo de água fria.",
        "Não se deve julgar um livro pela capa.",
        "Mais vale um pássaro na mão do que dois voando.",
        "A mentira tem pernas curtas.",
        "Tudo que é bom dura pouco.",
        "Não há mal que sempre dure.",
        "A tecnologia é uma ferramenta poderosa que pode mudar o mundo.",
        "Os computadores modernos processam bilhões de operações por segundo.",
        "A inteligência artificial está transformando todas as indústrias.",
        "Programar é como escrever uma carta para o futuro.",
        "O código limpo é mais fácil de manter e entender.",
        "Todo grande programador começou escrevendo código ruim.",
        "A melhor forma de aprender é praticando todos os dias.",
        "Erros são oportunidades de aprendizado disfarçadas.",
        "A persistência é a chave para superar qualquer desafio.",
        "Sonhos sem ação permanecem apenas sonhos.",
        "O sucesso é a soma de pequenos esforços repetidos diariamente.",
        "Acredite em si mesmo e você estará na metade do caminho.",
        "A criatividade é a inteligência se divertindo.",
        "Não espere por oportunidades, crie-as você mesmo.",
        "A disciplina é a ponte entre objetivos e realizações.",
        "O fracasso é apenas a oportunidade de recomeçar com mais inteligência.",
        "Você não precisa ser ótimo para começar, mas precisa começar para ser ótimo.",
        "A imaginação é mais importante do que o conhecimento.",
        "O primeiro bug de computador foi literalmente uma mariposa encontrada em 1947.",
        "A internet foi criada pelo Departamento de Defesa dos Estados Unidos.",
        "O primeiro domínio registrado na internet foi symbolics.com em 1985.",
        "Python foi nomeado em homenagem ao grupo de comédia Monty Python.",
        "JavaScript foi criado em apenas dez dias por Brendan Eich em 1995.",
        "O primeiro computador pessoal pesava mais de duzentos quilogramas.",
        "O termo byte foi cunhado em 1956 para descrever oito bits de dados.",
        "O teclado QWERTY foi projetado para evitar que as teclas travassem.",
        "O primeiro e-mail foi enviado por Ray Tomlinson em 1971.",
        "O Google processa mais de oitenta e cinco mil pesquisas por segundo.",
        "A palavra algoritmo vem do nome do matemático persa Al-Khwarizmi.",
        "O primeiro mouse de computador era feito de madeira e tinha apenas um botão.",
        "Ichi-go ichi-e significa uma vez, um encontro, um momento único.",
        "Ikigai é o propósito de vida que te faz levantar da cama toda manhã.",
        "Kaizen significa melhoria contínua através de pequenos passos diários.",
        "Wabi-sabi é a beleza encontrada nas imperfeições e na impermanência.",
        "Ganbatte significa faça o seu melhor, não desista nunca.",
        "Shokunin é a dedicação artesanal à perfeição em qualquer ofício.",
        "Komorebi é a luz do sol filtrada pelas folhas das árvores.",
        "Yugen é a profunda consciência do universo que provoca emoções intensas.",
        "A vida é dez por cento o que acontece com você e noventa por cento como você reage.",
        "O homem que move uma montanha começa carregando pequenas pedras.",
        "A jornada de mil milhas começa com um único passo.",
        "Não importa quão devagar você vá, desde que não pare.",
        "A mente que se abre a uma nova ideia jamais voltará ao seu tamanho original.",
        "Seja a mudança que você deseja ver no mundo.",
        "Em meio à dificuldade encontra-se a oportunidade.",
        "O melhor momento para plantar uma árvore foi vinte anos atrás. O segundo melhor é agora.",
        "Ninguém pode fazer você se sentir inferior sem o seu consentimento.",
        "Se você quer ir rápido, vá sozinho. Se você quer ir longe, vá em grupo.",
        "Caia sete vezes, levante-se oito.",
        "A criptografia assimétrica utiliza um par de chaves matematicamente relacionadas.",
        "O aprendizado de máquina permite que sistemas aprendam sem serem explicitamente programados.",
        "A computação quântica aproveita os princípios da mecânica quântica para processar informações.",
        "Os sistemas distribuídos permitem que múltiplos computadores trabalhem em conjunto.",
        "A arquitetura de microsserviços divide uma aplicação em serviços pequenos e independentes.",
        "O desenvolvimento orientado a testes escreve os testes antes do código que eles validam.",
        "A refatoração é o processo de reestruturar o código sem alterar seu comportamento externo.",
        "Os padrões de projeto são soluções reutilizáveis para problemas frequentes no desenvolvimento.",
        "Se você conhece o inimigo e conhece a si mesmo, não precisa temer cem batalhas.",
        "A necessidade é a mãe de todas as invenções.",
        "Enquanto houver vida, haverá esperança.",
        "A árvore que suporta a tempestade tem raízes profundas.",
        "O universo tem aproximadamente treze ponto oito bilhões de anos de idade.",
        "A luz do sol leva oito minutos e vinte segundos para chegar até a Terra.",
        "O DNA humano compartilha cinquenta por cento de seus genes com as bananas.",
        "O cérebro humano contém aproximadamente oitenta e seis bilhões de neurônios.",
        "A velocidade do som é de aproximadamente trezentos e quarenta metros por segundo.",
        "O coração humano bate cerca de cem mil vezes por dia.",
        "Os polvos têm três corações e sangue azul.",
        "As abelhas podem reconhecer rostos humanos usando a mesma técnica que nós usamos.",
        "A criatividade é ver o que todos veem e pensar o que ninguém pensou.",
        "A arte é a mentira que nos faz perceber a verdade.",
        "A música é a taquigrafia das emoções humanas.",
        "A simplicidade é a sofisticação máxima.",
        "A produtividade nunca é um acidente, é sempre o resultado de um compromisso.",
        "Faça o que você ama e você nunca trabalhará um dia em sua vida.",
        "Priorize o que é importante, não o que é urgente.",
        "Comece com o porquê antes de pensar no como e no quê.",
        "A educação é a arma mais poderosa que você pode usar para mudar o mundo.",
        "Diga-me e esquecerei. Mostre-me e lembrarei. Envolva-me e entenderei.",
        "A mente é como um paraquedas, funciona melhor quando está aberta.",
        "O conhecimento fala, mas a sabedoria escuta.",
        "Viva como se fosse morrer amanhã. Aprenda como se fosse viver para sempre.",
        "A curiosidade é o motor da invenção.",
        "Nunca deixe de aprender, porque a vida nunca para de ensinar.",
        "As impressões digitais dos coalas podem confundir até a polícia.",
        "Os golfinhos têm nomes uns para os outros e se chamam usando assobios únicos.",
        "O nariz humano consegue detectar mais de um trilhão de odores diferentes.",
        "As borboletas provam com os pés antes de comer qualquer coisa.",
        "O único modo de fazer um excelente trabalho é amar o que você faz.",
        "Não compare sua caminhada com a de ninguém, cada jornada é única.",
        "O sucesso é ir de fracasso em fracasso sem perder o entusiasmo.",
        "Cada dia é uma nova oportunidade para crescer e se tornar uma versão melhor de si.",
        "A mel encontrada em tumbas egípcias de três mil anos atrás ainda era comestível.",
        "A formiga pode carregar até cinquenta vezes o seu próprio peso corporal.",
        "O bambu é a planta que mais cresce rápido no mundo inteiro.",
        "Um plano sem ação é apenas um sonho. Ação sem um plano é pesadelo.",
        "Grandes coisas nunca são feitas por uma pessoa, mas por uma equipe.",
        "O verdadeiro aprendizado acontece quando você sai da sua zona de conforto.",
        "Quanto mais eu aprendo, mais percebo o quanto não sei.",
        "Natsukashii é aquela saudade gostosa de momentos felizes do passado.",
        "Mono no aware é a beleza melancólica das coisas que passam.",
        "A Terra completa uma rotação em vinte e três horas e cinquenta e seis minutos.",
        "O código-fonte do Linux tem mais de vinte e sete milhões de linhas.",
        "A capacidade de armazenamento dos computadores dobra aproximadamente a cada dois anos.",
        "A integração contínua automatiza o processo de teste e implantação de software.",
        "O princípio da responsabilidade única define que cada módulo deve ter um único motivo para mudar.",
    ],

    _isDark() { return document.body.classList.contains('dark-theme'); },

    _colors() {
        const d = this._isDark();
        return {
            bg:      d ? 'rgba(255,255,255,0.04)' : '#ffffff',
            border:  d ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
            text:    d ? '#f1f5f9'                : '#0f172a',
            sub:     d ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)',
            muted:   d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)',
            inner:   d ? 'rgba(255,255,255,0.05)' : '#f8fafc',
            inputBg: d ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
        };
    },

    _randomPhrase(exclude = '') {
        const pool = this.phrases.filter(p => p !== exclude);
        return pool[Math.floor(Math.random() * pool.length)];
    },

    _calcWPM(chars, ms) {
        if (!ms || ms < 500) return 0;
        return Math.round((chars / 5) / (ms / 60000));
    },

    _calcAccuracy() {
        if (this.totalTyped === 0) return 100;
        return Math.round(((this.totalTyped - this.errors) / this.totalTyped) * 100);
    },

    _saveHighscore(wpm) {
        const key = 'typeracer_highscore';
        const best = Utils.loadData(key) || 0;
        const isNewRecord = wpm > best;
        // checkRecord ANTES de salvar — economy compara com valor anterior
        window.Economy?.checkRecord?.(key, wpm);
        // Compartilhar no feed
        const isRec = wpm > best;
        setTimeout(() => window.ShareToFeed?.showToast?.('typeracer', wpm, { isRecord: isRec }), 500);
        if (isNewRecord) Utils.saveData(key, wpm);
        window.Economy?.grant?.('play_game');
        window.Missions?.track?.({ event: 'typeracer_finish', wpm });
        // beat_record já disparado dentro de Economy.checkRecord
    },

    render() {
        if (this.phase === 'menu')    return this._renderMenu();
        if (this.phase === 'playing') return this._renderGame();
        if (this.phase === 'result')  return this._renderResult();
        return this._renderMenu();
    },

    _renderMenu() {
        const c = this._colors();
        const best = Utils.loadData('typeracer_highscore') || 0;
        const modes = [
            { id: 'classic',   icon: '📝', name: 'Clássico',  color: 'var(--theme-primary,#a855f7)', desc: 'Uma frase por vez. Complete sem pressa e veja seu WPM.' },
            { id: 'marathon',  icon: '⏱️', name: 'Maratona',  color: '#f97316', desc: 'Frases consecutivas por 60 segundos. Vai até o tempo acabar!' },
            { id: 'precision', icon: '🎯', name: 'Precisão',  color: '#6366f1', desc: 'Sem limite de tempo, mas cada erro penaliza seu WPM final.' },
        ];
        return `
        <style>
            @keyframes trFadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
            .tr-card { cursor:pointer; transition:transform 0.18s cubic-bezier(0.34,1.56,0.64,1),box-shadow 0.2s,border-color 0.2s; }
            .tr-card:hover { transform:translateY(-4px) scale(1.02); }
            .tr-card:active { transform:scale(0.97) !important; transition:transform 0.08s ease !important; }
        </style>
        <div style="max-width:600px;margin:0 auto;font-family:var(--font-body,'DM Sans',sans-serif);">
            <div style="text-align:center;margin-bottom:2rem;animation:trFadeUp 0.35s ease both;">
                <div style="font-size:3rem;margin-bottom:0.5rem;">⌨️</div>
                <h1 style="font-family:var(--font-display,'Syne',sans-serif);font-size:var(--text-2xl,2rem);font-weight:900;margin:0 0 0.4rem;
                    background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));
                    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Type Racer</h1>
                <p style="font-size:var(--text-sm,0.78rem);color:${c.sub};margin:0;">Treine sua digitação com frases em português にゃん~</p>
                ${best > 0 ? `<div style="display:inline-flex;align-items:center;gap:0.5rem;margin-top:0.75rem;
                    background:${c.inner};border:1px solid ${c.border};border-radius:99px;padding:0.35rem 0.875rem;">
                    <span>🏆</span>
                    <span style="font-size:var(--text-xs,0.68rem);font-weight:700;color:${c.text};">Recorde: ${best} WPM</span>
                </div>` : ''}
            </div>
            <div style="display:flex;flex-direction:column;gap:0.75rem;">
                ${modes.map((m, i) => `
                <div class="tr-card" onclick="TypeRacer.startMode('${m.id}')" style="
                    background:${c.bg};border:1px solid ${c.border};
                    border-radius:var(--radius-xl,18px);padding:1.25rem 1.5rem;
                    display:flex;align-items:center;gap:1.25rem;
                    animation:trFadeUp 0.4s ease ${i*60}ms both;">
                    <div style="width:52px;height:52px;border-radius:14px;flex-shrink:0;
                        background:${m.color}22;border:1px solid ${m.color}44;
                        display:flex;align-items:center;justify-content:center;font-size:1.5rem;">${m.icon}</div>
                    <div style="flex:1;">
                        <div style="font-family:var(--font-display,'Syne',sans-serif);font-size:var(--text-md,1rem);font-weight:900;color:${c.text};margin-bottom:0.2rem;">${m.name}</div>
                        <div style="font-size:var(--text-xs,0.68rem);color:${c.sub};line-height:1.4;">${m.desc}</div>
                    </div>
                    <div style="color:${m.color};font-size:1.2rem;opacity:0.6;">›</div>
                </div>`).join('')}
            </div>
        </div>`;
    },

    startMode(mode) {
        this.mode = mode; this.phase = 'playing';
        this.errors = 0; this.totalTyped = 0;
        this.startTime = null; this.wordSpeeds = [];
        this.penaltyScore = 0; this.marathonResults = [];
        this.phrase = this._randomPhrase();
        this.typed = ''; this.wpmLive = 0; this.timerLeft = 60;
        Router?.render();
        setTimeout(() => this._focusInput(), 100);
    },

    _renderGame() {
        const c = this._colors();
        const isDark = this._isDark();
        const chars = this.phrase.split('');
        const typedChars = this.typed.split('');

        const phraseHtml = chars.map((ch, i) => {
            const t = typedChars[i];
            if (t === undefined) {
                if (i === typedChars.length) return `<span style="background:var(--theme-primary,#a855f7);color:white;border-radius:2px;">${ch === ' ' ? '&nbsp;' : ch}</span>`;
                return `<span style="color:${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}">${ch === ' ' ? '&nbsp;' : ch}</span>`;
            }
            if (t === ch) return `<span style="color:${isDark ? '#4ade80' : '#16a34a'}">${ch === ' ' ? '&nbsp;' : ch}</span>`;
            return `<span style="color:#ef4444;background:rgba(239,68,68,0.15);border-radius:2px;">${ch === ' ' ? '&nbsp;' : '·'}</span>`;
        }).join('');

        const progress = this.phrase.length > 0 ? (this.typed.length / this.phrase.length) * 100 : 0;
        const acc = this._calcAccuracy();

        const timerBadge = this.mode === 'marathon' ? `
            <div style="display:inline-flex;align-items:center;gap:0.4rem;
                background:${this.timerLeft<=10?'rgba(239,68,68,0.15)':'rgba(249,115,22,0.12)'};
                border:1px solid ${this.timerLeft<=10?'rgba(239,68,68,0.3)':'rgba(249,115,22,0.25)'};
                border-radius:99px;padding:0.25rem 0.75rem;" id="tr-timer-badge">
                <span>⏱️</span>
                <span style="font-size:var(--text-sm,0.78rem);font-weight:900;
                    color:${this.timerLeft<=10?'#ef4444':'#f97316'};" id="tr-timer">${this.timerLeft}s</span>
            </div>` : '';

        const marathonBadge = this.mode === 'marathon' ? `
            <div style="display:inline-flex;align-items:center;gap:0.4rem;
                background:rgba(249,115,22,0.1);border:1px solid rgba(249,115,22,0.2);
                border-radius:99px;padding:0.25rem 0.75rem;">
                <span style="font-size:var(--text-xs,0.68rem);font-weight:700;color:#f97316;">
                    Frase ${this.marathonResults.length + 1}</span>
            </div>` : '';

        return `
        <style>
            @keyframes trShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
            .tr-shake{animation:trShake 0.3s ease;}
            #tr-input{caret-color:var(--theme-primary,#a855f7);}
            #tr-input:focus{outline:2px solid var(--theme-primary,#a855f7);outline-offset:0;}
        </style>
        <div style="max-width:680px;margin:0 auto;font-family:var(--font-body,'DM Sans',sans-serif);">
            <!-- Top bar -->
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem;flex-wrap:wrap;gap:0.5rem;">
                <div style="display:flex;align-items:center;gap:0.5rem;">${timerBadge}${marathonBadge}</div>
                <div id="tr-stats" style="display:flex;align-items:center;gap:1rem;">
                    <div style="text-align:center;">
                        <div id="tr-wpm" style="font-size:1.6rem;font-weight:900;font-family:var(--font-display,'Syne',sans-serif);
                            color:var(--theme-primary,#a855f7);line-height:1;">${this.wpmLive}</div>
                        <div style="font-size:0.6rem;font-weight:700;color:${c.muted};text-transform:uppercase;letter-spacing:0.06em;">WPM</div>
                    </div>
                    <div style="text-align:center;">
                        <div id="tr-acc" style="font-size:1.6rem;font-weight:900;font-family:var(--font-display,'Syne',sans-serif);
                            color:${acc>=95?'#4ade80':acc>=80?'#f59e0b':'#ef4444'};line-height:1;">${acc}%</div>
                        <div style="font-size:0.6rem;font-weight:700;color:${c.muted};text-transform:uppercase;letter-spacing:0.06em;">Precisão</div>
                    </div>
                </div>
            </div>

            <!-- Frase -->
            <div id="tr-phrase" style="
                background:${c.bg};border:1px solid ${c.border};
                border-radius:var(--radius-xl,18px);padding:1.5rem;
                font-family:'JetBrains Mono',monospace;font-size:1.1rem;line-height:1.85;
                letter-spacing:0.02em;margin-bottom:0.875rem;word-break:break-word;">
                ${phraseHtml}
            </div>

            <!-- Progresso -->
            <div style="height:4px;background:${c.inner};border-radius:99px;overflow:hidden;margin-bottom:0.875rem;">
                <div id="tr-progress" style="height:100%;width:${progress}%;
                    background:linear-gradient(90deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));
                    border-radius:99px;transition:width 0.1s;"></div>
            </div>

            <!-- Input -->
            <input id="tr-input" type="text" placeholder="Comece a digitar..."
                autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
                oninput="TypeRacer.onInput(this.value)"
                onpaste="return false"
                style="width:100%;box-sizing:border-box;padding:0.875rem 1rem;
                    border-radius:var(--radius-lg,14px);border:1px solid ${c.border};
                    background:${c.inputBg};color:${c.text};
                    font-size:var(--text-md,1rem);font-family:var(--font-body,'DM Sans',sans-serif);
                    transition:border-color 0.15s;margin-bottom:0.75rem;"/>

            <div style="text-align:center;">
                <button onclick="TypeRacer.backToMenu()"
                    style="font-size:var(--text-xs,0.68rem);color:${c.muted};background:none;border:none;
                        cursor:pointer;font-family:var(--font-body,'DM Sans',sans-serif);padding:0.25rem 0.5rem;
                        transition:color 0.15s;"
                    onmouseover="this.style.color='${c.text}'" onmouseout="this.style.color='${c.muted}'">
                    ← Voltar ao menu
                </button>
            </div>
        </div>`;
    },

    onInput(value) {
        if (this.phase !== 'playing') return;

        if (!this.startTime && value.length > 0) {
            this.startTime = Date.now();
            this._startLiveWPM();
            if (this.mode === 'marathon') this._startMarathonTimer();
        }

        const prev = this.typed;
        this.typed = value;
        this.totalTyped = Math.max(this.totalTyped, value.length);

        for (let i = prev.length; i < value.length; i++) {
            if (value[i] !== this.phrase[i]) {
                this.errors++;
                if (this.mode === 'precision') this.penaltyScore += 5;
                this._shakeInput();
            }
        }

        const wordsBefore = prev.trim().split(/\s+/).filter(Boolean).length;
        const wordsNow    = value.trim().split(/\s+/).filter(Boolean).length;
        if (wordsNow > wordsBefore && this.startTime) {
            const elapsed = Date.now() - this.startTime;
            this.wordSpeeds.push(this._calcWPM(value.length, elapsed));
        }

        this._updatePhrase();
        this._updateProgress();

        if (value.length >= this.phrase.length && value === this.phrase) {
            this._onPhraseComplete();
        }
    },

    _updatePhrase() {
        const el = document.getElementById('tr-phrase');
        if (!el) return;
        const isDark = this._isDark();
        const chars = this.phrase.split('');
        const typedChars = this.typed.split('');
        el.innerHTML = chars.map((ch, i) => {
            const t = typedChars[i];
            if (t === undefined) {
                if (i === typedChars.length) return `<span style="background:var(--theme-primary,#a855f7);color:white;border-radius:2px;">${ch===' '?'&nbsp;':ch}</span>`;
                return `<span style="color:${isDark?'rgba(255,255,255,0.3)':'rgba(0,0,0,0.3)'}">${ch===' '?'&nbsp;':ch}</span>`;
            }
            if (t === ch) return `<span style="color:${isDark?'#4ade80':'#16a34a'}">${ch===' '?'&nbsp;':ch}</span>`;
            return `<span style="color:#ef4444;background:rgba(239,68,68,0.15);border-radius:2px;">${ch===' '?'&nbsp;':'·'}</span>`;
        }).join('');
    },

    _updateProgress() {
        const bar = document.getElementById('tr-progress');
        if (bar) bar.style.width = (this.typed.length / this.phrase.length * 100) + '%';
    },

    _shakeInput() {
        const input = document.getElementById('tr-input');
        if (!input) return;
        input.classList.remove('tr-shake');
        void input.offsetWidth;
        input.classList.add('tr-shake');
    },

    _startLiveWPM() {
        clearInterval(this._wpmInterval);
        this._wpmInterval = setInterval(() => {
            if (!this.startTime) return;
            const elapsed = Date.now() - this.startTime;
            this.wpmLive = this._calcWPM(this.typed.length, elapsed);
            const acc = this._calcAccuracy();
            const wpmEl = document.getElementById('tr-wpm');
            const accEl = document.getElementById('tr-acc');
            const c = this._colors();
            if (wpmEl) wpmEl.textContent = this.wpmLive;
            if (accEl) {
                accEl.textContent = acc + '%';
                accEl.style.color = acc >= 95 ? '#4ade80' : acc >= 80 ? '#f59e0b' : '#ef4444';
            }
        }, 400);
    },

    _startMarathonTimer() {
        clearInterval(this._timerInterval);
        this._timerInterval = setInterval(() => {
            this.timerLeft--;
            const el = document.getElementById('tr-timer');
            if (el) {
                el.textContent = this.timerLeft + 's';
                el.style.color = this.timerLeft <= 10 ? '#ef4444' : '#f97316';
            }
            if (this.timerLeft <= 0) {
                clearInterval(this._timerInterval);
                this._onMarathonEnd();
            }
        }, 1000);
    },

    _onPhraseComplete() {
        const elapsed = Date.now() - this.startTime;
        const wpm = this._calcWPM(this.phrase.length, elapsed);
        const acc = this._calcAccuracy();

        if (this.mode === 'marathon') {
            this.marathonResults.push({ wpm, acc });
            this.phrase = this._randomPhrase(this.phrase);
            this.typed = ''; this.errors = 0; this.totalTyped = 0;
            const input = document.getElementById('tr-input');
            if (input) input.value = '';
            this._updatePhrase();
            this._updateProgress();
        } else {
            clearInterval(this._wpmInterval);
            this.endTime = Date.now();
            let finalWpm = wpm;
            if (this.mode === 'precision') finalWpm = Math.max(0, wpm - Math.floor(this.penaltyScore / 5));
            this._saveHighscore(finalWpm);
            this.phase = 'result';
            Router?.render();
        }
    },

    _onMarathonEnd() {
        clearInterval(this._wpmInterval);
        this.endTime = Date.now();
        if (this.typed.length > 0) {
            const elapsed = Date.now() - this.startTime;
            this.marathonResults.push({ wpm: this._calcWPM(this.typed.length, elapsed), acc: this._calcAccuracy() });
        }
        const avgWpm = this.marathonResults.length > 0
            ? Math.round(this.marathonResults.reduce((s, r) => s + r.wpm, 0) / this.marathonResults.length) : 0;
        this._saveHighscore(avgWpm);
        this.phase = 'result';
        Router?.render();
    },

    _renderResult() {
        const c = this._colors();
        let wpm = 0, avgAcc = 100, totalPhrases = 0;

        if (this.mode === 'marathon') {
            totalPhrases = this.marathonResults.length;
            wpm = totalPhrases > 0 ? Math.round(this.marathonResults.reduce((s,r)=>s+r.wpm,0)/totalPhrases) : 0;
            avgAcc = totalPhrases > 0 ? Math.round(this.marathonResults.reduce((s,r)=>s+r.acc,0)/totalPhrases) : 100;
        } else {
            const elapsed = (this.endTime||Date.now()) - (this.startTime||Date.now());
            wpm = this._calcWPM(this.phrase.length, elapsed);
            avgAcc = this._calcAccuracy();
            if (this.mode === 'precision') wpm = Math.max(0, wpm - Math.floor(this.penaltyScore/5));
        }

        const best = Utils.loadData('typeracer_highscore') || 0;
        const isRecord = wpm >= best && wpm > 0;

        let rating = '', ratingColor = '';
        if (wpm >= 80)      { rating = 'Lendário 🔥';     ratingColor = '#f59e0b'; }
        else if (wpm >= 60) { rating = 'Avançado ⚡';      ratingColor = '#a855f7'; }
        else if (wpm >= 40) { rating = 'Intermediário ✨';  ratingColor = '#3b82f6'; }
        else if (wpm >= 20) { rating = 'Iniciante 🌱';     ratingColor = '#4ade80'; }
        else                { rating = 'Praticante 🐣';    ratingColor = c.muted; }

        const graphHtml = this.wordSpeeds.length > 1 ? (() => {
            const max = Math.max(...this.wordSpeeds, 1);
            const bars = this.wordSpeeds.map((spd, i) => {
                const pct = Math.round((spd/max)*100);
                const col = spd >= max*0.8 ? '#4ade80' : spd >= max*0.5 ? 'var(--theme-primary,#a855f7)' : '#f59e0b';
                return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;min-width:0;">
                    <div style="font-size:0.55rem;color:${c.muted};">${spd}</div>
                    <div style="width:100%;background:${c.inner};border-radius:3px;height:56px;display:flex;align-items:flex-end;">
                        <div style="width:100%;height:${pct}%;background:${col};border-radius:3px;min-height:3px;"></div>
                    </div>
                    <div style="font-size:0.55rem;color:${c.muted};">${i+1}</div>
                </div>`;
            }).join('');
            return `<div style="margin-top:1.25rem;padding:1rem;background:${c.inner};border-radius:var(--radius-lg,14px);">
                <div style="font-size:var(--text-xs,0.68rem);font-weight:700;color:${c.sub};margin-bottom:0.75rem;text-align:left;">⚡ Velocidade por palavra (WPM)</div>
                <div style="display:flex;gap:3px;align-items:flex-end;height:80px;">${bars}</div>
            </div>`;
        })() : '';

        return `
        <style>@keyframes trResultIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}</style>
        <div style="max-width:560px;margin:0 auto;font-family:var(--font-body,'DM Sans',sans-serif);">
        <div style="animation:trResultIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
            background:${c.bg};border:1px solid ${c.border};border-radius:var(--radius-2xl,24px);padding:2rem;text-align:center;">

            <div style="font-size:2.5rem;margin-bottom:0.5rem;">${isRecord?'🏆':'✅'}</div>
            <h2 style="font-family:var(--font-display,'Syne',sans-serif);font-size:var(--text-xl,1.5rem);font-weight:900;color:${c.text};margin:0 0 0.25rem;">
                ${isRecord?'Novo Recorde!':'Resultado'}</h2>
            <div style="font-size:var(--text-xs,0.68rem);font-weight:700;color:${ratingColor};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:1.5rem;">${rating}</div>

            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.75rem;margin-bottom:1rem;">
                <div style="background:${c.inner};border-radius:var(--radius-lg,14px);padding:1rem;">
                    <div style="font-size:2rem;font-weight:900;font-family:var(--font-display,'Syne',sans-serif);color:var(--theme-primary,#a855f7);">${wpm}</div>
                    <div style="font-size:0.65rem;font-weight:700;color:${c.muted};text-transform:uppercase;">WPM</div>
                </div>
                <div style="background:${c.inner};border-radius:var(--radius-lg,14px);padding:1rem;">
                    <div style="font-size:2rem;font-weight:900;font-family:var(--font-display,'Syne',sans-serif);color:${avgAcc>=95?'#4ade80':avgAcc>=80?'#f59e0b':'#ef4444'};">${avgAcc}%</div>
                    <div style="font-size:0.65rem;font-weight:700;color:${c.muted};text-transform:uppercase;">Precisão</div>
                </div>
                <div style="background:${c.inner};border-radius:var(--radius-lg,14px);padding:1rem;">
                    <div style="font-size:2rem;font-weight:900;font-family:var(--font-display,'Syne',sans-serif);color:${c.text};">${this.mode==='marathon'?totalPhrases:this.errors}</div>
                    <div style="font-size:0.65rem;font-weight:700;color:${c.muted};text-transform:uppercase;">${this.mode==='marathon'?'Frases':'Erros'}</div>
                </div>
            </div>

            <div style="font-size:var(--text-xs,0.68rem);color:${c.muted};margin-bottom:0.5rem;">
                🏆 Recorde pessoal: <strong style="color:${c.text};">${Math.max(wpm,best)} WPM</strong>
            </div>

            ${graphHtml}

            <div style="display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;margin-top:1.25rem;">
                <button onclick="TypeRacer.startMode('${this.mode}')"
                    style="padding:0.65rem 1.5rem;border-radius:var(--radius-md,10px);border:none;cursor:pointer;
                        font-weight:700;font-size:var(--text-base,0.875rem);font-family:var(--font-body,'DM Sans',sans-serif);
                        background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));
                        color:white;transition:filter 0.15s;"
                    onmouseover="this.style.filter='brightness(1.1)'" onmouseout="this.style.filter=''">
                    🔄 Jogar de novo
                </button>
                <button onclick="TypeRacer.backToMenu()"
                    style="padding:0.65rem 1.5rem;border-radius:var(--radius-md,10px);
                        border:1px solid ${c.border};cursor:pointer;background:${c.inner};
                        font-weight:700;font-size:var(--text-base,0.875rem);font-family:var(--font-body,'DM Sans',sans-serif);
                        color:${c.text};transition:background 0.15s;"
                    onmouseover="this.style.background='${c.bg}'" onmouseout="this.style.background='${c.inner}'">
                    ← Menu
                </button>
            </div>
        </div></div>`;
    },

    backToMenu() {
        clearInterval(this._timerInterval);
        clearInterval(this._wpmInterval);
        this.phase = 'menu'; this.mode = null; this.typed = ''; this.startTime = null;
        Router?.render();
    },

    _focusInput() {
        const input = document.getElementById('tr-input');
        if (input) input.focus();
    },

    init() { setTimeout(() => this._focusInput(), 150); },
};

window.TypeRacer = TypeRacer;