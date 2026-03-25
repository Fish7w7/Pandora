/* ══════════════════════════════════════════════════
   LEADERBOARD.JS v1.0.0 — NyanTools にゃん~ v3.9.0
   Placar Global por Jogo

   ESTRUTURA FIRESTORE:
   leaderboards/{gameId}/scores/{uid}/
     uid, nyanTag, username, avatar, score, level, updatedAt

   Filtros: global (top 10) | friends (entre amigos)

 ═══════════════════════════════════════════════════*/

const Leaderboard = {

    GAMES: [
        { id: 'typeracer',  name: 'Type Racer',   icon: '⌨️', key: 'typeracer_highscore',   unit: 'WPM',    higher: true  },
        { id: '2048',       name: '2048',          icon: '🔢', key: 'game_2048_highscore',   unit: 'pts',    higher: true  },
        { id: 'flappy',     name: 'Flappy Nyan',   icon: '🐱', key: 'flappy_bird_highscore', unit: 'pts',    higher: true  },
        { id: 'quiz',       name: 'Quiz Diário',   icon: '🧠', key: 'quiz_highscore',         unit: '/10',   higher: true  },
        { id: 'termo',      name: 'Termo',         icon: '🔤', key: 'termo_best',             unit: 'tent.', higher: false },
        { id: 'snake',      name: 'Cobrinha',      icon: '🐍', key: 'snake_highscore',        unit: 'pts',   higher: true  },
    ],

    _currentGame:   'typeracer',
    _currentFilter: 'global', // 'global' | 'friends'

    // ── SINCRONIZAR SCORE DO JOGADOR ATUAL ───────────────────────────────────

    async syncScore(gameId, score) {
        if (!NyanAuth.isOnline()) return;

        const uid     = NyanAuth.getUID();
        const profile = NyanAuth.currentUser;
        if (!uid || !profile) return;

        const game = this.GAMES.find(g => g.id === gameId);
        if (!game) return;

        // Verificar se é melhor que o score atual no Firestore
        const existing = await NyanFirebase.getDoc(`leaderboards/${gameId}/scores/${uid}`);
        if (existing) {
            const isBetter = game.higher
                ? score > (existing.score || 0)
                : score < (existing.score || Infinity);
            if (!isBetter) return;
        }

        await NyanFirebase.setDoc(`leaderboards/${gameId}/scores/${uid}`, {
            uid,
            nyanTag:   profile.nyanTag  || NyanAuth.getNyanTag() || '',
            username:  profile.username || Auth.getStoredUser()?.username || 'Jogador',
            avatar:    profile.avatar   || Utils.loadData('nyan_profile_avatar') || null,
            score,
            level:     window.Economy?.getLevel?.() || 1,
            updatedAt: NyanFirebase.fn.serverTimestamp(),
        });

        console.log(`[Leaderboard] Score sincronizado: ${gameId} → ${score}`);
    },

    // ── AUTO-SYNC ao bater recorde ────────────────────────────────────────────
    // Chamado pelo Economy.checkRecord() via hook

    setupAutoSync() {
        const origCheckRecord = window.Economy?.checkRecord?.bind(window.Economy);
        if (!origCheckRecord) return;

        window.Economy.checkRecord = (storageKey, newScore, higherIsBetter = true) => {
            const wasRecord = origCheckRecord(storageKey, newScore, higherIsBetter);
            if (wasRecord) {
                const gameId = Leaderboard.KEY_TO_GAME[storageKey];
                if (gameId) {
                    // Sync para leaderboard collection
                    this.syncScore(gameId, newScore);
                    // Sync imediato para users/{uid} sc_* (usado pelo ranking global)
                    const uid = NyanAuth.getUID();
                    if (uid && NyanFirebase.isReady()) {
                        const scKey = 'sc_' + gameId;
                        const update = { [scKey]: newScore, sc_updatedAt: NyanFirebase.fn.serverTimestamp() };
                        NyanFirebase.updateDoc('users/' + uid, update).catch(() => {});
                    }
                    // Recarregar placar se estiver aberto
                    if (Router?.currentRoute === 'leaderboard') {
                        setTimeout(() => this.loadScores(), 1000);
                    }
                }
            }
            return wasRecord;
        };
    },

    // ── RENDER PRINCIPAL ──────────────────────────────────────────────────────

    render() {
        if (!NyanAuth.isOnline()) return Friends._renderOfflineState();

        const d    = document.body.classList.contains('dark-theme');
        const bg   = d ? 'rgba(255,255,255,0.04)' : '#ffffff';
        const bdr  = d ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
        const muted= d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';

        return `
        <div style="max-width:640px;margin:0 auto;font-family:'DM Sans',sans-serif;">

            <!-- Header -->
            <div style="text-align:center;margin-bottom:1.75rem;">
                <div style="font-size:2.5rem;margin-bottom:0.4rem;">🏆</div>
                <h1 style="font-family:'Syne',sans-serif;font-size:2rem;font-weight:900;margin:0 0 0.25rem;
                    background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));
                    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
                    Placar Global
                </h1>
            </div>

            <!-- Filtro: global / amigos -->
            <div style="display:flex;gap:0.5rem;margin-bottom:1rem;">
                <button id="lb-filter-global"
                        onclick="Leaderboard.setFilter('global')"
                        style="flex:1;padding:0.6rem;border-radius:10px;border:none;cursor:pointer;
                            font-size:0.8rem;font-weight:700;font-family:'DM Sans',sans-serif;
                            background:var(--theme-primary,#a855f7);color:white;
                            transition:filter 0.15s;"
                        onmouseover="this.style.filter='brightness(1.1)'"
                        onmouseout="this.style.filter=''">
                    🌍 Global
                </button>
                <button id="lb-filter-friends"
                        onclick="Leaderboard.setFilter('friends')"
                        style="flex:1;padding:0.6rem;border-radius:10px;border:none;cursor:pointer;
                            font-size:0.8rem;font-weight:700;font-family:'DM Sans',sans-serif;
                            background:${bg};color:${muted};border:1px solid ${bdr};
                            transition:all 0.15s;">
                    👥 Apenas amigos
                </button>
            </div>

            <!-- Seletor de jogo -->
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.5rem;margin-bottom:1.25rem;">
                ${this.GAMES.map(g => `
                <button onclick="Leaderboard.setGame('${g.id}')"
                        id="lb-game-${g.id}"
                        style="padding:0.625rem 0.5rem;border-radius:10px;border:none;cursor:pointer;
                            font-size:0.75rem;font-weight:700;font-family:'DM Sans',sans-serif;
                            transition:all 0.18s;
                            background:${g.id===this._currentGame?'rgba(168,85,247,0.15)':bg};
                            color:${g.id===this._currentGame?'rgba(168,85,247,0.9)':muted};
                            border:1px solid ${g.id===this._currentGame?'rgba(168,85,247,0.3)':bdr};">
                    ${g.icon} ${g.name}
                </button>`).join('')}
            </div>

            <!-- Tabela de scores -->
            <div id="leaderboard-table" style="background:${bg};border:1px solid ${bdr};border-radius:16px;overflow:hidden;">
                <div style="text-align:center;padding:2rem;color:${muted};font-size:0.8rem;">Carregando...</div>
            </div>

            <!-- Posição do jogador -->
            <div id="my-position" style="margin-top:0.75rem;"></div>

        </div>`;
    },

    // ── CARREGAR E RENDERIZAR TABELA ──────────────────────────────────────────

    async loadScores() {
        const table = document.getElementById('leaderboard-table');
        const myPos = document.getElementById('my-position');
        if (!table) return;

        const game   = this.GAMES.find(g => g.id === this._currentGame);
        const myUID  = NyanAuth.getUID();
        const d      = document.body.classList.contains('dark-theme');
        const text   = d ? '#f1f5f9' : '#0f172a';
        const sub    = d ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
        const muted  = d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';
        const sep    = d ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

        try {
            const { query, collection, orderBy, limit, getDocs, where } = NyanFirebase.fn;

            let scores;

            if (this._currentFilter === 'friends') {
                // Buscar amigos via friendships
                const { query: fq2, collection: fc2, where: fw2, getDocs: fgd2 } = NyanFirebase.fn;
                const fsSnap2 = await fgd2(fq2(fc2(NyanFirebase.db, 'friendships'), fw2('users', 'array-contains', myUID)));
                const friendList = fsSnap2.docs.map(d => {
                    const users = d.data().users || [];
                    return users.find(u => u !== myUID);
                }).filter(Boolean);
                const friendUIDs = [myUID, ...friendList];

                // Buscar scores via users/{uid} campos sc_* + fallback leaderboard
                const scKey = 'sc_' + this._currentGame;
                const allProfiles = await Promise.all(
                    friendUIDs.map(uid => NyanFirebase.getDoc('users/' + uid).catch(() => null))
                );

                scores = allProfiles.filter(Boolean).map(p => {
                    // Tentar sc_* primeiro, depois leaderboard (preenchido pelo syncScore)
                    const val = p[scKey];
                    if (!val || val <= 0) return null;
                    return {
                        uid:        p.uid,
                        score:      parseFloat(val),
                        username:   p.username || '?',
                        nyanTag:    p.nyanTag  || '',
                        avatar:     p.avatar   || null,
                        level:      p.level    || 1,
                        updatedAt:  p.sc_updatedAt || p.lastSeen || null,
                    };
                }).filter(Boolean);

                // Sempre usar score local para o próprio jogador (mais confiável que Firestore)
                const myLocal = parseFloat(Utils.loadData(game.key));
                if (myLocal > 0) {
                    // Remover entrada do Firestore do próprio usuário (pode estar desatualizada)
                    const filtered = scores.filter(s => s.uid !== myUID);
                    const me = NyanAuth.currentUser || {};
                    filtered.push({
                        uid:      myUID,
                        score:    myLocal,
                        username: me.username || 'Você',
                        nyanTag:  me.nyanTag  || NyanAuth.getNyanTag() || '',
                        avatar:   me.avatar   || Utils.loadData('nyan_profile_avatar') || null,
                        level:    window.Economy?.getLevel?.() || 1,
                    });
                    scores = filtered;
                }

                scores.sort((a, b) => {
                    const diff = game.higher ? b.score - a.score : a.score - b.score;
                    if (diff !== 0) return diff;
                    // Desempate: quem fez primeiro fica na frente
                    const ta = a.updatedAt?.seconds || 0;
                    const tb = b.updatedAt?.seconds || 0;
                    return ta - tb;
                });
                scores = scores.slice(0, 10);
            } else {
                const scKey = 'sc_' + this._currentGame;

                // Buscar TODOS os usuários com sc_{gameId} — fonte universal
                const { query: gq, collection: gc, where: gw, getDocs: ggd, orderBy: gob, limit: glim } = NyanFirebase.fn;

                // Tentar leaderboard collection primeiro (mais rápido, só top scores)
                const lbSnap = await ggd(gq(
                    gc(NyanFirebase.db, `leaderboards/${this._currentGame}/scores`),
                    gob('score', game.higher ? 'desc' : 'asc'),
                    glim(10)
                ));
                scores = lbSnap.docs.map(d => ({ id: d.id, ...d.data() }));

                // Se leaderboard vazio ou incompleto, buscar de users com sc_* 
                // (cobre usuários que ainda não foram para o leaderboard)
                if (scores.length < 10) {
                    try {
                        const usersSnap = await ggd(gq(
                            gc(NyanFirebase.db, 'users'),
                            gw(scKey, '>', 0),
                            glim(50)
                        ));
                        usersSnap.docs.forEach(d => {
                            const p = d.data();
                            if (scores.some(s => s.uid === p.uid)) return; // já está
                            const val = p[scKey];
                            if (val > 0) scores.push({
                                uid: p.uid, score: parseFloat(val),
                                username: p.username || '?', nyanTag: p.nyanTag || '',
                                avatar: p.avatar || null, level: p.level || 1,
                                updatedAt: p.sc_updatedAt || p.lastSeen || null,
                            });
                        });
                    } catch(e) {}
                }

                // Sempre garantir que o próprio jogador aparece
                const myLocalScore = parseFloat(Utils.loadData(game.key));
                if (myLocalScore > 0 && myUID) {
                    const alreadyIn = scores.some(s => s.uid === myUID);
                    if (!alreadyIn) {
                        const profile = NyanAuth.currentUser || {};
                        scores.push({
                            uid: myUID, score: myLocalScore,
                            username: profile.username || 'Você',
                            nyanTag:  profile.nyanTag  || NyanAuth.getNyanTag() || '',
                            avatar:   profile.avatar   || Utils.loadData('nyan_profile_avatar') || null,
                            level:    window.Economy?.getLevel?.() || 1,
                        });
                        this.syncScore(this._currentGame, myLocalScore).catch(() => {});
                    }
                }

                scores.sort((a, b) => {
                    const diff = game.higher ? b.score - a.score : a.score - b.score;
                    if (diff !== 0) return diff;
                    const ta = a.updatedAt?.seconds || 0;
                    const tb = b.updatedAt?.seconds || 0;
                    return ta - tb;
                });
                scores = scores.slice(0, 10);
            }

            const medals = ['🥇','🥈','🥉'];

            table.innerHTML = scores.length === 0
                ? `<div style="text-align:center;padding:2rem;color:${muted};font-size:0.8rem;">Nenhum score registrado ainda</div>`
                : scores.map((s, i) => {
                    const isMe = s.uid === myUID;
                    const bgRow= isMe
                        ? 'rgba(168,85,247,0.08)'
                        : (i % 2 === 0 ? 'transparent' : (d?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.02)'));

                    return `
                    <div style="display:flex;align-items:center;gap:0.875rem;
                        padding:0.75rem 1rem;
                        border-bottom:1px solid ${sep};
                        background:${bgRow};
                        ${isMe?'border-left:3px solid var(--theme-primary,#a855f7);':''}"
                        onmouseover="this.style.background='rgba(168,85,247,0.05)'"
                        onmouseout="this.style.background='${bgRow}'">

                        <!-- Posição -->
                        <div style="width:28px;text-align:center;font-size:${i<3?'1.1rem':'0.8rem'};
                            font-weight:800;color:${i<3?'inherit':muted};flex-shrink:0;">
                            ${medals[i] || `#${i+1}`}
                        </div>

                        <!-- Avatar -->
                        <div style="width:34px;height:34px;border-radius:9px;overflow:hidden;flex-shrink:0;">
                            ${s.avatar
                                ? `<img src="${s.avatar}" style="width:100%;height:100%;object-fit:cover;"/>`
                                : (window.AvatarGenerator ? AvatarGenerator.generate(s.username||'nyan', 34) : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#7c3aed,#ec4899);display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:0.75rem;">${(s.username||'N')[0].toUpperCase()}</div>`)}
                        </div>

                        <!-- Nome -->
                        <div style="flex:1;min-width:0;">
                            <div style="font-size:0.85rem;font-weight:${isMe?'800':'600'};color:${text};
                                display:flex;align-items:center;gap:0.375rem;">
                                ${s.username || 'Jogador'}
                                ${isMe ? `<span style="font-size:0.6rem;font-weight:700;background:rgba(168,85,247,0.15);color:rgba(168,85,247,0.9);border-radius:99px;padding:1px 6px;">Você</span>` : ''}
                            </div>
                            <div style="font-size:0.68rem;color:${muted};">${s.nyanTag || ''}</div>
                        </div>

                        <!-- Score -->
                        <div style="text-align:right;flex-shrink:0;">
                            <div style="font-size:1rem;font-weight:900;font-family:'Syne',sans-serif;
                                color:${i===0?'#f59e0b':i===1?'#9ca3af':i===2?'#cd7c2f':'var(--theme-primary,#a855f7)'};">
                                ${typeof s.score === 'number' ? s.score.toLocaleString('pt-BR') : s.score}
                            </div>
                            <div style="font-size:0.65rem;color:${muted};">${game.unit}</div>
                        </div>
                    </div>`;
                }).join('');

            // Posição do jogador atual (se não estiver no top 10)
            if (myPos) {
                const myRank = scores.findIndex(s => s.uid === myUID) + 1;
                if (myRank === 0) {
                    const myLocal = Utils.loadData(game.key);
                    myPos.innerHTML = myLocal ? `
                    <div style="font-size:0.75rem;color:${muted};text-align:center;padding:0.5rem;">
                        Seu melhor: <strong style="color:var(--theme-primary,#a855f7);">${myLocal} ${game.unit}</strong>
                        · Ainda não está no ranking global
                    </div>` : '';
                } else {
                    myPos.innerHTML = `
                    <div style="font-size:0.75rem;color:${muted};text-align:center;padding:0.5rem;">
                        Você está em <strong style="color:var(--theme-primary,#a855f7);">🏅 #${myRank}</strong> neste jogo!
                    </div>`;
                }
            }

        } catch (err) {
            table.innerHTML = `<div style="text-align:center;padding:2rem;color:#ef4444;font-size:0.8rem;">Erro ao carregar: ${err.message}</div>`;
        }
    },

    // ── CONTROLES ─────────────────────────────────────────────────────────────

    setGame(gameId) {
        this._currentGame = gameId;
        // Atualizar visual dos botões
        this.GAMES.forEach(g => {
            const btn = document.getElementById(`lb-game-${g.id}`);
            if (!btn) return;
            const d    = document.body.classList.contains('dark-theme');
            const bg   = d ? 'rgba(255,255,255,0.04)' : '#ffffff';
            const bdr  = d ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
            const muted= d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';
            const active = g.id === gameId;
            btn.style.background = active ? 'rgba(168,85,247,0.15)' : bg;
            btn.style.color      = active ? 'rgba(168,85,247,0.9)' : muted;
            btn.style.border     = `1px solid ${active ? 'rgba(168,85,247,0.3)' : bdr}`;
        });
        this.loadScores();
    },

    setFilter(filter) {
        this._currentFilter = filter;
        const d    = document.body.classList.contains('dark-theme');
        const bg   = d ? 'rgba(255,255,255,0.04)' : '#ffffff';
        const bdr  = d ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
        const muted= d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';

        const gBtn = document.getElementById('lb-filter-global');
        const fBtn = document.getElementById('lb-filter-friends');

        if (gBtn && fBtn) {
            if (filter === 'global') {
                gBtn.style.background = 'var(--theme-primary,#a855f7)';
                gBtn.style.color      = 'white';
                gBtn.style.border     = 'none';
                fBtn.style.background = bg;
                fBtn.style.color      = muted;
                fBtn.style.border     = `1px solid ${bdr}`;
            } else {
                fBtn.style.background = 'var(--theme-primary,#a855f7)';
                fBtn.style.color      = 'white';
                fBtn.style.border     = 'none';
                gBtn.style.background = bg;
                gBtn.style.color      = muted;
                gBtn.style.border     = `1px solid ${bdr}`;
            }
        }
        this.loadScores();
    },

    // ── INIT ──────────────────────────────────────────────────────────────────

    KEY_TO_GAME: {
        'typeracer_highscore':   'typeracer',
        'game_2048_highscore':   '2048',
        'flappy_bird_highscore': 'flappy',
        'quiz_highscore':        'quiz',
        'termo_best':            'termo',
        'snake_highscore':       'snake',
    },

    async syncAllLocalScores() {
        if (!NyanAuth.isOnline()) return;

        // Aguardar currentUser estar disponível (pode ainda estar carregando)
        let attempts = 0;
        while (!NyanAuth.currentUser && attempts < 20) {
            await new Promise(r => setTimeout(r, 500));
            attempts++;
        }
        if (!NyanAuth.currentUser || !NyanAuth.getUID()) return;

        let synced = 0;
        for (const [key, gameId] of Object.entries(this.KEY_TO_GAME)) {
            const val = parseFloat(Utils.loadData(key));
            if (val > 0) {
                await this.syncScore(gameId, val).catch(() => {});
                synced++;
            }
        }
        if (synced > 0) {
            console.log('[Leaderboard] ' + synced + ' scores locais → Firebase');
            this.loadScores();
        }
    },

    init() {
        this.setupAutoSync();
        setTimeout(() => this.loadScores(), 100);
        // Sincronizar scores locais existentes uma vez por dia
        // Sincronizar scores locais sempre que abrir (aguarda Firebase conectar)
        setTimeout(() => this.syncAllLocalScores(), 3000);
        console.log('[Leaderboard] v1.0.0 inicializado');
    },
};

window.Leaderboard = Leaderboard;