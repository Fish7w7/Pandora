# 🐱 NyanTools

**にゃん~ Your Purr-fect Toolkit!** Uma aplicação desktop moderna e kawaii construída com Electron que reúne diversas ferramentas úteis em um só lugar.

![Version](https://img.shields.io/badge/version-2.0.2-blue)
![Electron](https://img.shields.io/badge/electron-27.0.0-green)
![License](https://img.shields.io/badge/license-MIT-orange)
![Kawaii](https://img.shields.io/badge/kawaii-100%25-ff69b4)

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
- Suporte para 12+ idiomas
- Tradução automática em tempo real
- Função de inverter idiomas
- Síntese de voz para ouvir traduções
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
- Player integrado com YouTube
- 4 playlists temáticas (Lofi, Study, Electronic, Relaxing)
- Controles completos de reprodução

### 📶 **Zona Offline**
- Jogo da Velha (2 jogadores)
- Jogo da Cobrinha offline
- Funciona sem internet
- Mais jogos em breve (Termo, Quiz, Memória, Forca)

### 🔄 **Sistema de Atualizações**
- Verificação automática de updates
- Download direto do GitHub
- Changelog detalhado
- Notificações de novas versões

---

## 📦 Instalação

### **Windows**
1. Baixe `NyanTools-2.0.2-Setup.exe` da [página de releases](https://github.com/Fish7w7/Pandora/releases)
2. Execute o instalador
3. Siga as instruções na tela
4. にゃん~ Pronto para usar!

### **Desenvolvimento**
```bash
# Clone o repositório
git clone https://github.com/Fish7w7/Pandora.git
cd Pandora

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm start

# Ou com DevTools
npm run dev
```

---

## 🎨 Ícone e Identidade Visual

O NyanTools usa um adorável gatinho como mascote! 🐱

Para configurar os ícones:
1. Coloque seus arquivos em `frontend/public/assets/icons/`:
   - `icon.png` (512x512) - Linux
   - `icon.ico` (256x256) - Windows
   - `icon.icns` (512x512) - macOS

2. Os ícones serão automaticamente aplicados em:
   - Janela da aplicação
   - Barra de tarefas
   - Atalhos
   - Instalador

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

## 🔨 Build

### **Windows**
```bash
npm run build:win
```
Gera:
- `NyanTools-2.0.2-Setup.exe` (Instalador NSIS)
- `NyanTools 2.0.2.exe` (Versão portátil)

### **macOS**
```bash
npm run build:mac
```
Gera:
- `NyanTools-2.0.2-x64.dmg`
- `NyanTools-2.0.2-arm64.dmg`

### **Linux**
```bash
npm run build:linux
```
Gera:
- `NyanTools-2.0.2-x64.AppImage`
- `NyanTools-2.0.2-x64.deb`

### **Todos os Sistemas**
```bash
npm run build:all
```

---

## 📁 Estrutura do Projeto

```
nyantools/
├── backend/
│   └── src/
│       └── main.js              # Entry point Electron
│
├── frontend/
│   ├── public/
│   │   ├── assets/
│   │   │   └── icons/          # Ícones da aplicação
│   │   │       ├── icon.png
│   │   │       ├── icon.ico
│   │   │       └── icon.icns
│   │   └── index.html          # HTML principal
│   │
│   └── src/
│       ├── scripts/
│       │   ├── core/           # Núcleo (app, auth, router)
│       │   ├── tools/          # Ferramentas individuais
│       │   └── utils/          # Utilitários
│       │
│       └── styles/
│           └── main.css        # Estilos globais
│
├── package.json
└── README.md
```

---

## 🎯 Tecnologias Utilizadas

### **Frontend**
- **Electron 27.0** - Framework desktop
- **Tailwind CSS** - Framework CSS utilitário
- **Vanilla JavaScript (ES6+)** - JavaScript moderno

### **APIs Integradas**
- **OpenWeatherMap API** - Dados meteorológicos
- **MyMemory API** - Tradução gratuita
- **Google Gemini API** - Inteligência artificial
- **YouTube Player API** - Reprodução de música

### **Recursos**
- **LocalStorage** - Armazenamento local
- **Geolocation API** - GPS
- **Fetch API** - Requisições HTTP
- **Speech Synthesis** - Síntese de voz

---

## 📝 Roadmap

### **✅ Concluído**
- [x] Sistema de autenticação
- [x] Gerador de senhas
- [x] Sistema de clima
- [x] Tradutor multilíngue
- [x] Assistente IA
- [x] Mini games
- [x] Email temporário
- [x] Player de música
- [x] Zona offline
- [x] Sistema de atualizações
- [x] Ícones customizados

### **🚧 Em Desenvolvimento**
- [ ] 💰 **Crypto Tracker** - Cotações
- [ ] 🧮 **Calculadora Científica**
- [ ] 📝 **Editor de Markdown**
- [ ] ✅ **Gerenciador de Tarefas**
- [ ] 📊 **Conversor de Unidades**

### **🔮 Futuro**
- [ ] 🌓 Modo escuro/claro
- [ ] 🎨 Temas personalizáveis
- [ ] ☁️ Sincronização na nuvem
- [ ] 🔌 Sistema de plugins
- [ ] 🌍 Multi-idioma na interface
- [ ] 📱 Versão mobile

---

## 🤝 Contribuindo

Contribuições são bem-vindas! にゃん~

1. **Fork** o projeto
2. Crie uma **branch**: `git checkout -b feature/MinhaFeature`
3. **Commit**: `git commit -m 'feat: Adiciona MinhaFeature'`
4. **Push**: `git push origin feature/MinhaFeature`
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
- 🌐 GitHub: [@Fish7w7](https://github.com/Fish7w7)
- 📧 Email: kik73261@gmail.com

---

## 🙏 Agradecimentos

- [Electron](https://www.electronjs.org/) - Framework desktop
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [OpenWeatherMap](https://openweathermap.org/) - API de clima
- [Google Gemini](https://deepmind.google/technologies/gemini/) - IA
- Comunidade open source にゃん~ 🐱

---

## 💡 Easter Eggs

Procure pelo botão "Sobre" no menu lateral... にゃん~ 😉

---

<div align="center">
  <strong>Feito com ❤️ e にゃん~</strong>
  <br><br>
  <sub>Se este projeto te ajudou, considere dar uma ⭐</sub>
  <br>
  <sub>Compartilhe com seus amigos! 🐱✨</sub>
</div>