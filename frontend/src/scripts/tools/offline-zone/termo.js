
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
    currentGuess: ['', '', '', '', ''],
    maxAttempts: 6,
    gameOver: false,
    won: false,
    isReady: false,
    selectedCell: 0,
    
    keyboardRows: [
        'QWERTYUIOP'.split(''),
        'ASDFGHJKL'.split(''),
        ['⌫', ...'ZXCVBNM'.split('')]
    ],
    
    render() {
        return `
            <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl mx-auto">
                ${this.renderHeader()}
                ${this.gameOver ? this.renderGameOver() : ''}
                ${this.renderGuessGrid()}
                ${!this.gameOver ? this.renderSubmitButton() : ''}
                ${!this.gameOver ? this.renderKeyboard() : ''}
                ${this.renderLegend()}
            </div>
        `;
    },
    
    renderHeader() {
        return `
            <div class="text-center mb-6">
                <h2 class="text-3xl font-black text-gray-800 mb-1 flex items-center justify-center gap-2">
                    <span class="text-4xl">📤</span>
                    <span>Termo</span>
                </h2>
                <p class="text-sm text-gray-600">Clique nos quadradinhos para digitar as letras</p>
            </div>
        `;
    },
    
    renderGuessGrid() {
        return `
            <div class="max-w-sm mx-auto mb-4" id="termo-grid">
                ${this.buildGridRows()}
            </div>
        `;
    },
    
    buildGridRows() {
        const rows = [];
        
        for (let i = 0; i < this.guesses.length; i++) {
            rows.push(this.renderCompletedRow(this.guesses[i]));
        }

        if (!this.gameOver && this.guesses.length < this.maxAttempts) {
            rows.push(this.renderCurrentRow());

            const emptyRows = this.maxAttempts - this.guesses.length - 1;
            for (let i = 0; i < emptyRows; i++) {
                rows.push(this.renderEmptyRow());
            }
        } else {
            const emptyRows = this.maxAttempts - this.guesses.length;
            for (let i = 0; i < emptyRows; i++) {
                rows.push(this.renderEmptyRow());
            }
        }
        
        return rows.join('');
    },
    
    renderCompletedRow(guess) {
        const cells = guess.map((item, i) => {
            const letter = item.letter || item;
            const status = item.status || 'absent';
            const colors = this.getStatusColors(status);
            
            return `
                <div class="termo-cell aspect-square ${colors.bg} ${colors.text} rounded-lg flex items-center justify-center font-black text-2xl shadow-lg transform transition-all animate-flipIn" 
                     data-status="${status}"
                     style="background-color: ${colors.bgColor} !important; color: white !important; animation-delay: ${i * 0.1}s">
                    ${letter}
                </div>
            `;
        }).join('');
        
        return `<div class="grid grid-cols-5 gap-1.5 mb-1.5">${cells}</div>`;
    },
    
    renderCurrentRow() {
        const cells = Array(5).fill(0).map((_, i) => {
            const letter = this.currentGuess[i] || '';
            const isSelected = this.selectedCell === i;
            const borderClass = isSelected ? 'border-blue-500 ring-4 ring-blue-200' : (letter ? 'border-gray-400' : 'border-gray-300');
            const bgClass = letter ? 'bg-gray-200' : 'bg-white';
            const scaleClass = letter ? 'scale-110' : '';
            
            return `
                <div onclick="Termo.selectCell(${i})" 
                     class="aspect-square cursor-pointer ${bgClass} border-2 ${borderClass} rounded-lg flex items-center justify-center text-gray-800 font-black text-2xl transition-all hover:scale-105 ${scaleClass}">
                    ${letter}
                </div>
            `;
        }).join('');
        
        return `<div class="grid grid-cols-5 gap-1.5 mb-1.5" data-current-row="true">${cells}</div>`;
    },
    
    renderEmptyRow() {
        const cells = Array(5).fill(0).map(() => 
            `<div class="aspect-square bg-white border-2 border-gray-300 rounded-lg"></div>`
        ).join('');
        
        return `<div class="grid grid-cols-5 gap-1.5 mb-1.5">${cells}</div>`;
    },
    
    renderSubmitButton() {
        return `
            <div class="max-w-sm mx-auto mb-4">
                <button onclick="Termo.submitGuess()" 
                        class="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all">
                    ✓ Enviar Palavra
                </button>
            </div>
        `;
    },
    
    renderKeyboard() {
        return `
            <div class="max-w-lg mx-auto mt-4">
                ${this.keyboardRows.map(row => this.renderKeyboardRow(row)).join('')}
            </div>
        `;
    },
    
    renderKeyboardRow(row) {
        const keys = row.map(key => {
            const status = this.getKeyStatus(key);
            const colors = this.getKeyColors(status);
            const action = key === '⌫' ? 'Termo.handleBackspace()' : `Termo.handleKeyPress('${key}')`;
            const isGuessed = this.guessedLetters?.includes(key);
            
            return `
                <button 
                    onclick="${action}"
                    ${isGuessed ? 'disabled' : ''}
                    class="px-2 py-3 ${colors} rounded-lg font-bold text-sm transition-all transform ${isGuessed ? '' : 'hover:scale-105 active:scale-95'} shadow-md min-w-[32px]">
                    ${key}
                </button>
            `;
        }).join('');
        
        return `<div class="flex gap-1 mb-1 justify-center">${keys}</div>`;
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
        }
        
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
    },
    
    renderLegend() {
        return `
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
        `;
    },
    
    init() {
        this.currentWord = this.getDailyWord();
        
        const lastPlayed = Utils.loadData('termo_last_played');
        const today = this.getToday();
        
        if (lastPlayed !== today) {
            this.resetGame();
        } else {
            this.loadGameState();
        }
        
        
        if (this.guesses.length > 0) {
            setTimeout(() => {
                Router?.render();
                if (!this.gameOver) {
                    setTimeout(() => this.setupKeyboardListener(), 100);
                }
            }, 50);
        } else {
            setTimeout(() => {
                if (!this.gameOver) {
                    this.setupKeyboardListener();
                }
            }, 100);
        }
        
        this.isReady = true;
    },
    
    setupKeyboardListener() {
        if (this.gameOver) return;
        
        const oldListener = window.termoKeyListener;
        if (oldListener) {
            document.removeEventListener('keydown', oldListener);
        }
        
        const listener = (e) => {
            if (!document.getElementById('termo-grid')) {
                document.removeEventListener('keydown', listener);
                window.termoKeyListener = null;
                return;
            }
            if (this.gameOver) return;
            
            const key = e.key.toUpperCase();
            
            if (e.key === 'Backspace' || e.key === 'Delete') {
                e.preventDefault();
                this.handleBackspace();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                this.submitGuess();
            } else if (/^[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ]$/.test(key)) {
                e.preventDefault();
                this.handleKeyPress(key);
            }
        };
        
        window.termoKeyListener = listener;
        document.addEventListener('keydown', listener);
    },
    
    selectCell(index) {
        if (this.gameOver) return;
        this.selectedCell = index;
        this.updateCurrentRow();
    },
    
    handleKeyPress(key) {
        if (this.gameOver) return;
        
        this.currentGuess[this.selectedCell] = key;
        
        if (this.selectedCell < 4) {
            this.selectedCell++;
        }
        
        this.updateCurrentRow();
    },
    
    handleBackspace() {
        if (this.gameOver) return;
        
        if (!this.currentGuess[this.selectedCell] && this.selectedCell > 0) {
            this.selectedCell--;
        }
        
        this.currentGuess[this.selectedCell] = '';
        this.updateCurrentRow();
    },
    
    updateCurrentRow() {
        const currentRow = document.querySelector('[data-current-row="true"]');
        if (!currentRow) return;
        
        const cells = currentRow.querySelectorAll('div');
        for (let i = 0; i < 5; i++) {
            const letter = this.currentGuess[i] || '';
            const cell = cells[i];
            const isSelected = this.selectedCell === i;
            
            if (letter) {
                cell.className = `aspect-square cursor-pointer bg-gray-200 border-2 ${isSelected ? 'border-blue-500 ring-4 ring-blue-200' : 'border-gray-400'} rounded-lg flex items-center justify-center text-gray-800 font-black text-2xl transition-all hover:scale-105 scale-110`;
                cell.textContent = letter;
            } else {
                cell.className = `aspect-square cursor-pointer bg-white border-2 ${isSelected ? 'border-blue-500 ring-4 ring-blue-200' : 'border-gray-300'} rounded-lg flex items-center justify-center text-gray-800 font-black text-2xl transition-all hover:scale-105`;
                cell.textContent = '';
            }
        }
    },
    
    submitGuess() {
        const filledCells = this.currentGuess.filter(letter => letter !== '').length;
        if (filledCells !== 5) {
            Utils.showNotification?.('❌ Preencha todas as 5 letras', 'error');
            return;
        }
        
        const guessWord = this.currentGuess.join('');
        const guess = this.evaluateGuess(guessWord);
        
        this.guesses.push(guess);
        
        const won = guess.every(g => g.status === 'correct');
        
        this.currentGuess = ['', '', '', '', ''];
        this.selectedCell = 0;
        
        if (won) {
            this.gameOver = true;
            this.won = true;
            const attempts = this.guesses.length;
            const currentBest = Utils.loadData('termo_best');
            const isNewRecord = !currentBest || attempts < currentBest;
            if (isNewRecord) {
                Utils.saveData('termo_best', attempts);
                window.Economy?.checkRecord?.('termo_best', attempts, false);
                setTimeout(() => window.ShareToFeed?.showToast?.('termo', attempts, { isRecord: isNewRecord }), 500);
            }
            window.Missions?.track?.({ event: 'termo_win', attempts });
            if (isNewRecord) window.Missions?.track?.({ event: 'beat_record', game: 'termo' });
            window.Economy?.grant?.('play_game');
            Utils.showNotification?.('🎉 Parabéns! Você acertou! にゃん~', 'success');
        } else if (this.guesses.length >= this.maxAttempts) {
            this.gameOver = true;
            this.won = false;
            Utils.showNotification?.('😿 Acabaram as tentativas! A palavra era: ' + this.currentWord, 'error');
        }
        
        this.saveGameState();
        Router?.render();
        
        if (!this.gameOver) {
            setTimeout(() => this.setupKeyboardListener(), 100);
        }
    },
    
    evaluateGuess(guessWord) {
        const guess = [];
        const wordArray = this.currentWord.split('');
        const guessArray = guessWord.split('');
        const usedIndices = new Set();
        
        for (let i = 0; i < 5; i++) {
            if (guessArray[i] === wordArray[i]) {
                guess[i] = { letter: guessArray[i], status: 'correct' };
                usedIndices.add(i);
            }
        }

        for (let i = 0; i < 5; i++) {
            if (guess[i]) continue;
            
            let found = false;
            for (let j = 0; j < 5; j++) {
                if (!usedIndices.has(j) && guessArray[i] === wordArray[j]) {
                    guess[i] = { letter: guessArray[i], status: 'present' };
                    usedIndices.add(j);
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                guess[i] = { letter: guessArray[i], status: 'absent' };
            }
        }
        
        return guess;
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
    
    getStatusColors(status) {
        const colors = {
            correct: { bg: 'bg-green-500', text: 'text-white', bgColor: '#10b981' },
            present: { bg: 'bg-yellow-500', text: 'text-white', bgColor: '#eab308' },
            absent: { bg: 'bg-gray-400', text: 'text-white', bgColor: '#64748b' }
        };
        return colors[status] || colors.absent;
    },
    
    getKeyStatus(key) {
        if (key === '⌫') return null;
        
        let status = null;
        this.guesses.forEach(guess => {
            guess.forEach(g => {
                const letter = g.letter || g;
                const itemStatus = g.status || 'absent';
                
                if (letter === key) {
                    if (itemStatus === 'correct') status = 'correct';
                    else if (itemStatus === 'present' && status !== 'correct') status = 'present';
                    else if (status === null) status = 'absent';
                }
            });
        });
        return status;
    },
    
    getKeyColors(status) {
        if (status === 'correct') return 'bg-green-500 text-white';
        if (status === 'present') return 'bg-yellow-500 text-white';
        if (status === 'absent') return 'bg-gray-400 text-white';
        return 'bg-indigo-500 text-white hover:bg-indigo-600';
    },
    
    shareResult() {
        const today = this.getToday();
        let text = `Termo ${today} ${this.won ? this.guesses.length : 'X'}/${this.maxAttempts}\n\n`;
        
        this.guesses.forEach(guess => {
            guess.forEach(g => {
                const status = g.status || 'absent';
                if (status === 'correct') text += '🟩';
                else if (status === 'present') text += '🟨';
                else text += '⬜';
            });
            text += '\n';
        });
        
        text += '\nJogado em NyanTools にゃん~ 🐱';
        
        Utils.copyToClipboard?.(text);
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
            this.guesses = (state.guesses || []).map(guess => {
                return guess.map(item => {
                    if (item && typeof item === 'object' && item.letter && item.status) {
                        return item;
                    }
                    if (typeof item === 'string') {
                        return { letter: item, status: 'absent' };
                    }
                    return { letter: '', status: 'absent' };
                });
            });
            
            this.gameOver = state.gameOver || false;
            this.won = state.won || false;
            this.currentGuess = ['', '', '', '', ''];
            this.selectedCell = 0;
        } else {
            this.resetGame();
        }
    },
    
    cleanup() {
        if (window.termoKeyListener) {
            document.removeEventListener('keydown', window.termoKeyListener);
            window.termoKeyListener = null;
        }
    },

    resetGame() {
        this.guesses = [];
        this.currentGuess = ['', '', '', '', ''];
        this.selectedCell = 0;
        this.gameOver = false;
        this.won = false;
        this.saveGameState();
        
        if (typeof Router !== 'undefined') {
            Router.render();
            setTimeout(() => this.init(), 100);
        }
    }
};

window.Termo = Termo;
