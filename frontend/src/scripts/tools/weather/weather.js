// Sistema de Clima Completo - OpenWeatherMap API (CORRIGIDO)
const Weather = {
    apiKey: null,
    currentWeather: null,
    forecast: null,
    
    render() {
        return `
            <div class="max-w-5xl mx-auto">
                <div class="text-center mb-8">
                    <h1 class="text-5xl font-black text-gray-800 mb-3">🌤️ Clima</h1>
                    <p class="text-gray-600 text-lg">Veja a temperatura e condições climáticas em tempo real</p>
                </div>
                
                <!-- API Key Setup -->
                <div class="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-8 text-white shadow-2xl mb-8">
                    <div class="flex items-start gap-4 mb-6">
                        <div class="text-6xl">🔑</div>
                        <div class="flex-1">
                            <h3 class="text-3xl font-black mb-3">Configure sua API Key</h3>
                            <p class="text-yellow-50 mb-4 text-lg">
                                ${this.apiKey ? '✅ API Key configurada! Você pode alterá-la abaixo.' : '⚠️ Configure sua chave gratuita do OpenWeatherMap:'}
                            </p>
                        </div>
                    </div>
                    
                    <div class="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-4">
                        <div class="space-y-3 text-yellow-50">
                            <div class="flex items-start gap-3">
                                <span class="text-2xl">1️⃣</span>
                                <div>Acesse <a href="https://openweathermap.org/api" target="_blank" class="font-bold underline">openweathermap.org/api</a> e crie uma conta grátis</div>
                            </div>
                            <div class="flex items-start gap-3">
                                <span class="text-2xl">2️⃣</span>
                                <div>Após fazer login, vá em <strong>My API Keys</strong> e copie a chave padrão (ou crie uma nova)</div>
                            </div>
                            <div class="flex items-start gap-3">
                                <span class="text-2xl">3️⃣</span>
                                <div><strong>IMPORTANTE:</strong> Aguarde 10-15 minutos após criar a conta para a chave ser ativada</div>
                            </div>
                            <div class="flex items-start gap-3">
                                <span class="text-2xl">4️⃣</span>
                                <div>Cole a chave abaixo e clique em Salvar</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex gap-3 mb-4">
                        <input type="password" id="api-key-input" 
                            value="${this.apiKey || ''}"
                            class="flex-1 px-6 py-4 rounded-xl text-gray-800 font-mono text-base border-2 border-white/30 focus:border-white focus:outline-none"
                            placeholder="Cole sua API Key aqui (ex: 1a2b3c4d5e6f7g8h9i0j...)">
                        <button onclick="Weather.saveApiKey()" 
                                class="px-8 py-4 bg-white text-orange-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all flex items-center gap-2">
                            <span>💾</span>
                            <span>Salvar</span>
                        </button>
                    </div>
                    
                    ${this.apiKey ? `
                        <div class="flex gap-3">
                            <button onclick="Weather.testApiKey()" 
                                    class="flex-1 bg-white/20 hover:bg-white/30 py-3 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                                <span>🔍</span>
                                <span>Testar API Key</span>
                            </button>
                            <button onclick="Weather.clearApiKey()" 
                                    class="bg-red-500/80 hover:bg-red-600 py-3 px-6 rounded-xl font-bold transition-all flex items-center gap-2">
                                <span>🗑️</span>
                                <span>Limpar</span>
                            </button>
                        </div>
                    ` : `
                        <a href="https://home.openweathermap.org/users/sign_up" target="_blank" 
                           class="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition-all">
                            <span>🌐</span>
                            <span>Criar Conta Grátis</span>
                        </a>
                    `}
                </div>
                
                ${this.apiKey ? `
                    <div class="bg-white rounded-2xl shadow-2xl p-8 mb-6">
                        <!-- Search Box -->
                        <div class="mb-6">
                            <label class="block text-gray-700 font-bold mb-3 text-lg flex items-center gap-2">
                                <span>🏙️</span>
                                <span>Buscar Cidade</span>
                            </label>
                            <div class="flex gap-3">
                                <input type="text" id="city-input" 
                                    class="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none transition-all text-lg font-semibold bg-gradient-to-br from-blue-50 to-cyan-50" 
                                    placeholder="Ex: São Paulo, Rio de Janeiro, London..."
                                    onkeypress="if(event.key === 'Enter') Weather.searchCity()">
                                <button onclick="Weather.searchCity()" 
                                        class="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                                    <span class="text-2xl">🔍</span>
                                    <span>Buscar</span>
                                </button>
                            </div>
                        </div>
                        
                        <!-- Quick Search Buttons -->
                        <div class="flex flex-wrap gap-3 mb-6">
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
                                    class="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2">
                                <span class="text-2xl">📍</span>
                                <span>Usar Minha Localização</span>
                            </button>
                        </div>
                    </div>
                ` : ''}
                
                <!-- Loading State -->
                <div id="weather-loading" class="hidden text-center py-16">
                    <div class="inline-block">
                        <div class="loader"></div>
                        <p class="mt-4 text-gray-600 font-semibold text-lg">Carregando dados do clima...</p>
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
        // Carregar API key salva
        const saved = Utils.loadData('weather_api_key');
        if (saved && saved.key) {
            this.apiKey = saved.key;
            console.log('✅ API Key carregada:', this.apiKey.substring(0, 8) + '...');
        } else {
            console.log('⚠️ Nenhuma API Key encontrada');
        }
    },
    
    saveApiKey() {
        const input = document.getElementById('api-key-input');
        const key = input?.value.trim();
        
        if (!key) {
            Utils.showNotification('❌ Digite uma API Key válida', 'error');
            return;
        }
        
        // Validação básica do formato da key (32 caracteres hexadecimais)
        if (key.length !== 32 || !/^[a-f0-9]+$/i.test(key)) {
            Utils.showNotification('⚠️ Formato de API Key inválido. Deve ter 32 caracteres hexadecimais', 'warning');
            return;
        }
        
        this.apiKey = key;
        Utils.saveData('weather_api_key', { key: key });
        Utils.showNotification('✅ API Key salva! Aguarde 10-15 min se acabou de criar a conta.', 'success');
        
        setTimeout(() => {
            Router.render();
        }, 1000);
    },
    
    clearApiKey() {
        this.apiKey = null;
        localStorage.removeItem('weather_api_key');
        Utils.showNotification('🗑️ API Key removida', 'info');
        Router.render();
    },
    
    async testApiKey() {
        if (!this.apiKey) {
            Utils.showNotification('⚠️ Configure uma API Key primeiro', 'warning');
            return;
        }
        
        Utils.showNotification('🔍 Testando API Key...', 'info');
        
        try {
            const testUrl = `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${this.apiKey}&units=metric`;
            const response = await fetch(testUrl);
            
            if (response.ok) {
                Utils.showNotification('✅ API Key válida e funcionando!', 'success');
            } else if (response.status === 401) {
                Utils.showNotification('❌ API Key inválida ou não ativada ainda. Aguarde 10-15 minutos.', 'error');
            } else {
                Utils.showNotification('⚠️ Erro ao testar: ' + response.status, 'warning');
            }
        } catch (error) {
            Utils.showNotification('❌ Erro de conexão: ' + error.message, 'error');
        }
    },
    
    async searchCity() {
        const cityInput = document.getElementById('city-input');
        const city = cityInput?.value.trim();
        
        if (!city) {
            Utils.showNotification('❌ Digite o nome de uma cidade', 'error');
            return;
        }
        
        if (!this.apiKey) {
            Utils.showNotification('⚠️ Configure sua API Key primeiro!', 'warning');
            return;
        }
        
        this.showLoading();
        
        try {
            // Buscar dados atuais
            const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric&lang=pt_br`;
            
            console.log('🌐 Buscando clima para:', city);
            
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
        if (!this.apiKey) {
            Utils.showNotification('⚠️ Configure sua API Key primeiro!', 'warning');
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
                <div class="bg-white rounded-2xl shadow-2xl p-8 mt-6">
                    <h3 class="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
                        <span>📅</span>
                        <span>Previsão para os Próximos Dias</span>
                    </h3>
                    <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                        ${dailyForecast.map(day => {
                            const date = new Date(day.dt * 1000);
                            const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });
                            const dayTemp = Math.round(day.main.temp);
                            const dayIcon = day.weather[0].icon;
                            const dayDesc = day.weather[0].description;
                            
                            return `
                                <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 text-center hover:shadow-lg transition-all transform hover:scale-105">
                                    <div class="text-sm font-bold text-gray-700 mb-2 capitalize">${dayName}</div>
                                    <img src="https://openweathermap.org/img/wn/${dayIcon}@2x.png" 
                                         alt="${dayDesc}" 
                                         class="w-16 h-16 mx-auto">
                                    <div class="text-2xl font-black text-gray-800">${dayTemp}°C</div>
                                    <div class="text-xs text-gray-600 capitalize mt-1">${dayDesc}</div>
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
                    <div class="p-8 text-white text-center">
                        <h2 class="text-4xl font-black mb-4 flex items-center justify-center gap-2">
                            <span>📍</span>
                            <span>${data.name}, ${data.sys.country}</span>
                        </h2>
                        <div class="flex items-center justify-center gap-6 mb-6">
                            <img src="${iconUrl}" alt="${description}" class="w-32 h-32 drop-shadow-2xl">
                            <div class="text-left">
                                <div class="text-7xl font-black">${temp}°C</div>
                                <div class="text-2xl font-semibold capitalize">${description}</div>
                                <div class="text-lg opacity-90 mt-1">Sensação: ${feelsLike}°C</div>
                            </div>
                        </div>
                        <div class="flex items-center justify-center gap-4 text-lg">
                            <span>🔽 Min: ${tempMin}°C</span>
                            <span>•</span>
                            <span>🔼 Máx: ${tempMax}°C</span>
                        </div>
                    </div>
                    
                    <!-- Weather Details Grid -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 bg-white/10 backdrop-blur-sm">
                        <div class="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center text-white transform hover:scale-105 transition-all">
                            <div class="text-4xl mb-2">💧</div>
                            <div class="text-sm font-semibold opacity-90">Umidade</div>
                            <div class="text-3xl font-black">${humidity}%</div>
                        </div>
                        <div class="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center text-white transform hover:scale-105 transition-all">
                            <div class="text-4xl mb-2">💨</div>
                            <div class="text-sm font-semibold opacity-90">Vento</div>
                            <div class="text-3xl font-black">${windSpeed}</div>
                            <div class="text-xs opacity-80">km/h</div>
                        </div>
                        <div class="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center text-white transform hover:scale-105 transition-all">
                            <div class="text-4xl mb-2">👁️</div>
                            <div class="text-sm font-semibold opacity-90">Visibilidade</div>
                            <div class="text-3xl font-black">${visibility}</div>
                            <div class="text-xs opacity-80">km</div>
                        </div>
                        <div class="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center text-white transform hover:scale-105 transition-all">
                            <div class="text-4xl mb-2">🌡️</div>
                            <div class="text-sm font-semibold opacity-90">Pressão</div>
                            <div class="text-3xl font-black">${pressure}</div>
                            <div class="text-xs opacity-80">hPa</div>
                        </div>
                    </div>
                    
                    <!-- Sunrise/Sunset -->
                    <div class="grid grid-cols-2 gap-4 p-8 bg-white/5">
                        <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center text-white">
                            <div class="text-4xl mb-2">🌅</div>
                            <div class="text-sm font-semibold opacity-90">Nascer do Sol</div>
                            <div class="text-2xl font-black">${sunrise}</div>
                        </div>
                        <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center text-white">
                            <div class="text-4xl mb-2">🌇</div>
                            <div class="text-sm font-semibold opacity-90">Pôr do Sol</div>
                            <div class="text-2xl font-black">${sunset}</div>
                        </div>
                    </div>
                </div>
                
                ${forecastHtml}
                
                <!-- Success Message -->
                <div class="mt-6 bg-green-50 border-2 border-green-300 rounded-2xl p-6">
                    <div class="flex items-center gap-3 text-green-800">
                        <span class="text-3xl">✅</span>
                        <div>
                            <div class="font-bold text-lg">Dados carregados com sucesso!</div>
                            <div class="text-sm">API Key funcionando perfeitamente</div>
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