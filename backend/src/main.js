const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    // Definir caminho do ícone baseado na plataforma
    const iconPath = getIconPath();
    
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
        frame: true,
        backgroundColor: '#1a1a2e',
        show: false,
        icon: iconPath,
        title: 'NyanTools にゃん~' // ← NOME ATUALIZADO
    });

    const indexPath = path.join(__dirname, '../../frontend/public/index.html');
    
    console.log('🐱 NyanTools iniciando... にゃん~');
    console.log('📂 Diretório atual:', __dirname);
    console.log('📄 Carregando aplicação de:', indexPath);
    console.log('🎨 Ícone carregado de:', iconPath);
    
    mainWindow.loadFile(indexPath);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        console.log('✅ NyanTools iniciado com sucesso! にゃん~');
    });

    // DevTools apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    
    // Debug de erros
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
        console.error('❌ Erro ao carregar:', errorCode, errorDescription);
        console.error('❌ URL tentada:', validatedURL);
    });
}

// Função para obter o caminho correto do ícone baseado na plataforma
function getIconPath() {
    const iconsDir = path.join(__dirname, '../../frontend/public/assets/icons');
    
    if (process.platform === 'win32') {
        return path.join(iconsDir, 'icon.ico');
    } else if (process.platform === 'darwin') {
        return path.join(iconsDir, 'icon.icns');
    } else {
        return path.join(iconsDir, 'icon.png');
    }
}

app.whenReady().then(() => {
    console.log('🐱 NyanTools v2.1.0');
    console.log('📁 App path:', app.getAppPath());
    console.log('🖥️ Plataforma:', process.platform);
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

process.on('uncaughtException', (error) => {
    console.error('❌ Erro não capturado:', error);
});