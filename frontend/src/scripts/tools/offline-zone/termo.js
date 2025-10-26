// TERMO - Wordle em Português にゃん~
const Termo = {
    wordList: [
        'FORCA', 'TEMPO', 'MUNDO', 'GATOS', 'JOGOS', 'LIVRO', 'PRAIA',
        'CARRO', 'FELIZ', 'AMIGO', 'PAPEL', 'TINTA', 'VERDE', 'PRETO',
        'VENTO', 'CHUVA', 'NUVEM', 'PONTE', 'PEIXE', 'TIGRE', 'PORCO',
        'CABRA', 'BURRO', 'ZEBRA', 'PANDA', 'COBRA', 'MOSCA', 'GRILO',
        'FESTA', 'VINHO', 'LEITE', 'PEIXE'
    ],

    currentWord: '',
    guesses: [],
    currentGuess: '',
    maxAttempts: 6,
    gameOver: false,
    won: false,
    isReady: false,
    
    render() {
        return `
            <div class="bg-white rounded-2xl shadow-2xl p-8">
                <!-- Header -->
                <div class="text-center mb-8">
                    <div class="inline-block mb-4">
                        <div class="text-6xl animate-bounce-slow">🔤</div>
                    </div>
                    <h2 class="text-3xl font-black text-gray-800 mb-2">Termo にゃん~</h2>
                    <p class="text-gray-600">Adivinhe a palavra de 5 letras em ${this.maxAttempts} tentativas!</p>
                    <div class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full">
                        <span>⏰</span>
                        <span class="font-bold text-sm">${this.getNextWordTimer()}</span>
                    </div>
                </div>
                
                ${this.gameOver ? this.renderGameOver() : ''}
                
                <!-- Grid de Tentativas -->
                <div class="max-w-md mx-auto mb-6">
                    ${this.renderGuessGrid()}
                </div>
                
                ${!this.gameOver ? `
                    <!-- Input de Palavra -->
                    <div class="max-w-md mx-auto mb-6">
                        <div class="flex gap-2">
                            <input type="text" 
                                id="termo-input" 
                                maxlength="5" 
                                value="${this.currentGuess}"
                                placeholder="Digite aqui..."
                                class="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-4 focus:ring-yellow-200 outline-none transition-all text-center text-2xl font-bold uppercase tracking-widest"
                                onkeypress="if(event.key === 'Enter') Termo.submitGuess()"
                                oninput="Termo.updateCurrentGuess(this.value)">
                            <button onclick="Termo.submitGuess()" 
                                    class="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all">
                                ✓ Enviar
                            </button>
                        </div>
                        <p class="text-center text-sm text-gray-500 mt-2">
                            ${5 - this.currentGuess.length} letra${5 - this.currentGuess.length !== 1 ? 's' : ''} restante${5 - this.currentGuess.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    
                    <!-- Teclado Virtual -->
                    ${this.renderKeyboard()}
                ` : ''}
                
                <!-- Legenda -->
                <div class="mt-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-4 text-center">📖 Como Jogar</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">A</div>
                            <span class="text-sm text-gray-700">Letra correta na posição certa</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">B</div>
                            <span class="text-sm text-gray-700">Letra correta na posição errada</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 bg-gray-400 rounded-lg flex items-center justify-center text-white font-bold text-xl">C</div>
                            <span class="text-sm text-gray-700">Letra não está na palavra</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    init() {
        this.currentWord = this.getDailyWord();
        this.loadGameState();
        
        // Reset se mudou o dia
        const lastPlayed = Utils.loadData('termo_last_played');
        const today = this.getToday();
        if (lastPlayed !== today) {
            this.resetGame();
        }
        
        console.log('🔤 Palavra do dia:', this.currentWord);
    },
    
    getDailyWord() {
        const today = this.getToday();
        const seed = this.hashCode(today);
        const index = Math.abs(seed) % this.wordList.length;
        return this.wordList[index];
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
    
    renderGuessGrid() {
        let grid = '';
        
        // Renderizar tentativas feitas
        for (let i = 0; i < this.guesses.length; i++) {
            grid += `<div class="grid grid-cols-5 gap-2 mb-2">${this.renderGuessRow(this.guesses[i])}</div>`;
        }
        
        // Renderizar linha atual (se não acabou e ainda tem tentativas)
        if (!this.gameOver && this.guesses.length < this.maxAttempts) {
            grid += `<div class="grid grid-cols-5 gap-2 mb-2">${this.renderCurrentRow()}</div>`;
            
            // Renderizar linhas vazias restantes
            const emptyRows = this.maxAttempts - this.guesses.length - 1;
            for (let i = 0; i < emptyRows; i++) {
                grid += `<div class="grid grid-cols-5 gap-2 mb-2">${this.renderEmptyRow()}</div>`;
            }
        } else {
            // Se o jogo acabou, renderizar linhas vazias restantes
            const emptyRows = this.maxAttempts - this.guesses.length;
            for (let i = 0; i < emptyRows; i++) {
                grid += `<div class="grid grid-cols-5 gap-2 mb-2">${this.renderEmptyRow()}</div>`;
            }
        }
        
        return grid;
    },
    
    renderGuessRow(guess) {
        return guess.map((letter, i) => {
            let bgClass = 'bg-gray-400';
            if (letter.status === 'correct') bgClass = 'bg-green-500';
            else if (letter.status === 'present') bgClass = 'bg-yellow-500';
            
            return `
                <div class="aspect-square ${bgClass} rounded-lg flex items-center justify-center text-white font-black text-3xl shadow-lg transform transition-all animate-flipIn" style="animation-delay: ${i * 0.1}s">
                    ${letter.letter}
                </div>
            `;
        }).join('');
    },
    
    renderCurrentRow() {
        let row = '';
        for (let i = 0; i < 5; i++) {
            const letter = this.currentGuess[i] || '';
            row += `
                <div class="aspect-square ${letter ? 'bg-gray-200 border-2 border-gray-400' : 'bg-white border-2 border-gray-300'} rounded-lg flex items-center justify-center text-gray-800 font-black text-3xl transition-all ${letter ? 'scale-110' : ''}">
                    ${letter}
                </div>
            `;
        }
        return row;
    },
    
    renderEmptyRow() {
        let row = '';
        for (let i = 0; i < 5; i++) {
            row += `<div class="aspect-square bg-white border-2 border-gray-300 rounded-lg"></div>`;
        }
        return row;
    },
    
    renderKeyboard() {
        const rows = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
        ];
        
        return `
            <div class="max-w-lg mx-auto mt-6">
                ${rows.map(row => `
                    <div class="flex gap-1 mb-1 justify-center">
                        ${row.map(key => {
                            const status = this.getKeyStatus(key);
                            let bgClass = 'bg-gray-200 hover:bg-gray-300';
                            if (status === 'correct') bgClass = 'bg-green-500 text-white';
                            else if (status === 'present') bgClass = 'bg-yellow-500 text-white';
                            else if (status === 'absent') bgClass = 'bg-gray-400 text-white';
                            
                            const isSpecial = key === 'ENTER' || key === '⌫';
                            
                            return `
                                <button 
                                    onclick="Termo.handleKeyPress('${key}')"
                                    class="${isSpecial ? 'px-4' : 'px-3'} py-4 ${bgClass} rounded-lg font-bold text-sm transition-all transform hover:scale-105 active:scale-95 shadow-md">
                                    ${key}
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
                    <p class="text-xl mb-4">Você acertou em ${this.guesses.length}/${this.maxAttempts} tentativas!</p>
                    <p class="text-2xl font-black mb-4">A palavra era: ${this.currentWord}</p>
                    <div class="flex gap-3 justify-center">
                        <button onclick="Termo.shareResult()" 
                                class="px-6 py-3 bg-white text-green-600 rounded-xl font-bold hover:shadow-xl transition-all">
                            📋 Copiar Resultado
                        </button>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-8 text-white text-center mb-6 animate-fadeIn">
                    <div class="text-7xl mb-4">😿</div>
                    <h3 class="text-3xl font-black mb-2">Que pena! にゃん~</h3>
                    <p class="text-xl mb-4">Você não conseguiu dessa vez...</p>
                    <p class="text-2xl font-black mb-4">A palavra era: <span class="bg-white/20 px-4 py-2 rounded-lg">${this.currentWord}</span></p>
                    <div class="flex gap-3 justify-center">
                        <button onclick="Termo.shareResult()" 
                                class="px-6 py-3 bg-white text-red-600 rounded-xl font-bold hover:shadow-xl transition-all">
                            📋 Copiar Resultado
                        </button>
                    </div>
                </div>
            `;
        }
    },
    
    updateCurrentGuess(value) {
        this.currentGuess = value.toUpperCase().replace(/[^A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ]/g, '').slice(0, 5);
        Router.render();
    },
    
    handleKeyPress(key) {
        if (this.gameOver) return;
        
        if (key === 'ENTER') {
            this.submitGuess();
        } else if (key === '⌫') {
            this.currentGuess = this.currentGuess.slice(0, -1);
            Router.render();
        } else {
            if (this.currentGuess.length < 5) {
                this.currentGuess += key;
                Router.render();
            }
        }
    },
    
    submitGuess() {
        if (this.currentGuess.length !== 5) {
            Utils.showNotification('❌ Digite uma palavra de 5 letras', 'error');
            return;
        }
        
        const guess = this.currentGuess.split('').map((letter, i) => {
            let status = 'absent';
            if (this.currentWord[i] === letter) {
                status = 'correct';
            } else if (this.currentWord.includes(letter)) {
                status = 'present';
            }
            return { letter, status };
        });
        
        this.guesses.push(guess);
        
        // Verificar vitória
        if (this.currentGuess === this.currentWord) {
            this.gameOver = true;
            this.won = true;
            Utils.showNotification('🎉 Parabéns! Você acertou! にゃん~', 'success');
        } else if (this.guesses.length >= this.maxAttempts) {
            this.gameOver = true;
            this.won = false;
            Utils.showNotification('😿 Acabaram as tentativas! A palavra era: ' + this.currentWord, 'error');
        }
        
        this.currentGuess = '';
        this.saveGameState();
        Router.render();
    },
    
    getKeyStatus(key) {
        let status = null;
        this.guesses.forEach(guess => {
            guess.forEach(g => {
                if (g.letter === key) {
                    if (g.status === 'correct') status = 'correct';
                    else if (g.status === 'present' && status !== 'correct') status = 'present';
                    else if (status === null) status = 'absent';
                }
            });
        });
        return status;
    },
    
    shareResult() {
        const today = this.getToday();
        let text = `Termo ${today} ${this.won ? this.guesses.length : 'X'}/${this.maxAttempts}\n\n`;
        
        this.guesses.forEach(guess => {
            guess.forEach(g => {
                if (g.status === 'correct') text += '🟩';
                else if (g.status === 'present') text += '🟨';
                else text += '⬜';
            });
            text += '\n';
        });
        
        text += '\nJogado em NyanTools にゃん~ 🐱';
        
        Utils.copyToClipboard(text);
    },
    
    saveGameState() {
        Utils.saveData('termo_state', {
            guesses: this.guesses,
            gameOver: this.gameOver,
            won: this.won,
            currentWord: this.currentWord
        });
        Utils.saveData('termo_last_played', this.getToday());
    },
    
    loadGameState() {
        const state = Utils.loadData('termo_state');
        if (state && state.currentWord === this.currentWord) {
            this.guesses = state.guesses || [];
            this.gameOver = state.gameOver || false;
            this.won = state.won || false;
        } else {
            this.resetGame();
        }
    },
    
    resetGame() {
        this.guesses = [];
        this.currentGuess = '';
        this.gameOver = false;
        this.won = false;
        this.saveGameState();
    }
};

window.Termo = Termo;