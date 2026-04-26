const Friends = {

    _listeners: {},
    _cache: {},
    _requestsBadge: 0,
    _lastPublicEconomySyncAt: 0,
    PUBLIC_ECON_SYNC_COOLDOWN: 15000,

    render() {
        if (Router?.currentRoute === 'profile-public' && window._viewingProfile) {
            return this._renderPublicProfile();
        }
        if (!NyanAuth.isOnline()) return this._renderOfflineState();

        const d    = document.body.classList.contains('dark-theme');
        const bg   = d ? 'rgba(255,255,255,0.04)' : '#ffffff';
        const bdr  = d ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
        const text = d ? '#f1f5f9' : '#0f172a';
        const sub  = d ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
        const muted= d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';

        return `
        <div style="max-width:640px;margin:0 auto;font-family:'DM Sans',sans-serif;">

            <div style="text-align:center;margin-bottom:1.75rem;">
                <div style="font-size:2.5rem;margin-bottom:0.4rem;">👥</div>
                <h1 style="font-family:'Syne',sans-serif;font-size:2rem;font-weight:900;margin:0 0 0.25rem;
                    background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));
                    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
                    Amigos
                </h1>
                <p style="font-size:0.75rem;color:${muted};margin:0;">
                    Seu NyanTag: <strong style="color:${sub};">${NyanAuth.getNyanTag()}</strong>
                </p>
            </div>

            <div style="background:${bg};border:1px solid ${bdr};border-radius:16px;padding:1.25rem;margin-bottom:1rem;">
                <div style="font-size:0.68rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${muted};margin-bottom:0.75rem;">
                    Adicionar amigo
                </div>
                <div style="display:flex;gap:0.625rem;">
                    <input id="friend-tag-input"
                           type="text"
                           placeholder="nome#1234"
                           style="flex:1;padding:0.65rem 0.875rem;
                               background:${d?'rgba(255,255,255,0.06)':'#f4f4f9'};
                               border:1.5px solid ${bdr};border-radius:10px;
                               color:${text};font-size:0.875rem;
                               font-family:'DM Sans',sans-serif;outline:none;
                               transition:border-color 0.18s;box-sizing:border-box;"
                           onfocus="this.style.borderColor='rgba(168,85,247,0.6)'"
                           onblur="this.style.borderColor='${bdr}'"
                           onkeydown="if(event.key==='Enter')Friends.sendRequest()"/>
                    <button onclick="Friends.sendRequest()"
                            style="padding:0.65rem 1.25rem;border-radius:10px;border:none;
                                background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));
                                color:white;font-size:0.8rem;font-weight:700;cursor:pointer;
                                font-family:'DM Sans',sans-serif;white-space:nowrap;
                                transition:filter 0.15s;"
                            onmouseover="this.style.filter='brightness(1.1)'"
                            onmouseout="this.style.filter=''">
                        + Adicionar
                    </button>
                </div>
                <div id="friend-add-status" style="font-size:0.72rem;min-height:1.2rem;margin-top:0.5rem;color:${sub};"></div>
            </div>

            <div id="friends-tabs" style="display:flex;gap:0.25rem;background:${d?'rgba(255,255,255,0.04)':'#f7f7fb'};
                border:1px solid ${bdr};border-radius:14px;padding:0.3rem;margin-bottom:1rem;">
                ${['list','requests','online'].map((tab, i) => {
                    const labels = { list:'👥 Amigos', requests:'🔔 Solicitações', online:'🟢 Online agora' };
                    return `<button onclick="Friends.switchTab('${tab}')"
                        id="ftab-${tab}"
                        style="flex:1;padding:0.5rem;border-radius:10px;border:none;cursor:pointer;
                            font-size:0.78rem;font-weight:600;font-family:'DM Sans',sans-serif;
                            transition:all 0.18s;
                            background:${i===0?bg:'transparent'};
                            color:${i===0?'var(--theme-primary,#a855f7)':muted};
                            border:${i===0?'1px solid rgba(168,85,247,0.2)':'1px solid transparent'};">
                        ${labels[tab]}
                    </button>`;
                }).join('')}
            </div>

            <div id="friends-content">
                <div style="text-align:center;padding:2rem;color:${muted};">
                    <div style="font-size:2rem;margin-bottom:0.5rem;opacity:0.4;">⏳</div>
                    <p style="font-size:0.8rem;">Carregando...</p>
                </div>
            </div>

        </div>`;
    },

    async renderFriendsList() {
        const uid = NyanAuth.getUID();
        const d   = document.body.classList.contains('dark-theme');
        const bg  = d ? 'rgba(255,255,255,0.04)' : '#ffffff';
        const bdr = d ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
        const text= d ? '#f1f5f9' : '#0f172a';
        const sub = d ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
        const muted=d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';

        const { query, collection, where, getDocs } = NyanFirebase.fn;
        const fsSnap = await getDocs(
            query(collection(NyanFirebase.db, 'friendships'), where('users', 'array-contains', uid))
        );
        const friendUIDs = fsSnap.docs.map(d => {
            const users = d.data().users || [];
            return users.find(u => u !== uid);
        }).filter(Boolean);

        if (friendUIDs.length === 0) {
            return `
            <div style="text-align:center;padding:3rem 1rem;color:${muted};">
                <div style="font-size:3rem;margin-bottom:0.75rem;opacity:0.35;">👥</div>
                <div style="font-size:0.9rem;font-weight:700;color:${sub};margin-bottom:0.375rem;">Nenhum amigo ainda</div>
                <p style="font-size:0.75rem;">Adicione pelo NyanTag acima! にゃん~</p>
            </div>`;
        }

        const friends = await Promise.all(
            friendUIDs.map(fuid => NyanFirebase.getDoc(`users/${fuid}`))
        );

        const validFriends = friends.filter(Boolean);
        setTimeout(() => this._subscribePresence(validFriends.map(f => f.uid)), 50);
        return validFriends.map(f => this._renderFriendCard(f, bg, bdr, text, sub, muted, d)).join('');
    },

    _presenceUnsubs: [],

    _subscribePresence(uids) {
        this._presenceUnsubs.forEach(u => u && u());
        this._presenceUnsubs = [];

        if (!NyanFirebase.rtdb || !NyanFirebase.fn.onValue) return;
        const { ref, onValue } = NyanFirebase.fn;
        const statusColor = { online:'#4ade80', playing:'#a855f7', away:'#fbbf24', offline:'#9ca3af' };
        const statusLabel = { online:'Online', playing:'Jogando', away:'Ausente', offline:'Offline' };

        uids.forEach(uid => {
            if (!uid) return;
            const presRef = ref(NyanFirebase.rtdb, `presence/${uid}`);
            const unsub = onValue(presRef, (snap) => {
                const data  = snap.val();
                const isOn  = data?.online === true;
                const key   = isOn ? (data?.status || 'online') : 'offline';
                const color = statusColor[key] || statusColor.offline;

                const el = document.getElementById(`fstatus-${uid}`);
                if (el) { el.textContent = `● ${statusLabel[key] || 'Offline'}`; el.style.color = color; }

                const dot = document.getElementById(`fdot-${uid}`);
                if (dot) dot.style.background = color;

                const av = document.getElementById(`favatar-${uid}`);
                if (av) {
                    av.style.border    = `2px solid ${color}22`;
                    av.style.boxShadow = `0 0 0 2px ${color}44`;
                }
            });
            this._presenceUnsubs.push(unsub);
        });
    },

    _renderFriendCard(f, bg, bdr, text, sub, muted, d) {
        const statusColor = { online:'#4ade80', playing:'#a855f7', away:'#fbbf24', offline:'#9ca3af' };
        const statusLabel = { online:'Online', playing:'Jogando', away:'Ausente', offline:'Offline' };
        const status      = f.status || 'offline';
        const color       = statusColor[status] || statusColor.offline;

        return `
        <div style="background:${bg};border:1px solid ${bdr};border-radius:14px;
            padding:0.875rem 1rem;margin-bottom:0.5rem;
            display:flex;align-items:center;gap:0.875rem;
            transition:box-shadow 0.2s;"
            onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'"
            onmouseout="this.style.boxShadow=''">

            <div id="favatar-${f.uid}" style="width:44px;height:44px;border-radius:12px;overflow:hidden;flex-shrink:0;
                border:2px solid ${color}22;box-shadow:0 0 0 2px ${color}44;position:relative;">
                ${f.avatar
                    ? `<img src="${f.avatar}" style="width:100%;height:100%;object-fit:cover;"/>`
                    : (window.AvatarGenerator
                        ? AvatarGenerator.generate(f.username || 'nyan', 44)
                        : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#7c3aed,#ec4899);display:flex;align-items:center;justify-content:center;color:white;font-weight:800;">${(f.username||'N').charAt(0).toUpperCase()}</div>`)
                }
                <div id="fdot-${f.uid}" style="position:absolute;bottom:1px;right:1px;width:10px;height:10px;
                    border-radius:50%;background:${color};border:2px solid ${bg};"></div>
            </div>

            <div style="flex:1;min-width:0;">
                <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.2rem;">
                    <span style="font-size:0.875rem;font-weight:700;color:${text};font-family:'Syne',sans-serif;">
                        ${f.username || 'Usuário'}
                    </span>
                    <span id="fstatus-${f.uid}" style="font-size:0.62rem;color:${color};font-weight:700;">● ${statusLabel[status]}</span>
                </div>
                <div style="font-size:0.72rem;color:${muted};">${f.nyanTag || ''}</div>
                ${f.bio ? `<div style="font-size:0.72rem;color:${sub};font-style:italic;margin-top:2px;">"${f.bio}"</div>` : ''}
            </div>

            <div style="text-align:right;flex-shrink:0;">
                <div style="font-size:0.65rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:${muted};margin-bottom:0.25rem;">Nível</div>
                <div style="font-size:1.1rem;font-weight:900;font-family:'Syne',sans-serif;color:var(--theme-primary,#a855f7);">${f.level || 1}</div>
                <div style="display:flex;gap:0.375rem;margin-top:0.375rem;">
                    <button onclick="Friends.viewProfile('${f.uid}')"
                            style="padding:4px 10px;border-radius:7px;border:none;cursor:pointer;
                                font-size:0.68rem;font-weight:700;
                                background:rgba(168,85,247,0.12);color:rgba(168,85,247,0.9);
                                font-family:'DM Sans',sans-serif;">
                        Ver perfil
                    </button>
                    <button onclick="Friends.openChat('${f.uid}','${f.nyanTag}')"
                            style="padding:4px 10px;border-radius:7px;border:none;cursor:pointer;
                                font-size:0.68rem;font-weight:700;
                                background:rgba(74,222,128,0.12);color:rgba(74,222,128,0.9);
                                font-family:'DM Sans',sans-serif;">
                        💬
                    </button>
                </div>
            </div>
        </div>`;
    },

    async renderRequests() {
        const uid  = NyanAuth.getUID();
        const d    = document.body.classList.contains('dark-theme');
        const bg   = d ? 'rgba(255,255,255,0.04)' : '#ffffff';
        const bdr  = d ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
        const text = d ? '#f1f5f9' : '#0f172a';
        const sub  = d ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
        const muted= d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';

        const { getDocs, collection } = NyanFirebase.fn;
        const snap = await getDocs(collection(NyanFirebase.db, `requests/${uid}/inbox`));
        const requests = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        if (requests.length === 0) {
            return `
            <div style="text-align:center;padding:3rem 1rem;color:${muted};">
                <div style="font-size:3rem;margin-bottom:0.75rem;opacity:0.35;">🔔</div>
                <div style="font-size:0.9rem;font-weight:700;color:${sub};">Nenhuma solicitação pendente</div>
            </div>`;
        }

        return requests.map(req => `
        <div style="background:${bg};border:1px solid ${bdr};border-radius:14px;
            padding:0.875rem 1rem;margin-bottom:0.5rem;
            display:flex;align-items:center;gap:0.875rem;">
            <div style="flex:1;">
                <div style="font-size:0.875rem;font-weight:700;color:${text};">${req.fromTag}</div>
                <div style="font-size:0.72rem;color:${muted};margin-top:2px;">
                    Quer ser seu amigo にゃん~
                </div>
            </div>
            <div style="display:flex;gap:0.5rem;">
                <button onclick="Friends.acceptRequest('${req.from}','${req.fromTag}','${req.id}')"
                        style="padding:6px 14px;border-radius:8px;border:none;cursor:pointer;
                            font-size:0.78rem;font-weight:700;
                            background:rgba(74,222,128,0.15);color:#4ade80;
                            border:1px solid rgba(74,222,128,0.3);
                            font-family:'DM Sans',sans-serif;">
                    ✓ Aceitar
                </button>
                <button onclick="Friends.declineRequest('${req.from}','${req.id}')"
                        style="padding:6px 14px;border-radius:8px;border:none;cursor:pointer;
                            font-size:0.78rem;font-weight:700;
                            background:rgba(239,68,68,0.1);color:#f87171;
                            border:1px solid rgba(239,68,68,0.25);
                            font-family:'DM Sans',sans-serif;">
                    ✕
                </button>
            </div>
        </div>`).join('');
    },

    async renderOnline() {
        const uid = NyanAuth.getUID();
        const d   = document.body.classList.contains('dark-theme');
        const muted=d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';
        const sub = d ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';

        const { query: q2, collection: col2, where: w2, getDocs: gd2 } = NyanFirebase.fn;
        const fsSnap2 = await gd2(
            q2(col2(NyanFirebase.db, 'friendships'), w2('users', 'array-contains', uid))
        );
        const friendUIDs = fsSnap2.docs.map(d => {
            const users = d.data().users || [];
            return users.find(u => u !== uid);
        }).filter(Boolean);

        if (friendUIDs.length === 0) {
            return `<div style="text-align:center;padding:3rem;color:${muted};">
                <div style="font-size:2rem;opacity:0.35;margin-bottom:0.5rem;">🟢</div>
                <p style="font-size:0.8rem;">Adicione amigos para ver quem está online</p>
            </div>`;
        }

        const onlineUIDs = await Promise.all(friendUIDs.map(async (fuid) => {
            if (!NyanFirebase.rtdb) {
                const p = await NyanFirebase.getDoc(`users/${fuid}`);
                return p?.status !== 'offline' ? fuid : null;
            }
            return new Promise((resolve) => {
                const { ref, get } = NyanFirebase.fn;
                get(ref(NyanFirebase.rtdb, `presence/${fuid}`)).then(snap => {
                    const data = snap.val();
                    resolve(data?.online === true ? fuid : null);
                }).catch(() => resolve(null));
            });
        }));

        const onlineFriendUIDs = onlineUIDs.filter(Boolean);

        if (onlineFriendUIDs.length === 0) {
            return `<div style="text-align:center;padding:3rem;color:${muted};">
                <div style="font-size:2rem;opacity:0.35;margin-bottom:0.5rem;">😴</div>
                <p style="font-size:0.8rem;color:${sub};">Nenhum amigo online agora</p>
            </div>`;
        }

        const profiles = await Promise.all(onlineFriendUIDs.map(fuid => NyanFirebase.getDoc(`users/${fuid}`)));
        const online   = profiles.filter(Boolean);

        const bg  = d ? 'rgba(255,255,255,0.04)' : '#ffffff';
        const bdr = d ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
        const text= d ? '#f1f5f9' : '#0f172a';
        setTimeout(() => this._subscribePresence(onlineFriendUIDs), 50);
        return online.map(f => this._renderFriendCard(f, bg, bdr, text, sub, muted, d)).join('');
    },

    async sendRequest() {
        const input  = document.getElementById('friend-tag-input');
        const status = document.getElementById('friend-add-status');
        const tag    = (input?.value || '').trim();

        if (!tag.includes('#')) {
            status.style.color = '#ef4444';
            status.textContent = '⚠️ Formato inválido. Use: nome#1234';
            return;
        }

        status.style.color = 'inherit';
        status.textContent = '⏳ Buscando usuário...';

        const targetUser = await NyanAuth.findByTag(tag);
        if (!targetUser) {
            status.style.color = '#ef4444';
            status.textContent = `❌ Usuário "${tag}" não encontrado`;
            return;
        }

        const myUID = NyanAuth.getUID();
        if (targetUser.uid === myUID) {
            status.style.color = '#ef4444';
            status.textContent = '😅 Você não pode se adicionar';
            return;
        }

        const myProfile = await NyanFirebase.getDoc(`users/${myUID}`);
        if (myProfile?.friends?.includes(targetUser.uid)) {
            status.style.color = '#f59e0b';
            status.textContent = '✨ Vocês já são amigos!';
            return;
        }

        const requestData = {
            from:       myUID,
            fromTag:    NyanAuth.getNyanTag(),
            sentAt:     Date.now(),
        };

        try {
            await NyanFirebase.fn.addDoc(
                NyanFirebase.fn.collection(NyanFirebase.db, `requests/${targetUser.uid}/inbox`),
                requestData
            );
            status.style.color = '#4ade80';
            status.textContent = `✅ Solicitação enviada para ${tag}!`;
            if (input) input.value = '';
        } catch (err) {
            status.style.color = '#ef4444';
            status.textContent = `❌ Erro: ${err.message}`;
        }
    },

    async sendRequestToUser(targetUID, targetTag = '', targetName = '') {
        const myUID = NyanAuth.getUID();
        if (!myUID || !targetUID) return;
        if (targetUID === myUID) {
            Utils.showNotification?.('Você não pode se adicionar', 'warning');
            return;
        }

        const rel = await this._getRelationshipState(targetUID, myUID);
        if (rel.state === 'friend') {
            Utils.showNotification?.('Vocês já são amigos', 'info');
            return;
        }
        if (rel.state === 'outgoing') {
            Utils.showNotification?.('Solicitação já enviada para essa pessoa', 'info');
            return;
        }
        if (rel.state === 'incoming') {
            Utils.showNotification?.('Essa pessoa já te enviou uma solicitação', 'info');
            return;
        }

        const requestData = {
            from: myUID,
            fromTag: NyanAuth.getNyanTag(),
            sentAt: Date.now(),
        };

        await NyanFirebase.fn.addDoc(
            NyanFirebase.fn.collection(NyanFirebase.db, `requests/${targetUID}/inbox`),
            requestData
        );

        Utils.showNotification?.(`✅ Solicitação enviada para ${targetTag || targetName || 'jogador'}`, 'success');
        if (Router?.currentRoute === 'profile-public' && window._viewingProfile === targetUID) {
            setTimeout(() => this._loadPublicProfile(), 120);
        }
    },

    async _getRelationshipState(targetUID, myUID = NyanAuth.getUID()) {
        if (!myUID || !targetUID) return { state: 'none' };
        if (myUID === targetUID) return { state: 'self' };

        try {
            const fsSnap = await NyanFirebase.fn.getDocs(
                NyanFirebase.fn.query(
                    NyanFirebase.fn.collection(NyanFirebase.db, 'friendships'),
                    NyanFirebase.fn.where('users', 'array-contains', myUID)
                )
            );
            const isFriend = fsSnap.docs.some(d => (d.data().users || []).includes(targetUID));
            if (isFriend) return { state: 'friend' };
        } catch (_) {}

        let incomingDocId = null;
        try {
            const incoming = await NyanFirebase.fn.getDocs(
                NyanFirebase.fn.query(
                    NyanFirebase.fn.collection(NyanFirebase.db, `requests/${myUID}/inbox`),
                    NyanFirebase.fn.where('from', '==', targetUID)
                )
            );
            if (!incoming.empty) incomingDocId = incoming.docs[0].id;
        } catch (_) {}
        if (incomingDocId) return { state: 'incoming', requestDocId: incomingDocId };

        try {
            const outgoing = await NyanFirebase.fn.getDocs(
                NyanFirebase.fn.query(
                    NyanFirebase.fn.collection(NyanFirebase.db, `requests/${targetUID}/inbox`),
                    NyanFirebase.fn.where('from', '==', myUID)
                )
            );
            if (!outgoing.empty) return { state: 'outgoing' };
        } catch (_) {}

        return { state: 'none' };
    },

    async acceptRequest(fromUID, fromTag, requestDocId) {
        const myUID  = NyanAuth.getUID();
        const [a, b] = [myUID, fromUID].sort();
        const fsId   = `${a}_${b}`;

        await NyanFirebase.setDoc(`friendships/${fsId}`, {
            users:     [a, b],
            createdAt: NyanFirebase.fn.serverTimestamp()
        });

        await NyanFirebase.updateDoc(`users/${myUID}`, {
            friends: NyanFirebase.fn.arrayUnion(fromUID)
        });

        await NyanFirebase.fn.addDoc(
            NyanFirebase.fn.collection(NyanFirebase.db, `requests/${fromUID}/accepted`),
            { by: myUID, byTag: NyanAuth.getNyanTag(), at: Date.now() }
        );

        if (requestDocId) {
            await NyanFirebase.fn.deleteDoc(
                NyanFirebase.fn.doc(NyanFirebase.db, `requests/${myUID}/inbox/${requestDocId}`)
            );
        }

        Utils.showNotification(`✅ Agora você e ${fromTag} são amigos! にゃん~`, 'success');
        if (Router?.currentRoute === 'profile-public') {
            setTimeout(() => this._loadPublicProfile(), 120);
        } else {
            this.switchTab('list');
        }

        await this._processPendingAccepted();
    },

    async _processPendingAccepted() {
        const myUID = NyanAuth.getUID();
        if (!myUID || !NyanFirebase.isReady()) return;
        const { getDocs, collection, deleteDoc, doc } = NyanFirebase.fn;

        try {
            const acceptSnap = await getDocs(collection(NyanFirebase.db, `requests/${myUID}/accepted`));
            for (const d of acceptSnap.docs) {
                const data = d.data();
                await NyanFirebase.updateDoc(`users/${myUID}`, {
                    friends: NyanFirebase.fn.arrayUnion(data.by)
                });
                await deleteDoc(doc(NyanFirebase.db, `requests/${myUID}/accepted/${d.id}`));
            }

            const removedSnap = await getDocs(collection(NyanFirebase.db, `requests/${myUID}/removed`));
            for (const d of removedSnap.docs) {
                const data = d.data();
                await NyanFirebase.updateDoc(`users/${myUID}`, {
                    friends: NyanFirebase.fn.arrayRemove(data.by)
                });
                await deleteDoc(doc(NyanFirebase.db, `requests/${myUID}/removed/${d.id}`));
            }
        } catch (e) {
        }
    },

    async declineRequest(fromUID, requestDocId) {
        const myUID = NyanAuth.getUID();
        if (requestDocId) {
            await NyanFirebase.fn.deleteDoc(
                NyanFirebase.fn.doc(NyanFirebase.db, `requests/${myUID}/inbox/${requestDocId}`)
            );
        }
        if (Router?.currentRoute === 'profile-public') {
            setTimeout(() => this._loadPublicProfile(), 120);
            return;
        }
        this.switchTab('requests');
    },

    async removeFriend(friendUID) {
        const myUID  = NyanAuth.getUID();
        const [a, b] = [myUID, friendUID].sort();

        await NyanFirebase.fn.deleteDoc(NyanFirebase.docRef(`friendships/${a}_${b}`));
        await NyanFirebase.updateDoc(`users/${myUID}`, {
            friends: NyanFirebase.fn.arrayRemove(friendUID)
        });

        await NyanFirebase.fn.addDoc(
            NyanFirebase.fn.collection(NyanFirebase.db, `requests/${friendUID}/removed`),
            { by: myUID, at: Date.now() }
        ).catch(() => {}); // silencioso se não tiver permissão ainda

        Utils.showNotification('Amigo removido', 'info');
        this.switchTab('list');
    },

    async switchTab(tab) {
        if (tab !== 'list') {
            this._presenceUnsubs.forEach(u => u && u());
            this._presenceUnsubs = [];
        }
        ['list','requests','online'].forEach(t => {
            const btn = document.getElementById(`ftab-${t}`);
            if (!btn) return;
            const active = t === tab;
            const d = document.body.classList.contains('dark-theme');
            btn.style.background = active ? (d?'rgba(255,255,255,0.04)':'#ffffff') : 'transparent';
            btn.style.color = active ? 'var(--theme-primary,#a855f7)' : (d?'rgba(255,255,255,0.25)':'rgba(0,0,0,0.3)');
            btn.style.border = active ? '1px solid rgba(168,85,247,0.2)' : '1px solid transparent';
        });

        const content = document.getElementById('friends-content');
        if (!content) return;

        const renderers = {
            list:     () => this.renderFriendsList(),
            requests: () => this.renderRequests(),
            online:   () => this.renderOnline(),
        };

        content.innerHTML = `<div style="text-align:center;padding:2rem;opacity:0.4;font-size:0.8rem;">Carregando...</div>`;
        content.innerHTML = await (renderers[tab] || renderers.list)();
    },

    _renderPublicProfile() {
        const d = document.body.classList.contains('dark-theme');
        const cardBg  = d ? '#0e0e18' : '#ffffff';
        const cardBdr = d ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
        const muted   = d ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.32)';
        const shimA   = d ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
        const shimB   = d ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)';
        const avBdr   = d ? '#0e0e18' : '#fff';

        return `
        <style>
        #nyan-pp-wrap * { box-sizing:border-box; }
        @keyframes nyanShimmer { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes nyanStarFloat { 0%,100%{transform:translateY(0) rotate(0deg);opacity:.6} 50%{transform:translateY(-8px) rotate(180deg);opacity:1} }
        @keyframes nyanPulseRing { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(1.55);opacity:0} }
        @keyframes nyanSlideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes nyanFadeIn { from{opacity:0} to{opacity:1} }
        @keyframes nyanSparkle { 0%,100%{opacity:0;transform:scale(0) rotate(0deg)} 50%{opacity:1;transform:scale(1) rotate(180deg)} }
        @keyframes nyanBarFill { from{width:0%} }

        #nyan-pp-wrap { max-width:520px; margin:0 auto; font-family:'DM Sans',sans-serif; }

        #nyan-pp-back { display:inline-flex;align-items:center;gap:0.3rem;background:none;border:none;cursor:pointer;color:${muted};font-size:0.8rem;font-weight:700;font-family:'DM Sans',sans-serif;padding:0;margin-bottom:0.75rem;transition:color .18s,transform .18s; }
        #nyan-pp-back:hover { color:var(--theme-primary,#a855f7); transform:translateX(-2px); }

        #nyan-pp-banner { width:100%;height:130px;border-radius:20px 20px 0 0;background:linear-gradient(135deg,var(--theme-gradient-start,#a855f7),var(--theme-gradient-middle,#ec4899),var(--theme-gradient-end,#ef4444),var(--theme-gradient-start,#a855f7));background-size:300% 300%;animation:nyanShimmer 6s ease infinite;position:relative;overflow:hidden; }
        .nyan-banner-star { position:absolute;animation:nyanStarFloat var(--dur,3s) ease-in-out infinite var(--delay,0s);opacity:.55;pointer-events:none;user-select:none;color:#fff; }

        #nyan-pp-version-badge { position:absolute;top:10px;right:12px;display:none;align-items:center;gap:0.3rem;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.22);border-radius:999px;padding:0.2rem 0.65rem;font-size:0.62rem;font-weight:700;color:#fff;letter-spacing:0.04em;cursor:help; }

        #nyan-pp-card { background:${cardBg};border:1px solid ${cardBdr};border-top:none;border-radius:0 0 22px 22px;padding:0 1.5rem 1.5rem; }

        #nyan-pp-avatar-wrap { position:relative;width:96px;height:96px;margin:-48px auto 0; }
        #nyan-pp-avatar-img-shell { width:96px;height:96px;border-radius:50%;overflow:hidden;position:relative;z-index:2; }
        #nyan-pp-statusdot { position:absolute;bottom:4px;right:4px;width:16px;height:16px;border-radius:50%;border:2.5px solid ${avBdr};z-index:3; }
        .nyan-sparkle { position:absolute;font-size:0.75rem;animation:nyanSparkle var(--dur,2s) ease-in-out infinite var(--delay,0s);pointer-events:none;z-index:4;color:#fff; }

        #nyan-pp-name { font-family:'Syne',sans-serif;font-size:1.55rem;font-weight:900;color:${d?'#f1f5f9':'#0f172a'};text-align:center;margin:0.75rem 0 0.15rem;letter-spacing:-0.01em;animation:nyanSlideUp .4s ease both .05s; }
        #nyan-pp-tag-row { display:flex;align-items:center;justify-content:center;gap:0.35rem;margin-bottom:0.4rem;animation:nyanSlideUp .4s ease both .1s; }
        .nyan-pp-tag { font-size:0.72rem;color:var(--theme-primary,#a855f7);font-weight:700; }
        #nyan-pp-status-pill { display:inline-flex;align-items:center;gap:0.28rem;border-radius:999px;padding:0.2rem 0.65rem;font-size:0.63rem;font-weight:700;letter-spacing:0.04em;animation:nyanSlideUp .4s ease both .14s; }
        .nyan-pp-bio { font-size:0.78rem;font-style:italic;text-align:center;line-height:1.55;padding:0 1rem;margin-bottom:0.6rem;opacity:.62;animation:nyanSlideUp .4s ease both .18s; }
        .nyan-pp-title-wrap {
            display:flex;
            flex-direction:column;
            align-items:center;
            gap:0.22rem;
            margin:0 auto 0.48rem;
            animation:nyanSlideUp .4s ease both .08s;
        }
        .nyan-pp-title-label {
            display:inline-flex;
            align-items:center;
            padding:0.14rem 0.46rem;
            border-radius:999px;
            font-size:0.53rem;
            font-weight:900;
            letter-spacing:0.08em;
            text-transform:uppercase;
            color:${d ? 'rgba(255,255,255,0.54)' : 'rgba(15,23,42,0.52)'};
            background:${d ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.04)'};
            border:1px solid ${d ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)'};
        }
        .nyan-pp-title-chip {
            display:inline-flex;
            align-items:center;
            gap:0.34rem;
            padding:0.28rem 0.72rem;
            border-radius:999px;
            font-size:0.72rem;
            font-weight:800;
            line-height:1.1;
            color:${d ? 'rgba(255,255,255,0.9)' : '#4c1d95'};
            background:${d ? 'rgba(168,85,247,0.16)' : 'rgba(168,85,247,0.1)'};
            border:1px solid ${d ? 'rgba(168,85,247,0.3)' : 'rgba(168,85,247,0.24)'};
            box-shadow:${d ? '0 10px 22px rgba(88,28,135,0.18)' : '0 8px 18px rgba(168,85,247,0.12)'};
        }
        .nyan-pp-badges-shell {
            width:min(100%, 456px);
            margin:0 auto 1rem;
            padding:0.8rem 0.84rem 0.88rem;
            border-radius:18px;
            border:1px solid ${d ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)'};
            background:${d ? 'linear-gradient(180deg,rgba(15,23,42,0.82),rgba(17,24,39,0.56))' : 'linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,244,255,0.94))'};
            box-shadow:${d ? '0 18px 42px rgba(2,6,23,0.34)' : '0 16px 32px rgba(100,116,139,0.16)'};
            animation:nyanSlideUp .45s ease both .16s;
            position:relative;
            overflow:hidden;
        }
        .nyan-pp-badges-shell::before {
            content:'';
            position:absolute;
            inset:auto -12% 62% auto;
            width:140px;
            height:140px;
            background:${d ? 'radial-gradient(circle, rgba(168,85,247,0.2), transparent 68%)' : 'radial-gradient(circle, rgba(236,72,153,0.15), transparent 68%)'};
            pointer-events:none;
        }
        .nyan-pp-badges-head {
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:0.6rem;
            margin-bottom:0.7rem;
            position:relative;
            z-index:1;
        }
        .nyan-pp-badges-title {
            font-size:0.64rem;
            font-weight:900;
            letter-spacing:0.08em;
            text-transform:uppercase;
            color:${d ? 'rgba(255,255,255,0.82)' : 'rgba(15,23,42,0.74)'};
        }
        .nyan-pp-badges-count {
            font-size:0.62rem;
            font-weight:700;
            color:${d ? 'rgba(255,255,255,0.46)' : 'rgba(15,23,42,0.5)'};
        }
        .nyan-pp-badges-rail {
            display:flex;
            gap:0.56rem;
            overflow-x:auto;
            padding:0.12rem 0.04rem 0.38rem;
            position:relative;
            z-index:1;
            scrollbar-width:thin;
            scrollbar-color:${d ? 'rgba(168,85,247,0.4) rgba(255,255,255,0.06)' : 'rgba(168,85,247,0.35) rgba(15,23,42,0.06)'};
        }
        .nyan-pp-badges-rail::-webkit-scrollbar {
            height:6px;
        }
        .nyan-pp-badges-rail::-webkit-scrollbar-track {
            background:${d ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.06)'};
            border-radius:999px;
        }
        .nyan-pp-badges-rail::-webkit-scrollbar-thumb {
            background:${d ? 'rgba(168,85,247,0.42)' : 'rgba(168,85,247,0.32)'};
            border-radius:999px;
        }
        .nyan-pp-badge-medal {
            position:relative;
            flex:0 0 auto;
            width:58px;
            height:58px;
            display:inline-flex;
            align-items:center;
            justify-content:center;
            border-radius:17px;
            color:var(--badge-color, ${d ? '#f1f5f9' : '#0f172a'});
            background:var(--badge-bg, ${d ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)'});
            border:1px solid var(--badge-border, ${d ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)'});
            transition:transform .16s ease, box-shadow .18s ease, border-color .18s ease;
            transform:translateY(0);
        }
        .nyan-pp-badge-medal::after {
            content:'';
            position:absolute;
            inset:4px;
            border-radius:13px;
            border:1px solid ${d ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.7)'};
            pointer-events:none;
        }
        .nyan-pp-badge-medal:hover {
            transform:translateY(-3px) scale(1.04);
            box-shadow:0 16px 28px ${d ? 'rgba(2,6,23,0.38)' : 'rgba(15,23,42,0.12)'};
        }
        .nyan-pp-badge-medal.active {
            border-color:var(--badge-border, ${d ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.14)'});
            box-shadow:0 0 0 1px var(--badge-border, transparent), 0 0 0 4px ${d ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.7)'}, 0 16px 30px ${d ? 'rgba(2,6,23,0.42)' : 'rgba(15,23,42,0.12)'}, 0 0 22px var(--badge-glow, transparent);
        }
        .nyan-pp-badge-icon {
            font-size:1.45rem;
            line-height:1;
            filter:drop-shadow(0 4px 8px ${d ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.36)'});
        }
        .nyan-pp-badge-focus {
            display:flex;
            align-items:center;
            gap:0.72rem;
            margin-top:0.26rem;
            padding:0.6rem 0.68rem;
            border-radius:15px;
            border:1px solid var(--focus-border, ${d ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'});
            background:var(--focus-bg, ${d ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)'});
            position:relative;
            z-index:1;
        }
        .nyan-pp-badge-focus-icon {
            width:40px;
            height:40px;
            flex:0 0 auto;
            display:inline-flex;
            align-items:center;
            justify-content:center;
            border-radius:13px;
            font-size:1.12rem;
            color:var(--focus-text, ${d ? '#f1f5f9' : '#0f172a'});
            background:${d ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.82)'};
            box-shadow:inset 0 1px 0 ${d ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.85)'};
        }
        .nyan-pp-badge-focus-copy {
            min-width:0;
            text-align:left;
        }
        .nyan-pp-badge-focus-label {
            font-size:0.54rem;
            font-weight:900;
            letter-spacing:0.08em;
            text-transform:uppercase;
            color:${d ? 'rgba(255,255,255,0.46)' : 'rgba(15,23,42,0.48)'};
            margin-bottom:0.14rem;
        }
        .nyan-pp-badge-focus-name {
            font-size:0.83rem;
            font-weight:800;
            color:${d ? '#f8fafc' : '#111827'};
            margin-bottom:0.18rem;
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
        }
        .nyan-pp-badge-focus-meta {
            display:flex;
            align-items:center;
            gap:0.36rem;
            flex-wrap:wrap;
            font-size:0.62rem;
            color:${d ? 'rgba(255,255,255,0.58)' : 'rgba(15,23,42,0.56)'};
        }
        .nyan-pp-badge-focus-pill {
            display:inline-flex;
            align-items:center;
            padding:0.14rem 0.42rem;
            border-radius:999px;
            font-weight:800;
            color:var(--focus-text, ${d ? '#f1f5f9' : '#0f172a'});
            background:${d ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.72)'};
            border:1px solid var(--focus-border, ${d ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'});
        }
        .nyan-pp-chip-icon {
            font-size:0.72rem;
            line-height:1;
        }
        .nyan-pp-chip-name {
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
            max-width:220px;
        }
        @media (max-width:560px) {
            .nyan-pp-badges-shell { width:100%; }
            .nyan-pp-badges-head { align-items:flex-start; flex-direction:column; gap:0.22rem; }
            .nyan-pp-badge-focus { align-items:flex-start; }
            .nyan-pp-chip-name { max-width:170px; }
        }

        .nyan-pp-stats-row { display:flex;gap:0.5rem;justify-content:center;flex-wrap:wrap;margin:0.9rem 0 1.2rem;animation:nyanSlideUp .4s ease both .22s; }
        .nyan-pp-stat-pill { background:${d?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)'};border:1px solid ${cardBdr};border-radius:14px;padding:0.5rem 0.9rem;text-align:center;min-width:68px;transition:transform .18s;cursor:default; }
        .nyan-pp-stat-pill:hover { transform:translateY(-2px); }
        .nyan-pp-stat-pill.accent { background:rgba(168,85,247,0.12);border-color:rgba(168,85,247,0.25); }
        .nyan-pp-stat-label { font-size:0.52rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:${muted};margin-bottom:0.2rem; }
        .nyan-pp-stat-val { font-size:1rem;font-weight:900;font-family:'Syne',sans-serif;color:var(--theme-primary,#a855f7);line-height:1; }
        .nyan-pp-stat-val.sub { font-size:0.7rem;color:${d?'rgba(255,255,255,0.52)':'rgba(0,0,0,0.52)'};font-family:'DM Sans',sans-serif;font-weight:700; }

        .nyan-pp-section { background:${d?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.025)'};border:1px solid ${cardBdr};border-radius:16px;padding:0.9rem;margin-bottom:0.7rem;animation:nyanFadeIn .45s ease both .28s; }
        .nyan-pp-section-title { font-size:0.58rem;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:${muted};margin-bottom:0.65rem;display:flex;align-items:center;justify-content:space-between; }
        .nyan-pp-section-title span { font-size:0.58rem;font-weight:600;color:${d?'rgba(255,255,255,0.18)':'rgba(0,0,0,0.22)'}; }

        .nyan-pp-record-row { display:flex;align-items:center;justify-content:space-between;padding:0.42rem 4px;border-bottom:1px solid ${d?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)'};font-size:0.77rem;transition:background .12s;border-radius:6px; }
        .nyan-pp-record-row:last-child { border-bottom:none; }
        .nyan-pp-record-row:hover { background:${d?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)'}; }
        .nyan-pp-record-label { color:${d?'rgba(255,255,255,0.58)':'rgba(0,0,0,0.55)'}; }
        .nyan-pp-record-val { font-weight:800;color:var(--theme-primary,#a855f7);font-family:'Syne',sans-serif;font-size:0.8rem; }
        .nyan-pp-bar-wrap { height:3px;background:${d?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.07)'};border-radius:99px;margin-top:3px;overflow:hidden; }
        .nyan-pp-bar-fill { height:100%;border-radius:99px;background:linear-gradient(90deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));animation:nyanBarFill .8s ease both .4s; }

        .nyan-pp-ach-row { display:flex;align-items:center;justify-content:space-between;padding:0.4rem 0;border-bottom:1px solid ${d?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)'};gap:0.5rem; }
        .nyan-pp-ach-row:last-child { border-bottom:none; }
        .nyan-pp-ach-name { font-size:0.75rem;font-weight:600;color:${d?'#f1f5f9':'#0f172a'}; }
        .nyan-pp-ach-date { font-size:0.6rem;color:${muted};white-space:nowrap; }

        .nyan-pp-actions { display:flex;gap:0.5rem;justify-content:center;flex-wrap:wrap;margin-top:0.9rem;animation:nyanSlideUp .45s ease both .32s; }
        .nyan-pp-btn { padding:0.52rem 1rem;border-radius:12px;border:none;cursor:pointer;font-size:0.77rem;font-weight:700;font-family:'DM Sans',sans-serif;transition:transform .14s,filter .14s; }
        .nyan-pp-btn:hover  { transform:translateY(-2px);filter:brightness(1.1); }
        .nyan-pp-btn:active { transform:scale(0.95);filter:brightness(0.92); }
        .nyan-pp-btn.primary { background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));color:#fff; }
        .nyan-pp-btn.danger  { background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);color:#f87171; }
        .nyan-pp-btn.golden  { background:rgba(251,191,36,0.12);border:1px solid rgba(251,191,36,0.22);color:#fbbf24; }
        .nyan-pp-btn.teal    { background:rgba(16,185,129,0.11);border:1px solid rgba(16,185,129,0.2);color:#34d399; }

        .nyan-pp-shimmer { background:linear-gradient(90deg,${shimA} 0%,${shimB} 50%,${shimA} 100%);background-size:200% 100%;animation:nyanShimmer 1.4s ease infinite;border-radius:8px; }
        </style>

        <div id="nyan-pp-wrap">
            <button onclick="Router.back()" id="nyan-pp-back" title="Voltar (Esc)">← Voltar</button>
            <div id="nyan-pp-banner">
                <div class="nyan-banner-star" style="top:18%;left:8%;font-size:1rem;--dur:3.2s;--delay:0s;">✦</div>
                <div class="nyan-banner-star" style="top:55%;left:22%;font-size:0.7rem;--dur:2.8s;--delay:0.4s;">★</div>
                <div class="nyan-banner-star" style="top:25%;left:72%;font-size:1rem;--dur:3.6s;--delay:0.8s;">✦</div>
                <div class="nyan-banner-star" style="top:65%;left:85%;font-size:0.6rem;--dur:2.5s;--delay:0.2s;">✧</div>
                <div class="nyan-banner-star" style="top:40%;left:48%;font-size:0.6rem;--dur:4s;--delay:1.2s;">✧</div>
                <div class="nyan-banner-star" style="top:15%;left:55%;font-size:0.65rem;--dur:3s;--delay:0.6s;">★</div>
                <div id="nyan-pp-version-badge"></div>
            </div>
            <div id="nyan-pp-card">
                <div style="position:relative;width:96px;height:96px;margin:-48px auto 0;">
                    <div class="nyan-pp-shimmer" style="width:96px;height:96px;border-radius:50%;border:3.5px solid ${avBdr};"></div>
                </div>
                <div id="public-profile-content" style="margin-top:0.75rem;text-align:center;">
                    <div class="nyan-pp-shimmer" style="height:1.55rem;width:38%;margin:0 auto 0.4rem;"></div>
                    <div class="nyan-pp-shimmer" style="height:0.75rem;width:24%;margin:0 auto 0.5rem;"></div>
                    <div class="nyan-pp-shimmer" style="height:0.7rem;width:55%;margin:0 auto 1rem;border-radius:999px;"></div>
                    <div style="display:flex;gap:0.5rem;justify-content:center;margin-bottom:1rem;">
                        <div class="nyan-pp-shimmer" style="height:52px;width:70px;border-radius:14px;"></div>
                        <div class="nyan-pp-shimmer" style="height:52px;width:88px;border-radius:14px;"></div>
                        <div class="nyan-pp-shimmer" style="height:52px;width:82px;border-radius:14px;"></div>
                    </div>
                    <div class="nyan-pp-shimmer" style="height:118px;border-radius:16px;margin-bottom:0.7rem;"></div>
                    <div class="nyan-pp-shimmer" style="height:98px;border-radius:16px;"></div>
                </div>
            </div>
        </div>`
    },

    GAME_RECORDS: [
        { key: 'typeracer_highscore',   gameId: 'typeracer', fsKey: 'sc_typeracer', label: 'Type Racer',  icon: '⌨️', unit: 'WPM',   higher: true  },
        { key: 'game_2048_highscore',   gameId: '2048',      fsKey: 'sc_2048',      label: '2048',        icon: '🔢', unit: 'pts',   higher: true  },
        { key: 'flappy_bird_highscore', gameId: 'flappy',    fsKey: 'sc_flappy',    label: 'Flappy Nyan', icon: '🐱', unit: 'pts',   higher: true  },
        { key: 'quiz_highscore',        gameId: 'quiz',      fsKey: 'sc_quiz',      label: 'Quiz Diário', icon: '🧠', unit: '/10',   higher: true  },
        { key: 'termo_best',            gameId: 'termo',     fsKey: 'sc_termo',     label: 'Termo',       icon: '🔤', unit: 'tent.', higher: false },
        { key: 'snake_highscore',       gameId: 'snake',     fsKey: 'sc_snake',     label: 'Cobrinha',    icon: '🐍', unit: 'pts',   higher: true  },
    ],

    _getFavoriteGame(scores) {
        if (!scores) return null;
        const maxes = { typeracer_highscore:200, game_2048_highscore:131072,
                        flappy_bird_highscore:100, quiz_highscore:10,
                        termo_best:1, snake_highscore:500 };
        let best = null, bestRatio = -1;
        Friends.GAME_RECORDS.forEach(g => {
            const val = parseFloat(scores[g.key]);
            if (!val) return;
            const max = maxes[g.key] || val;
            const ratio = g.higher ? (val / max) : (1 - val / max);
            if (ratio > bestRatio) { bestRatio = ratio; best = g; }
        });
        return best;
    },

    async _loadPublicProfile() {
        const uid = window._viewingProfile;
        if (!uid) return;

        const profile = await NyanFirebase.getDoc(`users/${uid}`);
        const ppContent = document.getElementById('public-profile-content');
        if (!ppContent || !profile) return;

        const d     = document.body.classList.contains('dark-theme');
        const muted = d ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.32)';
        const sub   = d ? 'rgba(255,255,255,0.5)'  : 'rgba(0,0,0,0.52)';
        const avBdr = d ? '#0e0e18' : '#fff';
        const banner = window.ProfileV2?.getBannerFromProfile?.(profile) || {
            css: 'linear-gradient(135deg,var(--theme-gradient-start,#a855f7),var(--theme-gradient-middle,#ec4899),var(--theme-gradient-end,#ef4444),var(--theme-gradient-start,#a855f7))'
        };

        const avatarHTML = profile.avatar
            ? `<img src="${profile.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"/>`
            : (window.AvatarGenerator
                ? AvatarGenerator.generate(profile.username || 'nyan', 92)
                : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#7c3aed,#ec4899);display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:2.2rem;">${(profile.username||'N')[0].toUpperCase()}</div>`);

        const STATUS_MAP = { online:'Online', playing:'Jogando', away:'Ausente', offline:'Offline' };
        const STATUS_COL = { online:'#4ade80', playing:'#a855f7', away:'#fbbf24', offline:'#9ca3af' };
        let statusLabel = 'Offline', statusColor = '#9ca3af';
        if (NyanFirebase.rtdb && NyanFirebase.fn.get && NyanFirebase.fn.ref) {
            try {
                const snap = await NyanFirebase.fn.get(NyanFirebase.fn.ref(NyanFirebase.rtdb, `presence/${uid}`));
                const data = snap.val();
                if (data?.online) {
                    const s = data.status || 'online';
                    statusLabel = STATUS_MAP[s] || 'Online';
                    statusColor = STATUS_COL[s] || '#4ade80';
                }
            } catch(e) {}
        }

        let memberSince = '';
        if (profile.joinedAt?.seconds) {
            memberSince = new Date(profile.joinedAt.seconds * 1000)
                .toLocaleDateString('pt-BR', { month:'short', year:'numeric' });
        }

        const scoreMap = {};
        Friends.GAME_RECORDS.forEach(g => {
            const val = profile[g.fsKey];
            if (val != null && val > 0) scoreMap[g.key] = val;
        });
        if (Object.keys(scoreMap).length === 0) {
            await Promise.all(Friends.GAME_RECORDS.map(async g => {
                try {
                    const doc = await NyanFirebase.getDoc('leaderboards/' + g.gameId + '/scores/' + uid);
                    if (doc?.score != null) scoreMap[g.key] = doc.score;
                } catch(e) {}
            }));
        }
        const favoriteGame = Friends._getFavoriteGame(scoreMap);

        const myVersion    = window.App?.version || '3.13.3';
        const theirVersion = profile.version || '?';
        let vBadgeEmoji = '', vBadgeText = '', vBadgeTitle = '';
        if (theirVersion !== '?' && myVersion) {
            const myNum    = myVersion.split('.').map(Number).reduce((a,b,i) => a + b * Math.pow(1000, 2-i), 0);
            const theirNum = theirVersion.split('.').map(Number).reduce((a,b,i) => a + b * Math.pow(1000, 2-i), 0);
            if (theirNum === myNum)    { vBadgeEmoji='🟢'; vBadgeText='v'+theirVersion; vBadgeTitle='Versão igual à sua: v'+theirVersion; }
            else if (theirNum < myNum) { vBadgeEmoji='🟡'; vBadgeText='v'+theirVersion; vBadgeTitle='Versão desatualizada: seu amigo usa v'+theirVersion+'; você usa v'+myVersion; }
            else                       { vBadgeEmoji='🔵'; vBadgeText='v'+theirVersion; vBadgeTitle='Versão mais nova: seu amigo usa v'+theirVersion+'; você usa v'+myVersion; }
        }

        const myUID = NyanAuth.getUID();
        const isSelfProfile = !!myUID && uid === myUID;
        const remoteLevel = Math.max(1, Number(profile.level || 1));
        const remoteTotalXP = Math.max(0, Number(profile.totalXP || 0));
        const remoteLevelByXP = (remoteTotalXP > 0 && window.Economy?.calcLevel)
            ? Math.max(1, Number(window.Economy.calcLevel(remoteTotalXP).level || 1))
            : remoteLevel;
        const localEconomy = isSelfProfile ? (window.Economy?.getState?.() || null) : null;
        const localLevel = isSelfProfile ? Math.max(1, Number(localEconomy?.level || 1)) : 1;
        const displayLevel = isSelfProfile
            ? Math.max(remoteLevel, remoteLevelByXP, localLevel)
            : Math.max(remoteLevel, remoteLevelByXP);

        if (isSelfProfile && window.NyanAuth?._syncLocalProfile) {
            const localTotalXP = Math.max(0, Number(localEconomy?.totalXP || 0));
            const economyMismatch = localLevel !== remoteLevel || localTotalXP !== remoteTotalXP;
            const nowSync = Date.now();
            if (economyMismatch && (nowSync - Number(this._lastPublicEconomySyncAt || 0)) > this.PUBLIC_ECON_SYNC_COOLDOWN) {
                this._lastPublicEconomySyncAt = nowSync;
                window.NyanAuth._syncLocalProfile({ includeEconomy: true }).catch(() => {});
            }
        }

        const relationship = await this._getRelationshipState(uid, myUID);

        const SCORE_MAX = { typeracer_highscore:200, game_2048_highscore:131072,
                            flappy_bird_highscore:100, quiz_highscore:10,
                            termo_best:6, snake_highscore:500 };
        const recordsHTML = Friends.GAME_RECORDS.map(g => {
            const val = scoreMap[g.key];
            if (!val) return '';
            const display = parseFloat(val).toLocaleString('pt-BR');
            const max = SCORE_MAX[g.key] || val;
            const pct = g.higher
                ? Math.min(100, Math.round((val / max) * 100))
                : Math.min(100, Math.round(((max - Math.min(val, max)) / max) * 100));
            return `<div class="nyan-pp-record-row">
                <span class="nyan-pp-record-label">${g.icon} ${g.label}</span>
                <div style="text-align:right;">
                    <div class="nyan-pp-record-val">${display} <span style="font-size:0.62rem;font-weight:600;opacity:0.6;">${g.unit}</span></div>
                    <div class="nyan-pp-bar-wrap" style="width:80px;"><div class="nyan-pp-bar-fill" style="width:${pct}%;"></div></div>
                </div>
            </div>`;
        }).filter(Boolean).join('');

        const theirAch = profile.sc_achievements || {};
        let achHTML = '';
        if (Object.keys(theirAch).length > 0) {
            const achMap  = Object.fromEntries((window.Achievements?.list || []).map(a => [a.id, a]));
            const total   = Object.keys(theirAch).length;
            const achItems = Object.entries(theirAch).sort((a,b) => a[1]-b[1]).map(([id, ts]) => {
                const a    = achMap[id];
                const date = new Date(ts).toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'2-digit' });
                return `<div class="nyan-pp-ach-row">
                    <span style="display:flex;align-items:center;gap:0.45rem;">
                        <span>${a?.icon||'🏅'}</span>
                        <span class="nyan-pp-ach-name">${a?.name||id}</span>
                    </span>
                    <span class="nyan-pp-ach-date">${date}</span>
                </div>`;
            }).join('');
            if (achItems) achHTML = `
                <div class="nyan-pp-section" style="animation-delay:0.34s;">
                    <div class="nyan-pp-section-title">🏆 Conquistas <span>${total} desbloqueadas</span></div>
                    ${achItems}
                </div>`;
        }

        const vBadgeEl = document.getElementById('nyan-pp-version-badge');
        if (vBadgeEl && vBadgeEmoji) {
            vBadgeEl.style.display = 'flex';
            vBadgeEl.textContent   = vBadgeEmoji + ' ' + vBadgeText;
            vBadgeEl.addEventListener('mouseenter', e => Friends._showVersionTooltip(e, vBadgeTitle));
            vBadgeEl.addEventListener('mouseleave', () => Friends._hideVersionTooltip());
        }

        const bannerEl = document.getElementById('nyan-pp-banner');
        if (bannerEl) {
            bannerEl.style.background = banner.css;
            bannerEl.style.backgroundSize = '300% 300%';
        }

        const publicBorder = window.Inventory?.getProfileBorderFromProfile?.(profile) || null;
        const publicBorderCss = publicBorder?.css || `border:3.5px solid ${avBdr};`;
        const publicBorderExtraStyle = publicBorder?.extraStyle || '';

        const avatarWrapEl = document.getElementById('nyan-pp-card')?.firstElementChild;
        if (avatarWrapEl) {
            avatarWrapEl.innerHTML = `
                <div id="nyan-pp-avatar-wrap">
                    ${publicBorderExtraStyle ? `<style>${publicBorderExtraStyle}</style>` : ''}
                    <div id="nyan-pp-avatar-img-shell" style="${publicBorderCss}">${avatarHTML}</div>
                    <div id="nyan-pp-statusdot" style="background:${statusColor};"></div>
                    <div class="nyan-sparkle" style="top:-6px;right:6px;--dur:2.2s;--delay:0s;">✦</div>
                    <div class="nyan-sparkle" style="top:4px;left:-8px;--dur:2.8s;--delay:.7s;font-size:0.6rem;">★</div>
                    <div class="nyan-sparkle" style="bottom:-4px;left:0;--dur:3s;--delay:1.2s;font-size:0.55rem;">✧</div>
                </div>`;
        }

        const publicTitle =
            window.V310Rewards?.resolveProfileTitle?.(profile) ||
            window.Inventory?.getProfileTitleFromProfile?.(profile) ||
            null;
        const publicTitleStyle = window.Inventory?.getTitleBadgeStyle?.(publicTitle) || '';
        const publicBadges = window.Badges?.getProfileBadgesFromProfile?.(profile) || [];
        const publicEquippedBadge = window.Badges?.getProfileBadgeFromProfile?.(profile) || publicBadges[0] || null;
        const publicTitleHtml = publicTitle ? `<div class="nyan-pp-title-wrap">
            <span class="nyan-pp-title-label">Titulo</span>
            <span class="nyan-pp-title-chip" style="${publicTitleStyle}">
                <span class="nyan-pp-chip-icon">${publicTitle.icon || '\u{1F451}'}</span>
                <span class="nyan-pp-chip-name">${publicTitle.name || 'Titulo'}</span>
            </span>
        </div>` : '';
        const publicBadgesHtml = publicBadges.map((badge) => {
            if (!badge) return '';
            const isActive = badge.id === publicEquippedBadge?.id;
            const rarityMeta = window.Badges?.getRarityMeta?.(badge.rarity) || {
                label: 'Insignia',
                dark: { text: '#f1f5f9', bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.16)' },
                light: { text: '#0f172a', bg: 'rgba(15,23,42,0.06)', border: 'rgba(15,23,42,0.12)' },
            };
            const tone = d ? rarityMeta.dark : rarityMeta.light;
            const badgeBg = d
                ? `linear-gradient(135deg, rgba(15,23,42,0.98), ${tone.bg})`
                : `linear-gradient(135deg, rgba(255,255,255,0.98), ${tone.bg})`;
            const badgeShadow = isActive
                ? `0 16px 30px ${d ? 'rgba(2,6,23,0.42)' : 'rgba(15,23,42,0.12)'}, 0 0 24px ${tone.border}`
                : `0 10px 18px ${d ? 'rgba(2,6,23,0.26)' : 'rgba(15,23,42,0.08)'}`;
            return `<span class="nyan-pp-badge-medal ${isActive ? 'active' : ''}"
                title="${badge.name || 'Insignia'} • ${rarityMeta.label || 'Insignia'}"
                style="--badge-color:${tone.text};--badge-border:${tone.border};--badge-bg:${badgeBg};--badge-glow:${tone.border};box-shadow:${badgeShadow};">
                <span class="nyan-pp-badge-icon">${badge.icon || '\u{1F3C5}'}</span>
            </span>`;
        }).filter(Boolean).join('');
        const featuredBadge = publicEquippedBadge || publicBadges[0] || null;
        let publicBadgesPanelHtml = '';
        if (publicBadges.length) {
            const featuredCatalogBadge = window.Badges?.getBadge?.(featuredBadge?.id) || null;
            const rarityMeta = window.Badges?.getRarityMeta?.(featuredBadge?.rarity) || {
                label: 'Insignia',
                dark: { text: '#f1f5f9', bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.16)' },
                light: { text: '#0f172a', bg: 'rgba(15,23,42,0.06)', border: 'rgba(15,23,42,0.12)' },
            };
            const tone = d ? rarityMeta.dark : rarityMeta.light;
            const focusBg = d
                ? `linear-gradient(135deg, rgba(15,23,42,0.88), ${tone.bg})`
                : `linear-gradient(135deg, rgba(255,255,255,0.96), ${tone.bg})`;
            publicBadgesPanelHtml = `<div class="nyan-pp-badges-shell">
                <div class="nyan-pp-badges-head">
                    <div class="nyan-pp-badges-title">Insignias</div>
                    <div class="nyan-pp-badges-count">${publicBadges.length} em exibicao</div>
                </div>
                <div class="nyan-pp-badges-rail">${publicBadgesHtml}</div>
                ${featuredBadge ? `<div class="nyan-pp-badge-focus" style="--focus-text:${tone.text};--focus-border:${tone.border};--focus-bg:${focusBg};">
                    <div class="nyan-pp-badge-focus-icon">${featuredBadge.icon || '\u{1F3C5}'}</div>
                    <div class="nyan-pp-badge-focus-copy">
                        <div class="nyan-pp-badge-focus-label">Em destaque no perfil</div>
                        <div class="nyan-pp-badge-focus-name">${featuredBadge.name || 'Insignia'}</div>
                        <div class="nyan-pp-badge-focus-meta">
                            <span class="nyan-pp-badge-focus-pill">${rarityMeta.label || 'Insignia'}</span>
                            <span>${featuredBadge.description || featuredCatalogBadge?.description || 'Colecao publica de recompensas do perfil.'}</span>
                        </div>
                    </div>
                </div>` : ''}
            </div>`;
        }

        ppContent.style.textAlign = 'left';
        ppContent.innerHTML = `
            <div id="nyan-pp-name">${profile.username || 'Usuário'}</div>

            ${publicTitleHtml}

            <div id="nyan-pp-tag-row">
                <span class="nyan-pp-tag">${profile.nyanTag || ''}</span>
            </div>

            <div style="text-align:center;margin-bottom:${profile.bio ? '0.5rem' : '0'};">
                <div id="nyan-pp-status-pill"
                     style="background:${statusColor}18;border:1px solid ${statusColor}40;color:${statusColor};display:inline-flex;">
                    <span style="width:6px;height:6px;border-radius:50%;background:${statusColor};flex-shrink:0;display:inline-block;"></span>
                    ${statusLabel}
                </div>
            </div>

            ${profile.bio ? `<div class="nyan-pp-bio" style="color:${sub};">"${profile.bio}"</div>` : ''}

            ${publicBadgesPanelHtml}

            <div class="nyan-pp-stats-row">
                <div class="nyan-pp-stat-pill accent">
                    <div class="nyan-pp-stat-label">Nível</div>
                    <div class="nyan-pp-stat-val">${displayLevel}</div>
                </div>
                ${memberSince ? `<div class="nyan-pp-stat-pill">
                    <div class="nyan-pp-stat-label">Desde</div>
                    <div class="nyan-pp-stat-val sub">${memberSince}</div>
                </div>` : ''}
                ${favoriteGame ? `<div class="nyan-pp-stat-pill">
                    <div class="nyan-pp-stat-label">Favorito</div>
                    <div class="nyan-pp-stat-val sub">${favoriteGame.icon} ${favoriteGame.label}</div>
                </div>` : ''}
            </div>

            ${recordsHTML ? `
            <div class="nyan-pp-section">
                <div class="nyan-pp-section-title">🎮 Recordes</div>
                ${recordsHTML}
            </div>` : ''}

            ${achHTML}

            ${this._renderPublicActions({
                relationship,
                uid,
                username: profile.username || '?',
                tag: profile.nyanTag || '',
            })}
        `;
    },

    _renderPublicActions({ relationship, uid, username, tag }) {
        const state = relationship?.state || 'none';

        if (state === 'friend') {
            return `
            <div class="nyan-pp-actions">
                <button class="nyan-pp-btn primary" onclick="Friends.openChat('${uid}','${tag}','${username}')">💬 Mensagem</button>
                <button class="nyan-pp-btn golden" onclick="Challenges.showCreateModal('${uid}','${tag||username||'?'}')">⚔️ Desafiar</button>
                <button class="nyan-pp-btn teal" onclick="Friends.showCompare('${uid}','${username||'?'}')">📊 Comparar</button>
                <button class="nyan-pp-btn danger" onclick="Friends.confirmRemove('${uid}','${username||'?'}')">Remover</button>
            </div>`;
        }

        if (state === 'self') {
            return `
            <div class="nyan-pp-actions">
                <button class="nyan-pp-btn primary" onclick="Router.navigate('profile')">👤 Meu perfil</button>
            </div>`;
        }

        if (state === 'incoming') {
            return `
            <div class="nyan-pp-actions">
                <button class="nyan-pp-btn primary" onclick="Friends.acceptRequest('${uid}','${tag}','${relationship.requestDocId || ''}')">✅ Aceitar</button>
                <button class="nyan-pp-btn danger" onclick="Friends.declineRequest('${uid}','${relationship.requestDocId || ''}')">Recusar</button>
            </div>`;
        }

        if (state === 'outgoing') {
            return `
            <div class="nyan-pp-actions">
                <button class="nyan-pp-btn teal" style="opacity:0.65;cursor:default;" disabled>📨 Solicitação enviada</button>
            </div>`;
        }

        return `
        <div class="nyan-pp-actions">
            <button class="nyan-pp-btn primary" onclick="Friends.sendRequestToUser('${uid}','${tag}','${username}')">➕ Adicionar</button>
        </div>`;
    },

    confirmRemove(uid, username) {
        const d    = document.body.classList.contains('dark-theme');
        const bg   = d ? '#0e0e16' : '#ffffff';
        const text = d ? '#f1f5f9' : '#0f172a';
        const muted= d ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)';

        document.getElementById('confirm-remove-modal')?.remove();
        const modal = document.createElement('div');
        modal.id = 'confirm-remove-modal';
        modal.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.65);';

        const inner = document.createElement('div');
        inner.style.cssText = 'background:' + bg + ';border:1px solid rgba(239,68,68,0.25);border-radius:18px;padding:1.5rem;width:100%;max-width:320px;margin:0 1rem;font-family:DM Sans,sans-serif;text-align:center;';
        inner.innerHTML =
            '<div style="font-size:2rem;margin-bottom:0.75rem;">💔</div>' +
            '<div style="font-size:0.95rem;font-weight:800;color:' + text + ';font-family:Syne,sans-serif;margin-bottom:0.375rem;">Remover ' + (username || '?') + '?</div>' +
            '<p style="font-size:0.78rem;color:' + muted + ';margin:0 0 1.25rem;">Esta ação não pode ser desfeita.</p>' +
            '<div style="display:flex;gap:0.5rem;">' +
                '<button id="crm-cancel" style="flex:1;padding:0.625rem;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:' + muted + ';font-weight:700;font-size:0.82rem;cursor:pointer;font-family:DM Sans,sans-serif;">Cancelar</button>' +
                '<button id="crm-confirm" style="flex:1;padding:0.625rem;border-radius:10px;border:none;background:rgba(239,68,68,0.15);color:#f87171;font-weight:700;font-size:0.82rem;cursor:pointer;font-family:DM Sans,sans-serif;">Remover</button>' +
            '</div>';

        modal.appendChild(inner);
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
        document.body.appendChild(modal);

        document.getElementById('crm-cancel').addEventListener('click', () => modal.remove());
        document.getElementById('crm-confirm').addEventListener('click', () => {
            modal.remove();
            Friends._doRemove(uid);
        });
    },

        showCompare(uid, username) {
        const d    = document.body.classList.contains('dark-theme');
        const bg   = d ? '#0e0e16' : '#ffffff';
        const bdr  = d ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
        const text = d ? '#f1f5f9' : '#0f172a';
        const sub  = d ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
        const muted= d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';
        const myTag = NyanAuth.getNyanTag() || 'Você';

        if (window.Leaderboard?.syncScore) {
            Friends.GAME_RECORDS.forEach(g => {
                const val = parseFloat(Utils.loadData(g.key));
                if (val) Leaderboard.syncScore(g.gameId, val);
            });
        }

        const rows = Friends.GAME_RECORDS.map(g => {
            const mine   = parseFloat(Utils.loadData(g.key)) || 0;
            const fmt    = v => (v || v === 0) && v > 0 ? parseFloat(v).toLocaleString('pt-BR') + ' ' + g.unit : '—';
            const mineCol = mine ? 'var(--theme-primary,#a855f7)' : muted;
            return '<tr>' +
                '<td style="padding:0.4rem 0.75rem;font-size:0.75rem;color:' + sub + ';">' + g.icon + ' ' + g.label + '</td>' +
                '<td style="padding:0.4rem 0.75rem;text-align:center;font-size:0.78rem;font-weight:700;color:' + mineCol + ';">' + fmt(mine) + '</td>' +
                '<td id="cmp-' + g.key + '" style="padding:0.4rem 0.75rem;text-align:center;font-size:0.78rem;font-weight:700;color:' + muted + ';">…</td>' +
            '</tr>';
        }).join('');

        document.getElementById('compare-modal')?.remove();
        const modal = document.createElement('div');
        modal.id = 'compare-modal';
        modal.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);';
        modal.innerHTML =
            '<div style="background:' + bg + ';border:1px solid rgba(255,255,255,0.08);border-radius:20px;' +
                'padding:1.5rem;width:100%;max-width:420px;margin:0 1rem;font-family:DM Sans,sans-serif;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">' +
                    '<div style="font-size:1rem;font-weight:900;color:' + text + ';font-family:Syne,sans-serif;">📊 Comparar recordes</div>' +
                    '<button onclick="document.getElementById(\'compare-modal\').remove()" ' +
                        'style="background:none;border:none;cursor:pointer;font-size:1.1rem;color:' + muted + ';">✕</button>' +
                '</div>' +
                '<table style="width:100%;border-collapse:collapse;">' +
                    '<thead><tr>' +
                        '<th style="padding:0.3rem 0.75rem;font-size:0.65rem;font-weight:800;color:' + muted + ';text-align:left;">Jogo</th>' +
                        '<th style="padding:0.3rem 0.75rem;font-size:0.65rem;font-weight:800;color:rgba(168,85,247,0.8);text-align:center;">' + myTag.split('#')[0] + '</th>' +
                        '<th style="padding:0.3rem 0.75rem;font-size:0.65rem;font-weight:800;color:#ec4899;text-align:center;">' + username + '</th>' +
                    '</tr></thead>' +
                    '<tbody>' + rows + '</tbody>' +
                '</table>' +
            '<div style="margin-top:0.625rem;display:flex;gap:1rem;justify-content:center;font-size:0.65rem;color:' + muted + ';">' +
                '<span><span style="color:#4ade80;">■</span> ' + myTag.split('#')[0] + ' na frente</span>' +
                '<span><span style="color:#ec4899;">■</span> ' + username + ' na frente</span>' +
                '<span><span style="color:rgba(168,85,247,0.7);">■</span> Empate</span>' +
            '</div>' +
            '</div>';

        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
        document.body.appendChild(modal);

        NyanFirebase.getDoc('users/' + uid).then(theirProfile => {
            Friends.GAME_RECORDS.forEach(g => {
                const val = theirProfile?.[g.fsKey];
                const key = g.key;
                const el  = document.getElementById('cmp-' + key);
                if (!el) return;
                if (val == null || val <= 0) { el.textContent = '—'; el.style.color = muted; return; }
                const display = parseFloat(val).toLocaleString('pt-BR') + ' ' + g.unit;
                const mine = parseFloat(Utils.loadData(g.key)) || 0;
                const theyWin = mine && val && (g.higher ? val > mine : val < mine);
                const iWin    = mine && val && (g.higher ? mine > val : mine < val);
                el.textContent = display;
                el.style.color = iWin ? '#4ade80' : (theyWin ? '#ec4899' : 'rgba(168,85,247,0.8)');
            });
        });
    },

        _showVersionTooltip(e, text) {
        document.getElementById('version-tooltip')?.remove();
        const host = document.getElementById('nyan-pp-banner') || document.getElementById('nyan-pp-wrap') || document.body;
        const t = document.createElement('div');
        t.id = 'version-tooltip';
        const d = document.body.classList.contains('dark-theme');
        t.style.cssText = 'position:absolute;z-index:20;padding:0.4rem 0.7rem;border-radius:8px;font-size:0.72rem;font-weight:600;max-width:240px;pointer-events:none;' +
            'background:' + (d ? '#1e1e2e' : '#1a1a1a') + ';color:#f1f5f9;box-shadow:0 4px 16px rgba(0,0,0,0.4);' +
            "font-family:'DM Sans',sans-serif;line-height:1.4;";
        t.textContent = text;
        host.appendChild(t);
        const rect = e.target.getBoundingClientRect();
        const hostRect = host.getBoundingClientRect();
        const badgeLeft = rect.left - hostRect.left;
        const badgeTop = rect.top - hostRect.top;
        const badgeBottom = rect.bottom - hostRect.top;
        t.style.maxWidth = Math.min(240, Math.max(140, hostRect.width - 24)) + 'px';
        const tw = t.offsetWidth, th = t.offsetHeight;
        const leftSpace = badgeLeft - 8;
        const left = leftSpace >= Math.min(160, tw)
            ? badgeLeft - tw - 8
            : Math.max(8, Math.min(badgeLeft + rect.width / 2 - tw / 2, hostRect.width - tw - 8));
        const top = leftSpace >= Math.min(160, tw)
            ? Math.max(8, Math.min(badgeTop, hostRect.height - th - 8))
            : Math.max(8, Math.min(badgeBottom + 6, hostRect.height - th - 8));
        t.style.left = left + 'px';
        t.style.top  = top + 'px';
    },

    _hideVersionTooltip() {
        document.getElementById('version-tooltip')?.remove();
    },

        _doRemove(uid) {
        document.getElementById('confirm-remove-modal')?.remove();
        this.removeFriend(uid);
    },

    viewProfile(uid, source = 'friends') {
        window._viewingProfile = uid;
        window._viewingProfileSource = source;
        Router?.navigate('profile-public');
    },

    openChat(uid, tag) {
        window._chatTarget = { uid, tag };
        Router?.navigate('chat');
    },

    _renderOfflineState() {
        const d    = document.body.classList.contains('dark-theme');
        const bg   = d ? 'rgba(255,255,255,0.04)' : '#ffffff';
        const bdr  = d ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
        const text = d ? '#f1f5f9' : '#0f172a';
        const sub  = d ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';

        return `
        <div style="max-width:480px;margin:0 auto;text-align:center;padding:3rem 1rem;font-family:'DM Sans',sans-serif;">
            <div style="font-size:4rem;margin-bottom:1rem;">🔌</div>
            <h2 style="font-family:'Syne',sans-serif;font-weight:900;color:${text};margin:0 0 0.5rem;">
                Modo offline
            </h2>
            <p style="font-size:0.85rem;color:${sub};line-height:1.6;margin-bottom:1.5rem;">
                Configure o Firebase no arquivo <code>firebase.js</code> para ativar
                o sistema de amigos, chat e placar global. にゃん~
            </p>
            <div style="background:${bg};border:1px solid ${bdr};border-radius:14px;padding:1.25rem;text-align:left;">
                <div style="font-size:0.65rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${sub};margin-bottom:0.75rem;">
                    Passos para ativar
                </div>
                ${['Crie um projeto em console.firebase.google.com','Ative Authentication + banco de dados online','Cole o firebaseConfig em firebase.js','Reinicie o app'].map((s, i) => `
                    <div style="display:flex;align-items:flex-start;gap:0.625rem;margin-bottom:0.5rem;font-size:0.78rem;color:${sub};">
                        <span style="font-weight:800;color:var(--theme-primary,#a855f7);min-width:16px;">${i+1}.</span>
                        <span>${s}</span>
                    </div>`).join('')}
            </div>
        </div>`;
    },

    init() {
        if (Router?.currentRoute === 'profile-public') {
            setTimeout(() => this._loadPublicProfile(), 50);
            this._profileEscHandler = e => { if (e.key === 'Escape') Router.back(); };
            document.addEventListener('keydown', this._profileEscHandler);
            return;
        }
        if (this._profileEscHandler) {
            document.removeEventListener('keydown', this._profileEscHandler);
            this._profileEscHandler = null;
        }
        setTimeout(() => this._processPendingAccepted(), 500);

        const uid = NyanAuth.getUID();
        if (uid && NyanFirebase.isReady()) {
            const { collection, onSnapshot } = NyanFirebase.fn;

            const unsubAccepted = onSnapshot(
                collection(NyanFirebase.db, `requests/${uid}/accepted`),
                () => this._processPendingAccepted()
            );
            NyanFirebase._listeners.push(unsubAccepted);

            const inboxRef = collection(NyanFirebase.db, `requests/${uid}/inbox`);
            const unsubInbox = onSnapshot(inboxRef, (snap) => {
                const count = snap.size || 0;
                this._requestsBadge = count;
                const badge = document.getElementById('ftab-requests');
                if (badge) badge.textContent = count > 0 ? `🔔 Solicitações (${count})` : '🔔 Solicitações';
            });
            NyanFirebase._listeners.push(unsubInbox);
        }

        setTimeout(() => this.switchTab('list'), 100);

    },
};

Friends._presenceCache = Friends._presenceCache || {};

Friends._routeToToolId = function(route) {
    if (!route) return null;
    if (route.startsWith('game:')) return 'offline';
    return route;
};

Friends._isKnownRoute = function(route) {
    if (!route) return false;
    if (route.startsWith('game:')) return true;
    const known = new Set([
        'home','password','weather','translator','ai-assistant','mini-game','temp-email','music',
        'notes','tasks','missions','season','shop','offline','settings','friends','chat','leaderboard','feed',
        'challenges','profile','profile-public'
    ]);
    return known.has(route);
};

Friends._presenceRouteLabel = function(route) {
    if (!route) return '';
    if (route.startsWith('game:')) return 'Zona Offline';
    const labels = {
        home: 'Home',
        tasks: 'Tarefas',
        notes: 'Notas',
        missions: 'Missoes',
        season: 'Temporada',
        friends: 'Amigos',
        chat: 'Chat',
        profile: 'Perfil',
        offline: 'Zona Offline',
    };
    return labels[route] || route;
};

Friends._normalizePresence = function(data = {}) {
    let route = data?.route || data?.presenceRoute || '';
    const online = data?.online === true;

    if (!Friends._isKnownRoute(route)) route = '';
    if (!online) route = '';

    let status = online ? (data?.status || 'online') : 'offline';
    let label = data?.label || data?.presenceLabel || '';

    if (route.startsWith('game:')) {
        status = 'playing';
        const gameId = route.split(':')[1] || '';
        const gameNames = {
            typeracer: 'Type Racer',
            game2048: '2048',
            flappy: 'Flappy Nyan',
            quiz: 'Quiz Diario',
            termo: 'Termo',
            forca: 'Forca',
            snake: 'Cobrinha',
            slot: 'Caca-Niquel',
            tictactoe: 'Jogo da Velha',
        };
        label = `Jogando ${gameNames[gameId] || 'na Zona Offline'}`;
    } else if (route === 'tasks') {
        status = 'focused';
        label = 'Gerenciando tarefas';
    } else if (route === 'notes') {
        status = 'focused';
        label = 'Escrevendo notas';
    } else if (route === 'missions') {
        label = 'Nas missoes';
    } else if (route === 'season') {
        label = 'Na temporada';
    } else if (route === 'chat') {
        label = 'No chat';
    } else if (route === 'offline') {
        status = 'playing';
        label = 'Zona Offline';
    } else if (route && !label) {
        label = Friends._presenceRouteLabel(route);
    }

    if (!label) label = online ? 'Ativo agora' : 'Sem atividade recente';
    return { ...data, route, online, status, label };
};

Friends._presenceTs = function(data = {}) {
    const v = data?.lastSeen;
    if (typeof v === 'number') return v;
    if (typeof v === 'string' && /^\d+$/.test(v)) return Number(v);
    if (v && typeof v === 'object') {
        if (typeof v.ms === 'number') return v.ms;
        if (typeof v.seconds === 'number') return v.seconds * 1000;
    }
    return 0;
};

Friends._presenceCoherence = function(p = {}) {
    const route = p?.route || '';
    const status = p?.status || 'offline';
    if (!p?.online) return status === 'offline' ? 2 : 1;
    if (route.startsWith('game:')) return status === 'playing' ? 5 : 2;
    if (route === 'tasks') return status === 'focused' ? 5 : 2;
    if (route === 'notes') return status === 'focused' ? 5 : 2;
    if (route === 'offline') return status === 'playing' ? 4 : 2;
    return 3;
};

Friends.followFriendContext = function(uid) {
    const pres = Friends._presenceCache?.[uid] || {};
    const route = pres.route;
    if (!route) return;

    if (route.startsWith('game:')) {
        const gameId = route.split(':')[1];
        Router.navigate('offline');
        setTimeout(() => {
            if (window.OfflineZone?._initGame && gameId) {
                window.OfflineZone._initGame(gameId);
            }
        }, 220);
        return;
    }

    const toolId = Friends._routeToToolId(route);
    if (toolId) Router.navigate(toolId);
};

Friends._subscribePresence = function(uids) {
    this._presenceUnsubs.forEach((u) => u && u());
    this._presenceUnsubs = [];
    if (this._presencePollTimer) {
        clearInterval(this._presencePollTimer);
        this._presencePollTimer = null;
    }

    if (!NyanFirebase.rtdb || !NyanFirebase.fn.onValue) return;
    const { ref, onValue } = NyanFirebase.fn;
    uids.forEach((uid) => {
        if (!uid) return;
        const presRef = ref(NyanFirebase.rtdb, `presence/${uid}`);
        const unsub = onValue(presRef, (snap) => {
            const raw = snap.val() || {};
            setTimeout(() => Friends._applyPresenceToCard(uid, raw), 150);
        });
        this._presenceUnsubs.push(unsub);
    });

    this._presencePollUIDs = [...uids];
    this._presencePollTimer = setInterval(() => {
        Friends._pollPresenceSnapshot(Friends._presencePollUIDs || []);
    }, 2500);
    setTimeout(() => Friends._pollPresenceSnapshot(Friends._presencePollUIDs || []), 800);
};

Friends._applyPresenceToCard = function(uid, data) {
    const statusColor = { online: '#4ade80', playing: '#a855f7', away: '#fbbf24', offline: '#9ca3af', focused: '#3b82f6' };
    const statusLabel = { online: 'Online', playing: 'Jogando', away: 'Ausente', offline: 'Offline', focused: 'Focado' };

    const normalized = Friends._normalizePresence(data || {});
    const newTs = Friends._presenceTs(normalized);
    const newScore = Friends._presenceCoherence(normalized);
    const prev = Friends._presenceCache?.[uid] || {};
    const prevTs = Friends._presenceTs(prev);
    const prevScore = Number(prev.__coherence || 0);

    if ((newTs > 0 && prevTs > 0 && newTs < prevTs) ||
        (newTs === prevTs && newScore < prevScore)) {
        return;
    }
    const isOn = normalized?.online === true;
    const key = isOn ? (normalized?.status || 'online') : 'offline';
    const color = statusColor[key] || statusColor.offline;

    Friends._presenceCache[uid] = { ...(normalized || {}), __coherence: newScore };

    const st = document.getElementById(`fstatus-${uid}`);
    if (st) {
        st.textContent = `● ${statusLabel[key] || 'Offline'}`;
        st.style.color = color;
    }

    const ctx = document.getElementById(`fctx-${uid}`);
    if (ctx) {
        const context = normalized?.label || (isOn ? 'Ativo agora' : 'Sem atividade recente');
        ctx.textContent = context;

        const tagRow = ctx.previousElementSibling;
        if (tagRow) {
            tagRow.querySelectorAll('span').forEach((chip) => {
                const t = (chip.textContent || '').trim().toLowerCase();
                if (t && (t.includes('gerenciando') || t.includes('zona offline') || t.includes('jogando') || t.includes('home') || t.includes('missoes') || t.includes('chat') || t.includes('perfil'))) {
                    chip.remove();
                }
            });
        }

        const prevEl = ctx.previousElementSibling;
        if (prevEl && prevEl !== ctx && prevEl.id !== `fstatus-${uid}`) {
            const txt = (prevEl.textContent || '').trim();
            const looksLikeLegacyChip =
                !txt.includes('#') &&
                /zona offline|tarefas|notas|home|missoes|chat|perfil/i.test(txt);
            if (looksLikeLegacyChip || prevEl.querySelector?.('[id^="froute-"]')) {
                prevEl.remove();
            }
        }
    }

    const legacyRouteBadge = document.getElementById(`froute-${uid}`);
    if (legacyRouteBadge) legacyRouteBadge.remove();

    const dot = document.getElementById(`fdot-${uid}`);
    if (dot) dot.style.background = color;

    const av = document.getElementById(`favatar-${uid}`);
    if (av) {
        av.style.border = `2px solid ${color}22`;
        av.style.boxShadow = `0 0 0 2px ${color}44`;
    }

    const followBtn = document.getElementById(`ffollow-${uid}`);
    if (followBtn) {
        const route = normalized?.route || null;
        const canFollow = !!route && isOn;
        followBtn.style.display = canFollow ? 'inline-flex' : 'none';
        if (canFollow) {
            followBtn.title = route.startsWith('game:') ? 'Entrar no mesmo jogo' : 'Ir para o mesmo contexto';
        }
    }
};

Friends._pollPresenceSnapshot = async function(uids) {
    if (!uids?.length) return;
    if (!NyanFirebase?.rtdb || !NyanFirebase?.fn?.get || !NyanFirebase?.fn?.ref) return;

    const { get, ref } = NyanFirebase.fn;
    await Promise.all(uids.map(async (uid) => {
        try {
            const snap = await get(ref(NyanFirebase.rtdb, `presence/${uid}`));
            const data = snap?.val?.() || {};
            Friends._applyPresenceToCard(uid, data);
        } catch (_) {}
    }));
};

const __nyanOrigFriendsSwitchTab = Friends.switchTab?.bind(Friends);
Friends.switchTab = async function(tab) {
    if (tab === 'requests' && this._presencePollTimer) {
        clearInterval(this._presencePollTimer);
        this._presencePollTimer = null;
        this._presencePollUIDs = [];
    }
    const res = __nyanOrigFriendsSwitchTab ? await __nyanOrigFriendsSwitchTab(tab) : undefined;
    if (tab === 'list' || tab === 'online') {
        document.querySelectorAll('[id^="froute-"]').forEach((el) => el.remove());
        setTimeout(() => Friends._pollPresenceSnapshot(Friends._presencePollUIDs || []), 120);
    }
    return res;
};

Friends._renderFriendCard = function(f, bg, bdr, text, sub, muted, d) {
    const statusColor = { online: '#4ade80', playing: '#a855f7', away: '#fbbf24', offline: '#9ca3af', focused: '#3b82f6' };
    const statusLabel = { online: 'Online', playing: 'Jogando', away: 'Ausente', offline: 'Offline', focused: 'Focado' };
    const normalized = Friends._normalizePresence({
        status: f.status,
        label: f.presenceLabel,
        route: f.presenceRoute,
        online: f.status && f.status !== 'offline',
    });
    const status = normalized.status || 'offline';
    const color = statusColor[status] || statusColor.offline;
    const context = normalized.label || 'Sem atividade recente';

    return `
    <div style="background:${bg};border:1px solid ${bdr};border-radius:14px;
        padding:0.875rem 1rem;margin-bottom:0.5rem;
        display:flex;align-items:center;gap:0.875rem;
        transition:box-shadow 0.2s;"
        onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'"
        onmouseout="this.style.boxShadow=''">

        <div id="favatar-${f.uid}" style="width:44px;height:44px;border-radius:12px;overflow:hidden;flex-shrink:0;
            border:2px solid ${color}22;box-shadow:0 0 0 2px ${color}44;position:relative;">
            ${f.avatar
                ? `<img src="${f.avatar}" style="width:100%;height:100%;object-fit:cover;"/>`
                : (window.AvatarGenerator
                    ? AvatarGenerator.generate(f.username || 'nyan', 44)
                    : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#7c3aed,#ec4899);display:flex;align-items:center;justify-content:center;color:white;font-weight:800;">${(f.username||'N').charAt(0).toUpperCase()}</div>`)
            }
            <div id="fdot-${f.uid}" style="position:absolute;bottom:1px;right:1px;width:10px;height:10px;
                border-radius:50%;background:${color};border:2px solid ${bg};"></div>
        </div>

        <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.2rem;">
                <span style="font-size:0.875rem;font-weight:700;color:${text};font-family:'Syne',sans-serif;">${f.username || 'Usuario'}</span>
                <span id="fstatus-${f.uid}" style="font-size:0.62rem;color:${color};font-weight:700;">● ${statusLabel[status]}</span>
            </div>
            <div style="font-size:0.72rem;color:${muted};">${f.nyanTag || ''}</div>
            <div id="fctx-${f.uid}" style="font-size:0.69rem;color:${sub};margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${context}</div>
        </div>

        <div style="text-align:right;flex-shrink:0;">
            <div style="font-size:0.65rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:${muted};margin-bottom:0.25rem;">Nivel</div>
            <div style="font-size:1.1rem;font-weight:900;font-family:'Syne',sans-serif;color:var(--theme-primary,#a855f7);">${f.level || 1}</div>
            <div style="display:flex;gap:0.375rem;margin-top:0.375rem;justify-content:flex-end;flex-wrap:wrap;">
                <button onclick="Friends.viewProfile('${f.uid}')"
                        style="padding:4px 10px;border-radius:7px;border:none;cursor:pointer;
                            font-size:0.68rem;font-weight:700;
                            background:rgba(168,85,247,0.12);color:rgba(168,85,247,0.9);
                            font-family:'DM Sans',sans-serif;">Perfil</button>
                <button onclick="Friends.openChat('${f.uid}','${f.nyanTag}')"
                        style="padding:4px 10px;border-radius:7px;border:none;cursor:pointer;
                            font-size:0.68rem;font-weight:700;
                            background:rgba(74,222,128,0.12);color:rgba(74,222,128,0.9);
                            font-family:'DM Sans',sans-serif;">Chat</button>
                <button id="ffollow-${f.uid}" onclick="Friends.followFriendContext('${f.uid}')"
                        style="display:none;padding:4px 10px;border-radius:7px;border:none;cursor:pointer;
                            font-size:0.68rem;font-weight:700;
                            background:rgba(59,130,246,0.12);color:rgba(59,130,246,0.95);
                            font-family:'DM Sans',sans-serif;">Acompanhar</button>
            </div>
        </div>
    </div>`;
};

window.Friends = Friends;

(function finalizeFriendsPresenceV310() {
    if (!window.Friends || Friends.__v310PresenceFinalized) return;
    Friends.__v310PresenceFinalized = true;

    Friends._inferRouteFromLabel = function(label = '') {
        const text = String(label || '').toLowerCase();
        if (!text) return '';
        if (text.includes('gerenciando tarefas')) return 'tasks';
        if (text.includes('escrevendo notas')) return 'notes';
        if (text.includes('zona offline')) return 'offline';
        if (text.includes('no chat')) return 'chat';
        if (text.includes('na home')) return 'home';
        if (text.includes('nas missoes')) return 'missions';
        if (text.includes('no perfil')) return 'profile';
        if (text.includes('jogando termo')) return 'game:termo';
        if (text.includes('jogando cobrinha')) return 'game:snake';
        if (text.includes('jogando 2048')) return 'game:game2048';
        if (text.includes('jogando type racer')) return 'game:typeracer';
        if (text.includes('jogando flappy')) return 'game:flappy';
        if (text.includes('quiz')) return 'game:quiz';
        if (text.includes('forca')) return 'game:forca';
        if (text.includes('caca-niquel')) return 'game:slot';
        return '';
    };

    const canonicalGameNames = {
        typeracer: 'Type Racer',
        game2048: '2048',
        flappy: 'Flappy Nyan',
        quiz: 'Quiz Diario',
        termo: 'Termo',
        forca: 'Forca',
        snake: 'Cobrinha',
        slot: 'Caca-Niquel',
        tictactoe: 'Jogo da Velha',
    };

    Friends._normalizePresence = function(data = {}) {
        const rawStatus = String(data?.status || '').toLowerCase();
        const hasOnline = typeof data?.online === 'boolean';
        const online = hasOnline ? data.online : (rawStatus && rawStatus !== 'offline');

        let route = data?.route || data?.presenceRoute || '';
        let status = rawStatus || (online ? 'online' : 'offline');
        let label = data?.label || data?.presenceLabel || '';

        if (!route) route = Friends._inferRouteFromLabel(label);
        if (!Friends._isKnownRoute(route)) route = '';
        if (!online) {
            route = '';
            status = 'offline';
            label = 'Sem atividade recente';
        }

        if (route.startsWith('game:')) {
            status = 'playing';
            const gameId = route.split(':')[1] || '';
            label = `Jogando ${canonicalGameNames[gameId] || 'na Zona Offline'}`;
        } else if (route === 'tasks') {
            status = 'focused';
            label = 'Gerenciando tarefas';
        } else if (route === 'notes') {
            status = 'focused';
            label = 'Escrevendo notas';
        } else if (route === 'missions') {
            status = status === 'offline' ? 'online' : status;
            label = 'Nas missoes';
        } else if (route === 'season') {
            status = status === 'offline' ? 'online' : status;
            label = 'Na temporada';
        } else if (route === 'chat') {
            status = status === 'offline' ? 'online' : status;
            label = 'No chat';
        } else if (route === 'offline') {
            status = 'playing';
            label = 'Zona Offline';
        } else if (route && !label) {
            label = Friends._presenceRouteLabel(route);
        } else if (!route && status === 'focused' && !label) {
            label = 'Focado';
        } else if (!route && status === 'playing' && !label) {
            label = 'Jogando agora';
        } else if (!label) {
            label = 'Ativo agora';
        }

        return {
            ...data,
            route,
            online,
            status,
            label,
        };
    };

    Friends._presenceTs = function(data = {}) {
        const direct = [
            data?.updatedAt,
            data?.presenceUpdated,
            data?.lastSeen,
        ];
        for (const v of direct) {
            if (typeof v === 'number') return v;
            if (typeof v === 'string' && /^\d+$/.test(v)) return Number(v);
            if (v && typeof v === 'object') {
                if (typeof v.ms === 'number') return v.ms;
                if (typeof v.seconds === 'number') return v.seconds * 1000;
            }
        }
        return 0;
    };

    const __origSubscribePresence = Friends._subscribePresence?.bind(Friends);
    Friends._subscribePresence = function(uids) {
        __origSubscribePresence?.(uids);
        if (this._presencePollTimer) {
            clearInterval(this._presencePollTimer);
            this._presencePollTimer = null;
        }
        this._presencePollUIDs = [...(uids || [])];
        if (this._presencePollUIDs.length === 0) return;
        this._presencePollTimer = setInterval(() => {
            Friends._pollPresenceSnapshot(Friends._presencePollUIDs || []);
        }, 1200);
        setTimeout(() => Friends._pollPresenceSnapshot(Friends._presencePollUIDs || []), 220);
    };
})();
