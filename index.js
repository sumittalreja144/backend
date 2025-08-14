import express from "express";
import multer from "multer";
import { Resend } from "resend";
import cors from "cors";

const app = express();

// Configure multer for serverless (memory storage only)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});

// Initialize Resend only if API key is available
let resend = null;
if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
} else {
    console.warn('Warning: RESEND_API_KEY not found. Email functionality will be disabled.');
}

// Configure CORS with specific origins
const corsOptions = {
    origin: [
        'https://www.shriramsolar.co.in',
        'http://localhost:5173',
        'http://localhost:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/contact", upload.fields([
    { name: "lightBill", maxCount: 1 },
    { name: "locationPhoto", maxCount: 1 }
]), async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!resend) {
            console.error('RESEND_API_KEY not configured');
            return res.status(500).json({ error: 'Email service not configured' });
        }

        const lightBill = req.files["lightBill"]?.[0];
        const locationPhoto = req.files["locationPhoto"]?.[0];

        let attachmentInfo = '';
        if (lightBill) {
            attachmentInfo += `<p>Light Bill: ${lightBill.originalname} (${(lightBill.size / 1024).toFixed(2)} KB)</p>`;
        }
        if (locationPhoto) {
            attachmentInfo += `<p>Location Photo: ${locationPhoto.originalname} (${(locationPhoto.size / 1024).toFixed(2)} KB)</p>`;
        }

        await resend.emails.send({
            from: "no-reply@yourdomain.com",
            to: "shriramsolar3@gmail.com",
            subject: "New Contact Form Submission",
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong> ${message}</p>
                ${attachmentInfo}
                <p><em>Note: File attachments were received but not included in this email.</em></p>
            `
        });

        res.status(200).json({
            success: true,
            message: 'Email sent successfully'
        });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            error: 'Failed to send email',
            details: error.message
        });
    }
});

app.get("/api/health", (req, res) => {
    try {
        res.status(200).json({
            status: "ok",
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
});

// Add a root endpoint
app.get("/", (req, res) => {
    res.json({
        message: "Solar Site Backend API",
        status: "running",
        timestamp: new Date().toISOString(),
        endpoints: [
            "GET /api/health - Health check",
            "POST /api/contact - Contact form submission"
        ]
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Only start server in local development
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log('Available endpoints:');
        console.log('  GET  / - API information');
        console.log('  GET  /api/health - Health check');
        console.log('  POST /api/contact - Contact form');
    });
}

// Export as serverless function for Vercel
export default app;
