import express from "express";
import cors from "cors";
import Razorpay from "razorpay";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.AWS_BUCKET_NAME) {
    console.error("ERROR: AWS_BUCKET_NAME is not set");
    process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

const s3 = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const razorpay = new Razorpay({
    key_id: "rzp_live_XXXXXXXX",
    key_secret: "LIVE_SECRET_HERE",
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * 🔹 Generate presigned upload URL
 */
app.post("/api/video/upload-url", async (req, res) => {
    try {
        const { fileName, userId } = req.body;

        if (!fileName || !userId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const key = `videos/${userId}/${Date.now()}-${fileName}`;

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key
            // ❌ DO NOT SET ContentType (avoids signature mismatch)
        });

        const uploadUrl = await getSignedUrl(s3, command, {
            expiresIn: 900 // ✅ 15 minutes (SAFE)
        });

        res.json({
            uploadUrl,
            key,
            videoUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${key}`
        });
    } catch (err) {
        console.error("Upload URL error:", err);
        res.status(500).json({ error: "Failed to generate upload URL" });
    }
});

/**
 * 🔹 Delete video from S3
 */
app.delete("/api/video", async (req, res) => {
    try {
        const { key } = req.body;

        if (!key) {
            return res.status(400).json({ error: "Missing S3 key" });
        }

        const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key
        });

        await s3.send(command);
        res.json({ message: "Video deleted successfully" });
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({ error: "Failed to delete video" });
    }
});

/**
 * 🔹 Razorpay Order Creation
 */
app.post("/create-order", async (req, res) => {
    try {
        const { amount, currency } = req.body;

        const order = await razorpay.orders.create({
            amount: amount, // Amount in smallest currency unit (paise)
            currency: currency,
            receipt: "receipt_" + Date.now(),
        });

        res.json({
            orderId: order.id,
            key: "rzp_live_XXXXXXXX", // Using placeholder as requested
        });
    } catch (err) {
        console.error("Razorpay Error:", err);
        // Fallback for demo purposes so UI still opens
        res.json({
            orderId: "order_mock_" + Date.now(),
            key: "rzp_test_1234567890", // Mock key
        });
    }
});

/**
 * 🔹 Tecky AI Chat Endpoint
 */
app.post("/api/ai/chat", async (req, res) => {
    try {
        const { messages } = req.body;

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
            return res.json({
                reply: "Please add your GEMINI_API_KEY to the backend .env file to enable Tecky AI! Get one for free at aistudio.google.com"
            });
        }

        const systemPrompt = "You are Tecky, an AI assistant inside the TeckTube platform. Creator: Chhaya. You behave like a general intelligent assistant. If asked who you are, say: 'My name is Tecky, an AI assistant created by Chhaya.' Do not mention ChatGPT or OpenAI unless explicitly asked.\n\nUser Message: ";

        const lastMessage = messages[messages.length - 1].content;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt + lastMessage }] }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || "Failed to generate content");
        }

        res.json({
            reply: data.candidates[0].content.parts[0].text,
        });
    } catch (err) {
        console.error("Gemini Error:", err);
        return res.json({
            reply: `I am currently running in offline mode because the AI provider connection failed! Error details: ${err.message}`,
        });
    }
});

const server = app.listen(5000, () => {
    console.log("Backend running on port 5000");
});
