const Inventory = {

    KEY: 'nyan_inventory',
    REMOTE_SYNC_DEBOUNCE: 1000,
    _remoteSyncTimer: null,

    CATALOG: [
        { id:'title_gamer',    type:'title',  name:'Gamer nyan~',     icon:'\u{1F3AE}', rarity:'common',    price:200,  minLevel:3,  preview:'Aparece no seu perfil abaixo do nome' },
        { id:'title_speedster',type:'title',  name:'Velocista',         icon:'\u26A1', rarity:'common',    price:200,  minLevel:3,  preview:'Para quem manda no Type Racer' },
        { id:'title_lucky',    type:'title',  name:'Sortudo',           icon:'\u{1F340}', rarity:'common',    price:200,  minLevel:3,  preview:'Sorte e um estilo de vida' },
        { id:'title_genius',   type:'title',  name:'Genio do Quiz',     icon:'\u{1F9E0}', rarity:'rare',      price:500,  minLevel:8,  preview:'Para quem tira 10/10 no Quiz' },
        { id:'title_legend',   type:'title',  name:'Lendario',          icon:'\u{1F451}', rarity:'epic',      price:1000, minLevel:25, preview:'Reservado para os veteranos' },
        { id:'title_nyan',     type:'title',  name:'nyan~ Master',      icon:'\u{1F431}', rarity:'epic',      price:800,  minLevel:15, preview:'O titulo mais kawaii de todos' },
        { id:'title_master_nyan', type:'title', name:'Mestre Nyan~',    icon:'\u{1F451}', rarity:'milestone', price:0,    minLevel:25, preview:'Titulo de marco - desbloqueado ao atingir nivel 25', milestone:true },
        { id:'title_patchday_310', type:'title', name:'Patch Day v3.10', icon:'\u{1F381}', rarity:'bundle', price:0, minLevel:1, preview:'Recompensa exclusiva de lancamento da v3.10', eventOnly:true },
        { id:'title_bundle_nebula_311', type:'title', name:'Comandante Nebula', icon:'\u{1F30C}', rarity:'bundle', price:750, minLevel:1, preview:'Titulo legado do Bundle Nebula', eventOnly:true, endsAt:'2026-04-30T23:59:59-03:00' },
        { id:'title_season1_silver', type:'title', name:'Aurora da Temporada', icon:'\u{1F338}', rarity:'seasonal', price:450, minLevel:1, preview:'Titulo sazonal da Temporada 1', seasonId:'season_1', endsAt:'2026-05-15T23:59:59-03:00', eventOnly:true },
        { id:'title_season1_champion', type:'title', name:'Despertar Supremo', icon:'\u{1F451}', rarity:'seasonal', price:0, minLevel:1, preview:'Titulo final da Temporada 1', seasonId:'season_1', endsAt:'2026-05-15T23:59:59-03:00', eventOnly:true, rewardOnly:true, seasonFinalReward:true },
        { id:'border_simple',  type:'border', name:'Borda Simples',     icon:'\u2B1C', rarity:'common',    price:400,  minLevel:5,  preview:'Borda branca discreta',
          css:'border: 2px solid rgba(255,255,255,0.6);' },
        { id:'border_purple',  type:'border', name:'Borda Roxa',        icon:'\u{1F49C}', rarity:'common',    price:400,  minLevel:5,  preview:'Borda na cor do tema',
          css:'border: 2px solid #a855f7; box-shadow: 0 0 10px rgba(168,85,247,0.6), inset 0 0 6px rgba(168,85,247,0.15);' },
        { id:'border_gold',    type:'border', name:'Borda Dourada',     icon:'\u{1F947}', rarity:'rare',      price:700,  minLevel:10, preview:'Para quem chegou longe',
          css:'border: 2px solid #f59e0b; box-shadow: 0 0 12px rgba(245,158,11,0.7), 0 0 24px rgba(245,158,11,0.3);' },
        {
            id:'border_neon', type:'border', name:'Borda Neon RGB', icon:'\u{1F308}', rarity:'rare', price:900, minLevel:12, preview:'RGB animado - cicla todas as cores',
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
            id:'border_paw', type:'border', name:'Patinhas', icon:'\u{1F43E}', rarity:'milestone', price:0, minLevel:10,
            preview:'Borda animada legado da trilha antiga de marcos', eventOnly:true,
            css:'border: 2.5px solid #4ade80; animation: pawBorderAnim 3s ease-in-out infinite;',
            extraStyle:`@keyframes pawBorderAnim {
                0%,100% { border-color:#4ade80; box-shadow:0 0 6px 1px rgba(74,222,128,0.7); }
                25%     { border-color:#86efac; box-shadow:0 0 10px 2px rgba(134,239,172,0.9); }
                50%     { border-color:#4ade80; box-shadow:0 0 6px 1px rgba(74,222,128,0.7); }
                75%     { border-color:#22c55e; box-shadow:0 0 8px 2px rgba(34,197,94,0.8); }
            }`
        },
        {
            id:'border_crown', type:'border', name:'Realeza', icon:'\u{1F451}', rarity:'milestone', price:0, minLevel:25,
            preview:'Borda dourada legado da trilha antiga de marcos', eventOnly:true,
            css:'border: 2.5px solid #f59e0b; animation: crownBorderAnim 2.5s ease-in-out infinite;',
            extraStyle:`@keyframes crownBorderAnim {
                0%,100% { border-color:#f59e0b; box-shadow:0 0 6px 1px rgba(245,158,11,0.8); }
                33%     { border-color:#fbbf24; box-shadow:0 0 10px 3px rgba(251,191,36,0.9); }
                66%     { border-color:#d97706; box-shadow:0 0 6px 1px rgba(217,119,6,0.7); }
            }`
        },
        {
            id:'border_star', type:'border', name:'Galaxia', icon:'\u{1F30C}', rarity:'milestone', price:0, minLevel:50,
            preview:'Borda galaxia animada - desbloqueada ao atingir nivel 50', milestone:true,
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
        { id:'border_patchday_310', type:'border', name:'Patch Neon', icon:'\u{1F6E0}\uFE0F', rarity:'bundle', price:1250, minLevel:1, preview:'Borda limitada do evento de patch v3.10', eventOnly:true,
          css:'border: 2.5px solid #22d3ee; box-shadow: 0 0 8px rgba(34,211,238,0.6), 0 0 18px rgba(236,72,153,0.35); animation: patchPulse 2.4s ease-in-out infinite;',
          extraStyle:`@keyframes patchPulse {
              0%,100% { border-color:#22d3ee; box-shadow:0 0 8px rgba(34,211,238,0.6),0 0 18px rgba(236,72,153,0.35); }
              50% { border-color:#ec4899; box-shadow:0 0 10px rgba(236,72,153,0.7),0 0 20px rgba(34,211,238,0.4); }
          }`
        },
        { id:'border_bundle_nebula_311', type:'border', name:'Fronteira Nebula', icon:'\u{1F680}', rarity:'bundle', price:1450, minLevel:1, preview:'Borda limitada do Bundle Nebula', eventOnly:true, endsAt:'2026-04-30T23:59:59-03:00',
          css:'border:2.5px solid #60a5fa; box-shadow:0 0 8px rgba(96,165,250,0.55), 0 0 18px rgba(129,140,248,0.35); animation: nebulaBorderPulse 2.6s ease-in-out infinite;',
          extraStyle:`@keyframes nebulaBorderPulse {
              0%,100% { border-color:#60a5fa; box-shadow:0 0 8px rgba(96,165,250,0.55),0 0 18px rgba(129,140,248,0.35); }
              50% { border-color:#a78bfa; box-shadow:0 0 10px rgba(167,139,250,0.65),0 0 20px rgba(96,165,250,0.42); }
          }`
        },
        { id:'border_season1', type:'border', name:'Fronteira S1', icon:'\u{1F338}', rarity:'seasonal', price:800, minLevel:1, preview:'Borda exclusiva da Temporada 1', seasonId:'season_1', endsAt:'2026-05-15T23:59:59-03:00', eventOnly:true,
          css:'border:2.5px solid #fb7185; box-shadow:0 0 10px rgba(251,113,133,0.45), 0 0 18px rgba(249,115,22,0.28); animation: seasonBloom 2.8s ease-in-out infinite;',
          extraStyle:`@keyframes seasonBloom {
              0%,100% { border-color:#fb7185; box-shadow:0 0 10px rgba(251,113,133,0.45),0 0 18px rgba(249,115,22,0.28); }
              50% { border-color:#f97316; box-shadow:0 0 12px rgba(249,115,22,0.5),0 0 20px rgba(251,113,133,0.32); }
          }`
        },

        { id:'theme_sakura',   type:'theme', name:'Sakura',            icon:'\u{1F338}', rarity:'rare',   price:1200, minLevel:10, preview:'Rosa - petalas caindo no login',  themeId:'pink',   effect:'sakura' },
        { id:'theme_midnight', type:'theme', name:'Midnight',          icon:'\u{1F319}', rarity:'rare',   price:1200, minLevel:10, preview:'Indigo - particulas de estrelas',  themeId:'indigo', effect:'stars' },
        { id:'theme_neon',     type:'theme', name:'Neon',              icon:'\u26A1', rarity:'epic',   price:1800, minLevel:15, preview:'Teal - efeito glitch no login',   themeId:'teal',   effect:'glitch' },
        { id:'theme_fire',     type:'theme', name:'Chamas',            icon:'\u{1F525}', rarity:'epic',   price:1800, minLevel:15, preview:'Vermelho - particulas de fogo',  themeId:'red',    effect:'fire' },
        { id:'theme_patchpulse_intro', type:'theme', name:'Patch Pulse Intro', icon:'\u{1F300}', rarity:'bundle', price:1250, minLevel:1, preview:'Intro limitada do evento v3.10 com pulso neon', themeId:'teal', effect:'patchpulse', eventOnly:true, preserveTheme:true },

        { id:'effect_slide', type:'effect', name:'Slide',  icon:'\u2194\uFE0F', rarity:'common', price:600,  minLevel:7,  preview:'Troca de ferramenta com deslize lateral' },
        { id:'effect_zoom',  type:'effect', name:'Zoom',   icon:'\u{1F50D}', rarity:'common', price:600,  minLevel:7,  preview:'Zoom suave ao trocar de pagina' },
        { id:'effect_flip',  type:'effect', name:'Flip',   icon:'\u{1F504}', rarity:'rare',   price:1000, minLevel:12, preview:'Rotacao lateral ao navegar' },
        { id:'effect_bundle_nebula_311', type:'effect', name:'Nebula Drift', icon:'\u{1FA90}', rarity:'bundle', price:750, minLevel:1, preview:'Efeito de navegacao exclusivo do Bundle Nebula', eventOnly:true, endsAt:'2026-04-30T23:59:59-03:00' },

        { id:'particle_stars',  type:'particle', name:'Estrelas',         icon:'\u2728', rarity:'common', price:500, minLevel:6,  preview:'Estrelinhas ao redor do avatar' },
        { id:'particle_hearts', type:'particle', name:'Coracoes',         icon:'\u{1F495}', rarity:'common', price:500, minLevel:6,  preview:'Coracoes flutuando' },
        { id:'particle_nyan',   type:'particle', name:'Patinhas nyan~', icon:'\u{1F43E}', rarity:'rare',   price:900, minLevel:10, preview:'Patinhas de gato girando' },
        { id:'particle_bundle_nebula_311', type:'particle', name:'Poeira Nebula', icon:'\u{1F30C}', rarity:'bundle', price:950, minLevel:1, preview:'Particulas exclusivas do Bundle Nebula', eventOnly:true, endsAt:'2026-04-30T23:59:59-03:00' },
        { id:'particle_veteran_spark', type:'particle', name:'Sigilos Veteranos', icon:'\u25C8', rarity:'milestone', price:0, minLevel:10, preview:'Particulas de marco - sigilos dourados ao atingir nivel 10', milestone:true },
        { id:'particle_season1_petals', type:'particle', name:'Petalas S1', icon:'\u{1F33A}', rarity:'seasonal', price:0, minLevel:1, preview:'Efeito raro de petalas da Temporada 1', seasonId:'season_1', endsAt:'2026-05-15T23:59:59-03:00', eventOnly:true, rewardOnly:true },
    ],

    RARITY: {
        common:    { label:'Comum',   color:'#9ca3af', bg:'rgba(156,163,175,0.12)' },
        rare:      { label:'Raro',    color:'#3b82f6', bg:'rgba(59,130,246,0.12)'  },
        epic:      { label:'Epico',   color:'#a855f7', bg:'rgba(168,85,247,0.12)'  },
        milestone: { label:'Marco',   color:'#f59e0b', bg:'rgba(245,158,11,0.12)'  },
        bundle:    { label:'Bundle',  color:'#10b981', bg:'rgba(16,185,129,0.12)'  },
        weekly:    { label:'Semanal', color:'#10b981', bg:'rgba(16,185,129,0.12)'  },
        seasonal:  { label:'Sazonal', color:'#fb7185', bg:'rgba(251,113,133,0.12)' },
    },

    _defaultData() {
        return { owned: [], equipped: {}, updatedAt: 0 };
    },

    _normalizeData(raw = {}) {
        const data = raw && typeof raw === 'object' ? { ...raw } : {};
        data.owned = Array.isArray(data.owned) ? [...new Set(data.owned.filter(Boolean))] : [];
        data.equipped = data.equipped && typeof data.equipped === 'object' ? { ...data.equipped } : {};
        data.updatedAt = Number.isFinite(Number(data.updatedAt)) ? Number(data.updatedAt) : 0;
        return data;
    },

    load() {
        const legacySeasonBadgeTitleId = 'title_season1_badge';
        const legacySentinelTitleIds = ['title_security_sentinel_v310', 'title_bug_hunter_v310'];
        const nebulaLegacyTitleId = 'title_bundle_nebula_311';
        const nebulaBundleEffectId = 'effect_bundle_nebula_311';
        const data = this._normalizeData(Utils.loadData(this.KEY) || this._defaultData());
        let changed = false;
        let removedEquippedTitle = false;

        const canMigrateSentinelBadge = typeof window.Badges?.unlock === 'function';
        const hasLegacySentinelTitle = data.owned.some((id) => legacySentinelTitleIds.includes(id))
            || legacySentinelTitleIds.includes(String(data.equipped.title || '').trim());
        if (canMigrateSentinelBadge && hasLegacySentinelTitle) {
            const legacySentinelWasEquipped = legacySentinelTitleIds.includes(String(data.equipped.title || '').trim());
            window.Badges.unlock('badge_security_sentinel_v310', { silent: true, skipSync: true, autoEquip: false });
            if (legacySentinelWasEquipped) {
                window.Badges.equip?.('badge_security_sentinel_v310', { silent: true, skipSync: true });
                delete data.equipped.title;
                removedEquippedTitle = true;
            }
            data.owned = data.owned.filter((id) => !legacySentinelTitleIds.includes(id));
            changed = true;
        }

        const hasSeasonBadgeMigrated = window.Badges?.owns?.('badge_season1') === true;
        if (hasSeasonBadgeMigrated && data.owned.includes(legacySeasonBadgeTitleId)) {
            data.owned = data.owned.filter((id) => id !== legacySeasonBadgeTitleId);
            changed = true;
        }

        if (hasSeasonBadgeMigrated && data.equipped.title === legacySeasonBadgeTitleId) {
            delete data.equipped.title;
            removedEquippedTitle = true;
            changed = true;
        }

        const ownsLegacyNebulaTitle = data.owned.includes(nebulaLegacyTitleId)
            || String(data.equipped.title || '').trim() === nebulaLegacyTitleId;
        if (ownsLegacyNebulaTitle) {
            if (!data.owned.includes(nebulaBundleEffectId)) {
                data.owned.push(nebulaBundleEffectId);
            }
            data.owned = data.owned.filter((id) => id !== nebulaLegacyTitleId);
            if (String(data.equipped.title || '').trim() === nebulaLegacyTitleId) {
                delete data.equipped.title;
                removedEquippedTitle = true;
            }
            changed = true;
        }

        if (changed) {
            this.save(data, { skipSync: true, preserveUpdatedAt: true });
            if (removedEquippedTitle) {
                this._removeTitle();
                this._syncEquippedToCloud('title', null);
            }
        }
        return data;
    },

    save(data, options = {}) {
        const normalized = this._normalizeData(data);
        if (!options.preserveUpdatedAt) {
            normalized.updatedAt = Date.now();
        }
        Utils.saveData(this.KEY, normalized);
        if (!options.skipSync) this._scheduleRemoteSync();
        return normalized;
    },

    _scheduleRemoteSync() {
        if (!window.NyanAuth?._syncLocalProfile || !window.NyanAuth?.isOnline?.() || !window.NyanFirebase?.isReady?.()) {
            return;
        }
        if (this._remoteSyncTimer) clearTimeout(this._remoteSyncTimer);
        this._remoteSyncTimer = setTimeout(() => {
            this._remoteSyncTimer = null;
            window.NyanAuth._syncLocalProfile({ includeEconomy: false }).catch(() => {});
        }, this.REMOTE_SYNC_DEBOUNCE);
    },

    getCloudPayload() {
        return this.load();
    },

    applyRemoteSync(remoteData, options = {}) {
        if (!remoteData || typeof remoteData !== 'object') return false;

        const local = this.load();
        const remote = this._normalizeData(remoteData);
        const localHasData = local.owned.length > 0 || Object.keys(local.equipped || {}).length > 0;
        const remoteHasData = remote.owned.length > 0 || Object.keys(remote.equipped || {}).length > 0;
        if (!remoteHasData) return false;

        const shouldApply = options.force === true
            || !localHasData
            || Number(remote.updatedAt || 0) > Number(local.updatedAt || 0);

        if (!shouldApply) return false;

        const sameOwned = JSON.stringify(local.owned) === JSON.stringify(remote.owned);
        const sameEquipped = JSON.stringify(local.equipped) === JSON.stringify(remote.equipped);
        if (sameOwned && sameEquipped) return false;

        this.save(remote, { skipSync: true, preserveUpdatedAt: true });
        ['border', 'title', 'particle'].forEach((type) => {
            if (!remote.equipped?.[type]) this._removeEquipped(type);
        });
        if (!remote.equipped?.effect) {
            Utils.removeData('shop_nav_effect');
            window._navEffect = null;
        }
        this.applyAll();
        return true;
    },

    owns(itemId) {
        return this.load().owned.includes(itemId);
    },

    unlockItem(itemId, options = {}) {
        const data = this.load();
        if (data.owned.includes(itemId)) return false;
        data.owned.push(itemId);
        this.save(data, options);
        return true;
    },

    revokeItem(itemId, options = {}) {
        const data = this.load();
        if (!Array.isArray(data.owned) || !data.owned.includes(itemId)) return false;

        data.owned = data.owned.filter((id) => id !== itemId);

        const item = this.getItem(itemId);
        const type = item?.type || null;
        const wasEquipped = !!(type && data.equipped?.[type] === itemId);
        if (wasEquipped && data.equipped) {
            delete data.equipped[type];
        }

        this.save(data, options);

        if (wasEquipped && type) {
            this._removeEquipped(type);
            this._syncEquippedToCloud(type, null);
        }

        if (!options.silent) {
            Utils.showNotification?.(`Item removido: ${item?.name || itemId}`, 'info');
        }
        return true;
    },

    buy(itemId, weeklyPrice = 0) {
        const item = this.getItem(itemId);
        if (!item) return { ok:false, reason:'Item nÃ£o encontrado' };
        if (item.milestone) return { ok:false, reason:'Este item Ã© desbloqueado por marco de nÃ­vel' };
        if (item.rewardOnly) return { ok:false, reason:'Este item so e obtido por recompensa da temporada' };
        if (this.owns(itemId)) return { ok:false, reason:'VocÃª jÃ¡ possui este item' };

        if (item.endsAt) {
            const endsAt = Date.parse(item.endsAt);
            if (Number.isFinite(endsAt) && Date.now() > endsAt) {
                return { ok:false, reason:'Este item sazonal expirou' };
            }
        }

        if (item.seasonId) {
            const season = window.Seasons?.getCurrentSeason?.();
            const active = window.Seasons?.isActive?.(season);
            if (!season || season.id !== item.seasonId || !active) {
                return { ok:false, reason:'Disponivel apenas durante a temporada ativa' };
            }
        }

        const currentLevel = window.Economy?.getLevel?.() || 1;
        if (!weeklyPrice && currentLevel < item.minLevel) return { ok:false, reason:`Nivel ${item.minLevel} necessario (voce esta no ${currentLevel})` };
        const finalPrice = weeklyPrice > 0 ? weeklyPrice : item.price;
        const chips = window.Economy?.getChips?.() || 0;
        if (chips < finalPrice) return { ok:false, reason:`Chips insuficientes (${finalPrice} necessarios, voce tem ${chips})` };
        const spent = window.Economy?.spendChips?.(finalPrice);
        if (!spent) return { ok:false, reason:'Falha ao debitar chips' };
        this.unlockItem(itemId);
        Utils.showNotification?.(`\u{1F6CD}\uFE0F "${item.name}" adquirido! nyan~`, 'success');
        return { ok:true };
    },

    equip(itemId) {
        if (!this.owns(itemId)) { Utils.showNotification?.('Voce nao possui este item', 'warning'); return false; }
        const item = this.getItem(itemId);
        if (!item) return false;
        const data = this.load();
        if (!data.equipped) data.equipped = {};
        data.equipped[item.type] = itemId;
        this.save(data);
        this._applyEquipped(item);
        this._syncEquippedToCloud(item.type, item);
        Utils.showNotification?.(`\u2705 "${item.name}" equipado!`, 'success');
        return true;
    },

    unequip(type) {
        const data = this.load();
        if (!data.equipped) return;
        delete data.equipped[type];
        this.save(data);
        this._removeEquipped(type);
        this._syncEquippedToCloud(type, null);
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

    _applyBorder(item) {
        this._removeBorder();

        const css = item.css || '';
        if (!css) return;

        let styleContent = '';
        if (item.extraStyle) styleContent += item.extraStyle + '\n';

        styleContent += `
            /* Reset SEM !important - especificidade menor que ID, nao bloqueia keyframes */
            .sidebar-user-avatar    { box-shadow: none; }
            .profile-avatar-preview { border: none; box-shadow: none; overflow: visible; }
            .profile-avatar-wrap    { overflow: visible; }

            /* Manter imagem recortada dentro do container */
            .profile-avatar-preview > *,
            .profile-avatar-wrap > *:not(.profile-avatar-overlay),
            #avatar-preview-wrap > * { border-radius: inherit; overflow: hidden; display: block; }

            /* Borda equipada: ${item.id} - ID tem especificidade alta, ganha do reset de classe */
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
        document.getElementById('inventory-border-style')?.remove();

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
    },

    _removeTitle() {
        document.getElementById('profile-equipped-title')?.remove();
    },

    getProfileTitleFromProfile(profile = null) {
        const hiddenTitleIds = new Set([
            'title_season1_badge',
            'title_security_sentinel_v310',
            'title_bug_hunter_v310',
        ]);

        if (profile?.specialTitle?.id && !hiddenTitleIds.has(profile.specialTitle.id)) {
            return {
                id: profile.specialTitle.id,
                name: profile.specialTitle.name || 'Titulo especial',
                icon: profile.specialTitle.icon || '\u{1F3C5}',
                rarity: profile.specialTitle.rarity || 'weekly',
            };
        }
        if (profile?.profileTitle?.id && !hiddenTitleIds.has(profile.profileTitle.id)) {
            return {
                id: profile.profileTitle.id,
                name: profile.profileTitle.name || 'Titulo',
                icon: profile.profileTitle.icon || '\u{1F3C5}',
                rarity: profile.profileTitle.rarity || 'common',
            };
        }
        if (profile?.profileTitleId && !hiddenTitleIds.has(profile.profileTitleId)) {
            const byId = this.getItem(profile.profileTitleId);
            if (byId) return byId;
        }
        const equipped = this.getEquippedItem('title');
        if (equipped?.id && hiddenTitleIds.has(equipped.id)) return null;
        return equipped;
    },

    getTitleBadgeStyle(title = null) {
        const id = typeof title === 'string' ? title : (title?.id || '');
        const dark = document.body.classList.contains('dark-theme');

        if (id === 'title_security_sentinel_v310' || id === 'title_bug_hunter_v310') {
            return `
                font-family:var(--font-mono,'JetBrains Mono',monospace);
                letter-spacing:0.035em;
                color:${dark ? '#8fffe0' : '#005f56'};
                background:${dark
                    ? 'linear-gradient(135deg, rgba(3,12,20,0.94), rgba(4,32,44,0.92))'
                    : 'linear-gradient(135deg, rgba(0,255,136,0.16), rgba(0,207,255,0.16))'};
                border:1px solid ${dark ? 'rgba(0,255,136,0.45)' : 'rgba(0,148,116,0.35)'};
                box-shadow:${dark
                    ? '0 0 10px rgba(0,255,136,0.22), inset 0 0 0 1px rgba(0,207,255,0.2)'
                    : '0 0 8px rgba(0,207,255,0.18), inset 0 0 0 1px rgba(0,255,136,0.2)'};
                text-shadow:${dark ? '0 0 8px rgba(0,255,136,0.35)' : 'none'};
            `;
        }

        return '';
    },

    getProfileBorderFromProfile(profile = null) {
        if (profile?.profileBorder?.id) {
            const byId = this.getItem(profile.profileBorder.id);
            if (byId) return byId;
        }
        if (profile?.profileBorderId) {
            const byId = this.getItem(profile.profileBorderId);
            if (byId) return byId;
        }
        if (profile && typeof profile === 'object') return null;
        return this.getEquippedItem('border');
    },

    _syncEquippedToCloud(type, item) {
        try {
            if (type !== 'title' && type !== 'border') return;
            if (!window.NyanAuth?.isOnline?.() || !window.NyanFirebase?.isReady?.()) return;
            const uid = window.NyanAuth?.getUID?.();
            if (!uid) return;

            if (type === 'border') {
                if (item?.id) {
                    window.NyanFirebase.updateDoc(`users/${uid}`, {
                        profileBorderId: item.id,
                        profileBorder: {
                            id: item.id,
                            name: item.name,
                            icon: item.icon,
                            rarity: item.rarity || 'common',
                        },
                    }).catch(() => {});
                } else {
                    window.NyanFirebase.updateDoc(`users/${uid}`, {
                        profileBorderId: null,
                        profileBorder: null,
                    }).catch(() => {});
                }
                return;
            }

            if (item?.id) {
                window.NyanFirebase.updateDoc(`users/${uid}`, {
                    profileTitleId: item.id,
                    profileTitle: {
                        id: item.id,
                        name: item.name,
                        icon: item.icon,
                        rarity: item.rarity || 'common',
                    },
                }).catch(() => {});
            } else {
                window.NyanFirebase.updateDoc(`users/${uid}`, {
                    profileTitleId: null,
                    profileTitle: null,
                }).catch(() => {});
            }
        } catch (_) {}
    },

    // _applyTheme: ao equipar um tema de intro, aplica o tema de cor correspondente.
    // O efeito da intro Ã© lido diretamente pelo LoginIntro via getEquippedItem('theme').
    // Nao salva mais shop_login_effect - nao e necessario.
    _applyTheme(item) {
        if (item.preserveTheme) return;
        if (item.themeId && window.ThemeManager) {
            ThemeManager.applyTheme(item.themeId, true); // silent = true
        }
    },

    _applyEffect(item) {
        Utils.saveData('shop_nav_effect', item.id);
        window._navEffect = item.id;
    },

    _applyParticle(item) {
        this._removeParticle();

        const sidebarUser = document.querySelector('.sidebar-user');
        if (!sidebarUser) return;
        if (getComputedStyle(sidebarUser).position === 'static') {
            sidebarUser.style.position = 'relative';
        }

        const configs = {
            particle_stars: {
                chars: ['\u2728','\u2B50','\u2726','\u2728','\u2B50','\u2726','\u2728','\u2B50'],
                color: '#fbbf24', glow: 'rgba(251,191,36,0.55)', anim: 'particlePulse',
            },
            particle_hearts: {
                chars: ['\u{1F495}','\u{1F496}','\u{1F497}','\u{1F495}','\u{1F496}','\u{1F497}','\u{1F495}','\u{1F496}'],
                color: '#ec4899', glow: 'rgba(236,72,153,0.55)', anim: 'particleFloat',
            },
            particle_nyan: {
                chars: ['\u{1F43E}','\u{1F431}','\u{1F43E}','\u{1F431}','\u{1F43E}','\u{1F431}','\u{1F43E}','\u{1F431}'],
                color: '#a855f7', glow: 'rgba(168,85,247,0.55)', anim: 'particleBounce',
            },
            particle_bundle_nebula_311: {
                chars: ['\u00b7','\u2022','\u2726','\u00b7','\u2022','\u2726','\u00b7','\u2022'],
                color: '#93c5fd',
                glow: 'rgba(59,130,246,0.35)',
                anim: 'particleNebulaTwinkle',
                fontSize: '8px',
                fontWeight: '600',
                textColor: '#dbeafe',
                textShadow: '0 0 6px rgba(191,219,254,0.5)',
                duration: '3.6s',
                ringShadow: '0 0 0 1px rgba(147,197,253,0.75), 0 0 8px rgba(59,130,246,0.28)',
                ringBackground: 'radial-gradient(circle at 50% 50%, rgba(59,130,246,0.12), rgba(30,64,175,0.03) 62%, transparent 100%)',
                positions: [
                    { top:'6%',  left:'16%' },
                    { top:'2%',  left:'50%' },
                    { top:'6%',  left:'84%' },
                    { top:'50%', right:'2%' },
                    { bottom:'6%', left:'84%' },
                    { bottom:'2%', left:'50%' },
                    { bottom:'6%', left:'16%' },
                    { top:'50%', left:'2%' },
                ],
            },
            particle_veteran_spark: {
                chars: ['\u25C6','\u25C7','\u25C6','\u25C8','\u25C6','\u25C7','\u25C6','\u25C8'],
                color: '#f59e0b',
                glow: 'rgba(245,158,11,0.55)',
                anim: 'particleOrbit',
                fontSize: '9px',
                fontWeight: '900',
                textColor: '#fcd34d',
                textShadow: '0 0 8px rgba(245,158,11,0.45)',
                duration: '2.2s',
            },
            particle_season1_petals: {
                chars: ['\u{1F338}','\u{1F33A}','\u{1F339}','\u{1F338}','\u{1F33A}','\u{1F339}','\u{1F338}','\u{1F33A}'],
                color: '#fb7185', glow: 'rgba(249,115,22,0.45)', anim: 'particleFloat',
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
            @keyframes particleTwinkle {
                0%,100% { opacity:0.45; transform:translate(-50%,-50%) scale(0.9) rotate(0deg); }
                50%      { opacity:1;   transform:translate(-50%,-50%) scale(1.35) rotate(18deg); }
            }
            @keyframes particleOrbit {
                0%,100% { opacity:0.48; transform:translate(-50%,-50%) translateX(0) translateY(0) scale(0.9) rotate(0deg); }
                25%     { opacity:0.8;  transform:translate(-50%,-50%) translateX(2px) translateY(-2px) scale(1.05) rotate(10deg); }
                50%     { opacity:1;    transform:translate(-50%,-50%) translateX(0) translateY(-4px) scale(1.18) rotate(18deg); }
                75%     { opacity:0.76; transform:translate(-50%,-50%) translateX(-2px) translateY(-2px) scale(1.02) rotate(8deg); }
            }
            @keyframes particleNebulaTwinkle {
                0%,100% { opacity:0.34; transform:translate(-50%,-50%) translateY(0) scale(0.88); }
                50%     { opacity:0.95; transform:translate(-50%,-50%) translateY(-2px) scale(1.16); }
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

        const glow = document.createElement('div');
        const ringShadow = cfg.ringShadow || `0 0 0 1.5px ${cfg.color}, 0 0 10px 1px ${cfg.glow}`;
        glow.style.cssText = `
            position:absolute; inset:0; border-radius:inherit;
            box-shadow: ${ringShadow};
            background: ${cfg.ringBackground || 'transparent'};
            animation: particleGlow 1.8s ease-in-out infinite;
            pointer-events:none;
        `;
        container.appendChild(glow);

        const positions = Array.isArray(cfg.positions) && cfg.positions.length > 0
            ? cfg.positions
            : [
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
            if (cfg.fontSize) p.style.fontSize = cfg.fontSize;
            if (cfg.fontWeight) p.style.fontWeight = cfg.fontWeight;
            if (cfg.textColor) p.style.color = cfg.textColor;
            if (cfg.textShadow) p.style.textShadow = cfg.textShadow;
            if (cfg.duration) p.style.animationDuration = cfg.duration;
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
            // FIX: nunca reaplicar 'theme' no boot - o tema de cor e gerenciado pelo
            // ThemeManager.init() que le app_color_theme salvo pelo usuario.
            // Reaplicar aqui sobrescreveria a escolha manual do usuÃ¡rio.
            if (type === 'theme') return;
            const item = this.getItem(itemId);
            if (item && this.owns(itemId)) this._applyEquipped(item);
        });
    },

    getLoginEffect() {
        const themeItem = this.getEquippedItem('theme');
        return themeItem?.effect || null;
    },

    getNavEffect() {
        const effectItem = this.getEquippedItem('effect');
        return effectItem?.id || Utils.loadData('shop_nav_effect') || null;
    },

    render() {
        if (window.Shop) {
            Shop._statusFilter = 'owned';
            Shop._typeFilter   = 'all';
            Shop._searchQuery  = '';
            return Shop.render();
        }
        const d    = document.body.classList.contains('dark-theme');
        const muted= d ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)';
        return `<div style="text-align:center;padding:3rem;color:${muted};font-family:'DM Sans',sans-serif;">
            <div style="font-size:2.5rem;margin-bottom:0.75rem;">\u{1F392}</div>
            <div style="font-size:0.9rem;">Loja nao disponivel</div>
        </div>`;
    },

    init() {
        setTimeout(() => this.applyAll(), 200);
    },
};

window.Inventory = Inventory;

