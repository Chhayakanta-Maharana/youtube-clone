import express from "express";
import cors from "cors";
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    ListObjectsV2Command
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GoogleGenerativeAI } from "@google/generative-ai";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

const BUCKET = process.env.AWS_BUCKET_NAME;
const REGION = process.env.AWS_REGION || "us-east-1";
const META_KEY = "metadata.json";

if (!BUCKET) {
    console.error("ERROR: AWS_BUCKET_NAME is not set in .env");
    process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const upload = multer({ storage: multer.memoryStorage() });

const s3 = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const USER_META_KEY = "users.json";

// ─── Metadata helpers (stored as metadata.json in root of S3 bucket) ──────────
async function readMeta(key = META_KEY) {
    try {
        const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
        const str = await res.Body.transformToString();
        return JSON.parse(str);
    } catch (e) {
        if (e.name === "NoSuchKey") return [];
        throw e;
    }
}

async function writeMeta(data, key = META_KEY) {
    await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: JSON.stringify(data, null, 2),
        ContentType: "application/json"
    }));
}

// ─── 1. GET all videos ────────────────────────────────────────────────────────
app.get("/api/videos", async (req, res) => {
    try {
        let metaVideos = await readMeta();
        const users = await readMeta(USER_META_KEY);

        // Also discover raw S3 objects not yet in metadata
        const listRes = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: "videos/" }));
        const s3Objects = (listRes.Contents || []).filter(o => !o.Key.endsWith("/"));

        const knownUrls = new Set(metaVideos.map(v => v.videoUrl));
        const newEntries = s3Objects
            .filter(obj => {
                const url = `https://${BUCKET}.s3.amazonaws.com/${obj.Key}`;
                return !knownUrls.has(url);
            })
            .map(obj => {
                const url = `https://${BUCKET}.s3.amazonaws.com/${obj.Key}`;
                const parts = obj.Key.split("/");
                const userId = parts[1] || "unknown";
                const filename = (parts[2] || obj.Key).replace(/^\d+-/, "").replace(/\.(webm|mp4|mov)$/i, "");
                
                // Try to find user profile info
                const userProf = users.find(u => u.id === userId);

                return {
                    id: obj.ETag ? obj.ETag.replace(/"/g, "") : `${Date.now()}`,
                    title: filename,
                    description: "",
                    videoUrl: url,
                    channelName: userProf?.name || (userId.length > 15 ? "User-" + userId.substring(0, 4) : userId),
                    channelImage: userProf?.avatar || "",
                    views: "0",
                    likes: 0,
                    dislikes: 0,
                    likedBy: [],
                    dislikedBy: [],
                    viewedBy: [],
                    comments: [],
                    subscribers: "0",
                    userId,
                    isShorts: false,
                    duration: "0:00",
                    timestamp: new Date(obj.LastModified).toLocaleDateString()
                };
            });

        if (newEntries.length > 0) {
            metaVideos = [...newEntries, ...metaVideos];
            await writeMeta(metaVideos);
        }

        // 🔥 Dynamic Enrichment: Always use the latest profile from users.json
        const enriched = metaVideos.map(video => {
            // 1. Match by userId (Principal way)
            let userProf = users.find(u => u.id === video.userId);

            // 2. Fallback: Match by name (Useful for legacy videos with ID mismatches)
            if (!userProf && video.channelName && !video.channelName.startsWith("User-")) {
                userProf = users.find(u => u.name === video.channelName);
            }

            if (!userProf) return video;
            return {
                ...video,
                channelName: userProf.name || video.channelName,
                channelImage: userProf.avatar || video.channelImage
            };
        });

        res.json(enriched);
    } catch (err) {
        console.error("GET /api/videos error:", err);
        res.status(500).json({ error: "Failed to fetch videos" });
    }
});

// ─── 2. POST save video metadata ─────────────────────────────────────────────
app.post("/api/videos", async (req, res) => {
    try {
        const video = req.body;
        const videos = await readMeta();
        videos.unshift(video);
        await writeMeta(videos);
        res.status(201).json(video);
    } catch (err) {
        console.error("POST /api/videos error:", err);
        res.status(500).json({ error: "Failed to save video metadata" });
    }
});

// ─── 3. PUT update video metadata ────────────────────────────────────────────
app.put("/api/videos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const videos = await readMeta();
        const idx = videos.findIndex(v => v.id === id);
        if (idx === -1) return res.status(404).json({ error: "Video not found" });
        videos[idx] = { ...videos[idx], ...req.body };
        await writeMeta(videos);
        res.json(videos[idx]);
    } catch (err) {
        console.error("PUT /api/videos/:id error:", err);
        res.status(500).json({ error: "Failed to update video" });
    }
});

// ─── 4. User Profile Sync ────────────────────────────────────────────────────
app.post("/api/users", async (req, res) => {
    try {
        const profile = req.body; // { id, name, avatar }
        if (!profile.id) return res.status(400).json({ error: "Missing id" });
        
        let users = await readMeta(USER_META_KEY);
        const idx = users.findIndex(u => u.id === profile.id);
        if (idx > -1) users[idx] = { ...users[idx], ...profile };
        else users.push(profile);
        
        await writeMeta(users, USER_META_KEY);
        res.json(profile);
    } catch (err) {
        res.status(500).json({ error: "Failed to save user profile" });
    }
});

app.get("/api/users", async (req, res) => {
    try {
        const users = await readMeta(USER_META_KEY);
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// ─── 5. DELETE video ─────────────────────────────────────────────────────────
app.delete("/api/videos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const videos = await readMeta();
        const video = videos.find(v => v.id === id);
        if (video?.videoUrl?.includes("s3.amazonaws.com")) {
            const key = video.videoUrl.split(".com/")[1];
            await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key })).catch(() => {});
        }
        const updated = videos.filter(v => v.id !== id);
        await writeMeta(updated);
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete video" });
    }
});

// ─── 6. Presigned URL for frontend PUT upload ─────────────────────────────────
app.post("/api/video/upload-url", async (req, res) => {
    try {
        const { fileName, userId, contentType } = req.body;
        if (!fileName || !userId) return res.status(400).json({ error: "Missing fileName or userId" });

        const key = `videos/${userId}/${Date.now()}-${fileName}`;
        const command = new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            ContentType: contentType || "video/webm"
        });

        const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });
        const videoUrl = `https://${BUCKET}.s3.amazonaws.com/${key}`;

        res.json({ uploadUrl, key, videoUrl });
    } catch (err) {
        console.error("Presigned URL error:", err);
        res.status(500).json({ error: "Failed to generate presigned URL" });
    }
});

// ─── 7. Direct backend upload (fallback if presigned fails) ──────────────────
app.post("/api/video/upload-direct", upload.single("video"), async (req, res) => {
    try {
        const { userId } = req.body;
        const file = req.file;
        if (!file || !userId) return res.status(400).json({ error: "Missing file or userId" });

        const key = `videos/${userId}/${Date.now()}-${file.originalname}`;
        await s3.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype
        }));

        res.json({ key, videoUrl: `https://${BUCKET}.s3.amazonaws.com/${key}` });
    } catch (err) {
        console.error("Direct upload error:", err);
        res.status(500).json({ error: "Failed to upload video" });
    }
});

// ─── 8. Gemini AI Chat ────────────────────────────────────────────────────────
app.post("/api/ai/chat", async (req, res) => {
    try {
        const { messages } = req.body;
        if (!process.env.GEMINI_API_KEY) {
            return res.json({ reply: "Add GEMINI_API_KEY to backend .env to enable Tecky AI!" });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: "You are Tecky, an AI assistant inside TeckTube. Creator: Chhaya. If asked who you are, say: 'I'm Tecky, an AI assistant created by Chhaya.'"
        });

        const history = messages.slice(0, -1).map(m => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }]
        }));

        const chat = model.startChat({ history });
        const result = await chat.sendMessage(messages[messages.length - 1].content);
        res.json({ reply: result.response.text() });
    } catch (err) {
        console.error("Gemini Error:", err);
        res.json({ reply: `Tecky is offline: ${err.message}` });
    }
});

// ─── 9. Razorpay ─────────────────────────────────────────────────────────────
app.post("/create-order", async (req, res) => {
    res.json({ orderId: "order_mock_" + Date.now(), key: "rzp_test_placeholder" });
});

app.listen(5000, () => console.log("✅ Backend running on http://localhost:5000"));

