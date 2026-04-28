
const Shop = {

    DAILY_PER_CAT: 2,      // itens por categoria na rotacao diaria
    DAILY_MAX_GAP: 15,     // gap max de nivel para aparecer na rotacao
    MAX_RENDERED_SHOP_ITEMS: 80,
    MAX_RENDERED_INVENTORY_ITEMS: 120,

    CATEGORIES: [
        { id:'title',    label:'Titulos',    icon:'\u{1F451}' },
        { id:'border',   label:'Bordas',     icon:'\u{1F5BC}\uFE0F' },
        { id:'theme',    label:'Temas',      icon:'\u{1F3A8}' },
        { id:'effect',   label:'Efeitos',    icon:'\u2728' },
        { id:'particle', label:'Particulas', icon:'\u{1F4AB}' },
    ],

    _tab:         'shop',   // 'shop' | 'seasonal' | 'inventory'
    _selectedCat: 'title',  // categoria selecionada na loja
    STORAGE_KEY: 'nyan_shop_state_v3111',
    _stateLoaded: false,
    _stateCache: null,
    BUNDLE_CATALOG_CACHE_KEY: 'nyan_bundle_catalog_cache_v1',
    BUNDLE_CATALOG_CACHE_TTL_MS: 2 * 60 * 1000,
    BUNDLE_CATALOG_BG_SYNC_INTERVAL_MS: 75 * 1000,
    BUNDLE_CATALOG_FORCE_SYNC_MIN_INTERVAL_MS: 20 * 1000,
    BUNDLE_CATALOG_TIMEOUT_MS: 8000,
    BUNDLE_CATALOG_REMOTE_DOC_PATH: 'config/bundleCatalog',
    BUNDLE_CATALOG_URLS: [
        'https://raw.githubusercontent.com/Fish7w7/Pandora/main/frontend/public/bundle-catalog.json',
        'https://raw.githubusercontent.com/Fish7w7/Pandora/main/bundle-catalog.json',
    ],
    _bundleCatalogLoaded: false,
    _bundleCatalogLoadPromise: null,
    _bundleCatalogLastRefreshMs: 0,
    _bundleCatalogMeta: { source: 'embedded', fetchedAt: 0, updatedAt: '', version: 1, identity: '' },
    _bundleCatalogSyncStarted: false,
    _bundleCatalogSyncTimer: null,
    _bundleCatalogSyncListenersBound: false,
    _bundleCatalogSyncHandlers: null,
    _bundleCatalogLastForceSyncMs: 0,
    _bundleCatalogRemoteUnsub: null,
    _bundleCatalogRemoteBindRetries: 0,
    // Fallback local: usado quando o catalogo remoto nao responde.
    BUNDLES: [
        {
            id: 'v310_patch_day',
            title: 'Patch Day v3.10',
            subtitle: 'Obrigada pela ajuda da comunidade na correcao do exploit',
            launchedAt: '2026-04-17T00:00:00-03:00',
            endsAt: '2026-04-19T23:59:59-03:00',
            items: ['title_patchday_310', 'border_patchday_310', 'theme_patchpulse_intro'],
            historical: true,
            rerunAllowed: false,
            allowInCustomPool: false,
        },
        {
            id: 'v311_nebula_bundle',
            title: 'Bundle Nebula',
            subtitle: 'Primeiro bundle oficial da loja com itens limitados',
            launchedAt: '2026-04-21T00:00:00-03:00',
            startsAt: '2026-04-21T00:00:00-03:00',
            endsAt: '2026-04-30T23:59:59-03:00',
            items: ['effect_bundle_nebula_311', 'border_bundle_nebula_311', 'particle_bundle_nebula_311'],
            bundleDiscountPct: 20,
            rerunAllowed: false,
            allowInCustomPool: true,
        },
    ],
    // Bundles custom podem puxar itens de bundles com idade minima configurada.
    CUSTOM_BUNDLE_MIN_AGE_DAYS: 90,
    CUSTOM_BUNDLES: [],

    _getDefaultState() {
        return {
            tab: 'shop',
            selectedCat: 'title',
            dailyCycle: { key: '', categories: {} },
        };
    },

    _normalizeBundle(rawBundle = {}, fallbackKind = 'official') {
        if (!rawBundle || typeof rawBundle !== 'object') return null;

        const id = String(rawBundle.id || '').trim();
        if (!id) return null;

        const items = Array.isArray(rawBundle.items)
            ? [...new Set(rawBundle.items.map((itemId) => String(itemId || '').trim()).filter(Boolean))]
            : [];
        const kindRaw = String(rawBundle.kind || fallbackKind || 'official').trim().toLowerCase();
        const kind = kindRaw === 'custom' ? 'custom' : 'official';
        const minSourceAgeDays = Number(rawBundle.minSourceAgeDays);
        const discount = Number(rawBundle.bundleDiscountPct);
        const sourceBundleIds = Array.isArray(rawBundle.sourceBundleIds)
            ? [...new Set(rawBundle.sourceBundleIds.map((entry) => String(entry || '').trim()).filter(Boolean))]
            : [];

        const normalized = {
            ...rawBundle,
            id,
            kind,
            title: String(rawBundle.title || 'Bundle'),
            subtitle: String(rawBundle.subtitle || ''),
            launchedAt: String(rawBundle.launchedAt || ''),
            startsAt: String(rawBundle.startsAt || ''),
            endsAt: String(rawBundle.endsAt || ''),
            items,
            bundleDiscountPct: Number.isFinite(discount)
                ? Math.max(0, Math.min(95, Math.round(discount)))
                : 0,
            historical: rawBundle.historical === true || rawBundle.legacy === true,
            rerunAllowed: rawBundle.rerunAllowed !== false,
            allowInCustomPool: rawBundle.allowInCustomPool !== false,
            sourceBundleIds,
        };

        if (kind === 'custom') {
            normalized.kind = 'custom';
        }

        if (Number.isFinite(minSourceAgeDays) && minSourceAgeDays > 0) {
            normalized.minSourceAgeDays = Math.floor(minSourceAgeDays);
        } else {
            delete normalized.minSourceAgeDays;
        }

        if (normalized.historical || rawBundle.legacy === true) {
            normalized.rerunAllowed = false;
            normalized.allowInCustomPool = false;
        }

        return normalized;
    },

    _normalizeBundleCatalog(rawCatalog = {}) {
        const source = rawCatalog && typeof rawCatalog === 'object' ? rawCatalog : {};
        const settings = source.settings && typeof source.settings === 'object' ? source.settings : {};

        const rawBundles = Array.isArray(source.bundles) ? source.bundles : [];
        const rawCustom = Array.isArray(source.customBundles)
            ? source.customBundles
            : Array.isArray(source.custom_bundles)
                ? source.custom_bundles
                : [];

        const minAgeRaw = Number(
            settings.customBundleMinAgeDays
            ?? source.customBundleMinAgeDays
            ?? this.CUSTOM_BUNDLE_MIN_AGE_DAYS
        );
        const customBundleMinAgeDays = Number.isFinite(minAgeRaw) && minAgeRaw > 0
            ? Math.floor(minAgeRaw)
            : this.CUSTOM_BUNDLE_MIN_AGE_DAYS;

        return {
            version: Number(source.version || 1),
            updatedAt: String(source.updatedAt || ''),
            settings: {
                ...settings,
                customBundleMinAgeDays,
            },
            bundles: rawBundles
                .map((bundle) => this._normalizeBundle(bundle, 'official'))
                .filter(Boolean),
            customBundles: rawCustom
                .map((bundle) => this._normalizeBundle(bundle, 'custom'))
                .filter(Boolean)
                .map((bundle) => ({ ...bundle, kind: 'custom' })),
        };
    },

    _getBundleCatalogIdentity(rawCatalog = {}) {
        const source = rawCatalog && typeof rawCatalog === 'object' ? rawCatalog : {};
        const updatedAt = String(source.updatedAt || '').trim();
        const version = Number(source.version);
        const bundles = Array.isArray(source.bundles) ? source.bundles : [];
        const customBundles = Array.isArray(source.customBundles)
            ? source.customBundles
            : Array.isArray(source.custom_bundles)
                ? source.custom_bundles
                : [];

        const minAgeRaw = Number(
            source.settings?.customBundleMinAgeDays
            ?? source.customBundleMinAgeDays
            ?? 0
        );
        const minAge = Number.isFinite(minAgeRaw) && minAgeRaw > 0 ? Math.floor(minAgeRaw) : 0;

        const rows = [...bundles, ...customBundles]
            .map((entry) => {
                const id = String(entry?.id || '').trim();
                if (!id) return '';
                const items = Array.isArray(entry?.items)
                    ? entry.items.map((itemId) => String(itemId || '').trim()).filter(Boolean).sort().join(',')
                    : '';
                const sourceIds = Array.isArray(entry?.sourceBundleIds)
                    ? entry.sourceBundleIds.map((sourceId) => String(sourceId || '').trim()).filter(Boolean).sort().join(',')
                    : '';
                return [
                    id,
                    String(entry?.kind || ''),
                    String(entry?.status || ''),
                    String(entry?.startsAt || ''),
                    String(entry?.endsAt || ''),
                    String(entry?.priority || ''),
                    String(entry?.bundleDiscountPct || ''),
                    entry?.enabled === false ? '0' : '1',
                    entry?.active === false ? '0' : '1',
                    items,
                    sourceIds,
                ].join('|');
            })
            .filter(Boolean)
            .sort();

        const seed = [
            `updatedAt:${updatedAt || '-'}`,
            `version:${Number.isFinite(version) && version > 0 ? Math.floor(version) : 0}`,
            `minAge:${minAge}`,
            ...rows,
        ].join('||');

        // Hash curto para comparar mudancas sem guardar fingerprint gigante no storage.
        let hash = 5381;
        for (let index = 0; index < seed.length; index += 1) {
            hash = ((hash << 5) + hash) ^ seed.charCodeAt(index);
            hash = hash >>> 0;
        }

        return `h:${hash.toString(36)}`;
    },

    _withCacheBust(url = '', token = '') {
        const safeUrl = String(url || '').trim();
        const safeToken = String(token || '').trim();
        if (!safeUrl || !safeToken) return safeUrl;
        try {
            const parsed = new URL(safeUrl);
            parsed.searchParams.set('nyan_cb', safeToken);
            return parsed.toString();
        } catch (_) {
            const joiner = safeUrl.includes('?') ? '&' : '?';
            return `${safeUrl}${joiner}nyan_cb=${encodeURIComponent(safeToken)}`;
        }
    },

    _extractRemoteBundleCatalog(remoteDoc = null) {
        if (!remoteDoc || typeof remoteDoc !== 'object') return null;

        const nestedCatalog = remoteDoc.catalog && typeof remoteDoc.catalog === 'object'
            ? remoteDoc.catalog
            : null;
        const source = nestedCatalog || remoteDoc;
        const hasBundlePayload = Array.isArray(source.bundles)
            || Array.isArray(source.customBundles)
            || Array.isArray(source.custom_bundles);
        if (!hasBundlePayload) return null;

        return this._normalizeBundleCatalog(source);
    },

    async _loadRemoteBundleCatalog() {
        if (!window.NyanFirebase?.isReady?.()) return null;

        const path = String(this.BUNDLE_CATALOG_REMOTE_DOC_PATH || '').trim();
        if (!path) return null;

        const doc = await window.NyanFirebase.getDoc(path).catch(() => null);
        if (!doc) return null;

        const catalog = this._extractRemoteBundleCatalog(doc);
        if (!catalog) return null;

        return {
            source: `firebase:${path}`,
            fetchedAt: Date.now(),
            data: catalog,
        };
    },

    _commitRemoteBundleCatalogSnapshot(remoteDoc = null, { force = false } = {}) {
        const catalog = this._extractRemoteBundleCatalog(remoteDoc);
        if (!catalog) return false;

        const source = `firebase:${String(this.BUNDLE_CATALOG_REMOTE_DOC_PATH || '').trim()}`;
        const currentSource = String(this._bundleCatalogMeta?.source || '');
        if (!force && currentSource === 'devlab-editor') {
            return false;
        }

        const identity = this._getBundleCatalogIdentity(catalog);
        if (!force && this._bundleCatalogLoaded && String(this._bundleCatalogMeta?.identity || '') === identity) {
            return false;
        }

        const now = Date.now();
        const applied = this._applyBundleCatalog(catalog, {
            source,
            fetchedAt: now,
            updatedAt: catalog.updatedAt || '',
            version: Number(catalog.version || 1),
            identity,
        });
        this._saveBundleCatalogCache(catalog, {
            source,
            fetchedAt: now,
            updatedAt: applied.updatedAt || catalog.updatedAt || '',
            version: Number(applied.version || catalog.version || 1),
            identity,
        });
        this._refreshShopIfVisible();
        return true;
    },

    _ensureRemoteBundleCatalogSubscription() {
        if (this._bundleCatalogRemoteUnsub) return;
        if (!window.NyanFirebase?.isReady?.()) {
            if (this._bundleCatalogRemoteBindRetries >= 8) return;
            this._bundleCatalogRemoteBindRetries += 1;
            window.setTimeout(() => this._ensureRemoteBundleCatalogSubscription(), 1500);
            return;
        }

        const path = String(this.BUNDLE_CATALOG_REMOTE_DOC_PATH || '').trim();
        if (!path) return;

        this._bundleCatalogRemoteUnsub = window.NyanFirebase.onSnapshot(path, (doc) => {
            this._commitRemoteBundleCatalogSnapshot(doc, { force: false });
        });
    },

    _shouldRunForcedBundleSync(now = Date.now()) {
        const gap = Math.max(5000, Number(this.BUNDLE_CATALOG_FORCE_SYNC_MIN_INTERVAL_MS || 20000));
        const last = Number(this._bundleCatalogLastForceSyncMs || 0);
        if (last > 0 && now - last < gap) return false;
        this._bundleCatalogLastForceSyncMs = now;
        return true;
    },

    _applyBundleCatalog(rawCatalog = {}, meta = {}) {
        const catalog = this._normalizeBundleCatalog(rawCatalog);

        this.BUNDLES = Array.isArray(catalog.bundles) ? catalog.bundles : [];
        this.CUSTOM_BUNDLES = Array.isArray(catalog.customBundles) ? catalog.customBundles : [];
        this.CUSTOM_BUNDLE_MIN_AGE_DAYS = Number(catalog.settings?.customBundleMinAgeDays || this.CUSTOM_BUNDLE_MIN_AGE_DAYS);

        const fetchedAt = Number(meta.fetchedAt);
        const safeFetchedAt = Number.isFinite(fetchedAt) && fetchedAt > 0 ? fetchedAt : Date.now();
        const version = Number(meta.version || catalog.version || 1);
        const safeVersion = Number.isFinite(version) && version > 0 ? Math.floor(version) : 1;
        const identity = String(meta.identity || this._getBundleCatalogIdentity(catalog)).trim();

        this._bundleCatalogLoaded = true;
        this._bundleCatalogLastRefreshMs = safeFetchedAt;
        this._bundleCatalogMeta = {
            source: String(meta.source || this._bundleCatalogMeta?.source || 'embedded'),
            fetchedAt: safeFetchedAt,
            updatedAt: String(meta.updatedAt || catalog.updatedAt || ''),
            version: safeVersion,
            identity: identity || this._bundleCatalogMeta?.identity || '',
        };

        return catalog;
    },

    _loadBundleCatalogCache() {
        const cached = Utils.loadData(this.BUNDLE_CATALOG_CACHE_KEY);
        if (!cached || typeof cached !== 'object') return false;

        const data = cached.data && typeof cached.data === 'object' ? cached.data : null;
        if (!data) return false;

        this._applyBundleCatalog(data, {
            source: cached.source || 'cache',
            fetchedAt: Number(cached.fetchedAt || 0),
            updatedAt: cached.updatedAt || data.updatedAt || '',
            version: Number(cached.version || data.version || 1),
            identity: String(cached.identity || ''),
        });
        return true;
    },

    _saveBundleCatalogCache(rawCatalog = {}, meta = {}) {
        const version = Number(meta.version || rawCatalog.version || 1);
        const safeVersion = Number.isFinite(version) && version > 0 ? Math.floor(version) : 1;
        const identity = String(meta.identity || this._getBundleCatalogIdentity(rawCatalog)).trim();
        Utils.saveData(this.BUNDLE_CATALOG_CACHE_KEY, {
            source: String(meta.source || 'unknown'),
            fetchedAt: Number(meta.fetchedAt || Date.now()),
            updatedAt: String(meta.updatedAt || rawCatalog.updatedAt || ''),
            version: safeVersion,
            identity,
            data: rawCatalog,
        });
    },

    _isBundleCatalogStale(now = Date.now()) {
        if (!this._bundleCatalogLoaded) return true;
        if (String(this._bundleCatalogMeta?.source || '') === 'devlab-editor') return false;
        const age = now - Number(this._bundleCatalogLastRefreshMs || 0);
        return !Number.isFinite(age) || age >= this.BUNDLE_CATALOG_CACHE_TTL_MS;
    },

    _refreshShopIfVisible() {
        if (window.Router?.currentRoute !== 'shop') return;
        if (document.getElementById('shop-main-content')) {
            this._afterAction();
            return;
        }
        window.Router?.render?.();
    },

    async refreshBundleCatalog({ force = false, silent = true, cacheBust = false } = {}) {
        if (this._bundleCatalogLoadPromise) {
            return this._bundleCatalogLoadPromise;
        }

        if (!this._bundleCatalogLoaded) {
            this._loadBundleCatalogCache();
        }

        if (!force && !this._isBundleCatalogStale()) {
            return {
                success: true,
                source: this._bundleCatalogMeta?.source || 'memory',
                skipped: true,
            };
        }

        const run = async () => {
            const errors = [];
            const timeoutMs = Math.max(2000, Number(this.BUNDLE_CATALOG_TIMEOUT_MS || 8000));
            const shouldCacheBust = cacheBust === true || force === true;
            const cacheBustToken = shouldCacheBust ? Date.now().toString(36) : '';

            const applyResult = (data, source, fetchedAt = Date.now()) => {
                const normalizedInput = this._normalizeBundleCatalog(data);
                const nextIdentity = this._getBundleCatalogIdentity(normalizedInput);
                const nextVersion = Number(normalizedInput.version || 1);
                const safeVersion = Number.isFinite(nextVersion) && nextVersion > 0 ? Math.floor(nextVersion) : 1;
                const nextUpdatedAt = String(normalizedInput.updatedAt || data?.updatedAt || '');
                const previousIdentity = String(this._bundleCatalogMeta?.identity || '');
                const changed = !this._bundleCatalogLoaded || !previousIdentity || previousIdentity !== nextIdentity;

                if (changed) {
                    this._applyBundleCatalog(normalizedInput, {
                        source,
                        fetchedAt,
                        updatedAt: nextUpdatedAt,
                        version: safeVersion,
                        identity: nextIdentity,
                    });
                    this._refreshShopIfVisible();
                } else {
                    this._bundleCatalogLoaded = true;
                    this._bundleCatalogLastRefreshMs = fetchedAt;
                    this._bundleCatalogMeta = {
                        ...this._bundleCatalogMeta,
                        source: String(source || this._bundleCatalogMeta?.source || 'memory'),
                        fetchedAt,
                        updatedAt: nextUpdatedAt || String(this._bundleCatalogMeta?.updatedAt || ''),
                        version: safeVersion,
                        identity: nextIdentity,
                    };
                }

                this._saveBundleCatalogCache(normalizedInput, {
                    source,
                    fetchedAt,
                    updatedAt: nextUpdatedAt,
                    version: safeVersion,
                    identity: nextIdentity,
                });
                return { success: true, source, fetchedAt, data: normalizedInput, changed };
            };

            this._ensureRemoteBundleCatalogSubscription();
            try {
                const remote = await this._loadRemoteBundleCatalog();
                if (remote?.data) {
                    return applyResult(remote.data, remote.source || 'firebase', Number(remote.fetchedAt || 0) || Date.now());
                }
            } catch (error) {
                errors.push(`remote: ${String(error?.message || error)}`);
            }

            if (window.electronAPI?.getBundleCatalog) {
                try {
                    const response = await window.electronAPI.getBundleCatalog({
                        urls: this.BUNDLE_CATALOG_URLS,
                        timeoutMs,
                        cacheBust: cacheBustToken,
                    });
                    if (response?.success && response.data) {
                        return applyResult(response.data, response.source || 'ipc', Number(response.fetchedAt || 0) || Date.now());
                    }
                    if (response?.success === false) {
                        errors.push(String(response.error || 'Falha ao carregar catalogo via IPC'));
                    }
                } catch (error) {
                    errors.push(String(error?.message || error));
                }
            }

            for (let index = 0; index < this.BUNDLE_CATALOG_URLS.length; index += 1) {
                const source = this.BUNDLE_CATALOG_URLS[index];
                try {
                    const requestUrl = shouldCacheBust
                        ? this._withCacheBust(source, `${cacheBustToken}-${index}`)
                        : source;
                    const response = await Utils.fetchWithTimeout(
                        requestUrl,
                        {
                            cache: 'no-store',
                            headers: { Accept: 'application/json' },
                        },
                        timeoutMs
                    );
                    if (!response?.ok) {
                        errors.push(`${source}: HTTP ${response?.status || 0}`);
                        continue;
                    }
                    const data = await response.json();
                    return applyResult(data, source, Date.now());
                } catch (error) {
                    errors.push(`${source}: ${String(error?.message || error)}`);
                }
            }

            for (const localPath of ['./bundle-catalog.json', 'bundle-catalog.json']) {
                try {
                    const response = await fetch(localPath, { cache: 'no-store' });
                    if (!response.ok) continue;
                    const data = await response.json();
                    return applyResult(data, `local:${localPath}`, Date.now());
                } catch (_) {}
            }

            if (!this._bundleCatalogLoaded) {
                const now = Date.now();
                const embeddedSnapshot = {
                    version: 1,
                    updatedAt: '',
                    bundles: this.BUNDLES,
                    customBundles: this.CUSTOM_BUNDLES,
                };
                this._bundleCatalogLoaded = true;
                this._bundleCatalogLastRefreshMs = now;
                this._bundleCatalogMeta = {
                    source: 'embedded',
                    fetchedAt: now,
                    updatedAt: '',
                    version: 1,
                    identity: this._getBundleCatalogIdentity(embeddedSnapshot),
                };
            }

            if (!silent) {
                Utils.showNotification?.('Nao foi possivel atualizar os bundles agora.', 'warning');
            }

            return {
                success: false,
                source: this._bundleCatalogMeta?.source || 'embedded',
                errors,
            };
        };

        this._bundleCatalogLoadPromise = run().finally(() => {
            this._bundleCatalogLoadPromise = null;
        });
        return this._bundleCatalogLoadPromise;
    },

    _ensureBundleCatalogRuntime({ force = false, silent = true, cacheBust = false } = {}) {
        if (!this._bundleCatalogLoaded) {
            this._loadBundleCatalogCache();
        }
        if (!force && !this._isBundleCatalogStale()) return;
        this.refreshBundleCatalog({ force, silent, cacheBust }).catch(() => {});
    },

    _bindBundleCatalogSyncListeners() {
        if (this._bundleCatalogSyncListenersBound) return;
        this._bundleCatalogSyncListenersBound = true;

        this._bundleCatalogSyncHandlers = {
            online: () => {
            if (!this._shouldRunForcedBundleSync()) return;
            this._ensureBundleCatalogRuntime({ force: true, silent: true, cacheBust: true });
            },

            focus: () => {
            this._ensureBundleCatalogRuntime({ force: false, silent: true });
            },

            visibility: () => {
            if (document.visibilityState !== 'visible') return;
            this._ensureBundleCatalogRuntime({ force: false, silent: true });
            },
        };

        window.addEventListener('online', this._bundleCatalogSyncHandlers.online);
        window.addEventListener('focus', this._bundleCatalogSyncHandlers.focus);
        document.addEventListener('visibilitychange', this._bundleCatalogSyncHandlers.visibility);
    },

    startBundleCatalogSync({ forceBoot = true, silent = true } = {}) {
        if (!this._bundleCatalogLoaded) {
            this._loadBundleCatalogCache();
        }

        this._ensureRemoteBundleCatalogSubscription();
        this._bindBundleCatalogSyncListeners();

        const usingLocalOverride = String(this._bundleCatalogMeta?.source || '') === 'devlab-editor';
        const shouldForceBoot = forceBoot === true && !usingLocalOverride && this._shouldRunForcedBundleSync();
        this._ensureBundleCatalogRuntime({
            force: shouldForceBoot,
            silent,
            cacheBust: shouldForceBoot,
        });

        if (this._bundleCatalogSyncStarted) return;
        this._bundleCatalogSyncStarted = true;

        const intervalMs = Math.max(30000, Number(this.BUNDLE_CATALOG_BG_SYNC_INTERVAL_MS || 75000));
        this._bundleCatalogSyncTimer = window.setInterval(() => {
            if (document.visibilityState === 'hidden') return;
            this._ensureRemoteBundleCatalogSubscription();
            this._ensureBundleCatalogRuntime({ force: false, silent: true });
        }, intervalMs);
    },

    _getCycleKey(date = new Date()) {
        const d = new Date(date);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    },

    _loadState() {
        if (this._stateLoaded && this._stateCache) return this._stateCache;

        const raw = Utils.loadData(this.STORAGE_KEY);
        const state = raw && typeof raw === 'object'
            ? { ...this._getDefaultState(), ...raw }
            : this._getDefaultState();

        state.tab = ['shop', 'seasonal', 'inventory'].includes(state.tab) ? state.tab : 'shop';
        state.selectedCat = this.CATEGORIES.some((cat) => cat.id === state.selectedCat) ? state.selectedCat : 'title';
        state.dailyCycle = state.dailyCycle && typeof state.dailyCycle === 'object'
            ? { key: String(state.dailyCycle.key || ''), categories: state.dailyCycle.categories || {} }
            : { key: '', categories: {} };

        this._stateLoaded = true;
        this._stateCache = state;
        return state;
    },

    _saveState() {
        const state = this._stateCache || this._getDefaultState();
        Utils.saveData(this.STORAGE_KEY, state);
    },

    _ensureState() {
        const state = this._loadState();
        let changed = false;
        const cycleKey = this._getCycleKey();

        if (state.dailyCycle.key !== cycleKey) {
            state.dailyCycle = { key: cycleKey, categories: {} };
            changed = true;
        }

        this.CATEGORIES.forEach((cat) => {
            const currentIds = Array.isArray(state.dailyCycle.categories?.[cat.id])
                ? state.dailyCycle.categories[cat.id]
                : [];
            const validIds = currentIds.filter((id) => !!Inventory.getItem(id));

            if (validIds.length >= this.DAILY_PER_CAT) {
                state.dailyCycle.categories[cat.id] = validIds.slice(0, this.DAILY_PER_CAT);
                return;
            }

            state.dailyCycle.categories[cat.id] = this._buildDailyRotationIds(cat.id);
            changed = true;
        });

        if (changed) this._saveState();

        this._tab = state.tab;
        this._selectedCat = state.selectedCat;
        return state;
    },

    _buildDailyRotationIds(catId) {
        const seed = this._getDaySeed();
        const catSeed = seed ^ catId.split('').reduce((a, c) => a ^ c.charCodeAt(0), 0);
        const playerLevel = window.Economy?.getLevel?.() || 1;

        let pool = Inventory.getByType(catId).filter((i) =>
            !i.milestone &&
            !i.exclusive &&
            !i.eventOnly &&
            (i.minLevel - playerLevel) <= this.DAILY_MAX_GAP
        );

        if (pool.length < this.DAILY_PER_CAT) {
            pool = Inventory.getByType(catId).filter((i) => !i.milestone && !i.exclusive && !i.eventOnly);
        }
        if (pool.length < this.DAILY_PER_CAT) {
            pool = Inventory.getByType(catId).filter((i) => !i.exclusive && !i.eventOnly);
        }

        return this._seededShuffle(pool, catSeed)
            .slice(0, this.DAILY_PER_CAT)
            .map((item) => item.id);
    },

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

    getDailyForCat(catId) {
        const state = this._ensureState();
        const ids = Array.isArray(state.dailyCycle?.categories?.[catId])
            ? state.dailyCycle.categories[catId]
            : [];
        const items = ids
            .map((id) => Inventory.getItem(id))
            .filter(Boolean)
            .slice(0, this.DAILY_PER_CAT);

        if (items[0]) items[0] = { ...items[0], isDailyExclusive: true };
        return items;
    },

    _parseDateMs(value) {
        const ms = Date.parse(String(value || '').trim());
        return Number.isFinite(ms) ? ms : NaN;
    },

    _getBundleLaunchMs(bundle = {}) {
        const launchedAt = this._parseDateMs(bundle.launchedAt);
        if (Number.isFinite(launchedAt)) return launchedAt;
        const startsAt = this._parseDateMs(bundle.startsAt);
        if (Number.isFinite(startsAt)) return startsAt;
        return NaN;
    },

    _isBundleActive(bundle = {}, now = Date.now()) {
        const status = String(bundle.status || '').trim().toLowerCase();
        if (bundle.enabled === false || bundle.active === false) return false;
        if (status && !['active', 'published', 'live'].includes(status)) return false;

        const startsAt = this._parseDateMs(bundle.startsAt);
        if (Number.isFinite(startsAt) && now < startsAt) return false;

        const endsAt = this._parseDateMs(bundle.endsAt);
        if (Number.isFinite(endsAt) && now > endsAt) return false;

        if (bundle.rerunAllowed === false) {
            const launchMs = this._getBundleLaunchMs(bundle);
            if (Number.isFinite(launchMs) && Number.isFinite(startsAt) && startsAt > launchMs + 60000) {
                return false;
            }
        }

        return true;
    },

    _resolveCustomBundleItemIds(bundle = {}, now = Date.now()) {
        const itemIds = Array.isArray(bundle.items) ? [...bundle.items] : [];
        if (bundle.kind !== 'custom') return [...new Set(itemIds)];

        const minAgeDays = Number(bundle.minSourceAgeDays);
        const sourceAgeDays = Number.isFinite(minAgeDays) && minAgeDays > 0
            ? minAgeDays
            : this.CUSTOM_BUNDLE_MIN_AGE_DAYS;
        const cutoffMs = now - (sourceAgeDays * 86400000);

        const sourceIds = Array.isArray(bundle.sourceBundleIds)
            ? new Set(bundle.sourceBundleIds.map((id) => String(id || '').trim()).filter(Boolean))
            : null;

        const includePool = Array.isArray(this.BUNDLES) ? this.BUNDLES : [];
        includePool.forEach((sourceBundle) => {
            if (!sourceBundle || sourceBundle.id === bundle.id) return;
            if (sourceBundle.allowInCustomPool === false) return;
            if (sourceIds && sourceIds.size && !sourceIds.has(sourceBundle.id)) return;

            const launchedAt = this._getBundleLaunchMs(sourceBundle);
            if (!Number.isFinite(launchedAt) || launchedAt > cutoffMs) return;

            const sourceItems = Array.isArray(sourceBundle.items) ? sourceBundle.items : [];
            sourceItems.forEach((itemId) => itemIds.push(itemId));
        });

        return [...new Set(itemIds)];
    },

    _getBundleData(bundle = {}, now = Date.now()) {
        if (!bundle || typeof bundle !== 'object') return null;
        if (!this._isBundleActive(bundle, now)) return null;

        const itemIds = this._resolveCustomBundleItemIds(bundle, now);
        const items = itemIds
            .map((id) => Inventory.getItem(id))
            .filter(Boolean);
        if (!items.length) return null;

        const endsAt = this._parseDateMs(bundle.endsAt);
        return {
            ...bundle,
            endsAtMs: Number.isFinite(endsAt) ? endsAt : NaN,
            items,
        };
    },

    _getVisibleBundles() {
        const now = Date.now();
        const bundles = [
            ...(Array.isArray(this.BUNDLES) ? this.BUNDLES : []),
            ...(Array.isArray(this.CUSTOM_BUNDLES) ? this.CUSTOM_BUNDLES : []),
        ];

        return bundles
            .map((bundle) => this._getBundleData(bundle, now))
            .filter(Boolean)
            .sort((left, right) => {
                const leftPriority = Number(left?.priority || 0);
                const rightPriority = Number(right?.priority || 0);
                if (leftPriority !== rightPriority) return rightPriority - leftPriority;

                const leftStart = this._parseDateMs(left?.startsAt || left?.launchedAt);
                const rightStart = this._parseDateMs(right?.startsAt || right?.launchedAt);
                const safeLeft = Number.isFinite(leftStart) ? leftStart : 0;
                const safeRight = Number.isFinite(rightStart) ? rightStart : 0;
                return safeRight - safeLeft;
            });
    },

    _getBundleById(bundleId) {
        const safeId = String(bundleId || '').trim();
        if (!safeId) return null;
        const allBundles = [
            ...(Array.isArray(this.BUNDLES) ? this.BUNDLES : []),
            ...(Array.isArray(this.CUSTOM_BUNDLES) ? this.CUSTOM_BUNDLES : []),
        ];
        return allBundles.find((bundle) => bundle?.id === safeId) || null;
    },

    _getBundleItemLockReason(item) {
        if (!item) return 'Item indisponivel.';
        if (item.milestone) return 'O bundle possui item de marco de nivel.';
        if (item.rewardOnly) return 'O bundle possui item exclusivo de recompensa.';

        if (item.endsAt) {
            const endsAt = Date.parse(item.endsAt);
            if (Number.isFinite(endsAt) && Date.now() > endsAt) {
                return 'Um item do bundle expirou.';
            }
        }

        if (item.seasonId) {
            const season = window.Seasons?.getCurrentSeason?.();
            const active = window.Seasons?.isActive?.(season);
            if (!season || season.id !== item.seasonId || !active) {
                return 'Um item do bundle depende de temporada ativa.';
            }
        }

        const currentLevel = window.Economy?.getLevel?.() || 1;
        if (currentLevel < Number(item.minLevel || 1)) {
            return `Nivel ${item.minLevel} necessario para concluir o bundle.`;
        }

        return '';
    },

    _getBundlePurchaseState(bundle) {
        const items = Array.isArray(bundle?.items) ? bundle.items.filter(Boolean) : [];
        const pendingItems = items.filter((item) => !Inventory.owns(item.id));
        const lockReason = pendingItems
            .map((item) => this._getBundleItemLockReason(item))
            .find((reason) => !!reason) || '';

        const rawTotal = pendingItems.reduce((sum, item) => sum + Math.max(0, Number(item.price || 0)), 0);
        const discountPct = Math.min(95, Math.max(0, Number(bundle?.bundleDiscountPct || 0)));
        const finalPrice = Math.max(0, Math.round(rawTotal * (1 - discountPct / 100)));
        const chips = window.Economy?.getChips?.() || 0;
        const canAfford = chips >= finalPrice;

        return {
            totalItems: items.length,
            ownedItems: items.length - pendingItems.length,
            pendingItems,
            pendingCount: pendingItems.length,
            lockReason,
            rawTotal,
            discountPct,
            finalPrice,
            chips,
            canAfford,
        };
    },

    _renderBundlePanel(bundle) {
        const c = this._c();
        const d = this._isDark();
        const purchase = this._getBundlePurchaseState(bundle);
        const remaining = Number.isFinite(bundle.endsAtMs)
            ? Math.max(0, bundle.endsAtMs - Date.now())
            : NaN;
        const h = Number.isFinite(remaining) ? Math.floor(remaining / 3600000) : 0;
        const m = Number.isFinite(remaining) ? Math.floor((remaining % 3600000) / 60000) : 0;
        const countdown = h > 0 ? `${h}h ${m}min` : `${m}min`;
        const topLabel = bundle.historical
            ? 'Bundle historico'
            : bundle.kind === 'custom'
                ? 'Bundle personalizado'
                : 'Bundle exclusivo';
        const marker = bundle.kind === 'custom' ? '\u{1F9E9}' : '\u{1F389}';

        const panelBg = bundle.kind === 'custom'
            ? 'linear-gradient(135deg, rgba(14,165,233,0.14), rgba(59,130,246,0.18) 48%, rgba(16,185,129,0.18))'
            : 'linear-gradient(135deg, rgba(16,185,129,0.14), rgba(168,85,247,0.18) 48%, rgba(236,72,153,0.2))';
        const panelBorder = bundle.kind === 'custom'
            ? (d ? 'rgba(125,211,252,0.25)' : 'rgba(56,189,248,0.35)')
            : (d ? 'rgba(255,255,255,0.12)' : 'rgba(168,85,247,0.22)');

        let actionText = `Comprar bundle - ${purchase.finalPrice.toLocaleString('pt-BR')} chips`;
        let actionStyle = 'background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));color:white;border:none;';
        let actionDisabled = false;
        let actionClick = `Shop._buyBundle('${bundle.id}')`;

        if (purchase.pendingCount === 0) {
            actionText = 'Bundle completo';
            actionStyle = `background:${c.inner};color:${c.muted};border:1px solid ${c.border};`;
            actionDisabled = true;
            actionClick = '';
        } else if (purchase.lockReason) {
            actionText = 'Bundle indisponivel';
            actionStyle = `background:${c.inner};color:${c.muted};border:1px solid ${c.border};`;
            actionDisabled = true;
            actionClick = '';
        } else if (!purchase.canAfford) {
            actionText = `Faltam ${(purchase.finalPrice - purchase.chips).toLocaleString('pt-BR')} chips`;
            actionStyle = `background:rgba(239,68,68,0.12);color:${d ? '#f87171' : '#be123c'};border:1px solid rgba(239,68,68,0.25);`;
            actionDisabled = true;
            actionClick = '';
        }

        return `
            <div style="margin-bottom:1rem;border-radius:16px;padding:1rem;
                background:${panelBg};
                border:1px solid ${panelBorder};">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:0.75rem;flex-wrap:wrap;margin-bottom:0.75rem;">
                    <div>
                        <div style="font-size:0.66rem;font-weight:800;letter-spacing:0.09em;text-transform:uppercase;color:${c.muted};">${topLabel}</div>
                        <div style="font-size:1.05rem;font-weight:900;font-family:'Syne',sans-serif;color:${c.text};">${marker} ${bundle.title || 'Bundle'}</div>
                        <div style="font-size:0.74rem;color:${c.sub};margin-top:0.2rem;">${bundle.subtitle || 'Itens exclusivos por tempo limitado'}</div>
                    </div>
                    ${Number.isFinite(bundle.endsAtMs) ? `
                        <div style="font-size:0.64rem;font-weight:800;color:${d ? '#fcd34d' : '#92400e'};
                            background:${d ? 'rgba(245,158,11,0.14)' : 'rgba(245,158,11,0.12)'};
                            border:1px solid ${d ? 'rgba(245,158,11,0.28)' : 'rgba(245,158,11,0.3)'};
                            border-radius:999px;padding:0.3rem 0.65rem;white-space:nowrap;">
                            \u23F1 ${countdown}
                        </div>
                    ` : `
                        <div style="font-size:0.64rem;font-weight:800;color:${d ? '#86efac' : '#047857'};
                            background:${d ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.1)'};
                            border:1px solid ${d ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.28)'};
                            border-radius:999px;padding:0.3rem 0.65rem;white-space:nowrap;">
                            Colecao fixa
                        </div>
                    `}
                </div>

                <div style="margin-bottom:0.85rem;border-radius:12px;padding:0.75rem;
                    background:${d ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.72)'};
                    border:1px solid ${d ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.08)'};">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;flex-wrap:wrap;">
                        <div style="font-size:0.68rem;color:${c.sub};">
                            ${purchase.ownedItems}/${purchase.totalItems} itens no inventario
                        </div>
                        <div style="display:flex;align-items:center;gap:0.45rem;flex-wrap:wrap;">
                            ${purchase.discountPct > 0 ? `<span style="font-size:0.58rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;border-radius:999px;padding:0.2rem 0.5rem;color:${d ? '#6ee7b7' : '#065f46'};background:${d ? 'rgba(16,185,129,0.18)' : 'rgba(16,185,129,0.12)'};border:1px solid ${d ? 'rgba(16,185,129,0.35)' : 'rgba(16,185,129,0.28)'};">-${purchase.discountPct}%</span>` : ''}
                            <span style="font-size:0.72rem;font-weight:900;font-family:'Syne',sans-serif;color:${d ? '#fcd34d' : '#92400e'};">
                                ${purchase.finalPrice.toLocaleString('pt-BR')} chips
                            </span>
                        </div>
                    </div>
                    ${purchase.lockReason ? `<div style="margin-top:0.45rem;font-size:0.62rem;color:${d ? '#fca5a5' : '#991b1b'};">${purchase.lockReason}</div>` : ''}
                    <button ${actionDisabled ? 'disabled' : ''} onclick="${actionClick}"
                        style="margin-top:0.6rem;width:100%;padding:0.48rem 0.6rem;border-radius:10px;
                        font-size:0.72rem;font-weight:800;font-family:'DM Sans',sans-serif;
                        cursor:${actionDisabled ? 'not-allowed' : 'pointer'};opacity:${actionDisabled ? '0.62' : '1'};
                        transition:filter .12s,transform .08s;${actionStyle}"
                        onmouseover="if(!this.disabled)this.style.filter='brightness(1.08)'"
                        onmouseout="this.style.filter=''"
                        onmousedown="if(!this.disabled)this.style.transform='scale(0.98)'"
                        onmouseup="this.style.transform=''">
                        ${actionText}
                    </button>
                </div>

                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:0.75rem;">
                    ${bundle.items.map((item, i) => this._renderCard(item, i)).join('')}
                </div>
            </div>
        `;
    },

    _buyBundle(bundleId) {
        const source = this._getBundleById(bundleId);
        if (!source) {
            Utils.showNotification?.('Bundle nao encontrado.', 'warning');
            return;
        }

        const bundle = this._getBundleData(source, Date.now());
        if (!bundle) {
            Utils.showNotification?.('Este bundle nao esta ativo.', 'warning');
            return;
        }

        const state = this._getBundlePurchaseState(bundle);
        if (state.pendingCount === 0) {
            Utils.showNotification?.('Voce ja concluiu este bundle.', 'info');
            return;
        }
        if (state.lockReason) {
            Utils.showNotification?.(state.lockReason, 'warning');
            return;
        }
        if (!state.canAfford) {
            Utils.showNotification?.(`Chips insuficientes (${state.finalPrice.toLocaleString('pt-BR')} necessarios).`, 'warning');
            return;
        }

        const d = this._isDark();
        const itemList = state.pendingItems
            .map((item) => `<li style="margin-bottom:0.2rem;">${item.icon} ${item.name}</li>`)
            .join('');
        const body = `
            <div style="font-size:0.74rem;color:${d ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)'};margin-bottom:0.7rem;text-align:center;">
                Voce vai desbloquear <strong>${state.pendingCount}</strong> item${state.pendingCount > 1 ? 's' : ''} do bundle.
            </div>
            <ul style="margin:0 0 0.8rem 1rem;padding:0;font-size:0.72rem;color:${d ? 'rgba(255,255,255,0.82)' : '#0f172a'};">
                ${itemList}
            </ul>
            <div style="background:${d ? 'rgba(255,255,255,0.05)' : '#f8fafc'};
                border:1px solid ${d ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'};
                border-radius:10px;padding:0.6rem 0.75rem;font-size:0.74rem;">
                <div style="display:flex;justify-content:space-between;margin-bottom:0.25rem;">
                    <span style="opacity:0.7;">Total itens</span>
                    <strong>${state.rawTotal.toLocaleString('pt-BR')} chips</strong>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:0.25rem;">
                    <span style="opacity:0.7;">Desconto bundle</span>
                    <strong>${state.discountPct}%</strong>
                </div>
                <div style="display:flex;justify-content:space-between;">
                    <span style="opacity:0.7;">Final</span>
                    <strong style="color:${d ? '#fcd34d' : '#92400e'};">${state.finalPrice.toLocaleString('pt-BR')} chips</strong>
                </div>
            </div>
        `;

        this._showModal({
            title: 'Confirmar bundle',
            body,
            confirmText: 'Comprar bundle',
            confirmColor: 'linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899))',
            onConfirm: () => {
                const liveSource = this._getBundleById(source.id) || source;
                const liveBundle = this._getBundleData(liveSource, Date.now());
                if (!liveBundle) {
                    Utils.showNotification?.('Bundle indisponivel no momento da compra.', 'warning');
                    return;
                }
                const liveState = this._getBundlePurchaseState(liveBundle);
                if (liveState.pendingCount === 0) {
                    Utils.showNotification?.('Voce ja concluiu este bundle.', 'info');
                    return;
                }
                if (liveState.lockReason) {
                    Utils.showNotification?.(liveState.lockReason, 'warning');
                    return;
                }
                if (!liveState.canAfford) {
                    Utils.showNotification?.(`Chips insuficientes (${liveState.finalPrice.toLocaleString('pt-BR')} necessarios).`, 'warning');
                    return;
                }

                const spent = window.Economy?.spendChips?.(liveState.finalPrice);
                if (!spent) {
                    Utils.showNotification?.('Falha ao debitar chips.', 'error');
                    return;
                }

                liveState.pendingItems.forEach((item) => {
                    Inventory.unlockItem(item.id);
                });

                Utils.showNotification?.(`\u{1F6CD}\uFE0F Bundle adquirido: ${liveBundle.title}`, 'success');
                this._afterAction();
            },
        });
    },

    _getSeasonalEventData() {
        const season = window.Seasons?.getCurrentSeason?.();
        if (!season || !window.Seasons?.isActive?.(season)) return null;

        const now = Date.now();
        const items = Inventory.CATALOG.filter((item) => {
            if (!item || item.seasonId !== season.id) return false;
            if (item.endsAt) {
                const endsAt = Date.parse(item.endsAt);
                if (Number.isFinite(endsAt) && now > endsAt) return false;
            }
            return true;
        });

        if (!items.length) return null;
        return { season, items };
    },

    _renderSeasonalEvent() {
        const data = this._getSeasonalEventData();
        if (!data) return '';

        const c = this._c();
        const d = this._isDark();
        const remaining = Math.max(0, Number(data.season.endDate || 0) - Date.now());
        const days = Math.floor(remaining / 86400000);
        const hours = Math.floor((remaining % 86400000) / 3600000);
        const countdown = days > 0 ? `${days}d ${hours}h` : `${hours}h`;

        return `
            <div style="margin-bottom:1rem;border-radius:16px;padding:1rem;
                background:linear-gradient(135deg, rgba(251,113,133,0.16), rgba(249,115,22,0.18) 52%, rgba(236,72,153,0.2));
                border:1px solid ${d ? 'rgba(255,255,255,0.12)' : 'rgba(251,113,133,0.25)'};">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:0.75rem;flex-wrap:wrap;margin-bottom:0.75rem;">
                    <div>
                        <div style="font-size:0.66rem;font-weight:800;letter-spacing:0.09em;text-transform:uppercase;color:${c.muted};">Loja sazonal</div>
                        <div style="font-size:1.05rem;font-weight:900;font-family:'Syne',sans-serif;color:${c.text};">${data.season.icon} ${data.season.name}</div>
                        <div style="font-size:0.74rem;color:${c.sub};margin-top:0.2rem;">Itens exclusivos desta temporada</div>
                    </div>
                    <div style="font-size:0.64rem;font-weight:800;color:${d ? '#fdba74' : '#9a3412'};
                        background:${d ? 'rgba(249,115,22,0.14)' : 'rgba(249,115,22,0.12)'};
                        border:1px solid ${d ? 'rgba(249,115,22,0.3)' : 'rgba(249,115,22,0.35)'};
                        border-radius:999px;padding:0.3rem 0.65rem;white-space:nowrap;">
                        ⏳ ${countdown}
                    </div>
                </div>

                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:0.75rem;">
                    ${data.items.map((item, i) => this._renderCard(item, i)).join('')}
                </div>
            </div>
        `;
    },

    _renderEventPanels() {
        const bundles = this._getVisibleBundles();
        if (!bundles.length) return '';
        return bundles.map((bundle) => this._renderBundlePanel(bundle)).join('');
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
        this._ensureState();
        this._ensureBundleCatalogRuntime({ silent: true });
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

            <div style="display:flex;align-items:flex-start;justify-content:space-between;
                flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem;">
                <div>
                    <h1 style="font-family:'Syne',sans-serif;font-size:1.75rem;font-weight:900;margin:0 0 0.15rem;
                        background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));
                        -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
                        \u{1F6CD}\uFE0F Loja
                    </h1>
                    <p style="font-size:0.72rem;color:${c.muted};margin:0;">
                        Rotacao diaria - renova em <strong style="color:${c.sub};">${this._getDailyReset()}</strong>
                    </p>
                </div>

                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.5rem;min-width:180px;">
                    <div style="display:flex;gap:0.5rem;">
                        <div style="display:flex;align-items:center;gap:0.5rem;background:${c.inner};
                            border:1px solid ${c.border};border-radius:12px;padding:0.45rem 0.875rem;">
                            <span style="font-size:1rem;opacity:0.8;">\u2B21</span>
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
                            <span style="font-size:1rem;opacity:0.8;">\u26A1</span>
                            <div>
                                <div style="font-size:0.52rem;font-weight:800;text-transform:uppercase;
                                    letter-spacing:0.1em;color:${c.muted};line-height:1;">Nivel</div>
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

            <div id="shop-event-content">
                ${this._tab === 'shop' ? this._renderEventPanels() : ''}
            </div>

            <div style="display:flex;gap:0.25rem;background:${c.inner};border:1px solid ${c.border};
                border-radius:14px;padding:0.3rem;margin-bottom:1.25rem;">
                <button class="shop-tab-btn" onclick="Shop._setTab('shop')" id="shop-tab-shop"
                    style="flex:1;padding:0.5rem;border-radius:10px;cursor:pointer;
                    font-size:0.78rem;font-weight:700;font-family:'DM Sans',sans-serif;
                    background:${this._tab==='shop'?(d?'rgba(255,255,255,0.06)':'#fff'):'transparent'};
                    color:${this._tab==='shop'?'var(--theme-primary,#a855f7)':c.muted};
                    border:1px solid ${this._tab==='shop'?'rgba(168,85,247,0.2)':'transparent'};">
                    \u{1F6CD}\uFE0F Loja do Dia
                </button>
                <button class="shop-tab-btn" onclick="Shop._setTab('seasonal')" id="shop-tab-seasonal"
                    style="flex:1;padding:0.5rem;border-radius:10px;cursor:pointer;
                    font-size:0.78rem;font-weight:700;font-family:'DM Sans',sans-serif;
                    background:${this._tab==='seasonal'?(d?'rgba(255,255,255,0.06)':'#fff'):'transparent'};
                    color:${this._tab==='seasonal'?'var(--theme-primary,#a855f7)':c.muted};
                    border:1px solid ${this._tab==='seasonal'?'rgba(168,85,247,0.2)':'transparent'};">
                    \u{1F338} Temporada
                </button>
                <button class="shop-tab-btn" onclick="Shop._setTab('inventory')" id="shop-tab-inventory"
                    style="flex:1;padding:0.5rem;border-radius:10px;cursor:pointer;
                    font-size:0.78rem;font-weight:700;font-family:'DM Sans',sans-serif;
                    background:${this._tab==='inventory'?(d?'rgba(255,255,255,0.06)':'#fff'):'transparent'};
                    color:${this._tab==='inventory'?'var(--theme-primary,#a855f7)':c.muted};
                    border:1px solid ${this._tab==='inventory'?'rgba(168,85,247,0.2)':'transparent'};">
                    \u{1F392} Meu Inventario
                </button>
            </div>

            <div id="shop-main-content">
                ${this._tab === 'shop'
                    ? this._renderShopTab()
                    : this._tab === 'seasonal'
                        ? this._renderSeasonalTab()
                        : this._renderInventoryTab()}
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

            <div id="shop-cat-sidebar" style="width:140px;flex-shrink:0;">
                ${this._renderCatSidebar()}
            </div>

            <div style="flex:1;min-width:0;" id="shop-items-panel">
                ${this._renderCatItems(items, cat)}
            </div>
        </div>`;
    },

    _renderSeasonalTab() {
        const c = this._c();
        const d = this._isDark();
        const data = this._getSeasonalEventData();

        if (!data) {
            return `<div style="border:1px solid ${c.border};background:${c.bg};border-radius:18px;padding:3rem 1rem;text-align:center;">
                <div style="font-size:2.4rem;margin-bottom:0.65rem;opacity:0.45;">\u{1F338}</div>
                <div style="font-size:0.92rem;font-weight:800;color:${c.sub};font-family:'Syne',sans-serif;">Sem loja sazonal ativa</div>
                <p style="font-size:0.74rem;margin-top:0.35rem;color:${c.muted};">Novidades de temporada vao aparecer aqui.</p>
            </div>`;
        }

        const remaining = Math.max(0, Number(data.season.endDate || 0) - Date.now());
        const days = Math.floor(remaining / 86400000);
        const hours = Math.floor((remaining % 86400000) / 3600000);
        const countdown = days > 0 ? `${days}d ${hours}h` : `${hours}h`;
        const seasonProgress = window.Seasons?.getProgress?.();
        const totalItems = data.items.length;
        const activeCategories = this.CATEGORIES.filter(cat => data.items.some(item => item.type === cat.id)).length;

        const sections = this.CATEGORIES.map(cat => {
            const catItems = data.items.filter(item => item.type === cat.id);
            if (!catItems.length) return '';

            return `
                <section class="shop-season-group">
                    <div class="shop-season-group-head">
                        <div class="shop-season-group-title">${cat.icon} ${cat.label}</div>
                        <div class="shop-season-group-count">${catItems.length} item${catItems.length > 1 ? 's' : ''}</div>
                    </div>
                    <div class="shop-season-grid">
                        ${catItems.map((item, i) => this._renderCard(item, i)).join('')}
                    </div>
                </section>
            `;
        }).join('');

        return `
            <style>
                .shop-season-shell {
                    position: relative;
                    border-radius: 22px;
                    border: 1px solid var(--ss-border-strong);
                    background: var(--ss-bg);
                    box-shadow: 0 14px 36px rgba(15, 23, 42, 0.18);
                    padding: 1rem;
                    overflow: hidden;
                    color: var(--ss-text);
                }
                .shop-season-shell::before,
                .shop-season-shell::after {
                    content: '';
                    position: absolute;
                    pointer-events: none;
                    border-radius: 999px;
                    filter: blur(3px);
                }
                .shop-season-shell::before {
                    width: 220px;
                    height: 220px;
                    top: -120px;
                    right: -72px;
                    background: radial-gradient(circle at center, var(--ss-glow-a), transparent 70%);
                }
                .shop-season-shell::after {
                    width: 240px;
                    height: 240px;
                    bottom: -150px;
                    left: -80px;
                    background: radial-gradient(circle at center, var(--ss-glow-b), transparent 70%);
                }
                .shop-season-hero {
                    position: relative;
                    z-index: 1;
                    display: grid;
                    grid-template-columns: auto 1fr auto;
                    align-items: center;
                    gap: 0.8rem;
                    margin-bottom: 0.9rem;
                }
                .shop-season-icon {
                    width: 62px;
                    height: 62px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.9rem;
                    border: 1px solid var(--ss-border-strong);
                    background: linear-gradient(145deg, rgba(251,113,133,0.2), rgba(249,115,22,0.2));
                    box-shadow: 0 10px 24px rgba(251,113,133,0.2);
                }
                .shop-season-badge {
                    display: inline-flex;
                    align-items: center;
                    font-size: 0.61rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: #fff;
                    padding: 0.24rem 0.6rem;
                    border-radius: 999px;
                    background: linear-gradient(120deg, rgba(251,113,133,0.9), rgba(249,115,22,0.88));
                    border: 1px solid rgba(255,255,255,0.26);
                }
                .shop-season-title {
                    margin: 0.4rem 0 0.14rem;
                    font-size: 1.48rem;
                    line-height: 1.08;
                    font-weight: 900;
                    font-family: 'Syne', sans-serif;
                    background: linear-gradient(132deg, #fb7185 0%, #f97316 55%, #f59e0b 100%);
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .shop-season-subtitle {
                    margin: 0;
                    font-size: 0.74rem;
                    color: var(--ss-sub);
                }
                .shop-season-countdown {
                    border-radius: 12px;
                    border: 1px solid var(--ss-border);
                    padding: 0.46rem 0.62rem;
                    background: var(--ss-panel);
                    text-align: right;
                    min-width: 106px;
                }
                .shop-season-countdown small {
                    display: block;
                    font-size: 0.58rem;
                    font-weight: 800;
                    letter-spacing: 0.07em;
                    text-transform: uppercase;
                    color: var(--ss-muted);
                    margin-bottom: 0.2rem;
                }
                .shop-season-countdown strong {
                    display: block;
                    font-family: 'Syne', sans-serif;
                    font-size: 0.94rem;
                    color: #f97316;
                }
                .shop-season-metrics {
                    position: relative;
                    z-index: 1;
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 0.58rem;
                    margin-bottom: 0.9rem;
                }
                .shop-season-metric {
                    border-radius: 13px;
                    border: 1px solid var(--ss-border);
                    background: var(--ss-panel);
                    padding: 0.65rem;
                }
                .shop-season-metric-label {
                    font-size: 0.6rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.07em;
                    color: var(--ss-muted);
                }
                .shop-season-metric-value {
                    margin-top: 0.22rem;
                    font-size: 0.98rem;
                    font-weight: 900;
                    font-family: 'Syne', sans-serif;
                    color: var(--ss-text);
                }
                .shop-season-groups {
                    position: relative;
                    z-index: 1;
                    display: grid;
                    gap: 0.85rem;
                }
                .shop-season-group {
                    border-radius: 16px;
                    border: 1px solid var(--ss-border);
                    background: var(--ss-panel);
                    padding: 0.78rem;
                }
                .shop-season-group-head {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 0.5rem;
                    margin-bottom: 0.65rem;
                }
                .shop-season-group-title {
                    font-size: 0.78rem;
                    font-weight: 800;
                    letter-spacing: 0.04em;
                    text-transform: uppercase;
                    color: var(--ss-text);
                }
                .shop-season-group-count {
                    font-size: 0.61rem;
                    font-weight: 800;
                    color: var(--ss-sub);
                    background: rgba(168,85,247,0.12);
                    border: 1px solid rgba(168,85,247,0.26);
                    border-radius: 999px;
                    padding: 0.18rem 0.52rem;
                    white-space: nowrap;
                }
                .shop-season-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(205px, 1fr));
                    gap: 0.68rem;
                }
                .shop-season-empty {
                    text-align: center;
                    padding: 2.2rem 1rem;
                    border-radius: 16px;
                    border: 1px dashed var(--ss-border);
                    color: var(--ss-muted);
                    font-size: 0.76rem;
                    background: var(--ss-panel);
                }
                @media (max-width: 760px) {
                    .shop-season-shell {
                        padding: 0.85rem;
                        border-radius: 18px;
                    }
                    .shop-season-hero {
                        grid-template-columns: 1fr;
                        gap: 0.62rem;
                    }
                    .shop-season-countdown {
                        text-align: left;
                        min-width: 0;
                        width: 100%;
                    }
                    .shop-season-title {
                        font-size: 1.28rem;
                    }
                    .shop-season-metrics {
                        grid-template-columns: 1fr;
                    }
                    .shop-season-grid {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
            <div class="shop-season-shell" style="
                --ss-bg:${d ? 'rgba(10,14,23,0.86)' : '#ffffff'};
                --ss-panel:${d ? 'rgba(255,255,255,0.035)' : 'rgba(248,250,252,0.9)'};
                --ss-border:${d ? 'rgba(255,255,255,0.09)' : 'rgba(15,23,42,0.08)'};
                --ss-border-strong:${d ? 'rgba(255,255,255,0.18)' : 'rgba(15,23,42,0.14)'};
                --ss-text:${c.text};
                --ss-sub:${c.sub};
                --ss-muted:${c.muted};
                --ss-glow-a:${d ? 'rgba(251,113,133,0.24)' : 'rgba(251,113,133,0.2)'};
                --ss-glow-b:${d ? 'rgba(249,115,22,0.22)' : 'rgba(249,115,22,0.18)'};
            ">
                <header class="shop-season-hero">
                    <div class="shop-season-icon">${data.season.icon || '\u{1F338}'}</div>
                    <div>
                        <div class="shop-season-badge">Temporada ativa</div>
                        <h2 class="shop-season-title">${data.season.name}</h2>
                        <p class="shop-season-subtitle">Itens exclusivos disponiveis ate o fim da temporada.</p>
                    </div>
                    <div class="shop-season-countdown">
                        <small>Tempo restante</small>
                        <strong>\u23F3 ${countdown}</strong>
                    </div>
                </header>

                <div class="shop-season-metrics">
                    <div class="shop-season-metric">
                        <div class="shop-season-metric-label">Itens sazonais</div>
                        <div class="shop-season-metric-value">${totalItems}</div>
                    </div>
                    <div class="shop-season-metric">
                        <div class="shop-season-metric-label">Categorias ativas</div>
                        <div class="shop-season-metric-value">${activeCategories}</div>
                    </div>
                    <div class="shop-season-metric">
                        <div class="shop-season-metric-label">Seu tier</div>
                        <div class="shop-season-metric-value">${seasonProgress?.currentTier?.label || 'Bronze'}</div>
                    </div>
                </div>

                <div class="shop-season-groups">
                    ${sections || `<div class="shop-season-empty">Nenhum item sazonal cadastrado para esta temporada.</div>`}
                </div>
            </div>
        `;
    },

    _renderCatItems(items, cat) {
        const c = this._c();
        const d = this._isDark();

        if (items.length === 0) {
            return `<div style="text-align:center;padding:3rem 1rem;color:${c.muted};">
                <div style="font-size:2.5rem;margin-bottom:0.5rem;opacity:0.35;">${cat.icon}</div>
                <div style="font-size:0.88rem;font-weight:700;color:${c.sub};">Nenhum item hoje</div>
                <p style="font-size:0.72rem;margin-top:0.25rem;">Volte amanha nyan~</p>
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
                \u23F1 ${this._getDailyReset()}
            </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:0.75rem;">
            ${items.slice(0, this.MAX_RENDERED_SHOP_ITEMS).map((item, i) => this._renderCard(item, i)).join('')}
        </div>`;
    },

    _renderInventoryTab() {
        const c     = this._c();
        const d     = this._isDark();
        const owned = Inventory.getOwned();

        if (owned.length === 0) {
            return `<div style="text-align:center;padding:3rem 1rem;color:${c.muted};">
                <div style="font-size:2.5rem;margin-bottom:0.75rem;opacity:0.35;">\u{1F392}</div>
                <div style="font-size:0.88rem;font-weight:700;color:${c.sub};margin-bottom:0.3rem;">Inventario vazio</div>
                <p style="font-size:0.72rem;margin:0;">Compre itens na loja do dia!</p>
            </div>`;
        }

        return this.CATEGORIES.map(cat => {
            const catItems = owned.filter(i => i.type === cat.id).slice(0, this.MAX_RENDERED_INVENTORY_ITEMS);
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
        const currentSeason = window.Seasons?.getCurrentSeason?.();
        const seasonMismatch = !!item.seasonId && (!currentSeason || currentSeason.id !== item.seasonId || !window.Seasons?.isActive?.(currentSeason));
        const expiresAt = item.endsAt ? Date.parse(item.endsAt) : NaN;
        const expired = Number.isFinite(expiresAt) && Date.now() > expiresAt;
        const rewardOnlyLocked = !owned && item.rewardOnly === true;

        let btnText, btnStyle, btnClick, btnDisabled = false;

        if (owned) {
            if (equipped) {
                btnText  = '\u2713 Equipado';
                btnStyle = `background:rgba(74,222,128,0.12);color:#4ade80;border:1px solid rgba(74,222,128,0.25);`;
                btnClick = `Shop._unequip('${item.type}')`;
            } else {
                btnText  = 'Equipar';
                btnStyle = `background:var(--theme-primary,#a855f7);color:white;border:none;`;
                btnClick = `Shop._equip('${item.id}')`;
            }
        } else if (item.milestone) {
            btnText     = `\u{1F512} Marco nivel ${item.minLevel}`;
            btnStyle    = `background:rgba(245,158,11,0.1);color:${d?'#fcd34d':'#b45309'};border:1px solid rgba(245,158,11,0.2);`;
            btnDisabled = true;
        } else if (expired) {
            btnText     = `Encerrado`;
            btnStyle    = `background:${c.inner};color:${c.muted};border:1px solid ${c.border};`;
            btnDisabled = true;
        } else if (rewardOnlyLocked) {
            btnText     = item.seasonFinalReward ? 'Disponivel no fim da temporada' : 'Somente recompensa';
            btnStyle    = `background:${c.inner};color:${c.muted};border:1px solid ${c.border};`;
            btnDisabled = true;
        } else if (seasonMismatch) {
            btnText     = `\u{1F512} Temporada ativa`;
            btnStyle    = `background:${c.inner};color:${c.muted};border:1px solid ${c.border};`;
            btnDisabled = true;
        } else if (!canLevel) {
            btnText     = `\u{1F512} Nivel ${item.minLevel}`;
            btnStyle    = `background:${c.inner};color:${c.muted};border:1px solid ${c.border};`;
            btnDisabled = true;
        } else if (!canAfford) {
            btnText     = `${item.price.toLocaleString('pt-BR')} chips`;
            btnStyle    = `background:rgba(239,68,68,0.1);color:${d?'#f87171':'#be123c'};border:1px solid rgba(239,68,68,0.2);`;
            btnDisabled = true;
        } else if ((item.price || 0) <= 0) {
            btnText  = `Resgatar gratis`;
            btnStyle = `background:linear-gradient(135deg,#10b981,#14b8a6);color:white;border:none;`;
            btnClick = `Shop._buy('${item.id}')`;
        } else {
            btnText  = `Comprar - ${item.price.toLocaleString('pt-BR')} chips`;
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
                        \u2B50 Excl.</span>` : ''}
                    ${equipped ? `<span style="font-size:0.55rem;font-weight:800;text-transform:uppercase;
                        color:#4ade80;background:rgba(74,222,128,0.1);
                        border:1px solid rgba(74,222,128,0.25);border-radius:99px;padding:2px 7px;white-space:nowrap;">
                        \u2713 Ativo</span>` : ''}
                    ${item.seasonId ? `<span style="font-size:0.55rem;font-weight:800;text-transform:uppercase;
                        color:${d?'#fda4af':'#be185d'};background:${d?'rgba(244,114,182,0.16)':'rgba(244,114,182,0.12)'};
                        border:1px solid ${d?'rgba(244,114,182,0.35)':'rgba(244,114,182,0.28)'};border-radius:99px;padding:2px 7px;white-space:nowrap;">
                        Temporada</span>` : ''}
                    ${item.eventOnly && !item.seasonId ? `<span style="font-size:0.55rem;font-weight:800;text-transform:uppercase;
                        color:${d?'#6ee7b7':'#047857'};background:${d?'rgba(16,185,129,0.16)':'rgba(16,185,129,0.12)'};
                        border:1px solid ${d?'rgba(16,185,129,0.35)':'rgba(16,185,129,0.3)'};border-radius:99px;padding:2px 7px;white-space:nowrap;">
                        Evento</span>` : ''}
                    ${item.rewardOnly ? `<span style="font-size:0.55rem;font-weight:800;text-transform:uppercase;
                        color:${d?'#fbcfe8':'#9d174d'};background:${d?'rgba(244,114,182,0.16)':'rgba(244,114,182,0.12)'};
                        border:1px solid ${d?'rgba(244,114,182,0.35)':'rgba(244,114,182,0.28)'};border-radius:99px;padding:2px 7px;white-space:nowrap;">
                        Recompensa</span>` : ''}
                </div>
            </div>

            <div style="flex:1;">
                <div style="font-size:0.85rem;font-weight:700;color:${c.text};font-family:'Syne',sans-serif;
                    line-height:1.2;margin-bottom:0.15rem;">${item.name}</div>
                ${item.preview ? `<div style="font-size:0.65rem;color:${c.muted};line-height:1.4;">${item.preview}</div>` : ''}
            </div>

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
        this._ensureState();
        this._tab = tab;
        if (this._stateCache) {
            this._stateCache.tab = tab;
            this._saveState();
        }
        const content = document.getElementById('shop-main-content');
        if (content) {
            content.innerHTML = tab === 'shop'
                ? this._renderShopTab()
                : tab === 'seasonal'
                    ? this._renderSeasonalTab()
                    : this._renderInventoryTab();
        }
        const eventContent = document.getElementById('shop-event-content');
        if (eventContent) eventContent.innerHTML = tab === 'shop' ? this._renderEventPanels() : '';

        const d = this._isDark();
        const c = this._c();
        ['shop', 'seasonal', 'inventory'].forEach(t => {
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
        this._ensureState();
        this._selectedCat = catId;
        if (this._stateCache) {
            this._stateCache.selectedCat = catId;
            this._saveState();
        }
        const sidebar = document.getElementById('shop-cat-sidebar');
        if (sidebar) sidebar.innerHTML = this._renderCatSidebar();
        const panel = document.getElementById('shop-items-panel');
        const cat   = this.CATEGORIES.find(c => c.id === catId) || this.CATEGORIES[0];
        const items = this.getDailyForCat(catId);
        if (panel) panel.innerHTML = this._renderCatItems(items, cat);
    },

    _buy(itemId) {
        const item  = Inventory.getItem(itemId);
        if (!item) return;
        if (item.rewardOnly && !Inventory.owns(item.id)) {
            Utils.showNotification?.('Este item so e obtido por recompensa da temporada.', 'warning');
            return;
        }
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
                    <span style="color:${d?'rgba(255,255,255,0.5)':'rgba(0,0,0,0.5)'};">Saldo apos</span>
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
                else Utils.showNotification?.(`\u274C ${result.reason}`, 'error');
            },
            onSecondary: () => {
                const result = Inventory.buy(itemId);
                if (result.ok) this._afterAction();
                else Utils.showNotification?.(`\u274C ${result.reason}`, 'error');
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
        const eventContent = document.getElementById('shop-event-content');
        if (eventContent) eventContent.innerHTML = this._tab === 'shop' ? this._renderEventPanels() : '';
        const content = document.getElementById('shop-main-content');
        if (content) {
            content.innerHTML = this._tab === 'shop'
                ? this._renderShopTab()
                : this._tab === 'seasonal'
                    ? this._renderSeasonalTab()
                    : this._renderInventoryTab();
        }
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
        this._ensureState();
        this.startBundleCatalogSync({ forceBoot: false, silent: true });
        const chipsEl = document.getElementById('shop-chips-display');
        if (chipsEl) chipsEl.textContent = (window.Economy?.getChips?.() || 0).toLocaleString('pt-BR');
    },

    cleanup(options = {}) {
        const full = options === true || options.full === true;
        document.getElementById('shop-modal')?.remove();
        if (!full) return;

        if (this._bundleCatalogSyncTimer) {
            clearInterval(this._bundleCatalogSyncTimer);
            this._bundleCatalogSyncTimer = null;
        }
        if (this._bundleCatalogRemoteUnsub) {
            try { this._bundleCatalogRemoteUnsub(); } catch (_) {}
            this._bundleCatalogRemoteUnsub = null;
        }
        if (this._bundleCatalogSyncHandlers) {
            window.removeEventListener('online', this._bundleCatalogSyncHandlers.online);
            window.removeEventListener('focus', this._bundleCatalogSyncHandlers.focus);
            document.removeEventListener('visibilitychange', this._bundleCatalogSyncHandlers.visibility);
            this._bundleCatalogSyncHandlers = null;
            this._bundleCatalogSyncListenersBound = false;
        }
        this._bundleCatalogSyncStarted = false;
    },
};

window.Shop = Shop;
