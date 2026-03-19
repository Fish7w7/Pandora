// ════════════════════════════════════
// PRELOAD.JS — Ponte segura Electron ↔ Frontend
// NyanTools にゃん~ v3.2.1
// ════════════════════════════════════

const { contextBridge, ipcRenderer } = require('electron');

// ─── VALIDAÇÕES DE SEGURANÇA ─────────────────────────────────────────────────

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

        version: '3.4.2',
        isReady: true,

        checkForUpdates: () => invoke('check-for-updates'),

        // electron-updater: escutar eventos nativos do autoUpdater
        onUpdaterStatus: (callback) => {
            if (typeof callback !== 'function') return () => {};
            const handler = (_event, data) => callback(data);
            ipcRenderer.on('updater-status', handler);
            return () => ipcRenderer.removeListener('updater-status', handler);
        },

        // instalar update já baixado e reiniciar
        installUpdateNow: () => invoke('install-update-now'),

        // iniciar download quando usuário confirmar
        startUpdateDownload: () => invoke('start-update-download'),

        // download direto + install silencioso (fallback quando native updater não funciona)
        downloadAndInstall: (url, filename) => invoke('download-and-install', { url, filename }),

        // NOVO: inicia download via send (fire-and-forget) — não bloqueia o renderer
        // resultado chega via onDownloadProgress e onUpdaterStatus
        startDownloadFireAndForget: (url, filename) => {
            ipcRenderer.send('start-download-faf', { url, filename });
        },

        openDownloadsFolder: () => invoke('open-downloads-folder'),
        openExternal: (url) => invoke('open-external', url),
        resetUpdateCooldown: () => invoke('reset-update-cooldown'),
        isDevEnvironment: () => invoke('is-dev-environment'),
        onDownloadProgress: (callback) => {
            const handler = (_event, data) => callback(data);
            ipcRenderer.on('download-progress', handler);
            return () => ipcRenderer.removeListener('download-progress', handler);
        },

        removeDownloadProgressListener: () => {
            ipcRenderer.removeAllListeners('download-progress');
        }
    });

    console.log('✅ [Preload v3.2.1] API exposta com sucesso');

} catch (error) {
    console.error('❌ [Preload] ERRO CRÍTICO:', error);
    try {
        contextBridge.exposeInMainWorld('electronAPI', {
            isReady: false,
            version: '3.4.2-fallback',
            error: error.message
        });
    } catch (fallbackError) {
        console.error('❌ [Preload] Falha ao expor API de fallback:', fallbackError);
    }
}

// ─── CLEANUP ─────────────────────────────────────────────────────────────────
window.addEventListener('beforeunload', () => {
    ipcRenderer.removeAllListeners('download-progress');
    ipcRenderer.removeAllListeners('updater-status');
});