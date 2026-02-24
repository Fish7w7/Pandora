// FORCA - NyanTools にゃん~
// Versão Otimizada v2.0

const Forca = {
    // Lista de palavras com dificuldade
    words: [
        { word: 'PARALELEPIPEDO', hint: 'Figura geométrica 3D com 6 faces', difficulty: 'hard' },
        { word: 'OTORRINOLARINGOLOGISTA', hint: 'Médico de ouvido, nariz e garganta', difficulty: 'hard' },
        { word: 'PNEUMOULTRAMICROSCOPICOSSILICOVULCANOCONIOTICO', hint: 'Doença pulmonar causada por cinzas vulcânicas', difficulty: 'insane' },
        { word: 'ANTICONSTITUCIONALISSIMAMENTE', hint: 'Advérbio que significa "de forma muito inconstitucional"', difficulty: 'hard' },
        { word: 'HEXAFLUORETO', hint: 'Composto químico com 6 átomos de flúor', difficulty: 'hard' },
        { word: 'PSICOFISIOLOGICAMENTE', hint: 'Relativo à psicologia e fisiologia', difficulty: 'hard' },
        { word: 'OFTALMOLOGISTA', hint: 'Médico especialista em olhos', difficulty: 'medium' },
        { word: 'CALEIDOSCOPIO', hint: 'Tubo com espelhos que cria padrões coloridos', difficulty: 'medium' },
        { word: 'HIEROGLIFO', hint: 'Sistema de escrita do Antigo Egito', difficulty: 'medium' },
        { word: 'ARQUIPELOGO', hint: 'Conjunto de ilhas', difficulty: 'medium' },
        { word: 'ORNITORRINCO', hint: 'Mamífero australiano que põe ovos', difficulty: 'medium' },
        { word: 'EPISTEMOLOGIA', hint: 'Estudo filosófico do conhecimento', difficulty: 'hard' },
        { word: 'PROCRASTINACAO', hint: 'Ato de adiar tarefas', difficulty: 'medium' },
        { word: 'FOTOSSINTESE', hint: 'Processo de produção de energia nas plantas', difficulty: 'medium' },
        { word: 'CLAUSTROFOBIA', hint: 'Medo de espaços fechados', difficulty: 'medium' },
        { word: 'OXIGENIO', hint: 'Gás essencial para respiração', difficulty: 'easy' },
        { word: 'RINOCERONTE', hint: 'Animal grande com chifre no nariz', difficulty: 'medium' },
        { word: 'EFERVESCENTE', hint: 'Que produz bolhas ou espuma', difficulty: 'medium' },
        { word: 'BUMERANGUE', hint: 'Arma que volta quando lançada', difficulty: 'medium' },
        { word: 'ZIGZAGUE', hint: 'Linha em forma de "Z" repetida', difficulty: 'medium' },
        { word: 'SUPERCALIFRAGILISTICOESPIALIDOSO', hint: 'Palavra famosa do filme Mary Poppins', difficulty: 'insane' },
        { word: 'BIODIVERSIDADE', hint: 'Variedade de vida na Terra', difficulty: 'medium' },
        { word: 'RADIOATIVIDADE', hint: 'Emissão de radiação por átomos instáveis', difficulty: 'medium' },
        { word: 'FENOMENOLOGIA', hint: 'Estudo filosófico da experiência', difficulty: 'hard' },
        { word: 'QUIMICA', hint: 'Ciência que estuda a matéria', difficulty: 'easy' },
        { word: 'EXTRAORDINARIO', hint: 'Algo fora do comum', difficulty: 'medium' },
        { word: 'QUILOMETRO', hint: 'Unidade de medida de 1000 metros', difficulty: 'easy' },
        { word: 'MORFOLOGIA', hint: 'Estudo da forma das palavras', difficulty: 'hard' },
        { word: 'ONOMATOPEIA', hint: 'Palavra que imita um som', difficulty: 'medium' },
        { word: 'HIPOPOTAMO', hint: 'Animal grande que vive em rios africanos', difficulty: 'easy' },
        { word: 'CRIPTOGRAFIA', hint: 'Técnica de escrever mensagens secretas', difficulty: 'medium' },
        { word: 'CRONOMETRO', hint: 'Instrumento para medir tempo com precisão', difficulty: 'medium' },
        { word: 'XILOFONE', hint: 'Instrumento musical de percussão com barras', difficulty: 'medium' },
        { word: 'WZXQK', hint: 'Sequência aleatória de letras raras', difficulty: 'insane' },
        { word: 'PARADOXO', hint: 'Situação contraditória mas aparentemente verdadeira', difficulty: 'medium' },
        { word: 'METAMORFOSE', hint: 'Transformação completa de forma', difficulty: 'medium' },
        { word: 'PTERODACTILO', hint: 'Réptil voador pré-histórico', difficulty: 'hard' },
        { word: 'SINCRONIA', hint: 'Acontecer ao mesmo tempo', difficulty: 'medium' },
        { word: 'WXYZ', hint: 'Últimas letras do alfabeto', difficulty: 'hard' },
        { word: 'QUOCIENTE', hint: 'Resultado da divisão', difficulty: 'medium' }
    ],
    
    // Estado do jogo
    currentWord: null,
    currentHint: '',
    currentDifficulty: '',
    guessedLetters: [],
    wrongGuesses: 0,
    maxWrongGuesses: 6,
    gameOver: false,
    won: false,
    isReady: false,
    hintsUsed: 0,
    maxHints: 2,
    revealedPositions: [],
    timeStarted: null,
    timeTaken: 0,
    
    // Mapas de dificuldade
    difficultyConfig: {
        easy: { emoji: '😊', label: 'Fácil', color: 'bg-green-100 text-green-700' },
        medium: { emoji: '🤔', label: 'Médio', color: 'bg-yellow-100 text-yellow-700' },
        hard: { emoji: '😰', label: 'Difícil', color: 'bg-orange-100 text-orange-700' },
        insane: { emoji: '💀', label: 'INSANO', color: 'bg-red-100 text-red-700' }
    },
    
    // ============================================
    // RENDER PRINCIPAL
    // ============================================
    
    render() {
        if (!this.isReady || !this.currentWord) {
            return this.renderLoading();
        }
        
        return `
            <div class="bg-white rounded-2xl shadow-2xl p-8">
                ${this.renderHeader()}
                ${this.gameOver ? this.renderGameOver() : ''}
                ${this.renderGameArea()}
                ${!this.gameOver ? this.renderKeyboard() : ''}
                ${this.renderInstructions()}
            </div>
        `;
    },
    
    renderLoading() {
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
    },
    
    renderHeader() {
        return `
            <div class="text-center mb-8">
                <div class="inline-block mb-4">
                    <div class="text-6xl animate-bounce-slow">🎯</div>
                </div>
                <h2 class="text-3xl font-black text-gray-800 mb-2">Forca にゃん~</h2>
                <p class="text-gray-600">Adivinhe a palavra antes de ser enforcado!</p>
                
                <div class="flex gap-3 justify-center mt-4">
                    ${this.renderDifficultyBadge()}
                    ${this.renderTimerBadge()}
                </div>
            </div>
        `;
    },
    
    renderDifficultyBadge() {
        const config = this.difficultyConfig[this.currentDifficulty] || this.difficultyConfig.medium;
        return `
            <div class="inline-flex items-center gap-2 px-4 py-2 ${config.color} rounded-full">
                <span>${config.emoji}</span>
                <span class="font-bold text-sm">${config.label}</span>
            </div>
        `;
    },
    
    renderTimerBadge() {
        return `
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full">
                <span>⏰</span>
                <span class="font-bold text-sm">${this.getNextWordTimer()}</span>
            </div>
        `;
    },
    
    renderGameArea() {
        const remainingLives = this.maxWrongGuesses - this.wrongGuesses;
        
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                ${this.renderHangmanSection(remainingLives)}
                ${this.renderWordSection()}
            </div>
            ${this.wrongGuesses > 0 ? this.renderWrongLetters() : ''}
        `;
    },
    
    renderHangmanSection(remainingLives) {
        return `
            <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8">
                <div class="relative">
                    ${this.renderHangman()}
                </div>
                <div class="mt-6 text-center space-y-3">
                    ${this.renderLivesBadge(remainingLives)}
                    ${!this.gameOver ? this.renderHintButton() : ''}
                </div>
            </div>
        `;
    },
    
    renderLivesBadge(remainingLives) {
        const colorClass = remainingLives > 3 ? 'bg-green-100 text-green-700' : 
                          remainingLives > 1 ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-red-100 text-red-700';
        
        return `
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full ${colorClass}">
                <span>💖</span>
                <span class="font-bold">${remainingLives} vida${remainingLives !== 1 ? 's' : ''}</span>
            </div>
        `;
    },
    
    renderHintButton() {
        const disabled = this.hintsUsed >= this.maxHints;
        return `
            <div>
                <button 
                    onclick="Forca.useHint()"
                    ${disabled ? 'disabled' : ''}
                    class="px-4 py-2 ${disabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-600'} text-white rounded-lg font-bold transition-all">
                    💡 Dica (${this.maxHints - this.hintsUsed} restantes)
                </button>
            </div>
        `;
    },
    
    renderWordSection() {
        const wordDisplay = this.getWordDisplay();
        
        return `
            <div class="flex flex-col justify-center">
                ${this.renderHintBox()}
                ${this.renderWordDisplay(wordDisplay)}
            </div>
        `;
    },
    
    renderHintBox() {
        return `
            <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 mb-6">
                <div class="flex items-center gap-3 mb-3">
                    <span class="text-3xl">💡</span>
                    <span class="font-bold text-gray-700">Dica:</span>
                </div>
                <p class="text-xl text-gray-800 font-semibold">${this.currentHint}</p>
            </div>
        `;
    },
    
    renderWordDisplay(wordDisplay) {
        return `
            <div class="text-center">
                <div class="inline-flex gap-2 flex-wrap justify-center">
                    ${wordDisplay.split(' ').map((char, idx) => this.renderLetterBox(char, idx)).join('')}
                </div>
                ${this.renderWordStats(wordDisplay)}
            </div>
        `;
    },
    
    renderLetterBox(char, idx) {
        if (char === '') return '';
        const isRevealed = this.revealedPositions.includes(idx);
        const bgClass = char === '_' ? (isRevealed ? 'bg-yellow-200 border-yellow-500' : 'bg-gray-200 border-gray-400') : 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white';
        
        return `
            <div class="w-12 h-14 ${bgClass} ${char === '_' ? 'border-b-4' : ''} rounded-lg flex items-center justify-center text-2xl font-black shadow-lg ${isRevealed ? 'animate-pulse' : ''}">
                ${char === '_' ? '' : char}
            </div>
        `;
    },
    
    renderWordStats(wordDisplay) {
        const remaining = wordDisplay.split('_').length - 1;
        return `
            <div class="mt-4 space-y-2">
                <p class="text-sm text-gray-500">
                    ${remaining} letra${remaining !== 1 ? 's' : ''} restante${remaining !== 1 ? 's' : ''}
                </p>
                <p class="text-xs text-gray-400">
                    🔍 Tamanho: ${this.currentWord.length} letras
                </p>
            </div>
        `;
    },
    
    renderWrongLetters() {
        return `
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
        `;
    },
    
    renderHangman() {
        const parts = [
            `<circle cx="150" cy="80" r="30" stroke="#ef4444" stroke-width="4" fill="none"/>`,
            `<line x1="150" y1="110" x2="150" y2="180" stroke="#ef4444" stroke-width="4"/>`,
            `<line x1="150" y1="130" x2="110" y2="160" stroke="#ef4444" stroke-width="4"/>`,
            `<line x1="150" y1="130" x2="190" y2="160" stroke="#ef4444" stroke-width="4"/>`,
            `<line x1="150" y1="180" x2="120" y2="230" stroke="#ef4444" stroke-width="4"/>`,
            `<line x1="150" y1="180" x2="180" y2="230" stroke="#ef4444" stroke-width="4"/>`
        ];
        
        return `
            <svg viewBox="0 0 300 300" class="w-full h-64 mx-auto">
                <line x1="20" y1="280" x2="180" y2="280" stroke="#64748b" stroke-width="6"/>
                <line x1="50" y1="280" x2="50" y2="20" stroke="#64748b" stroke-width="6"/>
                <line x1="50" y1="20" x2="150" y2="20" stroke="#64748b" stroke-width="6"/>
                <line x1="150" y1="20" x2="150" y2="50" stroke="#64748b" stroke-width="4"/>
                ${parts.slice(0, this.wrongGuesses).join('')}
            </svg>
        `;
    },
    
    renderKeyboard() {
        const rows = [
            'QWERTYUIOP'.split(''),
            'ASDFGHJKL'.split(''),
            ['⌫', ...'ZXCVBNM'.split('')]
        ];
        
        return `
            <div class="max-w-2xl mx-auto mt-4">
                ${rows.map(row => this.renderKeyboardRow(row)).join('')}
            </div>
        `;
    },
    
    renderKeyboardRow(row) {
        return `
            <div class="flex gap-1 mb-1 justify-center">
                ${row.map(key => this.renderKey(key)).join('')}
            </div>
        `;
    },
    
    renderKey(key) {
        const status = this.getKeyStatus(key);
        let bgClass = 'bg-gray-200 hover:bg-gray-300';
        
        if (status === 'correct') bgClass = 'bg-green-500 text-white cursor-not-allowed';
        else if (status === 'absent') bgClass = 'bg-gray-400 text-white cursor-not-allowed';
        else if (!status) bgClass = 'bg-indigo-500 text-white hover:bg-indigo-600';
        
        const action = key === '⌫' ? 'Forca.handleBackspace()' : `Forca.guessLetter('${key}')`;
        const isGuessed = this.guessedLetters.includes(key);
        
        return `
            <button 
                onclick="${action}"
                ${isGuessed ? 'disabled' : ''}
                class="w-10 h-12 ${bgClass} rounded-lg font-bold text-sm transition-all transform ${isGuessed ? '' : 'hover:scale-110 active:scale-95'} shadow-md min-w-[32px]">
                ${key}
            </button>
        `;
    },
    
    renderGameOver() {
        if (this.won) {
            return this.renderVictory();
        }
        return this.renderDefeat();
    },
    
    renderVictory() {
        const score = this.calculateScore();
        const timeText = this.timeTaken > 0 ? ` em ${Math.floor(this.timeTaken / 60)}:${String(this.timeTaken % 60).padStart(2, '0')}` : '';
        const config = this.difficultyConfig[this.currentDifficulty];
        
        return `
            <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-white text-center mb-6 animate-fadeIn">
                <div class="text-7xl mb-4 animate-bounce">🎉</div>
                <h3 class="text-3xl font-black mb-2">Parabéns! にゃん~</h3>
                <p class="text-xl mb-2">Você salvou o bonequinho!</p>
                <p class="text-2xl font-black mb-2">A palavra era: ${this.currentWord}</p>
                <div class="space-y-2 text-lg mb-4">
                    <p>⚡ Dificuldade: ${config.label}</p>
                    <p>❌ Erros: ${this.wrongGuesses}/${this.maxWrongGuesses}</p>
                    <p>💡 Dicas usadas: ${this.hintsUsed}/${this.maxHints}</p>
                    <p>⏱️ Tempo: ${timeText}</p>
                    <p class="text-2xl font-black mt-3">⭐ Pontuação: ${score}</p>
                </div>
                <button onclick="Forca.shareResult()" 
                        class="px-6 py-3 bg-white text-green-600 rounded-xl font-bold hover:shadow-xl transition-all">
                    📋 Copiar Resultado
                </button>
            </div>
        `;
    },
    
    renderDefeat() {
        const config = this.difficultyConfig[this.currentDifficulty];
        
        return `
            <div class="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-8 text-white text-center mb-6 animate-fadeIn">
                <div class="text-7xl mb-4">😿</div>
                <h3 class="text-3xl font-black mb-2">Game Over にゃん~</h3>
                <p class="text-xl mb-2">O bonequinho foi enforcado...</p>
                <p class="text-2xl font-black mb-4">A palavra era: <span class="bg-white/20 px-4 py-2 rounded-lg">${this.currentWord}</span></p>
                <p class="text-lg">⚡ Dificuldade: ${config.label}</p>
                <button onclick="Forca.shareResult()" 
                        class="mt-4 px-6 py-3 bg-white text-red-600 rounded-xl font-bold hover:shadow-xl transition-all">
                    📋 Copiar Resultado
                </button>
            </div>
        `;
    },
    
    renderInstructions() {
        return `
            <div class="mt-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                <h3 class="text-lg font-bold text-purple-900 mb-3 text-center">📖 Como Jogar</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
                    <div class="flex items-start gap-2">
                        <span>✔</span>
                        <span>Clique nas letras para adivinhar</span>
                    </div>
                    <div class="flex items-start gap-2">
                        <span>✔</span>
                        <span>Use ${this.maxHints} dicas estrategicamente</span>
                    </div>
                    <div class="flex items-start gap-2">
                        <span>✔</span>
                        <span>Você tem apenas ${this.maxWrongGuesses} chances</span>
                    </div>
                    <div class="flex items-start gap-2">
                        <span>✔</span>
                        <span>Nova palavra a cada 24 horas</span>
                    </div>
                </div>
            </div>
        `;
    },
    
    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    
    init() {
        console.log('🎯 Inicializando Forca...');
        
        try {
            const dailyWord = this.getDailyWord();
            
            if (!dailyWord?.word) {
                console.error('❌ Palavra inválida');
                this.isReady = false;
                return;
            }
            
            this.currentWord = dailyWord.word;
            this.currentHint = dailyWord.hint;
            this.currentDifficulty = dailyWord.difficulty || 'medium';
            
            const lastPlayed = Utils.loadData('forca_last_played');
            const today = this.getToday();
            
            if (lastPlayed !== today) {
                this.resetGame();
            } else {
                this.loadGameState();
            }
            
            this.isReady = true;
            console.log('✅ Forca inicializado!');
            
            Router?.render();
        } catch (error) {
            console.error('❌ Erro:', error);
            this.isReady = false;
            Utils.showNotification?.('❌ Erro ao carregar Forca', 'error');
        }
    },
    
    // ============================================
    // LÓGICA DO JOGO
    // ============================================
    
    guessLetter(letter) {
        if (!this.currentWord || this.gameOver || this.guessedLetters.includes(letter)) return;
        
        if (!this.timeStarted) {
            this.timeStarted = Date.now();
        }
        
        this.guessedLetters.push(letter);
        
        if (!this.currentWord.includes(letter)) {
            this.wrongGuesses++;
            if (this.wrongGuesses >= this.maxWrongGuesses) {
                this.endGame(false);
            } else {
                Utils.showNotification?.('❌ Letra errada!', 'error');
            }
        } else {
            const count = this.currentWord.split(letter).length - 1;
            Utils.showNotification?.(`✅ Acertou! (${count}x "${letter}")`, 'success');
            
            const wordDisplay = this.getWordDisplay().replace(/ /g, '');
            if (!wordDisplay.includes('_')) {
                this.endGame(true);
            }
        }
        
        this.saveGameState();
        Router?.render();
    },
    
    useHint() {
        if (this.hintsUsed >= this.maxHints || this.gameOver) {
            Utils.showNotification?.('❌ Sem dicas disponíveis!', 'error');
            return;
        }
        
        const hiddenIndices = [];
        this.currentWord.split('').forEach((letter, idx) => {
            if (!this.guessedLetters.includes(letter) && letter !== ' ' && letter !== '-') {
                hiddenIndices.push(idx);
            }
        });
        
        if (hiddenIndices.length === 0) {
            Utils.showNotification?.('❌ Todas as letras já foram reveladas!', 'error');
            return;
        }
        
        const randomIdx = hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];
        const letterToReveal = this.currentWord[randomIdx];
        
        this.revealedPositions.push(randomIdx);
        this.guessedLetters.push(letterToReveal);
        this.hintsUsed++;
        
        Utils.showNotification?.(`💡 Dica usada! Letra revelada: "${letterToReveal}"`, 'info');
        
        const wordDisplay = this.getWordDisplay().replace(/ /g, '');
        if (!wordDisplay.includes('_')) {
            this.endGame(true);
        }
        
        this.saveGameState();
        Router?.render();
    },
    
    endGame(won) {
        this.gameOver = true;
        this.won = won;
        this.timeTaken = Math.floor((Date.now() - this.timeStarted) / 1000);
        
        const message = won ? '🎉 Parabéns! Você venceu! にゃん~' : '😿 Acabaram as tentativas! A palavra era: ' + this.currentWord;
        Utils.showNotification?.(message, won ? 'success' : 'error');
        
        this.saveGameState();
    },
    
    // ============================================
    // UTILITÁRIOS
    // ============================================
    
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
        
        return `Próxima em ${hours}h ${minutes}min`;
    },
    
    getWordDisplay() {
        if (!this.currentWord) return '_____';
        
        return this.currentWord.split('').map(letter => {
            if (letter === ' ' || letter === '-') return letter;
            return this.guessedLetters.includes(letter) ? letter : '_';
        }).join(' ');
    },
    
    getWrongLetters() {
        if (!this.currentWord) return [];
        return this.guessedLetters.filter(letter => !this.currentWord.includes(letter));
    },
    
    getKeyStatus(key) {
        if (key === '⌫') return null;
        
        let status = null;
        this.guessedLetters.forEach(letter => {
            if (letter === key) {
                status = this.currentWord.includes(letter) ? 'correct' : 'absent';
            }
        });
        return status;
    },
    
    calculateScore() {
        let score = 1000;
        score -= this.wrongGuesses * 150;
        score -= this.hintsUsed * 200;
        
        const difficultyBonus = {
            'easy': 0,
            'medium': 300,
            'hard': 600,
            'insane': 1000
        };
        score += difficultyBonus[this.currentDifficulty] || 0;
        
        if (this.timeTaken < 300) {
            score += 200;
        }
        
        return Math.max(0, score);
    },
    
    shareResult() {
        if (!this.currentWord) {
            Utils.showNotification?.('⚠️ Erro ao compartilhar resultado', 'error');
            return;
        }
        
        const today = this.getToday();
        const config = this.difficultyConfig[this.currentDifficulty];
        
        let text = `Forca ${today}\n`;
        text += `⚡ Dificuldade: ${config.label}\n`;
        
        if (this.won) {
            const score = this.calculateScore();
            text += `✅ Venceu!\n`;
            text += `❌ Erros: ${this.wrongGuesses}/${this.maxWrongGuesses}\n`;
            text += `💡 Dicas: ${this.hintsUsed}/${this.maxHints}\n`;
            text += `⏱️ Tempo: ${Math.floor(this.timeTaken / 60)}:${String(this.timeTaken % 60).padStart(2, '0')}\n`;
            text += `⭐ Pontuação: ${score}\n`;
        } else {
            text += `❌ Perdeu\n`;
            text += `Palavra: ${this.currentWord}\n`;
        }
        
        text += `💖 ${this.maxWrongGuesses - this.wrongGuesses}/${this.maxWrongGuesses} vidas\n\n`;
        text += 'Jogado em NyanTools にゃん~ 🐱';
        
        Utils.copyToClipboard?.(text);
    },
    
    saveGameState() {
        if (!this.currentWord) return;
        
        Utils.saveData('forca_state', {
            guessedLetters: this.guessedLetters,
            wrongGuesses: this.wrongGuesses,
            gameOver: this.gameOver,
            won: this.won,
            currentWord: this.currentWord,
            hintsUsed: this.hintsUsed,
            revealedPositions: this.revealedPositions,
            timeStarted: this.timeStarted,
            timeTaken: this.timeTaken
        });
        Utils.saveData('forca_last_played', this.getToday());
    },
    
    loadGameState() {
        if (!this.currentWord) return;
        
        const state = Utils.loadData('forca_state');
        if (state && state.currentWord === this.currentWord) {
            this.guessedLetters = state.guessedLetters || [];
            this.wrongGuesses = state.wrongGuesses || 0;
            this.gameOver = state.gameOver || false;
            this.won = state.won || false;
            this.hintsUsed = state.hintsUsed || 0;
            this.revealedPositions = state.revealedPositions || [];
            this.timeStarted = state.timeStarted || null;
            this.timeTaken = state.timeTaken || 0;
        } else {
            this.resetGame();
        }
    },
    
    resetGame() {
        this.guessedLetters = [];
        this.wrongGuesses = 0;
        this.gameOver = false;
        this.won = false;
        this.hintsUsed = 0;
        this.revealedPositions = [];
        this.timeStarted = null;
        this.timeTaken = 0;
        this.saveGameState();
    },
    
    handleBackspace() {
        // Placeholder para compatibilidade com teclado
    }
};

window.Forca = Forca;