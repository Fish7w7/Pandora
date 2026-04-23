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
            const remoteSource = `firebase:${this._bundleEditorRemoteCatalogPath()}`;
            const source = String(window.Shop?._bundleCatalogMeta?.source || 'shop-runtime');
            const updatedAt = String(window.Shop?._bundleCatalogMeta?.updatedAt || '');
            const canUseAsPublishBaseline = source === remoteSource && !!updatedAt;
            const fromShop = {
                version: 1,
                updatedAt: '',
                settings: {
                    customBundleMinAgeDays: this._safeInt(window.Shop?.CUSTOM_BUNDLE_MIN_AGE_DAYS, 90, 1, 9999),
                },
                bundles: this._cloneJSON(window.Shop?.BUNDLES || []) || [],
                customBundles: this._cloneJSON(window.Shop?.CUSTOM_BUNDLES || []) || [],
                meta: {
                    source,
                    fetchedAt: Number(window.Shop?._bundleCatalogMeta?.fetchedAt || 0),
                    updatedAt,
                    publishBaseSource: canUseAsPublishBaseline ? remoteSource : '',
                    publishBaseUpdatedAt: canUseAsPublishBaseline ? updatedAt : '',
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
        const payload = this._bundleEditorBuildCatalogPayload(state);
        const meta = state.meta && typeof state.meta === 'object' ? state.meta : {};
        const publishBaseSource = String(meta.publishBaseSource || '').trim();
        const publishBaseUpdatedAt = String(meta.publishBaseUpdatedAt || '').trim();
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
            publishBaseSource,
            publishBaseUpdatedAt,
        };
        this._saveBundleEditorState();
        if (!silent) {
            Utils.showNotification?.('Catalogo de bundles aplicado no runtime.', 'success');
        }
    },
    _bundleEditorBuildCatalogPayload(state = null) {
        const sourceState = state || this._ensureBundleEditorState();
        return {
            version: sourceState.version || 1,
            updatedAt: new Date().toISOString(),
            settings: {
                customBundleMinAgeDays: this._safeInt(sourceState.settings?.customBundleMinAgeDays, 90, 1, 9999),
            },
            bundles: this._cloneJSON(sourceState.bundles || []) || [],
            customBundles: this._cloneJSON(sourceState.customBundles || []) || [],
        };
    },
    _bundleEditorBuildCatalogPayloadFromCatalog(rawCatalog = {}, { touchUpdatedAt = false } = {}) {
        const normalized = this._bundleEditorNormalize(rawCatalog);
        return {
            version: this._safeInt(normalized.version, 1, 1, 999999),
            updatedAt: touchUpdatedAt
                ? new Date().toISOString()
                : String(normalized.updatedAt || new Date().toISOString()),
            settings: {
                customBundleMinAgeDays: this._safeInt(normalized.settings?.customBundleMinAgeDays, 90, 1, 9999),
            },
            bundles: this._cloneJSON(normalized.bundles || []) || [],
            customBundles: this._cloneJSON(normalized.customBundles || []) || [],
        };
    },
    _bundleEditorRemoteCatalogPath() {
        const fromShop = String(window.Shop?.BUNDLE_CATALOG_REMOTE_DOC_PATH || '').trim();
        return fromShop || 'config/bundleCatalog';
    },
    _bundleEditorRemoteHistoryCollectionPath() {
        return `${this._bundleEditorRemoteCatalogPath()}/history`;
    },
    _bundleEditorExtractRemoteCatalog(rawDoc = null) {
        if (!rawDoc || typeof rawDoc !== 'object') return null;
        const source = rawDoc.catalog && typeof rawDoc.catalog === 'object'
            ? rawDoc.catalog
            : rawDoc;
        const hasPayload = Array.isArray(source.bundles)
            || Array.isArray(source.customBundles)
            || Array.isArray(source.custom_bundles);
        if (!hasPayload) return null;
        return this._bundleEditorNormalize(source);
    },
    _bundleEditorResolveTimestampMs(value) {
        if (Number.isFinite(value)) return Number(value);
        if (value && typeof value.toMillis === 'function') {
            try {
                return Number(value.toMillis()) || 0;
            } catch (_) {
                return 0;
            }
        }
        return 0;
    },
    _bundleEditorRemoteDocUpdatedAt(rawDoc = null) {
        const safeDoc = rawDoc && typeof rawDoc === 'object' ? rawDoc : {};
        const catalog = safeDoc.catalog && typeof safeDoc.catalog === 'object'
            ? safeDoc.catalog
            : safeDoc;
        return String(catalog.updatedAt || safeDoc.updatedAt || '').trim();
    },
    _bundleEditorRemoteDocRevision(rawDoc = null) {
        const safeDoc = rawDoc && typeof rawDoc === 'object' ? rawDoc : {};
        const revision = Number(safeDoc.revision ?? safeDoc.catalogRevision ?? 0);
        if (!Number.isFinite(revision) || revision < 0) return 0;
        return Math.floor(revision);
    },
    _bundleEditorExpectedRemoteBaseline(path = '', state = null) {
        const sourceState = state || this._ensureBundleEditorState();
        const meta = sourceState?.meta && typeof sourceState.meta === 'object' ? sourceState.meta : {};
        const remotePath = String(path || '').trim();
        const expectedSource = `firebase:${remotePath}`;
        const source = String(meta.publishBaseSource || meta.source || '').trim();
        const updatedAt = String(
            meta.publishBaseUpdatedAt
            || (source === expectedSource ? meta.updatedAt : '')
            || ''
        ).trim();
        return {
            source,
            updatedAt,
            canGuard: !!remotePath && source === expectedSource && !!updatedAt,
        };
    },
    _bundleEditorIsConflictError(error) {
        const code = String(error?.code || '').toLowerCase();
        const message = String(error?.message || '').toLowerCase();
        return code.includes('bundle-conflict')
            || message.includes('__bundle_conflict__')
            || message.includes('bundle conflict');
    },
    _bundleEditorSetConflictState(remoteUpdatedAt = '') {
        const iso = String(remoteUpdatedAt || '').trim();
        this._bundleEditorLastConflict = {
            atMs: Date.now(),
            remoteUpdatedAt: iso,
            remoteUpdatedLabel: iso ? new Date(iso).toLocaleString('pt-BR') : 'desconhecido',
        };
    },
    _bundleEditorClearConflictState() {
        if (!this._bundleEditorLastConflict) return;
        this._bundleEditorLastConflict = null;
    },
    _bundleEditorNotifyConflict(remoteUpdatedAt = '') {
        this._bundleEditorSetConflictState(remoteUpdatedAt);
        const remoteLabel = this._bundleEditorLastConflict?.remoteUpdatedLabel || 'desconhecido';
        this._rerender();
        Utils.showNotification?.(
            `Conflito detectado: o remoto foi alterado em ${remoteLabel}. Sincronize e publique novamente.`,
            'warning'
        );
    },
    async bundleEditorSyncAndRetryConflict() {
        if (!(await this._ensureAccess())) return;
        await this.bundleEditorReload(true);
        this._bundleEditorClearConflictState();
        this._rerender();
        Utils.showNotification?.('Catalogo remoto sincronizado. Revise e publique novamente.', 'info');
    },
    async _bundleEditorWriteRemoteCatalogGuarded({
        path = '',
        payload = null,
        actor = null,
        expectedUpdatedAt = '',
        rollbackFromRevision = '',
    } = {}) {
        const safePath = String(path || '').trim();
        const safePayload = payload && typeof payload === 'object' ? payload : null;
        if (!safePath || !safePayload) {
            throw new Error('Payload remoto invalido para publicacao.');
        }

        const serverTimestamp = window.NyanFirebase?.fn?.serverTimestamp;
        const actorMeta = actor && typeof actor === 'object' ? actor : this._bundleEditorCurrentPublisherMeta();
        const safeExpectedUpdatedAt = String(expectedUpdatedAt || '').trim();
        const safeRollbackFrom = String(rollbackFromRevision || '').trim();
        const docRef = window.NyanFirebase.docRef(safePath);
        const db = window.NyanFirebase?.db || null;
        const runTransaction = window.NyanFirebase?._mod?.fsMod?.runTransaction;

        const writeBodyFromRaw = (rawDoc = null) => {
            const previousRaw = rawDoc && typeof rawDoc === 'object' ? rawDoc : {};
            const previousCatalog = this._bundleEditorExtractRemoteCatalog(previousRaw);
            const previousUpdatedAt = this._bundleEditorRemoteDocUpdatedAt(previousRaw);
            const previousRevision = this._bundleEditorRemoteDocRevision(previousRaw);

            if (safeExpectedUpdatedAt && previousUpdatedAt !== safeExpectedUpdatedAt) {
                const conflict = new Error('__BUNDLE_CONFLICT__');
                conflict.code = 'bundle-conflict';
                conflict.remoteUpdatedAt = previousUpdatedAt;
                throw conflict;
            }

            const nextRevision = previousRevision + 1;
            const writeBody = {
                catalog: safePayload,
                updatedAt: safePayload.updatedAt,
                updatedBy: actorMeta,
                publishedAt: typeof serverTimestamp === 'function' ? serverTimestamp() : new Date().toISOString(),
                revision: nextRevision,
            };
            if (safeRollbackFrom) {
                writeBody.rollbackFromRevision = safeRollbackFrom;
            }
            return {
                writeBody,
                previousCatalog,
                previousUpdatedAt,
                nextRevision,
            };
        };

        if (typeof runTransaction === 'function' && db) {
            let outcome = {
                previousCatalog: null,
                previousUpdatedAt: '',
                nextRevision: 0,
            };
            await runTransaction(db, async (tx) => {
                const snap = await tx.get(docRef);
                const raw = snap?.exists?.() ? (snap.data() || {}) : {};
                const next = writeBodyFromRaw(raw);
                tx.set(docRef, next.writeBody, { merge: true });
                outcome = {
                    previousCatalog: next.previousCatalog,
                    previousUpdatedAt: next.previousUpdatedAt,
                    nextRevision: next.nextRevision,
                };
            });
            return outcome;
        }

        const rawDoc = await window.NyanFirebase.getDoc(safePath).catch(() => null);
        const next = writeBodyFromRaw(rawDoc);
        await window.NyanFirebase.fn.setDoc(
            docRef,
            next.writeBody,
            { merge: true }
        );
        return {
            previousCatalog: next.previousCatalog,
            previousUpdatedAt: next.previousUpdatedAt,
            nextRevision: next.nextRevision,
        };
    },
    _bundleEditorCurrentPublisherMeta() {
        return {
            uid: String(window.NyanFirebase?.auth?.currentUser?.uid || '').trim(),
            nyanTag: String(window.NyanAuth?.getNyanTag?.() || '').trim(),
            username: String(window.App?.user?.username || '').trim(),
        };
    },
    _bundleEditorMakeHistoryDocId(baseMs = Date.now()) {
        return `${Math.max(1, this._safeInt(baseMs, Date.now(), 1, 9999999999999))}_${Math.random().toString(36).slice(2, 8)}`;
    },
    async _bundleEditorWriteRemoteHistory({
        catalog = null,
        action = 'published',
        note = '',
        actor = null,
        rollbackFrom = '',
    } = {}) {
        const safeCatalog = this._bundleEditorBuildCatalogPayloadFromCatalog(catalog || {}, { touchUpdatedAt: false });
        const historyPath = this._bundleEditorRemoteHistoryCollectionPath();
        const publishedAtMs = Date.now();
        const docId = this._bundleEditorMakeHistoryDocId(publishedAtMs);
        const metadata = actor && typeof actor === 'object'
            ? actor
            : this._bundleEditorCurrentPublisherMeta();
        await window.NyanFirebase.fn.setDoc(
            window.NyanFirebase.docRef(`${historyPath}/${docId}`),
            {
                action: String(action || 'published').trim() || 'published',
                note: String(note || '').trim(),
                rollbackFrom: String(rollbackFrom || '').trim(),
                publishedAt: window.NyanFirebase.fn.serverTimestamp(),
                publishedAtMs,
                updatedAt: String(safeCatalog.updatedAt || ''),
                version: this._safeInt(safeCatalog.version, 1, 1, 999999),
                bundleCount: (Array.isArray(safeCatalog.bundles) ? safeCatalog.bundles.length : 0)
                    + (Array.isArray(safeCatalog.customBundles) ? safeCatalog.customBundles.length : 0),
                updatedBy: metadata,
                catalog: safeCatalog,
            },
            { merge: false }
        );
        return { id: docId, publishedAtMs };
    },
    _bundleEditorAuditCatalog(state = null) {
        const sourceState = state || this._ensureBundleEditorState();
        const normalized = this._bundleEditorNormalize({
            version: sourceState.version || 1,
            updatedAt: sourceState.updatedAt || '',
            settings: sourceState.settings || { customBundleMinAgeDays: 90 },
            bundles: sourceState.bundles || [],
            customBundles: sourceState.customBundles || [],
        });
        const entries = [
            ...(Array.isArray(normalized.bundles) ? normalized.bundles.map((entry) => ({ ...entry, kind: 'official' })) : []),
            ...(Array.isArray(normalized.customBundles) ? normalized.customBundles.map((entry) => ({ ...entry, kind: 'custom' })) : []),
        ];
        const errors = [];
        const warnings = [];
        const parseIso = (value = '') => {
            const raw = String(value || '').trim();
            if (!raw) return Number.NaN;
            if (typeof this._bundleEditorParseDateMs === 'function') {
                return this._bundleEditorParseDateMs(raw);
            }
            const parsed = Date.parse(raw);
            return Number.isFinite(parsed) ? parsed : Number.NaN;
        };
        const getInventoryItem = (itemId = '') => {
            const safeId = String(itemId || '').trim();
            if (!safeId) return null;
            if (typeof window.Inventory?.getItem === 'function') {
                return window.Inventory.getItem(safeId);
            }
            return Array.isArray(window.Inventory?.CATALOG)
                ? (window.Inventory.CATALOG.find((entry) => entry?.id === safeId) || null)
                : null;
        };
        if (!entries.length) {
            warnings.push('Catalogo sem bundles. Publique ao menos um bundle oficial ou custom.');
        }
        const allowedStatus = new Set(['active', 'draft', 'archived', 'published', 'live']);
        const idUsage = new Map();
        entries.forEach((entry) => {
            const id = String(entry?.id || '').trim();
            if (!id) {
                errors.push('Existe bundle sem ID definido.');
                return;
            }
            const count = Number(idUsage.get(id) || 0) + 1;
            idUsage.set(id, count);
        });
        idUsage.forEach((count, id) => {
            if (count > 1) {
                errors.push(`ID duplicado no catalogo: ${id} (${count} entradas).`);
            }
        });
        const knownIds = new Set(entries.map((entry) => String(entry?.id || '').trim()).filter(Boolean));
        entries.forEach((entry) => {
            const id = String(entry?.id || '').trim();
            const title = String(entry?.title || '').trim();
            const status = String(entry?.status || 'active').trim().toLowerCase();
            const items = Array.isArray(entry?.items) ? entry.items.map((itemId) => String(itemId || '').trim()).filter(Boolean) : [];
            const kind = String(entry?.kind || 'official').trim().toLowerCase() === 'custom' ? 'custom' : 'official';
            if (!id) return;
            if (!title) {
                errors.push(`Bundle ${id}: nome exibido vazio.`);
            }
            if (!items.length) {
                errors.push(`Bundle ${id}: sem itens associados.`);
            }
            if (!allowedStatus.has(status)) {
                warnings.push(`Bundle ${id}: status "${status}" fora do padrao conhecido.`);
            }
            const launchedMs = parseIso(entry?.launchedAt);
            const startsMs = parseIso(entry?.startsAt);
            const endsMs = parseIso(entry?.endsAt);
            if (!Number.isFinite(launchedMs)) {
                errors.push(`Bundle ${id}: lancamento invalido (ISO-8601 com timezone).`);
            }
            if (!Number.isFinite(startsMs)) {
                errors.push(`Bundle ${id}: inicio invalido (ISO-8601 com timezone).`);
            }
            if (!Number.isFinite(endsMs)) {
                errors.push(`Bundle ${id}: fim invalido (ISO-8601 com timezone).`);
            }
            if (Number.isFinite(startsMs) && Number.isFinite(endsMs) && startsMs > endsMs) {
                errors.push(`Bundle ${id}: inicio maior que fim.`);
            }
            const missingItems = items.filter((itemId) => !getInventoryItem(itemId));
            if (missingItems.length) {
                warnings.push(`Bundle ${id}: ${missingItems.length} item(ns) nao encontrado(s) no Inventory.`);
            }
            if (kind === 'custom') {
                const sourceIds = Array.isArray(entry?.sourceBundleIds)
                    ? entry.sourceBundleIds.map((sourceId) => String(sourceId || '').trim()).filter(Boolean)
                    : [];
                const missingSources = sourceIds.filter((sourceId) => !knownIds.has(sourceId));
                if (missingSources.length) {
                    warnings.push(`Bundle ${id}: ${missingSources.length} bundle(s) fonte nao encontrado(s) no catalogo.`);
                }
            }
        });
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            errorCount: errors.length,
            warningCount: warnings.length,
            bundleCount: entries.length,
            generatedAtMs: Date.now(),
        };
    },
    bundleEditorRunCatalogAudit({ silent = false } = {}) {
        const report = this._bundleEditorAuditCatalog();
        this._bundleEditorLastAudit = {
            generatedAtMs: report.generatedAtMs,
            errorCount: report.errorCount,
            warningCount: report.warningCount,
            bundleCount: report.bundleCount,
            errors: [...report.errors],
            warnings: [...report.warnings],
        };
        this._rerender();
        if (!silent) {
            if (!report.isValid) {
                Utils.showNotification?.(`Auditoria falhou: ${report.errorCount} erro(s) encontrado(s).`, 'error');
            } else if (report.warningCount > 0) {
                Utils.showNotification?.(`Auditoria concluida com ${report.warningCount} alerta(s).`, 'warning');
            } else {
                Utils.showNotification?.('Auditoria concluida sem pendencias.', 'success');
            }
        }
        return report;
    },
    async _bundleEditorRefreshPublisherAuth(force = false) {
        const user = window.NyanFirebase?.auth?.currentUser || null;
        if (!user || typeof user.getIdTokenResult !== 'function') {
            const fallback = {
                available: false,
                devPublisher: false,
                checkedAtMs: Date.now(),
                error: 'Usuario sem token disponivel.',
            };
            this._bundleEditorPublisherAuthInfo = fallback;
            return fallback;
        }
        try {
            const tokenResult = await user.getIdTokenResult(!!force);
            const claims = tokenResult?.claims || {};
            const info = {
                available: true,
                devPublisher: claims.devPublisher === true,
                checkedAtMs: Date.now(),
                claimsPreview: Object.keys(claims).slice(0, 6),
                error: '',
            };
            this._bundleEditorPublisherAuthInfo = info;
            this._rerender();
            return info;
        } catch (error) {
            const info = {
                available: false,
                devPublisher: false,
                checkedAtMs: Date.now(),
                error: String(error?.message || 'Falha ao ler claims.'),
            };
            this._bundleEditorPublisherAuthInfo = info;
            this._rerender();
            return info;
        }
    },
    async bundleEditorCheckPublisherAuth() {
        if (!(await this._ensureAccess())) return;
        const info = await this._bundleEditorRefreshPublisherAuth(true);
        if (info.available && info.devPublisher) {
            Utils.showNotification?.('Claim devPublisher ativa para este usuario.', 'success');
            return;
        }
        Utils.showNotification?.('Claim devPublisher ausente. A publicacao ainda pode funcionar se a rule usar UID.', 'info');
    },
    async bundleEditorRefreshRemoteHistory({ silent = false } = {}) {
        if (!(await this._ensureAccess())) return;
        if (!window.NyanFirebase?.isReady?.()) {
            Utils.showNotification?.('Firebase offline. Nao foi possivel carregar o historico remoto.', 'warning');
            return;
        }
        this._bundleEditorHistoryLoading = true;
        this._rerender();
        try {
            const historyPath = this._bundleEditorRemoteHistoryCollectionPath();
            const colRef = window.NyanFirebase.fn.collection(window.NyanFirebase.db, historyPath);
            const snap = await window.NyanFirebase.fn.getDocs(colRef);
            const entries = (snap?.docs || [])
                .map((docSnap) => {
                    const raw = docSnap.data?.() || {};
                    const catalog = this._bundleEditorExtractRemoteCatalog(raw);
                    if (!catalog) return null;
                    const publishedAtMs = this._bundleEditorResolveTimestampMs(raw.publishedAtMs)
                        || this._bundleEditorResolveTimestampMs(raw.publishedAt)
                        || 0;
                    const updatedBy = raw.updatedBy && typeof raw.updatedBy === 'object' ? raw.updatedBy : {};
                    return {
                        id: String(docSnap.id || ''),
                        action: String(raw.action || 'published'),
                        note: String(raw.note || ''),
                        rollbackFrom: String(raw.rollbackFrom || ''),
                        publishedAtMs,
                        updatedAt: String(raw.updatedAt || catalog.updatedAt || ''),
                        version: this._safeInt(raw.version || catalog.version || 1, 1, 1, 999999),
                        updatedBy: {
                            uid: String(updatedBy.uid || ''),
                            nyanTag: String(updatedBy.nyanTag || ''),
                            username: String(updatedBy.username || ''),
                        },
                        catalog,
                    };
                })
                .filter(Boolean)
                .sort((left, right) => Number(right.publishedAtMs || 0) - Number(left.publishedAtMs || 0))
                .slice(0, 40);
            this._bundleEditorHistoryEntries = entries;
            const currentSelected = String(this._bundleEditorHistorySelectedId || '');
            if (!entries.length) {
                this._bundleEditorHistorySelectedId = '';
            } else if (!currentSelected || !entries.some((entry) => entry.id === currentSelected)) {
                this._bundleEditorHistorySelectedId = entries[0].id;
            }
            if (!silent) {
                Utils.showNotification?.(`Historico remoto carregado (${entries.length} revisao(oes)).`, 'success');
            }
        } catch (error) {
            if (!silent) {
                Utils.showNotification?.('Falha ao carregar historico remoto.', 'error');
            }
        } finally {
            this._bundleEditorHistoryLoading = false;
            this._rerender();
        }
    },
    bundleEditorSelectHistory(docId = '') {
        this._bundleEditorHistorySelectedId = String(docId || '').trim();
        this._rerender();
    },
    async bundleEditorRollbackRemoteSelected() {
        if (!(await this._ensureAccess())) return;
        if (!window.NyanFirebase?.isReady?.()) {
            Utils.showNotification?.('Firebase offline. Nao foi possivel executar rollback.', 'warning');
            return;
        }
        let entries = Array.isArray(this._bundleEditorHistoryEntries) ? this._bundleEditorHistoryEntries : [];
        if (!entries.length) {
            await this.bundleEditorRefreshRemoteHistory({ silent: true });
            entries = Array.isArray(this._bundleEditorHistoryEntries) ? this._bundleEditorHistoryEntries : [];
        }
        const selectedId = String(this._bundleEditorHistorySelectedId || entries?.[0]?.id || '').trim();
        const target = entries.find((entry) => String(entry?.id || '') === selectedId) || null;
        if (!target || !target.catalog) {
            Utils.showNotification?.('Selecione uma revisao valida para rollback.', 'warning');
            return;
        }
        const rollbackAudit = this._bundleEditorAuditCatalog({
            version: target.catalog.version || 1,
            updatedAt: target.catalog.updatedAt || '',
            settings: target.catalog.settings || { customBundleMinAgeDays: 90 },
            bundles: target.catalog.bundles || [],
            customBundles: target.catalog.customBundles || [],
        });
        this._bundleEditorLastAudit = {
            generatedAtMs: rollbackAudit.generatedAtMs,
            errorCount: rollbackAudit.errorCount,
            warningCount: rollbackAudit.warningCount,
            bundleCount: rollbackAudit.bundleCount,
            errors: [...rollbackAudit.errors],
            warnings: [...rollbackAudit.warnings],
        };
        if (!rollbackAudit.isValid) {
            this._rerender();
            Utils.showNotification?.(`Rollback bloqueado: revisao selecionada contem ${rollbackAudit.errorCount} erro(s).`, 'error');
            return;
        }
        if (rollbackAudit.warningCount > 0) {
            const proceedWarn = window.confirm(`A revisao possui ${rollbackAudit.warningCount} alerta(s). Deseja continuar com o rollback?`);
            if (!proceedWarn) {
                this._rerender();
                return;
            }
        }
        const proceed = window.confirm(`Confirmar rollback para a revisao ${selectedId}?`);
        if (!proceed) return;

        const path = this._bundleEditorRemoteCatalogPath();
        const state = this._ensureBundleEditorState();
        const baseline = this._bundleEditorExpectedRemoteBaseline(path, state);
        if (!baseline.canGuard) {
            Utils.showNotification?.(
                'Sincronize o catalogo remoto antes do rollback para evitar sobrescrever revisoes de outro dev.',
                'warning'
            );
            return;
        }
        const actor = this._bundleEditorCurrentPublisherMeta();
        const rollbackPayload = this._bundleEditorBuildCatalogPayloadFromCatalog(target.catalog, { touchUpdatedAt: true });
        let commitResult = null;
        try {
            commitResult = await this._bundleEditorWriteRemoteCatalogGuarded({
                path,
                payload: rollbackPayload,
                actor,
                expectedUpdatedAt: baseline.updatedAt,
                rollbackFromRevision: selectedId,
            });
            if (commitResult?.previousCatalog) {
                await this._bundleEditorWriteRemoteHistory({
                    catalog: commitResult.previousCatalog,
                    action: 'rollback_backup',
                    note: `Backup antes do rollback para ${selectedId}`,
                    actor,
                    rollbackFrom: selectedId,
                }).catch(() => {});
            }
            await this._bundleEditorWriteRemoteHistory({
                catalog: rollbackPayload,
                action: 'rollback_applied',
                note: `Rollback aplicado a partir de ${selectedId}`,
                actor,
                rollbackFrom: selectedId,
            }).catch(() => {});
        } catch (error) {
            if (this._bundleEditorIsConflictError(error)) {
                this._bundleEditorNotifyConflict(error?.remoteUpdatedAt || '');
                return;
            }
            const message = String(error?.message || '');
            if (message.toLowerCase().includes('permission')) {
                Utils.showNotification?.('Sem permissao para rollback remoto. Revise as regras do Firebase.', 'error');
            } else {
                Utils.showNotification?.('Falha ao executar rollback remoto.', 'error');
            }
            return;
        }

        state.version = rollbackPayload.version || 1;
        state.updatedAt = rollbackPayload.updatedAt;
        state.settings = rollbackPayload.settings || { customBundleMinAgeDays: 90 };
        state.bundles = this._cloneJSON(rollbackPayload.bundles || []) || [];
        state.customBundles = this._cloneJSON(rollbackPayload.customBundles || []) || [];
        state.meta = {
            source: `firebase:${path}`,
            fetchedAt: Date.now(),
            updatedAt: rollbackPayload.updatedAt,
            publishBaseSource: `firebase:${path}`,
            publishBaseUpdatedAt: rollbackPayload.updatedAt,
            revision: this._safeInt(commitResult?.nextRevision, 0, 0, 99999999),
        };
        this._saveBundleEditorState();
        if (window.Shop?._applyBundleCatalog) {
            window.Shop._applyBundleCatalog(rollbackPayload, {
                source: `firebase:${path}`,
                fetchedAt: Date.now(),
                updatedAt: rollbackPayload.updatedAt,
            });
            window.Shop?._saveBundleCatalogCache?.(rollbackPayload, {
                source: `firebase:${path}`,
                fetchedAt: Date.now(),
                updatedAt: rollbackPayload.updatedAt,
            });
            window.Shop?._refreshShopIfVisible?.();
        }
        this._bundleEditorState = this._bundleEditorNormalize({
            ...rollbackPayload,
            meta: state.meta,
        });
        this._bundleEditorDraftValue = null;
        const first = this._bundleEditorState.bundles?.[0] || this._bundleEditorState.customBundles?.[0] || null;
        this._bundleEditorSelection = first
            ? { kind: first.kind || 'official', id: first.id }
            : { kind: 'official', id: '__draft__' };
        this._bundleEditorDirty = false;
        this._bundleEditorClearConflictState();
        await this.bundleEditorRefreshRemoteHistory({ silent: true });
        this._rerender();
        Utils.showNotification?.(`Rollback remoto aplicado (${selectedId}).`, 'success');
    },
    async bundleEditorPublishRemote() {
        if (!(await this._ensureAccess())) return;
        if (!window.NyanFirebase?.isReady?.()) {
            Utils.showNotification?.('Firebase offline. Nao foi possivel publicar o catalogo remoto.', 'warning');
            return;
        }

        const state = this._ensureBundleEditorState();
        const audit = this.bundleEditorRunCatalogAudit({ silent: true });
        if (!audit.isValid) {
            Utils.showNotification?.(`Publicacao bloqueada: ${audit.errorCount} erro(s) no catalogo.`, 'error');
            return;
        }
        if (audit.warningCount > 0) {
            const proceedWarn = window.confirm(`Foram encontrados ${audit.warningCount} alerta(s). Deseja publicar mesmo assim?`);
            if (!proceedWarn) return;
        }
        const claims = await this._bundleEditorRefreshPublisherAuth(false).catch(() => null);
        if (claims && claims.available && claims.devPublisher !== true) {
            Utils.showNotification?.('Claim devPublisher ausente. A publicacao ainda pode funcionar se sua rule usar whitelist por UID.', 'info');
        }
        const payload = this._bundleEditorBuildCatalogPayload(state);
        const path = this._bundleEditorRemoteCatalogPath();
        const baseline = this._bundleEditorExpectedRemoteBaseline(path, state);
        if (!baseline.canGuard) {
            Utils.showNotification?.(
                'Sincronize o catalogo remoto antes de publicar para garantir protecao contra conflito.',
                'warning'
            );
            return;
        }
        const actor = this._bundleEditorCurrentPublisherMeta();
        let commitResult = null;

        try {
            commitResult = await this._bundleEditorWriteRemoteCatalogGuarded({
                path,
                payload,
                actor,
                expectedUpdatedAt: baseline.updatedAt,
            });
            if (commitResult?.previousCatalog) {
                await this._bundleEditorWriteRemoteHistory({
                    catalog: commitResult.previousCatalog,
                    action: 'published_backup',
                    note: 'Backup antes da publicacao',
                    actor,
                }).catch(() => {});
            }
            await this._bundleEditorWriteRemoteHistory({
                catalog: payload,
                action: 'published',
                note: 'Publicacao manual pelo DevLab',
                actor,
            }).catch(() => {});
        } catch (error) {
            if (this._bundleEditorIsConflictError(error)) {
                this._bundleEditorNotifyConflict(error?.remoteUpdatedAt || '');
                return;
            }
            const message = String(error?.message || '');
            if (message.toLowerCase().includes('permission')) {
                Utils.showNotification?.('Sem permissao para publicar no remoto. Atualize as regras do Firebase.', 'error');
            } else {
                Utils.showNotification?.('Falha ao publicar catalogo remoto.', 'error');
            }
            return;
        }

        if (window.Shop?._applyBundleCatalog) {
            window.Shop._applyBundleCatalog(payload, {
                source: `firebase:${path}`,
                fetchedAt: Date.now(),
                updatedAt: payload.updatedAt,
            });
            window.Shop?._saveBundleCatalogCache?.(payload, {
                source: `firebase:${path}`,
                fetchedAt: Date.now(),
                updatedAt: payload.updatedAt,
            });
            window.Shop?._refreshShopIfVisible?.();
        }
        state.updatedAt = payload.updatedAt;
        state.meta = {
            source: `firebase:${path}`,
            fetchedAt: Date.now(),
            updatedAt: payload.updatedAt,
            publishBaseSource: `firebase:${path}`,
            publishBaseUpdatedAt: payload.updatedAt,
            revision: this._safeInt(commitResult?.nextRevision, 0, 0, 99999999),
        };
        this._saveBundleEditorState();
        this._bundleEditorClearConflictState();
        await this.bundleEditorRefreshRemoteHistory({ silent: true });
        this._rerender();
        Utils.showNotification?.('Catalogo publicado no remoto com sucesso.', 'success');
    },
    _bundleEditorDropdownValue() {
        const selection = this._bundleEditorSelection || {};
        if (!selection.id || selection.id === '__draft__') return '__draft__';
        return `${selection.kind || 'official'}::${selection.id}`;
    },
    _bundleEditorFilterStats(raw = '') {
        const state = this._bundleEditorState || this._ensureBundleEditorState();
        const allBundles = [
            ...(Array.isArray(state?.bundles) ? state.bundles : []),
            ...(Array.isArray(state?.customBundles) ? state.customBundles : []),
        ];
        const query = String(raw || '').trim().toLowerCase();
        const filtered = allBundles.filter((entry) => {
            if (!query) return true;
            const id = String(entry?.id || '').toLowerCase();
            const title = String(entry?.title || '').toLowerCase();
            return id.includes(query) || title.includes(query);
        }).length;
        return { filtered, total: allBundles.length };
    },
    _bundleEditorApplyFilterToSelect(raw = '') {
        const selectEl = document.getElementById('devlab-bundle-select');
        const counterEl = document.getElementById('devlab-bundle-filter-results');
        const query = String(raw || '').trim().toLowerCase();
        const currentValue = this._bundleEditorDropdownValue();
        if (selectEl) {
            let filtered = 0;
            let total = 0;
            Array.from(selectEl.options || []).forEach((optionEl) => {
                const value = String(optionEl.value || '');
                if (value === '__draft__') {
                    optionEl.hidden = false;
                    return;
                }
                total += 1;
                const haystack = `${value} ${String(optionEl.textContent || '')}`.toLowerCase();
                const matches = !query || haystack.includes(query);
                const keepVisible = matches || value === currentValue;
                optionEl.hidden = !keepVisible;
                if (matches) filtered += 1;
            });
            if (counterEl) {
                counterEl.textContent = `${filtered} de ${total} resultados`;
            }
            return;
        }
        if (counterEl) {
            const stats = this._bundleEditorFilterStats(query);
            counterEl.textContent = `${stats.filtered} de ${stats.total} resultados`;
        }
    },
    _bundleEditorSyncFilterUI() {
        const query = String(this._bundleEditorFilterQuery || '');
        const inputEl = document.getElementById('devlab-bundle-filter');
        if (inputEl && inputEl.value !== query) {
            inputEl.value = query;
        }
        this._bundleEditorApplyFilterToSelect(query);
    },
    bundleEditorSetFilter(raw = '') {
        const nextValue = String(raw || '');
        this._bundleEditorFilterQuery = nextValue;
        if (this._bundleEditorFilterDebounceTimer) {
            window.clearTimeout(this._bundleEditorFilterDebounceTimer);
        }
        this._bundleEditorFilterDebounceTimer = window.setTimeout(() => {
            this._bundleEditorFilterDebounceTimer = null;
            this._bundleEditorApplyFilterToSelect(this._bundleEditorFilterQuery || '');
        }, 90);
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
        this._bundleEditorClearConflictState();
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
