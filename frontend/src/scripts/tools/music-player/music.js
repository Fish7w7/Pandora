// Player de Música PREMIUM - Versão Repaginada
const MusicPlayer = {
    currentSong: null,
    isPlaying: false,
    volume: 70,
    currentTime: 0,
    duration: 180, // 3 minutos padrão
    
    playlist: [
        { id: 1, title: 'Lofi Chill Beats', artist: 'Chillhop Music', duration: '3:24', cover: '🎵' },
        { id: 2, title: 'Study Session', artist: 'Relaxing Beats', duration: '4:12', cover: '📚' },
        { id: 3, title: 'Midnight Drive', artist: 'Synthwave FM', duration: '3:45', cover: '🌃' },
        { id: 4, title: 'Coffee Shop Jazz', artist: 'Jazz Collective', duration: '5:20', cover: '☕' },
        { id: 5, title: 'Focus Flow', artist: 'Productivity Sounds', duration: '4:00', cover: '🎯' }
    ],
    
    render() {
        const currentSong = this.currentSong || this.playlist[0];
        const progress = this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0;
        
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
                    <p class="text-gray-600 text-lg font-semibold">Relaxe com suas músicas favoritas</p>
                </div>
                
                <!-- Main Player Card -->
                <div class="relative mb-8">
                    <div class="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-3xl blur-2xl opacity-20"></div>
                    <div class="relative bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100">
                        
                        <!-- Player Display -->
                        <div class="flex items-center gap-8 mb-8">
                            <!-- Album Art -->
                            <div class="relative flex-shrink-0">
                                <div class="w-48 h-48 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl shadow-2xl flex items-center justify-center text-8xl transform ${this.isPlaying ? 'animate-pulse' : ''}">
                                    ${currentSong.cover}
                                </div>
                                ${this.isPlaying ? '<div class="absolute -bottom-2 -right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">▶ AO VIVO</div>' : ''}
                            </div>
                            
                            <!-- Song Info -->
                            <div class="flex-1">
                                <div class="mb-6">
                                    <h2 class="text-4xl font-black text-gray-800 mb-2">${currentSong.title}</h2>
                                    <p class="text-xl text-gray-600 font-semibold">${currentSong.artist}</p>
                                </div>
                                
                                <!-- Progress Bar -->
                                <div class="mb-4">
                                    <div class="relative h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                                        <div class="absolute h-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-full transition-all duration-300" 
                                             style="width: ${progress}%"></div>
                                    </div>
                                    <div class="flex justify-between mt-2 text-sm text-gray-600 font-semibold">
                                        <span>${this.formatTime(this.currentTime)}</span>
                                        <span>${currentSong.duration}</span>
                                    </div>
                                </div>
                                
                                <!-- Controls -->
                                <div class="flex items-center justify-center gap-4">
                                    <button onclick="MusicPlayer.previous()" 
                                            class="w-14 h-14 bg-gradient-to-br from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 transition-all flex items-center justify-center text-gray-700">
                                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                                        </svg>
                                    </button>
                                    
                                    <button onclick="MusicPlayer.togglePlay()" 
                                            class="w-20 h-20 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 rounded-full shadow-2xl hover:shadow-pink-500/50 transform hover:scale-110 active:scale-95 transition-all flex items-center justify-center text-white">
                                        ${this.isPlaying ? 
                                            '<svg class="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>' :
                                            '<svg class="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>'
                                        }
                                    </button>
                                    
                                    <button onclick="MusicPlayer.next()" 
                                            class="w-14 h-14 bg-gradient-to-br from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 transition-all flex items-center justify-center text-gray-700">
                                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M16 18h2V6h-2zm-11-1l8.5-6L5 5z"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Volume Control -->
                        <div class="bg-gradient-to-r from-purple-50 via-pink-50 to-red-50 rounded-2xl p-6 border-2 border-purple-100">
                            <div class="flex items-center gap-4">
                                <div class="text-3xl">🔊</div>
                                <div class="flex-1">
                                    <div class="flex items-center justify-between mb-2">
                                        <span class="text-gray-700 font-bold">Volume</span>
                                        <span class="text-purple-600 font-black text-lg">${this.volume}%</span>
                                    </div>
                                    <input type="range" id="volume-slider" 
                                           min="0" max="100" value="${this.volume}" 
                                           class="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer slider-purple"
                                           onchange="MusicPlayer.setVolume(this.value)">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Playlist -->
                <div class="bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100">
                    <h3 class="text-3xl font-black text-gray-800 mb-6 flex items-center gap-3">
                        <span class="text-4xl">🎧</span>
                        <span>Playlist</span>
                    </h3>
                    
                    <div class="space-y-3">
                        ${this.playlist.map(song => `
                            <div onclick="MusicPlayer.playSong(${song.id})" 
                                 class="group flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 border-2 ${this.currentSong?.id === song.id ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300' : 'border-gray-200 hover:border-purple-300'}">
                                
                                <div class="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl shadow-lg flex items-center justify-center text-3xl transform group-hover:scale-110 transition-all">
                                    ${song.cover}
                                </div>
                                
                                <div class="flex-1">
                                    <h4 class="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition-colors">${song.title}</h4>
                                    <p class="text-sm text-gray-600">${song.artist}</p>
                                </div>
                                
                                <div class="flex items-center gap-4">
                                    <span class="text-sm font-semibold text-gray-500">${song.duration}</span>
                                    ${this.currentSong?.id === song.id && this.isPlaying ? 
                                        '<div class="flex gap-1"><div class="w-1 h-4 bg-purple-600 rounded-full animate-pulse"></div><div class="w-1 h-4 bg-pink-600 rounded-full animate-pulse" style="animation-delay: 0.2s"></div><div class="w-1 h-4 bg-red-600 rounded-full animate-pulse" style="animation-delay: 0.4s"></div></div>' :
                                        '<svg class="w-6 h-6 text-gray-400 group-hover:text-purple-600 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>'
                                    }
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Streaming Options -->
                <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all cursor-pointer"
                         onclick="MusicPlayer.connectSpotify()">
                        <div class="text-5xl mb-3">🟢</div>
                        <h4 class="text-2xl font-black mb-2">Spotify</h4>
                        <p class="text-green-100">Conectar sua conta</p>
                    </div>
                    
                    <div class="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all cursor-pointer"
                         onclick="MusicPlayer.connectYouTube()">
                        <div class="text-5xl mb-3">▶️</div>
                        <h4 class="text-2xl font-black mb-2">YouTube Music</h4>
                        <p class="text-red-100">Conectar API</p>
                    </div>
                    
                    <div class="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all cursor-pointer"
                         onclick="MusicPlayer.openRadio()">
                        <div class="text-5xl mb-3">📻</div>
                        <h4 class="text-2xl font-black mb-2">Rádios Web</h4>
                        <p class="text-purple-100">Ouvir ao vivo</p>
                    </div>
                </div>
            </div>
            
            <style>
                .slider-purple::-webkit-slider-thumb {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #9333ea, #ec4899);
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(147, 51, 234, 0.5);
                }
                
                .slider-purple::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #9333ea, #ec4899);
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 2px 8px rgba(147, 51, 234, 0.5);
                }
            </style>
        `;
    },
    
    init() {
        if (!this.currentSong) {
            this.currentSong = this.playlist[0];
        }
        this.startProgressSimulation();
    },
    
    togglePlay() {
        this.isPlaying = !this.isPlaying;
        Utils.showNotification(this.isPlaying ? '▶️ Reproduzindo' : '⏸️ Pausado', 'info');
        Router.render();
    },
    
    playSong(id) {
        this.currentSong = this.playlist.find(s => s.id === id);
        this.isPlaying = true;
        this.currentTime = 0;
        Utils.showNotification(`🎵 ${this.currentSong.title}`, 'success');
        Router.render();
    },
    
    next() {
        const currentIndex = this.playlist.findIndex(s => s.id === this.currentSong.id);
        const nextIndex = (currentIndex + 1) % this.playlist.length;
        this.playSong(this.playlist[nextIndex].id);
    },
    
    previous() {
        const currentIndex = this.playlist.findIndex(s => s.id === this.currentSong.id);
        const prevIndex = currentIndex === 0 ? this.playlist.length - 1 : currentIndex - 1;
        this.playSong(this.playlist[prevIndex].id);
    },
    
    setVolume(value) {
        this.volume = parseInt(value);
        Utils.showNotification(`🔊 Volume: ${this.volume}%`, 'info');
    },
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
    
    startProgressSimulation() {
        setInterval(() => {
            if (this.isPlaying && this.currentTime < this.duration) {
                this.currentTime++;
                const progressEl = document.querySelector('[style*="width"]');
                if (progressEl) {
                    const progress = (this.currentTime / this.duration) * 100;
                    progressEl.style.width = progress + '%';
                }
            } else if (this.currentTime >= this.duration) {
                this.next();
            }
        }, 1000);
    },
    
    connectSpotify() {
        Utils.showNotification('🟢 Configure o Spotify API nas configurações', 'warning');
    },
    
    connectYouTube() {
        Utils.showNotification('▶️ Configure o YouTube Music API nas configurações', 'warning');
    },
    
    openRadio() {
        Utils.showNotification('📻 Rádios web em breve!', 'info');
    }
};

window.MusicPlayer = MusicPlayer;