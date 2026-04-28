const SquadsUI = {
    _memberProfiles: [],
    _activeTab: 'overview',
    _showAllGoals: false,
    _browseOffset: 0,
    _browseNextOffset: 0,
    _browseQuery: '',
    _squadSocialUnsub: null,
    _squadSocialId: null,
    _squadPresenceUnsubs: [],
    _squadPresenceId: null,
    _overviewLoading: false,
    _goalsLoading: false,
    _challengesLoading: false,
    MAX_RENDERED_MESSAGES: 60,
    MAX_RENDERED_FEED: 40,
    MAX_RENDERED_CHALLENGES: 12,
    MAX_RENDERED_MEMBERS: 30,

    render() {
        if (!window.NyanAuth?.isOnline?.()) {
            return window.Friends?._renderOfflineState?.() || this._renderOfflineState();
        }

        const squad = window.Squads?.getCurrentSquadSync?.() || null;
        const d = document.body.classList.contains('dark-theme');
        const c = this._colors(d);

        return `
        <div id="squads-design-root" style="max-width:1180px;margin:0 auto;font-family:'DM Sans',sans-serif;background:${c.page};box-shadow:0 0 0 100vmax ${c.page};border-radius:0;padding:1rem 0 1.2rem;box-sizing:border-box;">
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
        clearTimeout(this._loadPublicTimer);
        this._loadPublicTimer = setTimeout(() => {
            if (!window.Squads?.getCurrentSquadSync?.()) this.loadPublicSquads();
        }, 120);
        window.NyanLifecycle?.trackCleanup?.('route:squads', () => this.cleanup());
    },

    _colors(d) {
        return {
            d,
            page: d ? '#1E1F2B' : '#f4f6fb',
            bg: d ? '#2A2B3C' : '#ffffff',
            bg2: d ? '#252636' : '#f8fafc',
            border: d ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.08)',
            text: d ? '#f1f5f9' : '#0f172a',
            sub: d ? 'rgba(255,255,255,0.58)' : 'rgba(15,23,42,0.58)',
            muted: d ? 'rgba(255,255,255,0.34)' : 'rgba(15,23,42,0.38)',
            input: d ? '#242536' : '#f4f4f9',
        };
    },

    _renderHeader(c) {
        return `
        <div style="text-align:center;margin-bottom:1.35rem;">
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
                <div style="display:grid;gap:0.65rem;align-content:center;padding:0.85rem;border-radius:12px;border:1px solid ${c.border};background:${c.bg};">
                    <button onclick="SquadsUI.openCreateModal()" style="${this._btnPrimary()}width:100%;">Criar Clã</button>
                    <button onclick="SquadsUI.openJoinModal()" style="${this._btnSecondary(c)}width:100%;">Entrar com código</button>
                    <div style="font-size:0.68rem;color:${c.muted};line-height:1.4;text-align:center;">
                        Criar custa <strong style="color:${c.text};">${cost}</strong> chips e vira cofre do clã.
                    </div>
                </div>
            </div>
        </section>`;
    },

    _renderSquadHome(squad, c) {
        const isLeader = squad.members?.find((m) => m.userId === window.NyanAuth?.getUID?.())?.role === 'leader';
        if (!this._tabs().some((tab) => tab.id === this._activeTab)) this._activeTab = 'overview';
        return `
        ${this._renderHubStyles()}
        <div style="display:grid;grid-template-columns:minmax(0,1fr);gap:1rem;">
            ${this._renderSquadHero(squad, c, isLeader)}
            <div id="squad-hub-layout" style="display:grid;grid-template-columns:minmax(0,2fr) minmax(300px,1fr);gap:20px;align-items:start;background:transparent;">
                <main id="squad-hub-main" style="min-width:0;display:grid;gap:0.8rem;background:transparent;">
                    ${this._renderSquadTabs(c)}
                    <div id="squad-tab-content" style="min-width:0;">
                        ${this._renderActiveTabContent(squad, c)}
                    </div>
                </main>
                ${this._renderClanSidebar(c, isLeader)}
            </div>
        </div>`;
    },

    _renderHubStyles() {
        return `<style>
            #squads-main-content,
            #squad-tab-content,
            #squad-section-overview,
            #squad-hub-main {
                background: transparent !important;
            }
            @media (max-width: 980px) {
                #squad-hub-layout { grid-template-columns: 1fr !important; }
                #squad-hub-sidebar { position: static !important; max-height: none !important; padding-right: 0 !important; }
                #squad-hero-actions { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            }
            @media (max-width: 640px) {
                #squad-hero-inner { grid-template-columns: 1fr !important; }
                #squad-hero-actions { grid-template-columns: 1fr !important; }
                .squad-overview-grid { grid-template-columns: 1fr !important; }
            }
            .squad-member-row:hover,
            .squad-invite-row:hover,
            .squad-request-row:hover {
                transform: translateY(-1px);
                border-color: rgba(168,85,247,0.28) !important;
            }
        </style>`;
    },

    _renderSquadHero(squad, c, isLeader) {
        const canLeaderLeave = isLeader && (squad.members?.length || 0) > 1;
        const image = this._renderSquadImage(squad, c, 112);
        const visibility = squad.visibility === 'private' ? 'Privado' : 'Publico';
        const visibilityColor = squad.visibility === 'private' ? '#f59e0b' : '#10b981';
        const description = squad.description || 'Sem descricao ainda.';
        const leaderAction = isLeader
            ? `<button onclick="SquadsUI.confirmLeave()" ${!canLeaderLeave ? 'disabled' : ''} style="${canLeaderLeave ? this._btnDanger() : this._btnDisabled(c)}">Passar lideranca</button>
               <button onclick="SquadsUI.confirmDeleteSquad()" style="${this._btnDanger()}">Excluir cla</button>`
            : `<button onclick="SquadsUI.confirmLeave()" style="${this._btnDanger()}">Sair do cla</button>`;

        return `<section style="position:relative;overflow:hidden;background:linear-gradient(135deg,rgba(124,58,237,0.34),${c.bg} 45%,rgba(6,182,212,0.16));border:1px solid rgba(168,85,247,0.28);border-radius:24px;padding:1.15rem;box-shadow:0 20px 48px rgba(0,0,0,0.18);">
            <div id="squad-hero-inner" style="position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(240px,330px);gap:1rem;align-items:stretch;">
                <div style="display:grid;grid-template-columns:auto minmax(0,1fr);gap:1rem;align-items:start;min-width:0;">
                    ${image}
                    <div style="min-width:0;">
                        <div style="display:flex;align-items:center;gap:0.55rem;flex-wrap:wrap;margin-bottom:0.45rem;">
                            <h2 style="margin:0;font-family:'Syne',sans-serif;font-size:clamp(1.55rem,3vw,2.15rem);font-weight:900;color:${c.text};line-height:1.02;">${this._escape(squad.name)}</h2>
                            <span style="${this._pill('rgba(168,85,247,0.13)', 'rgba(168,85,247,0.28)', 'var(--theme-primary,#a855f7)')}">[${this._escape(squad.tag)}]</span>
                            ${isLeader ? `<span style="${this._pill('rgba(245,158,11,0.1)', 'rgba(245,158,11,0.25)', '#f59e0b')}">Lider</span>` : ''}
                            <span style="${this._pill(`${squad.visibility === 'private' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)'}`, `${squad.visibility === 'private' ? 'rgba(245,158,11,0.24)' : 'rgba(16,185,129,0.24)'}`, visibilityColor)}">${visibility}</span>
                        </div>
                        <p style="max-width:620px;margin:0 0 0.9rem;font-size:0.84rem;line-height:1.55;color:${squad.description ? c.sub : c.muted};">${this._escape(description)}</p>
                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(92px,1fr));gap:0.58rem;max-width:720px;">
                            ${this._renderHeroStat(c, 'Membros', `${squad.members.length}/${window.Squads.MAX_MEMBERS}`)}
                            ${this._renderHeroStat(c, 'Pontos', Number(squad.score || 0).toLocaleString('pt-BR'), 'squad-score-stat')}
                            ${this._renderHeroStat(c, 'Cofre', Number(squad.balance || 0).toLocaleString('pt-BR'), 'squad-balance-stat')}
                            ${this._renderHeroStat(c, 'Ranking', '--', 'squad-rank-stat')}
                        </div>
                    </div>
                </div>
                <div id="squad-hero-actions" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0.55rem;align-content:start;">
                    <button onclick="Utils.copyToClipboard('${this._escape(squad.inviteCode)}')" style="${this._btnSecondary(c)}">Copiar codigo</button>
                    ${isLeader ? `<button onclick="SquadsUI.openCustomizeModal()" style="${this._btnGhost(c)}">Personalizar</button>` : ''}
                    ${leaderAction}
                </div>
            </div>
        </section>`;
    },

    _renderHeroStat(c, label, value, id = '') {
        return `<div style="${this._miniStat(c)}min-height:58px;justify-content:center;">
            <span>${label}</span>
            <strong ${id ? `id="${id}"` : ''} style="font-size:0.92rem;color:${c.text};line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${value}</strong>
        </div>`;
    },

    _renderActiveTabContent(squad, c) {
        const tab = this._activeTab || 'overview';
        if (tab === 'chat') return `<div id="squad-section-chat">${this._renderChatPanel(c)}</div>`;
        if (tab === 'mural') return `<div id="squad-section-mural">${this._renderFeedPanel(c)}</div>`;
        if (tab === 'ranking') return this._renderRankingPanel(c);
        if (tab === 'goals') return this._renderGoalsPanel(c);
        if (tab === 'challenges') return this._renderChallengesPanel(c);
        return this._renderOverviewTab(squad, c);
    },

    _renderOverviewTab(squad, c) {
        return `<section id="squad-section-overview" style="display:grid;gap:0.74rem;">
            <div class="squad-overview-grid" style="display:grid;grid-template-columns:minmax(0,1.08fr) minmax(280px,0.92fr);gap:0.74rem;align-items:start;">
                ${this._renderCompactPanel(c, 'Metas', 'Top objetivos', `<button onclick="SquadsUI.switchTab('goals')" style="${this._btnGhost(c)}">Ver metas</button>`, `<div id="squad-overview-goals" style="display:grid;gap:0.42rem;">${this._renderMiniState(c, 'Carregando metas...')}</div>`)}
                ${this._renderCompactPanel(c, 'Desafio atual', 'Clã contra Clã', `<button onclick="SquadsUI.switchTab('challenges')" style="${this._btnSecondary(c)}">Abrir</button>`, `<div id="squad-overview-challenge">${this._renderMiniState(c, 'Verificando desafios...')}</div>`, { highlight: true })}
            </div>
            <div class="squad-overview-grid" style="display:grid;grid-template-columns:minmax(0,1.12fr) minmax(250px,0.88fr);gap:0.74rem;align-items:start;">
                ${this._renderCompactPanel(c, 'Atividade recente', 'Mural resumido', `<button onclick="SquadsUI.switchTab('mural')" style="${this._btnGhost(c)}">Ver mural</button>`, `<div id="squad-overview-feed" style="display:grid;gap:0.38rem;">${this._renderMiniState(c, 'Carregando atividades...')}</div>`)}
                ${this._renderCompactPanel(c, 'Ranking', 'Sua posição', `<button onclick="SquadsUI.switchTab('ranking')" style="${this._btnGhost(c)}">Ranking</button>`, `<div id="squad-overview-ranking">${this._renderMiniState(c, 'Carregando ranking...')}</div>`, { compact: true })}
            </div>
        </section>`;
    },

    _renderCompactPanel(c, eyebrow, title, action, body, options = {}) {
        const bg = c.bg;
        const border = options.highlight ? 'rgba(168,85,247,0.28)' : c.border;
        const shadow = options.highlight ? '0 12px 32px rgba(124,58,237,0.12)' : 'none';
        return `<section style="background:${bg};border:1px solid ${border};border-radius:12px;padding:${options.compact ? '0.68rem' : '0.74rem'};box-shadow:${shadow};">
            <div style="${this._sectionBar()}margin-bottom:${options.highlight ? '0.62rem' : '0.52rem'};">
                <div style="min-width:0;">
                    <div style="${this._eyebrow(c)}">${eyebrow}</div>
                    <div style="${this._sectionTitle(c)}font-size:${options.highlight ? '1.05rem' : '0.92rem'};">${title}</div>
                </div>
                ${action || ''}
            </div>
            ${body}
        </section>`;
    },

    _renderMiniState(c, text) {
        return `<div style="padding:0.8rem;text-align:center;color:${c.muted};font-size:0.76rem;border:1px dashed ${c.border};border-radius:12px;background:${c.bg2};">${this._escape(text)}</div>`;
    },

    _renderRankingPanel(c) {
        return `<section id="squad-section-ranking" style="${this._panel(c)}">
            <div style="${this._sectionBar()}">
                <div>
                    <div style="${this._eyebrow(c)}">Ranking</div>
                    <div style="${this._sectionTitle(c)}">Clãs por pontuacao</div>
                </div>
                <button onclick="SquadsUI.loadRanking()" style="${this._btnGhost(c)}">Atualizar</button>
            </div>
            <div id="squad-ranking-list">
                <div style="padding:1rem;text-align:center;color:${c.muted};font-size:0.78rem;">Carregando ranking...</div>
            </div>
        </section>`;
    },

    _renderClanSidebar(c, isLeader) {
        const sidePanel = `background:${c.bg};border:1px solid ${c.border};border-radius:12px;padding:0.66rem;box-shadow:none;`;
        return `<aside id="squad-hub-sidebar" style="position:sticky;top:0.75rem;display:grid;gap:0.64rem;min-width:0;max-height:calc(100vh - 200px);overflow-y:auto;padding-right:16px;box-sizing:border-box;">
            <section style="${sidePanel}">
                <div style="${this._sectionBar()}margin-bottom:0.5rem;">
                    <div>
                        <div style="${this._eyebrow(c)}">Membros</div>
                        <div style="${this._sectionTitle(c)}font-size:0.86rem;">Lista do Cla</div>
                    </div>
                    <button onclick="SquadsUI.loadMembers()" style="${this._btnGhost(c)}">Atualizar</button>
                </div>
                <div id="squad-members-list" style="max-height:260px;overflow-y:auto;padding-right:0.1rem;">
                    ${this._renderMembersSkeleton(c)}
                </div>
            </section>
            ${isLeader ? `<section style="${sidePanel}">
                <div style="${this._sectionBar()}margin-bottom:0.5rem;">
                    <div>
                        <div style="${this._eyebrow(c)}">Pedidos</div>
                        <div style="${this._sectionTitle(c)}font-size:0.86rem;">Entrada no cla</div>
                    </div>
                    <button onclick="SquadsUI.loadJoinRequests()" style="${this._btnGhost(c)}">Atualizar</button>
                </div>
                <div id="squad-join-requests-list" style="max-height:180px;overflow-y:auto;padding-right:0.1rem;">
                    <div style="padding:0.8rem;text-align:center;color:${c.muted};font-size:0.76rem;">Carregando pedidos...</div>
                </div>
            </section>` : ''}
        </aside>`;
    },

    _renderMembersSkeleton(c) {
        return `<div style="padding:1rem;text-align:center;color:${c.muted};font-size:0.78rem;">Carregando membros...</div>`;
    },

    _renderSquadTabs(c) {
        const tabs = this._tabs();
        return `<div id="squad-tabs" style="display:flex;gap:0.45rem;flex-wrap:wrap;align-items:center;padding:0.48rem;border:1px solid ${c.border};background:${c.bg};border-radius:12px;">
            ${tabs.map((tab) => {
                const active = this._activeTab === tab.id;
                return `<button onclick="SquadsUI.switchTab('${tab.id}')" style="${active ? this._btnSecondary(c) : this._btnGhost(c)}${active ? 'box-shadow:0 10px 28px rgba(124,58,237,0.16);' : ''}">${tab.label}</button>`;
            }).join('')}
        </div>`;
    },

    _tabs() {
        return [
            { id: 'overview', label: 'Visão geral' },
            { id: 'chat', label: 'Chat' },
            { id: 'mural', label: 'Mural' },
            { id: 'ranking', label: 'Ranking' },
            { id: 'goals', label: 'Metas' },
            { id: 'challenges', label: 'Desafios' },
        ];
    },

    switchTab(tab) {
        if (!this._tabs().some((item) => item.id === tab)) return;
        this._activeTab = tab;
        if (tab !== 'goals') this._showAllGoals = false;

        const squad = window.Squads?.getCurrentSquadSync?.();
        if (!squad) return;

        const c = this._colors(document.body.classList.contains('dark-theme'));
        const tabs = document.getElementById('squad-tabs');
        const content = document.getElementById('squad-tab-content');
        if (tabs) tabs.outerHTML = this._renderSquadTabs(c);
        if (content) content.innerHTML = this._renderActiveTabContent(squad, c);
        this._loadActiveTabData();
    },

    _loadActiveTabData() {
        if (this._activeTab === 'overview') return this.loadOverview();
        if (this._activeTab === 'chat' || this._activeTab === 'mural') return this.loadSquadSocial();
        if (this._activeTab === 'ranking') return this.loadRanking();
        if (this._activeTab === 'goals') return this.loadGoals();
        if (this._activeTab === 'challenges') return this.loadChallenges();
    },

    _renderGoalsPanel(c) {
        return `<section id="squad-section-goals" style="${this._panel(c)}">
            <div style="${this._sectionBar()}">
                <div>
                    <div style="${this._eyebrow(c)}">Metas</div>
                    <div style="${this._sectionTitle(c)}">Objetivos coletivos</div>
                </div>
                <button onclick="SquadsUI.loadGoals()" style="${this._btnGhost(c)}">Atualizar</button>
            </div>
            <div id="squad-goals-list" style="display:grid;gap:0.6rem;">
                <div style="padding:1rem;text-align:center;color:${c.muted};font-size:0.78rem;">Carregando metas...</div>
            </div>
        </section>`;
    },

    _renderChallengesPanel(c) {
        return `<section id="squad-section-challenges" style="${this._panel(c)}">
            <div style="${this._sectionBar()}">
                <div>
                    <div style="${this._eyebrow(c)}">Desafios</div>
                    <div style="${this._sectionTitle(c)}">Clã contra Clã</div>
                </div>
                <button onclick="SquadsUI.openChallengeModal()" style="${this._btnSecondary(c)}">Desafiar</button>
            </div>
            <div id="squad-challenges-list" style="display:grid;gap:0.6rem;">
                <div style="padding:1rem;text-align:center;color:${c.muted};font-size:0.78rem;">Carregando desafios...</div>
            </div>
        </section>`;
    },

    _renderChatPanel(c) {
        return `<section style="${this._panel(c)}min-height:440px;display:flex;flex-direction:column;">
            <div style="${this._sectionBar()}">
                <div>
                    <div style="${this._eyebrow(c)}">Chat</div>
                    <div style="${this._sectionTitle(c)}">Conversa do Cla</div>
                </div>
                <span id="squad-chat-live-pill" style="${this._pill('rgba(16,185,129,0.1)', 'rgba(16,185,129,0.24)', '#10b981')}">Ao vivo</span>
            </div>
            <div id="squad-chat-list" style="flex:1;min-height:280px;max-height:410px;overflow-y:auto;display:grid;align-content:start;gap:0.46rem;padding:0.12rem 0.1rem 0.65rem;">
                <div style="padding:1rem;text-align:center;color:${c.muted};font-size:0.78rem;">Carregando chat...</div>
            </div>
            <div style="display:flex;gap:0.5rem;align-items:flex-end;padding-top:0.7rem;border-top:1px solid ${c.border};">
                <textarea id="squad-chat-input" maxlength="${window.Squads?.MAX_MESSAGE_LENGTH || 500}"
                    onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();SquadsUI.sendSquadMessage();}"
                    placeholder="Mensagem para o clã"
                    style="flex:1;min-height:40px;max-height:96px;resize:vertical;box-sizing:border-box;padding:0.66rem 0.74rem;border-radius:13px;border:1px solid ${c.border};background:${c.input};color:${c.text};font-size:0.78rem;font-family:'DM Sans',sans-serif;line-height:1.35;outline:none;"></textarea>
                <button id="squad-chat-send" onclick="SquadsUI.sendSquadMessage()" style="${this._btnPrimary()}min-width:84px;">Enviar</button>
            </div>
        </section>`;
    },

    _renderFeedPanel(c) {
        return `<section style="${this._panel(c)}">
            <div style="${this._sectionBar()}">
                <div>
                    <div style="${this._eyebrow(c)}">Mural</div>
                    <div style="${this._sectionTitle(c)}">Eventos do Clã</div>
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
            const visibleMessages = messages.slice(-this.MAX_RENDERED_MESSAGES);
            const visibleFeed = feed.slice(0, this.MAX_RENDERED_FEED);

            if (chatList) {
                chatList.innerHTML = visibleMessages.length
                    ? visibleMessages.map((message) => this._renderChatMessage(message, c)).join('')
                    : `<div style="padding:1rem;text-align:center;color:${c.muted};font-size:0.78rem;">Nenhuma mensagem ainda.</div>`;
                chatList.scrollTop = chatList.scrollHeight;
            }

            if (feedList) {
                feedList.innerHTML = visibleFeed.length
                    ? visibleFeed.map((item) => this._renderFeedItem(item, c)).join('')
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

    async loadOverview() {
        const goalsEl = document.getElementById('squad-overview-goals');
        const feedEl = document.getElementById('squad-overview-feed');
        const challengeEl = document.getElementById('squad-overview-challenge');
        const rankingEl = document.getElementById('squad-overview-ranking');
        if (!window.Squads || (!goalsEl && !feedEl && !challengeEl && !rankingEl)) return;
        if (this._overviewLoading) return;
        this._overviewLoading = true;
        const c = this._colors(document.body.classList.contains('dark-theme'));

        try {
            const [goals, feed, challenges, ranking] = await Promise.all([
                window.Squads.listGoals ? window.Squads.listGoals({ force: true }).catch(() => []) : Promise.resolve([]),
                window.Squads.listFeed ? window.Squads.listFeed({ force: false }).catch(() => []) : Promise.resolve([]),
                window.Squads.listChallenges ? window.Squads.listChallenges({ force: true }).catch(() => []) : Promise.resolve([]),
                window.Squads.listSquadRanking ? window.Squads.listSquadRanking({ limit: 25 }).catch(() => []) : Promise.resolve([]),
            ]);

            if (goalsEl) {
                goalsEl.innerHTML = goals.length
                    ? goals.slice(0, 3).map((goal) => this._renderOverviewGoal(goal, c)).join('')
                    : this._renderMiniState(c, 'Nenhuma meta ativa agora.');
            }

            if (feedEl) {
                feedEl.innerHTML = feed.length
                    ? feed.slice(0, 3).map((item) => this._renderFeedItem(item, c)).join('')
                    : this._renderMiniState(c, 'O mural ainda esta vazio.');
            }

            if (rankingEl) {
                const current = ranking.find((item) => item.isCurrent);
                this._updateRankStat(current?.rank);
                rankingEl.innerHTML = current
                    ? this._renderOverviewRanking(current, c)
                    : this._renderMiniState(c, 'Seu Cla ainda nao apareceu no ranking.');
            }

            if (challengeEl) {
                const currentSquad = window.Squads.getCurrentSquadSync?.();
                const active = challenges.find((challenge) => challenge.status === 'active');
                const latest = active || challenges[0];
                if (!latest) {
                    challengeEl.innerHTML = this._renderChallengeEmpty(c, true);
                } else {
                    const squads = window.Squads.listPublicSquads
                        ? await window.Squads.listPublicSquads({ limit: 25 }).catch(() => ({ items: [] }))
                        : { items: [] };
                    const byId = Object.fromEntries((squads?.items || []).map((squad) => [squad.id, squad]));
                    if (currentSquad?.id) byId[currentSquad.id] = currentSquad;
                    challengeEl.innerHTML = this._renderChallengeItem(latest, c, byId, currentSquad?.id, true);
                }
            }
        } catch (err) {
            const message = this._escape(err.message || 'Erro ao carregar visao geral.');
            [goalsEl, feedEl, challengeEl, rankingEl].filter(Boolean).forEach((el) => {
                el.innerHTML = `<div style="padding:0.85rem;text-align:center;color:#ef4444;font-size:0.78rem;">${message}</div>`;
            });
        } finally {
            this._overviewLoading = false;
        }
    },

    _renderOverviewGoal(goal, c) {
        const pct = Math.min(100, Math.round((Number(goal.progress || 0) / Math.max(1, Number(goal.target || 1))) * 100));
        const done = !!goal.completed;
        return `<div style="display:grid;gap:0.32rem;padding:0.46rem 0.52rem;border:1px solid ${done ? 'rgba(16,185,129,0.24)' : c.border};background:${done ? 'rgba(16,185,129,0.07)' : c.bg2};border-radius:10px;">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:0.7rem;">
                <div style="min-width:0;font-size:0.72rem;font-weight:900;color:${c.text};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${this._escape(goal.description)}</div>
                <span style="font-size:0.62rem;font-weight:900;color:${done ? '#10b981' : c.muted};">${pct}%</span>
            </div>
            <div style="height:4px;border-radius:999px;overflow:hidden;background:${c.d ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'};">
                <div style="width:${pct}%;height:100%;border-radius:999px;background:linear-gradient(90deg,#10b981,#a855f7);"></div>
            </div>
            <div style="font-size:0.58rem;color:${c.muted};font-weight:800;">${Number(goal.progress || 0).toLocaleString('pt-BR')} / ${Number(goal.target || 0).toLocaleString('pt-BR')} · ${Number(goal.reward || 0).toLocaleString('pt-BR')} chips</div>
        </div>`;
    },

    _renderOverviewRanking(item, c) {
        const top = Number(item.rank || 0) <= 3;
        return `<div style="display:grid;grid-template-columns:38px minmax(0,1fr) auto;gap:0.62rem;align-items:center;padding:0.58rem;border:1px solid ${top ? 'rgba(245,158,11,0.24)' : c.border};background:${c.bg2};border-radius:10px;">
            <div style="width:34px;height:34px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:${top ? 'rgba(245,158,11,0.14)' : 'rgba(168,85,247,0.14)'};color:${top ? '#f59e0b' : 'var(--theme-primary,#a855f7)'};font-weight:900;font-size:0.78rem;">#${item.rank}</div>
            <div style="min-width:0;">
                <div style="font-size:0.78rem;font-weight:900;color:${c.text};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${this._escape(item.name)}</div>
                <div style="font-size:0.61rem;color:${c.muted};font-weight:800;">[${this._escape(item.tag)}]</div>
            </div>
            <strong style="font-size:0.88rem;color:${c.text};">${Number(item.score || 0).toLocaleString('pt-BR')}</strong>
        </div>`;
    },

    _updateRankStat(rank) {
        const stat = document.getElementById('squad-rank-stat');
        if (stat) stat.textContent = rank ? `#${rank}` : '--';
    },

    async loadRankSummary() {
        if (!window.Squads?.listSquadRanking) return;
        try {
            const items = await window.Squads.listSquadRanking({ limit: 25 });
            this._updateRankStat(items.find((item) => item.isCurrent)?.rank);
        } catch (_) {
            this._updateRankStat(null);
        }
    },

    async loadRanking() {
        const list = document.getElementById('squad-ranking-list');
        if (!list || !window.Squads?.listSquadRanking) return;
        const c = this._colors(document.body.classList.contains('dark-theme'));

        try {
            const items = await window.Squads.listSquadRanking({ limit: 10 });
            if (!items.length) {
                this._updateRankStat(null);
                list.innerHTML = `<div style="padding:1rem;text-align:center;color:${c.muted};font-size:0.78rem;">Nenhum Clã no ranking ainda.</div>`;
                return;
            }
            this._updateRankStat(items.find((item) => item.isCurrent)?.rank);
            list.innerHTML = `<div style="display:grid;gap:0.55rem;">${items.map((squad) => this._renderRankingItem(squad, c)).join('')}</div>`;
        } catch (err) {
            list.innerHTML = `<div style="padding:1rem;text-align:center;color:#ef4444;font-size:0.78rem;">${this._escape(err.message || 'Erro ao carregar ranking.')}</div>`;
        }
    },

    async loadGoals() {
        const list = document.getElementById('squad-goals-list');
        if (!list || !window.Squads?.listGoals) return;
        if (this._goalsLoading) return;
        this._goalsLoading = true;
        const c = this._colors(document.body.classList.contains('dark-theme'));

        try {
            const goals = await window.Squads.listGoals({ force: true });
            if (!goals.length) {
                list.innerHTML = `<div style="padding:1rem;text-align:center;color:${c.muted};font-size:0.78rem;">Nenhuma meta ativa agora.</div>`;
                return;
            }
            const visible = this._showAllGoals ? goals : goals.slice(0, 3);
            const showAll = !this._showAllGoals && goals.length > visible.length;
            list.innerHTML = `${visible.map((goal) => this._renderGoalItem(goal, c)).join('')}${showAll ? `
                <button onclick="SquadsUI.showAllGoals()" style="${this._btnGhost(c)}width:100%;justify-content:center;margin-top:0.1rem;">Ver todas (${goals.length})</button>
            ` : ''}`;
        } catch (err) {
            list.innerHTML = `<div style="padding:1rem;text-align:center;color:#ef4444;font-size:0.78rem;">${this._escape(err.message || 'Erro ao carregar metas.')}</div>`;
        } finally {
            this._goalsLoading = false;
        }
    },

    showAllGoals() {
        this._showAllGoals = true;
        this.loadGoals();
    },

    _renderGoalItem(goal, c) {
        const pct = Math.min(100, Math.round((Number(goal.progress || 0) / Math.max(1, Number(goal.target || 1))) * 100));
        const done = goal.completed;
        const claimed = !!goal.rewardClaimedAt;
        const typeLabel = goal.type === 'weekly' ? 'Semanal' : 'Diaria';
        const action = claimed
            ? `<button disabled style="${this._btnDisabled(c)}">Resgatada</button>`
            : done
                ? `<button onclick="SquadsUI.claimGoalReward('${this._escape(goal.id)}')" style="${this._btnSecondary(c)}">Resgatar</button>`
                : `<button disabled style="${this._btnDisabled(c)}">${pct}%</button>`;
        return `<div style="display:grid;gap:0.34rem;padding:0.54rem 0.6rem;border:1px solid ${done ? 'rgba(16,185,129,0.28)' : c.border};background:${done ? 'rgba(16,185,129,0.08)' : c.bg2};border-radius:10px;">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:0.7rem;">
                <div style="min-width:0;">
                    <div style="font-size:0.73rem;font-weight:900;color:${c.text};line-height:1.28;">${this._escape(goal.description)}</div>
                    <div style="font-size:0.62rem;color:${c.muted};margin-top:0.12rem;">${typeLabel} · ${Number(goal.reward || 0).toLocaleString('pt-BR')} chips</div>
                </div>
                ${action}
            </div>
            <div style="height:4px;border-radius:999px;overflow:hidden;background:${c.d ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'};">
                <div style="width:${pct}%;height:100%;border-radius:999px;background:linear-gradient(90deg,#10b981,#a855f7);"></div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:0.6rem;color:${c.muted};font-weight:800;">
                <span>${Number(goal.progress || 0).toLocaleString('pt-BR')} / ${Number(goal.target || 0).toLocaleString('pt-BR')}</span>
                <span>${done ? (claimed ? 'Recompensa distribuida' : 'Concluida') : 'Em progresso'}</span>
            </div>
        </div>`;
    },

    async claimGoalReward(goalId) {
        try {
            const result = await window.Squads.claimGoalReward(goalId);
            window.Utils?.showNotification?.(`Recompensa distribuida: ${Number(result.amount || 0).toLocaleString('pt-BR')} chips.`, 'success');
            await this.refresh({ silent: true });
        } catch (err) {
            window.Utils?.showNotification?.(err.message || 'Erro ao resgatar meta.', 'error');
        }
    },

    async loadChallenges() {
        const list = document.getElementById('squad-challenges-list');
        if (!list || !window.Squads?.listChallenges) return;
        if (this._challengesLoading) return;
        this._challengesLoading = true;
        const c = this._colors(document.body.classList.contains('dark-theme'));

        try {
            const challenges = await window.Squads.listChallenges({ force: true });
            if (!challenges.length) {
                list.innerHTML = this._renderChallengeEmpty(c);
                return;
            }
            const squads = await window.Squads.listPublicSquads({ limit: 25 }).catch(() => ({ items: [] }));
            const byId = Object.fromEntries((squads.items || []).map((squad) => [squad.id, squad]));
            const current = window.Squads.getCurrentSquadSync();
            if (current?.id) {
                byId[current.id] = current;
                const balanceStat = document.getElementById('squad-balance-stat');
                if (balanceStat) balanceStat.textContent = Number(current.balance || 0).toLocaleString('pt-BR');
                const scoreStat = document.getElementById('squad-score-stat');
                if (scoreStat) scoreStat.textContent = Number(current.score || 0).toLocaleString('pt-BR');
            }
            const visible = challenges.slice(0, this.MAX_RENDERED_CHALLENGES);
            list.innerHTML = visible.map((challenge) => this._renderChallengeItem(challenge, c, byId, current?.id)).join('');
        } catch (err) {
            list.innerHTML = `<div style="padding:1rem;text-align:center;color:#ef4444;font-size:0.78rem;">${this._escape(err.message || 'Erro ao carregar desafios.')}</div>`;
        } finally {
            this._challengesLoading = false;
        }
    },

    _renderChallengeEmpty(c, compact = false) {
        return `<div style="display:grid;gap:${compact ? '0.42rem' : '0.55rem'};place-items:center;text-align:center;padding:${compact ? '1rem 0.74rem' : '1.2rem 0.85rem'};border:1px dashed rgba(168,85,247,0.32);border-radius:12px;background:${c.bg2};">
            <div style="width:${compact ? '44px' : '46px'};height:${compact ? '44px' : '46px'};border-radius:16px;display:flex;align-items:center;justify-content:center;background:rgba(168,85,247,0.16);color:var(--theme-primary,#a855f7);font-weight:900;box-shadow:0 12px 28px rgba(124,58,237,0.14);">VS</div>
            <div style="font-size:${compact ? '0.86rem' : '0.9rem'};font-weight:900;color:${c.text};">Nenhum desafio ativo</div>
            <div style="max-width:300px;font-size:0.66rem;line-height:1.42;color:${c.muted};">Chame outro Clã para uma disputa de 24h e coloque o placar em movimento.</div>
            <button onclick="SquadsUI.openChallengeModal()" style="${this._btnSecondary(c)}${compact ? 'min-height:32px;padding:0.5rem 0.7rem;font-size:0.7rem;' : ''}">Desafiar agora</button>
        </div>`;
    },

    _renderChallengeItem(challenge, c, squadsById = {}, currentId = '', featured = false) {
        const a = squadsById[challenge.squadA] || { tag: 'A', name: 'Clã A' };
        const b = squadsById[challenge.squadB] || { tag: 'B', name: 'Clã B' };
        const mineIsA = currentId === challenge.squadA;
        const mineScore = mineIsA ? challenge.scoreA : challenge.scoreB;
        const otherScore = mineIsA ? challenge.scoreB : challenge.scoreA;
        const other = mineIsA ? b : a;
        const active = challenge.status === 'active';
        const leftMs = Math.max(0, Number(challenge.endsAt || 0) - Date.now());
        const status = active ? `Termina em ${this._formatDuration(leftMs)}` : (challenge.winnerId ? `Vencedor: [${this._escape((squadsById[challenge.winnerId] || {}).tag || '?')}]` : 'Empate');
        const scoreSize = featured ? '1.72rem' : '1rem';
        return `<div style="display:grid;gap:${featured ? '0.72rem' : '0.52rem'};padding:${featured ? '0.9rem' : '0.68rem'};border:1px solid ${active ? 'rgba(245,158,11,0.34)' : c.border};background:${c.bg2};border-radius:12px;">
            <div style="display:flex;justify-content:space-between;gap:0.8rem;align-items:flex-start;">
                <div style="min-width:0;">
                    <div style="font-size:${featured ? '0.92rem' : '0.78rem'};font-weight:900;color:${c.text};">Contra [${this._escape(other.tag || '?')}]</div>
                    <div style="font-size:0.63rem;color:${c.muted};margin-top:0.16rem;">${this._escape(other.name || 'Clã')} · ${status}</div>
                </div>
                <span style="${this._pill(active ? 'rgba(245,158,11,0.1)' : 'rgba(148,163,184,0.1)', active ? 'rgba(245,158,11,0.24)' : 'rgba(148,163,184,0.24)', active ? '#f59e0b' : c.sub)}">${active ? 'Ativo' : 'Finalizado'}</span>
            </div>
            <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:0.6rem;align-items:center;text-align:center;">
                <strong style="font-size:${scoreSize};color:${c.text};line-height:1;">${Number(mineScore || 0).toLocaleString('pt-BR')}</strong>
                <span style="font-size:0.66rem;color:${c.muted};font-weight:900;">vs</span>
                <strong style="font-size:${scoreSize};color:${c.text};line-height:1;">${Number(otherScore || 0).toLocaleString('pt-BR')}</strong>
            </div>
        </div>`;
    },

    _renderRankingItem(squad, c) {
        const top = Number(squad.rank || 0) <= 3;
        const border = squad.isCurrent ? 'rgba(168,85,247,0.34)' : (top ? 'rgba(245,158,11,0.26)' : c.border);
        const bg = c.bg2;
        return `<div style="display:grid;grid-template-columns:42px minmax(0,1fr) auto;gap:0.72rem;align-items:center;padding:0.68rem;border-radius:10px;border:1px solid ${border};background:${bg};">
            <div style="width:34px;height:34px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:${top ? 'rgba(245,158,11,0.14)' : 'rgba(148,163,184,0.12)'};color:${top ? '#f59e0b' : c.sub};font-weight:900;">#${squad.rank}</div>
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
                if (!document.getElementById('squads-main-content')) {
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
        const hasOverview = !!document.getElementById('squad-section-overview');
        const hasRanking = !!document.getElementById('squad-ranking-list');
        const hasGoals = !!document.getElementById('squad-goals-list');
        const hasChallenges = !!document.getElementById('squad-challenges-list');
        if (!chatList && !feedList && !hasOverview && !hasRanking && !hasGoals && !hasChallenges) return;

        const c = this._colors(document.body.classList.contains('dark-theme'));
        const messages = window.Squads?._normalizeMessages?.(squad.messages || []) || [];
        const feed = window.Squads?._normalizeFeed?.(squad.feed || []) || [];
        const visibleMessages = messages.slice(-this.MAX_RENDERED_MESSAGES);
        const visibleFeed = feed.slice(0, this.MAX_RENDERED_FEED);

        if (chatList) {
            const wasNearBottom = chatList.scrollHeight - chatList.scrollTop - chatList.clientHeight < 90;
            chatList.innerHTML = visibleMessages.length
                ? visibleMessages.map((message) => this._renderChatMessage(message, c)).join('')
                : `<div style="padding:1rem;text-align:center;color:${c.muted};font-size:0.78rem;">Nenhuma mensagem ainda.</div>`;
            if (wasNearBottom) chatList.scrollTop = chatList.scrollHeight;
        }

        if (feedList) {
            feedList.innerHTML = visibleFeed.length
                ? visibleFeed.map((item) => this._renderFeedItem(item, c)).join('')
                : `<div style="padding:0.9rem;text-align:center;color:${c.muted};font-size:0.78rem;">O mural ainda esta vazio.</div>`;
        }

        const activityStat = document.getElementById('squad-activity-stat');
        if (activityStat) activityStat.textContent = this._relativeTime(squad.lastActivityAt || squad.updatedAt);
        const scoreStat = document.getElementById('squad-score-stat');
        if (scoreStat) scoreStat.textContent = Number(squad.score || 0).toLocaleString('pt-BR');
        const balanceStat = document.getElementById('squad-balance-stat');
        if (balanceStat) balanceStat.textContent = Number(squad.balance || 0).toLocaleString('pt-BR');
    },

    _renderChatMessage(message, c) {
        const isMine = message.userId === window.NyanAuth?.getUID?.();
        const member = this._memberProfiles.find((item) => item.userId === message.userId);
        const profile = member?.profile || {};
        const name = profile.username || profile.nyanTag || (isMine ? (window.NyanAuth?.getNyanTag?.() || 'Voce') : message.userId.slice(0, 8));
        return `<div style="display:flex;justify-content:${isMine ? 'flex-end' : 'flex-start'};">
            <div style="max-width:min(68%,440px);padding:0.54rem 0.64rem;border-radius:${isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px'};border:1px solid ${isMine ? 'rgba(168,85,247,0.28)' : c.border};background:${isMine ? 'rgba(168,85,247,0.14)' : c.bg2};box-shadow:inset 0 1px 0 rgba(255,255,255,0.03);">
                <div style="display:flex;align-items:center;gap:0.45rem;justify-content:space-between;margin-bottom:0.22rem;">
                    <span style="font-size:0.66rem;font-weight:900;color:${isMine ? 'var(--theme-primary,#a855f7)' : c.text};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${this._escape(name)}</span>
                    <span style="font-size:0.58rem;color:${c.muted};white-space:nowrap;">${this._formatTime(message.createdAt)}</span>
                </div>
                <div style="font-size:0.76rem;line-height:1.38;color:${c.text};white-space:pre-wrap;word-break:break-word;">${this._escape(message.content)}</div>
            </div>
        </div>`;
    },

    _renderFeedItem(item, c) {
        const accent = item.type === 'event' ? '#10b981' : 'var(--theme-primary,#a855f7)';
        const content = this._resolveFeedContent(item);
        return `<div style="display:flex;gap:0.5rem;padding:0.46rem 0.52rem;border:1px solid ${c.border};border-radius:10px;background:${c.bg2};">
            <div style="width:7px;height:7px;border-radius:999px;background:${accent};box-shadow:0 0 0 3px ${item.type === 'event' ? 'rgba(16,185,129,0.1)' : 'rgba(168,85,247,0.1)'};margin-top:0.3rem;flex-shrink:0;"></div>
            <div style="min-width:0;flex:1;">
                <div style="font-size:0.71rem;line-height:1.32;color:${c.text};font-weight:800;">${this._escape(content)}</div>
                <div style="font-size:0.59rem;color:${c.muted};margin-top:0.16rem;">${this._formatDateTime(item.createdAt)}</div>
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
        return `display:flex;flex-direction:column;gap:0.18rem;padding:0.65rem 0.75rem;border-radius:12px;border:1px solid ${c.border};background:${c.bg};font-size:0.66rem;color:${c.muted};box-shadow:none;`;
    },

    _pill(bg, border, color) {
        return `display:inline-flex;align-items:center;padding:0.25rem 0.58rem;border-radius:999px;background:${bg};border:1px solid ${border};color:${color};font-size:0.66rem;font-weight:900;letter-spacing:0.06em;`;
    },

    _panel(c) {
        return `background:${c.bg};border:1px solid ${c.border};border-radius:12px;padding:0.88rem;box-shadow:none;`;
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
                <div style="display:flex;gap:0.5rem;align-items:center;min-width:min(100%,420px);flex:1;max-width:520px;flex-wrap:wrap;padding:0.45rem;border:1px solid ${c.border};background:${c.bg};border-radius:12px;">
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
        return `<div style="display:flex;align-items:center;justify-content:center;min-height:116px;border:1px dashed ${c.border};border-radius:12px;background:${c.bg2};color:${color};font-size:0.78rem;text-align:center;padding:1rem;">${this._escape(text)}</div>`;
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
                this.loadRankSummary();
                this._loadActiveTabData();
                this.startSquadSocialLive();
            } else {
                this.stopSquadSocialLive();
                this.stopSquadPresenceLive();
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

    async openChallengeModal() {
        const c = this._colors(document.body.classList.contains('dark-theme'));
        this._openModal({
            id: 'squad-challenge-modal',
            title: 'Desafiar Clã',
            body: `<div style="font-size:0.78rem;color:var(--squad-modal-sub);line-height:1.5;margin-bottom:0.8rem;">
                Escolha um Clã para uma disputa de 24h. Cada ponto ganho durante o periodo conta para o placar.
            </div>
            <div id="squad-challenge-targets" style="display:grid;gap:0.55rem;max-height:360px;overflow-y:auto;">
                <div style="padding:1rem;text-align:center;color:var(--squad-modal-sub);font-size:0.78rem;">Carregando Clãs...</div>
            </div>
            <div id="squad-challenge-status" style="min-height:1rem;font-size:0.72rem;margin-top:0.7rem;color:#ef4444;"></div>`,
            footer: `<button onclick="document.getElementById('squad-challenge-modal').remove()" style="${this._modalCancelBtn()}">Fechar</button>`,
        });

        const list = document.getElementById('squad-challenge-targets');
        try {
            const current = window.Squads.getCurrentSquadSync();
            const result = await window.Squads.listPublicSquads({ limit: 25 });
            const targets = (result.items || []).filter((squad) => squad.id !== current?.id);
            if (!targets.length) {
                list.innerHTML = `<div style="padding:1rem;text-align:center;color:var(--squad-modal-sub);font-size:0.78rem;">Nenhum Clã disponivel para desafiar agora.</div>`;
                return;
            }
            list.innerHTML = targets.slice(0, this.MAX_RENDERED_CHALLENGES).map((squad) => `<button onclick="SquadsUI.startChallenge('${this._escape(squad.id)}')" style="display:flex;align-items:center;justify-content:space-between;gap:0.8rem;width:100%;text-align:left;padding:0.75rem;border-radius:14px;border:1px solid ${c.border};background:${c.bg2};color:${c.text};cursor:pointer;font-family:'DM Sans',sans-serif;">
                <span style="min-width:0;">
                    <strong style="display:block;font-size:0.82rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${this._escape(squad.name)} [${this._escape(squad.tag)}]</strong>
                    <span style="font-size:0.66rem;color:${c.muted};">${Number(squad.score || 0).toLocaleString('pt-BR')} pontos · ${(squad.members || []).length} membros</span>
                </span>
                <span style="${this._pill('rgba(245,158,11,0.1)', 'rgba(245,158,11,0.24)', '#f59e0b')}">24h</span>
            </button>`).join('');
        } catch (err) {
            list.innerHTML = `<div style="padding:1rem;text-align:center;color:#ef4444;font-size:0.78rem;">${this._escape(err.message || 'Erro ao carregar Clãs.')}</div>`;
        }
    },

    async startChallenge(targetSquadId) {
        const status = document.getElementById('squad-challenge-status');
        try {
            if (status) status.textContent = 'Iniciando desafio...';
            await window.Squads.startChallenge(targetSquadId);
            document.getElementById('squad-challenge-modal')?.remove();
            window.Utils?.showNotification?.('Desafio iniciado por 24h.', 'success');
            await this.refresh({ silent: true });
        } catch (err) {
            if (status) status.textContent = err.message || 'Erro ao iniciar desafio.';
            window.Utils?.showNotification?.(err.message || 'Erro ao iniciar desafio.', 'error');
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
                return `<div class="squad-request-row" style="display:flex;align-items:center;gap:0.52rem;padding:0.52rem;border:1px solid ${c.border};background:${c.bg2};border-radius:13px;margin-bottom:0.38rem;box-shadow:inset 0 1px 0 rgba(255,255,255,0.03);transition:transform .16s ease,border-color .16s ease;">
                    <div style="width:36px;height:36px;border-radius:12px;overflow:hidden;background:${c.bg};flex-shrink:0;">
                        ${request.avatar ? `<img src="${this._escape(request.avatar)}" style="width:100%;height:100%;object-fit:cover;" alt="Avatar"/>` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-weight:900;color:white;background:linear-gradient(135deg,#7c3aed,#06b6d4);">${this._escape(name.charAt(0).toUpperCase())}</div>`}
                    </div>
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:0.76rem;font-weight:900;color:${c.text};">${this._escape(name)}</div>
                        <div style="font-size:0.61rem;color:${c.muted};">${this._escape(request.nyanTag || request.userId || '')}</div>
                    </div>
                    <button onclick="SquadsUI.acceptJoinRequest('${this._escape(request.userId)}')" style="${this._btnSecondary(c)}min-height:31px;padding:0.45rem 0.55rem;font-size:0.68rem;">Aceitar</button>
                    <button onclick="SquadsUI.rejectJoinRequest('${this._escape(request.userId)}')" style="${this._btnGhost(c)}min-height:31px;padding:0.45rem 0.55rem;font-size:0.68rem;">Recusar</button>
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
            const visibleMembers = members.slice(0, this.MAX_RENDERED_MEMBERS);
            list.innerHTML = visibleMembers.map((member) => this._renderMember(member, c)).join('');
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

    cleanup() {
        clearTimeout(this._loadPublicTimer);
        this._loadPublicTimer = null;
        this.stopSquadSocialLive();
        this.stopSquadPresenceLive();
    },

    _renderMember(member, c) {
        const profile = member.profile || {};
        const name = profile.username || profile.nyanTag || member.userId.slice(0, 8);
        const tag = profile.nyanTag || member.userId;
        const isLeader = member.role === 'leader';
        const currentSquad = window.Squads?.getCurrentSquadSync?.();
        const currentUID = window.NyanAuth?.getUID?.();
        const canKick = currentSquad?.ownerId === currentUID && member.userId !== currentUID && !isLeader;
        const profileUid = profile.uid || member.userId;
        const joined = member.joinedAt
            ? new Date(member.joinedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })
            : '';
        const avatar = profile.avatar
            ? `<img src="${this._escape(profile.avatar)}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;" alt="Avatar"/>`
            : (window.AvatarGenerator
                ? window.AvatarGenerator.generate(name, 42)
                : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#7c3aed,#ec4899);color:white;font-weight:900;">${name.charAt(0).toUpperCase()}</div>`);

        return `
        <div class="squad-member-row" onclick="Friends.viewProfile('${this._escape(profileUid)}', 'squads')" style="display:flex;align-items:center;gap:0.54rem;padding:0.52rem;border:1px solid ${isLeader ? 'rgba(245,158,11,0.32)' : c.border};
            background:${c.bg2};border-radius:10px;margin-bottom:0.38rem;box-shadow:none;cursor:pointer;transition:transform .16s ease,border-color .16s ease;">
            <div style="width:36px;height:36px;border-radius:12px;overflow:hidden;flex-shrink:0;box-shadow:0 8px 18px rgba(0,0,0,0.12);">${avatar}</div>
            <div style="flex:1;min-width:0;">
                <div style="display:flex;align-items:center;gap:0.45rem;flex-wrap:wrap;">
                    <span style="font-size:0.75rem;font-weight:900;color:${c.text};">${this._escape(name)}</span>
                    <span style="font-size:0.56rem;font-weight:900;color:${isLeader ? '#f59e0b' : c.muted};padding:0.16rem 0.36rem;border-radius:999px;background:${isLeader ? 'rgba(245,158,11,0.12)' : 'rgba(148,163,184,0.1)'};">
                        ${isLeader ? 'Líder' : 'Membro'}
                    </span>
                </div>
                <div style="font-size:0.6rem;color:${c.muted};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                    ${this._escape(tag)}${joined ? ` · entrou em ${joined}` : ''}
                </div>
            </div>
            <button onclick="event.stopPropagation();Friends.viewProfile('${this._escape(profileUid)}', 'squads')" style="${this._btnGhost(c)}min-height:31px;padding:0.45rem 0.55rem;font-size:0.68rem;">Perfil</button>
            ${canKick ? `<button onclick="event.stopPropagation();SquadsUI.confirmKick('${this._escape(member.userId)}')" style="${this._btnDanger()}min-height:31px;padding:0.45rem 0.55rem;font-size:0.68rem;">Expulsar</button>` : ''}
        </div>`;
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
                document.getElementById('squad-join-modal')?.remove();
                window.Utils?.showNotification?.(`Pedido enviado para ${squad.name}.`, 'success');
                return;
            }
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
        const d = document.body.classList.contains('dark-theme');
        const text = d ? '#f1f5f9' : '#0f172a';
        const sub = d ? 'rgba(255,255,255,0.58)' : 'rgba(15,23,42,0.58)';
        const bg = d ? 'rgba(255,255,255,0.045)' : '#ffffff';
        const border = d ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)';
        return `<div style="max-width:560px;margin:0 auto;padding:3rem 1rem;font-family:'DM Sans',sans-serif;text-align:center;">
            <div style="display:inline-grid;place-items:center;width:54px;height:54px;border-radius:16px;background:rgba(168,85,247,0.12);border:1px solid rgba(168,85,247,0.22);color:var(--theme-primary,#a855f7);font-family:'Syne',sans-serif;font-weight:900;margin-bottom:0.85rem;">OFF</div>
            <div style="font-family:'Syne',sans-serif;font-size:1.35rem;font-weight:900;color:${text};margin-bottom:0.45rem;">Clãs ficam pausados no modo offline</div>
            <p style="font-size:0.82rem;line-height:1.55;color:${sub};margin:0 0 1rem;">Entre com uma conta online para acessar Clãs, membros, desafios e chat. Enquanto isso, seus recursos locais continuam disponíveis.</p>
            <div style="display:flex;justify-content:center;gap:0.55rem;flex-wrap:wrap;background:${bg};border:1px solid ${border};border-radius:14px;padding:0.8rem;">
                <button onclick="Router?.navigate('offline')" style="min-height:36px;padding:0.58rem 0.88rem;border:none;border-radius:10px;background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));color:white;font-size:0.74rem;font-weight:900;font-family:'DM Sans',sans-serif;cursor:pointer;">Abrir Zona Offline</button>
                <button onclick="Router?.navigate('tasks')" style="min-height:36px;padding:0.58rem 0.88rem;border:1px solid ${border};border-radius:10px;background:transparent;color:${text};font-size:0.74rem;font-weight:900;font-family:'DM Sans',sans-serif;cursor:pointer;">Lista de tarefas</button>
            </div>
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

    _formatDuration(ms) {
        const total = Math.max(0, Math.floor(Number(ms || 0) / 1000));
        const hours = Math.floor(total / 3600);
        const minutes = Math.floor((total % 3600) / 60);
        if (hours > 0) return `${hours}h ${minutes}min`;
        if (minutes > 0) return `${minutes}min`;
        return `${total}s`;
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
