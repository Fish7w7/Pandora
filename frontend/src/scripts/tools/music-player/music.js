// Player de Música com YouTube Embeds - 100% Funcional
const MusicPlayer = {
    currentSong: null,
    currentPlaylist: 'lofi',
    isPlaying: false,
    volume: 70,
    
    // Playlists com vídeos do YouTube
    // INSTRUÇÕES: Cole o ID do vídeo do YouTube (parte depois de v= na URL)
    // Exemplo: https://www.youtube.com/watch?v=jfKfPfyJRdk → ID = jfKfPfyJRdk
    playlists: {
        lofi: {
            name: 'Lofi Chill Beats',
            icon: '🎵',
            gradient: 'from-purple-400 to-pink-500',
            songs: [
                {
                    id: 1,
                    title: 'Lofi Hip Hop Radio 24/7',
                    artist: 'Lofi Girl',
                    youtubeId: 'rPjez8z61rI', // Cole o ID do YouTube aqui
                    cover: '🎵',
                    duration: '∞'
                },
                {
                    id: 2,
                    title: 'Chill Lofi Study Beats',
                    artist: 'ChillHop Music',
                    youtubeId: '5qap5aO4i9A',
                    cover: '🎹',
                    duration: '3:45'
                },
                {
                    id: 3,
                    title: 'Jazz Lofi Hip Hop',
                    artist: 'Lofi Fruits',
                    youtubeId: 'rUxyKA_-grg',
                    cover: '☕',
                    duration: '4:12'
                }
            ]
        },
        study: {
            name: 'Study Session',
            icon: '📚',
            gradient: 'from-blue-400 to-cyan-500',
            songs: [
                {
                    id: 4,
                    title: 'Deep Focus Music',
                    artist: 'Greenred Productions',
                    youtubeId: 'oPVte6aMprI',
                    cover: '📚',
                    duration: '3:52:17'
                },
                {
                    id: 5,
                    title: 'Study Music',
                    artist: 'Study Music Project',
                    youtubeId: 'LGJjKpTHWwU',
                    cover: '💡',
                    duration: '3:30'
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
                    title: 'Synthwave Radio',
                    artist: 'The 80s Guy',
                    youtubeId: '4xDzrJKXOOY',
                    cover: '🌃',
                    duration: '∞'
                },
                {
                    id: 7,
                    title: 'MIX ELECTRO POP',
                    artist: 'Jay Clap dj',
                    youtubeId: 'xwtdhWltSIg',
                    cover: '⚡',
                    duration: '47:26'
                }
            ]
        },
        relaxing: {
            name: 'Relaxing Ambient',
            icon: '🌊',
            gradient: 'from-green-400 to-teal-500',
            songs: [
                {
                    id: 8,
                    title: 'Peaceful Piano',
                    artist: 'Yellow Brick Cinema',
                    youtubeId: 'lTRiuFIWV54',
                    cover: '🌊',
                    duration: '1:01:14'
                },
                {
                    id: 9,
                    title: 'Meditation Music',
                    artist: 'Meditation Relax Music',
                    youtubeId: '1ZYbU82GVz4',
                    cover: '🧘',
                    duration: '8:00'
                }
            ]
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
                    <p class="text-gray-600 text-lg font-semibold">Músicas reais do YouTube • 100% Funcional</p>
                </div>
                
                <!-- Main Player Card -->
                <div class="relative mb-8">
                    <div class="absolute inset-0 bg-gradient-to-br ${playlist.gradient} rounded-3xl blur-2xl opacity-20"></div>
                    <div class="relative bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100">
                        
                        <!-- YouTube Player -->
                        <div class="mb-8">
                            <div class="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
                                <iframe 
                                    id="youtube-player"
                                    width="100%" 
                                    height="100%" 
                                    src="https://www.youtube.com/embed/${currentSong.youtubeId}?autoplay=${this.isPlaying ? 1 : 0}&controls=1&modestbranding=1&rel=0"
                                    frameborder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowfullscreen>
                                </iframe>
                            </div>
                        </div>
                        
                        <!-- Song Info -->
                        <div class="text-center mb-6">
                            <div class="inline-flex items-center gap-4 bg-gradient-to-r ${playlist.gradient} bg-opacity-10 px-8 py-4 rounded-2xl">
                                <div class="text-5xl">${currentSong.cover}</div>
                                <div class="text-left">
                                    <h2 class="text-3xl font-black text-gray-800">${currentSong.title}</h2>
                                    <p class="text-lg text-gray-600 font-semibold">${currentSong.artist}</p>
                                </div>
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
                        
                        <!-- Info Box -->
                        <div class="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
                            <p class="text-blue-800 font-semibold">
                                ▶️ Use os controles do YouTube ou os botões acima • Volume controlado pelo player do YouTube
                            </p>
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
                
                <!-- Tutorial Box -->
                <div class="mt-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-2xl">
                    <div class="flex items-start gap-4">
                        <div class="text-5xl">🎓</div>
                        <div>
                            <h3 class="text-2xl font-black mb-3">Como Adicionar Suas Músicas</h3>
                            <div class="space-y-2 text-green-50">
                                <p><strong>1.</strong> Vá no YouTube e encontre a música/vídeo que deseja</p>
                                <p><strong>2.</strong> Copie o ID do vídeo (parte depois de <code class="bg-white/20 px-2 py-1 rounded">v=</code> na URL)</p>
                                <p><strong>3.</strong> Abra o arquivo <code class="bg-white/20 px-2 py-1 rounded">music.js</code> e cole o ID no campo <code class="bg-white/20 px-2 py-1 rounded">youtubeId</code></p>
                                <p class="italic">🎵 Em breve você poderá adicionar ainda mais músicas ou ter mais liberdade para organizar suas playlists!</p>
                            </div>
                            <div class="mt-4 bg-white/20 rounded-xl p-4">
                                <p class="text-sm font-bold mb-2">📝 Exemplo:</p>
                                <code class="text-xs">
                                    URL: https://www.youtube.com/watch?v=<span class="bg-yellow-400 text-gray-900 px-1">jfKfPfyJRdk</span><br>
                                    ID: <span class="bg-yellow-400 text-gray-900 px-1">jfKfPfyJRdk</span>
                                </code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    init() {
        if (!this.currentSong) {
            this.currentSong = this.playlists[this.currentPlaylist].songs[0];
        }
    },
    
    togglePlay() {
        this.isPlaying = !this.isPlaying;
        
        if (this.isPlaying) {
            Utils.showNotification(`▶️ ${this.currentSong.title}`, 'success');
        } else {
            Utils.showNotification('⏸️ Pausado (use o player do YouTube)', 'info');
        }
        
        Router.render();
    },
    
    playSong(id, playlistKey) {
        const playlist = this.playlists[playlistKey];
        const song = playlist.songs.find(s => s.id === id);
        
        if (!song) return;
        
        this.currentSong = song;
        this.currentPlaylist = playlistKey;
        this.isPlaying = true;
        
        Utils.showNotification(`🎵 ${song.title}`, 'success');
        Router.render();
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
        
        this.isPlaying = false;
        this.currentSong = playlist.songs[0];
        
        Utils.showNotification(`📂 ${playlist.name}`, 'info');
        Router.render();
    }
};

window.MusicPlayer = MusicPlayer;