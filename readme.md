# 🐱 NyanTools にゃん~

<div align="center">

![NyanTools Logo](https://img.shields.io/badge/NyanTools-3.6.0-purple?style=for-the-badge&logo=electron)
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
- [⌨️ Atalhos de Teclado](#️-atalhos-de-teclado)
- [📝 Roadmap](#-roadmap)
- [🤝 Contribuindo](#-contribuindo)
- [📄 Licença](#-licença)
- [🙏 Agradecimentos](#-agradecimentos)

---

## ✨ Funcionalidades

### 🎨 Interface Moderna
- 🌓 **Tema Escuro/Claro** — Alternância suave com dark mode completo
- 🎨 **8 Esquemas de Cores** — Personalize a sidebar e destaques
- 💫 **Micro-animações** — Scale + ripple effect em todos os botões
- 📱 **Design Responsivo** — Adaptado para diferentes resoluções
- 🔔 **Notificações Modernas** — Sistema empilhado e discreto
- ✨ **Efeitos Glass** — Backdrop blur e transparências
- 🖋️ **Tipografia Premium** — Syne (display) + DM Sans (corpo) com CSS vars

### 🔧 Funcionalidades do Sistema
- 👤 **Avatar Gerado** — Gatinho SVG único por nome, aparece na sidebar e no perfil
- 👤 **Sistema de Perfil** — Foto, nome, senha e estatísticas pessoais
- 🏆 **Conquistas** — 5 badges desbloqueáveis por comportamento de uso
- ⭐ **Favoritos** — Fixe até 5 ferramentas no topo da sidebar com drag-to-reorder
- 🎯 **Modo Foco** — Sidebar oculta com peek animado (Ctrl+Shift+F)
- 🔍 **Command Palette** — Busca universal com Ctrl+P
- 🧭 **Histórico de Navegação** — Alt+← volta, Alt+→ avança entre ferramentas
- 💾 **Auto-save** — Configurações e dados salvos automaticamente
- 🔄 **Auto-update** — Sistema integrado com GitHub API + changelog + barra de progresso
- 🔐 **Tela de Login** — Glassmorphism com fundo dinâmico por horário e intro animada
- 📊 **Dashboard de Estatísticas** — Uso por ferramenta, sequência de dias, recordes
- 💾 **Backup e Restore** — Exporte/importe configurações em JSON
- ⌨️ **Atalhos de Teclado** — Navegação rápida com Ctrl+1-9 e Ctrl+P
- 🐾 **Easter Egg** — Konami Code escondido (↑↑↓↓←→←→BA)

---

## 📥 Instalação

### **Windows (Recomendado)**

1. **Download Direto**
   ```
   👉 https://github.com/Fish7w7/Pandora/releases/latest
   ```

2. **Execute o Instalador**
   - Baixe `NyanTools-3.6.0-Setup.exe`
   - Execute e siga o assistente de instalação

3. **Pronto! にゃん~**
   - Atalho criado automaticamente na área de trabalho

### **Desenvolvimento**

```bash
# Clone o repositório
git clone https://github.com/Fish7w7/Pandora.git
cd Pandora

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm run dev
```

---

## ⚙️ Configuração

### **API Keys Necessárias**

#### **🌤️ OpenWeatherMap (Clima)**
1. Crie uma conta grátis em [openweathermap.org/api](https://openweathermap.org/api)
2. Copie sua API Key e cole na ferramenta Clima
3. ⏳ Aguarde 10-15 minutos para ativação

**Formato**: `1a2b3c4d5e6f7g8h9i0j` (32 caracteres)

#### **🤖 Google Gemini (IA)**
1. Acesse [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Crie uma API Key e cole no Assistente IA

**Modelo usado**: `gemini-2.5-flash`

---

## 🛠️ Ferramentas Incluídas

### 1. 📊 Dashboard
- Estatísticas de uso: tempo total, sequência de dias, ferramenta mais usada
- Gráfico de atividade semanal com barras animadas
- Calendário de histórico de uso (30 dias)
- Recordes de jogos: Cobrinha, Termo, 2048, Flappy Bird
- Resumo de Notas e Tarefas com progresso

### 2. 👤 Perfil
- Avatar SVG gerado automaticamente por nome (gatinho único)
- Upload de foto de perfil (JPG, PNG, GIF · máx. 2MB)
- Editar nome de usuário com atualização em tempo real na sidebar
- Trocar senha com validação
- Tab de Estatísticas: tempo total, dias ativos, sequência, top ferramentas

### 3. 🏆 Conquistas
- 🐣 **Primeiro Passo** — Primeiro login no NyanTools
- 🖱️ **Centenário** — 100 acessos a ferramentas
- 🔥 **Semana de Fogo** — 7 dias consecutivos de uso
- ⏱️ **Maratonista** — 1 hora de uso em um único dia
- 🌙 **Coruja Noturna** — Usou o app entre 00h e 05h
- Barra de progresso para conquistas parciais + notificação ao desbloquear

### 4. 🔑 Gerador de Senhas
- Senhas de 8 a 64 caracteres
- Opções: maiúsculas, minúsculas, números, símbolos
- Indicador de força em tempo real

### 5. 🌤️ Clima
- Clima atual com dados em tempo real via OpenWeatherMap
- Previsão de 5 dias com cards interativos
- Busca por cidade ou GPS
- Dados detalhados: umidade, vento, pressão, visibilidade

### 6. 🌍 Tradutor Universal
- 12+ idiomas: PT, EN, ES, FR, DE, IT, JA, KO, ZH, RU, AR, HI
- Tradução em tempo real com debounce
- Síntese de voz (TTS) para ouvir traduções
- API MyMemory gratuita e ilimitada

### 7. 🤖 Assistente IA
- Powered by Google Gemini 2.5 Flash
- Conversas contextuais com histórico persistente
- Markdown e syntax highlighting completos

### 8. 🎮 Mini Game (Cobrinha)
- Jogo Snake clássico com arena espacial e estrelas
- Itens especiais: ⭐ x2pts (20% chance) e 💎 x3pts (7% chance)
- Highscore persistente integrado ao Dashboard
- Controles: teclado (setas/WASD) ou botões na tela

### 9. 📧 Email Temporário
- 3 opções: serviços online, gerador simples, truque do "+"
- Copiar email com um clique

### 10. 🎵 Player de Música
- 3 playlists via Cloudinary CDN
- Modo background: toca em todas as abas sem pausar
- Mini player flutuante quando troca de aba

### 11. 📝 Notas Rápidas
- Criar, editar e excluir notas com título e conteúdo
- Fixar notas (pins sempre no topo)
- Busca em tempo real por título e conteúdo
- Cards coloridos com 5 paletas
- Empty state ilustrado com botão de criação

### 12. ✅ Lista de Tarefas
- Tarefas com título, descrição e prioridade (Alta/Média/Baixa)
- Filtros: Todas / Ativas / Concluídas
- Estatísticas: total, ativas, concluídas e % de progresso
- Empty state contextual por filtro ativo

### 13. 📶 Zona Offline

Jogos sem internet:

- 🎯 **Jogo da Velha** — vs IA com 3 dificuldades rebalanceadas (Fácil/Médio/Difícil)
- 🔤 **Termo** — Wordle em português, palavra do dia, 6 tentativas
- 🎯 **Forca** — Palavra do dia com dica, 6 vidas
- 🔢 **2048** — Clássico deslizar e combinar tiles
- 🐱 **Flappy Nyan** — Versão kawaii do Flappy Bird

### 14. ⚙️ Configurações

**5 Abas Completas:**

- 🎨 **Aparência** — Tema Claro/Escuro + 8 esquemas de cores + Modo Foco + Intro Animada
- 🔄 **Atualizações** — Verificação manual/automática com timeline de changelog e barra de progresso
- 🔔 **Notificações** — Habilitar/desabilitar por tipo
- 💾 **Dados** — Backup/restore, limpeza de cache, resetar tudo
- ℹ️ **Sobre** — Versão, desenvolvedores, tecnologias, licença

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
| `Ctrl + U` | Perfil |
| `Ctrl + P` | Command Palette |
| `Ctrl + Shift + F` | Modo Foco |
| `Alt + ←` | Voltar (histórico) |
| `Alt + →` | Avançar (histórico) |
| `Ctrl + /` | Ver todos os atalhos |
| `Esc` | Fechar modais / sair de jogos |

> Atalhos não funcionam quando você está digitando em campos de texto.

---

## 📁 Estrutura do Projeto

```
NyanTools/
├── 📦 backend/
│   └── src/
│       ├── main.js              # Entry point Electron
│       └── preload.js           # Bridge segura — IPC API
│
├── 🎨 frontend/
│   ├── public/
│   │   ├── assets/
│   │   │   └── icons/           # Ícones multi-plataforma
│   │   │       ├── icon.png
│   │   │       ├── icon.ico
│   │   │       └── icon.icns
│   │   ├── index.html
│   │   └── version.json         # Versão + changelog
│   │
│   └── src/
│       ├── scripts/
│       │   ├── core/
│       │   │   ├── app.js                # Inicialização, tracking
│       │   │   ├── auth.js               # Sistema de login
│       │   │   ├── router.js             # Navegação SPA + histórico
│       │   │   ├── avatar-generator.js   # 🐱 Avatar SVG por nome
│       │   │   ├── favorites.js          # ⭐ Sistema de favoritos
│       │   │   ├── achievements.js       # 🏆 Sistema de conquistas
│       │   │   ├── beta-testers.js       # 🐾 Easter egg Konami
│       │   │   ├── command-palette.js    # 🔍 Busca universal
│       │   │   ├── focus-mode.js         # 🎯 Modo foco
│       │   │   ├── login-background.js   # 🌅 Fundo dinâmico por horário
│       │   │   ├── login-effects.js      # ✨ Micro-interações do login
│       │   │   ├── login-intro.js        # 🎬 Intro animada
│       │   │   ├── login-particles.js    # 🌟 Partículas decorativas
│       │   │   ├── login-phrases.js      # 💬 Frases motivacionais
│       │   │   └── keyboard-shortcuts.js # ⌨️ Atalhos globais
│       │   │
│       │   └── tools/
│       │       ├── dashboard/dashboard.js
│       │       ├── profile/profile.js
│       │       ├── ai-assistant/ai-chat.js
│       │       ├── mini-game/game.js
│       │       ├── music-player/music.js
│       │       ├── notes/notes.js
│       │       ├── tasks/tasks.js
│       │       ├── offline-zone/
│       │       │   ├── offline.js
│       │       │   ├── termo.js
│       │       │   ├── forca.js
│       │       │   ├── 2048.js
│       │       │   ├── flappy-bird.js
│       │       │   └── tictactoe.js
│       │       ├── password-generator/password.js
│       │       ├── settings/settings.js
│       │       ├── temp-email/temp-email.js
│       │       ├── translator/translator.js
│       │       ├── updater/updater.js
│       │       └── weather/weather.js
│       │
│       └── styles/
│           ├── main.css
│           ├── dark-theme.css
│           ├── theme-system.css  # CSS vars de cor + tipografia
│           ├── focus-mode.css
│           ├── profile.css
│           ├── density-fix.css
│           ├── animations.css    # Micro-animações + ripple
│           └── command-palette.css
│
├── 📄 package.json
├── 📘 README.md
└── 📜 LICENSE
```

---

## 🔨 Build

```bash
npm run build:win      # Windows (x64)
npm run build:mac      # macOS (x64 + ARM64)
npm run build:linux    # Linux (AppImage + DEB)
npm run build:all      # Todas as plataformas
```

### **Outputs**

```
dist/
├── NyanTools-3.6.0-Setup.exe       # Windows — instalador
├── NyanTools 3.6.0.exe             # Windows — portátil
├── NyanTools-3.6.0-x64.dmg        # macOS Intel
├── NyanTools-3.6.0-arm64.dmg      # macOS Apple Silicon
├── NyanTools-3.6.0-x64.AppImage   # Linux
└── NyanTools-3.6.0-amd64.deb      # Linux Debian/Ubuntu
```

---

## 🎯 Tecnologias

### **Core**
- ![Electron](https://img.shields.io/badge/Electron-27.0.0-47848F?logo=electron&logoColor=white)
- ![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?logo=javascript&logoColor=black)
- ![Tailwind](https://img.shields.io/badge/Tailwind-3.x-38B2AC?logo=tailwind-css&logoColor=white)

### **APIs Integradas**
- **OpenWeatherMap** — Dados meteorológicos
- **MyMemory** — Tradução gratuita
- **Google Gemini** — IA conversacional
- **GitHub API** — Atualizações automáticas

### **Build**
- **Electron Builder** — Empacotamento multiplataforma
- **NSIS** — Instalador Windows
- **DMG** — Instalador macOS
- **AppImage/DEB** — Linux

---

## 📝 Roadmap

### **✅ v3.6.0 "Smooth & Pretty" — Atual**
- [x] Avatar SVG gerado automaticamente por nome
- [x] Redesign dos cards do Dashboard e Zona Offline
- [x] Empty States ilustrados (Notas, Tarefas, Favoritos)
- [x] CSS vars de tipografia globais
- [x] Micro-animações nos botões (scale + ripple)
- [x] Histórico de navegação (Alt+← / Alt+→)
- [x] Barra de progresso do download corrigida

### **✅ v3.5.0 "First Impression"**
- [x] Tela de login com fundo dinâmico por horário
- [x] 80+ frases motivacionais com typing effect
- [x] Intro animada ao abrir o app
- [x] Loading screen redesenhada
- [x] Partículas decorativas no fundo do login

### **✅ v3.4.x "Tanuki"**
- [x] Sistema de auto-update com GitHub API
- [x] Barra de progresso do download (fix definitivo na v3.6.0)
- [x] Fallback automático quando native updater falha

### **🚧 v3.7.0 "Zona Arcade" — Próxima**
- [ ] Type Racer — jogo de digitação com WPM e precisão
- [ ] Caça-Níquel — jogo casual com símbolos do NyanTools
- [ ] Quiz Diário — 10 perguntas de cultura geral, mesmas para todos no mesmo dia

### **🔮 v3.8.0 "Nyan Economy"**
- [ ] Clicker Idle com moeda Nyans e upgrades

---

## 🤝 Contribuindo

1. **Fork** o projeto
2. Crie uma **branch**: `git checkout -b feature/MinhaFeature`
3. **Commit**: `git commit -m 'feat: Adiciona MinhaFeature'`
4. **Push**: `git push origin feature/MinhaFeature`
5. Abra um **Pull Request**

### **Padrões de Commit**
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `perf:` Melhoria de performance
- `refactor:` Refatoração

---

## 📄 Licença

MIT License — Copyright (c) 2026 Fish7w7

---

## 🙏 Agradecimentos

- [Electron](https://www.electronjs.org/) — Framework desktop
- [Tailwind CSS](https://tailwindcss.com/) — CSS utilitário
- [Google Fonts](https://fonts.google.com/) — Syne e DM Sans
- [OpenWeatherMap](https://openweathermap.org/) — API de clima
- [Google Gemini](https://deepmind.google/technologies/gemini/) — IA
- [Cloudinary](https://cloudinary.com/) — CDN para músicas
- [GitHub API](https://docs.github.com/en/rest) — Atualizações

---

## 📞 Suporte

| Dev | Papel | Contato |
|-----|-------|---------|
| Gabriel | Desenvolvedor Principal | [GitHub](https://github.com/Fish7w7) · kik73261@gmail.com |
| Clara | Desenvolvedora Principal | clara.mendes@proton.me |

**Encontrou um bug?** → [Abra um issue](https://github.com/Fish7w7/Pandora/issues/new)
**Tem uma sugestão?** → [Discussions](https://github.com/Fish7w7/Pandora/discussions)

---

## 📊 Estatísticas

![GitHub stars](https://img.shields.io/github/stars/Fish7w7/Pandora?style=social)
![GitHub forks](https://img.shields.io/github/forks/Fish7w7/Pandora?style=social)
![GitHub last commit](https://img.shields.io/github/last-commit/Fish7w7/Pandora)
![GitHub issues](https://img.shields.io/github/issues/Fish7w7/Pandora)
![GitHub downloads](https://img.shields.io/github/downloads/Fish7w7/Pandora/total)

---

## 💡 Easter Eggs

🎁 Existem easter eggs escondidos no app...

- Clique várias vezes no logo 🐱 da sidebar
- Digite o Konami Code em qualquer tela: ↑↑↓↓←→←→BA

---

<div align="center">

## 💝 Apoie o Projeto

⭐ **Dar uma estrela** no GitHub
🐛 **Reportar bugs** para melhorar
💡 **Sugerir features** novas
📢 **Compartilhar** com amigos

---

### **Feito com ❤️ e にゃん~**

*Your Purr-fect Toolkit! 🐱✨*

**v3.6.0 — Smooth & Pretty ✨**

**[⬆ Voltar ao topo](#-nyantools-にゃん)**

</div>