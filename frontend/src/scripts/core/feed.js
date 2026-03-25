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
        const myUID  = NyanAuth.getUID();
        const path   = `feed/${authorUID}/posts/${postId}`;
        const post   = await NyanFirebase.getDoc(path);
        if (!post) return;

        const reactions = post.reactions || {};
        const current   = reactions[emoji] || [];
        const hasReacted= current.includes(myUID);

        // Toggle: se já reagiu, remove; senão adiciona
        await NyanFirebase.updateDoc(path, {
            [`reactions.${emoji}`]: hasReacted
                ? NyanFirebase.fn.arrayRemove(myUID)
                : NyanFirebase.fn.arrayUnion(myUID)
        });

        this._refreshReactions(postId, authorUID);
    },

    // ── COMENTAR ──────────────────────────────────────────────────────────────

    async comment(authorUID, postId, text) {
        if (!text?.trim()) return;
        const comment = {
            uid:       NyanAuth.getUID(),
            tag:       NyanAuth.getNyanTag(),
            text:      text.trim().slice(0, 200),
            createdAt: Date.now(), // serverTimestamp() não funciona dentro de arrayUnion
        };
        await NyanFirebase.updateDoc(`feed/${authorUID}/posts/${postId}`, {
            comments: NyanFirebase.fn.arrayUnion(comment)
        });
    },

    // ── RENDER PRINCIPAL ──────────────────────────────────────────────────────

    render() {
        if (!NyanAuth.isOnline()) return Friends._renderOfflineState();

        const d    = document.body.classList.contains('dark-theme');
        const muted= d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';

        return `
        <div style="max-width:600px;margin:0 auto;font-family:'DM Sans',sans-serif;">
            <div style="text-align:center;margin-bottom:1.75rem;">
                <div style="font-size:2.5rem;margin-bottom:0.4rem;">📰</div>
                <h1 style="font-family:'Syne',sans-serif;font-size:2rem;font-weight:900;margin:0 0 0.25rem;
                    background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));
                    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
                    Feed
                </h1>
                <p style="font-size:0.75rem;color:${muted};margin:0;">Atividades dos seus amigos にゃん~</p>
            </div>
            <div id="feed-content">
                <div style="text-align:center;padding:2rem;color:${muted};font-size:0.8rem;">Carregando feed...</div>
            </div>
        </div>`;
    },

    // ── CARREGAR FEED ─────────────────────────────────────────────────────────

    async loadFeed() {
        const myUID  = NyanAuth.getUID();
        // Fonte confiável: coleção friendships
        const { query: fq, collection: fc, where: fw, getDocs: fgd } = NyanFirebase.fn;
        const fsSnap = await fgd(fq(fc(NyanFirebase.db, 'friendships'), fw('users', 'array-contains', myUID)));
        const friends = fsSnap.docs.map(d => {
            const users = d.data().users || [];
            return users.find(u => u !== myUID);
        }).filter(Boolean);
        const uids   = [myUID, ...friends];

        const { query, collection, orderBy, limit, getDocs } = NyanFirebase.fn;

        // Buscar últimas 5 posts de cada amigo
        const allPosts = [];
        await Promise.all(uids.map(async uid => {
            const q    = query(
                collection(NyanFirebase.db, `feed/${uid}/posts`),
                orderBy('createdAt', 'desc'),
                limit(5)
            );
            const snap = await getDocs(q);
            snap.docs.forEach(d => allPosts.push({ id: d.id, authorUID: uid, ...d.data() }));
        }));

        // Ordenar por data
        allPosts.sort((a, b) => {
            const ta = a.createdAt?.seconds || 0;
            const tb = b.createdAt?.seconds || 0;
            return tb - ta;
        });

        const container = document.getElementById('feed-content');
        if (!container) return;

        if (allPosts.length === 0) {
            const d    = document.body.classList.contains('dark-theme');
            const muted= d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';
            const sub  = d ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
            container.innerHTML = `
            <div style="text-align:center;padding:3rem;color:${muted};">
                <div style="font-size:3rem;opacity:0.35;margin-bottom:0.75rem;">📭</div>
                <div style="font-size:0.9rem;font-weight:700;color:${sub};">Feed vazio</div>
                <p style="font-size:0.75rem;">Adicione amigos e compartilhe suas partidas!</p>
            </div>`;
            return;
        }

        container.innerHTML = allPosts.map(post => this._renderPost(post)).join('');
    },

    // ── RENDER DE UM POST ─────────────────────────────────────────────────────

    _renderPost(post) {
        const d    = document.body.classList.contains('dark-theme');
        const bg   = d ? 'rgba(255,255,255,0.04)' : '#ffffff';
        const bdr  = d ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
        const text = d ? '#f1f5f9' : '#0f172a';
        const sub  = d ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
        const muted= d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';
        const myUID= NyanAuth.getUID();

        const timeAgo = this._timeAgo(post.createdAt);
        const typeLabel = {
            score:       '🎮 Jogou',
            record:      '📈 Novo recorde',
            achievement: '🏆 Conquista',
        };

        const mainContent = post.type === 'achievement'
            ? `<div style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem;
                background:rgba(168,85,247,0.08);border-radius:10px;border:1px solid rgba(168,85,247,0.2);">
                <span style="font-size:1.5rem;">${post.achievement?.icon || '🏆'}</span>
                <div>
                    <div style="font-size:0.85rem;font-weight:700;color:${text};">${post.achievement?.name || 'Conquista'}</div>
                    <div style="font-size:0.72rem;color:${sub};">${post.achievement?.desc || ''}</div>
                </div>
               </div>`
            : `<div style="padding:0.75rem;background:${d?'rgba(255,255,255,0.03)':'#f8f8fc'};border-radius:10px;">
                <span style="font-size:1.1rem;font-weight:900;font-family:'Syne',sans-serif;color:var(--theme-primary,#a855f7);">
                    ${typeof post.score === 'number' ? post.score.toLocaleString('pt-BR') : post.score}
                </span>
                <span style="font-size:0.78rem;color:${sub};margin-left:0.25rem;">${post.unit || 'pts'}</span>
                ${post.gameName ? `<span style="font-size:0.72rem;color:${muted};margin-left:0.5rem;">em ${post.gameName}</span>` : ''}
               </div>`;

        // Reações
        const reactions = post.reactions || {};
        const reactionsHTML = this.REACTIONS.map(emoji => {
            const users    = reactions[emoji] || [];
            const count    = users.length;
            const reacted  = users.includes(myUID);
            return `
            <button onclick="Feed.react('${post.authorUID}','${post.id}','${emoji}')"
                    style="padding:3px 8px;border-radius:99px;border:none;cursor:pointer;
                        font-size:0.78rem;
                        background:${reacted?'rgba(168,85,247,0.15)':'rgba(255,255,255,0.05)'};
                        color:${reacted?'var(--theme-primary,#a855f7)':'inherit'};
                        border:1px solid ${reacted?'rgba(168,85,247,0.3)':'rgba(255,255,255,0.08)'};
                        transition:all 0.15s;display:flex;align-items:center;gap:3px;">
                ${emoji} ${count > 0 ? `<span style="font-size:0.7rem;font-weight:700;">${count}</span>` : ''}
            </button>`;
        }).join('');

        return `
        <div id="post-${post.id}" style="background:${bg};border:1px solid ${bdr};border-radius:16px;
            padding:1rem 1.125rem;margin-bottom:0.75rem;">

            <!-- Autor -->
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.875rem;">
                <div style="width:36px;height:36px;border-radius:10px;overflow:hidden;flex-shrink:0;">
                    ${post.authorAvatar
                        ? `<img src="${post.authorAvatar}" style="width:100%;height:100%;object-fit:cover;"/>`
                        : (window.AvatarGenerator ? AvatarGenerator.generate(post.authorUsername||'nyan', 36) : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#7c3aed,#ec4899);display:flex;align-items:center;justify-content:center;color:white;font-weight:800;">${(post.authorUsername||'N')[0].toUpperCase()}</div>`)}
                </div>
                <div style="flex:1;">
                    <div style="display:flex;align-items:center;gap:0.5rem;">
                        <span style="font-size:0.85rem;font-weight:700;color:${text};">${post.authorUsername || 'Jogador'}</span>
                        <span style="font-size:0.68rem;color:${muted};">${typeLabel[post.type] || '📌'}</span>
                    </div>
                    <div style="font-size:0.68rem;color:${muted};">${post.authorTag || ''} · ${timeAgo}</div>
                </div>
            </div>

            <!-- Conteúdo -->
            <div style="margin-bottom:0.875rem;">${mainContent}</div>

            <!-- Reações -->
            <div style="display:flex;gap:0.375rem;flex-wrap:wrap;">
                ${reactionsHTML}
            </div>

            <!-- Comentários -->
            ${(post.comments?.length > 0) ? `
            <div class="post-comments-box" style="margin-top:0.75rem;padding-top:0.75rem;border-top:1px solid ${bdr};">
                ${post.comments.slice(-3).map(c => `
                <div style="font-size:0.75rem;margin-bottom:0.25rem;">
                    <strong style="color:var(--theme-primary,#a855f7);">${c.tag}</strong>
                    <span style="color:${sub};">: ${c.text}</span>
                </div>`).join('')}
            </div>` : ''}

            <!-- Input comentário -->
            <div style="margin-top:0.625rem;display:flex;gap:0.375rem;">
                <input id="comment-${post.id}" type="text" placeholder="Comentar... にゃん~" maxlength="200"
                       style="flex:1;padding:5px 10px;border-radius:8px;border:1px solid ${bdr};
                           background:${d?'rgba(255,255,255,0.05)':'#f4f4f9'};color:${text};
                           font-size:0.75rem;font-family:'DM Sans',sans-serif;outline:none;box-sizing:border-box;"
                       onkeydown="if(event.key==='Enter')Feed.submitComment('${post.authorUID}','${post.id}')"/>
                <button onclick="Feed.submitComment('${post.authorUID}','${post.id}')"
                        style="padding:5px 10px;border-radius:8px;border:none;cursor:pointer;
                            font-size:0.72rem;font-weight:700;
                            background:rgba(168,85,247,0.12);color:rgba(168,85,247,0.9);
                            font-family:'DM Sans',sans-serif;">
                    ↑
                </button>
            </div>
        </div>`;
    },

    async submitComment(authorUID, postId) {
        const input = document.getElementById(`comment-${postId}`);
        const text  = input?.value?.trim();
        if (!text) return;

        // Salvar no Firestore
        await this.comment(authorUID, postId, text);
        if (input) input.value = '';

        // Atualizar DOM imediatamente — sem reload completo
        const myTag = window.NyanAuth?.getNyanTag?.() || '';
        const d     = document.body.classList.contains('dark-theme');
        const sub   = d ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
        const bdr   = d ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

        // Encontrar ou criar o container de comentários do card
        const commentInput = document.getElementById('comment-' + postId);
        if (commentInput) {
            const cardRoot  = commentInput.closest('[data-post-id]') ||
                              commentInput.parentElement?.parentElement?.parentElement;
            let commentsBox = cardRoot?.querySelector('.post-comments-box');

            if (!commentsBox) {
                // Criar box de comentários antes do input
                commentsBox = document.createElement('div');
                commentsBox.className = 'post-comments-box';
                commentsBox.style.cssText =
                    'margin-top:0.75rem;padding-top:0.75rem;border-top:1px solid ' + bdr + ';';
                commentInput.parentElement.insertAdjacentElement('beforebegin', commentsBox);
            }

            // Adicionar novo comentário no box
            const line = document.createElement('div');
            line.style.cssText = 'font-size:0.75rem;margin-bottom:0.25rem;';
            line.innerHTML =
                '<strong style="color:var(--theme-primary,#a855f7);">' + (myTag || 'Você') + '</strong>' +
                '<span style="color:' + sub + ';">: ' + text.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span>';
            commentsBox.appendChild(line);
        }

        Utils.showNotification('💬 Comentário enviado!', 'success');
    },

    async _refreshReactions(postId) {
        // Re-render apenas as reações do card afetado (sem reload completo)
        // Implementação simplificada — reload do feed
        this.loadFeed();
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
        setTimeout(() => this.loadFeed(), 100);
        console.log('[Feed] v1.0.0 inicializado');
    },
};

window.Feed = Feed;