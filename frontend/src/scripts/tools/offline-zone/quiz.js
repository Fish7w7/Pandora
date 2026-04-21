

const QuizDiario = {

    QUESTIONS_PER_DAY: 10,
    _current: 0,
    _score: 0,
    _answered: false,
    _questions: [],
    _phase: 'intro',

    _bank: [
    { q: "Qual linguagem de programação foi criada por Guido van Rossum?", o: ["Java", "Python", "Ruby", "Perl"], a: 1, e: "Python foi criado por Guido van Rossum e lançado no início dos anos 1990." },
    { q: "O que significa a sigla HTML?", o: ["HyperText Markup Language", "High Transfer Markup Language", "HyperText Machine Learning", "Hard Text Modeling Language"], a: 0, e: "HTML é a linguagem de marcação usada para estruturar páginas web." },
    { q: "Quantos bits tem um byte?", o: ["4", "16", "8", "32"], a: 2, e: "Um byte é formado por 8 bits." },
    { q: "Qual empresa popularizou o sistema operacional Android?", o: ["Apple", "Microsoft", "Google", "Samsung"], a: 2, e: "O Android é desenvolvido pelo Google." },
    { q: "O que é um algoritmo?", o: ["Um tipo de vírus", "Sequência de instruções para resolver um problema", "Hardware de computador", "Linguagem de banco de dados"], a: 1, e: "Algoritmo é um conjunto de passos usados para resolver um problema." },
    { q: "O que significa CPU?", o: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Core Processing Update"], a: 0, e: "CPU é a Unidade Central de Processamento." },
    { q: "Quem criou a linguagem JavaScript?", o: ["Tim Berners-Lee", "Linus Torvalds", "Brendan Eich", "Bill Gates"], a: 2, e: "JavaScript foi criado por Brendan Eich em 1995." },
    { q: "O que significa software open source?", o: ["Software pago", "Software com código-fonte aberto", "Software exclusivo para empresas", "Software sem internet"], a: 1, e: "Open source indica que o código-fonte pode ser acessado e estudado." },
    { q: "Qual sistema de controle de versão é o mais usado atualmente?", o: ["SVN", "Git", "Mercurial", "Bazaar"], a: 1, e: "Git é o sistema de versionamento mais popular no desenvolvimento moderno." },
    { q: "Qual linguagem é amplamente usada para estilizar páginas web?", o: ["SQL", "Python", "CSS", "C"], a: 2, e: "CSS é usado para definir aparência e layout de páginas web." },

    { q: "Qual é o elemento mais abundante no universo?", o: ["Oxigênio", "Hélio", "Carbono", "Hidrogênio"], a: 3, e: "O hidrogênio é o elemento mais abundante no universo." },
    { q: "Quantos ossos tem o corpo humano adulto?", o: ["206", "180", "250", "300"], a: 0, e: "Um adulto normalmente possui 206 ossos." },
    { q: "Qual é a velocidade da luz no vácuo?", o: ["300.000 km/s", "150.000 km/s", "450.000 km/s", "200.000 km/s"], a: 0, e: "A luz viaja a aproximadamente 300 mil km/s no vácuo." },
    { q: "Qual planeta é conhecido como planeta vermelho?", o: ["Vênus", "Júpiter", "Marte", "Saturno"], a: 2, e: "Marte é chamado de planeta vermelho por causa do óxido de ferro em sua superfície." },
    { q: "O que é fotossíntese?", o: ["Processo de respiração animal", "Conversão de luz em energia pelas plantas", "Decomposição de matéria orgânica", "Reprodução das algas"], a: 1, e: "Na fotossíntese, plantas usam luz para produzir energia química." },
    { q: "Qual é o maior planeta do Sistema Solar?", o: ["Saturno", "Netuno", "Terra", "Júpiter"], a: 3, e: "Júpiter é o maior planeta do Sistema Solar." },
    { q: "Quantos cromossomos tem uma célula humana normal?", o: ["23", "46", "48", "44"], a: 1, e: "As células humanas têm 46 cromossomos, organizados em 23 pares." },
    { q: "Qual gás as plantas absorvem durante a fotossíntese?", o: ["Oxigênio", "Nitrogênio", "Dióxido de carbono", "Metano"], a: 2, e: "As plantas absorvem dióxido de carbono e liberam oxigênio." },
    { q: "O que estuda a Astronomia?", o: ["Composição química dos minerais", "Corpos celestes e fenômenos do universo", "Movimentos das placas tectônicas", "Comportamento dos oceanos"], a: 1, e: "Astronomia estuda estrelas, planetas, galáxias e outros fenômenos do universo." },
    { q: "Qual é o símbolo químico do ouro?", o: ["Ag", "Fe", "Au", "Cu"], a: 2, e: "O símbolo do ouro é Au." },

    { q: "Qual é o maior país do mundo em área?", o: ["China", "Canadá", "Brasil", "Rússia"], a: 3, e: "A Rússia é o maior país do mundo em extensão territorial." },
    { q: "Qual é a capital do Japão?", o: ["Osaka", "Tóquio", "Quioto", "Hiroshima"], a: 1, e: "Tóquio é a capital do Japão." },
    { q: "Em qual continente está localizado o Egito?", o: ["Ásia", "Europa", "América", "África"], a: 3, e: "O Egito fica no nordeste da África." },
    { q: "Qual é o oceano mais profundo do mundo?", o: ["Atlântico", "Índico", "Ártico", "Pacífico"], a: 3, e: "O Oceano Pacífico é o mais profundo do planeta." },
    { q: "Qual é a capital da Austrália?", o: ["Sydney", "Melbourne", "Brisbane", "Camberra"], a: 3, e: "Camberra é a capital da Austrália." },
    { q: "Qual é o deserto quente mais famoso e extenso do mundo?", o: ["Gobi", "Saara", "Atacama", "Kalahari"], a: 1, e: "O Saara é o maior deserto quente do mundo." },
    { q: "Qual montanha é a mais alta do mundo acima do nível do mar?", o: ["K2", "Monte Branco", "Aconcágua", "Everest"], a: 3, e: "O Monte Everest é o ponto mais alto da Terra acima do nível do mar." },
    { q: "Quantos estados tem o Brasil?", o: ["24", "27", "26", "28"], a: 1, e: "O Brasil tem 26 estados e 1 Distrito Federal, totalizando 27 unidades federativas." },
    { q: "Qual é a capital do Brasil?", o: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador"], a: 2, e: "Brasília é a capital do Brasil desde 1960." },
    { q: "Qual é a maior floresta tropical do mundo?", o: ["Congo", "Daintree", "Mata Atlântica", "Amazônia"], a: 3, e: "A Amazônia é a maior floresta tropical do planeta." },

    { q: "Em que ano ocorreu a Revolução Francesa?", o: ["1776", "1815", "1789", "1804"], a: 2, e: "A Revolução Francesa começou em 1789." },
    { q: "Quem foi o primeiro presidente dos Estados Unidos?", o: ["Abraham Lincoln", "Thomas Jefferson", "Benjamin Franklin", "George Washington"], a: 3, e: "George Washington foi o primeiro presidente dos EUA." },
    { q: "Em que ano o Brasil proclamou sua independência?", o: ["1808", "1822", "1889", "1500"], a: 1, e: "A independência do Brasil foi proclamada em 1822." },
    { q: "Quem construiu as pirâmides de Gizé?", o: ["Romanos", "Gregos", "Egípcios", "Persas"], a: 2, e: "As pirâmides de Gizé foram construídas pelos antigos egípcios." },
    { q: "Em que ano terminou a Segunda Guerra Mundial?", o: ["1943", "1944", "1946", "1945"], a: 3, e: "A Segunda Guerra Mundial terminou em 1945." },
    { q: "Quem chegou ao Brasil em 1500 na expedição portuguesa tradicionalmente ensinada nas escolas?", o: ["Cristóvão Colombo", "Vasco da Gama", "Pedro Álvares Cabral", "Américo Vespúcio"], a: 2, e: "Pedro Álvares Cabral chegou ao território brasileiro em 1500." },
    { q: "O que foi a Guerra Fria?", o: ["Conflito armado direto entre EUA e URSS", "Tensão política e ideológica entre EUA e URSS", "Guerra no Ártico", "Conflito apenas econômico"], a: 1, e: "A Guerra Fria foi um período de tensão política, militar e ideológica entre EUA e URSS." },
    { q: "Em que ano caiu o Muro de Berlim?", o: ["1991", "1987", "1985", "1989"], a: 3, e: "O Muro de Berlim caiu em 1989." },
    { q: "Quem foi Napoleão Bonaparte?", o: ["Rei da França", "Imperador francês e líder militar", "Czar da Rússia", "Presidente dos EUA"], a: 1, e: "Napoleão foi um importante líder militar e imperador francês." },
    { q: "Qual civilização criou os Jogos Olímpicos originais?", o: ["Romana", "Persa", "Egípcia", "Grega"], a: 3, e: "Os Jogos Olímpicos surgiram na Grécia Antiga." },

    { q: "Quem criou o personagem Sherlock Holmes?", o: ["Agatha Christie", "Arthur Conan Doyle", "Edgar Allan Poe", "Charles Dickens"], a: 1, e: "Sherlock Holmes foi criado por Arthur Conan Doyle." },
    { q: "Qual artista lançou o álbum 'Thriller'?", o: ["Prince", "Michael Jackson", "Madonna", "Whitney Houston"], a: 1, e: "'Thriller' é um dos álbuns mais famosos de Michael Jackson." },
    { q: "De onde é originário o anime?", o: ["Coreia do Sul", "China", "Japão", "Tailândia"], a: 2, e: "Anime é a animação associada ao Japão." },
    { q: "Qual é o jogo eletrônico mais vendido de todos os tempos em muitas listas populares?", o: ["Minecraft", "Tetris", "GTA V", "Pac-Man"], a: 0, e: "Minecraft aparece com frequência como o jogo mais vendido em rankings modernos." },
    { q: "Quem escreveu 'Dom Quixote'?", o: ["Miguel de Cervantes", "Lope de Vega", "Francisco de Quevedo", "Luís de Camões"], a: 0, e: "'Dom Quixote' foi escrito por Miguel de Cervantes." },
    { q: "Quem pintou a Mona Lisa?", o: ["Michelangelo", "Rafael", "Leonardo da Vinci", "Botticelli"], a: 2, e: "A Mona Lisa é uma obra de Leonardo da Vinci." },
    { q: "Qual é o nome do protagonista da série de J.K. Rowling?", o: ["Hermione Granger", "Ron Weasley", "Harry Potter", "Neville Longbottom"], a: 2, e: "Harry Potter é o protagonista da famosa saga de fantasia." },
    { q: "Quem fundou o Facebook?", o: ["Jack Dorsey", "Elon Musk", "Bill Gates", "Mark Zuckerberg"], a: 3, e: "Mark Zuckerberg fundou o Facebook em 2004." },
    { q: "Quem escreveu 'O Senhor dos Anéis'?", o: ["C.S. Lewis", "George R.R. Martin", "J.R.R. Tolkien", "Terry Pratchett"], a: 2, e: "J.R.R. Tolkien é o autor de 'O Senhor dos Anéis'." },
    { q: "Qual é a obra mais famosa de Machado de Assis entre as alternativas abaixo?", o: ["O Cortiço", "Dom Casmurro", "Iracema", "O Guarani"], a: 1, e: "'Dom Casmurro' é uma das obras mais conhecidas de Machado de Assis." },

    { q: "Qual país ganhou mais Copas do Mundo de futebol masculino?", o: ["Alemanha", "Argentina", "Itália", "Brasil"], a: 3, e: "O Brasil é a seleção com mais títulos de Copa do Mundo masculina." },
    { q: "Quantos jogadores tem um time de futebol em campo?", o: ["9", "10", "11", "12"], a: 2, e: "Cada equipe tem 11 jogadores em campo." },
    { q: "Em qual cidade foram realizados os Jogos Olímpicos de 2016?", o: ["São Paulo", "Buenos Aires", "Rio de Janeiro", "Brasília"], a: 2, e: "Os Jogos Olímpicos de 2016 aconteceram no Rio de Janeiro." },
    { q: "Qual esporte usa um volante, também chamado de shuttlecock?", o: ["Tênis", "Squash", "Badminton", "Pingue-pongue"], a: 2, e: "O badminton usa um volante em vez de bola." },
    { q: "Qual é o esporte mais popular do mundo?", o: ["Basquete", "Cricket", "Futebol", "Tênis"], a: 2, e: "O futebol é considerado o esporte mais popular do planeta." },
    { q: "Em qual esporte existe o termo 'Grand Slam' de forma muito conhecida?", o: ["Futebol", "Golfe", "Tênis", "Natação"], a: 2, e: "No tênis, Grand Slam se refere aos quatro torneios mais importantes." },
    { q: "Quantos anéis tem o símbolo olímpico?", o: ["4", "6", "5", "7"], a: 2, e: "O símbolo olímpico possui 5 anéis." },
    { q: "Qual é o apelido mais famoso da seleção brasileira de futebol?", o: ["Os Guerreiros", "Canarinho", "A Amarela", "Verde e Amarelo"], a: 1, e: "A seleção brasileira é popularmente chamada de Canarinho." },
    { q: "Quem é frequentemente lembrado como um dos maiores jogadores de basquete da história?", o: ["Kobe Bryant", "LeBron James", "Magic Johnson", "Michael Jordan"], a: 3, e: "Michael Jordan é um dos nomes mais icônicos da história do basquete." },
    { q: "Em qual esporte Pelé ficou mundialmente famoso?", o: ["Basquete", "Tênis", "Futebol", "Vôlei"], a: 2, e: "Pelé é um dos maiores nomes da história do futebol." },

    { q: "Qual animal não consegue pular?", o: ["Canguru", "Hipopótamo", "Elefante", "Gorila"], a: 2, e: "O elefante é conhecido por não conseguir pular." },
    { q: "Quantas câmaras tem o coração humano?", o: ["2", "3", "4", "6"], a: 2, e: "O coração humano possui 4 câmaras." },
    { q: "Qual é o animal terrestre mais rápido?", o: ["Leopardo", "Guepardo", "Leão", "Cavalo"], a: 1, e: "O guepardo é o animal terrestre mais rápido." },
    { q: "Quantas pernas tem uma aranha?", o: ["6", "8", "10", "12"], a: 1, e: "Aranhas possuem 8 pernas." },
    { q: "Qual é o único mamífero com voo verdadeiro?", o: ["Esquilo-voador", "Morcego", "Planador", "Colugo"], a: 1, e: "O morcego é o único mamífero capaz de voo verdadeiro." },
    { q: "Quantas cores são tradicionalmente associadas ao arco-íris?", o: ["5", "6", "7", "8"], a: 2, e: "Tradicionalmente, o arco-íris é descrito com 7 cores." },
    { q: "O que é DNA?", o: ["Proteína muscular", "Hormônio digestivo", "Molécula que carrega informação genética", "Vitamina essencial"], a: 2, e: "O DNA armazena a informação genética dos seres vivos." },
    { q: "Qual é o metal mais leve?", o: ["Alumínio", "Titânio", "Lítio", "Magnésio"], a: 2, e: "O lítio é considerado o metal mais leve." },
    { q: "Quanto tempo dura aproximadamente um dia em Marte?", o: ["22h", "26h", "24h 37min", "28h"], a: 2, e: "Um dia marciano dura cerca de 24 horas e 37 minutos." },
    { q: "Qual fruta entre as alternativas é famosa por ter muita vitamina C?", o: ["Laranja", "Acerola", "Limão", "Morango"], a: 1, e: "A acerola é muito rica em vitamina C." },

    { q: "Em que ano foi fundada a cidade de São Paulo?", o: ["1554", "1600", "1500", "1822"], a: 0, e: "São Paulo foi fundada em 1554." },
    { q: "Qual é o bioma brasileiro mais lembrado pela grande perda de cobertura original?", o: ["Cerrado", "Pampa", "Mata Atlântica", "Caatinga"], a: 2, e: "A Mata Atlântica sofreu intensa devastação ao longo da história." },
    { q: "Quem foi Tiradentes?", o: ["Militar e mártir da Inconfidência Mineira", "Primeiro presidente do Brasil", "Herói da Guerra do Paraguai", "Descobridor do Brasil"], a: 0, e: "Tiradentes foi um dos principais nomes da Inconfidência Mineira." },
    { q: "Qual é o maior estado do Brasil em área?", o: ["Pará", "Minas Gerais", "Mato Grosso", "Amazonas"], a: 3, e: "O Amazonas é o maior estado brasileiro em extensão territorial." },
    { q: "Qual é a moeda atual do Brasil?", o: ["Cruzeiro", "Real", "Cruzado", "Centavo"], a: 1, e: "A moeda oficial do Brasil é o real." },
    { q: "Quem foi o primeiro presidente do Brasil?", o: ["Getúlio Vargas", "Dom Pedro II", "Deodoro da Fonseca", "Floriano Peixoto"], a: 2, e: "Deodoro da Fonseca foi o primeiro presidente do Brasil." },
    { q: "Qual é a língua oficial do Brasil?", o: ["Espanhol", "Tupi-Guarani", "Português", "Inglês"], a: 2, e: "A língua oficial do Brasil é o português." },
    { q: "Em qual estado brasileiro o Pantanal é mais associado?", o: ["Amazonas", "Pará", "Goiás", "Mato Grosso do Sul"], a: 3, e: "O Pantanal é fortemente associado ao Mato Grosso do Sul, embora também se estenda por outras áreas." },
    { q: "Qual festa popular brasileira é famosa pelos desfiles de escolas de samba?", o: ["Festa Junina", "Carnaval", "Bumba meu boi", "Círio de Nazaré"], a: 1, e: "O Carnaval é uma das festas mais famosas do Brasil." },
    { q: "Qual cidade brasileira é conhecida pelo Cristo Redentor?", o: ["Salvador", "São Paulo", "Rio de Janeiro", "Recife"], a: 2, e: "O Cristo Redentor fica no Rio de Janeiro." },

    { q: "Quem pintou o teto da Capela Sistina?", o: ["Rafael", "Leonardo da Vinci", "Michelangelo", "Botticelli"], a: 2, e: "Michelangelo foi o responsável pela pintura do teto da Capela Sistina." },
    { q: "Quem compôs a 5ª Sinfonia?", o: ["Mozart", "Bach", "Chopin", "Beethoven"], a: 3, e: "A 5ª Sinfonia é uma das obras mais famosas de Beethoven." },
    { q: "Qual movimento artístico é associado a Salvador Dalí?", o: ["Impressionismo", "Cubismo", "Surrealismo", "Expressionismo"], a: 2, e: "Salvador Dalí é um dos maiores nomes do surrealismo." },
    { q: "De onde é originária a pizza moderna?", o: ["EUA", "França", "Grécia", "Itália"], a: 3, e: "A pizza moderna ficou famosa em Nápoles, na Itália." },
    { q: "Qual é o ingrediente principal do guacamole?", o: ["Tomate", "Abacate", "Pimenta", "Limão"], a: 1, e: "O guacamole é preparado principalmente com abacate." },
    { q: "Quantas calorias tem 1 grama de gordura?", o: ["4", "7", "9", "11"], a: 2, e: "Cada grama de gordura fornece 9 calorias." },
    { q: "Qual bebida é uma das mais consumidas no mundo depois da água?", o: ["Café", "Refrigerante", "Chá", "Suco"], a: 2, e: "O chá está entre as bebidas mais consumidas do mundo." },
    { q: "Qual doce brasileiro é feito com leite condensado e chocolate?", o: ["Quindim", "Brigadeiro", "Pé de moleque", "Beijinho"], a: 1, e: "O brigadeiro é um dos doces mais populares do Brasil." },
    { q: "Qual instrumento musical tem teclas pretas e brancas?", o: ["Violino", "Flauta", "Piano", "Tambor"], a: 2, e: "O piano é conhecido por seu teclado de teclas brancas e pretas." },
    { q: "Qual gênero musical nasceu na Jamaica?", o: ["Samba", "Reggae", "Jazz", "Tango"], a: 1, e: "O reggae surgiu na Jamaica e se popularizou mundialmente." }
].map((entry, index) => ({
    id: entry.id || `quiz_q_${String(index + 1).padStart(3, '0')}`,
    ...entry,
})),

    STORAGE_KEY: 'nyan_daily_quiz_v3111',
    LEGACY_RESULT_KEY: 'quiz_today',
    ANSWER_REVEAL_MS: 1800,
    REPEAT_WINDOW_DAYS: 7,
    HISTORY_WINDOW_DAYS: 30,
    REMOTE_SYNC_DEBOUNCE: 900,
    _advanceTimer: null,
    _remoteSyncTimer: null,
    _selectedIndex: null,
    _lastCorrect: false,

    _formatDateKey(date = new Date()) {
        const d = new Date(date);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    },

    _getToday() {
        return this._formatDateKey(new Date());
    },

    _getLegacyTodayKey() {
        const d = new Date();
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    },

    _parseDateKey(dateKey = '') {
        const match = String(dateKey || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!match) return null;
        const [, y, m, d] = match.map(Number);
        const parsed = new Date(y, m - 1, d);
        parsed.setHours(0, 0, 0, 0);
        return parsed;
    },

    _daysBetween(fromKey = '', toKey = '') {
        const from = this._parseDateKey(fromKey);
        const to = this._parseDateKey(toKey);
        if (!from || !to) return Number.POSITIVE_INFINITY;
        return Math.round((to.getTime() - from.getTime()) / 86400000);
    },

    _seededRandom(seed) {
        let h = 0;
        for (let i = 0; i < seed.length; i++) h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
        return () => { h ^= h << 13; h ^= h >> 17; h ^= h << 5; return (h >>> 0) / 0x100000000; };
    },

    _getTodayQuestions() {
        const rng = this._seededRandom(this._getToday() + 'quiz');
        const shuffled = [...this._bank].sort(() => rng() - 0.5);
        return shuffled.slice(0, this.QUESTIONS_PER_DAY);
    },

    _getTodayResult() {
        const saved = Utils.loadData('quiz_today');
        if (!saved || saved.date !== this._getToday()) return null;
        return saved;
    },

    _saveTodayResult(score) {
        Utils.saveData('quiz_today', { date: this._getToday(), score });
        const best = Utils.loadData('quiz_highscore') || 0;
        const isNewRecord = score > best;
        // checkRecord ANTES de salvar — economy compara com valor atual no storage
        const _quizBest = Utils.loadData('quiz_highscore') || 0;
        window.Economy?.checkRecord?.('quiz_highscore', score);
        setTimeout(() => window.ShareToFeed?.showToast?.('quiz', score, { isRecord: score > _quizBest }), 500);
        if (isNewRecord) Utils.saveData('quiz_highscore', score);
        if (score === 10) window.Economy?.grant?.('quiz_perfect');
        window.Economy?.grant?.('play_game');
        window.Missions?.track?.({ event: 'quiz_finish', score });
    },

    _persistedDefaults() {
        return { state: null, history: {}, updatedAt: 0 };
    },

    _normalizeHistory(history = {}) {
        const today = this._getToday();
        const normalized = {};

        if (!history || typeof history !== 'object') return normalized;

        Object.entries(history).forEach(([dateKey, ids]) => {
            if (!Array.isArray(ids)) return;
            const diff = this._daysBetween(dateKey, today);
            if (!Number.isFinite(diff) || diff < 0 || diff > this.HISTORY_WINDOW_DAYS) return;

            const uniqueIds = [...new Set(ids
                .map((id) => String(id || '').trim())
                .filter((id) => !!this._getQuestionById(id)))];

            if (uniqueIds.length > 0) normalized[dateKey] = uniqueIds;
        });

        return normalized;
    },

    _normalizeState(state = null) {
        if (!state || typeof state !== 'object') return null;

        const questionIds = [...new Set((Array.isArray(state.questionIds) ? state.questionIds : [])
            .map((id) => String(id || '').trim())
            .filter((id) => !!this._getQuestionById(id)))].slice(0, this.QUESTIONS_PER_DAY);

        if (questionIds.length === 0) return null;

        const answeredIds = [...new Set((Array.isArray(state.answeredIds) ? state.answeredIds : [])
            .map((id) => String(id || '').trim())
            .filter((id) => !!this._getQuestionById(id)))];

        const status = String(state.status || '') === 'completed' ? 'completed' : 'playing';
        const maxCurrent = status === 'completed'
            ? this.QUESTIONS_PER_DAY
            : Math.max(0, questionIds.length - 1);

        return {
            date: String(state.date || '').trim(),
            status,
            questionIds,
            answeredIds,
            current: Math.min(maxCurrent, Math.max(0, Math.floor(Number(state.current || 0)))),
            score: Math.max(0, Math.min(this.QUESTIONS_PER_DAY, Math.floor(Number(state.score || 0)))),
            answered: status !== 'completed' && state.answered === true,
            selectedIndex: Number.isInteger(state.selectedIndex) ? state.selectedIndex : null,
            lastCorrect: state.lastCorrect === true,
            revealedAt: Math.max(0, Number(state.revealedAt || 0)),
            completedAt: Math.max(0, Number(state.completedAt || 0)),
            updatedAt: Math.max(0, Number(state.updatedAt || 0)),
        };
    },

    _normalizePersisted(raw = null) {
        const base = this._persistedDefaults();
        const data = raw && typeof raw === 'object' ? { ...base, ...raw } : base;
        data.history = this._normalizeHistory(data.history);
        data.state = this._normalizeState(data.state);
        data.updatedAt = Math.max(0, Number(data.updatedAt || 0), Number(data.state?.updatedAt || 0));
        return data;
    },

    _getQuestionById(id = '') {
        const questionId = String(id || '').trim();
        return this._bank.find((question) => question.id === questionId) || null;
    },

    _selectQuestionsForToday(history = {}) {
        const today = this._getToday();
        const recentIds = new Set();

        Object.entries(this._normalizeHistory(history)).forEach(([dateKey, ids]) => {
            const diff = this._daysBetween(dateKey, today);
            if (diff <= 0 || diff > this.REPEAT_WINDOW_DAYS) return;
            ids.forEach((id) => recentIds.add(id));
        });

        const rng = this._seededRandom(`${today}:quiz_rotation`);
        const ordered = [...this._bank].sort((a, b) => {
            const diff = rng() - 0.5;
            if (diff !== 0) return diff;
            return a.id.localeCompare(b.id);
        });

        const filtered = ordered.filter((question) => !recentIds.has(question.id));
        const pool = filtered.length >= this.QUESTIONS_PER_DAY
            ? filtered
            : [...filtered, ...ordered.filter((question) => !filtered.some((entry) => entry.id === question.id))];

        return pool.slice(0, this.QUESTIONS_PER_DAY);
    },

    _loadPersisted() {
        const persisted = this._normalizePersisted(Utils.loadData(this.STORAGE_KEY));
        const today = this._getToday();
        let changed = false;

        const legacy = Utils.loadData(this.LEGACY_RESULT_KEY);
        if ((legacy?.date === today || legacy?.date === this._getLegacyTodayKey()) && !persisted.state) {
            const questionIds = this._selectQuestionsForToday(persisted.history).map((question) => question.id);
            persisted.state = {
                date: today,
                status: 'completed',
                questionIds,
                answeredIds: [...questionIds],
                current: this.QUESTIONS_PER_DAY,
                score: Math.max(0, Math.min(this.QUESTIONS_PER_DAY, Math.floor(Number(legacy.score || 0)))),
                answered: false,
                selectedIndex: null,
                lastCorrect: false,
                revealedAt: 0,
                completedAt: Date.now(),
                updatedAt: Date.now(),
            };
            persisted.history[today] = [...questionIds];
            changed = true;
        }

        if (persisted.state?.date && persisted.state.date !== today) {
            const historyIds = persisted.state.answeredIds?.length > 0
                ? persisted.state.answeredIds
                : persisted.state.status === 'completed'
                    ? persisted.state.questionIds
                    : [];

            if (historyIds.length > 0) {
                persisted.history[persisted.state.date] = [...new Set(historyIds)];
            }
            persisted.state = null;
            changed = true;
        }

        const normalizedHistory = this._normalizeHistory(persisted.history);
        if (JSON.stringify(normalizedHistory) !== JSON.stringify(persisted.history)) {
            persisted.history = normalizedHistory;
            changed = true;
        }

        if (changed) {
            this._savePersistedState(persisted, { skipSync: true });
        }

        return this._normalizePersisted(persisted);
    },

    _savePersistedState(persisted, options = {}) {
        const normalized = this._normalizePersisted(persisted);
        if (!options.preserveUpdatedAt) {
            normalized.updatedAt = Date.now();
            if (normalized.state) normalized.state.updatedAt = normalized.updatedAt;
        }
        Utils.saveData(this.STORAGE_KEY, normalized);
        if (!options.skipSync) this._scheduleRemoteSync();
        return normalized;
    },

    _scheduleRemoteSync() {
        if (!window.NyanAuth?._syncLocalProfile || !window.NyanAuth?.isOnline?.() || !window.NyanFirebase?.isReady?.()) {
            return;
        }
        if (this._remoteSyncTimer) clearTimeout(this._remoteSyncTimer);
        this._remoteSyncTimer = setTimeout(() => {
            this._remoteSyncTimer = null;
            window.NyanAuth._syncLocalProfile({ includeEconomy: false }).catch(() => {});
        }, this.REMOTE_SYNC_DEBOUNCE);
    },

    getCloudPayload() {
        return this._loadPersisted();
    },

    applyRemoteSync(remoteData, options = {}) {
        if (!remoteData || typeof remoteData !== 'object') return false;

        const local = this._loadPersisted();
        const remote = this._normalizePersisted(remoteData);
        const localStamp = Number(local.updatedAt || 0);
        const remoteStamp = Number(remote.updatedAt || 0);
        const shouldAdoptRemote = options.force === true
            || (!local.state && Object.keys(local.history).length === 0)
            || remoteStamp > localStamp
            || (remote.state?.status === 'completed' && local.state?.status !== 'completed' && remote.state?.date === this._getToday());

        const mergedHistory = { ...local.history };
        Object.entries(remote.history || {}).forEach(([dateKey, ids]) => {
            mergedHistory[dateKey] = [...new Set([...(mergedHistory[dateKey] || []), ...(ids || [])])];
        });

        const next = shouldAdoptRemote
            ? { state: remote.state, history: mergedHistory, updatedAt: Math.max(remoteStamp, localStamp) }
            : { state: local.state, history: mergedHistory, updatedAt: Math.max(remoteStamp, localStamp) };

        const changed = JSON.stringify(this._normalizePersisted(local)) !== JSON.stringify(this._normalizePersisted(next));
        if (!changed) return false;

        this._savePersistedState(next, { skipSync: true, preserveUpdatedAt: true });
        this._syncRuntimeFromStorage();
        return true;
    },

    _getQuestionState() {
        return this._loadPersisted().state;
    },

    _setQuestionState(nextState, options = {}) {
        const persisted = this._loadPersisted();
        persisted.state = nextState ? {
            ...nextState,
            updatedAt: Date.now(),
        } : null;

        if (persisted.state?.status === 'completed' && persisted.state.questionIds?.length) {
            persisted.history[persisted.state.date] = [...new Set(persisted.state.questionIds)];
        }

        const saved = this._savePersistedState(persisted, options);
        this._syncRuntimeFromStorage(saved);
        return saved.state;
    },

    _syncRuntimeFromStorage(persisted = null) {
        const data = persisted ? this._normalizePersisted(persisted) : this._loadPersisted();
        const state = data.state?.date === this._getToday() ? data.state : null;

        if (!state) {
            this._questions = [];
            this._current = 0;
            this._score = 0;
            this._answered = false;
            this._selectedIndex = null;
            this._lastCorrect = false;
            this._phase = 'intro';
            return null;
        }

        this._questions = state.questionIds.map((id) => this._getQuestionById(id)).filter(Boolean);
        this._current = Math.max(0, Math.min(Number(state.current || 0), Math.max(this._questions.length - 1, 0)));
        this._score = Math.max(0, Math.min(this.QUESTIONS_PER_DAY, Number(state.score || 0)));
        this._answered = state.answered === true;
        this._selectedIndex = Number.isInteger(state.selectedIndex) ? state.selectedIndex : null;
        this._lastCorrect = state.lastCorrect === true;
        this._phase = state.status === 'completed' ? 'completed' : 'playing';
        return state;
    },

    _queueAdvance(delayMs = this.ANSWER_REVEAL_MS) {
        if (this._advanceTimer) clearTimeout(this._advanceTimer);
        this._advanceTimer = setTimeout(() => {
            this._advanceTimer = null;
            this._advanceAfterReveal();
        }, Math.max(0, delayMs));
    },

    _advanceAfterReveal(force = false) {
        const state = this._getQuestionState();
        if (!state || state.status !== 'playing' || state.answered !== true) return;

        const elapsed = Date.now() - Number(state.revealedAt || 0);
        if (!force && elapsed < this.ANSWER_REVEAL_MS) {
            this._queueAdvance(this.ANSWER_REVEAL_MS - elapsed);
            return;
        }

        const nextCurrent = Number(state.current || 0) + 1;
        if (nextCurrent >= this.QUESTIONS_PER_DAY) {
            this._completeToday(state);
            return;
        }

        this._setQuestionState({
            ...state,
            current: nextCurrent,
            answered: false,
            selectedIndex: null,
            lastCorrect: false,
            revealedAt: 0,
        });

        this._updateQuestion();
    },

    _saveTodayProgress(score, completedState = null) {
        Utils.saveData(this.LEGACY_RESULT_KEY, { date: this._getToday(), score });
        const best = Utils.loadData('quiz_highscore') || 0;
        const isNewRecord = score > best;
        const previousBest = Utils.loadData('quiz_highscore') || 0;

        if (completedState?.questionIds?.length) {
            const persisted = this._loadPersisted();
            persisted.history[this._getToday()] = [...new Set(completedState.questionIds)];
            this._savePersistedState(persisted, { preserveUpdatedAt: false });
        }

        window.Economy?.checkRecord?.('quiz_highscore', score);
        setTimeout(() => window.ShareToFeed?.showToast?.('quiz', score, { isRecord: score > previousBest }), 500);
        if (isNewRecord) Utils.saveData('quiz_highscore', score);
        if (score === 10) window.Economy?.grant?.('quiz_perfect');
        window.Economy?.grant?.('play_game');
        window.Missions?.track?.({ event: 'quiz_finish', score });
    },

    _completeToday(state = null) {
        const currentState = state || this._getQuestionState();
        if (!currentState) return;

        const completedState = {
            ...currentState,
            status: 'completed',
            answeredIds: [...new Set(currentState.questionIds || currentState.answeredIds || [])],
            current: this.QUESTIONS_PER_DAY,
            answered: false,
            selectedIndex: null,
            lastCorrect: false,
            revealedAt: 0,
            completedAt: Date.now(),
        };

        this._saveTodayProgress(completedState.score, completedState);
        this._setQuestionState(completedState);
        this._phase = 'result';

        const container = document.getElementById('tool-container');
        if (container && window.OfflineZone?.currentGame === 'quiz') {
            container.innerHTML = this._renderResult();
        }
    },

    _isDark() { return document.body.classList.contains('dark-theme'); },
    _colors() {
        const d = this._isDark();
        return {
            bg:     d ? 'rgba(255,255,255,0.04)' : '#ffffff',
            border: d ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
            text:   d ? '#f1f5f9'                : '#0f172a',
            sub:    d ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)',
            muted:  d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)',
            inner:  d ? 'rgba(255,255,255,0.05)' : '#f8fafc',
        };
    },

    render() {
        const state = this._syncRuntimeFromStorage();
        if (state?.status === 'completed') {
            return this._phase === 'result' ? this._renderResult() : this._renderAlreadyPlayed(state.score);
        }
        if (state?.status === 'playing') return this._renderQuestion();
        return this._renderIntro();
    },

    _renderIntro() {
        const c = this._colors();
        const best = Utils.loadData('quiz_highscore') || 0;
        return `
        <style>@keyframes qzFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}</style>
        <div style="max-width:560px;margin:0 auto;font-family:var(--font-body,'DM Sans',sans-serif);">
            <div style="text-align:center;margin-bottom:2rem;animation:qzFadeUp 0.35s ease both;">
                <div style="font-size:3rem;margin-bottom:0.5rem;">🧠</div>
                <h1 style="font-family:var(--font-display,'Syne',sans-serif);font-size:var(--text-2xl,2rem);font-weight:900;margin:0 0 0.4rem;
                    background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));
                    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Quiz Diário</h1>
                <p style="font-size:var(--text-sm,0.78rem);color:${c.sub};margin:0 0 1rem;">
                    10 perguntas · renova à meia-noite · mesmo quiz para todos hoje にゃん~
                </p>
                ${best > 0 ? `<div style="display:inline-flex;align-items:center;gap:0.5rem;
                    background:${c.inner};border:1px solid ${c.border};border-radius:99px;padding:0.35rem 0.875rem;">
                    <span>🏆</span>
                    <span style="font-size:var(--text-xs,0.68rem);font-weight:700;color:${c.text};">Recorde: ${best}/10</span>
                </div>` : ''}
            </div>
            <div style="background:${c.bg};border:1px solid ${c.border};border-radius:var(--radius-xl,18px);padding:1.5rem;margin-bottom:1rem;animation:qzFadeUp 0.4s ease 0.1s both;">
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.75rem;text-align:center;">
                    ${[['🗂️','Temas','Tecnologia, Ciência, História, Esportes e mais'],['⏱️','Sem tempo','Responda no seu ritmo'],['🔄','Diário','Novo quiz todo dia às 00h']].map(([icon,t,d]) => `
                    <div style="background:${c.inner};border-radius:var(--radius-lg,14px);padding:1rem;">
                        <div style="font-size:1.5rem;margin-bottom:0.4rem;">${icon}</div>
                        <div style="font-size:var(--text-xs,0.68rem);font-weight:800;color:${c.text};margin-bottom:0.2rem;">${t}</div>
                        <div style="font-size:0.6rem;color:${c.muted};line-height:1.4;">${d}</div>
                    </div>`).join('')}
                </div>
            </div>
            <button onclick="QuizDiario.start()"
                style="width:100%;padding:0.875rem;border-radius:var(--radius-lg,14px);border:none;cursor:pointer;
                    font-weight:900;font-size:var(--text-base,0.875rem);font-family:var(--font-display,'Syne',sans-serif);
                    background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));
                    color:white;letter-spacing:0.02em;transition:filter 0.15s;"
                onmouseover="this.style.filter='brightness(1.1)'" onmouseout="this.style.filter=''">
                🚀 Começar o Quiz de Hoje
            </button>
        </div>`;
    },

    _renderAlreadyPlayed(score) {
        const c = this._colors();
        const { label } = this._getRating(score);
        const now = new Date();
        const midnight = new Date(now); midnight.setHours(24,0,0,0);
        const diff = Math.round((midnight - now) / 60000);
        const h = Math.floor(diff/60), m = diff%60;
        return `
        <div style="max-width:480px;margin:0 auto;font-family:var(--font-body,'DM Sans',sans-serif);text-align:center;">
            <div style="background:${c.bg};border:1px solid ${c.border};border-radius:var(--radius-2xl,24px);padding:2rem;">
                <div style="font-size:2.5rem;margin-bottom:0.75rem;">✅</div>
                <h2 style="font-family:var(--font-display,'Syne',sans-serif);font-size:var(--text-xl,1.5rem);font-weight:900;color:${c.text};margin:0 0 0.5rem;">Você já jogou hoje!</h2>
                <div style="font-size:var(--text-sm,0.78rem);color:${c.sub};margin-bottom:1.5rem;">Sua pontuação: <strong style="color:${c.text};">${score}/10</strong> — ${label}</div>
                <div style="background:${c.inner};border-radius:var(--radius-lg,14px);padding:1rem;margin-bottom:1rem;">
                    <div style="font-size:0.65rem;font-weight:700;color:${c.muted};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.25rem;">Próximo quiz em</div>
                    <div style="font-size:1.8rem;font-weight:900;font-family:var(--font-display,'Syne',sans-serif);color:var(--theme-primary,#a855f7);">${h}h ${m}min</div>
                </div>
                <button onclick="OfflineZone.backToMenu()"
                    style="padding:0.65rem 1.5rem;border-radius:var(--radius-md,10px);border:1px solid ${c.border};
                        background:${c.inner};color:${c.text};cursor:pointer;font-weight:700;
                        font-size:var(--text-sm,0.78rem);font-family:var(--font-body,'DM Sans',sans-serif);">
                    ← Voltar
                </button>
            </div>
        </div>`;
    },

    _renderQuestion() {
        const c = this._colors();
        const q = this._questions[this._current];
        if (!q) return this._renderIntro();
        const progress = ((this._current) / this.QUESTIONS_PER_DAY) * 100;

        return `
        <style>
            @keyframes qzSlideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}
            .qz-opt{cursor:pointer;transition:background 0.15s,border-color 0.15s,transform 0.1s;}
            .qz-opt:hover{transform:translateX(3px);}
            .qz-opt:active{transform:scale(0.98)!important;transition:transform 0.08s ease!important;}
        </style>
        <div style="max-width:600px;margin:0 auto;font-family:var(--font-body,'DM Sans',sans-serif);">

            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
                <span id="qz-counter" style="font-size:var(--text-xs,0.68rem);font-weight:700;color:${c.muted};">Pergunta ${this._current+1} de ${this.QUESTIONS_PER_DAY}</span>
                <span id="qz-score" style="font-size:var(--text-xs,0.68rem);font-weight:700;
                    background:${c.inner};border:1px solid ${c.border};border-radius:99px;padding:0.2rem 0.625rem;color:${c.text};">
                    ✅ ${this._score} pontos
                </span>
            </div>

            <div style="height:4px;background:${c.inner};border-radius:99px;overflow:hidden;margin-bottom:1.25rem;">
                <div id="qz-progress" style="height:100%;width:${progress}%;
                    background:linear-gradient(90deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));
                    border-radius:99px;transition:width 0.3s;"></div>
            </div>

            <div style="background:${c.bg};border:1px solid ${c.border};border-radius:var(--radius-xl,18px);
                padding:1.5rem;margin-bottom:1rem;animation:qzSlideIn 0.3s ease both;" id="qz-question">
                <div style="font-size:var(--text-lg,1.1rem);font-weight:700;color:${c.text};line-height:1.5;">${q.q}</div>
            </div>

            <div style="display:flex;flex-direction:column;gap:0.5rem;" id="qz-options">
                ${q.o.map((opt, i) => {
                    let bg = c.bg;
                    let border = c.border;
                    let badgeBg = c.inner;
                    let badgeBorder = c.border;
                    let badgeColor = c.muted;

                    if (this._answered) {
                        if (i === q.a) {
                            bg = 'rgba(74,222,128,0.15)';
                            border = 'rgba(74,222,128,0.5)';
                            badgeBg = 'rgba(74,222,128,0.3)';
                            badgeBorder = '#4ade80';
                            badgeColor = '#4ade80';
                        } else if (i === this._selectedIndex && !this._lastCorrect) {
                            bg = 'rgba(239,68,68,0.1)';
                            border = 'rgba(239,68,68,0.4)';
                            badgeBg = 'rgba(239,68,68,0.2)';
                            badgeBorder = '#ef4444';
                            badgeColor = '#ef4444';
                        }
                    }

                    return `
                <div class="qz-opt" id="qz-opt-${i}" ${this._answered ? '' : `onclick="QuizDiario.answer(${i})"`}
                    style="background:${bg};border:1px solid ${border};
                        border-radius:var(--radius-lg,14px);padding:0.875rem 1rem;
                        display:flex;align-items:center;gap:0.875rem;cursor:${this._answered ? 'default' : 'pointer'};">
                    <div style="width:28px;height:28px;border-radius:8px;background:${badgeBg};
                        border:1px solid ${badgeBorder};flex-shrink:0;display:flex;align-items:center;
                        justify-content:center;font-size:var(--text-xs,0.68rem);font-weight:800;color:${badgeColor};">
                        ${['A','B','C','D'][i]}
                    </div>
                    <span style="font-size:var(--text-base,0.875rem);color:${c.text};font-weight:500;">${opt}</span>
                </div>`;
                }).join('')}
            </div>

            ${this._answered ? `
            <div style="margin-top:0.875rem;padding:0.75rem;border-radius:var(--radius-md,10px);
                background:${this._lastCorrect ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.08)'};
                border:1px solid ${this._lastCorrect ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.25)'};">
                <span style="font-size:0.8rem;">${this._lastCorrect ? '✅' : '❌'}</span>
                <span style="font-size:var(--text-xs,0.7rem);color:${c.sub};margin-left:0.375rem;">${q.e}</span>
            </div>` : ''}

            <div style="text-align:center;margin-top:0.75rem;">
                <button onclick="OfflineZone.backToMenu()"
                    style="font-size:var(--text-xs,0.68rem);color:${c.muted};background:none;border:none;cursor:pointer;
                        font-family:var(--font-body,'DM Sans',sans-serif);transition:color 0.15s;"
                    onmouseover="this.style.color='${c.text}'" onmouseout="this.style.color='${c.muted}'">
                    ← Voltar ao menu
                </button>
            </div>
        </div>`;
    },

    answer(idx) {
        if (this._answered) return;
        const q = this._questions[this._current];
        if (!q) return;
        this._answered = true;
        const correct = idx === q.a;
        if (correct) this._score++;
        this._selectedIndex = idx;
        this._lastCorrect = correct;

        const state = this._getQuestionState();
        if (state) {
            const answeredIds = [...new Set([...(state.answeredIds || []), q.id])];
            this._setQuestionState({
                ...state,
                score: this._score,
                answered: true,
                selectedIndex: idx,
                lastCorrect: correct,
                answeredIds,
                revealedAt: Date.now(),
            });
        }

        q.o.forEach((_, i) => {
            const el = document.getElementById(`qz-opt-${i}`);
            if (!el) return;
            el.style.cursor = 'default';
            el.onclick = null;
            if (i === q.a) {
                el.style.background = 'rgba(74,222,128,0.15)';
                el.style.borderColor = 'rgba(74,222,128,0.5)';
                const badge = el.querySelector('div');
                if (badge) { badge.style.background='rgba(74,222,128,0.3)'; badge.style.borderColor='#4ade80'; badge.style.color='#4ade80'; }
            } else if (i === idx && !correct) {
                el.style.background = 'rgba(239,68,68,0.1)';
                el.style.borderColor = 'rgba(239,68,68,0.4)';
                const badge = el.querySelector('div');
                if (badge) { badge.style.background='rgba(239,68,68,0.2)'; badge.style.borderColor='#ef4444'; badge.style.color='#ef4444'; }
            }
        });

        const qEl = document.getElementById('qz-question');
        if (qEl) {
            const c = this._colors();
            qEl.insertAdjacentHTML('beforeend', `
                <div style="margin-top:0.875rem;padding:0.75rem;border-radius:var(--radius-md,10px);
                    background:${correct ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.08)'};
                    border:1px solid ${correct ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.25)'};">
                    <span style="font-size:0.8rem;">${correct ? '✅' : '❌'}</span>
                    <span style="font-size:var(--text-xs,0.7rem);color:${c.sub};margin-left:0.375rem;">${q.e}</span>
                </div>`);
        }

        const scoreEl = document.getElementById('qz-score');
        if (scoreEl) scoreEl.textContent = `✅ ${this._score} pontos`;

        setTimeout(() => {
            this._advanceAfterReveal(true);
        }, 1800);
    },

    _updateQuestion() {
        const q = this._questions[this._current];
        const c = this._colors();
        const isDark = this._isDark();
        const progress = (this._current / this.QUESTIONS_PER_DAY) * 100;
        const progressEl = document.getElementById('qz-progress');
        if (progressEl) progressEl.style.width = progress + '%';
        const counterEl = document.getElementById('qz-counter');
        if (counterEl) counterEl.textContent = `Pergunta ${this._current+1} de ${this.QUESTIONS_PER_DAY}`;
        const qEl = document.getElementById('qz-question');
        if (qEl) qEl.innerHTML = `<div style="font-size:var(--text-lg,1.1rem);font-weight:700;color:${c.text};line-height:1.5;">${q.q}</div>`;
        const optEl = document.getElementById('qz-options');
        if (optEl) {
            optEl.innerHTML = q.o.map((opt, i) => `
            <div class="qz-opt" id="qz-opt-${i}" onclick="QuizDiario.answer(${i})"
                style="background:${c.bg};border:1px solid ${c.border};
                    border-radius:var(--radius-lg,14px);padding:0.875rem 1rem;
                    display:flex;align-items:center;gap:0.875rem;cursor:pointer;
                    transition:background 0.15s,border-color 0.15s,transform 0.1s;">
                <div style="width:28px;height:28px;border-radius:8px;background:${c.inner};
                    border:1px solid ${c.border};flex-shrink:0;display:flex;align-items:center;
                    justify-content:center;font-size:var(--text-xs,0.68rem);font-weight:800;color:${c.muted};">
                    ${['A','B','C','D'][i]}
                </div>
                <span style="font-size:var(--text-base,0.875rem);color:${c.text};font-weight:500;">${opt}</span>
            </div>`).join('');
        }
    },

    _getRating(score) {
        if (score === 10) return { label: 'Gênio にゃん~ 🧠', color: '#f59e0b' };
        if (score >= 8)   return { label: 'Estudioso 📚', color: '#a855f7' };
        if (score >= 5)   return { label: 'Mediano 🙂', color: '#3b82f6' };
        return { label: 'Tente amanhã 😅', color: '#ef4444' };
    },

    _renderResult() {
        const c = this._colors();
        const { label, color } = this._getRating(this._score);
        const best = Utils.loadData('quiz_highscore') || 0;
        const isRecord = this._score >= best && this._score > 0;
        const stars = '⭐'.repeat(this._score) + '☆'.repeat(10 - this._score);

        return `
        <style>@keyframes qzResultIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}</style>
        <div style="max-width:480px;margin:0 auto;font-family:var(--font-body,'DM Sans',sans-serif);">
        <div style="animation:qzResultIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
            background:${c.bg};border:1px solid ${c.border};border-radius:var(--radius-2xl,24px);padding:2rem;text-align:center;">

            <div style="font-size:2.5rem;margin-bottom:0.5rem;">${isRecord ? '🏆' : '🎯'}</div>
            <h2 style="font-family:var(--font-display,'Syne',sans-serif);font-size:var(--text-xl,1.5rem);font-weight:900;color:${c.text};margin:0 0 0.25rem;">
                ${isRecord ? 'Novo Recorde!' : 'Quiz Concluído!'}</h2>
            <div style="font-size:var(--text-sm,0.78rem);font-weight:700;color:${color};margin-bottom:1.5rem;">${label}</div>

            <div style="background:${c.inner};border-radius:var(--radius-xl,18px);padding:1.5rem;margin-bottom:1rem;">
                <div style="font-size:3rem;font-weight:900;font-family:var(--font-display,'Syne',sans-serif);
                    color:var(--theme-primary,#a855f7);line-height:1;">${this._score}<span style="font-size:1.5rem;color:${c.muted};">/10</span></div>
                <div style="font-size:1rem;margin-top:0.5rem;letter-spacing:2px;">${stars}</div>
                <div style="font-size:var(--text-xs,0.68rem);color:${c.muted};margin-top:0.5rem;">
                    Recorde: ${Math.max(this._score, best)}/10
                </div>
            </div>

            <div style="font-size:var(--text-xs,0.68rem);color:${c.muted};margin-bottom:1.25rem;">
                O quiz renova à meia-noite. Volte amanhã! にゃん~
            </div>

            <button onclick="OfflineZone.backToMenu()"
                style="width:100%;padding:0.75rem;border-radius:var(--radius-md,10px);border:none;cursor:pointer;
                    font-weight:700;font-size:var(--text-base,0.875rem);font-family:var(--font-body,'DM Sans',sans-serif);
                    background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));
                    color:white;transition:filter 0.15s;"
                onmouseover="this.style.filter='brightness(1.1)'" onmouseout="this.style.filter=''">
                ← Voltar ao menu
            </button>
        </div></div>`;
    },

    start() {
        const existing = this._getQuestionState();
        if (existing?.date === this._getToday()) {
            if (existing.status === 'completed') {
                this._syncRuntimeFromStorage();
                const container = document.getElementById('tool-container');
                if (container && window.OfflineZone?.currentGame === 'quiz') {
                    container.innerHTML = this._renderAlreadyPlayed(existing.score);
                }
                return;
            }

            this._syncRuntimeFromStorage();
            const currentContainer = document.getElementById('tool-container');
            if (currentContainer && window.OfflineZone?.currentGame === 'quiz') {
                currentContainer.innerHTML = this._renderQuestion();
            }
            return;
        }

        const questionIds = this._selectQuestionsForToday(this._loadPersisted().history).map((question) => question.id);
        this._setQuestionState({
            date: this._getToday(),
            status: 'playing',
            questionIds,
            answeredIds: [],
            current: 0,
            score: 0,
            answered: false,
            selectedIndex: null,
            lastCorrect: false,
            revealedAt: 0,
            completedAt: 0,
        });
        this._phase = 'playing';
        const container = document.getElementById('tool-container');
        if (container && window.OfflineZone?.currentGame === 'quiz') {
            container.innerHTML = this._renderQuestion();
        }
    },

    init() {
        const state = this._syncRuntimeFromStorage();
        if (this._advanceTimer) {
            clearTimeout(this._advanceTimer);
            this._advanceTimer = null;
        }

        if (state?.status === 'playing' && state.answered === true) {
            this._advanceAfterReveal(true);
        }
    },
};

window.QuizDiario = QuizDiario;
