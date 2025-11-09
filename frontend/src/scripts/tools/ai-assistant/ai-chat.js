// Assistente IA - Otimizado v2.0
const AIAssistant = {
    apiKey: 'AIzaSyDMPanwXCIGlXXKdLdMNXDpHNFFLjePbe0',
    conversation: [],
    
    // Configurações do modelo
    config: {
        model: 'gemini-2.5-flash-preview-09-2025',
        apiVersion: 'v1beta',
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
    },
    
    render() {
        return `
            <div class="max-w-5xl mx-auto h-full flex flex-col">
                <div class="text-center mb-6">
                    <h1 class="text-5xl font-black text-gray-800 mb-3">🤖 Assistente IA</h1>
                    <p class="text-gray-600 text-lg">Converse com inteligência artificial</p>
                </div>
                
                <div class="flex-1 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                    <!-- Chat Container -->
                    <div id="chat-container" class="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50 to-blue-50" style="max-height: 500px;">
                        ${this.renderConversation()}
                    </div>
                    
                    <!-- Input Area -->
                    <div class="border-t-2 border-gray-200 p-6 bg-white">
                        <div class="flex gap-3 mb-4">
                            <input type="text" id="chat-input" 
                                class="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none transition-all text-lg" 
                                placeholder="Digite sua mensagem..."
                                onkeypress="if(event.key === 'Enter') AIAssistant.sendMessage()">
                            <button onclick="AIAssistant.sendMessage()" 
                                    class="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                                <span class="text-2xl">📤</span>
                                <span>Enviar</span>
                            </button>
                        </div>
                        
                        <!-- Quick Actions -->
                        <div class="flex flex-wrap gap-2">
                            ${this.renderQuickActions()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderQuickActions() {
        const actions = [
            { emoji: '😄', text: 'Me conte uma piada', color: 'yellow' },
            { emoji: '💡', text: 'Me dê uma dica útil', color: 'blue' },
            { emoji: '🧠', text: 'Me ensine algo novo', color: 'purple' },
            { emoji: '🗑️', text: 'Limpar', color: 'red', action: 'clearChat' }
        ];
        
        return actions.map(({ emoji, text, color, action }) => {
            const onClick = action === 'clearChat' 
                ? 'AIAssistant.clearChat()' 
                : `AIAssistant.quickQuestion('${text}')`;
            
            return `
                <button onclick="${onClick}" 
                        class="px-4 py-2 bg-${color}-100 hover:bg-${color}-200 text-${color}-800 rounded-lg font-semibold text-sm transition-all transform hover:scale-105">
                    ${emoji} ${text}
                </button>
            `;
        }).join('');
    },
    
    init() {
        console.log('✅ API Key Gemini configurada');
        this.loadConversation();
    },
    
    loadConversation() {
        const saved = Utils.loadData('ai_conversation');
        if (saved) {
            this.conversation = saved;
            this.renderConversation();
        }
    },
    
    async sendMessage() {
        if (!this.validateApiKey()) return;
        
        const input = document.getElementById('chat-input');
        const message = input?.value.trim();
        
        if (!message) return;
        
        this.addMessage('user', message);
        input.value = '';
        
        this.addMessage('assistant', '...', true);
        
        try {
            const response = await this.getAIResponse(message);
            this.updateLastMessage(response);
        } catch (error) {
            console.error('Erro na API:', error);
            this.updateLastMessage(`❌ Erro: ${error.message}`);
            Utils.showNotification(`❌ ${error.message}`, 'error');
        }
        
        this.saveConversation();
    },
    
    validateApiKey() {
        if (!this.apiKey || this.apiKey === 'SUA_CHAVE_GEMINI_AQUI') {
            Utils.showNotification('⚠️ Configure sua API Key no código primeiro!', 'warning');
            return false;
        }
        return true;
    },
    
    async getAIResponse(message) {
        const url = `https://generativelanguage.googleapis.com/${this.config.apiVersion}/models/${this.config.model}:generateContent?key=${this.apiKey}`;
        
        const body = {
            contents: [{ parts: [{ text: message }] }],
            safetySettings: this.config.safetySettings
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(this.parseError(errorData));
        }

        const data = await response.json();
        return this.extractResponse(data);
    },
    
    parseError(errorData) {
        const message = errorData.error?.message;
        
        if (!message) return 'Erro desconhecido';
        if (message.includes('API_KEY_INVALID')) return 'API Key inválida';
        if (message.includes('quota')) return 'Cota excedida. Tente mais tarde';
        if (message.includes('not found') || message.includes('not supported')) {
            return `Erro no modelo: ${message}`;
        }
        
        return message;
    },
    
    extractResponse(data) {
        if (!data.candidates?.length) {
            if (data.promptFeedback?.blockReason) {
                return `⚠️ Resposta bloqueada: ${data.promptFeedback.blockReason}`;
            }
            return '⚠️ A IA não forneceu resposta';
        }

        const text = data.candidates[0]?.content?.parts[0]?.text;
        return text || '⚠️ Resposta em formato inesperado';
    },
    
    addMessage(role, content, isLoading = false) {
        this.conversation.push({ 
            role, 
            content, 
            isLoading, 
            timestamp: Date.now() 
        });
        this.renderConversation();
    },
    
    updateLastMessage(content) {
        const lastMsg = this.conversation[this.conversation.length - 1];
        if (lastMsg) {
            lastMsg.content = content;
            lastMsg.isLoading = false;
            this.renderConversation();
        }
    },
    
    renderConversation() {
        const container = document.getElementById('chat-container');
        if (!container) return;
        
        if (this.conversation.length === 0) {
            container.innerHTML = this.renderEmptyState();
            return;
        }
        
        container.innerHTML = this.conversation.map(msg => this.renderMessage(msg)).join('');
        container.scrollTop = container.scrollHeight;
    },
    
    renderEmptyState() {
        return `
            <div class="text-center py-16 text-gray-400">
                <div class="text-8xl mb-4 animate-bounce-slow">🤖</div>
                <h3 class="text-2xl font-bold text-gray-700 mb-2">Olá! Como posso ajudar?</h3>
                <p class="text-gray-500">Faça uma pergunta para começar!</p>
            </div>
        `;
    },
    
    renderMessage(msg) {
        const isUser = msg.role === 'user';
        const gradient = isUser 
            ? 'from-blue-500 to-cyan-600' 
            : 'from-purple-500 to-pink-600';
        
        return `
            <div class="mb-4 flex ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn">
                <div class="max-w-2xl ${isUser ? 'order-2' : 'order-1'}">
                    <div class="flex items-center gap-2 mb-2 ${isUser ? 'justify-end' : 'justify-start'}">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold">
                            ${isUser ? '👤' : '🤖'}
                        </div>
                        <span class="font-bold text-gray-700">${isUser ? 'Você' : 'IA'}</span>
                    </div>
                    <div class="px-6 py-4 rounded-2xl shadow-lg ${isUser ? `bg-gradient-to-br ${gradient} text-white` : 'bg-white text-gray-800 border-2 border-gray-200'}">
                        ${msg.isLoading ? '<span class="animate-pulse">⏳ Pensando...</span>' : this.formatMessage(msg.content)}
                    </div>
                </div>
            </div>
        `;
    },
    
    formatMessage(content) {
        return content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            // Code blocks
            .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => `
                <pre class="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto mt-2 mb-2">
                    <code class="language-${lang || ''}" style="white-space: pre-wrap;">${code.trim()}</code>
                </pre>`)
            // Inline markdown
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code class="px-2 py-1 bg-gray-200 text-gray-800 rounded text-sm">$1</code>')
            .replace(/\n/g, '<br>');
    },
    
    quickQuestion(question) {
        document.getElementById('chat-input').value = question;
        this.sendMessage();
    },
    
    clearChat() {
        this.conversation = [];
        this.saveConversation();
        this.renderConversation();
        Utils.showNotification('🗑️ Conversa limpa!', 'success');
    },
    
    saveConversation() {
        Utils.saveData('ai_conversation', this.conversation);
    }
};

window.AIAssistant = AIAssistant;