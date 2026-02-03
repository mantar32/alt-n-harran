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

    adminModal: document.getElementById('adminModal'),
    adminModalClose: document.getElementById('adminModalClose'),
    adminLogin: document.getElementById('adminLogin'),
    adminPanel: document.getElementById('adminPanel'),
    loginForm: document.getElementById('loginForm'),

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
        gold: 'https://static.altinkaynak.com/public/Gold'
    },

    async fetchAllData() {
        try {
            const currencyUrl = '/api/proxy?type=currency';
            const goldUrl = '/api/proxy?type=gold';

            console.log('🔄 Fetching data...');
            const ts = new Date().getTime();

            const [currencyRes, goldRes] = await Promise.all([
                fetch(`${currencyUrl}&_=${ts}`),
                fetch(`${goldUrl}&_=${ts}`)
            ]);

            if (!currencyRes.ok || !goldRes.ok) {
                throw new Error('Proxy failed');
            }

            const currencyData = await currencyRes.json();
            const goldData = await goldRes.json();

            if (!Array.isArray(currencyData) || !Array.isArray(goldData)) {
                throw new Error('Invalid data format');
            }

            console.log('✅ Data fetched successfully');

            return {
                success: true,
                data: { currency: currencyData, gold: goldData },
                timestamp: new Date().toISOString()
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
            return parseFloat(val.replace(/\./g, '').replace(',', '.'));
        }
        return 0;
    },

    parseAllData(currencyData, goldData) {
        const allItems = [...(Array.isArray(currencyData) ? currencyData : []), ...(Array.isArray(goldData) ? goldData : [])];
        const rates = {};

        allItems.forEach(item => {
            if (item && item.Kod) {
                rates[item.Kod] = {
                    buy: this.parseTurkishNumber(item.Alis),
                    sell: this.parseTurkishNumber(item.Satis),
                    change: this.parseTurkishNumber(item.Degisim) || 0,
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
    async fetchAllData() {
        try {
            // Store previous rates for comparison
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

            // Calculate change percentage based on previous rates
            Object.keys(newRates).forEach(code => {
                const current = newRates[code];
                const previous = state.previousRates[code];

                if (previous && previous.buy > 0) {
                    // Calculate percentage change based on buy price
                    current.change = ((current.buy - previous.buy) / previous.buy) * 100;
                } else {
                    current.change = 0;
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
// EVENT LISTENERS
// ============================================

const EventListeners = {
    init() {
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

        // Close modals on backdrop click
        [DOM.chartModal, DOM.adminModal, DOM.alarmModal].forEach(modal => {
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

            const currentPrice = rate.sell || rate.buy;
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
