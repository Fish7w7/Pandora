/* ═══════════════════════════════════════════════════════
   QUIZ.JS v1.0.0 — NyanTools にゃん~
   v3.7.0 "Zona Arcade" —
   ═══════════════════════════════════════════════════════ */

const QuizDiario = {

    QUESTIONS_PER_DAY: 10,
    _current: 0,
    _score: 0,
    _answered: false,
    _questions: [],
    _phase: 'intro',

    // ── BANCO DE PERGUNTAS (100 para começar, expansível) ──
    _bank: [
        // TECNOLOGIA
        { q: "Qual linguagem de programação foi criada por Guido van Rossum?", o: ["Java","Python","Ruby","Perl"], a: 1, e: "Python foi criado por Guido van Rossum e lançado em 1991." },
        { q: "O que significa a sigla HTML?", o: ["HyperText Markup Language","High Transfer Markup Language","HyperText Machine Learning","Hard Text Modeling Language"], a: 0, e: "HTML é a linguagem de marcação padrão para criação de páginas web." },
        { q: "Quantos bits tem um byte?", o: ["4","16","8","32"], a: 2, e: "Um byte é composto por 8 bits, unidade básica de armazenamento digital." },
        { q: "Qual empresa criou o sistema operacional Android?", o: ["Apple","Microsoft","Google","Samsung"], a: 2, e: "O Android foi desenvolvido pelo Google e lançado em 2008." },
        { q: "O que é um algoritmo?", o: ["Um tipo de vírus","Sequência de instruções para resolver um problema","Hardware de computador","Linguagem de banco de dados"], a: 1, e: "Algoritmo é um conjunto finito de instruções para resolver um problema." },
        { q: "Qual foi o primeiro computador eletrônico do mundo?", o: ["ENIAC","IBM PC","Apple I","Colossus"], a: 0, e: "O ENIAC (1945) é considerado o primeiro computador eletrônico de uso geral." },
        { q: "O que significa CPU?", o: ["Central Processing Unit","Computer Personal Unit","Central Program Utility","Core Processing Update"], a: 0, e: "CPU é a Unidade Central de Processamento, o 'cérebro' do computador." },
        { q: "Qual empresa fundou o JavaScript?", o: ["Google","Microsoft","Netscape","Apple"], a: 2, e: "JavaScript foi criado por Brendan Eich na Netscape em 1995." },
        { q: "O que é open source?", o: ["Software pago","Software com código-fonte aberto","Hardware modular","Rede privada"], a: 1, e: "Open source é software cujo código-fonte é disponível publicamente." },
        { q: "Qual é o maior sistema de controle de versão do mundo?", o: ["SVN","Git","Mercurial","Bazaar"], a: 1, e: "Git foi criado por Linus Torvalds em 2005 e é o mais usado no mundo." },
        // CIÊNCIAS
        { q: "Qual é o elemento mais abundante no universo?", o: ["Oxigênio","Hélio","Carbono","Hidrogênio"], a: 3, e: "O hidrogênio compõe cerca de 75% da massa do universo visível." },
        { q: "Quantos ossos tem o corpo humano adulto?", o: ["206","180","250","300"], a: 0, e: "O corpo humano adulto possui 206 ossos. Bebês nascem com cerca de 270." },
        { q: "Qual é a velocidade da luz no vácuo?", o: ["300.000 km/s","150.000 km/s","450.000 km/s","200.000 km/s"], a: 0, e: "A velocidade da luz no vácuo é aproximadamente 299.792 km/s." },
        { q: "Qual planeta é conhecido como planeta vermelho?", o: ["Vênus","Júpiter","Marte","Saturno"], a: 2, e: "Marte é chamado de planeta vermelho por causa do óxido de ferro em sua superfície." },
        { q: "O que é fotossíntese?", o: ["Processo de respiração animal","Conversão de luz em energia pelas plantas","Decomposição de matéria orgânica","Reprodução das algas"], a: 1, e: "Fotossíntese é o processo pelo qual plantas convertem luz solar em glicose." },
        { q: "Qual é o maior planeta do Sistema Solar?", o: ["Saturno","Netuno","Terra","Júpiter"], a: 3, e: "Júpiter é o maior planeta, com massa 2,5 vezes maior que todos os outros juntos." },
        { q: "Quantos cromossomos tem uma célula humana normal?", o: ["23","46","48","44"], a: 1, e: "Células humanas têm 46 cromossomos, organizados em 23 pares." },
        { q: "Qual gás as plantas absorvem durante a fotossíntese?", o: ["Oxigênio","Nitrogênio","Dióxido de carbono","Metano"], a: 2, e: "As plantas absorvem CO₂ e liberam O₂ durante a fotossíntese." },
        { q: "O que estuda a Astronomia?", o: ["Composição química dos minerais","Corpos celestes e fenômenos do universo","Movimentos das placas tectônicas","Comportamento dos oceanos"], a: 1, e: "Astronomia é a ciência que estuda estrelas, planetas, galáxias e o universo." },
        { q: "Qual é o símbolo químico do ouro?", o: ["Ag","Fe","Au","Cu"], a: 2, e: "Au vem do latim 'Aurum', que significa ouro." },
        // GEOGRAFIA
        { q: "Qual é o maior país do mundo em área?", o: ["China","Canadá","Brasil","Rússia"], a: 3, e: "A Rússia tem 17,1 milhões de km², sendo o maior país do mundo." },
        { q: "Qual é a capital do Japão?", o: ["Osaka","Tóquio","Quioto","Hiroshima"], a: 1, e: "Tóquio é a capital do Japão e a cidade mais populosa do mundo." },
        { q: "Qual é o rio mais longo do mundo?", o: ["Amazonas","Nilo","Mississippi","Yangtze"], a: 1, e: "O Nilo tem aproximadamente 6.650 km de comprimento, sendo o maior do mundo." },
        { q: "Em qual continente está localizado o Egito?", o: ["Ásia","Europa","América","África"], a: 3, e: "O Egito está localizado no nordeste da África, na margem do Mar Mediterrâneo." },
        { q: "Qual é o oceano mais profundo do mundo?", o: ["Atlântico","Índico","Ártico","Pacífico"], a: 3, e: "O Oceano Pacífico contém a Fossa das Marianas, com 11 km de profundidade." },
        { q: "Qual país tem a maior população do mundo?", o: ["Índia","China","EUA","Indonésia"], a: 0, e: "A Índia ultrapassou a China em 2023, com mais de 1,4 bilhão de habitantes." },
        { q: "Qual é a capital da Austrália?", o: ["Sydney","Melbourne","Brisbane","Camberra"], a: 3, e: "Camberra é a capital da Austrália, escolhida como compromisso entre Sydney e Melbourne." },
        { q: "Qual é o deserto mais quente do mundo?", o: ["Gobi","Ártico","Saara","Atacama"], a: 2, e: "O Saara é o maior deserto quente do mundo, cobrindo grande parte do norte da África." },
        { q: "Qual montanha é a mais alta do mundo?", o: ["K2","Monte Branco","Aconcágua","Everest"], a: 3, e: "O Monte Everest tem 8.848 metros de altitude, sendo o ponto mais alto da Terra." },
        { q: "Quantos estados tem o Brasil?", o: ["24","27","26","28"], a: 1, e: "O Brasil possui 26 estados e 1 Distrito Federal, totalizando 27 unidades federativas." },
        // HISTÓRIA
        { q: "Em que ano ocorreu a Revolução Francesa?", o: ["1776","1815","1789","1804"], a: 2, e: "A Revolução Francesa começou em 1789 com a queda da Bastilha em 14 de julho." },
        { q: "Quem foi o primeiro presidente dos Estados Unidos?", o: ["Abraham Lincoln","Thomas Jefferson","Benjamin Franklin","George Washington"], a: 3, e: "George Washington foi o primeiro presidente dos EUA, de 1789 a 1797." },
        { q: "Em que ano o Brasil proclamou sua independência?", o: ["1808","1822","1889","1500"], a: 1, e: "O Brasil declarou independência de Portugal em 7 de setembro de 1822." },
        { q: "Quem construiu as pirâmides de Gizé?", o: ["Romanos","Gregos","Egípcios","Persas"], a: 2, e: "As pirâmides de Gizé foram construídas pelos egípcios antigos há cerca de 4.500 anos." },
        { q: "Em que ano terminou a Segunda Guerra Mundial?", o: ["1943","1944","1946","1945"], a: 3, e: "A Segunda Guerra Mundial terminou em 1945 com a rendição da Alemanha e do Japão." },
        { q: "Quem descobriu o Brasil?", o: ["Cristóvão Colombo","Vasco da Gama","Pedro Álvares Cabral","Américo Vespúcio"], a: 2, e: "Pedro Álvares Cabral chegou ao Brasil em 22 de abril de 1500." },
        { q: "O que foi a Guerra Fria?", o: ["Conflito armado entre EUA e URSS","Tensão política entre EUA e URSS","Guerra no Ártico","Conflito no Polo Norte"], a: 1, e: "A Guerra Fria (1947-1991) foi uma tensão geopolítica entre os EUA e a URSS sem conflito direto." },
        { q: "Em que ano caiu o Muro de Berlim?", o: ["1991","1987","1985","1989"], a: 3, e: "O Muro de Berlim caiu em 9 de novembro de 1989, marcando o fim da Guerra Fria." },
        { q: "Quem foi Napoleão Bonaparte?", o: ["Rei da França","Imperador francês e general","Czar da Rússia","Presidente dos EUA"], a: 1, e: "Napoleão Bonaparte foi um general e imperador francês que dominou grande parte da Europa." },
        { q: "Qual civilização criou os Jogos Olímpicos originais?", o: ["Romana","Persa","Egípcia","Grega"], a: 3, e: "Os Jogos Olímpicos foram criados na Grécia Antiga em 776 a.C., em Olímpia." },
        // CULTURA POP
        { q: "Qual é a franquia de filmes de maior bilheteria de todos os tempos?", o: ["Star Wars","Harry Potter","Marvel Cinematic Universe","James Bond"], a: 2, e: "O Marvel Cinematic Universe é a franquia mais lucrativa da história do cinema." },
        { q: "Quem criou o personagem Sherlock Holmes?", o: ["Agatha Christie","Arthur Conan Doyle","Edgar Allan Poe","Charles Dickens"], a: 1, e: "Arthur Conan Doyle criou Sherlock Holmes em 1887 no livro 'Um Estudo em Vermelho'." },
        { q: "Qual banda lançou o álbum 'Thriller'?", o: ["Prince","Michael Jackson","Madonna","Whitney Houston"], a: 1, e: "Thriller (1982) de Michael Jackson é o álbum mais vendido da história, com 66M cópias." },
        { q: "De onde é originário o anime?", o: ["Coreia do Sul","China","Japão","Tailândia"], a: 2, e: "Anime é o estilo de animação originário do Japão, com características visuais únicas." },
        { q: "Qual é o jogo eletrônico mais vendido de todos os tempos?", o: ["Minecraft","Tetris","Grand Theft Auto V","Pac-Man"], a: 1, e: "Tetris vendeu mais de 500 milhões de cópias contando todas as plataformas." },
        { q: "Quem escreveu 'Dom Quixote'?", o: ["Miguel de Cervantes","Lope de Vega","Francisco de Quevedo","Luís de Camões"], a: 0, e: "Miguel de Cervantes escreveu Dom Quixote (1605), considerado o primeiro romance moderno." },
        { q: "Qual é a série de TV mais assistida da história?", o: ["Breaking Bad","Game of Thrones","Friends","Grey's Anatomy"], a: 1, e: "Game of Thrones estabeleceu recordes de audiência ao longo de suas 8 temporadas." },
        { q: "Quem pintou a Mona Lisa?", o: ["Michelangelo","Rafael","Leonardo da Vinci","Botticelli"], a: 2, e: "Leonardo da Vinci pintou a Mona Lisa entre 1503 e 1519, hoje no Museu do Louvre." },
        { q: "Qual o nome do bruxo protagonista da série de J.K. Rowling?", o: ["Hermione Granger","Ron Weasley","Harry Potter","Neville Longbottom"], a: 2, e: "Harry Potter é o protagonista da série que vendeu mais de 500 milhões de livros." },
        { q: "Quem é o criador do Facebook?", o: ["Jack Dorsey","Elon Musk","Bill Gates","Mark Zuckerberg"], a: 3, e: "Mark Zuckerberg fundou o Facebook em 2004 enquanto estudava em Harvard." },
        // ESPORTES
        { q: "Qual país ganhou mais Copas do Mundo de futebol?", o: ["Alemanha","Argentina","Itália","Brasil"], a: 3, e: "O Brasil ganhou 5 Copas do Mundo: 1958, 1962, 1970, 1994 e 2002." },
        { q: "Quantos jogadores tem um time de futebol em campo?", o: ["9","10","11","12"], a: 2, e: "Cada time de futebol joga com 11 jogadores em campo, incluindo o goleiro." },
        { q: "Em qual cidade foram realizados os Jogos Olímpicos de 2016?", o: ["São Paulo","Buenos Aires","Rio de Janeiro","Brasília"], a: 2, e: "Os Jogos Olímpicos de 2016 foram realizados no Rio de Janeiro, Brasil." },
        { q: "Qual esporte usa um volante (shuttlecock)?", o: ["Tênis","Squash","Badminton","Pingue-pongue"], a: 2, e: "O badminton usa um peteca (shuttlecock), jogado com raquetes leves sobre uma rede." },
        { q: "Quem detém o recorde de mais gols na história da seleção brasileira?", o: ["Romário","Ronaldo","Neymar","Pelé"], a: 2, e: "Neymar superou o recorde de Pelé em 2023, se tornando o maior artilheiro da seleção." },
        { q: "Qual é o esporte mais praticado no mundo?", o: ["Basquete","Cricket","Futebol","Tênis"], a: 2, e: "O futebol tem mais de 4 bilhões de fãs e é o esporte mais popular do mundo." },
        { q: "Em qual esporte existe o 'Grand Slam'?", o: ["Futebol","Golfe","Tênis","Todos os anteriores"], a: 3, e: "Grand Slam existe no tênis (4 torneios), golfe (4 majors) e rúgbi (torneio europeu)." },
        { q: "Quantos anéis tem o símbolo olímpico?", o: ["4","6","5","7"], a: 2, e: "Os 5 anéis olímpicos representam os 5 continentes unidos pelos Jogos Olímpicos." },
        { q: "Qual é o apelido da seleção brasileira de futebol?", o: ["Os Guerreiros","Canarinho","A Amarela","Verde e Amarelo"], a: 1, e: "A seleção brasileira é chamada de Canarinho por causa do uniforme amarelo e verde." },
        { q: "Quem é considerado o melhor jogador de basquete da história?", o: ["Kobe Bryant","LeBron James","Magic Johnson","Michael Jordan"], a: 3, e: "Michael Jordan ganhou 6 títulos da NBA com o Chicago Bulls e é amplamente reconhecido como o maior." },
        // CURIOSIDADES
        { q: "Qual animal não pode pular?", o: ["Canguru","Hipopótamo","Elefante","Gorila"], a: 2, e: "O elefante é o único mamífero que não consegue pular devido ao seu peso e estrutura óssea." },
        { q: "Quantas câmaras tem o coração humano?", o: ["2","3","4","6"], a: 2, e: "O coração humano tem 4 câmaras: 2 átrios e 2 ventrículos." },
        { q: "Qual é o animal terrestre mais rápido?", o: ["Leopardo","Guepardo","Leão","Cavalo"], a: 1, e: "O guepardo pode atingir 120 km/h em sprints curtos, sendo o mais rápido em terra." },
        { q: "Quantas pernas tem uma aranha?", o: ["6","8","10","12"], a: 1, e: "Aranhas têm 8 patas, sendo aracnídeos e não insetos (que têm 6)." },
        { q: "Qual é o único mamífero capaz de voar?", o: ["Esquilo-voador","Morcego","Planador da Índia","Colugo"], a: 1, e: "O morcego é o único mamífero com voo verdadeiro, usando asas de membrana." },
        { q: "Quantas cores tem o arco-íris?", o: ["5","6","7","8"], a: 2, e: "O arco-íris tem 7 cores: vermelho, laranja, amarelo, verde, azul, anil e violeta." },
        { q: "Qual país tem mais lagos do mundo?", o: ["Rússia","Brasil","EUA","Canadá"], a: 3, e: "O Canadá tem mais de 2 milhões de lagos, mais do que qualquer outro país." },
        { q: "O que é DNA?", o: ["Proteína muscular","Hormônio digestivo","Molécula portadora de informação genética","Vitamina essencial"], a: 2, e: "DNA (ácido desoxirribonucleico) é a molécula que carrega as instruções genéticas." },
        { q: "Qual é o metal mais leve que existe?", o: ["Alumínio","Titânio","Lítio","Magnésio"], a: 2, e: "O lítio é o metal mais leve, com densidade de apenas 0,53 g/cm³." },
        { q: "Quantas horas tem um dia em Marte?", o: ["22h","26h","24h 37min","28h"], a: 2, e: "Um dia marciano (sol) dura 24 horas e 37 minutos, muito similar ao da Terra." },
        // BRASIL
        { q: "Qual é a capital do Brasil?", o: ["São Paulo","Rio de Janeiro","Brasília","Salvador"], a: 2, e: "Brasília é a capital do Brasil desde 1960, quando substituiu o Rio de Janeiro." },
        { q: "Qual é a maior floresta tropical do mundo?", o: ["Congo","Daintree","Mata Atlântica","Amazônia"], a: 3, e: "A Floresta Amazônica cobre 5,5 milhões de km², sendo a maior floresta tropical." },
        { q: "Em que ano foi fundada a cidade de São Paulo?", o: ["1554","1600","1500","1822"], a: 0, e: "São Paulo foi fundada por padres jesuítas em 25 de janeiro de 1554." },
        { q: "Qual é o bioma mais ameaçado do Brasil?", o: ["Cerrado","Pampa","Mata Atlântica","Caatinga"], a: 2, e: "A Mata Atlântica perdeu mais de 85% de sua cobertura original e é um dos biomas mais ameaçados." },
        { q: "Quem foi Tiradentes?", o: ["Militar e mártir da Inconfidência Mineira","Primeiro presidente do Brasil","Herói da Guerra do Paraguai","Descobridor do Brasil"], a: 0, e: "Tiradentes (Joaquim José da Silva Xavier) foi executado em 1792 por liderar a Inconfidência Mineira." },
        { q: "Qual é o estado com maior área do Brasil?", o: ["Pará","Minas Gerais","Mato Grosso","Amazonas"], a: 3, e: "O Amazonas é o maior estado do Brasil com 1,57 milhão de km²." },
        { q: "Qual é a moeda atual do Brasil?", o: ["Cruzeiro","Real","Cruzado","Centavo"], a: 1, e: "O Real (R$) é a moeda do Brasil desde 1994, introduzida pelo Plano Real." },
        { q: "Quem foi o primeiro presidente do Brasil?", o: ["Getúlio Vargas","Dom Pedro II","Deodoro da Fonseca","Floriano Peixoto"], a: 2, e: "Marechal Deodoro da Fonseca proclamou a República e se tornou o primeiro presidente em 1889." },
        { q: "Qual é a língua oficial do Brasil?", o: ["Espanhol","Tupi-Guarani","Português","Inglês"], a: 2, e: "O português é a língua oficial do Brasil, trazida pelos colonizadores portugueses." },
        { q: "Em qual estado está o Pantanal?", o: ["Amazonas","Pará","Goiás","Mato Grosso do Sul"], a: 3, e: "O Pantanal está principalmente no Mato Grosso do Sul e Mato Grosso, e parte na Bolívia e Paraguai." },
        // ARTE E LITERATURA
        { q: "Quem escreveu 'O Senhor dos Anéis'?", o: ["C.S. Lewis","George R.R. Martin","J.R.R. Tolkien","Terry Pratchett"], a: 2, e: "J.R.R. Tolkien publicou O Senhor dos Anéis entre 1954 e 1955." },
        { q: "Quem pintou a Capela Sistina?", o: ["Rafael","Leonardo da Vinci","Michelangelo","Botticelli"], a: 2, e: "Michelangelo pintou o teto da Capela Sistina entre 1508 e 1512 por encomenda do Papa Júlio II." },
        { q: "Qual é a obra mais famosa de Machado de Assis?", o: ["O Cortiço","Dom Casmurro","Iracema","O Guarani"], a: 1, e: "Dom Casmurro (1899) é considerada a obra prima de Machado de Assis e da literatura brasileira." },
        { q: "Quem compôs a 5ª Sinfonia?", o: ["Mozart","Bach","Chopin","Beethoven"], a: 3, e: "A 5ª Sinfonia de Beethoven (1808) com seus famosos 4 primeiros compassos é uma das mais conhecidas." },
        { q: "Qual movimento artístico é associado a Salvador Dalí?", o: ["Impressionismo","Cubismo","Surrealismo","Expressionismo"], a: 2, e: "Salvador Dalí foi o mais icônico representante do Surrealismo, movimento que explorava o inconsciente." },
        // ALIMENTAÇÃO
        { q: "Qual fruta tem mais vitamina C?", o: ["Laranja","Acerola","Limão","Morango"], a: 1, e: "A acerola tem até 80 vezes mais vitamina C que a laranja." },
        { q: "De onde é originária a pizza?", o: ["EUA","França","Grécia","Itália"], a: 3, e: "A pizza moderna surgiu em Nápoles, Itália, no século XVIII." },
        { q: "Qual é o ingrediente principal do guacamole?", o: ["Tomate","Abacate","Pimenta","Limão"], a: 1, e: "O guacamole é feito principalmente de abacate amassado, originário do México." },
        { q: "Quantas calorias tem 1 grama de gordura?", o: ["4","7","9","11"], a: 2, e: "Gorduras fornecem 9 kcal por grama, mais que proteínas e carboidratos (4 kcal/g cada)." },
        { q: "Qual bebida é mais consumida no mundo depois da água?", o: ["Café","Refrigerante","Chá","Suco"], a: 2, e: "O chá é a segunda bebida mais consumida no mundo, especialmente na Ásia." },
    ],

    // ── SEED DIÁRIA ───────────────────────────────────
    _getToday() {
        const d = new Date();
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
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

    // ── ESTADO DO DIA ─────────────────────────────────
    _getTodayResult() {
        const saved = Utils.loadData('quiz_today');
        if (!saved || saved.date !== this._getToday()) return null;
        return saved;
    },

    _saveTodayResult(score) {
        Utils.saveData('quiz_today', { date: this._getToday(), score });
        // Salvar recorde
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
        // beat_record já disparado dentro de Economy.checkRecord
    },

    // ── HELPERS ───────────────────────────────────────
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

    // ── RENDER ────────────────────────────────────────
    render() {
        const todayResult = this._getTodayResult();
        if (todayResult) return this._renderAlreadyPlayed(todayResult.score);
        if (this._phase === 'intro')   return this._renderIntro();
        if (this._phase === 'playing') return this._renderQuestion();
        if (this._phase === 'result')  return this._renderResult();
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
        const progress = ((this._current) / this.QUESTIONS_PER_DAY) * 100;

        return `
        <style>
            @keyframes qzSlideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}
            .qz-opt{cursor:pointer;transition:background 0.15s,border-color 0.15s,transform 0.1s;}
            .qz-opt:hover{transform:translateX(3px);}
            .qz-opt:active{transform:scale(0.98)!important;transition:transform 0.08s ease!important;}
        </style>
        <div style="max-width:600px;margin:0 auto;font-family:var(--font-body,'DM Sans',sans-serif);">

            <!-- Header -->
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
                <span id="qz-counter" style="font-size:var(--text-xs,0.68rem);font-weight:700;color:${c.muted};">Pergunta ${this._current+1} de ${this.QUESTIONS_PER_DAY}</span>
                <span id="qz-score" style="font-size:var(--text-xs,0.68rem);font-weight:700;
                    background:${c.inner};border:1px solid ${c.border};border-radius:99px;padding:0.2rem 0.625rem;color:${c.text};">
                    ✅ ${this._score} pontos
                </span>
            </div>

            <!-- Progresso -->
            <div style="height:4px;background:${c.inner};border-radius:99px;overflow:hidden;margin-bottom:1.25rem;">
                <div id="qz-progress" style="height:100%;width:${progress}%;
                    background:linear-gradient(90deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));
                    border-radius:99px;transition:width 0.3s;"></div>
            </div>

            <!-- Pergunta -->
            <div style="background:${c.bg};border:1px solid ${c.border};border-radius:var(--radius-xl,18px);
                padding:1.5rem;margin-bottom:1rem;animation:qzSlideIn 0.3s ease both;" id="qz-question">
                <div style="font-size:var(--text-lg,1.1rem);font-weight:700;color:${c.text};line-height:1.5;">${q.q}</div>
            </div>

            <!-- Opções -->
            <div style="display:flex;flex-direction:column;gap:0.5rem;" id="qz-options">
                ${q.o.map((opt, i) => `
                <div class="qz-opt" id="qz-opt-${i}" onclick="QuizDiario.answer(${i})"
                    style="background:${c.bg};border:1px solid ${c.border};
                        border-radius:var(--radius-lg,14px);padding:0.875rem 1rem;
                        display:flex;align-items:center;gap:0.875rem;">
                    <div style="width:28px;height:28px;border-radius:8px;background:${c.inner};
                        border:1px solid ${c.border};flex-shrink:0;display:flex;align-items:center;
                        justify-content:center;font-size:var(--text-xs,0.68rem);font-weight:800;color:${c.muted};">
                        ${['A','B','C','D'][i]}
                    </div>
                    <span style="font-size:var(--text-base,0.875rem);color:${c.text};font-weight:500;">${opt}</span>
                </div>`).join('')}
            </div>

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
        this._answered = true;
        const q = this._questions[this._current];
        const correct = idx === q.a;
        if (correct) this._score++;

        // Colorir opções no DOM diretamente
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

        // Mostrar explicação
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

        // Atualizar score no header
        const scoreEl = document.getElementById('qz-score');
        if (scoreEl) scoreEl.textContent = `✅ ${this._score} pontos`;

        // Avançar para próxima
        setTimeout(() => {
            this._current++;
            this._answered = false;
            if (this._current >= this.QUESTIONS_PER_DAY) {
                this._saveTodayResult(this._score);
                this._phase = 'result';
                const container = document.getElementById('tool-container');
                if (container) container.innerHTML = this._renderResult();
            } else {
                this._updateQuestion();
            }
        }, 1800);
    },

    // Atualiza apenas o conteúdo da pergunta sem recriar toda a tela
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

            <!-- Score -->
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
        this._questions = this._getTodayQuestions();
        this._current = 0;
        this._score = 0;
        this._answered = false;
        this._phase = 'playing';
        const container = document.getElementById('tool-container');
        if (container) {
            container.innerHTML = this._renderQuestion();
        }
    },

    init() {
        this._phase = 'intro';
        this._answered = false;
    },
};

window.QuizDiario = QuizDiario;