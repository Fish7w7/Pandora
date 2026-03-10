// ════════════════════════════════════
// PRELOAD.JS — Ponte segura Electron ↔ Frontend
// NyanTools にゃん~ v3.0.2
// ════════════════════════════════════

const { contextBridge, ipcRenderer } = require('electron');

// ─── VALIDAÇÕES DE SEGURANÇA ─────────────────────────────────────────────────

function isValidUrl(url) {
    try {
        const { protocol, hostname } = new URL(url);
        return protocol === 'https:' && (
            hostname === 'github.com' ||
            hostname === 'objects.githubusercontent.com' ||
            hostname.endsWith('.github.com')
        );
    } catch { return false; }
}

function isValidFileName(fileName) {
    if (typeof fileName !== 'string' || fileName.length === 0 || fileName.length > 255) return false;
    if (/[/\\.]\./.test(fileName)) return false; // path traversal
    if (!fileName.startsWith('NyanTools-')) return false;
    const validExts = ['.exe', '.dmg', '.AppImage', '.deb', '.rpm'];
    return validExts.some(ext => fileName.toLowerCase().endsWith(ext));
}

function isValidFilePath(filePath) {
    if (typeof filePath !== 'string' || filePath.length === 0) return false;
    return !filePath.replace(/\\/g, '/').includes('/../');
}

function throttle(fn, ms = 100) {
    let last = 0;
    return (event, data) => {
        const now = Date.now();
        if (data?.progress === 0 || data?.progress === 100 || now - last >= ms) {
            fn(data);
            last = now;
        }
    };
}

async function invoke(channel, ...args) {
    try {
        return await ipcRenderer.invoke(channel, ...args);
    } catch (error) {
        console.error(`❌ IPC "${channel}" falhou:`, error.message);
        return { success: false, error: 'Falha na comunicação com o processo principal' };
    }
}


try {
    contextBridge.exposeInMainWorld('electronAPI', {

        version: '3.0.2',
        isReady: true,

        checkForUpdates: () => invoke('check-for-updates'),

        downloadUpdate: async (downloadUrl, fileName) => {
            if (!isValidUrl(downloadUrl)) {
                console.warn('⚠️ downloadUpdate: URL rejeitada —', downloadUrl);
                return { success: false, error: 'URL inválida ou não permitida' };
            }
            if (!isValidFileName(fileName)) {
                console.warn('⚠️ downloadUpdate: nome de arquivo rejeitado —', fileName);
                return { success: false, error: 'Nome de arquivo inválido' };
            }
            return invoke('download-update', downloadUrl, fileName);
        },

        installUpdate: async (filePath) => {
            if (!isValidFilePath(filePath)) {
                console.warn('⚠️ installUpdate: caminho rejeitado —', filePath);
                return { success: false, error: 'Caminho de arquivo inválido' };
            }
            return invoke('install-update', filePath);
        },

        openDownloadsFolder: () => invoke('open-downloads-folder'),
        resetUpdateCooldown: () => invoke('reset-update-cooldown'),
        isDevEnvironment: () => invoke('is-dev-environment'),
        onDownloadProgress: (callback) => {
            if (typeof callback !== 'function') {
                console.error('❌ onDownloadProgress: callback deve ser uma função');
                return () => {};
            }
            const throttled = throttle(callback, 100);
            ipcRenderer.on('download-progress', throttled);
            return () => ipcRenderer.removeListener('download-progress', throttled);
        },

        removeDownloadProgressListener: () => {
            ipcRenderer.removeAllListeners('download-progress');
        }
    });

    console.log('✅ [Preload v3.0.2] API exposta com sucesso');

} catch (error) {
    console.error('❌ [Preload] ERRO CRÍTICO:', error);
    try {
        contextBridge.exposeInMainWorld('electronAPI', {
            isReady: false,
            version: '3.0.2-fallback',
            error: error.message
        });
    } catch (fallbackError) {
        console.error('❌ [Preload] Falha ao expor API de fallback:', fallbackError);
    }
}

// ─── CLEANUP ─────────────────────────────────────────────────────────────────
window.addEventListener('beforeunload', () => {
    ipcRenderer.removeAllListeners('download-progress');
});