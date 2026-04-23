const DevLab = {
    _isDark() {
        return document.body.classList.contains('dark-theme');
    },
    _colors() {
        const d = this._isDark();
        return {
            bg: d ? 'rgba(255,255,255,0.04)' : '#ffffff',
            border: d ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)',
            borderStrong: d ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.18)',
            text: d ? '#f1f5f9' : '#0f172a',
            sub: d ? 'rgba(255,255,255,0.72)' : 'rgba(15,23,42,0.72)',
            muted: d ? 'rgba(255,255,255,0.48)' : 'rgba(15,23,42,0.5)',
            panel: d ? 'rgba(255,255,255,0.03)' : 'rgba(248,250,252,0.9)',
            warnBg: d ? 'rgba(245,158,11,0.13)' : 'rgba(245,158,11,0.11)',
            warnBorder: d ? 'rgba(245,158,11,0.35)' : 'rgba(217,119,6,0.28)',
            dangerBg: d ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)',
            dangerBorder: d ? 'rgba(239,68,68,0.3)' : 'rgba(220,38,38,0.24)',
            okBg: d ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.09)',
            okBorder: d ? 'rgba(16,185,129,0.34)' : 'rgba(5,150,105,0.26)',
        };
    },
    _safeInt(value, fallback = 0, min = 0, max = 999999999) {
        const n = Number(value);
        if (!Number.isFinite(n)) return fallback;
        const parsed = Math.floor(n);
        return Math.max(min, Math.min(max, parsed));
    },
    _escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },
    _cloneJSON(value) {
        try {
            return JSON.parse(JSON.stringify(value));
        } catch (_) {
            return null;
        }
    },
    render() {
        const c = this._colors();
        const canShow = window.DevSecurity?.canShowTool?.();
        if (!canShow) {
            const snap = window.DevSecurity?.snapshot?.() || {};
            const reason = snap.isDevEnv
                ? 'Esta conta nao esta autorizada para abrir o Dev Lab.'
                : 'Disponivel apenas em ambiente developer.';
            return `<div style="max-width:680px;margin:0 auto;padding:2rem 1rem;text-align:center;color:${c.muted};font-family:'DM Sans',sans-serif;">
                <div style="font-size:2.4rem;opacity:0.35;margin-bottom:0.7rem;">\u{1F512}</div>
                <div style="font-size:1rem;font-weight:800;color:${c.sub};font-family:'Syne',sans-serif;">Acesso dev indisponivel</div>
                <p style="font-size:0.75rem;margin-top:0.35rem;">${reason}</p>
            </div>`;
        }
        const unlocked = window.DevSecurity?.isUnlocked?.();
        const snap = window.DevSecurity?.snapshot?.() || {};
        const eco = this._economySnapshot();
        const season = this._seasonSnapshot();
        const lockoutSecs = Math.ceil((snap.lockoutRemainingMs || 0) / 1000);
        const remoteReady = this._isRemoteReady();
        const remote = this._remoteTarget || null;
        const remoteTag = remote?.nyanTag ? this._escapeHtml(remote.nyanTag) : '';
        const remoteName = remote?.username ? this._escapeHtml(remote.username) : '';
        const remoteUID = remote?.uid ? this._escapeHtml(this._shortUid(remote.uid)) : '';
        const sessionUIDRaw = this._sessionUID();
        const sessionUID = sessionUIDRaw ? this._escapeHtml(this._shortUid(sessionUIDRaw)) : '';
        const sessionMismatch = !!(remote?.uid && sessionUIDRaw && String(remote.uid) !== String(sessionUIDRaw));
        const remoteLabel = remoteName || remoteTag || '';
        const remoteQuery = this._escapeHtml(this._remoteQuery || '');
        const activeSection = this._getActiveSection();
        const bundleState = this._ensureBundleEditorState();
        const bundleMeta = bundleState?.meta || {};
        const bundleSelection = this._selectedBundleRecord();
        const activeBundle = bundleSelection.bundle || this._bundleEditorDraft(bundleSelection.kind || 'official');
        const bundlesJoined = [
            ...(Array.isArray(bundleState?.bundles) ? bundleState.bundles : []),
            ...(Array.isArray(bundleState?.customBundles) ? bundleState.customBundles : []),
        ];
        const bundleFilterQuery = String(this._bundleEditorFilterQuery || '').trim();
        const bundleFilterNeedle = bundleFilterQuery.toLowerCase();
        const bundleOptions = bundlesJoined
            .map((entry) => {
                const kind = entry.kind === 'custom' ? 'custom' : 'official';
                const marker = kind === 'custom' ? '[Personalizado]' : '[Oficial]';
                const label = this._escapeHtml(entry.title || entry.id || 'Bundle');
                const id = this._escapeHtml(entry.id || '');
                const selected = this._bundleEditorDropdownValue() === `${kind}::${entry.id}` ? 'selected' : '';
                return `<option value="${kind}::${id}" ${selected}>${marker} ${label} (${id})</option>`;
            })
            .join('');
        const filteredBundleCount = bundlesJoined.filter((entry) => {
            if (!bundleFilterNeedle) return true;
            const id = String(entry?.id || '').toLowerCase();
            const title = String(entry?.title || '').toLowerCase();
            return id.includes(bundleFilterNeedle) || title.includes(bundleFilterNeedle);
        }).length;
        const activeBundleKind = String(activeBundle.kind || bundleSelection.kind || 'official') === 'custom' ? 'custom' : 'official';
        const activeBundleItems = Array.isArray(activeBundle.items) ? activeBundle.items.join('\n') : '';
        const activeBundleSources = Array.isArray(activeBundle.sourceBundleIds) ? activeBundle.sourceBundleIds.join('\n') : '';
        const bundleMetaSource = this._escapeHtml(String(bundleMeta.source || window.Shop?._bundleCatalogMeta?.source || 'runtime'));
        const bundleMetaUpdated = this._escapeHtml(String(bundleMeta.updatedAt || window.Shop?._bundleCatalogMeta?.updatedAt || '-'));
        const bundleMetaFetched = Number(bundleMeta.fetchedAt || window.Shop?._bundleCatalogMeta?.fetchedAt || 0);
        const bundleMetaFetchedLabel = bundleMetaFetched > 0
            ? this._escapeHtml(new Date(bundleMetaFetched).toLocaleString('pt-BR'))
            : '-';
        const historyEntries = Array.isArray(this._bundleEditorHistoryEntries) ? this._bundleEditorHistoryEntries : [];
        const historyLoading = this._bundleEditorHistoryLoading === true;
        const historySelectedId = String(this._bundleEditorHistorySelectedId || '');
        const historyOptions = historyEntries
            .map((entry) => {
                const safeId = this._escapeHtml(String(entry?.id || ''));
                const updatedAtRaw = String(entry?.updatedAt || '').trim();
                const updatedAtLabel = updatedAtRaw
                    ? this._escapeHtml(new Date(updatedAtRaw).toLocaleString('pt-BR'))
                    : '-';
                const action = this._escapeHtml(String(entry?.action || 'published'));
                const selected = safeId && safeId === historySelectedId ? 'selected' : '';
                return `<option value="${safeId}" ${selected}>${updatedAtLabel} · ${action} · ${safeId}</option>`;
            })
            .join('');
        const historySelected = historyEntries.find((entry) => String(entry?.id || '') === historySelectedId) || null;
        const historySelectedMeta = historySelected
            ? this._escapeHtml(
                `${String(historySelected.action || 'published')} · ${String(historySelected.updatedBy?.username || historySelected.updatedBy?.nyanTag || historySelected.updatedBy?.uid || 'autor desconhecido')}`
            )
            : '-';
        const bundleAudit = this._bundleEditorLastAudit && typeof this._bundleEditorLastAudit === 'object'
            ? this._bundleEditorLastAudit
            : null;
        const bundleAuditLabel = bundleAudit?.generatedAtMs
            ? this._escapeHtml(new Date(bundleAudit.generatedAtMs).toLocaleString('pt-BR'))
            : 'sem auditoria recente';
        const bundleAuditErrors = this._safeInt(bundleAudit?.errorCount, 0, 0, 9999);
        const bundleAuditWarnings = this._safeInt(bundleAudit?.warningCount, 0, 0, 9999);
        const publisherAuthInfo = this._bundleEditorPublisherAuthInfo && typeof this._bundleEditorPublisherAuthInfo === 'object'
            ? this._bundleEditorPublisherAuthInfo
            : null;
        const publisherAuthLabel = publisherAuthInfo?.available
            ? (publisherAuthInfo.devPublisher ? 'Claim devPublisher ativa' : 'Claim devPublisher ausente')
            : 'Claim devPublisher nao verificada';
        const bundleConflict = this._bundleEditorLastConflict && typeof this._bundleEditorLastConflict === 'object'
            ? this._bundleEditorLastConflict
            : null;
        const bundleConflictActive = !!bundleConflict;
        const bundleConflictLabel = bundleConflict?.remoteUpdatedLabel
            ? this._escapeHtml(bundleConflict.remoteUpdatedLabel)
            : '-';
        const globalMinAgeDays = this._safeInt(bundleState?.settings?.customBundleMinAgeDays, 90, 1, 9999);
        const officialBundleCount = Array.isArray(bundleState?.bundles) ? bundleState.bundles.length : 0;
        const customBundleCount = Array.isArray(bundleState?.customBundles) ? bundleState.customBundles.length : 0;
        const totalBundleCount = officialBundleCount + customBundleCount;
        const selectedBundleName = this._escapeHtml(activeBundle.title || 'Sem nome');
        const selectedBundleId = this._escapeHtml(activeBundle.id || 'rascunho');
        this._bundleEditorSetBaselineFromPayload({
            settings: {
                customBundleMinAgeDays: globalMinAgeDays,
            },
            bundle: {
                id: String(activeBundle.id || '').trim(),
                kind: activeBundleKind,
                title: String(activeBundle.title || ''),
                subtitle: String(activeBundle.subtitle || ''),
                status: String(activeBundle.status || 'active'),
                launchedAt: String(activeBundle.launchedAt || ''),
                startsAt: String(activeBundle.startsAt || ''),
                endsAt: String(activeBundle.endsAt || ''),
                items: Array.isArray(activeBundle.items) ? [...activeBundle.items] : [],
                sourceBundleIds: Array.isArray(activeBundle.sourceBundleIds) ? [...activeBundle.sourceBundleIds] : [],
                bundleDiscountPct: this._safeInt(activeBundle.bundleDiscountPct, 0, 0, 95),
                minSourceAgeDays: this._safeInt(activeBundle.minSourceAgeDays, 0, 0, 9999) || undefined,
                priority: this._safeInt(activeBundle.priority, 0, -9999, 9999),
                enabled: activeBundle.enabled !== false,
                active: activeBundle.active !== false,
                historical: activeBundle.historical === true,
                legacy: activeBundle.legacy === true,
                rerunAllowed: activeBundle.rerunAllowed !== false,
                allowInCustomPool: activeBundle.allowInCustomPool !== false,
            },
        });
        return `
        <div style="max-width:760px;margin:0 auto;font-family:'DM Sans',sans-serif;color:${c.text};">
            <div style="border-radius:20px;border:1px solid ${c.borderStrong};background:${c.bg};padding:1rem;">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:0.8rem;flex-wrap:wrap;margin-bottom:0.9rem;">
                    <div>
                        <div style="display:inline-flex;align-items:center;padding:0.24rem 0.62rem;border-radius:999px;
                            font-size:0.6rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;
                            color:${unlocked ? '#10b981' : '#f97316'};
                            background:${unlocked ? c.okBg : c.warnBg};
                            border:1px solid ${unlocked ? c.okBorder : c.warnBorder};">
                            ${unlocked ? 'Sessao dev ativa' : 'Sessao dev bloqueada'}
                        </div>
                        <h1 style="margin:0.45rem 0 0.12rem;font-size:1.55rem;font-weight:900;font-family:'Syne',sans-serif;
                            background:linear-gradient(135deg,#f97316,#ef4444);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
                            \u{1F6E0}\uFE0F Dev Lab
                        </h1>
                        <p style="margin:0;font-size:0.74rem;color:${c.sub};">Ajuste controlado de economia e temporada para testes internos.</p>
                    </div>
                    <div style="display:flex;gap:0.45rem;align-items:center;">
                        ${unlocked
                            ? `<button onclick="DevLab.lock()" style="padding:0.5rem 0.75rem;border-radius:10px;border:1px solid ${c.border};background:${c.panel};color:${c.sub};font-size:0.72rem;font-weight:700;cursor:pointer;">Bloquear</button>`
                            : `<button onclick="DevLab.unlock()" style="padding:0.5rem 0.75rem;border-radius:10px;border:none;background:linear-gradient(135deg,#fb7185,#f97316);color:#fff;font-size:0.72rem;font-weight:800;cursor:pointer;">Desbloquear</button>`}
                    </div>
                </div>
                ${!unlocked ? `
                    <div style="border-radius:14px;padding:0.82rem;border:1px solid ${c.warnBorder};background:${c.warnBg};font-size:0.74rem;color:${c.sub};">
                        Digite sua chave dev para liberar as acoes de edicao.
                        ${lockoutSecs > 0 ? `<div style="margin-top:0.38rem;color:${c.text};font-weight:700;">Tentativas bloqueadas por ${lockoutSecs}s.</div>` : ''}
                    </div>
                ` : ''}
                <div style="margin-top:0.9rem;padding:0.3rem;border-radius:12px;border:1px solid ${c.border};
                    background:${c.panel};display:flex;gap:0.3rem;flex-wrap:wrap;">
                    <button onclick="DevLab.setSection('geral')"
                        style="flex:1;min-width:170px;padding:0.5rem 0.6rem;border-radius:10px;border:1px solid ${activeSection === 'geral' ? 'rgba(168,85,247,0.35)' : 'transparent'};
                        background:${activeSection === 'geral' ? (this._isDark() ? 'rgba(255,255,255,0.08)' : '#fff') : 'transparent'};
                        color:${activeSection === 'geral' ? 'var(--theme-primary,#a855f7)' : c.sub};
                        font-size:0.72rem;font-weight:800;cursor:pointer;">
                        Painel geral
                    </button>
                    <button onclick="DevLab.setSection('bundles')"
                        style="flex:1;min-width:170px;padding:0.5rem 0.6rem;border-radius:10px;border:1px solid ${activeSection === 'bundles' ? 'rgba(16,185,129,0.38)' : 'transparent'};
                        background:${activeSection === 'bundles' ? (this._isDark() ? 'rgba(16,185,129,0.16)' : 'rgba(16,185,129,0.1)') : 'transparent'};
                        color:${activeSection === 'bundles' ? (this._isDark() ? '#86efac' : '#047857') : c.sub};
                        font-size:0.72rem;font-weight:800;cursor:pointer;">
                        Painel de bundles
                    </button>
                </div>
                <div style="display:${activeSection === 'geral' ? 'grid' : 'none'};grid-template-columns:1fr 1fr;gap:0.75rem;margin-top:0.9rem;">
                    <section style="border-radius:14px;border:1px solid ${c.border};background:${c.panel};padding:0.75rem;">
                        <div style="font-size:0.67rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${c.muted};margin-bottom:0.55rem;">Economia</div>
                        <label style="display:block;font-size:0.67rem;color:${c.sub};margin-bottom:0.2rem;">Chips</label>
                        <input id="devlab-chips" type="number" min="0" value="${eco.chips}"
                            style="width:100%;padding:0.5rem 0.58rem;border-radius:10px;border:1px solid ${c.border};
                                background:${c.bg};color:${c.text};font-size:0.78rem;margin-bottom:0.55rem;"/>
                        <label style="display:block;font-size:0.67rem;color:${c.sub};margin-bottom:0.2rem;">XP total</label>
                        <input id="devlab-totalxp" type="number" min="0" value="${eco.totalXP}"
                            style="width:100%;padding:0.5rem 0.58rem;border-radius:10px;border:1px solid ${c.border};
                                background:${c.bg};color:${c.text};font-size:0.78rem;margin-bottom:0.45rem;"/>
                        <div style="font-size:0.66rem;color:${c.muted};margin-bottom:0.55rem;">Nivel atual: ${eco.level} (${eco.xp}/${eco.xpToNext} XP)</div>
                        <div style="display:flex;gap:0.45rem;flex-wrap:wrap;margin-bottom:0.55rem;">
                            <button onclick="DevLab.applyEconomyFromForm()" ${unlocked ? '' : 'disabled'}
                                style="padding:0.44rem 0.62rem;border-radius:9px;border:none;background:linear-gradient(135deg,#a855f7,#ec4899);color:#fff;
                                    font-size:0.7rem;font-weight:800;cursor:${unlocked ? 'pointer' : 'not-allowed'};opacity:${unlocked ? '1' : '0.5'};">Aplicar</button>
                        </div>
                        <label style="display:block;font-size:0.64rem;color:${c.muted};margin-bottom:0.2rem;">Delta chips (+/-)</label>
                        <div style="display:flex;gap:0.4rem;align-items:center;margin-bottom:0.4rem;">
                            <input id="devlab-chips-delta" type="number" step="1" value="1000"
                                style="flex:1;padding:0.42rem 0.52rem;border-radius:9px;border:1px solid ${c.border};
                                    background:${c.bg};color:${c.text};font-size:0.72rem;"/>
                            <button onclick="DevLab.addChipsFromForm()" ${unlocked ? '' : 'disabled'}
                                style="padding:0.42rem 0.58rem;border-radius:9px;border:1px solid ${c.border};background:${c.bg};color:${c.sub};
                                    font-size:0.68rem;font-weight:700;cursor:${unlocked ? 'pointer' : 'not-allowed'};opacity:${unlocked ? '1' : '0.5'};">Aplicar delta</button>
                        </div>
                        <label style="display:block;font-size:0.64rem;color:${c.muted};margin-bottom:0.2rem;">Delta XP total (+/-)</label>
                        <div style="display:flex;gap:0.4rem;align-items:center;">
                            <input id="devlab-totalxp-delta" type="number" step="1" value="1000"
                                style="flex:1;padding:0.42rem 0.52rem;border-radius:9px;border:1px solid ${c.border};
                                    background:${c.bg};color:${c.text};font-size:0.72rem;"/>
                            <button onclick="DevLab.addTotalXPFromForm()" ${unlocked ? '' : 'disabled'}
                                style="padding:0.42rem 0.58rem;border-radius:9px;border:1px solid ${c.border};background:${c.bg};color:${c.sub};
                                    font-size:0.68rem;font-weight:700;cursor:${unlocked ? 'pointer' : 'not-allowed'};opacity:${unlocked ? '1' : '0.5'};">Aplicar delta</button>
                        </div>
                    </section>
                    <section style="border-radius:14px;border:1px solid ${c.border};background:${c.panel};padding:0.75rem;">
                        <div style="font-size:0.67rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${c.muted};margin-bottom:0.55rem;">Temporada</div>
                        ${season ? `
                            <div style="font-size:0.78rem;font-weight:800;color:${c.text};margin-bottom:0.18rem;">${season.icon} ${season.name}</div>
                            <div style="font-size:0.66rem;color:${c.muted};margin-bottom:0.55rem;">Tier atual: ${season.tierLabel} | Claimed: ${season.claimed ? 'sim' : 'nao'}</div>
                            <label style="display:block;font-size:0.67rem;color:${c.sub};margin-bottom:0.2rem;">XP sazonal</label>
                            <input id="devlab-seasonxp" type="number" min="0" value="${season.seasonXP}"
                                style="width:100%;padding:0.5rem 0.58rem;border-radius:10px;border:1px solid ${c.border};
                                    background:${c.bg};color:${c.text};font-size:0.78rem;margin-bottom:0.45rem;"/>
                            <label style="display:flex;align-items:center;gap:0.35rem;font-size:0.67rem;color:${c.sub};margin-bottom:0.55rem;">
                                <input id="devlab-season-unclaim" type="checkbox"/> Desmarcar recompensa final (claimed=false)
                            </label>
                            <div style="display:flex;gap:0.45rem;flex-wrap:wrap;margin-bottom:0.55rem;">
                                <button onclick="DevLab.applySeasonFromForm()" ${unlocked ? '' : 'disabled'}
                                    style="padding:0.44rem 0.62rem;border-radius:9px;border:none;background:linear-gradient(135deg,#fb7185,#f97316);color:#fff;
                                        font-size:0.7rem;font-weight:800;cursor:${unlocked ? 'pointer' : 'not-allowed'};opacity:${unlocked ? '1' : '0.5'};">Aplicar</button>
                            </div>
                            <label style="display:block;font-size:0.64rem;color:${c.muted};margin-bottom:0.2rem;">Delta XP sazonal (+/-)</label>
                            <div style="display:flex;gap:0.4rem;align-items:center;">
                                <input id="devlab-season-delta" type="number" step="1" value="250"
                                    style="flex:1;padding:0.42rem 0.52rem;border-radius:9px;border:1px solid ${c.border};
                                        background:${c.bg};color:${c.text};font-size:0.72rem;"/>
                                <button onclick="DevLab.addSeasonXPFromForm()" ${unlocked ? '' : 'disabled'}
                                    style="padding:0.42rem 0.58rem;border-radius:9px;border:1px solid ${c.border};background:${c.bg};color:${c.sub};
                                        font-size:0.68rem;font-weight:700;cursor:${unlocked ? 'pointer' : 'not-allowed'};opacity:${unlocked ? '1' : '0.5'};">Aplicar delta</button>
                            </div>
                        ` : `
                            <div style="font-size:0.74rem;color:${c.muted};">Nenhuma temporada ativa para editar.</div>
                        `}
                    </section>
                </div>
                <section style="display:${activeSection === 'geral' ? 'block' : 'none'};margin-top:0.8rem;border-radius:14px;border:1px solid ${c.border};background:${c.panel};padding:0.75rem;">
                    <div style="font-size:0.7rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${c.sub};margin-bottom:0.38rem;">Outros perfis (online)</div>
                    ${remoteReady ? `
                        <div style="display:flex;gap:0.45rem;align-items:center;flex-wrap:wrap;margin-bottom:0.6rem;">
                            <input id="devlab-target" type="text" value="${remoteQuery}" placeholder="UID ou NyanTag (ex: nome#1234)"
                                style="flex:1;min-width:220px;padding:0.46rem 0.58rem;border-radius:9px;border:1px solid ${c.border};
                                    background:${c.bg};color:${c.text};font-size:0.74rem;"/>
                            <button onclick="DevLab.loadRemoteTargetFromForm()" ${unlocked ? '' : 'disabled'}
                                style="padding:0.44rem 0.62rem;border-radius:9px;border:none;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;
                                    font-size:0.7rem;font-weight:800;cursor:${unlocked ? 'pointer' : 'not-allowed'};opacity:${unlocked ? '1' : '0.5'};">Carregar alvo</button>
                            ${remote ? `
                            <button onclick="DevLab.clearRemoteTarget()" ${unlocked ? '' : 'disabled'}
                                style="padding:0.44rem 0.62rem;border-radius:9px;border:1px solid ${c.border};background:${c.bg};color:${c.sub};
                                    font-size:0.7rem;font-weight:700;cursor:${unlocked ? 'pointer' : 'not-allowed'};opacity:${unlocked ? '1' : '0.5'};">Limpar</button>` : ''}
                        </div>
                        ${remote ? `
                        <div style="border-radius:10px;border:1px solid ${c.border};background:${c.bg};padding:0.55rem 0.62rem;margin-bottom:0.55rem;font-size:0.72rem;color:${c.sub};">
                            Alvo: <strong style="color:${c.text};">${remoteLabel || 'Jogador'}</strong>
                            ${remoteTag ? `<span style="opacity:0.85;"> (${remoteTag})</span>` : ''}
                            <span style="opacity:0.75;"> | UID ${remoteUID}</span><br/>
                            <span style="opacity:0.8;color:${sessionMismatch ? '#f97316' : c.sub};">Sessao online UID ${sessionUID || '---'}${sessionMismatch ? ' (diferente do alvo)' : ''}</span><br/>
                            <span style="opacity:0.85;">Nv ${remote.level} | ${remote.chips.toLocaleString('pt-BR')} chips | ${remote.totalXP.toLocaleString('pt-BR')} XP total | ${remote.seasonXP.toLocaleString('pt-BR')} XP sazonal</span>
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.45rem;">
                            <div>
                                <label style="display:block;font-size:0.62rem;color:${c.muted};margin-bottom:0.18rem;">Delta chips (+/-)</label>
                                <div style="display:flex;gap:0.35rem;">
                                    <input id="devlab-remote-chips-delta" type="number" step="1" value="500"
                                        style="flex:1;padding:0.4rem 0.5rem;border-radius:8px;border:1px solid ${c.border};background:${c.bg};color:${c.text};font-size:0.7rem;"/>
                                    <button onclick="DevLab.addRemoteChipsFromForm()" ${unlocked ? '' : 'disabled'}
                                        style="padding:0.4rem 0.5rem;border-radius:8px;border:1px solid ${c.border};background:${c.bg};color:${c.sub};font-size:0.66rem;font-weight:700;cursor:${unlocked ? 'pointer' : 'not-allowed'};opacity:${unlocked ? '1' : '0.5'};">Aplicar</button>
                                </div>
                            </div>
                            <div>
                                <label style="display:block;font-size:0.62rem;color:${c.muted};margin-bottom:0.18rem;">Delta XP total (+/-)</label>
                                <div style="display:flex;gap:0.35rem;">
                                    <input id="devlab-remote-totalxp-delta" type="number" step="1" value="500"
                                        style="flex:1;padding:0.4rem 0.5rem;border-radius:8px;border:1px solid ${c.border};background:${c.bg};color:${c.text};font-size:0.7rem;"/>
                                    <button onclick="DevLab.addRemoteTotalXPFromForm()" ${unlocked ? '' : 'disabled'}
                                        style="padding:0.4rem 0.5rem;border-radius:8px;border:1px solid ${c.border};background:${c.bg};color:${c.sub};font-size:0.66rem;font-weight:700;cursor:${unlocked ? 'pointer' : 'not-allowed'};opacity:${unlocked ? '1' : '0.5'};">Aplicar</button>
                                </div>
                            </div>
                            <div>
                                <label style="display:block;font-size:0.62rem;color:${c.muted};margin-bottom:0.18rem;">Delta XP sazonal (+/-)</label>
                                <div style="display:flex;gap:0.35rem;">
                                    <input id="devlab-remote-season-delta" type="number" step="1" value="250"
                                        style="flex:1;padding:0.4rem 0.5rem;border-radius:8px;border:1px solid ${c.border};background:${c.bg};color:${c.text};font-size:0.7rem;"/>
                                    <button onclick="DevLab.addRemoteSeasonXPFromForm()" ${unlocked ? '' : 'disabled'}
                                        style="padding:0.4rem 0.5rem;border-radius:8px;border:1px solid ${c.border};background:${c.bg};color:${c.sub};font-size:0.66rem;font-weight:700;cursor:${unlocked ? 'pointer' : 'not-allowed'};opacity:${unlocked ? '1' : '0.5'};">Aplicar</button>
                                </div>
                            </div>
                        </div>
                        ` : `
                        <div style="font-size:0.72rem;color:${c.muted};">Digite o UID ou NyanTag do alvo e clique em "Carregar alvo".</div>
                        `}
                    ` : `
                        <div style="font-size:0.72rem;color:${c.muted};">Conecte sua conta online para editar chips/XP de outros perfis.</div>
                    `}
                </section>
                ${this._renderBundlesSection
                    ? this._renderBundlesSection({
                        activeSection,
                        c,
                        unlocked,
                        totalBundleCount,
                        officialBundleCount,
                        customBundleCount,
                        bundleMetaSource,
                        bundleMetaUpdated,
                        bundleMetaFetchedLabel,
                        bundleFilterQuery,
                        filteredBundleCount,
                        bundleOptions,
                        selectedBundleName,
                        selectedBundleId,
                        activeBundleKind,
                        activeBundle,
                        activeBundleItems,
                        activeBundleSources,
                        globalMinAgeDays,
                        historyCount: historyEntries.length,
                        historyLoading,
                        historyOptions,
                        historySelectedId,
                        historySelectedMeta,
                        bundleAuditLabel,
                        bundleAuditErrors,
                        bundleAuditWarnings,
                        publisherAuthLabel,
                        bundleConflictActive,
                        bundleConflictLabel,
                    })
                    : ''}
                <section style="display:${activeSection === 'geral' ? 'block' : 'none'};margin-top:0.8rem;border-radius:14px;border:1px solid ${c.dangerBorder};background:${c.dangerBg};padding:0.75rem;">
                    <div style="font-size:0.7rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${c.sub};margin-bottom:0.35rem;">Zona de risco</div>
                    <button onclick="DevLab.resetEconomy()" ${unlocked ? '' : 'disabled'}
                        style="padding:0.44rem 0.62rem;border-radius:9px;border:1px solid ${c.dangerBorder};background:transparent;color:${c.text};
                            font-size:0.7rem;font-weight:700;cursor:${unlocked ? 'pointer' : 'not-allowed'};opacity:${unlocked ? '1' : '0.5'};">Resetar economia local</button>
                </section>
            </div>
        </div>`;
    },
    init() {
        this.initRemoteGrantProcessor();
        window.setTimeout(() => {
            this.bundleEditorPreviewUpdate();
            this._bundleEditorSyncFilterUI?.();
        }, 0);
        if (this._initRefreshRunning) return;
        this._initRefreshRunning = true;
        window.DevSecurity?.refresh?.(false)
            .catch(() => {})
            .finally(() => {
                this._initRefreshRunning = false;
            });
    },
};
window.DevLab = DevLab;
window.addEventListener('nyan:online-ready', () => {
    window.DevLab?.initRemoteGrantProcessor?.();
});
