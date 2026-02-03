/**
 * AltınSarraf - Live Exchange Rates & Gold Prices Dashboard
 * Modern Table Layout with Ticker Bar
 */

// ============================================
// CONFIGURATION & STATE
// ============================================

const CONFIG = {
    // API Endpoints
    apis: {
        exchangeRate: 'https://api.frankfurter.app/latest',
    },

    // Default settings
    defaults: {
        buySpread: 0.3,
        sellSpread: 0.3,
        refreshInterval: 15,
    },

    // Gold constants
    gold: {
        gramsPerOunce: 31.1035,
        quarterMultiplier: 1.75,
        halfMultiplier: 3.5,
        fullMultiplier: 7.0,
        jewelryPremium: 0.05,
        wholesalePremium: 0.02,
    },

    // Altın (Gold) items for table
    altin: [
        { code: 'HAS_ALTIN', name: 'Has Altın', apiCode: 'HH_T', subCode: '(0.9999)' },
        { code: 'KULCE', name: 'Külçe', apiCode: 'CH_T', subCode: '(0.995)' },
        { code: 'GRAM', name: 'Gram', apiCode: 'GA', subCode: '(24 Ayar)' },
        { code: '22_AYAR_GRAM', name: '22 Ayar Gram', apiCode: 'B' },
        { code: '22_AYAR_HURDA', name: '22 Ayar Hurda', apiCode: 'B_T' },
        { code: '18_AYAR', name: '18 Ayar', apiCode: '18' },
        { code: '14_AYAR', name: '14 Ayar', apiCode: '14' },
    ],

    // Kilo Altın items - Using calculated values from gram
    kiloAltin: [
        { code: 'USDKG', name: 'USD/KG', apiCode: 'USDKG', subCode: '(0.995)' },
        { code: 'EURKG', name: 'EUR/KG', apiCode: 'EURKG', subCode: '(0.995)' },
        { code: 'TRYKG', name: 'TRY/KG', apiCode: 'TRYKG', subCode: '(0.995)' },
    ],

    // Gümüş items
    gumus: [
        { code: 'GRANUL_GUMUS', name: 'Granül Gümüş', apiCode: 'AG_T' },
        { code: 'KULCE_50_GR', name: 'Külçe (50 GR)', apiCode: 'AG_T' },
    ],

    // Sarrafiye items
    sarrafiye: [
        { code: 'CEYREK', name: 'Çeyrek', apiCode: 'C' },
        { code: 'YARIM', name: 'Yarım', apiCode: 'Y' },
        { code: 'TEKLIK', name: 'Teklik', apiCode: 'T' },
        { code: 'GREMSE', name: 'Gremse', apiCode: 'G' },
        { code: 'GREMSE_BESLI', name: 'Gremse Beşli', apiCode: 'G5B' },
        { code: 'ATA_CUMHURIYET', name: 'Ata Cumhuriyet', apiCode: 'A' },
        { code: 'ATA_BESLI', name: 'Ata Beşli', apiCode: 'A5' },
        { code: 'RESAT', name: 'Reşat', apiCode: 'R' },
        { code: 'HAMIT', name: 'Hamit', apiCode: 'H' },
    ],

    // Eski Sarrafiye items
    eskiSarrafiye: [
        { code: 'E_CEYREK', name: 'E. Çeyrek', apiCode: 'EC' },
        { code: 'E_YARIM', name: 'E. Yarım', apiCode: 'EY' },
        { code: 'E_TEKLIK', name: 'E. Teklik', apiCode: 'ET' },
        { code: 'E_GREMSE', name: 'E. Gremse', apiCode: 'EG' },
        { code: 'E_GREMSE_BESLI', name: 'E. Gremse Beşli', apiCode: 'EGB' },
    ],

    // Admin credentials
    admin: {
        username: 'admin',
        password: 'admin123'
    }
};

// Application State
const state = {
    settings: {
        buySpread: CONFIG.defaults.buySpread,
        sellSpread: CONFIG.defaults.sellSpread,
        refreshInterval: CONFIG.defaults.refreshInterval,
    },

    rates: {
        currencies: {},
        gold: {},
        altin: {},
        sarrafiye: {},
        gumus: {}
    },

    previousRates: {
        altin: {},
        sarrafiye: {},
        gumus: {}
    },

    alarms: [], // Fiyat alarmları

    lastUpdate: null,
    isLoading: true,
    isCachedData: false,
    isLoggedIn: false,
    refreshTimer: null,
    detailChart: null
};

// ============================================
// DOM ELEMENTS
// ============================================

const DOM = {
    // Ticker elements
    tickerContent: document.getElementById('tickerContent'),
    tickerEur: document.getElementById('ticker-eur'),
    tickerKulce: document.getElementById('ticker-kulce'),
    ticker22Ayar: document.getElementById('ticker-22ayar'),
    tickerXauusd: document.getElementById('ticker-xauusd'),

    // Table bodies
    altinTableBody: document.getElementById('altinTableBody'),
    kiloAltinTableBody: document.getElementById('kiloAltinTableBody'),
    gumusTableBody: document.getElementById('gumusTableBody'),
    sarrafiyeTableBody: document.getElementById('sarrafiyeTableBody'),
    eskiSarrafiyeTableBody: document.getElementById('eskiSarrafiyeTableBody'),

    // Modals
    chartModal: document.getElementById('chartModal'),
    modalTitle: document.getElementById('modalTitle'),
    modalClose: document.getElementById('modalClose'),
    detailChartCanvas: document.getElementById('detailChart'),

    // Header Elements
    marketStatus: document.getElementById('marketStatus'),
    lastUpdate: document.getElementById('lastUpdate'),
    // liveClock: document.getElementById('liveClock'), // Removed

    // Analog Clock Hands
    clockHour: document.getElementById('clockHour'),
    clockMinute: document.getElementById('clockMinute'),
    clockSecond: document.getElementById('clockSecond'),

    themeToggle: document.getElementById('themeToggle'),

    adminModal: document.getElementById('adminModal'),
    adminModalClose: document.getElementById('adminModalClose'),
    adminLogin: document.getElementById('adminLogin'),
    adminPanel: document.getElementById('adminPanel'),
    loginForm: document.getElementById('loginForm'),

    // New Modals
    converterModal: document.getElementById('converterModal'),
    converterModalClose: document.getElementById('converterModalClose'),
    contactModal: document.getElementById('contactModal'),
    contactModalClose: document.getElementById('contactModalClose'),

    // Converter Elements
    convAmount: document.getElementById('convAmount'),
    convFrom: document.getElementById('convFrom'),
    convTo: document.getElementById('convTo'),
    convResult: document.getElementById('convResult'),

    buySpread: document.getElementById('buySpread'),
    sellSpread: document.getElementById('sellSpread'),
    refreshInterval: document.getElementById('refreshInterval'),
    intervalValue: document.getElementById('intervalValue'),
    currencyToggles: document.getElementById('currencyToggles'),
    goldToggles: document.getElementById('goldToggles'),
    saveSettings: document.getElementById('saveSettings'),
    logoutBtn: document.getElementById('logoutBtn'),

    loadingOverlay: document.getElementById('loadingOverlay'),

    // Alarm elements
    alarmFab: document.getElementById('alarmFab'),
    alarmModal: document.getElementById('alarmModal'),
    alarmModalClose: document.getElementById('alarmModalClose'),
    alarmItem: document.getElementById('alarmItem'),
    alarmPrice: document.getElementById('alarmPrice'),
    alarmType: document.getElementById('alarmType'),
    addAlarmBtn: document.getElementById('addAlarmBtn'),
    alarmList: document.getElementById('alarmList')
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

const Utils = {
    formatPrice(price, decimals = 2) {
        if (price === null || price === undefined || isNaN(price)) return '---';
        return new Intl.NumberFormat('tr-TR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(price);
    },

    formatChange(change) {
        if (change === null || change === undefined || isNaN(change)) return '0.00';
        const sign = change >= 0 ? '+' : '';
        return `${sign}${change.toFixed(2)}%`;
    },

    getChangeDirection(current, previous) {
        if (!previous || current === previous) return 'neutral';
        return current > previous ? 'up' : 'down';
    },

    calculateChange(current, previous) {
        if (!previous || previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    },

    saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.warn('LocalStorage save failed:', e);
        }
    },

    loadFromLocalStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.warn('LocalStorage load failed:', e);
            return null;
        }
    }
};

// ============================================
// API SERVICE
// ============================================

const API = {
    endpoints: {
        currency: 'https://static.altinkaynak.com/public/Currency',
        gold: 'https://static.altinkaynak.com/public/Gold',
        secondary: 'https://finans.truncgil.com/today.json'
    },

    async fetchAllData() {
        try {
            const currencyUrl = '/api/proxy?type=currency';
            const goldUrl = '/api/proxy?type=gold';
            // Use direct fetch for Truncgil if possible, or proxy if configured. 
            // Since we are client-side, we try direct.
            const secondaryUrl = this.endpoints.secondary;

            console.log('🔄 Fetching data...');
            const ts = new Date().getTime();

            const [currencyRes, goldRes, secondaryRes] = await Promise.all([
                fetch(`${currencyUrl}&_=${ts}`).catch(() => null),
                fetch(`${goldUrl}&_=${ts}`).catch(() => null),
                fetch(`${secondaryUrl}?_=${ts}`).catch(() => null)
            ]);

            const result = { success: false, data: {}, timestamp: new Date().toISOString() };

            if (currencyRes && currencyRes.ok && goldRes && goldRes.ok) {
                result.data.currency = await currencyRes.json();
                result.data.gold = await goldRes.json();
                result.success = true;
            }

            // Get Secondary Data (Truncgil)
            let secondaryData = {};
            if (secondaryRes && secondaryRes.ok) {
                secondaryData = await secondaryRes.json();
            }

            if (!result.success) {
                throw new Error('Primary API failed');
            }

            // Attach secondary data to result to be passed to parser
            return {
                success: true,
                data: { currency: result.data.currency, gold: result.data.gold },
                secondaryData: secondaryData,
                timestamp: result.timestamp
            };
        } catch (error) {
            console.warn('⚠️ Proxy failed, trying fallback...', error);
            return this.fetchWithFallback();
        }
    },

    async fetchWithFallback() {
        try {
            const proxyUrl = 'https://api.allorigins.win/raw?url=';
            const ts = new Date().getTime();

            const [currencyRes, goldRes] = await Promise.all([
                fetch(proxyUrl + encodeURIComponent(`${this.endpoints.currency}?_=${ts}`)),
                fetch(proxyUrl + encodeURIComponent(`${this.endpoints.gold}?_=${ts}`))
            ]);

            if (!currencyRes.ok || !goldRes.ok) throw new Error('Fallback failed');

            const currencyData = await currencyRes.json();
            const goldData = await goldRes.json();

            return {
                success: true,
                data: { currency: currencyData, gold: goldData },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('All proxies failed:', error);
            return { success: false, error: error.message };
        }
    },

    parseTurkishNumber(val) {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
            return parseFloat(val.replace(/\./g, '').replace(',', '.').replace('%', ''));
        }
        return 0;
    },

    parseAllData(currencyData, goldData, secondaryData = {}) {
        const allItems = [...(Array.isArray(currencyData) ? currencyData : []), ...(Array.isArray(goldData) ? goldData : [])];
        const rates = {};

        // Mapping: Truncgil Key -> App Key
        const map = {
            'gram-altin': 'GA', 'ceyrek-altin': 'C', 'yarim-altin': 'Y', 'tam-altin': 'A',
            'cumhuriyet-altini': 'A', 'ata-altin': 'A_T', '22-ayar-bilezik': 'B',
            '14-ayar-altin': '14', '18-ayar-altin': '18', 'ons': 'XAUUSD', 'gumus': 'AG_T',
            'USD': 'USD', 'EUR': 'EUR', 'GBP': 'GBP', 'CHF': 'CHF'
        };
        const revMap = Object.entries(map).reduce((acc, [k, v]) => ({ ...acc, [v]: k }), {});

        allItems.forEach(item => {
            if (item && item.Kod) {
                const sellPrice = this.parseTurkishNumber(item.Satis);
                const buyPrice = this.parseTurkishNumber(item.Alis);

                // Try to find previous close for daily change
                // 1. Primary Change
                let change = this.parseTurkishNumber(item.Degisim);

                // 2. Secondary Change (Truncgil)
                if ((!change || change === 0) && secondaryData) {
                    const secKey = revMap[item.Kod] || item.Kod;
                    if (secondaryData[secKey] && secondaryData[secKey].Değişim) {
                        change = this.parseTurkishNumber(secondaryData[secKey].Değişim);
                    }
                }

                // 3. Manual Fallback
                let prevClose = this.parseTurkishNumber(item.DunkuKapanis || item.DKapanis || item.Acilis);

                // If API doesn't provide change but has prevClose, calculate manually
                if ((!change || change === 0) && prevClose > 0) {
                    change = ((sellPrice - prevClose) / prevClose) * 100;
                }

                rates[item.Kod] = {
                    buy: buyPrice,
                    sell: sellPrice,
                    change: change || 0,
                    name: item.Isim || item.Kod
                };
            }
        });

        return rates;
    }
};

// ============================================
// UI COMPONENTS
// ============================================

const UI = {
    // Update header info (Time & Market Status)
    updateHeader() {
        // Analog Clock
        const now = new Date();
        const seconds = now.getSeconds();
        const minutes = now.getMinutes();
        const hours = now.getHours();

        const secondDeg = ((seconds / 60) * 360);
        const minuteDeg = ((minutes / 60) * 360) + ((seconds / 60) * 6);
        const hourDeg = ((hours / 12) * 360) + ((minutes / 60) * 30);

        if (DOM.clockSecond) DOM.clockSecond.style.transform = `rotate(${secondDeg}deg)`;
        if (DOM.clockMinute) DOM.clockMinute.style.transform = `rotate(${minuteDeg}deg)`;
        if (DOM.clockHour) DOM.clockHour.style.transform = `rotate(${hourDeg}deg)`;

        if (DOM.marketStatus) {
            // Simple logic: Market open 09:00 - 18:00 weekdays
            const now = new Date();
            const hour = now.getHours();
            const day = now.getDay();
            const isOpen = day !== 0 && day !== 6 && hour >= 9 && hour < 18;

            const dot = DOM.marketStatus.querySelector('.status-dot');
            const text = DOM.marketStatus.querySelector('.status-text');

            if (isOpen) {
                DOM.marketStatus.classList.remove('closed');
                if (text) text.textContent = 'Piyasa Açık';
            } else {
                DOM.marketStatus.classList.add('closed');
                if (text) text.textContent = 'Piyasa Kapalı';
            }
        }
    },

    updateLastUpdate() {
        if (DOM.lastUpdate && state.lastUpdate) {
            const date = new Date(state.lastUpdate);
            DOM.lastUpdate.textContent = date.toLocaleTimeString('tr-TR');
        } else if (DOM.lastUpdate) {
            DOM.lastUpdate.textContent = '--:--:--';
        }
    },

    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    },

    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark'; // Default to dark
        document.documentElement.setAttribute('data-theme', savedTheme);
    },

    showLoading() {
        if (DOM.loadingOverlay) {
            DOM.loadingOverlay.classList.remove('hidden');
        }
        state.isLoading = true;
    },

    hideLoading() {
        setTimeout(() => {
            if (DOM.loadingOverlay) {
                DOM.loadingOverlay.classList.add('hidden');
            }
            state.isLoading = false;
        }, 500);
    },

    // Update ticker bar with live values
    updateTicker() {
        const rates = state.rates;
        const prev = state.previousRates || {};

        // Helper function to calculate change
        const calcChange = (code) => {
            if (rates[code] && prev[code] && prev[code].buy > 0) {
                return ((rates[code].buy - prev[code].buy) / prev[code].buy) * 100;
            }
            return rates[code]?.change || 0;
        };

        // EUR
        if (DOM.tickerEur && rates['EUR']) {
            const buy = Utils.formatPrice(rates['EUR'].buy);
            const sell = Utils.formatPrice(rates['EUR'].sell);
            const change = calcChange('EUR');
            const dir = change >= 0 ? 'up' : 'down';
            DOM.tickerEur.innerHTML = `${buy} / ${sell} <span class="ticker-change ${dir}">${change >= 0 ? '↑' : '↓'}${Math.abs(change).toFixed(2)}%</span>`;
            DOM.tickerEur.className = `ticker-value ${dir}`;
        }

        // Külçe (0.995) - API code: CH_T
        if (DOM.tickerKulce && rates['CH_T']) {
            const buy = Utils.formatPrice(rates['CH_T'].buy);
            const sell = Utils.formatPrice(rates['CH_T'].sell);
            const change = calcChange('CH_T');
            const dir = change >= 0 ? 'up' : 'down';
            DOM.tickerKulce.innerHTML = `${buy} / ${sell} <span class="ticker-change ${dir}">${change >= 0 ? '↑' : '↓'}${Math.abs(change).toFixed(2)}%</span>`;
            DOM.tickerKulce.className = `ticker-value ${dir}`;
        }

        // 22 Ayar - API code: B
        if (DOM.ticker22Ayar && rates['B']) {
            const buy = Utils.formatPrice(rates['B'].buy);
            const sell = Utils.formatPrice(rates['B'].sell);
            const change = calcChange('B');
            const dir = change >= 0 ? 'up' : 'down';
            DOM.ticker22Ayar.innerHTML = `${buy} / ${sell} <span class="ticker-change ${dir}">${change >= 0 ? '↑' : '↓'}${Math.abs(change).toFixed(2)}%</span>`;
            DOM.ticker22Ayar.className = `ticker-value ${dir}`;
        }

        // XAUUSD
        if (DOM.tickerXauusd && rates['XAUUSD']) {
            const buy = Utils.formatPrice(rates['XAUUSD'].buy);
            const change = calcChange('XAUUSD');
            const dir = change >= 0 ? 'up' : 'down';
            DOM.tickerXauusd.innerHTML = `${buy} <span class="ticker-change ${dir}">${change >= 0 ? '↑' : '↓'}${Math.abs(change).toFixed(2)}%</span>`;
            DOM.tickerXauusd.className = `ticker-value ${dir}`;
        }
    },

    // Render a table with given items
    renderTable(tableBody, items) {
        if (!tableBody) return;

        let html = '';

        items.forEach(item => {
            const rate = state.rates[item.apiCode];
            if (!rate) {
                html += `
                    <tr>
                        <td class="td-name">${item.name} ${item.subCode ? `<span class="item-code">${item.subCode}</span>` : ''}</td>
                        <td class="td-price">---</td>
                        <td class="td-price">---</td>
                        <td class="td-change"><span class="change-indicator neutral">0.00%</span></td>
                    </tr>
                `;
                return;
            }

            const prevRate = state.previousRates[item.apiCode];
            let buyDir = 'neutral';
            let sellDir = 'neutral';
            let change = rate.change || 0;

            if (prevRate) {
                buyDir = Utils.getChangeDirection(rate.buy, prevRate.buy);
                sellDir = Utils.getChangeDirection(rate.sell, prevRate.sell);
            }

            const changeDir = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
            const changeArrow = change > 0 ? '↑' : change < 0 ? '↓' : '';

            html += `
                <tr data-code="${item.code}">
                    <td class="td-name">${item.name} ${item.subCode ? `<span class="item-code">${item.subCode}</span>` : ''}</td>
                    <td class="td-price ${buyDir === 'up' ? 'price-up' : buyDir === 'down' ? 'price-down' : ''}">${Utils.formatPrice(rate.buy)}</td>
                    <td class="td-price ${sellDir === 'up' ? 'price-up' : sellDir === 'down' ? 'price-down' : ''}">${Utils.formatPrice(rate.sell)}</td>
                    <td class="td-change">
                        <span class="change-indicator ${changeDir}">${changeArrow}${Math.abs(change).toFixed(2)}%</span>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
    },

    // Render all tables
    renderAllTables() {
        this.renderTable(DOM.altinTableBody, CONFIG.altin);
        this.renderTable(DOM.kiloAltinTableBody, CONFIG.kiloAltin);
        this.renderTable(DOM.gumusTableBody, CONFIG.gumus);
        this.renderTable(DOM.sarrafiyeTableBody, CONFIG.sarrafiye);
        this.renderTable(DOM.eskiSarrafiyeTableBody, CONFIG.eskiSarrafiye);
    },

    closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
        }
    },

    showToast(message, type = 'success') {
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span>${type === 'success' ? '✓' : '✕'}</span>
            <span>${message}</span>
        `;

        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// ============================================
// DATA MANAGEMENT
// ============================================

const DataManager = {
    dayStartRates: null,

    init() {
        this.loadDayStartRates();
        this.checkDayReset();
    },

    loadDayStartRates() {
        const stored = localStorage.getItem('dayStartRates');
        if (stored) {
            const data = JSON.parse(stored);
            const today = new Date().toLocaleDateString('tr-TR');
            if (data.date === today) {
                this.dayStartRates = data.rates;
            } else {
                this.dayStartRates = null; // Stored data is old
                localStorage.removeItem('dayStartRates');
            }
        }
    },

    saveDayStartRates(rates) {
        if (this.dayStartRates) return; // Already saved for today

        const today = new Date().toLocaleDateString('tr-TR');
        const startRates = {};

        // Save current sell prices as start rates
        Object.keys(rates).forEach(key => {
            startRates[key] = rates[key].sell;
        });

        this.dayStartRates = startRates;
        localStorage.setItem('dayStartRates', JSON.stringify({
            date: today,
            rates: startRates
        }));
    },

    checkDayReset() {
        const today = new Date().toLocaleDateString('tr-TR');
        const stored = localStorage.getItem('dayStartRates');
        if (stored) {
            const data = JSON.parse(stored);
            if (data.date !== today) {
                this.dayStartRates = null;
                localStorage.removeItem('dayStartRates');
            }
        }
    },

    async fetchAllData() {
        this.checkDayReset();

        try {
            // Store previous rates for comparison (short term)
            if (Object.keys(state.rates).length > 0) {
                state.previousRates = JSON.parse(JSON.stringify(state.rates));
            }

            const result = await API.fetchAllData();

            if (!result.success) {
                console.warn('Fetch failed');
                state.isCachedData = true;
                return false;
            }

            // Parse all data into rates object
            const newRates = API.parseAllData(result.data.currency, result.data.gold);

            // Initialize Day Start Rates if not exists
            if (!this.dayStartRates) {
                this.saveDayStartRates(newRates);
            }

            // Calculate Change (Priority: API Change > Calculated Daily Change)
            Object.keys(newRates).forEach(code => {
                const item = newRates[code];

                // If API Change is 0, try to calculate vs Day Start
                if (item.change === 0 && this.dayStartRates && this.dayStartRates[code]) {
                    const startPrice = this.dayStartRates[code];
                    if (startPrice > 0) {
                        item.change = ((item.sell - startPrice) / startPrice) * 100;
                    }
                }
            });

            state.rates = newRates;
            state.lastUpdate = result.timestamp;
            state.isCachedData = false;

            // Save to cache (including previous rates for change calculation)
            Utils.saveToLocalStorage('cachedRates', {
                rates: state.rates,
                previousRates: state.previousRates,
                timestamp: result.timestamp
            });

            console.log('✅ Data updated:', result.timestamp);
            return true;
        } catch (error) {
            console.error('Data fetch error:', error);

            // Try to load from cache
            const cached = Utils.loadFromLocalStorage('cachedRates');
            if (cached) {
                state.rates = cached.rates;
                state.lastUpdate = cached.timestamp;
                state.isCachedData = true;
                return true;
            }

            return false;
        }
    },

    startAutoRefresh() {
        this.stopAutoRefresh();

        state.refreshTimer = setInterval(async () => {
            await this.fetchAllData();
            this.updateUI();
        }, state.settings.refreshInterval * 1000);
    },

    stopAutoRefresh() {
        if (state.refreshTimer) {
            clearInterval(state.refreshTimer);
            state.refreshTimer = null;
        }
    },

    updateUI() {
        UI.updateTicker();
        UI.renderAllTables();
        UI.updateHeader(); // Update clock and market status
        UI.updateLastUpdate(); // Update data timestamp

        // Check alarms
        if (typeof AlarmManager !== 'undefined') {
            AlarmManager.checkAlarms();
        }
    }
};

// ============================================
// ADMIN PANEL
// ============================================

const Admin = {
    login(username, password) {
        if (username === CONFIG.admin.username && password === CONFIG.admin.password) {
            state.isLoggedIn = true;
            if (DOM.adminLogin) DOM.adminLogin.style.display = 'none';
            if (DOM.adminPanel) DOM.adminPanel.style.display = 'block';
            this.loadSettings();
            UI.showToast('Giriş başarılı!', 'success');
            return true;
        }
        UI.showToast('Hatalı kullanıcı adı veya şifre!', 'error');
        return false;
    },

    logout() {
        state.isLoggedIn = false;
        if (DOM.adminLogin) DOM.adminLogin.style.display = 'block';
        if (DOM.adminPanel) DOM.adminPanel.style.display = 'none';
        const username = document.getElementById('username');
        const password = document.getElementById('password');
        if (username) username.value = '';
        if (password) password.value = '';
    },

    loadSettings() {
        const savedSettings = Utils.loadFromLocalStorage('adminSettings');
        if (savedSettings) {
            state.settings = { ...state.settings, ...savedSettings };
        }

        if (DOM.buySpread) DOM.buySpread.value = state.settings.buySpread;
        if (DOM.sellSpread) DOM.sellSpread.value = state.settings.sellSpread;
        if (DOM.refreshInterval) DOM.refreshInterval.value = state.settings.refreshInterval;
        if (DOM.intervalValue) DOM.intervalValue.textContent = `${state.settings.refreshInterval}s`;
    },

    saveSettings() {
        state.settings.buySpread = parseFloat(DOM.buySpread?.value) || CONFIG.defaults.buySpread;
        state.settings.sellSpread = parseFloat(DOM.sellSpread?.value) || CONFIG.defaults.sellSpread;
        state.settings.refreshInterval = parseInt(DOM.refreshInterval?.value) || CONFIG.defaults.refreshInterval;

        Utils.saveToLocalStorage('adminSettings', state.settings);
        DataManager.startAutoRefresh();
        DataManager.updateUI();
        UI.showToast('Ayarlar kaydedildi!', 'success');
    }
};

// ============================================
// CONVERTER LOGIC
// ============================================

const Converter = {
    initialized: false,

    init() {
        if (this.initialized) return;

        // Populate options
        const select = DOM.convFrom;
        if (!select) return;

        select.innerHTML = '';

        // Add Currencies
        const currencies = [
            { code: 'USD', name: 'USD - Dolar' },
            { code: 'EUR', name: 'EUR - Euro' },
            { code: 'GBP', name: 'GBP - Sterlin' },
            { code: 'CHF', name: 'CHF - İsviçre Frangı' }
        ];

        const optGroupCurrency = document.createElement('optgroup');
        optGroupCurrency.label = 'Döviz';
        currencies.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.code;
            opt.textContent = c.name;
            optGroupCurrency.appendChild(opt);
        });
        select.appendChild(optGroupCurrency);

        // Add Gold
        const gold = [
            { code: 'GA', name: 'Gram Altın' },
            { code: 'C', name: 'Çeyrek Altın' },
            { code: 'Y', name: 'Yarım Altın' },
            { code: 'A', name: 'Tam Altın' }
        ];

        const optGroupGold = document.createElement('optgroup');
        optGroupGold.label = 'Altın';
        gold.forEach(g => {
            const opt = document.createElement('option');
            opt.value = g.code;
            opt.textContent = g.name;
            optGroupGold.appendChild(opt);
        });
        select.appendChild(optGroupGold);

        this.initialized = true;
        this.calculate();
    },

    calculate() {
        const amount = parseFloat(DOM.convAmount.value) || 0;
        const fromCode = DOM.convFrom.value;
        let rate = 0;

        // 1. Try finding in Currencies
        if (state.rates.currencies[fromCode]) {
            rate = state.rates.currencies[fromCode].sell;
        }

        // 2. Try finding in Gold/Sarrafiye
        if (!rate) {
            const allRates = {
                ...state.rates.gold,
                ...state.rates.altin,
                ...state.rates.sarrafiye,
                ...state.rates.gumus,
                ...state.rates.eskiSarrafiye
            };

            // Try direct match
            if (allRates[fromCode]) {
                rate = allRates[fromCode].sell;
            }
            // Try fuzzy match (if API code is different from checking code)
            // In our CONFIG, 'GA' might map to an API code.
            // But the keys in allRates ARE the API codes (or whatever parseAllData used).
            // If fromCode comes from CONFIG.altin[x].code, we need to find the item in CONFIG matching that code, get its apiCode, then look up.
            else {
                // Check CONFIG lists
                const allItems = [
                    ...CONFIG.altin,
                    ...CONFIG.sarrafiye,
                    ...CONFIG.gumus,
                    ...CONFIG.kiloAltin,
                    ...CONFIG.eskiSarrafiye
                ];

                const item = allItems.find(i => i.code === fromCode || i.apiCode === fromCode);
                if (item) {
                    const r = allRates[item.apiCode] || allRates[item.code];
                    if (r) rate = r.sell;
                }
            }
        }

        if (rate) {
            const result = amount * rate;
            DOM.convResult.innerText = `${Utils.formatPrice(result)} ₺`;
        } else {
            DOM.convResult.innerText = '0.00 ₺';
        }
    }
};

// ============================================
// EVENT LISTENERS
// ============================================

const EventListeners = {
    init() {
        // Start Clock
        setInterval(() => UI.updateHeader(), 1000);

        if (DOM.themeToggle) {
            DOM.themeToggle.addEventListener('click', () => UI.toggleTheme());
        }

        // Modal close buttons
        if (DOM.modalClose) {
            DOM.modalClose.addEventListener('click', () => UI.closeModal(DOM.chartModal));
        }
        if (DOM.adminModalClose) {
            DOM.adminModalClose.addEventListener('click', () => UI.closeModal(DOM.adminModal));
        }
        if (DOM.alarmModalClose) {
            DOM.alarmModalClose.addEventListener('click', () => UI.closeModal(DOM.alarmModal));
        }

        // Sidebar Controls
        const toggleSidebar = (show) => {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebarOverlay');

            if (show) {
                sidebar?.classList.add('active');
                overlay?.classList.add('active');
            } else {
                sidebar?.classList.remove('active');
                overlay?.classList.remove('active');
            }
        };

        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const sidebarClose = document.getElementById('sidebarClose');
        const sidebarOverlay = document.getElementById('sidebarOverlay');

        if (hamburgerBtn) {
            hamburgerBtn.addEventListener('click', () => toggleSidebar(true));
        }
        if (sidebarClose) {
            sidebarClose.addEventListener('click', () => toggleSidebar(false));
        }
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => toggleSidebar(false));
        }

        // Close sidebar on menu item click (mobile UX)
        // document.querySelectorAll('.sidebar-nav .nav-item').forEach... (Removed to use specific IDs)

        // Sidebar Navigation
        document.getElementById('nav-home')?.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            toggleSidebar(false);
        });

        document.getElementById('nav-rates')?.addEventListener('click', () => {
            document.querySelector('.tables-container')?.scrollIntoView({ behavior: 'smooth' });
            toggleSidebar(false);
        });

        document.getElementById('nav-converter')?.addEventListener('click', () => {
            Converter.init(); // Initialize options if needed
            if (DOM.converterModal) {
                DOM.converterModal.classList.add('active');
                DOM.converterModal.style.display = 'flex'; // Ensure flex for centering
            }
            toggleSidebar(false);
        });

        document.getElementById('nav-alarms')?.addEventListener('click', () => {
            if (DOM.alarmModal) {
                DOM.alarmModal.classList.add('active');
                DOM.alarmModal.style.display = 'flex';
            }
            toggleSidebar(false);
        });

        document.getElementById('nav-settings')?.addEventListener('click', () => {
            if (DOM.adminModal) {
                DOM.adminModal.classList.add('active');
                DOM.adminModal.style.display = 'flex';
            }
            toggleSidebar(false);
        });

        document.getElementById('nav-contact')?.addEventListener('click', () => {
            if (DOM.contactModal) {
                DOM.contactModal.classList.add('active');
                DOM.contactModal.style.display = 'flex';
            }
            toggleSidebar(false);
        });

        // New Modal Close Buttons
        if (DOM.converterModalClose) {
            DOM.converterModalClose.addEventListener('click', () => UI.closeModal(DOM.converterModal));
        }
        if (DOM.contactModalClose) {
            DOM.contactModalClose.addEventListener('click', () => UI.closeModal(DOM.contactModal));
        }

        // Converter Inputs
        DOM.convAmount?.addEventListener('input', Converter.calculate);
        DOM.convFrom?.addEventListener('change', Converter.calculate);

        // Close modals on backdrop click
        [DOM.chartModal, DOM.adminModal, DOM.alarmModal, DOM.converterModal, DOM.contactModal].forEach(modal => {
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) UI.closeModal(modal);
                });
            }
        });

        // Close modals on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                UI.closeModal(DOM.chartModal);
                UI.closeModal(DOM.adminModal);
                UI.closeModal(DOM.alarmModal);
            }
        });

        // Login form
        if (DOM.loginForm) {
            DOM.loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('username')?.value;
                const password = document.getElementById('password')?.value;
                Admin.login(username, password);
            });
        }

        // Admin panel controls
        if (DOM.refreshInterval) {
            DOM.refreshInterval.addEventListener('input', (e) => {
                if (DOM.intervalValue) {
                    DOM.intervalValue.textContent = `${e.target.value}s`;
                }
            });
        }

        if (DOM.saveSettings) {
            DOM.saveSettings.addEventListener('click', () => Admin.saveSettings());
        }
        if (DOM.logoutBtn) {
            DOM.logoutBtn.addEventListener('click', () => Admin.logout());
        }

        // Alarm FAB button
        if (DOM.alarmFab) {
            DOM.alarmFab.addEventListener('click', () => {
                if (DOM.alarmModal) {
                    DOM.alarmModal.classList.add('active');
                    AlarmManager.requestNotificationPermission();
                }
            });
        }

        // Add alarm button
        if (DOM.addAlarmBtn) {
            DOM.addAlarmBtn.addEventListener('click', () => {
                const itemCode = DOM.alarmItem?.value;
                const targetPrice = DOM.alarmPrice?.value;
                const alarmType = DOM.alarmType?.value;

                if (!itemCode || !targetPrice || parseFloat(targetPrice) <= 0) {
                    UI.showToast('Lütfen geçerli bir fiyat girin', 'error');
                    return;
                }

                AlarmManager.addAlarm(itemCode, targetPrice, alarmType);
                DOM.alarmPrice.value = '';
            });
        }
    }
};

// ============================================
// INITIALIZATION
// ============================================

async function init() {
    console.log('🚀 AltınSarraf Dashboard Starting...');

    // Show loading state
    UI.showLoading();

    // Load saved settings
    const savedSettings = Utils.loadFromLocalStorage('adminSettings');
    if (savedSettings) {
        state.settings = { ...state.settings, ...savedSettings };
    }

    // Load cached data first (instant display)
    const cachedData = Utils.loadFromLocalStorage('cachedRates');
    if (cachedData && cachedData.rates) {
        state.rates = cachedData.rates;
        state.previousRates = cachedData.previousRates || {};
        state.lastUpdate = cachedData.timestamp;
        state.isCachedData = true;
        console.log('📦 Loaded cached data from:', cachedData.timestamp);

        // Update UI immediately with cached data
        DataManager.updateUI();
    }

    // Setup event listeners
    EventListeners.init();

    // Init Theme
    UI.initTheme();

    // Init Data Manager (Load stored rates)
    DataManager.init();

    // Fetch fresh data from API
    await DataManager.fetchAllData();

    // Update UI with fresh data
    DataManager.updateUI();

    // Start auto refresh
    DataManager.startAutoRefresh();

    // Load alarms
    AlarmManager.loadAlarms();

    // Hide loading
    UI.hideLoading();

    console.log('✅ AltınSarraf Dashboard Ready!');
}

// ============================================
// ALARM MANAGER
// ============================================

const AlarmManager = {
    // Ürün isimleri
    itemNames: {
        'GA': 'Gram Altın',
        'CH_T': 'Külçe (0.995)',
        'HH_T': 'Has Altın',
        'B': '22 Ayar Bilezik',
        'C': 'Çeyrek Altın',
        'Y': 'Yarım Altın',
        'T': 'Teklik Altın',
        'A': 'Ata Cumhuriyet',
        'USD': 'USD',
        'EUR': 'EUR'
    },

    loadAlarms() {
        const saved = Utils.loadFromLocalStorage('priceAlarms');
        if (saved && Array.isArray(saved)) {
            state.alarms = saved;
        }
        this.renderAlarmList();
        this.updateFabStatus();
    },

    saveAlarms() {
        Utils.saveToLocalStorage('priceAlarms', state.alarms);
        this.updateFabStatus();
    },

    addAlarm(itemCode, targetPrice, alarmType) {
        const alarm = {
            id: Date.now(),
            itemCode,
            itemName: this.itemNames[itemCode] || itemCode,
            targetPrice: parseFloat(targetPrice),
            type: alarmType, // 'below' or 'above'
            triggered: false,
            createdAt: new Date().toISOString()
        };

        state.alarms.push(alarm);
        this.saveAlarms();
        this.renderAlarmList();
        UI.showToast(`Alarm eklendi: ${alarm.itemName}`, 'success');
    },

    removeAlarm(alarmId) {
        state.alarms = state.alarms.filter(a => a.id !== alarmId);
        this.saveAlarms();
        this.renderAlarmList();
    },

    checkAlarms() {
        if (!state.rates || state.alarms.length === 0) return;

        state.alarms.forEach(alarm => {
            if (alarm.triggered) return;

            const rate = state.rates[alarm.itemCode];
            if (!rate) return;

            const currentPrice = rate.buy; // Alış fiyatına bak
            let triggered = false;

            if (alarm.type === 'below' && currentPrice <= alarm.targetPrice) {
                triggered = true;
            } else if (alarm.type === 'above' && currentPrice >= alarm.targetPrice) {
                triggered = true;
            }

            if (triggered) {
                alarm.triggered = true;
                this.saveAlarms();
                this.showAlarmNotification(alarm, currentPrice);
                this.renderAlarmList();
            }
        });
    },

    showAlarmNotification(alarm, currentPrice) {
        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🔔 Fiyat Alarmı!', {
                body: `${alarm.itemName}: ₺${Utils.formatPrice(currentPrice)} (Hedef: ₺${Utils.formatPrice(alarm.targetPrice)})`,
                icon: '🔔'
            });
        }

        // Visual notification
        const notification = document.createElement('div');
        notification.className = 'alarm-notification';
        notification.innerHTML = `
            <h4>🔔 ${alarm.itemName}</h4>
            <p>${alarm.type === 'below' ? 'Fiyat düştü' : 'Fiyat yükseldi'}: ₺${Utils.formatPrice(currentPrice)}</p>
        `;
        document.body.appendChild(notification);

        // Play sound
        this.playAlarmSound();

        // Remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    },

    playAlarmSound() {
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleR1Pn9XNb0IABZ/T3LuPU3c=');
            audio.volume = 0.5;
            audio.play().catch(() => { });
        } catch (e) { }
    },

    renderAlarmList() {
        if (!DOM.alarmList) return;

        if (state.alarms.length === 0) {
            DOM.alarmList.innerHTML = '<p class="no-alarms">Henüz alarm yok</p>';
            return;
        }

        let html = '';
        state.alarms.forEach(alarm => {
            const typeClass = alarm.type === 'below' ? 'alarm-type-below' : 'alarm-type-above';
            const typeText = alarm.type === 'below' ? '≤' : '≥';
            const statusClass = alarm.triggered ? 'triggered' : '';

            html += `
                <div class="alarm-item ${statusClass}" data-alarm-id="${alarm.id}">
                    <div class="alarm-info">
                        <div class="alarm-name">${alarm.itemName}</div>
                        <div class="alarm-details">
                            <span class="${typeClass}">${typeText}</span> 
                            <span class="alarm-target">₺${Utils.formatPrice(alarm.targetPrice)}</span>
                            ${alarm.triggered ? '<span style="color: var(--success);"> ✓ Tetiklendi</span>' : ''}
                        </div>
                    </div>
                    <button class="alarm-delete" onclick="AlarmManager.removeAlarm(${alarm.id})">🗑️</button>
                </div>
            `;
        });

        DOM.alarmList.innerHTML = html;
    },

    updateFabStatus() {
        if (DOM.alarmFab) {
            const activeAlarms = state.alarms.filter(a => !a.triggered).length;
            if (activeAlarms > 0) {
                DOM.alarmFab.classList.add('has-alarms');
            } else {
                DOM.alarmFab.classList.remove('has-alarms');
            }
        }
    },

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
};

// Start application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
