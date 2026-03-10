const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const https = require('https');
const crypto = require('crypto');

// ─── PERFORMANCE ────────────────────────────────────────────────────────────

console.log('🔧 Aplicando otimizacoes de performance...');

app.disableHardwareAcceleration();

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

// ─── ESTADO GLOBAL ───────────────────────────────────────────────────────────

let mainWindow    = null;
let isQuitting    = false;
const iconCache = new Map();

// ─── JANELA ──────────────────────────────────────────────────────────────────

function createWindow() {
    const iconPath    = getIconPath();
    const preloadPath = path.join(__dirname, 'preload.js');
    const hasPreload  = fsSync.existsSync(preloadPath);

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

    console.log('🐱 NyanTools v3.0.2 (Nyan Patch)');
    console.log('📁 Diretório:', __dirname);
    console.log('📄 Carregando:', indexPath);

    // Remove menubar padrão do Electron
    //Menu.setApplicationMenu(null);

    mainWindow.loadFile(indexPath);

    mainWindow.once('ready-to-show', () => {
        setTimeout(() => {
            if (!mainWindow?.isDestroyed()) {
                mainWindow.show();
                console.log('✅ NyanTools iniciado! にゃん~');
            }
        }, 50);
    });

    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    }

    mainWindow.on('closed', () => { mainWindow = null; });

    mainWindow.webContents.on('console-message', (event, level, message) => {
        if (message.includes('GPU') ||
            message.includes('gpu_process_host') ||
            message.includes('DevTools')) return;
    });

    // Limpar cache a cada 10 minutos
    setInterval(async () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            try {
                await mainWindow.webContents.session.clearCache();
            } catch (_) {}
        }
    }, 600000);
}

// ─── ÍCONES ──────────────────────────────────────────────────────────────────

function getIconPath() {
    const platform = process.platform;
    if (iconCache.has(platform)) return iconCache.get(platform);

    const iconsDir = path.join(__dirname, '../../frontend/public/assets/icons');
    const iconMap  = { win32: 'icon.ico', darwin: 'icon.icns' };
    const iconPath = path.join(iconsDir, iconMap[platform] || 'icon.png');

    iconCache.set(platform, iconPath);
    return iconPath;
}

// ─── AUTO-UPDATE: VERIFICAR ──────────────────────────────────────────────────

let lastUpdateCheck = 0;
const UPDATE_CHECK_COOLDOWN = 300000;

ipcMain.handle('reset-update-cooldown', () => {
    lastUpdateCheck = 0;
    console.log('🔄 Cooldown de atualização resetado (Force Check)');
    return { success: true };
});

ipcMain.handle('is-dev-environment', () => {
    return { isDev: process.env.NODE_ENV === 'development' };
});

ipcMain.handle('check-for-updates', async () => {
    const now = Date.now();

    if (now - lastUpdateCheck < UPDATE_CHECK_COOLDOWN) {
        return { success: false, rateLimited: true,
                 error: 'Aguarde alguns minutos antes de verificar novamente' };
    }

    lastUpdateCheck = now;
    console.log('🔍 Verificando atualizações...');

    // Tentar GitHub API com retry + backoff
    const URLS = [
        'https://api.github.com/repos/Fish7w7/Pandora/releases/latest',
        'https://raw.githubusercontent.com/Fish7w7/Pandora/main/version.json'
    ];

    for (let attempt = 0; attempt < 3; attempt++) {
        for (const url of URLS) {
            try {
                const controller = new AbortController();
                const tid = setTimeout(() => controller.abort(), 10000);

                const isFallback = url.includes('raw.githubusercontent');
                const headers = isFallback
                    ? { 'User-Agent': 'NyanTools-Updater' }
                    : { 'User-Agent': 'NyanTools-Updater', 'Accept': 'application/vnd.github.v3+json' };

                const response = await fetch(url, { signal: controller.signal, headers });
                clearTimeout(tid);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const data = await response.json();
                if (isFallback && data.version && !data.tag_name) {
                    data.tag_name = `v${data.version}`;
                    data._fromFallback = true;
                }

                console.log('✅ Versão disponível:', data.tag_name, isFallback ? '(fallback)' : '');
                return { success: true, data, fromFallback: !!data._fromFallback };

            } catch (error) {
                const isLast = attempt === 2 && url === URLS[URLS.length - 1];
                if (!isLast) {
                    await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
                    continue;
                }
                console.error('❌ Todas as tentativas falharam:', error.message);
                return {
                    success: false,
                    error: error.name === 'AbortError' ? 'Timeout na requisição' : error.message
                };
            }
        }
    }
});

// ─── AUTO-UPDATE: DOWNLOAD COM VELOCIDADE, RESUME E CANCELAMENTO ─────────────

ipcMain.handle('download-update', async (event, downloadUrl, fileName) => {
    try {
        console.log('📥 Iniciando download:', fileName);

        const downloadsPath = app.getPath('downloads');
        const filePath      = path.join(downloadsPath, fileName);

        if (fsSync.existsSync(filePath)) {
            try { fsSync.unlinkSync(filePath); } catch (_) {}
        }

        return new Promise((resolve, reject) => {
            const file = fsSync.createWriteStream(filePath);
            let downloadedBytes  = 0;
            let lastProgressTime = Date.now();
            let lastBytes        = 0;
            const THROTTLE       = 100;

            const handleResponse = (response) => {
                const totalBytes = parseInt(response.headers['content-length'], 10) || 0;

                response.pipe(file);

                response.on('data', (chunk) => {
                    downloadedBytes += chunk.length;
                    const now = Date.now();

                    if (now - lastProgressTime >= THROTTLE) {
                        const progress   = totalBytes > 0 ? Math.round((downloadedBytes / totalBytes) * 100) : 0;
                        const elapsed    = (now - lastProgressTime) / 1000;
                        const bytesDelta = downloadedBytes - lastBytes;
                        const speedBps   = elapsed > 0 ? bytesDelta / elapsed : 0;
                        const remaining  = speedBps > 0 ? (totalBytes - downloadedBytes) / speedBps : 0;

                        if (mainWindow && !mainWindow.isDestroyed()) {
                            mainWindow.webContents.send('download-progress', {
                                progress,
                                downloadedBytes,
                                totalBytes,
                                speedBps,
                                remainingSecs: Math.ceil(remaining)
                            });
                        }

                        lastProgressTime = now;
                        lastBytes        = downloadedBytes;
                    }
                });

                response.on('end', () => {
                    file.end();
                    console.log('✅ Download concluído:', filePath);

                    if (mainWindow && !mainWindow.isDestroyed()) {
                        mainWindow.webContents.send('download-progress', {
                            progress: 100, downloadedBytes, totalBytes, speedBps: 0, remainingSecs: 0
                        });
                    }

                    resolve({ success: true, filePath });
                });

                response.on('error', (err) => {
                    file.close();
                    try { fsSync.unlinkSync(filePath); } catch (_) {}
                    reject(err);
                });
            };

            const makeRequest = (url) => {
                https.get(url, (response) => {
                    if (response.statusCode === 302 || response.statusCode === 301) {
                        makeRequest(response.headers.location);
                    } else {
                        handleResponse(response);
                    }
                }).on('error', (err) => {
                    file.close();
                    try { fsSync.unlinkSync(filePath); } catch (_) {}
                    reject(err);
                });
            };

            makeRequest(downloadUrl);
        });

    } catch (error) {
        console.error('❌ Erro no download:', error.message);
        return { success: false, error: error.message };
    }
});

// ─── AUTO-UPDATE: VERIFICAR SHA256 ───────────────────────────────────────────

ipcMain.handle('verify-sha256', async (event, filePath, expectedHash) => {
    try {
        if (!fsSync.existsSync(filePath)) {
            return { success: false, error: 'Arquivo não encontrado' };
        }

        console.log('🔐 Verificando integridade SHA256...');
        const fileBuffer = await fs.readFile(filePath);
        const hash       = crypto.createHash('sha256').update(fileBuffer).digest('hex');
        const match      = hash.toLowerCase() === expectedHash.toLowerCase();

        console.log(match ? '✅ Hash verificado' : `❌ Hash inválido: esperado ${expectedHash}, obtido ${hash}`);
        return { success: true, match, hash };

    } catch (error) {
        console.error('❌ Erro na verificação SHA256:', error.message);
        return { success: false, error: error.message };
    }
});

// ─── AUTO-UPDATE: INSTALAR ───────────────────────────────────────────────────

ipcMain.handle('install-update', async (event, filePath) => {
    try {
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

// ─── ABRIR PASTA DE DOWNLOADS ────────────────────────────────────────────────

ipcMain.handle('open-downloads-folder', async () => {
    try {
        await shell.openPath(app.getPath('downloads'));
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// ─── LIFECYCLE ───────────────────────────────────────────────────────────────

app.whenReady().then(() => {
    console.log('🐱 NyanTools v3.0.2 - Nyan Patch');
    console.log('📁 App path:', app.getAppPath());
    console.log('💻 Plataforma:', process.platform);
    console.log('📥 Downloads:', app.getPath('downloads'));

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        isQuitting = true;
        app.quit();
    }
});

app.on('before-quit', () => { isQuitting = true; });

process.on('uncaughtException', (error) => {
    if (error.message.includes('GPU') ||
        error.message.includes('gpu_process_host') ||
        error.message.includes('ECONNRESET')) return;
    console.error('❌ Erro não capturado:', error.message);
});

process.on('unhandledRejection', (reason) => {
    console.error('❌ Promise rejeitada:', reason);
});