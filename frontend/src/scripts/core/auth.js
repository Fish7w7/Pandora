/* ════════════════════════════════════
   AUTH.JS OPTIMIZED v2.7.0
   Sistema de Autenticação Otimizado
 ══════════════════════════════════════*/

const Auth = {
    storageKey: 'toolbox_user',
    
    // Login com validação
    login(username, password) {
        const errors = this.validate(username, password);
        if (errors) return { success: false, error: errors };
        
        // Criar e salvar usuário
        const user = {
            username: username.trim(),
            loginDate: Date.now(),
            sessionId: this.generateSessionId()
        };
        
        this.saveUser(user);
        return { success: true, user };
    },
    
    // Validação consolidada
    validate(username, password) {
        if (!username?.trim() || !password?.trim()) {
            return 'Preencha todos os campos';
        }
        if (password.length < 4) {
            return 'Senha muito curta (mínimo 4 caracteres)';
        }
        return null;
    },
    
    // Logout
    logout() {
        localStorage.removeItem(this.storageKey);
    },
    
    // Salvar/Obter usuário
    saveUser(user) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(user));
        } catch (e) {
            console.error('❌ Erro ao salvar usuário:', e);
        }
    },
    
    getStoredUser() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            console.error('❌ Erro ao obter usuário:', e);
            return null;
        }
    },
    
    // Gerar session ID otimizado
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    },
    
    // Verificar login
    isLoggedIn() {
        return !!this.getStoredUser();
    }
};

// Setup do formulário de login (otimizado)
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    
    if (!loginForm) {
        console.warn('⚠️ Formulário de login não encontrado');
        return;
    }
    
    console.log('🔧 Configurando formulário de login...');
    
    // Remover listeners antigos clonando o elemento
    const newForm = loginForm.cloneNode(true);
    loginForm.parentNode.replaceChild(newForm, loginForm);
    
    // Handler do formulário
    const handleSubmit = (e) => {
        e.preventDefault();
        
        const username = document.getElementById('login-username')?.value.trim();
        const password = document.getElementById('login-password')?.value.trim();
        const errorDiv = document.getElementById('login-error');
        
        console.log('🔐 Tentando login:', username);
        
        const result = Auth.login(username, password);
        
        if (result.success) {
            console.log('✅ Login bem-sucedido!');
            App.user = result.user;
            App.showMainApp();
        } else {
            console.log('❌ Login falhou:', result.error);
            showLoginError(errorDiv, result.error);
        }
    };
    
    // Adicionar listener
    newForm.addEventListener('submit', handleSubmit);
    
    // Habilitar inputs
    ['login-username', 'login-password'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.disabled = false;
            input.readOnly = false;
            input.value = '';
        }
    });
    
    console.log('✅ Formulário configurado!');
}

// Mostrar erro de login (otimizado)
function showLoginError(errorDiv, message) {
    if (!errorDiv) return;
    
    errorDiv.classList.remove('hidden');
    const errorText = errorDiv.querySelector('p');
    if (errorText) errorText.textContent = message;
    
    setTimeout(() => errorDiv.classList.add('hidden'), 3000);
}

// Inicialização
document.addEventListener('DOMContentLoaded', setupLoginForm);

// Exports
window.Auth = Auth;
window.setupLoginForm = setupLoginForm;