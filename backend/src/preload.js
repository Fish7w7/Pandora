// PRELOAD SCRIPT - Ponte Electron ↔ Frontend
// Versão Otimizada v2.7.0

const { contextBridge, ipcRenderer } = require('electron');

console.log('🔧 Preload script iniciando (v2.7.0)...');

// VALIDAÇÃO E SANITIZAÇÃO

/**
 * Valida URL para segurança
 */
function isValidUrl(url) {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'https:' && parsed.hostname.includes('github');
    } catch {
        return false;
    }
}

/**
 * Valida nome de arquivo para segurança
 */
function isValidFileName(fileName) {
    if (typeof fileName !== 'string' || fileName.length === 0) return false;
    if (fileName.length > 255) return false;
    
    // Prevenir path traversal
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
        return false;
    }
    
    // Permitir apenas extensões seguras
    const validExtensions = ['.exe', '.dmg', '.AppImage', '.deb', '.rpm'];
    return validExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
}

/**
 * Valida caminho de arquivo
 */
function isValidFilePath(filePath) {
    if (typeof filePath !== 'string' || filePath.length === 0) return false;
    
    // Prevenir path traversal malicioso
    const normalized = filePath.replace(/\\/g, '/');
    if (normalized.includes('../') || normalized.includes('/../')) {
        return false;
    }
    
    return true;
}

//  API SEGURA E OTIMIZADA

try {
    contextBridge.exposeInMainWorld('electronAPI', {
        /**
         * Verificar atualizações disponíveis
         * @returns {Promise<{success: boolean, data?: object, error?: string}>}
         */
        checkForUpdates: async () => {
            try {
                const result = await ipcRenderer.invoke('check-for-updates');
                return result;
            } catch (error) {
                console.error('❌ Erro ao verificar atualizações:', error);
                return {
                    success: false,
                    error: 'Falha na comunicação com o processo principal'
                };
            }
        },
        
        /**
         * Baixar atualização
         * @param {string} downloadUrl - URL do arquivo
         * @param {string} fileName - Nome do arquivo
         * @returns {Promise<{success: boolean, filePath?: string, error?: string}>}
         */
        downloadUpdate: async (downloadUrl, fileName) => {
            // Validação de segurança
            if (!isValidUrl(downloadUrl)) {
                console.error('❌ URL inválida:', downloadUrl);
                return {
                    success: false,
                    error: 'URL inválida ou insegura'
                };
            }
            
            if (!isValidFileName(fileName)) {
                console.error('❌ Nome de arquivo inválido:', fileName);
                return {
                    success: false,
                    error: 'Nome de arquivo inválido'
                };
            }
            
            try {
                const result = await ipcRenderer.invoke('download-update', downloadUrl, fileName);
                return result;
            } catch (error) {
                console.error('❌ Erro ao baixar atualização:', error);
                return {
                    success: false,
                    error: 'Falha no download'
                };
            }
        },
        
        /**
         * Instalar atualização
         * @param {string} filePath - Caminho do arquivo baixado
         * @returns {Promise<{success: boolean, cancelled?: boolean, error?: string}>}
         */
        installUpdate: async (filePath) => {
            // Validação de segurança
            if (!isValidFilePath(filePath)) {
                console.error('❌ Caminho de arquivo inválido:', filePath);
                return {
                    success: false,
                    error: 'Caminho de arquivo inválido'
                };
            }
            
            try {
                const result = await ipcRenderer.invoke('install-update', filePath);
                return result;
            } catch (error) {
                console.error('❌ Erro ao instalar atualização:', error);
                return {
                    success: false,
                    error: 'Falha na instalação'
                };
            }
        },
        
        /**
         * Abrir pasta de downloads
         * @returns {Promise<{success: boolean, error?: string}>}
         */
        openDownloadsFolder: async () => {
            try {
                const result = await ipcRenderer.invoke('open-downloads-folder');
                return result;
            } catch (error) {
                console.error('❌ Erro ao abrir pasta:', error);
                return {
                    success: false,
                    error: 'Falha ao abrir pasta'
                };
            }
        },
        
        /**
         * Listener para progresso de download
         * @param {Function} callback - Função callback para receber atualizações
         * @returns {Function} Função para remover o listener
         */
        onDownloadProgress: (callback) => {
            if (typeof callback !== 'function') {
                console.error('❌ Callback deve ser uma função');
                return () => {};
            }
            
            // Throttling do callback para melhor performance
            let lastCall = 0;
            const throttleMs = 100; // Máximo de 10 updates por segundo
            
            const throttledCallback = (event, data) => {
                const now = Date.now();
                
                // Sempre processar 0% e 100%
                if (data.progress === 0 || data.progress === 100) {
                    callback(data);
                    lastCall = now;
                    return;
                }
                
                // Throttle para valores intermediários
                if (now - lastCall >= throttleMs) {
                    callback(data);
                    lastCall = now;
                }
            };
            
            ipcRenderer.on('download-progress', throttledCallback);
            
            // Retornar função de cleanup
            return () => {
                ipcRenderer.removeListener('download-progress', throttledCallback);
            };
        },
        
        /**
         * Remover todos os listeners de progresso (legacy)
         * @deprecated Use o retorno de onDownloadProgress() para remover
         */
        removeDownloadProgressListener: () => {
            ipcRenderer.removeAllListeners('download-progress');
        },
        
        /**
         * Informações da versão
         */
        version: '2.7.0',
        
        /**
         * Status da API
         */
        isReady: true
    });

    console.log('✅ Preload script carregado com sucesso!');
    console.log('✅ API Electron v2.7.0 exposta e protegida');
    
} catch (error) {
    console.error('❌ ERRO CRÍTICO no preload script:', error);
    
    // Expor API mínima em caso de erro
    try {
        contextBridge.exposeInMainWorld('electronAPI', {
            isReady: false,
            error: error.message,
            version: '2.7.0-fallback'
        });
    } catch (fallbackError) {
        console.error('❌ Falha ao expor API de fallback:', fallbackError);
    }
}

// 🧹 CLEANUP NA DESCARGA

window.addEventListener('beforeunload', () => {
    // Remover todos os listeners ao fechar
    ipcRenderer.removeAllListeners('download-progress');
});