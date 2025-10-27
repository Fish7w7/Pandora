// Sistema de Autenticação - CORRIGIDO
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

// 🔧 FIX: Configurar formulário de login
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    
    if (!loginForm) {
        console.warn('⚠️ Formulário de login não encontrado');
        return;
    }
    
    console.log('🔧 Configurando formulário de login...');
    
    // Remover listeners antigos (evitar duplicação)
    const newForm = loginForm.cloneNode(true);
    loginForm.parentNode.replaceChild(newForm, loginForm);
    
    // Adicionar novo listener
    newForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();
        const errorDiv = document.getElementById('login-error');
        
        console.log('🔑 Tentando login:', username);
        
        const result = Auth.login(username, password);
        
        if (result.success) {
            console.log('✅ Login bem-sucedido!');
            App.user = result.user;
            App.showMainApp();
        } else {
            console.log('❌ Login falhou:', result.error);
            errorDiv.classList.remove('hidden');
            errorDiv.querySelector('p').textContent = result.error;
            
            // Esconder erro após 3 segundos
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
        usernameInput.value = ''; // Limpar valor
    }
    
    if (passwordInput) {
        passwordInput.disabled = false;
        passwordInput.readOnly = false;
        passwordInput.value = ''; // Limpar valor
    }
    
    console.log('✅ Formulário de login configurado com sucesso!');
}

//Chamar setup quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    setupLoginForm();
});

//Exportar função para poder chamar manualmente
window.setupLoginForm = setupLoginForm;
window.Auth = Auth;