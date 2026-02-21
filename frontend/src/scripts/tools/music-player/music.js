// ============================================
// 🎵 MUSIC PLAYER - NyanTools にゃん~
// Versão Otimizada v3.0 + Mini Player Premium
// ============================================

const MusicPlayer = {
    // Estado do player
    currentSong: null,
    currentPlaylist: 'outros',
    isPlaying: false,
    audio: null,
    volume: 5,
    
    // Configuração das playlists
    playlists: {
        lofi: {
            name: 'Lofi Chill Beats',
            icon: '🎵',
            gradient: 'from-purple-400 to-pink-500',
            songs: [
                { id: 1, title: 'Lofi Hip Hop Mix', artist: 'Chill Beats', file: 'https://res.cloudinary.com/digea8r7l/video/upload/v1761542001/Chill-Lofi-Beats_alo6hn.mp3', cover: '🎵', duration: '1:42:54' },
                { id: 2, title: 'Chill Study Beats', artist: 'Study Music', file: 'https://res.cloudinary.com/digea8r7l/video/upload/v1761541990/Chill-Study-Music_f0ro3s.mp3', cover: '🎹', duration: '1:07:38' }
            ]
        },
        electronic: {
            name: 'Electronic Vibes',
            icon: '🎧',
            gradient: 'from-cyan-400 to-blue-500',
            songs: [
                { id: 6, title: 'Electronic ITS OVER :D', artist: 'Shake Music', file: 'https://res.cloudinary.com/digea8r7l/video/upload/v1761541996/Songs-Eletronic_eccyvb.mp3', cover: '🌃', duration: '42:16' },
                { id: 7, title: 'Electronic POP', artist: 'EDM Mix', file: 'https://res.cloudinary.com/digea8r7l/video/upload/v1761541988/MIX-ELECTRO_njhdtb.mp3', cover: '⚡', duration: '24:27' }
            ]
        },
        outros: {
            name: 'Outros',
            icon: '😾',
            gradient: 'from-green-400 to-teal-500',
            songs: [
                { id: 8, title: 'Pedrada', artist: 'Depressão', file: 'https://res.cloudinary.com/digea8r7l/video/upload/v1761541979/Tenta-acreditar_yn0abe.mp3', cover: '😿', duration: '3:59' },
                { id: 9, title: 'É...', artist: '😭', file: 'https://res.cloudinary.com/digea8r7l/video/upload/v1761541981/Nao-Fosse-Tao-Tarde_mbauqt.mp3', cover: '👨‍👩‍👦', duration: '2:46' }
            ]
        }
    },
    
    // ============================================
    // RENDER PRINCIPAL
    // ============================================
    
    render() {
        const playlist = this.playlists[this.currentPlaylist];
        const currentSong = this.currentSong || playlist.songs[0];
        
        return `
            <div class="max-w-6xl mx-auto">
                ${this.renderHeader()}
                ${this.renderMainPlayer(playlist, currentSong)}
                ${this.renderPlaylistTabs()}
                ${this.renderCurrentPlaylist(playlist)}
                ${this.renderInfoCard()}
            </div>
        `;
    },
    
    renderHeader() {
        return `
            <div class="text-center mb-4">
                <div class="inline-flex items-center gap-3 mb-2">
                    <div class="text-4xl">🎵</div>
                    <h1 class="text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                        Player de Música
                    </h1>
                </div>
                <p class="text-gray-600 text-sm">Streaming via Cloudinary ☁️</p>
            </div>
        `;
    },
    
    renderMainPlayer(playlist, song) {
        return `
            <div class="relative mb-4">
                <div class="relative bg-white rounded-2xl shadow-xl p-4 border border-gray-200">
                    ${this.renderCoverArt(playlist, song)}
                    ${this.renderSongInfo(song)}
                    ${this.renderProgressBar(song)}
                    ${this.renderControls(playlist)}
                    ${this.renderVolumeControl()}
                </div>
            </div>
        `;
    },
    
    renderCoverArt(playlist, song) {
        return `
            <div class="mb-4">
                <div class="aspect-video bg-gradient-to-br ${playlist.gradient} rounded-xl flex items-center justify-center shadow-lg">
                    <div class="text-6xl animate-pulse">${song.cover}</div>
                </div>
            </div>
        `;
    },
    
    renderSongInfo(song) {
        return `
            <div class="text-center mb-4 bg-gray-50 p-3 rounded-xl">
                <div class="flex items-center justify-center gap-3">
                    <div class="text-3xl">${song.cover}</div>
                    <div class="text-left">
                        <h2 class="text-lg font-black text-gray-800">${song.title}</h2>
                        <p class="text-sm text-gray-600">${song.artist}</p>
                        <p class="text-xs text-gray-500">☁️ Cloudinary CDN • ${song.duration}</p>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderProgressBar(song) {
        return `
            <div class="mb-6">
                <div class="flex items-center gap-4">
                    <span id="current-time" class="text-sm font-bold text-gray-600">0:00</span>
                    <input type="range" id="progress-bar" min="0" max="100" value="0" 
                           class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                           onchange="MusicPlayer.seekTo(this.value)">
                    <span id="duration-time" class="text-sm font-bold text-gray-600">${song.duration}</span>
                </div>
            </div>
        `;
    },
    
    renderControls(playlist) {
        return `
            <div class="flex items-center justify-center gap-3 mb-4">
                <button onclick="MusicPlayer.previous()" 
                        class="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-gray-700">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                    </svg>
                </button>
                
                <button onclick="MusicPlayer.togglePlay()" 
                        id="main-play-button"
                        class="w-16 h-16 bg-gradient-to-br ${playlist.gradient} hover:opacity-90 rounded-full shadow-xl transform hover:scale-110 active:scale-95 transition-all flex items-center justify-center text-white">
                    ${this.isPlaying ? 
                        '<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>' :
                        '<svg class="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>'
                    }
                </button>
                
                <button onclick="MusicPlayer.next()" 
                        class="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-gray-700">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 18h2V6h-2zm-11-1l8.5-6L5 5z"/>
                    </svg>
                </button>
            </div>
        `;
    },
    
    renderVolumeControl() {
        return `
            <div class="flex items-center gap-4 mb-6">
                <span class="text-2xl">🔊</span>
                <input type="range" id="volume-control" min="0" max="100" value="${this.volume}" 
                       class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                       oninput="MusicPlayer.setVolume(this.value)">
                <span id="volume-display" class="text-sm font-bold text-gray-600">${this.volume}%</span>
            </div>
        `;
    },
    
    renderPlaylistTabs() {
        return `
            <div class="bg-white rounded-xl shadow-lg p-3 mb-4">
                <div class="flex gap-2 overflow-x-auto pb-1">
                    ${Object.keys(this.playlists).map(key => this.renderPlaylistTab(key)).join('')}
                </div>
            </div>
        `;
    },
    
    renderPlaylistTab(key) {
        const pl = this.playlists[key];
        const isActive = key === this.currentPlaylist;
        
        return `
            <button onclick="MusicPlayer.switchPlaylist('${key}')" 
                    class="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${
                        isActive 
                        ? `bg-gradient-to-r ${pl.gradient} text-white shadow-md scale-105` 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }">
                <span class="text-xl">${pl.icon}</span>
                <span>${pl.name}</span>
            </button>
        `;
    },
    
    renderCurrentPlaylist(playlist) {
        return `
            <div class="bg-white rounded-xl shadow-lg p-4 mb-4">
                <h3 class="text-xl font-black text-gray-800 flex items-center gap-2 mb-3">
                    <span class="text-2xl">${playlist.icon}</span>
                    <span>${playlist.name}</span>
                    <span class="text-sm font-normal text-gray-500 ml-auto">${playlist.songs.length} músicas</span>
                </h3>
                <div class="space-y-2">
                    ${playlist.songs.map((song, index) => this.renderSongCard(song, index, playlist)).join('')}
                </div>
            </div>
        `;
    },
    
    renderSongCard(song, index, playlist) {
        const isPlaying = this.currentSong?.id === song.id && this.isPlaying;
        const isCurrent = this.currentSong?.id === song.id;
        
        return `
            <div onclick="MusicPlayer.playSong(${index})" 
                 class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all group ${
                     isCurrent ? 'bg-green-50 border border-green-200' : ''
                 }">
                <div class="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    ${isPlaying ? '▶️' : index + 1}
                </div>
                <div class="text-xl flex-shrink-0">${song.cover}</div>
                <div class="flex-1 min-w-0">
                    <div class="font-bold text-sm text-gray-800 truncate">${song.title}</div>
                    <div class="text-xs text-gray-600">${song.artist} • ${song.duration}</div>
                </div>
                ${isCurrent ? 
                    `<div class="text-green-600 text-xl flex-shrink-0">${isPlaying ? '🔊' : '⏸️'}</div>` :
                    `<div class="text-gray-400 group-hover:text-green-600 transition-colors flex-shrink-0">▶️</div>`
                }
            </div>
        `;
    },
    
    renderInfoCard() {
        return `
            <div class="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl shadow-xl p-4 text-white text-center">
                <p class="text-sm font-bold mb-1">🎵 Streaming 100% Online via Cloudinary CDN</p>
                <p class="text-xs opacity-90">Toque em qualquer música para começar にゃん~</p>
            </div>
        `;
    },
    
    // ============================================
    // MINI PLAYER FLUTUANTE SUPER COMPACTO
    // ============================================
    
    renderMiniPlayer() {
        if (!this.currentSong) return '';
        
        const playlist = this.playlists[this.currentPlaylist];
        const colors = this.getPlaylistColors(playlist.gradient);
        
        return `
            <div id="mini-player" class="fixed bottom-6 right-6 bg-gradient-to-br rounded-xl shadow-2xl z-50 border-2 border-white/30 backdrop-blur-lg w-64 overflow-hidden transition-all hover:scale-105" 
                 style="cursor: move; background: linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%);">
                
                <!-- Progress Bar no topo -->
                <div class="relative h-0.5 bg-black/20">
                    <div id="mini-progress-bar" class="h-full bg-white/60 transition-all" style="width: 0%;"></div>
                    <input type="range" id="mini-progress" min="0" max="100" value="0" 
                           class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                           onchange="MusicPlayer.seekTo(this.value)">
                </div>
                
                <!-- Conteúdo -->
                <div class="p-2.5 text-white">
                    <!-- Header compacto -->
                    <div class="flex items-center gap-2 mb-2">
                        <div class="relative flex-shrink-0">
                            <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center text-xl ${this.isPlaying ? 'animate-pulse' : ''}">
                                ${this.currentSong.cover}
                            </div>
                            ${this.isPlaying ? `
                                <div class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border border-white animate-pulse"></div>
                            ` : ''}
                        </div>
                        
                        <div class="flex-1 min-w-0">
                            <h4 class="font-bold text-xs truncate leading-tight">${this.currentSong.title}</h4>
                            <p class="text-xs opacity-70 truncate leading-tight">${this.currentSong.artist}</p>
                        </div>
                        
                        <button onclick="MusicPlayer.closeMiniPlayer()" 
                                class="w-6 h-6 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-md flex items-center justify-center transition-all flex-shrink-0">
                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Controles compactos -->
                    <div class="flex items-center justify-center gap-1.5 mb-2">
                        <button onclick="MusicPlayer.previous()" 
                                class="w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg flex items-center justify-center transition-all transform hover:scale-110 active:scale-95">
                            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                            </svg>
                        </button>
                        
                        <button onclick="MusicPlayer.togglePlay()" 
                                id="mini-play-button"
                                class="w-10 h-10 bg-white/30 hover:bg-white/40 backdrop-blur-sm rounded-lg flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 shadow-lg">
                            ${this.isPlaying ? 
                                '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>' :
                                '<svg class="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>'
                            }
                        </button>
                        
                        <button onclick="MusicPlayer.next()" 
                                class="w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg flex items-center justify-center transition-all transform hover:scale-110 active:scale-95">
                            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M16 18h2V6h-2zm-11-1l8.5-6L5 5z"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Volume compacto -->
                    <div class="flex items-center gap-1.5 mb-2">
                        <svg class="w-3.5 h-3.5 opacity-70" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                        </svg>
                        <div class="flex-1 relative">
                            <div class="h-1 bg-white/20 rounded-full">
                                <div id="mini-volume-bar" class="h-full bg-white/70 rounded-full transition-all" style="width: ${this.volume}%;"></div>
                            </div>
                            <input type="range" id="mini-volume" min="0" max="100" value="${this.volume}" 
                                   class="absolute inset-0 w-full opacity-0 cursor-pointer"
                                   oninput="MusicPlayer.setVolume(this.value)">
                        </div>
                        <span id="mini-volume-display" class="text-xs font-bold opacity-70 w-7 text-right">${this.volume}%</span>
                    </div>
                    
                    <!-- Tempo -->
                    <div class="text-xs opacity-60 text-center" id="mini-current-time">0:00</div>
                </div>
            </div>
        `;
    },
    
    getPlaylistColors(gradient) {
        // Mapeamento completo de cores
        const colorMap = {
            'purple-400': '#c084fc',
            'pink-500': '#ec4899',
            'cyan-400': '#22d3ee',
            'blue-500': '#3b82f6',
            'green-400': '#4ade80',
            'teal-500': '#14b8a6'
        };
        
        // Extrai as cores do gradiente
        const parts = gradient.split(' ');
        let from = '#6366f1';
        let to = '#8b5cf6';
        
        parts.forEach(part => {
            if (part.startsWith('from-')) {
                const color = part.replace('from-', '');
                from = colorMap[color] || from;
            }
            if (part.startsWith('to-')) {
                const color = part.replace('to-', '');
                to = colorMap[color] || to;
            }
        });
        
        return { from, to };
    },
    
    updateMiniPlayer() {
        const existingMiniPlayer = document.getElementById('mini-player');
        
        // Remove mini player existente
        if (existingMiniPlayer) {
            existingMiniPlayer.remove();
        }
        
        // Se está na página de música, não mostra mini player
        if (Router?.currentRoute === 'music') return;
        
        // Se tem música, renderiza mini player
        if (this.currentSong) {
            const miniPlayerHTML = this.renderMiniPlayer();
            document.body.insertAdjacentHTML('beforeend', miniPlayerHTML);
            this.makeDraggable();
        }
    },
    
    makeDraggable() {
        const miniPlayer = document.getElementById('mini-player');
        if (!miniPlayer) return;
        
        let isDragging = false;
        let currentX, currentY, initialX, initialY;
        
        miniPlayer.addEventListener('mousedown', (e) => {
            // Não arrasta se clicar em botões ou inputs
            if (e.target.closest('button') || e.target.closest('input')) return;
            
            isDragging = true;
            initialX = e.clientX - miniPlayer.offsetLeft;
            initialY = e.clientY - miniPlayer.offsetTop;
            miniPlayer.style.cursor = 'grabbing';
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            
            miniPlayer.style.left = currentX + 'px';
            miniPlayer.style.top = currentY + 'px';
            miniPlayer.style.right = 'auto';
            miniPlayer.style.bottom = 'auto';
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                miniPlayer.style.cursor = 'move';
            }
        });
    },
    
    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    
    init() {
        if (!this.audio) {
            this.audio = new Audio();
            this.audio.volume = this.volume / 100;
            this.setupAudioListeners();
        }
        
        if (!this.currentSong) {
            this.currentSong = this.playlists[this.currentPlaylist].songs[0];
        }
        
        if (this.audio.src !== this.currentSong.file) {
            this.audio.src = this.currentSong.file;
        }
        
        // Atualizar mini player
        this.updateMiniPlayer();
    },
    
    setupAudioListeners() {
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.next());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('error', (e) => {
            console.error('❌ Erro ao carregar:', this.audio.error);
            Utils.showNotification?.('❌ Erro ao carregar música', 'error');
        });
    },
    
    // ============================================
    // CONTROLES
    // ============================================
    
    togglePlay() {
        if (!this.audio) {
            Utils.showNotification?.('⚠️ Player não inicializado', 'warning');
            return;
        }
        
        if (this.isPlaying) {
            this.audio.pause();
            this.isPlaying = false;
            Utils.showNotification?.('⏸️ Pausado', 'info');
        } else {
            this.audio.play()
                .then(() => {
                    this.isPlaying = true;
                    Utils.showNotification?.(`▶️ ${this.currentSong.title}`, 'success');
                })
                .catch(err => {
                    console.error('❌ Erro:', err);
                    Utils.showNotification?.('❌ Erro: ' + err.message, 'error');
                });
        }
        
        this.updatePlayButtons();
        this.updateMiniPlayer();
    },
    
    updatePlayButtons() {
        // Botão principal
        const mainPlayButton = document.getElementById('main-play-button');
        if (mainPlayButton) {
            mainPlayButton.innerHTML = this.isPlaying ? 
                '<svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>' :
                '<svg class="w-12 h-12 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
        }
        
        // Botão mini player
        const miniPlayButton = document.getElementById('mini-play-button');
        if (miniPlayButton) {
            miniPlayButton.innerHTML = this.isPlaying ? 
                '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>' :
                '<svg class="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
        }
    },
    
    playSong(id, playlistKey) {
        const playlist = this.playlists[playlistKey];
        const song = playlist.songs.find(s => s.id === id);
        
        if (!song) return;
        
        this.currentSong = song;
        this.currentPlaylist = playlistKey;
        
        if (this.audio) {
            this.audio.src = song.file;
            this.audio.load();
            
            if (this.isPlaying) {
                this.audio.play().catch(err => {
                    console.error('❌ Erro ao tocar:', err);
                    this.isPlaying = false;
                });
            }
        }
        
        // Atualizar mini player
        this.updateMiniPlayer();
        
        if (Router?.currentRoute === 'music') {
            Router.render();
        }
    },
    
    next() {
        const playlist = this.playlists[this.currentPlaylist];
        const currentIndex = playlist.songs.findIndex(s => s.id === this.currentSong.id);
        const nextIndex = (currentIndex + 1) % playlist.songs.length;
        this.playSong(playlist.songs[nextIndex].id, this.currentPlaylist);
    },
    
    previous() {
        const playlist = this.playlists[this.currentPlaylist];
        const currentIndex = playlist.songs.findIndex(s => s.id === this.currentSong.id);
        const prevIndex = currentIndex === 0 ? playlist.songs.length - 1 : currentIndex - 1;
        this.playSong(playlist.songs[prevIndex].id, this.currentPlaylist);
    },
    
    switchPlaylist(key) {
        if (this.currentPlaylist === key) return;
        
        this.currentPlaylist = key;
        const playlist = this.playlists[key];
        this.currentSong = playlist.songs[0];
        
        if (this.audio) {
            this.audio.src = this.currentSong.file;
            this.audio.load();
        }
        
        Utils.showNotification?.(`📂 ${playlist.name}`, 'info');
        
        // Atualizar mini player
        this.updateMiniPlayer();
        
        if (Router?.currentRoute === 'music') {
            Router.render();
        }
    },
    
    setVolume(value) {
        this.volume = parseInt(value);
        if (this.audio) {
            this.audio.volume = this.volume / 100;
        }
        
        // Atualizar displays
        const volumeDisplay = document.getElementById('volume-display');
        if (volumeDisplay) volumeDisplay.textContent = this.volume + '%';
        
        const miniVolume = document.getElementById('mini-volume');
        if (miniVolume) miniVolume.value = this.volume;
        
        const miniVolumeDisplay = document.getElementById('mini-volume-display');
        if (miniVolumeDisplay) miniVolumeDisplay.textContent = this.volume + '%';
        
        const miniVolumeBar = document.getElementById('mini-volume-bar');
        if (miniVolumeBar) miniVolumeBar.style.width = this.volume + '%';
    },
    
    seekTo(value) {
        if (this.audio?.duration) {
            this.audio.currentTime = (value / 100) * this.audio.duration;
        }
    },
    
    updateProgress() {
        if (!this.audio) return;
        
        const progress = (this.audio.currentTime / this.audio.duration) * 100;
        
        // Progress bar principal
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) progressBar.value = progress || 0;
        
        // Progress bar mini player (input range)
        const miniProgress = document.getElementById('mini-progress');
        if (miniProgress) miniProgress.value = progress || 0;
        
        // Progress bar visual do mini player
        const miniProgressBar = document.getElementById('mini-progress-bar');
        if (miniProgressBar) miniProgressBar.style.width = `${progress || 0}%`;
        
        // Current time
        const currentTimeEl = document.getElementById('current-time');
        if (currentTimeEl) currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
        
        // Mini player current time
        const miniCurrentTime = document.getElementById('mini-current-time');
        if (miniCurrentTime) miniCurrentTime.textContent = this.formatTime(this.audio.currentTime);
    },
    
    updateDuration() {
        const durationEl = document.getElementById('duration-time');
        if (durationEl && this.audio?.duration) {
            durationEl.textContent = this.formatTime(this.audio.duration);
        }
    },
    
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
    
    closeMiniPlayer() {
        // Pausa a música
        if (this.isPlaying) {
            this.togglePlay();
        }
        // Remove o mini player
        const miniPlayer = document.getElementById('mini-player');
        if (miniPlayer) {
            miniPlayer.remove();
        }
        // Limpa a música atual
        this.currentSong = null;
    }
};

window.MusicPlayer = MusicPlayer;