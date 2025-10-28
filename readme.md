# 🐱 NyanTools にゃん~

<div align="center">

![NyanTools Logo](https://img.shields.io/badge/NyanTools-2.4.0-purple?style=for-the-badge&logo=electron)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Windows-0078D6?style=for-the-badge&logo=windows)
![Electron](https://img.shields.io/badge/Electron-27.0.0-47848F?style=for-the-badge&logo=electron)

**にゃん~ Your Purr-fect Toolkit! 🎌**

Uma aplicação desktop moderna e kawaii que reúne diversas ferramentas úteis em um só lugar.

[📥 Download](https://github.com/Fish7w7/Pandora/releases/latest) • [🐛 Reportar Bug](https://github.com/Fish7w7/Pandora/issues) • [💡 Sugerir Feature](https://github.com/Fish7w7/Pandora/discussions) • [📖 Documentação](https://github.com/Fish7w7/Pandora/wiki)

</div>

---

## 📋 Índice

- [✨ Funcionalidades](#-funcionalidades)
- [📥 Instalação](#-instalação)
- [⚙️ Configuração](#️-configuração)
- [🛠️ Ferramentas Incluídas](#️-ferramentas-incluídas)
- [📁 Estrutura do Projeto](#-estrutura-do-projeto)
- [🎯 Tecnologias](#-tecnologias)
- [📝 Roadmap](#-roadmap)
- [🤝 Contribuindo](#-contribuindo)
- [📄 Licença](#-licença)
- [🙏 Agradecimentos](#-agradecimentos)

---

## ✨ Funcionalidades

### 🎨 Interface Moderna
- 🌓 **Tema Escuro/Claro** - Alternância suave entre temas
- 🎨 **8 Esquemas de Cores** - Personalize seu app (em desenvolvimento)
- 💫 **Animações Fluidas** - Transições suaves e elegantes
- 📱 **Design Responsivo** - Adaptado para diferentes resoluções
- 🔔 **Notificações Modernas** - Sistema de notificações empilhadas e discretas
- ✨ **Efeitos Glass** - Backdrop blur e transparências modernas

### 🔧 Funcionalidades do Sistema
- 💾 **Auto-save** - Configurações salvas automaticamente
- 🔄 **Auto-update** - Sistema de atualização integrado com GitHub API
- 📥 **Download Integrado** - Baixa e instala atualizações automaticamente
- 🔐 **Sistema de Login** - Múltiplos usuários locais
- 📊 **Estatísticas de Uso** - Veja highscores e históricos
- 💾 **Backup e Restore** - Exporte/importe suas configurações
- 🧹 **Limpeza de Cache** - Gerenciador de dados

---

## 📥 Instalação

### **Windows (Recomendado)**

1. **Download Direto**
   ```
   👉 https://github.com/Fish7w7/Pandora/releases/latest
   ```

2. **Execute o Instalador**
   - Baixe `NyanTools-Setup-2.4.0.exe`
   - Execute como administrador
   - Siga o assistente de instalação

3. **Pronto! にゃん~**
   - Instalado em `C:\Program Files\NyanTools`
   - Atalho criado automaticamente

### **Desenvolvimento**
```bash
# Clone o repositório
git clone https://github.com/Fish7w7/Pandora.git
cd Pandora

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm start

# Ou com DevTools aberto
npm run dev
```

---

## ⚙️ Configuração

### **API Keys Necessárias**

#### **🌤️ OpenWeatherMap (Clima)**
1. Crie uma conta grátis: [openweathermap.org/api](https://openweathermap.org/api)
2. Vá em "My API Keys"
3. Copie sua chave padrão (ou crie uma nova)
4. Cole no app (ferramenta Clima)
5. ⏳ **IMPORTANTE**: Aguarde 10-15 minutos para ativação

**Formato**: `1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p` (32 caracteres)

#### **🤖 Google Gemini (IA)**
1. Acesse: [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Clique em "Create API Key"
3. Escolha um projeto do Google Cloud
4. Copie a chave gerada
5. Cole no app (Assistente IA)

**Modelo usado**: `gemini-2.5-flash-preview-09-2025`

---

## 🛠️ Ferramentas Incluídas

### 1. 🔑 Gerador de Senhas
- Senhas de **8-64 caracteres**
- Opções: maiúsculas, minúsculas, números, símbolos
- **Indicador de força** em tempo real (Fraca → Muito Forte)
- Design premium com gradientes coloridos
- Dicas de segurança integradas

### 2. 🌤️ Clima
- **Clima atual** com dados em tempo real
- **Previsão de 5 dias** com cards interativos
- Busca por **cidade** ou **GPS**
- Dados detalhados: umidade, vento, pressão, visibilidade, nascer/pôr do sol
- Cards rápidos: São Paulo, Rio, London, Tokyo
- Design adaptativo (cores mudam com temperatura)

### 3. 🌍 Tradutor Universal
- **12+ idiomas**: PT, EN, ES, FR, DE, IT, JA, KO, ZH, RU, AR, HI
- **Tradução em tempo real** enquanto digita (debounce de 1s)
- Contador de caracteres
- **Síntese de voz** (TTS) para ouvir traduções
- Botão de **inverter idiomas** animado (rotate 180°)
- API **MyMemory** gratuita e ilimitada
- Design glass premium

### 4. 🤖 Assistente IA
- Powered by **Google Gemini 2.5 Flash**
- Conversas naturais e contextuais
- **Markdown support** completo (negrito, itálico, código)
- **Syntax highlighting** para blocos de código
- Histórico persistente de conversas
- Atalhos rápidos: Piada, Dica, Aprender
- Botão de limpar conversa

### 5. 🎮 Mini Game (Cobrinha)
- Jogo clássico **Snake** arcade
- Sistema de **highscore** persistente
- Controles: teclado (setas) ou botões na tela
- Visual moderno com **glow effects**
- Grid semitransparente estilizado
- Comida com animação pulsante

### 6. 📧 Email Temporário
- **3 opções** de serviços:
  1. 🚀 **Serviços Online** (Temp-Mail, MinuteInbox, Tempail)
  2. 🎲 **Gerador Simples** de email aleatório
  3. 🎯 **Truque do "+"** para Gmail/Outlook
- Emails descartáveis para cadastros
- Copiar email com um clique
- Abrir inbox direto no navegador
- Dicas de segurança incluídas

### 7. 🎵 Player de Música
- **3 Playlists** via Cloudinary CDN:
  - 🎵 Lofi Chill Beats
  - 🎧 Electronic Vibes
  - 😾 Outros (depressivo lol)
- 🆕 **Modo Background** - Toca em TODAS as abas!
- **Mini player flutuante** quando troca de aba
- Controles completos: play, pause, anterior, próxima
- Barra de progresso animada
- Controle de volume
- Streaming 100% online (não ocupa espaço)

### 8. 📶 Zona Offline

**4 Jogos sem Internet:**

#### 🎯 **Jogo da Velha**
- 2 jogadores local
- Design moderno com gradientes
- Detecção de vitória e empate
- Botão de reiniciar

#### 🐍 **Cobrinha**
- Clone do Snake clássico
- Mesma engine do Mini Game
- Visual retrô pixelado

#### 🔤 **Termo** (NOVO! v2.3.2)
- **Wordle em português**
- Palavra do dia (muda a cada 24h)
- 6 tentativas para acertar
- Sistema de cores: Verde (certo), Amarelo (letra existe), Cinza (não tem)
- Teclado virtual interativo
- Compartilhar resultado (copiar emoji grid)
- 30+ palavras no banco de dados

#### 🎯 **Forca** (NOVO! v2.3.2)
- Jogo clássico de adivinhar palavras
- Palavra do dia (muda a cada 24h)
- 6 vidas (partes do boneco)
- Dica para cada palavra
- Teclado virtual com cores
- 40+ palavras variadas
- Compartilhar resultado

### 9. ⚙️ Configurações (NOVO! v2.3.2)

**5 Abas Completas:**

#### 🎨 **Aparência**
- Tema Claro/Escuro (funcional)
- 8 Esquemas de cores (em desenvolvimento)
- Preview visual dos temas

#### 🔄 **Atualizações**
- Sistema completo de auto-update
- Verificação automática ao iniciar
- Download integrado com barra de progresso
- Instalação com um clique
- Histórico de versões (changelog)
- Cache inteligente (reduz 90% das requisições)

#### 🔔 **Notificações**
- Habilitar/Desabilitar notificações
- Som de notificação (toggle)
- Botão de testar notificação

#### 💾 **Gerenciar Dados**
- Uso de armazenamento (visualização)
- **Exportar dados** (backup JSON)
- **Importar dados** (restore)
- Limpar cache
- **Resetar tudo** (confirmação dupla)

#### ℹ️ **Sobre**
- Informações do app
- Desenvolvedor e links
- Tecnologias usadas
- Licença MIT
- Links úteis (GitHub, Issues, Releases)

### 10. 🔄 Sistema de Atualizações (NOVO! v2.4.0)

**Features Avançadas:**
- ✅ **API GitHub oficial** (sem rate limit)
- ✅ **Cache de 1 hora** para economizar requisições
- ✅ **Download integrado** no app (Electron IPC)
- ✅ **Barra de progresso** em tempo real
- ✅ **Instalação automática** com um clique
- ✅ **Auto-check** ao iniciar (opcional)
- ✅ **Auto-download** de updates (opcional)
- ✅ **Fallbacks múltiplos** para máxima confiabilidade
- ✅ **Notificações elegantes** de nova versão

---

## 📁 Estrutura do Projeto

```
NyanTools/
├── 📦 backend/
│   └── src/
│       ├── main.js              # Entry point Electron
│       └── preload.js           # Bridge segura (IPC API)
│
├── 🎨 frontend/
│   ├── public/
│   │   ├── assets/
│   │   │   └── icons/           # Ícones multi-plataforma
│   │   │       ├── icon.png     # 512x512
│   │   │       ├── icon.ico     # Windows
│   │   │       └── icon.icns    # macOS
│   │   ├── index.html           # HTML principal
│   │   └── version.json         # Versão para auto-update
│   │
│   └── src/
│       ├── scripts/
│       │   ├── core/            # 🧠 Núcleo do app
│       │   │   ├── app.js       # Inicialização e gerenciamento
│       │   │   ├── auth.js      # Sistema de login
│       │   │   └── router.js    # Navegação SPA
│       │   │
│       │   ├── tools/           # 🛠️ Ferramentas individuais
│       │   │   ├── ai-assistant/
│       │   │   │   └── ai-chat.js
│       │   │   ├── mini-game/
│       │   │   │   └── game.js
│       │   │   ├── music-player/
│       │   │   │   └── music.js
│       │   │   ├── offline-zone/
│       │   │   │   ├── offline.js      # Menu principal
│       │   │   │   ├── termo.js        # ✨ Wordle PT
│       │   │   │   └── forca.js        # ✨ Jogo da Forca
│       │   │   ├── password-generator/
│       │   │   │   └── password.js
│       │   │   ├── settings/           # ⚙️ Sistema completo
│       │   │   │   └── settings.js     # 5 abas de config
│       │   │   ├── temp-email/
│       │   │   │   └── temp-email.js
│       │   │   ├── translator/
│       │   │   │   └── translator.js
│       │   │   ├── updater/            # 🔄 Auto-update
│       │   │   │   └── updater.js      # Sistema completo
│       │   │   └── weather/
│       │   │       └── weather.js
│       │   │
│       │   └── utils/           # 🔧 Utilidades
│       │       └── helpers.js   # Funções auxiliares
│       │
│       └── styles/
│           ├── main.css         # Estilos principais
│           ├── dark-theme.css   # 🌙 Tema escuro (v4.0)
│           └── animations.css   # Animações dos jogos
│
├── 📄 package.json              # Dependências e scripts
├── 📘 README.md                 # Este arquivo
├── 📜 LICENSE                   # Licença MIT
└── 🚀 publish.bat              # Script de publicação (Windows)
```

---

## 🔨 Build

### **Scripts Disponíveis**

```bash
# Desenvolvimento
npm start              # Inicia o app
npm run dev            # Inicia com DevTools aberto

# Build por plataforma
npm run build:win      # Windows (x64)
npm run build:mac      # macOS (x64 + ARM64)
npm run build:linux    # Linux (AppImage + DEB)
npm run build:all      # Todas as plataformas

```

### **Outputs do Build**

#### **Windows** (`npm run build:win`)
```
dist/
├── NyanTools-Setup-2.4.0.exe     # Instalador NSIS (recomendado)
└── NyanTools 2.4.0.exe           # Portátil (sem instalação)
```

#### **macOS** (`npm run build:mac`)
```
dist/
├── NyanTools-2.4.0-x64.dmg       # Intel
├── NyanTools-2.4.0-arm64.dmg     # Apple Silicon (M1/M2)
└── NyanTools-2.4.0-universal.dmg # Universal
```

#### **Linux** (`npm run build:linux`)
```
dist/
├── NyanTools-2.4.0-x64.AppImage  # AppImage
└── NyanTools-2.4.0-amd64.deb     # Debian/Ubuntu
```

---

## 🎯 Tecnologias

### **Core**
- ![Electron](https://img.shields.io/badge/Electron-27.0.0-47848F?logo=electron&logoColor=white) - Framework desktop multiplataforma
- ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black) - Linguagem principal
- ![Tailwind](https://img.shields.io/badge/Tailwind-3.0-38B2AC?logo=tailwind-css&logoColor=white) - Framework CSS utilitário

### **APIs Integradas**
- **OpenWeatherMap API** - Dados meteorológicos em tempo real
- **MyMemory API** - Tradução gratuita e ilimitada
- **Google Gemini API** - IA conversacional avançada
- **GitHub API** - Sistema de atualizações

### **Recursos Web**
- **LocalStorage** - Armazenamento local persistente
- **Geolocation API** - Localização GPS
- **Fetch API** - Requisições HTTP modernas
- **Speech Synthesis** - Text-to-Speech (TTS)
- **Canvas API** - Renderização dos jogos

### **Build & Deploy**
- **Electron Builder** - Empacotamento multiplataforma
- **NSIS** - Instalador Windows
- **DMG** - Instalador macOS
- **AppImage/DEB** - Instaladores Linux

---

## 📝 Roadmap

### **✅ Concluído (v2.4.0)**
- [x] Sistema de autenticação local
- [x] 10 ferramentas funcionais
- [x] Tema escuro completo e funcional
- [x] Sistema de configurações (5 abas)
- [x] Auto-update com download integrado
- [x] Termo e Forca (jogos diários)
- [x] Music player com modo background
- [x] Notificações modernas empilhadas
- [x] Build multiplataforma
- [x] Script de publicação automatizado

### **🚧 Em Desenvolvimento (v2.5.0)**
- [ ] 🎨 **Temas personalizáveis** - 8 esquemas de cores funcionais
- [ ] ⌨️ **Atalhos de teclado** - Ctrl+1-9 para ferramentas
- [ ] 🔖 **Sistema de favoritos** - Marcar ferramentas preferidas
- [ ] 📊 **Dashboard de estatísticas** - Tempo de uso, tool mais usado
- [ ] 📝 **Notas rápidas** - Bloco de notas com markdown
- [ ] 🔔 **Histórico de notificações** - Ver notificações antigas
- [ ] 🌐 **Multi-idioma** - Interface em PT, EN, ES
- [ ] 💾 **Sync na nuvem** - Google Drive/Dropbox

### **🔮 Futuro (v3.0.0)**
- [ ] ☁️ **Sistema de contas** - Login com Google/GitHub
- [ ] 🔄 **Sync entre dispositivos** - Dados em nuvem
- [ ] 👥 **Modo colaborativo** - Compartilhar com amigos
- [ ] 🤖 **IA com memória** - Conversas persistentes
- [ ] 🎮 **Loja de plugins** - Comunidade cria ferramentas
- [ ] 📱 **App mobile** - React Native
- [ ] 🌍 **Versão web** - PWA no navegador
- [ ] 🎯 **Workspaces** - Casa, Trabalho, Estudo

---

## 🤝 Contribuindo

Contribuições são muito bem-vindas! にゃん~ 🐱

### **Como Contribuir**

1. **Fork** o projeto
2. Crie uma **branch**: 
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
- `style:` Formatação (não afeta código)
- `refactor:` Refatoração
- `perf:` Melhoria de performance
- `test:` Testes
- `chore:` Manutenção

**Exemplos:**
```bash
feat: adiciona tema escuro
fix: corrige bug no tradutor
docs: atualiza README
style: formata código com prettier
refactor: simplifica lógica do router
```

### **Código de Conduta**

- 🤝 Seja respeitoso e inclusivo
- 🐛 Reporte bugs com detalhes
- 💡 Sugira features com clareza
- 📝 Documente suas mudanças
- ✅ Teste antes de enviar PR

---

## 📄 Licença

Este projeto está sob a licença **MIT**.

```
MIT License

Copyright (c) 2025 Fish7w7

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🙏 Agradecimentos

### **Frameworks & Libraries**
- [Electron](https://www.electronjs.org/) - Framework desktop incrível
- [Tailwind CSS](https://tailwindcss.com/) - CSS utilitário moderno
- [Electron Builder](https://www.electron.build/) - Build multiplataforma

### **APIs & Serviços**
- [OpenWeatherMap](https://openweathermap.org/) - API de clima gratuita
- [MyMemory](https://mymemory.translated.net/) - API de tradução
- [Google Gemini](https://deepmind.google/technologies/gemini/) - IA avançada
- [Cloudinary](https://cloudinary.com/) - CDN para músicas

### **Inspirações**
- [Notion](https://notion.so) - Design e UX
- [Discord](https://discord.com) - Sistema de temas
- [Spotify](https://spotify.com) - Music player
- [Wordle](https://www.nytimes.com/games/wordle/) - Jogo Termo

### **Comunidade**
- Stack Overflow - Soluções de problemas
- GitHub Community - Feedback e sugestões
- Electron Discord - Suporte técnico
- Todos que testaram e reportaram bugs にゃん~ 🐱

---

## 💡 Easter Eggs

🎁 Existem alguns easter eggs escondidos no app...

**Dicas:**
- Tente clicar no logo do NyanTools 10 vezes rápido にゃん~
- Procure pelo botão "Sobre" no menu
- Digite "konami code" em algum lugar... 🎮
- Clique no emoji 🐱 em lugares inesperados

---

## 📞 Suporte

### **Encontrou um bug?**
1. Verifique se já foi [reportado](https://github.com/Fish7w7/Pandora/issues)
2. Crie um [novo issue](https://github.com/Fish7w7/Pandora/issues/new) com:
   - Descrição clara do problema
   - Passos para reproduzir
   - Screenshots (se possível)
   - Versão do app
   - Sistema operacional

### **Tem uma sugestão?**
1. Acesse [Discussions](https://github.com/Fish7w7/Pandora/discussions)
2. Crie um novo tópico em "Ideas"
3. Descreva sua sugestão detalhadamente

### **Precisa de ajuda?**
- 📧 Email: kik73261@gmail.com
- 🌐 GitHub: [@Fish7w7](https://github.com/Fish7w7)
- 💬 Discussions: [GitHub Discussions](https://github.com/Fish7w7/Pandora/discussions)

---

## 📊 Estatísticas

![GitHub stars](https://img.shields.io/github/stars/Fish7w7/Pandora?style=social)
![GitHub forks](https://img.shields.io/github/forks/Fish7w7/Pandora?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/Fish7w7/Pandora?style=social)

![GitHub last commit](https://img.shields.io/github/last-commit/Fish7w7/Pandora)
![GitHub issues](https://img.shields.io/github/issues/Fish7w7/Pandora)
![GitHub pull requests](https://img.shields.io/github/issues-pr/Fish7w7/Pandora)
![GitHub downloads](https://img.shields.io/github/downloads/Fish7w7/Pandora/total)

---

## 👤 Autor

**Fish7w7**

- 🌐 GitHub: [@Fish7w7](https://github.com/Fish7w7)
- 📧 Email: kik73261@gmail.com
- 🐱 Nickname: Ga / Fish
- 📍 Localização: Brasil 🇧🇷

---

<div align="center">

## 💝 Apoie o Projeto

Se este projeto te ajudou, considere:

⭐ **Dar uma estrela** no GitHub
🐛 **Reportar bugs** para melhorar
💡 **Sugerir features** novas
📢 **Compartilhar** com amigos
☕ **Buy me a coffee** (em breve)

---

### **Feito com ❤️ e にゃん~**

*Your Purr-fect Toolkit! 🐱✨*

**[⬆ Voltar ao topo](#-nyantools-にゃん)**

</div>
