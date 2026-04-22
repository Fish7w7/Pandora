(() => {
    if (!window.DevLab) return;
    Object.assign(window.DevLab, {
        _bundleEditorStorageKey() {
            return 'devlab_bundle_editor_v1';
        },
        _devLabSectionStorageKey() {
            return 'devlab_active_section_v1';
        },
        _getActiveSection() {
            if (this._activeSection) return this._activeSection;
            const saved = String(window.Utils?.loadData?.(this._devLabSectionStorageKey()) || '').trim().toLowerCase();
            this._activeSection = saved === 'bundles' ? 'bundles' : 'geral';
            return this._activeSection;
        },
        _bundleEditorConfirmDiscard(actionLabel = 'continuar') {
            if (this._bundleEditorDirty !== true) return true;
            return window.confirm(`Existem alteracoes nao salvas no bundle atual. Deseja ${actionLabel} e descartar o rascunho?`);
        },
        setSection(section = 'geral') {
            const currentSection = this._getActiveSection();
            const safeSection = String(section || '').trim().toLowerCase() === 'bundles' ? 'bundles' : 'geral';
            if (currentSection === 'bundles' && safeSection !== 'bundles') {
                const ok = this._bundleEditorConfirmDiscard('mudar para outra secao');
                if (!ok) return;
            }
            this._activeSection = safeSection;
            window.Utils?.saveData?.(this._devLabSectionStorageKey(), safeSection);
            this._rerender();
        },
        _bundleEditorNormalize(rawCatalog = {}) {
            const source = rawCatalog && typeof rawCatalog === 'object' ? rawCatalog : {};
            const settings = source.settings && typeof source.settings === 'object' ? source.settings : {};
            const rawBundles = Array.isArray(source.bundles) ? source.bundles : [];
            const rawCustomBundles = Array.isArray(source.customBundles) ? source.customBundles : [];
            const normalizeBundle = (entry, fallbackKind = 'official') => {
                const bundle = entry && typeof entry === 'object' ? { ...entry } : {};
                const id = String(bundle.id || '').trim();
                if (!id) return null;
                const items = Array.isArray(bundle.items)
                    ? [...new Set(bundle.items.map((itemId) => String(itemId || '').trim()).filter(Boolean))]
                    : [];
                const sourceBundleIds = Array.isArray(bundle.sourceBundleIds)
                    ? [...new Set(bundle.sourceBundleIds.map((itemId) => String(itemId || '').trim()).filter(Boolean))]
                    : [];
                const discount = Math.max(0, Math.min(95, this._safeInt(bundle.bundleDiscountPct, 0, 0, 95)));
                const minSourceAgeDays = this._safeInt(bundle.minSourceAgeDays, 0, 0, 9999);
                const priority = this._safeInt(bundle.priority, 0, -9999, 9999);
                const kindRaw = String(bundle.kind || fallbackKind).trim().toLowerCase();
                const kind = kindRaw === 'custom' ? 'custom' : 'official';
                return {
                    id,
                    kind,
                    title: String(bundle.title || ''),
                    subtitle: String(bundle.subtitle || ''),
                    status: String(bundle.status || 'active'),
                    launchedAt: String(bundle.launchedAt || ''),
                    startsAt: String(bundle.startsAt || ''),
                    endsAt: String(bundle.endsAt || ''),
                    items,
                    sourceBundleIds,
                    bundleDiscountPct: discount,
                    minSourceAgeDays: minSourceAgeDays > 0 ? minSourceAgeDays : undefined,
                    priority,
                    enabled: bundle.enabled !== false,
                    active: bundle.active !== false,
                    historical: bundle.historical === true,
                    legacy: bundle.legacy === true,
                    rerunAllowed: bundle.rerunAllowed !== false,
                    allowInCustomPool: bundle.allowInCustomPool !== false,
                };
            };
            const bundles = rawBundles
                .map((entry) => normalizeBundle(entry, 'official'))
                .filter(Boolean);
            const customBundles = rawCustomBundles
                .map((entry) => normalizeBundle(entry, 'custom'))
                .filter(Boolean)
                .map((entry) => ({ ...entry, kind: 'custom' }));
            const minAge = this._safeInt(
                settings.customBundleMinAgeDays,
                this._safeInt(window.Shop?.CUSTOM_BUNDLE_MIN_AGE_DAYS, 90, 1, 9999),
                1,
                9999
            );
            return {
                version: this._safeInt(source.version, 1, 1, 999999),
                updatedAt: String(source.updatedAt || ''),
                settings: {
                    customBundleMinAgeDays: minAge,
                },
                bundles,
                customBundles,
                meta: source.meta && typeof source.meta === 'object' ? { ...source.meta } : {},
            };
        },
        _bundleEditorFromShop() {
            const fromShop = {
                version: 1,
                updatedAt: '',
                settings: {
                    customBundleMinAgeDays: this._safeInt(window.Shop?.CUSTOM_BUNDLE_MIN_AGE_DAYS, 90, 1, 9999),
                },
                bundles: this._cloneJSON(window.Shop?.BUNDLES || []) || [],
                customBundles: this._cloneJSON(window.Shop?.CUSTOM_BUNDLES || []) || [],
                meta: {
                    source: String(window.Shop?._bundleCatalogMeta?.source || 'shop-runtime'),
                    fetchedAt: Number(window.Shop?._bundleCatalogMeta?.fetchedAt || 0),
                    updatedAt: String(window.Shop?._bundleCatalogMeta?.updatedAt || ''),
                },
            };
            return this._bundleEditorNormalize(fromShop);
        },
        _bundleEditorDraft(kind = 'official') {
            const safeKind = String(kind || 'official').toLowerCase() === 'custom' ? 'custom' : 'official';
            const seed = Date.now().toString(36);
            return {
                id: `${safeKind === 'custom' ? 'custom_bundle' : 'bundle'}_${seed}`,
                kind: safeKind,
                title: safeKind === 'custom' ? 'Bundle Personalizado' : 'Novo Bundle',
                subtitle: '',
                status: 'active',
                launchedAt: '',
                startsAt: '',
                endsAt: '',
                items: [],
                sourceBundleIds: [],
                bundleDiscountPct: 0,
                minSourceAgeDays: undefined,
                priority: 0,
                enabled: true,
                active: true,
                historical: false,
                legacy: false,
                rerunAllowed: true,
                allowInCustomPool: true,
            };
        },
        _ensureBundleEditorState() {
            if (this._bundleEditorState) return this._bundleEditorState;
            const saved = window.Utils?.loadData?.(this._bundleEditorStorageKey());
            const candidate = saved && typeof saved === 'object'
                ? this._bundleEditorNormalize(saved)
                : this._bundleEditorFromShop();
            this._bundleEditorState = candidate;
            if (!this._bundleEditorSelection || !this._bundleEditorSelection.id) {
                const first = candidate.bundles?.[0] || candidate.customBundles?.[0] || null;
                if (first) {
                    this._bundleEditorSelection = { kind: first.kind || 'official', id: first.id };
                } else {
                    this._bundleEditorSelection = { kind: 'official', id: '' };
                }
            }
            return this._bundleEditorState;
        },
        _saveBundleEditorState() {
            const state = this._ensureBundleEditorState();
            window.Utils?.saveData?.(this._bundleEditorStorageKey(), {
                version: state.version || 1,
                updatedAt: state.updatedAt || '',
                settings: state.settings || { customBundleMinAgeDays: 90 },
                bundles: state.bundles || [],
                customBundles: state.customBundles || [],
                meta: state.meta || {},
        });
    },
    _selectedBundleRecord() {
        const state = this._ensureBundleEditorState();
        const selection = this._bundleEditorSelection || {};
        if (!selection.id || selection.id === '__draft__') {
            return { bundle: this._bundleEditorDraftValue || null, exists: false, kind: selection.kind || 'official' };
        }
        const bucket = selection.kind === 'custom' ? state.customBundles : state.bundles;
        const bundle = (bucket || []).find((entry) => entry.id === selection.id) || null;
        return { bundle, exists: !!bundle, kind: selection.kind || 'official' };
    },
    _bundleEditorSyncToShop({ silent = false } = {}) {
        const state = this._ensureBundleEditorState();
        const payload = {
            version: state.version || 1,
            updatedAt: new Date().toISOString(),
            settings: {
                customBundleMinAgeDays: this._safeInt(state.settings?.customBundleMinAgeDays, 90, 1, 9999),
            },
            bundles: this._cloneJSON(state.bundles || []) || [],
            customBundles: this._cloneJSON(state.customBundles || []) || [],
        };
        if (window.Shop?._applyBundleCatalog) {
            window.Shop._applyBundleCatalog(payload, {
                source: 'devlab-editor',
                fetchedAt: Date.now(),
                updatedAt: payload.updatedAt,
            });
            if (window.Shop?._saveBundleCatalogCache) {
                window.Shop._saveBundleCatalogCache(payload, {
                    source: 'devlab-editor',
                    fetchedAt: Date.now(),
                    updatedAt: payload.updatedAt,
                });
            }
            window.Shop?._refreshShopIfVisible?.();
        }
        state.updatedAt = payload.updatedAt;
        state.meta = {
            source: 'devlab-editor',
            fetchedAt: Date.now(),
            updatedAt: payload.updatedAt,
        };
        this._saveBundleEditorState();
        if (!silent) {
            Utils.showNotification?.('Catalogo de bundles aplicado no runtime.', 'success');
        }
    },
    _bundleEditorDropdownValue() {
        const selection = this._bundleEditorSelection || {};
        if (!selection.id || selection.id === '__draft__') return '__draft__';
        return `${selection.kind || 'official'}::${selection.id}`;
    },
    bundleEditorSetFilter(raw = '') {
        const nextValue = String(raw || '');
        if (nextValue === String(this._bundleEditorFilterQuery || '')) return;
        this._bundleEditorFilterQuery = nextValue;
        this._rerender();
    },
    _bundleEditorSelectFromDropdown(rawValue = '') {
        const value = String(rawValue || '').trim();
        const current = this._bundleEditorDropdownValue();
        if (value === current) return;
        const canDiscard = this._bundleEditorConfirmDiscard('trocar o bundle selecionado');
        if (!canDiscard) {
            const selectEl = document.getElementById('devlab-bundle-select');
            if (selectEl) selectEl.value = current;
            return;
        }
        if (!value || value === '__draft__') {
            this._bundleEditorSelection = { kind: 'official', id: '__draft__' };
            this._bundleEditorDraftValue = this._bundleEditorDraft('official');
            this._bundleEditorDirty = false;
            this._rerender();
            return;
        }
        const parts = value.split('::');
        const kind = parts[0] === 'custom' ? 'custom' : 'official';
        const id = String(parts[1] || '').trim();
        if (!id) return;
        this._bundleEditorSelection = { kind, id };
        this._bundleEditorDraftValue = null;
        this._bundleEditorDirty = false;
        this._rerender();
    },
    async bundleEditorNew(kind = 'official') {
        if (!(await this._ensureAccess())) return;
        const canDiscard = this._bundleEditorConfirmDiscard('criar um novo rascunho');
        if (!canDiscard) return;
        const safeKind = String(kind || 'official').trim().toLowerCase() === 'custom' ? 'custom' : 'official';
        this._bundleEditorSelection = { kind: safeKind, id: '__draft__' };
        this._bundleEditorDraftValue = this._bundleEditorDraft(safeKind);
        this._bundleEditorDirty = false;
        this._rerender();
    },
    async bundleEditorSave() {
        if (!(await this._ensureAccess())) return;
        const state = this._ensureBundleEditorState();
        const payload = this._bundleEditorReadForm();
        const bundle = payload.bundle || {};
        const report = this.bundleEditorPreviewUpdate() || this._bundleEditorValidatePayload(payload);
        if (!report.isValid) {
            Utils.showNotification?.(report.errors?.[0] || 'Existem pendencias obrigatorias no bundle.', 'warning');
            return;
        }
        state.settings = {
            customBundleMinAgeDays: this._safeInt(payload.settings?.customBundleMinAgeDays, 90, 1, 9999),
        };
        const official = Array.isArray(state.bundles) ? state.bundles : [];
        const custom = Array.isArray(state.customBundles) ? state.customBundles : [];
        const kind = bundle.kind === 'custom' ? 'custom' : 'official';
        // Remove duplicata por id entre listas para manter catalogo consistente.
        state.bundles = official.filter((entry) => entry.id !== bundle.id);
        state.customBundles = custom.filter((entry) => entry.id !== bundle.id);
        const nextBundle = this._bundleEditorNormalize({
            version: 1,
            settings: state.settings,
            bundles: kind === 'official' ? [bundle] : [],
            customBundles: kind === 'custom' ? [bundle] : [],
        });
        const normalizedEntry = kind === 'custom'
            ? (nextBundle.customBundles?.[0] || null)
            : (nextBundle.bundles?.[0] || null);
        if (!normalizedEntry) {
            Utils.showNotification?.('Bundle invalido apos normalizacao.', 'error');
            return;
        }
        if (kind === 'custom') {
            state.customBundles.push(normalizedEntry);
        } else {
            state.bundles.push(normalizedEntry);
        }
        const sortByPriority = (left, right) => {
            const p = this._safeInt(right.priority, 0, -9999, 9999) - this._safeInt(left.priority, 0, -9999, 9999);
            if (p !== 0) return p;
            const a = Date.parse(String(right.startsAt || right.launchedAt || '')) || 0;
            const b = Date.parse(String(left.startsAt || left.launchedAt || '')) || 0;
            return a - b;
        };
        state.bundles.sort(sortByPriority);
        state.customBundles.sort(sortByPriority);
        this._bundleEditorSelection = { kind, id: normalizedEntry.id };
        this._bundleEditorDraftValue = null;
        this._bundleEditorDirty = false;
        this._bundleEditorSyncToShop({ silent: true });
        this._saveBundleEditorState();
        this._rerender();
        Utils.showNotification?.(`Bundle salvo: ${normalizedEntry.id}`, 'success');
    },
    async bundleEditorDelete() {
        if (!(await this._ensureAccess())) return;
        const state = this._ensureBundleEditorState();
        const selected = this._selectedBundleRecord();
        if (!selected.exists || !selected.bundle?.id) {
            this._bundleEditorDraftValue = null;
            this._bundleEditorSelection = { kind: 'official', id: '' };
            this._rerender();
            return;
        }
        const ok = window.confirm(`Remover bundle "${selected.bundle.id}" do catalogo local?`);
        if (!ok) return;
        state.bundles = (state.bundles || []).filter((entry) => entry.id !== selected.bundle.id);
        state.customBundles = (state.customBundles || []).filter((entry) => entry.id !== selected.bundle.id);
        const next = state.bundles?.[0] || state.customBundles?.[0] || null;
        this._bundleEditorSelection = next
            ? { kind: next.kind || 'official', id: next.id }
            : { kind: 'official', id: '__draft__' };
        this._bundleEditorDraftValue = next ? null : this._bundleEditorDraft('official');
        this._bundleEditorDirty = false;
        this._bundleEditorSyncToShop({ silent: true });
        this._saveBundleEditorState();
        this._rerender();
        Utils.showNotification?.('Bundle removido do catalogo local.', 'success');
    },
    async bundleEditorReload(fetchRemote = false) {
        if (!(await this._ensureAccess())) return;
        const canDiscard = this._bundleEditorConfirmDiscard(fetchRemote ? 'recarregar do remoto' : 'recarregar do cache');
        if (!canDiscard) return;
        if (fetchRemote && window.Shop?.refreshBundleCatalog) {
            await window.Shop.refreshBundleCatalog({ force: true, silent: false }).catch(() => {});
        }
        this._bundleEditorState = this._bundleEditorFromShop();
        this._bundleEditorDraftValue = null;
        const first = this._bundleEditorState.bundles?.[0] || this._bundleEditorState.customBundles?.[0] || null;
        this._bundleEditorSelection = first
            ? { kind: first.kind || 'official', id: first.id }
            : { kind: 'official', id: '__draft__' };
        this._bundleEditorDirty = false;
        this._saveBundleEditorState();
        this._rerender();
        Utils.showNotification?.('Editor recarregado a partir do catalogo atual.', 'info');
    },
    async bundleEditorExport() {
        if (!(await this._ensureAccess())) return;
        const state = this._ensureBundleEditorState();
        const output = {
            version: state.version || 1,
            updatedAt: new Date().toISOString(),
            settings: {
                customBundleMinAgeDays: this._safeInt(state.settings?.customBundleMinAgeDays, 90, 1, 9999),
            },
            bundles: this._cloneJSON(state.bundles || []) || [],
            customBundles: this._cloneJSON(state.customBundles || []) || [],
        };
        const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bundle-catalog-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        Utils.showNotification?.('Catalogo exportado em JSON.', 'success');
    },
    });
})();
