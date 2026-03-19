/* ══════════════════════════════════════════════════
   FAVORITES.JS  v1.2.0
   Sistema de Ferramentas Favoritas にゃん~
   - Estrela ★ aparece no hover de cada nav-item
   - Clique na estrela → adiciona/remove
   - Máximo 5 favoritos
   - Drag-to-reorder na seção de favoritos
 ═══════════════════════════════════════════════════*/

const Favorites = {
    MAX: 5,
    _storageKey: 'nyan_favorites',
    _dragSrc: null,

    // ── CRUD ─────────────────────────────────────────

    load() {
        try { return JSON.parse(Utils.loadData(this._storageKey) || '[]'); }
        catch { return []; }
    },

    save(list) { Utils.saveData(this._storageKey, JSON.stringify(list)); },

    has(toolId) { return this.load().includes(toolId); },

    add(toolId) {
        const list = this.load();
        if (list.includes(toolId) || list.length >= this.MAX) return false;
        list.push(toolId);
        this.save(list);
        return true;
    },

    remove(toolId) {
        this.save(this.load().filter(id => id !== toolId));
    },

    reorder(fromId, toId) {
        const list = this.load();
        const from = list.indexOf(fromId);
        const to   = list.indexOf(toId);
        if (from === -1 || to === -1 || from === to) return;
        list.splice(from, 1);
        list.splice(to, 0, fromId);
        this.save(list);
    },

    // ── RENDER ────────────────────────────────────────

    renderSection() {
        const favIds = this.load();

        // Empty state — estrela ☆ com dica de como adicionar
        if (favIds.length === 0) {
            return `
                <div class="nav-group" id="fav-group">
                    <div class="nav-group-label fav-group-label">
                        <span>⭐ Favoritos</span>
                        <span class="fav-count">0/${this.MAX}</span>
                    </div>
                    <div style="
                        margin:0.25rem 0.5rem 0.5rem;
                        padding:0.625rem 0.75rem;
                        border-radius:10px;
                        border:1px dashed rgba(255,255,255,0.12);
                        text-align:center;
                    ">
                        <div style="font-size:1.1rem;margin-bottom:0.25rem;opacity:0.4;">☆</div>
                        <p style="font-size:0.6rem;color:rgba(255,255,255,0.3);line-height:1.4;margin:0;font-family:'DM Sans',sans-serif;">
                            Passe o mouse em uma ferramenta e clique na ★ para fixar aqui
                        </p>
                    </div>
                </div>
                <div class="fav-divider"></div>
            `;
        }

        const toolMap = Object.fromEntries((App.tools || []).map(t => [t.id, t]));
        const items = favIds
            .map(id => toolMap[id]).filter(Boolean)
            .map(tool => this._renderFavItem(tool)).join('');

        return `
            <div class="nav-group" id="fav-group">
                <div class="nav-group-label fav-group-label">
                    <span>⭐ Favoritos</span>
                    <span class="fav-count">${favIds.length}/${this.MAX}</span>
                </div>
                <div id="fav-list">${items}</div>
            </div>
            <div class="fav-divider"></div>
        `;
    },

    _renderFavItem(tool) {
        const isActive = App.currentTool === tool.id;
        return `
            <button class="nav-item ${isActive ? 'active' : ''} fav-item"
                    data-tool="${tool.id}"
                    data-fav-id="${tool.id}"
                    draggable="true"
                    onclick="Router.navigate('${tool.id}')"
                    title="${tool.description}">
                <span class="nav-drag-handle">⠿</span>
                <span class="nav-icon">${tool.icon}</span>
                <span class="nav-label">${tool.name}</span>
                <span class="nav-star-btn active"
                      onclick="event.stopPropagation(); Favorites._toggle('${tool.id}')"
                      title="Remover dos favoritos">★</span>
            </button>
        `;
    },

    // ── INJECT STARS nos itens normais ────────────────

    injectStars() {
        document.querySelectorAll('#nav-menu .nav-item:not(.fav-item)').forEach(item => {
            const toolId = item.dataset.tool;
            if (!toolId || item.querySelector('.nav-star-btn')) return;

            const star = document.createElement('span');
            star.className = 'nav-star-btn' + (this.has(toolId) ? ' active' : '');
            star.title = this.has(toolId) ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
            star.textContent = this.has(toolId) ? '★' : '☆';
            star.addEventListener('click', (e) => {
                e.stopPropagation();
                this._toggle(toolId);
            });
            item.appendChild(star);
        });
    },

    _toggle(toolId) {
        const wasFav = this.has(toolId);
        if (wasFav) {
            this.remove(toolId);
            Utils.showNotification?.('Removido dos favoritos', 'info');
        } else {
            if (this.load().length >= this.MAX) {
                Utils.showNotification?.(`Máximo de ${this.MAX} favoritos atingido にゃん~`, 'warning');
                return;
            }
            this.add(toolId);
            Utils.showNotification?.('⭐ Adicionado aos favoritos! にゃん~', 'success');
        }
        this._rerender();
    },

    _rerender() {
        App.renderNavMenu();
    },

    // ── DRAG & DROP ───────────────────────────────────

    setupDragDrop() {
        const list = document.getElementById('fav-list');
        if (!list) return;

        list.addEventListener('dragstart', (e) => {
            const item = e.target.closest('.fav-item');
            if (!item) return;
            this._dragSrc = item.dataset.favId;
            item.style.opacity = '0.4';
            e.dataTransfer.effectAllowed = 'move';
        });

        list.addEventListener('dragend', (e) => {
            const item = e.target.closest('.fav-item');
            if (item) item.style.opacity = '';
            document.querySelectorAll('.fav-item').forEach(el => el.classList.remove('fav-drag-over'));
            this._dragSrc = null;
        });

        list.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            const item = e.target.closest('.fav-item');
            document.querySelectorAll('.fav-item').forEach(el => el.classList.remove('fav-drag-over'));
            if (item && item.dataset.favId !== this._dragSrc) item.classList.add('fav-drag-over');
        });

        list.addEventListener('drop', (e) => {
            e.preventDefault();
            const target = e.target.closest('.fav-item');
            if (!target || !this._dragSrc) return;
            const toId = target.dataset.favId;
            if (toId !== this._dragSrc) {
                this.reorder(this._dragSrc, toId);
                this._rerender();
            }
        });
    },

    // ── INIT ──────────────────────────────────────────

    init() {
        setTimeout(() => {
            this.injectStars();
            this.setupDragDrop();
        }, 0);
        console.log('⭐ Favorites inicializado');
    }
};

window.Favorites = Favorites;