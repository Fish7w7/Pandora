// Force UTF-8 output on Windows
if (process.platform === 'win32') {
    try { require('child_process').execSync('chcp 65001', {stdio:'ignore'}); } catch(_) {}
}

const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const path = require('path');
const fsSync = require('fs');
const fs = require('fs').promises;
const os = require('os');

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
    'log-level=3',
    'disable-logging',
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

    console.log('[~] NyanTools v3.7.1');
    console.log('[>] Diretório:', __dirname);
    console.log('[>] Carregando:', indexPath);

    // Remove menubar padrão do Electron
    //Menu.setApplicationMenu(null);

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
autoUpdater.autoDownload    = false;
autoUpdater.autoInstallOnAppQuit = false;
autoUpdater.allowPrerelease = false;
autoUpdater.logger          = null;

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

        setTimeout(() => {
            console.log('[*] Reiniciando para instalar v' + info.version + '...');
            autoUpdater.quitAndInstall(true, true);
        }, 5000);
    });

    autoUpdater.on('error', (err) => {
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

ipcMain.handle('start-update-download', async () => {
    try {
        await autoUpdater.downloadUpdate();
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('check-for-updates', async () => {
    const now = Date.now();
    if (now - lastUpdateCheck < UPDATE_CHECK_COOLDOWN) {
        return { success: false, rateLimited: true,
                 error: 'Aguarde alguns minutos antes de verificar novamente' };
    }
    lastUpdateCheck = now;

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
                data.tag_name = `v${data.version}`;
                data._fromFallback = true;
            }
            console.log('[OK] GitHub API versão detectada:', data.tag_name);
            return { success: true, data, fromFallback: !!data._fromFallback };
        } catch (_) {}
    }

    return { success: false, error: 'Não foi possível verificar atualizações' };
});

ipcMain.handle('install-update-now', () => {
    try {
        autoUpdater.quitAndInstall(true, true);
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('download-and-install', async (_event, { url, filename }) => {
    try {
        const destPath = path.join(os.tmpdir(), filename || 'NyanTools-Setup.exe');
        console.log('[*] Baixando update via fallback:', url);
        console.log('[*] Destino:', destPath);

        await new Promise((resolve, reject) => {
            const https = require('https');
            const { pipeline } = require('stream');

            setTimeout(() => {
            const doRequest = (reqUrl) => {
                const urlObj = new URL(reqUrl);
                const req = https.request({
                    hostname: urlObj.hostname,
                    path: urlObj.pathname + urlObj.search,
                    method: 'GET',
                    headers: { 'User-Agent': 'NyanTools-Updater' }
                }, (res) => {
                    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                        console.log('[*] Redirect:', res.headers.location.substring(0, 80) + '...');
                        res.resume();
                        doRequest(res.headers.location);
                        return;
                    }

                    if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode}`)); return; }

                    const total = parseInt(res.headers['content-length'] || '0');
                    console.log('[*] Content-Length:', total);
                    let received = 0;
                    let lastBytes = 0;
                    let lastTime  = Date.now();
                    let lastSent  = 0; // timestamp do último IPC enviado

                    if (mainWindow && !mainWindow.isDestroyed()) {
                        mainWindow.webContents.send('download-progress', {
                            progress: 1, downloadedBytes: 0, totalBytes: total || 75 * 1024 * 1024, speedBps: 0, remainingSecs: 0
                        });
                    }

                    const writeStream = fsSync.createWriteStream(destPath);
                    writeStream.on('error', reject);

                    res.on('data', (chunk) => {
                        received += chunk.length;
                        const now  = Date.now();
                        const elapsed = Math.max((now - lastTime) / 1000, 0.001);
                        const estimatedTotal = total > 0 ? total : 75 * 1024 * 1024;
                        const pct     = Math.min(Math.round((received / estimatedTotal) * 100), 99);
                        const speed   = Math.round((received - lastBytes) / elapsed);
                        const remaining = speed > 0 && total > 0 ? Math.ceil((total - received) / speed) : 0;

                        lastTime  = now;
                        lastBytes = received;

                        // Throttle: enviar IPC no máximo a cada 150ms
                        if (now - lastSent >= 150) {
                            lastSent = now;
                            if (mainWindow && !mainWindow.isDestroyed()) {
                                mainWindow.webContents.send('download-progress', {
                                    progress: pct, downloadedBytes: received, totalBytes: estimatedTotal,
                                    speedBps: speed, remainingSecs: remaining
                                });
                            }
                        }
                    });

                    res.on('error', reject);

                    res.on('end', () => {
                        writeStream.end(() => {
                            console.log('[OK] Download concluído:', destPath);
                            if (mainWindow && !mainWindow.isDestroyed()) {
                                mainWindow.webContents.send('download-progress', {
                                    progress: 100, downloadedBytes: received, totalBytes: received,
                                    speedBps: 0, remainingSecs: 0
                                });
                                mainWindow.webContents.send('updater-status', {
                                    event: 'update-downloaded', version: filename
                                });
                            }
                            setTimeout(() => {
                                console.log('[*] Executando installer...');
                                const { spawn } = require('child_process');
                                const child = spawn(destPath, [], {
                                    detached: true,
                                    stdio:    'ignore',
                                    shell:    false,
                                });
                                child.unref();
                                setTimeout(() => app.quit(), 1500);
                            }, 3000);
                            resolve();
                        });
                    });

                    res.pipe(writeStream);
                });

                req.on('error', reject);
                req.end();
            };

            doRequest(url);
            }, 300);
        });

        return { success: true };
    } catch (err) {
        console.error('[X] download-and-install erro:', err.message);
        return { success: false, error: err.message };
    }
});

// Download via ipcMain.on (fire-and-forget) ───────────────────────
ipcMain.on('start-download-faf', (_event, { url, filename }) => {
    const destPath = path.join(os.tmpdir(), filename || 'NyanTools-Setup.exe');

    const https = require('https');
    let received = 0, lastBytes = 0, lastTime = Date.now(), lastSent = 0;

    const doRequest = (reqUrl) => {
        try {
            const urlObj = new URL(reqUrl);
            const req = https.request({
                hostname: urlObj.hostname,
                path:     urlObj.pathname + urlObj.search,
                method:   'GET',
                headers:  { 'User-Agent': 'NyanTools-Updater' }
            }, (res) => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    res.resume();
                    doRequest(res.headers.location);
                    return;
                }
                if (res.statusCode !== 200) {
                    console.error('[X] [FAF] HTTP', res.statusCode);
                    if (mainWindow && !mainWindow.isDestroyed()) {
                        mainWindow.webContents.send('updater-status', { event: 'error', message: `HTTP ${res.statusCode}` });
                    }
                    return;
                }

                const total = parseInt(res.headers['content-length'] || '0');

                // Evento inicial
                if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.webContents.send('download-progress', {
                        progress: 1, downloadedBytes: 0,
                        totalBytes: total || 75 * 1024 * 1024,
                        speedBps: 0, remainingSecs: 0
                    });
                }

                const writeStream = fsSync.createWriteStream(destPath);
                writeStream.on('error', (err) => {
                    console.error('[X] [FAF] writeStream erro:', err.message);
                });

                res.on('data', (chunk) => {
                    received += chunk.length;
                    const now  = Date.now();
                    const elapsed = Math.max((now - lastTime) / 1000, 0.001);
                    const estimatedTotal = total > 0 ? total : 75 * 1024 * 1024;
                    const pct     = Math.min(Math.round((received / estimatedTotal) * 100), 99);
                    const speed   = Math.round((received - lastBytes) / elapsed);
                    const remaining = speed > 0 && total > 0 ? Math.ceil((total - received) / speed) : 0;

                    lastTime  = now;
                    lastBytes = received;

                    if (now - lastSent >= 150) {
                        lastSent = now;
                        if (mainWindow && !mainWindow.isDestroyed()) {
                            mainWindow.webContents.send('download-progress', {
                                progress: pct, downloadedBytes: received,
                                totalBytes: estimatedTotal, speedBps: speed, remainingSecs: remaining
                            });
                        }
                    }
                });

                res.on('end', () => {
                    writeStream.end(() => {
                        console.log('[OK] [FAF] Download concluído:', destPath);
                        if (mainWindow && !mainWindow.isDestroyed()) {
                            mainWindow.webContents.send('download-progress', {
                                progress: 100, downloadedBytes: received, totalBytes: received,
                                speedBps: 0, remainingSecs: 0
                            });
                            mainWindow.webContents.send('updater-status', {
                                event: 'update-downloaded', version: filename
                            });
                        }
                        setTimeout(() => {
                            const { spawn } = require('child_process');
                            const child = spawn(destPath, [], { detached: true, stdio: 'ignore', shell: false });
                            child.unref();
                            setTimeout(() => app.quit(), 1500);
                        }, 3000);
                    });
                });

                res.pipe(writeStream);
            });

            req.on('error', (err) => {
                console.error('[X] [FAF] Request erro:', err.message);
                if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.webContents.send('updater-status', { event: 'error', message: err.message });
                }
            });
            req.end();
        } catch (err) {
            console.error('[X] [FAF] Erro ao iniciar request:', err.message);
        }
    };

    doRequest(url);
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
    console.log('[~] NyanTools v3.7.1');
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