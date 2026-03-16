// Force UTF-8 output on Windows
if (process.platform === 'win32') {
    try { require('child_process').execSync('chcp 65001', {stdio:'ignore'}); } catch(_) {}
}

const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const path = require('path');
const fsSync = require('fs');

// ─── PERFORMANCE ────────────────────────────────────────────────────────────

console.log('[*] Aplicando otimizacoes de performance...');

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
    'disable-renderer-backgrounding',
    'disable-gpu-sandbox',
    'log-level=3',                 // suprimir warnings do Chromium
    'disable-logging',             // suprimir logs internos do GPU
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
        console.warn('[!] preload.js não encontrado - API nativa desabilitada');
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
        title: 'NyanTools nyan~'
    });

    const indexPath = path.join(__dirname, '../../frontend/public/index.html');

    console.log('[~] NyanTools v3.4.2');
    console.log('[>] Diretório:', __dirname);
    console.log('[>] Carregando:', indexPath);

    // Remove menubar padrão do Electron
    Menu.setApplicationMenu(null);

    mainWindow.loadFile(indexPath);

    mainWindow.once('ready-to-show', () => {
        setTimeout(() => {
            if (!mainWindow?.isDestroyed()) {
                mainWindow.show();
                console.log('[OK] NyanTools iniciado! nyan~');
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

// ─── AUTO-UPDATE (electron-updater) ─────────────────────────────────────────

const { autoUpdater } = require('electron-updater');

// Configuração
autoUpdater.autoDownload    = false;  // usuário decide quando baixar
autoUpdater.autoInstallOnAppQuit = false; // instala ao reiniciar, não ao fechar
autoUpdater.allowPrerelease = false;
autoUpdater.logger          = null;   // evitar logs verbosos no console

// Cooldown: não verificar mais de 1x a cada 5 min (segurança extra)
let lastUpdateCheck    = 0;
const UPDATE_CHECK_COOLDOWN = 300000;

function setupAutoUpdater() {
    // ── Handlers de eventos ──

    autoUpdater.on('checking-for-update', () => {
        console.log('[?] electron-updater: verificando...');
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('updater-status', { event: 'checking' });
        }
    });

    autoUpdater.on('update-available', (info) => {
        console.log('[!] Update disponível:', info.version);
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('updater-status', {
                event: 'update-available',
                version: info.version,
                releaseNotes: info.releaseNotes || ''
            });
        }
    });

    autoUpdater.on('update-not-available', () => {
        console.log('[OK] App atualizado.');
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('updater-status', { event: 'up-to-date' });
        }
    });

    autoUpdater.on('download-progress', (info) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('download-progress', {
                progress:       Math.round(info.percent),
                downloadedBytes: info.transferred,
                totalBytes:     info.total,
                speedBps:       info.bytesPerSecond,
                remainingSecs:  info.total > 0 && info.bytesPerSecond > 0
                    ? Math.ceil((info.total - info.transferred) / info.bytesPerSecond)
                    : 0
            });
        }
    });

    autoUpdater.on('update-downloaded', (info) => {
        console.log('[OK] Download concluído:', info.version);
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('updater-status', {
                event: 'update-downloaded',
                version: info.version
            });
        }

        // Reinicia e instala automaticamente após 5 segundos
        setTimeout(() => {
            console.log('[*] Reiniciando para instalar v' + info.version + '...');
            autoUpdater.quitAndInstall(true, true);
        }, 5000);
    });

    autoUpdater.on('error', (err) => {
        // Ignorar erros esperados em dev ou sem assinatura
        const msg = err?.message || '';
        if (msg.includes('dev-app-update') || msg.includes('ERR_NETWORK') || msg.includes('net::')) {
            console.log('[~] AutoUpdater ignorado (dev/sem rede)');
            return;
        }
        console.error('[X] AutoUpdater erro:', msg);
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('updater-status', { event: 'error', message: msg });
        }
    });
}

// ── IPC: verificar updates manualmente pelo frontend ──

ipcMain.handle('reset-update-cooldown', () => {
    lastUpdateCheck = 0;
    console.log('[~] Cooldown de atualização resetado');
    return { success: true };
});

ipcMain.handle('is-dev-environment', () => {
    return { isDev: process.env.NODE_ENV === 'development' };
});

// Frontend pede para iniciar o download (após confirmação do usuário)
ipcMain.handle('start-update-download', async () => {
    try {
        await autoUpdater.downloadUpdate();
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

// Frontend pede check manual (botão "Verificar" no updater.js)
ipcMain.handle('check-for-updates', async () => {
    const now = Date.now();
    if (now - lastUpdateCheck < UPDATE_CHECK_COOLDOWN) {
        return { success: false, rateLimited: true,
                 error: 'Aguarde alguns minutos antes de verificar novamente' };
    }
    lastUpdateCheck = now;

    try {
        await autoUpdater.checkForUpdates();
        return { success: true, usingNativeUpdater: true };
    } catch (err) {
        // Fallback: consultar GitHub API diretamente para só mostrar info de versão
        console.log('[~] autoUpdater.checkForUpdates() falhou, usando fallback GitHub API');
        const URLS = [
            'https://api.github.com/repos/Fish7w7/Pandora/releases/latest',
            'https://raw.githubusercontent.com/Fish7w7/Pandora/main/version.json'
        ];
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
                if (!response.ok) continue;
                const data = await response.json();
                if (isFallback && data.version && !data.tag_name) {
                    data.tag_name   = `v${data.version}`;
                    data._fromFallback = true;
                }
                console.log('[OK] Fallback GitHub API:', data.tag_name);
                return { success: true, data, fromFallback: !!data._fromFallback };
            } catch (_) {}
        }
        return { success: false, error: err.message };
    }
});

// Frontend pede instalação imediata (se download já concluiu)
ipcMain.handle('install-update-now', () => {
    try {
        autoUpdater.quitAndInstall(true, true);
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

// Mantido por compatibilidade — abre pasta de downloads
ipcMain.handle('open-downloads-folder', async () => {
    try {
        await shell.openPath(app.getPath('downloads'));
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// Abrir URL no navegador padrão do sistema
ipcMain.handle('open-external', async (_event, url) => {
    try {
        if (!url || typeof url !== 'string') return { success: false, error: 'URL inválida' };
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return { success: false, error: 'Protocolo não permitido' };
        }
        await shell.openExternal(url);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// ─── LIFECYCLE ───────────────────────────────────────────────────────────────

app.whenReady().then(() => {
    console.log('[~] NyanTools v3.4.2');
    console.log('[>] App path:', app.getAppPath());
    console.log('[>] Plataforma:', process.platform);

    setupAutoUpdater();
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
    console.error('[X] Erro não capturado:', error.message);
});

process.on('unhandledRejection', (reason) => {
    console.error('[X] Promise rejeitada:', reason);
});