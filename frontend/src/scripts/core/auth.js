// Sistema de Autenticação
const Auth = {
    storageKey: 'toolbox_user',
    
    // Fazer login
    login(username, password) {
        // Validações
        if (!username || !password) {
            return { success: false, error: 'Preencha todos os campos' };
        }
        
        if (password.length < 4) {
            return { success: false, error: 'Senha muito curta (mínimo 4 caracteres)' };
        }
        
        // Criar objeto de usuário
        const user = {
            username: username,
            loginDate: new Date().toISOString(),
            sessionId: this.generateSessionId()
        };
        
        // Salvar no localStorage
        this.saveUser(user);
        
        return { success: true, user };
    },
    
    // Logout
    logout() {
        localStorage.removeItem(this.storageKey);
    },
    
    // Salvar usuário
    saveUser(user) {
        localStorage.setItem(this.storageKey, JSON.stringify(user));
    },
    
    // Obter usuário salvo
    getStoredUser() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : null;
    },
    
    // Gerar ID de sessão
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    // Verificar se está logado
    isLoggedIn() {
        return this.getStoredUser() !== null;
    }
};

// Setup do formulário de login
document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    
    const result = Auth.login(username, password);
    
    if (result.success) {
        App.user = result.user;
        App.showMainApp();
    } else {
        errorDiv.classList.remove('hidden');
        errorDiv.querySelector('p').textContent = result.error;
        
        // Esconder erro após 3 segundos
        setTimeout(() => {
            errorDiv.classList.add('hidden');
        }, 3000);
    }
});

window.Auth = Auth;