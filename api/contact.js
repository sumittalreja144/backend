import multer from "multer";
import { Resend } from "resend";
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

// Configure multer for serverless
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});

const resend = new Resend(process.env.RESEND_API_KEY);

export default function handler(req, res) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', 'https://www.shriramsolar.co.in, http://localhost:5173, http://localhost:3000');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        return res.status(200).end();
    }

    // Apply CORS
    corsHandler(req, res, () => {
        if (req.method !== 'POST') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }

        // Handle multipart form data
        upload.fields([
            { name: "lightBill", maxCount: 1 },
            { name: "locationPhoto", maxCount: 1 }
        ])(req, res, async (err) => {
            if (err) {
                console.error('Multer error:', err);
                return res.status(400).json({ error: 'File upload error: ' + err.message });
            }

            try {
                const { name, email, message } = req.body;

                if (!name || !email || !message) {
                    return res.status(400).json({ error: 'Missing required fields' });
                }

                if (!process.env.RESEND_API_KEY) {
                    console.error('RESEND_API_KEY not found');
                    return res.status(500).json({ error: 'Email service not configured' });
                }

                const lightBill = req.files["lightBill"]?.[0];
                const locationPhoto = req.files["locationPhoto"]?.[0];

                let attachmentInfo = '';
                if (lightBill) {
                    attachmentInfo += `<p>Light Bill: ${lightBill.originalname} (${lightBill.size} bytes)</p>`;
                }
                if (locationPhoto) {
                    attachmentInfo += `<p>Location Photo: ${locationPhoto.originalname} (${locationPhoto.size} bytes)</p>`;
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
    });
}

export const config = {
    api: {
        bodyParser: false,
    },
};
