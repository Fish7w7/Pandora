/* ══════════════════════════════════════════════════
   FEED.JS v1.0.0 — NyanTools にゃん~ v3.9.0
   Feed de Atividade dos Amigos + Murais por Jogo

   ESTRUTURA FIRESTORE:
   feed/{uid}/posts/{postId}/
     type: 'score' | 'achievement' | 'record'
     gameId, score, unit
     achievement: { icon, name }
     authorUID, authorTag, authorUsername, authorAvatar
     createdAt: Timestamp
     reactions: { '🐱': [uid,...], '⭐': [...], '💎': [...], '🔥': [...] }
     comments: [{ uid, tag, text, createdAt }]

 ═══════════════════════════════════════════════════*/

const Feed = {

    REACTIONS: ['🐱','⭐','💎','🔥'],

    // Máx de posts mantidos no próprio feed (limpeza automática ao publicar)
    POST_LIMIT: 30,
    // Posts buscados por amigo
    POSTS_PER_USER: 6,

    // ── PUBLICAR NO FEED ──────────────────────────────────────────────────────

    async publish(type, data) {
        if (!NyanAuth.isOnline()) return;

        const uid     = NyanAuth.getUID();
        const profile = NyanAuth.currentUser || {};

        const post = {
            type,
            authorUID:      uid,
            authorTag:      profile.nyanTag  || NyanAuth.getNyanTag() || '',
            authorUsername: profile.username || Auth.getStoredUser()?.username || 'Jogador',
            authorAvatar:   profile.avatar   || Utils.loadData('nyan_profile_avatar') || null,
            createdAt:      NyanFirebase.fn.serverTimestamp(),
            reactions:      { '🐱':[], '⭐':[], '💎':[], '🔥':[] },
            comments:       [],
            ...data,
        };

        await NyanFirebase.fn.addDoc(
            NyanFirebase.fn.collection(NyanFirebase.db, `feed/${uid}/posts`),
            post
        );

        // Auto-limpeza: manter só os POST_LIMIT posts mais recentes
        this._pruneOldPosts(uid).catch(() => {});
    },

    async _pruneOldPosts(uid) {
        const { query, collection, orderBy, getDocs, deleteDoc, doc } = NyanFirebase.fn;
        const snap = await getDocs(query(
            collection(NyanFirebase.db, `feed/${uid}/posts`),
            orderBy('createdAt', 'desc')
        ));
        if (snap.size <= this.POST_LIMIT) return;
        const toDelete = snap.docs.slice(this.POST_LIMIT);
        toDelete.forEach(d => deleteDoc(doc(NyanFirebase.db, `feed/${uid}/posts`, d.id)).catch(() => {}));
    },

    // Helper: publicar score ao final de uma partida
    async publishScore(gameId, gameName, score, unit) {
        await this.publish('score', { gameId, gameName, score, unit });
    },

    // Helper: publicar conquista desbloqueada
    async publishAchievement(achievement) {
        await this.publish('achievement', { achievement });
    },

    // Helper: publicar novo recorde
    async publishRecord(gameId, gameName, score, unit) {
        await this.publish('record', { gameId, gameName, score, unit });
    },

    // ── REAGIR A UM POST ──────────────────────────────────────────────────────

    async react(authorUID, postId, emoji) {
        const myUID   = NyanAuth.getUID();
        const path    = `feed/${authorUID}/posts/${postId}`;
        const post    = await NyanFirebase.getDoc(path);
        if (!post) return;

        const reactions = post.reactions || {};
        const current   = reactions[emoji] || [];
        const hasReacted = current.includes(myUID);

        await NyanFirebase.updateDoc(path, {
            [`reactions.${emoji}`]: hasReacted
                ? NyanFirebase.fn.arrayRemove(myUID)
                : NyanFirebase.fn.arrayUnion(myUID)
        });

        // Atualizar só os botões de reação do post afetado — sem recarregar tudo
        this._refreshReactions(postId, authorUID, myUID, emoji, hasReacted ? -1 : 1);
    },

    // ── COMENTAR ──────────────────────────────────────────────────────────────

    async comment(authorUID, postId, text) {
        if (!text?.trim()) return;
        const comment = {
            uid:       NyanAuth.getUID(),
            tag:       NyanAuth.getNyanTag(),
            text:      text.trim().slice(0, 200),
            createdAt: Date.now(),
        };
        await NyanFirebase.updateDoc(`feed/${authorUID}/posts/${postId}`, {
            comments: NyanFirebase.fn.arrayUnion(comment)
        });
    },

    // ── RENDER PRINCIPAL ──────────────────────────────────────────────────────

    _currentFeedTab: 'friends',
    _cachedPosts: [],
    _myUID: null,

    render() {
        if (!NyanAuth.isOnline()) return Friends._renderOfflineState();

        const d    = document.body.classList.contains('dark-theme');
        const muted= d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';
        const bg   = d ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
        const bdr  = d ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';

        return `
        <style>
        @keyframes feedSlideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .feed-card { animation: feedSlideUp .32s ease both; }
        .feed-react-btn { transition: background .12s, border-color .12s, color .12s, transform .1s; }
        .feed-react-btn:hover { transform: scale(1.08); }
        .feed-react-btn:active { transform: scale(0.94); }
        </style>
        <div style="max-width:580px;margin:0 auto;font-family:'DM Sans',sans-serif;">

            <!-- Cabeçalho -->
            <div style="text-align:center;margin-bottom:1.4rem;">
                <div style="font-size:2rem;margin-bottom:0.3rem;">📰</div>
                <h1 style="font-family:'Syne',sans-serif;font-size:1.9rem;font-weight:900;margin:0 0 0.2rem;
                    background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));
                    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
                    Feed
                </h1>
                <p style="font-size:0.72rem;color:${muted};margin:0;">Atividades dos seus amigos にゃん~</p>
            </div>

            <!-- Abas -->
            <div style="display:flex;gap:0.25rem;background:${bg};border:1px solid ${bdr};
                border-radius:14px;padding:0.3rem;margin-bottom:1rem;">
                <button id="feedtab-friends" onclick="Feed._switchTab('friends')"
                    style="flex:1;padding:0.48rem;border-radius:10px;border:1px solid rgba(168,85,247,0.2);cursor:pointer;
                    font-size:0.75rem;font-weight:700;font-family:'DM Sans',sans-serif;
                    background:${d?'rgba(255,255,255,0.05)':'#fff'};color:var(--theme-primary,#a855f7);">
                    👥 Amigos
                </button>
                <button id="feedtab-mine" onclick="Feed._switchTab('mine')"
                    style="flex:1;padding:0.48rem;border-radius:10px;border:1px solid transparent;cursor:pointer;
                    font-size:0.75rem;font-weight:700;font-family:'DM Sans',sans-serif;
                    background:transparent;color:${muted};">
                    👤 Meu feed
                </button>
            </div>

            <!-- Conteúdo -->
            <div id="feed-content">
                <div style="text-align:center;padding:2rem;color:${muted};font-size:0.8rem;">Carregando...</div>
            </div>
        </div>`;
    },

    _switchTab(tab) {
        this._currentFeedTab = tab;
        const d    = document.body.classList.contains('dark-theme');
        const muted= d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';
        const bg   = d ? 'rgba(255,255,255,0.05)' : '#fff';

        ['friends','mine'].forEach(t => {
            const btn = document.getElementById('feedtab-' + t);
            if (!btn) return;
            const active = t === tab;
            btn.style.background  = active ? bg : 'transparent';
            btn.style.color       = active ? 'var(--theme-primary,#a855f7)' : muted;
            btn.style.borderColor = active ? 'rgba(168,85,247,0.2)' : 'transparent';
        });

        // Filtrar posts já carregados sem nova requisição
        const myUID = this._myUID;
        const posts = tab === 'mine'
            ? this._cachedPosts.filter(p => p.authorUID === myUID)
            : this._cachedPosts;

        this._renderPosts(posts);
    },

    _renderPosts(posts) {
        const container = document.getElementById('feed-content');
        if (!container) return;

        const myUID = this._myUID;
        const d     = document.body.classList.contains('dark-theme');
        const muted = d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';
        const sub   = d ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';

        if (posts.length === 0) {
            const msg = this._currentFeedTab === 'mine'
                ? { icon:'📭', title:'Seu feed está vazio', sub:'Jogue uma partida para aparecer aqui!' }
                : { icon:'📭', title:'Feed vazio', sub:'Adicione amigos e compartilhe suas partidas!' };
            container.innerHTML = `
            <div style="text-align:center;padding:3rem 1rem;color:${muted};">
                <div style="font-size:2.5rem;opacity:0.35;margin-bottom:0.75rem;">${msg.icon}</div>
                <div style="font-size:0.88rem;font-weight:700;color:${sub};margin-bottom:0.3rem;">${msg.title}</div>
                <p style="font-size:0.72rem;margin:0;">${msg.sub}</p>
            </div>`;
            return;
        }

        container.innerHTML = posts.map((post, i) => this._renderPost(post, i)).join('');
    },

    // ── CARREGAR FEED ─────────────────────────────────────────────────────────

    async loadFeed() {
        const myUID = NyanAuth.getUID();
        this._myUID = myUID;

        const { query: fq, collection: fc, where: fw, getDocs: fgd } = NyanFirebase.fn;
        const fsSnap = await fgd(fq(fc(NyanFirebase.db, 'friendships'), fw('users', 'array-contains', myUID)));
        const friends = fsSnap.docs.map(d => {
            const users = d.data().users || [];
            return users.find(u => u !== myUID);
        }).filter(Boolean);

        const uids = [myUID, ...friends];
        const { query, collection, orderBy, limit, getDocs } = NyanFirebase.fn;

        const allPosts = [];
        await Promise.all(uids.map(async uid => {
            const snap = await getDocs(query(
                collection(NyanFirebase.db, `feed/${uid}/posts`),
                orderBy('createdAt', 'desc'),
                limit(this.POSTS_PER_USER)
            ));
            snap.docs.forEach(d => allPosts.push({ id: d.id, authorUID: uid, ...d.data() }));
        }));

        allPosts.sort((a, b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));
        this._cachedPosts = allPosts;

        this._renderPosts(
            this._currentFeedTab === 'mine'
                ? allPosts.filter(p => p.authorUID === myUID)
                : allPosts
        );
    },

    // ── RENDER DE UM POST ─────────────────────────────────────────────────────

    _renderPost(post, index = 0) {
        const d    = document.body.classList.contains('dark-theme');
        const bg   = d ? 'rgba(255,255,255,0.04)' : '#ffffff';
        const bdr  = d ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
        const text = d ? '#f1f5f9' : '#0f172a';
        const sub  = d ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
        const muted= d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';
        const myUID= NyanAuth.getUID();

        const timeAgo = this._timeAgo(post.createdAt);

        // Tipo do post com cor
        const TYPE_META = {
            score:       { label:'Jogou',       color:'var(--theme-primary,#a855f7)', bg:'rgba(168,85,247,0.1)',  bdr:'rgba(168,85,247,0.2)'  },
            record:      { label:'Novo recorde',color:'#4ade80',                     bg:'rgba(74,222,128,0.1)',   bdr:'rgba(74,222,128,0.25)' },
            achievement: { label:'Conquista',   color:'#fbbf24',                     bg:'rgba(251,191,36,0.1)',   bdr:'rgba(251,191,36,0.25)' },
        };
        const meta = TYPE_META[post.type] || TYPE_META.score;

        // Conteúdo do post
        const mainContent = post.type === 'achievement'
            ? `<div style="display:flex;align-items:center;gap:0.75rem;padding:0.7rem 0.875rem;
                background:${meta.bg};border-radius:12px;border:1px solid ${meta.bdr};">
                <span style="font-size:1.6rem;line-height:1;">${post.achievement?.icon || '🏆'}</span>
                <div>
                    <div style="font-size:0.85rem;font-weight:700;color:${text};">${post.achievement?.name || 'Conquista'}</div>
                    ${post.achievement?.desc ? `<div style="font-size:0.68rem;color:${sub};">${post.achievement.desc}</div>` : ''}
                </div>
               </div>`
            : `<div style="padding:0.65rem 0.875rem;background:${meta.bg};border-radius:12px;border:1px solid ${meta.bdr};
                display:flex;align-items:baseline;gap:0.35rem;flex-wrap:wrap;">
                <span style="font-size:1.15rem;font-weight:900;font-family:'Syne',sans-serif;color:${meta.color};">
                    ${typeof post.score === 'number' ? post.score.toLocaleString('pt-BR') : post.score}
                </span>
                <span style="font-size:0.75rem;font-weight:700;color:${sub};">${post.unit || 'pts'}</span>
                ${post.gameName ? `<span style="font-size:0.7rem;color:${muted};">em ${post.gameName}</span>` : ''}
               </div>`;

        // Reações
        const reactions = post.reactions || {};
        const reactionsHTML = this.REACTIONS.map(emoji => {
            const users   = reactions[emoji] || [];
            const count   = users.length;
            const reacted = users.includes(myUID);
            return `<button
                id="react-${post.id}-${emoji}"
                class="feed-react-btn"
                onclick="Feed.react('${post.authorUID}','${post.id}','${emoji}')"
                style="padding:3px 9px;border-radius:99px;border:none;cursor:pointer;font-size:0.8rem;
                background:${reacted?'rgba(168,85,247,0.15)':'transparent'};
                color:${reacted?'var(--theme-primary,#a855f7)':muted};
                border:1px solid ${reacted?'rgba(168,85,247,0.3)':bdr};
                display:inline-flex;align-items:center;gap:3px;font-family:'DM Sans',sans-serif;">
                ${emoji}${count > 0 ? `<span style="font-size:0.68rem;font-weight:800;">${count}</span>` : ''}
            </button>`;
        }).join('');

        // Comentários
        const commentsHTML = (post.comments?.length > 0) ? `
            <div class="post-comments-box" style="margin-top:0.7rem;padding-top:0.7rem;border-top:1px solid ${bdr};">
                ${post.comments.slice(-3).map(c => `
                <div style="font-size:0.73rem;margin-bottom:0.22rem;line-height:1.4;">
                    <strong style="color:var(--theme-primary,#a855f7);">${c.tag}</strong>
                    <span style="color:${sub};">: ${c.text}</span>
                </div>`).join('')}
                ${post.comments.length > 3 ? `<div style="font-size:0.65rem;color:${muted};">+${post.comments.length-3} mais comentários</div>` : ''}
            </div>` : '';

        return `
        <div id="post-${post.id}" class="feed-card" style="background:${bg};border:1px solid ${bdr};
            border-radius:16px;padding:1rem 1.1rem;margin-bottom:0.7rem;animation-delay:${index * 0.06}s;">

            <!-- Autor -->
            <div style="display:flex;align-items:center;gap:0.7rem;margin-bottom:0.8rem;">
                <div style="width:38px;height:38px;border-radius:11px;overflow:hidden;flex-shrink:0;">
                    ${post.authorAvatar
                        ? `<img src="${post.authorAvatar}" style="width:100%;height:100%;object-fit:cover;"/>`
                        : (window.AvatarGenerator
                            ? AvatarGenerator.generate(post.authorUsername||'nyan', 38)
                            : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#7c3aed,#ec4899);display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:1rem;">${(post.authorUsername||'N')[0].toUpperCase()}</div>`)}
                </div>
                <div style="flex:1;min-width:0;">
                    <div style="display:flex;align-items:center;gap:0.4rem;flex-wrap:wrap;">
                        <span style="font-size:0.85rem;font-weight:700;color:${text};">${post.authorUsername || 'Jogador'}</span>
                        <span style="font-size:0.6rem;font-weight:700;padding:1px 7px;border-radius:99px;
                            background:${meta.bg};color:${meta.color};border:1px solid ${meta.bdr};">
                            ${meta.label}
                        </span>
                    </div>
                    <div style="font-size:0.65rem;color:${muted};margin-top:1px;">${post.authorTag || ''} · ${timeAgo}</div>
                </div>
            </div>

            <!-- Conteúdo -->
            <div style="margin-bottom:0.75rem;">${mainContent}</div>

            <!-- Reações -->
            <div style="display:flex;gap:0.3rem;flex-wrap:wrap;">${reactionsHTML}</div>

            ${commentsHTML}

            <!-- Input comentário -->
            <div style="margin-top:0.6rem;display:flex;gap:0.35rem;">
                <input id="comment-${post.id}" type="text" placeholder="Comentar... にゃん~" maxlength="200"
                    style="flex:1;padding:5px 10px;border-radius:8px;border:1px solid ${bdr};
                    background:${d?'rgba(255,255,255,0.05)':'#f4f4f9'};color:${text};
                    font-size:0.73rem;font-family:'DM Sans',sans-serif;outline:none;box-sizing:border-box;"
                    onkeydown="if(event.key==='Enter')Feed.submitComment('${post.authorUID}','${post.id}')"/>
                <button onclick="Feed.submitComment('${post.authorUID}','${post.id}')"
                    style="padding:5px 11px;border-radius:8px;border:none;cursor:pointer;font-size:0.72rem;font-weight:700;
                    background:rgba(168,85,247,0.12);color:rgba(168,85,247,0.9);font-family:'DM Sans',sans-serif;">↑</button>
            </div>
        </div>`;
    },

    async submitComment(authorUID, postId) {
        const input = document.getElementById(`comment-${postId}`);
        const text  = input?.value?.trim();
        if (!text) return;

        await this.comment(authorUID, postId, text);
        if (input) input.value = '';

        const myTag = NyanAuth?.getNyanTag?.() || '';
        const d     = document.body.classList.contains('dark-theme');
        const sub   = d ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
        const bdr   = d ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

        const commentInput = document.getElementById('comment-' + postId);
        if (commentInput) {
            const cardRoot  = commentInput.closest('[id^="post-"]') ||
                              commentInput.parentElement?.parentElement?.parentElement;
            let commentsBox = cardRoot?.querySelector('.post-comments-box');

            if (!commentsBox) {
                commentsBox = document.createElement('div');
                commentsBox.className = 'post-comments-box';
                commentsBox.style.cssText = 'margin-top:0.7rem;padding-top:0.7rem;border-top:1px solid ' + bdr + ';';
                commentInput.parentElement.insertAdjacentElement('beforebegin', commentsBox);
            }

            const line = document.createElement('div');
            line.style.cssText = 'font-size:0.73rem;margin-bottom:0.22rem;line-height:1.4;';
            line.innerHTML = `<strong style="color:var(--theme-primary,#a855f7);">${myTag||'Você'}</strong>`
                + `<span style="color:${sub};">: ${text.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</span>`;
            commentsBox.appendChild(line);
        }

        Utils.showNotification('💬 Comentário enviado!', 'success');
    },

    _refreshReactions(postId, authorUID, myUID, emoji, delta) {
        // Atualizar só o botão específico sem recarregar o feed
        const btn = document.getElementById(`react-${postId}-${emoji}`);
        if (!btn) return;

        const d       = document.body.classList.contains('dark-theme');
        const bdr     = d ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
        const muted   = d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';
        const nowReacted = delta > 0;

        // Atualizar contagem visualmente
        const countSpan = btn.querySelector('span');
        const currentCount = countSpan ? parseInt(countSpan.textContent)||0 : 0;
        const newCount = Math.max(0, currentCount + delta);

        btn.style.background  = nowReacted ? 'rgba(168,85,247,0.15)' : 'transparent';
        btn.style.color       = nowReacted ? 'var(--theme-primary,#a855f7)' : muted;
        btn.style.borderColor = nowReacted ? 'rgba(168,85,247,0.3)' : bdr;
        btn.innerHTML = `${emoji}${newCount > 0 ? `<span style="font-size:0.68rem;font-weight:800;">${newCount}</span>` : ''}`;
    },

    // ── HELPERS ───────────────────────────────────────────────────────────────

    _timeAgo(ts) {
        if (!ts) return 'agora';
        // Suporta Firestore Timestamp ({seconds}) e Date.now() (número em ms)
        const secs = ts?.seconds ?? (typeof ts === 'number' ? ts / 1000 : 0);
        if (!secs) return 'agora';
        const diff = Date.now() / 1000 - secs;
        if (diff < 60)    return 'agora';
        if (diff < 3600)  return Math.floor(diff / 60) + 'min atrás';
        if (diff < 86400) return Math.floor(diff / 3600) + 'h atrás';
        return Math.floor(diff / 86400) + 'd atrás';
    },

    // ── INIT ──────────────────────────────────────────────────────────────────

    init() {
        this._currentFeedTab = 'friends';
        setTimeout(() => this.loadFeed(), 100);
        console.log('[Feed] v2.0.0 inicializado');
    },
};

window.Feed = Feed;