// ============================================
// 🛠️ UTILITÁRIOS GLOBAIS - NyanTools にゃん~
// Versão Otimizada v2.0
// ============================================

const Utils = {
    // Configurações de notificação
    notificationConfig: {
        success: { bg: 'from-green-400 to-emerald-500', icon: '✔', iconBg: 'bg-white/30' },
        error: { bg: 'from-red-400 to-pink-500', icon: '✕', iconBg: 'bg-white/30' },
        warning: { bg: 'from-amber-400 to-orange-500', icon: '!', iconBg: 'bg-white/30' },
        info: { bg: 'from-blue-400 to-cyan-500', icon: 'i', iconBg: 'bg-white/30' }
    },
    
    // ============================================
    // CLIPBOARD
    // ============================================
    
    copyToClipboard(text) {
        navigator.clipboard.writeText(text)
            .then(() => this.showNotification('✅ Copiado!', 'success'))
            .catch(() => this.showNotification('❌ Erro ao copiar', 'error'));
    },
    
    // ============================================
    // NOTIFICAÇÕES
    // ============================================
    
    showNotification(message, type = 'info') {
        const config = this.notificationConfig[type];
        if (!config) {
            console.error('Tipo de notificação inválido:', type);
            return;
        }
        
        const container = this.getNotificationContainer();
        const notification = this.createNotification(message, config);
        
        container.appendChild(notification);
        this.animateNotificationIn(notification);
        this.scheduleNotificationRemoval(notification, container);
    },
    
    getNotificationContainer() {
        let container = document.getElementById('notifications-container');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'notifications-container';
            container.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none';
            container.style.maxWidth = '320px';
            document.body.appendChild(container);
        }
        
        return container;
    },
    
    createNotification(message, config) {
        const notification = document.createElement('div');
        notification.className = 'pointer-events-auto transform transition-all duration-300';
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        
        notification.innerHTML = this.renderNotification(message, config);
        
        return notification;
    },
    
    renderNotification(message, config) {
        return `
            <div class="relative group">
                <div class="absolute -inset-0.5 bg-gradient-to-r ${config.bg} rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                
                <div class="relative bg-gradient-to-r ${config.bg} rounded-xl shadow-xl overflow-hidden">
                    <div class="flex items-center gap-3 p-3 pr-10">
                        <div class="${config.iconBg} backdrop-blur-sm rounded-lg w-7 h-7 flex items-center justify-center flex-shrink-0">
                            <span class="text-white text-sm font-black">${config.icon}</span>
                        </div>
                        
                        <p class="text-white font-semibold text-sm leading-tight flex-1">
                            ${message}
                        </p>
                        
                        <button onclick="this.closest('.pointer-events-auto').style.opacity='0'; this.closest('.pointer-events-auto').style.transform='translateX(100%)'; setTimeout(() => this.closest('.pointer-events-auto').remove(), 300);" 
                                class="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/20 transition-all group/btn">
                            <svg class="w-3.5 h-3.5 text-white group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="h-0.5 bg-white/20 relative overflow-hidden">
                        <div class="absolute inset-0 bg-white/40 animate-progress"></div>
                    </div>
                </div>
            </div>
        `;
    },
    
    animateNotificationIn(notification) {
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        });
    },
    
    scheduleNotificationRemoval(notification, container) {
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                notification.remove();
                
                if (container.children.length === 0) {
                    container.remove();
                }
            }, 300);
        }, 4000);
    },
    
    // ============================================
    // DATA & TIME
    // ============================================
    
    formatDate(date) {
        return new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
    
    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        }
        return `${minutes}m ${seconds % 60}s`;
    },
    
    // ============================================
    // LOCAL STORAGE
    // ============================================
    
    saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Erro ao salvar:', e);
            this.showNotification('❌ Erro ao salvar dados', 'error');
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
    
    removeData(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Erro ao remover:', e);
            return false;
        }
    },
    
    clearAllData() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Erro ao limpar:', e);
            return false;
        }
    },
    
    getStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return total;
    },
    
    getStorageSizeFormatted() {
        const bytes = this.getStorageSize();
        const kb = (bytes / 1024).toFixed(2);
        
        if (kb < 1024) return `${kb} KB`;
        
        const mb = (kb / 1024).toFixed(2);
        return `${mb} MB`;
    },
    
    // ============================================
    // API & FETCH
    // ============================================
    
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
    
    async fetchWithTimeout(url, options = {}, timeout = 10000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    },
    
    // ============================================
    // STRING UTILITIES
    // ============================================
    
    truncate(text, length = 50) {
        if (!text) return '';
        return text.length > length ? text.substring(0, length) + '...' : text;
    },
    
    capitalize(text) {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },
    
    slugify(text) {
        if (!text) return '';
        return text
            .toString()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },
    
    escapeHTML(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    },
    
    // ============================================
    // ID GENERATION
    // ============================================
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    
    // ============================================
    // PERFORMANCE
    // ============================================
    
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
    
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    // ============================================
    // VALIDATION
    // ============================================
    
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },
    
    isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },
    
    isValidJSON(str) {
        try {
            JSON.parse(str);
            return true;
        } catch {
            return false;
        }
    },
    
    // ============================================
    // ARRAY UTILITIES
    // ============================================
    
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },
    
    unique(array) {
        return [...new Set(array)];
    },
    
    chunk(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    },
    
    // ============================================
    // NUMBER UTILITIES
    // ============================================
    
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    
    formatNumber(num) {
        return new Intl.NumberFormat('pt-BR').format(num);
    },
    
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    },
    
    // ============================================
    // DOM UTILITIES
    // ============================================
    
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else {
                element.setAttribute(key, value);
            }
        });
        
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });
        
        return element;
    },
    
    removeElement(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }
};

window.Utils = Utils;