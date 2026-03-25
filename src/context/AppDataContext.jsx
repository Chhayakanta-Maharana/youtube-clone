import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const API = "http://localhost:5000";

const AppDataContext = createContext();
export const useAppData = () => useContext(AppDataContext);

// ── Upload file to S3 via presigned URL ────────────────────────────────────
async function uploadToS3(file, userId) {
    // Step 1: get presigned URL from backend
    const urlRes = await fetch(`${API}/api/video/upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, userId, contentType: file.type })
    });

    if (!urlRes.ok) throw new Error("Failed to get presigned URL");
    const { uploadUrl, videoUrl } = await urlRes.json();

    // Step 2: PUT file directly to S3
    const s3Res = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file
    });

    if (!s3Res.ok) {
        // Fallback: use backend proxy if presigned URL fails (e.g. CORS not yet configured)
        console.warn("[S3] Presigned PUT failed, falling back to backend proxy...");
        const form = new FormData();
        form.append("userId", userId);
        form.append("video", file, file.name);
        const proxyRes = await fetch(`${API}/api/video/upload-direct`, { method: "POST", body: form });
        if (!proxyRes.ok) throw new Error("Both upload methods failed");
        const { videoUrl: proxyUrl } = await proxyRes.json();
        return proxyUrl;
    }

    return videoUrl;
}

// ── Upload image to S3 (profile pictures) ──────────────────────────────────
async function uploadImageToS3(file, userId) {
    const urlRes = await fetch(`${API}/api/video/upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: `avatar-${file.name}`, userId, contentType: file.type })
    });
    const { uploadUrl, videoUrl } = await urlRes.json();
    await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
    return videoUrl;
}

// ── Backend API helpers ────────────────────────────────────────────────────
const fetchVideos = () =>
    fetch(`${API}/api/videos`).then(r => (r.ok ? r.json() : [])).catch(() => []);

export const AppDataProvider = ({ children }) => {
    const { user } = useAuth();

    const [videos, setVideos] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [history, setHistory] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [downloads, setDownloads] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    // ── Load all videos & users from backend on mount
    useEffect(() => {
        setIsLoading(true);
        Promise.all([
            fetchVideos(),
            fetch(`${API}/api/users`).then(r => r.json()).catch(() => [])
        ]).then(([v, u]) => {
            setVideos(v || []);
            setUsersList(u || []);
        }).finally(() => setIsLoading(false));
    }, []);

    // ── Load/persist user-specific data
    useEffect(() => {
        if (user?.id) {
            setHistory(JSON.parse(localStorage.getItem(`tecktube-history-${user.id}`) || "[]"));
            setSubscriptions(JSON.parse(localStorage.getItem(`tecktube-subscriptions-${user.id}`) || "[]"));
            setDownloads(JSON.parse(localStorage.getItem(`tecktube-downloads-${user.id}`) || "[]"));
        } else {
            setHistory([]); setSubscriptions([]); setDownloads([]);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user?.id) {
            localStorage.setItem(`tecktube-history-${user.id}`, JSON.stringify(history));
            localStorage.setItem(`tecktube-subscriptions-${user.id}`, JSON.stringify(subscriptions));
            localStorage.setItem(`tecktube-downloads-${user.id}`, JSON.stringify(downloads));
        }
    }, [history, subscriptions, downloads, user?.id]);

    // ── Upload video → S3 → save metadata → show in feed ─────────────────────
    const uploadVideo = async (file, metaData) => {
        if (!user) return alert("Please sign in to upload.");
        try {
            const videoUrl = await uploadToS3(file, user.id);
            const newVideo = {
                id: Date.now().toString(),
                ...metaData,
                videoUrl,
                channelName: user.name,
                channelImage: user.avatar || "",
                views: "0",
                likes: 0,
                dislikes: 0,
                likedBy: [],
                dislikedBy: [],
                viewedBy: [],
                comments: [],
                subscribers: "0",
                userId: user.id,
                verified: user.subscriptionTier === "gold",
                timestamp: "Just now"
            };
            await saveVideoToDb(newVideo);
            return true;
        } catch (err) {
            console.error("Upload failed:", err);
            alert("Upload failed: " + err.message);
            return false;
        }
    };

    const saveVideoToDb = async (video) => {
        try {
            const res = await fetch(`${API}/api/videos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(video)
            });
            if (res.ok) {
                const saved = await res.json();
                setVideos(prev => [saved, ...prev]);
                return saved;
            }
        } catch (err) {
            console.error("Save failed:", err);
        }
    };

    const updateVideo = async (video) => {
        try {
            const res = await fetch(`${API}/api/videos/${video.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(video)
            });
            if (res.ok) {
                const updated = await res.json();
                setVideos(prev => prev.map(v => v.id === updated.id ? updated : v));
                return updated;
            }
        } catch (err) {
            console.error("Update failed:", err);
            throw err;
        }
    };
    const deleteVideo = async (videoId) => {
        try {
            await fetch(`${API}/api/videos/${videoId}`, { method: "DELETE" });
            setVideos(prev => prev.filter(v => v.id !== videoId));
            return true;
        } catch (err) {
            console.error("Delete failed:", err);
            return false;
        }
    };

    // ── Interaction helpers ───────────────────────────────────────────────────
    const incrementViewCount = async (videoId) => {
        setVideos(prev => prev.map(v => {
            if (v.id !== videoId) return v;
            const viewedBy = v.viewedBy || [];
            if (user && viewedBy.includes(user.id)) return v;
            const newViews = (parseInt(v.views?.replace(/,/g, "") || 0) + 1).toLocaleString();
            const newViewedBy = user ? [...viewedBy, user.id] : viewedBy;
            const updated = { ...v, views: newViews, viewedBy: newViewedBy };
            updateVideo(updated);
            return updated;
        }));
    };

    const addToHistory = (video) => {
        if (!user) return;
        setHistory(prev => [video, ...prev.filter(v => v.id !== video.id)]);
    };

    const toggleSubscription = (channel) => {
        if (!user) return alert("Sign in to subscribe.");
        const exists = subscriptions.find(s => s.name === channel.name);
        const newSubs = exists ? subscriptions.filter(s => s.name !== channel.name) : [...subscriptions, channel];
        setSubscriptions(newSubs);

        setVideos(prev => prev.map(v => {
            if (v.channelName !== channel.name) return v;
            const count = parseInt(v.subscribers || 0);
            const updated = { ...v, subscribers: (exists ? Math.max(0, count - 1) : count + 1).toString() };
            updateVideo(updated);
            return updated;
        }));
    };

    const downloadVideo = (video) => {
        if (!user) return alert("Sign in to download.");
        if (!downloads.find(d => d.id === video.id)) {
            setDownloads(prev => [video, ...prev]);
            alert("Video saved for download!");
        } else {
            alert("Already downloaded.");
        }
    };

    const removeDownload = (videoId) => setDownloads(prev => prev.filter(d => d.id !== videoId));

    const toggleLike = (videoId) => {
        if (!user) return alert("Sign in to like videos.");
        setVideos(prev => prev.map(v => {
            if (v.id !== videoId) return v;
            const likedBy = v.likedBy || [];
            const dislikedBy = v.dislikedBy || [];
            let likes = parseInt(v.likes || 0);
            let dislikes = parseInt(v.dislikes || 0);
            let newLikedBy = [...likedBy];
            let newDislikedBy = [...dislikedBy];

            if (likedBy.includes(user.id)) {
                newLikedBy = newLikedBy.filter(id => id !== user.id);
                likes = Math.max(0, likes - 1);
            } else {
                if (dislikedBy.includes(user.id)) {
                    newDislikedBy = newDislikedBy.filter(id => id !== user.id);
                    dislikes = Math.max(0, dislikes - 1);
                }
                newLikedBy.push(user.id);
                likes++;
            }

            const updated = { ...v, likes, dislikes, likedBy: newLikedBy, dislikedBy: newDislikedBy };
            updateVideo(updated);
            return updated;
        }));
    };

    const toggleDislike = (videoId) => {
        if (!user) return alert("Sign in to dislike videos.");
        setVideos(prev => prev.map(v => {
            if (v.id !== videoId) return v;
            const likedBy = v.likedBy || [];
            const dislikedBy = v.dislikedBy || [];
            let likes = parseInt(v.likes || 0);
            let dislikes = parseInt(v.dislikes || 0);
            let newLikedBy = [...likedBy];
            let newDislikedBy = [...dislikedBy];

            if (dislikedBy.includes(user.id)) {
                newDislikedBy = newDislikedBy.filter(id => id !== user.id);
                dislikes = Math.max(0, dislikes - 1);
            } else {
                if (likedBy.includes(user.id)) {
                    newLikedBy = newLikedBy.filter(id => id !== user.id);
                    likes = Math.max(0, likes - 1);
                }
                newDislikedBy.push(user.id);
                dislikes++;
            }

            const updated = { ...v, likes, dislikes, likedBy: newLikedBy, dislikedBy: newDislikedBy };
            updateVideo(updated);
            return updated;
        }));
    };

    const addComment = (videoId, text) => {
        if (!user) return alert("Sign in to comment.");
        const newComment = {
            id: Date.now().toString(),
            userId: user.id,
            userName: user.name,
            userAvatar: user.avatar || "",
            text,
            timestamp: new Date().toLocaleDateString()
        };
        setVideos(prev => prev.map(v => {
            if (v.id !== videoId) return v;
            const updated = { ...v, comments: [newComment, ...(v.comments || [])] };
            updateVideo(updated);
            return updated;
        }));
    };

    const isSubscribed = (channelName) => subscriptions.some(s => s.name === channelName);

    return (
        <AppDataContext.Provider value={{
            videos, usersList, isLoading,
            history, subscriptions, downloads,
            uploadVideo, saveVideoToDb, deleteVideo, updateVideo, uploadImage: uploadImageToS3,
            incrementViewCount, addToHistory,
            toggleSubscription, isSubscribed,
            downloadVideo,
            removeDownload,
            toggleLike,
            toggleDislike,
            addComment,
            searchQuery,
            setSearchQuery,
            selectedCategory,
            setSelectedCategory,
        }}>
            {children}
        </AppDataContext.Provider>
    );
};
