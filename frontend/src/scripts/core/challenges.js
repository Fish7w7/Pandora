/* ══════════════════════════════════════════════════
   CHALLENGES.JS v1.0.0 — NyanTools にゃん~ v3.9.0
   Desafios entre amigos (duelos 24h)

   ESTRUTURA FIRESTORE:
   challenges/{challengeId}/
     challenger: { uid, tag, username, avatar }
     challenged: { uid, tag, username, avatar }
     gameId, gameName, gameIcon
     status: 'pending' | 'active' | 'completed' | 'expired'
     challengerScore: number | null
     challengedScore: number | null
     winnerId: uid | null
     createdAt: Timestamp
     expiresAt: Timestamp  (+24h de createdAt)
     rewardXP: number
     rewardChips: number

 ═══════════════════════════════════════════════════*/

const Challenges = {

    GAMES: [
        { id: 'typeracer', name: 'Type Racer',  icon: '⌨️', unit: 'WPM',  higher: true  },
        { id: '2048',      name: '2048',         icon: '🔢', unit: 'pts',  higher: true  },
        { id: 'flappy',    name: 'Flappy Nyan',  icon: '🐱', unit: 'pts',  higher: true  },
        { id: 'quiz',      name: 'Quiz Diário',  icon: '🧠', unit: '/10',  higher: true  },
        { id: 'termo',     name: 'Termo',        icon: '🔤', unit: 'tent.',higher: false },
    ],

    REWARD_XP:    60,
    REWARD_CHIPS: 40,
    DURATION_H:   24,

    // ── CRIAR DESAFIO ─────────────────────────────────────────────────────────

    async create(targetUID, gameId) {
        if (!NyanAuth.isOnline()) {
            Utils.showNotification('❌ Modo offline — conecte o Firebase', 'error');
            return null;
        }

        const myUID   = NyanAuth.getUID();
        const profile = NyanAuth.currentUser || {};
        const game    = this.GAMES.find(g => g.id === gameId);
        if (!game) return null;

        const target  = await NyanFirebase.getDoc(`users/${targetUID}`);
        if (!target)  { Utils.showNotification('❌ Amigo não encontrado', 'error'); return null; }

        const now     = new Date();
        const expires = new Date(now.getTime() + this.DURATION_H * 3600 * 1000);

        const challenge = {
            challenger: {
                uid:      myUID,
                tag:      profile.nyanTag  || NyanAuth.getNyanTag() || '',
                username: profile.username || Auth.getStoredUser()?.username || 'Você',
                avatar:   profile.avatar   || Utils.loadData('nyan_profile_avatar') || null,
            },
            challenged: {
                uid:      targetUID,
                tag:      target.nyanTag,
                username: target.username,
                avatar:   target.avatar || null,
            },
            gameId,
            gameName:        game.name,
            gameIcon:        game.icon,
            higherIsBetter:  game.higher,
            unit:            game.unit,
            status:          'pending',
            challengerScore: null,
            challengedScore: null,
            winnerId:        null,
            rewardXP:        this.REWARD_XP,
            rewardChips:     this.REWARD_CHIPS,
            createdAt:       NyanFirebase.fn.serverTimestamp(),
            expiresAt:       NyanFirebase.fn.Timestamp.fromDate(expires),
        };

        const ref = await NyanFirebase.fn.addDoc(
            NyanFirebase.fn.collection(NyanFirebase.db, 'challenges'),
            challenge
        );

        Utils.showNotification(`⚔️ Desafio enviado para ${target.nyanTag}!`, 'success');
        return ref.id;
    },

    // ── ACEITAR DESAFIO ───────────────────────────────────────────────────────

    async accept(challengeId) {
        await NyanFirebase.updateDoc(`challenges/${challengeId}`, { status: 'active' });
        Utils.showNotification('⚔️ Desafio aceito! Jogue e registre seu score!', 'success');
        this.render(); Router?.render();
    },

    async decline(challengeId) {
        await NyanFirebase.updateDoc(`challenges/${challengeId}`, { status: 'expired' });
        Utils.showNotification('Desafio recusado', 'info');
        Router?.render();
    },

    // ── REGISTRAR SCORE ───────────────────────────────────────────────────────

    async submitScore(challengeId, score) {
        const ch    = await NyanFirebase.getDoc(`challenges/${challengeId}`);
        if (!ch || ch.status !== 'active') return;

        const myUID = NyanAuth.getUID();
        const isChallenger = ch.challenger.uid === myUID;
        const field = isChallenger ? 'challengerScore' : 'challengedScore';

        await NyanFirebase.updateDoc(`challenges/${challengeId}`, { [field]: score });

        // Verificar se ambos jogaram
        const updated = await NyanFirebase.getDoc(`challenges/${challengeId}`);
        if (updated.challengerScore !== null && updated.challengedScore !== null) {
            await this._resolveChallenge(challengeId, updated);
        }

        // Notificação só se não veio do hook (que já notifica)
        if (!window._activeChallenge) {
            Utils.showNotification(`✅ Score ${score} registrado! Aguardando adversário...`, 'success');
        }
    },

    // ── RESOLVER DESAFIO ──────────────────────────────────────────────────────

    async _resolveChallenge(challengeId, ch) {
        const cScore = ch.challengerScore;
        const dScore = ch.challengedScore;

        let winnerId;
        if (ch.higherIsBetter) {
            winnerId = cScore >= dScore ? ch.challenger.uid : ch.challenged.uid;
        } else {
            winnerId = cScore <= dScore ? ch.challenger.uid : ch.challenged.uid;
        }

        await NyanFirebase.updateDoc(`challenges/${challengeId}`, {
            status:   'completed',
            winnerId,
        });

        // Dar recompensas ao vencedor
        const myUID = NyanAuth.getUID();
        if (winnerId === myUID) {
            window.Economy?.grant?.('mission_medium');
            Utils.showNotification(`🏆 Você venceu o desafio! +${ch.rewardXP} XP · +${ch.rewardChips} chips`, 'success');
        } else {
            Utils.showNotification('😅 Desafio finalizado — vitória do adversário!', 'info');
        }
    },

    // ── RENDER PRINCIPAL ──────────────────────────────────────────────────────

    render() {
        if (!NyanAuth.isOnline()) return Friends._renderOfflineState();

        const d    = document.body.classList.contains('dark-theme');
        const muted= d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';

        return `
        <div style="max-width:640px;margin:0 auto;font-family:'DM Sans',sans-serif;">
            <div style="text-align:center;margin-bottom:1.75rem;">
                <div style="font-size:2.5rem;margin-bottom:0.4rem;">⚔️</div>
                <h1 style="font-family:'Syne',sans-serif;font-size:2rem;font-weight:900;margin:0 0 0.25rem;
                    background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));
                    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
                    Desafios
                </h1>
                <p style="font-size:0.75rem;color:${muted};margin:0;">Duelos de 24h com seus amigos にゃん~</p>
            </div>
            <div id="challenges-content">
                <div style="text-align:center;padding:2rem;color:${muted};font-size:0.8rem;">Carregando desafios...</div>
            </div>
        </div>`;
    },

    // ── CARREGAR DESAFIOS ─────────────────────────────────────────────────────

    async loadChallenges() {
        const myUID = NyanAuth.getUID();
        const { query, collection, where, orderBy, getDocs, or } = NyanFirebase.fn;

        // Buscar desafios onde sou challenger ou challenged (sem orderBy para evitar índice composto)
        const [asChallenger, asChallenged] = await Promise.all([
            getDocs(query(collection(NyanFirebase.db, 'challenges'), where('challenger.uid', '==', myUID))),
            getDocs(query(collection(NyanFirebase.db, 'challenges'), where('challenged.uid', '==', myUID))),
        ]);

        const all = [
            ...asChallenger.docs.map(d => ({ id: d.id, ...d.data() })),
            ...asChallenged.docs.map(d => ({ id: d.id, ...d.data() })),
        ];

        // Deduplicate e ordenar
        const seen = new Set();
        const unique = all.filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true; });
        unique.sort((a, b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));

        const container = document.getElementById('challenges-content');
        if (!container) return;

        if (unique.length === 0) {
            const d    = document.body.classList.contains('dark-theme');
            const muted= d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';
            const sub  = d ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
            container.innerHTML = `
            <div style="text-align:center;padding:3rem;color:${muted};">
                <div style="font-size:3rem;opacity:0.35;margin-bottom:0.75rem;">⚔️</div>
                <div style="font-size:0.9rem;font-weight:700;color:${sub};">Nenhum desafio</div>
                <p style="font-size:0.75rem;">Abra o perfil de um amigo e clique em "Desafiar"!</p>
            </div>`;
            return;
        }

        container.innerHTML = unique.map(c => this._renderChallenge(c, myUID)).join('');
    },

    // ── RENDER DE UM DESAFIO ──────────────────────────────────────────────────

    _renderChallenge(ch, myUID) {
        const d      = document.body.classList.contains('dark-theme');
        const bg     = d ? 'rgba(255,255,255,0.04)' : '#ffffff';
        const bdr    = d ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
        const text   = d ? '#f1f5f9' : '#0f172a';
        const sub    = d ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
        const muted  = d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';

        const isChallenger  = ch.challenger.uid === myUID;
        const opponent      = isChallenger ? ch.challenged : ch.challenger;
        const myScore       = isChallenger ? ch.challengerScore : ch.challengedScore;
        const opponentScore = isChallenger ? ch.challengedScore : ch.challengerScore;

        const statusColor = { pending:'#f59e0b', active:'#4ade80', completed:'#a855f7', expired:'#9ca3af' };
        const statusLabel = { pending:'Aguardando', active:'Em andamento', completed:'Finalizado', expired:'Expirado' };
        const color  = statusColor[ch.status] || statusColor.expired;
        const label  = statusLabel[ch.status] || 'Desconhecido';

        const expiresIn = ch.expiresAt?.seconds
            ? Math.max(0, Math.floor((ch.expiresAt.seconds - Date.now()/1000) / 3600))
            : null;

        let actionBtn = '';
        if (ch.status === 'pending' && !isChallenger) {
            actionBtn = `
            <div style="display:flex;gap:0.5rem;margin-top:0.875rem;">
                <button onclick="Challenges.accept('${ch.id}')"
                        style="flex:1;padding:0.6rem;border-radius:10px;border:none;cursor:pointer;
                            font-size:0.8rem;font-weight:700;
                            background:rgba(74,222,128,0.15);color:#4ade80;
                            border:1px solid rgba(74,222,128,0.3);font-family:'DM Sans',sans-serif;">
                    ⚔️ Aceitar desafio
                </button>
                <button onclick="Challenges.decline('${ch.id}')"
                        style="padding:0.6rem 1rem;border-radius:10px;border:none;cursor:pointer;
                            font-size:0.8rem;font-weight:700;
                            background:rgba(239,68,68,0.1);color:#f87171;
                            border:1px solid rgba(239,68,68,0.25);font-family:'DM Sans',sans-serif;">
                    ✕
                </button>
            </div>`;
        } else if (ch.status === 'active' && myScore === null) {
            actionBtn = `
            <button onclick="Challenges.startPlay('${ch.id}','${ch.gameId}')"
                    style="width:100%;margin-top:0.875rem;padding:0.6rem;border-radius:10px;border:none;cursor:pointer;
                        font-size:0.8rem;font-weight:700;
                        background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));
                        color:white;font-family:'DM Sans',sans-serif;transition:filter 0.15s;"
                    onmouseover="this.style.filter='brightness(1.1)'"
                    onmouseout="this.style.filter=''">
                🎮 Jogar agora · ${ch.gameName}
            </button>`;
        }

        const winner = ch.winnerId ? (ch.winnerId === myUID ? '🏆 Você venceu!' : '😅 Derrota...') : '';

        return `
        <div style="background:${bg};border:1px solid ${bdr};border-radius:16px;
            padding:1rem 1.125rem;margin-bottom:0.75rem;">

            <!-- Header -->
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.875rem;">
                <div style="display:flex;align-items:center;gap:0.625rem;">
                    <span style="font-size:1.25rem;">${ch.gameIcon}</span>
                    <div>
                        <div style="font-size:0.875rem;font-weight:700;color:${text};">${ch.gameName}</div>
                        <div style="font-size:0.68rem;color:${muted};">${isChallenger ? 'Você desafiou' : 'Te desafiaram'}</div>
                    </div>
                </div>
                <div style="display:flex;align-items:center;gap:0.5rem;">
                    ${ch.status === 'completed' && winner ? `<span style="font-size:0.78rem;font-weight:700;color:${ch.winnerId===myUID?'#4ade80':'#f87171'};">${winner}</span>` : ''}
                    <span style="font-size:0.65rem;font-weight:700;padding:2px 8px;border-radius:99px;
                        background:${color}22;color:${color};border:1px solid ${color}44;">
                        ${label}
                    </span>
                </div>
            </div>

            <!-- Placar lado a lado -->
            <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:0.625rem;align-items:center;">
                <!-- Eu -->
                <div style="text-align:center;padding:0.75rem;background:${d?'rgba(255,255,255,0.03)':'#f8f8fc'};border-radius:10px;">
                    <div style="font-size:0.7rem;color:${muted};margin-bottom:0.375rem;">Você</div>
                    <div style="font-size:1.25rem;font-weight:900;font-family:'Syne',sans-serif;
                        color:${myScore!==null?'var(--theme-primary,#a855f7)':muted};">
                        ${myScore !== null ? myScore.toLocaleString('pt-BR') : '—'}
                    </div>
                    ${myScore !== null ? `<div style="font-size:0.65rem;color:${muted};">${ch.unit}</div>` : `<div style="font-size:0.65rem;color:${muted};">ainda não jogou</div>`}
                </div>

                <span style="font-size:1rem;color:${muted};font-weight:800;">vs</span>

                <!-- Oponente -->
                <div style="text-align:center;padding:0.75rem;background:${d?'rgba(255,255,255,0.03)':'#f8f8fc'};border-radius:10px;">
                    <div style="font-size:0.7rem;color:${muted};margin-bottom:0.375rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${opponent.username}</div>
                    <div style="font-size:1.25rem;font-weight:900;font-family:'Syne',sans-serif;
                        color:${opponentScore!==null?'#ec4899':muted};">
                        ${opponentScore !== null ? opponentScore.toLocaleString('pt-BR') : '—'}
                    </div>
                    ${opponentScore !== null ? `<div style="font-size:0.65rem;color:${muted};">${ch.unit}</div>` : `<div style="font-size:0.65rem;color:${muted};">aguardando</div>`}
                </div>
            </div>

            <!-- Info de expiração e recompensas -->
            <div style="display:flex;justify-content:space-between;margin-top:0.625rem;">
                ${expiresIn !== null && ch.status !== 'completed' && ch.status !== 'expired'
                    ? `<span style="font-size:0.68rem;color:${muted};">⏰ Expira em ${expiresIn}h</span>`
                    : '<span></span>'}
                <span style="font-size:0.68rem;color:${muted};">🏆 +${ch.rewardXP} XP · +${ch.rewardChips} chips</span>
            </div>

            ${actionBtn}
        </div>`;
    },

    // ── PROMPT PARA INSERIR SCORE ─────────────────────────────────────────────

    _promptScore(challengeId, gameId) {
        const game = this.GAMES.find(g => g.id === gameId);
        const d    = document.body.classList.contains('dark-theme');
        const bg   = d ? '#0e0e16' : '#ffffff';
        const text = d ? '#f1f5f9' : '#0f172a';
        const sub  = d ? 'rgba(255,255,255,0.45)' : '#6b7280';

        document.getElementById('score-prompt-modal')?.remove();
        const modal = document.createElement('div');
        modal.id = 'score-prompt-modal';
        modal.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);';
        modal.innerHTML = `
            <div style="background:${bg};border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:1.75rem;
                width:100%;max-width:320px;margin:0 1rem;font-family:'DM Sans',sans-serif;">
                <div style="font-size:1.75rem;text-align:center;margin-bottom:0.75rem;">${game?.icon || '🎮'}</div>
                <h3 style="font-family:'Syne',sans-serif;font-weight:900;font-size:1rem;color:${text};text-align:center;margin:0 0 0.375rem;">
                    Seu score em ${game?.name}
                </h3>
                <p style="font-size:0.78rem;color:${sub};text-align:center;margin:0 0 1.25rem;">
                    Informe seu melhor resultado desta partida (${game?.unit})
                </p>
                <input id="score-input" type="number" min="0" placeholder="Ex: 1500"
                       style="width:100%;padding:0.7rem 1rem;border-radius:10px;border:1.5px solid rgba(255,255,255,0.1);
                           background:rgba(255,255,255,0.06);color:${text};
                           font-size:1rem;text-align:center;font-family:'DM Sans',sans-serif;
                           outline:none;box-sizing:border-box;margin-bottom:1rem;"/>
                <div style="display:flex;gap:0.625rem;">
                    <button onclick="document.getElementById('score-prompt-modal').remove()"
                            style="flex:1;padding:0.65rem;border-radius:10px;
                                background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);
                                color:${sub};font-weight:700;font-size:0.875rem;cursor:pointer;font-family:'DM Sans',sans-serif;">
                        Cancelar
                    </button>
                    <button onclick="
                        const val=parseFloat(document.getElementById('score-input').value);
                        if(!val||val<=0){return;}
                        document.getElementById('score-prompt-modal').remove();
                        Challenges.submitScore('${challengeId}',val);"
                            style="flex:1;padding:0.65rem;border-radius:10px;border:none;
                                background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));
                                color:white;font-weight:700;font-size:0.875rem;cursor:pointer;font-family:'DM Sans',sans-serif;">
                        ✓ Enviar
                    </button>
                </div>
            </div>`;
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
        document.body.appendChild(modal);
        setTimeout(() => modal.querySelector('#score-input')?.focus(), 100);
    },

    // ── JOGAR PELO DESAFIO ───────────────────────────────────────────────────

    // Mapa gameId → toolId do router
    // Mapa gameId (challenges) → gameId do OfflineZone
    GAME_ROUTES: {
        'typeracer': 'typeracer',
        '2048':      'game2048',
        'flappy':    'flappy',
        'quiz':      'quiz',
        'termo':     'termo',
        'snake':     'snake',
    },

    // Mapa gameId → storageKey (mesma do Economy.checkRecord)
    GAME_KEYS: {
        'typeracer': 'typeracer_highscore',
        '2048':      'game_2048_highscore',
        'flappy':    'flappy_bird_highscore',
        'quiz':      'quiz_highscore',
        'termo':     'termo_best',
        'snake':     'snake_highscore',
    },

    startPlay(challengeId, gameId) {
        // Resetar flags de hook para reinstalar nos jogos (podem ter sido carregados depois do init)
        if (window.Game2048)   { delete Game2048._challengeHooked; }
        if (window.FlappyBird) { delete FlappyBird._challengeHooked; }
        if (window.MiniGame)   { delete MiniGame._challengeHooked; }
        this._hookInstalled = false;
        this._setupGameHook();

        // Salvar score anterior para comparar ao sair
        const prevScore = Utils.loadData(this.GAME_KEYS[gameId]);

        // Guardar desafio ativo globalmente
        window._activeChallenge = { challengeId, gameId, prevScore, _submitted: false };

        // Mostrar badge flutuante
        this._showChallengeBadge(gameId);

        // Navegar direto para o jogo via OfflineZone
        // IMPORTANTE: setar _insideGame=true ANTES de qualquer render
        // para que OfflineZone.init() não resete currentGame
        const offlineGameId = this.GAME_ROUTES[gameId];
        if (window.OfflineZone && offlineGameId) {
            OfflineZone._insideGame = true;
            OfflineZone.currentGame = offlineGameId;
            Router.currentRoute = 'offline';
            App?.updateActiveNav?.('offline');
            OfflineZone._initGame(offlineGameId);
            Router.render();
            OfflineZone._escHandler = e => { if (e.key === 'Escape') OfflineZone.backToMenu(); };
            document.addEventListener('keydown', OfflineZone._escHandler);
            if (offlineGameId === 'snake')         setTimeout(() => MiniGame?.init(), 100);
            else if (offlineGameId === 'flappy')   setTimeout(() => FlappyBird?.init(), 100);
            else if (offlineGameId === 'game2048') setTimeout(() => Game2048?.init(), 100);
            else if (offlineGameId === 'typeracer') setTimeout(() => TypeRacer?.init(), 100);
            else if (offlineGameId === 'quiz')      setTimeout(() => QuizDiario?.init(), 100);
            else if (offlineGameId === 'slot')      setTimeout(() => SlotMachine?.init(), 100);
        } else {
            Router?.navigate('mini-game');
        }

        // Fallback: monitorar backToMenu do OfflineZone para capturar score ao sair
        this._watchOfflineZone(challengeId, gameId);
    },

    _watchOfflineZone(challengeId, gameId) {
        if (this._ozPatched) return;
        this._ozPatched = true;

        const origBack = OfflineZone?.backToMenu?.bind(OfflineZone);
        if (!origBack) { this._ozPatched = false; return; }

        OfflineZone.backToMenu = () => {
            const active = window._activeChallenge;
            if (active && !active._submitted) {
                const currentScore = Utils.loadData(this.GAME_KEYS[active.gameId]);
                const score = parseInt(currentScore, 10);
                if (!isNaN(score) && score !== parseInt(active.prevScore, 10)) {
                    active._submitted = true;
                    Challenges.submitScore(active.challengeId, score).then(() => {
                        document.getElementById('challenge-badge')?.remove();
                        window._activeChallenge = null;
                        Utils.showNotification('⚔️ Score registrado: ' + score.toLocaleString('pt-BR') + '!', 'success');
                        setTimeout(() => Router?.navigate('challenges'), 800);
                    }).catch(() => { active._submitted = false; });
                } else {
                    document.getElementById('challenge-badge')?.remove();
                    window._activeChallenge = null;
                    Utils.showNotification('⚠️ Jogue uma partida para registrar o score', 'warning');
                }
            }
            // Restaurar original e executar
            OfflineZone.backToMenu = origBack;
            this._ozPatched = false;
            origBack();
        };
    },

    _showChallengeBadge(gameId) {
        document.getElementById('challenge-badge')?.remove();
        const game = this.GAMES.find(g => g.id === gameId);
        const badge = document.createElement('div');
        badge.id = 'challenge-badge';
        badge.style.cssText = [
            'position:fixed', 'top:16px', 'right:16px', 'z-index:99999',
            'background:linear-gradient(135deg,#7c3aed,#ec4899)',
            'color:white', 'padding:6px 14px', 'border-radius:99px',
            'font-size:0.72rem', 'font-weight:800', 'font-family:DM Sans,sans-serif',
            'box-shadow:0 4px 16px rgba(168,85,247,0.45)',
            'display:flex', 'align-items:center', 'gap:6px',
            'cursor:pointer', 'animation:challengePulse 2s infinite',
        ].join(';');
        badge.innerHTML = `⚔️ Desafio ativo · ${game?.name || gameId}
            <span onclick="document.getElementById('challenge-badge').remove();window._activeChallenge=null;"
                style="opacity:0.7;font-size:0.9rem;line-height:1;margin-left:4px;">✕</span>`;

        // Injetar animação CSS se não existir
        if (!document.getElementById('challenge-badge-style')) {
            const style = document.createElement('style');
            style.id = 'challenge-badge-style';
            style.textContent = '@keyframes challengePulse{0%,100%{box-shadow:0 4px 16px rgba(168,85,247,0.45)}50%{box-shadow:0 4px 24px rgba(168,85,247,0.75)}}';
            document.head.appendChild(style);
        }
        document.body.appendChild(badge);
    },

    // Hook para capturar score ao fim de partida — independente de recorde
    _setupGameHook() {
        if (this._hookInstalled) return;
        this._hookInstalled = true;

        // Função central de submissão
        const trySubmit = (score) => {
            const active = window._activeChallenge;
            if (!active || active._submitted) return;
            active._submitted = true;
            Challenges.submitScore(active.challengeId, score).then(() => {
                document.getElementById('challenge-badge')?.remove();
                window._activeChallenge = null;
                Utils.showNotification('⚔️ Score registrado: ' + (typeof score === 'number' ? score.toLocaleString('pt-BR') : score) + '!', 'success');
                setTimeout(() => {
                    if (Router?.currentRoute !== 'challenges') Router?.navigate('challenges');
                }, 1500);
            }).catch(() => { active._submitted = false; });
        };

        // 1) Hook no Economy.checkRecord (captura recordes — ainda útil para alguns jogos)
        const origCheckRecord = window.Economy?.checkRecord?.bind(window.Economy);
        if (origCheckRecord) {
            window.Economy.checkRecord = (storageKey, newScore, higherIsBetter = true) => {
                const wasRecord = origCheckRecord(storageKey, newScore, higherIsBetter);
                const active = window._activeChallenge;
                if (active && Challenges.GAME_KEYS[active.gameId] === storageKey) {
                    trySubmit(newScore);
                }
                return wasRecord;
            };
        }

        // 2) Hooks diretos nos jogos para capturar score SEMPRE (não só recordes)
        // Aguardar jogos carregarem e instalar hooks
        const installGameHooks = () => {
            // 2048 — hook no updateStats (chamado ao fim da partida: vitória ou derrota)
            if (window.Game2048 && !Game2048._challengeHooked) {
                Game2048._challengeHooked = true;
                const orig2048 = Game2048.updateStats?.bind(Game2048);
                if (orig2048) Game2048.updateStats = function(won) {
                    orig2048(won);
                    const active = window._activeChallenge;
                    if (active?.gameId === '2048' && !active._submitted && this.score > 0) {
                        trySubmit(this.score);
                    }
                };
            }
            // Flappy — hook no endGame
            if (window.FlappyBird && !FlappyBird._challengeHooked) {
                FlappyBird._challengeHooked = true;
                const origFlappy = FlappyBird.endGame?.bind(FlappyBird);
                if (origFlappy) FlappyBird.endGame = function(...args) {
                    const result = origFlappy(...args);
                    const active = window._activeChallenge;
                    if (active?.gameId === 'flappy' && !active._submitted && this.score > 0) {
                        trySubmit(this.score);
                    }
                    return result;
                };
            }
            // Snake — hook no gameOver
            if (window.MiniGame && !MiniGame._challengeHooked) {
                MiniGame._challengeHooked = true;
                const origSnake = MiniGame.gameOver?.bind(MiniGame);
                if (origSnake) MiniGame.gameOver = function(...args) {
                    const active = window._activeChallenge;
                    if (active?.gameId === 'snake' && !active._submitted && this.score > 0) {
                        trySubmit(this.score);
                    }
                    return origSnake(...args);
                };
            }
            // TypeRacer — checkRecord sempre chamado ao final, coberto pelo hook 1
            // Quiz — checkRecord sempre chamado ao final, coberto pelo hook 1
            // Termo — checkRecord sempre chamado ao final, coberto pelo hook 1
        };

        // Instalar agora e também após navegação (jogos podem não estar carregados ainda)
        installGameHooks();
        setTimeout(installGameHooks, 2000);
    },

        // ── MODAL PARA CRIAR DESAFIO ──────────────────────────────────────────────

    showCreateModal(targetUID, targetTag) {
        const d    = document.body.classList.contains('dark-theme');
        const bg   = d ? '#0e0e16' : '#ffffff';
        const text = d ? '#f1f5f9' : '#0f172a';
        const sub  = d ? 'rgba(255,255,255,0.45)' : '#6b7280';
        const bdr  = d ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

        document.getElementById('challenge-create-modal')?.remove();
        const modal = document.createElement('div');
        modal.id = 'challenge-create-modal';
        modal.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);';
        modal.innerHTML = `
            <div style="background:${bg};border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:1.75rem;
                width:100%;max-width:340px;margin:0 1rem;font-family:'DM Sans',sans-serif;">
                <div style="text-align:center;margin-bottom:1.25rem;">
                    <div style="font-size:2rem;margin-bottom:0.5rem;">⚔️</div>
                    <h3 style="font-family:'Syne',sans-serif;font-weight:900;font-size:1rem;color:${text};margin:0 0 0.25rem;">
                        Desafiar ${targetTag}
                    </h3>
                    <p style="font-size:0.78rem;color:${sub};margin:0;">Escolha o jogo do duelo</p>
                </div>
                <div style="display:flex;flex-direction:column;gap:0.375rem;margin-bottom:1.25rem;">
                    ${this.GAMES.map(g => `
                    <button onclick="
                        document.getElementById('challenge-create-modal').remove();
                        Challenges.create('${targetUID}','${g.id}').then(id => {if(id)Router?.render();});"
                            style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem;
                                border-radius:10px;border:1px solid ${bdr};cursor:pointer;
                                background:transparent;color:${text};font-family:'DM Sans',sans-serif;
                                font-size:0.85rem;font-weight:600;text-align:left;transition:all 0.15s;"
                            onmouseover="this.style.background='rgba(168,85,247,0.08)';this.style.borderColor='rgba(168,85,247,0.3)'"
                            onmouseout="this.style.background='transparent';this.style.borderColor='${bdr}'">
                        <span style="font-size:1.25rem;">${g.icon}</span>
                        <div>
                            <div>${g.name}</div>
                            <div style="font-size:0.68rem;color:${sub};">Melhor ${g.unit} vence</div>
                        </div>
                    </button>`).join('')}
                </div>
                <button onclick="document.getElementById('challenge-create-modal').remove()"
                        style="width:100%;padding:0.65rem;border-radius:10px;
                            background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);
                            color:${sub};font-weight:700;font-size:0.875rem;cursor:pointer;font-family:'DM Sans',sans-serif;">
                    Cancelar
                </button>
            </div>`;
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
        document.body.appendChild(modal);
    },

    // ── INIT ──────────────────────────────────────────────────────────────────

    init() {
        this._setupGameHook();
        // Esconder badge ao entrar na aba
        const badge = document.getElementById('challenges-nav-badge');
        if (badge) badge.style.display = 'none';
        setTimeout(() => this.loadChallenges(), 100);
        console.log('[Challenges] v1.0.0 inicializado');
    },
};

window.Challenges = Challenges;