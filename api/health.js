import cors from 'cors';

// Configure CORS
const corsHandler = cors({
    origin: '*', // In production, specify your domain
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
    });
}
