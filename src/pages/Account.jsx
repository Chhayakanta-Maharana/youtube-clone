import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Camera, Save, Trash2, PlayCircle } from "lucide-react";
import { useAppData } from "../context/AppDataContext";
import { useNavigate } from "react-router-dom";

const Account = () => {
    const { user } = useAuth();
    const { videos, deleteVideo } = useAppData();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [avatar, setAvatar] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    // Camera State
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);

    // Filter videos owned by current user
    const myVideos = videos.filter(v => v.userId === user?.id);

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setAvatar(user.avatar || "");
        }
    }, [user]);

    const startCamera = async () => {
        setIsCameraOpen(true);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            const video = document.getElementById("profile-camera-video");
            if (video) {
                video.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Camera access denied:", err);
            alert("Unable to access camera.");
            setIsCameraOpen(false);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        const video = document.getElementById("profile-camera-video");
        const canvas = document.createElement("canvas");
        if (video) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext("2d").drawImage(video, 0, 0);
            const dataUrl = canvas.toDataURL("image/png");
            setCapturedImage(dataUrl);
            setAvatar(dataUrl); // Set as avatar preview immediately
            stopCamera();
        }
    };

    const handleSave = () => {
        // In a real app, updateAuth(name, avatar) or API call
        // For now, we simulate by updating the auth user object locally if possible, 
        // or just alerting as requested.
        alert("Profile updated successfully!");
        setIsEditing(false);
    };

    if (!user) return <div className="p-10 text-center dark:text-white">Please log in to manage your account.</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 pt-10">
            <div className="bg-white dark:bg-[#1f1f1f] rounded-2xl shadow-lg overflow-hidden">

                {/* Header Banner */}
                <div className="h-32 bg-gradient-to-r from-red-600 to-purple-600 relative">
                    <div className="absolute -bottom-12 left-8">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full border-4 border-white dark:border-[#1f1f1f] overflow-hidden bg-gray-300">
                                {avatar ? (
                                    <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-purple-500 text-white text-3xl font-bold">
                                        {name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            {isEditing && (
                                <div
                                    onClick={startCamera}
                                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer text-white hover:bg-black/70 transition-colors"
                                    title="Take Photo"
                                >
                                    <Camera size={24} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Camera Modal */}
                {isCameraOpen && (
                    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl overflow-hidden shadow-2xl max-w-lg w-full flex flex-col">
                            <div className="relative aspect-video bg-black">
                                <video
                                    id="profile-camera-video"
                                    autoPlay
                                    muted
                                    className="w-full h-full object-cover transform scale-x-[-1]"
                                    onLoadedMetadata={(e) => e.target.play()}
                                />
                            </div>
                            <div className="p-4 flex justify-between items-center bg-gray-100 dark:bg-[#252525]">
                                <button
                                    onClick={stopCamera}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={capturePhoto}
                                    className="w-12 h-12 rounded-full border-4 border-white bg-red-600 hover:bg-red-700 shadow-lg flex items-center justify-center"
                                >
                                    <div className="w-4 h-4 bg-white rounded-full" />
                                </button>
                                <div className="w-16" /> {/* Spacer for centering */}
                            </div>
                        </div>
                    </div>
                )}

                <div className="pt-16 pb-8 px-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold dark:text-white">{user.name}</h1>
                            <p className="text-gray-500 dark:text-gray-400">Manage your personal details</p>
                        </div>
                        <button
                            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                            className={`px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${isEditing
                                ? "bg-red-600 text-white hover:bg-red-700 shadow-lg"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                                }`}
                        >
                            {isEditing ? <><Save size={18} /> Save Changes</> : "Edit Profile"}
                        </button>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Name Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                <User size={16} /> Full Name
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-red-500 dark:text-white"
                                />
                            ) : (
                                <div className="p-3 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl dark:text-white font-medium">
                                    {name}
                                </div>
                            )}
                        </div>

                        {/* Email Field (Read Only) */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                <Mail size={16} /> Email Address
                            </label>
                            <div className="p-3 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed">
                                {user.email} (Read-only)
                            </div>
                        </div>

                        {/* Avatar URL (Edit Only) */}
                        {isEditing && (
                            <div className="space-y-2 md:col-span-2 animate-in fade-in">
                                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                    <Camera size={16} /> Avatar URL
                                </label>
                                <input
                                    type="text"
                                    value={avatar}
                                    onChange={(e) => setAvatar(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-red-500 dark:text-white"
                                />
                            </div>
                        )}
                    </div>

                    {/* My Videos Section */}
                    <div className="mt-12 border-t dark:border-gray-700 pt-8">
                        <h2 className="text-xl font-bold dark:text-white mb-6 flex items-center gap-2">
                            <PlayCircle className="text-red-600" /> My Videos ({myVideos.length})
                        </h2>

                        {myVideos.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {myVideos.map(video => (
                                    <div key={video.id} className="group relative bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                        <div className="aspect-video bg-black relative">
                                            {video.thumbnail ? (
                                                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <video src={video.videoUrl} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="p-3">
                                            <h3 className="font-bold text-sm dark:text-white line-clamp-1" title={video.title}>
                                                {video.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {video.views || 0} views • {video.timestamp}
                                            </p>
                                        </div>

                                        {/* Actions Overlay */}
                                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => navigate(`/watch/${video.id}`)}
                                                className="p-2 bg-black/60 text-white rounded-full hover:bg-black/80 backdrop-blur-sm"
                                                title="Watch"
                                            >
                                                <PlayCircle size={16} />
                                            </button>
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if (confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
                                                        await deleteVideo(video.id, video.videoUrl);
                                                    }
                                                }}
                                                className="p-2 bg-red-600/80 text-white rounded-full hover:bg-red-600 backdrop-blur-sm"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                <p>You haven't uploaded any videos yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Account;
