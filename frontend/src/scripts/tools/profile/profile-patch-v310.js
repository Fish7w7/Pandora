(function patchProfile() {

    const tryPatch = () => {
        if (!window.Profile || !window.ProfileV2) {
            setTimeout(tryPatch, 500);
            return;
        }
        if (Profile.__profileHubV2Patched) return;

        Profile.__profileHubV2Patched = true;

        Profile.render = function() {
            const user = window.Auth?.getStoredUser?.() || {};
            const username = user.username || 'Usuario';
            const heroHtml = window.ProfileV2.renderHeroBanner({ editable: true });
            const tabsHtml = Profile.renderTabs();
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
                ${tabs.map((tab) => `
                    <button class="profile-tab ${Profile._tab === tab.id ? 'active' : ''}"
                        onclick="Profile._setTab('${tab.id}')">
                        ${tab.label}
                    </button>
                `).join('')}
            </div>`;
        };

        Profile._renderTabs = function() {
            return Profile.renderTabs();
        };

        Profile._renderProfileTab = function(username) {
            return window.ProfileV2.renderProfileEditorHub(username);
        };

        Profile._renderStatsTab = function() {
            return window.ProfileV2.renderStatsHub();
        };
    };

    setTimeout(tryPatch, 800);
})();
