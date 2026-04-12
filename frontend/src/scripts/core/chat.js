// CHAT.JS — NyanTools にゃん~

const Chat = {

    _currentChatId: null,
    _unsubMessages: null,
    _target:        null,
    _pendingIds:    new Set(),

    getChatId(uid1, uid2) {
        return [uid1, uid2].sort().join('_');
    },

    render() {
        if (!NyanAuth.isOnline()) return Friends._renderOfflineState();

        const target = window._chatTarget;
        if (target) {
            window._chatTarget = null;
            this._target = target;
            this._currentChatId = this.getChatId(NyanAuth.getUID(), target.uid);
        }

        const d    = document.body.classList.contains('dark-theme');
        const bg   = d ? 'rgba(255,255,255,0.04)' : '#ffffff';
        const bdr  = d ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
        const text = d ? '#f1f5f9' : '#0f172a';
        const sub  = d ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
        const muted= d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';

        if (this._currentChatId && this._target) {
            return this._renderChatWindow(d, bg, bdr, text, sub, muted);
        }

        return this._renderChatList(d, bg, bdr, text, sub, muted);
    },

    _renderChatList(d, bg, bdr, text, sub, muted) {
        return `
        <div style="max-width:640px;margin:0 auto;font-family:'DM Sans',sans-serif;">
            <div style="text-align:center;margin-bottom:1.75rem;">
                <div style="font-size:2.5rem;margin-bottom:0.4rem;">💬</div>
                <h1 style="font-family:'Syne',sans-serif;font-size:2rem;font-weight:900;margin:0 0 0.25rem;
                    background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));
                    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
                    Mensagens
                </h1>
            </div>
            <div id="chat-list-content" style="display:flex;flex-direction:column;gap:0.5rem;">
                <div style="text-align:center;padding:2rem;color:${muted};font-size:0.8rem;">Carregando conversas...</div>
            </div>
        </div>`;
    },

    _renderChatWindow(d, bg, bdr, text, sub, muted) {
        const t = this._target;
        return `
        <div style="max-width:640px;margin:0 auto;font-family:'DM Sans',sans-serif;display:flex;flex-direction:column;height:calc(100vh - 140px);">

            <div style="background:${bg};border:1px solid ${bdr};border-radius:16px 16px 0 0;
                padding:0.875rem 1rem;display:flex;align-items:center;gap:0.875rem;flex-shrink:0;">
                <button onclick="Chat._closeChat()"
                        style="background:none;border:none;cursor:pointer;color:${sub};font-size:1.1rem;padding:0 0.25rem;">
                    ←
                </button>
                <div id="chat-header-avatar" style="width:36px;height:36px;border-radius:10px;overflow:hidden;flex-shrink:0;border:1.5px solid rgba(168,85,247,0.3);">
                    ${window.AvatarGenerator ? AvatarGenerator.generate(t.username || 'nyan', 36) : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#7c3aed,#ec4899);display:flex;align-items:center;justify-content:center;color:white;font-weight:800;">${(t.username||'N')[0].toUpperCase()}</div>`}
                </div>
                <div style="flex:1;">
                    <div style="font-size:0.875rem;font-weight:700;color:${text};">${t.username || t.tag}</div>
                    <div style="font-size:0.68rem;color:${muted};">${t.tag}</div>
                </div>
                <button onclick="Friends.viewProfile('${t.uid}')"
                        style="padding:5px 12px;border-radius:8px;border:none;cursor:pointer;
                            font-size:0.7rem;font-weight:700;
                            background:rgba(168,85,247,0.12);color:rgba(168,85,247,0.9);
                            font-family:'DM Sans',sans-serif;">
                    Ver perfil
                </button>
            </div>

            <div id="chat-messages" style="
                flex:1;overflow-y:auto;
                background:${d?'rgba(255,255,255,0.02)':'#fafafa'};
                border-left:1px solid ${bdr};border-right:1px solid ${bdr};
                padding:1rem;
                display:flex;flex-direction:column;gap:0.5rem;
                scrollbar-width:thin;
            ">
                <div style="text-align:center;font-size:0.72rem;color:${muted};padding:1rem 0;">
                    Início da conversa にゃん~
                </div>
            </div>

            <div style="background:${bg};border:1px solid ${bdr};border-radius:0 0 16px 16px;
                padding:0.75rem;display:flex;gap:0.5rem;flex-shrink:0;">
                <input id="chat-input"
                       type="text"
                       placeholder="Digite uma mensagem..."
                       maxlength="500"
                       style="flex:1;padding:0.6rem 0.875rem;
                           background:${d?'rgba(255,255,255,0.06)':'#f4f4f9'};
                           border:1.5px solid ${bdr};border-radius:10px;
                           color:${text};font-size:0.875rem;
                           font-family:'DM Sans',sans-serif;outline:none;
                           transition:border-color 0.18s;box-sizing:border-box;"
                       onfocus="this.style.borderColor='rgba(168,85,247,0.6)'"
                       onblur="this.style.borderColor='${bdr}'"
                       onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();Chat.sendMessage();}"/>
                <button onclick="Chat.sendMessage()"
                        style="padding:0.6rem 1rem;border-radius:10px;border:none;
                            background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));
                            color:white;font-size:0.875rem;cursor:pointer;transition:filter 0.15s;"
                        onmouseover="this.style.filter='brightness(1.1)'"
                        onmouseout="this.style.filter=''">
                    ↑
                </button>
            </div>
        </div>`;
    },

    async sendMessage() {
        const input = document.getElementById('chat-input');
        const text  = (input?.value || '').trim();
        if (!text || !this._currentChatId) return;

        input.value = '';
        input.focus();

        const myUID  = NyanAuth.getUID();
        const chatId = this._currentChatId;
        const d      = document.body.classList.contains('dark-theme');

        const now    = new Date();
        const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const container = document.getElementById('chat-messages');

        const localKey = `local-${myUID}-${now.getTime()}`;

        if (container) {
            const div = document.createElement('div');
            div.setAttribute('data-local-key', localKey);
            div.style.display = 'flex';
            div.style.justifyContent = 'flex-end';
            div.innerHTML = `
                <div style="max-width:75%;">
                    <div style="background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));
                        color:white;border-radius:16px 16px 4px 16px;
                        padding:0.6rem 0.875rem;font-size:0.875rem;line-height:1.5;
                        word-break:break-word;box-shadow:0 1px 4px rgba(0,0,0,0.1);">
                        ${this._escapeHTML(text)}
                    </div>
                    <div style="font-size:0.62rem;color:${d?'rgba(255,255,255,0.55)':'rgba(0,0,0,0.4)'};
                        margin-top:2px;text-align:right;padding:0 4px;">${timeStr}</div>
                </div>`;
            container.appendChild(div);
            container.scrollTop = container.scrollHeight;

            const msgData = {
                from:      myUID,
                text,
                sentAt:    NyanFirebase.fn.serverTimestamp(),
                read:      false,
                _localKey: localKey,
            };

            NyanFirebase.fn.addDoc(
                NyanFirebase.fn.collection(NyanFirebase.db, `chats/${chatId}/messages`),
                msgData
            ).then(docRef => {
                const localDiv = container.querySelector(`[data-local-key="${localKey}"]`);
                if (!localDiv) return;
                localDiv.id = 'msg-' + docRef.id;
                localDiv.removeAttribute('data-local-key');
                this._pendingIds.add(docRef.id);
            }).catch(() => {});

            const targetUID = this._target?.uid;
            NyanFirebase.setDoc(`chats/${chatId}`, {
                participants:   [myUID, targetUID].sort(),
                lastMessage:    text.slice(0, 60),
                lastMessageAt:  NyanFirebase.fn.serverTimestamp(),
                [`unread_${targetUID}`]: NyanFirebase.fn.increment(1),
                [`unread_${myUID}`]:     0,
            }).catch(() => {});
        }
    },

    _renderMessage(msg, isMe, d) {
        const bg     = isMe
            ? 'linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899))'
            : (d ? 'rgba(255,255,255,0.06)' : '#f0f0f5');
        const color  = isMe ? 'white' : (d ? 'rgba(255,255,255,0.85)' : '#0f172a');
        const align  = isMe ? 'flex-end' : 'flex-start';
        const radius = isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px';
        const timeColor = d ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.4)';

        const time = msg.sentAt?.toDate
            ? msg.sentAt.toDate().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })
            : '';

        return `
        <div id="msg-${msg.id}" style="display:flex;justify-content:${align};">
            <div style="max-width:75%;">
                <div style="background:${bg};color:${color};border-radius:${radius};
                    padding:0.6rem 0.875rem;font-size:0.875rem;line-height:1.5;
                    word-break:break-word;box-shadow:0 1px 4px rgba(0,0,0,0.1);">
                    ${this._escapeHTML(msg.text)}
                </div>
                ${time ? `<div style="font-size:0.62rem;color:${timeColor};
                    margin-top:2px;text-align:${isMe?'right':'left'};padding:0 4px;">${time}</div>` : ''}
            </div>
        </div>`;
    },

    _subscribeMessages() {
        if (this._unsubMessages) this._unsubMessages();
        this._pendingIds = new Set();

        const chatId = this._currentChatId;
        const myUID  = NyanAuth.getUID();
        const d      = document.body.classList.contains('dark-theme');

        NyanFirebase.setDoc(`chats/${chatId}`, {
            participants:  [myUID, this._target?.uid].filter(Boolean).sort(),
            lastMessage:   '',
            lastMessageAt: NyanFirebase.fn.serverTimestamp(),
            [`unread_${myUID}`]: 0,
        }, true).catch(() => {});

        const { query, collection, orderBy, limit, onSnapshot } = NyanFirebase.fn;
        const q = query(
            collection(NyanFirebase.db, `chats/${chatId}/messages`),
            orderBy('sentAt', 'asc'),
            limit(100)
        );

        this._unsubMessages = onSnapshot(q, (snapshot) => {
            const container = document.getElementById('chat-messages');
            if (!container) { this._unsubMessages?.(); return; }

            snapshot.docChanges().forEach(change => {
                if (change.type !== 'added') return;

                const doc  = change.doc;
                const msg  = { id: doc.id, ...doc.data() };
                const isMe = msg.from === myUID;

                if (this._pendingIds.has(doc.id)) {
                    this._pendingIds.delete(doc.id);
                    return;
                }

                if (document.getElementById('msg-' + doc.id)) return;
                if (doc.metadata.hasPendingWrites) return;

                container.insertAdjacentHTML('beforeend', this._renderMessage(msg, isMe, d));
            });

            container.scrollTop = container.scrollHeight;
            NyanFirebase.updateDoc(`chats/${chatId}`, { [`unread_${myUID}`]: 0 }).catch(() => {});
        }, (err) => {
            console.warn('[Chat] Listener erro:', err.code);
        });

        NyanFirebase._listeners.push(this._unsubMessages);
    },

    openChat(uid, tag, username) {
        this._target        = { uid, tag, username: username || tag };
        this._currentChatId = this.getChatId(NyanAuth.getUID(), uid);
    },

    _closeChat() {
        if (this._unsubMessages) { this._unsubMessages(); this._unsubMessages = null; }
        this._pendingIds    = new Set();
        this._currentChatId = null;
        this._target        = null;
        Router?.render();
    },

    async _loadChatList() {
        const myUID = NyanAuth.getUID();
        const d     = document.body.classList.contains('dark-theme');
        const bg    = d ? 'rgba(255,255,255,0.04)' : '#ffffff';
        const bdr   = d ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
        const text  = d ? '#f1f5f9' : '#0f172a';
        const sub   = d ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
        const muted = d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';

        const { query, collection, where, getDocs } = NyanFirebase.fn;
        const snap = await getDocs(query(
            collection(NyanFirebase.db, 'chats'),
            where('participants', 'array-contains', myUID)
        ));

        const chats = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => (b.lastMessageAt?.seconds || 0) - (a.lastMessageAt?.seconds || 0));

        const container = document.getElementById('chat-list-content');
        if (!container) return;

        if (chats.length === 0) {
            container.innerHTML = `
            <div style="text-align:center;padding:3rem;color:${muted};">
                <div style="font-size:3rem;opacity:0.35;margin-bottom:0.75rem;">💬</div>
                <div style="font-size:0.9rem;font-weight:700;color:${sub};">Nenhuma conversa</div>
                <p style="font-size:0.75rem;">Abra o perfil de um amigo e clique em 💬</p>
            </div>`;
            return;
        }

        const items = await Promise.all(chats.map(async (chat) => {
            const otherUID = chat.participants.find(u => u !== myUID);
            const other    = await NyanFirebase.getDoc(`users/${otherUID}`);
            const unread   = chat[`unread_${myUID}`] || 0;
            return { chat, other, unread, otherUID };
        }));

        container.innerHTML = items.map(({ chat, other, unread, otherUID }) => `
        <div style="background:${bg};border:1px solid ${unread>0?'rgba(168,85,247,0.3)':bdr};
            border-radius:14px;padding:0.875rem 1rem;
            display:flex;align-items:center;gap:0.875rem;cursor:pointer;transition:box-shadow 0.15s;"
            onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'"
            onmouseout="this.style.boxShadow=''"
            onclick="Chat.openChat('${otherUID}','${other?.nyanTag||''}','${other?.username||''}');Router.render();">
            <div style="width:40px;height:40px;border-radius:10px;overflow:hidden;flex-shrink:0;">
                ${other?.avatar
                    ? `<img src="${other.avatar}" style="width:100%;height:100%;object-fit:cover;"/>`
                    : (window.AvatarGenerator ? AvatarGenerator.generate(other?.username||'nyan', 40) : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#7c3aed,#ec4899);display:flex;align-items:center;justify-content:center;color:white;font-weight:800;">${(other?.username||'N')[0].toUpperCase()}</div>`)}
            </div>
            <div style="flex:1;min-width:0;">
                <div style="font-size:0.875rem;font-weight:700;color:${text};">${other?.username || 'Usuário'}</div>
                <div style="font-size:0.72rem;color:${muted};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${chat.lastMessage || '...'}</div>
            </div>
            ${unread > 0 ? `<div style="min-width:20px;height:20px;padding:0 6px;border-radius:99px;
                background:var(--theme-primary,#a855f7);color:white;
                font-size:0.65rem;font-weight:800;display:flex;align-items:center;justify-content:center;">
                ${unread}
            </div>` : ''}
        </div>`).join('');
    },

    async getTotalUnread() {
        const myUID = NyanAuth.getUID();
        if (!myUID || !NyanFirebase.isReady()) return 0;
        const { query, collection, where, getDocs } = NyanFirebase.fn;
        const snap = await getDocs(query(
            collection(NyanFirebase.db, 'chats'),
            where('participants', 'array-contains', myUID)
        ));
        let total = 0;
        snap.docs.forEach(d => { total += d.data()[`unread_${myUID}`] || 0; });
        return total;
    },

    _escapeHTML(str) {
        return (str || '')
            .replace(/&/g,'&amp;')
            .replace(/</g,'&lt;')
            .replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;');
    },

    init() {
        if (this._currentChatId) {
            this._subscribeMessages();
            if (this._target?.uid) {
                NyanFirebase.getDoc(`users/${this._target.uid}`).then(profile => {
                    if (!profile?.avatar) return;
                    const el = document.getElementById('chat-header-avatar');
                    if (el) el.innerHTML = `<img src="${profile.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;"/>`;
                }).catch(() => {});
            }
        } else {
            setTimeout(() => this._loadChatList(), 100);
        }
    },
};

window.Chat = Chat;