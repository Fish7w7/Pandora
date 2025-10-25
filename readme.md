# 🧰 ToolBox

**Sua caixa de ferramentas definitiva!** Uma aplicação desktop moderna construída com Electron que reúne diversas ferramentas úteis em um só lugar.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Electron](https://img.shields.io/badge/electron-27.0.0-green)
![License](https://img.shields.io/badge/license-MIT-orange)

---

## ✨ Funcionalidades

### 🔑 **Gerador de Senhas**
- Gere senhas seguras e personalizáveis
- Controle de comprimento (8-64 caracteres)
- Opções: maiúsculas, minúsculas, números, símbolos
- Indicador de força da senha
- Copiar com um clique

### 🌤️ **Clima**
- Temperatura e condições meteorológicas em tempo real
- Previsão de 5 dias
- Busca por cidade ou localização GPS
- Integração com OpenWeatherMap API
- Informações detalhadas: umidade, vento, pressão, nascer/pôr do sol

### 🌍 **Tradutor Universal**
- Suporte para 10+ idiomas
- Tradução automática em tempo real
- Função de inverter idiomas
- API gratuita MyMemory

### 🤖 **Assistente IA**
- Chat com inteligência artificial
- Integração com Google Gemini 2.5 Flash
- Suporte a markdown e blocos de código
- Histórico de conversas persistente
- Atalhos rápidos (piada, dica, aprender)

### 🎮 **Mini Games**
- Jogo da Cobrinha (Snake) clássico
- Sistema de pontuação e recordes
- Controles por teclado ou botões
- Visual moderno com efeitos de luz

### 📧 **Email Temporário**
- Gerador de emails descartáveis
- Acesso direto a 3 serviços populares
- Dicas de uso com Gmail/Outlook (+truque)
- Copiar email com um clique

### 🎵 **Player de Música**
- Interface moderna e intuitiva
- Controles de reprodução completos
- Links para Spotify e YouTube Music
- Rádios web integradas

### 📶 **Zona Offline**
- Jogo da Velha (2 jogadores)
- Jogo da Cobrinha offline
- Funciona sem internet
- Mais jogos em breve (Termo, Quiz, Memória, Forca)

---

## 📦 Estrutura do Projeto

```
meu-app/
├── backend/                    # Backend (futuro)
│   └── src/
│       ├── config/            # Configurações
│       ├── controllers/       # Controladores
│       ├── services/          # Serviços
│       ├── utils/             # Utilitários backend
│       └── main.js           # Entry point backend
│
├── frontend/                  # Frontend principal
│   ├── public/               # Arquivos públicos
│   │   ├── assets/
│   │   │   ├── icons/       # Ícones do app
│   │   │   └── images/      # Imagens
│   │   └── index.html       # HTML principal
│   │
│   └── src/                 # Código fonte
│       ├── scripts/         # JavaScript
│       │   ├── components/  # Componentes reutilizáveis
│       │   ├── constants/   # Constantes
│       │   ├── core/        # Núcleo da aplicação
│       │   │   ├── app.js        # App principal
│       │   │   ├── auth.js       # Autenticação
│       │   │   └── router.js     # Roteamento
│       │   │
│       │   ├── tools/       # Ferramentas
│       │   │   ├── ai-assistant/
│       │   │   │   └── ai-chat.js
│       │   │   ├── crypto-tracker/    # (Em breve)
│       │   │   ├── mini-game/
│       │   │   │   └── game.js
│       │   │   ├── music-player/
│       │   │   │   └── music.js
│       │   │   ├── offline-zone/
│       │   │   │   └── offline.js
│       │   │   ├── password-generator/
│       │   │   │   └── password.js
│       │   │   ├── temp-email/
│       │   │   │   └── temp-email.js
│       │   │   ├── translator/
│       │   │   │   └── translator.js
│       │   │   └── weather/
│       │   │       └── weather.js
│       │   │
│       │   └── utils/       # Utilitários
│       │       └── helpers.js
│       │
│       └── styles/          # Estilos CSS
│           └── main.css
│
├── shared/                  # Código compartilhado
│   ├── constants/          # Constantes globais
│   ├── types/              # Tipos TypeScript (futuro)
│   └── utils/              # Utilitários compartilhados
│
├── tests/                  # Testes
│   ├── e2e/               # Testes end-to-end
│   ├── integration/       # Testes de integração
│   └── unit/              # Testes unitários
│
├── docs/                   # Documentação
├── migrate.sh             # Script de migração
├── package.json           # Dependências
├── README.md              # Este arquivo
└── script.js              # Scripts auxiliares
```

---

## 🚀 Instalação e Uso

### **Pré-requisitos**
- Node.js (v16 ou superior)
- npm ou yarn

### **1. Clonar o repositório**
```bash
git clone https://github.com/seu-usuario/toolbox.git
cd toolbox
```

### **2. Instalar dependências**
```bash
npm install
```

### **3. Executar em desenvolvimento**
```bash
npm start
```

### **4. Build para produção**

**Windows:**
```bash
npm run build:win
```

**macOS:**
```bash
npm run build:mac
```

**Linux:**
```bash
npm run build:linux
```

Os arquivos compilados estarão na pasta `dist/`

---

## ⚙️ Configuração

### **API Keys Necessárias**

#### **🌤️ OpenWeatherMap (Clima)**
1. Crie uma conta grátis em [openweathermap.org](https://openweathermap.org/api)
2. Copie sua API Key
3. Cole na ferramenta de Clima dentro do app
4. **Aguarde 10-15 minutos** para a chave ser ativada

#### **🤖 Google Gemini (IA)**
1. Acesse [makersuite.google.com](https://makersuite.google.com/app/apikey)
2. Crie uma API Key gratuita (modelo: gemini-2.5-flash-preview)
3. Cole na ferramenta Assistente IA

---

## 🎨 Tecnologias Utilizadas

### **Frontend**
- **Electron 27.0** - Framework desktop multiplataforma
- **Tailwind CSS** - Framework CSS utilitário
- **Vanilla JavaScript (ES6+)** - JavaScript moderno

### **APIs Integradas**
- **OpenWeatherMap API** - Dados meteorológicos globais
- **MyMemory API** - Tradução de textos gratuita
- **Google Gemini API** - Inteligência artificial avançada
- **1SecMail API** - Emails temporários (alternativa)

### **Recursos Web**
- **LocalStorage** - Armazenamento local de dados
- **Geolocation API** - Localização GPS
- **Fetch API** - Requisições HTTP

---

## 📸 Screenshots

### Tela de Login
![Login](screenshots/login.png)

### Dashboard Principal
![Dashboard](screenshots/dashboard.png)

### Gerador de Senhas
![Password](screenshots/password.png)

### Clima com Previsão
![Weather](screenshots/weather.png)

### Assistente IA
![AI Chat](screenshots/ai-chat.png)

---

## 🛠️ Scripts Disponíveis

```bash
npm start          # Inicia a aplicação em modo desenvolvimento
npm run dev        # Inicia com DevTools aberto
npm run build      # Build para todas as plataformas
npm run build:win  # Build apenas para Windows (.exe)
npm run build:mac  # Build apenas para macOS (.dmg)
npm run build:linux # Build apenas para Linux (.AppImage)
```

---

## 📝 Roadmap

### **✅ Concluído**
- [x] Sistema de autenticação simples
- [x] Gerador de senhas forte
- [x] Sistema de clima com previsão
- [x] Tradutor multilíngue
- [x] Assistente IA com Gemini
- [x] Mini games (Snake, Jogo da Velha)
- [x] Email temporário
- [x] Player de música básico
- [x] Zona offline

### **🚧 Em Desenvolvimento**
- [ ] 💰 **Crypto Tracker** - Cotações de criptomoedas
- [ ] 🧮 **Calculadora Científica**
- [ ] 📝 **Editor de Markdown**
- [ ] ✅ **Gerenciador de Tarefas**
- [ ] 📊 **Conversor de Unidades**

### **🔮 Melhorias Futuras**
- [ ] 🌓 Modo escuro/claro
- [ ] 🎨 Temas personalizáveis
- [ ] ☁️ Sincronização na nuvem
- [ ] 🔌 Sistema de plugins/extensões
- [ ] 🌍 Multi-idioma na interface
- [ ] 📱 Versão mobile (React Native)
- [ ] 🔔 Sistema de notificações
- [ ] ⚡ Atalhos de teclado globais

---

## 🐛 Problemas Conhecidos e Soluções

### **Erro: ERR_FILE_NOT_FOUND**
**Causa:** Caminho incorreto para arquivos  
**Solução:** Verifique os caminhos em `main.js`:
```javascript
const indexPath = path.join(__dirname, '../public/index.html');
```

### **API Key OpenWeather não funciona**
**Causa:** Chave ainda não ativada  
**Solução:** Aguarde 10-15 minutos após criar a conta.

### **Geolocalização não autorizada**
**Causa:** Permissão bloqueada  
**Solução:** Ative nas configurações do Electron ou navegador.

### **Erro 403 em Email Temporário**
**Causa:** APIs de email temporário bloqueiam Electron  
**Solução:** Use a opção de abrir no navegador externo.

### **Assistente IA retorna erro**
**Causa:** API Key inválida ou expirada  
**Solução:** Gere uma nova chave no Google AI Studio.

---

## 🤝 Contribuindo

Contribuições são muito bem-vindas! Para contribuir:

1. **Fork** o projeto
2. Crie uma **branch** para sua feature:
   ```bash
   git checkout -b feature/MinhaFeature
   ```
3. **Commit** suas mudanças:
   ```bash
   git commit -m 'feat: Adiciona MinhaFeature'
   ```
4. **Push** para a branch:
   ```bash
   git push origin feature/MinhaFeature
   ```
5. Abra um **Pull Request**

### **Padrões de Commit**
Use [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👤 Autor

**Seu Nome**
- 🌐 GitHub: [@seu-usuario](https://github.com/seu-usuario)
- 📧 Email: seu.email@exemplo.com
- 💼 LinkedIn: [Seu Nome](https://linkedin.com/in/seu-usuario)

---

## 🙏 Agradecimentos

- [Electron](https://www.electronjs.org/) - Framework desktop incrível
- [Tailwind CSS](https://tailwindcss.com/) - CSS utilitário moderno
- [OpenWeatherMap](https://openweathermap.org/) - Dados meteorológicos
- [Google Gemini](https://deepmind.google/technologies/gemini/) - IA avançada
- [MyMemory](https://mymemory.translated.net/) - Tradução gratuita
- Comunidade open source - Inspiração e suporte

---

## 📊 Status do Projeto

![Status](https://img.shields.io/badge/status-active-success)
![Maintenance](https://img.shields.io/badge/maintained-yes-brightgreen)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)
![Tests](https://img.shields.io/badge/tests-passing-brightgreen)

---

## 🔗 Links Úteis

- [📚 Documentação Completa](docs/)
- [🐛 Reportar Bug](https://github.com/seu-usuario/toolbox/issues)
- [💡 Sugerir Feature](https://github.com/seu-usuario/toolbox/issues)
- [📖 Changelog](CHANGELOG.md)

---

## 💡 Easter Eggs

Procure pelo botão "Sobre" no menu lateral... 😉

---

<div align="center">
  <strong>Feito com ❤️ e ☕</strong>
  <br><br>
  <sub>Se este projeto te ajudou, considere dar uma ⭐</sub>
  <br>
  <sub>Compartilhe com seus amigos! 🚀</sub>
</div>