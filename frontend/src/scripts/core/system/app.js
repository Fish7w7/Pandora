const App = {
    version: '3.12.1',
    user: null,
    currentTool: 'home',
    isOnline: navigator.onLine,
    
    tools: [
        { id: 'home', name: 'Dashboard', icon: '\u{1F4CA}', description: 'Visão geral' },
        { id: 'password', name: 'Gerador de Senhas', icon: '\u{1F511}', description: 'Crie senhas seguras' },
        { id: 'weather', name: 'Clima', icon: '\u{1F324}\uFE0F', description: 'Veja a temperatura local' },
        { id: 'translator', name: 'Tradutor', icon: '\u{1F30D}', description: 'Traduza textos rapidamente' },
        { id: 'ai-assistant', name: 'Assistente IA', icon: '\u{1F916}', description: 'Perguntas e respostas' },
        { id: 'mini-game', name: 'Mini Game', icon: '\u{1F3AE}', description: 'Jogue e se divirta' },
        { id: 'temp-email', name: 'Email Temporário', icon: '\u{1F4E7}', description: 'Emails descartáveis' },
        { id: 'music', name: 'Player de Música', icon: '\u{1F3B5}', description: 'Ouça suas músicas' },
        { id: 'notes', name: 'Notas Rápidas', icon: '\u{1F4DD}', description: 'Organize suas ideias' },
        { id: 'tasks', name: 'Lista de Tarefas', icon: '\u2705', description: 'Gerencie tarefas' },
        { id: 'missions',   name: 'Missões',    icon: '\u{1F4CB}', description: 'Missões diárias e desafios' },
        { id: 'season',     name: 'Temporada',  icon: '\u{1F338}', description: 'Progresso e recompensas sazonais' },
        { id: 'shop',       name: 'Loja',       icon: '\u{1F6CD}\uFE0F', description: 'Compre itens com chips' },
        { id: 'offline', name: 'Zona Offline', icon: '\u{1F4F6}', description: 'Jogos sem internet' },
        { id: 'settings', name: 'Configurações', icon: '\u2699\uFE0F', description: 'Personalize o app' },
        { id: 'dev-lab', name: 'Dev Lab', icon: '\u{1F6E0}\uFE0F', description: 'Ajustes internos de desenvolvimento' },
        { id: 'friends', name: 'Amigos', icon: '\u{1F465}', description: 'Lista de amigos e solicitações' },
        { id: 'chat', name: 'Mensagens', icon: '\u{1F4AC}', description: 'Chat privado com amigos' },
        { id: 'leaderboard', name: 'Placar Global', icon: '\u{1F3C6}', description: 'Top 10 por jogo' },
        { id: 'feed', name: 'Feed', icon: '\u{1F4F0}', description: 'Atividades dos amigos' },
        { id: 'challenges', name: 'Desafios', icon: '\u2694\uFE0F', description: 'Duelos de 24h com amigos' },
    ],

    isToolVisible(toolId) {
        if (toolId === 'dev-lab') {
            return !!window.DevSecurity?.canShowTool?.();
        }
        return true;
    },

    getVisibleTools() {
        return this.tools.filter((tool) => this.isToolVisible(tool.id));
    },
    init() {
        
        this.applyThemeOnStart();
        
        setTimeout(() => {
            this.hideLoading();

            if (window.LoginIntro) {
                LoginIntro.run(() => {
                    this.checkAuth();
                    window.AutoUpdater?.init?.();
                });
            } else {
                this.checkAuth();
                window.AutoUpdater?.init?.();
            }
        }, 2500);
        
        this.setupGlobalListeners();
    },
    
    applyThemeOnStart() {
        const applyTheme = () => {
            const savedTheme = window.Utils?.loadData('app_theme') || 'light';
            document.body.classList.toggle('dark-theme', savedTheme === 'dark');
            if (window.Utils?.saveData) {
                window.Utils.saveData('app_theme', savedTheme);
            }
        };
        applyTheme();
        setTimeout(applyTheme, 100);
        window.addEventListener('load', applyTheme, { once: true });
    },
    
    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (!loadingScreen) return;
        loadingScreen.style.opacity = '0';
        setTimeout(() => loadingScreen.style.display = 'none', 500);
    },
    
    checkAuth() {
        const savedUser = Auth.getStoredUser();
        savedUser ? this.showMainApp(savedUser) : this.showLogin();
    },
    
    showLogin() {
        const loginScreen = document.getElementById('login-screen');
        if (!loginScreen) return;
        loginScreen.classList.remove('hidden');
        setTimeout(() => {
            if (typeof window.setupLoginForm === 'function') {
                window.setupLoginForm();
            }
            window.LoginBackground?.apply?.();
            window.LoginPhrases?.inject?.();
            window.LoginParticles?.inject?.();
            window.LoginEffects?.inject?.();
            const usernameInput = document.getElementById('login-username');
            if (usernameInput) usernameInput.focus();

        }, 300);
    },
    
    showMainApp(user = this.user) {
        this.user = user;

        const isFirstTime = !Utils.loadData('nyan_online_linked');
        if (isFirstTime && window.NyanFirebase) {
            NyanFirebase.init().then(ready => {
                if (ready) {
                    NyanAuth._showAuthModal(user.username);
                    const observer = new MutationObserver(() => {
                        if (!document.getElementById('nyantag-modal')) {
                            observer.disconnect();
                            this._enterApp(user);
                        }
                    });
                    observer.observe(document.body, { childList: true });
                } else {
                    this._enterApp(user);
                }
            });
            return;
        }

        this._enterApp(user);
    },

    _enterApp(user) {
        this.user = user;
        const loginScreen = document.getElementById('login-screen');
        const mainApp     = document.getElementById('main-app');
        const userDisplay = document.getElementById('user-display');
        const userAvatar  = document.getElementById('user-avatar');

        if (loginScreen) loginScreen.classList.add('hidden');
        if (mainApp)     mainApp.classList.add('visible');
        if (userDisplay) userDisplay.textContent = user.username;

        const savedTag = Utils.loadData('nyan_online_tag');
        const statusEl = document.getElementById('sidebar-online-status');
        if (savedTag && statusEl) {
            statusEl.textContent      = savedTag;
            statusEl.style.color      = 'rgba(168,85,247,0.85)';
            statusEl.style.fontWeight = '700';
            statusEl.style.fontSize   = '0.62rem';
        }
        this._updateFavGame();
        setTimeout(() => this._restoreSidebarState(), 100);
        if (userAvatar) {
            const savedAvatar = Utils.loadData('nyan_profile_avatar');
            if (savedAvatar) {
                userAvatar.innerHTML = `<img src="${savedAvatar}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" alt="Avatar"/>`;
            } else if (window.AvatarGenerator) {
                userAvatar.innerHTML = AvatarGenerator.generate(user.username, 30);
                userAvatar.style.background = 'transparent';
            } else {
                userAvatar.innerHTML = '';
                userAvatar.textContent = user.username.charAt(0).toUpperCase();
            }

            const observer = new MutationObserver(() => {
                const newAvatar = Utils.loadData('nyan_profile_avatar');
                if (newAvatar && window.NyanAuth?.isOnline?.()) {
                    const uid = NyanAuth.getUID();
                    if (uid) NyanFirebase.updateDoc('users/' + uid, { avatar: newAvatar }).catch(() => {});
                }
            });
            observer.observe(userAvatar, { childList: true, subtree: true });
        }

        this.renderNavMenu();
        if (window.DevSecurity?.init) {
            DevSecurity.init().catch(() => {}).finally(() => this.renderNavMenu());
        }
        this.initNewSystems();
        if (window.Shop?.startBundleCatalogSync) {
            window.Shop.startBundleCatalogSync({ forceBoot: true, silent: true });
        } else if (window.Shop?._ensureBundleCatalogRuntime) {
            window.Shop._ensureBundleCatalogRuntime({ force: true, silent: true, cacheBust: true });
        }
        Router.currentRoute = 'home';
        Router.render();
        this.checkWhatsNew();
    },
    
    checkWhatsNew() {
        const lastSeenVersion = Utils.loadData('last_seen_version');
        const currentVersion  = this.version;
        if (lastSeenVersion && lastSeenVersion !== currentVersion) {
            setTimeout(() => this._showWhatsNewModal(lastSeenVersion, currentVersion), 1200);
        }
        Utils.saveData('last_seen_version', currentVersion);
    },

    _showWhatsNewModal(fromVersion, toVersion) {
        const modal = document.getElementById('whats-new-modal');
        if (!modal) return;
        const changelog    = window.AutoUpdater?.changelog ?? [];
        const currentIdx   = changelog.findIndex(r => r.version === toVersion);
        const previousEntry= currentIdx !== -1 ? changelog[currentIdx + 1] : null;
        const displayFrom  = previousEntry?.version ?? fromVersion;
        const versionEl    = modal.querySelector('[data-whats-new-version]');
        if (versionEl) versionEl.textContent = `v${toVersion}`;
        const fromEl = modal.querySelector('[data-whats-new-from]');
        if (fromEl) fromEl.textContent = `v${displayFrom}`;
        const listEl = modal.querySelector('[data-whats-new-list]');
        if (listEl && window.AutoUpdater) {
            const release = AutoUpdater.changelog.find(r => r.version === toVersion);
            if (release) {
                listEl.innerHTML = release.changes.map(c => `
                    <div class="flex items-start gap-2.5 py-2" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <span class="shrink-0 mt-0.5 text-base leading-none">${c.type}</span>
                        <span class="text-sm text-gray-300 leading-snug">${c.text}</span>
                    </div>
                `).join('');
            }
        }
        modal.classList.remove('hidden');
        modal.querySelector('[data-whats-new-card]')?.classList.add('whats-new-enter');
    },

    initNewSystems() {
        if (window.KeyboardShortcuts) {
            KeyboardShortcuts.init();
        }
        if (window.FocusMode) {
            FocusMode.init();
        }
        if (window.CommandPalette) {
            CommandPalette.init();
        }
        if (window.Router?.init) {
            Router.init();
        }
        if (window.Favorites) {
            Favorites.init();
        }
        if (window.UserProfile) {
            UserProfile.init();
        }
        if (window.Achievements) Achievements.init();
        if (window.BetaTesters)  BetaTesters.init();
        if (window.Economy) {
            Economy.init();
        }
        if (window.Seasons) {
            Seasons.init();
        }
        if (window.Missions) {
            Missions.init();
        }
        if (window.Inventory) {
            Inventory.init();
        }
        if (window.Badges) {
            Badges.init();
        }
        this.startActivityTracking();

        setTimeout(async () => {
            if (window.NyanAuth && window.NyanFirebase?.isReady?.()) {
                await NyanAuth.init?.().catch(() => false);
                const activeUID = String(window.NyanFirebase?.auth?.currentUser?.uid || NyanAuth.getUID?.() || '').trim();
                let hydrated = null;
                if (activeUID) {
                    hydrated = await NyanAuth._hydrateLocalStateFromCloud?.(activeUID).catch(() => null);
                }
                const canSyncEconomy = !!(hydrated && hydrated.success);
                await NyanAuth._syncLocalProfile?.({ includeEconomy: canSyncEconomy }).catch(() => {});
                if (window.Leaderboard) Leaderboard.setupAutoSync();
                setTimeout(() => this._initSocialBadges(), 1000);
                setTimeout(() => this._updateFavGame(), 500);
            }
        }, 2500);
    },

    _updateFavGame() {
        const el = document.getElementById('sidebar-fav-game');
        if (!el) return;
        const GAMES = [
            { key: 'typeracer_highscore',   max: 200,    higher: true,  icon: '\u2328\uFE0F', label: 'Type Racer'  },
            { key: 'game_2048_highscore',   max: 131072, higher: true,  icon: '\u{1F522}', label: '2048'         },
            { key: 'flappy_bird_highscore', max: 100,    higher: true,  icon: '\u{1F431}', label: 'Flappy Nyan'  },
            { key: 'quiz_highscore',        max: 10,     higher: true,  icon: '\u{1F9E0}', label: 'Quiz Diário'  },
            { key: 'termo_best',            max: 6,      higher: false, icon: '\u{1F524}', label: 'Termo'         },
            { key: 'snake_highscore',       max: 500,    higher: true,  icon: '\u{1F40D}', label: 'Cobrinha'      },
        ];
        let best = null, bestRatio = -1;
        GAMES.forEach(g => {
            const val = parseFloat(Utils.loadData(g.key));
            if (!val) return;
            const ratio = g.higher ? val / g.max : 1 - val / g.max;
            if (ratio > bestRatio) { bestRatio = ratio; best = g; }
        });
        if (best) {
            el.textContent = best.icon + ' ' + best.label;
            el.style.display = 'block';
        } else {
            el.style.display = 'none';
        }
    },

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const btn     = document.getElementById('sidebar-toggle-btn');
        if (!sidebar) return;
        const isCollapsed = sidebar.classList.toggle('collapsed');
        if (btn) btn.textContent = isCollapsed ? '\u25B6' : '\u25C0';
        Utils.saveData('sidebar_collapsed', isCollapsed);
    },

    _restoreSidebarState() {
        const collapsed = Utils.loadData('sidebar_collapsed');
        if (collapsed) {
            const sidebar = document.getElementById('sidebar');
            const btn     = document.getElementById('sidebar-toggle-btn');
            if (sidebar) sidebar.classList.add('collapsed');
            if (btn) btn.textContent = '\u25B6';
        }
    },

    _initSocialBadges() {
        if (!NyanAuth.isOnline() || !NyanFirebase.isReady()) return;
        const uid = NyanAuth.getUID();
        if (!uid) return;

        const { collection, query, where, onSnapshot, getDocs } = NyanFirebase.fn;

        const chatsRef = query(collection(NyanFirebase.db, 'chats'), where('participants', 'array-contains', uid));
        const unsubChats = onSnapshot(chatsRef, (snap) => {
            let totalUnread = 0;
            snap.docs.forEach(d => {
                totalUnread += d.data()[`unread_${uid}`] || 0;
            });
            const badge = document.getElementById('chat-nav-badge');
            if (badge) {
                if (totalUnread > 0) {
                    badge.textContent = totalUnread > 9 ? '9+' : totalUnread;
                    badge.style.display = 'inline-flex';
                } else {
                    badge.style.display = 'none';
                }
            }
            const versionLabel = `NyanTools \u306B\u3083\u3093~ v${this.version}`;
            if (totalUnread > 0) {
                document.title = `(${totalUnread}) ${versionLabel}`;
            } else if (!document.title.startsWith('(')) {
                document.title = versionLabel;
            }
        }, () => {});
        NyanFirebase._listeners.push(unsubChats);

        const pendingChallenges = query(
            collection(NyanFirebase.db, 'challenges'),
            where('challenged.uid', '==', uid),
            where('status', '==', 'pending')
        );
        const unsubChallenges = onSnapshot(pendingChallenges, (snap) => {
            const count = snap.size || 0;
            const badge = document.getElementById('challenges-nav-badge');
            if (badge) {
                if (count > 0) {
                    badge.textContent = count > 9 ? '9+' : count;
                    badge.style.display = 'inline-flex';
                } else {
                    badge.style.display = 'none';
                }
            }
        }, () => {});
        NyanFirebase._listeners.push(unsubChallenges);

        this._watchFriendRecords(uid);
    },

    async _watchFriendRecords(myUID) {
        if (!NyanFirebase.isReady()) return;
        const { query, collection, where, getDocs, onSnapshot } = NyanFirebase.fn;

        const fsSnap = await getDocs(query(
            collection(NyanFirebase.db, 'friendships'),
            where('users', 'array-contains', myUID)
        )).catch(() => null);
        if (!fsSnap) return;

        const friendUIDs = fsSnap.docs.map(d => {
            const u = d.data().users || [];
            return u.find(x => x !== myUID);
        }).filter(Boolean);

        if (friendUIDs.length === 0) return;

        const myScores = {
            sc_typeracer: parseFloat(Utils.loadData('typeracer_highscore')) || 0,
            sc_2048:      parseFloat(Utils.loadData('game_2048_highscore')) || 0,
            sc_flappy:    parseFloat(Utils.loadData('flappy_bird_highscore')) || 0,
            sc_quiz:      parseFloat(Utils.loadData('quiz_highscore')) || 0,
            sc_snake:     parseFloat(Utils.loadData('snake_highscore')) || 0,
        };
        const gameNames = { sc_typeracer:'Type Racer', sc_2048:'2048', sc_flappy:'Flappy Nyan', sc_quiz:'Quiz Diário', sc_snake:'Cobrinha' };

        friendUIDs.slice(0, 10).forEach(fuid => {
            const unsubFriend = onSnapshot(
                NyanFirebase.docRef(`users/${fuid}`),
                (snap) => {
                    if (!snap.exists()) return;
                    const data = snap.data();
                    Object.entries(gameNames).forEach(([key, name]) => {
                        const theirScore = parseFloat(data[key]) || 0;
                        const myScore    = myScores[key];
                        if (!theirScore || !myScore) return;
                        if (theirScore > myScore) {
                            const notifKey = `notif_beaten_${fuid}_${key}`;
                            const lastNotif = Utils.loadData(notifKey);
                            if (lastNotif !== String(theirScore)) {
                                Utils.saveData(notifKey, String(theirScore));
                                const username = data.username || 'Um amigo';
                                Utils.showNotification(
                                    `\u{1F3C6} ${username} bateu seu recorde em ${name}! (${theirScore.toLocaleString('pt-BR')})`,
                                    'info'
                                );
                            }
                        }
                    });
                },
                () => {}
            );
            NyanFirebase._listeners.push(unsubFriend);
        });
    },
    
    startActivityTracking() {
        if (this._activityInterval) clearInterval(this._activityInterval);
        this._activityInterval = setInterval(() => {
            if (window.Dashboard) {
                const today      = new Date().toISOString().split('T')[0];
                const dayOfWeek  = new Date().getDay();
                Dashboard.stats.totalTime++;
                if (!Dashboard.stats.dailyActivity) Dashboard.stats.dailyActivity = {};
                Dashboard.stats.dailyActivity[today] = (Dashboard.stats.dailyActivity[today] || 0) + 1;
                Dashboard.stats.weeklyActivity[dayOfWeek] = Dashboard.stats.dailyActivity[today];
                if (Dashboard.stats.totalTime % 5 === 0) Dashboard.saveStats();
                if (Router.currentRoute === 'home' && Dashboard.refreshWeeklyChart) {
                    Dashboard.refreshWeeklyChart();
                }
            }
        }, 60000);
    },
    
    renderNavMenu() {
        const navMenu = document.getElementById('nav-menu');
        if (!navMenu) return;

        const hasUpdate = window.AutoUpdater?.hasPendingUpdate?.() ?? !!window.AutoUpdater?.updateAvailable;
        const groups = [
            { label: null,             items: ['home'] },
            { label: 'Ferramentas',    items: ['password','weather','translator','ai-assistant','temp-email'] },
            { label: 'Entretenimento', items: ['mini-game','music','offline'] },
            { label: 'Organização',    items: ['notes','tasks','missions','season','shop'] },
            { label: 'Social',         items: ['friends','chat','leaderboard','feed','challenges'] },
            { label: 'Sistema',        items: ['settings','dev-lab'] }
        ];

        const toolMap    = Object.fromEntries(this.getVisibleTools().map(t => [t.id, t]));
        const favSection = window.Favorites ? Favorites.renderSection() : '';
        const missionsWidget = window.Missions ? Missions.renderSidebarWidget() : '';
        const seasonWidget = window.Seasons ? Seasons.renderSidebarWidget() : '';

        navMenu.innerHTML = favSection + missionsWidget + seasonWidget + groups.map(group => {
            const items = group.items.map(id => {
                const tool = toolMap[id];
                if (!tool) return '';
                const isActive = this.currentTool === tool.id;
                const badge    = hasUpdate && tool.id === 'settings'
                    ? `<span class="nav-update-dot" title="Atualização disponível"></span>`
                    : '';
                const missionsBadge = tool.id === 'missions' && window.Missions
                    ? (() => {
                        const pending = Missions.getPendingCount();
                        return pending > 0
                            ? `<span id="missions-nav-badge" style="display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 4px;background:#ef4444;border-radius:99px;font-size:0.55rem;font-weight:800;color:white;margin-left:auto;">${pending}</span>`
                            : `<span id="missions-nav-badge" style="display:none;"></span>`;
                    })()
                    : '';
                const chatBadge = tool.id === 'chat'
                    ? `<span id="chat-nav-badge" style="display:none;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 4px;background:#a855f7;border-radius:99px;font-size:0.55rem;font-weight:800;color:white;margin-left:auto;"></span>`
                    : '';
                const challengeBadge = tool.id === 'challenges'
                    ? `<span id="challenges-nav-badge" style="display:none;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 4px;background:#fbbf24;border-radius:99px;font-size:0.55rem;font-weight:800;color:white;margin-left:auto;"></span>`
                    : '';
                return `
                    <button class="nav-item ${isActive ? 'active' : ''}"
                            data-tool="${tool.id}"
                            onclick="Router.navigate('${tool.id}')"
                            title="${tool.description}">
                        <span class="nav-icon">${tool.icon}</span>
                        <span class="nav-label">${tool.name}</span>
                        ${badge}${missionsBadge}${chatBadge}${challengeBadge}
                    </button>
                `;
            }).join('');

            const groupLabel = group.label
                ? `<div class="nav-group-label">${group.label}</div>`
                : '';
            return `<div class="nav-group">${groupLabel}${items}</div>`;
        }).join('');

        if (window.Favorites) {
            setTimeout(() => {
                Favorites.injectStars();
                Favorites.setupDragDrop();
            }, 0);
        }
    },
    
    updateActiveNav(toolId) {
        this.currentTool = toolId;
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.tool === toolId);
        });
    },
    
    setupGlobalListeners() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
        window.addEventListener('online',  () => this.handleConnectionChange(true));
        window.addEventListener('offline', () => this.handleConnectionChange(false));
        window.addEventListener('nyan:dev-security-updated', () => {
            if (!this.user) return;
            this.renderNavMenu();
            if (window.Router?.currentRoute === 'dev-lab') {
                Router.render();
            }
        });

        this._eggClicks  = 0;
        this._eggTimeout = null;
        document.addEventListener('click', (e) => {
            const logo = e.target.closest('.sidebar-logo');
            if (!logo) return;
            clearTimeout(this._eggTimeout);
            this._eggClicks++;
            const icon = logo.querySelector('.sidebar-logo-icon');
            if (icon) {
                icon.style.transition = 'transform 0.15s cubic-bezier(0.34,1.56,0.64,1)';
                icon.style.transform  = `rotate(${(this._eggClicks % 2 === 0 ? -1 : 1) * 15}deg) scale(1.2)`;
                setTimeout(() => { icon.style.transform = ''; }, 200);
            }
            if (this._eggClicks >= 5) {
                this._eggClicks = 0;
                showEasterEgg();
                return;
            }
            this._eggTimeout = setTimeout(() => {
                this._eggClicks = 0;
                if (icon) icon.style.transform = '';
            }, 2500);
        });
    },
    
    handleLogout() {
        document.getElementById('logout-confirm-modal')?.remove();
        const modal = document.createElement('div');
        modal.id    = 'logout-confirm-modal';
        modal.style.cssText = `
            position:fixed; inset:0; z-index:99999;
            display:flex; align-items:center; justify-content:center;
            background:rgba(0,0,0,0.65);
            animation:lcFadeIn 0.2s ease;
        `;
        modal.innerHTML = `
            <style>
                @keyframes lcFadeIn  { from{opacity:0} to{opacity:1} }
                @keyframes lcSlideUp { from{opacity:0;transform:translateY(20px) scale(0.97)} to{opacity:1;transform:none} }
                #lc-card { animation:lcSlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1); }
                #lc-cancel:hover  { background:rgba(255,255,255,0.1) !important; color:white !important; }
                #lc-confirm:hover { background:rgba(239,68,68,1) !important; }
            </style>
            <div id="lc-card" style="
                background:#0e0e16; border:1px solid rgba(255,255,255,0.09);
                border-radius:16px; padding:1.75rem;
                width:100%; max-width:320px; margin:0 1rem;
                box-shadow:0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05);
                font-family:'DM Sans',sans-serif;
            ">
                <div style="width:48px;height:48px;border-radius:14px;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.2);display:flex;align-items:center;justify-content:center;font-size:1.4rem;margin-bottom:1rem;">\u{1F6AA}</div>
                <div style="font-size:1rem;font-weight:800;color:white;margin-bottom:0.375rem;font-family:'Syne',sans-serif;">Sair da conta?</div>
                <div style="font-size:0.8rem;color:rgba(255,255,255,0.4);line-height:1.5;margin-bottom:1.5rem;">Você será redirecionado para a tela de login. \u306B\u3083\u3093~</div>
                <div style="display:flex;gap:0.625rem;">
                    <button id="lc-cancel" style="flex:1;padding:0.6rem;border-radius:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);font-size:0.875rem;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;">Cancelar</button>
                    <button id="lc-confirm" style="flex:1;padding:0.6rem;border-radius:10px;background:rgba(239,68,68,0.85);border:1px solid rgba(239,68,68,0.4);color:white;font-size:0.875rem;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;box-shadow:0 4px 16px rgba(239,68,68,0.3);">Sair</button>
                </div>
            </div>
        `;
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        modal.querySelector('#lc-cancel').addEventListener('click',  () => modal.remove());
        modal.querySelector('#lc-confirm').addEventListener('click', () => { modal.remove(); this._doLogout(); });
        document.body.appendChild(modal);
    },

    _doLogout() {
        if (this._activityInterval) { clearInterval(this._activityInterval); this._activityInterval = null; }
        if (window.FocusMode?.active) FocusMode.disable();
        if (window.DevSecurity?.lock) DevSecurity.lock().catch(() => {});
        if (window.NyanAuth) NyanAuth.logout().catch(() => {});
        this.user        = null;
        this.currentTool = 'home';
        Auth.logout();
        const loginForm = document.getElementById('login-form');
        if (loginForm) loginForm.reset();
        location.reload();
    },
    
    handleConnectionChange(isOnline) {
        this.isOnline = isOnline;
        if (window.Utils?.showNotification) {
            Utils.showNotification(
                isOnline ? '\u2705 Conexão restaurada! \u306B\u3083\u3093~' : '\u26A0\uFE0F Você está offline \u306B\u3083\u3093~',
                isOnline ? 'success' : 'warning'
            );
        }
    },
    
    getTool(toolId) {
        return this.tools.find(t => t.id === toolId);
    }
};

function showEasterEgg() {
    document.getElementById('easter-egg-modal')?.remove();
    const modal = document.createElement('div');
    modal.id = 'easter-egg-modal';
    modal.style.cssText = `
        position: fixed; inset: 0; z-index: 99999;
        display: flex; align-items: center; justify-content: center;
        background: rgba(0,0,0,0.85);
        animation: eggFadeIn 0.3s ease;
    `;
    modal.innerHTML = `
        <style>
            @keyframes eggFadeIn  { from { opacity:0 } to { opacity:1 } }
            @keyframes eggBounce  { 0%,100% { transform:translateY(0) rotate(0deg) } 25% { transform:translateY(-12px) rotate(-8deg) } 75% { transform:translateY(-6px) rotate(8deg) } }
            @keyframes eggSlideUp { from { opacity:0; transform:translateY(40px) scale(0.9) } to { opacity:1; transform:translateY(0) scale(1) } }
            #egg-card { animation: eggSlideUp 0.4s cubic-bezier(0.34,1.56,0.64,1); }
            #egg-cat  { animation: eggBounce 1.2s ease-in-out infinite; display:inline-block; }
        </style>
        <div id="egg-card" style="background:#0d0d12;border:1px solid rgba(168,85,247,0.3);border-radius:20px;padding:2rem 2.25rem;max-width:420px;width:90%;box-shadow:0 32px 80px rgba(0,0,0,0.8),0 0 0 1px rgba(168,85,247,0.1),0 0 60px rgba(168,85,247,0.1);font-family:'DM Sans',sans-serif;color:#e5e7eb;position:relative;">
            <button onclick="document.getElementById('easter-egg-modal').remove()" style="position:absolute;top:1rem;right:1rem;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.4);border-radius:8px;width:28px;height:28px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:all 0.2s;" onmouseover="this.style.color='white';this.style.background='rgba(255,255,255,0.12)'" onmouseout="this.style.color='rgba(255,255,255,0.4)';this.style.background='rgba(255,255,255,0.06)'">\u2715</button>
            <div style="text-align:center;margin-bottom:1.5rem;">
                <div id="egg-cat" style="font-size:3.5rem;margin-bottom:0.75rem;">\u{1F431}</div>
                <div style="font-family:'Syne',sans-serif;font-size:1.4rem;font-weight:900;background:linear-gradient(135deg,#a855f7,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:0.25rem;">NYAN NYAN!</div>
                <div style="font-size:0.75rem;color:rgba(255,255,255,0.3);letter-spacing:0.1em;">\u306B\u3083\u3093~ \u00B7 Easter Egg Desbloqueado</div>
            </div>
            <div style="height:1px;background:rgba(255,255,255,0.07);margin-bottom:1.25rem;"></div>
            <div style="text-align:center;margin-bottom:1.25rem;">
                <p style="font-size:0.875rem;color:rgba(255,255,255,0.7);line-height:1.6;margin-bottom:0.5rem;">Bem-vindo ao <strong style="color:white;">NyanTools</strong>!<br>Sua caixa de ferramentas kawaii \u{1F38C}</p>
            </div>
            <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-left:3px solid #ef4444;border-radius:10px;padding:0.875rem 1rem;margin-bottom:1.25rem;">
                <div style="font-size:0.7rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#ef4444;">\u26A0\uFE0F Aviso Importante</div>
                <p style="font-size:0.75rem;color:rgba(255,255,255,0.55);line-height:1.6;margin:0.5rem 0 0;">Em caso de investigação policial, eu declaro que não tenho envolvimento com este grupo e não sei como estou no mesmo, provavelmente fui inserido por terceiros. Declaro estar disposto a colaborar com as investigações e a me apresentar a depoimento se necessário.</p>
            </div>
            <div style="text-align:center;">
                <p style="font-size:0.7rem;color:rgba(255,255,255,0.25);margin-bottom:1rem;">Use o NyanTools com responsabilidade! \u306B\u3083\u3093~ \u{1F431}\u2728</p>
                <button onclick="document.getElementById('easter-egg-modal').remove()" style="background:linear-gradient(135deg,#a855f7,#ec4899);border:none;border-radius:10px;color:white;padding:0.6rem 1.75rem;font-size:0.875rem;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;box-shadow:0 4px 20px rgba(168,85,247,0.4);transition:all 0.2s;" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 28px rgba(168,85,247,0.55)'" onmouseout="this.style.transform='';this.style.boxShadow='0 4px 20px rgba(168,85,247,0.4)'">Entendido \u306B\u3083\u3093~</button>
            </div>
        </div>
    `;
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.style.transition = 'transform 0.1s ease';
        let i = 0;
        const shake = setInterval(() => {
            sidebar.style.transform = `translateX(${i % 2 === 0 ? 6 : -6}px)`;
            if (++i > 6) { clearInterval(shake); sidebar.style.transform = ''; }
        }, 60);
    }
}

document.addEventListener('DOMContentLoaded', () => App.init());

document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
        e.preventDefault();
        if (window.electronAPI?.openExternal) {
            window.electronAPI.openExternal(href);
        } else {
            window.open(href, '_blank', 'noopener');
        }
    }
});

window.App          = App;
window.showEasterEgg = showEasterEgg;

document.addEventListener('click', (e) => {
    const btn = e.target.closest(
        'button[class*="bg-gradient"], .btn-primary, .btn-secondary, .btn-danger'
    );
    if (!btn) return;
    if (btn.classList.contains('no-ripple')) return;

    const rect = btn.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const wave = document.createElement('span');
    wave.className = 'nyan-ripple-wave';

    const size = Math.min(rect.width, rect.height) * 0.8;
    const x    = e.clientX - rect.left - size / 2;
    const y    = e.clientY - rect.top  - size / 2;

    wave.style.cssText = `
        position:absolute;
        pointer-events:none;
        border-radius:50%;
        background:rgba(255,255,255,0.25);
        width:${size}px;
        height:${size}px;
        left:${x}px;
        top:${y}px;
        animation:nyanRipple 0.5s ease-out forwards;
        transform-origin:center;
    `;

    if (getComputedStyle(btn).position === 'static') {
        btn.style.position = 'relative';
    }

    btn.appendChild(wave);
    wave.addEventListener('animationend', () => wave.remove(), { once: true });
});
