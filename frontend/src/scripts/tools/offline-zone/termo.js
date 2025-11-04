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
    currentGuess: ['', '', '', '', ''],
    maxAttempts: 6,
    gameOver: false,
    won: false,
    isReady: false,
    selectedCell: 0,
    
    render() {
        // Log de debug
        console.log('🎨 Renderizando Termo:', {
            guesses: this.guesses.length,
            gameOver: this.gameOver,
            won: this.won
        });
        
        return `
            <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl mx-auto">
                <!-- Header Compacto -->
                <div class="text-center mb-6">
                    <h2 class="text-3xl font-black text-gray-800 mb-1 flex items-center justify-center gap-2">
                        <span class="text-4xl">🔤</span>
                        <span>Termo</span>
                    </h2>
                    <p class="text-sm text-gray-600">Clique nos quadradinhos para digitar as letras</p>
                </div>
                
                ${this.gameOver ? this.renderGameOver() : ''}
                
                <!-- Grid de Tentativas (Compacto) -->
                <div class="max-w-sm mx-auto mb-4" id="termo-grid">
                    ${this.renderGuessGrid()}
                </div>
                
                ${!this.gameOver ? `
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
        
        // Reset se mudou o dia
        const lastPlayed = Utils.loadData('termo_last_played');
        const today = this.getToday();
        if (lastPlayed !== today) {
            this.resetGame();
        } else {
            this.loadGameState();
        }
        
        console.log('🔤 Palavra do dia:', this.currentWord);
        console.log('📊 Tentativas carregadas:', this.guesses.length);
        console.log('🎮 Estado do jogo:', {
            gameOver: this.gameOver,
            won: this.won,
            guesses: this.guesses
        });
        
        // IMPORTANTE: Forçar re-renderização após carregar estado
        if (this.guesses.length > 0) {
            console.log('🔄 Re-renderizando com tentativas anteriores...');
            setTimeout(() => {
                Router.render();
                // Re-adicionar listeners após renderizar
                if (!this.gameOver) {
                    setTimeout(() => this.setupKeyboardListener(), 100);
                }
            }, 50);
        } else {
            // Adicionar listener para teclado físico APÓS renderizar
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
        
        // Remover listeners antigos
        const oldListener = window.termoKeyListener;
        if (oldListener) {
            document.removeEventListener('keydown', oldListener);
        }
        
        // Criar novo listener
        const listener = (e) => {
            if (this.gameOver) return;
            
            const key = e.key.toUpperCase();
            
            // Backspace ou Delete
            if (e.key === 'Backspace' || e.key === 'Delete') {
                e.preventDefault();
                this.handleBackspace();
            }
            // Enter
            else if (e.key === 'Enter') {
                e.preventDefault();
                this.submitGuess();
            }
            // Letras A-Z
            else if (/^[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ]$/.test(key)) {
                e.preventDefault();
                this.handleKeyPress(key);
            }
        };
        
        // Salvar referência e adicionar listener
        window.termoKeyListener = listener;
        document.addEventListener('keydown', listener);
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
    
    renderGuessGrid() {
        let rows = [];
        
        console.log('🎲 Renderizando grid:', {
            totalGuesses: this.guesses.length,
            gameOver: this.gameOver,
            maxAttempts: this.maxAttempts
        });
        
        // Renderizar tentativas feitas
        for (let i = 0; i < this.guesses.length; i++) {
            console.log(`  Linha ${i}:`, this.guesses[i]);
            rows.push(`<div class="grid grid-cols-5 gap-1.5 mb-1.5">${this.renderGuessRow(this.guesses[i])}</div>`);
        }
        
        // Renderizar linha atual (se não acabou e ainda tem tentativas)
        if (!this.gameOver && this.guesses.length < this.maxAttempts) {
            console.log('  Linha atual ativa');
            rows.push(`<div class="grid grid-cols-5 gap-1.5 mb-1.5" data-current-row="true">${this.renderCurrentRow()}</div>`);
            
            // Renderizar linhas vazias restantes
            const emptyRows = this.maxAttempts - this.guesses.length - 1;
            console.log(`  Linhas vazias: ${emptyRows}`);
            for (let i = 0; i < emptyRows; i++) {
                rows.push(`<div class="grid grid-cols-5 gap-1.5 mb-1.5">${this.renderEmptyRow()}</div>`);
            }
        } else {
            // Se o jogo acabou, renderizar linhas vazias restantes
            const emptyRows = this.maxAttempts - this.guesses.length;
            console.log(`  Jogo acabou, linhas vazias: ${emptyRows}`);
            for (let i = 0; i < emptyRows; i++) {
                rows.push(`<div class="grid grid-cols-5 gap-1.5 mb-1.5">${this.renderEmptyRow()}</div>`);
            }
        }
        
        return rows.join('');
    },
    
    renderGuessRow(guess) {
        return guess.map((item, i) => {
            // Garantir que item sempre tenha letter e status
            const letter = item.letter || item;
            const status = item.status || 'absent';
            
            // Definir cores baseado no status - IMPORTANTE: usar inline style com !important
            let bgClass = 'bg-gray-400';
            let bgColor = '#64748b';
            let textClass = 'text-white';
            
            if (status === 'correct') {
                bgClass = 'bg-green-500';
                bgColor = '#10b981';
                textClass = 'text-white';
            } else if (status === 'present') {
                bgClass = 'bg-yellow-500';
                bgColor = '#eab308';
                textClass = 'text-white';
            }
            
            return `
                <div class="termo-cell aspect-square ${bgClass} ${textClass} rounded-lg flex items-center justify-center font-black text-2xl shadow-lg transform transition-all animate-flipIn" 
                     data-status="${status}"
                     style="background-color: ${bgColor} !important; color: white !important; animation-delay: ${i * 0.1}s">
                    ${letter}
                </div>
            `;
        }).join('');
    },
    
    renderCurrentRow() {
        let row = '';
        for (let i = 0; i < 5; i++) {
            const letter = this.currentGuess[i] || '';
            const isSelected = this.selectedCell === i;
            
            row += `
                <div onclick="Termo.selectCell(${i})" 
                     class="aspect-square cursor-pointer ${letter ? 'bg-gray-200 border-2 border-gray-400' : 'bg-white border-2'} ${isSelected ? 'border-blue-500 ring-4 ring-blue-200' : 'border-gray-300'} rounded-lg flex items-center justify-center text-gray-800 font-black text-2xl transition-all hover:scale-105 ${letter ? 'scale-110' : ''}">
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
                            
                            const action = key === '⌫' ? 'Termo.handleBackspace()' : `Termo.handleKeyPress('${key}')`;
                            
                            return `
                                <button 
                                    onclick="${action}"
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
    
    selectCell(index) {
        if (this.gameOver) return;
        this.selectedCell = index;
        this.updateCurrentRow();
    },
    
    handleKeyPress(key) {
        if (this.gameOver) return;
        
        // Coloca a letra na posição selecionada
        this.currentGuess[this.selectedCell] = key;
        
        // Avança para próxima célula se não for a última
        if (this.selectedCell < 4) {
            this.selectedCell++;
        }
        
        this.updateCurrentRow();
    },
    
    handleBackspace() {
        if (this.gameOver) return;
        
        // Se a célula atual está vazia, volta para a anterior
        if (!this.currentGuess[this.selectedCell] && this.selectedCell > 0) {
            this.selectedCell--;
        }
        
        // Remove letra da célula atual
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
        // Verificar se todas as células estão preenchidas
        const filledCells = this.currentGuess.filter(letter => letter !== '').length;
        if (filledCells !== 5) {
            Utils.showNotification('❌ Preencha todas as 5 letras', 'error');
            return;
        }
        
        const guessWord = this.currentGuess.join('');
        
        // CORRIGIDO: Criar array de objetos com letter e status
        const guess = this.evaluateGuess(guessWord);
        
        this.guesses.push(guess);
        
        // Verificar vitória ANTES de limpar
        const won = guess.every(g => g.status === 'correct');
        
        // Limpar input e resetar célula selecionada
        this.currentGuess = ['', '', '', '', ''];
        this.selectedCell = 0;
        
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
        Router.render();
        
        // Re-adicionar o listener se o jogo ainda não terminou
        if (!this.gameOver) {
            setTimeout(() => this.setupKeyboardListener(), 100);
        }
    },
    
    evaluateGuess(guessWord) {
        const guess = [];
        const wordArray = this.currentWord.split('');
        const guessArray = guessWord.split('');
        
        // Primeiro, marcar todas as corretas
        const usedIndices = new Set();
        for (let i = 0; i < 5; i++) {
            if (guessArray[i] === wordArray[i]) {
                guess[i] = { letter: guessArray[i], status: 'correct' };
                usedIndices.add(i);
            }
        }
        
        // Depois, marcar as presentes (posição errada)
        for (let i = 0; i < 5; i++) {
            if (guess[i]) continue; // Já marcada como correct
            
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
        console.log('📂 Carregando estado salvo:', state);
        
        if (state && state.currentWord === this.currentWord) {
            // IMPORTANTE: Normalizar formato antigo para novo formato
            this.guesses = (state.guesses || []).map(guess => {
                return guess.map(item => {
                    // Se já está no formato correto, retornar
                    if (item && typeof item === 'object' && item.letter && item.status) {
                        return item;
                    }
                    // Se está no formato antigo (apenas string), converter
                    if (typeof item === 'string') {
                        return { letter: item, status: 'absent' };
                    }
                    // Fallback
                    return { letter: '', status: 'absent' };
                });
            });
            
            this.gameOver = state.gameOver || false;
            this.won = state.won || false;
            
            // Garantir que currentGuess seja sempre um array
            this.currentGuess = ['', '', '', '', ''];
            this.selectedCell = 0;
            
            console.log('✅ Estado carregado com sucesso:', {
                guesses: this.guesses.length,
                gameOver: this.gameOver,
                won: this.won
            });
        } else {
            console.log('⚠️ Nenhum estado válido encontrado, resetando...');
            this.resetGame();
        }
    },
    
    resetGame() {
        this.guesses = [];
        this.currentGuess = ['', '', '', '', ''];
        this.selectedCell = 0;
        this.gameOver = false;
        this.won = false;
        this.saveGameState();
        
        // Forçar re-renderização
        if (typeof Router !== 'undefined') {
            Router.render();
            setTimeout(() => this.init(), 100);
        }
    }
};

window.Termo = Termo;