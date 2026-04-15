const V310Notes = {
    version: '3.10.0',
    _isLoading: false,
    _content: '',
    _error: '',
    _sourceLabel: '',

    render() {
        return `
            <div class="max-w-5xl mx-auto">
                <div class="flex items-center justify-between mb-5">
                    <div>
                        <div class="text-xs font-bold uppercase tracking-wider text-gray-500">Release Notes</div>
                        <h1 class="text-3xl font-black text-gray-800">Notas da versao 3.10</h1>
                        <p class="text-sm text-gray-500 mt-1">Resumo oficial desta versao para todos os usuarios.</p>
                    </div>
                    <button id="v310-notes-back-btn"
                            class="px-4 py-2 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-gray-700 to-gray-900 hover:opacity-95 active:scale-95 transition-all">
                        Voltar para Atualizacoes
                    </button>
                </div>

                <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
                        <div>
                            <div class="text-sm font-bold text-gray-800">NyanTools v${this.version}</div>
                            <div class="text-xs text-gray-500 mt-0.5">Notas publicas da release.</div>
                        </div>
                        <button id="v310-notes-refresh-btn"
                                class="px-3 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-pink-600 hover:opacity-95 active:scale-95 transition-all">
                            Recarregar
                        </button>
                    </div>
                    <div id="v310-notes-body" class="p-5">
                        ${this._renderBody()}
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        const backBtn = document.getElementById('v310-notes-back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                Router.navigate('settings');
                setTimeout(() => Settings?.switchTab?.('updates'), 80);
            });
        }

        const refreshBtn = document.getElementById('v310-notes-refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.load(true));
        }

        this.load();
    },

    async load(force = false) {
        if (this._isLoading && !force) return;

        this._isLoading = true;
        this._error = '';
        this._updateBody();

        try {
            const result = await this._readNotes();
            this._content = (result.content || '').replace(/\r\n/g, '\n').trim();
            this._sourceLabel = result.source || 'dados do app';
            if (!this._content) this._error = 'As notas da v3.10 estao vazias.';
        } catch (error) {
            this._content = '';
            this._sourceLabel = '';
            this._error = error?.message || 'Nao foi possivel carregar as notas da versao.';
        }

        this._isLoading = false;
        this._updateBody();
    },

    async _readNotes() {
        const fromPublicFile = await this._fromPublicReleaseFile();
        if (fromPublicFile) return fromPublicFile;

        const fromAutoUpdater = this._fromAutoUpdater();
        if (fromAutoUpdater) return fromAutoUpdater;

        const fromVersionJson = await this._fromVersionJson();
        if (fromVersionJson) return fromVersionJson;

        const fromLocalFile = await this._fromLocalFileOptional();
        if (fromLocalFile) return fromLocalFile;

        throw new Error('Nao foi possivel carregar as notas publicas da v3.10.');
    },

    async _fromPublicReleaseFile() {
        try {
            const response = await fetch('./release-notes/v3.10.0.md?ts=' + Date.now());
            if (!response.ok) return null;
            const content = await response.text();
            if (!content.trim()) return null;
            return { content, source: 'release-notes/v3.10.0.md' };
        } catch {
            return null;
        }
    },

    _fromAutoUpdater() {
        const list = window.AutoUpdater?.changelog;
        if (!Array.isArray(list) || list.length === 0) return null;

        const entry = list.find((item) => item?.version === this.version) || list[0];
        if (!entry) return null;

        const lines = [
            `# NyanTools v${entry.version || this.version} - Notas oficiais`,
            ''
        ];

        if (entry.date) {
            lines.push(`Data: ${String(entry.date).split('T')[0]}`);
            lines.push('');
        }

        if (Array.isArray(entry.changes) && entry.changes.length > 0) {
            lines.push('## Principais mudancas');
            lines.push('');
            entry.changes.forEach((change) => {
                const type = String(change?.type || '').trim();
                const text = String(change?.text || '').trim();
                if (!text) return;
                lines.push(`- ${type ? type + ' ' : ''}${text}`.trim());
            });
        }

        const content = lines.join('\n').trim();
        if (!content) return null;
        return { content, source: 'AutoUpdater.changelog' };
    },

    async _fromVersionJson() {
        try {
            const response = await fetch('./version.json?ts=' + Date.now());
            if (!response.ok) return null;
            const data = await response.json();
            if (!Array.isArray(data?.changelog) || data.changelog.length === 0) return null;

            const lines = [
                `# NyanTools v${data.version || this.version} - Notas oficiais`,
                ''
            ];

            if (data.buildDate) {
                lines.push(`Build: ${data.buildDate}`);
                lines.push('');
            }

            lines.push('## Principais mudancas');
            lines.push('');
            data.changelog.forEach((item) => {
                const text = String(item || '').trim();
                if (text) lines.push(`- ${text}`);
            });

            const content = lines.join('\n').trim();
            return content ? { content, source: 'version.json' } : null;
        } catch {
            return null;
        }
    },

    async _fromLocalFileOptional() {
        if (window.electronAPI?.readV310Notes) {
            try {
                const response = await window.electronAPI.readV310Notes();
                if (response?.success && String(response.content || '').trim()) {
                    return { content: String(response.content), source: 'frontend/docs/v3.10-notes.md' };
                }
            } catch {}
        }

        try {
            const response = await fetch('../docs/v3.10-notes.md?ts=' + Date.now());
            if (!response.ok) return null;
            const content = await response.text();
            if (!content.trim()) return null;
            return { content, source: '../docs/v3.10-notes.md' };
        } catch {
            return null;
        }
    },

    _updateBody() {
        if (Router?.currentRoute !== 'v310-notes') return;
        const body = document.getElementById('v310-notes-body');
        if (body) body.innerHTML = this._renderBody();
    },

    _renderBody() {
        if (this._isLoading) {
            return `
                <div class="py-12 text-center">
                    <div class="text-4xl mb-2">🐾</div>
                    <p class="text-sm font-semibold text-gray-500">Carregando notas da versao...</p>
                </div>
            `;
        }

        if (this._error) {
            return `
                <div class="rounded-xl border border-red-200 bg-red-50 p-4">
                    <div class="text-sm font-bold text-red-700">Nao foi possivel abrir as notas.</div>
                    <p class="text-xs text-red-600 mt-1">${this._escapeHtml(this._error)}</p>
                </div>
            `;
        }

        return this._renderStyledNotes();
    },

    _renderStyledNotes() {
        const parsed = this._parseMarkdown();
        const sectionCards = parsed.sections.map((section, idx) => this._renderSection(section, idx)).join('');
        const introText = parsed.intro.length
            ? parsed.intro.map((p) => `<p class="text-sm leading-6 text-gray-300">${this._escapeHtml(p)}</p>`).join('')
            : `<p class="text-sm leading-6 text-gray-300">Resumo oficial da release com foco em estabilidade, integracao e experiencia conectada.</p>`;

        return `
            <div class="space-y-5">
                <div class="flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                        <span>🌸 Nota oficial</span>
                        <span class="opacity-60">•</span>
                        <span>v${this.version}</span>
                    </div>
                    <div class="text-gray-400">
                        Fonte: <code class="px-1.5 py-0.5 bg-black/20 border border-white/10 rounded text-gray-300">${this._escapeHtml(this._sourceLabel)}</code>
                    </div>
                </div>

                <div class="rounded-2xl p-5 border border-fuchsia-300/20"
                     style="background:linear-gradient(135deg, rgba(30,27,75,0.92), rgba(76,29,149,0.78) 42%, rgba(219,39,119,0.7)); box-shadow:0 16px 40px rgba(168,85,247,0.22);">
                    <div class="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                            <div class="text-xs uppercase tracking-widest font-bold text-fuchsia-200/90 mb-1">Nyan Worlds • Official Note</div>
                            <h2 class="text-2xl font-black text-white leading-tight">${this._escapeHtml(parsed.title || `NyanTools v${this.version} - Nota oficial`)}</h2>
                        </div>
                        <div class="px-2.5 py-1 rounded-full text-xs font-bold text-fuchsia-100 border border-fuchsia-200/30 bg-black/20">✨ kawai update</div>
                    </div>
                    <div class="mt-4 space-y-2">
                        ${introText}
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${sectionCards}
                </div>
            </div>
        `;
    },

    _renderSection(section, idx) {
        const palette = [
            { border: 'rgba(34,211,238,0.35)', bg: 'linear-gradient(145deg, rgba(6,182,212,0.14), rgba(15,23,42,0.75))' },
            { border: 'rgba(168,85,247,0.35)', bg: 'linear-gradient(145deg, rgba(168,85,247,0.16), rgba(15,23,42,0.75))' },
            { border: 'rgba(244,114,182,0.35)', bg: 'linear-gradient(145deg, rgba(244,114,182,0.15), rgba(15,23,42,0.75))' },
            { border: 'rgba(52,211,153,0.35)', bg: 'linear-gradient(145deg, rgba(16,185,129,0.14), rgba(15,23,42,0.75))' }
        ];
        const icon = this._sectionIcon(section.title);
        const theme = palette[idx % palette.length];
        const paragraphs = section.paragraphs.map((p) => `<p class="text-sm leading-6 text-gray-300">${this._escapeHtml(p)}</p>`).join('');
        const bullets = section.bullets.length
            ? `<ul class="space-y-1.5 mt-3">${section.bullets.map((b) => `<li class="text-sm text-gray-200 leading-6">• ${this._escapeHtml(b)}</li>`).join('')}</ul>`
            : '';

        return `
            <div class="rounded-2xl p-4 border" style="border-color:${theme.border}; background:${theme.bg}; box-shadow:0 10px 26px rgba(0,0,0,0.2);">
                <div class="flex items-center gap-2 mb-2">
                    <span class="text-lg">${icon}</span>
                    <h3 class="font-black text-[0.95rem] text-white">${this._escapeHtml(section.title)}</h3>
                </div>
                <div class="space-y-2">
                    ${paragraphs}
                    ${bullets}
                </div>
            </div>
        `;
    },

    _parseMarkdown() {
        const lines = String(this._content || '').split('\n');
        let title = '';
        const introLines = [];
        const sections = [];
        let currentSection = null;

        const flush = () => {
            if (!currentSection) return;
            currentSection.paragraphs = this._normalizeParagraphs(currentSection.paragraphsRaw);
            delete currentSection.paragraphsRaw;
            sections.push(currentSection);
            currentSection = null;
        };

        lines.forEach((raw) => {
            const line = raw.trim();
            if (!title && line.startsWith('# ')) {
                title = line.slice(2).trim();
                return;
            }

            if (line.startsWith('## ')) {
                flush();
                currentSection = {
                    title: line.slice(3).trim(),
                    paragraphsRaw: [],
                    bullets: []
                };
                return;
            }

            if (!line) {
                if (currentSection) currentSection.paragraphsRaw.push('');
                else introLines.push('');
                return;
            }

            if (line.startsWith('- ')) {
                if (!currentSection) {
                    currentSection = { title: 'Resumo', paragraphsRaw: [], bullets: [] };
                }
                currentSection.bullets.push(line.slice(2).trim());
                return;
            }

            if (currentSection) currentSection.paragraphsRaw.push(line);
            else introLines.push(line);
        });

        flush();

        if (!sections.length) {
            sections.push({
                title: 'Resumo',
                paragraphs: this._normalizeParagraphs(lines),
                bullets: []
            });
        }

        return {
            title,
            intro: this._normalizeParagraphs(introLines),
            sections
        };
    },

    _normalizeParagraphs(lines) {
        const grouped = [];
        let buffer = [];
        lines.forEach((line) => {
            const value = String(line || '').trim();
            if (!value) {
                if (buffer.length) {
                    grouped.push(buffer.join(' '));
                    buffer = [];
                }
                return;
            }
            buffer.push(value);
        });
        if (buffer.length) grouped.push(buffer.join(' '));
        return grouped;
    },

    _sectionIcon(title) {
        const value = String(title || '').toLowerCase();
        if (value.includes('contexto')) return '🔎';
        if (value.includes('decisao')) return '🛡️';
        if (value.includes('impacto')) return '💫';
        if (value.includes('status')) return '✅';
        if (value.includes('estabilizacao')) return '🧩';
        if (value.includes('escopo')) return '🖥️';
        return '✨';
    },

    _escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
};

window.V310Notes = V310Notes;
