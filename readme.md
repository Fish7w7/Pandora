# 🐱 NyanTools にゃん~

<div align="center">

![NyanTools Logo](https://img.shields.io/badge/NyanTools-3.0.2-purple?style=for-the-badge&logo=electron)
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
- 🌓 **Tema Escuro/Claro** — Alternância suave com dark mode completo
- 🎨 **8 Esquemas de Cores** — Personalize a sidebar e destaques
- 💫 **Animações Fluidas** — Transições suaves e elegantes
- 📱 **Design Responsivo** — Adaptado para diferentes resoluções
- 🔔 **Notificações Modernas** — Sistema empilhado e discreto
- ✨ **Efeitos Glass** — Backdrop blur e transparências (login, mini player)
- 🖋️ **Tipografia Premium** — Syne (display) + DM Sans (corpo)

### 🔧 Funcionalidades do Sistema
- 💾 **Auto-save** — Configurações e dados salvos automaticamente
- 🔄 **Auto-update** — Sistema integrado com GitHub API + timeline de changelog
- 📥 **Download Integrado** — Baixa e instala atualizações automaticamente
- 🔐 **Sistema de Login** — Glassmorphism com animação de entrada
- 📊 **Dashboard de Estatísticas** — Uso por ferramenta, sequência de dias, recordes de jogos
- 💾 **Backup e Restore** — Exporte/importe suas configurações em JSON
- ⌨️ **Atalhos de Teclado** — Ctrl+1-9 e Ctrl+/ para ajuda interativa
- 🧹 **Limpeza de Cache** — Gerenciador de dados com métricas de uso

---

## 📥 Instalação

### **Windows (Recomendado)**

1. **Download Direto**
   ```
   👉 https://github.com/Fish7w7/Pandora/releases/latest
   ```

2. **Execute o Instalador**
   - Baixe `NyanTools-Setup-3.0.1.exe`
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

### 1. 📊 Dashboard
- **Estatísticas de uso** — tempo total, sequência de dias, ferramenta mais usada
- **Atividade semanal** — gráfico de barras com uso por dia da semana
- **Calendário dos últimos 30 dias** — visualização de dias ativos
- **Recordes de jogos** — Cobrinha, Termo, 2048, Flappy Bird
- **Resumo de Notas e Tarefas** — total, fixadas, concluídas e progresso

### 2. 🔑 Gerador de Senhas
- Senhas de **8-64 caracteres**
- Opções: maiúsculas, minúsculas, números, símbolos
- **Indicador de força** em tempo real (Fraca → Muito Forte)
- Design premium com gradientes coloridos
- Dicas de segurança integradas

### 3. 🌤️ Clima
- **Clima atual** com dados em tempo real
- **Previsão de 5 dias** com cards interativos
- Busca por **cidade** ou **GPS**
- Dados detalhados: umidade, vento, pressão, visibilidade, nascer/pôr do sol
- Cards rápidos: São Paulo, Rio, London, Tokyo
- Design adaptativo (cores mudam com temperatura)

### 4. 🌍 Tradutor Universal
- **12+ idiomas**: PT, EN, ES, FR, DE, IT, JA, KO, ZH, RU, AR, HI
- **Tradução em tempo real** enquanto digita (debounce de 1s)
- Contador de caracteres
- **Síntese de voz** (TTS) para ouvir traduções
- Botão de **inverter idiomas** animado
- API **MyMemory** gratuita e ilimitada

### 5. 🤖 Assistente IA
- Powered by **Google Gemini 2.5 Flash**
- Conversas naturais e contextuais
- **Markdown support** completo (negrito, itálico, código)
- **Syntax highlighting** para blocos de código
- Histórico persistente de conversas
- Atalhos rápidos e botão de limpar conversa

### 6. 🎮 Mini Game (Cobrinha)
- Jogo clássico **Snake** arcade
- Sistema de **highscore** persistente (integrado ao Dashboard)
- Controles: teclado (setas/WASD) ou botões na tela
- Visual moderno com **glow effects** e olhinhos na cabeça
- Velocidade aumenta progressivamente a cada 50 pontos
- Fix v3.0.1: spam de game over ao reiniciar corrigido

### 7. 📧 Email Temporário
- **3 opções** de serviços:
  1. 🚀 **Serviços Online** (Temp-Mail, MinuteInbox, Tempail)
  2. 🎲 **Gerador Simples** de email aleatório
  3. 🎯 **Truque do "+"** para Gmail/Outlook
- Copiar email com um clique
- Dicas de segurança incluídas

### 8. 🎵 Player de Música
- **3 Playlists** via Cloudinary CDN:
  - 🎵 Lofi Chill Beats
  - 🎧 Electronic Vibes
  - 😾 Outros
- **Modo Background** — toca em **todas as abas** sem pausar
- **Mini player flutuante** e arrastável quando troca de aba
- Controles completos: play, pause, anterior, próxima
- Barra de progresso animada + controle de volume
- Streaming 100% online (sem ocupar espaço local)

### 9. 📝 Notas Rápidas
- Criar, editar e excluir notas com título e conteúdo
- **📌 Fixar notas** — pins sempre ficam no topo
- **Busca em tempo real** por título e conteúdo
- Cards coloridos com 5 paletas (compatíveis com dark mode)
- Ordenação automática: fixadas primeiro, depois por data
- Contador de caracteres e data formatada
- Dark mode completo (v3.0.1)

### 10. ✅ Lista de Tarefas
- Criar tarefas com título, descrição e **prioridade** (Alta/Média/Baixa)
- **Marcar como concluída** com data de conclusão registrada
- Filtros: Todas / Ativas / Concluídas
- Ordenação: Data de criação / Prioridade / Título A-Z
- Cards com borda colorida por prioridade (vermelha/amarela/verde)
- Estatísticas: total, ativas, concluídas e % de progresso
- Dark mode completo (v3.0.1)

### 11. 📶 Zona Offline

**Jogos sem internet:**

#### 🎯 **Jogo da Velha**
- 2 jogadores local
- Detecção de vitória e empate
- Design moderno com gradientes

#### 🔤 **Termo**
- **Wordle em português**
- Palavra do dia (muda a cada 24h)
- 6 tentativas para acertar
- Sistema de cores: Verde (certo), Amarelo (letra existe), Cinza (não tem)
- Teclado virtual interativo
- Salva melhor tentativa no Dashboard
- Compartilhar resultado (emoji grid)

#### 🎯 **Forca**
- Palavra do dia com **dica** para cada palavra
- 6 vidas com boneco animado
- Teclado virtual com cores
- Compartilhar resultado

#### 🔢 **2048**
- Jogo clássico de deslizar e combinar tiles
- Pontuação salva automaticamente no Dashboard
- Dark mode completo (tiles 2 e 4 visíveis)

#### 🐱 **Flappy Nyan**
- Versão kawaii do Flappy Bird
- Highscore salvo e exibido no Dashboard
- Fix v3.0.0: spam de game over corrigido

### 12. ⚙️ Configurações

**5 Abas Completas:**

#### 🎨 **Aparência**
- Tema Claro/Escuro (funcional e completo)
- **8 Esquemas de cores** — Roxo, Azul, Verde, Vermelho, Laranja, Rosa, Turquesa, Índigo
- Preview visual animado com badge "ATIVO" sem re-render completo

#### 🔄 **Atualizações**
- Verificação manual + automática ao iniciar
- Download integrado com barra de progresso em tempo real
- **Timeline vertical de changelog** com versão, autor e data
- Cache inteligente (5 minutos entre verificações)
- Fallback para abrir no navegador sem Electron

#### 🔔 **Notificações**
- Habilitar/Desabilitar notificações
- Som de notificação (toggle)
- Botão de testar notificação

#### 💾 **Dados**
- Uso de armazenamento com barra de progresso colorida
- **Exportar backup** (JSON)
- **Importar backup** (restore)
- Limpar cache
- **Resetar tudo** (confirmação dupla)

#### ℹ️ **Sobre**
- Informações do app e versão atual
- Desenvolvedores (Gabriel + Clara)
- Links úteis (GitHub, Issues, Releases, Discussions)
- Tecnologias usadas
- Licença MIT

---

## ⌨️ Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `Ctrl + 1` | Dashboard |
| `Ctrl + 2` | Gerador de Senhas |
| `Ctrl + 3` | Clima |
| `Ctrl + 4` | Tradutor |
| `Ctrl + 5` | Assistente IA |
| `Ctrl + 6` | Mini Game |
| `Ctrl + 7` | Email Temporário |
| `Ctrl + 8` | Player de Música |
| `Ctrl + 9` | Zona Offline |
| `Ctrl + 0` | Notas Rápidas |
| `Ctrl + T` | Tarefas |
| `Ctrl + S` | Configurações |
| `Ctrl + /` | Ver todos os atalhos |
| `Esc` | Fechar modais |

> Atalhos não funcionam quando você está digitando em campos de texto.

---

## 📁 Estrutura do Projeto

```
NyanTools/
├── 📦 backend/
│   └── src/
│       ├── main.js              # Entry point Electron (otimizado v3.0)
│       └── preload.js           # Bridge segura — IPC API v3.0
│
├── 🎨 frontend/
│   ├── public/
│   │   ├── assets/
│   │   │   └── icons/           # Ícones multi-plataforma
│   │   │       ├── icon.png     # 512x512
│   │   │       ├── icon.ico     # Windows
│   │   │       └── icon.icns    # macOS
│   │   ├── index.html           # HTML principal
│   │   └── version.json         # Versão + changelog para auto-update
│   │
│   └── src/
│       ├── scripts/
│       │   ├── core/            # 🧠 Núcleo do app
│       │   │   ├── app.js       # Inicialização, tracking de atividade
│       │   │   ├── auth.js      # Sistema de login
│       │   │   ├── router.js    # Navegação SPA
│       │   │   └── keyboard-shortcuts.js  # ⌨️ Atalhos globais
│       │   │
│       │   ├── tools/           # 🛠️ Ferramentas individuais
│       │   │   ├── dashboard/
│       │   │   │   └── dashboard.js     # 📊 Stats, gráficos, recordes
│       │   │   ├── ai-assistant/
│       │   │   │   └── ai-chat.js
│       │   │   ├── mini-game/
│       │   │   │   └── game.js
│       │   │   ├── music-player/
│       │   │   │   └── music.js         # Mini player flutuante
│       │   │   ├── notes/
│       │   │   │   └── notes.js         # 📝 Notas com pins e busca
│       │   │   ├── tasks/
│       │   │   │   └── tasks.js         # ✅ Tarefas com prioridade
│       │   │   ├── offline-zone/
│       │   │   │   ├── offline.js       # Menu principal
│       │   │   │   ├── termo.js         # Wordle PT
│       │   │   │   ├── forca.js         # Jogo da Forca
│       │   │   │   ├── 2048.js          # 🔢 Jogo 2048
│       │   │   │   ├── flappy-bird.js   # 🐱 Flappy Nyan
│       │   │   │   └── tictactoe.js     # Jogo da Velha
│       │   │   ├── password-generator/
│       │   │   │   └── password.js
│       │   │   ├── settings/
│       │   │   │   └── settings.js      # 5 abas + ThemeManager
│       │   │   ├── temp-email/
│       │   │   │   └── temp-email.js
│       │   │   ├── translator/
│       │   │   │   └── translator.js
│       │   │   ├── updater/
│       │   │   │   └── updater.js       # Timeline changelog + download
│       │   │   └── weather/
│       │   │       └── weather.js
│       │   │
│       │   └── utils/
│       │       └── helpers.js           # Utilitários globais
│       │
│       └── styles/
│           ├── main.css                 # Estilos principais + mini player
│           ├── dark-theme.css           # 🌙 Dark mode v2.7.1 completo
│           ├── theme-system.css         # 8 temas de cor + CSS vars
│           ├── density-fix.css          # Ajustes de zoom e densidade
│           └── animations.css           # Animações dos jogos
│
├── 📄 package.json
├── 📘 README.md
├── 📜 LICENSE
└── 🚀 publish.bat
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
├── NyanTools-Setup-3.0.1.exe     # Instalador NSIS (recomendado)
└── NyanTools 3.0.1.exe           # Portátil (sem instalação)
```

#### **macOS** (`npm run build:mac`)
```
dist/
├── NyanTools-3.0.1-x64.dmg       # Intel
├── NyanTools-3.0.1-arm64.dmg     # Apple Silicon (M1/M2)
└── NyanTools-3.0.1-universal.dmg # Universal
```

#### **Linux** (`npm run build:linux`)
```
dist/
├── NyanTools-3.0.1-x64.AppImage  # AppImage
└── NyanTools-3.0.1-amd64.deb     # Debian/Ubuntu
```

---

## 🎯 Tecnologias

### **Core**
- ![Electron](https://img.shields.io/badge/Electron-27.0.0-47848F?logo=electron&logoColor=white) — Framework desktop multiplataforma
- ![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?logo=javascript&logoColor=black) — Linguagem principal
- ![Tailwind](https://img.shields.io/badge/Tailwind-3.x-38B2AC?logo=tailwind-css&logoColor=white) — Framework CSS utilitário

### **APIs Integradas**
- **OpenWeatherMap API** — Dados meteorológicos em tempo real
- **MyMemory API** — Tradução gratuita e ilimitada
- **Google Gemini API** — IA conversacional avançada
- **GitHub API** — Sistema de atualizações automáticas

### **Recursos Web**
- **LocalStorage** — Armazenamento local persistente
- **Geolocation API** — Localização GPS
- **Fetch API** — Requisições HTTP modernas
- **Speech Synthesis** — Text-to-Speech (TTS)
- **Canvas API** — Renderização dos jogos (Snake, Flappy Bird)
- **Audio API** — Player de música com streaming

### **Build & Deploy**
- **Electron Builder** — Empacotamento multiplataforma
- **NSIS** — Instalador Windows
- **DMG** — Instalador macOS
- **AppImage/DEB** — Instaladores Linux

---

## 📝 Roadmap

### **✅ Concluído (v3.0.1 — atual)**
- [x] Dashboard com tracking de atividade e recordes
- [x] Notas Rápidas com pins, busca e dark mode
- [x] Lista de Tarefas com prioridades e dark mode
- [x] Jogo 2048 na Zona Offline
- [x] Flappy Nyan na Zona Offline
- [x] Atalhos de teclado globais (Ctrl+1-9, Ctrl+/)
- [x] Settings v3.0 com ThemeManager sem re-render
- [x] Updater v3.0 com timeline vertical de changelog
- [x] Login screen glassmorphism + orbs flutuantes
- [x] Loading screen com animação glow pulsante
- [x] Mini player flutuante e arrastável
- [x] Dark mode completo em todas as ferramentas
- [x] 8 temas de cor funcionais

### **🚧 Em Desenvolvimento (v3.1.0)**
- [ ] 🌐 **Multi-idioma UI** — Interface em PT, EN, ES
- [ ] 🧮 **Calculadora Científica** — Operações avançadas
- [ ] 📐 **Conversor de Unidades** — Temperatura, peso, distância
- [ ] 📊 **Histórico de uso mais detalhado** no Dashboard
- [ ] 🔖 **Sistema de favoritos** — Fixar ferramentas no menu

### **🎯 Próximas Versões**
- [ ] 📝 **Editor de Markdown** — Preview em tempo real
- [ ] 🔐 **Gerenciador de senhas** — Vault local criptografado
- [ ] 📷 **Screenshot tool** — Captura de tela com anotações
- [ ] 🎤 **Gravador de áudio** — Gravar e salvar áudio
- [ ] 🌍 **Versão web (PWA)**

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
- `chore:` Manutenção

---

## 📄 Licença

Este projeto está sob a licença **MIT**.

```
MIT License

Copyright (c) 2026 Fish7w7

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Agradecimentos

### **Frameworks & Libraries**
- [Electron](https://www.electronjs.org/) — Framework desktop incrível
- [Tailwind CSS](https://tailwindcss.com/) — CSS utilitário moderno
- [Electron Builder](https://www.electron.build/) — Build multiplataforma
- [Google Fonts](https://fonts.google.com/) — Syne e DM Sans

### **APIs & Serviços**
- [OpenWeatherMap](https://openweathermap.org/) — API de clima gratuita
- [MyMemory](https://mymemory.translated.net/) — API de tradução
- [Google Gemini](https://deepmind.google/technologies/gemini/) — IA avançada
- [Cloudinary](https://cloudinary.com/) — CDN para músicas
- [GitHub API](https://docs.github.com/en/rest) — Sistema de atualizações

### **Inspirações**
- [Notion](https://notion.so) — Design e UX
- [Discord](https://discord.com) — Sistema de temas
- [Spotify](https://spotify.com) — Music player e mini player
- [Wordle](https://www.nytimes.com/games/wordle/) — Jogo Termo

---

## 📞 Suporte

### **Encontrou um bug?**
1. Verifique se já foi [reportado](https://github.com/Fish7w7/Pandora/issues)
2. Crie um [novo issue](https://github.com/Fish7w7/Pandora/issues/new) com:
   - Descrição clara do problema
   - Passos para reproduzir
   - Screenshots (se possível)
   - Versão do app e sistema operacional

### **Tem uma sugestão?**
1. Acesse [Discussions](https://github.com/Fish7w7/Pandora/discussions)
2. Crie um novo tópico em "Ideas"

### **Contato dos Desenvolvedores**

| Dev | Papel | Contato |
|-----|-------|---------|
| Gabriel | Desenvolvedor Principal | [GitHub](https://github.com/Fish7w7) · kik73261@gmail.com |
| Clara | Desenvolvedora Principal | clara.mendes@proton.me |

---

## 📊 Estatísticas

![GitHub stars](https://img.shields.io/github/stars/Fish7w7/Pandora?style=social)
![GitHub forks](https://img.shields.io/github/forks/Fish7w7/Pandora?style=social)
![GitHub last commit](https://img.shields.io/github/last-commit/Fish7w7/Pandora)
![GitHub issues](https://img.shields.io/github/issues/Fish7w7/Pandora)
![GitHub downloads](https://img.shields.io/github/downloads/Fish7w7/Pandora/total)

---

## 💡 Easter Eggs

🎁 Existem alguns easter eggs escondidos no app...

**Dicas:**
- Clique várias vezes no logo do NyanTools にゃん~
- Explore o botão "Sobre" nas configurações
- Preste atenção no código do easter egg em `app.js`... 👀

---

<div align="center">

## 💝 Apoie o Projeto

Se este projeto te ajudou, considere:

⭐ **Dar uma estrela** no GitHub
🐛 **Reportar bugs** para melhorar
💡 **Sugerir features** novas
📢 **Compartilhar** com amigos

---

### **Feito com ❤️ e にゃん~**

*Your Purr-fect Toolkit! 🐱✨*

**v3.0.1 — Phoenix Update**

**[⬆ Voltar ao topo](#-nyantools-にゃん)**

</div>
