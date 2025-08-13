import express from "express";
import multer from "multer";
import { Resend } from "resend";

const app = express();
const upload = multer({ dest: "uploads/" });
const resend = new Resend(process.env.RESEND_API_KEY);

// Add CORS headers for cross-origin requests
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/contact", upload.fields([
    { name: "lightBill", maxCount: 1 },
    { name: "locationPhoto", maxCount: 1 }
]), async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const lightBill = req.files["lightBill"]?.[0];
        const locationPhoto = req.files["locationPhoto"]?.[0];

        // Prepare attachments
        const attachments = [];
        if (lightBill) {
            attachments.push({
                filename: lightBill.originalname,
                path: lightBill.path
            });
        }
        if (locationPhoto) {
            attachments.push({
                filename: locationPhoto.originalname,
                path: locationPhoto.path
            });
        }

        await resend.emails.send({
            from: "no-reply@yourdomain.com",
            to: "shriramsolar3@gmail.com",
            subject: "New Contact Form Submission",
            html: `<p>Name: ${name}</p><p>Email: ${email}</p><p>Message: ${message}</p>`
            // Attachments are not supported directly by Resend as of now
        });

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
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
    res.json({ message: "Solar Site Backend API", status: "running" });
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

// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export as serverless function for Vercel
export default app;
