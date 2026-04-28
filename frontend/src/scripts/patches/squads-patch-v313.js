(function patchSquadsV313() {
    const SQUADS_TOOL = {
        id: 'squads',
        name: 'Clãs',
        icon: '◆',
        description: 'Clãs e grupos sociais',
    };

    const wait = (test, fn, delay = 250) => {
        if (test()) {
            fn();
            return;
        }
        setTimeout(() => wait(test, fn, delay), delay);
    };

    wait(() => window.App && window.Router && window.Squads && window.SquadsUI, () => {
        if (window.__squadsPatchV313Done) return;
        window.__squadsPatchV313Done = true;

        patchRouter();
        patchApp();
        patchPresence();
        patchProfile();
        patchFriends();
        patchPublicProfile();
        patchSquadScoring();
        patchOnlineReady();
    });

    function patchRouter() {
        if (window.Router.routes.squads === 'SquadsUI') return;
        window.Router.routes.squads = 'SquadsUI';
    }

    function patchApp() {
        if (window.App.__squadsNativeIntegrated) return;
        if (!window.App.tools.some((tool) => tool.id === 'squads')) {
            const socialIdx = window.App.tools.findIndex((tool) => tool.id === 'leaderboard');
            const insertAt = socialIdx >= 0 ? socialIdx : window.App.tools.length;
            window.App.tools.splice(insertAt, 0, SQUADS_TOOL);
        }

        const originalRenderNav = window.App.renderNavMenu?.bind(window.App);
        if (!originalRenderNav || window.App.__squadsRenderNavPatched) return;
        window.App.__squadsRenderNavPatched = true;

        window.App.renderNavMenu = function() {
            originalRenderNav();
            const nav = document.getElementById('nav-menu');
            if (!nav || nav.querySelector('[data-tool="squads"]')) return;

            const socialGroup = Array.from(nav.querySelectorAll('.nav-group')).find((group) => {
                return group.querySelector('[data-tool="friends"]') || group.textContent.includes('Social');
            });
            if (!socialGroup) return;

            const tool = window.App.tools.find((item) => item.id === 'squads') || SQUADS_TOOL;
            const active = window.App.currentTool === 'squads' ? 'active' : '';
            const html = `
                <button class="nav-item ${active}"
                        data-tool="squads"
                        onclick="Router.navigate('squads')"
                        title="${tool.description}">
                    <span class="nav-icon">${tool.icon}</span>
                    <span class="nav-label">${tool.name}</span>
                </button>`;

            const chatBtn = socialGroup.querySelector('[data-tool="chat"]');
            if (chatBtn) chatBtn.insertAdjacentHTML('beforebegin', html);
            else socialGroup.insertAdjacentHTML('beforeend', html);
        };

        const originalInitNewSystems = window.App.initNewSystems?.bind(window.App);
        if (originalInitNewSystems && !window.App.__squadsInitPatched) {
            window.App.__squadsInitPatched = true;
            window.App.initNewSystems = function() {
                originalInitNewSystems();
                setTimeout(() => window.Squads?.init?.(), 260);
            };
        }

        if (document.getElementById('main-app')?.classList.contains('visible')) {
            window.Squads?.init?.();
            window.App.renderNavMenu?.();
        }
    }

    function patchPresence() {
        wait(() => window.Presence, () => {
            if (window.App?.__squadsNativeIntegrated && window.Presence.ROUTE_CONTEXTS?.squads) return;
            window.Presence.ROUTE_CONTEXTS = {
                ...(window.Presence.ROUTE_CONTEXTS || {}),
                squads: { status: 'online', label: 'No Clã', icon: '◆' },
            };

            const originalUpdateFromRoute = window.Presence.updateFromRoute?.bind(window.Presence);
            if (!originalUpdateFromRoute || window.Presence.__squadsRoutePatched) return;
            window.Presence.__squadsRoutePatched = true;

            window.Presence.updateFromRoute = function(route) {
                if (route === 'squads') {
                    const squad = window.Squads?.getCurrentSquadSync?.();
                    const label = squad?.tag ? `No Clã [${squad.tag}]` : 'No Clã';
                    this._currentRoute = 'squads';
                    this._setContext({ status: 'online', label, icon: '◆', route: 'squads' });
                    return;
                }
                return originalUpdateFromRoute(route);
            };
        });
    }

    function patchProfile() {
        wait(() => window.ProfileV2, () => {
            const originalHero = window.ProfileV2.renderHeroBanner?.bind(window.ProfileV2);
            if (originalHero && !window.ProfileV2.__squadsHeroPatched) {
                window.ProfileV2.__squadsHeroPatched = true;
                window.ProfileV2.renderHeroBanner = function(options = {}) {
                    const html = originalHero(options);
                    const squad = window.Squads?.getCurrentSquadSync?.();
                    if (!squad) return html;
                    const chip = `<span class="profile-edit-hero-chip">Clã [${escapeHtml(squad.tag)}]</span>`;
                    return html.replace(
                        '<span class="profile-edit-hero-chip">Hub de perfil</span>',
                        `${chip}<span class="profile-edit-hero-chip">Hub de perfil</span>`
                    );
                };
            }

            const originalPreview = window.ProfileV2.renderProfilePreviewSummary?.bind(window.ProfileV2);
            if (originalPreview && !window.ProfileV2.__squadsPreviewPatched) {
                window.ProfileV2.__squadsPreviewPatched = true;
                window.ProfileV2.renderProfilePreviewSummary = function(options = {}) {
                    const html = originalPreview(options);
                    const squad = window.Squads?.getCurrentSquadSync?.();
                    const value = squad ? `${escapeHtml(squad.name)} [${escapeHtml(squad.tag)}]` : 'Nenhum';
                    const row = `
                        <div class="profile-preview-item">
                            <span class="profile-preview-label">Clã</span>
                            <span class="profile-preview-value">${value}</span>
                        </div>`;
                    return html.replace('<div class="profile-preview-list">', `<div class="profile-preview-list">${row}`);
                };
            }
        });
    }

    function patchFriends() {
        wait(() => window.Friends, () => {
            if (window.Friends._isKnownRoute && !window.Friends._isKnownRoute.__squadsPatched) {
                const originalIsKnownRoute = window.Friends._isKnownRoute?.bind(window.Friends);
                window.Friends._isKnownRoute = function(route) {
                    return route === 'squads' || originalIsKnownRoute?.(route) === true;
                };
                window.Friends._isKnownRoute.__squadsPatched = true;
            }

            if (window.Friends._presenceRouteLabel && !window.Friends._presenceRouteLabel.__squadsPatched) {
                const originalRouteLabel = window.Friends._presenceRouteLabel?.bind(window.Friends);
                window.Friends._presenceRouteLabel = function(route) {
                    if (route === 'squads') return 'Clãs';
                    return originalRouteLabel?.(route) || route;
                };
                window.Friends._presenceRouteLabel.__squadsPatched = true;
            }
        });
    }

    function patchPublicProfile() {
        wait(() => window.Friends, () => {
            const originalLoadPublic = window.Friends._loadPublicProfile?.bind(window.Friends);
            if (!originalLoadPublic || window.Friends.__squadsPublicProfilePatched) return;
            window.Friends.__squadsPublicProfilePatched = true;

            window.Friends._loadPublicProfile = async function() {
                const result = await originalLoadPublic();
                const uid = window._viewingProfile;
                if (!uid || !window.NyanFirebase?.isReady?.()) return result;

                const row = document.getElementById('nyan-pp-tag-row');
                if (!row || document.getElementById('nyan-pp-squad-row')) return result;

                const profile = await window.NyanFirebase.getDoc(`users/${uid}`).catch(() => null);
                const tag = profile?.squadTag || profile?.squad?.tag;
                const name = profile?.squadName || profile?.squad?.name;
                if (!tag) return result;

                row.insertAdjacentHTML('afterend', `
                    <div id="nyan-pp-squad-row" style="display:flex;justify-content:center;margin:-0.1rem 0 0.55rem;">
                        <span style="display:inline-flex;align-items:center;gap:0.28rem;padding:0.22rem 0.62rem;border-radius:999px;
                            border:1px solid rgba(168,85,247,0.25);background:rgba(168,85,247,0.1);
                            color:var(--theme-primary,#a855f7);font-size:0.66rem;font-weight:900;">
                            Clã ${escapeHtml(name || '')} [${escapeHtml(tag)}]
                        </span>
                    </div>
                `);
                return result;
            };
        });
    }

    function patchOnlineReady() {
        window.addEventListener('nyan:squad:onSquadCreated', () => {
            if (window.Router?.currentRoute === 'profile') window.Router.render();
        });
        window.addEventListener('nyan:squad:onMemberJoin', () => {
            if (window.Router?.currentRoute === 'profile') window.Router.render();
        });
        window.addEventListener('nyan:squad:onMemberLeave', () => {
            if (window.Router?.currentRoute === 'profile') window.Router.render();
        });
    }

    function patchSquadScoring() {
        wait(() => window.Squads && window.Missions && window.Economy, () => {
            if (window.__squadsScoringV3132Patched) return;
            window.__squadsScoringV3132Patched = true;

            const todayKey = () => {
                const d = new Date();
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            };

            const award = (payload) => {
                if (!window.NyanAuth?.isOnline?.() || !window.Squads?.getCurrentSquadSync?.()) return;
                window.Squads.awardPoints(payload).catch(() => {});
            };

            const originalTrack = window.Missions.track?.bind(window.Missions);
            if (originalTrack && !window.Missions.__squadsScoringPatched) {
                window.Missions.__squadsScoringPatched = true;
                window.Missions.track = function(ctx = {}) {
                    const before = JSON.stringify((this.load?.().missions || []).map((m) => ({ id: m.id, completed: m.completed })));
                    const result = originalTrack(ctx);
                    const day = todayKey();

                    if (ctx.event === 'quiz_finish') {
                        award({
                            source: 'daily_quiz',
                            points: Math.max(5, Math.min(25, Number(ctx.score || 0) * 2)),
                            key: `daily_quiz:${day}`,
                        });
                    } else if (ctx.event === 'play_game') {
                        award({
                            source: 'game',
                            points: 3,
                            key: `game:${day}:${ctx.game || 'any'}`,
                        });
                    } else if (['typeracer_finish', 'flappy_finish', 'score_2048', 'forca_win', 'termo_win'].includes(ctx.event)) {
                        award({
                            source: 'game',
                            points: 5,
                            key: `game:${day}:${ctx.event}`,
                        });
                    }

                    const afterMissions = this.load?.().missions || [];
                    const beforeState = new Map(JSON.parse(before).map((m) => [m.id, m.completed]));
                    afterMissions
                        .filter((m) => m.completed && beforeState.get(m.id) === false)
                        .forEach((m) => award({
                            source: 'daily_mission',
                            points: m.diff === 'hard' ? 24 : (m.diff === 'medium' ? 16 : 10),
                            key: `daily_mission:${day}:${m.id}`,
                        }));

                    return result;
                };
            }

            const originalCheckRecord = window.Economy.checkRecord?.bind(window.Economy);
            if (originalCheckRecord && !window.Economy.__squadsScoringPatched) {
                window.Economy.__squadsScoringPatched = true;
                window.Economy.checkRecord = function(storageKey, newScore, higherIsBetter = true) {
                    const wasRecord = originalCheckRecord(storageKey, newScore, higherIsBetter);
                    if (wasRecord) {
                        award({
                            source: 'record',
                            points: 20,
                            key: `record:${storageKey}:${newScore}`,
                        });
                    }
                    return wasRecord;
                };
            }
        });
    }

    function escapeHtml(value = '') {
        return window.Utils?.escapeHTML?.(String(value || '')) || String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
})();
