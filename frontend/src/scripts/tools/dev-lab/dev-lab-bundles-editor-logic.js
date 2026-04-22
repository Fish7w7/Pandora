(() => {
    if (!window.DevLab) return;
    Object.assign(window.DevLab, {
        _bundleEditorReadItems(raw = '') {
            return [...new Set(
                String(raw || '')
                    .split(/\r?\n|,/)
                    .map((entry) => String(entry || '').trim())
                    .filter(Boolean)
            )];
        },
        _bundleEditorReadForm() {
            const kindSelect = document.getElementById('devlab-bundle-kind');
            const kind = String(kindSelect?.value || 'official').trim() === 'custom' ? 'custom' : 'official';
            const id = String(document.getElementById('devlab-bundle-id')?.value || '').trim();
            const title = String(document.getElementById('devlab-bundle-title')?.value || '').trim();
            const subtitle = String(document.getElementById('devlab-bundle-subtitle')?.value || '').trim();
            const status = String(document.getElementById('devlab-bundle-status')?.value || 'active').trim();
            const launchedAt = String(document.getElementById('devlab-bundle-launched')?.value || '').trim();
            const startsAt = String(document.getElementById('devlab-bundle-start')?.value || '').trim();
            const endsAt = String(document.getElementById('devlab-bundle-end')?.value || '').trim();
            const discount = this._safeInt(document.getElementById('devlab-bundle-discount')?.value, 0, 0, 95);
            const priority = this._safeInt(document.getElementById('devlab-bundle-priority')?.value, 0, -9999, 9999);
            const minSourceAgeDays = this._safeInt(document.getElementById('devlab-bundle-minage')?.value, 0, 0, 9999);
            const globalMinAge = this._safeInt(document.getElementById('devlab-global-custom-minage')?.value, 90, 1, 9999);
            const items = this._bundleEditorReadItems(document.getElementById('devlab-bundle-items')?.value || '');
            const sourceBundleIds = this._bundleEditorReadItems(document.getElementById('devlab-bundle-sources')?.value || '');
            return {
                settings: {
                    customBundleMinAgeDays: globalMinAge,
                },
                bundle: {
                    id,
                    kind,
                    title,
                    subtitle,
                    status,
                    launchedAt,
                    startsAt,
                    endsAt,
                    items,
                    sourceBundleIds,
                    bundleDiscountPct: discount,
                    minSourceAgeDays: minSourceAgeDays > 0 ? minSourceAgeDays : undefined,
                    priority,
                    enabled: document.getElementById('devlab-bundle-enabled')?.checked !== false,
                    active: document.getElementById('devlab-bundle-active')?.checked !== false,
                    historical: document.getElementById('devlab-bundle-historical')?.checked === true,
                    legacy: document.getElementById('devlab-bundle-legacy')?.checked === true,
                    rerunAllowed: document.getElementById('devlab-bundle-rerun')?.checked === true,
                    allowInCustomPool: document.getElementById('devlab-bundle-allowcustom')?.checked !== false,
                },
            };
        },
        _bundleEditorSerializePayload(payload = {}) {
            const source = payload && typeof payload === 'object' ? payload : {};
            const sourceBundle = source.bundle && typeof source.bundle === 'object' ? source.bundle : {};
            const kind = String(sourceBundle.kind || 'official').trim().toLowerCase() === 'custom' ? 'custom' : 'official';
            const normalized = this._bundleEditorNormalize({
                version: 1,
                settings: {
                    customBundleMinAgeDays: this._safeInt(source.settings?.customBundleMinAgeDays, 90, 1, 9999),
                },
                bundles: kind === 'official' ? [sourceBundle] : [],
                customBundles: kind === 'custom' ? [sourceBundle] : [],
        });
        const normalizedBundle = kind === 'custom'
            ? (normalized.customBundles?.[0] || null)
            : (normalized.bundles?.[0] || null);
        return JSON.stringify({
            settings: {
                customBundleMinAgeDays: this._safeInt(normalized.settings?.customBundleMinAgeDays, 90, 1, 9999),
            },
            bundle: normalizedBundle || null,
        });
    },
    _bundleEditorSetBaselineFromPayload(payload = {}) {
        this._bundleEditorBaselineSerialized = this._bundleEditorSerializePayload(payload);
        this._bundleEditorDirty = false;
    },
    _bundleEditorParseDateMs(raw = '') {
        const value = String(raw || '').trim();
        if (!value) return null;
        const isoWithTimezone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;
        if (!isoWithTimezone.test(value)) return Number.NaN;
        const ms = Date.parse(value);
        return Number.isFinite(ms) ? ms : Number.NaN;
    },
    _bundleEditorValidatePayload(payload = {}) {
        const bundle = payload && typeof payload === 'object' ? (payload.bundle || {}) : {};
        const errors = [];
        const warnings = [];
        const fieldErrors = {};
        const fieldWarnings = {};
        const addError = (message, fieldId = '') => {
            const msg = String(message || '').trim();
            if (!msg) return;
            errors.push(msg);
            if (fieldId && !fieldErrors[fieldId]) fieldErrors[fieldId] = msg;
        };
        const addWarning = (message, fieldId = '') => {
            const msg = String(message || '').trim();
            if (!msg) return;
            warnings.push(msg);
            if (fieldId && !fieldWarnings[fieldId]) fieldWarnings[fieldId] = msg;
        };
        const id = String(bundle.id || '').trim();
        const title = String(bundle.title || '').trim();
        const status = String(bundle.status || 'active').trim().toLowerCase();
        const kind = String(bundle.kind || 'official').trim().toLowerCase() === 'custom' ? 'custom' : 'official';
        const items = Array.isArray(bundle.items) ? bundle.items.filter(Boolean) : [];
        const sourceBundleIds = Array.isArray(bundle.sourceBundleIds) ? bundle.sourceBundleIds.filter(Boolean) : [];
        const allowedStatus = new Set(['active', 'draft', 'archived', 'published']);
        if (!id) {
            addError('Informe um ID unico para o bundle.', 'devlab-bundle-id');
        } else if (!/^[a-z0-9_]+$/.test(id)) {
            addWarning('Use apenas letras minusculas, numeros e "_" no ID para manter o padrao.', 'devlab-bundle-id');
        }
        if (!title) {
            addError('Informe o nome exibido do bundle.', 'devlab-bundle-title');
        }
        if (!items.length) {
            addError('Adicione pelo menos 1 item no bundle.', 'devlab-bundle-items');
        }
        if (!allowedStatus.has(status)) {
            addWarning('Status fora do padrao conhecido. Prefira active, draft, published ou archived.', 'devlab-bundle-status');
        }
        const launchedMs = this._bundleEditorParseDateMs(bundle.launchedAt);
        const startsMs = this._bundleEditorParseDateMs(bundle.startsAt);
        const endsMs = this._bundleEditorParseDateMs(bundle.endsAt);
        if (Number.isNaN(launchedMs)) addError('Data de lancamento invalida. Use ISO-8601 com timezone (ex: 2026-05-01T00:00:00-03:00).', 'devlab-bundle-launched');
        if (Number.isNaN(startsMs)) addError('Inicio de disponibilidade invalido. Use ISO-8601 com timezone.', 'devlab-bundle-start');
        if (Number.isNaN(endsMs)) addError('Fim de disponibilidade invalido. Use ISO-8601 com timezone.', 'devlab-bundle-end');
        if (Number.isFinite(startsMs) && Number.isFinite(endsMs) && startsMs > endsMs) {
            addError('A data de inicio nao pode ser maior que a data de fim.', 'devlab-bundle-start');
            if (!fieldErrors['devlab-bundle-end']) {
                fieldErrors['devlab-bundle-end'] = 'A data de fim deve ser posterior ao inicio.';
            }
        }
        if (items.length) {
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
            const missingItems = items.filter((itemId) => !getInventoryItem(itemId));
            if (missingItems.length) {
                const preview = missingItems.slice(0, 4).join(', ');
                const suffix = missingItems.length > 4 ? ` e +${missingItems.length - 4}` : '';
                addWarning(`IDs de itens nao encontrados no Inventory: ${preview}${suffix}.`, 'devlab-bundle-items');
            }
        }
        if (kind !== 'custom' && sourceBundleIds.length) {
            addWarning('IDs de bundles fonte so impactam bundles personalizados.', 'devlab-bundle-sources');
        }
        if (kind === 'custom' && !sourceBundleIds.length) {
            addWarning('Sem bundles fonte definidos: o custom pode considerar todas as fontes elegiveis.', 'devlab-bundle-sources');
        }
        const discount = this._safeInt(bundle.bundleDiscountPct, 0, 0, 95);
        if (discount >= 60) {
            addWarning('Desconto alto. Revise para evitar precificacao agressiva demais.', 'devlab-bundle-discount');
        }
        const state = this._bundleEditorState || this._ensureBundleEditorState();
        const selection = this._bundleEditorSelection || {};
        if (id) {
            const all = [
                ...(Array.isArray(state?.bundles) ? state.bundles : []),
                ...(Array.isArray(state?.customBundles) ? state.customBundles : []),
            ];
            const collision = all.find((entry) => entry?.id === id) || null;
            const currentId = String(selection.id || '');
            if (collision && currentId !== id) {
                addWarning(`Ja existe um bundle com ID "${id}". Salvar agora vai sobrescrever esse registro.`, 'devlab-bundle-id');
            }
            if (sourceBundleIds.length) {
                const knownBundleIds = new Set(all.map((entry) => String(entry?.id || '').trim()).filter(Boolean));
                const missingSourceIds = sourceBundleIds.filter((sourceId) => !knownBundleIds.has(String(sourceId || '').trim()));
                if (missingSourceIds.length) {
                    const preview = missingSourceIds.slice(0, 4).join(', ');
                    const suffix = missingSourceIds.length > 4 ? ` e +${missingSourceIds.length - 4}` : '';
                    addWarning(`Bundles fonte nao encontrados no catalogo atual: ${preview}${suffix}.`, 'devlab-bundle-sources');
                }
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            fieldErrors,
            fieldWarnings,
        };
    },
    _bundleEditorBuildLiveSummary(payload = {}, report = null) {
        const bundle = payload && typeof payload === 'object' ? (payload.bundle || {}) : {};
        const status = String(bundle.status || 'active').trim().toLowerCase();
        const enabled = bundle.enabled !== false;
        const active = bundle.active !== false;
        const now = Date.now();
        const startsMs = this._bundleEditorParseDateMs(bundle.startsAt);
        const endsMs = this._bundleEditorParseDateMs(bundle.endsAt);
        const items = Array.isArray(bundle.items) ? bundle.items.filter(Boolean) : [];
        const discount = this._safeInt(bundle.bundleDiscountPct, 0, 0, 95);
        const fmtDate = (raw, ms) => {
            const value = String(raw || '').trim();
            if (!value) return 'nao definido';
            if (Number.isNaN(ms)) return 'invalido';
            return new Date(ms).toLocaleString('pt-BR');
        };
        let janela = 'Sem janela de vigencia definida';
        if (Number.isNaN(startsMs) || Number.isNaN(endsMs)) {
            janela = 'Datas invalidas';
        } else if (Number.isFinite(startsMs) && now < startsMs) {
            janela = 'Agendado (inicio no futuro)';
        } else if (Number.isFinite(endsMs) && now > endsMs) {
            janela = 'Encerrado (fora da vigencia)';
        } else if (Number.isFinite(startsMs) || Number.isFinite(endsMs)) {
            janela = 'Dentro da janela de vigencia';
        }
        const bloqueios = [];
        if (!enabled) bloqueios.push('enabled=false');
        if (!active) bloqueios.push('active=false');
        if (status === 'draft' || status === 'archived') bloqueios.push(`status=${status}`);
        const visibilidade = bloqueios.length ? `Nao exibivel agora (${bloqueios.join(', ')})` : 'Apto para exibicao na loja';
        let headline = 'Bundle pronto para salvar.';
        let headlineTone = 'ok';
        const safeReport = report && typeof report === 'object' ? report : { errors: [], warnings: [] };
        if ((safeReport.errors || []).length) {
            headline = `Corrija ${(safeReport.errors || []).length} pendencia(s) antes de salvar.`;
            headlineTone = 'error';
        } else if ((safeReport.warnings || []).length) {
            headline = `Revisar ${(safeReport.warnings || []).length} alerta(s) antes de publicar.`;
            headlineTone = 'warning';
        }
        return {
            headline,
            headlineTone,
            visibilidade,
            janela,
            periodo: `${fmtDate(bundle.startsAt, startsMs)} ate ${fmtDate(bundle.endsAt, endsMs)}`,
            itens: items.length,
            desconto: `${discount}%`,
        };
    },
    _bundleEditorSetFieldFeedback(fieldId = '', message = '', level = '') {
        const input = document.getElementById(fieldId);
        const feedback = document.getElementById(`${fieldId}-feedback`);
        const c = this._colors();
        const hasError = level === 'error';
        const hasWarning = level === 'warning';
        const borderColor = hasError
            ? (this._isDark() ? 'rgba(248,113,113,0.88)' : 'rgba(220,38,38,0.75)')
            : hasWarning
                ? (this._isDark() ? 'rgba(250,204,21,0.82)' : 'rgba(217,119,6,0.68)')
                : c.border;
        if (input) {
            input.style.borderColor = borderColor;
        }
        if (feedback) {
            const text = String(message || '').trim();
            feedback.textContent = text;
            feedback.style.display = text ? 'block' : 'none';
            feedback.style.color = hasError
                ? (this._isDark() ? '#fca5a5' : '#b91c1c')
                : hasWarning
                    ? (this._isDark() ? '#fde68a' : '#92400e')
                    : c.muted;
        }
    },
    bundleEditorPreviewUpdate() {
        if (!document.getElementById('devlab-bundle-id')) return null;
        const payload = this._bundleEditorReadForm();
        const report = this._bundleEditorValidatePayload(payload);
        const summary = this._bundleEditorBuildLiveSummary(payload, report);
        const currentSerialized = this._bundleEditorSerializePayload(payload);
        const hasBaseline = typeof this._bundleEditorBaselineSerialized === 'string' && this._bundleEditorBaselineSerialized.length > 0;
        const isDirty = !!(hasBaseline && currentSerialized !== this._bundleEditorBaselineSerialized);
        this._bundleEditorDirty = isDirty;
        const c = this._colors();
        const toneBg = summary.headlineTone === 'error'
            ? c.dangerBg
            : summary.headlineTone === 'warning'
                ? c.warnBg
                : c.okBg;
        const toneBorder = summary.headlineTone === 'error'
            ? c.dangerBorder
            : summary.headlineTone === 'warning'
                ? c.warnBorder
                : c.okBorder;
        const toneColor = summary.headlineTone === 'error'
            ? (this._isDark() ? '#fecaca' : '#b91c1c')
            : summary.headlineTone === 'warning'
                ? (this._isDark() ? '#fde68a' : '#92400e')
                : (this._isDark() ? '#86efac' : '#065f46');
        const setText = (id, value) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.textContent = String(value || '');
        };
        const headlineBox = document.getElementById('devlab-bundle-live-headline-box');
        if (headlineBox) {
            headlineBox.style.background = toneBg;
            headlineBox.style.borderColor = toneBorder;
        }
        const headlineText = document.getElementById('devlab-bundle-live-headline');
        if (headlineText) {
            headlineText.style.color = toneColor;
            headlineText.textContent = summary.headline;
        }
        setText('devlab-bundle-live-visibility', summary.visibilidade);
        setText('devlab-bundle-live-window', summary.janela);
        setText('devlab-bundle-live-period', summary.periodo);
        setText('devlab-bundle-live-items', `${summary.itens}`);
        setText('devlab-bundle-live-discount', summary.desconto);
        setText('devlab-bundle-live-dirty', isDirty ? 'Sim, com alteracoes pendentes' : 'Nao, tudo sincronizado');
        const dirtyPill = document.getElementById('devlab-bundle-dirty-pill');
        if (dirtyPill) {
            dirtyPill.textContent = isDirty ? 'Rascunho nao salvo' : 'Sem pendencias locais';
            dirtyPill.style.color = isDirty
                ? (this._isDark() ? '#fde68a' : '#92400e')
                : (this._isDark() ? '#86efac' : '#065f46');
            dirtyPill.style.background = isDirty ? c.warnBg : c.okBg;
            dirtyPill.style.borderColor = isDirty ? c.warnBorder : c.okBorder;
        }
        const errorsEl = document.getElementById('devlab-bundle-live-errors');
        if (errorsEl) {
            const html = report.errors.length
                ? report.errors.map((msg) => `<div>- ${this._escapeHtml(msg)}</div>`).join('')
                : '<div>Sem pendencias obrigatorias.</div>';
            errorsEl.innerHTML = html;
            errorsEl.style.color = report.errors.length
                ? (this._isDark() ? '#fecaca' : '#b91c1c')
                : c.muted;
        }
        const warningsEl = document.getElementById('devlab-bundle-live-warnings');
        if (warningsEl) {
            const html = report.warnings.length
                ? report.warnings.map((msg) => `<div>- ${this._escapeHtml(msg)}</div>`).join('')
                : '<div>Sem alertas no momento.</div>';
            warningsEl.innerHTML = html;
            warningsEl.style.color = report.warnings.length
                ? (this._isDark() ? '#fde68a' : '#92400e')
                : c.muted;
        }
        const fieldIds = [
            'devlab-bundle-id',
            'devlab-bundle-title',
            'devlab-bundle-launched',
            'devlab-bundle-start',
            'devlab-bundle-end',
            'devlab-bundle-items',
            'devlab-bundle-sources',
            'devlab-bundle-discount',
            'devlab-bundle-status',
        ];
        fieldIds.forEach((fieldId) => {
            const err = report.fieldErrors?.[fieldId] || '';
            const warn = report.fieldWarnings?.[fieldId] || '';
            if (err) {
                this._bundleEditorSetFieldFeedback(fieldId, err, 'error');
                return;
            }
            if (warn) {
                this._bundleEditorSetFieldFeedback(fieldId, warn, 'warning');
                return;
            }
            this._bundleEditorSetFieldFeedback(fieldId, '', '');
        });
        return report;
    },
    });
})();
