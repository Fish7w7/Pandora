// Assistente IA ESTILIZADO - CORRIGIDO
const AIAssistant = {
    apiKey: '', // Deixe vazio - usuário vai configurar
    conversation: [],
    
    render() {
        return `
            <div class="max-w-5xl mx-auto h-full flex flex-col">
                <div class="text-center mb-6">
                    <h1 class="text-5xl font-black text-gray-800 mb-3"> Assistente IA</h1>
                    <p class="text-gray-600 text-lg">Converse com inteligência artificial</p>
                </div>
                
                <!-- API Key Configuration -->
                <div class="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-2xl mb-6">
                    <div class="flex items-start gap-4">
                        <div class="text-4xl">🔑</div>
                        <div class="flex-1">
                            <h3 class="text-xl font-black mb-2">Configure sua API Key</h3>
                            <p class="text-purple-100 text-sm mb-3">
                                Cole sua chave do Google Gemini aqui (gratuita):
                            </p>
                            <div class="flex gap-2">
                                <input type="password" id="api-key-input" 
                                    value="${this.apiKey}"
                                    class="flex-1 px-4 py-2 rounded-lg text-gray-800 font-mono text-sm"
                                    placeholder="Cole sua API Key aqui...">
                                <button onclick="AIAssistant.saveApiKey()" 
                                    class="px-6 py-2 bg-white text-purple-600 rounded-lg font-bold hover:shadow-xl transition-all">
                                    💾 Salvar
                                </button>
                            </div>
                            <a href="https://makersuite.google.com/app/apikey" target="_blank" 
                               class="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-bold text-sm transition-all">
                                <span>🌐</span>
                                <span>Obter API Key Grátis</span>
                            </a>
                        </div>
                    </div>
                </div>
                
                <div class="flex-1 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                    <!-- Chat Container -->
                    <div id="chat-container" class="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50 to-blue-50" style="max-height: 500px;">
                        <div class="text-center py-16 text-gray-400">
                            <div class="text-8xl mb-4 animate-bounce-slow">🤖</div>
                            <h3 class="text-2xl font-bold text-gray-700 mb-2">Olá! Como posso ajudar?</h3>
                            <p class="text-gray-500">Configure sua API Key acima e faça uma pergunta!</p>
                        </div>
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
                            <button onclick="AIAssistant.quickQuestion('Me conte uma piada')" 
                                    class="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg font-semibold text-sm transition-all transform hover:scale-105">
                                😄 Piada
                            </button>
                            <button onclick="AIAssistant.quickQuestion('Me dê uma dica útil')" 
                                    class="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg font-semibold text-sm transition-all transform hover:scale-105">
                                💡 Dica
                            </button>
                            <button onclick="AIAssistant.quickQuestion('Me ensine algo novo')" 
                                    class="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg font-semibold text-sm transition-all transform hover:scale-105">
                                🧠 Aprender
                            </button>
                            <button onclick="AIAssistant.clearChat()" 
                                    class="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-semibold text-sm transition-all transform hover:scale-105">
                                🗑️ Limpar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    init() {
        // Carregar API key salva
        const savedKey = Utils.loadData('gemini_api_key');
        if (savedKey) {
            this.apiKey = savedKey;
        }
        
        // Carregar conversa salva
        const saved = Utils.loadData('ai_conversation');
        if (saved) {
            this.conversation = saved;
            this.renderConversation();
        }
    },
    
    saveApiKey() {
        const input = document.getElementById('api-key-input');
        if (!input || !input.value.trim()) {
            Utils.showNotification('❌ Digite uma API Key válida', 'error');
            return;
        }
        
        this.apiKey = input.value.trim();
        Utils.saveData('gemini_api_key', this.apiKey);
        Utils.showNotification('✅ API Key salva com sucesso!', 'success');
        Router.render();
    },
    
    async sendMessage() {
        if (!this.apiKey) {
            Utils.showNotification('⚠️ Configure sua API Key primeiro!', 'warning');
            return;
        }
        
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
            // Mostrar a mensagem de erro da API para diagnóstico
            this.updateLastMessage(`❌ Erro de Conexão/API: ${error.message}`);
            Utils.showNotification(`❌ Erro na API: ${error.message}`, 'error');
        }
        
        Utils.saveData('ai_conversation', this.conversation);
    },
    
    async getAIResponse(message) {
        if (!this.apiKey) {
            throw new Error('API Key não configurada');
        }

        // Usando o modelo mais estável e padrão para o ambiente
        const MODEL_NAME = 'gemini-2.5-flash-preview-09-2025'; 
        const API_VERSION = 'v1beta';
        
        const url = `https://generativelanguage.googleapis.com/${API_VERSION}/models/${MODEL_NAME}:generateContent?key=${this.apiKey}`;
        
        const body = {
            contents: [{
                parts: [{
                    text: message
                }]
            }],
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
            ]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Erro da API:', errorData);
            
            let errorMsg = errorData.error?.message || 'Erro desconhecido. (Possivelmente faturamento ou chave)';
            
            if (errorData.error?.message) {
                if (errorData.error.message.includes('API_KEY_INVALID')) {
                    errorMsg = 'API Key inválida. Verifique se copiou corretamente.';
                } else if (errorData.error.message.includes('quota')) {
                    errorMsg = 'Cota da API excedida. Tente novamente mais tarde.';
                } else if (errorData.error.message.includes('not found') || errorData.error.message.includes('is not supported')) {
                     // Corrigido para mostrar a mensagem de erro padrão da API
                     errorMsg = `Erro no modelo: ${errorData.error.message}`;
                }
            }
            
            throw new Error(errorMsg);
        }

        const data = await response.json();
        
        if (!data.candidates || data.candidates.length === 0) {
            console.warn('Resposta bloqueada ou vazia:', data);
            
            if (data.promptFeedback && data.promptFeedback.blockReason) {
                return `⚠️ Resposta bloqueada: ${data.promptFeedback.blockReason}`;
            }
            return '⚠️ A IA não forneceu uma resposta desta vez.';
        }

        const text = data.candidates[0]?.content?.parts[0]?.text;
        
        if (!text) {
            return '⚠️ A IA retornou uma resposta em formato inesperado.';
        }

        return text;
    },
    
    addMessage(role, content, isLoading = false) {
        this.conversation.push({ role, content, isLoading, timestamp: Date.now() });
        this.renderConversation();
    },
    
    updateLastMessage(content) {
        if (this.conversation.length > 0) {
            this.conversation[this.conversation.length - 1].content = content;
            this.conversation[this.conversation.length - 1].isLoading = false;
            this.renderConversation();
        }
    },
    
    renderConversation() {
        const container = document.getElementById('chat-container');
        if (!container) return;
        
        if (this.conversation.length === 0) {
            container.innerHTML = `
                <div class="text-center py-16 text-gray-400">
                    <div class="text-8xl mb-4 animate-bounce-slow">🤖</div>
                    <h3 class="text-2xl font-bold text-gray-700 mb-2">Olá! Como posso ajudar?</h3>
                    <p class="text-gray-500">Configure sua API Key acima e faça uma pergunta!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.conversation.map(msg => {
            const isUser = msg.role === 'user';
            return `
                <div class="mb-4 flex ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn">
                    <div class="max-w-2xl ${isUser ? 'order-2' : 'order-1'}">
                        <div class="flex items-center gap-2 mb-2 ${isUser ? 'justify-end' : 'justify-start'}">
                            <div class="w-8 h-8 rounded-full ${isUser ? 'bg-gradient-to-br from-blue-500 to-cyan-600' : 'bg-gradient-to-br from-purple-500 to-pink-600'} flex items-center justify-center text-white font-bold">
                                ${isUser ? '👤' : '🤖'}
                            </div>
                            <span class="font-bold text-gray-700">${isUser ? 'Você' : 'IA'}</span>
                        </div>
                        <div class="px-6 py-4 rounded-2xl shadow-lg ${isUser ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white' : 'bg-white text-gray-800 border-2 border-gray-200'}">
                            ${msg.isLoading ? '<span class="animate-pulse">⏳ Pensando...</span>' : this.formatMessage(msg.content)}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        container.scrollTop = container.scrollHeight;
    },
    
    formatMessage(content) {
        // Converter markdown para HTML
        let html = content
            .replace(/&/g, '&amp;') // Escapa &
            .replace(/</g, '&lt;') // Escapa HTML
            .replace(/>/g, '&gt;');
            
        // RegEx para blocos de código
        html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, p1, p2) => {
            const lang = p1 || '';
            const codeContent = p2.trim();
            return `
                <pre class="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto mt-2 mb-2">
                    <code class="language-${lang}" style="white-space: pre-wrap;">${codeContent}</code>
                </pre>`;
        });
        
        // Markdowns inline
        html = html
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Negrito
            .replace(/\*(.*?)\*/g, '<em>$1</em>')     // Itálico
            .replace(/`([^`]+)`/g, '<code class="px-2 py-1 bg-gray-200 text-gray-800 rounded text-sm">$1</code>') // Código inline
            .replace(/\n/g, '<br>'); // Novas linhas

        return html;
    },
    
    quickQuestion(question) {
        document.getElementById('chat-input').value = question;
        this.sendMessage();
    },
    
    clearChat() {
        // Regra do ambiente: Não usar 'confirm()', usar modal customizado (mantendo o comportamento de limpar)
        this.conversation = [];
        Utils.saveData('ai_conversation', []);
        this.renderConversation();
        Utils.showNotification('🗑️ Conversa limpa!', 'success');
    }
};

window.AIAssistant = AIAssistant;
