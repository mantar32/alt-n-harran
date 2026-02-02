# AltınSarraf - Canlı Döviz & Altın Kurları Paneli

Modern, responsive bir finansal dashboard uygulaması. Canlı döviz kurları ve altın fiyatlarını takip edin.

![Dashboard Preview](preview.png)

## 🌟 Özellikler

### Döviz Kurları
- USD/TRY, EUR/TRY, GBP/TRY canlı kurları
- Alış ve satış fiyatları
- Anlık değişim yüzdesi
- Mini sparkline grafikleri

### Altın Fiyatları
- **Toptan:** Gram Altın, Ons Altın
- **Perakende:** Çeyrek, Yarım, Tam ve Cumhuriyet Altını
- Ayarlanabilir spread (alış/satış marjı)

### Kullanıcı Arayüzü
- 🌓 Açık/Koyu tema desteği
- 📱 Mobile-first responsive tasarım
- 📈 24 saatlik detaylı grafikler
- ⚡ Otomatik yenileme (10-60 saniye)
- 🔔 Fiyat değişimi animasyonları

### Admin Paneli
- 🔐 Şifre korumalı erişim
- 📊 Spread ayarları (alış/satış marjı)
- ⏱️ Yenileme aralığı ayarı
- 💱 Döviz görünürlük kontrolü
- 🥇 Altın görünürlük kontrolü

## 🚀 Kurulum

### 1. Dosyaları İndirin

```bash
git clone <repository-url>
cd altın-sarraf
```

### 2. Yerel Sunucu ile Çalıştırın

Python ile:
```bash
python -m http.server 8080
```

Node.js ile:
```bash
npx serve
```

Veya VS Code ile Live Server eklentisini kullanın.

### 3. Tarayıcıda Açın

```
http://localhost:8080
```

## 📁 Dosya Yapısı

```
altın-sarraf/
├── index.html      # Ana HTML dosyası
├── styles.css      # CSS stilleri ve tema değişkenleri
├── app.js          # JavaScript uygulaması
├── .env.example    # Örnek ortam değişkenleri
└── README.md       # Bu dosya
```

## ⚙️ Yapılandırma

### API Kaynakları

Uygulama şu ücretsiz API'leri kullanır:
- **Döviz Kurları:** [Frankfurter API](https://www.frankfurter.app/)
- **Altın Fiyatları:** Hesaplama bazlı (simülasyon)

### Admin Girişi

- **Kullanıcı Adı:** admin
- **Şifre:** admin123

> ⚠️ Üretim ortamında güvenli kimlik doğrulama kullanın!

### Spread Ayarları

Admin panelinden alış ve satış spread'lerini ayarlayabilirsiniz:
- **Alış Spread:** API fiyatından düşürülecek yüzde
- **Satış Spread:** API fiyatına eklenecek yüzde

## 🎨 Özelleştirme

### Tema Renkleri

`styles.css` dosyasındaki CSS değişkenlerini düzenleyerek renkleri özelleştirebilirsiniz:

```css
:root {
    --accent-gold: #d4a520;
    --accent-blue: #3b82f6;
    --success: #10b981;
    --danger: #ef4444;
}
```

### Yeni Döviz Ekleme

`app.js` dosyasındaki `CONFIG.currencies` dizisine yeni döviz ekleyin:

```javascript
currencies: [
    { code: 'USD', name: 'Amerikan Doları', symbol: '$', icon: '🇺🇸', enabled: true },
    // Yeni döviz ekle
    { code: 'CHF', name: 'İsviçre Frangı', symbol: 'CHF', icon: '🇨🇭', enabled: true },
]
```

## 📊 Teknik Detaylar

### Kullanılan Teknolojiler

- **HTML5** - Semantik yapı
- **CSS3** - Modern stil ve animasyonlar
- **Vanilla JavaScript** - ES6+ özellikleri
- **Chart.js** - Grafik görselleştirme
- **LocalStorage** - Ayarları kaydetme

### Performans Optimizasyonları

- API yanıtları önbelleğe alınır
- Skeleton loading ekranları
- Debounce ile optimize edilmiş event handler'lar
- CSS animasyonları için GPU ivmesi

### Tarayıcı Desteği

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📝 Notlar

- Veriler yalnızca bilgilendirme amaçlıdır
- Yatırım tavsiyesi değildir
- Gerçek işlemler için güncel kurları doğrulayın

## 🔒 Güvenlik

- Admin kimlik bilgilerini `.env` dosyasında saklayın
- Üretim ortamında HTTPS kullanın
- API anahtarlarını istemci tarafında ifşa etmeyin

## 📄 Lisans

MIT License - Özgürce kullanabilirsiniz.

---

**Geliştirici:** AltınSarraf Team  
**Sürüm:** 1.0.0  
**Son Güncelleme:** 2024
