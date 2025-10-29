const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');

// ============================================
// 🔧 FIX: DESABILITAR ACELERAÇÃO GPU
// ============================================
// Isso resolve os 3 erros "GPU process exited unexpectedly"
// que causam as piscadas na inicialização
console.log('🔧 Desabilitando aceleração de hardware...');
app.disableHardwareAcceleration();

// ============================================
// 🔧 FIX: FLAGS ADICIONAIS PARA ESTABILIDADE
// ============================================
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-gpu-compositing');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('no-sandbox');

let mainWindow;

function createWindow() {
    const iconPath = getIconPath();
    
    // 🔧 FIX: Verificar se preload.js existe
    const preloadPath = path.join(__dirname, 'preload.js');
    const hasPreload = require('fs').existsSync(preloadPath);
    
    if (!hasPreload) {
        console.warn('⚠️ preload.js não encontrado em:', preloadPath);
        console.log('⚠️ Continuando sem API nativa de atualização');
    } else {
        console.log('✅ preload.js encontrado em:', preloadPath);
    }
    
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: hasPreload ? preloadPath : undefined,
            // 🔧 FIX: Desabilitar aceleração no renderer também
            enableBlinkFeatures: '',
            disableBlinkFeatures: 'Accelerated2dCanvas,AcceleratedSmallCanvases'
        },
        frame: true,
        backgroundColor: '#1a1a2e',
        // 🔧 FIX: NÃO mostrar até estar 100% pronto
        show: false,
        icon: iconPath,
        title: 'NyanTools にゃん~'
    });

    const indexPath = path.join(__dirname, '../../frontend/public/index.html');
    
    console.log('🐱 NyanTools iniciando... にゃん~');
    console.log('📂 Diretório atual:', __dirname);
    console.log('📄 Carregando aplicação de:', indexPath);
    console.log('🎨 Ícone carregado de:', iconPath);
    
    mainWindow.loadFile(indexPath);

    // 🔧 FIX: Mostrar apenas quando TUDO estiver carregado
    mainWindow.once('ready-to-show', () => {
        // Pequeno delay adicional para garantir que está 100% pronto
        setTimeout(() => {
            mainWindow.show();
            console.log('✅ NyanTools iniciado com sucesso! にゃん~');
        }, 100);
    });

    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
        console.error('❌ Erro ao carregar:', errorCode, errorDescription);
        console.error('❌ URL tentada:', validatedURL);
    });

    // 🔧 FIX: Suprimir erros de GPU no console
    mainWindow.webContents.on('console-message', (event, level, message) => {
        if (message.includes('GPU') || message.includes('gpu_process_host')) {
            return; // Ignorar logs de erro da GPU
        }
    });
}

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

// ============================================
// 🆕 SISTEMA DE AUTO-UPDATE NATIVO
// ============================================

// IPC: Verificar atualizações
ipcMain.handle('check-for-updates', async () => {
    try {
        console.log('🔍 Verificando atualizações...');
        
        const response = await fetch('https://api.github.com/repos/Fish7w7/Pandora/releases/latest');
        
        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log('✅ Versão mais recente:', data.tag_name);
        
        return {
            success: true,
            data: data
        };
        
    } catch (error) {
        console.error('❌ Erro ao verificar atualizações:', error);
        return {
            success: false,
            error: error.message
        };
    }
});

// IPC: Baixar atualização
ipcMain.handle('download-update', async (event, downloadUrl, fileName) => {
    try {
        console.log('📥 Iniciando download:', fileName);
        
        const downloadsPath = app.getPath('downloads');
        const filePath = path.join(downloadsPath, fileName);
        
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(filePath);
            
            https.get(downloadUrl, (response) => {
                if (response.statusCode === 302 || response.statusCode === 301) {
                    // Seguir redirecionamento
                    https.get(response.headers.location, (redirectResponse) => {
                        const totalBytes = parseInt(redirectResponse.headers['content-length'], 10);
                        let downloadedBytes = 0;
                        
                        redirectResponse.pipe(file);
                        
                        redirectResponse.on('data', (chunk) => {
                            downloadedBytes += chunk.length;
                            const progress = Math.round((downloadedBytes / totalBytes) * 100);
                            
                            // Enviar progresso para o frontend
                            mainWindow.webContents.send('download-progress', {
                                progress: progress,
                                downloadedBytes: downloadedBytes,
                                totalBytes: totalBytes
                            });
                            
                            console.log(`📊 Progresso: ${progress}%`);
                        });
                        
                        redirectResponse.on('end', () => {
                            file.end();
                            console.log('✅ Download concluído:', filePath);
                            resolve({
                                success: true,
                                filePath: filePath
                            });
                        });
                        
                        redirectResponse.on('error', (error) => {
                            file.close();
                            fs.unlinkSync(filePath);
                            reject(error);
                        });
                    }).on('error', reject);
                } else {
                    const totalBytes = parseInt(response.headers['content-length'], 10);
                    let downloadedBytes = 0;
                    
                    response.pipe(file);
                    
                    response.on('data', (chunk) => {
                        downloadedBytes += chunk.length;
                        const progress = Math.round((downloadedBytes / totalBytes) * 100);
                        
                        mainWindow.webContents.send('download-progress', {
                            progress: progress,
                            downloadedBytes: downloadedBytes,
                            totalBytes: totalBytes
                        });
                        
                        console.log(`📊 Progresso: ${progress}%`);
                    });
                    
                    response.on('end', () => {
                        file.end();
                        console.log('✅ Download concluído:', filePath);
                        resolve({
                            success: true,
                            filePath: filePath
                        });
                    });
                    
                    response.on('error', (error) => {
                        file.close();
                        fs.unlinkSync(filePath);
                        reject(error);
                    });
                }
            }).on('error', (error) => {
                file.close();
                fs.unlinkSync(filePath);
                reject(error);
            });
        });
        
    } catch (error) {
        console.error('❌ Erro no download:', error);
        return {
            success: false,
            error: error.message
        };
    }
});

// IPC: Instalar atualização
ipcMain.handle('install-update', async (event, filePath) => {
    try {
        console.log('🔧 Instalando atualização:', filePath);
        
        // Mostrar diálogo de confirmação
        const result = await dialog.showMessageBox(mainWindow, {
            type: 'question',
            buttons: ['Instalar Agora', 'Cancelar'],
            defaultId: 0,
            title: 'Instalar Atualização',
            message: 'A atualização foi baixada com sucesso!',
            detail: 'Deseja instalar agora? O aplicativo será fechado durante a instalação.',
            icon: getIconPath()
        });
        
        if (result.response === 0) {
            // Usuário clicou em "Instalar Agora"
            const { shell } = require('electron');
            
            // Abrir o instalador
            await shell.openPath(filePath);
            
            // Fechar o app após 2 segundos
            setTimeout(() => {
                app.quit();
            }, 2000);
            
            return { success: true };
        } else {
            return { success: false, cancelled: true };
        }
        
    } catch (error) {
        console.error('❌ Erro ao instalar:', error);
        return {
            success: false,
            error: error.message
        };
    }
});

// IPC: Abrir pasta de downloads
ipcMain.handle('open-downloads-folder', async () => {
    try {
        const { shell } = require('electron');
        const downloadsPath = app.getPath('downloads');
        await shell.openPath(downloadsPath);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// ============================================
// APP LIFECYCLE
// ============================================

app.whenReady().then(() => {
    console.log('🐱 NyanTools v2.5.0');
    console.log('📁 App path:', app.getAppPath());
    console.log('🖥️ Plataforma:', process.platform);
    console.log('📥 Downloads:', app.getPath('downloads'));
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

// 🔧 FIX: Suprimir erros não críticos
process.on('uncaughtException', (error) => {
    // Ignorar erros de GPU que não afetam o funcionamento
    if (error.message.includes('GPU') || error.message.includes('gpu_process_host')) {
        return;
    }
    console.error('❌ Erro não capturado:', error);
});