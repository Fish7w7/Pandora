// SHOP.JS v4.0.0 — NyanTools にゃん~
// Loja estilo Valorant: rotação diária por categoria + inventário separado

const Shop = {

    DAILY_PER_CAT: 2,      // itens por categoria na rotação diária
    DAILY_MAX_GAP: 15,     // gap máx de nível para aparecer na rotação

    CATEGORIES: [
        { id:'title',    label:'Títulos',    icon:'👑' },
        { id:'border',   label:'Bordas',     icon:'🖼️' },
        { id:'theme',    label:'Temas',      icon:'🎨' },
        { id:'effect',   label:'Efeitos',    icon:'✨' },
        { id:'particle', label:'Partículas', icon:'💫' },
    ],

    _tab:         'shop',   // 'shop' | 'inventory'
    _selectedCat: 'title',  // categoria selecionada na loja

    _getDaySeed() {
        const d   = new Date();
        const str = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
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

    _getDailyReset() {
        const now      = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const h = Math.floor((tomorrow - now) / 3600000);
        const m = Math.floor(((tomorrow - now) % 3600000) / 60000);
        return h > 0 ? `${h}h ${m}min` : `${m}min`;
    },

    // Retorna os itens da rotação diária para UMA categoria
    getDailyForCat(catId) {
        const seed        = this._getDaySeed();
        const catSeed     = seed ^ catId.split('').reduce((a, c) => a ^ c.charCodeAt(0), 0);
        const playerLevel = window.Economy?.getLevel?.() || 1;

        // Pool: não possuídos, não marcos, dentro do gap de nível
        let pool = Inventory.getByType(catId).filter(i =>
            !i.milestone &&
            !Inventory.owns(i.id) &&
            (i.minLevel - playerLevel) <= this.DAILY_MAX_GAP
        );

        // Fallback: relaxa filtro de posse se pool muito pequeno
        if (pool.length < this.DAILY_PER_CAT) {
            pool = Inventory.getByType(catId).filter(i => !i.milestone);
        }
        // Fallback total: inclui tudo da categoria
        if (pool.length === 0) {
            pool = Inventory.getByType(catId);
        }

        const shuffled = this._seededShuffle(pool, catSeed);
        const items    = shuffled.slice(0, this.DAILY_PER_CAT);
        // Primeiro item é o exclusivo do dia
        if (items[0]) items[0] = { ...items[0], isDailyExclusive: true };
        return items;
    },

    _isDark() { return document.body.classList.contains('dark-theme'); },

    _c() {
        const d = this._isDark();
        return {
            bg:      d ? 'rgba(255,255,255,0.04)' : '#ffffff',
            border:  d ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
            borderS: d ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            text:    d ? '#f1f5f9' : '#0f172a',
            sub:     d ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)',
            muted:   d ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.35)',
            inner:   d ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
            panelBg: d ? 'rgba(255,255,255,0.025)': '#f8f8fc',
        };
    },

    render() {
        const c     = this._c();
        const d     = this._isDark();
        const chips = window.Economy?.getChips?.() || 0;
        const level = window.Economy?.getLevel?.() || 1;
        const xpPct = window.Economy?.getLevelProgress?.() || 0;
        const xpData= window.Economy?.getXP?.() || { xp:0, xpToNext:100 };

        return `
        <style>
        @keyframes shopSlideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shopItemIn  { from{opacity:0;transform:scale(0.96)}       to{opacity:1;transform:scale(1)}     }
        .shop-cat-btn  { transition:background .15s,border-color .15s,color .15s,transform .1s; }
        .shop-cat-btn:hover  { transform:translateY(-1px); }
        .shop-cat-btn:active { transform:scale(0.96); }
        .shop-item-card { animation:shopItemIn .28s ease both; transition:transform .12s,box-shadow .12s; }
        .shop-item-card:hover { transform:translateY(-3px); }
        .shop-tab-btn { transition:background .15s,color .15s,border-color .15s; }
        </style>

        <div style="max-width:820px;margin:0 auto;font-family:var(--font-body,'DM Sans',sans-serif);">

            <!-- HEADER -->
            <div style="display:flex;align-items:flex-start;justify-content:space-between;
                flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem;">
                <div>
                    <h1 style="font-family:'Syne',sans-serif;font-size:1.75rem;font-weight:900;margin:0 0 0.15rem;
                        background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));
                        -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
                        🛍️ Loja
                    </h1>
                    <p style="font-size:0.72rem;color:${c.muted};margin:0;">
                        Rotação diária · renova em <strong style="color:${c.sub};">${this._getDailyReset()}</strong>
                    </p>
                </div>

                <!-- Chips + Nível + XP -->
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.5rem;min-width:180px;">
                    <div style="display:flex;gap:0.5rem;">
                        <div style="display:flex;align-items:center;gap:0.5rem;background:${c.inner};
                            border:1px solid ${c.border};border-radius:12px;padding:0.45rem 0.875rem;">
                            <span style="font-size:1rem;opacity:0.8;">⬡</span>
                            <div>
                                <div style="font-size:0.52rem;font-weight:800;text-transform:uppercase;
                                    letter-spacing:0.1em;color:${c.muted};line-height:1;">Chips</div>
                                <div id="shop-chips-display" style="font-size:1rem;font-weight:900;
                                    font-family:'Syne',sans-serif;color:${d?'#fcd34d':'#b45309'};line-height:1.2;">
                                    ${chips.toLocaleString('pt-BR')}
                                </div>
                            </div>
                        </div>
                        <div style="display:flex;align-items:center;gap:0.5rem;background:${c.inner};
                            border:1px solid ${c.border};border-radius:12px;padding:0.45rem 0.875rem;">
                            <span style="font-size:1rem;opacity:0.8;">⚡</span>
                            <div>
                                <div style="font-size:0.52rem;font-weight:800;text-transform:uppercase;
                                    letter-spacing:0.1em;color:${c.muted};line-height:1;">Nível</div>
                                <div style="font-size:1rem;font-weight:900;font-family:'Syne',sans-serif;
                                    color:var(--theme-primary,#a855f7);line-height:1.2;">${level}</div>
                            </div>
                        </div>
                    </div>
                    <div style="width:100%;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:0.25rem;">
                            <span style="font-size:0.62rem;color:${c.muted};">${xpData.xp} XP</span>
                            <span style="font-size:0.62rem;color:${c.muted};">${xpData.xpToNext} XP</span>
                        </div>
                        <div style="height:4px;background:${c.inner};border:1px solid ${c.borderS};
                            border-radius:99px;overflow:hidden;">
                            <div style="height:100%;width:${xpPct}%;
                                background:linear-gradient(90deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));
                                border-radius:99px;"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ABAS: Loja / Inventário -->
            <div style="display:flex;gap:0.25rem;background:${c.inner};border:1px solid ${c.border};
                border-radius:14px;padding:0.3rem;margin-bottom:1.25rem;">
                <button class="shop-tab-btn" onclick="Shop._setTab('shop')" id="shop-tab-shop"
                    style="flex:1;padding:0.5rem;border-radius:10px;cursor:pointer;
                    font-size:0.78rem;font-weight:700;font-family:'DM Sans',sans-serif;
                    background:${this._tab==='shop'?(d?'rgba(255,255,255,0.06)':'#fff'):'transparent'};
                    color:${this._tab==='shop'?'var(--theme-primary,#a855f7)':c.muted};
                    border:1px solid ${this._tab==='shop'?'rgba(168,85,247,0.2)':'transparent'};">
                    🛍️ Loja do Dia
                </button>
                <button class="shop-tab-btn" onclick="Shop._setTab('inventory')" id="shop-tab-inventory"
                    style="flex:1;padding:0.5rem;border-radius:10px;cursor:pointer;
                    font-size:0.78rem;font-weight:700;font-family:'DM Sans',sans-serif;
                    background:${this._tab==='inventory'?(d?'rgba(255,255,255,0.06)':'#fff'):'transparent'};
                    color:${this._tab==='inventory'?'var(--theme-primary,#a855f7)':c.muted};
                    border:1px solid ${this._tab==='inventory'?'rgba(168,85,247,0.2)':'transparent'};">
                    🎒 Meu Inventário
                </button>
            </div>

            <!-- CONTEÚDO DA ABA -->
            <div id="shop-main-content">
                ${this._tab === 'shop' ? this._renderShopTab() : this._renderInventoryTab()}
            </div>
        </div>`;
    },

    _renderShopTab() {
        const c    = this._c();
        const d    = this._isDark();
        const cat  = this.CATEGORIES.find(c => c.id === this._selectedCat) || this.CATEGORIES[0];
        const items= this.getDailyForCat(this._selectedCat);

        return `
        <div style="display:flex;gap:1rem;">

            <!-- Coluna esquerda: categorias -->
            <div id="shop-cat-sidebar" style="width:140px;flex-shrink:0;">
                ${this._renderCatSidebar()}
            </div>

            <!-- Coluna direita: itens da categoria selecionada -->
            <div style="flex:1;min-width:0;" id="shop-items-panel">
                ${this._renderCatItems(items, cat)}
            </div>
        </div>`;
    },

    _renderCatItems(items, cat) {
        const c = this._c();
        const d = this._isDark();

        if (items.length === 0) {
            return `<div style="text-align:center;padding:3rem 1rem;color:${c.muted};">
                <div style="font-size:2.5rem;margin-bottom:0.5rem;opacity:0.35;">${cat.icon}</div>
                <div style="font-size:0.88rem;font-weight:700;color:${c.sub};">Nenhum item hoje</div>
                <p style="font-size:0.72rem;margin-top:0.25rem;">Volte amanhã にゃん~</p>
            </div>`;
        }

        return `
        <div style="margin-bottom:0.75rem;display:flex;align-items:center;justify-content:space-between;">
            <div>
                <div style="font-size:1rem;font-weight:900;color:${c.text};font-family:'Syne',sans-serif;">
                    ${cat.icon} ${cat.label}
                </div>
                <div style="font-size:0.65rem;color:${c.muted};">${items.length} itens hoje</div>
            </div>
            <div style="font-size:0.62rem;font-weight:700;padding:3px 10px;border-radius:99px;
                color:${d?'#fcd34d':'#b45309'};
                background:${d?'rgba(245,158,11,0.1)':'#fffbeb'};
                border:1px solid ${d?'rgba(245,158,11,0.2)':'#fde68a'};">
                ⏱ ${this._getDailyReset()}
            </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:0.75rem;">
            ${items.map((item, i) => this._renderCard(item, i)).join('')}
        </div>`;
    },

    _renderInventoryTab() {
        const c     = this._c();
        const d     = this._isDark();
        const owned = Inventory.getOwned();

        if (owned.length === 0) {
            return `<div style="text-align:center;padding:3rem 1rem;color:${c.muted};">
                <div style="font-size:2.5rem;margin-bottom:0.75rem;opacity:0.35;">🎒</div>
                <div style="font-size:0.88rem;font-weight:700;color:${c.sub};margin-bottom:0.3rem;">Inventário vazio</div>
                <p style="font-size:0.72rem;margin:0;">Compre itens na loja do dia!</p>
            </div>`;
        }

        // Agrupar por tipo
        return this.CATEGORIES.map(cat => {
            const catItems = owned.filter(i => i.type === cat.id);
            if (catItems.length === 0) return '';

            return `
            <div style="margin-bottom:1.5rem;">
                <div style="font-size:0.72rem;font-weight:800;text-transform:uppercase;
                    letter-spacing:0.08em;color:${c.muted};margin-bottom:0.625rem;
                    display:flex;align-items:center;gap:0.375rem;">
                    ${cat.icon} ${cat.label}
                    <span style="font-size:0.6rem;opacity:0.6;">${catItems.length}</span>
                </div>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:0.625rem;">
                    ${catItems.map((item, i) => this._renderCard(item, i)).join('')}
                </div>
            </div>`;
        }).join('');
    },

    _renderCard(item, index = 0) {
        const c        = this._c();
        const d        = this._isDark();
        const owned    = Inventory.owns(item.id);
        const equipped = Inventory.getEquipped(item.type) === item.id;
        const level    = window.Economy?.getLevel?.() || 1;
        const chips    = window.Economy?.getChips?.() || 0;
        const canLevel = level >= item.minLevel;
        const canAfford= chips >= item.price;
        const rarity   = Inventory.RARITY[item.rarity] || Inventory.RARITY.common;

        let btnText, btnStyle, btnClick, btnDisabled = false;

        if (owned) {
            if (equipped) {
                btnText  = '✓ Equipado';
                btnStyle = `background:rgba(74,222,128,0.12);color:#4ade80;border:1px solid rgba(74,222,128,0.25);`;
                btnClick = `Shop._unequip('${item.type}')`;
            } else {
                btnText  = 'Equipar';
                btnStyle = `background:var(--theme-primary,#a855f7);color:white;border:none;`;
                btnClick = `Shop._equip('${item.id}')`;
            }
        } else if (item.milestone) {
            btnText     = `🔒 Marco nível ${item.minLevel}`;
            btnStyle    = `background:rgba(245,158,11,0.1);color:${d?'#fcd34d':'#b45309'};border:1px solid rgba(245,158,11,0.2);`;
            btnDisabled = true;
        } else if (!canLevel) {
            btnText     = `🔒 Nível ${item.minLevel}`;
            btnStyle    = `background:${c.inner};color:${c.muted};border:1px solid ${c.border};`;
            btnDisabled = true;
        } else if (!canAfford) {
            btnText     = `${item.price.toLocaleString('pt-BR')} chips`;
            btnStyle    = `background:rgba(239,68,68,0.1);color:${d?'#f87171':'#be123c'};border:1px solid rgba(239,68,68,0.2);`;
            btnDisabled = true;
        } else {
            btnText  = `Comprar · ${item.price.toLocaleString('pt-BR')} chips`;
            btnStyle = `background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));color:white;border:none;`;
            btnClick = `Shop._buy('${item.id}')`;
        }

        const cardBorder = equipped ? `1px solid ${rarity.color}66`
                         : owned    ? `1px solid ${rarity.color}33`
                         :            `1px solid ${c.border}`;
        const cardBg     = owned ? rarity.bg : c.bg;
        const cardShadow = equipped ? `box-shadow:0 0 0 2px ${rarity.color}44;` : '';

        return `
        <div class="shop-item-card" style="background:${cardBg};border:${cardBorder};${cardShadow}
            border-radius:14px;padding:0.875rem;
            display:flex;flex-direction:column;gap:0.5rem;animation-delay:${index * 0.05}s;">

            <!-- Ícone + raridade -->
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:0.25rem;">
                <div style="width:48px;height:48px;border-radius:12px;flex-shrink:0;
                    background:${rarity.bg};border:1px solid ${rarity.color}33;
                    display:flex;align-items:center;justify-content:center;font-size:1.5rem;">
                    ${item.icon}
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.2rem;">
                    <span style="font-size:0.55rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;
                        color:${rarity.color};background:${rarity.bg};border:1px solid ${rarity.color}44;
                        border-radius:99px;padding:2px 7px;white-space:nowrap;">${rarity.label}</span>
                    ${item.isDailyExclusive ? `<span style="font-size:0.55rem;font-weight:800;text-transform:uppercase;
                        color:${d?'#fcd34d':'#b45309'};background:rgba(245,158,11,0.12);
                        border:1px solid rgba(245,158,11,0.3);border-radius:99px;padding:2px 7px;white-space:nowrap;">
                        ⭐ Excl.</span>` : ''}
                    ${equipped ? `<span style="font-size:0.55rem;font-weight:800;text-transform:uppercase;
                        color:#4ade80;background:rgba(74,222,128,0.1);
                        border:1px solid rgba(74,222,128,0.25);border-radius:99px;padding:2px 7px;white-space:nowrap;">
                        ✓ Ativo</span>` : ''}
                </div>
            </div>

            <!-- Nome + preview -->
            <div style="flex:1;">
                <div style="font-size:0.85rem;font-weight:700;color:${c.text};font-family:'Syne',sans-serif;
                    line-height:1.2;margin-bottom:0.15rem;">${item.name}</div>
                ${item.preview ? `<div style="font-size:0.65rem;color:${c.muted};line-height:1.4;">${item.preview}</div>` : ''}
            </div>

            <!-- Botão -->
            <button ${btnDisabled ? 'disabled' : ''} onclick="${btnClick || ''}"
                style="width:100%;padding:0.48rem 0.5rem;border-radius:9px;
                font-size:0.72rem;font-weight:700;font-family:'DM Sans',sans-serif;
                cursor:${btnDisabled?'not-allowed':'pointer'};opacity:${btnDisabled?'0.55':'1'};
                transition:filter .12s,transform .08s;${btnStyle}"
                onmouseover="if(!this.disabled)this.style.filter='brightness(1.08)'"
                onmouseout="this.style.filter=''"
                onmousedown="if(!this.disabled)this.style.transform='scale(0.97)'"
                onmouseup="this.style.transform=''">
                ${btnText}
            </button>
        </div>`;
    },

    _setTab(tab) {
        this._tab = tab;
        const content = document.getElementById('shop-main-content');
        if (content) content.innerHTML = tab === 'shop' ? this._renderShopTab() : this._renderInventoryTab();

        const d = this._isDark();
        const c = this._c();
        ['shop','inventory'].forEach(t => {
            const btn = document.getElementById('shop-tab-' + t);
            if (!btn) return;
            const active = t === tab;
            btn.style.background  = active ? (d ? 'rgba(255,255,255,0.06)' : '#fff') : 'transparent';
            btn.style.color       = active ? 'var(--theme-primary,#a855f7)' : c.muted;
            btn.style.borderColor = active ? 'rgba(168,85,247,0.2)' : 'transparent';
        });
    },

    _renderCatSidebar() {
        const c = this._c();
        const d = this._isDark();
        return `
            <div style="font-size:0.58rem;font-weight:800;text-transform:uppercase;
                letter-spacing:0.1em;color:${c.muted};margin-bottom:0.625rem;padding-left:0.25rem;">
                Categorias
            </div>
            <div style="display:flex;flex-direction:column;gap:0.3rem;">
                ${this.CATEGORIES.map(cat => {
                    const active     = this._selectedCat === cat.id;
                    const dailyItems = this.getDailyForCat(cat.id);
                    const hasNew     = !active && dailyItems.some(i => !Inventory.owns(i.id));
                    return `<button class="shop-cat-btn" onclick="Shop._selectCat('${cat.id}')"
                        style="display:flex;align-items:center;justify-content:space-between;
                        width:100%;padding:0.6rem 0.75rem;border-radius:12px;cursor:pointer;
                        font-size:0.78rem;font-weight:700;font-family:'DM Sans',sans-serif;text-align:left;
                        background:${active?'linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899))':c.inner};
                        color:${active?'white':c.sub};
                        border:1px solid ${active?'transparent':c.border};">
                        <span>${cat.icon} ${cat.label}</span>
                        ${hasNew ? `<span style="width:7px;height:7px;border-radius:50%;
                            background:var(--theme-primary,#a855f7);flex-shrink:0;"></span>` : ''}
                    </button>`;
                }).join('')}
            </div>
            <div style="margin-top:1rem;padding:0.6rem 0.75rem;border-radius:12px;
                background:${c.inner};border:1px solid ${c.border};text-align:center;">
                <div style="font-size:0.55rem;font-weight:800;text-transform:uppercase;
                    letter-spacing:0.06em;color:${c.muted};margin-bottom:0.2rem;">Renova em</div>
                <div style="font-size:0.85rem;font-weight:900;
                    font-family:'Syne',sans-serif;color:${d?'#fcd34d':'#b45309'};">
                    ${this._getDailyReset()}
                </div>
            </div>`;
    },

    _selectCat(catId) {
        this._selectedCat = catId;
        // Re-render sidebar (dot some da categoria ativa)
        const sidebar = document.getElementById('shop-cat-sidebar');
        if (sidebar) sidebar.innerHTML = this._renderCatSidebar();
        // Re-render painel de itens
        const panel = document.getElementById('shop-items-panel');
        const cat   = this.CATEGORIES.find(c => c.id === catId) || this.CATEGORIES[0];
        const items = this.getDailyForCat(catId);
        if (panel) panel.innerHTML = this._renderCatItems(items, cat);
    },

    _buy(itemId) {
        const item  = Inventory.getItem(itemId);
        if (!item) return;
        const chips = window.Economy?.getChips?.() || 0;
        const d     = this._isDark();
        const prev  = Inventory.getEquippedItem(item.type);

        const body = `
            <div style="display:flex;align-items:center;gap:0.625rem;margin-bottom:0.875rem;justify-content:center;">
                <div style="font-size:2.2rem;">${item.icon}</div>
                <div style="text-align:left;">
                    <div style="font-size:0.9rem;font-weight:800;color:${d?'white':'#0f172a'};font-family:'Syne',sans-serif;">${item.name}</div>
                    ${item.preview ? `<div style="font-size:0.7rem;color:${d?'rgba(255,255,255,0.45)':'rgba(0,0,0,0.45)'};">${item.preview}</div>` : ''}
                </div>
            </div>
            <div style="background:${d?'rgba(255,255,255,0.04)':'#f8fafc'};
                border:1px solid ${d?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.06)'};
                border-radius:10px;padding:0.625rem 0.875rem;margin-bottom:0.875rem;font-size:0.78rem;">
                <div style="display:flex;justify-content:space-between;margin-bottom:0.2rem;">
                    <span style="color:${d?'rgba(255,255,255,0.5)':'rgba(0,0,0,0.5)'};">Custo</span>
                    <strong style="color:${d?'#fcd34d':'#b45309'};">${item.price.toLocaleString('pt-BR')} chips</strong>
                </div>
                <div style="display:flex;justify-content:space-between;">
                    <span style="color:${d?'rgba(255,255,255,0.5)':'rgba(0,0,0,0.5)'};">Saldo após</span>
                    <span style="color:${chips-item.price<0?'#f87171':(d?'rgba(255,255,255,0.7)':'rgba(0,0,0,0.7)')}">${(chips - item.price).toLocaleString('pt-BR')} chips</span>
                </div>
            </div>
            ${prev ? `<div style="font-size:0.7rem;color:${d?'rgba(255,255,255,0.4)':'rgba(0,0,0,0.4)'};margin-bottom:0.875rem;text-align:center;">
                Substitui: <strong style="color:${d?'rgba(255,255,255,0.6)':'rgba(0,0,0,0.6)'};">${prev.name}</strong>
            </div>` : ''}`;

        this._showModal({
            title:        'Confirmar compra',
            body,
            confirmText:  'Comprar e equipar',
            confirmColor: 'linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899))',
            secondaryText:'Comprar sem equipar',
            onConfirm: () => {
                const result = Inventory.buy(itemId);
                if (result.ok) { Inventory.equip(itemId); this._afterAction(); }
                else Utils.showNotification?.(`❌ ${result.reason}`, 'error');
            },
            onSecondary: () => {
                const result = Inventory.buy(itemId);
                if (result.ok) this._afterAction();
                else Utils.showNotification?.(`❌ ${result.reason}`, 'error');
            },
        });
    },

    _equip(itemId) {
        const item = Inventory.getItem(itemId);
        if (!item) return;
        const prev = Inventory.getEquippedItem(item.type);
        const d    = this._isDark();
        this._showModal({
            title:       `Equipar ${item.name}`,
            body:        `<div style="text-align:center;font-size:2.5rem;margin-bottom:0.75rem;">${item.icon}</div>
                <p style="font-size:0.8rem;color:${d?'rgba(255,255,255,0.5)':'rgba(0,0,0,0.5)'};text-align:center;line-height:1.6;margin-bottom:0.875rem;">
                    ${prev ? `Substitui <strong style="color:${d?'rgba(255,255,255,0.7)':'rgba(0,0,0,0.65)'};">${prev.name}</strong>` : 'Será equipado imediatamente.'}
                </p>`,
            confirmText:  'Equipar',
            confirmColor: 'var(--theme-primary,#a855f7)',
            onConfirm:    () => { Inventory.equip(itemId); this._afterAction(); },
        });
    },

    _unequip(type) {
        const item = Inventory.getEquippedItem(type);
        if (!item) return;
        const d = this._isDark();
        this._showModal({
            title:       `Desequipar ${item.name}`,
            body:        `<p style="font-size:0.8rem;color:${d?'rgba(255,255,255,0.5)':'rgba(0,0,0,0.5)'};
                text-align:center;line-height:1.6;margin-bottom:0.875rem;">
                O efeito será removido e o item voltará ao inventário.
            </p>`,
            confirmText:  'Desequipar',
            confirmColor: 'rgba(239,68,68,0.85)',
            onConfirm:    () => { Inventory.unequip(type); this._afterAction(); },
        });
    },

    _afterAction() {
        const chipsEl = document.getElementById('shop-chips-display');
        if (chipsEl) chipsEl.textContent = (window.Economy?.getChips?.() || 0).toLocaleString('pt-BR');
        // Re-render só o painel ativo sem recarregar a página inteira
        const content = document.getElementById('shop-main-content');
        if (content) content.innerHTML = this._tab === 'shop' ? this._renderShopTab() : this._renderInventoryTab();
    },

    _showModal({ title, body, confirmText, confirmColor, secondaryText, onConfirm, onSecondary }) {
        document.getElementById('shop-modal')?.remove();
        const d     = this._isDark();
        const modal = document.createElement('div');
        modal.id    = 'shop-modal';
        modal.style.cssText = `position:fixed;inset:0;z-index:99999;display:flex;align-items:center;
            justify-content:center;background:rgba(0,0,0,${d?'0.75':'0.6'});animation:smFadeIn 0.15s ease;`;
        modal.innerHTML = `
            <style>
                @keyframes smFadeIn  { from{opacity:0} to{opacity:1} }
                @keyframes smSlideUp { from{opacity:0;transform:translateY(16px) scale(0.97)} to{opacity:1;transform:none} }
                #sm-card { animation:smSlideUp 0.22s cubic-bezier(0.34,1.56,0.64,1); }
                #sm-cancel:hover { background:rgba(255,255,255,0.08)!important; }
            </style>
            <div id="sm-card" style="background:${d?'#0d0d14':'#ffffff'};
                border:1px solid ${d?'rgba(255,255,255,0.09)':'rgba(0,0,0,0.08)'};
                border-radius:18px;padding:1.5rem;width:100%;max-width:300px;margin:0 1rem;
                box-shadow:0 32px 80px rgba(0,0,0,0.5);font-family:'DM Sans',sans-serif;">
                <div style="font-size:0.95rem;font-weight:800;color:${d?'white':'#0f172a'};
                    text-align:center;margin-bottom:1rem;font-family:'Syne',sans-serif;">${title}</div>
                ${body}
                <div style="display:flex;gap:0.5rem;">
                    <button id="sm-cancel" style="flex:1;padding:0.6rem;border-radius:10px;
                        background:${d?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.05)'};
                        border:1px solid ${d?'rgba(255,255,255,0.09)':'rgba(0,0,0,0.08)'};
                        color:${d?'rgba(255,255,255,0.55)':'rgba(0,0,0,0.5)'};
                        font-size:0.82rem;font-weight:600;cursor:pointer;
                        font-family:'DM Sans',sans-serif;transition:background 0.12s;">Cancelar</button>
                    <button id="sm-confirm" style="flex:2;padding:0.6rem;border-radius:10px;
                        background:${confirmColor};border:none;color:white;
                        font-size:0.82rem;font-weight:700;cursor:pointer;
                        font-family:'DM Sans',sans-serif;transition:filter 0.12s;"
                        onmouseover="this.style.filter='brightness(1.1)'"
                        onmouseout="this.style.filter=''">${confirmText}</button>
                </div>
                ${secondaryText ? `<button id="sm-secondary" style="width:100%;margin-top:0.5rem;
                    padding:0.4rem;background:transparent;border:none;
                    color:${d?'rgba(255,255,255,0.3)':'rgba(0,0,0,0.35)'};
                    font-size:0.72rem;cursor:pointer;font-family:'DM Sans',sans-serif;
                    text-decoration:underline;text-underline-offset:2px;">${secondaryText}</button>` : ''}
            </div>`;

        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
        modal.querySelector('#sm-cancel').addEventListener('click', () => modal.remove());
        modal.querySelector('#sm-confirm').addEventListener('click', () => { modal.remove(); onConfirm?.(); });
        if (secondaryText) {
            modal.querySelector('#sm-secondary')?.addEventListener('click', () => { modal.remove(); onSecondary?.(); });
        }
        document.body.appendChild(modal);
    },

    init() {
        this._tab = 'shop';
        const chipsEl = document.getElementById('shop-chips-display');
        if (chipsEl) chipsEl.textContent = (window.Economy?.getChips?.() || 0).toLocaleString('pt-BR');
    },
};

window.Shop = Shop;