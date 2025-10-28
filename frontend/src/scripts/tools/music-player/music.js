// Player de Música 100% CLOUDINARY - NyanTools
// ✨ NOVO: Modo Background - Toca em todas as abas!

const MusicPlayer = {
    currentSong: null,
    currentPlaylist: 'lofi',
    isPlaying: false,
    audio: null, // ⚠️ Agora é GLOBAL (não recriado)
    volume: 5,
    
    playlists: {
        lofi: {
            name: 'Lofi Chill Beats',
            icon: '🎵',
            gradient: 'from-purple-400 to-pink-500',
            songs: [
                {
                    id: 1,
                    title: 'Lofi Hip Hop Mix',
                    artist: 'Chill Beats',
                    file: 'https://res.cloudinary.com/digea8r7l/video/upload/v1761542001/Chill-Lofi-Beats_alo6hn.mp3',
                    cover: '🎵',
                    duration: '1:42:54'
                },
                {
                    id: 2,
                    title: 'Chill Study Beats',
                    artist: 'Study Music',
                    file: 'https://res.cloudinary.com/digea8r7l/video/upload/v1761541990/Chill-Study-Music_f0ro3s.mp3',
                    cover: '🎹',
                    duration: '1:07:38'
                }
            ]
        },
        electronic: {
            name: 'Electronic Vibes',
            icon: '🎧',
            gradient: 'from-cyan-400 to-blue-500',
            songs: [
                {
                    id: 6,
                    title: 'Electronic ITS OVER :D',
                    artist: 'Shake Music',
                    file: 'https://res.cloudinary.com/digea8r7l/video/upload/v1761541996/Songs-Eletronic_eccyvb.mp3',
                    cover: '🌃',
                    duration: '42:16'
                },
                {
                    id: 7,
                    title: 'Electronic POP',
                    artist: 'EDM Mix',
                    file: 'https://res.cloudinary.com/digea8r7l/video/upload/v1761541988/MIX-ELECTRO_njhdtb.mp3',
                    cover: '⚡',
                    duration: '24:27'
                }
            ]
        },
        relaxing: {
            name: 'Outros',
            icon: '😾',
            gradient: 'from-green-400 to-teal-500',
            songs: [
                {
                    id: 8,
                    title: 'Pedrada',
                    artist: 'Depressão',
                    file: 'https://res.cloudinary.com/digea8r7l/video/upload/v1761541979/Tenta-acreditar_yn0abe.mp3',
                    cover: '😿',
                    duration: '3:59'
                },
                {
                    id: 9,
                    title: 'É...',
                    artist: '😭',
                    file: 'https://res.cloudinary.com/digea8r7l/video/upload/v1761541981/Nao-Fosse-Tao-Tarde_mbauqt.mp3',
                    cover: '👨‍👩‍👦',
                    duration: '2:46'
                }
            ]
        }
    },
    
    // ✨ NOVO: Mini Player Flutuante
    renderMiniPlayer() {
        if (!this.currentSong || !this.isPlaying) return '';
        
        const song = this.currentSong;
        const playlist = this.playlists[this.currentPlaylist];
        
        return `
            <div id="mini-player" class="fixed bottom-6 right-6 bg-gradient-to-br ${playlist.gradient} rounded-2xl shadow-2xl p-4 z-50 max-w-xs animate-slideInUp">
                <div class="flex items-center gap-3 mb-3">
                    <div class="text-4xl animate-pulse">${song.cover}</div>
                    <div class="flex-1 text-white">
                        <div class="font-bold text-sm truncate">${song.title}</div>
                        <div class="text-xs opacity-90 truncate">${song.artist}</div>
                    </div>
                    <button onclick="Router.navigate('music')" 
                            class="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
                        </svg>
                    </button>
                </div>
                
                <div class="flex items-center gap-2">
                    <button onclick="MusicPlayer.togglePlay()" 
                            class="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all">
                        <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            ${this.isPlaying ? 
                                '<path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>' :
                                '<path d="M8 5v14l11-7z"/>'
                            }
                        </svg>
                    </button>
                    
                    <button onclick="MusicPlayer.previous()" 
                            class="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all">
                        <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                        </svg>
                    </button>
                    
                    <button onclick="MusicPlayer.next()" 
                            class="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all">
                        <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16 18h2V6h-2zm-11-1l8.5-6L5 5z"/>
                        </svg>
                    </button>
                    
                    <input type="range" 
                           min="0" max="100" 
                           value="${this.volume}" 
                           onchange="MusicPlayer.setVolume(this.value)"
                           class="flex-1 h-2 bg-white/30 rounded-lg appearance-none cursor-pointer">
                </div>
                
                <div class="mt-2">
                    <div class="w-full bg-white/30 rounded-full h-1 overflow-hidden">
                        <div id="mini-progress" class="bg-white h-full rounded-full transition-all" style="width: 0%"></div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // ✨ NOVO: Atualizar Mini Player
    updateMiniPlayer() {
        const miniPlayer = document.getElementById('mini-player');
        if (!miniPlayer || !this.audio) return;
        
        const progress = (this.audio.currentTime / this.audio.duration) * 100 || 0;
        const progressBar = document.getElementById('mini-progress');
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
    },
    
    render() {
        const playlist = this.playlists[this.currentPlaylist];
        const currentSong = this.currentSong || playlist.songs[0];
        
        return `
            <div class="max-w-6xl mx-auto">
                <!-- Header -->
                <div class="text-center mb-8">
                    <div class="inline-block mb-4">
                        <div class="relative">
                            <div class="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-50"></div>
                            <div class="relative text-7xl animate-bounce-slow">🎵</div>
                        </div>
                    </div>
                    <h1 class="text-5xl font-black mb-3 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                        Player de Música
                    </h1>
                    <p class="text-gray-600 text-lg font-semibold">Streaming via Cloudinary ☁️</p>
                </div>
                
                <!-- Main Player Card -->
                <div class="relative mb-8">
                    <div class="absolute inset-0 bg-gradient-to-br ${playlist.gradient} rounded-3xl blur-2xl opacity-20"></div>
                    <div class="relative bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100">
                        
                        <!-- Audio Player (GLOBAL - não recriado) -->
                        <div class="mb-8">
                            <div class="aspect-video bg-gradient-to-br ${playlist.gradient} rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center relative">
                                <div class="text-9xl animate-pulse">${currentSong.cover}</div>
                                <!-- ⚠️ Áudio agora é criado apenas UMA VEZ no init() -->
                            </div>
                        </div>
                        
                        <!-- Song Info -->
                        <div class="text-center mb-6">
                            <div class="inline-flex items-center gap-4 bg-gradient-to-r ${playlist.gradient} bg-opacity-10 px-8 py-4 rounded-2xl">
                                <div class="text-5xl">${currentSong.cover}</div>
                                <div class="text-left">
                                    <h2 class="text-3xl font-black text-gray-800">${currentSong.title}</h2>
                                    <p class="text-lg text-gray-600 font-semibold">${currentSong.artist}</p>
                                    <p class="text-sm text-gray-500">☁️ Cloudinary CDN • ${currentSong.duration}</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Progress Bar -->
                        <div class="mb-6">
                            <div class="flex items-center gap-4">
                                <span id="current-time" class="text-sm font-bold text-gray-600">0:00</span>
                                <input type="range" id="progress-bar" min="0" max="100" value="0" 
                                       class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                       onchange="MusicPlayer.seekTo(this.value)">
                                <span id="duration-time" class="text-sm font-bold text-gray-600">${currentSong.duration}</span>
                            </div>
                        </div>
                        
                        <!-- Controls -->
                        <div class="flex items-center justify-center gap-4 mb-6">
                            <button onclick="MusicPlayer.previous()" 
                                    class="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 transition-all flex items-center justify-center text-gray-700">
                                <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                                </svg>
                            </button>
                            
                            <button onclick="MusicPlayer.togglePlay()" 
                                    class="w-24 h-24 bg-gradient-to-br ${playlist.gradient} hover:opacity-90 rounded-full shadow-2xl hover:shadow-pink-500/50 transform hover:scale-110 active:scale-95 transition-all flex items-center justify-center text-white">
                                ${this.isPlaying ? 
                                    '<svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>' :
                                    '<svg class="w-12 h-12 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>'
                                }
                            </button>
                            
                            <button onclick="MusicPlayer.next()" 
                                    class="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 transition-all flex items-center justify-center text-gray-700">
                                <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M16 18h2V6h-2zm-11-1l8.5-6L5 5z"/>
                                </svg>
                            </button>
                        </div>
                        
                        <!-- Volume Control -->
                        <div class="flex items-center gap-4 mb-6">
                            <span class="text-2xl">🔊</span>
                            <input type="range" id="volume-control" min="0" max="100" value="${this.volume}" 
                                   class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                   oninput="MusicPlayer.setVolume(this.value)">
                            <span id="volume-display" class="text-sm font-bold text-gray-600">${this.volume}%</span>
                        </div>
                    </div>
                </div>
                
                <!-- Playlist Tabs -->
                <div class="bg-white rounded-2xl shadow-2xl p-6 mb-8">
                    <div class="flex gap-3 mb-6 overflow-x-auto pb-2">
                        ${Object.keys(this.playlists).map(key => {
                            const pl = this.playlists[key];
                            const isActive = key === this.currentPlaylist;
                            return `
                                <button onclick="MusicPlayer.switchPlaylist('${key}')" 
                                        class="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                                            isActive 
                                            ? `bg-gradient-to-r ${pl.gradient} text-white shadow-lg scale-105` 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }">
                                    <span class="text-2xl">${pl.icon}</span>
                                    <span>${pl.name}</span>
                                </button>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <!-- Current Playlist -->
                <div class="bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100">
                    <h3 class="text-3xl font-black text-gray-800 mb-6 flex items-center gap-3">
                        <span class="text-4xl">${playlist.icon}</span>
                        <span>${playlist.name}</span>
                        <span class="text-sm font-normal text-gray-500 ml-auto">${playlist.songs.length} músicas</span>
                    </h3>
                    
                    <div class="space-y-3">
                        ${playlist.songs.map((song, index) => `
                            <div onclick="MusicPlayer.playSong(${song.id}, '${this.currentPlaylist}')" 
                                 class="group flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all hover:bg-gradient-to-r ${playlist.gradient} hover:bg-opacity-10 border-2 ${this.currentSong?.id === song.id ? `bg-gradient-to-r ${playlist.gradient} bg-opacity-20 border-purple-300` : 'border-gray-200 hover:border-purple-300'}">
                                
                                <div class="w-12 h-12 bg-gradient-to-br ${playlist.gradient} rounded-xl shadow-lg flex items-center justify-center text-2xl font-bold text-white transform group-hover:scale-110 transition-all">
                                    ${index + 1}
                                </div>
                                
                                <div class="w-16 h-16 bg-gradient-to-br ${playlist.gradient} rounded-xl shadow-lg flex items-center justify-center text-3xl transform group-hover:scale-110 transition-all">
                                    ${song.cover}
                                </div>
                                
                                <div class="flex-1">
                                    <h4 class="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition-colors">${song.title}</h4>
                                    <p class="text-sm text-gray-600">${song.artist} • ${song.duration}</p>
                                </div>
                                
                                <div class="flex items-center gap-4">
                                    ${this.currentSong?.id === song.id && this.isPlaying ? 
                                        '<div class="flex gap-1"><div class="w-1 h-4 bg-purple-600 rounded-full animate-pulse"></div><div class="w-1 h-4 bg-pink-600 rounded-full animate-pulse" style="animation-delay: 0.2s"></div><div class="w-1 h-4 bg-red-600 rounded-full animate-pulse" style="animation-delay: 0.4s"></div></div>' :
                                        '<svg class="w-8 h-8 text-gray-400 group-hover:text-purple-600 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>'
                                    }
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Info -->
                <div class="mt-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-2xl">
                    <div class="flex items-start gap-4">
                        <div class="text-5xl">☁️</div>
                        <div>
                            <h3 class="text-2xl font-black mb-3">Streaming Online</h3>
                            <div class="space-y-2 text-blue-50">
                                <p>✅ Músicas hospedadas no Cloudinary CDN</p>
                                <p>⚡ Carregamento rápido e estável</p>
                                <p>🌍 Disponível globalmente</p>
                                <p>📦 Sem ocupar espaço no seu PC!</p>
                                <p>🎵 <strong>Toca em segundo plano!</strong> Mude de aba sem parar a música</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // ✨ MODIFICADO: Init agora cria áudio GLOBAL
    init() {
        console.log('🎵 Init chamado');
        
        // ⚠️ IMPORTANTE: Criar áudio apenas se não existir
        if (!this.audio) {
            this.audio = new Audio();
            this.audio.volume = this.volume / 100;
            
            // Event listeners GLOBAIS
            this.audio.addEventListener('timeupdate', () => {
                this.updateProgress();
                this.updateMiniPlayer();
            });
            this.audio.addEventListener('ended', () => this.next());
            this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
            this.audio.addEventListener('error', (e) => {
                console.error('❌ Erro ao carregar:', this.audio.error);
                Utils.showNotification('❌ Erro ao carregar música', 'error');
            });
            
            console.log('✅ Áudio GLOBAL criado');
        }
        
        if (!this.currentSong) {
            this.currentSong = this.playlists[this.currentPlaylist].songs[0];
        }
        
        // Atualizar src se necessário
        if (this.audio.src !== this.currentSong.file) {
            this.audio.src = this.currentSong.file;
            console.log('🔄 Música carregada:', this.currentSong.title);
        }
    },
    
    togglePlay() {
        if (!this.audio) {
            Utils.showNotification('⚠️ Player não inicializado', 'warning');
            return;
        }
        
        if (this.isPlaying) {
            this.audio.pause();
            this.isPlaying = false;
            Utils.showNotification('⏸️ Pausado', 'info');
        } else {
            this.audio.play()
                .then(() => {
                    this.isPlaying = true;
                    Utils.showNotification(`▶️ ${this.currentSong.title}`, 'success');
                    // ✨ NOVO: Atualizar mini player em outras abas
                    this.refreshMiniPlayer();
                })
                .catch(err => {
                    console.error('❌ Erro:', err);
                    Utils.showNotification('❌ Erro: ' + err.message, 'error');
                });
        }
        
        // ✨ NOVO: Atualizar botão na página de música
        this.updatePlayButton();
    },
    
    // ✨ NOVO: Atualizar botão de play
    updatePlayButton() {
        const playButton = document.querySelector('button[onclick*="togglePlay"]');
        if (!playButton) return;
        
        const svgPause = '<svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>';
        const svgPlay = '<svg class="w-12 h-12 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
        
        playButton.innerHTML = this.isPlaying ? svgPause : svgPlay;
    },
    
    // ✨ NOVO: Refresh mini player
    refreshMiniPlayer() {
        // Remover mini player antigo
        const oldMini = document.getElementById('mini-player');
        if (oldMini) oldMini.remove();
        
        // Adicionar novo se estiver tocando
        if (this.isPlaying && Router.currentRoute !== 'music') {
            const container = document.getElementById('tool-container');
            if (container) {
                container.insertAdjacentHTML('beforeend', this.renderMiniPlayer());
            }
        }
    },
    
    playSong(id, playlistKey) {
        const playlist = this.playlists[playlistKey];
        const song = playlist.songs.find(s => s.id === id);
        
        if (!song) return;
        
        // ✨ MODIFICADO: Não pausar, apenas trocar música
        this.currentSong = song;
        this.currentPlaylist = playlistKey;
        
        if (this.audio) {
            this.audio.src = song.file;
            this.audio.load();
            
            // Se estava tocando, continuar tocando
            if (this.isPlaying) {
                this.audio.play().catch(err => {
                    console.error('❌ Erro ao tocar:', err);
                    this.isPlaying = false;
                });
            }
        }
        
        // Re-renderizar apenas se estiver na página de música
        if (Router.currentRoute === 'music') {
            Router.render();
        } else {
            this.refreshMiniPlayer();
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
        
        Utils.showNotification(`📂 ${playlist.name}`, 'info');
        
        if (Router.currentRoute === 'music') {
            Router.render();
        }
    },
    
    setVolume(value) {
        this.volume = parseInt(value);
        if (this.audio) {
            this.audio.volume = this.volume / 100;
        }
        const volumeDisplay = document.getElementById('volume-display');
        if (volumeDisplay) {
            volumeDisplay.textContent = this.volume + '%';
        }
    },
    
    seekTo(value) {
        if (this.audio && this.audio.duration) {
            const time = (value / 100) * this.audio.duration;
            this.audio.currentTime = time;
        }
    },
    
    updateProgress() {
        if (!this.audio) return;
        
        const currentTime = this.audio.currentTime;
        const duration = this.audio.duration;
        const progress = (currentTime / duration) * 100;
        
        const progressBar = document.getElementById('progress-bar');
        const currentTimeEl = document.getElementById('current-time');
        
        if (progressBar) progressBar.value = progress || 0;
        if (currentTimeEl) currentTimeEl.textContent = this.formatTime(currentTime);
    },
    
    updateDuration() {
        if (!this.audio) return;
        
        const durationEl = document.getElementById('duration-time');
        if (durationEl && this.audio.duration) {
            durationEl.textContent = this.formatTime(this.audio.duration);
        }
    },
    
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
};

window.MusicPlayer = MusicPlayer;