/* eslint-disable */
const _PHOTOS = [
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCABQAFADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDyKilooAFYqcqSCKvwXCypzww61n4pyOY23LwRSauNOxqKcdDxTgAenFVYplZcq20jqD0pxukVD/eHb1qGaJlxQQSOhp2KzDfOpx971BprX8jAqDjI4PeizDmRovHmomi9Krw6gwP7wbh9KuRTRzg7TyOoNLVD0ZkUYpaK1MRMYpp604mmYJNACqxByKUHnNKYnUgMMZqYWzbeODUtopJkB5GTnNLsq2bSQJlVY464pXtdgVtjHnkHjrU8yK5GUs9zx7CnRu0b7l4xzTnQI529s9ajC4IHP06VROw6lx60lLTJGN6VYsowzmRjgAcfWq561agZWhWNM5z81KWxUdyaKPzHyeg6CrD+TE6iUkL7Vb0+1DAZFX5dMR0yQK53JXOuNNtXKSR4RJrd/Mi6MDzV5LKO8tiQuMjB9aopBHZ4WMkDJJBbP4Vu6UD5JPVT1qJOxpBX3Oa1LS1hhMicmPlvUj3rKkj4VwCRggEdM+ldvqNpa3fD7Sw464OPSuY1CAWxZIwdo5A7VpCd9DKpTtqZINBNMDGgt7V0HGBrRsIcKSetVbWEySZI4FX7X5Jyh9eKib6GtNa3N2wQDFaNzKkVqSBuYdB61QhBS3LKNzdhmlSZLseW+Y2I5VhXI1d3O+LsrFeO1nuZfmUAd8c1Znaa2g8uEHK9cGrtvavYO0tvhy/UH9atvahlLFck8mk5K5ShocrDMbxv3pMUp4yR3rN1S4Yv5TH94v3iK19YSKzc3BY5QHaoPUmuXdmkcu5yzHJNdFNX1OOq3H3eoyp7RA8pOM7VJqDtVmwkEd0A3RgV/Ot5bHPHc0bK3J5POaW4QwXEcvQZwa0rO3welS3diJUIxXNzanXyaF6xjEiDAzx2qeSy/haP5Schu6mqml3ZsNqzD5em6tK61m2MRZXXn0rF3T0OmDSRFZySxM0U6k7T8r+oqW+1SC2gZpGCheprnLvxNFk+UGk9OwrBu76a9fdK3HZR0FXGi5O7Mp4lRXukuq6i+pXRcgrGvCL/AFqiBg07uKMc5rsSSVkcDbk7s//Z",
    "data:image/jpeg;base64,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"
];
/* eslint-enable */

const BetaTesters = {

    _current: 0,

    _testers: [
        {
            name:  'Pietro',
            role:  'Beta Tester',
            photo: _PHOTOS[0],
            desc:  'Testa tudo e encontra os bugs mais insanos',
            social: [
                { icon: 'instagram', url: 'https://www.instagram.com/pietrogbss/', label: 'Instagram' }
            ]
        },
        {
            name:  'Junior',
            role:  'Beta Tester',
            photo: _PHOTOS[1],
            desc:  'Tem um olho clínico pra detalhes que ninguém nota',
            social: [
                { icon: 'instagram', url: 'https://www.instagram.com/gilbert.jrr/',  label: 'Instagram' },
                { icon: 'github',    url: 'https://github.com/juniorlindao',          label: 'GitHub' }
            ]
        }
    ],

    _icons: {
        instagram: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
        github:    '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>'
    },

    show() {
        this._current = 0;
        document.getElementById('beta-testers-modal')?.remove();

        const modal = document.createElement('div');
        modal.id = 'beta-testers-modal';
        modal.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.75);';
        modal.innerHTML = `
            <style>
                @keyframes btIn{from{opacity:0;transform:scale(0.88) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
                @keyframes btFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
                .bt-tab{flex:1;padding:0.5rem;border-radius:8px;border:none;background:transparent;color:rgba(255,255,255,0.4);font-size:0.78rem;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.18s ease;}
                .bt-tab.active{background:rgba(168,85,247,0.2);color:rgba(200,150,255,0.95);border:1px solid rgba(168,85,247,0.3);}
                .bt-tab:not(.active):hover{color:rgba(255,255,255,0.7);}
                .bt-social a{display:inline-flex;align-items:center;gap:4px;color:rgba(255,255,255,0.35);font-size:0.7rem;text-decoration:none;padding:3px 8px;border-radius:6px;border:1px solid rgba(255,255,255,0.08);transition:all 0.15s;}
                .bt-social a:hover{color:#c084fc;border-color:rgba(168,85,247,0.35);background:rgba(168,85,247,0.08);}
            </style>
            <div id="bt-card" style="background:linear-gradient(145deg,#0e0e1a,#14102a);border:1px solid rgba(168,85,247,0.25);border-radius:20px;padding:1.75rem;max-width:340px;width:90%;box-shadow:0 32px 80px rgba(0,0,0,0.6);animation:btIn 0.35s cubic-bezier(0.34,1.2,0.64,1);">

                <!-- Header -->
                <div style="text-align:center;margin-bottom:1.25rem;">
                    <div style="font-size:2rem;animation:btFloat 3s ease-in-out infinite;display:inline-block;margin-bottom:0.5rem;">🐾</div>
                    <div style="font-family:'Syne',sans-serif;font-size:1rem;font-weight:900;color:white;letter-spacing:-0.02em;">Cobaias de Teste</div>
                    <div style="font-size:0.7rem;color:rgba(255,255,255,0.3);margin-top:0.2rem;">As almas corajosas que testam antes de todo mundo にゃん~</div>
                </div>

                <!-- Tabs -->
                <div style="display:flex;gap:0.25rem;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:0.25rem;margin-bottom:1.25rem;" id="bt-tabs"></div>

                <!-- Conteúdo -->
                <div id="bt-content"></div>

                <div style="height:1px;background:rgba(255,255,255,0.07);margin:1.25rem 0 1rem;"></div>
                <p style="text-align:center;font-size:0.68rem;color:rgba(255,255,255,0.18);margin-bottom:1rem;">🙏 Obrigado por ajudar a tornar o NyanTools melhor!</p>
                <button onclick="document.getElementById('beta-testers-modal').remove()" style="width:100%;padding:0.55rem;background:rgba(168,85,247,0.15);border:1px solid rgba(168,85,247,0.25);border-radius:10px;color:rgba(200,150,255,0.9);font-size:0.8rem;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;" onmouseover="this.style.background='rgba(168,85,247,0.3)'" onmouseout="this.style.background='rgba(168,85,247,0.15)'">Fechar にゃん~</button>
            </div>`;

        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
        document.body.appendChild(modal);

        this._renderTabs();
        this._renderContent(0);
    },

    _renderTabs() {
        const tabs = document.getElementById('bt-tabs');
        if (!tabs) return;
        tabs.innerHTML = this._testers.map((t, i) => `
            <button class="bt-tab ${i === this._current ? 'active' : ''}"
                    onclick="BetaTesters._renderContent(${i})">${t.name}</button>
        `).join('');
    },

    _renderContent(idx) {
        this._current = idx;
        this._renderTabs();

        const t = this._testers[idx];
        const content = document.getElementById('bt-content');
        if (!content) return;

        const socialHTML = (t.social || []).map(s =>
            `<a href="${s.url}" target="_blank">${this._icons[s.icon]} ${s.label}</a>`
        ).join('');

        content.style.animation = 'none';
        content.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;gap:1rem;text-align:center;">
                <div style="width:88px;height:88px;border-radius:22px;overflow:hidden;border:2px solid rgba(168,85,247,0.4);box-shadow:0 8px 24px rgba(168,85,247,0.2);">
                    <img src="${t.photo}" style="width:100%;height:100%;object-fit:cover;">
                </div>
                <div>
                    <div style="font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:900;color:white;letter-spacing:-0.02em;">${t.name}</div>
                    <div style="font-size:0.72rem;color:#c084fc;font-weight:600;margin-top:2px;">${t.role}</div>
                    <div style="font-size:0.75rem;color:rgba(255,255,255,0.4);margin-top:0.5rem;line-height:1.5;">${t.desc}</div>
                </div>
                <div class="bt-social" style="display:flex;gap:0.5rem;flex-wrap:wrap;justify-content:center;">${socialHTML}</div>
            </div>`;

        requestAnimationFrame(() => {
            content.style.animation = 'btIn 0.2s ease';
        });
    },

    init() {
        const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
        let pos = 0;
        document.addEventListener('keydown', e => {
            pos = e.key === KONAMI[pos] ? pos + 1 : (e.key === KONAMI[0] ? 1 : 0);
            if (pos === KONAMI.length) { pos = 0; this.show(); }
        });
        console.log('🐾 BetaTesters inicializado — Konami: ↑↑↓↓←→←→BA');
    }
};

window.BetaTesters = BetaTesters;