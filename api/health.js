export default function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        res.status(200).json({
            status: "ok",
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'production',
            method: req.method,
            url: req.url
        });
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
}
