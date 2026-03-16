/* MUSIC.JS v2.0.0 — NyanTools にゃん~ */

const MusicPlayer = {
    currentSong: null,
    currentPlaylist: 'outros',
    isPlaying: false,
    audio: null,
    volume: 3,

    playlists: {
        lofi: {
            name: 'Lofi Chill Beats',
            icon: '🎵',
            color: '#a855f7',
            songs: [
                { id: 1, title: 'Lofi Hip Hop Mix',   artist: 'Chill Beats',  file: 'https://res.cloudinary.com/digea8r7l/video/upload/v1761542001/Chill-Lofi-Beats_alo6hn.mp3',  cover: '🎵', duration: '1:42:54' },
                { id: 2, title: 'Chill Study Beats',  artist: 'Study Music',  file: 'https://res.cloudinary.com/digea8r7l/video/upload/v1761541990/Chill-Study-Music_f0ro3s.mp3', cover: '🎹', duration: '1:07:38' }
            ]
        },
        electronic: {
            name: 'Electronic Vibes',
            icon: '🎧',
            color: '#22d3ee',
            songs: [
                { id: 6, title: 'Electronic ITS OVER :D', artist: 'Shake Music', file: 'https://res.cloudinary.com/digea8r7l/video/upload/v1761541996/Songs-Eletronic_eccyvb.mp3', cover: '🌃', duration: '42:16' },
                { id: 7, title: 'Electronic POP',         artist: 'EDM Mix',     file: 'https://res.cloudinary.com/digea8r7l/video/upload/v1761541988/MIX-ELECTRO_njhdtb.mp3',      cover: '⚡', duration: '24:27' }
            ]
        },
        outros: {
            name: 'Outros',
            icon: '😾',
            color: '#4ade80',
            songs: [
                { id: 8, title: 'Pedrada', artist: 'Depressão', file: 'https://res.cloudinary.com/digea8r7l/video/upload/v1761541979/Tenta-acreditar_yn0abe.mp3',   cover: '😿',        duration: '3:59' },
                { id: 9, title: 'É...',    artist: '😭',         file: 'https://res.cloudinary.com/digea8r7l/video/upload/v1761541981/Nao-Fosse-Tao-Tarde_mbauqt.mp3', cover: '👨‍👩‍👦', duration: '2:46' }
            ]
        }
    },

    render() {
        const d = document.body.classList.contains('dark-theme');
        const bg      = d ? 'rgba(255,255,255,0.04)' : '#ffffff';
        const border  = d ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
        const text    = d ? '#e2e8f0' : '#1e293b';
        const subtext = d ? 'rgba(255,255,255,0.4)'  : 'rgba(0,0,0,0.4)';
        const hover   = d ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)';
        const inputBg = d ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)';

        const playlist = this.playlists[this.currentPlaylist];
        const song = this.currentSong || playlist.songs[0];

        const SVG_PREV = `<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>`;
        const SVG_NEXT = `<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M16 18h2V6h-2zm-11-1l8.5-6L5 5z"/></svg>`;
        const SVG_PLAY = `<svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
        const SVG_PAUSE= `<svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>`;

        return `<style>
            .mp-root{max-width:560px;margin:0 auto;font-family:'DM Sans',sans-serif}
            .mp-card{background:${bg};border:1px solid ${border};border-radius:18px;padding:1.25rem;margin-bottom:0.75rem}
            .mp-label{font-size:0.68rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${subtext};margin-bottom:0.75rem;display:block}
            .mp-slider{width:100%;-webkit-appearance:none;appearance:none;height:4px;border-radius:99px;outline:none;cursor:pointer;background:${inputBg}}
            .mp-slider::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:#a855f7;cursor:pointer;box-shadow:0 1px 4px rgba(168,85,247,0.4)}
            .mp-ctrl{width:40px;height:40px;border-radius:10px;border:1px solid ${border};background:${inputBg};color:${text};cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s;flex-shrink:0}
            .mp-ctrl:hover{background:rgba(168,85,247,0.12);border-color:rgba(168,85,247,0.3);color:#a855f7}
            .mp-play{width:52px;height:52px;border-radius:14px;border:none;background:linear-gradient(135deg,#a855f7,#ec4899);color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(168,85,247,0.35);transition:all 0.15s;flex-shrink:0}
            .mp-play:hover{transform:scale(1.06);box-shadow:0 6px 20px rgba(168,85,247,0.45)}
            .mp-tab{padding:0.5rem 1rem;border-radius:8px;border:1px solid ${border};background:transparent;color:${subtext};font-size:0.78rem;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;white-space:nowrap}
            .mp-tab.active{background:rgba(168,85,247,0.15);border-color:rgba(168,85,247,0.35);color:${d?'#c084fc':'#7c3aed'}}
            .mp-song-row{display:flex;align-items:center;gap:0.75rem;padding:0.625rem 0.75rem;border-radius:10px;cursor:pointer;transition:background 0.12s}
            .mp-song-row:hover{background:${hover}}
            .mp-song-row.active{background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.2)}
        </style>

        <div class="mp-root">

            <!-- Header -->
            <div style="text-align:center;margin-bottom:1.5rem;">
                <div style="font-size:2.8rem;margin-bottom:0.5rem;">🎵</div>
                <h1 style="font-family:'Syne',sans-serif;font-size:1.8rem;font-weight:900;background:linear-gradient(135deg,#a855f7,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin:0 0 0.25rem;">Player de Música</h1>
                <p style="font-size:0.82rem;color:${subtext};font-weight:500;">Streaming via Cloudinary CDN にゃん~</p>
            </div>

            <!-- Player principal -->
            <div class="mp-card">
                <!-- Capa + info -->
                <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.25rem;">
                    <div style="width:64px;height:64px;border-radius:14px;background:linear-gradient(135deg,${playlist.color},#ec4899);display:flex;align-items:center;justify-content:center;font-size:2rem;flex-shrink:0;box-shadow:0 4px 16px rgba(0,0,0,0.15);">
                        ${song.cover}
                    </div>
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:1rem;font-weight:800;color:${text};margin-bottom:0.2rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${song.title}</div>
                        <div style="font-size:0.78rem;color:${subtext};">${song.artist}</div>
                        <div style="font-size:0.68rem;color:${subtext};margin-top:0.1rem;">☁️ ${song.duration}</div>
                    </div>
                </div>

                <!-- Barra de progresso -->
                <div style="margin-bottom:1rem;">
                    <input type="range" id="progress-bar" class="mp-slider" min="0" max="100" value="0"
                           style="width:100%;" onchange="MusicPlayer.seekTo(this.value)">
                    <div style="display:flex;justify-content:space-between;margin-top:0.375rem;">
                        <span id="current-time" style="font-size:0.68rem;font-weight:600;color:${subtext};">0:00</span>
                        <span id="duration-time" style="font-size:0.68rem;font-weight:600;color:${subtext};">${song.duration}</span>
                    </div>
                </div>

                <!-- Controles -->
                <div style="display:flex;align-items:center;justify-content:center;gap:0.625rem;margin-bottom:1rem;">
                    <button class="mp-ctrl" onclick="MusicPlayer.previous()" title="Anterior">${SVG_PREV}</button>
                    <button class="mp-play" id="main-play-button" onclick="MusicPlayer.togglePlay()">
                        ${this.isPlaying ? SVG_PAUSE : SVG_PLAY}
                    </button>
                    <button class="mp-ctrl" onclick="MusicPlayer.next()" title="Próxima">${SVG_NEXT}</button>
                </div>

                <!-- Volume -->
                <div style="display:flex;align-items:center;gap:0.75rem;">
                    <span style="font-size:1rem;flex-shrink:0;">🔊</span>
                    <input type="range" id="volume-control" class="mp-slider" min="0" max="100" value="${this.volume}"
                           style="flex:1;" oninput="MusicPlayer.setVolume(this.value)">
                    <span id="volume-display" style="font-size:0.72rem;font-weight:700;color:${subtext};min-width:2.5rem;text-align:right;">${this.volume}%</span>
                </div>
            </div>

            <!-- Tabs de playlists -->
            <div class="mp-card" style="padding:0.875rem 1.25rem;">
                <div style="display:flex;gap:0.5rem;overflow-x:auto;">
                    ${Object.entries(this.playlists).map(([key, pl]) => `
                    <button class="mp-tab ${key === this.currentPlaylist ? 'active' : ''}"
                            onclick="MusicPlayer.switchPlaylist('${key}')">
                        ${pl.icon} ${pl.name}
                    </button>`).join('')}
                </div>
            </div>

            <!-- Lista de músicas -->
            <div class="mp-card">
                <span class="mp-label">${playlist.icon} ${playlist.name} · ${playlist.songs.length} músicas</span>
                ${playlist.songs.map((s, i) => {
                    const isCurrent = this.currentSong?.id === s.id;
                    const isPlay = isCurrent && this.isPlaying;
                    return `
                    <div class="mp-song-row ${isCurrent ? 'active' : ''}"
                         onclick="MusicPlayer.playSong(${s.id}, '${this.currentPlaylist}')">
                        <div style="width:32px;height:32px;border-radius:8px;background:${isCurrent ? 'rgba(168,85,247,0.2)' : 'rgba(128,128,128,0.1)'};display:flex;align-items:center;justify-content:center;font-size:0.78rem;font-weight:800;color:${isCurrent ? '#a855f7' : subtext};flex-shrink:0;">
                            ${isPlay ? '▶' : i + 1}
                        </div>
                        <div style="font-size:1.2rem;flex-shrink:0;">${s.cover}</div>
                        <div style="flex:1;min-width:0;">
                            <div style="font-size:0.85rem;font-weight:700;color:${isCurrent ? (d?'#c084fc':'#7c3aed') : text};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.title}</div>
                            <div style="font-size:0.72rem;color:${subtext};">${s.artist} · ${s.duration}</div>
                        </div>
                        <div style="font-size:0.8rem;color:${isCurrent ? '#a855f7' : subtext};flex-shrink:0;">
                            ${isPlay ? '🔊' : isCurrent ? '⏸' : ''}
                        </div>
                    </div>`;
                }).join('')}
            </div>

        </div>`;
    },

    // ── MINI PLAYER (inalterado) ─────────────────────────────────────────────

    renderMiniPlayer() {
        if (!this.currentSong) return '';
        const playlist = this.playlists[this.currentPlaylist];
        const colors = this.getPlaylistColors(playlist);

        return `
            <div id="mini-player" class="fixed bottom-6 right-6 rounded-xl shadow-2xl z-50 w-64 overflow-hidden transition-all hover:scale-105"
                 style="cursor:move;background:linear-gradient(135deg,${colors.from} 0%,${colors.to} 100%);border:2px solid rgba(255,255,255,0.3);">
                <div class="relative h-0.5 bg-black/20">
                    <div id="mini-progress-bar" class="h-full bg-white/60 transition-all" style="width:0%;"></div>
                    <input type="range" id="mini-progress" min="0" max="100" value="0"
                           class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                           onchange="MusicPlayer.seekTo(this.value)">
                </div>
                <div class="p-2.5 text-white">
                    <div class="flex items-center gap-2 mb-2">
                        <div class="relative flex-shrink-0">
                            <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-xl ${this.isPlaying?'animate-pulse':''}">
                                ${this.currentSong.cover}
                            </div>
                            ${this.isPlaying?`<div class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border border-white animate-pulse"></div>`:''}
                        </div>
                        <div class="flex-1 min-w-0">
                            <h4 class="font-bold text-xs truncate leading-tight">${this.currentSong.title}</h4>
                            <p class="text-xs opacity-70 truncate leading-tight">${this.currentSong.artist}</p>
                        </div>
                        <button onclick="MusicPlayer.closeMiniPlayer()"
                                class="w-6 h-6 bg-white/20 hover:bg-white/30 rounded-md flex items-center justify-center transition-all flex-shrink-0">
                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                        </button>
                    </div>
                    <div class="flex items-center justify-center gap-1.5 mb-2">
                        <button onclick="MusicPlayer.previous()" class="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all">
                            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                        </button>
                        <button onclick="MusicPlayer.togglePlay()" id="mini-play-button"
                                class="w-10 h-10 bg-white/30 hover:bg-white/40 rounded-lg flex items-center justify-center transition-all shadow-lg">
                            ${this.isPlaying
                                ? '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>'
                                : '<svg class="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>'}
                        </button>
                        <button onclick="MusicPlayer.next()" class="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all">
                            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 18h2V6h-2zm-11-1l8.5-6L5 5z"/></svg>
                        </button>
                    </div>
                    <div class="flex items-center gap-1.5 mb-2">
                        <svg class="w-3.5 h-3.5 opacity-70" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
                        <div class="flex-1 relative">
                            <div class="h-1 bg-white/20 rounded-full">
                                <div id="mini-volume-bar" class="h-full bg-white/70 rounded-full transition-all" style="width:${this.volume}%;"></div>
                            </div>
                            <input type="range" id="mini-volume" min="0" max="100" value="${this.volume}"
                                   class="absolute inset-0 w-full opacity-0 cursor-pointer"
                                   oninput="MusicPlayer.setVolume(this.value)">
                        </div>
                        <span id="mini-volume-display" class="text-xs font-bold opacity-70 w-7 text-right">${this.volume}%</span>
                    </div>
                    <div class="text-xs opacity-60 text-center" id="mini-current-time">0:00</div>
                </div>
            </div>`;
    },

    getPlaylistColors(playlist) {
        const map = { lofi: { from:'#c084fc', to:'#ec4899' }, electronic: { from:'#22d3ee', to:'#3b82f6' }, outros: { from:'#4ade80', to:'#14b8a6' } };
        return map[this.currentPlaylist] || { from:'#a855f7', to:'#ec4899' };
    },

    updateMiniPlayer() {
        document.getElementById('mini-player')?.remove();
        if (Router?.currentRoute === 'music') return;
        if (this.currentSong) {
            document.body.insertAdjacentHTML('beforeend', this.renderMiniPlayer());
            this.makeDraggable();
        }
    },

    makeDraggable() {
        const mp = document.getElementById('mini-player');
        if (!mp) return;
        let dragging = false, ix, iy;
        mp.addEventListener('mousedown', e => {
            if (e.target.closest('button') || e.target.closest('input')) return;
            dragging = true; ix = e.clientX - mp.offsetLeft; iy = e.clientY - mp.offsetTop;
            mp.style.cursor = 'grabbing';
        });
        document.addEventListener('mousemove', e => {
            if (!dragging) return;
            e.preventDefault();
            mp.style.left = (e.clientX - ix) + 'px'; mp.style.top = (e.clientY - iy) + 'px';
            mp.style.right = 'auto'; mp.style.bottom = 'auto';
        });
        document.addEventListener('mouseup', () => { if (dragging) { dragging = false; mp.style.cursor = 'move'; } });
    },

    // ── INIT & AUDIO ────────────────────────────────────────────────────────

    init() {
        if (!this.audio) {
            this.audio = new Audio();
            this.audio.volume = this.volume / 100;
            this.audio.addEventListener('timeupdate',    () => this.updateProgress());
            this.audio.addEventListener('ended',         () => this.next());
            this.audio.addEventListener('loadedmetadata',() => this.updateDuration());
            this.audio.addEventListener('error',         () => Utils.showNotification?.('❌ Erro ao carregar música', 'error'));
        }
        if (!this.currentSong) this.currentSong = this.playlists[this.currentPlaylist].songs[0];
        if (this.audio.src !== this.currentSong.file) this.audio.src = this.currentSong.file;
        this.updateMiniPlayer();
    },

    // ── CONTROLES ───────────────────────────────────────────────────────────

    togglePlay() {
        if (!this.audio) { Utils.showNotification?.('⚠️ Player não inicializado', 'warning'); return; }
        if (this.isPlaying) {
            this.audio.pause();
            this.isPlaying = false;
            Utils.showNotification?.('⏸️ Pausado', 'info');
        } else {
            this.audio.play().then(() => {
                this.isPlaying = true;
                Utils.showNotification?.(`▶️ ${this.currentSong.title}`, 'success');
            }).catch(err => Utils.showNotification?.('❌ ' + err.message, 'error'));
        }
        this.updatePlayButtons();
        this.updateMiniPlayer();
    },

    updatePlayButtons() {
        const PLAY  = `<svg class="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
        const PAUSE = `<svg class="w-8 h-8"      fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>`;
        const main = document.getElementById('main-play-button');
        if (main) main.innerHTML = this.isPlaying ? PAUSE : PLAY;
        const MPLAY  = `<svg class="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
        const MPAUSE = `<svg class="w-4 h-4"         fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>`;
        const mini = document.getElementById('mini-play-button');
        if (mini) mini.innerHTML = this.isPlaying ? MPAUSE : MPLAY;
    },

    playSong(id, playlistKey) {
        const song = this.playlists[playlistKey]?.songs.find(s => s.id === id);
        if (!song) return;
        this.currentSong = song;
        this.currentPlaylist = playlistKey;
        if (this.audio) {
            this.audio.src = song.file;
            this.audio.load();
            if (this.isPlaying) this.audio.play().catch(() => { this.isPlaying = false; });
        }
        this.updateMiniPlayer();
        if (Router?.currentRoute === 'music') Router.render();
    },

    next() {
        const pl = this.playlists[this.currentPlaylist];
        const i = pl.songs.findIndex(s => s.id === this.currentSong.id);
        this.playSong(pl.songs[(i + 1) % pl.songs.length].id, this.currentPlaylist);
    },

    previous() {
        const pl = this.playlists[this.currentPlaylist];
        const i = pl.songs.findIndex(s => s.id === this.currentSong.id);
        this.playSong(pl.songs[i === 0 ? pl.songs.length - 1 : i - 1].id, this.currentPlaylist);
    },

    switchPlaylist(key) {
        if (this.currentPlaylist === key) return;
        this.currentPlaylist = key;
        this.currentSong = this.playlists[key].songs[0];
        if (this.audio) { this.audio.src = this.currentSong.file; this.audio.load(); }
        Utils.showNotification?.(`📂 ${this.playlists[key].name}`, 'info');
        this.updateMiniPlayer();
        if (Router?.currentRoute === 'music') Router.render();
    },

    setVolume(value) {
        this.volume = parseInt(value);
        if (this.audio) this.audio.volume = this.volume / 100;
        const vd = document.getElementById('volume-display'); if (vd) vd.textContent = this.volume + '%';
        const mv = document.getElementById('mini-volume'); if (mv) mv.value = this.volume;
        const mvd = document.getElementById('mini-volume-display'); if (mvd) mvd.textContent = this.volume + '%';
        const mvb = document.getElementById('mini-volume-bar'); if (mvb) mvb.style.width = this.volume + '%';
    },

    seekTo(value) {
        if (this.audio?.duration) this.audio.currentTime = (value / 100) * this.audio.duration;
    },

    updateProgress() {
        if (!this.audio) return;
        const pct = (this.audio.currentTime / this.audio.duration) * 100 || 0;
        const pb = document.getElementById('progress-bar'); if (pb) pb.value = pct;
        const mp = document.getElementById('mini-progress'); if (mp) mp.value = pct;
        const mpb = document.getElementById('mini-progress-bar'); if (mpb) mpb.style.width = pct + '%';
        const ct = document.getElementById('current-time'); if (ct) ct.textContent = this.formatTime(this.audio.currentTime);
        const mct = document.getElementById('mini-current-time'); if (mct) mct.textContent = this.formatTime(this.audio.currentTime);
    },

    updateDuration() {
        const el = document.getElementById('duration-time');
        if (el && this.audio?.duration) el.textContent = this.formatTime(this.audio.duration);
    },

    formatTime(s) {
        if (isNaN(s)) return '0:00';
        return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
    },

    closeMiniPlayer() {
        if (this.isPlaying) this.togglePlay();
        document.getElementById('mini-player')?.remove();
        this.currentSong = null;
    }
};

window.MusicPlayer = MusicPlayer;