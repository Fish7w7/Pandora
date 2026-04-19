const ProfileV2 = {

    KEYS: {
        banner: 'nyan_profile_banner',
        bannerType: 'nyan_profile_banner_type',
        bio: 'nyan_profile_bio',
        history: 'nyan_profile_history',
        badges: 'nyan_profile_badges',
    },

    BANNER_OPTIONS: [
        { id: 'gradient_purple', type: 'gradient', label: 'Roxo Mistico', css: 'linear-gradient(135deg, #7c3aed, #ec4899, #ef4444)' },
        { id: 'gradient_ocean', type: 'gradient', label: 'Oceano', css: 'linear-gradient(135deg, #0ea5e9, #06b6d4, #3b82f6)' },
        { id: 'gradient_forest', type: 'gradient', label: 'Floresta', css: 'linear-gradient(135deg, #10b981, #14b8a6, #84cc16)' },
        { id: 'gradient_sunset', type: 'gradient', label: 'Por do sol', css: 'linear-gradient(135deg, #f97316, #ef4444, #ec4899)' },
        { id: 'gradient_night', type: 'gradient', label: 'Noite estrelada', css: 'linear-gradient(135deg, #0f172a, #1e1b4b, #4c1d95)' },
        { id: 'gradient_candy', type: 'gradient', label: 'Candy', css: 'linear-gradient(135deg, #f472b6, #e879f9, #a78bfa)' },
        { id: 'gradient_gold', type: 'gradient', label: 'Dourado', css: 'linear-gradient(135deg, #ca8a04, #f59e0b, #fcd34d)' },
        { id: 'gradient_cyber', type: 'gradient', label: 'Cyber', css: 'linear-gradient(135deg, #0f172a, #164e63, #14b8a6)' },
    ],

    getThemeTokens() {
        const dark = document.body.classList.contains('dark-theme');
        return {
            dark,
            text: dark ? '#f1f5f9' : '#0f172a',
            sub: dark ? 'rgba(255,255,255,0.62)' : 'rgba(15,23,42,0.62)',
            muted: dark ? 'rgba(255,255,255,0.38)' : 'rgba(15,23,42,0.42)',
            soft: dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)',
            softStrong: dark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)',
            border: dark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)',
            inputBg: dark ? 'rgba(2,6,23,0.42)' : '#f4f4f9',
            accent: dark ? '#c084fc' : '#7c3aed',
            accentSoft: dark ? 'rgba(168,85,247,0.18)' : 'rgba(168,85,247,0.1)',
            panel: dark
                ? 'linear-gradient(135deg, rgba(9,12,24,0.92), rgba(25,32,54,0.86))'
                : 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(247,247,251,0.94))',
        };
    },

    getBanner() {
        const id = window.Utils?.loadData(this.KEYS.banner) || 'gradient_purple';
        const opt = this.BANNER_OPTIONS.find((o) => o.id === id);
        return opt || this.BANNER_OPTIONS[0];
    },

    getBannerById(id) {
        return this.BANNER_OPTIONS.find((o) => o.id === id) || this.BANNER_OPTIONS[0];
    },

    getBannerFromProfile(profile) {
        const id = profile?.banner || profile?.bannerId || 'gradient_purple';
        return this.getBannerById(id);
    },

    saveBanner(bannerId) {
        const opt = this.BANNER_OPTIONS.find((o) => o.id === bannerId);
        if (!opt) return;

        window.Utils?.saveData(this.KEYS.banner, bannerId);
        window.Utils?.saveData(this.KEYS.bannerType, opt.type);

        const uid = window.NyanAuth?.getUID?.();
        if (uid && window.NyanFirebase?.isReady?.()) {
            window.NyanFirebase.updateDoc(`users/${uid}`, {
                banner: bannerId,
                bannerType: opt.type,
            }).catch(() => {});
        }

        window.Utils?.showNotification('Banner atualizado!', 'success');
        if (window.Router?.currentRoute === 'profile') window.Router.render();
    },

    getBio() {
        return window.Utils?.loadData(this.KEYS.bio) || '';
    },

    saveBio(text) {
        const trimmed = String(text || '').trim();
        if (trimmed.length > 200) {
            window.Utils?.showNotification('Bio muito longa (max. 200)', 'warning');
            return;
        }

        window.Utils?.saveData(this.KEYS.bio, trimmed);

        const uid = window.NyanAuth?.getUID?.();
        if (uid && window.NyanFirebase?.isReady?.()) {
            window.NyanFirebase.updateDoc(`users/${uid}`, { bio: trimmed }).catch(() => {});
        }

        window.Utils?.showNotification('Bio salva!', 'success');
        if (window.Router?.currentRoute === 'profile') window.Router.render();
    },

    scrollToSection(id = '') {
        const el = document.getElementById(id);
        if (!el) return;

        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.add('profile-section-focus');
        window.clearTimeout(this._focusTimer);
        this._focusTimer = window.setTimeout(() => {
            el.classList.remove('profile-section-focus');
        }, 1200);
    },

    toggleBadgeShowcase(badgeId = '') {
        if (!window.Badges?.toggleShowcase) return;
        const ok = window.Badges.toggleShowcase(badgeId);
        if (!ok) return;
        this.refreshBadgeUI();
    },

    equipBadge(badgeId = '') {
        if (!window.Badges?.equip) return;
        const ok = window.Badges.equip(badgeId);
        if (!ok) return;
        this.refreshBadgeUI();
    },

    refreshBadgeUI() {
        if (window.Router?.currentRoute !== 'profile') return;

        const heroBadges = document.getElementById('profile-hero-badges-region');
        if (heroBadges) {
            heroBadges.innerHTML = this.renderHeroBadgeGroup();
        }

        const preview = document.getElementById('profile-preview-summary-panel');
        if (preview) {
            preview.outerHTML = this.renderProfilePreviewSummary({
                wide: preview.classList.contains('profile-preview-summary-wide'),
            });
        }

        const badgesPanel = document.getElementById('profile-badges-panel');
        if (badgesPanel) {
            badgesPanel.outerHTML = this.renderBadgeManager();
            return;
        }

        window.Router?.render?.();
    },

    wrapLegacyProfileCard(html = '', extraClass = '') {
        const safe = String(html || '');
        if (!safe) return '';
        return safe.replace(
            /class="profile-card([^"]*)"/,
            `class="profile-subcard profile-stats-embedded-card${extraClass ? ` ${extraClass}` : ''}$1"`
        );
    },

    formatMinutesCompact(minutes = 0) {
        const safe = Math.max(0, Number(minutes) || 0);
        if (safe >= 60) {
            const hours = Math.floor(safe / 60);
            const mins = safe % 60;
            return mins ? `${hours}h ${mins}min` : `${hours}h`;
        }
        return `${safe}min`;
    },

    getStatsViewModel() {
        const stats = window.Profile?._collectStats?.() || {
            totalTime: '0min',
            activeDays: 0,
            streak: 0,
            totalAccess: 0,
            topTools: [],
            weekDays: [],
        };
        const raw = window.Utils?.loadData?.('dashboard_stats') || {};
        const weeklyActivity = raw.weeklyActivity || {};
        const weekLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
        const weekEntries = weekLabels.map((label, index) => ({
            label,
            minutes: Number(weeklyActivity[index] || 0),
        }));
        const weeklyMinutes = weekEntries.reduce((sum, item) => sum + item.minutes, 0);
        const bestDay = weekEntries.reduce((best, current) => {
            if (!best) return current;
            return current.minutes > best.minutes ? current : best;
        }, null);
        const averageDaily = weekEntries.length ? Math.round(weeklyMinutes / weekEntries.length) : 0;
        const favoriteTool = stats.topTools?.[0] || null;
        const advanced = this.getAdvancedStats();

        return {
            stats,
            advanced,
            weeklyMinutes,
            averageDaily,
            bestDay,
            favoriteTool,
        };
    },

    getBadgeTone(badge = null) {
        const fallback = {
            label: 'Insignia',
            dark: { text: '#f1f5f9', bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.16)' },
            light: { text: '#0f172a', bg: 'rgba(15,23,42,0.06)', border: 'rgba(15,23,42,0.14)' },
        };
        const { dark } = this.getThemeTokens();
        const rarityMeta = window.Badges?.getRarityMeta?.(badge?.rarity) || fallback;
        const tone = dark ? rarityMeta.dark : rarityMeta.light;
        return {
            rarityMeta,
            tone,
            medalBg: dark
                ? `linear-gradient(135deg, rgba(9,12,24,0.96), ${tone.bg})`
                : `linear-gradient(135deg, rgba(255,255,255,0.98), ${tone.bg})`,
            focusBg: dark
                ? `linear-gradient(135deg, rgba(9,12,24,0.92), rgba(15,23,42,0.72), ${tone.bg})`
                : `linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.92), ${tone.bg})`,
            glow: tone.border,
        };
    },

    renderBadgeMedal(badge, options = {}) {
        if (!badge) return '';
        const tone = this.getBadgeTone(badge);
        const sizeClass = options.size === 'lg' ? 'lg' : (options.size === 'sm' ? 'sm' : 'md');
        const activeClass = options.active ? 'active' : '';
        return `<span class="profile-badge-medal ${sizeClass} ${activeClass}"
            title="${badge.name || 'Insignia'} • ${tone.rarityMeta.label || 'Insignia'}"
            style="--badge-text:${tone.tone.text};--badge-border:${tone.tone.border};--badge-bg:${tone.medalBg};--badge-glow:${tone.glow};">
            <span class="profile-badge-medal-icon">${badge.icon || '\u{1F3C5}'}</span>
        </span>`;
    },

    renderHeroBadgeGroup() {
        const equippedBadge = window.Badges?.getEquippedBadge?.() || null;
        const showcaseBadges = window.Badges?.getShowcaseBadges?.() || [];
        const activeBadges = showcaseBadges.length ? showcaseBadges.slice(0, 4) : (equippedBadge ? [equippedBadge] : []);

        if (!activeBadges.length) return '';

        return `<div class="profile-hero-badge-group">
            <div class="profile-hero-mini-label">Insignias ativas</div>
            <div class="profile-hero-badge-rail">
                ${activeBadges.map((badge) => this.renderBadgeMedal(badge, {
                    active: badge.id === equippedBadge?.id,
                    size: 'sm',
                })).join('')}
            </div>
        </div>`;
    },

    renderStatsSummaryPanel(view) {
        const favoriteToolLabel = view.favoriteTool
            ? `${view.favoriteTool.icon || '[]'} ${view.favoriteTool.name}`
            : 'Sem ferramenta favorita ainda';
        const bestDayLabel = view.bestDay?.minutes
            ? `${view.bestDay.label} • ${this.formatMinutesCompact(view.bestDay.minutes)}`
            : 'Nenhuma atividade registrada';
        const productivityValue = view.advanced.tasks.total > 0
            ? `${view.advanced.tasks.rate}%`
            : '0%';

        return `<div class="profile-subcard profile-subcard-emphasis profile-stats-summary-card">
            <div class="profile-subcard-head">
                <div class="profile-subcard-copy">
                    <div class="profile-subcard-title">Painel de ritmo</div>
                    <div class="profile-subcard-desc">
                        Um resumo rapido do seu momento atual dentro do app.
                    </div>
                </div>
            </div>

            <div class="profile-stats-insight-list">
                <div class="profile-stats-insight-item accent">
                    <div class="profile-stats-insight-label">Semana ativa</div>
                    <div class="profile-stats-insight-value">${this.formatMinutesCompact(view.weeklyMinutes)}</div>
                    <div class="profile-stats-insight-meta">${this.formatMinutesCompact(view.averageDaily)}/dia em media</div>
                </div>
                <div class="profile-stats-insight-item">
                    <div class="profile-stats-insight-label">Ferramenta favorita</div>
                    <div class="profile-stats-insight-value text">${favoriteToolLabel}</div>
                    <div class="profile-stats-insight-meta">${view.favoriteTool ? `${view.favoriteTool.count} acessos` : 'Use mais ferramentas para aparecer aqui'}</div>
                </div>
                <div class="profile-stats-insight-item">
                    <div class="profile-stats-insight-label">Produtividade</div>
                    <div class="profile-stats-insight-value">${productivityValue}</div>
                    <div class="profile-stats-insight-meta">${view.advanced.tasks.completed}/${view.advanced.tasks.total} tarefas concluidas</div>
                </div>
                <div class="profile-stats-insight-item">
                    <div class="profile-stats-insight-label">Melhor dia</div>
                    <div class="profile-stats-insight-value text">${bestDayLabel}</div>
                    <div class="profile-stats-insight-meta">Pico recente de uso</div>
                </div>
            </div>

            <div class="profile-btn-row" style="margin-top:0.9rem;">
                <button class="profile-btn profile-btn-secondary" onclick="ProfileV2.scrollToSection('profile-stats-activity-panel')">
                    Ver atividade
                </button>
                <button class="profile-btn profile-btn-secondary" onclick="ProfileV2.scrollToSection('profile-stats-achievements-panel')">
                    Ver conquistas
                </button>
            </div>
        </div>`;
    },

    renderStatsMetricGrid(view) {
        const cards = [
            {
                icon: '⏱',
                label: 'Tempo total',
                value: view.stats.totalTime,
                meta: `${this.formatMinutesCompact(view.weeklyMinutes)} nesta semana`,
            },
            {
                icon: '📅',
                label: 'Dias ativos',
                value: String(view.stats.activeDays),
                meta: `${this.formatMinutesCompact(view.averageDaily)} por dia`,
            },
            {
                icon: '🔥',
                label: 'Sequencia',
                value: String(view.stats.streak),
                meta: 'ritmo atual',
            },
            {
                icon: '🖱',
                label: 'Acessos totais',
                value: Number(view.stats.totalAccess || 0).toLocaleString('pt-BR'),
                meta: `${view.stats.topTools.length} ferramentas registradas`,
            },
        ];

        return `<div class="profile-stats-kpi-grid">
            ${cards.map((card) => `<div class="profile-stats-kpi-card">
                <div class="profile-stats-kpi-top">
                    <span class="profile-stats-kpi-icon">${card.icon}</span>
                    <span class="profile-stats-kpi-label">${card.label}</span>
                </div>
                <div class="profile-stats-kpi-value">${card.value}</div>
                <div class="profile-stats-kpi-meta">${card.meta}</div>
            </div>`).join('')}
        </div>`;
    },

    renderStatsTopToolsCard(view) {
        const tools = view.stats.topTools || [];
        const firstCount = tools[0]?.count || 1;

        return `<div class="profile-subcard">
            <div class="profile-subcard-head">
                <div class="profile-subcard-copy">
                    <div class="profile-subcard-title">Ferramentas favoritas</div>
                    <div class="profile-subcard-desc">
                        Os recursos que mais puxam a sua rotina dentro do app.
                    </div>
                </div>
            </div>

            ${tools.length > 0
                ? `<div class="profile-top-tools profile-stats-top-tools">
                    ${tools.map((tool, index) => `
                        <div class="profile-top-tool ${index === 0 ? 'profile-stats-top-tool-featured' : ''}">
                            <div class="profile-top-rank">${['🥇', '🥈', '🥉'][index] || `#${index + 1}`}</div>
                            <span class="profile-top-icon">${tool.icon || '[]'}</span>
                            <span class="profile-top-name">${tool.name}</span>
                            <span class="profile-top-count">${tool.count} acessos</span>
                            <div class="profile-top-bar-wrap">
                                <div class="profile-top-bar" style="width:${Math.round((tool.count / firstCount) * 100)}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>`
                : `<div class="profile-empty-state">Use as ferramentas para montar seu ranking pessoal.</div>`
            }
        </div>`;
    },

    renderStatsWeeklyCard(view) {
        return `<div class="profile-subcard profile-subcard-soft">
            <div class="profile-subcard-head">
                <div class="profile-subcard-copy">
                    <div class="profile-subcard-title">Pulso da semana</div>
                    <div class="profile-subcard-desc">
                        Distribuicao da sua atividade nos ultimos dias.
                    </div>
                </div>
                <div class="profile-edit-meta">
                    <span class="profile-edit-meta-pill good">${this.formatMinutesCompact(view.weeklyMinutes)}</span>
                    <span class="profile-edit-meta-pill">
                        ${view.bestDay?.minutes ? `${view.bestDay.label} em alta` : 'Sem pico ainda'}
                    </span>
                </div>
            </div>

            <div class="profile-week-grid profile-stats-week-grid">
                ${(view.stats.weekDays || []).map((day) => `
                    <div class="profile-week-day">
                        <div class="profile-week-bar-wrap">
                            <div class="profile-week-bar ${day.isToday ? 'today' : ''}"
                                style="height:${day.height}%"
                                title="${day.label}: ${day.time}"></div>
                        </div>
                        <div class="profile-week-label ${day.isToday ? 'today' : ''}">${day.short}</div>
                    </div>
                `).join('')}
            </div>
        </div>`;
    },

    renderStatsHub() {
        const view = this.getStatsViewModel();
        const economyHtml = window.Economy && window.Profile?._renderEconomyBlock
            ? this.wrapLegacyProfileCard(window.Profile._renderEconomyBlock(), 'profile-stats-economy-card')
            : '';
        const advancedHtml = this.wrapLegacyProfileCard(this.renderAdvancedStatsCard(), 'profile-stats-side-card');
        const historyHtml = this.wrapLegacyProfileCard(this.renderHistorySection(), 'profile-stats-side-card profile-stats-history-wide');
        const achievementsHtml = window.Achievements?.renderSection
            ? this.wrapLegacyProfileCard(window.Achievements.renderSection(), 'profile-stats-achievements-card')
            : '';

        return `<div class="profile-edit-hub profile-stats-hub">
            <section class="profile-edit-section profile-edit-section-primary" id="profile-stats-progress-panel">
                <div class="profile-edit-section-head">
                    <div class="profile-edit-section-copy">
                        <div class="profile-edit-eyebrow">Estatisticas</div>
                        <div class="profile-edit-heading">Progresso e ritmo</div>
                        <div class="profile-edit-desc">
                            O topo agora destaca sua progressao, consistencia e o que realmente esta puxando seu nivel de uso.
                        </div>
                    </div>
                </div>

                <div class="profile-stats-shell">
                    <div class="profile-stats-main">
                        ${economyHtml || '<div class="profile-empty-state">Economia indisponivel no momento.</div>'}
                        ${this.renderStatsMetricGrid(view)}
                    </div>
                    <div class="profile-stats-side">
                        ${this.renderStatsSummaryPanel(view)}
                    </div>
                </div>
            </section>

            <section class="profile-edit-section" id="profile-stats-activity-panel">
                <div class="profile-edit-section-head">
                    <div class="profile-edit-section-copy">
                        <div class="profile-edit-eyebrow">Analise</div>
                        <div class="profile-edit-heading">Atividade e desempenho</div>
                        <div class="profile-edit-desc">
                            Aqui fica a leitura mais detalhada do seu comportamento: ferramentas favoritas, distribuicao semanal e historico recente.
                        </div>
                    </div>
                </div>

                <div class="profile-stats-shell">
                    <div class="profile-stats-main">
                        ${this.renderStatsTopToolsCard(view)}
                        ${this.renderStatsWeeklyCard(view)}
                    </div>
                    <div class="profile-stats-side">
                        ${advancedHtml}
                    </div>
                </div>

                ${historyHtml}
            </section>

            ${achievementsHtml ? `<section class="profile-edit-section profile-edit-section-muted" id="profile-stats-achievements-panel">
                <div class="profile-edit-section-head">
                    <div class="profile-edit-section-copy">
                        <div class="profile-edit-eyebrow">Conquistas</div>
                        <div class="profile-edit-heading">Colecao de marcos</div>
                        <div class="profile-edit-desc">
                            Seus achievements ficam separados como uma galeria de progresso, sem se perder no meio dos numeros.
                        </div>
                    </div>
                </div>
                <div class="profile-stats-achievements-wrap">
                    ${achievementsHtml}
                </div>
            </section>` : ''}
        </div>`;
    },

    renderHeroBanner(options = {}) {
        const editable = options.editable !== false;
        const { dark, text, sub, muted, accent } = this.getThemeTokens();
        const banner = this.getBanner();
        const bio = this.getBio();
        const presence = window.Presence?.getState?.() || {
            status: 'online',
            label: 'Online',
            icon: 'O',
            color: '#4ade80',
        };
        const user = window.Auth?.getStoredUser?.() || {};
        const username = user.username || 'Usuario';
        const avatar = window.Utils?.loadData('nyan_profile_avatar');
        const nyanTag = window.NyanAuth?.getNyanTag?.() || null;
        const economy = window.Economy?.getState?.() || { level: 1, chips: 0 };
        const profileDoc = window.NyanAuth?.currentUser || null;
        const equippedTitle =
            window.Inventory?.getEquippedItem?.('title') ||
            window.Inventory?.getProfileTitleFromProfile?.(profileDoc) ||
            null;
        const titleBadgeStyle = window.Inventory?.getTitleBadgeStyle?.(equippedTitle) || '';
        const avatarBorderBase = dark ? '#0e0e18' : '#ffffff';
        const equippedBorder =
            window.Inventory?.getEquippedItem?.('border') ||
            window.Inventory?.getProfileBorderFromProfile?.(profileDoc) ||
            null;
        const equippedBorderCss = equippedBorder?.css || `border:3.5px solid ${avatarBorderBase};`;
        const equippedBorderExtraStyle = equippedBorder?.extraStyle || '';

        const avatarHtml = avatar
            ? `<img src="${avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="Avatar"/>`
            : (window.AvatarGenerator
                ? window.AvatarGenerator.generate(username, 76)
                : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#7c3aed,#ec4899);display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:1.8rem;">${username[0]?.toUpperCase() || 'U'}</div>`);

        const titleHtml = equippedTitle
            ? `<div class="profile-hero-title-wrap">
                <div class="profile-hero-mini-label">Titulo atual</div>
                <span class="profile-title-chip" style="${titleBadgeStyle}">
                    <span>${equippedTitle.icon || '\u{1F451}'}</span>
                    <span>${equippedTitle.name || 'Titulo'}</span>
                </span>
            </div>`
            : '';

        const quickActions = editable
            ? `<div class="profile-quick-actions">
                <button class="profile-quick-btn" onclick="Profile._openAvatarPicker()">
                    Avatar
                </button>
                <button class="profile-quick-btn" onclick="ProfileV2._openBannerModal()">
                    Banner
                </button>
                <button class="profile-quick-btn" onclick="ProfileV2.scrollToSection('profile-badges-panel')">
                    Insignias
                </button>
                <button class="profile-quick-btn" onclick="ProfileV2.scrollToSection('profile-account-panel')">
                    Conta
                </button>
            </div>`
            : '';

        return `
        <style>
            @keyframes profileHeroFloat {
                0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.55; }
                50% { transform: translateY(-6px) rotate(180deg); opacity: 0.98; }
            }
            .profile-edit-hero {
                position: relative;
                margin-bottom: 1.35rem;
                border-radius: 24px;
                overflow: hidden;
                border: 1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'};
                background: ${dark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.98)'};
                box-shadow: ${dark ? 'none' : '0 24px 50px rgba(15,23,42,0.08)'};
            }
            .profile-edit-hero-banner {
                position: relative;
                min-height: 112px;
                background: ${banner.css};
                overflow: hidden;
            }
            .profile-edit-hero-star {
                position: absolute;
                color: rgba(255,255,255,0.92);
                animation: profileHeroFloat var(--dur, 3.2s) ease-in-out infinite var(--delay, 0s);
                text-shadow: 0 0 10px rgba(255,255,255,0.3);
                user-select: none;
                pointer-events: none;
            }
            .profile-edit-hero-banner-btn {
                position: absolute;
                top: 10px;
                right: 10px;
                padding: 0.38rem 0.8rem;
                border: 1px solid rgba(255,255,255,0.18);
                border-radius: 999px;
                background: rgba(0,0,0,0.28);
                color: rgba(255,255,255,0.92);
                font-size: 0.68rem;
                font-weight: 800;
                cursor: pointer;
                backdrop-filter: blur(10px);
                transition: background 0.18s ease, transform 0.18s ease;
                font-family: 'DM Sans', sans-serif;
            }
            .profile-edit-hero-banner-btn:hover {
                background: rgba(0,0,0,0.46);
                transform: translateY(-1px);
            }
            .profile-edit-hero-body {
                position: relative;
                padding: 0 1.5rem 1.35rem;
            }
            .profile-edit-hero-main {
                display: flex;
                gap: 1rem;
                padding-top: 58px;
                align-items: flex-start;
            }
            .profile-edit-hero-avatar {
                position: absolute;
                top: -44px;
                left: 1.4rem;
                width: 82px;
                height: 82px;
                border-radius: 999px;
                overflow: visible;
                cursor: ${editable ? 'pointer' : 'default'};
                box-shadow: 0 18px 40px rgba(15,23,42,0.25);
                ${equippedBorderCss}
            }
            .profile-edit-hero-avatar > *:not(.profile-edit-hero-status) {
                border-radius: inherit;
                overflow: hidden;
                display: block;
            }
            .profile-edit-hero-status {
                position: absolute;
                right: 2px;
                bottom: 2px;
                width: 15px;
                height: 15px;
                border-radius: 50%;
                background: ${presence.color};
                border: 2px solid ${avatarBorderBase};
            }
            .profile-edit-hero-copy {
                min-width: 0;
                flex: 1;
            }
            .profile-edit-hero-top {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 0.75rem;
                margin-bottom: 0.35rem;
            }
            .profile-edit-hero-name {
                font-family: 'Syne', sans-serif;
                font-size: 1.46rem;
                font-weight: 900;
                color: ${text};
                letter-spacing: -0.03em;
                line-height: 1.02;
            }
            .profile-edit-hero-level {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 0.36rem 0.8rem;
                border-radius: 999px;
                border: 1px solid rgba(168,85,247,0.28);
                background: rgba(168,85,247,0.12);
                color: ${accent};
                font-size: 0.72rem;
                font-weight: 900;
                white-space: nowrap;
            }
            .profile-edit-hero-tag {
                margin-bottom: 0.45rem;
                font-size: 0.74rem;
                font-weight: 700;
                color: ${accent};
            }
            .profile-hero-mini-label {
                display: block;
                margin-bottom: 0.32rem;
                font-size: 0.6rem;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                font-weight: 800;
                color: ${muted};
            }
            .profile-hero-badge-group {
                margin-bottom: 0.45rem;
            }
            .profile-hero-badge-rail {
                display: flex;
                align-items: center;
                gap: 0.45rem;
                flex-wrap: wrap;
            }
            .profile-hero-title-wrap {
                margin-bottom: 0.55rem;
            }
            .profile-title-chip {
                display: inline-flex;
                align-items: center;
                gap: 0.34rem;
                padding: 0.26rem 0.7rem;
                border-radius: 999px;
                font-size: 0.68rem;
                font-weight: 800;
                line-height: 1.1;
            }
            .profile-edit-hero-meta {
                display: flex;
                flex-wrap: wrap;
                gap: 0.45rem;
                align-items: center;
                margin-bottom: ${bio ? '0.6rem' : '0.35rem'};
            }
            .profile-edit-hero-pill {
                display: inline-flex;
                align-items: center;
                gap: 0.35rem;
                padding: 0.34rem 0.7rem;
                border-radius: 999px;
                border: 1px solid ${presence.color}35;
                background: ${presence.color}14;
                color: ${presence.color};
                font-size: 0.68rem;
                font-weight: 800;
            }
            .profile-edit-hero-chip {
                display: inline-flex;
                align-items: center;
                gap: 0.3rem;
                padding: 0.34rem 0.7rem;
                border-radius: 999px;
                border: 1px solid ${dark ? 'rgba(255,255,255,0.09)' : 'rgba(15,23,42,0.09)'};
                background: ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.04)'};
                color: ${sub};
                font-size: 0.68rem;
                font-weight: 700;
            }
            .profile-edit-hero-bio {
                max-width: 540px;
                font-size: 0.8rem;
                line-height: 1.6;
                color: ${sub};
            }
            ${equippedBorderExtraStyle}
            @media (max-width: 620px) {
                .profile-edit-hero-body {
                    padding: 0 1.05rem 1.1rem;
                }
                .profile-edit-hero-avatar {
                    left: 1rem;
                }
                .profile-edit-hero-main {
                    padding-top: 60px;
                }
                .profile-edit-hero-top {
                    flex-direction: column;
                    align-items: flex-start;
                }
            }
        </style>
        <div class="profile-edit-hero">
            <div class="profile-edit-hero-banner">
                <div class="profile-edit-hero-star" style="top:16%;left:7%;font-size:1rem;--dur:3.1s;--delay:0s;">&#10022;</div>
                <div class="profile-edit-hero-star" style="top:56%;left:19%;font-size:0.7rem;--dur:2.8s;--delay:0.4s;">&#9733;</div>
                <div class="profile-edit-hero-star" style="top:24%;left:73%;font-size:0.92rem;--dur:3.4s;--delay:0.8s;">&#10022;</div>
                <div class="profile-edit-hero-star" style="top:64%;left:86%;font-size:0.62rem;--dur:2.5s;--delay:0.2s;">&#10023;</div>
                <div class="profile-edit-hero-star" style="top:18%;left:54%;font-size:0.66rem;--dur:3.3s;--delay:1s;">&#9733;</div>
                ${editable ? `<button class="profile-edit-hero-banner-btn" onclick="ProfileV2._openBannerModal()">Trocar banner</button>` : ''}
            </div>

            <div class="profile-edit-hero-body">
                <div class="profile-avatar-wrap profile-edit-hero-avatar"
                    onclick="${editable ? (avatar ? 'Profile._openLightbox()' : 'Profile._openAvatarPicker()') : ''}"
                    title="${editable ? (avatar ? 'Ver foto' : 'Adicionar foto') : ''}">
                    ${avatarHtml}
                    <div class="profile-edit-hero-status"></div>
                </div>

                <div class="profile-edit-hero-main">
                    <div class="profile-edit-hero-copy">
                        <div class="profile-edit-hero-top">
                            <div>
                                <div class="profile-edit-hero-name">${username}</div>
                        ${nyanTag ? `<div class="profile-edit-hero-tag">${nyanTag}</div>` : ''}
                            </div>
                            <div class="profile-edit-hero-level">Nv ${economy.level || 1}</div>
                        </div>

                        <div id="profile-hero-badges-region">${this.renderHeroBadgeGroup()}</div>
                        ${titleHtml}

                        <div class="profile-edit-hero-meta">
                            <span class="profile-edit-hero-pill">
                                <span style="font-size:0.85rem;">${presence.icon}</span>
                                ${presence.label}
                            </span>
                            <span class="profile-edit-hero-chip">Chips ${Number(economy.chips || 0).toLocaleString('pt-BR')}</span>
                            <span class="profile-edit-hero-chip">Hub de perfil</span>
                        </div>

                        ${bio ? `<div class="profile-edit-hero-bio">"${bio}"</div>` : ''}
                        ${quickActions}
                    </div>
                </div>
            </div>
        </div>`;
    },

    renderProfileEditorHub(username = 'Usuario') {
        return `<div class="profile-edit-hub">
            ${this.renderCustomizationHub(username)}
            ${this.renderBadgeManager()}
            ${this.renderAccountCard()}
        </div>`;
    },

    renderCustomizationHub(username = 'Usuario') {
        const banner = this.getBanner();
        const bio = this.getBio();
        const avatar = window.Utils?.loadData('nyan_profile_avatar');
        const metaPills = [
            { label: avatar ? 'Avatar ativo' : 'Sem avatar', good: !!avatar },
            { label: banner.label, good: true },
            { label: bio ? `${bio.length}/200 bio` : 'Bio vazia', good: !!bio },
        ];

        return `<section class="profile-edit-section profile-edit-section-primary" id="profile-customization-panel">
            <div class="profile-edit-section-head">
                <div class="profile-edit-section-copy">
                    <div class="profile-edit-eyebrow">Hub do perfil</div>
                    <div class="profile-edit-heading">Identidade e customizacao</div>
                    <div class="profile-edit-desc">
                        Tudo o que muda a forma como voce aparece fica reunido aqui: avatar, nome, bio e banner.
                    </div>
                </div>
                <div class="profile-edit-meta">
                    ${metaPills.map((pill) => `
                        <span class="profile-edit-meta-pill ${pill.good ? 'good' : ''}">
                            ${pill.label}
                        </span>
                    `).join('')}
                </div>
            </div>

            <div class="profile-edit-layout">
                <div class="profile-edit-main">
                    ${this.renderIdentityEditor(username)}
                </div>
                <div class="profile-edit-side">
                    ${this.renderBannerPicker()}
                </div>
            </div>

            ${this.renderProfilePreviewSummary({ wide: true })}
        </section>`;
    },

    renderIdentityEditor(username = 'Usuario') {
        const bio = this.getBio();
        const avatarPreview = window.Profile?._renderAvatarPreview?.(username)
            || (window.AvatarGenerator
                ? window.AvatarGenerator.generate(username, 96)
                : `<div class="profile-avatar-initial-lg">${username[0]?.toUpperCase() || 'U'}</div>`);

        return `<div class="profile-subcard profile-subcard-emphasis">
            <div class="profile-subcard-head">
                <div class="profile-subcard-copy">
                    <div class="profile-subcard-title">Visual principal</div>
                    <div class="profile-subcard-desc">
                        Ajuste o que aparece primeiro quando alguem abre o seu perfil.
                    </div>
                </div>
            </div>

            <div class="profile-identity-editor">
                <div class="profile-identity-stage">
                    <div class="profile-avatar-preview profile-identity-preview"
                        id="avatar-preview-wrap"
                        onclick="Profile._openAvatarPicker()"
                        title="Clique para trocar a foto">
                        ${avatarPreview}
                    </div>
                    <div class="profile-avatar-actions">
                        <p class="profile-hint">
                            Clique no avatar para trocar a imagem. Suporta JPG, PNG e GIF com ate 2MB.
                        </p>
                        <div class="profile-btn-row">
                            <button class="profile-btn profile-btn-secondary" onclick="Profile._openAvatarPicker()">
                                Escolher foto
                            </button>
                            <button class="profile-btn profile-btn-ghost" onclick="Profile._removeAvatar()">
                                Remover
                            </button>
                        </div>
                    </div>
                </div>

                <div class="profile-identity-form">
                    <div class="profile-subcard-mini">
                        <div class="profile-subcard-mini-label">Nome de exibicao</div>
                        <div class="profile-field-wrap" style="margin-bottom:0.75rem;">
                            <input type="text"
                                id="profile-username-input"
                                class="profile-input"
                                value="${username}"
                                maxlength="30"
                                placeholder="Seu nome..."
                                oninput="Profile._onUsernameInput(this)"/>
                            <div class="profile-char-count" id="username-count">${username.length}/30</div>
                        </div>
                        <button class="profile-btn profile-btn-primary" onclick="Profile._saveUsername()">
                            Salvar nome
                        </button>
                    </div>

                    <div class="profile-subcard-mini">
                        <div class="profile-subcard-mini-label">Bio</div>
                        <textarea id="profile-bio-input"
                            class="profile-edit-textarea"
                            maxlength="200"
                            placeholder="Escreva algo sobre voce... (max. 200 caracteres)"
                            rows="4"
                            oninput="document.getElementById('bio-char-count').textContent=this.value.length+'/200'">${bio}</textarea>
                        <div class="profile-textarea-meta">
                            <span>Dica: frases curtas costumam ficar mais elegantes no perfil.</span>
                            <span id="bio-char-count">${bio.length}/200</span>
                        </div>
                        <button class="profile-btn profile-btn-primary" onclick="ProfileV2.saveBio(document.getElementById('profile-bio-input').value)">
                            Salvar bio
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    },

    renderBannerPicker() {
        const current = this.getBanner();
        return `<div class="profile-subcard">
            <div class="profile-subcard-head">
                <div class="profile-subcard-copy">
                    <div class="profile-subcard-title">Banner do perfil</div>
                    <div class="profile-subcard-desc">
                        Escolha a atmosfera visual do topo do seu perfil.
                    </div>
                </div>
            </div>

            <div class="profile-banner-grid">
                ${this.BANNER_OPTIONS.map((opt) => {
                    const isActive = opt.id === current.id;
                    return `<button class="profile-banner-swatch ${isActive ? 'active' : ''}"
                        onclick="ProfileV2.saveBanner('${opt.id}')"
                        title="${opt.label}">
                        <span class="profile-banner-swatch-preview" style="background:${opt.css};"></span>
                        <span class="profile-banner-swatch-copy">
                            <span class="profile-banner-swatch-label">${opt.label}</span>
                            <span class="profile-banner-swatch-state">${isActive ? 'Ativo' : 'Aplicar'}</span>
                        </span>
                    </button>`;
                }).join('')}
            </div>
        </div>`;
    },

    renderProfilePreviewSummary(options = {}) {
        const wide = !!options.wide;
        const banner = this.getBanner();
        const bio = this.getBio();
        const showcaseBadges = window.Badges?.getShowcaseBadges?.() || [];
        const equippedBadge = window.Badges?.getEquippedBadge?.() || null;
        const equippedTitle =
            window.Inventory?.getEquippedItem?.('title') ||
            window.Inventory?.getProfileTitleFromProfile?.(window.NyanAuth?.currentUser || null) ||
            null;
        const titleBadgeStyle = window.Inventory?.getTitleBadgeStyle?.(equippedTitle) || '';

        return `<div class="profile-subcard profile-subcard-soft ${wide ? 'profile-preview-summary-wide' : ''}" id="profile-preview-summary-panel">
            <div class="profile-subcard-head">
                <div class="profile-subcard-copy">
                    <div class="profile-subcard-title">Como o perfil aparece</div>
                    <div class="profile-subcard-desc">
                        Resumo do que esta publico agora.
                    </div>
                </div>
            </div>

            <div class="profile-preview-list">
                <div class="profile-preview-item">
                    <span class="profile-preview-label">Banner</span>
                    <span class="profile-preview-value">${banner.label}</span>
                </div>
                <div class="profile-preview-item">
                    <span class="profile-preview-label">Bio</span>
                    <span class="profile-preview-value">${bio ? 'Preenchida' : 'Vazia'}</span>
                </div>
                <div class="profile-preview-item">
                    <span class="profile-preview-label">Titulo</span>
                    <span class="profile-preview-value">
                        ${equippedTitle
                            ? `<span class="profile-title-chip" style="${titleBadgeStyle}">
                                <span>${equippedTitle.icon || '\u{1F451}'}</span>
                                <span>${equippedTitle.name || 'Titulo'}</span>
                            </span>`
                            : 'Nenhum'}
                    </span>
                </div>
                <div class="profile-preview-item profile-preview-item-badges">
                    <span class="profile-preview-label">Insignias</span>
                    <span class="profile-preview-value">
                        ${showcaseBadges.length
                            ? `<span class="profile-preview-badges">
                                ${showcaseBadges.slice(0, 4).map((badge) => this.renderBadgeMedal(badge, {
                                    active: badge.id === equippedBadge?.id,
                                    size: 'sm',
                                })).join('')}
                            </span>`
                            : 'Nenhuma em exibicao'}
                    </span>
                </div>
            </div>

            <div class="profile-btn-row" style="margin-top:0.9rem;">
                <button class="profile-btn profile-btn-secondary" onclick="ProfileV2.scrollToSection('profile-badges-panel')">
                    Gerenciar insignias
                </button>
            </div>
        </div>`;
    },

    renderBadgeManager() {
        const owned = window.Badges?.getOwnedBadges?.() || [];
        const equippedId = window.Badges?.getEquippedId?.() || null;
        const showcaseIds = window.Badges?.getShowcaseIds?.() || [];
        const maxShowcase = Number(window.Badges?.MAX_SHOWCASE || 4);

        if (!owned.length) {
            return `<section class="profile-edit-section" id="profile-badges-panel">
                <div class="profile-edit-section-head">
                    <div class="profile-edit-section-copy">
                        <div class="profile-edit-eyebrow">Insignias</div>
                        <div class="profile-edit-heading">Colecao do perfil</div>
                        <div class="profile-edit-desc">
                            Quando voce desbloquear insignias por temporada, conquistas ou eventos, elas vao aparecer aqui.
                        </div>
                    </div>
                </div>
                <div class="profile-empty-state">
                    Nenhuma insignia desbloqueada ainda.
                </div>
            </section>`;
        }

        const showcaseBadges = showcaseIds
            .map((id) => owned.find((badge) => badge.id === id))
            .filter(Boolean);

        const showcaseSlots = Array.from({ length: maxShowcase }, (_, index) => {
            const badge = showcaseBadges[index];
            if (!badge) {
                return `<div class="profile-badge-slot empty">Slot livre</div>`;
            }
            return `<div class="profile-badge-slot">
                ${this.renderBadgeMedal(badge, {
                    active: badge.id === equippedId,
                    size: 'sm',
                })}
                <span>${badge.name}</span>
            </div>`;
        }).join('');

        return `<section class="profile-edit-section" id="profile-badges-panel">
            <div class="profile-edit-section-head">
                <div class="profile-edit-section-copy">
                    <div class="profile-edit-eyebrow">Insignias</div>
                    <div class="profile-edit-heading">Vitrine de recompensas</div>
                    <div class="profile-edit-desc">
                        Escolha quais insignias vao para o perfil e qual delas fica em destaque.
                    </div>
                </div>
                <div class="profile-edit-meta">
                    <span class="profile-edit-meta-pill good">${showcaseIds.length}/${maxShowcase} em exibicao</span>
                    <span class="profile-edit-meta-pill">${owned.length} desbloqueadas</span>
                </div>
            </div>

            <div class="profile-badge-overview">
                <div class="profile-badge-overview-copy">
                    <div class="profile-subcard-title">Showcase publico</div>
                    <div class="profile-subcard-desc">
                        As insignias exibidas aparecem no perfil publico. A destacada recebe o foco principal.
                    </div>
                </div>
                <div class="profile-badge-slots">${showcaseSlots}</div>
            </div>

            <div class="profile-badge-grid">
                ${owned.map((badge) => {
                    const isEquipped = badge.id === equippedId;
                    const isShown = showcaseIds.includes(badge.id);
                    const lockedByHighlight = isEquipped;
                    const limitReached = !isShown && showcaseIds.length >= maxShowcase;
                    const tone = this.getBadgeTone(badge);
                    const description = badge.description || 'Insignia desbloqueada para o seu perfil.';
                    return `<div class="profile-badge-tile"
                        style="--badge-card-border:${tone.tone.border};--badge-card-glow:${tone.glow};--badge-card-bg:${tone.focusBg};">
                        <div class="profile-badge-tile-top">
                            ${this.renderBadgeMedal(badge, { active: isEquipped, size: 'lg' })}
                            <div class="profile-badge-tile-copy">
                                <div class="profile-badge-name">${badge.name || badge.id}</div>
                                <div class="profile-badge-desc">${description}</div>
                            </div>
                            <span class="profile-badge-rarity"
                                style="color:${tone.tone.text};background:${tone.tone.bg};border-color:${tone.tone.border};">
                                ${tone.rarityMeta.label || 'Insignia'}
                            </span>
                        </div>

                        <div class="profile-badge-status-row">
                            ${isEquipped ? '<span class="profile-badge-status-chip active">Em destaque</span>' : ''}
                            ${isShown ? '<span class="profile-badge-status-chip">No perfil</span>' : ''}
                            ${!isShown && limitReached ? '<span class="profile-badge-status-chip muted">Limite atingido</span>' : ''}
                        </div>

                        <div class="profile-badge-actions">
                            <button class="profile-badge-cta ${isEquipped ? 'active' : ''}"
                                onclick="ProfileV2.equipBadge('${badge.id}')">
                                ${isEquipped ? 'Badge destacada' : 'Destacar no perfil'}
                            </button>
                            <button class="profile-badge-toggle ${isShown ? 'on' : 'off'}"
                                ${limitReached || lockedByHighlight ? 'disabled' : ''}
                                title="${lockedByHighlight ? 'A insignia em destaque precisa continuar visivel no perfil.' : ''}"
                                onclick="ProfileV2.toggleBadgeShowcase('${badge.id}')">
                                <span class="profile-badge-toggle-track">
                                    <span class="profile-badge-toggle-thumb"></span>
                                </span>
                                <span>${lockedByHighlight ? 'Fixada pelo destaque' : (isShown ? 'Exibida no perfil' : 'Exibir no perfil')}</span>
                            </button>
                        </div>
                    </div>`;
                }).join('')}
            </div>
        </section>`;
    },

    renderAccountCard() {
        return `<section class="profile-edit-section profile-edit-section-muted" id="profile-account-panel">
            <div class="profile-edit-section-head">
                <div class="profile-edit-section-copy">
                    <div class="profile-edit-eyebrow">Conta</div>
                    <div class="profile-edit-heading">Seguranca e acesso</div>
                    <div class="profile-edit-desc">
                        Esta area fica mais discreta de proposito. E importante, mas nao precisa competir com identidade e recompensas.
                    </div>
                </div>
            </div>

            <div class="profile-subcard profile-subcard-low">
                <div class="profile-subcard-head">
                    <div class="profile-subcard-copy">
                        <div class="profile-subcard-title">Trocar senha</div>
                        <div class="profile-subcard-desc">
                            Atualize sua senha sem sair da tela de perfil.
                        </div>
                    </div>
                </div>

                <div class="profile-fields" style="margin-bottom:0.4rem;">
                    <div class="profile-field-wrap" style="margin-bottom:0;">
                        <input type="password" id="profile-pass-current" class="profile-input" placeholder="Senha atual"/>
                    </div>
                    <div class="profile-field-wrap" style="margin-bottom:0;">
                        <input type="password" id="profile-pass-new" class="profile-input" placeholder="Nova senha (min. 4 caracteres)"/>
                    </div>
                    <div class="profile-field-wrap" style="margin-bottom:0;">
                        <input type="password" id="profile-pass-confirm" class="profile-input" placeholder="Confirmar nova senha"/>
                    </div>
                </div>

                <div class="profile-btn-row">
                    <button class="profile-btn profile-btn-primary" onclick="Profile._savePassword()">
                        Atualizar senha
                    </button>
                </div>
            </div>
        </section>`;
    },

    recordActivity(type, data = {}) {
        const history = window.Utils?.loadData(this.KEYS.history) || [];
        history.unshift({ type, data, at: Date.now() });
        if (history.length > 50) history.splice(50);
        window.Utils?.saveData(this.KEYS.history, history);
    },

    _getToolInfo(toolId = '') {
        const safeId = String(toolId || '').trim();
        const tool = (window.App?.tools || []).find((item) => item.id === safeId) || null;
        if (tool) return tool;
        return { id: safeId, name: safeId || 'Ferramenta', icon: '🧰' };
    },

    _normalizeHistoryEntry(entry = null) {
        const raw = entry && typeof entry === 'object' ? entry : {};
        const data = raw.data && typeof raw.data === 'object' ? raw.data : {};
        const type = String(raw.type || '').trim() || 'activity';

        if (type === 'tool_session') {
            const tool = this._getToolInfo(data.tool);
            return {
                type,
                at: Number(raw.at || Date.now()),
                icon: tool.icon || '🧰',
                label: 'Sessao de ferramenta',
                title: tool.name || 'Ferramenta usada',
                meta: data.count ? `${data.count} usos acumulados` : '',
                mergeKey: `tool_session:${tool.id || 'generic'}`,
            };
        }

        const map = {
            task_completed: { icon: 'OK', label: 'Tarefa concluida', title: data.title || data.taskTitle || 'Tarefa concluida', mergeKey: `task_completed:${String(data.taskId || data.title || '').trim()}` },
            task_created: { icon: 'TS', label: 'Tarefa criada', title: data.title || data.taskTitle || 'Nova tarefa', mergeKey: `task_created:${String(data.taskId || data.title || '').trim()}` },
            note_created: { icon: 'NT', label: 'Nota criada', title: data.title || data.noteTitle || 'Nova nota', mergeKey: `note_created:${String(data.noteId || data.title || '').trim()}` },
            note_to_task: { icon: 'TG', label: 'Nota virou tarefa', title: data.title || data.taskTitle || 'Nota convertida em tarefa', mergeKey: `note_to_task:${String(data.taskId || data.noteId || data.title || '').trim()}` },
            game_record: { icon: 'RC', label: 'Novo recorde', title: data.title || 'Novo recorde pessoal', mergeKey: `game_record:${String(data.title || '').trim()}` },
            level_up: { icon: 'LV', label: 'Level up', title: data.title || 'Novo nivel alcancado', mergeKey: `level_up:${String(data.level || data.title || '').trim()}` },
            achievement: { icon: 'AC', label: 'Conquista', title: data.title || 'Conquista desbloqueada', mergeKey: `achievement:${String(data.id || data.title || '').trim()}` },
            mission_done: { icon: 'MS', label: 'Missao concluida', title: data.title || 'Missao concluida', mergeKey: `mission_done:${String(data.id || data.title || '').trim()}` },
            game_context: { icon: '🎮', label: 'Sessao de jogo', title: data.title || data.label || 'Zona Offline', mergeKey: `game_context:${String(data.title || data.label || '').trim()}` },
        };

        const fallback = map[type] || {
            icon: 'AT',
            label: 'Atividade',
            title: data.title || data.taskTitle || data.noteTitle || type,
            mergeKey: `${type}:${String(data.title || data.taskTitle || data.noteTitle || '').trim()}`,
        };

        return {
            type,
            at: Number(raw.at || Date.now()),
            icon: fallback.icon,
            label: fallback.label,
            title: fallback.title,
            meta: fallback.meta || '',
            mergeKey: fallback.mergeKey || `${type}:default`,
        };
    },

    getHistory(limit = 10) {
        const rawHistory = window.Utils?.loadData(this.KEYS.history) || [];
        const compact = [];

        for (const rawEntry of rawHistory) {
            const entry = this._normalizeHistoryEntry(rawEntry);
            const previous = compact[compact.length - 1];
            const withinWindow = previous && Math.abs((previous.at || 0) - (entry.at || 0)) <= (6 * 60 * 60 * 1000);

            if (previous && previous.mergeKey === entry.mergeKey && withinWindow) {
                previous.repeat = (previous.repeat || 1) + 1;
                previous.at = Math.max(previous.at || 0, entry.at || 0);
                continue;
            }

            compact.push({ ...entry, repeat: 1 });
            if (compact.length >= limit) break;
        }

        return compact;
    },

    renderHistorySection() {
        const history = this.getHistory(8);
        const { text, muted, soft } = this.getThemeTokens();

        if (!history.length) {
            return `<div class="profile-card">
                <div class="profile-card-title">Historico</div>
                <div style="text-align:center;padding:1.5rem 0;opacity:0.4;font-size:0.8rem;">
                    Sua atividade aparece aqui.
                </div>
            </div>`;
        }

        const items = history.map((entry) => {
            const ago = this._timeAgo(entry.at);
            const repeatSuffix = entry.repeat > 1 ? ` &middot; ${entry.repeat}x` : '';
            const metaSuffix = entry.meta ? ` &middot; ${entry.meta}` : '';

            return `<div style="display:flex;align-items:center;gap:0.625rem;padding:0.5rem 0.625rem;border-radius:9px;background:${soft};margin-bottom:0.3rem;">
                <span style="font-size:0.82rem;flex-shrink:0;font-weight:800;opacity:0.9;">${entry.icon}</span>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:0.78rem;font-weight:600;color:${text};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                        ${entry.title ? `${entry.title.slice(0, 40)}` : entry.label}
                    </div>
                    <div style="font-size:0.65rem;color:${muted};">${entry.label}${repeatSuffix}${metaSuffix} &middot; ${ago}</div>
                </div>
            </div>`;
        }).join('');

        return `<div class="profile-card">
            <div class="profile-card-title">Historico Recente</div>
            ${items}
        </div>`;
    },

    _timeAgo(ts) {
        const diff = Date.now() - ts;
        if (diff < 60000) return 'agora';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}min atras`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atras`;
        return `${Math.floor(diff / 86400000)}d atras`;
    },

    getAdvancedStats() {
        const tasks = window.Utils?.loadData('tasks') || [];
        const notes = window.Utils?.loadData('notes') || [];
        const economy = window.Economy?.getState?.() || {};
        const topTools = window.Integrations?.getTopTools?.(3) || [];

        const completedTasks = tasks.filter((task) => task.completed).length;
        const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
        const integratedNotes = tasks.filter((task) => task._sourceNoteId).length;

        return {
            tasks: { total: tasks.length, completed: completedTasks, rate: completionRate },
            notes: { total: notes.length, integrated: integratedNotes },
            economy: { level: economy.level || 1, chips: economy.chips || 0, totalXP: economy.totalXP || 0 },
            topTools,
        };
    },

    renderAdvancedStatsCard() {
        const stats = this.getAdvancedStats();
        const { dark, muted, sub, text } = this.getThemeTokens();
        const inner = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
        const border = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';

        const topToolsHtml = stats.topTools.length > 0
            ? stats.topTools.map((toolEntry) => {
                const tool = window.App?.tools?.find((item) => item.id === toolEntry.id);
                return `<div style="display:flex;align-items:center;gap:0.5rem;font-size:0.78rem;">
                    <span>${tool?.icon || '[]'}</span>
                    <span style="color:${text};font-weight:600;">${tool?.name || toolEntry.id}</span>
                    <span style="color:${muted};margin-left:auto;">${toolEntry.count}x</span>
                </div>`;
            }).join('')
            : `<div style="font-size:0.75rem;color:${muted};">Use as ferramentas para ver aqui</div>`;

        return `<div class="profile-card">
            <div class="profile-card-title">Estatisticas Avancadas</div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem;">
                <div style="background:${inner};border:1px solid ${border};border-radius:12px;padding:0.875rem;text-align:center;">
                    <div style="font-size:0.6rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:${muted};margin-bottom:0.3rem;">Tarefas concluidas</div>
                    <div style="font-size:1.5rem;font-weight:900;font-family:'Syne',sans-serif;color:var(--theme-primary,#a855f7);">${stats.tasks.completed}</div>
                    <div style="font-size:0.65rem;color:${muted};">${stats.tasks.rate}% de conclusao</div>
                </div>
                <div style="background:${inner};border:1px solid ${border};border-radius:12px;padding:0.875rem;text-align:center;">
                    <div style="font-size:0.6rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:${muted};margin-bottom:0.3rem;">Notas criadas</div>
                    <div style="font-size:1.5rem;font-weight:900;font-family:'Syne',sans-serif;color:#3b82f6;">${stats.notes.total}</div>
                    <div style="font-size:0.65rem;color:${muted};">${stats.notes.integrated} convertidas</div>
                </div>
            </div>

            <div style="margin-bottom:1rem;">
                <div style="font-size:0.68rem;font-weight:700;color:${sub};margin-bottom:0.5rem;">
                    Ferramentas mais usadas
                </div>
                <div style="display:flex;flex-direction:column;gap:0.35rem;">
                    ${topToolsHtml}
                </div>
            </div>
        </div>`;
    },

    _openBannerModal() {
        document.getElementById('banner-picker-modal')?.remove();
        const { dark, text, sub } = this.getThemeTokens();
        const bg = dark ? '#0e0e18' : '#ffffff';
        const current = this.getBanner();

        const modal = document.createElement('div');
        modal.id = 'banner-picker-modal';
        modal.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);';

        const inner = document.createElement('div');
        inner.style.cssText = `background:${bg};border:1px solid rgba(255,255,255,0.08);border-radius:22px;padding:1.5rem;width:100%;max-width:440px;margin:0 1rem;font-family:'DM Sans',sans-serif;box-shadow:0 32px 80px rgba(0,0,0,0.6);`;

        inner.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
                <div>
                    <div style="font-size:0.62rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${sub};margin-bottom:0.2rem;">Visual do perfil</div>
                    <div style="font-family:'Syne',sans-serif;font-size:1rem;font-weight:900;color:${text};">Escolha um banner</div>
                </div>
                <button onclick="document.getElementById('banner-picker-modal').remove()"
                    style="background:none;border:none;cursor:pointer;color:${sub};font-size:1.1rem;">X</button>
            </div>

            <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0.6rem;margin-bottom:0.9rem;">
                ${this.BANNER_OPTIONS.map((opt) => `
                    <button onclick="ProfileV2.saveBanner('${opt.id}');document.getElementById('banner-picker-modal').remove();"
                        style="padding:0;border-radius:16px;border:${opt.id === current.id ? '2px solid #a855f7' : '1px solid rgba(255,255,255,0.08)'};background:${dark ? 'rgba(255,255,255,0.04)' : '#f8fafc'};overflow:hidden;cursor:pointer;">
                        <span style="display:block;height:64px;background:${opt.css};"></span>
                        <span style="display:flex;align-items:center;justify-content:space-between;padding:0.65rem 0.75rem;font-size:0.74rem;font-weight:700;color:${text};">
                            <span>${opt.label}</span>
                            <span style="font-size:0.64rem;color:${opt.id === current.id ? '#a855f7' : sub};">${opt.id === current.id ? 'Ativo' : 'Aplicar'}</span>
                        </span>
                    </button>`).join('')}
            </div>

            <p style="font-size:0.72rem;color:${sub};text-align:center;margin:0;">
                Clique para aplicar imediatamente.
            </p>`;

        modal.appendChild(inner);
        modal.addEventListener('click', (event) => {
            if (event.target === modal) modal.remove();
        });
        document.body.appendChild(modal);
    },

    init() {
        const uid = window.NyanAuth?.getUID?.();
        if (uid && window.NyanFirebase?.isReady?.()) {
            const banner = this.getBanner();
            const bio = this.getBio();
            const avatar = window.Utils?.loadData?.('nyan_profile_avatar') || null;
            window.NyanFirebase.updateDoc(`users/${uid}`, {
                banner: banner.id,
                bannerType: banner.type,
                bio,
                avatar,
            }).catch(() => {});
        }

        window.addEventListener('nyan:presence-changed', (event) => {
            const { status, label } = event.detail || {};
            if (status === 'playing') {
                this.recordActivity('game_context', { title: label });
            }
        });
    },
};

window.ProfileV2 = ProfileV2;
