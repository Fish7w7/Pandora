// TERMO - Wordle em Português にゃん~
const Termo = {
    wordList: [
        'FORCA', 'TEMPO', 'MUNDO', 'GATOS', 'JOGOS', 'LIVRO', 'PRAIA',
        'CARRO', 'FELIZ', 'AMIGO', 'PAPEL', 'TINTA', 'VERDE', 'PRETO',
        'VENTO', 'CHUVA', 'NUVEM', 'PONTE', 'PEIXE', 'TIGRE', 'PORCO',
        'CABRA', 'BURRO', 'ZEBRA', 'PANDA', 'COBRA', 'MOSCA', 'GRILO',
        'FESTA', 'VINHO', 'LEITE', 'PIZZA', 'MAGIA', 'RAIVA', 'SABOR',
        'FORTE', 'CALMA', 'SORTE', 'TRIGO', 'BRAVO', 'PLANO', 'RISCO'
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
            <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl mx-auto">
                <!-- Header Compacto -->
                <div class="text-center mb-6">
                    <h2 class="text-3xl font-black text-gray-800 mb-1 flex items-center justify-center gap-2">
                        <span class="text-4xl">🔤</span>
                        <span>Termo</span>
                    </h2>
                    <p class="text-sm text-gray-600">Adivinhe a palavra de 5 letras em ${this.maxAttempts} tentativas</p>
                </div>
                
                ${this.gameOver ? this.renderGameOver() : ''}
                
                <!-- Grid de Tentativas (Compacto) -->
                <div class="max-w-sm mx-auto mb-4">
                    ${this.renderGuessGrid()}
                </div>
                
                ${!this.gameOver ? `
                    <!-- Input de Palavra -->
                    <div class="max-w-sm mx-auto mb-4">
                        <input type="text" 
                            id="termo-input" 
                            maxlength="5" 
                            value="${this.currentGuess}"
                            placeholder="Digite aqui ou use o teclado virtual"
                            class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all text-center text-xl font-bold uppercase tracking-widest"
                            autocomplete="off"
                            autofocus>
                        <p class="text-center text-xs text-gray-500 mt-1" id="termo-counter">
                            ${5 - this.currentGuess.length} letra${5 - this.currentGuess.length !== 1 ? 's' : ''} restante${5 - this.currentGuess.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    
                    <!-- Botão Enviar -->
                    <div class="max-w-sm mx-auto mb-4">
                        <button onclick="Termo.submitGuess()" 
                                class="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all">
                            ✓ Enviar Palavra
                        </button>
                    </div>
                    
                    <!-- Teclado Virtual Compacto -->
                    ${this.renderKeyboard()}
                ` : ''}
                
                <!-- Legenda Compacta -->
                <div class="mt-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                    <div class="flex items-center justify-center gap-4 text-xs">
                        <div class="flex items-center gap-2">
                            <div class="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-white font-bold">A</div>
                            <span class="text-gray-700">Certa</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center text-white font-bold">B</div>
                            <span class="text-gray-700">Posição errada</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-8 h-8 bg-gray-400 rounded flex items-center justify-center text-white font-bold">C</div>
                            <span class="text-gray-700">Não existe</span>
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
        
        // Adicionar listener para teclado físico APÓS renderizar
        setTimeout(() => this.setupKeyboardListener(), 100);
        
        // Flag para indicar que já foi inicializado
        this.isReady = true;
    },
    
    setupKeyboardListener() {
        const input = document.getElementById('termo-input');
        if (!input) return;
        
        // Remover listeners antigos se existirem para evitar duplicação
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);
        
        // Listener de input - só atualiza o DOM, NÃO re-renderiza tudo
        newInput.addEventListener('input', (e) => {
            const value = e.target.value.toUpperCase().replace(/[^A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ]/g, '').slice(0, 5);
            this.currentGuess = value;
            e.target.value = value;
            
            // Atualizar apenas o contador e o grid atual
            this.updateCurrentRow();
            this.updateCounter();
        });
        
        // Listener para Enter
        newInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.submitGuess();
            }
        });
        
        newInput.focus();
    },
    
    updateCurrentRow() {
        const rows = document.querySelectorAll('.grid.grid-cols-5');
        if (!rows.length) return;
        
        const currentRowIndex = this.guesses.length;
        const currentRow = rows[currentRowIndex];
        if (!currentRow) return;
        
        const cells = currentRow.querySelectorAll('div');
        for (let i = 0; i < 5; i++) {
            const letter = this.currentGuess[i] || '';
            const cell = cells[i];
            
            if (letter) {
                cell.className = 'aspect-square bg-gray-200 border-2 border-gray-400 rounded-lg flex items-center justify-center text-gray-800 font-black text-2xl transition-all scale-110';
                cell.textContent = letter;
            } else {
                cell.className = 'aspect-square bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center text-gray-800 font-black text-2xl transition-all';
                cell.textContent = '';
            }
        }
    },
    
    updateCounter() {
        const counter = document.getElementById('termo-counter');
        if (!counter) return;
        
        const remaining = 5 - this.currentGuess.length;
        counter.textContent = `${remaining} letra${remaining !== 1 ? 's' : ''} restante${remaining !== 1 ? 's' : ''}`;
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
            grid += `<div class="grid grid-cols-5 gap-1.5 mb-1.5">${this.renderGuessRow(this.guesses[i])}</div>`;
        }
        
        // Renderizar linha atual (se não acabou e ainda tem tentativas)
        if (!this.gameOver && this.guesses.length < this.maxAttempts) {
            grid += `<div class="grid grid-cols-5 gap-1.5 mb-1.5">${this.renderCurrentRow()}</div>`;
            
            // Renderizar linhas vazias restantes
            const emptyRows = this.maxAttempts - this.guesses.length - 1;
            for (let i = 0; i < emptyRows; i++) {
                grid += `<div class="grid grid-cols-5 gap-1.5 mb-1.5">${this.renderEmptyRow()}</div>`;
            }
        } else {
            // Se o jogo acabou, renderizar linhas vazias restantes
            const emptyRows = this.maxAttempts - this.guesses.length;
            for (let i = 0; i < emptyRows; i++) {
                grid += `<div class="grid grid-cols-5 gap-1.5 mb-1.5">${this.renderEmptyRow()}</div>`;
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
                <div class="aspect-square ${bgClass} rounded-lg flex items-center justify-center text-white font-black text-2xl shadow-lg transform transition-all animate-flipIn" style="animation-delay: ${i * 0.1}s">
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
                <div class="aspect-square ${letter ? 'bg-gray-200 border-2 border-gray-400' : 'bg-white border-2 border-gray-300'} rounded-lg flex items-center justify-center text-gray-800 font-black text-2xl transition-all ${letter ? 'scale-110' : ''}">
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
            ['⌫', 'Z', 'X', 'C', 'V', 'B', 'N', 'M']
        ];
        
        return `
            <div class="max-w-lg mx-auto mt-4">
                ${rows.map(row => `
                    <div class="flex gap-1 mb-1 justify-center">
                        ${row.map(key => {
                            const status = this.getKeyStatus(key);
                            let bgClass = 'bg-gray-200 hover:bg-gray-300';
                            if (status === 'correct') bgClass = 'bg-green-500 text-white';
                            else if (status === 'present') bgClass = 'bg-yellow-500 text-white';
                            else if (status === 'absent') bgClass = 'bg-gray-400 text-white';
                            
                            return `
                                <button 
                                    onclick="Termo.handleKeyPress('${key}')"
                                    class="px-2 py-3 ${bgClass} rounded-lg font-bold text-sm transition-all transform hover:scale-105 active:scale-95 shadow-md min-w-[32px]">
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
                <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white text-center mb-4 animate-fadeIn">
                    <div class="text-5xl mb-2">🎉</div>
                    <h3 class="text-2xl font-black mb-1">Parabéns! にゃん~</h3>
                    <p class="text-lg mb-2">Você acertou em ${this.guesses.length}/${this.maxAttempts} tentativas!</p>
                    <p class="text-xl font-black mb-3">${this.currentWord}</p>
                    <button onclick="Termo.shareResult()" 
                            class="px-5 py-2 bg-white text-green-600 rounded-lg font-bold hover:shadow-xl transition-all text-sm">
                        📋 Copiar Resultado
                    </button>
                </div>
            `;
        } else {
            return `
                <div class="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl p-6 text-white text-center mb-4 animate-fadeIn">
                    <div class="text-5xl mb-2">😿</div>
                    <h3 class="text-2xl font-black mb-1">Que pena! にゃん~</h3>
                    <p class="text-lg mb-2">Você não conseguiu dessa vez...</p>
                    <p class="text-xl font-black mb-3 bg-white/20 px-3 py-1 rounded-lg inline-block">${this.currentWord}</p>
                    <button onclick="Termo.shareResult()" 
                            class="px-5 py-2 bg-white text-red-600 rounded-lg font-bold hover:shadow-xl transition-all text-sm">
                        📋 Copiar Resultado
                    </button>
                </div>
            `;
        }
    },
    
    handleKeyPress(key) {
        if (this.gameOver) return;
        
        const input = document.getElementById('termo-input');
        
        if (key === '⌫') {
            this.currentGuess = this.currentGuess.slice(0, -1);
        } else {
            if (this.currentGuess.length < 5) {
                this.currentGuess += key;
            }
        }
        
        // Atualizar input e UI
        if (input) {
            input.value = this.currentGuess;
            input.focus();
        }
        
        this.updateCurrentRow();
        this.updateCounter();
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
        
        // Verificar vitória ANTES de limpar
        const won = guess.every(g => g.status === 'correct');
        
        // Limpar input
        this.currentGuess = '';
        
        if (won) {
            this.gameOver = true;
            this.won = true;
            Utils.showNotification('🎉 Parabéns! Você acertou! にゃん~', 'success');
        } else if (this.guesses.length >= this.maxAttempts) {
            this.gameOver = true;
            this.won = false;
            Utils.showNotification('😿 Acabaram as tentativas! A palavra era: ' + this.currentWord, 'error');
        }
        
        this.saveGameState();
        
        // SOLUÇÃO DO BUG: Re-configurar o listener após o Router.render()
        Router.render();
        
        // Re-adicionar o listener se o jogo ainda não terminou
        if (!this.gameOver) {
            setTimeout(() => this.setupKeyboardListener(), 100);
        }
    },
    
    getKeyStatus(key) {
        if (key === '⌫') return null;
        
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