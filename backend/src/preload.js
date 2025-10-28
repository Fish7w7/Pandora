// ============================================
// PRELOAD SCRIPT - Ponte Electron ↔ Frontend
// ============================================

const { contextBridge, ipcRenderer } = require('electron');

console.log('🔧 Preload script iniciando...');

try {
    // Expor API segura para o frontend
    contextBridge.exposeInMainWorld('electronAPI', {
        // Verificar atualizações
        checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
        
        // Baixar atualização
        downloadUpdate: (downloadUrl, fileName) => 
            ipcRenderer.invoke('download-update', downloadUrl, fileName),
        
        // Instalar atualização
        installUpdate: (filePath) => 
            ipcRenderer.invoke('install-update', filePath),
        
        // Abrir pasta de downloads
        openDownloadsFolder: () => 
            ipcRenderer.invoke('open-downloads-folder'),
        
        // Listener para progresso de download
        onDownloadProgress: (callback) => {
            ipcRenderer.on('download-progress', (event, data) => callback(data));
        },
        
        // Remover listener
        removeDownloadProgressListener: () => {
            ipcRenderer.removeAllListeners('download-progress');
        }
    });

    console.log('✅ Preload script carregado - API Electron exposta');
} catch (error) {
    console.error('❌ Erro no preload script:', error);
}