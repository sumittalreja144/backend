import cors from 'cors';

// Configure CORS
const corsHandler = cors({
    origin: 'https://www.shriramsolar.co.in', // In production, specify your domain
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
});

export default function handler(req, res) {
    // Apply CORS
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
