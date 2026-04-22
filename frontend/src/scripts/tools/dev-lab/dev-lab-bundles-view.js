(() => {
    if (!window.DevLab) return;
    Object.assign(window.DevLab, {
        _renderBundlesSection({
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
        } = {}) {
            return `
                <section style="display:${activeSection === 'bundles' ? 'block' : 'none'};margin-top:0.85rem;border-radius:16px;border:1px solid ${c.borderStrong};background:${c.panel};padding:0.9rem 1rem;">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:0.75rem;flex-wrap:wrap;margin-bottom:0.8rem;padding-bottom:0.72rem;border-bottom:1px solid ${c.border};">
                        <div>
                            <div style="font-size:0.59rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#10b981;margin-bottom:0.18rem;">Módulo de bundles</div>
                            <div style="font-size:1.05rem;font-weight:900;color:${c.text};font-family:'Syne',sans-serif;line-height:1.2;">Painel de Bundles</div>
                            <p style="margin:0.18rem 0 0;font-size:0.67rem;color:${c.sub};">Gerencie e edite o catálogo completo de bundles da loja.</p>
                        </div>
                        <div style="display:flex;align-items:center;gap:0.42rem;flex-wrap:wrap;">
                            <button onclick="DevLab.bundleEditorReload(false)" ${unlocked ? '' : 'disabled'}
                                style="padding:0.36rem 0.6rem;border-radius:8px;border:1px solid ${c.border};background:${c.bg};color:${c.sub};font-size:0.63rem;font-weight:700;cursor:${unlocked ? 'pointer' : 'not-allowed'};opacity:${unlocked ? '1' : '0.5'};">Atualizar cache</button>
                            <button onclick="DevLab.bundleEditorReload(true)" ${unlocked ? '' : 'disabled'}
                                style="padding:0.36rem 0.6rem;border-radius:8px;border:none;background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#fff;font-size:0.63rem;font-weight:800;cursor:${unlocked ? 'pointer' : 'not-allowed'};opacity:${unlocked ? '1' : '0.5'};">Sincronizar remoto</button>
                            <button onclick="DevLab.bundleEditorExport()" ${unlocked ? '' : 'disabled'}
                                style="padding:0.36rem 0.6rem;border-radius:8px;border:1px solid ${c.border};background:${c.bg};color:${c.sub};font-size:0.63rem;font-weight:700;cursor:${unlocked ? 'pointer' : 'not-allowed'};opacity:${unlocked ? '1' : '0.5'};">Exportar JSON</button>
                        </div>
                    </div>
                    <div style="display:flex;align-items:center;gap:0.42rem;flex-wrap:wrap;margin-bottom:0.75rem;">
                        <div style="font-size:0.61rem;color:${c.sub};padding:0.2rem 0.55rem;border-radius:999px;border:1px solid ${c.border};background:${c.bg};">
                            Catálogo: <strong style="color:${c.text};">${totalBundleCount}</strong> bundles
                        </div>
                        <div style="font-size:0.61rem;color:${c.sub};padding:0.2rem 0.55rem;border-radius:999px;border:1px solid ${c.border};background:${c.bg};">
                            Oficiais: <strong style="color:${c.text};">${officialBundleCount}</strong> &middot; Custom: <strong style="color:${c.text};">${customBundleCount}</strong>
                        </div>
                        <div id="devlab-bundle-dirty-pill"
                            style="font-size:0.61rem;color:${this._isDark() ? '#86efac' : '#065f46'};padding:0.2rem 0.55rem;border-radius:999px;border:1px solid ${c.okBorder};background:${c.okBg};">
                            Sem pendências locais
                        </div>
                        <div style="margin-left:auto;font-size:0.59rem;color:${c.muted};">
                            Origem: <strong style="color:${c.sub};">${bundleMetaSource}</strong> &middot;
                            Atualizado: <strong style="color:${c.sub};">${bundleMetaUpdated}</strong> &middot;
                            Fetch: <strong style="color:${c.sub};">${bundleMetaFetchedLabel}</strong>
                        </div>
                    </div>
                    <div style="border-radius:12px;border:1px solid ${c.border};border-left:3px solid #10b981;background:${c.bg};padding:0.65rem 0.8rem;margin-bottom:0.65rem;">
                        <div style="font-size:0.58rem;font-weight:800;letter-spacing:0.09em;text-transform:uppercase;color:#10b981;margin-bottom:0.42rem;">Seleção de bundle</div>
                        <div style="display:grid;grid-template-columns:1fr 2fr auto;gap:0.45rem;align-items:end;">
                            <div>
                                <label style="display:block;font-size:0.61rem;color:${c.sub};margin-bottom:0.12rem;">Busca rápida (ID ou nome)</label>
                                <input id="devlab-bundle-filter" type="text" value="${this._escapeHtml(bundleFilterQuery)}" oninput="DevLab.bundleEditorSetFilter(this.value)" placeholder="ex: nebula, patch, v310..."
                                    style="width:100%;padding:0.4rem 0.5rem;border-radius:8px;border:1px solid ${c.border};background:${c.panel};color:${c.text};font-size:0.67rem;"/>
                                <div id="devlab-bundle-filter-results" style="font-size:0.57rem;color:${c.muted};margin-top:0.15rem;">${filteredBundleCount} de ${totalBundleCount} resultados</div>
                            </div>
                            <div>
                                <label style="display:block;font-size:0.61rem;color:${c.sub};margin-bottom:0.12rem;">
                                    Bundle para editar
                                    <span style="color:${c.muted};font-weight:400;"> - em edição: ${selectedBundleName} (${selectedBundleId}) &middot; rascunho: <span id="devlab-bundle-live-dirty">não</span></span>
                                </label>
                                <select id="devlab-bundle-select" onchange="DevLab._bundleEditorSelectFromDropdown(this.value)"
                                    style="width:100%;padding:0.4rem 0.52rem;border-radius:8px;border:1px solid ${c.border};background:${this._isDark() ? 'rgba(255,255,255,0.04)' : '#fff'};color:${c.text};font-size:0.69rem;">
                                    <option value="__draft__" ${this._bundleEditorDropdownValue() === '__draft__' ? 'selected' : ''}>+ Criar novo bundle (rascunho)</option>
                                    ${bundleOptions}
                                </select>
                            </div>
                            <div style="display:flex;gap:0.32rem;">
                                <button onclick="DevLab.bundleEditorNew('official')" ${unlocked ? '' : 'disabled'}
                                    style="padding:0.4rem 0.6rem;border-radius:8px;border:1px solid ${c.border};background:${c.panel};color:${c.sub};font-size:0.63rem;font-weight:700;cursor:${unlocked ? 'pointer' : 'not-allowed'};opacity:${unlocked ? '1' : '0.5'};">+ Oficial</button>
                                <button onclick="DevLab.bundleEditorNew('custom')" ${unlocked ? '' : 'disabled'}
                                    style="padding:0.4rem 0.6rem;border-radius:8px;border:1px solid ${c.border};background:${c.panel};color:${c.sub};font-size:0.63rem;font-weight:700;cursor:${unlocked ? 'pointer' : 'not-allowed'};opacity:${unlocked ? '1' : '0.5'};">+ Custom</button>
                            </div>
                        </div>
                    </div>
                    <div style="display:grid;gap:0.55rem;">
                        <section style="border-radius:12px;border:1px solid ${c.border};border-left:3px solid #f59e0b;background:${c.bg};padding:0.68rem 0.8rem;">
                            <div style="font-size:0.58rem;font-weight:800;letter-spacing:0.09em;text-transform:uppercase;color:#f59e0b;margin-bottom:0.45rem;">Validação em tempo real</div>
                            <div id="devlab-bundle-live-headline-box"
                                style="border-radius:8px;border:1px solid ${c.border};background:${c.panel};padding:0.38rem 0.55rem;margin-bottom:0.45rem;">
                                <div id="devlab-bundle-live-headline" style="font-size:0.66rem;font-weight:700;color:${c.sub};">Preencha os campos para validar o bundle.</div>
                            </div>
                            <div style="display:flex;flex-wrap:wrap;gap:0.35rem;margin-bottom:0.42rem;">
                                <div style="font-size:0.61rem;color:${c.sub};padding:0.18rem 0.48rem;border-radius:6px;border:1px solid ${c.border};background:${c.panel};">Visibilidade: <strong id="devlab-bundle-live-visibility" style="color:${c.text};">--</strong></div>
                                <div style="font-size:0.61rem;color:${c.sub};padding:0.18rem 0.48rem;border-radius:6px;border:1px solid ${c.border};background:${c.panel};">Janela: <strong id="devlab-bundle-live-window" style="color:${c.text};">--</strong></div>
                                <div style="font-size:0.61rem;color:${c.sub};padding:0.18rem 0.48rem;border-radius:6px;border:1px solid ${c.border};background:${c.panel};">Período: <strong id="devlab-bundle-live-period" style="color:${c.text};">--</strong></div>
                                <div style="font-size:0.61rem;color:${c.sub};padding:0.18rem 0.48rem;border-radius:6px;border:1px solid ${c.border};background:${c.panel};">Itens válidos: <strong id="devlab-bundle-live-items" style="color:${c.text};">0</strong></div>
                                <div style="font-size:0.61rem;color:${c.sub};padding:0.18rem 0.48rem;border-radius:6px;border:1px solid ${c.border};background:${c.panel};">Desconto: <strong id="devlab-bundle-live-discount" style="color:${c.text};">0%</strong></div>
                            </div>
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.38rem;">
                                <div style="border-radius:8px;border:1px solid ${c.dangerBorder};background:${c.dangerBg};padding:0.36rem 0.5rem;">
                                    <div style="font-size:0.57rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#ef4444;margin-bottom:0.16rem;">Pendências</div>
                                    <div id="devlab-bundle-live-errors" style="font-size:0.61rem;color:${c.muted};display:grid;gap:0.12rem;"></div>
                                </div>
                                <div style="border-radius:8px;border:1px solid ${c.warnBorder};background:${c.warnBg};padding:0.36rem 0.5rem;">
                                    <div style="font-size:0.57rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#f97316;margin-bottom:0.16rem;">Alertas</div>
                                    <div id="devlab-bundle-live-warnings" style="font-size:0.61rem;color:${c.muted};display:grid;gap:0.12rem;"></div>
                                </div>
                            </div>
                        </section>
                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:0.55rem;align-items:start;">
                            <div style="display:grid;gap:0.5rem;">
                                <section style="border-radius:12px;border:1px solid ${c.border};border-left:3px solid #3b82f6;background:${c.bg};padding:0.68rem 0.8rem;">
                                    <div style="font-size:0.58rem;font-weight:800;letter-spacing:0.09em;text-transform:uppercase;color:#3b82f6;margin-bottom:0.45rem;">Informações gerais</div>
                                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.4rem;margin-bottom:0.4rem;">
                                        <div>
                                            <label style="display:block;font-size:0.61rem;color:${c.sub};margin-bottom:0.12rem;">ID interno</label>
                                            <input id="devlab-bundle-id" type="text" value="${this._escapeHtml(activeBundle.id || '')}" placeholder="ex: v312_bundle_aurora"
                                                oninput="DevLab.bundleEditorPreviewUpdate()"
                                                style="width:100%;padding:0.4rem 0.5rem;border-radius:8px;border:1px solid ${c.border};background:${c.panel};color:${c.text};font-size:0.67rem;"/>
                                            <div id="devlab-bundle-id-feedback" style="display:none;font-size:0.57rem;margin-top:0.14rem;color:${c.muted};"></div>
                                        </div>
                                        <div>
                                            <label style="display:block;font-size:0.61rem;color:${c.sub};margin-bottom:0.12rem;">Categoria</label>
                                            <select id="devlab-bundle-kind" onchange="DevLab.bundleEditorPreviewUpdate()"
                                                style="width:100%;padding:0.4rem 0.5rem;border-radius:8px;border:1px solid ${c.border};background:${this._isDark() ? 'rgba(255,255,255,0.04)' : '#fff'};color:${c.text};font-size:0.67rem;">
                                                <option value="official" ${activeBundleKind === 'official' ? 'selected' : ''}>Oficial</option>
                                                <option value="custom" ${activeBundleKind === 'custom' ? 'selected' : ''}>Personalizado</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style="display:grid;gap:0.4rem;margin-bottom:0.4rem;">
                                        <div>
                                            <label style="display:block;font-size:0.61rem;color:${c.sub};margin-bottom:0.12rem;">Nome exibido na loja</label>
                                            <input id="devlab-bundle-title" type="text" value="${this._escapeHtml(activeBundle.title || '')}" placeholder="Nome principal para o usuário"
                                                oninput="DevLab.bundleEditorPreviewUpdate()"
                                                style="width:100%;padding:0.4rem 0.5rem;border-radius:8px;border:1px solid ${c.border};background:${c.panel};color:${c.text};font-size:0.67rem;"/>
                                            <div id="devlab-bundle-title-feedback" style="display:none;font-size:0.57rem;margin-top:0.14rem;color:${c.muted};"></div>
                                        </div>
                                        <div>
                                            <label style="display:block;font-size:0.61rem;color:${c.sub};margin-bottom:0.12rem;">Descrição curta</label>
                                            <input id="devlab-bundle-subtitle" type="text" value="${this._escapeHtml(activeBundle.subtitle || '')}" placeholder="Resumo abaixo do nome"
                                                oninput="DevLab.bundleEditorPreviewUpdate()"
                                                style="width:100%;padding:0.4rem 0.5rem;border-radius:8px;border:1px solid ${c.border};background:${c.panel};color:${c.text};font-size:0.67rem;"/>
                                        </div>
                                    </div>
                                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.4rem;">
                                        <div>
                                            <label style="display:block;font-size:0.61rem;color:${c.sub};margin-bottom:0.12rem;">Status</label>
                                            <select id="devlab-bundle-status" onchange="DevLab.bundleEditorPreviewUpdate()"
                                                style="width:100%;padding:0.4rem 0.5rem;border-radius:8px;border:1px solid ${c.border};background:${this._isDark() ? 'rgba(255,255,255,0.04)' : '#fff'};color:${c.text};font-size:0.64rem;">
                                                <option value="active" ${String(activeBundle.status || 'active') === 'active' ? 'selected' : ''}>Ativo</option>
                                                <option value="draft" ${String(activeBundle.status || '') === 'draft' ? 'selected' : ''}>Rascunho</option>
                                                <option value="published" ${String(activeBundle.status || '') === 'published' ? 'selected' : ''}>Publicado</option>
                                                <option value="archived" ${String(activeBundle.status || '') === 'archived' ? 'selected' : ''}>Arquivado</option>
                                            </select>
                                            <div id="devlab-bundle-status-feedback" style="display:none;font-size:0.57rem;margin-top:0.14rem;color:${c.muted};"></div>
                                        </div>
                                        <div>
                                            <label style="display:block;font-size:0.61rem;color:${c.sub};margin-bottom:0.12rem;">Desconto (%)</label>
                                            <input id="devlab-bundle-discount" type="number" min="0" max="95" value="${this._safeInt(activeBundle.bundleDiscountPct, 0, 0, 95)}"
                                                oninput="DevLab.bundleEditorPreviewUpdate()"
                                                style="width:100%;padding:0.4rem 0.5rem;border-radius:8px;border:1px solid ${c.border};background:${c.panel};color:${c.text};font-size:0.67rem;"/>
                                            <div id="devlab-bundle-discount-feedback" style="display:none;font-size:0.57rem;margin-top:0.14rem;color:${c.muted};"></div>
                                        </div>
                                        <div>
                                            <label style="display:block;font-size:0.61rem;color:${c.sub};margin-bottom:0.12rem;">Prioridade</label>
                                            <input id="devlab-bundle-priority" type="number" min="-9999" max="9999" value="${this._safeInt(activeBundle.priority, 0, -9999, 9999)}"
                                                oninput="DevLab.bundleEditorPreviewUpdate()"
                                                style="width:100%;padding:0.4rem 0.5rem;border-radius:8px;border:1px solid ${c.border};background:${c.panel};color:${c.text};font-size:0.67rem;"/>
                                        </div>
                                    </div>
                                </section>
                                <section style="border-radius:12px;border:1px solid ${c.border};border-left:3px solid #8b5cf6;background:${c.bg};padding:0.68rem 0.8rem;">
                                    <div style="font-size:0.58rem;font-weight:800;letter-spacing:0.09em;text-transform:uppercase;color:#8b5cf6;margin-bottom:0.45rem;">Datas de vigência</div>
                                    <div style="display:grid;gap:0.38rem;">
                                        <div>
                                            <label style="display:block;font-size:0.61rem;color:${c.sub};margin-bottom:0.12rem;">Lançamento <span style="color:${c.muted};font-weight:400;">(ISO-8601)</span></label>
                                            <input id="devlab-bundle-launched" type="text" value="${this._escapeHtml(activeBundle.launchedAt || '')}" placeholder="2026-05-01T00:00:00-03:00"
                                                oninput="DevLab.bundleEditorPreviewUpdate()"
                                                style="width:100%;padding:0.4rem 0.5rem;border-radius:8px;border:1px solid ${c.border};background:${c.panel};color:${c.text};font-size:0.66rem;font-family:'JetBrains Mono',monospace;"/>
                                            <div id="devlab-bundle-launched-feedback" style="display:none;font-size:0.57rem;margin-top:0.14rem;color:${c.muted};"></div>
                                        </div>
                                        <div>
                                            <label style="display:block;font-size:0.61rem;color:${c.sub};margin-bottom:0.12rem;">Início de disponibilidade <span style="color:${c.muted};font-weight:400;">(ISO-8601)</span></label>
                                            <input id="devlab-bundle-start" type="text" value="${this._escapeHtml(activeBundle.startsAt || '')}" placeholder="2026-05-01T00:00:00-03:00"
                                                oninput="DevLab.bundleEditorPreviewUpdate()"
                                                style="width:100%;padding:0.4rem 0.5rem;border-radius:8px;border:1px solid ${c.border};background:${c.panel};color:${c.text};font-size:0.66rem;font-family:'JetBrains Mono',monospace;"/>
                                            <div id="devlab-bundle-start-feedback" style="display:none;font-size:0.57rem;margin-top:0.14rem;color:${c.muted};"></div>
                                        </div>
                                        <div>
                                            <label style="display:block;font-size:0.61rem;color:${c.sub};margin-bottom:0.12rem;">Fim de disponibilidade <span style="color:${c.muted};font-weight:400;">(ISO-8601)</span></label>
                                            <input id="devlab-bundle-end" type="text" value="${this._escapeHtml(activeBundle.endsAt || '')}" placeholder="2026-05-31T23:59:59-03:00"
                                                oninput="DevLab.bundleEditorPreviewUpdate()"
                                                style="width:100%;padding:0.4rem 0.5rem;border-radius:8px;border:1px solid ${c.border};background:${c.panel};color:${c.text};font-size:0.66rem;font-family:'JetBrains Mono',monospace;"/>
                                            <div id="devlab-bundle-end-feedback" style="display:none;font-size:0.57rem;margin-top:0.14rem;color:${c.muted};"></div>
                                        </div>
                                    </div>
                                    <div style="font-size:0.58rem;color:${c.muted};margin-top:0.28rem;">Use offset de fuso completo, ex: -03:00 (Brasília).</div>
                                </section>
                            </div>
                            <div style="display:grid;gap:0.5rem;">
                                <section style="border-radius:12px;border:1px solid ${c.border};border-left:3px solid #14b8a6;background:${c.bg};padding:0.68rem 0.8rem;">
                                    <div style="font-size:0.58rem;font-weight:800;letter-spacing:0.09em;text-transform:uppercase;color:#14b8a6;margin-bottom:0.45rem;">Itens do bundle</div>
                                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.4rem;">
                                        <div>
                                            <label style="display:block;font-size:0.61rem;color:${c.sub};margin-bottom:0.12rem;">IDs incluídos <span style="color:${c.muted};font-weight:400;">(1 por linha)</span></label>
                                            <textarea id="devlab-bundle-items" rows="7"
                                                oninput="DevLab.bundleEditorPreviewUpdate()"
                                                style="width:100%;padding:0.4rem 0.5rem;border-radius:8px;border:1px solid ${c.border};background:${c.panel};color:${c.text};font-size:0.64rem;resize:vertical;font-family:'JetBrains Mono',monospace;">${this._escapeHtml(activeBundleItems)}</textarea>
                                            <div id="devlab-bundle-items-feedback" style="display:none;font-size:0.57rem;margin-top:0.14rem;color:${c.muted};"></div>
                                            <div style="font-size:0.57rem;color:${c.muted};margin-top:0.14rem;">ex: effect_bundle_x, border_bundle_x</div>
                                        </div>
                                        <div>
                                            <label style="display:block;font-size:0.61rem;color:${c.sub};margin-bottom:0.12rem;">Bundles fonte <span style="color:${c.muted};font-weight:400;">(apenas custom)</span></label>
                                            <textarea id="devlab-bundle-sources" rows="7"
                                                oninput="DevLab.bundleEditorPreviewUpdate()"
                                                style="width:100%;padding:0.4rem 0.5rem;border-radius:8px;border:1px solid ${c.border};background:${c.panel};color:${c.text};font-size:0.64rem;resize:vertical;font-family:'JetBrains Mono',monospace;">${this._escapeHtml(activeBundleSources)}</textarea>
                                            <div id="devlab-bundle-sources-feedback" style="display:none;font-size:0.57rem;margin-top:0.14rem;color:${c.muted};"></div>
                                            <div style="font-size:0.57rem;color:${c.muted};margin-top:0.14rem;">Vazio = todas as fontes elegíveis.</div>
                                        </div>
                                    </div>
                                </section>
                                <section style="border-radius:12px;border:1px solid ${c.border};border-left:3px solid #f97316;background:${c.bg};padding:0.68rem 0.8rem;">
                                    <div style="font-size:0.58rem;font-weight:800;letter-spacing:0.09em;text-transform:uppercase;color:#f97316;margin-bottom:0.45rem;">Regras e flags</div>
                                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.4rem;margin-bottom:0.38rem;">
                                        <div>
                                            <label style="display:block;font-size:0.61rem;color:${c.sub};margin-bottom:0.12rem;">Idade mínima da fonte (dias)</label>
                                            <input id="devlab-bundle-minage" type="number" min="0" max="9999" value="${this._safeInt(activeBundle.minSourceAgeDays, 0, 0, 9999)}"
                                                oninput="DevLab.bundleEditorPreviewUpdate()"
                                                style="width:100%;padding:0.4rem 0.5rem;border-radius:8px;border:1px solid ${c.border};background:${c.panel};color:${c.text};font-size:0.67rem;"/>
                                        </div>
                                        <div>
                                            <label style="display:block;font-size:0.61rem;color:${c.sub};margin-bottom:0.12rem;">Idade mínima global custom (dias)</label>
                                            <input id="devlab-global-custom-minage" type="number" min="1" max="9999" value="${globalMinAgeDays}"
                                                oninput="DevLab.bundleEditorPreviewUpdate()"
                                                style="width:100%;padding:0.4rem 0.5rem;border-radius:8px;border:1px solid ${c.border};background:${c.panel};color:${c.text};font-size:0.67rem;"/>
                                        </div>
                                    </div>
                                    <div style="font-size:0.58rem;color:${c.muted};margin-bottom:0.38rem;">Se a idade do bundle custom estiver vazia, o valor global acima é aplicado.</div>
                                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.24rem 0.5rem;">
                                        <label style="display:flex;align-items:center;gap:0.32rem;font-size:0.65rem;color:${c.sub};cursor:pointer;">
                                            <input id="devlab-bundle-enabled" type="checkbox" onchange="DevLab.bundleEditorPreviewUpdate()" ${activeBundle.enabled === false ? '' : 'checked'}/> Habilitado na loja
                                        </label>
                                        <label style="display:flex;align-items:center;gap:0.32rem;font-size:0.65rem;color:${c.sub};cursor:pointer;">
                                            <input id="devlab-bundle-active" type="checkbox" onchange="DevLab.bundleEditorPreviewUpdate()" ${activeBundle.active === false ? '' : 'checked'}/> Ativo agora
                                        </label>
                                        <label style="display:flex;align-items:center;gap:0.32rem;font-size:0.65rem;color:${c.sub};cursor:pointer;">
                                            <input id="devlab-bundle-rerun" type="checkbox" onchange="DevLab.bundleEditorPreviewUpdate()" ${activeBundle.rerunAllowed === false ? '' : 'checked'}/> Permitir relançamento
                                        </label>
                                        <label style="display:flex;align-items:center;gap:0.32rem;font-size:0.65rem;color:${c.sub};cursor:pointer;">
                                            <input id="devlab-bundle-allowcustom" type="checkbox" onchange="DevLab.bundleEditorPreviewUpdate()" ${activeBundle.allowInCustomPool === false ? '' : 'checked'}/> Pool custom
                                        </label>
                                        <label style="display:flex;align-items:center;gap:0.32rem;font-size:0.65rem;color:${c.sub};cursor:pointer;">
                                            <input id="devlab-bundle-historical" type="checkbox" onchange="DevLab.bundleEditorPreviewUpdate()" ${activeBundle.historical ? 'checked' : ''}/> Histórico
                                        </label>
                                        <label style="display:flex;align-items:center;gap:0.32rem;font-size:0.65rem;color:${c.sub};cursor:pointer;">
                                            <input id="devlab-bundle-legacy" type="checkbox" onchange="DevLab.bundleEditorPreviewUpdate()" ${activeBundle.legacy ? 'checked' : ''}/> Legado permanente
                                        </label>
                                    </div>
                                </section>
                            </div>
                        </div>
                        <div style="border-radius:12px;border:1px solid ${c.border};background:${c.bg};padding:0.6rem 0.8rem;display:flex;align-items:center;justify-content:space-between;gap:0.55rem;flex-wrap:wrap;">
                            <div style="font-size:0.61rem;color:${c.muted};max-width:500px;">
                                Este painel altera apenas o catálogo de bundles. A definição dos itens continua no módulo Inventory.
                            </div>
                            <div style="display:flex;gap:0.45rem;">
                                <button onclick="DevLab.bundleEditorDelete()" ${unlocked ? '' : 'disabled'}
                                    style="padding:0.46rem 0.85rem;border-radius:9px;border:1px solid ${c.dangerBorder};background:${c.dangerBg};color:${c.text};font-size:0.67rem;font-weight:700;cursor:${unlocked ? 'pointer' : 'not-allowed'};opacity:${unlocked ? '1' : '0.5'};">Excluir bundle</button>
                                <button onclick="DevLab.bundleEditorSave()" ${unlocked ? '' : 'disabled'}
                                    style="padding:0.46rem 1.05rem;border-radius:9px;border:none;background:linear-gradient(135deg,#10b981,#14b8a6);color:#fff;font-size:0.67rem;font-weight:800;cursor:${unlocked ? 'pointer' : 'not-allowed'};opacity:${unlocked ? '1' : '0.5'};">Salvar no catálogo local</button>
                            </div>
                        </div>
                    </div>
                </section>
`;
        },
    });
})();



