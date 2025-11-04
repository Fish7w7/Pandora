// Sistema de Clima Completo - OpenWeatherMap API (API KEY FIXA)
const Weather = {
    apiKey: 'c8b0c386f6c2130d908776f271837805', // Cole sua chave do OpenWeatherMap aqui
    currentWeather: null,
    forecast: null,
    
    render() {
        return `
            <div class="max-w-5xl mx-auto">
                <div class="text-center mb-3">
                    <h1 class="text-3xl font-black text-gray-800 mb-1">🌤️ Clima</h1>
                    <p class="text-gray-600 text-sm">Veja a temperatura e condições climáticas em tempo real</p>
                </div>
                
                <div class="bg-white rounded-2xl shadow-2xl p-4 mb-3">
                    <!-- Search Box -->
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
                    
                    <!-- Quick Search Buttons -->
                    <div class="flex flex-wrap gap-2 mb-3">
                        <span class="text-gray-600 font-semibold flex items-center">Exemplos:</span>
                        <button onclick="document.getElementById('city-input').value='São Paulo'; Weather.searchCity()" 
                                class="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg font-semibold text-sm transition-all">
                            🇧🇷 São Paulo
                        </button>
                        <button onclick="document.getElementById('city-input').value='Rio de Janeiro'; Weather.searchCity()" 
                                class="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg font-semibold text-sm transition-all">
                            🇧🇷 Rio de Janeiro
                        </button>
                        <button onclick="document.getElementById('city-input').value='London'; Weather.searchCity()" 
                                class="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg font-semibold text-sm transition-all">
                            🇬🇧 London
                        </button>
                        <button onclick="document.getElementById('city-input').value='Tokyo'; Weather.searchCity()" 
                                class="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-semibold text-sm transition-all">
                            🇯🇵 Tokyo
                        </button>
                    </div>
                    
                    <!-- Location Button -->
                    <div class="text-center">
                        <button onclick="Weather.getLocationWeather()" 
                                class="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2">
                            <span class="text-lg">📍</span>
                            <span>Usar Minha Localização</span>
                        </button>
                    </div>
                </div>
                
                <!-- Loading State -->
                <div id="weather-loading" class="hidden text-center py-6">
                    <div class="inline-block">
                        <div class="loader"></div>
                        <p class="mt-2 text-gray-600 font-semibold text-sm">Carregando dados do clima...</p>
                    </div>
                </div>
                
                <!-- Weather Result -->
                <div id="weather-result" class="hidden">
                    <!-- Será preenchido dinamicamente -->
                </div>
            </div>
        `;
    },
    
    init() {
        // API Key já está definida no código
        console.log('✅ API Key configurada no código');
    },
    
    async searchCity() {
        const cityInput = document.getElementById('city-input');
        const city = cityInput?.value.trim();
        
        if (!city) {
            Utils.showNotification('❌ Digite o nome de uma cidade', 'error');
            return;
        }
        
        if (!this.apiKey || this.apiKey === 'SUA_CHAVE_OPENWEATHER_AQUI') {
            Utils.showNotification('⚠️ Configure sua API Key no código primeiro!', 'warning');
            return;
        }
        
        this.showLoading();
        
        try {
            // Buscar dados atuais
            const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric&lang=pt_br`;
            
            console.log('🌍 Buscando clima para:', city);
            
            const currentResponse = await fetch(currentUrl);
            
            if (!currentResponse.ok) {
                const errorData = await currentResponse.json().catch(() => ({}));
                console.error('❌ Erro da API:', currentResponse.status, errorData);
                
                if (currentResponse.status === 401) {
                    throw new Error('API Key inválida ou não ativada. Verifique se:\n1. Copiou a chave corretamente\n2. Aguardou 10-15 minutos após criar a conta\n3. A chave está ativa no painel do OpenWeatherMap');
                } else if (currentResponse.status === 404) {
                    throw new Error('Cidade não encontrada. Tente:\n• Outro nome (ex: "Sao Paulo" sem acento)\n• Nome em inglês (ex: "London", "Paris")\n• Incluir o país (ex: "Paris,FR")');
                } else if (currentResponse.status === 429) {
                    throw new Error('Limite de requisições excedido. Aguarde alguns minutos.');
                } else {
                    throw new Error(`Erro ${currentResponse.status}: ${errorData.message || 'Erro desconhecido'}`);
                }
            }
            
            this.currentWeather = await currentResponse.json();
            console.log('✅ Dados do clima recebidos:', this.currentWeather);
            
            // Buscar previsão de 5 dias
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric&lang=pt_br`;
            const forecastResponse = await fetch(forecastUrl);
            
            if (forecastResponse.ok) {
                this.forecast = await forecastResponse.json();
                console.log('✅ Previsão recebida');
            }
            
            this.displayWeather();
            
        } catch (error) {
            this.hideLoading();
            console.error('❌ Erro completo:', error);
            
            // Mostrar erro formatado
            const errorMessage = error.message || 'Erro ao buscar dados do clima';
            const errorLines = errorMessage.split('\n');
            
            Utils.showNotification('❌ ' + errorLines[0], 'error');
            
            // Se houver mais linhas, mostrar em um alert
            if (errorLines.length > 1) {
                setTimeout(() => {
                    alert('⚠️ ERRO DETALHADO:\n\n' + errorMessage);
                }, 500);
            }
        }
    },
    
    async getLocationWeather() {
        if (!this.apiKey || this.apiKey === 'SUA_CHAVE_OPENWEATHER_AQUI') {
            Utils.showNotification('⚠️ Configure sua API Key no código primeiro!', 'warning');
            return;
        }
        
        if (!navigator.geolocation) {
            Utils.showNotification('❌ Geolocalização não suportada pelo navegador', 'error');
            return;
        }
        
        Utils.showNotification('📍 Obtendo sua localização...', 'info');
        this.showLoading();
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                console.log('📍 Coordenadas:', latitude, longitude);
                
                try {
                    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=metric&lang=pt_br`;
                    const currentResponse = await fetch(currentUrl);
                    
                    if (!currentResponse.ok) {
                        if (currentResponse.status === 401) {
                            throw new Error('API Key inválida. Verifique sua chave.');
                        }
                        throw new Error('Erro ao buscar dados do clima');
                    }
                    
                    this.currentWeather = await currentResponse.json();
                    
                    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=metric&lang=pt_br`;
                    const forecastResponse = await fetch(forecastUrl);
                    
                    if (forecastResponse.ok) {
                        this.forecast = await forecastResponse.json();
                    }
                    
                    this.displayWeather();
                    
                } catch (error) {
                    this.hideLoading();
                    console.error('❌ Erro:', error);
                    Utils.showNotification('❌ Erro ao obter clima: ' + error.message, 'error');
                }
            },
            (error) => {
                this.hideLoading();
                console.error('❌ Erro de geolocalização:', error);
                
                let errorMsg = 'Erro ao obter localização';
                if (error.code === 1) {
                    errorMsg = 'Permissão de localização negada. Ative nas configurações do navegador.';
                } else if (error.code === 2) {
                    errorMsg = 'Localização indisponível. Tente buscar por nome da cidade.';
                } else if (error.code === 3) {
                    errorMsg = 'Tempo esgotado ao obter localização.';
                }
                
                Utils.showNotification('❌ ' + errorMsg, 'error');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    },
    
    displayWeather() {
        this.hideLoading();
        
        const data = this.currentWeather;
        const resultDiv = document.getElementById('weather-result');
        resultDiv.classList.remove('hidden');
        
        const iconCode = data.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
        const temp = Math.round(data.main.temp);
        const feelsLike = Math.round(data.main.feels_like);
        const tempMin = Math.round(data.main.temp_min);
        const tempMax = Math.round(data.main.temp_max);
        const description = data.weather[0].description;
        const windSpeed = Math.round(data.wind.speed * 3.6);
        const humidity = data.main.humidity;
        const pressure = data.main.pressure;
        const visibility = (data.visibility / 1000).toFixed(1);
        const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        // Determinar cor do gradiente baseado na temperatura
        let gradientColors = 'from-blue-500 via-cyan-500 to-blue-600';
        if (temp >= 30) {
            gradientColors = 'from-red-500 via-orange-500 to-yellow-500';
        } else if (temp >= 20) {
            gradientColors = 'from-yellow-400 via-orange-400 to-red-400';
        } else if (temp >= 15) {
            gradientColors = 'from-green-400 via-teal-400 to-cyan-400';
        }
        
        let forecastHtml = '';
        if (this.forecast && this.forecast.list) {
            const dailyForecast = this.forecast.list.filter(item => item.dt_txt.includes('12:00:00')).slice(0, 5);
            
            forecastHtml = `
                <div class="bg-white rounded-2xl shadow-2xl p-4 mt-3">
                    <h3 class="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
                        <span>📅</span>
                        <span>Previsão para os Próximos Dias</span>
                    </h3>
                    <div class="grid grid-cols-2 md:grid-cols-5 gap-2">
                        ${dailyForecast.map(day => {
                            const date = new Date(day.dt * 1000);
                            const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });
                            const dayTemp = Math.round(day.main.temp);
                            const dayIcon = day.weather[0].icon;
                            const dayDesc = day.weather[0].description;
                            
                            return `
                                <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-2 text-center hover:shadow-lg transition-all transform hover:scale-105">
                                    <div class="text-xs font-bold text-gray-700 mb-1 capitalize">${dayName}</div>
                                    <img src="https://openweathermap.org/img/wn/${dayIcon}@2x.png" 
                                         alt="${dayDesc}" 
                                         class="w-10 h-10 mx-auto">
                                    <div class="text-lg font-black text-gray-800">${dayTemp}°C</div>
                                    <div class="text-xs text-gray-600 capitalize">${dayDesc}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }
        
        resultDiv.innerHTML = `
            <div class="animate-fadeIn">
                <div class="bg-gradient-to-br ${gradientColors} rounded-3xl shadow-2xl overflow-hidden">
                    <!-- Main Weather Info -->
                    <div class="p-4 text-white text-center">
                        <h2 class="text-2xl font-black mb-2 flex items-center justify-center gap-2">
                            <span>📍</span>
                            <span>${data.name}, ${data.sys.country}</span>
                        </h2>
                        <div class="flex items-center justify-center gap-3 mb-3">
                            <img src="${iconUrl}" alt="${description}" class="w-20 h-20 drop-shadow-2xl">
                            <div class="text-left">
                                <div class="text-5xl font-black">${temp}°C</div>
                                <div class="text-lg font-semibold capitalize">${description}</div>
                                <div class="text-sm opacity-90">Sensação: ${feelsLike}°C</div>
                            </div>
                        </div>
                        <div class="flex items-center justify-center gap-3 text-sm">
                            <span>🔽 Min: ${tempMin}°C</span>
                            <span>•</span>
                            <span>🔼 Máx: ${tempMax}°C</span>
                        </div>
                    </div>
                    
                    <!-- Weather Details Grid -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-2 p-4 bg-white/10 backdrop-blur-sm">
                        <div class="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center text-white transform hover:scale-105 transition-all">
                            <div class="text-2xl mb-1">💧</div>
                            <div class="text-xs font-semibold opacity-90">Umidade</div>
                            <div class="text-xl font-black">${humidity}%</div>
                        </div>
                        <div class="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center text-white transform hover:scale-105 transition-all">
                            <div class="text-2xl mb-1">💨</div>
                            <div class="text-xs font-semibold opacity-90">Vento</div>
                            <div class="text-xl font-black">${windSpeed}</div>
                            <div class="text-xs opacity-80">km/h</div>
                        </div>
                        <div class="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center text-white transform hover:scale-105 transition-all">
                            <div class="text-2xl mb-1">👁️</div>
                            <div class="text-xs font-semibold opacity-90">Visibilidade</div>
                            <div class="text-xl font-black">${visibility}</div>
                            <div class="text-xs opacity-80">km</div>
                        </div>
                        <div class="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center text-white transform hover:scale-105 transition-all">
                            <div class="text-2xl mb-1">🌡️</div>
                            <div class="text-xs font-semibold opacity-90">Pressão</div>
                            <div class="text-xl font-black">${pressure}</div>
                            <div class="text-xs opacity-80">hPa</div>
                        </div>
                    </div>
                    
                    <!-- Sunrise/Sunset -->
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
                </div>
                
                ${forecastHtml}
                
                <!-- Success Message -->
                <div class="mt-3 bg-green-50 border-2 border-green-300 rounded-xl p-3">
                    <div class="flex items-center gap-2 text-green-800">
                        <span class="text-xl">✅</span>
                        <div>
                            <div class="font-bold text-sm">Dados carregados com sucesso!</div>
                            <div class="text-xs">API Key funcionando perfeitamente</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
        
        Utils.showNotification('✅ Clima atualizado!', 'success');
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