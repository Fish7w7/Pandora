// Sistema de Clima Otimizado - OpenWeatherMap にゃん~
const Weather = {
    apiKey: 'c8b0c386f6c2130d908776f271837805',
    currentWeather: null,
    forecast: null,
    
    // URLs da API
    urls: {
        current: 'https://api.openweathermap.org/data/2.5/weather',
        forecast: 'https://api.openweathermap.org/data/2.5/forecast',
        icon: 'https://openweathermap.org/img/wn'
    },
    
    render() {
        return `
            <div class="max-w-5xl mx-auto">
                ${this.renderHeader()}
                ${this.renderSearchCard()}
                ${this.renderLoading()}
                ${this.renderResult()}
            </div>
        `;
    },
    
    renderHeader() {
        return `
            <div class="text-center mb-3">
                <h1 class="text-3xl font-black text-gray-800 mb-1">🌤️ Clima</h1>
                <p class="text-gray-600 text-sm">Veja a temperatura e condições climáticas em tempo real</p>
            </div>
        `;
    },
    
    renderSearchCard() {
        return `
            <div class="bg-white rounded-2xl shadow-2xl p-4 mb-3">
                ${this.renderSearchBox()}
                ${this.renderQuickButtons()}
                ${this.renderLocationButton()}
            </div>
        `;
    },
    
    renderSearchBox() {
        return `
            <div class="mb-3">
                <label class="block text-gray-700 font-bold mb-2 text-sm flex items-center gap-2">
                    <span>🏙️</span>
                    <span>Buscar Cidade</span>
                </label>
                <div class="flex gap-2">
                    <input type="text" id="city-input" 
                        class="flex-1 px-3 py-2 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm font-semibold bg-gradient-to-br from-blue-50 to-cyan-50" 
                        placeholder="Ex: São Paulo, Rio de Janeiro, London..."
                        onkeypress="if(event.key === 'Enter') Weather.searchCity()">
                    <button onclick="Weather.searchCity()" 
                            class="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                        <span class="text-lg">🔍</span>
                        <span>Buscar</span>
                    </button>
                </div>
            </div>
        `;
    },
    
    renderQuickButtons() {
        const cities = [
            { name: 'São Paulo', flag: '🇧🇷', color: 'blue' },
            { name: 'Rio de Janeiro', flag: '🇧🇷', color: 'green' },
            { name: 'London', flag: '🇬🇧', color: 'purple' },
            { name: 'Tokyo', flag: '🇯🇵', color: 'red' }
        ];
        
        return `
            <div class="flex flex-wrap gap-2 mb-3">
                <span class="text-gray-600 font-semibold flex items-center">Exemplos:</span>
                ${cities.map(city => `
                    <button onclick="document.getElementById('city-input').value='${city.name}'; Weather.searchCity()" 
                            class="px-4 py-2 bg-${city.color}-100 hover:bg-${city.color}-200 text-${city.color}-800 rounded-lg font-semibold text-sm transition-all">
                        ${city.flag} ${city.name}
                    </button>
                `).join('')}
            </div>
        `;
    },
    
    renderLocationButton() {
        return `
            <div class="text-center">
                <button onclick="Weather.getLocationWeather()" 
                        class="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2">
                    <span class="text-lg">📍</span>
                    <span>Usar Minha Localização</span>
                </button>
            </div>
        `;
    },
    
    renderLoading() {
        return `
            <div id="weather-loading" class="hidden text-center py-6">
                <div class="inline-block">
                    <div class="loader"></div>
                    <p class="mt-2 text-gray-600 font-semibold text-sm">Carregando dados do clima...</p>
                </div>
            </div>
        `;
    },
    
    renderResult() {
        return `<div id="weather-result" class="hidden"></div>`;
    },
    
    init() {
        console.log('✅ API Key configurada');
    },
    
    async searchCity() {
        const cityInput = document.getElementById('city-input');
        const city = cityInput?.value.trim();
        
        if (!city) {
            Utils.showNotification('❌ Digite o nome de uma cidade', 'error');
            return;
        }
        
        if (!this.validateApiKey()) return;
        
        this.showLoading();
        
        try {
            await this.fetchWeatherData(city);
            this.displayWeather();
        } catch (error) {
            this.handleError(error);
        }
    },
    
    validateApiKey() {
        if (!this.apiKey || this.apiKey === 'SUA_CHAVE_OPENWEATHER_AQUI') {
            Utils.showNotification('⚠️ Configure sua API Key no código primeiro!', 'warning');
            return false;
        }
        return true;
    },
    
    async fetchWeatherData(city) {
        const currentUrl = `${this.urls.current}?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric&lang=pt_br`;
        
        const currentResponse = await fetch(currentUrl);
        
        if (!currentResponse.ok) {
            throw new Error(await this.parseApiError(currentResponse));
        }
        
        this.currentWeather = await currentResponse.json();
        
        // Buscar previsão
        const forecastUrl = `${this.urls.forecast}?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric&lang=pt_br`;
        const forecastResponse = await fetch(forecastUrl);
        
        if (forecastResponse.ok) {
            this.forecast = await forecastResponse.json();
        }
    },
    
    async parseApiError(response) {
        const errorData = await response.json().catch(() => ({}));
        
        const errors = {
            401: 'API Key inválida ou não ativada',
            404: 'Cidade não encontrada. Tente outro nome',
            429: 'Limite de requisições excedido. Aguarde alguns minutos'
        };
        
        return errors[response.status] || `Erro ${response.status}: ${errorData.message || 'Erro desconhecido'}`;
    },
    
    async getLocationWeather() {
        if (!this.validateApiKey()) return;
        
        if (!navigator.geolocation) {
            Utils.showNotification('❌ Geolocalização não suportada', 'error');
            return;
        }
        
        Utils.showNotification('📍 Obtendo sua localização...', 'info');
        this.showLoading();
        
        navigator.geolocation.getCurrentPosition(
            position => this.handleLocationSuccess(position),
            error => this.handleLocationError(error),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    },
    
    async handleLocationSuccess(position) {
        const { latitude, longitude } = position.coords;
        
        try {
            const currentUrl = `${this.urls.current}?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=metric&lang=pt_br`;
            const currentResponse = await fetch(currentUrl);
            
            if (!currentResponse.ok) {
                throw new Error(await this.parseApiError(currentResponse));
            }
            
            this.currentWeather = await currentResponse.json();
            
            const forecastUrl = `${this.urls.forecast}?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=metric&lang=pt_br`;
            const forecastResponse = await fetch(forecastUrl);
            
            if (forecastResponse.ok) {
                this.forecast = await forecastResponse.json();
            }
            
            this.displayWeather();
        } catch (error) {
            this.handleError(error);
        }
    },
    
    handleLocationError(error) {
        this.hideLoading();
        
        const errors = {
            1: 'Permissão negada. Ative nas configurações',
            2: 'Localização indisponível. Tente buscar por nome',
            3: 'Tempo esgotado ao obter localização'
        };
        
        Utils.showNotification('❌ ' + (errors[error.code] || 'Erro ao obter localização'), 'error');
    },
    
    handleError(error) {
        this.hideLoading();
        console.error('❌ Erro:', error);
        Utils.showNotification('❌ ' + error.message, 'error');
    },
    
    displayWeather() {
        this.hideLoading();
        
        const resultDiv = document.getElementById('weather-result');
        resultDiv.classList.remove('hidden');
        resultDiv.innerHTML = `
            <div class="animate-fadeIn">
                ${this.renderWeatherCard()}
                ${this.renderForecast()}
                ${this.renderSuccessMessage()}
            </div>
        `;
        
        setTimeout(() => resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
        Utils.showNotification('✅ Clima atualizado!', 'success');
    },
    
    renderWeatherCard() {
        const data = this.currentWeather;
        const gradient = this.getGradientByTemp(Math.round(data.main.temp));
        
        return `
            <div class="bg-gradient-to-br ${gradient} rounded-3xl shadow-2xl overflow-hidden">
                ${this.renderMainInfo(data)}
                ${this.renderDetailsGrid(data)}
                ${this.renderSunTimes(data)}
            </div>
        `;
    },
    
    renderMainInfo(data) {
        const iconUrl = `${this.urls.icon}/${data.weather[0].icon}@4x.png`;
        const temp = Math.round(data.main.temp);
        const feelsLike = Math.round(data.main.feels_like);
        const tempMin = Math.round(data.main.temp_min);
        const tempMax = Math.round(data.main.temp_max);
        
        return `
            <div class="p-4 text-white text-center">
                <h2 class="text-2xl font-black mb-2 flex items-center justify-center gap-2">
                    <span>📍</span>
                    <span>${data.name}, ${data.sys.country}</span>
                </h2>
                <div class="flex items-center justify-center gap-3 mb-3">
                    <img src="${iconUrl}" alt="${data.weather[0].description}" class="w-20 h-20 drop-shadow-2xl">
                    <div class="text-left">
                        <div class="text-5xl font-black">${temp}°C</div>
                        <div class="text-lg font-semibold capitalize">${data.weather[0].description}</div>
                        <div class="text-sm opacity-90">Sensação: ${feelsLike}°C</div>
                    </div>
                </div>
                <div class="flex items-center justify-center gap-3 text-sm">
                    <span>🔽 Min: ${tempMin}°C</span>
                    <span>•</span>
                    <span>🔼 Máx: ${tempMax}°C</span>
                </div>
            </div>
        `;
    },
    
    renderDetailsGrid(data) {
        const details = [
            { icon: '💧', label: 'Umidade', value: `${data.main.humidity}%` },
            { icon: '💨', label: 'Vento', value: Math.round(data.wind.speed * 3.6), unit: 'km/h' },
            { icon: '👁️', label: 'Visibilidade', value: (data.visibility / 1000).toFixed(1), unit: 'km' },
            { icon: '🌡️', label: 'Pressão', value: data.main.pressure, unit: 'hPa' }
        ];
        
        return `
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2 p-4 bg-white/10 backdrop-blur-sm">
                ${details.map(detail => `
                    <div class="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center text-white transform hover:scale-105 transition-all">
                        <div class="text-2xl mb-1">${detail.icon}</div>
                        <div class="text-xs font-semibold opacity-90">${detail.label}</div>
                        <div class="text-xl font-black">${detail.value}</div>
                        ${detail.unit ? `<div class="text-xs opacity-80">${detail.unit}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    renderSunTimes(data) {
        const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        return `
            <div class="grid grid-cols-2 gap-2 p-4 bg-white/5">
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center text-white">
                    <div class="text-2xl mb-1">🌅</div>
                    <div class="text-xs font-semibold opacity-90">Nascer do Sol</div>
                    <div class="text-lg font-black">${sunrise}</div>
                </div>
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center text-white">
                    <div class="text-2xl mb-1">🌇</div>
                    <div class="text-xs font-semibold opacity-90">Pôr do Sol</div>
                    <div class="text-lg font-black">${sunset}</div>
                </div>
            </div>
        `;
    },
    
    renderForecast() {
        if (!this.forecast?.list) return '';
        
        const dailyForecast = this.forecast.list
            .filter(item => item.dt_txt.includes('12:00:00'))
            .slice(0, 5);
        
        return `
            <div class="bg-white rounded-2xl shadow-2xl p-4 mt-3">
                <h3 class="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
                    <span>📅</span>
                    <span>Previsão para os Próximos Dias</span>
                </h3>
                <div class="grid grid-cols-2 md:grid-cols-5 gap-2">
                    ${dailyForecast.map(day => this.renderForecastDay(day)).join('')}
                </div>
            </div>
        `;
    },
    
    renderForecastDay(day) {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });
        const temp = Math.round(day.main.temp);
        const icon = day.weather[0].icon;
        const desc = day.weather[0].description;
        
        return `
            <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-2 text-center hover:shadow-lg transition-all transform hover:scale-105">
                <div class="text-xs font-bold text-gray-700 mb-1 capitalize">${dayName}</div>
                <img src="${this.urls.icon}/${icon}@2x.png" alt="${desc}" class="w-10 h-10 mx-auto">
                <div class="text-lg font-black text-gray-800">${temp}°C</div>
                <div class="text-xs text-gray-600 capitalize">${desc}</div>
            </div>
        `;
    },
    
    renderSuccessMessage() {
        return `
            <div class="mt-3 bg-green-50 border-2 border-green-300 rounded-xl p-3">
                <div class="flex items-center gap-2 text-green-800">
                    <span class="text-xl">✅</span>
                    <div>
                        <div class="font-bold text-sm">Dados carregados com sucesso!</div>
                        <div class="text-xs">API Key funcionando perfeitamente</div>
                    </div>
                </div>
            </div>
        `;
    },
    
    getGradientByTemp(temp) {
        if (temp >= 30) return 'from-red-500 via-orange-500 to-yellow-500';
        if (temp >= 20) return 'from-yellow-400 via-orange-400 to-red-400';
        if (temp >= 15) return 'from-green-400 via-teal-400 to-cyan-400';
        return 'from-blue-500 via-cyan-500 to-blue-600';
    },
    
    showLoading() {
        document.getElementById('weather-loading')?.classList.remove('hidden');
        document.getElementById('weather-result')?.classList.add('hidden');
    },
    
    hideLoading() {
        document.getElementById('weather-loading')?.classList.add('hidden');
    }
};

window.Weather = Weather;