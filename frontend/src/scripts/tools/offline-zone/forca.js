// FORCA - Jogo Clássico にゃん~
const Forca = {
    words: [
        { word: 'ELEFANTE', hint: 'Animal grande com tromba' },
        { word: 'PROGRAMADOR', hint: 'Profissão que escreve código' },
        { word: 'CHOCOLATE', hint: 'Doce marrom delicioso' },
        { word: 'GUITARRA', hint: 'Instrumento musical de cordas' },
        { word: 'MONTANHA', hint: 'Elevação natural do terreno' },
        { word: 'BIBLIOTECA', hint: 'Lugar cheio de livros' },
        { word: 'DINOSSAURO', hint: 'Animal pré-histórico extinto' },
        { word: 'COMPUTADOR', hint: 'Máquina eletrônica para processar dados' },
        { word: 'ASTRONAUTA', hint: 'Viaja para o espaço' },
        { word: 'BORBOLETA', hint: 'Inseto colorido que voa' },
        { word: 'PIRÂMIDE', hint: 'Construção egípcia antiga' },
        { word: 'ARCO-ÍRIS', hint: 'Fenômeno colorido no céu' },
        { word: 'HELICÓPTERO', hint: 'Veículo que voa com hélices' },
        { word: 'REFRIGERANTE', hint: 'Bebida gaseificada doce' },
        { word: 'VIOLONCELO', hint: 'Instrumento de cordas grande' },
        { word: 'CARROSSEL', hint: 'Brinquedo giratório de parque' },
        { word: 'PROFESSOR', hint: 'Profissão que ensina' },
        { word: 'PINGUIM', hint: 'Ave que não voa e vive no gelo' },
        { word: 'GIRASSOL', hint: 'Flor amarela que acompanha o sol' },
        { word: 'VULCÃO', hint: 'Montanha que expele lava' },
        { word: 'TELEFONE', hint: 'Aparelho para comunicação à distância' },
        { word: 'ESMERALDA', hint: 'Pedra preciosa verde' },
        { word: 'CACHOEIRA', hint: 'Queda d\'água natural' },
        { word: 'HARMÔNICA', hint: 'Instrumento musical soprado' },
        { word: 'PANQUECA', hint: 'Alimento circular e achatado' },
        { word: 'CASTELO', hint: 'Fortaleza medieval' },
        { word: 'DRAGÃO', hint: 'Criatura mitológica que cospe fogo' },
        { word: 'LABIRINTO', hint: 'Caminho confuso com muitas voltas' },
        { word: 'AQUÁRIO', hint: 'Recipiente de vidro com peixes' },
        { word: 'BAMBU', hint: 'Planta favorita dos pandas' },
        { word: 'FOGUETE', hint: 'Veículo que vai ao espaço' },
        { word: 'BALEIA', hint: 'Maior mamífero marinho' },
        { word: 'TSUNAMI', hint: 'Onda gigante do oceano' },
        { word: 'PIPOCA', hint: 'Milho estourado' },
        { word: 'TECLADO', hint: 'Parte do computador com letras' },
        { word: 'INTERNET', hint: 'Rede mundial de computadores' },
        { word: 'ESPAÇONAVE', hint: 'Veículo de viagens espaciais' },
        { word: 'PALMEIRA', hint: 'Árvore tropical alta' },
        { word: 'RELÂMPAGO', hint: 'Descarga elétrica na tempestade' },
        { word: 'VIOLÃO', hint: 'Instrumento de 6 cordas' }
    ],
    
    currentWord: null,
    currentHint: '',
    guessedLetters: [],
    wrongGuesses: 0,
    maxWrongGuesses: 6,
    gameOver: false,
    won: false,
    isReady: false,
    
    render() {
        // Verificar se o jogo está pronto
        if (!this.isReady || !this.currentWord) {
            return `
                <div class="bg-white rounded-2xl shadow-2xl p-8">
                    <div class="text-center py-20">
                        <div class="inline-block">
                            <div class="loader"></div>
                            <p class="mt-4 text-gray-600 font-semibold text-lg">Carregando Forca...</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        const wordDisplay = this.getWordDisplay();
        const remainingLives = this.maxWrongGuesses - this.wrongGuesses;
        
        return `
            <div class="bg-white rounded-2xl shadow-2xl p-8">
                <!-- Header -->
                <div class="text-center mb-8">
                    <div class="inline-block mb-4">
                        <div class="text-6xl animate-bounce-slow">🎯</div>
                    </div>
                    <h2 class="text-3xl font-black text-gray-800 mb-2">Forca にゃん~</h2>
                    <p class="text-gray-600">Adivinhe a palavra antes de ser enforcado!</p>
                    <div class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full">
                        <span>⏰</span>
                        <span class="font-bold text-sm">${this.getNextWordTimer()}</span>
                    </div>
                </div>
                
                ${this.gameOver ? this.renderGameOver() : ''}
                
                <!-- Game Area -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <!-- Boneco da Forca -->
                    <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8">
                        <div class="relative">
                            ${this.renderHangman()}
                        </div>
                        <div class="mt-6 text-center">
                            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full ${remainingLives > 3 ? 'bg-green-100 text-green-700' : remainingLives > 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}">
                                <span>💖</span>
                                <span class="font-bold">${remainingLives} vida${remainingLives !== 1 ? 's' : ''} restante${remainingLives !== 1 ? 's' : ''}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Palavra e Dica -->
                    <div class="flex flex-col justify-center">
                        <!-- Dica -->
                        <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 mb-6">
                            <div class="flex items-center gap-3 mb-3">
                                <span class="text-3xl">💡</span>
                                <span class="font-bold text-gray-700">Dica:</span>
                            </div>
                            <p class="text-xl text-gray-800 font-semibold">${this.currentHint}</p>
                        </div>
                        
                        <!-- Palavra -->
                        <div class="text-center">
                            <div class="inline-flex gap-2 flex-wrap justify-center">
                                ${wordDisplay.split(' ').map(char => {
                                    if (char === '') return ''; // Pular espaços vazios
                                    return `
                                        <div class="w-14 h-16 ${char === '_' ? 'bg-gray-200 border-b-4 border-gray-400' : 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white'} rounded-lg flex items-center justify-center text-3xl font-black shadow-lg">
                                            ${char === '_' ? '' : char}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                            <p class="text-sm text-gray-500 mt-4">
                                ${wordDisplay.split('_').length - 1} letra${wordDisplay.split('_').length - 1 !== 1 ? 's' : ''} restante${wordDisplay.split('_').length - 1 !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                </div>
                
                ${!this.gameOver ? `
                    <!-- Letras Erradas -->
                    ${this.wrongGuesses > 0 ? `
                        <div class="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                            <div class="flex items-center gap-3 flex-wrap justify-center">
                                <span class="font-bold text-red-700">❌ Letras erradas:</span>
                                <div class="flex gap-2 flex-wrap">
                                    ${this.getWrongLetters().map(letter => `
                                        <span class="px-3 py-1 bg-red-200 text-red-800 rounded-lg font-bold">${letter}</span>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Teclado -->
                    ${this.renderKeyboard()}
                ` : ''}
                
                <!-- Instruções -->
                <div class="mt-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                    <h3 class="text-lg font-bold text-purple-900 mb-3 text-center">📖 Como Jogar</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
                        <div class="flex items-start gap-2">
                            <span>✓</span>
                            <span>Clique nas letras para adivinhar</span>
                        </div>
                        <div class="flex items-start gap-2">
                            <span>✓</span>
                            <span>Use a dica para facilitar</span>
                        </div>
                        <div class="flex items-start gap-2">
                            <span>✓</span>
                            <span>Você tem ${this.maxWrongGuesses} chances</span>
                        </div>
                        <div class="flex items-start gap-2">
                            <span>✓</span>
                            <span>Nova palavra a cada 24 horas</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    init() {
        console.log('🎯 Inicializando Forca...');
        
        try {
            // 1. Obter palavra do dia
            const dailyWord = this.getDailyWord();
            
            if (!dailyWord || !dailyWord.word) {
                console.error('❌ Erro: palavra do dia inválida');
                this.isReady = false;
                return;
            }
            
            // 2. Definir palavra e dica
            this.currentWord = dailyWord.word;
            this.currentHint = dailyWord.hint;
            
            console.log('🎯 Palavra do dia:', this.currentWord);
            console.log('💡 Dica:', this.currentHint);
            
            // 3. Verificar se mudou o dia
            const lastPlayed = Utils.loadData('forca_last_played');
            const today = this.getToday();
            
            if (lastPlayed !== today) {
                console.log('📅 Novo dia! Resetando jogo...');
                this.resetGame();
            } else {
                // 4. Carregar estado salvo
                this.loadGameState();
            }
            
            // 5. Marcar como pronto
            this.isReady = true;
            
            console.log('✅ Forca inicializado com sucesso!');
            
            // 6. Re-renderizar para mostrar o jogo
            if (typeof Router !== 'undefined') {
                Router.render();
            }
        } catch (error) {
            console.error('❌ Erro ao inicializar Forca:', error);
            this.isReady = false;
            Utils.showNotification('❌ Erro ao carregar Forca', 'error');
        }
    },
    
    getDailyWord() {
        const today = this.getToday();
        const seed = this.hashCode(today);
        const index = Math.abs(seed) % this.words.length;
        return this.words[index];
    },
    
    getToday() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    },
    
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    },
    
    getNextWordTimer() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const diff = tomorrow - now;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        
        return `Próxima palavra em ${hours}h ${minutes}min`;
    },
    
    getWordDisplay() {
        // Validação de segurança
        if (!this.currentWord) {
            return '_____'; // Retorna placeholder se não tiver palavra
        }
        
        // IMPORTANTE: Revelar TODAS as ocorrências da letra
        return this.currentWord.split('').map(letter => {
            // Se for espaço ou hífen, mostrar sempre
            if (letter === ' ' || letter === '-') return letter;
            
            // Se a letra foi adivinhada, mostrar TODAS as ocorrências
            return this.guessedLetters.includes(letter) ? letter : '_';
        }).join(' '); // Adicionar espaço entre as letras para ficar mais legível
    },
    
    getWrongLetters() {
        // Validação de segurança
        if (!this.currentWord) {
            return [];
        }
        
        return this.guessedLetters.filter(letter => !this.currentWord.includes(letter));
    },
    
    renderHangman() {
        const parts = [
            `<circle cx="150" cy="80" r="30" stroke="#ef4444" stroke-width="4" fill="none"/>`, // cabeça
            `<line x1="150" y1="110" x2="150" y2="180" stroke="#ef4444" stroke-width="4"/>`, // corpo
            `<line x1="150" y1="130" x2="110" y2="160" stroke="#ef4444" stroke-width="4"/>`, // braço esq
            `<line x1="150" y1="130" x2="190" y2="160" stroke="#ef4444" stroke-width="4"/>`, // braço dir
            `<line x1="150" y1="180" x2="120" y2="230" stroke="#ef4444" stroke-width="4"/>`, // perna esq
            `<line x1="150" y1="180" x2="180" y2="230" stroke="#ef4444" stroke-width="4"/>`  // perna dir
        ];
        
        return `
            <svg viewBox="0 0 300 300" class="w-full h-64 mx-auto">
                <!-- Forca -->
                <line x1="20" y1="280" x2="180" y2="280" stroke="#64748b" stroke-width="6"/>
                <line x1="50" y1="280" x2="50" y2="20" stroke="#64748b" stroke-width="6"/>
                <line x1="50" y1="20" x2="150" y2="20" stroke="#64748b" stroke-width="6"/>
                <line x1="150" y1="20" x2="150" y2="50" stroke="#64748b" stroke-width="4"/>
                
                <!-- Boneco (partes reveladas conforme erros) -->
                ${parts.slice(0, this.wrongGuesses).join('')}
            </svg>
        `;
    },
    
    renderKeyboard() {
        const rows = [
            'QWERTYUIOP'.split(''),
            'ASDFGHJKL'.split(''),
            'ZXCVBNM'.split('')
        ];
        
        return `
            <div class="max-w-2xl mx-auto">
                ${rows.map(row => `
                    <div class="flex gap-1 mb-1 justify-center">
                        ${row.map(letter => {
                            const isGuessed = this.guessedLetters.includes(letter);
                            const isCorrect = isGuessed && this.currentWord.includes(letter);
                            const isWrong = isGuessed && !this.currentWord.includes(letter);
                            
                            let bgClass = 'bg-gray-200 hover:bg-gray-300';
                            if (isCorrect) bgClass = 'bg-green-500 text-white cursor-not-allowed';
                            else if (isWrong) bgClass = 'bg-red-500 text-white cursor-not-allowed';
                            else if (!isGuessed) bgClass = 'bg-indigo-500 text-white hover:bg-indigo-600';
                            
                            return `
                                <button 
                                    onclick="Forca.guessLetter('${letter}')"
                                    ${isGuessed ? 'disabled' : ''}
                                    class="w-10 h-12 ${bgClass} rounded-lg font-bold transition-all transform ${isGuessed ? '' : 'hover:scale-110 active:scale-95'} shadow-md">
                                    ${letter}
                                </button>
                            `;
                        }).join('')}
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    renderGameOver() {
        if (this.won) {
            return `
                <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-white text-center mb-6 animate-fadeIn">
                    <div class="text-7xl mb-4 animate-bounce">🎉</div>
                    <h3 class="text-3xl font-black mb-2">Parabéns! にゃん~</h3>
                    <p class="text-xl mb-2">Você salvou o bonequinho!</p>
                    <p class="text-2xl font-black mb-4">A palavra era: ${this.currentWord}</p>
                    <p class="text-lg mb-4">Erros: ${this.wrongGuesses}/${this.maxWrongGuesses}</p>
                    <button onclick="Forca.shareResult()" 
                            class="px-6 py-3 bg-white text-green-600 rounded-xl font-bold hover:shadow-xl transition-all">
                        📋 Copiar Resultado
                    </button>
                </div>
            `;
        } else {
            return `
                <div class="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-8 text-white text-center mb-6 animate-fadeIn">
                    <div class="text-7xl mb-4">😿</div>
                    <h3 class="text-3xl font-black mb-2">Game Over にゃん~</h3>
                    <p class="text-xl mb-2">O bonequinho foi enforcado...</p>
                    <p class="text-2xl font-black mb-4">A palavra era: <span class="bg-white/20 px-4 py-2 rounded-lg">${this.currentWord}</span></p>
                    <button onclick="Forca.shareResult()" 
                            class="px-6 py-3 bg-white text-red-600 rounded-xl font-bold hover:shadow-xl transition-all">
                        📋 Copiar Resultado
                    </button>
                </div>
            `;
        }
    },
    
    guessLetter(letter) {
        // Validações de segurança
        if (!this.currentWord) {
            Utils.showNotification('⚠️ Erro: palavra não carregada ainda', 'error');
            return;
        }
        
        if (this.gameOver || this.guessedLetters.includes(letter)) return;
        
        this.guessedLetters.push(letter);
        
        if (!this.currentWord.includes(letter)) {
            this.wrongGuesses++;
            if (this.wrongGuesses >= this.maxWrongGuesses) {
                this.gameOver = true;
                this.won = false;
                Utils.showNotification('😿 Game Over! A palavra era: ' + this.currentWord, 'error');
            } else {
                Utils.showNotification('❌ Letra errada!', 'error');
            }
        } else {
            // Contar quantas vezes a letra aparece
            const count = this.currentWord.split(letter).length - 1;
            Utils.showNotification(`✅ Acertou! (${count}x "${letter}")`, 'success');
            
            // Verificar vitória
            const wordDisplay = this.getWordDisplay().replace(/ /g, ''); // Remover espaços
            if (!wordDisplay.includes('_')) {
                this.gameOver = true;
                this.won = true;
                Utils.showNotification('🎉 Parabéns! Você venceu! にゃん~', 'success');
            }
        }
        
        this.saveGameState();
        Router.render();
    },
    
    shareResult() {
        // Validação de segurança
        if (!this.currentWord) {
            Utils.showNotification('⚠️ Erro ao compartilhar resultado', 'error');
            return;
        }
        
        const today = this.getToday();
        let text = `Forca ${today}\n`;
        text += this.won ? `✅ Venceu com ${this.wrongGuesses} erro${this.wrongGuesses !== 1 ? 's' : ''}!\n` : `❌ Perdeu\n`;
        text += `Palavra: ${this.currentWord}\n`;
        text += `💖 ${this.maxWrongGuesses - this.wrongGuesses}/${this.maxWrongGuesses} vidas restantes\n\n`;
        text += 'Jogado em NyanTools にゃん~ 🐱';
        
        Utils.copyToClipboard(text);
    },
    
    saveGameState() {
        // Validação de segurança
        if (!this.currentWord) {
            console.warn('⚠️ Forca: palavra não definida, não salvando estado');
            return;
        }
        
        Utils.saveData('forca_state', {
            guessedLetters: this.guessedLetters,
            wrongGuesses: this.wrongGuesses,
            gameOver: this.gameOver,
            won: this.won,
            currentWord: this.currentWord
        });
        Utils.saveData('forca_last_played', this.getToday());
    },
    
    loadGameState() {
        // Validação de segurança
        if (!this.currentWord) {
            console.warn('⚠️ Forca: palavra não definida ainda, pulando loadGameState');
            return;
        }
        
        const state = Utils.loadData('forca_state');
        if (state && state.currentWord === this.currentWord) {
            this.guessedLetters = state.guessedLetters || [];
            this.wrongGuesses = state.wrongGuesses || 0;
            this.gameOver = state.gameOver || false;
            this.won = state.won || false;
        } else {
            this.resetGame();
        }
    },
    
    resetGame() {
        this.guessedLetters = [];
        this.wrongGuesses = 0;
        this.gameOver = false;
        this.won = false;
        this.saveGameState();
    }
};

window.Forca = Forca;