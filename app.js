/**
 * AltınSarraf - Live Exchange Rates & Gold Prices Dashboard
 * A modern, responsive financial dashboard
 */

// ============================================
// CONFIGURATION & STATE
// ============================================

const CONFIG = {
    // API Endpoints (free public APIs)
    apis: {
        exchangeRate: 'https://api.frankfurter.app/latest',
        // Fallback for gold prices - will use calculated values
    },

    // Default settings
    defaults: {
        buySpread: 0.3,     // %
        sellSpread: 0.3,    // %
        refreshInterval: 15, // seconds
    },

    // Gold constants
    gold: {
        gramsPerOunce: 31.1035,
        quarterMultiplier: 1.75,    // Quarter gold weight in grams
        halfMultiplier: 3.5,        // Half gold weight in grams  
        fullMultiplier: 7.0,        // Full gold weight in grams
        jewelryPremium: 0.05,       // 5% premium for retail
        wholesalePremium: 0.02,     // 2% premium for wholesale
    },

    // Currency definitions
    currencies: [
        { code: 'USD', name: 'Amerikan Doları', symbol: '$', icon: '🇺🇸', enabled: true },
        { code: 'EUR', name: 'Euro', symbol: '€', icon: '🇪🇺', enabled: true },
        { code: 'GBP', name: 'İngiliz Sterlini', symbol: '£', icon: '🇬🇧', enabled: true },
    ],

    // Wholesale Gold definitions  
    wholesaleGold: [
        { code: 'GRAM_GOLD', name: 'Gram Altın', unit: 'gr', icon: '🥇', enabled: true },
        { code: 'OUNCE_GOLD', name: 'Ons Altın', unit: 'oz', icon: '🏆', enabled: true },
    ],

    // Retail Gold definitions
    retailGold: [
        { code: 'QUARTER_GOLD', name: 'Çeyrek Altın', unit: 'adet', icon: '🪙', enabled: true },
        { code: 'HALF_GOLD', name: 'Yarım Altın', unit: 'adet', icon: '🥇', enabled: true },
        { code: 'FULL_GOLD', name: 'Tam Altın', unit: 'adet', icon: '👑', enabled: true },
        { code: 'REPUBLIC_GOLD', name: 'Cumhuriyet Altını', unit: 'adet', icon: '⭐', enabled: true },
    ],

    // Admin credentials (in real app, this would be server-side)
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
        currencies: CONFIG.currencies.map(c => ({ code: c.code, enabled: c.enabled })),
        wholesaleGold: CONFIG.wholesaleGold.map(g => ({ code: g.code, enabled: g.enabled })),
        retailGold: CONFIG.retailGold.map(g => ({ code: g.code, enabled: g.enabled })),
    },

    rates: {
        currencies: {},
        gold: {}
    },

    previousRates: {},

    history: {
        currencies: {},
        gold: {}
    },

    lastUpdate: null,
    isMarketOpen: true,
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
    header: document.getElementById('header'),
    marketStatus: document.getElementById('marketStatus'),
    lastUpdate: document.getElementById('lastUpdate'),
    themeToggle: document.getElementById('themeToggle'),
    adminBtn: document.getElementById('adminBtn'),
    realTimeClock: document.getElementById('realTimeClock'),

    currencyGrid: document.getElementById('currencyGrid'),
    wholesaleGoldGrid: document.getElementById('wholesaleGoldGrid'),
    retailGoldGrid: document.getElementById('retailGoldGrid'),

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

    loadingOverlay: document.getElementById('loadingOverlay')
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

    formatTime(date) {
        return date.toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    },

    getChangeDirection(current, previous) {
        if (!previous || current === previous) return 'neutral';
        return current > previous ? 'up' : 'down';
    },

    calculateChange(current, previous) {
        if (!previous || previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    },

    isMarketOpen() {
        const now = new Date();
        const day = now.getDay();
        const hour = now.getHours();

        // Markets closed on weekends
        if (day === 0 || day === 6) return false;

        // Markets open 09:00 - 18:00 Turkey time
        if (hour < 9 || hour >= 18) return false;

        return true;
    },

    generateSparklineData(length = 20) {
        const data = [];
        let value = 100;
        for (let i = 0; i < length; i++) {
            value += (Math.random() - 0.5) * 4;
            data.push(value);
        }
        return data;
    },

    createSparklineSVG(data, direction = 'up') {
        if (!data || data.length === 0) return '';

        const width = 70;
        const height = 30;
        const padding = 2;

        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;

        const points = data.map((value, index) => {
            const x = padding + (index / (data.length - 1)) * (width - padding * 2);
            const y = height - padding - ((value - min) / range) * (height - padding * 2);
            return `${x},${y}`;
        }).join(' ');

        return `
            <svg class="mini-chart" viewBox="0 0 ${width} ${height}">
                <polyline class="sparkline ${direction}" points="${points}" />
            </svg>
        `;
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
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
// API SERVICE - TRUNCGIL FINANS API
// ============================================

const API = {
    // Altınkaynak API Endpoints
    endpoints: {
        currency: 'https://static.altinkaynak.com/public/Currency',
        gold: 'https://static.altinkaynak.com/public/Gold'
    },

    async fetchAllData() {
        try {
            // Priority 1: Use our own Vercel Proxy (Serverless Function)
            // This runs on the same domain, so no CORS issues.
            const currencyUrl = '/api/proxy?type=currency';
            const goldUrl = '/api/proxy?type=gold';

            console.log('🔄 Fetching data from Vercel Proxy...');

            // Add timestamp to prevent browser caching of the local call
            const ts = new Date().getTime();

            const [currencyRes, goldRes] = await Promise.all([
                fetch(`${currencyUrl}&_=${ts}`),
                fetch(`${goldUrl}&_=${ts}`)
            ]);

            if (!currencyRes.ok || !goldRes.ok) {
                throw new Error('Vercel proxy failed');
            }

            const currencyData = await currencyRes.json();
            const goldData = await goldRes.json();

            // Validate data structure (simple check)
            if (!Array.isArray(currencyData) || !Array.isArray(goldData)) {
                throw new Error('Invalid data format from proxy');
            }

            console.log('✅ Data fetched successfully via Proxy:', { currency: currencyData, gold: goldData });

            return {
                success: true,
                data: { currency: currencyData, gold: goldData },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.warn('⚠️ Vercel proxy failed, trying public fallbacks...', error);
            // Fallback to public proxies if local api fails (e.g. running locally without `vercel dev`)
            return this.fetchWithFallback();
        }
    },

    // Fallback method using allorigins.win
    async fetchWithFallback() {
        try {
            const proxyUrl = 'https://api.allorigins.win/raw?url=';
            const ts = new Date().getTime();

            const [currencyRes, goldRes] = await Promise.all([
                fetch(proxyUrl + encodeURIComponent(`${this.endpoints.currency}?_=${ts}`)),
                fetch(proxyUrl + encodeURIComponent(`${this.endpoints.gold}?_=${ts}`))
            ]);

            if (!currencyRes.ok || !goldRes.ok) throw new Error('Fallback proxy failed');

            const currencyData = await currencyRes.json();
            const goldData = await goldRes.json();

            console.log('📊 Altınkaynak API Data (Fallback):', { currency: currencyData, gold: goldData });

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

    // Helper to parse Turkish number string
    parseTurkishNumber(val) {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
            // Remove thousands separator (.) and replace decimal separator (,) with dot (.)
            return parseFloat(val.replace(/\./g, '').replace(',', '.'));
        }
        return 0;
    },

    // Parse currency data from Altınkaynak array
    parseCurrencies(data) {
        // Data is the array itself
        const rawList = Array.isArray(data) ? data : [];
        const currencies = {};

        // Helper to find item by code
        const findItem = (code) => rawList.find(item => item.Kod === code);

        // USD
        const usd = findItem('USD');
        if (usd) {
            currencies.USD = {
                base: (this.parseTurkishNumber(usd.Alis) + this.parseTurkishNumber(usd.Satis)) / 2,
                buy: this.parseTurkishNumber(usd.Alis),
                sell: this.parseTurkishNumber(usd.Satis),
                change: 0, // Altınkaynak doesn't provide change % in this feed
                name: 'Amerikan Doları'
            };
        }

        // EUR
        const eur = findItem('EUR');
        if (eur) {
            currencies.EUR = {
                base: (this.parseTurkishNumber(eur.Alis) + this.parseTurkishNumber(eur.Satis)) / 2,
                buy: this.parseTurkishNumber(eur.Alis),
                sell: this.parseTurkishNumber(eur.Satis),
                change: 0,
                name: 'Euro'
            };
        }

        // GBP
        const gbp = findItem('GBP');
        if (gbp) {
            currencies.GBP = {
                base: (this.parseTurkishNumber(gbp.Alis) + this.parseTurkishNumber(gbp.Satis)) / 2,
                buy: this.parseTurkishNumber(gbp.Alis),
                sell: this.parseTurkishNumber(gbp.Satis),
                change: 0,
                name: 'İngiliz Sterlini'
            };
        }

        return currencies;
    },

    // Parse gold data from Altınkaynak array
    parseGold(data) {
        // Data is the array itself
        const rawList = Array.isArray(data) ? data : [];
        const gold = {};
        const findItem = (code) => rawList.find(item => item.Kod === code);

        // Gram Altın (GA)
        const gram = findItem('GA');
        if (gram) {
            gold.GRAM_GOLD = {
                base: (this.parseTurkishNumber(gram.Alis) + this.parseTurkishNumber(gram.Satis)) / 2,
                buy: this.parseTurkishNumber(gram.Alis),
                sell: this.parseTurkishNumber(gram.Satis),
                change: 0,
                name: 'Gram Altın'
            };
        }

        // Ons Altın (XAUUSD)
        const ons = findItem('XAUUSD');
        if (ons) {
            gold.OUNCE_GOLD = {
                base: (this.parseTurkishNumber(ons.Alis) + this.parseTurkishNumber(ons.Satis)) / 2,
                buy: this.parseTurkishNumber(ons.Alis),
                sell: this.parseTurkishNumber(ons.Satis),
                change: 0,
                name: 'Ons Altın'
            };
        }

        // Çeyrek Altın (C)
        const ceyrek = findItem('C');
        if (ceyrek) {
            gold.QUARTER_GOLD = {
                base: (this.parseTurkishNumber(ceyrek.Alis) + this.parseTurkishNumber(ceyrek.Satis)) / 2,
                buy: this.parseTurkishNumber(ceyrek.Alis),
                sell: this.parseTurkishNumber(ceyrek.Satis),
                change: 0,
                name: 'Çeyrek Altın'
            };
        }

        // Yarım Altın (Y)
        const yarim = findItem('Y');
        if (yarim) {
            gold.HALF_GOLD = {
                base: (this.parseTurkishNumber(yarim.Alis) + this.parseTurkishNumber(yarim.Satis)) / 2,
                buy: this.parseTurkishNumber(yarim.Alis),
                sell: this.parseTurkishNumber(yarim.Satis),
                change: 0,
                name: 'Yarım Altın'
            };
        }

        // Tam Altın (T - Teklik)
        const tam = findItem('T');
        if (tam) {
            gold.FULL_GOLD = {
                base: (this.parseTurkishNumber(tam.Alis) + this.parseTurkishNumber(tam.Satis)) / 2,
                buy: this.parseTurkishNumber(tam.Alis),
                sell: this.parseTurkishNumber(tam.Satis),
                change: 0,
                name: 'Tam Altın'
            };
        }

        // Cumhuriyet Altını (A - Ata Cumhuriyet)
        const ata = findItem('A');
        if (ata) {
            gold.REPUBLIC_GOLD = {
                base: (this.parseTurkishNumber(ata.Alis) + this.parseTurkishNumber(ata.Satis)) / 2,
                buy: this.parseTurkishNumber(ata.Alis),
                sell: this.parseTurkishNumber(ata.Satis),
                change: 0,
                name: 'Cumhuriyet Altını'
            };
        }

        return gold;
    }
};


// ============================================
// RATE CALCULATOR
// ============================================

const Calculator = {
    applySpread(rate, isBuy) {
        const spreadPercent = isBuy ? state.settings.buySpread : state.settings.sellSpread;
        const spread = rate * (spreadPercent / 100);
        return isBuy ? rate - spread : rate + spread;
    },

    calculateGoldPrices(goldOunceUSD, usdTryRate) {
        const goldOunceTRY = goldOunceUSD * usdTryRate;
        const gramGoldTRY = goldOunceTRY / CONFIG.gold.gramsPerOunce;

        return {
            GRAM_GOLD: {
                base: gramGoldTRY,
                buy: this.applySpread(gramGoldTRY * (1 + CONFIG.gold.wholesalePremium), true),
                sell: this.applySpread(gramGoldTRY * (1 + CONFIG.gold.wholesalePremium), false)
            },
            OUNCE_GOLD: {
                base: goldOunceUSD,
                buy: this.applySpread(goldOunceUSD, true),
                sell: this.applySpread(goldOunceUSD, false)
            },
            QUARTER_GOLD: {
                base: gramGoldTRY * CONFIG.gold.quarterMultiplier * (1 + CONFIG.gold.jewelryPremium),
                buy: this.applySpread(gramGoldTRY * CONFIG.gold.quarterMultiplier * (1 + CONFIG.gold.jewelryPremium), true),
                sell: this.applySpread(gramGoldTRY * CONFIG.gold.quarterMultiplier * (1 + CONFIG.gold.jewelryPremium), false)
            },
            HALF_GOLD: {
                base: gramGoldTRY * CONFIG.gold.halfMultiplier * (1 + CONFIG.gold.jewelryPremium),
                buy: this.applySpread(gramGoldTRY * CONFIG.gold.halfMultiplier * (1 + CONFIG.gold.jewelryPremium), true),
                sell: this.applySpread(gramGoldTRY * CONFIG.gold.halfMultiplier * (1 + CONFIG.gold.jewelryPremium), false)
            },
            FULL_GOLD: {
                base: gramGoldTRY * CONFIG.gold.fullMultiplier * (1 + CONFIG.gold.jewelryPremium),
                buy: this.applySpread(gramGoldTRY * CONFIG.gold.fullMultiplier * (1 + CONFIG.gold.jewelryPremium), true),
                sell: this.applySpread(gramGoldTRY * CONFIG.gold.fullMultiplier * (1 + CONFIG.gold.jewelryPremium), false)
            },
            REPUBLIC_GOLD: {
                base: gramGoldTRY * CONFIG.gold.fullMultiplier * (1 + CONFIG.gold.jewelryPremium + 0.02),
                buy: this.applySpread(gramGoldTRY * CONFIG.gold.fullMultiplier * (1 + CONFIG.gold.jewelryPremium + 0.02), true),
                sell: this.applySpread(gramGoldTRY * CONFIG.gold.fullMultiplier * (1 + CONFIG.gold.jewelryPremium + 0.02), false)
            }
        };
    },

    calculateCurrencyRates(exchangeRates) {
        const rates = {};

        CONFIG.currencies.forEach(currency => {
            const rate = exchangeRates[currency.code];
            if (rate) {
                rates[currency.code] = {
                    base: rate,
                    buy: this.applySpread(rate, true),
                    sell: this.applySpread(rate, false)
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
        DOM.loadingOverlay.classList.remove('hidden');
        state.isLoading = true;
    },

    hideLoading() {
        setTimeout(() => {
            DOM.loadingOverlay.classList.add('hidden');
            state.isLoading = false;
        }, 500);
    },

    updateMarketStatus() {
        state.isMarketOpen = Utils.isMarketOpen();
        const badge = DOM.marketStatus;

        if (state.isMarketOpen) {
            badge.classList.remove('closed');
            badge.querySelector('.status-text').textContent = 'Piyasalar Açık';
        } else {
            badge.classList.add('closed');
            badge.querySelector('.status-text').textContent = 'Piyasalar Kapalı';
        }
    },

    updateLastUpdate() {
        state.lastUpdate = new Date();
        const timeStr = Utils.formatTime(state.lastUpdate);
        DOM.lastUpdate.querySelector('.update-time').textContent = timeStr;
    },

    startRealTimeClock() {
        const updateClock = () => {
            if (DOM.realTimeClock) {
                const now = new Date();
                DOM.realTimeClock.textContent = Utils.formatTime(now);
            }
        };

        // Update immediately
        updateClock();
        // Update every second
        setInterval(updateClock, 1000);
    },

    createRateCard(item, rates, type, historyData) {
        // This function now returns the HTML string only for initial render
        const isEnabled = this.isItemEnabled(item.code, type);

        let change = 0;
        let direction = 'neutral';

        if (rates) {
            // Calculate change if not provided by API
            if (rates.change === 0 && state.previousRates[item.code]) {
                const prev = state.previousRates[item.code].base;
                const curr = rates.base;
                if (prev && curr) {
                    change = Utils.calculateChange(curr, prev);
                    direction = Utils.getChangeDirection(curr, prev);
                }
            } else {
                change = rates.change || 0;
                direction = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
            }
        }

        const sparklineData = historyData || Utils.generateSparklineData();
        const sparklineSVG = Utils.createSparklineSVG(sparklineData, direction);

        const cardClass = `rate-card fade-in ${!isEnabled ? 'disabled' : ''} ${state.isCachedData ? 'cached' : ''}`;
        const iconClass = type === 'currency' ? 'card-icon currency-icon' : 'card-icon';

        // Determine unit suffix and color class based on direction
        let unit = ' ₺';
        if (type === 'wholesaleGold' && item.code === 'OUNCE_GOLD') {
            unit = ' $';
        }

        const priceColorClass = direction === 'up' ? 'price-up' : direction === 'down' ? 'price-down' : 'price-neutral';

        return `
            <div class="${cardClass}" data-code="${item.code}" data-type="${type}" id="card-${item.code}">
                ${state.isCachedData ? '<div class="warning-badge">⚠️ Önbellek</div>' : ''}
                <div class="card-header">
                    <div class="card-title-section">
                        <span class="card-name">${item.name}</span>
                        <span class="card-pair">${item.code.replace('_', '/')}</span>
                    </div>
                    <div class="${iconClass}">${item.icon}</div>
                </div>
                <div class="prices-section">
                    <div class="price-box buy">
                        <span class="price-label">Alış</span>
                        <span class="price-value ${priceColorClass}" data-price="buy">${Utils.formatPrice(rates?.buy)}${unit}</span>
                    </div>
                    <div class="price-box sell">
                        <span class="price-label">Satış</span>
                        <span class="price-value ${priceColorClass}" data-price="sell">${Utils.formatPrice(rates?.sell)}${unit}</span>
                    </div>
                </div>
                <div class="change-section">
                    <div class="change-badge ${direction}" data-change-badge>
                        <span class="change-arrow">${direction === 'up' ? '↑' : direction === 'down' ? '↓' : '→'}</span>
                        <span class="change-value">${Utils.formatChange(change)}</span>
                    </div>
                    <div class="mini-chart-container">
                        ${sparklineSVG}
                    </div>
                </div>
            </div>
        `;
    },

    updateRateCard(item, rates, type) {
        const card = document.getElementById(`card-${item.code}`);
        if (!card) return false; // Card doesn't exist, need to re-render

        // Update Cache Warning
        const existingBadge = card.querySelector('.warning-badge');
        if (state.isCachedData && !existingBadge) {
            card.insertAdjacentHTML('afterbegin', '<div class="warning-badge">⚠️ Önbellek</div>');
            card.classList.add('cached');
        } else if (!state.isCachedData && existingBadge) {
            existingBadge.remove();
            card.classList.remove('cached');
        }

        // Calculate Change for Base Price (for general trend arrow)
        let change = 0;
        let direction = 'neutral';

        // Calculate Independent Changes for Buy and Sell
        let buyDirection = 'neutral';
        let sellDirection = 'neutral';

        // Flatten previous rates structure
        const prevRatesFlat = { ...state.previousRates.currencies, ...state.previousRates.gold };
        const prevRate = prevRatesFlat[item.code];

        if (rates && prevRate) {
            const curr = rates.base;
            const prev = prevRate.base;

            const currBuy = rates.buy;
            const prevBuy = prevRate.buy;

            const currSell = rates.sell;
            const prevSell = prevRate.sell;

            // Base Change (Average)
            if (curr !== prev) {
                change = Utils.calculateChange(curr, prev);
                direction = Utils.getChangeDirection(curr, prev);
            }

            // Buy Price Change
            if (currBuy !== prevBuy) {
                buyDirection = Utils.getChangeDirection(currBuy, prevBuy);
            }

            // Sell Price Change
            if (currSell !== prevSell) {
                sellDirection = Utils.getChangeDirection(currSell, prevSell);
            }

            // Trigger flash animation if ANY price changed
            if (direction !== 'neutral' || buyDirection !== 'neutral' || sellDirection !== 'neutral') {
                // Use the primary direction for the flash color
                const flashDir = direction !== 'neutral' ? direction : (buyDirection !== 'neutral' ? buyDirection : sellDirection);
                this.animatePriceChange(card, flashDir);
            }
        }

        // Update Prices with independent dynamic colors
        const buyEl = card.querySelector('[data-price="buy"]');
        const sellEl = card.querySelector('[data-price="sell"]');

        const buyColorClass = buyDirection === 'up' ? 'price-up' : buyDirection === 'down' ? 'price-down' : 'price-neutral';
        const sellColorClass = sellDirection === 'up' ? 'price-up' : sellDirection === 'down' ? 'price-down' : 'price-neutral';

        if (buyEl) {
            buyEl.textContent = `${Utils.formatPrice(rates?.buy)} ₺`;
            // Only update class if direction changed from neutral? 
            // Better to always update to reflect current state relative to previous fetch
            buyEl.classList.remove('price-up', 'price-down', 'price-neutral');
            buyEl.classList.add(buyColorClass);
        }

        if (sellEl) {
            sellEl.textContent = `${Utils.formatPrice(rates?.sell)} ₺`;
            sellEl.classList.remove('price-up', 'price-down', 'price-neutral');
            sellEl.classList.add(sellColorClass);
        }

        // Update Unit for Ounce if needed
        if (type === 'wholesaleGold' && item.code === 'OUNCE_GOLD') {
            if (buyEl) buyEl.textContent = `${Utils.formatPrice(rates?.buy)} $`;
            if (sellEl) sellEl.textContent = `${Utils.formatPrice(rates?.sell)} $`;
        }

        // Update Change Badge
        const badge = card.querySelector('[data-change-badge]');
        if (badge && direction !== 'neutral') {
            badge.className = `change-badge ${direction}`;
            badge.querySelector('.change-arrow').textContent = direction === 'up' ? '↑' : direction === 'down' ? '↓' : '→';
            badge.querySelector('.change-value').textContent = Utils.formatChange(change);
        }

        return true; // Updated successfully
    },

    renderCurrencyCards() {
        // On first render, clear skeletons
        const hasSkeletons = DOM.currencyGrid.querySelector('.skeleton');
        if (hasSkeletons) {
            DOM.currencyGrid.innerHTML = '';
        }

        // Intelligent Render
        CONFIG.currencies.forEach(currency => {
            const rates = state.rates.currencies[currency.code];
            const updated = this.updateRateCard(currency, rates, 'currency');

            if (!updated) {
                // Initial render or card missing
                const html = this.createRateCard(currency, rates, 'currency');
                const temp = document.createElement('div');
                temp.innerHTML = html;
                DOM.currencyGrid.appendChild(temp.firstElementChild);
            }
        });

        // Attach listeners only on initial render
        if (hasSkeletons) {
            this.attachCardListeners(DOM.currencyGrid);
        }
    },

    renderWholesaleGoldCards() {
        const hasSkeletons = DOM.wholesaleGoldGrid.querySelector('.skeleton');
        if (hasSkeletons) {
            DOM.wholesaleGoldGrid.innerHTML = '';
        }

        CONFIG.wholesaleGold.forEach(gold => {
            const rates = state.rates.gold[gold.code];
            const updated = this.updateRateCard(gold, rates, 'wholesaleGold');
            if (!updated) {
                const html = this.createRateCard(gold, rates, 'wholesaleGold');
                const temp = document.createElement('div');
                temp.innerHTML = html;
                DOM.wholesaleGoldGrid.appendChild(temp.firstElementChild);
            }
        });

        if (hasSkeletons) {
            this.attachCardListeners(DOM.wholesaleGoldGrid);
        }
    },

    renderRetailGoldCards() {
        const hasSkeletons = DOM.retailGoldGrid.querySelector('.skeleton');
        if (hasSkeletons) {
            DOM.retailGoldGrid.innerHTML = '';
        }

        CONFIG.retailGold.forEach(gold => {
            const rates = state.rates.gold[gold.code];
            const updated = this.updateRateCard(gold, rates, 'retailGold');
            if (!updated) {
                const html = this.createRateCard(gold, rates, 'retailGold');
                const temp = document.createElement('div');
                temp.innerHTML = html;
                DOM.retailGoldGrid.appendChild(temp.firstElementChild);
            }
        });

        if (hasSkeletons) {
            this.attachCardListeners(DOM.retailGoldGrid);
        }
    },

    renderSkeletonCards(container, count) {
        let html = '';
        for (let i = 0; i < count; i++) {
            html += `
                <div class="rate-card skeleton fade-in">
                    <div class="card-header">
                        <div class="card-title-section">
                            <div class="skeleton-line" style="width: 100px; height: 20px;"></div>
                            <div class="skeleton-line" style="width: 60px; height: 14px; margin-top: 8px;"></div>
                        </div>
                        <div class="skeleton-line" style="width: 48px; height: 48px; border-radius: 12px;"></div>
                    </div>
                    <div class="prices-section">
                        <div class="price-box">
                            <div class="skeleton-line" style="width: 40px; height: 12px;"></div>
                            <div class="skeleton-line" style="width: 80px; height: 24px; margin-top: 8px;"></div>
                        </div>
                        <div class="price-box">
                            <div class="skeleton-line" style="width: 40px; height: 12px;"></div>
                            <div class="skeleton-line" style="width: 80px; height: 24px; margin-top: 8px;"></div>
                        </div>
                    </div>
                    <div class="change-section">
                        <div class="skeleton-line" style="width: 70px; height: 28px; border-radius: 14px;"></div>
                        <div class="skeleton-line" style="width: 70px; height: 30px;"></div>
                    </div>
                </div>
            `;
        }
        container.innerHTML = html;
    },

    isItemEnabled(code, type) {
        let settings;
        switch (type) {
            case 'currency':
                settings = state.settings.currencies;
                break;
            case 'wholesaleGold':
                settings = state.settings.wholesaleGold;
                break;
            case 'retailGold':
                settings = state.settings.retailGold;
                break;
            default:
                return true;
        }
        const item = settings.find(s => s.code === code);
        return item ? item.enabled : true;
    },

    attachCardListeners(container) {
        container.querySelectorAll('.rate-card:not(.skeleton):not(.disabled)').forEach(card => {
            card.addEventListener('click', () => {
                const code = card.dataset.code;
                const type = card.dataset.type;
                this.showDetailChart(code, type);
            });
        });
    },

    showDetailChart(code, type) {
        // Find item info
        let item;
        let rates;

        switch (type) {
            case 'currency':
                item = CONFIG.currencies.find(c => c.code === code);
                rates = state.rates.currencies[code];
                break;
            case 'wholesaleGold':
                item = CONFIG.wholesaleGold.find(g => g.code === code);
                rates = state.rates.gold[code];
                break;
            case 'retailGold':
                item = CONFIG.retailGold.find(g => g.code === code);
                rates = state.rates.gold[code];
                break;
        }

        if (!item) return;

        DOM.modalTitle.textContent = `${item.name} - 24 Saatlik Grafik`;
        DOM.chartModal.classList.add('active');

        // Generate 24-hour chart data
        this.createDetailChart(code, item.name);
    },

    createDetailChart(code, name) {
        const ctx = DOM.detailChartCanvas.getContext('2d');

        // Check if we already have generated/cached chart data for this session
        if (!state.chartCache) {
            state.chartCache = {};
        }

        let labels, data;

        if (state.chartCache[code]) {
            // Use cached data
            labels = state.chartCache[code].labels;
            data = state.chartCache[code].data;
        } else {
            // Generate sample 24-hour data ONLY if not cached
            labels = [];
            data = [];
            let baseValue = state.rates.currencies[code]?.base || state.rates.gold[code]?.base || 100;

            for (let i = 24; i >= 0; i--) {
                const time = new Date();
                time.setHours(time.getHours() - i);
                labels.push(time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));

                // Generate realistic looking price movements
                baseValue = baseValue * (1 + (Math.random() - 0.5) * 0.01);
                data.push(baseValue);
            }

            // Cache the generated data
            state.chartCache[code] = { labels, data };
        }

        // Destroy existing chart
        if (state.detailChart) {
            state.detailChart.destroy();
        }

        const isDark = document.documentElement.dataset.theme === 'dark';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const textColor = isDark ? '#94a3b8' : '#64748b';

        state.detailChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: name,
                    data: data,
                    borderColor: '#d4a520',
                    backgroundColor: 'rgba(212, 165, 32, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: '#d4a520',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        titleColor: textColor,
                        bodyColor: isDark ? '#f1f5f9' : '#0f172a',
                        borderColor: '#d4a520',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: function (context) {
                                return Utils.formatPrice(context.parsed.y) + ' ₺';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: gridColor,
                            drawBorder: false
                        },
                        ticks: {
                            color: textColor,
                            maxTicksLimit: 8
                        }
                    },
                    y: {
                        grid: {
                            color: gridColor,
                            drawBorder: false
                        },
                        ticks: {
                            color: textColor,
                            callback: function (value) {
                                return Utils.formatPrice(value);
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    },

    closeModal(modal) {
        modal.classList.remove('active');
    },

    renderAdminToggles() {
        // Currency toggles
        let currencyHtml = '';
        CONFIG.currencies.forEach(currency => {
            const setting = state.settings.currencies.find(c => c.code === currency.code);
            currencyHtml += `
                <div class="toggle-item">
                    <label>${currency.icon} ${currency.name}</label>
                    <div class="toggle-switch">
                        <input type="checkbox" id="toggle-${currency.code}" ${setting?.enabled ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </div>
                </div>
            `;
        });
        DOM.currencyToggles.innerHTML = currencyHtml;

        // Gold toggles
        let goldHtml = '';
        [...CONFIG.wholesaleGold, ...CONFIG.retailGold].forEach(gold => {
            const wSetting = state.settings.wholesaleGold.find(g => g.code === gold.code);
            const rSetting = state.settings.retailGold.find(g => g.code === gold.code);
            const setting = wSetting || rSetting;

            goldHtml += `
                <div class="toggle-item">
                    <label>${gold.icon} ${gold.name}</label>
                    <div class="toggle-switch">
                        <input type="checkbox" id="toggle-${gold.code}" ${setting?.enabled ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </div>
                </div>
            `;
        });
        DOM.goldToggles.innerHTML = goldHtml;
    },

    showToast(message, type = 'success') {
        // Remove existing toast
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

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    animatePriceChange(card, direction) {
        if (direction === 'neutral') return;

        const className = direction === 'up' ? 'price-flash-up' : 'price-flash-down';
        card.classList.add(className);

        setTimeout(() => {
            card.classList.remove(className);
        }, 500);
    }
};

// ============================================
// THEME MANAGEMENT
// ============================================

const Theme = {
    init() {
        const savedTheme = Utils.loadFromLocalStorage('theme') || 'light';
        this.setTheme(savedTheme);
    },

    toggle() {
        const currentTheme = document.documentElement.dataset.theme;
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    },

    setTheme(theme) {
        document.documentElement.dataset.theme = theme;
        Utils.saveToLocalStorage('theme', theme);

        // Update chart if exists
        if (state.detailChart) {
            state.detailChart.destroy();
        }
    }
};

// ============================================
// DATA MANAGEMENT
// ============================================

const DataManager = {
    async fetchAllData() {
        try {
            // Flatten current rates to store as previous before updating
            const currentFlat = {
                ...state.rates.currencies,
                ...state.rates.gold
            };

            // Only update previousRates if we actually have data
            if (Object.keys(currentFlat).length > 0) {
                state.previousRates = {
                    currencies: JSON.parse(JSON.stringify(state.rates.currencies)),
                    gold: JSON.parse(JSON.stringify(state.rates.gold))
                };
            }

            // Fetch all data from API
            const result = await API.fetchAllData();

            if (!result.success) {
                // Fetch failed. Check if we have existing data and how old it is.
                const lastUpdate = state.lastUpdate ? new Date(state.lastUpdate).getTime() : 0;
                const now = new Date().getTime();
                const isStale = (now - lastUpdate) > (5 * 60 * 1000); // 5 minutes threshold

                if (Object.keys(state.rates.currencies).length === 0) {
                    throw new Error(result.error || 'API fetch failed and no cache');
                }

                // If data is stale, show warning. If it's fresh enough, just silent fail.
                state.isCachedData = isStale;
                if (isStale) {
                    console.warn('Data is stale, showing warning');
                } else {
                    console.log('API failed but data is fresh, skipping update cleanly');
                }

                return false;
            }

            // Success! Parse new data
            const newCurrencies = API.parseCurrencies(result.data.currency);
            const newGold = API.parseGold(result.data.gold);

            // Update State
            state.rates.currencies = newCurrencies;
            state.rates.gold = newGold;

            // Update timestamps
            state.lastUpdate = result.timestamp;

            // Update history
            this.updateHistory();

            // Data is live and fresh
            state.isCachedData = false;

            // Save to cache
            Utils.saveToLocalStorage('cachedRates', {
                currencies: state.rates.currencies,
                gold: state.rates.gold,
                timestamp: result.timestamp
            });

            console.log('✅ Data updated:', result.timestamp);
            return true;
        } catch (error) {
            console.error('Data fetch error:', error);

            // Try to load from cache
            const cached = Utils.loadFromLocalStorage('cachedRates');
            if (cached) {
                state.rates.currencies = cached.currencies;
                state.rates.gold = cached.gold;
                state.lastUpdate = cached.timestamp;

                // Always mark loaded attributes from disk as cached initially
                state.isCachedData = true;
                return true;
            }

            return false;
        }
    },

    updateHistory() {
        // Update currency history
        Object.keys(state.rates.currencies).forEach(code => {
            if (!state.history.currencies[code]) {
                state.history.currencies[code] = [];
            }
            state.history.currencies[code].push(state.rates.currencies[code].base);

            // Keep only last 24 data points
            if (state.history.currencies[code].length > 24) {
                state.history.currencies[code].shift();
            }
        });

        // Update gold history
        Object.keys(state.rates.gold).forEach(code => {
            if (!state.history.gold[code]) {
                state.history.gold[code] = [];
            }
            state.history.gold[code].push(state.rates.gold[code].base);

            // Keep only last 24 data points
            if (state.history.gold[code].length > 24) {
                state.history.gold[code].shift();
            }
        });
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
        UI.updateMarketStatus();
        UI.updateLastUpdate();
        UI.renderCurrencyCards();
        UI.renderWholesaleGoldCards();
        UI.renderRetailGoldCards();
    }
};

// ============================================
// ADMIN PANEL
// ============================================

const Admin = {
    login(username, password) {
        if (username === CONFIG.admin.username && password === CONFIG.admin.password) {
            state.isLoggedIn = true;
            DOM.adminLogin.style.display = 'none';
            DOM.adminPanel.style.display = 'block';
            this.loadSettings();
            UI.showToast('Giriş başarılı!', 'success');
            return true;
        }
        UI.showToast('Hatalı kullanıcı adı veya şifre!', 'error');
        return false;
    },

    logout() {
        state.isLoggedIn = false;
        DOM.adminLogin.style.display = 'block';
        DOM.adminPanel.style.display = 'none';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    },

    loadSettings() {
        // Load saved settings
        const savedSettings = Utils.loadFromLocalStorage('adminSettings');
        if (savedSettings) {
            state.settings = { ...state.settings, ...savedSettings };
        }

        // Update UI
        DOM.buySpread.value = state.settings.buySpread;
        DOM.sellSpread.value = state.settings.sellSpread;
        DOM.refreshInterval.value = state.settings.refreshInterval;
        DOM.intervalValue.textContent = `${state.settings.refreshInterval}s`;

        UI.renderAdminToggles();
    },

    saveSettings() {
        // Collect settings
        state.settings.buySpread = parseFloat(DOM.buySpread.value) || CONFIG.defaults.buySpread;
        state.settings.sellSpread = parseFloat(DOM.sellSpread.value) || CONFIG.defaults.sellSpread;
        state.settings.refreshInterval = parseInt(DOM.refreshInterval.value) || CONFIG.defaults.refreshInterval;

        // Collect currency toggles
        CONFIG.currencies.forEach(currency => {
            const toggle = document.getElementById(`toggle-${currency.code}`);
            const setting = state.settings.currencies.find(c => c.code === currency.code);
            if (setting && toggle) {
                setting.enabled = toggle.checked;
            }
        });

        // Collect gold toggles
        [...CONFIG.wholesaleGold, ...CONFIG.retailGold].forEach(gold => {
            const toggle = document.getElementById(`toggle-${gold.code}`);

            const wSetting = state.settings.wholesaleGold.find(g => g.code === gold.code);
            if (wSetting && toggle) {
                wSetting.enabled = toggle.checked;
            }

            const rSetting = state.settings.retailGold.find(g => g.code === gold.code);
            if (rSetting && toggle) {
                rSetting.enabled = toggle.checked;
            }
        });

        // Save to localStorage
        Utils.saveToLocalStorage('adminSettings', state.settings);

        // Restart auto refresh with new interval
        DataManager.startAutoRefresh();

        // Re-render cards
        DataManager.updateUI();

        UI.showToast('Ayarlar kaydedildi!', 'success');
    }
};

// ============================================
// EVENT LISTENERS
// ============================================

const EventListeners = {
    init() {
        // Theme toggle
        DOM.themeToggle.addEventListener('click', () => Theme.toggle());

        // Admin button
        DOM.adminBtn.addEventListener('click', () => {
            DOM.adminModal.classList.add('active');
            Admin.loadSettings();
        });

        // Modal close buttons
        DOM.modalClose.addEventListener('click', () => UI.closeModal(DOM.chartModal));
        DOM.adminModalClose.addEventListener('click', () => UI.closeModal(DOM.adminModal));

        // Close modals on backdrop click
        [DOM.chartModal, DOM.adminModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) UI.closeModal(modal);
            });
        });

        // Close modals on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                UI.closeModal(DOM.chartModal);
                UI.closeModal(DOM.adminModal);
            }
        });

        // Login form
        DOM.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            Admin.login(username, password);
        });

        // Admin panel controls
        DOM.refreshInterval.addEventListener('input', (e) => {
            DOM.intervalValue.textContent = `${e.target.value}s`;
        });

        DOM.saveSettings.addEventListener('click', () => Admin.saveSettings());
        DOM.logoutBtn.addEventListener('click', () => Admin.logout());
    }
};

// ============================================
// INITIALIZATION
// ============================================

async function init() {
    console.log('🚀 AltınSarraf Dashboard Starting...');

    // Initialize theme
    Theme.init();

    // Start real-time clock
    UI.startRealTimeClock();

    // Show loading state
    UI.showLoading();

    // Render skeleton cards
    UI.renderSkeletonCards(DOM.currencyGrid, 3);
    UI.renderSkeletonCards(DOM.wholesaleGoldGrid, 2);
    UI.renderSkeletonCards(DOM.retailGoldGrid, 4);

    // Load saved settings
    const savedSettings = Utils.loadFromLocalStorage('adminSettings');
    if (savedSettings) {
        state.settings = { ...state.settings, ...savedSettings };
    }

    // Setup event listeners
    EventListeners.init();

    // Fetch initial data
    await DataManager.fetchAllData();

    // Update UI
    DataManager.updateUI();

    // Start auto refresh
    DataManager.startAutoRefresh();

    // Hide loading
    UI.hideLoading();

    console.log('✅ AltınSarraf Dashboard Ready!');
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
