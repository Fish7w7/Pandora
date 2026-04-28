

const LoginPhrases = {

    _phrases: [
        'O começo de tudo é um clique. にゃん~',
        'Produtividade é um hábito, não um talento.',
        'Pequenos passos todos os dias chegam longe.',
        'Organizado hoje, livre amanhã. にゃん~',
        'A melhor hora para começar foi ontem. A segunda melhor é agora.',
        'Foco é saber dizer não para mil coisas.',
        'Um dia de cada vez. にゃん~',
        'Feito é melhor que perfeito.',
        'Quem organiza, não improvisa. にゃん~',
        'Cada tarefa concluída é uma vitória.',
        'A organização é a forma mais gentil de cuidar de si mesmo.',
        'Clareza mental começa com um ambiente organizado.',
        'O que você faz todo dia importa mais do que o que faz de vez em quando.',
        'Disciplina é liberdade disfarçada.',
        'Comece onde você está. Use o que você tem. Faça o que puder.',
        'A perfeição é inimiga do feito.',
        'Priorizar é uma forma de amor-próprio.',
        'Menos mas melhor.',
        'Consistência supera intensidade no longo prazo.',
        'O segredo é começar.',
        'Você consegue. にゃん~',
        'Hoje vai ser diferente.',
        'Confie no processo.',
        'Respira. Organiza. Conquista.',
        'Um passo de cada vez.',
        'Você já chegou até aqui — continue.',
        'Errar faz parte. Tentar também.',
        'Seja gentil consigo mesmo hoje.',
        'Seu futuro eu vai agradecer.',
        'Faz o que der. É suficiente.',

        '頑張って! Gambatte — faça o seu melhor!',
        'Nana korobi ya oki — caia sete vezes, levante oito.',
        'Ichi-go ichi-e — este momento nunca se repetirá.',
        'Shokunin kishitsu — dedique-se com maestria.',
        'Kaizen — melhoria contínua, um dia de cada vez.',
        'Wabi-sabi: beleza na imperfeição. にゃん~',
        'Ikigai: encontre o que te faz querer acordar cedo.',
        'Mono no aware — a beleza das coisas passageiras.',
        'Kodawari — atenção obsessiva aos detalhes.',
        'Ganbatte kudasai — por favor, faça o seu melhor!',

        'Sabia que o primeiro bug de computador foi uma mariposa real? (1947)',
        "O termo 'pixel' vem de 'picture element'.",
        'O primeiro email foi enviado em 1971 por Ray Tomlinson.',
        'Python foi criado em 1991. Mais velho que muita gente por aí.',
        'O código do Apollo 11 cabia em menos de 70KB.',
        'Existem mais dispositivos conectados à internet do que pessoas na Terra.',
        "Sabia que 'debugging' existia antes dos computadores?",
        'A internet pesa cerca de 50 gramas — em elétrons.',
        'O GitHub tem mais de 100 milhões de repositórios públicos.',
        'O primeiro videogame comercial foi o Pong, em 1972.',
        'Há mais combinações de baralho do que átomos na Terra.',
        'O Wi-Fi foi inventado por acidente ao estudar buracos negros.',

        'Miau-ravilhoso te ver de novo! にゃん~',
        'Pronto para ser purr-dutivo hoje? にゃん~',
        'Suas ferramentas te esperam, mestre. にゃん~',
        'Cat-alogando suas tarefas desde 2024. にゃん~',
        'Fur real, você vai arrasar hoje. にゃん~',
        'Sem patas para trás — só para frente! にゃん~',
        'O NyanTools ronrona de satisfação ao te ver.',
        'Purr-fect timing! にゃん~',
        'Sete vidas, infinitas possibilidades. にゃん~',
        'Hoje é um bom dia para ser incrível. にゃん~',
        'Miau! Tudo pronto por aqui. にゃん~',
        'Cat-apulte sua produtividade hoje! にゃん~',

        'Com grandes ferramentas vêm grandes responsabilidades. にゃん~',
        'Que a produtividade esteja com você.',
        'Na dúvida, organize. にゃん~',
        'É perigoso ir sozinho — leve o NyanTools.',
        'Power Level: Máximo. にゃん~',
        'Loading criatividade... 100% completo!',
        'Missão aceita. にゃん~',
        'Player 1 entrou no jogo.',
        'Achievement unlocked: Mais um dia incrível!',
        'New day, new quests. にゃん~',

        "A palavra 'serendipidade' não tem tradução em muitos idiomas.",
        'Mel nunca estraga. Potes de 3000 anos foram encontrados no Egito.',
        'As abelhas podem reconhecer rostos humanos.',
        'Polvos têm três corações e sangue azul.',
        'Formigas não dormem — fazem cochilos de 1 min várias vezes ao dia.',
        'Bananas são tecnicamente bagas. Morangos não são.',
        'A Groenlândia tem mais gelo do que a Islândia — o inverso do nome.',
        'Seres humanos são os únicos animais que coram.',
        'O som que você ouve no mar dentro de uma concha é o ambiente ao redor.',
        'Polvos têm neurônios nos tentáculos — cada um pensa semi-independente.',
    ],

    _timeBasedPhrases: {
        dawn:      [
            'Boa madrugada, coruja noturna! にゃん~',
            'Ainda acordado? O NyanTools também está. にゃん~',
            'A quietude da madrugada tem seu charme.',
            'Trabalhar de madrugada: o silêncio é grátis. にゃん~',
        ],
        morning:   [
            'Bom dia! O café está pronto? にゃん~',
            'Manhã de oportunidades. にゃん~',
            'O dia mal começou e você já está aqui. Incrível!',
            'Primeiras horas do dia — as mais poderosas. にゃん~',
        ],
        afternoon: [
            'Boa tarde! Metade do dia, metade das tarefas. にゃん~',
            'Hora do pique da tarde! にゃん~',
            'Você sobreviveu ao almoço. Agora bora! にゃん~',
            'Tarde produtiva é tarde bem vivida. にゃん~',
        ],
        evening:   [
            'Boa noite! Um último sprint? にゃん~',
            'A noite é boa para reflexão. にゃん~',
            'Trabalhar de noite tem seu charme. にゃん~',
            'Noite de foco. O mundo dorme, você conquista. にゃん~',
        ],
    },

    _specialDates: {
        '01-01': ['Feliz Ano Novo! Que os bugs sejam poucos. にゃん~', 'Novo ano, nova versão de você. にゃん~'],
        '12-25': ['Feliz Natal! にゃん~ 🎄', 'Ho ho ho! O NyanTools deseja boas festas!'],
        '12-31': ['Último dia do ano! Vamos fechar com chave de ouro. にゃん~'],
        '10-31': ['Happy Halloween! 🎃 にゃん~', 'Noite das bruxas... e das tarefas. にゃん~'],
        '06-12': ['Feliz Dia dos Namorados! にゃん~ ❤️'],
        '04-01': ['Hoje é 1º de Abril — mas o NyanTools é real! にゃん~'],
    },

    _getTimePeriod() {
        const h = new Date().getHours();
        if (h >= 0 && h < 6)   return 'dawn';
        if (h >= 6 && h < 12)  return 'morning';
        if (h >= 12 && h < 18) return 'afternoon';
        return 'evening';
    },

    _getSpecialDate() {
        const d = new Date();
        const key = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return this._specialDates[key] || null;
    },

    getRandom() {
        const special = this._getSpecialDate();
        const rand = Math.random();

        if (special && rand < 0.10) {
            return special[Math.floor(Math.random() * special.length)];
        }

        if (rand < 0.35) {
            const arr = this._timeBasedPhrases[this._getTimePeriod()];
            return arr[Math.floor(Math.random() * arr.length)];
        }

        return this._phrases[Math.floor(Math.random() * this._phrases.length)];
    },

    inject() {
        if (document.getElementById('login-phrase')) return;

        const subtitle = document.querySelector('#login-screen .text-white\\/40');
        if (!subtitle) return;

        const el = document.createElement('p');
        el.id = 'login-phrase';
        el.style.cssText = `
            font-size: 0.7rem;
            color: rgba(255,255,255,0.28);
            font-style: italic;
            margin-top: 0.625rem;
            cursor: pointer;
            opacity: 0;
            user-select: none;
            line-height: 1.5;
            transition: color 0.2s ease, opacity 0.35s ease;
            letter-spacing: 0.01em;
        `;
        el.title = 'Clique para outra frase にゃん~';
        el.textContent = this.getRandom();

        el.addEventListener('click', () => {
            el.style.opacity = '0';
            setTimeout(() => {
                el.textContent = this.getRandom();
                el.style.opacity = '1';
            }, 220);
        });

        el.addEventListener('mouseenter', () => { el.style.color = 'rgba(255,255,255,0.55)'; });
        el.addEventListener('mouseleave', () => { el.style.color = 'rgba(255,255,255,0.28)'; });

        subtitle.insertAdjacentElement('afterend', el);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => { el.style.opacity = '1'; });
        });

    },

    init() {
        setTimeout(() => this.inject(), 100);
        const observer = new MutationObserver(() => {
            const ls = document.getElementById('login-screen');
            if (ls && !ls.classList.contains('hidden') && !document.getElementById('login-phrase')) {
                setTimeout(() => this.inject(), 150);
            }
        });
        if (!document.body) return;
        observer.observe(document.body, {
            attributes: true,
            subtree: true,
            attributeFilter: ['class'],
        });

    },
};

window.LoginPhrases = LoginPhrases;
