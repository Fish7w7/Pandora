// ============================================
// PRELOAD.JS — Ponte segura Electron ↔ Frontend
// NyanTools にゃん~ v3.0
// ============================================

const { contextBridge, ipcRenderer } = require('electron');

// ============================================
// VALIDAÇÕES DE SEGURANÇA
// ============================================

/**
 * Aceita apenas URLs HTTPS do GitHub
 */
function isValidUrl(url) {
    try {
        const { protocol, hostname } = new URL(url);
        return protocol === 'https:' && (
            hostname === 'github.com' ||
            hostname === 'objects.githubusercontent.com' ||
            hostname.endsWith('.github.com')
        );
    } catch {
        return false;
    }
}

/**
 * Aceita apenas extensões de instalador conhecidas, sem path traversal
 */
function isValidFileName(fileName) {
    if (typeof fileName !== 'string' || fileName.length === 0 || fileName.length > 255) return false;
    if (/[/\\.]\./.test(fileName)) return false; // path traversal
    const validExts = ['.exe', '.dmg', '.AppImage', '.deb', '.rpm'];
    return validExts.some(ext => fileName.toLowerCase().endsWith(ext));
}

/**
 * Verifica que o caminho não contém path traversal malicioso
 */
function isValidFilePath(filePath) {
    if (typeof filePath !== 'string' || filePath.length === 0) return false;
    return !filePath.replace(/\\/g, '/').includes('/../');
}

// ============================================
// THROTTLE UTILITÁRIO
// ============================================

/**
 * Throttle genérico — evita flood de callbacks
 * Sempre deixa passar 0% e 100%
 */
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

// ============================================
// IPC HELPER — wrapper seguro com try/catch
// ============================================

async function invoke(channel, ...args) {
    try {
        return await ipcRenderer.invoke(channel, ...args);
    } catch (error) {
        console.error(`❌ IPC "${channel}" falhou:`, error.message);
        return { success: false, error: 'Falha na comunicação com o processo principal' };
    }
}

// ============================================
// API EXPOSTA AO FRONTEND
// ============================================

try {
    contextBridge.exposeInMainWorld('electronAPI', {

        /** Versão do preload */
        version: '3.0.0',

        /** Indica que o preload carregou com sucesso */
        isReady: true,

        /**
         * Verifica se há atualizações disponíveis no GitHub
         * @returns {Promise<{success: boolean, data?: object, error?: string}>}
         */
        checkForUpdates: () => invoke('check-for-updates'),

        /**
         * Inicia o download de um arquivo de atualização
         * @param {string} downloadUrl  URL HTTPS do instalador
         * @param {string} fileName     Nome do arquivo (ex: NyanTools-2.8.0.exe)
         * @returns {Promise<{success: boolean, filePath?: string, error?: string}>}
         */
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

        /**
         * Instala um arquivo de atualização já baixado
         * @param {string} filePath  Caminho absoluto do instalador
         * @returns {Promise<{success: boolean, cancelled?: boolean, error?: string}>}
         */
        installUpdate: async (filePath) => {
            if (!isValidFilePath(filePath)) {
                console.warn('⚠️ installUpdate: caminho rejeitado —', filePath);
                return { success: false, error: 'Caminho de arquivo inválido' };
            }
            return invoke('install-update', filePath);
        },

        /**
         * Abre a pasta de downloads do sistema
         * @returns {Promise<{success: boolean, error?: string}>}
         */
        openDownloadsFolder: () => invoke('open-downloads-folder'),

        /**
         * Registra um listener de progresso de download com throttle automático.
         * @param {function} callback  Recebe { progress, downloadedBytes, totalBytes }
         * @returns {function} Chame para cancelar o listener
         */
        onDownloadProgress: (callback) => {
            if (typeof callback !== 'function') {
                console.error('❌ onDownloadProgress: callback deve ser uma função');
                return () => {};
            }

            const throttled = throttle(callback, 100);
            ipcRenderer.on('download-progress', throttled);

            // Retorna cleanup function
            return () => ipcRenderer.removeListener('download-progress', throttled);
        },

        /**
         * Remove todos os listeners de progresso de download.
         * @deprecated Use o retorno de onDownloadProgress() para remover pontualmente.
         */
        removeDownloadProgressListener: () => {
            ipcRenderer.removeAllListeners('download-progress');
        }
    });

    console.log('✅ [Preload v3.0] API exposta com sucesso');

} catch (error) {
    // Falha crítica: expõe API mínima para o frontend não quebrar completamente
    console.error('❌ [Preload] ERRO CRÍTICO:', error);
    try {
        contextBridge.exposeInMainWorld('electronAPI', {
            isReady: false,
            version: '3.0.0-fallback',
            error: error.message
        });
    } catch (fallbackError) {
        console.error('❌ [Preload] Falha ao expor API de fallback:', fallbackError);
    }
}

// ============================================
// CLEANUP
// ============================================

window.addEventListener('beforeunload', () => {
    ipcRenderer.removeAllListeners('download-progress');
});