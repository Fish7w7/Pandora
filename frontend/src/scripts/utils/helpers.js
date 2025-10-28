// Utilitários Globais
const Utils = {
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('✅ Copiado!', 'success');
        }).catch(() => {
            this.showNotification('❌ Erro ao copiar', 'error');
        });
    },
    
    showNotification(message, type = 'info') {
        const config = {
            success: {
                bg: 'from-green-400 to-emerald-500',
                icon: '✓',
                iconBg: 'bg-white/30'
            },
            error: {
                bg: 'from-red-400 to-pink-500',
                icon: '✕',
                iconBg: 'bg-white/30'
            },
            warning: {
                bg: 'from-amber-400 to-orange-500',
                icon: '!',
                iconBg: 'bg-white/30'
            },
            info: {
                bg: 'from-blue-400 to-cyan-500',
                icon: 'i',
                iconBg: 'bg-white/30'
            }
        };
        
        const { bg, icon, iconBg } = config[type];
        
        // Criar container de notificações se não existir
        let container = document.getElementById('notifications-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notifications-container';
            container.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none';
            container.style.maxWidth = '320px';
            document.body.appendChild(container);
        }
        
        // Criar notificação
        const notification = document.createElement('div');
        notification.className = `pointer-events-auto transform transition-all duration-300`;
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        
        notification.innerHTML = `
            <div class="relative group">
                <!-- Glow effect -->
                <div class="absolute -inset-0.5 bg-gradient-to-r ${bg} rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                
                <!-- Card principal -->
                <div class="relative bg-gradient-to-r ${bg} rounded-xl shadow-xl overflow-hidden">
                    <!-- Conteúdo -->
                    <div class="flex items-center gap-3 p-3 pr-10">
                        <!-- Ícone -->
                        <div class="${iconBg} backdrop-blur-sm rounded-lg w-7 h-7 flex items-center justify-center flex-shrink-0">
                            <span class="text-white text-sm font-black">${icon}</span>
                        </div>
                        
                        <!-- Mensagem -->
                        <p class="text-white font-semibold text-sm leading-tight flex-1">
                            ${message}
                        </p>
                        
                        <!-- Botão fechar -->
                        <button onclick="this.closest('.pointer-events-auto').style.opacity='0'; this.closest('.pointer-events-auto').style.transform='translateX(100%)'; setTimeout(() => this.closest('.pointer-events-auto').remove(), 300);" 
                                class="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/20 transition-all group/btn">
                            <svg class="w-3.5 h-3.5 text-white group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Barra de progresso -->
                    <div class="h-0.5 bg-white/20 relative overflow-hidden">
                        <div class="absolute inset-0 bg-white/40 animate-progress"></div>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(notification);
        
        // Animar entrada
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        });
        
        // Auto-remover após 4 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
                
                // Remover container se vazio
                if (container.children.length === 0) {
                    container.remove();
                }
            }, 300);
        }, 4000);
    },
    
    formatDate(date) {
        return new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Erro ao salvar:', e);
            return false;
        }
    },
    
    loadData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Erro ao carregar:', e);
            return null;
        }
    },
    
    async fetchAPI(url, options = {}) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro na requisição:', error);
            throw error;
        }
    },
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    truncate(text, length = 50) {
        return text.length > length ? text.substring(0, length) + '...' : text;
    }
};

window.Utils = Utils;