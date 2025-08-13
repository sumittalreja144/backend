import express from "express";
import multer from "multer";
import { Resend } from "resend";

const app = express();
const upload = multer({ dest: "uploads/" });
const resend = new Resend(process.env.RESEND_API_KEY);

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
    res.json({ status: "ok" });
});

export default app;
