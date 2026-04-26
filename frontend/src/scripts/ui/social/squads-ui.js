const SquadsUI = {
    _memberProfiles: [],
    _browseOffset: 0,
    _browseNextOffset: 0,
    _browseQuery: '',
    _squadSocialUnsub: null,
    _squadSocialId: null,
    _squadPresenceUnsubs: [],
    _squadPresenceId: null,

    render() {
        if (!window.NyanAuth?.isOnline?.()) {
            return window.Friends?._renderOfflineState?.() || this._renderOfflineState();
        }

        const squad = window.Squads?.getCurrentSquadSync?.() || null;
        const d = document.body.classList.contains('dark-theme');
        const c = this._colors(d);

        return `
        <div style="max-width:980px;margin:0 auto;font-family:'DM Sans',sans-serif;">
            ${this._renderHeader(c)}
            <div id="squads-main-content">
                ${squad ? this._renderSquadHome(squad, c) : this._renderNoSquad(c)}
            </div>
            ${!squad ? `<div id="squad-public-browser" style="margin-top:0.9rem;">
                ${this._renderPublicBrowser(c)}
            </div>` : ''}
        </div>`;
    },

    init() {
        window.Squads?.init?.();
        this.refresh({ silent: true });
        setTimeout(() => {
            if (!window.Squads?.getCurrentSquadSync?.()) this.loadPublicSquads();
        }, 120);
    },

    _colors(d) {
        return {
            d,
            bg: d ? 'rgba(255,255,255,0.04)' : '#ffffff',
            bg2: d ? 'rgba(255,255,255,0.065)' : '#f8fafc',
            border: d ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
            text: d ? '#f1f5f9' : '#0f172a',
            sub: d ? 'rgba(255,255,255,0.58)' : 'rgba(15,23,42,0.58)',
            muted: d ? 'rgba(255,255,255,0.34)' : 'rgba(15,23,42,0.38)',
            input: d ? 'rgba(255,255,255,0.06)' : '#f4f4f9',
        };
    },

    _renderHeader(c) {
        return `
        <div style="text-align:center;margin-bottom:1.55rem;">
            <div style="font-size:2.4rem;margin-bottom:0.35rem;">◆</div>
            <h1 style="font-family:'Syne',sans-serif;font-size:2rem;font-weight:900;margin:0 0 0.3rem;
                background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));
                -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
                Clãs
            </h1>
            <p style="font-size:0.75rem;color:${c.muted};margin:0;">
                Clãs sociais, base para rankings e desafios.
            </p>
        </div>`;
    },

    _renderNoSquad(c) {
        const chips = Number(window.Economy?.getChips?.() || 0).toLocaleString('pt-BR');
        const cost = Number(window.Squads?.CREATE_COST || 500).toLocaleString('pt-BR');
        return `
        <section style="position:relative;overflow:hidden;background:linear-gradient(135deg,rgba(124,58,237,0.16),${c.bg} 46%,rgba(6,182,212,0.1));border:1px solid ${c.border};border-radius:22px;padding:1.15rem;box-shadow:0 18px 50px rgba(0,0,0,0.12);">
            <div style="position:absolute;right:-90px;bottom:-120px;width:260px;height:260px;background:radial-gradient(circle,rgba(6,182,212,0.2),transparent 66%);pointer-events:none;"></div>
            <div style="position:relative;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem;align-items:stretch;">
                <div style="display:flex;gap:1rem;align-items:flex-start;min-width:0;">
                    <div style="width:76px;height:76px;border-radius:22px;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#06b6d4));box-shadow:0 18px 44px rgba(124,58,237,0.28);font-family:'Syne',sans-serif;font-size:2rem;font-weight:900;color:white;">C</div>
                    <div style="min-width:0;">
                        <div style="display:inline-flex;align-items:center;gap:0.35rem;padding:0.26rem 0.55rem;border-radius:999px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.22);color:#10b981;font-size:0.64rem;font-weight:900;margin-bottom:0.7rem;">
                            ${chips} chips disponíveis
                        </div>
                        <div style="font-family:'Syne',sans-serif;font-size:1.45rem;font-weight:900;color:${c.text};line-height:1.1;margin-bottom:0.45rem;">
                            Você ainda não está em um Clã
                        </div>
                        <p style="font-size:0.82rem;color:${c.sub};margin:0;line-height:1.55;max-width:520px;">
                            Crie sua identidade social, entre por código ou procure um clã público para jogar junto.
                        </p>
                    </div>
                </div>
                <div style="display:grid;gap:0.65rem;align-content:center;padding:0.85rem;border-radius:18px;border:1px solid ${c.border};background:${c.d ? 'rgba(0,0,0,0.16)' : 'rgba(255,255,255,0.72)'};">
                    <button onclick="SquadsUI.openCreateModal()" style="${this._btnPrimary()}width:100%;">Criar Clã</button>
                    <button onclick="SquadsUI.openJoinModal()" style="${this._btnSecondary(c)}width:100%;">Entrar com código</button>
                    <div style="font-size:0.68rem;color:${c.muted};line-height:1.4;text-align:center;">
                        Criar custa <strong style="color:${c.text};">${cost}</strong> chips e vira cofre do clã.
                    </div>
                </div>
            </div>
        </section>
        <div id="squad-invites-content" style="margin-top:0.9rem;"></div>`;
    },

    _renderSquadHome(squad, c) {
        const isLeader = squad.members?.find((m) => m.userId === window.NyanAuth?.getUID?.())?.role === 'leader';
        const canLeaderLeave = isLeader && (squad.members?.length || 0) > 1;
        const image = this._renderSquadImage(squad, c, 104);
        const visibility = squad.visibility === 'private' ? 'Privado' : 'Publico';
        return `
        <div style="display:grid;grid-template-columns:minmax(0,1fr);gap:1rem;">
            <section style="position:relative;overflow:hidden;background:linear-gradient(135deg,rgba(124,58,237,0.24),${c.bg} 38%,rgba(6,182,212,0.12));border:1px solid rgba(168,85,247,0.22);border-radius:24px;padding:1.25rem;box-shadow:0 22px 64px rgba(0,0,0,0.16);">
                <div style="position:absolute;right:-130px;top:-145px;width:320px;height:320px;background:radial-gradient(circle,rgba(168,85,247,0.22),transparent 68%);pointer-events:none;"></div>
                <div style="position:absolute;left:34%;bottom:-170px;width:360px;height:260px;background:radial-gradient(circle,rgba(6,182,212,0.18),transparent 70%);pointer-events:none;"></div>
                <div style="position:relative;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem;align-items:start;">
                    <div style="display:flex;gap:1rem;align-items:flex-start;min-width:0;">
                        ${image}
                        <div style="min-width:0;flex:1;">
                            <div style="display:flex;align-items:center;gap:0.55rem;flex-wrap:wrap;margin-bottom:0.5rem;">
                                <div style="font-family:'Syne',sans-serif;font-size:1.65rem;font-weight:900;color:${c.text};line-height:1;">
                                    ${this._escape(squad.name)}
                                </div>
                                <span style="${this._pill('rgba(168,85,247,0.13)', 'rgba(168,85,247,0.28)', 'var(--theme-primary,#a855f7)')}">[${this._escape(squad.tag)}]</span>
                                ${isLeader ? `<span style="${this._pill('rgba(245,158,11,0.1)', 'rgba(245,158,11,0.25)', '#f59e0b')}">Lider</span>` : ''}
                                <span style="${this._pill(squad.visibility === 'private' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', squad.visibility === 'private' ? 'rgba(245,158,11,0.24)' : 'rgba(16,185,129,0.24)', squad.visibility === 'private' ? '#f59e0b' : '#10b981')}">${visibility}</span>
                            </div>
                            <div style="max-width:580px;font-size:0.82rem;line-height:1.55;color:${squad.description ? c.sub : c.muted};margin-bottom:0.85rem;">
                                ${this._escape(squad.description || 'Sem descricao ainda.')}
                            </div>
                            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:0.55rem;max-width:620px;">
                                <div style="${this._miniStat(c)}"><span>Membros</span><strong>${squad.members.length}/${window.Squads.MAX_MEMBERS}</strong></div>
                                <div style="${this._miniStat(c)}"><span>Codigo</span><strong style="letter-spacing:0.08em;">${squad.inviteCode}</strong></div>
                                <div style="${this._miniStat(c)}"><span>Cofre</span><strong>${Number(squad.balance || 0).toLocaleString('pt-BR')}</strong></div>
                                <div style="${this._miniStat(c)}"><span>Pontos</span><strong id="squad-score-stat">${Number(squad.score || 0).toLocaleString('pt-BR')}</strong></div>
                                <div style="${this._miniStat(c)}"><span>Atividade</span><strong id="squad-activity-stat">${this._relativeTime(squad.lastActivityAt || squad.updatedAt)}</strong></div>
                            </div>
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:${isLeader ? 'repeat(2,minmax(0,1fr))' : '1fr'};gap:0.5rem;min-width:260px;">
                        ${isLeader ? `<button onclick="SquadsUI.openCustomizeModal()" style="${this._btnGhost(c)}">Personalizar</button>` : ''}
                        <button onclick="Utils.copyToClipboard('${squad.inviteCode}')" style="${this._btnSecondary(c)}">Copiar codigo</button>
                        <button onclick="SquadsUI.confirmLeave()" style="${this._btnDanger()}${isLeader && !canLeaderLeave ? 'display:none;' : ''}grid-column:${isLeader ? 'auto' : '1 / -1'};">${isLeader ? 'Passar lideranca' : 'Sair do cla'}</button>
                        ${isLeader ? `<button onclick="SquadsUI.confirmDeleteSquad()" style="${this._btnDanger()}">Excluir cla</button>` : ''}
                    </div>
                </div>
            </section>

            ${this._renderSquadTabs(c)}

            <div id="squad-section-chat" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:1rem;align-items:start;">
                ${this._renderChatPanel(c)}
                <div style="display:grid;gap:1rem;">
                    ${this._renderFeedPanel(c)}
                    ${this._renderRecentActivityPanel(c)}
                </div>
            </div>

            <section id="squad-section-ranking" style="${this._panel(c)}">
                <div style="${this._sectionBar()}">
                    <div>
                        <div style="${this._eyebrow(c)}">Ranking</div>
                        <div style="${this._sectionTitle(c)}">Squads por pontuacao</div>
                    </div>
                    <button onclick="SquadsUI.loadRanking()" style="${this._btnGhost(c)}">Atualizar</button>
                </div>
                <div id="squad-ranking-list">
                    <div style="padding:1rem;text-align:center;color:${c.muted};font-size:0.78rem;">Carregando ranking...</div>
                </div>
            </section>

            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem;align-items:start;">
                <section style="${this._panel(c)}">
                    <div style="${this._sectionBar()}">
                        <div>
                            <div style="${this._eyebrow(c)}">Membros</div>
                            <div style="${this._sectionTitle(c)}">Lista do Cla</div>
                        </div>
                        <button onclick="SquadsUI.refresh()" style="${this._btnGhost(c)}">Atualizar</button>
                    </div>
                    <div id="squad-members-list">
                        ${this._renderMembersSkeleton(c)}
                    </div>
                </section>

                <div style="display:grid;gap:1rem;">
                    ${isLeader ? `<section style="${this._panel(c)}">
                        <div style="${this._sectionBar()}">
                            <div>
                                <div style="${this._eyebrow(c)}">Pedidos</div>
                                <div style="${this._sectionTitle(c)}">Entrada no cla</div>
                            </div>
                            <button onclick="SquadsUI.loadJoinRequests()" style="${this._btnGhost(c)}">Atualizar</button>
                        </div>
                        <div id="squad-join-requests-list">
                            <div style="padding:0.8rem;text-align:center;color:${c.muted};font-size:0.78rem;">Carregando pedidos...</div>
                        </div>
                    </section>` : ''}

                    <section style="${this._panel(c)}">
                        <div style="${this._sectionBar()}">
                            <div>
                                <div style="${this._eyebrow(c)}">Convites</div>
                                <div style="${this._sectionTitle(c)}">Convidar amigos</div>
                            </div>
                        </div>
                        <div id="squad-friends-invite-list">
                            <div style="padding:1rem;text-align:center;color:${c.muted};font-size:0.78rem;">Carregando amigos...</div>
                        </div>
                    </section>
                </div>
            </div>
        </div>`;
    },

    _renderMembersSkeleton(c) {
        return `<div style="padding:1rem;text-align:center;color:${c.muted};font-size:0.78rem;">Carregando membros...</div>`;
    },

    _renderSquadTabs(c) {
        const item = (label, target) => `<button onclick="document.getElementById('${target}')?.scrollIntoView({behavior:'smooth',block:'start'})" style="${this._btnGhost(c)}">${label}</button>`;
        return `<div style="display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center;padding:0.65rem;border:1px solid ${c.border};background:${c.bg};border-radius:16px;">
            ${item('Visao geral', 'squads-main-content')}
            ${item('Chat', 'squad-section-chat')}
            ${item('Mural', 'squad-feed-list')}
            ${item('Ranking', 'squad-section-ranking')}
        </div>`;
    },

    _renderChatPanel(c) {
        return `<section style="${this._panel(c)}min-height:420px;display:flex;flex-direction:column;">
            <div style="${this._sectionBar()}">
                <div>
                    <div style="${this._eyebrow(c)}">Chat</div>
                    <div style="${this._sectionTitle(c)}">Conversa do Cla</div>
                </div>
                <span id="squad-chat-live-pill" style="${this._pill('rgba(16,185,129,0.1)', 'rgba(16,185,129,0.24)', '#10b981')}">Ao vivo</span>
            </div>
            <div id="squad-chat-list" style="flex:1;min-height:260px;max-height:360px;overflow-y:auto;display:grid;align-content:start;gap:0.58rem;padding:0.2rem 0.15rem 0.7rem;">
                <div style="padding:1rem;text-align:center;color:${c.muted};font-size:0.78rem;">Carregando chat...</div>
            </div>
            <div style="display:flex;gap:0.55rem;align-items:flex-end;padding-top:0.75rem;border-top:1px solid ${c.border};">
                <textarea id="squad-chat-input" maxlength="${window.Squads?.MAX_MESSAGE_LENGTH || 500}"
                    onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();SquadsUI.sendSquadMessage();}"
                    placeholder="Mensagem para o squad"
                    style="flex:1;min-height:42px;max-height:104px;resize:vertical;box-sizing:border-box;padding:0.7rem 0.78rem;border-radius:13px;border:1px solid ${c.border};background:${c.input};color:${c.text};font-size:0.78rem;font-family:'DM Sans',sans-serif;line-height:1.35;outline:none;"></textarea>
                <button id="squad-chat-send" onclick="SquadsUI.sendSquadMessage()" style="${this._btnPrimary()}min-width:84px;">Enviar</button>
            </div>
        </section>`;
    },

    _renderFeedPanel(c) {
        return `<section style="${this._panel(c)}">
            <div style="${this._sectionBar()}">
                <div>
                    <div style="${this._eyebrow(c)}">Mural</div>
                    <div style="${this._sectionTitle(c)}">Eventos do Squad</div>
                </div>
            </div>
            <div id="squad-feed-list" style="display:grid;gap:0.55rem;max-height:260px;overflow-y:auto;">
                <div style="padding:0.9rem;text-align:center;color:${c.muted};font-size:0.78rem;">Carregando mural...</div>
            </div>
        </section>`;
    },

    _renderRecentActivityPanel(c) {
        return `<section style="${this._panel(c)}">
            <div style="${this._sectionBar()}">
                <div>
                    <div style="${this._eyebrow(c)}">Presenca</div>
                    <div style="${this._sectionTitle(c)}">Atividade recente</div>
                </div>
            </div>
            <div id="squad-activity-list" style="display:grid;gap:0.48rem;">
                <div style="padding:0.8rem;text-align:center;color:${c.muted};font-size:0.78rem;">Carregando atividade...</div>
            </div>
        </section>`;
    },

    async loadSquadSocial(force = false) {
        const chatList = document.getElementById('squad-chat-list');
        const feedList = document.getElementById('squad-feed-list');
        const activityList = document.getElementById('squad-activity-list');
        if (!window.Squads || (!chatList && !feedList && !activityList)) return;
        const c = this._colors(document.body.classList.contains('dark-theme'));

        try {
            const [messages, feed] = await Promise.all([
                window.Squads.listChatMessages({ force }),
                window.Squads.listFeed({ force }),
            ]);

            if (chatList) {
                chatList.innerHTML = messages.length
                    ? messages.map((message) => this._renderChatMessage(message, c)).join('')
                    : `<div style="padding:1rem;text-align:center;color:${c.muted};font-size:0.78rem;">Nenhuma mensagem ainda.</div>`;
                chatList.scrollTop = chatList.scrollHeight;
            }

            if (feedList) {
                feedList.innerHTML = feed.length
                    ? feed.map((item) => this._renderFeedItem(item, c)).join('')
                    : `<div style="padding:0.9rem;text-align:center;color:${c.muted};font-size:0.78rem;">O mural ainda esta vazio.</div>`;
            }

            if (activityList) this._renderRecentActivity(activityList, c);
        } catch (err) {
            const error = this._escape(err.message || 'Erro ao carregar social do cla.');
            if (chatList) chatList.innerHTML = `<div style="padding:1rem;text-align:center;color:#ef4444;font-size:0.78rem;">${error}</div>`;
            if (feedList) feedList.innerHTML = `<div style="padding:0.9rem;text-align:center;color:#ef4444;font-size:0.78rem;">${error}</div>`;
            if (activityList) activityList.innerHTML = `<div style="padding:0.8rem;text-align:center;color:#ef4444;font-size:0.78rem;">${error}</div>`;
        }
    },

    async loadRanking() {
        const list = document.getElementById('squad-ranking-list');
        if (!list || !window.Squads?.listSquadRanking) return;
        const c = this._colors(document.body.classList.contains('dark-theme'));

        try {
            const items = await window.Squads.listSquadRanking({ limit: 10 });
            if (!items.length) {
                list.innerHTML = `<div style="padding:1rem;text-align:center;color:${c.muted};font-size:0.78rem;">Nenhum squad no ranking ainda.</div>`;
                return;
            }
            list.innerHTML = `<div style="display:grid;gap:0.55rem;">${items.map((squad) => this._renderRankingItem(squad, c)).join('')}</div>`;
        } catch (err) {
            list.innerHTML = `<div style="padding:1rem;text-align:center;color:#ef4444;font-size:0.78rem;">${this._escape(err.message || 'Erro ao carregar ranking.')}</div>`;
        }
    },

    _renderRankingItem(squad, c) {
        return `<div style="display:grid;grid-template-columns:42px minmax(0,1fr) auto;gap:0.72rem;align-items:center;padding:0.72rem;border-radius:14px;border:1px solid ${squad.isCurrent ? 'rgba(168,85,247,0.32)' : c.border};background:${squad.isCurrent ? 'rgba(168,85,247,0.12)' : c.bg2};">
            <div style="width:34px;height:34px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:${squad.rank <= 3 ? 'rgba(245,158,11,0.14)' : 'rgba(148,163,184,0.12)'};color:${squad.rank <= 3 ? '#f59e0b' : c.sub};font-weight:900;">#${squad.rank}</div>
            <div style="min-width:0;">
                <div style="display:flex;align-items:center;gap:0.45rem;min-width:0;flex-wrap:wrap;">
                    <span style="font-size:0.84rem;font-weight:900;color:${c.text};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${this._escape(squad.name)}</span>
                    <span style="${this._pill('rgba(168,85,247,0.12)', 'rgba(168,85,247,0.24)', 'var(--theme-primary,#a855f7)')}">[${this._escape(squad.tag)}]</span>
                </div>
            </div>
            <div style="font-size:0.9rem;font-weight:900;color:${c.text};">${Number(squad.score || 0).toLocaleString('pt-BR')}</div>
        </div>`;
    },

    startSquadSocialLive() {
        const squad = window.Squads?.getCurrentSquadSync?.();
        if (!squad?.id || !window.Squads?.subscribeCurrentSquad) return;
        if (this._squadSocialUnsub && this._squadSocialId === squad.id) return;

        this.stopSquadSocialLive();
        this._squadSocialId = squad.id;

        try {
            this._squadSocialUnsub = window.Squads.subscribeCurrentSquad((updatedSquad) => {
                if (!document.getElementById('squad-chat-list')) {
                    this.stopSquadSocialLive();
                    this.stopSquadPresenceLive();
                    return;
                }

                if (!updatedSquad) {
                    this.refresh({ silent: true });
                    return;
                }

                this.renderSquadSocialFromSquad(updatedSquad);
            });
        } catch (err) {
            this._squadSocialUnsub = null;
            this._squadSocialId = null;
            console.warn('[SquadsUI] Listener social indisponivel:', err?.message || err);
        }
    },

    stopSquadSocialLive() {
        if (this._squadSocialUnsub) {
            try { this._squadSocialUnsub(); } catch (_) {}
        }
        this._squadSocialUnsub = null;
        this._squadSocialId = null;
    },

    renderSquadSocialFromSquad(squad) {
        const chatList = document.getElementById('squad-chat-list');
        const feedList = document.getElementById('squad-feed-list');
        if (!chatList && !feedList) return;

        const c = this._colors(document.body.classList.contains('dark-theme'));
        const messages = window.Squads?._normalizeMessages?.(squad.messages || []) || [];
        const feed = window.Squads?._normalizeFeed?.(squad.feed || []) || [];

        if (chatList) {
            const wasNearBottom = chatList.scrollHeight - chatList.scrollTop - chatList.clientHeight < 90;
            chatList.innerHTML = messages.length
                ? messages.map((message) => this._renderChatMessage(message, c)).join('')
                : `<div style="padding:1rem;text-align:center;color:${c.muted};font-size:0.78rem;">Nenhuma mensagem ainda.</div>`;
            if (wasNearBottom) chatList.scrollTop = chatList.scrollHeight;
        }

        if (feedList) {
            feedList.innerHTML = feed.length
                ? feed.map((item) => this._renderFeedItem(item, c)).join('')
                : `<div style="padding:0.9rem;text-align:center;color:${c.muted};font-size:0.78rem;">O mural ainda esta vazio.</div>`;
        }

        const activityStat = document.getElementById('squad-activity-stat');
        if (activityStat) activityStat.textContent = this._relativeTime(squad.lastActivityAt || squad.updatedAt);
        const scoreStat = document.getElementById('squad-score-stat');
        if (scoreStat) scoreStat.textContent = Number(squad.score || 0).toLocaleString('pt-BR');
        if (document.getElementById('squad-ranking-list')) this.loadRanking();
    },

    _renderChatMessage(message, c) {
        const isMine = message.userId === window.NyanAuth?.getUID?.();
        const member = this._memberProfiles.find((item) => item.userId === message.userId);
        const profile = member?.profile || {};
        const name = profile.username || profile.nyanTag || (isMine ? (window.NyanAuth?.getNyanTag?.() || 'Voce') : message.userId.slice(0, 8));
        return `<div style="display:flex;justify-content:${isMine ? 'flex-end' : 'flex-start'};">
            <div style="max-width:min(78%,520px);padding:0.68rem 0.78rem;border-radius:${isMine ? '15px 15px 4px 15px' : '15px 15px 15px 4px'};border:1px solid ${isMine ? 'rgba(168,85,247,0.28)' : c.border};background:${isMine ? 'rgba(168,85,247,0.14)' : c.bg2};box-shadow:inset 0 1px 0 rgba(255,255,255,0.03);">
                <div style="display:flex;align-items:center;gap:0.45rem;justify-content:space-between;margin-bottom:0.28rem;">
                    <span style="font-size:0.66rem;font-weight:900;color:${isMine ? 'var(--theme-primary,#a855f7)' : c.text};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${this._escape(name)}</span>
                    <span style="font-size:0.58rem;color:${c.muted};white-space:nowrap;">${this._formatTime(message.createdAt)}</span>
                </div>
                <div style="font-size:0.78rem;line-height:1.42;color:${c.text};white-space:pre-wrap;word-break:break-word;">${this._escape(message.content)}</div>
            </div>
        </div>`;
    },

    _renderFeedItem(item, c) {
        const accent = item.type === 'event' ? '#10b981' : 'var(--theme-primary,#a855f7)';
        const content = this._resolveFeedContent(item);
        return `<div style="display:flex;gap:0.62rem;padding:0.68rem;border:1px solid ${c.border};border-radius:14px;background:${c.bg2};">
            <div style="width:9px;height:9px;border-radius:999px;background:${accent};box-shadow:0 0 0 4px ${item.type === 'event' ? 'rgba(16,185,129,0.1)' : 'rgba(168,85,247,0.1)'};margin-top:0.28rem;flex-shrink:0;"></div>
            <div style="min-width:0;flex:1;">
                <div style="font-size:0.76rem;line-height:1.42;color:${c.text};font-weight:800;">${this._escape(content)}</div>
                <div style="font-size:0.62rem;color:${c.muted};margin-top:0.2rem;">${this._formatDateTime(item.createdAt)}</div>
            </div>
        </div>`;
    },

    _resolveFeedContent(item = {}) {
        const actor = this._displayNameByUserId(item.actorUserId) || item.actorLabel;
        if (item.action && actor) return `${actor} ${item.action}`;

        const content = String(item.content || '').trim();
        const match = content.match(/^(\S+)\s+(entrou|saiu)\s+no\s+cla\./i);
        if (!match) return content;

        const token = match[1];
        const action = match[2].toLowerCase();
        const known = this._displayNameByToken(token);
        const safeActor = known || (/^[a-z0-9_-]{6,28}$/i.test(token) && !token.includes('#') ? 'Membro' : token);
        return `${safeActor} ${action} no cla.`;
    },

    _displayNameByUserId(userId = '') {
        const uid = String(userId || '').trim();
        if (!uid) return '';
        const member = this._memberProfiles.find((item) => item.userId === uid);
        const profile = member?.profile || {};
        return profile.username || profile.nyanTag || '';
    },

    _displayNameByToken(token = '') {
        const safe = String(token || '').trim();
        if (!safe) return '';
        const lowered = safe.toLowerCase();
        const member = this._memberProfiles.find((item) => {
            const profile = item.profile || {};
            return String(item.userId || '').toLowerCase().startsWith(lowered)
                || String(profile.username || '').toLowerCase() === lowered
                || String(profile.nyanTag || '').toLowerCase() === lowered;
        });
        if (!member) return '';
        const profile = member.profile || {};
        return profile.username || profile.nyanTag || '';
    },

    _renderRecentActivity(container, c) {
        const members = this._memberProfiles || [];
        const rows = members
            .map((member) => {
                const profile = member.profile || {};
                const name = profile.username || profile.nyanTag || member.userId.slice(0, 8);
                const label = profile.presenceLabel || (profile.status ? this._escape(profile.status) : 'Sem atividade recente');
                const at = profile.presenceUpdated?.seconds ? profile.presenceUpdated.seconds * 1000 : profile.squadLastActivity;
                return { name, label, at, status: profile.status || 'offline' };
            })
            .sort((a, b) => Number(b.at || 0) - Number(a.at || 0))
            .slice(0, 5);

        if (!rows.length) {
            container.innerHTML = `<div style="padding:0.8rem;text-align:center;color:${c.muted};font-size:0.78rem;">Nenhuma atividade recente.</div>`;
            return;
        }

        container.innerHTML = rows.map((row) => `<div style="display:flex;align-items:center;gap:0.62rem;padding:0.62rem;border:1px solid ${c.border};background:${c.bg2};border-radius:13px;">
            <span style="width:8px;height:8px;border-radius:999px;background:${row.status === 'offline' ? c.muted : '#10b981'};flex-shrink:0;"></span>
            <div style="min-width:0;flex:1;">
                <div style="font-size:0.76rem;font-weight:900;color:${c.text};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${this._escape(row.name)}</div>
                <div style="font-size:0.64rem;color:${c.muted};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${this._escape(row.label)}${row.at ? ` &middot; ${this._relativeTime(row.at)}` : ''}</div>
            </div>
        </div>`).join('');
    },

    async sendSquadMessage() {
        const input = document.getElementById('squad-chat-input');
        const button = document.getElementById('squad-chat-send');
        const content = input?.value || '';
        if (!content.trim()) return;

        if (button) {
            button.disabled = true;
            button.style.opacity = '0.65';
        }

        try {
            await window.Squads.sendMessage(content);
            if (input) input.value = '';
            await this.loadSquadSocial(true);
        } catch (err) {
            window.Utils?.showNotification?.(err.message || 'Erro ao enviar mensagem.', 'error');
        } finally {
            if (button) {
                button.disabled = false;
                button.style.opacity = '1';
            }
        }
    },

    _miniStat(c) {
        return `display:flex;flex-direction:column;gap:0.18rem;padding:0.65rem 0.75rem;border-radius:14px;border:1px solid ${c.border};background:${c.d ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.76)'};font-size:0.66rem;color:${c.muted};box-shadow:inset 0 1px 0 rgba(255,255,255,0.04);`;
    },

    _pill(bg, border, color) {
        return `display:inline-flex;align-items:center;padding:0.25rem 0.58rem;border-radius:999px;background:${bg};border:1px solid ${border};color:${color};font-size:0.66rem;font-weight:900;letter-spacing:0.06em;`;
    },

    _panel(c) {
        return `background:${c.bg};border:1px solid ${c.border};border-radius:20px;padding:1rem;box-shadow:0 14px 38px rgba(0,0,0,0.1);`;
    },

    _sectionBar() {
        return 'display:flex;align-items:center;justify-content:space-between;gap:0.75rem;margin-bottom:0.85rem;';
    },

    _eyebrow(c) {
        return `font-size:0.62rem;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;color:${c.muted};`;
    },

    _sectionTitle(c) {
        return `font-family:'Syne',sans-serif;font-size:1.02rem;font-weight:900;color:${c.text};line-height:1.15;`;
    },

    _renderSquadImage(squad, c, size = 54) {
        const letter = this._escape((squad?.tag || squad?.name || 'C').charAt(0).toUpperCase());
        const base = `width:${size}px;height:${size}px;border-radius:18px;overflow:hidden;flex-shrink:0;border:1px solid rgba(255,255,255,0.12);background:${c.bg2};box-shadow:0 16px 35px rgba(0,0,0,0.2);`;
        if (squad?.imageUrl) {
            return `<div style="${base}"><img src="${this._escape(squad.imageUrl)}" alt="Imagem do clã" style="width:100%;height:100%;object-fit:cover;display:block;"/></div>`;
        }
        return `<div style="${base}display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:${Math.max(1.1, size / 34)}rem;font-weight:900;color:white;background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#06b6d4));">${letter}</div>`;
    },

    _renderPublicBrowser(c) {
        return `<section style="position:relative;overflow:hidden;background:${c.bg};border:1px solid ${c.border};border-radius:22px;padding:1rem;box-shadow:0 16px 44px rgba(0,0,0,0.12);">
            <div style="position:absolute;right:-135px;top:-150px;width:310px;height:310px;background:radial-gradient(circle,rgba(124,58,237,0.16),transparent 66%);pointer-events:none;"></div>
            <div style="position:relative;display:flex;align-items:flex-start;justify-content:space-between;gap:0.85rem;flex-wrap:wrap;margin-bottom:0.85rem;">
                <div style="min-width:0;">
                    <div style="${this._eyebrow(c)}">Explorar</div>
                    <div style="font-family:'Syne',sans-serif;font-size:1.2rem;font-weight:900;color:${c.text};line-height:1.1;">Clãs existentes</div>
                </div>
                <div style="display:flex;gap:0.5rem;align-items:center;min-width:min(100%,420px);flex:1;max-width:520px;flex-wrap:wrap;padding:0.45rem;border:1px solid ${c.border};background:${c.d ? 'rgba(0,0,0,0.14)' : 'rgba(248,250,252,0.86)'};border-radius:16px;">
                    <input id="squad-search-input" type="text" maxlength="40" value="${this._escape(this._browseQuery)}"
                        onkeydown="if(event.key==='Enter') SquadsUI.searchPublicSquads()"
                        placeholder="Procurar por nome ou tag"
                        style="flex:1 1 190px;min-width:0;box-sizing:border-box;padding:0.62rem 0.7rem;border-radius:12px;border:1px solid transparent;background:${c.input};color:${c.text};font-size:0.76rem;font-family:'DM Sans',sans-serif;outline:none;"/>
                    <button onclick="SquadsUI.searchPublicSquads()" style="${this._btnSecondary(c)}">Procurar</button>
                    <button onclick="SquadsUI.refreshPublicSquads(true)" style="${this._btnGhost(c)}">Ver outros</button>
                </div>
            </div>
            <div id="squad-public-list" style="position:relative;">
                ${this._renderPublicState(c, 'Carregando clãs...')}
            </div>
        </section>`;
    },

    _renderPublicState(c, text, type = 'empty') {
        const color = type === 'error' ? '#ef4444' : c.muted;
        return `<div style="display:flex;align-items:center;justify-content:center;min-height:116px;border:1px dashed ${c.border};border-radius:16px;background:${c.d ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.55)'};color:${color};font-size:0.78rem;text-align:center;padding:1rem;">${this._escape(text)}</div>`;
    },

    async refresh(options = {}) {
        const container = document.getElementById('squads-main-content');
        if (!container || !window.Squads) return;

        try {
            const squad = await window.Squads.getCurrentSquad({ force: true });
            const c = this._colors(document.body.classList.contains('dark-theme'));
            container.innerHTML = squad ? this._renderSquadHome(squad, c) : this._renderNoSquad(c);
            this._syncPublicBrowser(squad, c);
            if (squad) {
                this.loadMembers();
                this.loadJoinRequests();
                this.loadFriendInvites();
                this.loadSquadSocial();
                this.loadRanking();
                this.startSquadSocialLive();
            } else {
                this.stopSquadSocialLive();
                this.stopSquadPresenceLive();
                this.loadIncomingInvites();
                this.loadPublicSquads();
            }
            if (!options.silent) window.Utils?.showNotification?.('Clãs atualizados.', 'success');
        } catch (err) {
            if (!options.silent) window.Utils?.showNotification?.(err.message || 'Erro ao atualizar Clãs.', 'error');
        }
    },

    _syncPublicBrowser(squad, c) {
        const existing = document.getElementById('squad-public-browser');
        if (squad) {
            existing?.remove();
            return;
        }

        if (!existing) {
            const container = document.getElementById('squads-main-content');
            container?.insertAdjacentHTML('afterend', `<div id="squad-public-browser" style="margin-top:0.9rem;">${this._renderPublicBrowser(c)}</div>`);
        }
    },

    async searchPublicSquads() {
        this._browseQuery = document.getElementById('squad-search-input')?.value || '';
        this._browseOffset = 0;
        this._browseNextOffset = 0;
        await this.loadPublicSquads();
    },

    async refreshPublicSquads(advance = false) {
        if (advance) this._browseOffset = this._browseNextOffset || this._browseOffset + 10;
        await this.loadPublicSquads();
    },

    async loadPublicSquads() {
        const list = document.getElementById('squad-public-list');
        if (!list || !window.Squads) return;
        const c = this._colors(document.body.classList.contains('dark-theme'));

        try {
            const result = await window.Squads.listPublicSquads({
                search: this._browseQuery,
                offset: this._browseOffset,
                limit: 10,
            });
            this._browseOffset = result.offset || 0;
            this._browseNextOffset = result.nextOffset || 0;

            if (!result.items.length) {
                list.innerHTML = this._renderPublicState(c, this._browseQuery ? 'Nenhum clã encontrado com essa busca.' : 'Nenhum clã público apareceu agora.');
                return;
            }

            const currentSquad = window.Squads.getCurrentSquadSync();
            list.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:0.75rem;">${result.items.map((squad) => this._renderPublicSquad(squad, c, currentSquad)).join('')}</div>`;
        } catch (err) {
            list.innerHTML = this._renderPublicState(c, err.message || 'Erro ao carregar clãs.', 'error');
        }
    },

    _renderPublicSquad(squad, c, currentSquad) {
        const isMine = currentSquad?.id === squad.id;
        const hasSquad = !!currentSquad;
        const memberCount = (squad.members || []).length;
        const isFull = memberCount >= (window.Squads?.MAX_MEMBERS || 10);
        const privacy = squad.visibility === 'private' ? 'Privado' : 'Público';
        const members = `${memberCount}/${window.Squads.MAX_MEMBERS}`;
        const description = squad.description || (squad.visibility === 'private'
            ? 'Entrada por pedido. O lider precisa aprovar.'
            : 'Entrada livre por código de convite.');
        const action = isMine
            ? `<button disabled style="${this._btnDisabled(c)}width:100%;">Seu Clã</button>`
            : hasSquad
                ? `<button disabled style="${this._btnDisabled(c)}width:100%;">Já tem Clã</button>`
                : isFull
                    ? `<button disabled style="${this._btnDisabled(c)}width:100%;">Cheio</button>`
                    : squad.visibility === 'private'
                        ? `<button onclick="SquadsUI.requestJoin('${this._escape(squad.id)}')" style="${this._btnSecondary(c)}width:100%;">Solicitar entrada</button>`
                        : `<button onclick="SquadsUI.openJoinModal('${this._escape(squad.inviteCode)}')" style="${this._btnSecondary(c)}width:100%;">Entrar no clã</button>`;

        return `<article style="position:relative;overflow:hidden;display:grid;gap:0.78rem;padding:0.85rem;border:1px solid ${c.border};background:${c.bg2};border-radius:18px;min-height:174px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.04);">
            <div style="position:absolute;right:-70px;bottom:-78px;width:156px;height:156px;background:radial-gradient(circle,${squad.visibility === 'private' ? 'rgba(245,158,11,0.14)' : 'rgba(16,185,129,0.12)'},transparent 66%);pointer-events:none;"></div>
            <div style="position:relative;display:flex;align-items:flex-start;gap:0.72rem;min-width:0;">
                ${this._renderSquadImage(squad, c, 52)}
                <div style="min-width:0;flex:1;">
                    <div style="display:flex;align-items:center;gap:0.45rem;flex-wrap:wrap;margin-bottom:0.25rem;">
                        <span style="font-size:0.92rem;font-weight:900;color:${c.text};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:135px;">${this._escape(squad.name)}</span>
                        <span style="${this._pill('rgba(168,85,247,0.12)', 'rgba(168,85,247,0.24)', 'var(--theme-primary,#a855f7)')}">[${this._escape(squad.tag)}]</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:0.4rem;flex-wrap:wrap;">
                        <span style="${this._pill(squad.visibility === 'private' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', squad.visibility === 'private' ? 'rgba(245,158,11,0.24)' : 'rgba(16,185,129,0.24)', squad.visibility === 'private' ? '#f59e0b' : '#10b981')}">${privacy}</span>
                        <span style="font-size:0.66rem;color:${c.muted};font-weight:800;">${members} membros</span>
                    </div>
                </div>
            </div>
            <div style="position:relative;font-size:0.72rem;line-height:1.45;color:${c.sub};min-height:2.1rem;max-height:3.12rem;overflow:hidden;">
                ${this._escape(description)}
            </div>
            <div style="position:relative;display:grid;grid-template-columns:1fr;gap:0.5rem;margin-top:auto;">
                ${action}
            </div>
        </article>`;
    },

    async requestJoin(squadId) {
        try {
            await window.Squads.requestToJoin(squadId);
            window.Utils?.showNotification?.('Pedido enviado ao lider do cla.', 'success');
        } catch (err) {
            window.Utils?.showNotification?.(err.message || 'Erro ao solicitar entrada.', 'error');
        }
    },

    async loadJoinRequests() {
        const list = document.getElementById('squad-join-requests-list');
        if (!list || !window.Squads) return;
        const c = this._colors(document.body.classList.contains('dark-theme'));

        try {
            const requests = await window.Squads.listJoinRequests();
            if (!requests.length) {
                list.innerHTML = `<div style="padding:0.8rem;text-align:center;color:${c.muted};font-size:0.78rem;">Nenhum pedido pendente.</div>`;
                return;
            }

            list.innerHTML = requests.map((request) => {
                const name = request.username || request.nyanTag || request.userId?.slice(0, 8) || 'Usuario';
                return `<div style="display:flex;align-items:center;gap:0.72rem;padding:0.78rem;border:1px solid ${c.border};background:${c.bg2};border-radius:15px;margin-bottom:0.5rem;box-shadow:inset 0 1px 0 rgba(255,255,255,0.03);">
                    <div style="width:42px;height:42px;border-radius:14px;overflow:hidden;background:${c.bg};flex-shrink:0;">
                        ${request.avatar ? `<img src="${this._escape(request.avatar)}" style="width:100%;height:100%;object-fit:cover;" alt="Avatar"/>` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-weight:900;color:white;background:linear-gradient(135deg,#7c3aed,#06b6d4);">${this._escape(name.charAt(0).toUpperCase())}</div>`}
                    </div>
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:0.82rem;font-weight:800;color:${c.text};">${this._escape(name)}</div>
                        <div style="font-size:0.67rem;color:${c.muted};">${this._escape(request.nyanTag || request.userId || '')}</div>
                    </div>
                    <button onclick="SquadsUI.acceptJoinRequest('${this._escape(request.userId)}')" style="${this._btnSecondary(c)}">Aceitar</button>
                    <button onclick="SquadsUI.rejectJoinRequest('${this._escape(request.userId)}')" style="${this._btnGhost(c)}">Recusar</button>
                </div>`;
            }).join('');
        } catch (err) {
            list.innerHTML = `<div style="padding:0.8rem;text-align:center;color:#ef4444;font-size:0.78rem;">${this._escape(err.message || 'Erro ao carregar pedidos.')}</div>`;
        }
    },

    async acceptJoinRequest(uid) {
        try {
            await window.Squads.acceptJoinRequest(uid);
            window.Utils?.showNotification?.('Pedido aceito.', 'success');
            this.refresh({ silent: true });
        } catch (err) {
            window.Utils?.showNotification?.(err.message || 'Erro ao aceitar pedido.', 'error');
        }
    },

    async rejectJoinRequest(uid) {
        try {
            await window.Squads.rejectJoinRequest(uid);
            window.Utils?.showNotification?.('Pedido recusado.', 'success');
            this.loadJoinRequests();
        } catch (err) {
            window.Utils?.showNotification?.(err.message || 'Erro ao recusar pedido.', 'error');
        }
    },

    async loadMembers() {
        const list = document.getElementById('squad-members-list');
        if (!list || !window.Squads) return;
        const c = this._colors(document.body.classList.contains('dark-theme'));

        try {
            const members = await window.Squads.listMembers();
            this._memberProfiles = members;
            this.startSquadPresenceLive(members);
            if (!members.length) {
                list.innerHTML = `<div style="padding:1rem;text-align:center;color:${c.muted};font-size:0.78rem;">Nenhum membro encontrado.</div>`;
                return;
            }
            list.innerHTML = members.map((member) => this._renderMember(member, c)).join('');
            const activityList = document.getElementById('squad-activity-list');
            if (activityList) this._renderRecentActivity(activityList, c);
            const currentSquad = window.Squads?.getCurrentSquadSync?.();
            if (currentSquad) this.renderSquadSocialFromSquad(currentSquad);
        } catch (err) {
            list.innerHTML = `<div style="padding:1rem;text-align:center;color:#ef4444;font-size:0.78rem;">${this._escape(err.message || 'Erro ao listar membros.')}</div>`;
        }
    },

    startSquadPresenceLive(members = this._memberProfiles) {
        const squad = window.Squads?.getCurrentSquadSync?.();
        if (!squad?.id || !window.NyanFirebase?.isReady?.() || !window.NyanFirebase?.fn?.onSnapshot) return;
        if (this._squadPresenceId === squad.id && this._squadPresenceUnsubs.length) return;

        this.stopSquadPresenceLive();
        this._squadPresenceId = squad.id;

        members.forEach((member) => {
            if (!member?.userId) return;
            const unsub = window.NyanFirebase.fn.onSnapshot(
                window.NyanFirebase.docRef(`users/${member.userId}`),
                (snap) => {
                    if (!snap.exists()) return;
                    const profile = { id: snap.id, uid: snap.id, ...snap.data() };
                    const idx = this._memberProfiles.findIndex((item) => item.userId === member.userId);
                    if (idx >= 0) {
                        this._memberProfiles[idx] = { ...this._memberProfiles[idx], profile };
                    }

                    const activityList = document.getElementById('squad-activity-list');
                    if (activityList) {
                        const c = this._colors(document.body.classList.contains('dark-theme'));
                        this._renderRecentActivity(activityList, c);
                    }
                    const currentSquad = window.Squads?.getCurrentSquadSync?.();
                    if (currentSquad) this.renderSquadSocialFromSquad(currentSquad);
                },
                (err) => console.warn('[SquadsUI] Presenca do membro falhou:', err?.code || err?.message || err)
            );
            this._squadPresenceUnsubs.push(unsub);
            window.NyanFirebase._listeners?.push?.(unsub);
        });
    },

    stopSquadPresenceLive() {
        this._squadPresenceUnsubs.forEach((unsub) => {
            try { unsub(); } catch (_) {}
        });
        this._squadPresenceUnsubs = [];
        this._squadPresenceId = null;
    },

    _renderMember(member, c) {
        const profile = member.profile || {};
        const name = profile.username || profile.nyanTag || member.userId.slice(0, 8);
        const tag = profile.nyanTag || member.userId;
        const isLeader = member.role === 'leader';
        const currentSquad = window.Squads?.getCurrentSquadSync?.();
        const currentUID = window.NyanAuth?.getUID?.();
        const canKick = currentSquad?.ownerId === currentUID && member.userId !== currentUID && !isLeader;
        const joined = member.joinedAt
            ? new Date(member.joinedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })
            : '';
        const avatar = profile.avatar
            ? `<img src="${this._escape(profile.avatar)}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;" alt="Avatar"/>`
            : (window.AvatarGenerator
                ? window.AvatarGenerator.generate(name, 42)
                : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#7c3aed,#ec4899);color:white;font-weight:900;">${name.charAt(0).toUpperCase()}</div>`);

        return `
        <div style="display:flex;align-items:center;gap:0.78rem;padding:0.82rem;border:1px solid ${isLeader ? 'rgba(245,158,11,0.36)' : c.border};
            background:${isLeader ? 'linear-gradient(135deg,rgba(245,158,11,0.12),rgba(245,158,11,0.04))' : c.bg2};border-radius:16px;margin-bottom:0.55rem;box-shadow:${isLeader ? '0 10px 28px rgba(245,158,11,0.08)' : 'inset 0 1px 0 rgba(255,255,255,0.03)'};">
            <div style="width:46px;height:46px;border-radius:14px;overflow:hidden;flex-shrink:0;box-shadow:0 10px 24px rgba(0,0,0,0.14);">${avatar}</div>
            <div style="flex:1;min-width:0;">
                <div style="display:flex;align-items:center;gap:0.45rem;flex-wrap:wrap;">
                    <span style="font-size:0.84rem;font-weight:800;color:${c.text};">${this._escape(name)}</span>
                    <span style="font-size:0.58rem;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;color:${isLeader ? '#f59e0b' : c.muted};padding:0.18rem 0.42rem;border-radius:999px;background:${isLeader ? 'rgba(245,158,11,0.12)' : 'rgba(148,163,184,0.1)'};">
                        ${isLeader ? 'Leader' : 'Member'}
                    </span>
                </div>
                <div style="font-size:0.68rem;color:${c.muted};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                    ${this._escape(tag)}${joined ? ` · entrou em ${joined}` : ''}
                </div>
            </div>
            ${profile.uid ? `<button onclick="Friends.viewProfile('${profile.uid}')" style="${this._btnGhost(c)}">Perfil</button>` : ''}
            ${canKick ? `<button onclick="SquadsUI.confirmKick('${member.userId}')" style="${this._btnDanger()}">Expulsar</button>` : ''}
        </div>`;
    },

    async loadFriendInvites() {
        const list = document.getElementById('squad-friends-invite-list');
        if (!list || !window.Squads) return;
        const c = this._colors(document.body.classList.contains('dark-theme'));

        try {
            const friends = await window.Squads.getFriendProfiles();
            if (!friends.length) {
                list.innerHTML = `<div style="padding:1rem;text-align:center;color:${c.muted};font-size:0.78rem;">Adicione amigos para convidar para o Clã.</div>`;
                return;
            }

            const currentSquad = window.Squads.getCurrentSquadSync();
            const currentMemberIds = new Set((currentSquad?.members || []).map((member) => member.userId));
            list.innerHTML = friends.map((friend) => {
                const inSquad = currentMemberIds.has(friend.uid);
                return `<div style="display:flex;align-items:center;gap:0.7rem;padding:0.75rem;border:1px solid ${c.border};background:${c.bg2};border-radius:15px;margin-bottom:0.5rem;box-shadow:inset 0 1px 0 rgba(255,255,255,0.03);">
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:0.82rem;font-weight:800;color:${c.text};">${this._escape(friend.username || 'Usuario')}</div>
                        <div style="font-size:0.67rem;color:${c.muted};">${this._escape(friend.nyanTag || friend.uid)}</div>
                    </div>
                    <button ${inSquad ? 'disabled' : ''} onclick="SquadsUI.inviteFriend('${friend.uid}')"
                        style="${inSquad ? this._btnDisabled(c) : this._btnSecondary(c)}">${inSquad ? 'No Clã' : 'Convidar'}</button>
                </div>`;
            }).join('');
        } catch (err) {
            list.innerHTML = `<div style="padding:1rem;text-align:center;color:${c.muted};font-size:0.78rem;">Nao foi possivel carregar amigos.</div>`;
        }
    },

    async loadIncomingInvites() {
        const wrap = document.getElementById('squad-invites-content');
        if (!wrap || !window.NyanFirebase?.isReady?.()) return;
        const uid = window.NyanAuth?.getUID?.();
        if (!uid) return;
        const c = this._colors(document.body.classList.contains('dark-theme'));

        try {
            const { collection, getDocs } = window.NyanFirebase.fn;
            const snap = await getDocs(collection(window.NyanFirebase.db, `squadInvites/${uid}/inbox`));
            const rawInvites = snap.docs
                .map((doc) => ({ id: doc.id, ...doc.data() }))
                .filter((invite) => invite.status !== 'accepted')
                .sort((a, b) => (b.sentAt?.seconds || 0) - (a.sentAt?.seconds || 0))
                .slice(0, 4);
            const checks = await Promise.all(rawInvites.map(async (invite) => {
                if (!invite.squadId) return invite;
                const squad = await window.NyanFirebase.getDoc(`squads/${invite.squadId}`).catch(() => null);
                if (squad) return invite;
                await this.deleteInvite(invite.id, { silent: true });
                return null;
            }));
            const invites = checks.filter(Boolean);

            if (!invites.length) {
                wrap.innerHTML = '';
                return;
            }

            wrap.innerHTML = `<section style="background:${c.bg};border:1px solid ${c.border};border-radius:18px;padding:1rem;">
                <div style="font-size:0.62rem;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;color:${c.muted};margin-bottom:0.55rem;">Convites recebidos</div>
                ${invites.map((invite) => `
                    <div style="display:flex;align-items:center;gap:0.7rem;padding:0.7rem;border-radius:13px;background:${c.bg2};border:1px solid ${c.border};margin-bottom:0.45rem;">
                        <div style="flex:1;min-width:0;">
                            <div style="font-size:0.82rem;font-weight:800;color:${c.text};">${this._escape(invite.squadName || 'Clã')} [${this._escape(invite.squadTag || '---')}]</div>
                            <div style="font-size:0.67rem;color:${c.muted};">Enviado por ${this._escape(invite.fromTag || 'um amigo')}</div>
                        </div>
                        <button onclick="SquadsUI.openJoinModal('${this._escape(invite.inviteCode || '')}')" style="${this._btnSecondary(c)}">Entrar</button>
                        <button onclick="SquadsUI.deleteInvite('${this._escape(invite.id)}')" style="${this._btnGhost(c)}">Excluir</button>
                    </div>
                `).join('')}
            </section>`;
        } catch (err) {
            wrap.innerHTML = '';
        }
    },

    async deleteInvite(inviteId, options = {}) {
        const uid = window.NyanAuth?.getUID?.();
        const safeInviteId = String(inviteId || '').trim();
        if (!uid || !safeInviteId || !window.NyanFirebase?.isReady?.()) return false;

        try {
            await window.NyanFirebase.fn.deleteDoc(
                window.NyanFirebase.docRef(`squadInvites/${uid}/inbox/${safeInviteId}`)
            );
            if (!options.silent) {
                window.Utils?.showNotification?.('Convite excluido.', 'success');
                this.loadIncomingInvites();
            }
            return true;
        } catch (err) {
            if (!options.silent) window.Utils?.showNotification?.(err.message || 'Erro ao excluir convite.', 'error');
            return false;
        }
    },

    async deleteInvitesByCode(code) {
        const uid = window.NyanAuth?.getUID?.();
        const safeCode = String(code || '').trim().toUpperCase();
        if (!uid || !safeCode || !window.NyanFirebase?.isReady?.()) return;

        const { collection, getDocs } = window.NyanFirebase.fn;
        const snap = await getDocs(collection(window.NyanFirebase.db, `squadInvites/${uid}/inbox`)).catch(() => null);
        if (!snap) return;

        await Promise.all(snap.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((invite) => String(invite.inviteCode || '').trim().toUpperCase() === safeCode)
            .map((invite) => this.deleteInvite(invite.id, { silent: true })));
    },

    async inviteFriend(friendUid) {
        try {
            await window.Squads.inviteFriend(friendUid);
            window.Utils?.showNotification?.('Convite de Clã enviado.', 'success');
        } catch (err) {
            window.Utils?.showNotification?.(err.message || 'Erro ao enviar convite.', 'error');
        }
    },

    _imageIds(mode = 'custom') {
        return {
            input: `squad-${mode}-image`,
            file: `squad-${mode}-file`,
            preview: `squad-${mode}-image-preview`,
        };
    },

    openSquadImagePicker(mode = 'custom') {
        document.getElementById(this._imageIds(mode).file)?.click();
    },

    onSquadImageFileChange(event, mode = 'custom') {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 600 * 1024) {
            window.Utils?.showNotification?.('Imagem muito grande (max. 600KB).', 'warning');
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl = ev.target.result;
            const ids = this._imageIds(mode);
            const input = document.getElementById(ids.input);
            if (input) input.value = dataUrl;
            this._setSquadImagePreview(mode, dataUrl);
            event.target.value = '';
        };
        reader.readAsDataURL(file);
    },

    clearSquadImage(mode = 'custom') {
        const ids = this._imageIds(mode);
        const input = document.getElementById(ids.input);
        if (input) input.value = '';
        this._setSquadImagePreview(mode, '');
    },

    _setSquadImagePreview(mode = 'custom', image = '') {
        const preview = document.getElementById(this._imageIds(mode).preview);
        if (!preview) return;
        if (image) {
            preview.innerHTML = `<img src="${this._escape(image)}" style="width:100%;height:100%;object-fit:cover;" alt="Imagem do clã"/>`;
            preview.style.background = 'rgba(255,255,255,0.08)';
            return;
        }
        const squad = window.Squads?.getCurrentSquadSync?.();
        preview.innerHTML = this._escape(mode === 'create' ? 'C' : ((squad?.tag || squad?.name || 'C').charAt(0).toUpperCase()));
        preview.style.background = 'linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#06b6d4))';
        preview.style.display = 'flex';
        preview.style.alignItems = 'center';
        preview.style.justifyContent = 'center';
        preview.style.fontFamily = "'Syne',sans-serif";
        preview.style.fontWeight = '900';
        preview.style.color = 'white';
    },

    openCreateModal() {
        this._openModal({
            id: 'squad-create-modal',
            title: 'Criar Clã',
            body: `
                <div style="font-size:0.78rem;color:var(--squad-modal-sub);line-height:1.5;margin-bottom:0.9rem;">
                    Criar um Clã custa <strong>${window.Squads?.CREATE_COST || 500} Chips</strong>.
                    Esse valor vai para o cofre do clã.
                </div>
                <label style="${this._modalLabel()}">Nome</label>
                <input id="squad-create-name" type="text" maxlength="28" placeholder="Ex: Nyan Devs" style="${this._modalInput()}"/>
                <label style="${this._modalLabel()}">Tag</label>
                <input id="squad-create-tag" type="text" maxlength="5" placeholder="NYA" style="${this._modalInput()};text-transform:uppercase;letter-spacing:0.08em;"/>
                <label style="${this._modalLabel()}">Descricao</label>
                <textarea id="squad-create-description" maxlength="180" placeholder="Sobre o seu Cla"
                    style="${this._modalInput()};min-height:76px;resize:vertical;line-height:1.4;"></textarea>
                <label style="${this._modalLabel()}">Imagem</label>
                <div style="${this._modalMediaBox()}">
                    <div id="squad-create-image-preview" style="${this._modalImagePreview()}">C</div>
                    <div style="display:grid;gap:0.5rem;min-width:0;flex:1;">
                        <input id="squad-create-image" type="hidden" value=""/>
                        <input id="squad-create-file" type="file" accept="image/*" style="display:none" onchange="SquadsUI.onSquadImageFileChange(event, 'create')"/>
                        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                            <button type="button" onclick="SquadsUI.openSquadImagePicker('create')" style="${this._btnSecondary(this._colors(document.body.classList.contains('dark-theme')))}">Escolher foto</button>
                            <button type="button" onclick="SquadsUI.clearSquadImage('create')" style="${this._btnGhost(this._colors(document.body.classList.contains('dark-theme')))}">Remover</button>
                        </div>
                        <div style="font-size:0.66rem;color:var(--squad-modal-sub);">JPG, PNG ou GIF ate 600KB.</div>
                    </div>
                </div>
                <label style="${this._modalLabel()}">Privacidade</label>
                <div style="${this._modalChoiceGrid()}">
                    <label style="${this._modalChoiceCard()}">
                        <input type="radio" name="squad-create-visibility" value="public" checked style="accent-color:var(--theme-primary,#a855f7);"/>
                        <span style="display:grid;gap:0.16rem;line-height:1.25;"><strong style="font-size:0.78rem;color:var(--squad-modal-text);">Publico</strong><small style="font-size:0.66rem;color:var(--squad-modal-sub);">Entrada livre pelo codigo</small></span>
                    </label>
                    <label style="${this._modalChoiceCard()}">
                        <input type="radio" name="squad-create-visibility" value="private" style="accent-color:var(--theme-primary,#a855f7);"/>
                        <span style="display:grid;gap:0.16rem;line-height:1.25;"><strong style="font-size:0.78rem;color:var(--squad-modal-text);">Privado</strong><small style="font-size:0.66rem;color:var(--squad-modal-sub);">Lider aprova pedidos</small></span>
                    </label>
                </div>
                <div id="squad-create-status" style="min-height:1rem;font-size:0.72rem;margin-top:0.7rem;color:var(--squad-modal-sub);"></div>
            `,
            footer: `
                <button onclick="document.getElementById('squad-create-modal').remove()" style="${this._modalCancelBtn()}">Cancelar</button>
                <button onclick="SquadsUI.submitCreate()" style="${this._modalPrimaryBtn()}">Criar</button>
            `,
        });
        setTimeout(() => document.getElementById('squad-create-name')?.focus(), 40);
    },

    async submitCreate() {
        const status = document.getElementById('squad-create-status');
        const name = document.getElementById('squad-create-name')?.value || '';
        const tag = document.getElementById('squad-create-tag')?.value || '';
        const description = document.getElementById('squad-create-description')?.value || '';
        const imageUrl = document.getElementById('squad-create-image')?.value || '';
        const visibility = document.querySelector('input[name="squad-create-visibility"]:checked')?.value || 'public';
        this._setStatus(status, 'Criando Clã...', 'info');

        try {
            const squad = await window.Squads.createSquad({ name, tag, description, imageUrl, visibility });
            document.getElementById('squad-create-modal')?.remove();
            window.Utils?.showNotification?.(`Clã ${squad.tag} criado!`, 'success');
            this.refresh({ silent: true });
            window.Presence?.updateFromRoute?.(window.Router?.currentRoute || 'squads');
        } catch (err) {
            this._setStatus(status, err.message || 'Erro ao criar Clã.', 'error');
        }
    },

    openJoinModal(defaultCode = '') {
        this._openModal({
            id: 'squad-join-modal',
            title: 'Entrar no Clã',
            body: `
                <label style="${this._modalLabel()}">Codigo de convite</label>
                <input id="squad-join-code" type="text" maxlength="6" value="${this._escape(defaultCode)}" placeholder="ABC123"
                    style="${this._modalInput()};text-transform:uppercase;letter-spacing:0.12em;font-weight:900;"/>
                <div id="squad-join-status" style="min-height:1rem;font-size:0.72rem;margin-top:0.7rem;color:var(--squad-modal-sub);"></div>
            `,
            footer: `
                <button onclick="document.getElementById('squad-join-modal').remove()" style="${this._modalCancelBtn()}">Cancelar</button>
                <button onclick="SquadsUI.submitJoin()" style="${this._modalPrimaryBtn()}">Entrar</button>
            `,
        });
        setTimeout(() => document.getElementById('squad-join-code')?.focus(), 40);
    },

    async submitJoin() {
        const status = document.getElementById('squad-join-status');
        const code = document.getElementById('squad-join-code')?.value || '';
        this._setStatus(status, 'Validando codigo...', 'info');

        try {
            const result = await window.Squads.joinByCode(code);
            const squad = result?.squad || result;
            if (result?.pending) {
                await this.deleteInvitesByCode(code);
                document.getElementById('squad-join-modal')?.remove();
                window.Utils?.showNotification?.(`Pedido enviado para ${squad.name}.`, 'success');
                return;
            }
            await this.deleteInvitesByCode(code);
            document.getElementById('squad-join-modal')?.remove();
            window.Utils?.showNotification?.(`Voce entrou em ${squad.name}.`, 'success');
            this.refresh({ silent: true });
            window.Presence?.updateFromRoute?.(window.Router?.currentRoute || 'squads');
        } catch (err) {
            this._setStatus(status, err.message || 'Erro ao entrar no Clã.', 'error');
        }
    },

    openCustomizeModal() {
        const squad = window.Squads?.getCurrentSquadSync?.();
        const isPrivate = squad?.visibility === 'private';
        this._openModal({
            id: 'squad-customize-modal',
            title: 'Personalizar clã',
            body: `
                <div style="display:flex;align-items:center;gap:0.75rem;padding:0.72rem;border-radius:16px;background:linear-gradient(135deg,rgba(124,58,237,0.14),rgba(6,182,212,0.08));border:1px solid rgba(168,85,247,0.18);margin-bottom:0.95rem;">
                    ${this._renderSquadImage(squad || {}, this._colors(document.body.classList.contains('dark-theme')), 52)}
                    <div style="min-width:0;">
                        <div style="font-family:'Syne',sans-serif;font-size:0.96rem;font-weight:900;color:var(--squad-modal-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${this._escape(squad?.name || 'Clã')}</div>
                        <div style="font-size:0.68rem;color:var(--squad-modal-sub);font-weight:800;letter-spacing:0.06em;">[${this._escape(squad?.tag || '---')}]</div>
                    </div>
                </div>
                <label style="${this._modalLabel()}">Descricao</label>
                <textarea id="squad-custom-description" maxlength="180"
                    placeholder="Conte o estilo, objetivo ou regras do clã"
                    style="${this._modalInput()};min-height:104px;resize:vertical;line-height:1.45;">${this._escape(squad?.description || '')}</textarea>
                <label style="${this._modalLabel()}">Imagem</label>
                <div style="${this._modalMediaBox()}">
                    <div id="squad-custom-image-preview" style="${this._modalImagePreview()}">
                        ${squad?.imageUrl ? `<img src="${this._escape(squad.imageUrl)}" style="width:100%;height:100%;object-fit:cover;" alt="Imagem do clã"/>` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:900;color:white;background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#06b6d4));">${this._escape((squad?.tag || 'C').charAt(0))}</div>`}
                    </div>
                    <div style="display:grid;gap:0.5rem;min-width:0;flex:1;">
                        <input id="squad-custom-image" type="hidden" value="${this._escape(squad?.imageUrl || '')}"/>
                        <input id="squad-custom-file" type="file" accept="image/*" style="display:none" onchange="SquadsUI.onSquadImageFileChange(event, 'custom')"/>
                        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                            <button type="button" onclick="SquadsUI.openSquadImagePicker('custom')" style="${this._btnSecondary(this._colors(document.body.classList.contains('dark-theme')))}">Escolher foto</button>
                            <button type="button" onclick="SquadsUI.clearSquadImage('custom')" style="${this._btnGhost(this._colors(document.body.classList.contains('dark-theme')))}">Remover</button>
                        </div>
                        <div style="font-size:0.66rem;color:var(--squad-modal-sub);">JPG, PNG ou GIF ate 600KB.</div>
                    </div>
                </div>
                <label style="${this._modalLabel()}">Privacidade</label>
                <div style="${this._modalChoiceGrid()}">
                    <label style="${this._modalChoiceCard()}">
                        <input type="radio" name="squad-custom-visibility" value="public" ${!isPrivate ? 'checked' : ''} style="accent-color:var(--theme-primary,#a855f7);"/>
                        <span style="display:grid;gap:0.16rem;line-height:1.25;"><strong style="font-size:0.78rem;color:var(--squad-modal-text);">Publico</strong><small style="font-size:0.66rem;color:var(--squad-modal-sub);">Entrada livre pelo codigo</small></span>
                    </label>
                    <label style="${this._modalChoiceCard()}">
                        <input type="radio" name="squad-custom-visibility" value="private" ${isPrivate ? 'checked' : ''} style="accent-color:var(--theme-primary,#a855f7);"/>
                        <span style="display:grid;gap:0.16rem;line-height:1.25;"><strong style="font-size:0.78rem;color:var(--squad-modal-text);">Privado</strong><small style="font-size:0.66rem;color:var(--squad-modal-sub);">Lider aprova pedidos</small></span>
                    </label>
                </div>
                <div id="squad-custom-status" style="min-height:1rem;font-size:0.72rem;margin-top:0.7rem;color:var(--squad-modal-sub);"></div>
            `,
            footer: `
                <button onclick="document.getElementById('squad-customize-modal').remove()" style="${this._modalCancelBtn()}">Cancelar</button>
                <button onclick="SquadsUI.submitCustomize()" style="${this._modalPrimaryBtn()}">Salvar</button>
            `,
        });
        setTimeout(() => document.getElementById('squad-custom-description')?.focus(), 40);
    },

    async submitCustomize() {
        const status = document.getElementById('squad-custom-status');
        const description = document.getElementById('squad-custom-description')?.value || '';
        const imageUrl = document.getElementById('squad-custom-image')?.value || '';
        const visibility = document.querySelector('input[name="squad-custom-visibility"]:checked')?.value || 'public';
        this._setStatus(status, 'Salvando...', 'info');
        try {
            await window.Squads.updateSettings({ description, imageUrl, visibility });
            document.getElementById('squad-customize-modal')?.remove();
            window.Utils?.showNotification?.('Cla atualizado.', 'success');
            this.refresh({ silent: true });
        } catch (err) {
            this._setStatus(status, err.message || 'Erro ao personalizar cla.', 'error');
        }
    },

    openDescriptionModal() {
        const squad = window.Squads?.getCurrentSquadSync?.();
        this._openModal({
            id: 'squad-description-modal',
            title: 'Descricao do Clã',
            body: `
                <label style="${this._modalLabel()}">Descricao</label>
                <textarea id="squad-description-input" maxlength="180"
                    style="${this._modalInput()};min-height:92px;resize:vertical;line-height:1.4;">${this._escape(squad?.description || '')}</textarea>
                <div id="squad-description-status" style="min-height:1rem;font-size:0.72rem;margin-top:0.7rem;color:var(--squad-modal-sub);"></div>
            `,
            footer: `
                <button onclick="document.getElementById('squad-description-modal').remove()" style="${this._modalCancelBtn()}">Cancelar</button>
                <button onclick="SquadsUI.submitDescription()" style="${this._modalPrimaryBtn()}">Salvar</button>
            `,
        });
        setTimeout(() => document.getElementById('squad-description-input')?.focus(), 40);
    },

    async submitDescription() {
        const status = document.getElementById('squad-description-status');
        const description = document.getElementById('squad-description-input')?.value || '';
        this._setStatus(status, 'Salvando...', 'info');
        try {
            await window.Squads.updateDescription(description);
            document.getElementById('squad-description-modal')?.remove();
            window.Utils?.showNotification?.('Descricao do Clã atualizada.', 'success');
            this.refresh({ silent: true });
        } catch (err) {
            this._setStatus(status, err.message || 'Erro ao atualizar descricao.', 'error');
        }
    },

    confirmKick(uid) {
        const member = this._memberProfiles.find((item) => item.userId === uid);
        const profile = member?.profile || {};
        const name = profile.username || profile.nyanTag || member?.userId?.slice(0, 8) || 'membro';
        this._openModal({
            id: 'squad-kick-modal',
            title: 'Expulsar membro?',
            body: `<div style="font-size:0.82rem;color:var(--squad-modal-sub);line-height:1.55;">
                Remover <strong>${this._escape(name)}</strong> do Clã.
            </div>
            <div id="squad-kick-status" style="min-height:1rem;font-size:0.72rem;margin-top:0.7rem;color:var(--squad-modal-sub);"></div>`,
            footer: `
                <button onclick="document.getElementById('squad-kick-modal').remove()" style="${this._modalCancelBtn()}">Cancelar</button>
                <button onclick="SquadsUI.submitKick('${this._escape(uid)}')" style="${this._modalDangerBtn()}">Expulsar</button>
            `,
        });
    },

    async submitKick(uid) {
        const status = document.getElementById('squad-kick-status');
        this._setStatus(status, 'Removendo...', 'info');
        try {
            await window.Squads.kickMember(uid);
            document.getElementById('squad-kick-modal')?.remove();
            window.Utils?.showNotification?.('Membro expulso do Clã.', 'success');
            this.refresh({ silent: true });
        } catch (err) {
            this._setStatus(status, err.message || 'Erro ao expulsar membro.', 'error');
        }
    },

    confirmDeleteSquad() {
        this._openModal({
            id: 'squad-delete-modal',
            title: 'Excluir clã?',
            body: `<div style="font-size:0.82rem;color:var(--squad-modal-sub);line-height:1.55;">
                Essa acao remove o clã para todos os membros e nao pode ser desfeita.
            </div>
            <div id="squad-delete-status" style="min-height:1rem;font-size:0.72rem;margin-top:0.7rem;color:var(--squad-modal-sub);"></div>`,
            footer: `
                <button onclick="document.getElementById('squad-delete-modal').remove()" style="${this._modalCancelBtn()}">Cancelar</button>
                <button onclick="SquadsUI.submitDeleteSquad()" style="${this._modalDangerBtn()}">Excluir</button>
            `,
        });
    },

    async submitDeleteSquad() {
        const status = document.getElementById('squad-delete-status');
        this._setStatus(status, 'Excluindo...', 'info');
        try {
            await window.Squads.deleteCurrentSquad();
            document.getElementById('squad-delete-modal')?.remove();
            window.Utils?.showNotification?.('Clã excluido.', 'success');
            this.refresh({ silent: true });
            window.Presence?.updateFromRoute?.(window.Router?.currentRoute || 'squads');
        } catch (err) {
            this._setStatus(status, err.message || 'Erro ao excluir clã.', 'error');
        }
    },

    confirmLeave() {
        const squad = window.Squads?.getCurrentSquadSync?.();
        const uid = window.NyanAuth?.getUID?.();
        const isLeader = squad?.ownerId === uid;
        const bodyText = isLeader
            ? 'A liderança sera transferida para outro membro antes de voce sair.'
            : 'Voce saira do Clã atual. Nao ha penalidade.';
        this._openModal({
            id: 'squad-leave-modal',
            title: isLeader ? 'Passar liderança e sair?' : 'Sair do Clã?',
            body: `<div style="font-size:0.82rem;color:var(--squad-modal-sub);line-height:1.55;">
                ${bodyText}
            </div>
            <div id="squad-leave-status" style="min-height:1rem;font-size:0.72rem;margin-top:0.7rem;color:var(--squad-modal-sub);"></div>`,
            footer: `
                <button onclick="document.getElementById('squad-leave-modal').remove()" style="${this._modalCancelBtn()}">Cancelar</button>
                <button onclick="SquadsUI.submitLeave()" style="${this._modalDangerBtn()}">${isLeader ? 'Passar e sair' : 'Sair'}</button>
            `,
        });
    },

    async submitLeave() {
        const status = document.getElementById('squad-leave-status');
        this._setStatus(status, 'Saindo...', 'info');
        try {
            await window.Squads.leaveCurrentSquad();
            document.getElementById('squad-leave-modal')?.remove();
            window.Utils?.showNotification?.('Voce saiu do Clã.', 'success');
            this.refresh({ silent: true });
            window.Presence?.updateFromRoute?.(window.Router?.currentRoute || 'squads');
        } catch (err) {
            this._setStatus(status, err.message || 'Erro ao sair do Clã.', 'error');
        }
    },

    _openModal({ id, title, body, footer }) {
        document.getElementById(id)?.remove();
        const d = document.body.classList.contains('dark-theme');
        const bg = d ? '#101827' : '#ffffff';
        const text = d ? '#f8fafc' : '#0f172a';
        const sub = d ? 'rgba(255,255,255,0.58)' : 'rgba(15,23,42,0.58)';
        const border = d ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)';

        const modal = document.createElement('div');
        modal.id = id;
        modal.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.72);padding:1rem;backdrop-filter:blur(8px);';
        modal.innerHTML = `
            <div style="--squad-modal-sub:${sub};--squad-modal-text:${text};position:relative;overflow:hidden;background:linear-gradient(145deg,${bg},${d ? '#0d1422' : '#f8fafc'});border:1px solid ${border};border-radius:22px;padding:1.15rem;width:100%;max-width:460px;max-height:92vh;overflow-y:auto;box-shadow:0 32px 95px rgba(0,0,0,0.52);font-family:'DM Sans',sans-serif;color:${text};">
                <div style="position:absolute;right:-86px;top:-104px;width:220px;height:220px;background:radial-gradient(circle,rgba(124,58,237,0.24),transparent 66%);pointer-events:none;"></div>
                <div style="position:relative;display:flex;align-items:center;justify-content:space-between;gap:0.8rem;margin-bottom:1rem;">
                    <div>
                        <div style="font-family:'Syne',sans-serif;font-size:1.16rem;font-weight:900;color:${text};line-height:1.05;">${title}</div>
                        <div style="height:3px;width:42px;border-radius:999px;background:linear-gradient(90deg,var(--theme-primary,#a855f7),var(--theme-secondary,#06b6d4));margin-top:0.45rem;"></div>
                    </div>
                    <button onclick="document.getElementById('${id}').remove()" style="width:34px;height:34px;border-radius:11px;border:1px solid ${border};background:${d ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)'};color:${sub};font-size:1rem;font-weight:900;cursor:pointer;">X</button>
                </div>
                <div style="position:relative;">${body}</div>
                <div style="position:relative;display:flex;gap:0.65rem;margin-top:1rem;padding-top:1rem;border-top:1px solid ${border};">${footer}</div>
            </div>`;
        modal.addEventListener('click', (event) => {
            if (event.target === modal) modal.remove();
        });
        document.body.appendChild(modal);
    },

    _setStatus(el, text, type = 'info') {
        if (!el) return;
        const color = type === 'error' ? '#ef4444' : (type === 'success' ? '#10b981' : 'var(--squad-modal-sub)');
        el.style.color = color;
        el.textContent = text;
    },

    _renderOfflineState() {
        return `<div style="text-align:center;padding:3rem;font-family:'DM Sans',sans-serif;">
            <div style="font-size:2rem;margin-bottom:0.75rem;">◇</div>
            <div style="font-weight:800;">Clãs precisam da conta online.</div>
        </div>`;
    },

    _escape(value = '') {
        return window.Utils?.escapeHTML?.(String(value || '')) || String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    _formatTime(timestamp) {
        const value = Number(timestamp || 0);
        if (!value) return '';
        return new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    },

    _formatDateTime(timestamp) {
        const value = Number(timestamp || 0);
        if (!value) return '';
        return new Date(value).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    },

    _relativeTime(timestamp) {
        const value = Number(timestamp || 0);
        if (!value) return 'sem registro';
        const diff = Math.max(0, Date.now() - value);
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'agora';
        if (minutes < 60) return `${minutes}min`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d`;
        return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    },

    _btnPrimary() {
        return "display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:0.68rem 1rem;border-radius:12px;border:none;background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));color:white;font-size:0.8rem;font-weight:900;cursor:pointer;font-family:'DM Sans',sans-serif;box-shadow:0 12px 26px rgba(124,58,237,0.22);";
    },

    _btnSecondary(c) {
        return `display:inline-flex;align-items:center;justify-content:center;min-height:36px;padding:0.58rem 0.9rem;border-radius:11px;border:1px solid rgba(168,85,247,0.25);background:rgba(168,85,247,0.12);color:var(--theme-primary,#a855f7);font-size:0.76rem;font-weight:900;cursor:pointer;font-family:'DM Sans',sans-serif;`;
    },

    _btnGhost(c) {
        return `display:inline-flex;align-items:center;justify-content:center;min-height:34px;padding:0.46rem 0.72rem;border-radius:10px;border:1px solid ${c.border};background:${c.bg2};color:${c.sub};font-size:0.7rem;font-weight:900;cursor:pointer;font-family:'DM Sans',sans-serif;`;
    },

    _btnDanger() {
        return "display:inline-flex;align-items:center;justify-content:center;min-height:36px;padding:0.58rem 0.9rem;border-radius:11px;border:1px solid rgba(239,68,68,0.25);background:rgba(239,68,68,0.1);color:#ef4444;font-size:0.76rem;font-weight:900;cursor:pointer;font-family:'DM Sans',sans-serif;";
    },

    _btnDisabled(c) {
        return `display:inline-flex;align-items:center;justify-content:center;min-height:36px;padding:0.58rem 0.9rem;border-radius:11px;border:1px solid ${c.border};background:${c.bg2};color:${c.muted};font-size:0.76rem;font-weight:900;cursor:not-allowed;font-family:'DM Sans',sans-serif;`;
    },

    _modalLabel() {
        return "display:block;font-size:0.62rem;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;color:var(--squad-modal-sub);margin:0.95rem 0 0.42rem;";
    },

    _modalInput() {
        return "width:100%;box-sizing:border-box;padding:0.78rem 0.86rem;border-radius:13px;border:1.5px solid rgba(168,85,247,0.24);background:rgba(168,85,247,0.07);color:inherit;font-size:0.86rem;font-family:'DM Sans',sans-serif;outline:none;box-shadow:inset 0 1px 0 rgba(255,255,255,0.04);";
    },

    _modalMediaBox() {
        return "display:flex;align-items:center;gap:0.85rem;padding:0.78rem;border-radius:17px;border:1px solid rgba(168,85,247,0.22);background:linear-gradient(135deg,rgba(168,85,247,0.11),rgba(6,182,212,0.05));";
    },

    _modalImagePreview() {
        return "width:76px;height:76px;border-radius:18px;overflow:hidden;flex-shrink:0;background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#06b6d4));display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:1.55rem;font-weight:900;color:white;box-shadow:0 14px 30px rgba(0,0,0,0.2);";
    },

    _modalChoiceGrid() {
        return "display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:0.55rem;";
    },

    _modalChoiceCard() {
        return "display:flex;align-items:flex-start;gap:0.55rem;padding:0.72rem;border-radius:14px;border:1px solid rgba(168,85,247,0.2);background:rgba(168,85,247,0.07);cursor:pointer;";
    },

    _modalCancelBtn() {
        return "flex:1;min-height:42px;padding:0.72rem;border-radius:12px;border:1px solid rgba(148,163,184,0.25);background:rgba(148,163,184,0.1);color:var(--squad-modal-sub);font-weight:900;cursor:pointer;font-family:'DM Sans',sans-serif;";
    },

    _modalPrimaryBtn() {
        return "flex:1;min-height:42px;padding:0.72rem;border-radius:12px;border:none;background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));color:white;font-weight:900;cursor:pointer;font-family:'DM Sans',sans-serif;box-shadow:0 14px 28px rgba(124,58,237,0.26);";
    },

    _modalDangerBtn() {
        return "flex:1;min-height:42px;padding:0.72rem;border-radius:12px;border:none;background:#ef4444;color:white;font-weight:900;cursor:pointer;font-family:'DM Sans',sans-serif;box-shadow:0 14px 28px rgba(239,68,68,0.22);";
    },
};

window.SquadsUI = SquadsUI;
