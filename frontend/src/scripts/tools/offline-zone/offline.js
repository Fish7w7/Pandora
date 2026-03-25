/* OFFLINE.JS v2.0.0 — NyanTools にゃん~ */

const OfflineZone = {
    currentGame: null,
    _insideGame: false,

    games: {
        tictactoe: { name: 'Jogo da Velha', icon: '❌⭕', desc: '2 jogadores ou vs Mayara 🤖',           color: '#3b82f6', glow: 'rgba(59,130,246,0.35)' },
        snake:     { name: 'Cobrinha',       icon: '🐍',   desc: 'Clássico jogo arcade',                  color: '#22c55e', glow: 'rgba(34,197,94,0.35)'  },
        termo:     { name: 'Termo',          icon: '📤',   desc: 'Wordle em português · nova palavra/24h', color: '#f59e0b', glow: 'rgba(245,158,11,0.35)' },
        forca:     { name: 'Forca',          icon: '🎯',   desc: 'Adivinhe a palavra · nova palavra/24h',  color: '#6366f1', glow: 'rgba(99,102,241,0.35)' },
        flappy:    { name: 'Flappy Bird',    icon: '🦅',   desc: 'O jogo mais viciante de todos!',        color: '#f97316', glow: 'rgba(249,115,22,0.35)' },
        game2048:  { name: '2048',           icon: '🔢',   desc: 'Una os números e chegue ao 2048!',      color: '#a855f7', glow: 'rgba(168,85,247,0.35)' },
        typeracer: { name: 'Type Racer',  icon: '⌨️',   desc: 'Treine sua digitação · 3 modos · WPM ao vivo', color: '#ec4899', glow: 'rgba(236,72,153,0.35)' },
        quiz:      { name: 'Quiz Diário', icon: '🧠',   desc: 'Cultura geral · 10 perguntas · renova à meia-noite', color: '#10b981', glow: 'rgba(16,185,129,0.35)' },
        slot:      { name: 'Caça-Níquel', icon: '🎰',   desc: 'Gire os rolos e tente o jackpot com 3x 🐱', color: '#f59e0b', glow: 'rgba(245,158,11,0.35)' },
        memory:    { name: 'Memória',     icon: '🧩',   desc: 'Encontre os pares',                     color: '#ec4899', glow: 'rgba(236,72,153,0.35)', comingSoon: true }
    },

    render() {
        // Se startGame() está em andamento, renderizar o jogo imediatamente
        if (this._startingGame && this.currentGame) return this._renderGame();
        // Se chegou aqui via navegação normal, mostrar menu (init() limpará currentGame após render)
        // mas já resetar aqui para não mostrar jogo de sessão anterior
        if (!this._startingGame) { this.currentGame = null; }
        if (this.currentGame) return this._renderGame();

        const d      = document.body.classList.contains('dark-theme');
        const bg     = d ? '#0d0d18'                 : '#f8fafc';
        const card   = d ? 'rgba(255,255,255,0.04)'  : '#ffffff';
        const border = d ? 'rgba(255,255,255,0.08)'  : 'rgba(0,0,0,0.08)';
        const text   = d ? '#f1f5f9'                 : '#0f172a';
        const sub    = d ? 'rgba(255,255,255,0.38)'  : 'rgba(0,0,0,0.42)';

        const isOnline    = App?.isOnline ?? true;
        const statusColor = isOnline ? '#22c55e' : '#ef4444';
        const statusLabel = isOnline ? 'Online' : 'Offline';

        const cards = Object.entries(this.games).map(([id, g], i) => {
            const delay = `${i * 40}ms`;

            if (g.comingSoon) return `
                <div style="
                    background:${card}; border:1px solid ${border}; border-radius:18px;
                    padding:1.5rem 1.25rem; display:flex; flex-direction:column; gap:0.5rem;
                    opacity:0.42; cursor:not-allowed; position:relative; overflow:hidden;
                    animation:ozFadeUp 0.4s ease both; animation-delay:${delay};
                ">
                    <div style="font-size:2.4rem; line-height:1; margin-bottom:0.25rem;">${g.icon}</div>
                    <div style="font-size:0.92rem; font-weight:800; color:${text}; font-family:'Syne',sans-serif;">${g.name}</div>
                    <div style="font-size:0.72rem; color:${sub}; line-height:1.45; flex:1;">${g.desc}</div>
                    <div style="margin-top:0.25rem; padding:0.45rem; border-radius:8px; background:rgba(128,128,128,0.1);
                                font-size:0.72rem; font-weight:700; color:${sub}; text-align:center; letter-spacing:0.04em;">
                        🚧 EM BREVE
                    </div>
                </div>`;

            return `
                <div class="oz-card" id="oz-${id}" onclick="OfflineZone.startGame('${id}')" style="
                    background:${card}; border:1px solid ${border}; border-radius:18px;
                    padding:1.5rem 1.25rem; display:flex; flex-direction:column; gap:0.5rem;
                    cursor:pointer; position:relative; overflow:hidden;
                    transition:transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s, border-color 0.2s;
                    animation:ozFadeUp 0.4s ease both; animation-delay:${delay};
                "
                onmouseenter="
                    this.style.transform='translateY(-4px) scale(1.02)';
                    this.style.boxShadow='0 16px 40px ${g.glow}';
                    this.style.borderColor='${g.color}55';
                    this.querySelector('.oz-shine').style.opacity='1';
                    this.querySelector('.oz-play').style.background='${g.color}';
                    this.querySelector('.oz-play').style.color='white';
                    this.querySelector('.oz-play').style.borderColor='${g.color}';
                "
                onmouseleave="
                    this.style.transform='';
                    this.style.boxShadow='';
                    this.style.borderColor='${border}';
                    this.querySelector('.oz-shine').style.opacity='0';
                    this.querySelector('.oz-play').style.background='transparent';
                    this.querySelector('.oz-play').style.color='${g.color}';
                    this.querySelector('.oz-play').style.borderColor='${g.color}33';
                ">

                    <!-- Shine overlay -->
                    <div class="oz-shine" style="
                        position:absolute; inset:0; opacity:0; transition:opacity 0.2s; pointer-events:none;
                        background:linear-gradient(135deg, ${g.color}0d 0%, transparent 60%);
                    "></div>

                    <!-- Dot accent -->
                    <div style="
                        position:absolute; top:1rem; right:1rem;
                        width:7px; height:7px; border-radius:50%;
                        background:${g.color}; opacity:0.5;
                    "></div>

                    <div style="font-size:2.4rem; line-height:1; margin-bottom:0.25rem; position:relative;">${g.icon}</div>
                    <div style="font-size:0.92rem; font-weight:800; color:${text}; font-family:'Syne',sans-serif; position:relative;">${g.name}</div>
                    <div style="font-size:0.72rem; color:${sub}; line-height:1.45; flex:1; position:relative;">${g.desc}</div>

                    <div class="oz-play" style="
                        margin-top:0.25rem; padding:0.5rem; border-radius:9px;
                        border:1px solid ${g.color}33; background:transparent;
                        font-size:0.72rem; font-weight:800; color:${g.color};
                        text-align:center; letter-spacing:0.05em; text-transform:uppercase;
                        transition:all 0.18s; position:relative;
                    ">▶ Jogar</div>
                </div>`;
        }).join('');

        return `
        <style>
            @keyframes ozFadeUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:none } }
            @keyframes ozPulse  { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        </style>

        <div style="max-width:700px; margin:0 auto; font-family:'DM Sans',sans-serif;">

            <!-- Header -->
            <div style="text-align:center; margin-bottom:2rem;">
                <div style="font-size:3rem; margin-bottom:0.625rem; animation:ozFadeUp 0.35s ease both;">📶</div>
                <h1 style="
                    font-family:'Syne',sans-serif; font-size:2rem; font-weight:900; margin:0 0 0.625rem;
                    background:linear-gradient(135deg,#a855f7,#ec4899); -webkit-background-clip:text;
                    -webkit-text-fill-color:transparent; background-clip:text;
                    animation:ozFadeUp 0.35s ease 0.05s both;
                ">Zona Offline</h1>
                <div style="
                    display:inline-flex; align-items:center; gap:0.5rem;
                    font-size:0.75rem; font-weight:700; color:${statusColor};
                    animation:ozFadeUp 0.35s ease 0.1s both;
                ">
                    <span style="width:7px;height:7px;border-radius:50%;background:${statusColor};display:inline-block;animation:ozPulse 2s infinite;"></span>
                    ${statusLabel} · ${Object.values(this.games).filter(g => !g.comingSoon).length} jogos disponíveis
                </div>
            </div>

            <!-- Grid -->
            <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:0.75rem;">
                ${cards}
            </div>

        </div>`;
    },

    _renderGame() {
        const game = this.games[this.currentGame];
        if (!game) return '';
        const d      = document.body.classList.contains('dark-theme');
        const text   = d ? '#f1f5f9'               : '#0f172a';
        const btnBg  = d ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
        const btnBdr = d ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.09)';
        const btnClr = d ? 'rgba(255,255,255,0.6)'  : 'rgba(0,0,0,0.55)';

        const content = ({
            tictactoe: () => TicTacToe?.render()  || this._loading('Jogo da Velha'),
            snake:     () => MiniGame?.render()    || this._loading('Cobrinha'),
            termo:     () => Termo?.render()       || this._loading('Termo'),
            forca:     () => Forca?.render()       || this._loading('Forca'),
            flappy:    () => typeof FlappyBird !== 'undefined' ? FlappyBird.render() : this._loading('Flappy Bird'),
            typeracer: () => TypeRacer?.render()    || this._loading('Type Racer'),
            quiz:      () => QuizDiario?.render()   || this._loading('Quiz Diário'),
            slot:      () => SlotMachine?.render()  || this._loading('Caça-Níquel'),
            game2048:  () => Game2048?.render()    || this._loading('2048')
        })[this.currentGame]?.() || '';

        return `
        <div style="max-width:860px; margin:0 auto; font-family:'DM Sans',sans-serif;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1.25rem;">
                <div style="display:flex; align-items:center; gap:0.75rem;">
                    <div style="
                        width:40px; height:40px; border-radius:12px;
                        background:${game.color}22; border:1px solid ${game.color}44;
                        display:flex; align-items:center; justify-content:center; font-size:1.3rem;
                    ">${game.icon}</div>
                    <h1 style="font-family:'Syne',sans-serif; font-size:1.4rem; font-weight:900; color:${text}; margin:0;">
                        ${game.name}
                    </h1>
                </div>
                <div style="display:flex; align-items:center; gap:0.75rem;">
                    <span style="font-size:0.7rem; font-weight:600; color:${d?'rgba(255,255,255,0.25)':'rgba(0,0,0,0.3)'}; display:flex; align-items:center; gap:0.3rem;">
                        <kbd style="background:${btnBg}; border:1px solid ${btnBdr}; border-radius:5px; padding:2px 7px; font-family:monospace; font-size:0.68rem;">Esc</kbd>
                        para sair
                    </span>
                    <button onclick="OfflineZone.backToMenu()"
                            style="padding:0.5rem 1rem; border-radius:10px; border:1px solid ${btnBdr}; background:${btnBg}; color:${btnClr}; font-size:0.8rem; font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.15s; display:flex; align-items:center; gap:0.375rem;"
                            onmouseover="this.style.background='${d?'rgba(255,255,255,0.11)':'rgba(0,0,0,0.1)'}'"
                            onmouseout="this.style.background='${btnBg}'">
                        ⬅️ Voltar
                    </button>
                </div>
            </div>
            ${content}
        </div>`;
    },

    _loading(name) {
        return `<p style="text-align:center; opacity:0.4; font-family:'DM Sans',sans-serif; padding:2rem 0;">Carregando ${name}...</p>`;
    },

    init() {
        // _startingGame é true apenas quando startGame() chama Router.render()
        // Nesse caso, não resetar o estado — o jogo está prestes a ser renderizado
        if (this._startingGame) return;
        // Navegação normal para a zona offline — resetar estado do jogo
        this._insideGame = false;
        this.currentGame = null;
        // Limpar escHandler pendente
        if (this._escHandler) {
            document.removeEventListener('keydown', this._escHandler);
            this._escHandler = null;
        }
    },

    startGame(game) {
        this._insideGame    = true;
        this.currentGame    = game;
        this._startingGame  = true;  // protege init() durante o render
        this._initGame(game);
        Router?.render();
        this._startingGame  = false; // libera após render
        // Remover handler anterior antes de adicionar novo (evita duplicatas)
        if (this._escHandler) {
            document.removeEventListener('keydown', this._escHandler);
            this._escHandler = null;
        }
        this._escHandler = e => { if (e.key === 'Escape') this.backToMenu(); };
        document.addEventListener('keydown', this._escHandler);
        if (game === 'snake')         setTimeout(() => MiniGame?.init(), 100);
        else if (game === 'flappy')   setTimeout(() => FlappyBird?.init(), 100);
        else if (game === 'game2048') setTimeout(() => Game2048?.init(), 100);
        else if (game === 'typeracer') setTimeout(() => TypeRacer?.init(), 100);
        else if (game === 'quiz')      setTimeout(() => QuizDiario?.init(), 100);
        else if (game === 'slot')      setTimeout(() => SlotMachine?.init(), 100);
    },

    _initGame(game) {
        if (game === 'tictactoe' && TicTacToe) {
            TicTacToe.gameMode = null; TicTacToe.resetGame(); TicTacToe.resetScores();
        } else if (game === 'snake') {
            MiniGame?.resetGame();
        } else if (game === 'termo' && Termo) {
            Termo.isReady = false; setTimeout(() => Termo.init(), 100);
        } else if (game === 'forca' && Forca) {
            Forca.isReady = false; setTimeout(() => Forca.init(), 100);
        } else if (game === 'game2048' && Game2048) {
            Game2048.loadGameState(); setTimeout(() => Game2048.init(), 100);
        }
    },

    _initCurrentGame() {
        const game = this.currentGame;
        if (!game) return;
        if (game === 'snake')         setTimeout(() => MiniGame?.init(), 100);
        else if (game === 'flappy')   setTimeout(() => FlappyBird?.init(), 100);
        else if (game === 'game2048') setTimeout(() => Game2048?.init(), 100);
        else if (game === 'typeracer') setTimeout(() => TypeRacer?.init(), 100);
        else if (game === 'quiz')      setTimeout(() => QuizDiario?.init(), 100);
        else if (game === 'slot')      setTimeout(() => SlotMachine?.init(), 100);
    },

    backToMenu() {
        this._insideGame = false;
        this.currentGame = null;
        if (this._escHandler) {
            document.removeEventListener('keydown', this._escHandler);
            this._escHandler = null;
        }
        Router?.render();
    }
};

window.OfflineZone = OfflineZone;