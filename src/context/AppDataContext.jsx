import { createContext, useContext, useState, useEffect } from "react";
// Remove dummy import: import { videos as initialVideos } from "../data/dummyVideos";
// We can keep dummy videos as a fallback or mock response only inside the fetch function
import { useAuth } from "./AuthContext";

const AppDataContext = createContext();

export const useAppData = () => useContext(AppDataContext);

// --- BACKEND SIMULATION HELPERS ---
const mockUploadToS3 = async (file) => {
    console.log(`[S3] Starting upload for ${file.name} to bucket 'youtube-clone-videos'...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const s3Url = URL.createObjectURL(file);
    console.log(`[S3] Upload complete. Location: ${s3Url}`);
    return s3Url;
};

const mockSaveToDynamoDB = async (tableName, item) => {
    console.log(`[DynamoDB] PutItem in table '${tableName}':`, item);
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
};

// Simulate Fetching from DynamoDB
// Simulate Fetching from DynamoDB (Serverless)
const mockFetchVideosFromDynamoDB = async () => {
    console.log("[DynamoDB] Scanning 'Videos' table...");

    // Random network latency (0.5s to 2s)
    const latency = Math.floor(Math.random() * 1500) + 500;
    await new Promise(resolve => setTimeout(resolve, latency));

    // Simulate "S3/DB" being empty initially. 
    // Content will only appear after user uploads.
    return [];
};
// ----------------------------------

export const AppDataProvider = ({ children }) => {
    const { user } = useAuth();

    // Videos State
    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // History State
    const [history, setHistory] = useState([]);

    // Subscriptions State
    const [subscriptions, setSubscriptions] = useState([]);

    // Downloads State
    const [downloads, setDownloads] = useState([]);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    // Fetch Videos on Mount
    useEffect(() => {
        const initVideos = async () => {
            setIsLoading(true);
            try {
                // Try local storage first for persistence simulation
                const saved = localStorage.getItem("tecktube-videos");
                if (saved) {
                    setVideos(JSON.parse(saved));
                } else {
                    const fetchedVideos = await mockFetchVideosFromDynamoDB();
                    setVideos(fetchedVideos);
                }
            } catch (error) {
                console.error("Failed to fetch videos:", error);
                // Fallback to empty or error state
            } finally {
                setIsLoading(false);
            }
        };
        initVideos();
    }, []);

    // Persist Videos to LocalStorage (Simulating Database Coherence)
    useEffect(() => {
        if (videos.length > 0) {
            localStorage.setItem("tecktube-videos", JSON.stringify(videos));
        }
    }, [videos]);

    // Load User Data when User Changes
    useEffect(() => {
        if (user?.id) {
            const savedHistory = localStorage.getItem(`tecktube-history-${user.id}`);
            const savedSubs = localStorage.getItem(`tecktube-subscriptions-${user.id}`);
            const savedDownloads = localStorage.getItem(`tecktube-downloads-${user.id}`);

            setHistory(savedHistory ? JSON.parse(savedHistory) : []);
            setSubscriptions(savedSubs ? JSON.parse(savedSubs) : []);
            setDownloads(savedDownloads ? JSON.parse(savedDownloads) : []);
        } else {
            // Clear or reset if guest (or keep empty)
            setHistory([]);
            setSubscriptions([]);
            setDownloads([]);
        }
    }, [user?.id]); // Only re-run if ID changes

    // Persist User Data whenever it changes
    useEffect(() => {
        if (user?.id) {
            localStorage.setItem(`tecktube-history-${user.id}`, JSON.stringify(history));
            localStorage.setItem(`tecktube-subscriptions-${user.id}`, JSON.stringify(subscriptions));
            localStorage.setItem(`tecktube-downloads-${user.id}`, JSON.stringify(downloads));
        }
    }, [history, subscriptions, downloads, user?.id]);

    // Actions
    const uploadVideo = async (file, metaData) => {
        if (!user) return alert("Please sign in to upload.");

        try {
            const videoUrl = await mockUploadToS3(file);
            const newVideo = {
                id: Date.now().toString(),
                ...metaData,
                videoUrl: videoUrl,
                channelName: user.name,
                channelImage: user.avatar,
                views: "0",
                timestamp: "Just now",
                userId: user.id,
                verified: user.subscriptionTier === "gold",
                thumbnail: "" // No thumbnail initially
            };

            await mockSaveToDynamoDB("Videos", newVideo);

            setVideos(prev => [newVideo, ...prev]);
            return true;
        } catch (error) {
            console.error("Upload failed:", error);
            return false;
        }
    };

    // NEW: For when S3 upload is already done (e.g. via signed URL)
    const saveVideoToDb = async (metaData) => {
        if (!user) return alert("Please sign in to save.");

        try {
            const newVideo = {
                id: Date.now().toString(),
                ...metaData,
                // videoUrl is already in metaData
                channelName: user.name,
                channelImage: user.avatar,
                views: "0",
                timestamp: "Just now",
                userId: user.id,
                verified: user.subscriptionTier === "gold",
            };

            await mockSaveToDynamoDB("Videos", newVideo);
            setVideos(prev => [newVideo, ...prev]);
            return true;
        } catch (error) {
            console.error("Save to DB failed:", error);
            return false;
        }
    };

    const deleteVideo = async (videoId, videoUrl) => {
        if (!user) return alert("Sign in to delete videos.");

        try {
            // 1. Delete from S3 (if it's an S3 URL)
            // Extract Key from URL: https://BUCKET.s3.amazonaws.com/videos/USER/FILE
            if (videoUrl.includes("s3.amazonaws.com")) {
                const key = videoUrl.split(".com/")[1];
                if (key) {
                    await fetch(`http://localhost:5000/api/video/${encodeURIComponent(key)}`, {
                        method: "DELETE"
                    });
                }
            }

            // 2. Delete from Local State & "DB"
            const updatedVideos = videos.filter(v => v.id !== videoId);
            setVideos(updatedVideos);

            // Update "DB"
            // For simulation, we just overwrite the full list or remove item
            // Since mockFetchVideosFromDynamoDB returns empty initially, we mostly rely on local state/storage for 'persistence' in this demo

            return true;
        } catch (error) {
            console.error("Delete failed:", error);
            return false;
        }
    };

    const incrementViewCount = (videoId) => {
        if (!user) return; // Only count logged-in users or handle guest logic consistently

        setVideos(prev => prev.map(v => {
            if (v.id === videoId) {
                // Initialize viewedBy if it doesn't exist
                const viewedBy = v.viewedBy || [];

                // If user has already viewed, do nothing
                if (viewedBy.includes(user.id)) {
                    return v;
                }

                // Otherwise, increment views and add user to viewedBy
                const currentViews = parseInt(v.views.replace(/,/g, '') || "0");
                const newViews = (currentViews + 1).toLocaleString();
                const newViewedBy = [...viewedBy, user.id];

                const updatedVideo = { ...v, views: newViews, viewedBy: newViewedBy };

                // Persist update (simulated)
                mockSaveToDynamoDB("Videos", updatedVideo);
                return updatedVideo;
            }
            return v;
        }));
    };

    const addToHistory = (video) => {
        if (!user) return;
        const filtered = history.filter(v => v.id !== video.id);
        const newHistory = [video, ...filtered];
        setHistory(newHistory);
        mockSaveToDynamoDB("UserHistory", { userId: user.id, videoId: video.id, timestamp: Date.now() });
    };

    const toggleSubscription = (channel) => {
        if (!user) return alert("Sign in to subscribe.");

        const exists = subscriptions.find(s => s.name === channel.name);
        let newSubs;

        // Update local subscriptions list
        if (exists) {
            newSubs = subscriptions.filter(s => s.name !== channel.name);
        } else {
            newSubs = [...subscriptions, channel];
        }
        setSubscriptions(newSubs);
        mockSaveToDynamoDB("UserSubscriptions", { userId: user.id, subscriptions: newSubs });

        // Update subscriber count on all videos from this channel
        setVideos(prev => prev.map(v => {
            if (v.channelName === channel.name) {
                // Parse current count (remove 'M', 'K' etc for simplicity or just assume number string)
                let currentCount = parseInt(v.subscribers || "0");
                if (isNaN(currentCount)) currentCount = 0; // Handle "1.2M" legacy cases if any remain

                const newCount = exists ? Math.max(0, currentCount - 1) : currentCount + 1;
                const newCountStr = newCount.toString();

                return { ...v, subscribers: newCountStr };
            }
            return v;
        }));
    };

    const downloadVideo = (video) => {
        if (!user) return alert("Sign in to download videos.");

        const exists = downloads.find(d => d.id === video.id);
        if (!exists) {
            const newDownloads = [video, ...downloads];
            setDownloads(newDownloads);
            mockSaveToDynamoDB("UserDownloads", { userId: user.id, videoId: video.id });
            alert("Video downloaded!");
        } else {
            alert("Video already downloaded.");
        }
    };

    const removeDownload = (videoId) => {
        if (!user) return;
        const newDownloads = downloads.filter(d => d.id !== videoId);
        setDownloads(newDownloads);
        mockSaveToDynamoDB("UserDownloads", { userId: user.id, videoId: videoId, action: "remove" });
    };

    const toggleLike = (videoId) => {
        if (!user) return alert("Sign in to like videos.");

        setVideos(prev => prev.map(v => {
            if (v.id === videoId) {
                const likedBy = v.likedBy || [];
                const dislikedBy = v.dislikedBy || [];
                let newLikes = parseInt(v.likes || "0");
                let newDislikes = parseInt(v.dislikes || "0");

                let newLikedBy = [...likedBy];
                let newDislikedBy = [...dislikedBy];

                // If already liked, remove like
                if (likedBy.includes(user.id)) {
                    newLikedBy = newLikedBy.filter(id => id !== user.id);
                    newLikes = Math.max(0, newLikes - 1);
                } else {
                    // If disliked, remove dislike first
                    if (dislikedBy.includes(user.id)) {
                        newDislikedBy = newDislikedBy.filter(id => id !== user.id);
                        newDislikes = Math.max(0, newDislikes - 1);
                    }
                    // Add like
                    newLikedBy.push(user.id);
                    newLikes++;
                }

                const updatedVideo = {
                    ...v,
                    likes: newLikes,
                    dislikes: newDislikes,
                    likedBy: newLikedBy,
                    dislikedBy: newDislikedBy
                };
                mockSaveToDynamoDB("Videos", updatedVideo);
                return updatedVideo;
            }
            return v;
        }));
    };

    const toggleDislike = (videoId) => {
        if (!user) return alert("Sign in to dislike videos.");

        setVideos(prev => prev.map(v => {
            if (v.id === videoId) {
                const likedBy = v.likedBy || [];
                const dislikedBy = v.dislikedBy || [];
                let newLikes = parseInt(v.likes || "0");
                let newDislikes = parseInt(v.dislikes || "0");

                let newLikedBy = [...likedBy];
                let newDislikedBy = [...dislikedBy];

                // If already disliked, remove dislike
                if (dislikedBy.includes(user.id)) {
                    newDislikedBy = newDislikedBy.filter(id => id !== user.id);
                    newDislikes = Math.max(0, newDislikes - 1);
                } else {
                    // If liked, remove like first
                    if (likedBy.includes(user.id)) {
                        newLikedBy = newLikedBy.filter(id => id !== user.id);
                        newLikes = Math.max(0, newLikes - 1);
                    }
                    // Add dislike
                    newDislikedBy.push(user.id);
                    newDislikes++;
                }

                const updatedVideo = {
                    ...v,
                    likes: newLikes,
                    dislikes: newDislikes,
                    likedBy: newLikedBy,
                    dislikedBy: newDislikedBy
                };
                mockSaveToDynamoDB("Videos", updatedVideo);
                return updatedVideo;
            }
            return v;
        }));
    };

    const addComment = (videoId, text) => {
        if (!user) return alert("Sign in to comment.");

        const newComment = {
            id: Date.now().toString(),
            userId: user.id,
            userName: user.name,
            userAvatar: user.avatar,
            text,
            timestamp: new Date().toLocaleDateString()
        };

        setVideos(prev => prev.map(v => {
            if (v.id === videoId) {
                const comments = v.comments ? [newComment, ...v.comments] : [newComment];
                const updatedVideo = { ...v, comments };
                mockSaveToDynamoDB("Videos", updatedVideo);
                return updatedVideo;
            }
            return v;
        }));
    };

    const isSubscribed = (channelName) => {
        return subscriptions.some(s => s.name === channelName);
    };

    return (
        <AppDataContext.Provider value={{
            videos,
            isLoading, // Export loading state
            history,
            subscriptions,
            downloads,
            uploadVideo,
            saveVideoToDb,
            deleteVideo,
            incrementViewCount,
            addToHistory,
            toggleSubscription,
            isSubscribed,
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
