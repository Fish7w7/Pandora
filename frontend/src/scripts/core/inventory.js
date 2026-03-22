/* ══════════════════════════════════════════════════
   INVENTORY.JS v1.0.0 — NyanTools にゃん~
   Sistema de Inventário — Comprar, Equipar, Consultar
   v3.8.0 "Nyan Economy"
 ═══════════════════════════════════════════════════*/

const Inventory = {

    KEY: 'nyan_inventory',

    // ── CATÁLOGO COMPLETO DE ITENS ────────────────────
    // Fonte de verdade. A loja usa esse catálogo para
    // renderizar os cards. O inventário guarda só os IDs.

    CATALOG: [

        // ── TÍTULOS ───────────────────────────────────
        {
            id:       'title_gamer',
            type:     'title',
            name:     'Gamer にゃん~',
            icon:     '🎮',
            rarity:   'common',
            price:    200,
            minLevel: 3,
            preview:  'Aparece no seu perfil abaixo do nome',
        },
        {
            id:       'title_speedster',
            type:     'title',
            name:     'Velocista',
            icon:     '⚡',
            rarity:   'common',
            price:    200,
            minLevel: 3,
            preview:  'Para quem manda no Type Racer',
        },
        {
            id:       'title_lucky',
            type:     'title',
            name:     'Sortudo',
            icon:     '🍀',
            rarity:   'common',
            price:    200,
            minLevel: 3,
            preview:  'Sorte é um estilo de vida',
        },
        {
            id:       'title_genius',
            type:     'title',
            name:     'Gênio do Quiz',
            icon:     '🧠',
            rarity:   'rare',
            price:    500,
            minLevel: 8,
            preview:  'Para quem tira 10/10 no Quiz',
        },
        {
            id:       'title_legend',
            type:     'title',
            name:     'Lendário',
            icon:     '👑',
            rarity:   'epic',
            price:    1000,
            minLevel: 25,
            preview:  'Reservado para os veteranos',
        },
        {
            id:       'title_nyan',
            type:     'title',
            name:     'にゃん~ Master',
            icon:     '🐱',
            rarity:   'epic',
            price:    800,
            minLevel: 15,
            preview:  'O título mais kawaii de todos',
        },

        // ── BORDAS DE AVATAR ──────────────────────────
        {
            id:       'border_simple',
            type:     'border',
            name:     'Borda Simples',
            icon:     '⬜',
            rarity:   'common',
            price:    400,
            minLevel: 5,
            preview:  'Borda branca discreta',
            css:      'border: 3px solid rgba(255,255,255,0.8);',
        },
        {
            id:       'border_purple',
            type:     'border',
            name:     'Borda Roxa',
            icon:     '💜',
            rarity:   'common',
            price:    400,
            minLevel: 5,
            preview:  'Borda na cor do tema',
            css:      'border: 3px solid #a855f7; box-shadow: 0 0 8px rgba(168,85,247,0.5);',
        },
        {
            id:       'border_gold',
            type:     'border',
            name:     'Borda Dourada',
            icon:     '🥇',
            rarity:   'rare',
            price:    700,
            minLevel: 10,
            preview:  'Para quem chegou longe',
            css:      'border: 3px solid #f59e0b; box-shadow: 0 0 10px rgba(245,158,11,0.6);',
        },
        {
            id:       'border_neon',
            type:     'border',
            name:     'Borda Neon',
            icon:     '🌈',
            rarity:   'rare',
            price:    900,
            minLevel: 12,
            preview:  'Borda animada com gradiente',
            css:      'border: 3px solid transparent; background-clip: padding-box; outline: 3px solid; outline-image: linear-gradient(135deg,#a855f7,#ec4899,#3b82f6) 1; animation: borderNeon 3s linear infinite;',
        },
        {
            id:       'border_paw',       // desbloqueado no marco nv 10
            type:     'border',
            name:     'Patinhas',
            icon:     '🐾',
            rarity:   'milestone',
            price:    0,
            minLevel: 10,
            preview:  'Desbloqueado ao atingir nível 10',
            css:      'border: 3px solid #4ade80; box-shadow: 0 0 12px rgba(74,222,128,0.5);',
            milestone: true,
        },
        {
            id:       'border_crown',     // marco nv 25
            type:     'border',
            name:     'Coroa',
            icon:     '👑',
            rarity:   'milestone',
            price:    0,
            minLevel: 25,
            preview:  'Desbloqueado ao atingir nível 25',
            css:      'border: 3px solid #f59e0b; box-shadow: 0 0 16px rgba(245,158,11,0.7);',
            milestone: true,
        },
        {
            id:       'border_star',      // marco nv 50
            type:     'border',
            name:     'Estrela',
            icon:     '⭐',
            rarity:   'milestone',
            price:    0,
            minLevel: 50,
            preview:  'Desbloqueado ao atingir nível 50',
            css:      'border: 3px solid #fbbf24; box-shadow: 0 0 20px rgba(251,191,36,0.8), 0 0 40px rgba(251,191,36,0.4);',
            milestone: true,
        },

        // ── TEMAS VISUAIS ─────────────────────────────
        {
            id:       'theme_sakura',
            type:     'theme',
            name:     'Sakura',
            icon:     '🌸',
            rarity:   'rare',
            price:    1200,
            minLevel: 10,
            preview:  'Rosa · pétalas caindo no login',
            themeId:  'pink',
            effect:   'sakura',
        },
        {
            id:       'theme_midnight',
            type:     'theme',
            name:     'Midnight',
            icon:     '🌙',
            rarity:   'rare',
            price:    1200,
            minLevel: 10,
            preview:  'Índigo · partículas de estrelas',
            themeId:  'indigo',
            effect:   'stars',
        },
        {
            id:       'theme_neon',
            type:     'theme',
            name:     'Neon',
            icon:     '⚡',
            rarity:   'epic',
            price:    1800,
            minLevel: 15,
            preview:  'Teal · efeito glitch no login',
            themeId:  'teal',
            effect:   'glitch',
        },
        {
            id:       'theme_fire',
            type:     'theme',
            name:     'Chamas',
            icon:     '🔥',
            rarity:   'epic',
            price:    1800,
            minLevel: 15,
            preview:  'Vermelho · partículas de fogo',
            themeId:  'red',
            effect:   'fire',
        },

        // ── EFEITOS DE NAVEGAÇÃO ──────────────────────
        {
            id:       'effect_slide',
            type:     'effect',
            name:     'Slide',
            icon:     '↔️',
            rarity:   'common',
            price:    600,
            minLevel: 7,
            preview:  'Troca de ferramenta com deslize lateral',
        },
        {
            id:       'effect_zoom',
            type:     'effect',
            name:     'Zoom',
            icon:     '🔍',
            rarity:   'common',
            price:    600,
            minLevel: 7,
            preview:  'Zoom suave ao trocar de página',
        },
        {
            id:       'effect_flip',
            type:     'effect',
            name:     'Flip',
            icon:     '🔄',
            rarity:   'rare',
            price:    1000,
            minLevel: 12,
            preview:  'Virada de carta ao navegar',
        },

        // ── PARTÍCULAS DE PERFIL ──────────────────────
        {
            id:       'particle_stars',
            type:     'particle',
            name:     'Estrelas',
            icon:     '✨',
            rarity:   'common',
            price:    500,
            minLevel: 6,
            preview:  'Estrelinhas ao redor do avatar',
        },
        {
            id:       'particle_hearts',
            type:     'particle',
            name:     'Corações',
            icon:     '💕',
            rarity:   'common',
            price:    500,
            minLevel: 6,
            preview:  'Coraçõezinhos flutuando',
        },
        {
            id:       'particle_nyan',
            type:     'particle',
            name:     'Patinhas にゃん~',
            icon:     '🐾',
            rarity:   'rare',
            price:    900,
            minLevel: 10,
            preview:  'Patinhas de gato girando',
        },
    ],

    // ── RARIDADE — cores e labels ─────────────────────
    RARITY: {
        common:    { label: 'Comum',     color: '#9ca3af', bg: 'rgba(156,163,175,0.12)' },
        rare:      { label: 'Raro',      color: '#3b82f6', bg: 'rgba(59,130,246,0.12)'  },
        epic:      { label: 'Épico',     color: '#a855f7', bg: 'rgba(168,85,247,0.12)'  },
        milestone: { label: 'Marco',     color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
        weekly:    { label: 'Semanal',   color: '#10b981', bg: 'rgba(16,185,129,0.12)'  },
    },

    // ── LOAD / SAVE ───────────────────────────────────

    load() {
        return Utils.loadData(this.KEY) || { owned: [], equipped: {} };
    },

    save(data) {
        Utils.saveData(this.KEY, data);
    },

    // ── PROPRIEDADE ───────────────────────────────────

    owns(itemId) {
        const data = this.load();
        return data.owned.includes(itemId);
    },

    // Desbloquear item (compra ou marco) sem cobrar chips
    unlockItem(itemId) {
        const data = this.load();
        if (data.owned.includes(itemId)) return false;
        data.owned.push(itemId);
        this.save(data);
        console.log(`[Inventory] Item desbloqueado: ${itemId}`);
        return true;
    },

    // ── COMPRA ────────────────────────────────────────

    /**
     * Tenta comprar um item.
     * Valida nível mínimo e saldo de chips.
     * @returns {{ ok: boolean, reason?: string }}
     */
    buy(itemId) {
        const item = this.getItem(itemId);
        if (!item) return { ok: false, reason: 'Item não encontrado' };

        // Itens de marco são gratuitos — só desbloqueiam via milestone
        if (item.milestone) return { ok: false, reason: 'Este item é desbloqueado por marco de nível' };

        if (this.owns(itemId)) return { ok: false, reason: 'Você já possui este item' };

        // Verificar nível mínimo
        const currentLevel = window.Economy?.getLevel?.() || 1;
        if (currentLevel < item.minLevel) {
            return { ok: false, reason: `Nível ${item.minLevel} necessário (você está no ${currentLevel})` };
        }

        // Verificar saldo
        const chips = window.Economy?.getChips?.() || 0;
        if (chips < item.price) {
            return { ok: false, reason: `Chips insuficientes (${item.price} necessários, você tem ${chips})` };
        }

        // Débitar chips
        const spent = window.Economy?.spendChips?.(item.price);
        if (!spent) return { ok: false, reason: 'Falha ao debitar chips' };

        // Adicionar ao inventário
        this.unlockItem(itemId);

        Utils.showNotification?.(`🛍️ "${item.name}" adquirido! にゃん~`, 'success');
        console.log(`[Inventory] Comprado: ${itemId} por ${item.price} chips`);

        return { ok: true };
    },

    // ── EQUIPAR ───────────────────────────────────────

    /**
     * Equipa um item por categoria.
     * Apenas um item por tipo pode estar equipado.
     */
    equip(itemId) {
        if (!this.owns(itemId)) {
            Utils.showNotification?.('Você não possui este item', 'warning');
            return false;
        }

        const item = this.getItem(itemId);
        if (!item) return false;

        const data = this.load();
        if (!data.equipped) data.equipped = {};

        // Desequipar anterior da mesma categoria
        const prev = data.equipped[item.type];

        data.equipped[item.type] = itemId;
        this.save(data);

        // Aplicar efeito imediatamente
        this._applyEquipped(item);

        Utils.showNotification?.(`✅ "${item.name}" equipado!`, 'success');
        console.log(`[Inventory] Equipado: ${itemId} (${item.type}) — anterior: ${prev || 'nenhum'}`);
        return true;
    },

    unequip(type) {
        const data = this.load();
        if (!data.equipped) return;
        const prev = data.equipped[type];
        delete data.equipped[type];
        this.save(data);
        this._removeEquipped(type);
        if (prev) console.log(`[Inventory] Desequipado: ${type}`);
    },

    getEquipped(type) {
        const data = this.load();
        return data.equipped?.[type] || null;
    },

    getEquippedItem(type) {
        const id = this.getEquipped(type);
        return id ? this.getItem(id) : null;
    },

    // ── CATÁLOGO ──────────────────────────────────────

    getItem(itemId) {
        return this.CATALOG.find(i => i.id === itemId) || null;
    },

    getByType(type) {
        return this.CATALOG.filter(i => i.type === type);
    },

    getOwned() {
        const data = this.load();
        return (data.owned || []).map(id => this.getItem(id)).filter(Boolean);
    },

    // ── APLICAR EFEITOS ───────────────────────────────

    _applyEquipped(item) {
        switch (item.type) {
            case 'border':  this._applyBorder(item); break;
            case 'title':   this._applyTitle(item);  break;
            case 'theme':   this._applyTheme(item);  break;
            case 'effect':  this._applyEffect(item); break;
            case 'particle':this._applyParticle(item); break;
        }
    },

    _removeEquipped(type) {
        switch (type) {
            case 'border':   this._removeBorder();   break;
            case 'title':    this._removeTitle();    break;
            case 'particle': this._removeParticle(); break;
        }
    },

    // Borda no avatar da sidebar
    _applyBorder(item) {
        const avatar = document.getElementById('user-avatar');
        if (!avatar || !item.css) return;
        // Adicionar borda via atributo de dado para não colidir com outros estilos
        avatar.setAttribute('data-border', item.id);
        avatar.style.cssText += `;${item.css}`;
    },

    _removeBorder() {
        const avatar = document.getElementById('user-avatar');
        if (!avatar) return;
        avatar.removeAttribute('data-border');
        avatar.style.border    = '';
        avatar.style.boxShadow = '';
        avatar.style.outline   = '';
    },

    // Título abaixo do nome no perfil hero
    _applyTitle(item) {
        const existing = document.getElementById('profile-equipped-title');
        if (existing) existing.remove();
        // Será aplicado na próxima vez que o perfil renderizar
        // O profile.js lê de getEquippedItem('title') no render
    },

    _removeTitle() {
        const existing = document.getElementById('profile-equipped-title');
        if (existing) existing.remove();
    },

    // Tema visual — delegar ao ThemeManager
    _applyTheme(item) {
        if (item.themeId && window.ThemeManager) {
            ThemeManager.applyTheme(item.themeId);
            Utils.saveData('shop_login_effect', item.effect || null);
        }
    },

    // Efeito de navegação — registrar para o Router usar
    _applyEffect(item) {
        Utils.saveData('shop_nav_effect', item.id);
        window._navEffect = item.id;
    },

    // Partícula de perfil ao redor do avatar
    _applyParticle(item) {
        this._removeParticle();
        const avatar = document.getElementById('user-avatar');
        if (!avatar) return;

        const wrap = avatar.parentElement;
        if (!wrap) return;

        const particles = document.createElement('div');
        particles.id = 'avatar-particles';
        particles.setAttribute('data-particle', item.id);
        particles.style.cssText = `
            position: absolute;
            inset: -8px;
            pointer-events: none;
            z-index: 10;
            border-radius: 50%;
            overflow: visible;
        `;

        const emojis = {
            particle_stars:  ['✨','⭐','✦'],
            particle_hearts: ['💕','💖','💗'],
            particle_nyan:   ['🐾','🐱','🐾'],
        };
        const chars = emojis[item.id] || ['✨'];

        // Gerar 6 partículas em órbita via CSS
        const style = document.createElement('style');
        style.id = 'avatar-particle-style';
        style.textContent = `
            @keyframes orbitParticle {
                from { transform: rotate(var(--start)) translateX(28px) rotate(calc(var(--start) * -1)); }
                to   { transform: rotate(calc(var(--start) + 360deg)) translateX(28px) rotate(calc((var(--start) + 360deg) * -1)); }
            }
            .avatar-particle {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 14px;
                height: 14px;
                margin: -7px 0 0 -7px;
                font-size: 10px;
                line-height: 14px;
                text-align: center;
                animation: orbitParticle 3s linear infinite;
            }
        `;
        document.head.appendChild(style);

        for (let i = 0; i < 6; i++) {
            const p = document.createElement('span');
            p.className = 'avatar-particle';
            p.style.setProperty('--start', `${i * 60}deg`);
            p.style.animationDelay = `${-(i * 0.5)}s`;
            p.textContent = chars[i % chars.length];
            particles.appendChild(p);
        }

        // Garantir que o wrap tem position relative
        if (getComputedStyle(wrap).position === 'static') {
            wrap.style.position = 'relative';
        }
        wrap.appendChild(particles);
    },

    _removeParticle() {
        document.getElementById('avatar-particles')?.remove();
        document.getElementById('avatar-particle-style')?.remove();
    },

    // ── APLICAR TUDO AO BOOT ──────────────────────────

    applyAll() {
        const data = this.load();
        if (!data.equipped) return;

        Object.entries(data.equipped).forEach(([type, itemId]) => {
            const item = this.getItem(itemId);
            if (item && this.owns(itemId)) {
                this._applyEquipped(item);
            }
        });

        console.log('[Inventory] Efeitos equipados aplicados');
    },

    // ── EFEITO DE LOGIN (lido pelo login-intro.js) ────

    getLoginEffect() {
        // Verifica se tem efeito do item de tema equipado
        const themeItem = this.getEquippedItem('theme');
        if (themeItem?.effect) return themeItem.effect;
        return Utils.loadData('shop_login_effect') || null;
    },

    // ── EFEITO DE NAVEGAÇÃO (lido pelo router) ────────

    getNavEffect() {
        const effectItem = this.getEquippedItem('effect');
        return effectItem?.id || Utils.loadData('shop_nav_effect') || null;
    },

    // ── INIT ──────────────────────────────────────────

    init() {
        // Aplicar bordas, partículas, etc. que estavam equipados
        // Aguardar a sidebar estar no DOM
        setTimeout(() => this.applyAll(), 200);
        console.log('[Inventory v1.0.0] Inicializado');
    },
};

window.Inventory = Inventory;