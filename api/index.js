import cors from 'cors';

// Configure CORS
const corsHandler = cors();

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
