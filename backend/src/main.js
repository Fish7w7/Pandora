const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const https = require('https');

// OTIMIZAÇÃO: GPU E PERFORMANCE

console.log('🔧 Aplicando otimizações de performance...');

// Desabilitar aceleração de hardware para estabilidade
app.disableHardwareAcceleration();

// Flags otimizadas para melhor desempenho
const performanceFlags = [
    'disable-gpu',
    'disable-gpu-compositing',
    'disable-software-rasterizer',
    'no-sandbox',
    'disable-dev-shm-usage',
    'disable-setuid-sandbox',
    'disable-background-timer-throttling',
    'disable-backgrounding-occluded-windows',
    'disable-renderer-backgrounding'
];

performanceFlags.forEach(flag => app.commandLine.appendSwitch(flag));

// CACHE E CONFIGURAÇÕES

let mainWindow = null;
let isQuitting = false;

// Cache para ícones
const iconCache = new Map();

// CRIAÇÃO DA JANELA (OTIMIZADA)
function createWindow() {
    const iconPath = getIconPath();
    const preloadPath = path.join(__dirname, 'preload.js');
    const hasPreload = fsSync.existsSync(preloadPath);
    
    if (!hasPreload) {
        console.warn('⚠️ preload.js não encontrado - API nativa desabilitada');
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
            enableBlinkFeatures: '',
            disableBlinkFeatures: 'Accelerated2dCanvas,AcceleratedSmallCanvases',
            // Otimizações adicionais
            spellcheck: false,
            backgroundThrottling: false,
            offscreen: false
        },
        frame: true,
        backgroundColor: '#1a1a2e',
        show: false,
        icon: iconPath,
        title: 'NyanTools にゃん~'
    });

    const indexPath = path.join(__dirname, '../../frontend/public/index.html');
    
    console.log('🐱 NyanTools v3.0.0 (Phoenix Update)');
    console.log('📂 Diretório:', __dirname);
    console.log('📄 Carregando:', indexPath);
    
    mainWindow.loadFile(indexPath);

    // Mostrar janela quando pronta (com delay mínimo)
    mainWindow.once('ready-to-show', () => {
        setTimeout(() => {
            if (!mainWindow?.isDestroyed()) {
                mainWindow.show();
                console.log('✅ NyanTools iniciado! にゃん~');
            }
        }, 50); // Reduzido de 100ms para 50ms
    });

    // DevTools apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    
    mainWindow.on('close', (e) => {
        if (!isQuitting) {
            // Permitir que a janela feche normalmente
        }
    });
    
    // Filtrar logs desnecessários
    mainWindow.webContents.on('console-message', (event, level, message) => {
        if (message.includes('GPU') || 
            message.includes('gpu_process_host') ||
            message.includes('DevTools')) {
            return;
        }
    });

    // Performance: limpar cache periodicamente de forma assíncrona e segura
    setInterval(async () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            try {
                await mainWindow.webContents.session.clearCache();
                console.log('🧹 Cache limpo');
            } catch (err) {
                // Ignora erros silenciosos (janela pode ter sido destruída)
            }
        }
    }, 600000); // A cada 10 minutos
}

// GERENCIAMENTO DE ÍCONES (CACHED)

function getIconPath() {
    const platform = process.platform;
    
    if (iconCache.has(platform)) {
        return iconCache.get(platform);
    }
    
    const iconsDir = path.join(__dirname, '../../frontend/public/assets/icons');
    let iconPath;
    
    switch (platform) {
        case 'win32':
            iconPath = path.join(iconsDir, 'icon.ico');
            break;
        case 'darwin':
            iconPath = path.join(iconsDir, 'icon.icns');
            break;
        default:
            iconPath = path.join(iconsDir, 'icon.png');
    }
    
    iconCache.set(platform, iconPath);
    return iconPath;
}

// SISTEMA DE AUTO-UPDATE (OTIMIZADO)

// Rate limiting para evitar requests excessivos
let lastUpdateCheck = 0;
const UPDATE_CHECK_COOLDOWN = 300000; // 5 minutos

ipcMain.handle('check-for-updates', async () => {
    try {
        const now = Date.now();
        
        // Rate limiting
        if (now - lastUpdateCheck < UPDATE_CHECK_COOLDOWN) {
            return {
                success: false,
                error: 'Aguarde alguns minutos antes de verificar novamente'
            };
        }
        
        lastUpdateCheck = now;
        
        console.log('🔍 Verificando atualizações...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        
        const response = await fetch(
            'https://api.github.com/repos/Fish7w7/Pandora/releases/latest',
            { 
                signal: controller.signal,
                headers: {
                    'User-Agent': 'NyanTools-Updater',
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Versão disponível:', data.tag_name);
        
        return { success: true, data };
        
    } catch (error) {
        console.error('❌ Erro ao verificar atualizações:', error.message);
        return {
            success: false,
            error: error.name === 'AbortError' ? 'Timeout na requisição' : error.message
        };
    }
});

// Download otimizado com throttling de progresso
ipcMain.handle('download-update', async (event, downloadUrl, fileName) => {
    try {
        console.log('📥 Iniciando download:', fileName);
        
        const downloadsPath = app.getPath('downloads');
        const filePath = path.join(downloadsPath, fileName);
        
        return new Promise((resolve, reject) => {
            const file = fsSync.createWriteStream(filePath);
            let lastProgressUpdate = 0;
            const PROGRESS_THROTTLE = 100; // Atualizar a cada 100ms no máximo
            
            const handleResponse = (response) => {
                const totalBytes = parseInt(response.headers['content-length'], 10);
                let downloadedBytes = 0;
                
                response.pipe(file);
                
                response.on('data', (chunk) => {
                    downloadedBytes += chunk.length;
                    const now = Date.now();
                    
                    // Throttling de progresso para melhor performance
                    if (now - lastProgressUpdate >= PROGRESS_THROTTLE) {
                        const progress = Math.round((downloadedBytes / totalBytes) * 100);
                        
                        if (mainWindow && !mainWindow.isDestroyed()) {
                            mainWindow.webContents.send('download-progress', {
                                progress,
                                downloadedBytes,
                                totalBytes
                            });
                        }
                        
                        lastProgressUpdate = now;
                    }
                });
                
                response.on('end', () => {
                    file.end();
                    console.log('✅ Download concluído:', filePath);
                    
                    // Enviar progresso final
                    if (mainWindow && !mainWindow.isDestroyed()) {
                        mainWindow.webContents.send('download-progress', {
                            progress: 100,
                            downloadedBytes: totalBytes,
                            totalBytes
                        });
                    }
                    
                    resolve({ success: true, filePath });
                });
                
                response.on('error', (error) => {
                    file.close();
                    fsSync.existsSync(filePath) && fsSync.unlinkSync(filePath);
                    reject(error);
                });
            };
            
            https.get(downloadUrl, (response) => {
                // Seguir redirecionamentos
                if (response.statusCode === 302 || response.statusCode === 301) {
                    https.get(response.headers.location, handleResponse)
                        .on('error', (error) => {
                            file.close();
                            fsSync.existsSync(filePath) && fsSync.unlinkSync(filePath);
                            reject(error);
                        });
                } else {
                    handleResponse(response);
                }
            }).on('error', (error) => {
                file.close();
                fsSync.existsSync(filePath) && fsSync.unlinkSync(filePath);
                reject(error);
            });
        });
        
    } catch (error) {
        console.error('❌ Erro no download:', error.message);
        return { success: false, error: error.message };
    }
});

// Instalação de atualização
ipcMain.handle('install-update', async (event, filePath) => {
    try {
        // Verificar se arquivo existe
        if (!fsSync.existsSync(filePath)) {
            throw new Error('Arquivo de atualização não encontrado');
        }
        
        console.log('🔧 Preparando instalação:', filePath);
        
        const result = await dialog.showMessageBox(mainWindow, {
            type: 'question',
            buttons: ['Instalar Agora', 'Cancelar'],
            defaultId: 0,
            title: 'Instalar Atualização',
            message: 'Atualização baixada com sucesso!',
            detail: 'Deseja instalar agora? O aplicativo será fechado durante a instalação.',
            icon: getIconPath()
        });
        
        if (result.response === 0) {
            isQuitting = true;
            await shell.openPath(filePath);
            
            setTimeout(() => app.quit(), 1500);
            return { success: true };
        }
        
        return { success: false, cancelled: true };
        
    } catch (error) {
        console.error('❌ Erro ao instalar:', error.message);
        return { success: false, error: error.message };
    }
});

// Abrir pasta de downloads
ipcMain.handle('open-downloads-folder', async () => {
    try {
        const downloadsPath = app.getPath('downloads');
        await shell.openPath(downloadsPath);
        return { success: true };
    } catch (error) {
        console.error('❌ Erro ao abrir pasta:', error.message);
        return { success: false, error: error.message };
    }
});

// LIFECYCLE DO APP

app.whenReady().then(() => {
    console.log('🐱 NyanTools v3.0.0 - Phoenix Update');
    console.log('📂 App path:', app.getAppPath());
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
        isQuitting = true;
        app.quit();
    }
});

app.on('before-quit', () => {
    isQuitting = true;
});

// Tratamento de erros não críticos
process.on('uncaughtException', (error) => {
    if (error.message.includes('GPU') || 
        error.message.includes('gpu_process_host') ||
        error.message.includes('ECONNRESET')) {
        return;
    }
    console.error('❌ Erro não capturado:', error.message);
});

process.on('unhandledRejection', (reason) => {
    console.error('❌ Promise rejeitada:', reason);
});