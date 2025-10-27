// Sistema de AutenticaÃ§Ã£o - CORRIGIDO
const Auth = {
    storageKey: 'toolbox_user',
    
    // Fazer login
    login(username, password) {
        // Validaçoes
        if (!username || !password) {
            return { success: false, error: 'Preencha todos os campos' };
        }
        
        if (password.length < 4) {
            return { success: false, error: 'Senha muito curta (mÃ­nimo 4 caracteres)' };
        }
        
        // Criar objeto de usuÃ¡rio
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
    
    // Salvar usuÃ¡rio
    saveUser(user) {
        localStorage.setItem(this.storageKey, JSON.stringify(user));
    },
    
    // Obter usuÃ¡rio salvo
    getStoredUser() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : null;
    },
    
    // Gerar ID de sessÃ£o
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    // Verificar se estÃ¡ logado
    isLoggedIn() {
        return this.getStoredUser() !== null;
    }
};

// Reinicializar formulario corretamente
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    
    if (!loginForm) {
        console.warn('âš ï¸ FormulÃ¡rio de login nÃ£o encontrado');
        return;
    }
    
    // Remover listeners antigos (evitar duplicaÃ§Ã£o)
    const newForm = loginForm.cloneNode(true);
    loginForm.parentNode.replaceChild(newForm, loginForm);
    
    // Adicionar novo listener
    newForm.addEventListener('submit', (e) => {
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
            
            // Esconder erro apÃ³s 3 segundos
            setTimeout(() => {
                errorDiv.classList.add('hidden');
            }, 3000);
        }
    });
    
    // Garantir que inputs estejam habilitados
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');
    
    if (usernameInput) {
        usernameInput.disabled = false;
        usernameInput.readOnly = false;
    }
    
    if (passwordInput) {
        passwordInput.disabled = false;
        passwordInput.readOnly = false;
    }
    
    console.log('âœ… FormulÃ¡rio de login configurado');
};

window.Auth = Auth;