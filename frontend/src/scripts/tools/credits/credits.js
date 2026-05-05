const Credits = {
    timeline: [
        { version: 'v3.4',  text: 'A base ficou mais estável e o NyanTools começou a parecer um app de verdade.' },
        { version: 'v3.7',  text: 'As ferramentas ganharam rotina, histórico e mais cuidado com pequenos detalhes.' },
        { version: 'v3.10', text: 'Patch Pulse marcou uma virada visual, social e comemorativa.' },
        { version: 'v3.12', text: 'Clãs, perfis e sistemas sociais deram mais vida para quem usava todo dia.' },
        { version: 'v3.15', text: 'Eventos e Live Ops abriram espaço para missões temporárias e recompensas.' },
        { version: 'v3.16', text: 'Last Meow fecha o ciclo com memória, despedida e Final Season.' },
    ],

    techs: [
        'Electron',
        'Tailwind CSS',
        'JavaScript',
        'Firebase',
        'OpenWeather',
        'YouTube',
    ],

    render() {
        const version = window.App?.version || window.NYAN_VERSION || '3.16.0';
        const testers = this.getBetaTesters();

        return `
            <div class="credits-legacy-page">
                ${this.renderStyles()}

                <button onclick="Router.navigate('settings')" class="credits-back">
                    <span>←</span>
                    <span>Voltar</span>
                </button>

                <section class="credits-hero">
                    <div class="credits-hero-mark">✦ Last Meow ✦</div>
                    <h1>Memória & Legado</h1>
                    <p>
                        v${version} é uma pausa com carinho. Um espaço reservado para lembrar quem construiu,
                        testou, usou e acompanhou o NyanTools dentro do Pandora.
                    </p>
                    <div class="credits-hero-strip">
                        <span>NyanTools にゃん~</span>
                        <strong>Final Season 2026</strong>
                    </div>
                </section>

                <section class="credits-people">
                    <article>
                        <span>Desenvolvimento</span>
                        <strong>Gabriel & Clara</strong>
                    </article>
                    <article>
                        <span>Beta Testers</span>
                        <strong>${testers.length ? testers.join(' · ') : 'Pietro · Junior'}</strong>
                    </article>
                </section>

                <div class="credits-grid">
                    <section class="credits-panel credits-journey">
                        <div class="credits-title">
                            <span></span>
                            <h2>A Jornada</h2>
                        </div>
                        <div class="credits-timeline">
                            ${this.timeline.map((item, index) => `
                                <div class="credits-time-row ${index === this.timeline.length - 1 ? 'is-final' : ''}">
                                    <div class="credits-time-dot"></div>
                                    <div class="credits-time-version">${item.version}</div>
                                    <p>${item.text}</p>
                                </div>
                            `).join('')}
                        </div>
                    </section>

                    <section class="credits-panel credits-side">
                        <div class="credits-title">
                            <span></span>
                            <h2>Tecnologias</h2>
                        </div>
                        <div class="credits-techs">
                            ${this.techs.map((tech, index) => `
                                <span class="credits-tech tech-${index % 4}">${tech}</span>
                            `).join('')}
                        </div>

                        <div class="credits-quote">
                            <div class="credits-quote-icon">✧</div>
                            <p>Obrigado por transformar um projeto de fim de semana em uma memória real.</p>
                        </div>
                    </section>
                </div>
            </div>
        `;
    },

    getBetaTesters() {
        const testers = window.BetaTesters?._testers;
        if (!Array.isArray(testers)) return [];
        return testers
            .map((tester) => tester?.name)
            .filter(Boolean);
    },

    renderStyles() {
        return `
            <style>
                .credits-legacy-page {
                    max-width: 920px;
                    margin: 0 auto;
                    padding: 0.82rem;
                    font-size: 0.92rem;
                    color: #f8fafc;
                    font-family: 'DM Sans', sans-serif;
                    border-radius: 16px;
                    border: 1px solid rgba(245, 158, 11, 0.22);
                    background:
                        linear-gradient(135deg, rgba(245, 158, 11, 0.13), transparent 28%),
                        linear-gradient(215deg, rgba(168, 85, 247, 0.28), transparent 42%),
                        linear-gradient(160deg, #09040f 0%, #1a0831 38%, #100916 68%, #2a1409 100%);
                    box-shadow: 0 14px 34px rgba(0, 0, 0, 0.24);
                    position: relative;
                    overflow: hidden;
                }
                .credits-back {
                    position: relative;
                    z-index: 1;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.34rem;
                    margin-bottom: 0.58rem;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 999px;
                    padding: 0.32rem 0.58rem;
                    background: rgba(255, 255, 255, 0.05);
                    color: rgba(248, 250, 252, 0.64);
                    font-size: 0.62rem;
                    font-weight: 900;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    transition: all 0.18s ease;
                }
                .credits-back:hover {
                    color: #fbbf24;
                    border-color: rgba(245, 158, 11, 0.35);
                    background: rgba(245, 158, 11, 0.08);
                }
                .credits-hero {
                    position: relative;
                    z-index: 1;
                    min-height: 158px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    padding: 1rem 1rem 1.08rem;
                    border-radius: 14px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    background:
                        linear-gradient(135deg, rgba(76, 29, 149, 0.54), rgba(17, 24, 39, 0.24)),
                        linear-gradient(90deg, rgba(245, 158, 11, 0.16), rgba(168, 85, 247, 0.16), rgba(236, 72, 153, 0.10));
                }
                .credits-hero-mark {
                    color: #fbbf24;
                    font-size: 0.58rem;
                    font-weight: 900;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                    margin-bottom: 0.46rem;
                }
                .credits-hero h1 {
                    margin: 0;
                    font-family: 'Syne', sans-serif;
                    font-size: clamp(1.75rem, 4vw, 3rem);
                    line-height: 0.98;
                    font-weight: 900;
                    letter-spacing: 0;
                    background: linear-gradient(90deg, #fff7ed 0%, #fbbf24 34%, #c084fc 68%, #fb7185 100%);
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .credits-hero p {
                    max-width: 650px;
                    margin: 0.58rem auto 0;
                    color: rgba(248, 250, 252, 0.72);
                    font-size: 0.76rem;
                    line-height: 1.45;
                }
                .credits-hero-strip {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 0.72rem;
                    padding: 0.32rem 0.58rem;
                    border-radius: 999px;
                    border: 1px solid rgba(245, 158, 11, 0.25);
                    background: rgba(0, 0, 0, 0.22);
                    color: rgba(248, 250, 252, 0.62);
                    font-size: 0.62rem;
                }
                .credits-hero-strip strong {
                    color: #fbbf24;
                }
                .credits-people {
                    position: relative;
                    z-index: 1;
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 0.55rem;
                    margin: 0.58rem 0;
                }
                .credits-people article,
                .credits-panel {
                    border: 1px solid rgba(255, 255, 255, 0.09);
                    background: rgba(9, 7, 18, 0.68);
                    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
                }
                .credits-people article {
                    border-radius: 12px;
                    padding: 0.68rem 0.78rem;
                }
                .credits-people article:first-child {
                    background: linear-gradient(135deg, rgba(168, 85, 247, 0.18), rgba(9, 7, 18, 0.7));
                }
                .credits-people article:last-child {
                    background: linear-gradient(135deg, rgba(245, 158, 11, 0.16), rgba(9, 7, 18, 0.7));
                    text-align: right;
                }
                .credits-people span,
                .credits-title h2 {
                    color: rgba(251, 191, 36, 0.88);
                    font-size: 0.58rem;
                    font-weight: 900;
                    letter-spacing: 0.16em;
                    text-transform: uppercase;
                }
                .credits-people strong {
                    display: block;
                    margin-top: 0.22rem;
                    color: #ffffff;
                    font-family: 'Syne', sans-serif;
                    font-size: 0.86rem;
                    font-weight: 900;
                }
                .credits-grid {
                    position: relative;
                    z-index: 1;
                    display: grid;
                    grid-template-columns: minmax(0, 1.22fr) minmax(250px, 0.78fr);
                    gap: 0.58rem;
                }
                .credits-panel {
                    border-radius: 13px;
                    padding: 0.78rem;
                }
                .credits-journey {
                    background:
                        linear-gradient(180deg, rgba(168, 85, 247, 0.13), transparent 44%),
                        rgba(9, 7, 18, 0.72);
                }
                .credits-side {
                    background:
                        linear-gradient(180deg, rgba(245, 158, 11, 0.12), transparent 44%),
                        rgba(9, 7, 18, 0.72);
                }
                .credits-title {
                    display: flex;
                    align-items: center;
                    gap: 0.42rem;
                    margin-bottom: 0.58rem;
                }
                .credits-title span {
                    width: 6px;
                    height: 6px;
                    border-radius: 999px;
                    background: #fbbf24;
                    box-shadow: 0 0 16px rgba(251, 191, 36, 0.7);
                }
                .credits-title h2 {
                    margin: 0;
                }
                .credits-timeline {
                    display: grid;
                    gap: 0.38rem;
                }
                .credits-time-row {
                    position: relative;
                    display: grid;
                    grid-template-columns: 58px 1fr;
                    gap: 0.55rem;
                    align-items: start;
                    padding: 0.46rem 0.58rem 0.46rem 0.72rem;
                    border-radius: 9px;
                    border: 1px solid rgba(255, 255, 255, 0.07);
                    background: rgba(255, 255, 255, 0.045);
                }
                .credits-time-row.is-final {
                    border-color: rgba(245, 158, 11, 0.34);
                    background: linear-gradient(135deg, rgba(245, 158, 11, 0.16), rgba(168, 85, 247, 0.15));
                }
                .credits-time-dot {
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 3px;
                    border-radius: 999px;
                    background: linear-gradient(#a855f7, #f59e0b);
                }
                .credits-time-version {
                    color: #fbbf24;
                    font-size: 0.64rem;
                    font-weight: 900;
                    letter-spacing: 0.08em;
                }
                .credits-time-row p {
                    margin: 0;
                    color: rgba(248, 250, 252, 0.72);
                    font-size: 0.7rem;
                    line-height: 1.35;
                }
                .credits-techs {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.38rem;
                    margin-bottom: 0.65rem;
                }
                .credits-tech {
                    display: inline-flex;
                    border-radius: 999px;
                    padding: 0.34rem 0.52rem;
                    font-size: 0.62rem;
                    font-weight: 900;
                    border: 1px solid rgba(255, 255, 255, 0.10);
                    color: #f8fafc;
                }
                .tech-0 { background: rgba(168, 85, 247, 0.18); border-color: rgba(168, 85, 247, 0.34); }
                .tech-1 { background: rgba(245, 158, 11, 0.18); border-color: rgba(245, 158, 11, 0.34); }
                .tech-2 { background: rgba(236, 72, 153, 0.16); border-color: rgba(236, 72, 153, 0.30); }
                .tech-3 { background: rgba(20, 184, 166, 0.13); border-color: rgba(20, 184, 166, 0.26); }
                .credits-quote {
                    margin-top: 0.7rem;
                    padding: 0.68rem;
                    border-radius: 11px;
                    border: 1px solid rgba(245, 158, 11, 0.24);
                    background: linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(168, 85, 247, 0.10));
                    text-align: center;
                }
                .credits-quote-icon {
                    color: #fbbf24;
                    font-size: 0.9rem;
                    margin-bottom: 0.18rem;
                }
                .credits-quote p {
                    margin: 0;
                    color: rgba(248, 250, 252, 0.74);
                    font-size: 0.7rem;
                    line-height: 1.42;
                    font-style: italic;
                }
                @media (max-width: 820px) {
                    .credits-legacy-page { padding: 0.65rem; border-radius: 14px; }
                    .credits-people,
                    .credits-grid { grid-template-columns: 1fr; }
                    .credits-people article:last-child { text-align: left; }
                    .credits-hero { min-height: 150px; padding: 0.9rem 0.7rem; }
                    .credits-time-row { grid-template-columns: 1fr; gap: 0.35rem; }
                }
            </style>
        `;
    },

    init() {},
};

window.Credits = Credits;
