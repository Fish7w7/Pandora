

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
    _currentTab:    'scores', // 'scores' | 'hall'

    async syncScore(gameId, score) {
        if (!NyanAuth.isOnline()) return;

        const uid     = NyanAuth.getUID();
        const profile = NyanAuth.currentUser;
        if (!uid || !profile) return;

        const game = this.GAMES.find(g => g.id === gameId);
        if (!game) return;

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

    },


    setupAutoSync() {
        const origCheckRecord = window.Economy?.checkRecord?.bind(window.Economy);
        if (!origCheckRecord) return;

        window.Economy.checkRecord = (storageKey, newScore, higherIsBetter = true) => {
            const wasRecord = origCheckRecord(storageKey, newScore, higherIsBetter);
            if (wasRecord) {
                const gameId = Leaderboard.KEY_TO_GAME[storageKey];
                if (gameId) {
                    this.syncScore(gameId, newScore);
                    const uid = NyanAuth.getUID();
                    if (uid && NyanFirebase.isReady()) {
                        const scKey = 'sc_' + gameId;
                        const update = { [scKey]: newScore, sc_updatedAt: NyanFirebase.fn.serverTimestamp() };
                        NyanFirebase.updateDoc('users/' + uid, update).catch(() => {});
                    }
                    if (Router?.currentRoute === 'leaderboard') {
                        setTimeout(() => this.loadScores(), 1000);
                    }
                }
            }
            return wasRecord;
        };
    },

    render() {
        if (!NyanAuth.isOnline()) return Friends._renderOfflineState();

        const d    = document.body.classList.contains('dark-theme');
        const bg   = d ? 'rgba(255,255,255,0.04)' : '#ffffff';
        const bdr  = d ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
        const muted= d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';
        const isHall = this._currentTab === 'hall';

        return `
        <div style="max-width:640px;margin:0 auto;font-family:'DM Sans',sans-serif;">

            <div style="text-align:center;margin-bottom:1.75rem;">
                <div style="font-size:2.5rem;margin-bottom:0.4rem;">🏆</div>
                <h1 style="font-family:'Syne',sans-serif;font-size:2rem;font-weight:900;margin:0 0 0.25rem;
                    background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));
                    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
                    Placar Global
                </h1>
            </div>

            ${this.renderMainTabs(bg, bdr, muted)}

            ${isHall ? this.renderHallIntro(bg, bdr, muted) : `
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
            `}

            <div id="leaderboard-table" style="background:${bg};border:1px solid ${bdr};border-radius:16px;overflow:hidden;">
                <div style="text-align:center;padding:2rem;color:${muted};font-size:0.8rem;">Carregando...</div>
            </div>

            ${isHall ? '' : '<div id="my-position" style="margin-top:0.75rem;"></div>'}

        </div>`;
    },

    renderMainTabs(bg, bdr, muted) {
        const active = this._currentTab;
        const tabStyle = (tab) => {
            const isActive = active === tab;
            return `flex:1;padding:0.65rem;border-radius:12px;border:${isActive ? 'none' : `1px solid ${bdr}`};cursor:pointer;
                font-size:0.78rem;font-weight:800;font-family:'DM Sans',sans-serif;
                background:${isActive ? 'linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899))' : bg};
                color:${isActive ? 'white' : muted};transition:all 0.16s;`;
        };

        return `
            <div style="display:flex;gap:0.5rem;margin-bottom:1rem;">
                <button onclick="Leaderboard.setTab('scores')" style="${tabStyle('scores')}">🏆 Placares</button>
                <button onclick="Leaderboard.setTab('hall')" style="${tabStyle('hall')}">🎗️ Hall da Fama</button>
            </div>
        `;
    },

    renderHallIntro(bg, bdr, muted) {
        return `
            <div style="background:${bg};border:1px solid ${bdr};border-radius:14px;padding:0.85rem 1rem;margin-bottom:1rem;">
                <div style="display:flex;align-items:center;gap:0.7rem;">
                    <div style="width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(245,158,11,0.14);border:1px solid rgba(245,158,11,0.28);font-size:1.1rem;">🌟</div>
                    <div style="min-width:0;">
                        <div style="font-weight:900;font-size:0.9rem;">Veteranos Early Access</div>
                        <div style="font-size:0.72rem;color:${muted};line-height:1.45;">Ordenado por quem chegou primeiro no NyanTools.</div>
                    </div>
                </div>
            </div>
        `;
    },

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
                const { query: fq2, collection: fc2, where: fw2, getDocs: fgd2 } = NyanFirebase.fn;
                const fsSnap2 = await fgd2(fq2(fc2(NyanFirebase.db, 'friendships'), fw2('users', 'array-contains', myUID)));
                const friendList = fsSnap2.docs.map(d => {
                    const users = d.data().users || [];
                    return users.find(u => u !== myUID);
                }).filter(Boolean);
                const friendUIDs = [myUID, ...friendList];

                const scKey = 'sc_' + this._currentGame;
                const allProfiles = await Promise.all(
                    friendUIDs.map(uid => NyanFirebase.getDoc('users/' + uid).catch(() => null))
                );

                scores = allProfiles.filter(Boolean).map(p => {
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

                const myLocal = parseFloat(Utils.loadData(game.key));
                if (myLocal > 0) {
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
                    const ta = a.updatedAt?.seconds || 0;
                    const tb = b.updatedAt?.seconds || 0;
                    return ta - tb;
                });
                scores = scores.slice(0, 10);
            } else {
                const scKey = 'sc_' + this._currentGame;

                const { query: gq, collection: gc, where: gw, getDocs: ggd, orderBy: gob, limit: glim } = NyanFirebase.fn;

                const lbSnap = await ggd(gq(
                    gc(NyanFirebase.db, `leaderboards/${this._currentGame}/scores`),
                    gob('score', game.higher ? 'desc' : 'asc'),
                    glim(10)
                ));
                scores = lbSnap.docs.map(d => ({ id: d.id, ...d.data() }));

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

                        <div style="width:28px;text-align:center;font-size:${i<3?'1.1rem':'0.8rem'};
                            font-weight:800;color:${i<3?'inherit':muted};flex-shrink:0;">
                            ${medals[i] || `#${i+1}`}
                        </div>

                        <div style="width:34px;height:34px;border-radius:9px;overflow:hidden;flex-shrink:0;">
                            ${s.avatar
                                ? `<img src="${s.avatar}" style="width:100%;height:100%;object-fit:cover;"/>`
                                : (window.AvatarGenerator ? AvatarGenerator.generate(s.username||'nyan', 34) : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#7c3aed,#ec4899);display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:0.75rem;">${(s.username||'N')[0].toUpperCase()}</div>`)}
                        </div>

                        <div style="flex:1;min-width:0;">
                            <div style="font-size:0.85rem;font-weight:${isMe?'800':'600'};color:${text};
                                display:flex;align-items:center;gap:0.375rem;">
                                ${s.username || 'Jogador'}
                                ${isMe ? `<span style="font-size:0.6rem;font-weight:700;background:rgba(168,85,247,0.15);color:rgba(168,85,247,0.9);border-radius:99px;padding:1px 6px;">Você</span>` : ''}
                            </div>
                            <div style="font-size:0.68rem;color:${muted};">${s.nyanTag || ''}</div>
                        </div>

                        <div style="text-align:right;flex-shrink:0;">
                            <div style="font-size:1rem;font-weight:900;font-family:'Syne',sans-serif;
                                color:${i===0?'#f59e0b':i===1?'#9ca3af':i===2?'#cd7c2f':'var(--theme-primary,#a855f7)'};">
                                ${typeof s.score === 'number' ? s.score.toLocaleString('pt-BR') : s.score}
                            </div>
                            <div style="font-size:0.65rem;color:${muted};">${game.unit}</div>
                            ${s.uid ? `<button onclick="Leaderboard.viewPlayerProfile('${s.uid}')"
                                style="margin-top:0.35rem;padding:3px 8px;border-radius:7px;border:none;cursor:pointer;
                                    font-size:0.62rem;font-weight:700;font-family:'DM Sans',sans-serif;
                                    background:${isMe ? 'rgba(168,85,247,0.14)' : 'rgba(59,130,246,0.14)'};
                                    color:${isMe ? 'rgba(168,85,247,0.95)' : 'rgba(59,130,246,0.95)'};">
                                ${isMe ? 'Meu perfil' : 'Perfil'}
                            </button>` : ''}
                        </div>
                    </div>`;
                }).join('');

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

    async loadVeterans() {
        const table = document.getElementById('leaderboard-table');
        if (!table) return;

        const myUID  = NyanAuth.getUID();
        const d      = document.body.classList.contains('dark-theme');
        const text   = d ? '#f1f5f9' : '#0f172a';
        const sub    = d ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
        const muted  = d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';
        const sep    = d ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

        table.innerHTML = `<div style="text-align:center;padding:2rem;color:${muted};font-size:0.8rem;">Carregando Hall da Fama...</div>`;

        try {
            const { query, collection, where, getDocs, limit } = NyanFirebase.fn;
            let snap = null;

            try {
                snap = await getDocs(query(
                    collection(NyanFirebase.db, 'users'),
                    where('flags.earlyAccessV316', '==', true),
                    limit(100)
                ));
            } catch (err) {
                snap = await getDocs(query(collection(NyanFirebase.db, 'users'), limit(120)));
            }

            let veterans = snap.docs
                .map((doc) => ({ id: doc.id, ...doc.data() }))
                .filter((profile) => this.isVeteranProfile(profile));

            const currentProfile = NyanAuth.currentUser || null;
            if (currentProfile && this.isVeteranProfile(currentProfile) && !veterans.some((v) => v.uid === myUID || v.id === myUID)) {
                veterans.push({ uid: myUID, ...currentProfile });
            }

            veterans = veterans
                .sort((a, b) => this.profileJoinedTime(a) - this.profileJoinedTime(b))
                .slice(0, 50);

            table.innerHTML = veterans.length === 0
                ? `<div style="text-align:center;padding:2rem;color:${muted};font-size:0.8rem;">Nenhum veterano encontrado ainda</div>`
                : veterans.map((profile, i) => {
                    const uid = profile.uid || profile.id;
                    const isMe = uid === myUID;
                    const joined = this.formatProfileDate(profile);
                    const bgRow = isMe
                        ? 'rgba(245,158,11,0.10)'
                        : (i % 2 === 0 ? 'transparent' : (d ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'));

                    return `
                    <div style="display:flex;align-items:center;gap:0.875rem;padding:0.8rem 1rem;border-bottom:1px solid ${sep};background:${bgRow};${isMe ? 'border-left:3px solid #f59e0b;' : ''}">
                        <div style="width:30px;text-align:center;font-size:${i < 3 ? '1.1rem' : '0.78rem'};font-weight:900;color:${i < 3 ? '#f59e0b' : muted};flex-shrink:0;">
                            ${['🥇','🥈','🥉'][i] || `#${i + 1}`}
                        </div>
                        <div style="width:38px;height:38px;border-radius:11px;overflow:hidden;flex-shrink:0;border:1px solid rgba(245,158,11,0.28);">
                            ${profile.avatar
                                ? `<img src="${profile.avatar}" style="width:100%;height:100%;object-fit:cover;"/>`
                                : (window.AvatarGenerator ? AvatarGenerator.generate(profile.username || 'nyan', 38) : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#7c3aed,#f59e0b);display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:0.82rem;">${(profile.username || 'N')[0].toUpperCase()}</div>`)}
                        </div>
                        <div style="flex:1;min-width:0;">
                            <div style="display:flex;align-items:center;gap:0.4rem;flex-wrap:wrap;">
                                <span style="font-size:0.88rem;font-weight:900;color:${text};">${profile.username || 'Jogador'}</span>
                                ${isMe ? `<span style="font-size:0.6rem;font-weight:800;background:rgba(245,158,11,0.16);color:#f59e0b;border-radius:99px;padding:1px 6px;">Você</span>` : ''}
                            </div>
                            <div style="font-size:0.68rem;color:${sub};">${profile.nyanTag || ''}</div>
                            <div style="font-size:0.66rem;color:${muted};margin-top:0.16rem;">Entrou em ${joined}</div>
                        </div>
                        <div style="text-align:right;flex-shrink:0;">
                            <div style="display:inline-flex;align-items:center;gap:0.25rem;background:rgba(245,158,11,0.14);border:1px solid rgba(245,158,11,0.30);color:#f59e0b;border-radius:999px;padding:0.25rem 0.5rem;font-size:0.62rem;font-weight:900;">
                                🌟 EA
                            </div>
                            ${uid ? `<button onclick="Leaderboard.viewPlayerProfile('${uid}')"
                                style="display:block;margin-top:0.42rem;margin-left:auto;padding:3px 8px;border-radius:7px;border:none;cursor:pointer;font-size:0.62rem;font-weight:700;font-family:'DM Sans',sans-serif;background:rgba(59,130,246,0.14);color:rgba(59,130,246,0.95);">
                                ${isMe ? 'Meu perfil' : 'Perfil'}
                            </button>` : ''}
                        </div>
                    </div>`;
                }).join('');
        } catch (err) {
            table.innerHTML = `<div style="text-align:center;padding:2rem;color:#ef4444;font-size:0.8rem;">Erro ao carregar Hall da Fama: ${err.message}</div>`;
        }
    },

    isVeteranProfile(profile = null) {
        if (!profile || typeof profile !== 'object') return false;
        if (profile.flags?.earlyAccessV316 === true) return true;
        if (profile.profileBadgeId === 'badge_veteran_early_access_v316' || profile.profileBadge?.id === 'badge_veteran_early_access_v316') return true;
        return Array.isArray(profile.profileBadges)
            && profile.profileBadges.some((badge) => String(badge?.id || badge || '') === 'badge_veteran_early_access_v316');
    },

    profileJoinedTime(profile = null) {
        const value = profile?.joinedAt || profile?.createdAt || profile?.created_at || profile?.firstLogin || profile?.lastSeen;
        if (!value) return Number.MAX_SAFE_INTEGER;
        if (typeof value?.toDate === 'function') return value.toDate().getTime();
        if (typeof value?.seconds === 'number') return value.seconds * 1000;
        const parsed = new Date(value).getTime();
        return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
    },

    formatProfileDate(profile = null) {
        const time = this.profileJoinedTime(profile);
        if (!Number.isFinite(time) || time === Number.MAX_SAFE_INTEGER) return 'data desconhecida';
        return new Date(time).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    },

    setTab(tab) {
        this._currentTab = tab === 'hall' ? 'hall' : 'scores';
        Router?.render();
    },

    setGame(gameId) {
        this._currentGame = gameId;
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

    viewPlayerProfile(uid) {
        if (!uid) return;
        const myUID = NyanAuth.getUID();
        if (uid === myUID) {
            Router?.navigate('profile');
            return;
        }
        if (window.Friends?.viewProfile) {
            Friends.viewProfile(uid, 'leaderboard');
            return;
        }
        window._viewingProfile = uid;
        window._viewingProfileSource = 'leaderboard';
        Router?.navigate('profile-public');
    },

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
            if (this._currentTab === 'scores') this.loadScores();
        }
    },

    init() {
        this.setupAutoSync();
        setTimeout(() => this._currentTab === 'hall' ? this.loadVeterans() : this.loadScores(), 100);
        setTimeout(() => this.syncAllLocalScores(), 3000);
    },
};

window.Leaderboard = Leaderboard;
