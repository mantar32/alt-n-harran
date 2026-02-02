export default async function handler(req, res) {
    const { type } = req.query;

    const endpoints = {
        currency: 'https://static.altinkaynak.com/public/Currency',
        gold: 'https://static.altinkaynak.com/public/Gold'
    };

    if (!endpoints[type]) {
        return res.status(400).json({ error: 'Invalid type parameter. Use "currency" or "gold".' });
    }

    try {
        const response = await fetch(`${endpoints[type]}?_=${Date.now()}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.altinkaynak.com/',
                'Origin': 'https://www.altinkaynak.com'
            }
        });

        if (!response.ok) {
            throw new Error(`Upstream API failed with status: ${response.status}`);
        }

        const data = await response.json();

        // Set CORS headers to allow requests from anywhere (or restrict to your domain)
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
        res.setHeader(
            'Access-Control-Allow-Headers',
            'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
        );

        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).json({ error: error.message });
    }
}
