/* ══════════════════════════════════════════════════
   SHARE-TO-FEED.JS v1.0.0 — NyanTools にゃん~
   Botão de compartilhamento de scores no Feed
   Chamado por qualquer jogo ao terminar uma partida.
 ═══════════════════════════════════════════════════*/

const ShareToFeed = {

    GAMES: {
        typeracer:  { name: 'Type Racer',  icon: '⌨️', unit: 'WPM'   },
        '2048':     { name: '2048',        icon: '🔢', unit: 'pts'   },
        flappy:     { name: 'Flappy Nyan', icon: '🐱', unit: 'pts'   },
        quiz:       { name: 'Quiz Diário', icon: '🧠', unit: '/10'   },
        termo:      { name: 'Termo',       icon: '🔤', unit: 'tent.' },
        snake:      { name: 'Cobrinha',    icon: '🐍', unit: 'pts'   },
        slot:       { name: 'Caça-Níquel', icon: '🎰', unit: 'pts'   },
    },

    /**
     * Exibe o botão "Compartilhar" numa área do DOM.
     * @param {string} containerId  — id do elemento onde injetar o botão
     * @param {string} gameId       — chave de GAMES (ex: 'typeracer')
     * @param {number} score        — score da partida
     * @param {object} opts         — { isRecord: bool }
     */
    showButton(containerId, gameId, score, opts = {}) {
        if (!window.NyanAuth?.isOnline?.()) return;
        const container = document.getElementById(containerId);
        if (!container) return;

        // Remover botão anterior se existir
        container.querySelector('.share-feed-btn')?.remove();

        const game = this.GAMES[gameId];
        if (!game) return;

        const d    = document.body.classList.contains('dark-theme');
        const label = opts.isRecord ? '🏆 Compartilhar recorde!' : '📤 Compartilhar no feed';
        const bg    = opts.isRecord
            ? 'linear-gradient(135deg,rgba(168,85,247,0.2),rgba(236,72,153,0.15))'
            : 'rgba(255,255,255,0.06)';
        const border = opts.isRecord
            ? '1px solid rgba(168,85,247,0.4)'
            : '1px solid rgba(255,255,255,0.1)';
        const color = opts.isRecord ? '#c084fc' : (d ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)');

        const btn = document.createElement('button');
        btn.className = 'share-feed-btn';
        btn.style.cssText =
            'display:flex;align-items:center;gap:0.5rem;margin-top:0.75rem;' +
            'padding:0.5rem 1rem;border-radius:12px;cursor:pointer;' +
            'background:' + bg + ';border:' + border + ';' +
            'color:' + color + ';font-size:0.78rem;font-weight:700;' +
            "font-family:'DM Sans',sans-serif;transition:opacity 0.15s;width:100%;justify-content:center;";
        btn.textContent = label;
        btn.title = 'Postar no seu feed de atividade';

        btn.onclick = async () => {
            btn.disabled = true;
            btn.textContent = '⏳ Publicando...';
            btn.style.opacity = '0.6';
            try {
                if (opts.isRecord) {
                    await Feed.publishRecord(gameId, game.name, score, game.unit);
                } else {
                    await Feed.publishScore(gameId, game.name, score, game.unit);
                }
                btn.textContent = '✅ Publicado!';
                btn.style.opacity = '1';
                btn.style.color = '#4ade80';
                btn.style.border = '1px solid rgba(74,222,128,0.3)';
                setTimeout(() => btn.remove(), 2500);
            } catch(e) {
                btn.textContent = '❌ Erro ao publicar';
                btn.style.opacity = '1';
                btn.disabled = false;
                setTimeout(() => {
                    btn.textContent = label;
                    btn.style.color = color;
                    btn.style.border = border;
                }, 2000);
            }
        };

        container.appendChild(btn);
    },

    /**
     * Versão flutuante — mostra um toast/card de compartilhamento
     * quando não há um container específico disponível.
     */
    showToast(gameId, score, opts = {}) {
        if (!window.NyanAuth?.isOnline?.()) return;
        document.getElementById('share-toast')?.remove();

        const game = this.GAMES[gameId];
        if (!game) return;

        const d      = document.body.classList.contains('dark-theme');
        const bg     = d ? '#1a1a2e' : '#ffffff';
        const text   = d ? '#f1f5f9' : '#0f172a';
        const muted  = d ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)';
        const border = opts.isRecord
            ? 'rgba(168,85,247,0.5)'
            : (d ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)');

        const toast = document.createElement('div');
        toast.id = 'share-toast';
        toast.style.cssText =
            'position:fixed;bottom:1.5rem;right:1.5rem;z-index:99998;' +
            'background:' + bg + ';border:1px solid ' + border + ';' +
            'border-radius:16px;padding:1rem 1.25rem;' +
            'box-shadow:0 8px 32px rgba(0,0,0,0.3);' +
            "font-family:'DM Sans',sans-serif;" +
            'display:flex;align-items:center;gap:0.875rem;min-width:260px;max-width:320px;' +
            'animation:slideInRight 0.3s cubic-bezier(0.34,1.56,0.64,1);';

        const scoreDisplay = score + ' ' + game.unit;
        const titleText = opts.isRecord
            ? game.icon + ' Novo recorde em ' + game.name + '!'
            : game.icon + ' ' + game.name;

        toast.innerHTML =
            '<div style="flex:1;min-width:0;">' +
                '<div style="font-size:0.82rem;font-weight:800;color:' + text + ';margin-bottom:0.15rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + titleText + '</div>' +
                '<div style="font-size:0.72rem;color:' + muted + ';">Score: <span style="font-weight:700;color:' + (opts.isRecord ? '#c084fc' : text) + ';">' + scoreDisplay + '</span></div>' +
            '</div>' +
            '<button id="share-toast-btn" style="flex-shrink:0;padding:0.45rem 0.875rem;border-radius:9px;border:none;cursor:pointer;' +
                'background:' + (opts.isRecord ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.08)') + ';' +
                'color:' + (opts.isRecord ? '#c084fc' : text) + ';font-weight:700;font-size:0.75rem;' +
                'font-family:\'DM Sans\',sans-serif;white-space:nowrap;">📤 Postar</button>' +
            '<button onclick="document.getElementById(\'share-toast\').remove()" ' +
                'style="flex-shrink:0;background:none;border:none;cursor:pointer;font-size:1rem;color:' + muted + ';padding:0 0.25rem;">✕</button>';

        // Auto-remover após 8s
        const autoRemove = setTimeout(() => toast.remove(), 8000);

        document.body.appendChild(toast);

        // Injetar animação se não existir
        if (!document.getElementById('share-toast-style')) {
            const style = document.createElement('style');
            style.id = 'share-toast-style';
            style.textContent = '@keyframes slideInRight{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}';
            document.head.appendChild(style);
        }

        document.getElementById('share-toast-btn').onclick = async () => {
            clearTimeout(autoRemove);
            const btn = document.getElementById('share-toast-btn');
            btn.textContent = '⏳';
            btn.disabled = true;
            try {
                if (opts.isRecord) {
                    await Feed.publishRecord(gameId, game.name, score, game.unit);
                } else {
                    await Feed.publishScore(gameId, game.name, score, game.unit);
                }
                toast.style.border = '1px solid rgba(74,222,128,0.4)';
                btn.textContent = '✅';
                btn.style.color = '#4ade80';
                setTimeout(() => toast.remove(), 1800);
            } catch(e) {
                btn.textContent = '❌';
                btn.disabled = false;
                setTimeout(() => { btn.textContent = '📤 Postar'; }, 1500);
            }
        };
    },
};

window.ShareToFeed = ShareToFeed;