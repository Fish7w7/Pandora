const Auth = {
    storageKey: 'toolbox_user',

    login(username, password) {
        const errors = this.validate(username, password);
        if (errors) return { success: false, error: errors };
        const user = {
            username: username.trim(),
            loginDate: Date.now(),
            sessionId: this.generateSessionId()
        };
        this.saveUser(user);
        return { success: true, user };
    },

    validate(username, password) {
        if (!username?.trim() || !password?.trim()) return 'Preencha todos os campos';
        if (password.length < 4) return 'Senha muito curta (mínimo 4 caracteres)';
        return null;
    },

    logout() { localStorage.removeItem(this.storageKey); },

    saveUser(user) {
        try { localStorage.setItem(this.storageKey, JSON.stringify(user)); }
        catch (e) { console.error('❌ Erro ao salvar usuário:', e); }
    },

    getStoredUser() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : null;
        } catch (e) { return null; }
    },

    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    },

    isLoggedIn() { return !!this.getStoredUser(); }
};

function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    const newForm = loginForm.cloneNode(true);
    loginForm.parentNode.replaceChild(newForm, loginForm);

    newForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username')?.value.trim();
        const password = document.getElementById('login-password')?.value.trim();
        const errorDiv = document.getElementById('login-error');
        const result = Auth.login(username, password);
        if (result.success) {
            App.user = result.user;
            App.showMainApp();
        } else {
            showLoginError(errorDiv, result.error);
        }
    });

    ['login-username', 'login-password'].forEach(id => {
        const input = document.getElementById(id);
        if (input) { input.disabled = false; input.readOnly = false; input.value = ''; }
    });
}

function showLoginError(errorDiv, message) {
    if (!errorDiv) return;
    errorDiv.classList.remove('hidden');
    const errorText = errorDiv.querySelector('p');
    if (errorText) errorText.textContent = message;
    setTimeout(() => errorDiv.classList.add('hidden'), 3000);
}

document.addEventListener('DOMContentLoaded', setupLoginForm);

window.Auth = Auth;
window.setupLoginForm = setupLoginForm;
