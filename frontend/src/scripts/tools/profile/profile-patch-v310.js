(function patchProfile() {

    const tryPatch = () => {
        if (!window.Profile || !window.ProfileV2) {
            setTimeout(tryPatch, 500);
            return;
        }

        Profile.render = function() {
            const user = window.Auth?.getStoredUser?.() || {};
            const username = user.username || 'Usuario';

            const heroHtml = window.ProfileV2.renderHeroBanner();
            const tabsHtml = typeof Profile.renderTabs === 'function'
                ? Profile.renderTabs()
                : (typeof Profile._renderTabs === 'function' ? Profile._renderTabs(username) : '');
            const contentHtml = Profile._tab === 'profile'
                ? Profile._renderProfileTab(username)
                : Profile._renderStatsTab();

            return `<div class="profile-root">
                ${heroHtml}
                <input type="file" id="avatar-file-input" accept="image/*" style="display:none"
                       onchange="Profile._onAvatarFileChange(event)"/>
                ${tabsHtml}
                <div class="profile-content">${contentHtml}</div>
            </div>`;
        };

        Profile.renderTabs = function() {
            const tabs = [
                { id: 'profile', label: 'Perfil' },
                { id: 'stats', label: 'Estatisticas' },
            ];

            return `<div class="profile-tabs" style="margin-bottom:1.25rem;">
                ${tabs.map(t => `
                    <button class="profile-tab ${Profile._tab === t.id ? 'active' : ''}"
                        onclick="Profile._setTab('${t.id}')">
                        ${t.label}
                    </button>`).join('')}
            </div>`;
        };

        Profile._renderTabs = function() {
            return Profile.renderTabs();
        };

        const origProfileTab = Profile._renderProfileTab.bind(Profile);
        Profile._renderProfileTab = function(username) {
            const bio = window.ProfileV2.getBio();
            const d = document.body.classList.contains('dark-theme');
            const sub = d ? 'rgba(255,255,255,0.4)' : '#6b7280';
            const inputBg = d ? 'rgba(255,255,255,0.06)' : '#f4f4f9';
            const bdr = d ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
            const text = d ? '#f1f5f9' : '#0f172a';

            const bioCard = `
            <div class="profile-card">
                <div class="profile-card-title">Bio</div>
                <div style="margin-bottom:0.875rem;">
                    <textarea id="profile-bio-input"
                        maxlength="200"
                        placeholder="Escreva algo sobre voce... (max. 200 caracteres)"
                        style="width:100%;padding:0.7rem 0.9rem;background:${inputBg};
                            border:1.5px solid ${bdr};border-radius:11px;
                            color:${text};font-size:0.875rem;font-family:'DM Sans',sans-serif;
                            outline:none;resize:none;box-sizing:border-box;line-height:1.5;
                            transition:border-color 0.18s;"
                        rows="3"
                        onfocus="this.style.borderColor='rgba(168,85,247,0.5)'"
                        onblur="this.style.borderColor='${bdr}'"
                        oninput="document.getElementById('bio-char-count').textContent=this.value.length+'/200'"
                        >${bio}</textarea>
                    <div style="font-size:0.63rem;color:${sub};text-align:right;margin-top:0.25rem;"
                        id="bio-char-count">${bio.length}/200</div>
                </div>
                <button class="profile-btn profile-btn-primary"
                    onclick="ProfileV2.saveBio(document.getElementById('profile-bio-input').value)">
                    Salvar bio
                </button>
            </div>`;

            const bannerCard = window.ProfileV2.renderBannerPicker();

            return `<div class="profile-sections">
                ${bioCard}
                ${bannerCard}
                ${origProfileTab(username)}
            </div>`;
        };

        const origStatsTab = Profile._renderStatsTab.bind(Profile);
        Profile._renderStatsTab = function() {
            const original = origStatsTab();
            const advancedStats = window.ProfileV2.renderAdvancedStatsCard();
            const history = window.ProfileV2.renderHistorySection();
            return original + advancedStats + history;
        };

    };

    setTimeout(tryPatch, 800);
})();
