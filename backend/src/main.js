if (process.platform === 'win32') {
    try { require('child_process').execSync('chcp 65001', {stdio:'ignore'}); } catch(_) {}
}

const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const path = require('path');
const fsSync = require('fs');
const os = require('os');
const crypto = require('crypto');
const APP_VERSION = app?.getVersion?.()
    || (() => {
        try {
            return require('../../package.json')?.version || '0.0.0';
        } catch (_) {
            return '0.0.0';
        }
    })();

function _safeEnvNumber(value, fallback, min = 0) {
    const n = Number(value);
    if (!Number.isFinite(n) || n < min) return fallback;
    return n;
}

// Dev security config (renderer never receives secrets):
// - NYAN_DEV_UIDS: comma-separated authorized Firebase UIDs
// - NYAN_DEV_SECRET: plaintext dev passphrase (simple setup)
// - NYAN_DEV_SECRET_SHA256: sha256(passphrase) hex (preferred)
// Optional:
// - NYAN_DEV_SESSION_TTL_MS, NYAN_DEV_MAX_ATTEMPTS, NYAN_DEV_LOCKOUT_MS
const DEV_SECURITY = {
    secretPlain: String(process.env.NYAN_DEV_SECRET || ''),
    secretSha256: String(process.env.NYAN_DEV_SECRET_SHA256 || '').trim().toLowerCase(),
    allowedUIDs: new Set(
        String(process.env.NYAN_DEV_UIDS || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
    ),
    sessionTtlMs: _safeEnvNumber(process.env.NYAN_DEV_SESSION_TTL_MS, 30 * 60 * 1000, 60 * 1000),
    maxAttempts: _safeEnvNumber(process.env.NYAN_DEV_MAX_ATTEMPTS, 5, 1),
    lockoutMs: _safeEnvNumber(process.env.NYAN_DEV_LOCKOUT_MS, 10 * 60 * 1000, 60 * 1000),
    sessions: new Map(), // key: wc:<id> -> { uid, expiresAt }
    failures: new Map(), // key: uid -> { count, lockedUntil }
};

function _normalizeUID(uid) {
    return String(uid || '').trim();
}

function _isDevSecurityEnabled() {
    const hasSecret = DEV_SECURITY.secretPlain.length > 0 || DEV_SECURITY.secretSha256.length === 64;
    return DEV_SECURITY.allowedUIDs.size > 0 && hasSecret;
}

function _isAllowedDevUID(uid) {
    const safeUID = _normalizeUID(uid);
    return !!safeUID && DEV_SECURITY.allowedUIDs.has(safeUID);
}

function _sha256(input) {
    return crypto.createHash('sha256').update(String(input || ''), 'utf8').digest('hex');
}

function _timingSafeEqualStrings(a, b) {
    const left = Buffer.from(String(a || ''), 'utf8');
    const right = Buffer.from(String(b || ''), 'utf8');
    if (left.length !== right.length) return false;
    return crypto.timingSafeEqual(left, right);
}

function _verifyDevSecret(passphrase) {
    const incoming = String(passphrase || '');
    if (DEV_SECURITY.secretSha256.length === 64) {
        return _timingSafeEqualStrings(_sha256(incoming), DEV_SECURITY.secretSha256);
    }
    if (!DEV_SECURITY.secretPlain) return false;
    return _timingSafeEqualStrings(incoming, DEV_SECURITY.secretPlain);
}

function _senderKey(event) {
    const senderId = event?.sender?.id;
    return Number.isFinite(senderId) ? `wc:${senderId}` : '';
}

function _cleanupDevSecurityState() {
    const now = Date.now();
    for (const [key, session] of DEV_SECURITY.sessions.entries()) {
        if (!session || now >= Number(session.expiresAt || 0)) {
            DEV_SECURITY.sessions.delete(key);
        }
    }
    for (const [uid, state] of DEV_SECURITY.failures.entries()) {
        if (!state) {
            DEV_SECURITY.failures.delete(uid);
            continue;
        }
        const lockedUntil = Number(state.lockedUntil || 0);
        if (!lockedUntil || now >= lockedUntil) {
            DEV_SECURITY.failures.delete(uid);
        }
    }
}

function _getLockoutRemainingMs(uid) {
    const state = DEV_SECURITY.failures.get(uid);
    if (!state || !state.lockedUntil) return 0;
    return Math.max(0, Number(state.lockedUntil) - Date.now());
}

function _registerFailedDevAttempt(uid) {
    const now = Date.now();
    const prev = DEV_SECURITY.failures.get(uid) || { count: 0, lockedUntil: 0 };
    const next = {
        count: Number(prev.count || 0) + 1,
        lockedUntil: 0,
    };
    if (next.count >= DEV_SECURITY.maxAttempts) {
        next.lockedUntil = now + DEV_SECURITY.lockoutMs;
        next.count = 0;
    }
    DEV_SECURITY.failures.set(uid, next);
    return next;
}

function _clearFailedDevAttempts(uid) {
    DEV_SECURITY.failures.delete(uid);
}

function _getValidDevSession(event, uid = '') {
    const key = _senderKey(event);
    if (!key) return null;
    const session = DEV_SECURITY.sessions.get(key);
    if (!session) return null;
    if (Date.now() >= Number(session.expiresAt || 0)) {
        DEV_SECURITY.sessions.delete(key);
        return null;
    }
    const safeUID = _normalizeUID(uid);
    if (safeUID && session.uid !== safeUID) return null;
    return session;
}

console.log('[*] Aplicando otimizacoes de performance...');

app.disableHardwareAcceleration();

const performanceFlags = [
    'disable-gpu',
    'disable-gpu-compositing',
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

let mainWindow    = null;
let isQuitting    = false;
const iconCache = new Map();
let cacheClearInterval = null;

function createWindow() {
    const iconPath    = getIconPath();
    const preloadPath = path.join(__dirname, 'preload.js');
    const hasPreload  = fsSync.existsSync(preloadPath);

    if (!hasPreload) {
        console.warn('[!] preload.js nao encontrado - API nativa desabilitada');
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
    const wcId = mainWindow.webContents.id;

    const indexPath = path.join(__dirname, '../../frontend/public/index.html');

    console.log(`[~] NyanTools v${APP_VERSION}`);
    console.log('[>] Diretorio:', __dirname);
    console.log('[>] Carregando:', indexPath);

    // Remove menubar padrão do Electron (nao apagar esse comentário)
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

    mainWindow.on('closed', () => {
        DEV_SECURITY.sessions.delete(`wc:${wcId}`);
        if (cacheClearInterval) {
            clearInterval(cacheClearInterval);
            cacheClearInterval = null;
        }
        mainWindow = null;
    });

    mainWindow.webContents.on('destroyed', () => {
        DEV_SECURITY.sessions.delete(`wc:${wcId}`);
    });

    mainWindow.webContents.on('console-message', (event, level, message) => {
        if (message.includes('GPU') ||
            message.includes('gpu_process_host') ||
            message.includes('DevTools')) return;
    });

    if (cacheClearInterval) {
        clearInterval(cacheClearInterval);
        cacheClearInterval = null;
    }
    cacheClearInterval = setInterval(async () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            try {
                await mainWindow.webContents.session.clearCache();
            } catch (_) {}
        }
    }, 600000);
}

function getIconPath() {
    const platform = process.platform;
    if (iconCache.has(platform)) return iconCache.get(platform);

    const iconsDir = path.join(__dirname, '../../frontend/public/assets/icons');
    const iconMap  = { win32: 'icon.ico', darwin: 'icon.icns' };
    const iconPath = path.join(iconsDir, iconMap[platform] || 'icon.png');

    iconCache.set(platform, iconPath);
    return iconPath;
}

const { autoUpdater } = require('electron-updater');

autoUpdater.autoDownload    = false;
autoUpdater.autoInstallOnAppQuit = false;
autoUpdater.allowPrerelease = false;
autoUpdater.logger          = null;

let lastUpdateCheck    = 0;
let lastDetectedReleaseTag = '';
const UPDATE_CHECK_COOLDOWN = 300000;
const BUNDLE_CATALOG_DEFAULT_URLS = [
    'https://raw.githubusercontent.com/Fish7w7/Pandora/main/frontend/public/bundle-catalog.json',
    'https://raw.githubusercontent.com/Fish7w7/Pandora/main/bundle-catalog.json',
];
const BUNDLE_CATALOG_URLS = String(process.env.NYAN_BUNDLE_CATALOG_URLS || '')
    .split(',')
    .map((entry) => String(entry || '').trim())
    .filter(Boolean)
    .filter((entry) => {
        try {
            const parsed = new URL(entry);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch (_) {
            return false;
        }
    });
const ACTIVE_BUNDLE_CATALOG_URLS = BUNDLE_CATALOG_URLS.length
    ? BUNDLE_CATALOG_URLS
    : BUNDLE_CATALOG_DEFAULT_URLS;

function _sanitizeBundleCatalog(raw = {}) {
    if (!raw || typeof raw !== 'object') return null;

    const bundles = Array.isArray(raw.bundles) ? raw.bundles : [];
    const customBundles = Array.isArray(raw.customBundles)
        ? raw.customBundles
        : Array.isArray(raw.custom_bundles)
            ? raw.custom_bundles
            : [];
    const settings = raw.settings && typeof raw.settings === 'object' ? raw.settings : {};

    return {
        version: Number(raw.version || 1),
        updatedAt: String(raw.updatedAt || ''),
        settings,
        bundles,
        customBundles,
    };
}

async function _fetchJsonWithTimeout(url, timeoutMs = 8000, headers = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, { signal: controller.signal, headers });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } finally {
        clearTimeout(timeout);
    }
}

function setupAutoUpdater() {
    autoUpdater.on('checking-for-update', () => {
        console.log('[?] electron-updater: verificando...');
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('updater-status', { event: 'checking' });
        }
    });

    autoUpdater.on('update-available', (info) => {
        console.log('[!] Update disponivel:', info.version);
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
        console.log('[OK] Download concluido:', info.version);
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

ipcMain.handle('reset-update-cooldown', () => {
    lastUpdateCheck = 0;
    console.log('[~] Cooldown de atualizacao resetado');
    return { success: true };
});

ipcMain.handle('is-dev-environment', () => {
    return { isDev: process.env.NODE_ENV === 'development' };
});

ipcMain.handle('dev-security-status', (event, payload = {}) => {
    _cleanupDevSecurityState();
    const uid = _normalizeUID(payload.uid);
    const enabled = _isDevSecurityEnabled();
    const uidAllowed = enabled && _isAllowedDevUID(uid);
    const session = uidAllowed ? _getValidDevSession(event, uid) : null;

    return {
        success: true,
        enabled,
        uidAllowed,
        unlocked: !!session,
        expiresAt: Number(session?.expiresAt || 0),
        lockoutRemainingMs: uidAllowed ? _getLockoutRemainingMs(uid) : 0,
    };
});

ipcMain.handle('dev-security-unlock', (event, payload = {}) => {
    _cleanupDevSecurityState();
    const uid = _normalizeUID(payload.uid);
    const passphrase = String(payload.passphrase || '');

    if (!_isDevSecurityEnabled()) {
        return { success: false, error: 'Seguranca dev nao configurada neste host.' };
    }
    if (!uid || !_isAllowedDevUID(uid)) {
        return { success: false, error: 'Usuario nao autorizado para acesso dev.' };
    }

    const lockoutRemainingMs = _getLockoutRemainingMs(uid);
    if (lockoutRemainingMs > 0) {
        return {
            success: false,
            error: 'Muitas tentativas invalidas. Aguarde para tentar novamente.',
            lockoutRemainingMs,
        };
    }

    if (!_verifyDevSecret(passphrase)) {
        const fail = _registerFailedDevAttempt(uid);
        return {
            success: false,
            error: 'Credencial dev invalida.',
            lockoutRemainingMs: fail.lockedUntil ? Math.max(0, fail.lockedUntil - Date.now()) : 0,
        };
    }

    _clearFailedDevAttempts(uid);
    const key = _senderKey(event);
    if (!key) return { success: false, error: 'Sessao de renderer invalida.' };

    const expiresAt = Date.now() + DEV_SECURITY.sessionTtlMs;
    DEV_SECURITY.sessions.set(key, { uid, expiresAt });
    return { success: true, expiresAt };
});

ipcMain.handle('dev-security-validate', (event, payload = {}) => {
    _cleanupDevSecurityState();
    const uid = _normalizeUID(payload.uid);
    const session = _getValidDevSession(event, uid);
    if (!session) return { success: false, authorized: false, error: 'Sessao dev expirada ou ausente.' };
    return { success: true, authorized: true, expiresAt: Number(session.expiresAt || 0) };
});

ipcMain.handle('dev-security-lock', (event) => {
    const key = _senderKey(event);
    if (key) DEV_SECURITY.sessions.delete(key);
    return { success: true };
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
            const safeTagName = String(data.tag_name || '').trim();
            if (safeTagName && safeTagName !== lastDetectedReleaseTag) {
                lastDetectedReleaseTag = safeTagName;
                console.log('[OK] GitHub API versao detectada:', safeTagName);
            }
            return { success: true, data, fromFallback: !!data._fromFallback };
        } catch (_) {}
    }

    return { success: false, error: 'Não foi possível verificar atualizações' };
});

ipcMain.handle('get-bundle-catalog', async (_event, payload = {}) => {
    const timeoutMs = _safeEnvNumber(payload?.timeoutMs, 8000, 1000);
    const payloadUrls = Array.isArray(payload?.urls)
        ? payload.urls
            .map((entry) => String(entry || '').trim())
            .filter(Boolean)
            .filter((entry) => {
                try {
                    const parsed = new URL(entry);
                    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
                } catch (_) {
                    return false;
                }
            })
        : [];

    const sources = payloadUrls.length ? payloadUrls : ACTIVE_BUNDLE_CATALOG_URLS;
    const errors = [];
    const headers = {
        'User-Agent': 'NyanTools-BundleCatalog',
        'Accept': 'application/json, text/plain, */*',
    };

    for (const source of sources) {
        try {
            const json = await _fetchJsonWithTimeout(source, timeoutMs, headers);
            const data = _sanitizeBundleCatalog(json);
            if (!data) throw new Error('Formato invalido de catalogo');
            return {
                success: true,
                source,
                fetchedAt: Date.now(),
                data,
            };
        } catch (error) {
            errors.push({
                source,
                error: String(error?.message || 'Falha desconhecida'),
            });
        }
    }

    return {
        success: false,
        error: 'Nao foi possivel carregar o catalogo de bundles.',
        sources,
        errors,
    };
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
                            console.log('[OK] Download concluido:', destPath);
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
                        console.log('[OK] [FAF] Download concluido:', destPath);
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




app.whenReady().then(() => {
    console.log(`[~] NyanTools v${APP_VERSION}`);
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
    console.error('[X] Erro nao capturado:', error.message);
});

process.on('unhandledRejection', (reason) => {
    console.error('[X] Promise rejeitada:', reason);
});

