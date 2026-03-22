/* ══════════════════════════════════════════════════
   SHOP.JS v1.0.0 — NyanTools にゃん~
   Loja — Rotação Semanal, Compra, Catálogo
   v3.8.0 "Nyan Economy"
 ═══════════════════════════════════════════════════*/

const Shop = {

    _tab: 'weekly',   // 'weekly' | 'all' | 'owned'

    // ── ROTAÇÃO SEMANAL ───────────────────────────────
    // 6 itens por semana, escolhidos com seed da segunda-feira.
    // 1 item exclusivo semanal (só disponível nessa semana).
    WEEKLY_SIZE:     6,
    WEEKLY_EXCL_ID:  null, // calculado no getWeeklyItems()

    _getWeekSeed() {
        const d = new Date();
        const day = d.getDay();
        const monday = new Date(d);
        monday.setDate(d.getDate() - ((day + 6) % 7));
        monday.setHours(0, 0, 0, 0);
        const str = `${monday.getFullYear()}-${monday.getMonth()}-${monday.getDate()}`;
        let h = 5381;
        for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i);
        return Math.abs(h);
    },

    _seededShuffle(arr, seed) {
        const a = [...arr];
        let s = seed;
        for (let i = a.length - 1; i > 0; i--) {
            s = (s * 1664525 + 1013904223) & 0xffffffff;
            const j = Math.abs(s) % (i + 1);
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    },

    getWeeklyItems() {
        const seed      = this._getWeekSeed();
        const catalog   = Inventory.CATALOG.filter(i => !i.milestone); // marcos não ficam na loja
        const shuffled  = this._seededShuffle(catalog, seed);

        // Primeiro item da rotação vira o exclusivo semanal
        const weekly = shuffled[0];
        this.WEEKLY_EXCL_ID = weekly.id;

        // Mais 5 itens regulares (sem duplicar o exclusivo)
        const rest = shuffled.filter(i => i.id !== weekly.id).slice(0, this.WEEKLY_SIZE - 1);

        return [{ ...weekly, isWeeklyExclusive: true }, ...rest];
    },

    _getWeekReset() {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const daysToMon = (8 - dayOfWeek) % 7 || 7;
        const nextMon   = new Date(now);
        nextMon.setDate(now.getDate() + daysToMon);
        nextMon.setHours(0, 0, 0, 0);
        const h = Math.round((nextMon - now) / 3600000);
        return `${Math.floor(h / 24)}d ${h % 24}h`;
    },

    // ── HELPERS DE COR ────────────────────────────────

    _isDark() { return document.body.classList.contains('dark-theme'); },

    _colors() {
        const d = this._isDark();
        return {
            bg:     d ? 'rgba(255,255,255,0.04)' : '#ffffff',
            border: d ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
            text:   d ? '#f1f5f9'                : '#0f172a',
            sub:    d ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)',
            muted:  d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)',
            inner:  d ? 'rgba(255,255,255,0.05)' : '#f8fafc',
        };
    },

    // ── RENDER PRINCIPAL ──────────────────────────────

    render() {
        this._tab = this._tab || 'weekly';
        const c      = this._colors();
        const chips  = window.Economy?.getChips?.() || 0;
        const level  = window.Economy?.getLevel?.()  || 1;

        return `
        <div style="max-width:680px;margin:0 auto;font-family:var(--font-body,'DM Sans',sans-serif);">

            <!-- Header -->
            <div style="text-align:center;margin-bottom:1.5rem;">
                <div style="font-size:2.5rem;margin-bottom:0.4rem;">🛍️</div>
                <h1 style="font-family:'Syne',sans-serif;font-size:2rem;font-weight:900;margin:0 0 0.25rem;
                    background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));
                    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
                    Loja
                </h1>
                <p style="font-size:0.75rem;color:${c.muted};margin:0;">
                    Rotação semanal · renova em <strong style="color:${c.sub};">${this._getWeekReset()}</strong>
                </p>
            </div>

            <!-- Saldo do jogador -->
            <div style="
                display:flex;align-items:center;justify-content:space-between;
                background:${c.inner};border:1px solid ${c.border};
                border-radius:14px;padding:0.875rem 1.125rem;margin-bottom:1.25rem;
            ">
                <div style="display:flex;align-items:center;gap:0.75rem;">
                    <div style="font-size:1.5rem;">⬡</div>
                    <div>
                        <div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:${c.muted};">Seus chips</div>
                        <div id="shop-chips-display" style="font-size:1.4rem;font-weight:900;font-family:'Syne',sans-serif;color:${this._isDark()?'#fcd34d':'#b45309'};">${chips.toLocaleString('pt-BR')}</div>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:${c.muted};">Nível</div>
                    <div style="font-size:1.4rem;font-weight:900;font-family:'Syne',sans-serif;color:var(--theme-primary,#a855f7);">${level}</div>
                </div>
            </div>

            <!-- Tabs -->
            <div style="
                display:flex;gap:0.25rem;background:${c.inner};
                border:1px solid ${c.border};border-radius:14px;padding:0.3rem;margin-bottom:1.25rem;
            ">
                ${['weekly','all','owned'].map(tab => {
                    const labels = { weekly: '⭐ Semanal', all: '📦 Catálogo', owned: '🎒 Meu Inventário' };
                    const active = this._tab === tab;
                    return `
                    <button onclick="Shop._setTab('${tab}')" style="
                        flex:1;padding:0.55rem 0.75rem;border-radius:10px;border:none;cursor:pointer;
                        font-size:0.8rem;font-weight:600;font-family:'DM Sans',sans-serif;
                        transition:all 0.18s ease;
                        background:${active ? c.bg : 'transparent'};
                        color:${active ? 'var(--theme-primary,#a855f7)' : c.muted};
                        box-shadow:${active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'};
                        border:${active ? '1px solid rgba(168,85,247,0.2)' : '1px solid transparent'};
                    ">${labels[tab]}</button>`;
                }).join('')}
            </div>

            <!-- Conteúdo da tab -->
            <div id="shop-content">
                ${this._renderTabContent()}
            </div>
        </div>`;
    },

    _renderTabContent() {
        if (this._tab === 'weekly') return this._renderWeekly();
        if (this._tab === 'all')    return this._renderAll();
        if (this._tab === 'owned')  return this._renderOwned();
        return '';
    },

    // ── TAB: SEMANAL ──────────────────────────────────

    _renderWeekly() {
        const items = this.getWeeklyItems();
        const c     = this._colors();

        return `
        <div>
            <div style="
                background:${this._isDark()?'rgba(245,158,11,0.08)':'#fffbeb'};
                border:1px solid ${this._isDark()?'rgba(245,158,11,0.2)':'#fde68a'};
                border-radius:12px;padding:0.75rem 1rem;margin-bottom:1rem;
                display:flex;align-items:center;gap:0.625rem;
            ">
                <span style="font-size:1rem;">⭐</span>
                <span style="font-size:0.75rem;color:${this._isDark()?'#fcd34d':'#b45309'};font-weight:600;">
                    Oferta exclusiva disponível só nessa semana! Renova em ${this._getWeekReset()}.
                </span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.75rem;">
                ${items.map(item => this._renderItemCard(item)).join('')}
            </div>
        </div>`;
    },

    // ── TAB: CATÁLOGO COMPLETO ────────────────────────

    _renderAll() {
        const types = [
            { key: 'title',    label: 'Títulos',             icon: '🏷️' },
            { key: 'border',   label: 'Bordas de Avatar',    icon: '🖼️' },
            { key: 'theme',    label: 'Temas Visuais',       icon: '🎨' },
            { key: 'effect',   label: 'Efeitos de Navegação',icon: '✨' },
            { key: 'particle', label: 'Partículas de Perfil',icon: '🌟' },
        ];
        const c = this._colors();

        return types.map(t => {
            const items = Inventory.getByType(t.key).filter(i => !i.milestone);
            if (!items.length) return '';
            return `
            <div style="margin-bottom:1.5rem;">
                <div style="font-size:0.68rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;
                    color:${c.muted};margin-bottom:0.625rem;">${t.icon} ${t.label}</div>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.625rem;">
                    ${items.map(item => this._renderItemCard(item)).join('')}
                </div>
            </div>`;
        }).join('');
    },

    // ── TAB: INVENTÁRIO DO JOGADOR ────────────────────

    _renderOwned() {
        const owned = Inventory.getOwned();
        const c     = this._colors();

        if (!owned.length) {
            return `
            <div style="text-align:center;padding:3rem 1rem;">
                <div style="font-size:3rem;margin-bottom:0.75rem;opacity:0.4;">🎒</div>
                <div style="font-size:0.9rem;font-weight:700;color:${c.sub};margin-bottom:0.375rem;">
                    Inventário vazio
                </div>
                <p style="font-size:0.75rem;color:${c.muted};">
                    Compre itens na aba Semanal ou Catálogo!
                </p>
            </div>`;
        }

        // Agrupar por tipo
        const types = ['title', 'border', 'theme', 'effect', 'particle'];
        const labels = { title:'Títulos', border:'Bordas', theme:'Temas', effect:'Efeitos', particle:'Partículas' };

        return types.map(type => {
            const items = owned.filter(i => i.type === type);
            if (!items.length) return '';
            return `
            <div style="margin-bottom:1.25rem;">
                <div style="font-size:0.68rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;
                    color:${c.muted};margin-bottom:0.625rem;">${labels[type]}</div>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.625rem;">
                    ${items.map(item => this._renderItemCard(item, true)).join('')}
                </div>
            </div>`;
        }).join('');
    },

    // ── CARD DE ITEM ──────────────────────────────────

    _renderItemCard(item, isOwned = false) {
        const c         = this._colors();
        const owned     = isOwned || Inventory.owns(item.id);
        const equipped  = Inventory.getEquipped(item.type) === item.id;
        const level     = window.Economy?.getLevel?.() || 1;
        const chips     = window.Economy?.getChips?.() || 0;
        const canAfford = chips >= item.price;
        const canLevel  = level >= item.minLevel;
        const canBuy    = !owned && canAfford && canLevel && !item.milestone;
        const rarity    = Inventory.RARITY[item.rarity] || Inventory.RARITY.common;
        const d         = this._isDark();

        // Estado do botão
        let btnText, btnStyle, btnClick, btnDisabled = false;
        if (item.milestone) {
            btnText  = owned ? '✓ Desbloqueado' : `🔒 Nv ${item.minLevel}`;
            btnStyle = `background:${d?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.05)'};color:${c.muted};border:1px solid ${c.border};`;
            btnDisabled = true;
        } else if (owned) {
            if (equipped) {
                btnText  = '✓ Equipado';
                btnStyle = `background:rgba(74,222,128,0.15);color:#4ade80;border:1px solid rgba(74,222,128,0.3);`;
                btnClick = `Shop._confirmUnequip('${item.type}')`;
            } else {
                btnText  = '⚡ Equipar';
                btnStyle = `background:var(--theme-primary,#a855f7);color:white;border:none;`;
                btnClick = `Shop._confirmEquip('${item.id}')`;
            }
        } else if (!canLevel) {
            btnText  = `🔒 Nível ${item.minLevel}`;
            btnStyle = `background:${d?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.05)'};color:${c.muted};border:1px solid ${c.border};`;
            btnDisabled = true;
        } else if (!canAfford) {
            btnText  = `⬡ ${item.price.toLocaleString('pt-BR')}`;
            btnStyle = `background:rgba(239,68,68,0.12);color:${d?'#f87171':'#be123c'};border:1px solid rgba(239,68,68,0.25);`;
            btnDisabled = true;
        } else {
            btnText  = `🛍️ ${item.price.toLocaleString('pt-BR')} chips`;
            btnStyle = `background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));color:white;border:none;`;
            btnClick = `Shop._confirmBuy('${item.id}')`;
        }

        return `
        <div style="
            background:${owned?`${rarity.bg}`:`${c.bg}`};
            border:1px solid ${owned?rarity.color+'33':c.border};
            border-radius:14px;padding:1rem;
            position:relative;overflow:hidden;
            transition:transform 0.15s,box-shadow 0.15s;
            ${equipped?`box-shadow:0 0 0 2px ${rarity.color};`:''}
        "
        onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)${equipped ? (',0 0 0 2px ' + rarity.color) : ''}'"
        onmouseleave="this.style.transform='';this.style.boxShadow='${equipped ? ('0 0 0 2px ' + rarity.color) : ''}'">

            <!-- Badge de raridade / exclusivo -->
            <div style="display:flex;align-items:center;gap:0.375rem;margin-bottom:0.625rem;">
                <span style="
                    font-size:0.58rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;
                    color:${rarity.color};background:${rarity.bg};
                    border:1px solid ${rarity.color}44;border-radius:99px;padding:2px 7px;
                ">${rarity.label}</span>
                ${item.isWeeklyExclusive ? `<span style="
                    font-size:0.58rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;
                    color:${d?'#fcd34d':'#b45309'};background:rgba(245,158,11,0.12);
                    border:1px solid rgba(245,158,11,0.3);border-radius:99px;padding:2px 7px;
                ">⭐ Exclusivo</span>` : ''}
                ${item.milestone ? `<span style="
                    font-size:0.58rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;
                    color:${d?'#fcd34d':'#b45309'};background:rgba(245,158,11,0.12);
                    border:1px solid rgba(245,158,11,0.3);border-radius:99px;padding:2px 7px;
                ">🏆 Marco</span>` : ''}
            </div>

            <!-- Ícone e nome -->
            <div style="display:flex;align-items:center;gap:0.625rem;margin-bottom:0.375rem;">
                <div style="
                    width:40px;height:40px;border-radius:10px;flex-shrink:0;
                    background:${rarity.bg};border:1px solid ${rarity.color}33;
                    display:flex;align-items:center;justify-content:center;font-size:1.3rem;
                ">${item.icon}</div>
                <div>
                    <div style="font-size:0.85rem;font-weight:700;color:${c.text};font-family:'Syne',sans-serif;line-height:1.2;">${item.name}</div>
                    <div style="font-size:0.68rem;color:${c.muted};margin-top:1px;">${item.preview || ''}</div>
                </div>
            </div>

            <!-- Requisito de nível -->
            ${item.minLevel > 1 ? `
            <div style="font-size:0.65rem;color:${!canLevel?'#ef4444':c.muted};margin-bottom:0.625rem;">
                ${!canLevel?'🔒':'✓'} Nível mínimo: ${item.minLevel}
            </div>` : '<div style="margin-bottom:0.625rem;"></div>'}

            <!-- Botão de ação -->
            <button
                ${btnDisabled ? 'disabled' : ''}
                onclick="${btnClick || ''}"
                style="
                    width:100%;padding:0.5rem;border-radius:9px;
                    font-size:0.75rem;font-weight:700;font-family:'DM Sans',sans-serif;
                    cursor:${btnDisabled?'not-allowed':'pointer'};
                    opacity:${btnDisabled?'0.6':'1'};
                    transition:filter 0.15s,transform 0.1s;
                    ${btnStyle}
                "
                onmouseover="if(!this.disabled)this.style.filter='brightness(1.1)'"
                onmouseout="this.style.filter=''"
                onmousedown="if(!this.disabled)this.style.transform='scale(0.97)'"
                onmouseup="this.style.transform=''">
                ${btnText}
            </button>
        </div>`;
    },

    // ── MODAIS DE CONFIRMAÇÃO ─────────────────────────

    _confirmBuy(itemId) {
        const item  = Inventory.getItem(itemId);
        if (!item) return;
        const chips = window.Economy?.getChips?.() || 0;
        const d     = this._isDark();

        this._showModal({
            icon:   item.icon,
            title:  `Comprar "${item.name}"?`,
            body:   `Custo: <strong style="color:${d?'#fcd34d':'#b45309'};">${item.price.toLocaleString('pt-BR')} chips</strong><br>Seu saldo: ${chips.toLocaleString('pt-BR')} chips`,
            confirmText:  '🛍️ Comprar',
            confirmColor: 'linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899))',
            onConfirm: () => {
                const result = Inventory.buy(itemId);
                if (result.ok) {
                    // Atualizar chips no display
                    const chipsEl = document.getElementById('shop-chips-display');
                    if (chipsEl) chipsEl.textContent = (window.Economy?.getChips?.() || 0).toLocaleString('pt-BR');
                    // Perguntar se quer equipar
                    setTimeout(() => this._confirmEquip(itemId), 400);
                } else {
                    Utils.showNotification?.(`❌ ${result.reason}`, 'error');
                }
            }
        });
    },

    _confirmEquip(itemId) {
        const item = Inventory.getItem(itemId);
        if (!item) return;
        const prev = Inventory.getEquippedItem(item.type);

        this._showModal({
            icon:  item.icon,
            title: `Equipar "${item.name}"?`,
            body:  prev
                ? `Vai substituir: <strong>"${prev.name}"</strong>`
                : 'Será equipado imediatamente na sidebar.',
            confirmText:  '⚡ Equipar',
            confirmColor: 'var(--theme-primary,#a855f7)',
            onConfirm: () => {
                Inventory.equip(itemId);
                Router?.render();
            }
        });
    },

    _confirmUnequip(type) {
        const item = Inventory.getEquippedItem(type);
        if (!item) return;

        this._showModal({
            icon:  '🔄',
            title: `Desequipar "${item.name}"?`,
            body:  'O item voltará para o inventário.',
            confirmText:  'Desequipar',
            confirmColor: 'rgba(239,68,68,0.85)',
            onConfirm: () => {
                Inventory.unequip(type);
                Router?.render();
            }
        });
    },

    _showModal({ icon, title, body, confirmText, confirmColor, onConfirm }) {
        document.getElementById('shop-modal')?.remove();

        const d = this._isDark();
        const modal = document.createElement('div');
        modal.id = 'shop-modal';
        modal.style.cssText = `
            position:fixed;inset:0;z-index:99999;
            display:flex;align-items:center;justify-content:center;
            background:rgba(0,0,0,0.7);
            animation:smFadeIn 0.18s ease;
        `;
        modal.innerHTML = `
            <style>
                @keyframes smFadeIn  { from{opacity:0} to{opacity:1} }
                @keyframes smSlideUp { from{opacity:0;transform:translateY(20px) scale(0.97)} to{opacity:1;transform:none} }
                #sm-card { animation:smSlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1); }
                #sm-cancel:hover { background:rgba(255,255,255,0.1)!important;color:white!important; }
            </style>
            <div id="sm-card" style="
                background:${d?'#0e0e16':'#ffffff'};
                border:1px solid ${d?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.09)'};
                border-radius:18px;padding:1.75rem;
                width:100%;max-width:320px;margin:0 1rem;
                box-shadow:0 32px 80px rgba(0,0,0,0.6);
                font-family:'DM Sans',sans-serif;
            ">
                <div style="font-size:2rem;text-align:center;margin-bottom:0.875rem;">${icon}</div>
                <div style="font-size:1rem;font-weight:800;color:${d?'white':'#0f172a'};
                    text-align:center;margin-bottom:0.5rem;font-family:'Syne',sans-serif;">${title}</div>
                <p style="font-size:0.8rem;color:${d?'rgba(255,255,255,0.5)':'rgba(0,0,0,0.5)'};
                    text-align:center;line-height:1.6;margin-bottom:1.25rem;">${body}</p>
                <div style="display:flex;gap:0.625rem;">
                    <button id="sm-cancel" style="
                        flex:1;padding:0.65rem;border-radius:10px;
                        background:${d?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.05)'};
                        border:1px solid ${d?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.09)'};
                        color:${d?'rgba(255,255,255,0.6)':'rgba(0,0,0,0.5)'};
                        font-size:0.875rem;font-weight:600;cursor:pointer;
                        font-family:'DM Sans',sans-serif;transition:all 0.15s;">Cancelar</button>
                    <button id="sm-confirm" style="
                        flex:1;padding:0.65rem;border-radius:10px;
                        background:${confirmColor};border:none;
                        color:white;font-size:0.875rem;font-weight:700;cursor:pointer;
                        font-family:'DM Sans',sans-serif;transition:filter 0.15s;"
                        onmouseover="this.style.filter='brightness(1.1)'"
                        onmouseout="this.style.filter=''">${confirmText}</button>
                </div>
            </div>
        `;

        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
        modal.querySelector('#sm-cancel').addEventListener('click', () => modal.remove());
        modal.querySelector('#sm-confirm').addEventListener('click', () => {
            modal.remove();
            onConfirm?.();
        });

        document.body.appendChild(modal);
    },

    // ── HELPERS ───────────────────────────────────────

    _setTab(tab) {
        this._tab = tab;
        const content = document.getElementById('shop-content');
        if (content) {
            content.innerHTML = this._renderTabContent();
        }
        // Atualizar visual das tabs
        ['weekly','all','owned'].forEach(t => {
            const btn = document.querySelector(`button[onclick="Shop._setTab('${t}')"]`);
            if (!btn) return;
            const active = t === tab;
            const c = this._colors();
            btn.style.background   = active ? c.bg : 'transparent';
            btn.style.color        = active ? 'var(--theme-primary,#a855f7)' : c.muted;
            btn.style.border       = active ? '1px solid rgba(168,85,247,0.2)' : '1px solid transparent';
            btn.style.boxShadow    = active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none';
        });
    },

    init() {
        this._tab = 'weekly';
        // Atualizar display de chips
        const chipsEl = document.getElementById('shop-chips-display');
        if (chipsEl) chipsEl.textContent = (window.Economy?.getChips?.() || 0).toLocaleString('pt-BR');
    },
};

window.Shop = Shop;