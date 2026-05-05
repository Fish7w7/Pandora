const FinalSeasonMusic = {
    ENABLED_KEY: 'final_season_music_enabled',
    VOLUME_KEY: 'final_season_music_volume',
    URL_KEY: 'final_season_music_url',
    VOLUME_MIGRATION_KEY: 'final_season_music_volume_v2',

    AUDIO_URL: 'https://res.cloudinary.com/dw4ergbna/video/upload/v1777850777/harry_james_-_it_s_been_a_long_long_time_1_hour_-_sleeping_hours_youtube_mc3tgg.mp4',
    TITLE: "It's Been a Long, Long Time",
    ARTIST: 'Harry James',
    VERSION_LABEL: 'Last Meow',
    DEFAULT_VOLUME: 1,

    _initialized: false,
    _audio: null,
    _ticker: null,
    _manualPaused: false,
    _lastPlayError: '',
    _gestureBound: false,
    _expanded: false,
    _collapseTimer: null,
    _outsideBound: false,

    init() {
        if (this._initialized) return;
        this._initialized = true;
        this._registerStorage();
        this._ensureDefaultVolume();
        this._injectStyles();
        this._bindRuntimeEvents();
        this.refresh();
        setTimeout(() => this.refresh(), 1200);
        this._ticker = setInterval(() => this.refresh(), 60000);
    },

    _registerStorage() {
        window.NyanStorage?.register?.(this.ENABLED_KEY, { owner: 'FinalSeasonMusic', source: 'System' });
        window.NyanStorage?.register?.(this.VOLUME_KEY, { owner: 'FinalSeasonMusic', source: 'System' });
        window.NyanStorage?.register?.(this.URL_KEY, { owner: 'FinalSeasonMusic', source: 'System' });
        window.NyanStorage?.register?.(this.VOLUME_MIGRATION_KEY, { owner: 'FinalSeasonMusic', source: 'System' });
    },

    _bindRuntimeEvents() {
        window.addEventListener('nyan:storage-changed', (event) => {
            const key = event?.detail?.key;
            if ([this.ENABLED_KEY, this.VOLUME_KEY, this.URL_KEY, 'silent_mode_enabled'].includes(key)) {
                this.refresh();
            }
        });
        window.addEventListener('nyan:storage-removed', (event) => {
            const key = event?.detail?.key;
            if ([this.ENABLED_KEY, this.VOLUME_KEY, this.URL_KEY, 'silent_mode_enabled'].includes(key)) {
                this.refresh();
            }
        });
        window.addEventListener('beforeunload', () => this.pause({ manual: false }));
    },

    _ensureDefaultVolume() {
        const migrated = Utils.loadData(this.VOLUME_MIGRATION_KEY) === true;
        const savedRaw = Utils.loadData(this.VOLUME_KEY);
        const saved = Number(savedRaw);
        if (!migrated && (!Number.isFinite(saved) || saved === 12)) {
            Utils.saveData(this.VOLUME_KEY, this.DEFAULT_VOLUME);
        }
        Utils.saveData(this.VOLUME_MIGRATION_KEY, true);
    },

    getAudioUrl() {
        return String(
            window.FINAL_SEASON_MUSIC_URL
            || Utils.loadData(this.URL_KEY)
            || this.AUDIO_URL
            || ''
        ).trim();
    },

    setAudioUrl(url = '') {
        const safeUrl = String(url || '').trim();
        Utils.saveData(this.URL_KEY, safeUrl);
        if (this._audio && this._audio.src !== safeUrl) {
            this._audio.pause();
            this._audio = null;
        }
        this.refresh({ userGesture: true });
        Router?.render?.();
        return safeUrl;
    },

    hasAudioUrl() {
        return this.getAudioUrl().length > 0;
    },

    isAvailable() {
        if (window.FinalSeason?.isFinalSeasonActive?.() === true) return true;
        const season = window.Seasons?.getCurrentSeason?.();
        return !!(
            season
            && (season.id === 'season_2' || season.isFinal === true)
            && window.Seasons?.isActive?.(season)
        );
    },

    isEnabled() {
        return Utils.loadData(this.ENABLED_KEY) !== false;
    },

    setEnabled(enabled) {
        const active = enabled === true;
        Utils.saveData(this.ENABLED_KEY, active);
        this._manualPaused = !active;
        if (active) {
            this.refresh({ userGesture: true });
        } else {
            this.pause({ manual: true });
            this._removeWidget();
        }
        Router?.render?.();
        Utils.showNotification?.(active ? 'Trilha Last Meow ativada.' : 'Trilha Last Meow desligada.', active ? 'success' : 'info');
    },

    getVolume() {
        const saved = Number(Utils.loadData(this.VOLUME_KEY));
        if (Number.isFinite(saved)) return Math.max(0, Math.min(100, Math.round(saved)));
        return this.DEFAULT_VOLUME;
    },

    setVolume(value) {
        const volume = Math.max(1, Math.min(100, Math.round(Number(value || this.DEFAULT_VOLUME))));
        Utils.saveData(this.VOLUME_KEY, volume);
        if (this._audio) this._audio.volume = volume / 100;
        this._renderWidget();
        return volume;
    },

    getStatus() {
        if (!this.isAvailable()) return 'Encerrada';
        if (Utils.loadData('silent_mode_enabled') === true) return 'Modo Silencioso';
        if (!this.hasAudioUrl()) return 'Aguardando link';
        if (!this.isEnabled()) return 'Desligada';
        if (this.isPlaying()) return 'Tocando';
        if (this._lastPlayError) return 'Pausada pelo app';
        return 'Pausada';
    },

    getSettingsMeta() {
        return {
            title: this.TITLE,
            artist: this.ARTIST,
            enabled: this.isEnabled(),
            available: this.isAvailable(),
            hasUrl: this.hasAudioUrl(),
            volume: this.getVolume(),
            status: this.getStatus(),
        };
    },

    refresh(options = {}) {
        if (!this.isAvailable()) {
            this.stop({ finished: true });
            return false;
        }

        if (Utils.loadData('silent_mode_enabled') === true) {
            this.pause({ manual: false });
            this._removeWidget();
            return false;
        }

        if (!this.isEnabled()) {
            this.pause({ manual: true });
            this._removeWidget();
            return false;
        }

        if (!this.hasAudioUrl()) {
            this.pause({ manual: false });
            this._removeWidget();
            return false;
        }

        this._renderWidget();

        if (window.MusicPlayer?.isPlaying) {
            this.pause({ manual: false });
            return false;
        }

        if (!this._manualPaused || options.userGesture === true) {
            return this.play(options);
        }
        return false;
    },

    _ensureAudio() {
        const url = this.getAudioUrl();
        if (!url) return null;

        if (!this._audio) {
            this._audio = new Audio();
            this._audio.loop = true;
            this._audio.preload = 'auto';
            this._audio.addEventListener('play', () => {
                this._lastPlayError = '';
                this._renderWidget();
            });
            this._audio.addEventListener('pause', () => this._renderWidget());
            this._audio.addEventListener('error', () => {
                this._lastPlayError = 'Erro ao carregar a trilha.';
                this._renderWidget();
            });
        }

        if (this._audio.src !== url) {
            this._audio.src = url;
            this._audio.load();
        }
        this._audio.volume = this.getVolume() / 100;
        return this._audio;
    },

    play(options = {}) {
        if (!this.isAvailable() || !this.isEnabled() || !this.hasAudioUrl()) return false;
        if (options.userGesture === true) this._pauseMusicPlayer();

        const audio = this._ensureAudio();
        if (!audio) return false;
        this._manualPaused = false;

        audio.play()
            .then(() => {
                this._lastPlayError = '';
                this._renderWidget();
            })
            .catch((err) => {
                this._lastPlayError = err?.message || 'Reproducao bloqueada.';
                this._bindGestureRetry();
                this._renderWidget();
            });
        return true;
    },

    pause(options = {}) {
        if (options.manual === true) this._manualPaused = true;
        if (this._audio) this._audio.pause();
        this._renderWidget();
    },

    stop() {
        if (this._audio) {
            this._audio.pause();
            try { this._audio.currentTime = 0; } catch (_) {}
        }
        this._manualPaused = true;
        this._removeWidget();
    },

    togglePlay() {
        if (this.isPlaying()) {
            this.pause({ manual: true });
            this.expandWidget();
            return;
        }
        if (!this.isEnabled()) Utils.saveData(this.ENABLED_KEY, true);
        this.play({ userGesture: true });
        this.expandWidget();
    },

    toggleWidget() {
        if (this._expanded) {
            this.collapseWidget();
        } else {
            this.expandWidget();
        }
    },

    expandWidget() {
        this._expanded = true;
        this._renderWidget();
        this._bindOutsideCollapse();
        this._scheduleCollapse();
    },

    collapseWidget() {
        this._expanded = false;
        if (this._collapseTimer) {
            clearTimeout(this._collapseTimer);
            this._collapseTimer = null;
        }
        this._renderWidget();
    },

    _scheduleCollapse() {
        if (this._collapseTimer) clearTimeout(this._collapseTimer);
        this._collapseTimer = setTimeout(() => {
            this._collapseTimer = null;
            this.collapseWidget();
        }, 8000);
    },

    _bindOutsideCollapse() {
        if (this._outsideBound) return;
        this._outsideBound = true;
        document.addEventListener('pointerdown', (event) => {
            const widget = document.getElementById('final-season-music-widget');
            if (!widget || widget.contains(event.target)) return;
            if (this._expanded) this.collapseWidget();
        });
    },

    isPlaying() {
        return !!(this._audio && !this._audio.paused && !this._audio.ended);
    },

    _pauseMusicPlayer() {
        try {
            if (!window.MusicPlayer?.isPlaying || !window.MusicPlayer?.audio) return;
            window.MusicPlayer.audio.pause();
            window.MusicPlayer.isPlaying = false;
            window.MusicPlayer.updatePlayButtons?.();
            window.MusicPlayer.updateMiniPlayer?.();
        } catch (_) {}
    },

    _bindGestureRetry() {
        if (this._gestureBound) return;
        this._gestureBound = true;
        const retry = () => {
            this._gestureBound = false;
            document.removeEventListener('click', retry);
            document.removeEventListener('keydown', retry);
            if (this.isEnabled() && !this._manualPaused) this.play({ userGesture: true });
        };
        document.addEventListener('click', retry, { once: true });
        document.addEventListener('keydown', retry, { once: true });
    },

    _injectStyles() {
        if (document.getElementById('final-season-music-style')) return;
        const style = document.createElement('style');
        style.id = 'final-season-music-style';
        style.textContent = `
            #final-season-music-widget {
                position:fixed;
                right:14px;
                bottom:14px;
                z-index:70;
                width:44px;
                min-height:44px;
                border-radius:999px;
                border:1px solid rgba(245,158,11,0.28);
                background:linear-gradient(135deg, rgba(16,9,31,0.94), rgba(63,26,103,0.9) 58%, rgba(146,64,14,0.92));
                color:#fff;
                box-shadow:0 10px 28px rgba(0,0,0,0.28), 0 0 16px rgba(245,158,11,0.1);
                overflow:hidden;
                backdrop-filter:blur(14px);
                font-family:'DM Sans', sans-serif;
                transition:width 0.18s ease, border-radius 0.18s ease, box-shadow 0.18s ease;
            }
            #final-season-music-widget.fsm-expanded {
                width:min(250px, calc(100vw - 28px));
                border-radius:14px;
                box-shadow:0 18px 46px rgba(0,0,0,0.34), 0 0 22px rgba(245,158,11,0.12);
            }
            #final-season-music-widget .fsm-compact {
                width:44px;
                height:44px;
                border:0;
                background:transparent;
                color:#fcd34d;
                display:flex;
                align-items:center;
                justify-content:center;
                cursor:pointer;
                font-size:1.05rem;
                padding:0;
                position:relative;
            }
            #final-season-music-widget.fsm-expanded .fsm-compact { display:none; }
            #final-season-music-widget .fsm-dot {
                position:absolute;
                right:8px;
                top:8px;
                width:7px;
                height:7px;
                border-radius:999px;
                background:#34d399;
                box-shadow:0 0 8px rgba(52,211,153,0.7);
            }
            #final-season-music-widget:not(.fsm-playing) .fsm-dot {
                background:#f59e0b;
                box-shadow:0 0 8px rgba(245,158,11,0.55);
            }
            #final-season-music-widget .fsm-panel { display:none; }
            #final-season-music-widget.fsm-expanded .fsm-panel { display:block; }
            #final-season-music-widget .fsm-inner {
                padding:0.56rem 0.62rem;
                display:flex;
                align-items:center;
                gap:0.52rem;
            }
            #final-season-music-widget .fsm-cover {
                width:32px; height:32px; border-radius:9px; display:flex; align-items:center; justify-content:center;
                background:rgba(245,158,11,0.16); border:1px solid rgba(245,158,11,0.28); color:#fcd34d; font-size:1rem;
            }
            #final-season-music-widget .fsm-main { flex:1; min-width:0; }
            #final-season-music-widget .fsm-kicker { font-size:0.56rem; font-weight:900; letter-spacing:0.12em; text-transform:uppercase; color:#fcd34d; opacity:0.86; }
            #final-season-music-widget .fsm-title { font-size:0.72rem; font-weight:900; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:0.06rem; }
            #final-season-music-widget .fsm-status { font-size:0.62rem; color:rgba(255,255,255,0.6); margin-top:0.05rem; }
            #final-season-music-widget .fsm-actions { display:flex; align-items:center; gap:0.35rem; flex-shrink:0; }
            #final-season-music-widget button {
                border:1px solid rgba(255,255,255,0.14); background:rgba(255,255,255,0.08); color:#fff;
                border-radius:9px; height:30px; min-width:30px; padding:0 0.48rem; cursor:pointer; font-weight:900; font-size:0.72rem;
            }
            #final-season-music-widget button:hover { background:rgba(255,255,255,0.14); }
            #final-season-music-widget .fsm-volume { padding:0 0.62rem 0.56rem; display:flex; align-items:center; gap:0.5rem; }
            #final-season-music-widget input[type="range"] { flex:1; height:4px; accent-color:#f59e0b; }
            @media (max-width:720px) {
                #final-season-music-widget { right:10px; bottom:10px; }
                #final-season-music-widget.fsm-expanded { width:min(230px, calc(100vw - 20px)); }
            }
            body.nyan-silent-mode #final-season-music-widget { display:none !important; }
        `;
        document.head.appendChild(style);
    },

    _renderWidget() {
        if (!this._initialized || !this.isAvailable() || !this.hasAudioUrl() || !this.isEnabled()) {
            this._removeWidget();
            return;
        }
        if (Utils.loadData('silent_mode_enabled') === true) {
            this._removeWidget();
            return;
        }

        let widget = document.getElementById('final-season-music-widget');
        if (!widget) {
            widget = document.createElement('div');
            widget.id = 'final-season-music-widget';
            document.body.appendChild(widget);
        }

        const playing = this.isPlaying();
        widget.className = `${this._expanded ? 'fsm-expanded' : 'fsm-collapsed'} ${playing ? 'fsm-playing' : 'fsm-paused'}`;
        widget.innerHTML = `
            <button class="fsm-compact" onclick="FinalSeasonMusic.toggleWidget()" title="Musica Final - ${this.getStatus()}">
                ${playing ? '&#9835;' : '&#9834;'}
                <span class="fsm-dot"></span>
            </button>
            <div class="fsm-panel">
                <div class="fsm-inner">
                    <div class="fsm-cover">${playing ? '&#9835;' : '&#9834;'}</div>
                    <div class="fsm-main">
                        <div class="fsm-kicker">Final Season</div>
                        <div class="fsm-title">${this.TITLE}</div>
                        <div class="fsm-status">${this.getStatus()}</div>
                    </div>
                    <div class="fsm-actions">
                        <button onclick="FinalSeasonMusic.togglePlay()" title="${playing ? 'Pausar' : 'Tocar'}">${playing ? '&#10073;&#10073;' : '&#9654;'}</button>
                        <button onclick="FinalSeasonMusic.setEnabled(false)" title="Desligar">off</button>
                    </div>
                </div>
                <div class="fsm-volume">
                    <span style="font-size:0.7rem;color:rgba(255,255,255,0.62);">vol</span>
                    <input type="range" min="1" max="100" value="${this.getVolume()}" oninput="FinalSeasonMusic.setVolume(this.value)">
                </div>
            </div>
        `;
    },

    _removeWidget() {
        document.getElementById('final-season-music-widget')?.remove();
    },
};

window.FinalSeasonMusic = FinalSeasonMusic;
