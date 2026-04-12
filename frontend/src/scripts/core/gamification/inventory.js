const Inventory = {

    KEY: 'nyan_inventory',

    CATALOG: [
        { id:'title_gamer',    type:'title',  name:'Gamer にゃん~',     icon:'🎮', rarity:'common',    price:200,  minLevel:3,  preview:'Aparece no seu perfil abaixo do nome' },
        { id:'title_speedster',type:'title',  name:'Velocista',         icon:'⚡', rarity:'common',    price:200,  minLevel:3,  preview:'Para quem manda no Type Racer' },
        { id:'title_lucky',    type:'title',  name:'Sortudo',           icon:'🍀', rarity:'common',    price:200,  minLevel:3,  preview:'Sorte é um estilo de vida' },
        { id:'title_genius',   type:'title',  name:'Gênio do Quiz',     icon:'🧠', rarity:'rare',      price:500,  minLevel:8,  preview:'Para quem tira 10/10 no Quiz' },
        { id:'title_legend',   type:'title',  name:'Lendário',          icon:'👑', rarity:'epic',      price:1000, minLevel:25, preview:'Reservado para os veteranos' },
        { id:'title_nyan',     type:'title',  name:'にゃん~ Master',    icon:'🐱', rarity:'epic',      price:800,  minLevel:15, preview:'O título mais kawaii de todos' },

        { id:'border_simple',  type:'border', name:'Borda Simples',     icon:'⬜', rarity:'common',    price:400,  minLevel:5,  preview:'Borda branca discreta',
          css:'border: 2px solid rgba(255,255,255,0.6);' },
        { id:'border_purple',  type:'border', name:'Borda Roxa',        icon:'💜', rarity:'common',    price:400,  minLevel:5,  preview:'Borda na cor do tema',
          css:'border: 2px solid #a855f7; box-shadow: 0 0 10px rgba(168,85,247,0.6), inset 0 0 6px rgba(168,85,247,0.15);' },
        { id:'border_gold',    type:'border', name:'Borda Dourada',     icon:'🥇', rarity:'rare',      price:700,  minLevel:10, preview:'Para quem chegou longe',
          css:'border: 2px solid #f59e0b; box-shadow: 0 0 12px rgba(245,158,11,0.7), 0 0 24px rgba(245,158,11,0.3);' },
        {
            id:'border_neon', type:'border', name:'Borda Neon RGB', icon:'🌈', rarity:'rare', price:900, minLevel:12, preview:'RGB animado — cicla todas as cores',
            css:'border: 2.5px solid #ff0000; animation: rgbBorderCycle 2s linear infinite;',
            extraStyle:`@keyframes rgbBorderCycle {
                0%   { border-color:#ff0000; box-shadow:0 0 6px 2px #ff0000; }
                14%  { border-color:#ff8800; box-shadow:0 0 6px 2px #ff8800; }
                28%  { border-color:#ffff00; box-shadow:0 0 6px 2px #ffff00; }
                42%  { border-color:#00ff00; box-shadow:0 0 6px 2px #00ff00; }
                57%  { border-color:#00ffff; box-shadow:0 0 6px 2px #00ffff; }
                71%  { border-color:#0088ff; box-shadow:0 0 6px 2px #0088ff; }
                85%  { border-color:#ff00ff; box-shadow:0 0 6px 2px #ff00ff; }
                100% { border-color:#ff0000; box-shadow:0 0 6px 2px #ff0000; }
            }`
        },
        {
            id:'border_paw', type:'border', name:'Patinhas ✨', icon:'🐾', rarity:'milestone', price:0, minLevel:10,
            preview:'Borda animada · desbloqueada ao atingir nível 10', milestone:true,
            css:'border: 2.5px solid #4ade80; animation: pawBorderAnim 3s ease-in-out infinite;',
            extraStyle:`@keyframes pawBorderAnim {
                0%,100% { border-color:#4ade80; box-shadow:0 0 6px 1px rgba(74,222,128,0.7); }
                25%     { border-color:#86efac; box-shadow:0 0 10px 2px rgba(134,239,172,0.9); }
                50%     { border-color:#4ade80; box-shadow:0 0 6px 1px rgba(74,222,128,0.7); }
                75%     { border-color:#22c55e; box-shadow:0 0 8px 2px rgba(34,197,94,0.8); }
            }`
        },
        {
            id:'border_crown', type:'border', name:'Realeza 👑', icon:'👑', rarity:'milestone', price:0, minLevel:25,
            preview:'Borda dourada animada · desbloqueada ao atingir nível 25', milestone:true,
            css:'border: 2.5px solid #f59e0b; animation: crownBorderAnim 2.5s ease-in-out infinite;',
            extraStyle:`@keyframes crownBorderAnim {
                0%,100% { border-color:#f59e0b; box-shadow:0 0 6px 1px rgba(245,158,11,0.8); }
                33%     { border-color:#fbbf24; box-shadow:0 0 10px 3px rgba(251,191,36,0.9); }
                66%     { border-color:#d97706; box-shadow:0 0 6px 1px rgba(217,119,6,0.7); }
            }`
        },
        {
            id:'border_star', type:'border', name:'Galáxia ⭐', icon:'🌌', rarity:'milestone', price:0, minLevel:50,
            preview:'Borda galáxia animada · desbloqueada ao atingir nível 50', milestone:true,
            css:'border: 3px solid #818cf8; animation: galaxyBorderAnim 4s linear infinite;',
            extraStyle:`@keyframes galaxyBorderAnim {
                0%   { border-color:#818cf8; box-shadow:0 0 6px 2px rgba(129,140,248,0.8); }
                20%  { border-color:#c084fc; box-shadow:0 0 8px 2px rgba(192,132,252,0.9); }
                40%  { border-color:#f472b6; box-shadow:0 0 6px 2px rgba(244,114,182,0.8); }
                60%  { border-color:#60a5fa; box-shadow:0 0 8px 2px rgba(96,165,250,0.9); }
                80%  { border-color:#34d399; box-shadow:0 0 6px 2px rgba(52,211,153,0.8); }
                100% { border-color:#818cf8; box-shadow:0 0 6px 2px rgba(129,140,248,0.8); }
            }`
        },

        { id:'theme_sakura',   type:'theme', name:'Sakura',            icon:'🌸', rarity:'rare',   price:1200, minLevel:10, preview:'Rosa · pétalas caindo no login',  themeId:'pink',   effect:'sakura' },
        { id:'theme_midnight', type:'theme', name:'Midnight',          icon:'🌙', rarity:'rare',   price:1200, minLevel:10, preview:'Índigo · partículas de estrelas',  themeId:'indigo', effect:'stars' },
        { id:'theme_neon',     type:'theme', name:'Neon',              icon:'⚡', rarity:'epic',   price:1800, minLevel:15, preview:'Teal · efeito glitch no login',   themeId:'teal',   effect:'glitch' },
        { id:'theme_fire',     type:'theme', name:'Chamas',            icon:'🔥', rarity:'epic',   price:1800, minLevel:15, preview:'Vermelho · partículas de fogo',  themeId:'red',    effect:'fire' },

        { id:'effect_slide', type:'effect', name:'Slide',  icon:'↔️', rarity:'common', price:600,  minLevel:7,  preview:'Troca de ferramenta com deslize lateral' },
        { id:'effect_zoom',  type:'effect', name:'Zoom',   icon:'🔍', rarity:'common', price:600,  minLevel:7,  preview:'Zoom suave ao trocar de página' },
        { id:'effect_flip',  type:'effect', name:'Flip',   icon:'🔄', rarity:'rare',   price:1000, minLevel:12, preview:'Rotação lateral ao navegar' },

        { id:'particle_stars',  type:'particle', name:'Estrelas',         icon:'✨', rarity:'common', price:500, minLevel:6,  preview:'Estrelinhas ao redor do avatar' },
        { id:'particle_hearts', type:'particle', name:'Corações',         icon:'💕', rarity:'common', price:500, minLevel:6,  preview:'Coraçõezinhos flutuando' },
        { id:'particle_nyan',   type:'particle', name:'Patinhas にゃん~', icon:'🐾', rarity:'rare',   price:900, minLevel:10, preview:'Patinhas de gato girando' },
    ],

    RARITY: {
        common:    { label:'Comum',   color:'#9ca3af', bg:'rgba(156,163,175,0.12)' },
        rare:      { label:'Raro',    color:'#3b82f6', bg:'rgba(59,130,246,0.12)'  },
        epic:      { label:'Épico',   color:'#a855f7', bg:'rgba(168,85,247,0.12)'  },
        milestone: { label:'Marco',   color:'#f59e0b', bg:'rgba(245,158,11,0.12)'  },
        weekly:    { label:'Semanal', color:'#10b981', bg:'rgba(16,185,129,0.12)'  },
    },

    load() {
        return Utils.loadData(this.KEY) || { owned:[], equipped:{} };
    },

    save(data) {
        Utils.saveData(this.KEY, data);
    },

    owns(itemId) {
        return this.load().owned.includes(itemId);
    },

    unlockItem(itemId) {
        const data = this.load();
        if (data.owned.includes(itemId)) return false;
        data.owned.push(itemId);
        this.save(data);
        return true;
    },

    buy(itemId, weeklyPrice = 0) {
        const item = this.getItem(itemId);
        if (!item) return { ok:false, reason:'Item não encontrado' };
        if (item.milestone) return { ok:false, reason:'Este item é desbloqueado por marco de nível' };
        if (this.owns(itemId)) return { ok:false, reason:'Você já possui este item' };
        const currentLevel = window.Economy?.getLevel?.() || 1;
        // weeklyPrice > 0 = compra da loja semanal — ignora restrição de nível
        if (!weeklyPrice && currentLevel < item.minLevel) return { ok:false, reason:`Nível ${item.minLevel} necessário (você está no ${currentLevel})` };
        const finalPrice = weeklyPrice > 0 ? weeklyPrice : item.price;
        const chips = window.Economy?.getChips?.() || 0;
        if (chips < finalPrice) return { ok:false, reason:`Chips insuficientes (${finalPrice} necessários, você tem ${chips})` };
        const spent = window.Economy?.spendChips?.(finalPrice);
        if (!spent) return { ok:false, reason:'Falha ao debitar chips' };
        this.unlockItem(itemId);
        Utils.showNotification?.(`🛍️ "${item.name}" adquirido! にゃん~`, 'success');
        return { ok:true };
    },

    equip(itemId) {
        if (!this.owns(itemId)) { Utils.showNotification?.('Você não possui este item', 'warning'); return false; }
        const item = this.getItem(itemId);
        if (!item) return false;
        const data = this.load();
        if (!data.equipped) data.equipped = {};
        data.equipped[item.type] = itemId;
        this.save(data);
        this._applyEquipped(item);
        Utils.showNotification?.(`✅ "${item.name}" equipado!`, 'success');
        return true;
    },

    unequip(type) {
        const data = this.load();
        if (!data.equipped) return;
        delete data.equipped[type];
        this.save(data);
        this._removeEquipped(type);
    },

    getEquipped(type) { return this.load().equipped?.[type] || null; },
    getEquippedItem(type) { const id = this.getEquipped(type); return id ? this.getItem(id) : null; },
    getItem(itemId) { return this.CATALOG.find(i => i.id === itemId) || null; },
    getByType(type) { return this.CATALOG.filter(i => i.type === type); },
    getOwned() { return (this.load().owned || []).map(id => this.getItem(id)).filter(Boolean); },

    _applyEquipped(item) {
        switch (item.type) {
            case 'border':   this._applyBorder(item);   break;
            case 'title':    this._applyTitle(item);    break;
            case 'theme':    this._applyTheme(item);    break;
            case 'effect':   this._applyEffect(item);   break;
            case 'particle': this._applyParticle(item); break;
        }
    },

    _removeEquipped(type) {
        switch (type) {
            case 'border':   this._removeBorder();   break;
            case 'title':    this._removeTitle();    break;
            case 'particle': this._removeParticle(); break;
        }
    },

    // FIX: aplicar borda também no avatar da tela de perfil
    _applyBorder(item) {
        this._removeBorder();

        const css = item.css || '';
        if (!css) return;

        // Keyframes primeiro, depois seletores
        let styleContent = '';
        if (item.extraStyle) styleContent += item.extraStyle + '\n';

        styleContent += `
            /* Reset SEM !important — especificidade menor que ID, não bloqueia keyframes */
            .sidebar-user-avatar    { box-shadow: none; }
            .profile-avatar-preview { border: none; box-shadow: none; overflow: visible; }
            .profile-avatar-wrap    { overflow: visible; }

            /* Manter imagem recortada dentro do container */
            .profile-avatar-preview > *,
            .profile-avatar-wrap > *:not(.profile-avatar-overlay),
            #avatar-preview-wrap > * { border-radius: inherit; overflow: hidden; display: block; }

            /* Borda equipada: ${item.id} — ID tem especificidade alta, ganha do reset de classe */
            #user-avatar,
            #avatar-preview-wrap,
            .profile-avatar-wrap {
                ${css}
                animation-delay: 0s;
            }
        `;

        let styleEl = document.getElementById('inventory-border-style');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'inventory-border-style';
            document.head.appendChild(styleEl);
        }
        styleEl.textContent = styleContent;

        [
            document.getElementById('user-avatar'),
            document.getElementById('avatar-preview-wrap'),
            document.querySelector('.profile-avatar-wrap'),
        ].filter(Boolean).forEach(el => el.setAttribute('data-border', item.id));
    },

    _removeBorder() {
        // Remover o <style> injetado — remove o efeito de todos os elementos de uma vez
        document.getElementById('inventory-border-style')?.remove();

        // Limpar data-border e estilos inline residuais
        [
            document.getElementById('user-avatar'),
            document.getElementById('avatar-preview-wrap'),
            document.querySelector('.profile-avatar-wrap'),
        ].filter(Boolean).forEach(el => {
            el.removeAttribute('data-border');
            el.style.border    = '';
            el.style.boxShadow = '';
            el.style.animation = '';
        });
    },

    _applyTitle(item) {
        // Será renderizado pelo profile.js ao ler getEquippedItem('title')
    },

    _removeTitle() {
        document.getElementById('profile-equipped-title')?.remove();
    },

    // _applyTheme: ao equipar um tema de intro, aplica o tema de cor correspondente.
    // O efeito da intro é lido diretamente pelo LoginIntro via getEquippedItem('theme').
    // Não salva mais shop_login_effect — não é necessário.
    _applyTheme(item) {
        if (item.themeId && window.ThemeManager) {
            ThemeManager.applyTheme(item.themeId, true); // silent = true
        }
    },

    _applyEffect(item) {
        Utils.saveData('shop_nav_effect', item.id);
        window._navEffect = item.id;
    },

    // FIX: partículas fixadas no avatar da sidebar corretamente
    _applyParticle(item) {
        this._removeParticle();

        // Âncora: .sidebar-user (card inteiro da sidebar)
        const sidebarUser = document.querySelector('.sidebar-user');
        if (!sidebarUser) return;
        if (getComputedStyle(sidebarUser).position === 'static') {
            sidebarUser.style.position = 'relative';
        }

        const configs = {
            particle_stars: {
                chars: ['✨','⭐','✦','✨','⭐','✦','✨','⭐'],
                color: '#fbbf24', glow: 'rgba(251,191,36,0.55)', anim: 'particlePulse',
            },
            particle_hearts: {
                chars: ['💕','💖','💗','💕','💖','💗','💕','💖'],
                color: '#ec4899', glow: 'rgba(236,72,153,0.55)', anim: 'particleFloat',
            },
            particle_nyan: {
                chars: ['🐾','🐱','🐾','🐱','🐾','🐱','🐾','🐱'],
                color: '#a855f7', glow: 'rgba(168,85,247,0.55)', anim: 'particleBounce',
            },
        };
        const cfg = configs[item.id] || configs.particle_stars;

        document.getElementById('avatar-particle-style')?.remove();
        const style = document.createElement('style');
        style.id = 'avatar-particle-style';
        style.textContent = `
            @keyframes particlePulse {
                0%,100% { opacity:0.55; transform:translate(-50%,-50%) scale(1);    }
                50%      { opacity:1;   transform:translate(-50%,-50%) scale(1.4);  }
            }
            @keyframes particleFloat {
                0%,100% { opacity:0.6; transform:translate(-50%,-50%) translateY(0);    }
                50%      { opacity:1;   transform:translate(-50%,-50%) translateY(-4px); }
            }
            @keyframes particleBounce {
                0%,100% { opacity:0.55; transform:translate(-50%,-50%) scale(1); }
                33%      { opacity:1;   transform:translate(-50%,-50%) scale(1.3) rotate(15deg); }
                66%      { opacity:0.8; transform:translate(-50%,-50%) scale(0.9) rotate(-10deg); }
            }
            @keyframes particleGlow {
                0%,100% { opacity:0.5; }
                50%      { opacity:0.9; }
            }
            .avatar-particle-item {
                position: absolute;
                font-size: 10px;
                line-height: 1;
                pointer-events: none;
                z-index: 200;
                animation-fill-mode: both;
                animation-iteration-count: infinite;
                animation-timing-function: ease-in-out;
                animation-duration: 1.8s;
            }
        `;
        document.head.appendChild(style);

        const container = document.createElement('div');
        container.id = 'avatar-particles';
        container.style.cssText = 'position:absolute;inset:-2px;pointer-events:none;z-index:200;overflow:visible;border-radius:inherit;';

        // Glow na borda do card (estilo Discord)
        const glow = document.createElement('div');
        glow.style.cssText = `
            position:absolute; inset:0; border-radius:inherit;
            box-shadow: 0 0 0 1.5px ${cfg.color}, 0 0 10px 1px ${cfg.glow};
            animation: particleGlow 1.8s ease-in-out infinite;
            pointer-events:none;
        `;
        container.appendChild(glow);

        // 8 partículas nas bordas do card (cantos + meios dos lados)
        const positions = [
            { top:'-6px',    left:'12%'   },
            { top:'-6px',    left:'50%'   },
            { top:'-6px',    left:'85%'   },
            { top:'50%',     right:'-6px' },
            { bottom:'-6px', left:'85%'   },
            { bottom:'-6px', left:'50%'   },
            { bottom:'-6px', left:'12%'   },
            { top:'50%',     left:'-6px'  },
        ];

        positions.forEach((pos, i) => {
            const p = document.createElement('span');
            p.className = 'avatar-particle-item';
            p.textContent = cfg.chars[i % cfg.chars.length];
            p.style.animationName  = cfg.anim;
            p.style.animationDelay = `${i * 0.225}s`;
            Object.entries(pos).forEach(([k, v]) => { p.style[k] = v; });
            container.appendChild(p);
        });

        sidebarUser.appendChild(container);
    },

    _removeParticle() {
        document.getElementById('avatar-particles')?.remove();
        document.getElementById('avatar-particle-style')?.remove();
    },

    applyAll() {
        const data = this.load();
        if (!data.equipped) return;
        Object.entries(data.equipped).forEach(([type, itemId]) => {
            // FIX: nunca reaplicar 'theme' no boot — o tema de cor é gerenciado pelo
            // ThemeManager.init() que lê app_color_theme salvo pelo usuário.
            // Reaplicar aqui sobrescreveria a escolha manual do usuário.
            if (type === 'theme') return;
            const item = this.getItem(itemId);
            if (item && this.owns(itemId)) this._applyEquipped(item);
        });
    },

    // Retorna o effect do tema equipado (lido pelo LoginIntro para decidir o efeito)
    getLoginEffect() {
        const themeItem = this.getEquippedItem('theme');
        return themeItem?.effect || null;
    },

    getNavEffect() {
        const effectItem = this.getEquippedItem('effect');
        return effectItem?.id || Utils.loadData('shop_nav_effect') || null;
    },

    render() {
        // Inventário é a loja filtrada por "Comprado" — sem duplicar interface
        if (window.Shop) {
            Shop._statusFilter = 'owned';
            Shop._typeFilter   = 'all';
            Shop._searchQuery  = '';
            return Shop.render();
        }
        const d    = document.body.classList.contains('dark-theme');
        const muted= d ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)';
        return `<div style="text-align:center;padding:3rem;color:${muted};font-family:'DM Sans',sans-serif;">
            <div style="font-size:2.5rem;margin-bottom:0.75rem;">🎒</div>
            <div style="font-size:0.9rem;">Loja não disponível</div>
        </div>`;
    },

    init() {
        setTimeout(() => this.applyAll(), 200);
    },
};

window.Inventory = Inventory;