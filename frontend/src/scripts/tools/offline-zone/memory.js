const NyanMemory = {
    KEY: 'nyan_memory_nyan_state_v316',
    BEST_KEY: 'nyan_memory_nyan_best_v316',
    FIRST_WIN_KEY: 'nyan_memory_nyan_first_win_v316',

    MODES: {
        easy: { label: 'Facil', pairs: 4, columns: 4 },
        medium: { label: 'Medio', pairs: 8, columns: 4 },
        hard: { label: 'Dificil', pairs: 12, columns: 6 },
    },

    SYMBOLS: [
        '\u{1F431}', '\u2728', '\u{1F43E}', '\u{1F31F}',
        '\u{1F49C}', '\u{1F3C6}', '\u{1F4A0}', '\u{1F338}',
        '\u{1F680}', '\u{1F9E0}', '\u{1F3AE}', '\u{1F4DD}',
    ],

    state: null,

    _defaultState(mode = 'medium') {
        return {
            mode,
            board: this._createBoard(mode),
            flipped: [],
            moves: 0,
            matched: 0,
            locked: false,
            completed: false,
            trackedStart: false,
            startedAt: Date.now(),
            firstMoveAt: null,
            completedAt: null,
        };
    },

    _createBoard(mode = 'medium') {
        const cfg = this.MODES[mode] || this.MODES.medium;
        const picked = this.SYMBOLS.slice(0, cfg.pairs);
        const deck = picked.flatMap((symbol, pair) => ([
            { id: `${pair}a`, symbol, pair, matched: false },
            { id: `${pair}b`, symbol, pair, matched: false },
        ]));
        return (window.Utils?.shuffle ? Utils.shuffle(deck) : deck.sort(() => Math.random() - 0.5));
    },

    load() {
        const saved = Utils.loadData(this.KEY);
        if (!saved || typeof saved !== 'object' || !Array.isArray(saved.board)) return null;
        return saved;
    },

    save() {
        Utils.saveData(this.KEY, this.state);
    },

    init() {
        if (!this.state) this.state = this.load() || this._defaultState('medium');
    },

    reset(mode = null) {
        const nextMode = mode || this.state?.mode || 'medium';
        this.state = this._defaultState(nextMode);
        this.save();
    },

    setMode(mode) {
        if (!this.MODES[mode]) return;
        this.reset(mode);
        window.Router?.render?.();
    },

    _trackStartOnce() {
        if (!this.state.firstMoveAt) this.state.firstMoveAt = Date.now();
        if (this.state.trackedStart) return;
        this.state.trackedStart = true;
        window.Economy?.grant?.('play_game', 1, { storageKey: this.KEY, source: 'memory_nyan' });
        window.Missions?.track?.({ event: 'play_game', game: 'memory' });
        window.NyanLiveOps?.track?.({ event: 'play_game', game: 'memory', key: `memory-start:${this.state.startedAt}` });
    },

    flip(index) {
        this.init();
        const card = this.state.board[index];
        if (!card || this.state.locked || this.state.completed || card.matched) return;
        if (this.state.flipped.includes(index)) return;
        if (this.state.flipped.length >= 2) return;

        this._trackStartOnce();
        this.state.flipped.push(index);

        if (this.state.flipped.length === 2) {
            this.state.moves += 1;
            const [aIdx, bIdx] = this.state.flipped;
            const a = this.state.board[aIdx];
            const b = this.state.board[bIdx];
            if (a && b && a.pair === b.pair) {
                a.matched = true;
                b.matched = true;
                this.state.matched += 1;
                this.state.flipped = [];
                this._checkWin();
                this.save();
                window.Router?.render?.();
                return;
            }

            this.state.locked = true;
            this.save();
            window.Router?.render?.();
            setTimeout(() => {
                this.state.flipped = [];
                this.state.locked = false;
                this.save();
                window.Router?.render?.();
            }, 720);
            return;
        }

        this.save();
        window.Router?.render?.();
    },

    _checkWin() {
        const cfg = this.MODES[this.state.mode] || this.MODES.medium;
        if (this.state.matched < cfg.pairs) return false;

        this.state.completed = true;
        this.state.completedAt = Date.now();
        const best = this._bestData();
        const seconds = this._elapsedSeconds();
        const prev = this._bestForMode(this.state.mode);
        const isNewBest = !prev
            || this.state.moves < prev.moves
            || (this.state.moves === prev.moves && (!prev.seconds || seconds < prev.seconds));
        if (isNewBest) {
            best[this.state.mode] = {
                moves: this.state.moves,
                seconds,
                updatedAt: Date.now(),
            };
            Utils.saveData(this.BEST_KEY, best);
        }

        window.Missions?.track?.({ event: 'memory_win', game: 'memory', moves: this.state.moves });
        window.NyanLiveOps?.track?.({ event: 'memory_win', game: 'memory', amount: 1, key: `memory-win:${this.state.startedAt}` });

        if (!Utils.loadData(this.FIRST_WIN_KEY)) {
            Utils.saveData(this.FIRST_WIN_KEY, Date.now());
            window.Badges?.unlock?.('badge_memory_nyan');
            window.Economy?.grantChips?.(60);
            window.Achievements?.checkAll?.();
            Utils.showNotification?.('Memoria Nyan concluida: +60 chips e badge liberada.', 'success');
        } else {
            window.Achievements?.checkAll?.();
            Utils.showNotification?.(isNewBest ? 'Memoria Nyan concluida com novo recorde.' : 'Memoria Nyan concluida.', 'success');
        }
        return true;
    },

    _isVisible(index) {
        const card = this.state.board[index];
        return !!(card?.matched || this.state.flipped.includes(index) || this.state.completed);
    },

    _bestData() {
        const best = Utils.loadData(this.BEST_KEY) || {};
        return best && typeof best === 'object' ? best : {};
    },

    _bestForMode(mode = this.state?.mode || 'medium') {
        const raw = this._bestData()[mode];
        if (!raw) return null;
        if (typeof raw === 'number') return { moves: raw, seconds: 0, updatedAt: 0 };
        if (typeof raw !== 'object') return null;
        const moves = Number(raw.moves || 0);
        if (!moves) return null;
        return {
            moves,
            seconds: Number(raw.seconds || 0),
            updatedAt: Number(raw.updatedAt || 0),
        };
    },

    _elapsedSeconds() {
        const start = Number(this.state?.firstMoveAt || 0);
        if (!start) return 0;
        const end = Number(this.state?.completedAt || 0) || Date.now();
        return Math.max(0, Math.floor((end - start) / 1000));
    },

    _formatTime(seconds = 0) {
        const safe = Math.max(0, Math.floor(Number(seconds || 0)));
        const mins = Math.floor(safe / 60);
        const secs = safe % 60;
        if (mins <= 0) return `${secs}s`;
        return `${mins}m ${String(secs).padStart(2, '0')}s`;
    },

    _modeButton(mode) {
        const cfg = this.MODES[mode];
        const active = this.state.mode === mode;
        return `<button onclick="NyanMemory.setMode('${mode}')" class="nyan-memory-mode ${active ? 'is-active' : ''}">${cfg.label}</button>`;
    },

    render() {
        this.init();
        const d = document.body.classList.contains('dark-theme');
        const cfg = this.MODES[this.state.mode] || this.MODES.medium;
        const text = d ? '#f8fafc' : '#1f1633';
        const sub = d ? 'rgba(255,255,255,0.58)' : 'rgba(31,22,51,0.58)';
        const panel = d ? 'rgba(16,9,31,0.92)' : '#fffaf0';
        const cardBg = d ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.78)';
        const border = d ? 'rgba(245,158,11,0.24)' : 'rgba(146,64,14,0.16)';
        const best = this._bestForMode(this.state.mode);
        const bestMoves = best ? `${best.moves} jogadas${best.seconds ? ' / ' + this._formatTime(best.seconds) : ''}` : 'Sem recorde';
        const elapsed = this._formatTime(this._elapsedSeconds());
        const pct = Math.round((this.state.matched / cfg.pairs) * 100);

        const cards = this.state.board.map((card, index) => {
            const visible = this._isVisible(index);
            return `
                <button class="nyan-memory-card ${visible ? 'is-visible' : ''} ${card.matched ? 'is-matched' : ''}"
                        onclick="NyanMemory.flip(${index})"
                        aria-label="Carta ${index + 1}">
                    <span>${visible ? card.symbol : '\u2726'}</span>
                </button>
            `;
        }).join('');

        return `
            <style>
                .nyan-memory-shell {
                    --memory-text:${text};
                    --memory-sub:${sub};
                    --memory-panel:${panel};
                    --memory-card:${cardBg};
                    --memory-border:${border};
                    max-width:760px;
                    margin:0 auto;
                    color:var(--memory-text);
                    font-family:'DM Sans',sans-serif;
                }
                .nyan-memory-panel {
                    border:1px solid var(--memory-border);
                    background:var(--memory-panel);
                    border-radius:16px;
                    padding:1rem;
                    box-shadow:0 16px 42px rgba(15,23,42,0.14);
                }
                .nyan-memory-head {
                    display:flex;
                    align-items:flex-start;
                    justify-content:space-between;
                    gap:1rem;
                    flex-wrap:wrap;
                    margin-bottom:0.9rem;
                }
                .nyan-memory-title {
                    margin:0;
                    font-family:'Syne',sans-serif;
                    font-size:1.35rem;
                    font-weight:900;
                    line-height:1.1;
                }
                .nyan-memory-sub {
                    margin:0.25rem 0 0;
                    color:var(--memory-sub);
                    font-size:0.78rem;
                    line-height:1.45;
                }
                .nyan-memory-modes {
                    display:flex;
                    gap:0.38rem;
                    flex-wrap:wrap;
                }
                .nyan-memory-mode,
                .nyan-memory-reset {
                    border:1px solid var(--memory-border);
                    background:var(--memory-card);
                    color:var(--memory-text);
                    border-radius:9px;
                    padding:0.42rem 0.62rem;
                    font-size:0.7rem;
                    font-weight:900;
                    cursor:pointer;
                }
                .nyan-memory-mode.is-active,
                .nyan-memory-reset {
                    border-color:transparent;
                    color:#111827;
                    background:linear-gradient(135deg,#fcd34d,#f59e0b);
                }
                .nyan-memory-stats {
                    display:grid;
                    grid-template-columns:repeat(5,minmax(0,1fr));
                    gap:0.5rem;
                    margin-bottom:0.85rem;
                }
                .nyan-memory-stat {
                    background:var(--memory-card);
                    border:1px solid var(--memory-border);
                    border-radius:10px;
                    padding:0.58rem;
                    text-align:center;
                    min-width:0;
                }
                .nyan-memory-stat strong {
                    display:block;
                    font-family:'Syne',sans-serif;
                    font-size:0.98rem;
                    line-height:1.1;
                    overflow:hidden;
                    text-overflow:ellipsis;
                    white-space:nowrap;
                }
                .nyan-memory-stat span {
                    display:block;
                    margin-top:0.16rem;
                    color:var(--memory-sub);
                    font-size:0.6rem;
                    font-weight:900;
                    text-transform:uppercase;
                    letter-spacing:0.08em;
                }
                .nyan-memory-board {
                    display:grid;
                    grid-template-columns:repeat(${cfg.columns}, minmax(0, 1fr));
                    gap:0.5rem;
                }
                .nyan-memory-card {
                    aspect-ratio:1 / 1;
                    min-height:58px;
                    border:1px solid var(--memory-border);
                    border-radius:10px;
                    background:linear-gradient(135deg,rgba(168,85,247,0.16),rgba(245,158,11,0.12));
                    color:#fcd34d;
                    cursor:pointer;
                    font-size:1.5rem;
                    font-weight:900;
                    transition:transform 0.16s ease, background 0.18s ease, border-color 0.18s ease;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                }
                .nyan-memory-card:hover { transform:translateY(-2px); border-color:rgba(245,158,11,0.5); }
                .nyan-memory-card.is-visible {
                    background:var(--memory-card);
                    color:var(--memory-text);
                    transform:rotateY(0deg);
                }
                .nyan-memory-card.is-matched {
                    border-color:rgba(34,197,94,0.42);
                    background:rgba(34,197,94,0.12);
                    animation:nyanMemoryMatched 0.42s ease both;
                }
                @keyframes nyanMemoryMatched {
                    0% { transform:scale(1); }
                    45% { transform:scale(1.05); border-color:rgba(245,158,11,0.68); }
                    100% { transform:scale(1); }
                }
                .nyan-memory-win {
                    margin-top:0.8rem;
                    border:1px solid rgba(245,158,11,0.28);
                    border-radius:12px;
                    padding:0.7rem;
                    background:rgba(245,158,11,0.1);
                    color:var(--memory-text);
                    font-size:0.78rem;
                    font-weight:800;
                    display:flex;
                    justify-content:space-between;
                    gap:0.7rem;
                    align-items:center;
                    flex-wrap:wrap;
                }
                @media (max-width:720px) {
                    .nyan-memory-stats { grid-template-columns:repeat(2,minmax(0,1fr)); }
                    .nyan-memory-board { grid-template-columns:repeat(4,minmax(0,1fr)); }
                    .nyan-memory-card { min-height:52px; font-size:1.25rem; }
                }
            </style>
            <div class="nyan-memory-shell">
                <section class="nyan-memory-panel">
                    <div class="nyan-memory-head">
                        <div>
                            <h2 class="nyan-memory-title">Memoria Nyan</h2>
                            <p class="nyan-memory-sub">Encontre os pares da Final Season. Baixo grind, pura memoria.</p>
                        </div>
                        <div class="nyan-memory-modes">
                            ${Object.keys(this.MODES).map((mode) => this._modeButton(mode)).join('')}
                            <button class="nyan-memory-reset" onclick="NyanMemory.reset(); Router.render();">Reiniciar</button>
                        </div>
                    </div>
                    <div class="nyan-memory-stats">
                        <div class="nyan-memory-stat"><strong>${this.state.moves}</strong><span>Jogadas</span></div>
                        <div class="nyan-memory-stat"><strong>${this.state.matched}/${cfg.pairs}</strong><span>Pares</span></div>
                        <div class="nyan-memory-stat"><strong>${elapsed}</strong><span>Tempo</span></div>
                        <div class="nyan-memory-stat"><strong>${pct}%</strong><span>Progresso</span></div>
                        <div class="nyan-memory-stat"><strong>${bestMoves}</strong><span>Recorde</span></div>
                    </div>
                    <div class="nyan-memory-board">${cards}</div>
                    ${this.state.completed ? `<div class="nyan-memory-win"><span>Partida concluida em ${elapsed}. Essa lembranca fica guardada.</span><button class="nyan-memory-reset" onclick="NyanMemory.reset(); Router.render();">Jogar de novo</button></div>` : ''}
                </section>
            </div>
        `;
    },
};

window.NyanMemory = NyanMemory;
