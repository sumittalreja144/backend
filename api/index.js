import cors from 'cors';

// Configure CORS for specific origins
const corsHandler = cors({
    origin: [
        'https://www.shriramsolar.co.in',
        'http://localhost:5173',
        'http://localhost:3000'
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
});

export default function handler(req, res) {
    // Handle CORS manually for better control
    const origin = req.headers.origin;
    const allowedOrigins = [
        'https://www.shriramsolar.co.in',
        'http://localhost:5173',
        'http://localhost:3000'
    ];

    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Apply CORS middleware as backup
    corsHandler(req, res, () => {
        if (req.method !== 'GET') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }

        res.status(200).json({
            message: "Solar Site Backend API",
            status: "running",
            timestamp: new Date().toISOString(),
            endpoints: [
                "GET /api/health - Health check",
                "POST /api/contact - Contact form submission"
            ]
        });
    });
}
