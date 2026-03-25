import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Camera, Save, Trash2, PlayCircle, Image as ImageIcon, Loader2, Pencil, X } from "lucide-react";
import { useAppData } from "../context/AppDataContext";
import { useNavigate } from "react-router-dom";
import UserAvatar from "../components/UserAvatar";

const Account = () => {
    const { user } = useAuth();
    const { videos, deleteVideo, updateVideo } = useAppData();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [avatar, setAvatar] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Video Editing state
    const [editingVideo, setEditingVideo] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDesc, setEditDesc] = useState("");

    // Camera State
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const fileInputRef = useRef(null);

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

    // Helper to convert dataURL to File for S3 upload
    const dataURLtoFile = (dataurl, filename) => {
        let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };

    const capturePhoto = async () => {
        const video = document.getElementById("profile-camera-video");
        const canvas = document.createElement("canvas");
        if (video) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext("2d").drawImage(video, 0, 0);
            const dataUrl = canvas.toDataURL("image/png");
            setCapturedImage(dataUrl);
            setAvatar(dataUrl); // Preview locally
            stopCamera();

            // 🔥 Upload to S3 immediately
            setIsSaving(true);
            try {
                const file = dataURLtoFile(dataUrl, `capture-${Date.now()}.png`);
                const s3Url = await uploadImage(file, user.id);
                setAvatar(s3Url);
            } catch (err) {
                alert("Photo upload failed: " + err.message);
            } finally {
                setIsSaving(false);
            }
        }
    };

    // Context helpers
    const { uploadImage } = useAppData();
    const { syncProfile } = useAuth();

    const onFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsSaving(true);
        try {
            const url = await uploadImage(file, user.id);
            setAvatar(url);
            alert("Image uploaded! Click 'Save Changes' to apply.");
        } catch (err) {
            alert("Upload failed: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Sync to backend users.json
            await fetch("http://localhost:5000/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: user.id, name, avatar })
            });
            
            // Trigger local auth update if possible (via syncProfile)
            if (syncProfile) await syncProfile({ id: user.id, name, avatar });
            
            alert("Profile updated successfully!");
            setIsEditing(false);
            window.location.reload(); // Hard refresh to propagate changes everywhere
        } catch (err) {
            alert("Save failed: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateVideo = async () => {
        if (!editingVideo) return;
        setIsSaving(true);
        try {
            const updated = { ...editingVideo, title: editTitle, description: editDesc };
            await updateVideo(updated);
            alert("Video updated!");
            setEditingVideo(null);
        } catch (err) {
            alert("Update failed: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) return <div className="p-10 text-center dark:text-white">Please log in to manage your account.</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 pt-10">
            <div className="bg-white dark:bg-[#1f1f1f] rounded-2xl shadow-lg overflow-hidden">

                {/* Header Banner */}
                <div className="h-32 bg-gradient-to-r from-red-600 to-purple-600 relative">
                    <div className="absolute -bottom-12 left-8">
                        <div className="relative group">
                            <UserAvatar name={name} avatar={avatar} size="lg" className="border-4 border-white dark:border-[#1f1f1f]" />
                            {isEditing && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex gap-2">
                                        <button onClick={startCamera} className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white" title="Take Photo">
                                            <Camera size={20} />
                                        </button>
                                        <button onClick={() => fileInputRef.current.click()} className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white" title="Upload from Gallery">
                                            <ImageIcon size={20} />
                                        </button>
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onFileSelect} />
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
                            disabled={isSaving}
                            className={`px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${isEditing
                                ? "bg-red-600 text-white hover:bg-red-700 shadow-lg"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                                }`}
                        >
                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : (isEditing ? <Save size={18} /> : null)}
                            {isEditing ? (isSaving ? "Saving..." : "Save Changes") : "Edit Profile"}
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
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingVideo(video);
                                                    setEditTitle(video.title);
                                                    setEditDesc(video.description || "");
                                                }}
                                                className="p-2 bg-blue-600/80 text-white rounded-full hover:bg-blue-600 backdrop-blur-sm"
                                                title="Edit"
                                            >
                                                <Pencil size={16} />
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

            {/* Edit Video Modal */}
            {editingVideo && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                            <h2 className="text-xl font-bold dark:text-white">Edit Video</h2>
                            <button onClick={() => setEditingVideo(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full dark:text-gray-400">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold dark:text-gray-400">Title</label>
                                <input 
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-red-500 dark:text-white"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold dark:text-gray-400">Description</label>
                                <textarea 
                                    rows="4"
                                    value={editDesc}
                                    onChange={(e) => setEditDesc(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-red-500 dark:text-white resize-none"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={() => setEditingVideo(null)}
                                    className="px-6 py-2 rounded-full font-medium bg-gray-100 dark:bg-gray-800 dark:text-white hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateVideo}
                                    disabled={isSaving}
                                    className="px-6 py-2 rounded-full font-medium bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Account;
