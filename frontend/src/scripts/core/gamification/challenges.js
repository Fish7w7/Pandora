

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

    async accept(challengeId) {
        await NyanFirebase.updateDoc(`challenges/${challengeId}`, { status: 'active' });
        Utils.showNotification('⚔️ Desafio aceito! Jogue e registre seu score!', 'success');
        await this.loadChallenges();
    },

    async decline(challengeId) {
        await NyanFirebase.updateDoc(`challenges/${challengeId}`, { status: 'expired' });
        this._allChallenges = this._allChallenges.filter(c => c.id !== challengeId);
        Utils.showNotification('Desafio recusado', 'info');
        this._renderTab();
    },

    async submitScore(challengeId, score) {
        const ch    = await NyanFirebase.getDoc(`challenges/${challengeId}`);
        if (!ch || ch.status !== 'active') return;

        const myUID = NyanAuth.getUID();
        const isChallenger = ch.challenger.uid === myUID;
        const field = isChallenger ? 'challengerScore' : 'challengedScore';

        await NyanFirebase.updateDoc(`challenges/${challengeId}`, { [field]: score });

        const updated = await NyanFirebase.getDoc(`challenges/${challengeId}`);
        if (updated.challengerScore !== null && updated.challengedScore !== null) {
            await this._resolveChallenge(challengeId, updated);
        }

        if (!window._activeChallenge) {
            Utils.showNotification(`✅ Score ${score} registrado! Aguardando adversário...`, 'success');
        }
    },

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

        const myUID = NyanAuth.getUID();
        if (winnerId === myUID) {
            window.Economy?.grant?.('mission_medium');
            Utils.showNotification(`🏆 Você venceu o desafio! +${ch.rewardXP} XP · +${ch.rewardChips} chips`, 'success');
        } else {
            Utils.showNotification('😅 Desafio finalizado — vitória do adversário!', 'info');
        }
    },

    HISTORY_LIMIT: 15,

    render() {
        if (!NyanAuth.isOnline()) return Friends._renderOfflineState();

        const d     = document.body.classList.contains('dark-theme');
        const muted = d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';
        const bg    = d ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
        const bdr   = d ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';

        return `
        <style>
        @keyframes chSlideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes chShimmer { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        .ch-card { animation: chSlideUp .35s ease both; }
        .ch-tab-btn { transition: background .15s, color .15s, border-color .15s; }
        .ch-action-btn { transition: transform .13s, filter .13s; }
        .ch-action-btn:hover { transform: translateY(-1px); filter: brightness(1.08); }
        .ch-action-btn:active { transform: scale(0.96); filter: brightness(0.92); }
        </style>
        <div style="max-width:620px;margin:0 auto;font-family:'DM Sans',sans-serif;">

            <div style="text-align:center;margin-bottom:1.5rem;">
                <div style="font-size:2.2rem;margin-bottom:0.3rem;">⚔️</div>
                <h1 style="font-family:'Syne',sans-serif;font-size:1.9rem;font-weight:900;margin:0 0 0.2rem;
                    background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));
                    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
                    Desafios
                </h1>
                <p style="font-size:0.72rem;color:${muted};margin:0;">Duelos de 24h com seus amigos にゃん~</p>
            </div>

            <div id="ch-stats-row" style="display:flex;gap:0.5rem;justify-content:center;margin-bottom:1.25rem;"></div>

            <div style="display:flex;gap:0.25rem;background:${bg};border:1px solid ${bdr};
                border-radius:14px;padding:0.3rem;margin-bottom:1rem;">
                <button id="chtab-active" onclick="Challenges._switchTab('active')"
                    class="ch-tab-btn" style="flex:1;padding:0.5rem;border-radius:10px;border:1px solid transparent;
                    cursor:pointer;font-size:0.75rem;font-weight:700;font-family:'DM Sans',sans-serif;
                    background:${d?'rgba(255,255,255,0.05)':'#fff'};color:var(--theme-primary,#a855f7);
                    border-color:rgba(168,85,247,0.2);">
                    🟢 Ativos
                </button>
                <button id="chtab-pending" onclick="Challenges._switchTab('pending')"
                    class="ch-tab-btn" style="flex:1;padding:0.5rem;border-radius:10px;border:1px solid transparent;
                    cursor:pointer;font-size:0.75rem;font-weight:700;font-family:'DM Sans',sans-serif;
                    background:transparent;color:${muted};">
                    ⏳ Pendentes
                </button>
                <button id="chtab-history" onclick="Challenges._switchTab('history')"
                    class="ch-tab-btn" style="flex:1;padding:0.5rem;border-radius:10px;border:1px solid transparent;
                    cursor:pointer;font-size:0.75rem;font-weight:700;font-family:'DM Sans',sans-serif;
                    background:transparent;color:${muted};">
                    📜 Histórico
                </button>
            </div>

            <div id="challenges-content">
                <div style="text-align:center;padding:2rem;color:${muted};font-size:0.8rem;">Carregando...</div>
            </div>
        </div>`;
    },

    _currentTab: 'active',
    _allChallenges: [],
    _myUID: null,

    _switchTab(tab) {
        this._currentTab = tab;
        const d     = document.body.classList.contains('dark-theme');
        const muted = d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';
        const bg    = d ? 'rgba(255,255,255,0.05)' : '#fff';

        ['active','pending','history'].forEach(t => {
            const btn = document.getElementById('chtab-' + t);
            if (!btn) return;
            const isActive = t === tab;
            btn.style.background    = isActive ? bg : 'transparent';
            btn.style.color         = isActive ? 'var(--theme-primary,#a855f7)' : muted;
            btn.style.borderColor   = isActive ? 'rgba(168,85,247,0.2)' : 'transparent';
        });

        this._renderTab();
    },

    _renderTab() {
        const container = document.getElementById('challenges-content');
        if (!container) return;

        const d     = document.body.classList.contains('dark-theme');
        const muted = d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';
        const sub   = d ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';

        const tab    = this._currentTab;
        const myUID  = this._myUID;
        const all    = this._allChallenges;

        let items;
        if (tab === 'active') {
            items = all.filter(c => c.status === 'active' || (c.status === 'pending' && c.challenger.uid === myUID));
        } else if (tab === 'pending') {
            items = all.filter(c => c.status === 'pending' && c.challenged.uid === myUID);
        } else {
            items = all.filter(c => c.status === 'completed' || c.status === 'expired');
        }

        if (items.length === 0) {
            const emptyMsg = {
                active:  { icon:'⚔️', title:'Nenhum duelo ativo', sub:'Desafie um amigo pelo perfil dele!' },
                pending: { icon:'⏳', title:'Nenhum desafio pendente', sub:'Tudo em dia por aqui にゃん~' },
                history: { icon:'📜', title:'Histórico vazio', sub:'Seus duelos finalizados aparecem aqui' },
            }[tab];
            container.innerHTML = `
            <div style="text-align:center;padding:3rem 1rem;color:${muted};">
                <div style="font-size:2.5rem;opacity:0.35;margin-bottom:0.75rem;">${emptyMsg.icon}</div>
                <div style="font-size:0.88rem;font-weight:700;color:${sub};margin-bottom:0.3rem;">${emptyMsg.title}</div>
                <p style="font-size:0.72rem;margin:0;">${emptyMsg.sub}</p>
            </div>`;
            return;
        }

        container.innerHTML = items.map((c, i) => this._renderChallenge(c, myUID, i)).join('');
    },

    async loadChallenges() {
        const myUID = NyanAuth.getUID();
        this._myUID = myUID;
        const { query, collection, where, getDocs, deleteDoc, doc } = NyanFirebase.fn;

        const [asChallenger, asChallenged] = await Promise.all([
            getDocs(query(collection(NyanFirebase.db, 'challenges'), where('challenger.uid', '==', myUID))),
            getDocs(query(collection(NyanFirebase.db, 'challenges'), where('challenged.uid', '==', myUID))),
        ]);

        const all = [
            ...asChallenger.docs.map(d => ({ id: d.id, ...d.data() })),
            ...asChallenged.docs.map(d => ({ id: d.id, ...d.data() })),
        ];

        const seen = new Set();
        const unique = all.filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true; });
        unique.sort((a, b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));

        const finished = unique.filter(c => c.status === 'completed' || c.status === 'expired');
        if (finished.length > this.HISTORY_LIMIT) {
            const toDelete = finished.slice(this.HISTORY_LIMIT);
            toDelete.forEach(c => {
                deleteDoc(doc(NyanFirebase.db, 'challenges', c.id)).catch(() => {});
            });
            const deleteIds = new Set(toDelete.map(c => c.id));
            unique.splice(0, unique.length, ...unique.filter(c => !deleteIds.has(c.id)));
        }

        const now = Date.now() / 1000;
        await Promise.all(unique
            .filter(c => (c.status === 'pending' || c.status === 'active') && c.expiresAt?.seconds < now)
            .map(c => NyanFirebase.updateDoc(`challenges/${c.id}`, { status: 'expired' }).catch(() => {}))
        );
        unique.forEach(c => {
            if ((c.status === 'pending' || c.status === 'active') && c.expiresAt?.seconds < now) {
                c.status = 'expired';
            }
        });

        this._allChallenges = unique;

        const wins   = unique.filter(c => c.status === 'completed' && c.winnerId === myUID).length;
        const losses = unique.filter(c => c.status === 'completed' && c.winnerId && c.winnerId !== myUID).length;
        const total  = unique.filter(c => c.status === 'completed').length;
        const pending= unique.filter(c => c.status === 'pending' && c.challenged.uid === myUID).length;

        const d     = document.body.classList.contains('dark-theme');
        const bg    = d ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
        const bdr   = d ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
        const muted = d ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.32)';

        const statsRow = document.getElementById('ch-stats-row');
        if (statsRow) {
            statsRow.innerHTML = [
                { label:'Vitórias', val: wins,   color:'#4ade80' },
                { label:'Derrotas', val: losses, color:'#f87171' },
                { label:'Total',    val: total,  color:'var(--theme-primary,#a855f7)' },
                { label:'Pendentes',val: pending,color:'#fbbf24' },
            ].map(s => `
                <div style="background:${bg};border:1px solid ${bdr};border-radius:12px;
                    padding:0.45rem 0.9rem;text-align:center;min-width:62px;">
                    <div style="font-size:0.5rem;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:${muted};margin-bottom:2px;">${s.label}</div>
                    <div style="font-size:1rem;font-weight:900;font-family:'Syne',sans-serif;color:${s.color};line-height:1;">${s.val}</div>
                </div>`).join('');
        }

        const pendingBtn = document.getElementById('chtab-pending');
        if (pendingBtn && pending > 0) {
            pendingBtn.textContent = `⏳ Pendentes (${pending})`;
        }

        this._renderTab();
    },

    _renderChallenge(ch, myUID, index = 0) {
        const d      = document.body.classList.contains('dark-theme');
        const bg     = d ? 'rgba(255,255,255,0.04)' : '#ffffff';
        const bdr    = d ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
        const text   = d ? '#f1f5f9' : '#0f172a';
        const sub    = d ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
        const muted  = d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';
        const paneBg = d ? 'rgba(255,255,255,0.04)' : '#f7f7fc';

        const isChallenger  = ch.challenger.uid === myUID;
        const opponent      = isChallenger ? ch.challenged : ch.challenger;
        const myScore       = isChallenger ? ch.challengerScore : ch.challengedScore;
        const opponentScore = isChallenger ? ch.challengedScore : ch.challengerScore;

        const STATUS_COLOR = { pending:'#fbbf24', active:'#4ade80', completed:'#a855f7', expired:'#9ca3af' };
        const STATUS_LABEL = { pending:'Aguardando', active:'Em andamento', completed:'Finalizado', expired:'Expirado' };
        const color = STATUS_COLOR[ch.status] || STATUS_COLOR.expired;
        const label = STATUS_LABEL[ch.status] || 'Desconhecido';

        let timeBar = '';
        if ((ch.status === 'pending' || ch.status === 'active') && ch.expiresAt?.seconds && ch.createdAt?.seconds) {
            const totalSec   = ch.expiresAt.seconds - ch.createdAt.seconds;
            const elapsedSec = Date.now()/1000 - ch.createdAt.seconds;
            const pct        = Math.max(0, Math.min(100, 100 - (elapsedSec / totalSec) * 100));
            const hoursLeft  = Math.max(0, Math.floor((ch.expiresAt.seconds - Date.now()/1000) / 3600));
            const barColor   = pct > 50 ? '#4ade80' : pct > 20 ? '#fbbf24' : '#f87171';
            timeBar = `
            <div style="margin-top:0.75rem;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                    <span style="font-size:0.58rem;font-weight:700;color:${muted};text-transform:uppercase;letter-spacing:.06em;">Tempo restante</span>
                    <span style="font-size:0.62rem;font-weight:700;color:${barColor};">⏰ ${hoursLeft}h</span>
                </div>
                <div style="height:4px;background:${d?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.07)'};border-radius:99px;overflow:hidden;">
                    <div style="height:100%;width:${pct}%;background:${barColor};border-radius:99px;transition:width .3s;"></div>
                </div>
            </div>`;
        }

        let resultBanner = '';
        if (ch.status === 'completed' && ch.winnerId) {
            const won = ch.winnerId === myUID;
            resultBanner = `
            <div style="text-align:center;padding:0.45rem;border-radius:10px;margin-bottom:0.75rem;
                background:${won?'rgba(74,222,128,0.1)':'rgba(239,68,68,0.08)'};
                border:1px solid ${won?'rgba(74,222,128,0.25)':'rgba(239,68,68,0.2)'};">
                <span style="font-size:0.82rem;font-weight:800;color:${won?'#4ade80':'#f87171'};">
                    ${won ? '🏆 Você venceu!' : '😅 Vitória do adversário'}
                </span>
            </div>`;
        }

        let actionBtn = '';
        if (ch.status === 'pending' && !isChallenger) {
            actionBtn = `
            <div style="display:flex;gap:0.5rem;margin-top:0.8rem;">
                <button class="ch-action-btn" onclick="Challenges.accept('${ch.id}')"
                    style="flex:1;padding:0.55rem;border-radius:10px;border:1px solid rgba(74,222,128,0.3);
                    cursor:pointer;font-size:0.78rem;font-weight:700;
                    background:rgba(74,222,128,0.13);color:#4ade80;font-family:'DM Sans',sans-serif;">
                    ⚔️ Aceitar
                </button>
                <button class="ch-action-btn" onclick="Challenges.decline('${ch.id}')"
                    style="padding:0.55rem 1rem;border-radius:10px;border:1px solid rgba(239,68,68,0.22);
                    cursor:pointer;font-size:0.78rem;font-weight:700;
                    background:rgba(239,68,68,0.09);color:#f87171;font-family:'DM Sans',sans-serif;">
                    Recusar
                </button>
            </div>`;
        } else if (ch.status === 'active' && myScore === null) {
            actionBtn = `
            <button class="ch-action-btn" onclick="Challenges.startPlay('${ch.id}','${ch.gameId}')"
                style="width:100%;margin-top:0.8rem;padding:0.6rem;border-radius:10px;border:none;cursor:pointer;
                font-size:0.8rem;font-weight:700;color:white;font-family:'DM Sans',sans-serif;
                background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));">
                🎮 Jogar agora · ${ch.gameName}
            </button>`;
        } else if (ch.status === 'active' && myScore !== null && opponentScore === null) {
            actionBtn = `
            <div style="margin-top:0.8rem;text-align:center;padding:0.45rem;border-radius:10px;
                background:rgba(251,191,36,0.09);border:1px solid rgba(251,191,36,0.2);">
                <span style="font-size:0.72rem;font-weight:700;color:#fbbf24;">
                    ⏳ Aguardando ${opponent.username} jogar...
                </span>
            </div>`;
        }

        return `
        <div class="ch-card" style="background:${bg};border:1px solid ${bdr};border-radius:16px;
            padding:1rem 1.1rem;margin-bottom:0.7rem;animation-delay:${index * 0.06}s;">

            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.8rem;">
                <div style="display:flex;align-items:center;gap:0.6rem;">
                    <span style="font-size:1.2rem;">${ch.gameIcon}</span>
                    <div>
                        <div style="font-size:0.85rem;font-weight:700;color:${text};">${ch.gameName}</div>
                        <div style="font-size:0.65rem;color:${muted};">
                            ${isChallenger ? `Você desafiou ${opponent.username}` : `${opponent.username} te desafiou`}
                        </div>
                    </div>
                </div>
                <span style="font-size:0.62rem;font-weight:700;padding:2px 9px;border-radius:99px;
                    background:${color}20;color:${color};border:1px solid ${color}35;white-space:nowrap;">
                    ${label}
                </span>
            </div>

            ${resultBanner}

            <div style="display:grid;grid-template-columns:1fr 28px 1fr;gap:0.5rem;align-items:center;">
                <div style="text-align:center;padding:0.65rem 0.5rem;background:${paneBg};border-radius:10px;">
                    <div style="font-size:0.62rem;color:${muted};margin-bottom:0.3rem;font-weight:600;">Você</div>
                    <div style="font-size:1.2rem;font-weight:900;font-family:'Syne',sans-serif;
                        color:${myScore!==null?'var(--theme-primary,#a855f7)':muted};line-height:1.1;">
                        ${myScore !== null ? myScore.toLocaleString('pt-BR') : '—'}
                    </div>
                    <div style="font-size:0.6rem;color:${muted};margin-top:2px;">
                        ${myScore !== null ? ch.unit : 'não jogou'}
                    </div>
                </div>
                <div style="text-align:center;font-size:0.8rem;font-weight:900;color:${muted};">vs</div>
                <div style="text-align:center;padding:0.65rem 0.5rem;background:${paneBg};border-radius:10px;">
                    <div style="font-size:0.62rem;color:${muted};margin-bottom:0.3rem;font-weight:600;
                        overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${opponent.username}</div>
                    <div style="font-size:1.2rem;font-weight:900;font-family:'Syne',sans-serif;
                        color:${opponentScore!==null?'#ec4899':muted};line-height:1.1;">
                        ${opponentScore !== null ? opponentScore.toLocaleString('pt-BR') : '—'}
                    </div>
                    <div style="font-size:0.6rem;color:${muted};margin-top:2px;">
                        ${opponentScore !== null ? ch.unit : 'aguardando'}
                    </div>
                </div>
            </div>

            <div style="display:flex;justify-content:flex-end;margin-top:0.55rem;">
                <span style="font-size:0.62rem;color:${muted};">+${ch.rewardXP} XP · +${ch.rewardChips} chips</span>
            </div>

            ${timeBar}
            ${actionBtn}
        </div>`;
    },

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

    GAME_ROUTES: {
        'typeracer': 'typeracer',
        '2048':      'game2048',
        'flappy':    'flappy',
        'quiz':      'quiz',
        'termo':     'termo',
        'snake':     'snake',
    },

    GAME_KEYS: {
        'typeracer': 'typeracer_highscore',
        '2048':      'game_2048_highscore',
        'flappy':    'flappy_bird_highscore',
        'quiz':      'quiz_highscore',
        'termo':     'termo_best',
        'snake':     'snake_highscore',
    },

    startPlay(challengeId, gameId) {
        if (window.Game2048)   { delete Game2048._challengeHooked; }
        if (window.FlappyBird) { delete FlappyBird._challengeHooked; }
        if (window.MiniGame)   { delete MiniGame._challengeHooked; }
        this._hookInstalled = false;
        this._setupGameHook();

        const prevScore = Utils.loadData(this.GAME_KEYS[gameId]);

        window._activeChallenge = { challengeId, gameId, prevScore, _submitted: false };

        this._showChallengeBadge(gameId);

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

        if (!document.getElementById('challenge-badge-style')) {
            const style = document.createElement('style');
            style.id = 'challenge-badge-style';
            style.textContent = '@keyframes challengePulse{0%,100%{box-shadow:0 4px 16px rgba(168,85,247,0.45)}50%{box-shadow:0 4px 24px rgba(168,85,247,0.75)}}';
            document.head.appendChild(style);
        }
        document.body.appendChild(badge);
    },

    _setupGameHook() {
        if (this._hookInstalled) return;
        this._hookInstalled = true;

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

        const installGameHooks = () => {
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
        };

        installGameHooks();
        setTimeout(installGameHooks, 2000);
    },

    showCreateModal(targetUID, targetTag) {
        const d    = document.body.classList.contains('dark-theme');
        const bg   = d ? '#0e0e18' : '#ffffff';
        const text = d ? '#f1f5f9' : '#0f172a';
        const sub  = d ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
        const bdr  = d ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
        const rowBg= d ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)';

        document.getElementById('challenge-create-modal')?.remove();
        const modal = document.createElement('div');
        modal.id = 'challenge-create-modal';
        modal.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,0.65);';

        const inner = document.createElement('div');
        inner.style.cssText = `background:${bg};border-radius:24px 24px 0 0;border:1px solid ${bdr};border-bottom:none;
            padding:0 1.25rem 1.5rem;width:100%;max-width:480px;font-family:'DM Sans',sans-serif;
            animation:chModalUp .3s cubic-bezier(.34,1.2,.64,1);`;

        inner.innerHTML = `
            <style>
            @keyframes chModalUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
            .ch-game-row { display:flex;align-items:center;gap:0.75rem;padding:0.7rem 0.875rem;
                border-radius:12px;border:1px solid ${bdr};cursor:pointer;
                background:${rowBg};transition:background .15s,border-color .15s;margin-bottom:0.375rem; }
            .ch-game-row:hover { background:rgba(168,85,247,0.09);border-color:rgba(168,85,247,0.28); }
            .ch-game-row:active { transform:scale(0.98); }
            </style>

            <div style="width:40px;height:4px;border-radius:99px;background:${d?'rgba(255,255,255,0.18)':'rgba(0,0,0,0.15)'};
                margin:0.875rem auto 1.25rem;"></div>

            <div style="margin-bottom:1.1rem;">
                <div style="font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:900;color:${text};margin-bottom:0.2rem;">
                    ⚔️ Desafiar <span style="color:var(--theme-primary,#a855f7);">${targetTag}</span>
                </div>
                <div style="font-size:0.72rem;color:${sub};">Escolha o jogo do duelo — vale 24h a partir de agora</div>
            </div>

            <div style="display:flex;gap:0.5rem;margin-bottom:1rem;">
                <div style="background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.2);
                    border-radius:10px;padding:0.35rem 0.75rem;font-size:0.68rem;font-weight:700;color:#4ade80;">
                    +${this.REWARD_XP} XP ao vencer
                </div>
                <div style="background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.2);
                    border-radius:10px;padding:0.35rem 0.75rem;font-size:0.68rem;font-weight:700;color:#fbbf24;">
                    +${this.REWARD_CHIPS} chips
                </div>
            </div>

            <div id="ch-game-list">
                ${this.GAMES.map(g => `
                <div class="ch-game-row" onclick="
                    document.getElementById('challenge-create-modal').remove();
                    Challenges.create('${targetUID}','${g.id}').then(id => { if(id) Router?.render(); });">
                    <span style="font-size:1.4rem;line-height:1;">${g.icon}</span>
                    <div style="flex:1;">
                        <div style="font-size:0.875rem;font-weight:700;color:${text};">${g.name}</div>
                        <div style="font-size:0.65rem;color:${sub};">Melhor ${g.unit} vence</div>
                    </div>
                    <span style="font-size:0.75rem;color:${d?'rgba(255,255,255,0.2)':'rgba(0,0,0,0.2)'};">›</span>
                </div>`).join('')}
            </div>

            <button onclick="document.getElementById('challenge-create-modal').remove()"
                style="width:100%;margin-top:0.75rem;padding:0.65rem;border-radius:12px;cursor:pointer;
                background:transparent;border:1px solid ${bdr};
                color:${sub};font-weight:700;font-size:0.82rem;font-family:'DM Sans',sans-serif;">
                Cancelar
            </button>`;

        modal.appendChild(inner);
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
        document.body.appendChild(modal);
    },

    init() {
        this._setupGameHook();
        const badge = document.getElementById('challenges-nav-badge');
        if (badge) badge.style.display = 'none';
        setTimeout(() => this.loadChallenges(), 100);
    },
};

window.Challenges = Challenges;
