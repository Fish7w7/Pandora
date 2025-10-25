const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
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
        icon: path.join(__dirname, '../../frontend/public/assets/icons/icon.png')
    });

    // CAMINHO CORRETO PARA A NOVA ESTRUTURA
    // __dirname = D:\Vscode - Projetos\Novo\meu-app\backend\src
    // Subir 2 níveis e entrar em frontend/public/index.html
    const indexPath = path.join(__dirname, '../../frontend/public/index.html');
    
    console.log('📂 Diretório atual:', __dirname);
    console.log('📄 Carregando aplicação de:', indexPath);
    
    mainWindow.loadFile(indexPath);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        console.log('✅ Aplicação iniciada com sucesso!');
    });

    // DevTools aberto para debug
    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    
    // Debug de erros
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
        console.error('❌ Erro ao carregar:', errorCode, errorDescription);
        console.error('❌ URL tentada:', validatedURL);
    });
}

app.whenReady().then(() => {
    console.log('🧰 ToolBox iniciando...');
    console.log('📁 App path:', app.getAppPath());
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

// Log de erros não capturados
process.on('uncaughtException', (error) => {
    console.error('❌ Erro não capturado:', error);
});