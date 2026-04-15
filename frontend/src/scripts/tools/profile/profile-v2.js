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

    getBanner() {
        const id = window.Utils?.loadData(this.KEYS.banner) || 'gradient_purple';
        const opt = this.BANNER_OPTIONS.find(o => o.id === id);
        return opt || this.BANNER_OPTIONS[0];
    },

    getBannerById(id) {
        return this.BANNER_OPTIONS.find(o => o.id === id) || this.BANNER_OPTIONS[0];
    },

    getBannerFromProfile(profile) {
        const id = profile?.banner || profile?.bannerId || 'gradient_purple';
        return this.getBannerById(id);
    },

    saveBanner(bannerId) {
        const opt = this.BANNER_OPTIONS.find(o => o.id === bannerId);
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

    renderBannerPicker() {
        const current = this.getBanner();

        return `
        <div class="profile-card" style="padding-bottom:0.875rem;">
            <div class="profile-card-title">Banner do Perfil</div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0.5rem;margin-bottom:0.75rem;">
                ${this.BANNER_OPTIONS.map(opt => {
                    const isActive = opt.id === current.id;
                    return `<button
                        onclick="ProfileV2.saveBanner('${opt.id}')"
                        title="${opt.label}"
                        style="height:36px;border-radius:9px;border:2px solid ${isActive ? '#a855f7' : 'transparent'};
                            background:${opt.css};cursor:pointer;
                            box-shadow:${isActive ? '0 0 0 3px rgba(168,85,247,0.25)' : 'none'};
                            transition:all 0.15s;transform:${isActive ? 'scale(1.06)' : 'scale(1)'};"
                        onmouseover="this.style.transform='scale(1.08)'"
                        onmouseout="this.style.transform='${isActive ? 'scale(1.06)' : 'scale(1)'}'">
                    </button>`;
                }).join('')}
            </div>
            <div style="font-size:0.7rem;opacity:0.5;text-align:center;">
                Banner atual: <strong>${current.label}</strong>
            </div>
        </div>`;
    },

    getBio() {
        return window.Utils?.loadData(this.KEYS.bio) || '';
    },

    saveBio(text) {
        const trimmed = (text || '').trim();
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
    },

    recordActivity(type, data = {}) {
        const history = window.Utils?.loadData(this.KEYS.history) || [];
        history.unshift({ type, data, at: Date.now() });
        if (history.length > 50) history.splice(50);
        window.Utils?.saveData(this.KEYS.history, history);
    },

    getHistory(limit = 10) {
        return (window.Utils?.loadData(this.KEYS.history) || []).slice(0, limit);
    },

    renderHistorySection() {
        const history = this.getHistory(8);
        const d = document.body.classList.contains('dark-theme');
        const text = d ? '#f1f5f9' : '#0f172a';
        const muted = d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';
        const bg = d ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)';

        if (history.length === 0) {
            return `<div class="profile-card">
                <div class="profile-card-title">Historico</div>
                <div style="text-align:center;padding:1.5rem 0;opacity:0.4;font-size:0.8rem;">
                    Sua atividade aparece aqui.
                </div>
            </div>`;
        }

        const TYPE_META = {
            task_completed: { icon: 'OK', label: 'Tarefa concluida' },
            note_created: { icon: 'NT', label: 'Nota criada' },
            note_to_task: { icon: 'TG', label: 'Nota para tarefa' },
            game_record: { icon: 'RC', label: 'Novo recorde' },
            level_up: { icon: 'LV', label: 'Level up' },
            achievement: { icon: 'AC', label: 'Conquista' },
            mission_done: { icon: 'MS', label: 'Missao concluida' },
        };

        const items = history.map(h => {
            const meta = TYPE_META[h.type] || { icon: 'AT', label: h.type };
            const ago = this._timeAgo(h.at);
            const detail = h.data?.title || h.data?.taskTitle || h.data?.noteTitle || '';

            return `<div style="display:flex;align-items:center;gap:0.625rem;
                padding:0.5rem 0.625rem;border-radius:9px;background:${bg};
                margin-bottom:0.3rem;">
                <span style="font-size:0.7rem;flex-shrink:0;font-weight:800;opacity:0.75;">${meta.icon}</span>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:0.78rem;font-weight:600;color:${text};
                        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                        ${detail ? `"${detail.slice(0, 32)}"` : meta.label}
                    </div>
                    <div style="font-size:0.65rem;color:${muted};">${meta.label} · ${ago}</div>
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

        const completedTasks = tasks.filter(t => t.completed).length;
        const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
        const integratedNotes = tasks.filter(t => t._sourceNoteId).length;

        return {
            tasks: { total: tasks.length, completed: completedTasks, rate: completionRate },
            notes: { total: notes.length, integrated: integratedNotes },
            economy: { level: economy.level || 1, chips: economy.chips || 0, totalXP: economy.totalXP || 0 },
            topTools,
        };
    },

    renderAdvancedStatsCard() {
        const stats = this.getAdvancedStats();
        const d = document.body.classList.contains('dark-theme');
        const muted = d ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.32)';
        const sub = d ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
        const text = d ? '#f1f5f9' : '#0f172a';
        const inner = d ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
        const bdr = d ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';

        const topToolsHtml = stats.topTools.length > 0
            ? stats.topTools.map(t => {
                const tool = window.App?.tools?.find(x => x.id === t.id);
                return `<div style="display:flex;align-items:center;gap:0.5rem;font-size:0.78rem;">
                    <span>${tool?.icon || '[]'}</span>
                    <span style="color:${text};font-weight:600;">${tool?.name || t.id}</span>
                    <span style="color:${muted};margin-left:auto;">${t.count}x</span>
                </div>`;
            }).join('')
            : `<div style="font-size:0.75rem;color:${muted};">Use as ferramentas para ver aqui</div>`;

        return `<div class="profile-card">
            <div class="profile-card-title">Estatisticas Avancadas</div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem;">
                <div style="background:${inner};border:1px solid ${bdr};border-radius:12px;padding:0.875rem;text-align:center;">
                    <div style="font-size:0.6rem;font-weight:800;text-transform:uppercase;
                        letter-spacing:0.08em;color:${muted};margin-bottom:0.3rem;">Tarefas concluidas</div>
                    <div style="font-size:1.5rem;font-weight:900;font-family:'Syne',sans-serif;
                        color:var(--theme-primary,#a855f7);">${stats.tasks.completed}</div>
                    <div style="font-size:0.65rem;color:${muted};">${stats.tasks.rate}% de conclusao</div>
                </div>
                <div style="background:${inner};border:1px solid ${bdr};border-radius:12px;padding:0.875rem;text-align:center;">
                    <div style="font-size:0.6rem;font-weight:800;text-transform:uppercase;
                        letter-spacing:0.08em;color:${muted};margin-bottom:0.3rem;">Notas criadas</div>
                    <div style="font-size:1.5rem;font-weight:900;font-family:'Syne',sans-serif;
                        color:#3b82f6;">${stats.notes.total}</div>
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

    renderHeroBanner(options = {}) {
        const editable = options.editable !== false;
        const banner = this.getBanner();
        const bio = this.getBio();
        const presence = window.Presence?.getState?.() || { status: 'online', label: 'Online', icon: 'O', color: '#4ade80' };
        const username = window.Auth?.getStoredUser?.()?.username || 'Usuario';
        const avatar = window.Utils?.loadData('nyan_profile_avatar');
        const nyanTag = window.NyanAuth?.getNyanTag?.() || null;
        const economy = window.Economy?.getState?.() || { level: 1 };
        const profileDoc = window.NyanAuth?.currentUser || null;
        const equippedTitle = window.Inventory?.getProfileTitleFromProfile?.(profileDoc) || null;
        const titleBadgeStyle = window.Inventory?.getTitleBadgeStyle?.(equippedTitle) || '';
        const d = document.body.classList.contains('dark-theme');
        const avBdr = d ? '#0e0e18' : '#fff';
        const equippedBorder =
            window.Inventory?.getProfileBorderFromProfile?.(profileDoc) ||
            window.Inventory?.getEquippedItem?.('border') ||
            null;
        const equippedBorderCss = equippedBorder?.css || `border:3.5px solid ${avBdr};`;
        const equippedBorderExtraStyle = equippedBorder?.extraStyle || '';

        const avatarHtml = avatar
            ? `<img src="${avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"/>`
            : (window.AvatarGenerator
                ? window.AvatarGenerator.generate(username, 76)
                : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#7c3aed,#ec4899);display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:1.8rem;">${username[0]?.toUpperCase()}</div>`);

        return `
        <style>
            @keyframes profileBannerStarFloat {
                0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.55; }
                50% { transform: translateY(-6px) rotate(180deg); opacity: 0.95; }
            }
            .profile-banner-star {
                position: absolute;
                color: rgba(255,255,255,0.92);
                pointer-events: none;
                user-select: none;
                animation: profileBannerStarFloat var(--dur, 3s) ease-in-out infinite var(--delay, 0s);
                text-shadow: 0 0 8px rgba(255,255,255,0.35);
            }
            ${equippedBorderExtraStyle}
        </style>
        <div style="position:relative;margin-bottom:1.25rem;border-radius:20px;overflow:hidden;
            border:1px solid ${d ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'};">

            <div style="height:100px;background:${banner.css};position:relative;">
                <div class="profile-banner-star" style="top:16%;left:7%;font-size:1rem;--dur:3.2s;--delay:0s;">&#10022;</div>
                <div class="profile-banner-star" style="top:54%;left:20%;font-size:0.7rem;--dur:2.8s;--delay:0.4s;">&#9733;</div>
                <div class="profile-banner-star" style="top:24%;left:73%;font-size:1rem;--dur:3.6s;--delay:0.8s;">&#10022;</div>
                <div class="profile-banner-star" style="top:66%;left:86%;font-size:0.6rem;--dur:2.5s;--delay:0.2s;">&#10023;</div>
                <div class="profile-banner-star" style="top:42%;left:49%;font-size:0.6rem;--dur:4s;--delay:1.2s;">&#10023;</div>
                <div class="profile-banner-star" style="top:14%;left:56%;font-size:0.65rem;--dur:3s;--delay:0.6s;">&#9733;</div>
                <button onclick="ProfileV2._openBannerModal()"
                    style="position:absolute;top:8px;right:8px;padding:4px 10px;border-radius:8px;
                        background:rgba(0,0,0,0.35);border:none;color:rgba(255,255,255,0.8);
                        font-size:0.65rem;font-weight:700;cursor:pointer;backdrop-filter:blur(4px);
                        font-family:'DM Sans',sans-serif;transition:background 0.15s;"
                    onmouseover="this.style.background='rgba(0,0,0,0.55)'"
                    onmouseout="this.style.background='rgba(0,0,0,0.35)'">
                    Trocar
                </button>
            </div>

            <div style="background:${d ? 'rgba(255,255,255,0.04)' : '#ffffff'};padding:0 1.5rem 1.25rem;position:relative;">
                <div style="position:absolute;top:-46px;left:1.25rem;width:76px;height:76px;
                    border-radius:50%;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.2);
                    ${equippedBorderCss};cursor:${editable ? 'pointer' : 'default'};"
                    onclick="${editable ? (avatar ? 'Profile._openLightbox()' : 'Profile._openAvatarPicker()') : ''}"
                    title="${editable ? (avatar ? 'Ver foto' : 'Adicionar foto') : ''}">
                    ${avatarHtml}
                    <div style="position:absolute;bottom:3px;right:3px;width:14px;height:14px;
                        border-radius:50%;background:${presence.color};border:2.5px solid ${avBdr};"></div>
                </div>

                <div style="position:absolute;top:12px;right:1.25rem;display:flex;align-items:center;gap:0.375rem;">
                    <div style="background:rgba(168,85,247,0.15);border:1px solid rgba(168,85,247,0.3);
                        border-radius:99px;padding:3px 10px;font-size:0.68rem;font-weight:800;
                        color:${d ? '#c084fc' : '#7c3aed'};">
                        Nv ${economy.level}
                    </div>
                </div>

                <div style="padding-top:54px;">
                    <div style="font-family:'Syne',sans-serif;font-size:1.3rem;font-weight:900;
                        color:${d ? '#f1f5f9' : '#0f172a'};margin-bottom:0.2rem;letter-spacing:-0.02em;">
                        ${username}
                    </div>

                    ${equippedTitle ? `<div style="display:inline-flex;align-items:center;gap:0.38rem;
                        padding:0.24rem 0.62rem;border-radius:999px;margin-bottom:0.4rem;
                        font-size:0.7rem;font-weight:800;
                        color:${d ? 'rgba(255,255,255,0.9)' : '#4c1d95'};
                        background:${d ? 'rgba(168,85,247,0.18)' : 'rgba(168,85,247,0.12)'};
                        border:1px solid ${d ? 'rgba(168,85,247,0.35)' : 'rgba(168,85,247,0.28)'};
                        ${titleBadgeStyle}">
                        <span>${equippedTitle.icon || '🏅'}</span>
                        <span>${equippedTitle.name || 'Título'}</span>
                    </div>` : ''}

                    ${nyanTag ? `<div style="font-size:0.72rem;color:${d ? 'rgba(168,85,247,0.9)' : '#7c3aed'};
                        font-weight:700;margin-bottom:0.35rem;">${nyanTag}</div>` : ''}

                    <div style="display:inline-flex;align-items:center;gap:0.35rem;
                        padding:2px 8px;border-radius:99px;
                        background:${presence.color}15;border:1px solid ${presence.color}30;
                        font-size:0.65rem;font-weight:700;color:${presence.color};
                        margin-bottom:${bio ? '0.6rem' : '0'};">
                        <span style="font-size:0.8rem;">${presence.icon}</span>
                        ${presence.label}
                    </div>

                    ${bio ? `<div style="font-size:0.78rem;color:${d ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)'};
                        font-style:italic;margin-top:0.5rem;line-height:1.5;">"${bio}"</div>` : ''}
                </div>
            </div>
        </div>`;
    },

    _openBannerModal() {
        document.getElementById('banner-picker-modal')?.remove();
        const d = document.body.classList.contains('dark-theme');
        const bg = d ? '#0e0e18' : '#ffffff';
        const text = d ? '#f1f5f9' : '#0f172a';
        const sub = d ? 'rgba(255,255,255,0.4)' : '#6b7280';
        const current = this.getBanner();

        const modal = document.createElement('div');
        modal.id = 'banner-picker-modal';
        modal.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);';

        const inner = document.createElement('div');
        inner.style.cssText = `background:${bg};border:1px solid rgba(255,255,255,0.08);
            border-radius:20px;padding:1.75rem;width:100%;max-width:380px;margin:0 1rem;
            font-family:'DM Sans',sans-serif;box-shadow:0 32px 80px rgba(0,0,0,0.6);`;

        inner.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem;">
                <div style="font-family:'Syne',sans-serif;font-size:1rem;font-weight:900;color:${text};">
                    Escolha um banner
                </div>
                <button onclick="document.getElementById('banner-picker-modal').remove()"
                    style="background:none;border:none;cursor:pointer;color:${sub};font-size:1.1rem;">X</button>
            </div>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.5rem;margin-bottom:1rem;">
                ${this.BANNER_OPTIONS.map(opt => `
                    <button onclick="ProfileV2.saveBanner('${opt.id}');document.getElementById('banner-picker-modal').remove();"
                        style="height:56px;border-radius:12px;border:2.5px solid ${opt.id === current.id ? '#a855f7' : 'transparent'};
                            background:${opt.css};cursor:pointer;position:relative;
                            box-shadow:${opt.id === current.id ? '0 0 0 3px rgba(168,85,247,0.25)' : 'none'};
                            transition:all 0.15s;"
                        title="${opt.label}">
                        ${opt.id === current.id ? '<span style="position:absolute;bottom:4px;right:6px;font-size:0.6rem;background:rgba(0,0,0,0.5);color:white;padding:1px 5px;border-radius:99px;">OK</span>' : ''}
                    </button>`
                ).join('')}
            </div>
            <p style="font-size:0.72rem;color:${sub};text-align:center;">
                Clique para aplicar imediatamente.
            </p>`;

        modal.appendChild(inner);
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
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

        window.addEventListener('nyan:presence-changed', (e) => {
            const { status, label } = e.detail || {};
            if (status === 'playing') {
                this.recordActivity('game_context', { title: label });
            }
        });

    },
};

window.ProfileV2 = ProfileV2;
