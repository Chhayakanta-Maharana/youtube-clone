import { useState, useRef, useEffect } from "react";
import { X, Upload, Camera, Trash2, CheckCircle, AlertCircle, Video } from "lucide-react";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";

const CreateUploadModal = ({ isOpen, onClose }) => {
    const [mode, setMode] = useState("select"); // select, file, camera, form
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isShorts, setIsShorts] = useState(false);
    const [duration, setDuration] = useState(null); // String like "0:00"

    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Upload state
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    // Camera state
    const [cameraStream, setCameraStream] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordTime, setRecordTime] = useState(0);

    // Refs
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);

    const { uploadVideo } = useAppData();
    const { user } = useAuth();

    // Clean up streams when modal closes or unmounts
    useEffect(() => {
        return () => {
            stopCameraStream();
        };
    }, []);

    // Attach stream to video element when it's available
    useEffect(() => {
        if (mode === "camera" && cameraStream && videoRef.current) {
            videoRef.current.srcObject = cameraStream;
            videoRef.current.play().catch(e => console.warn("Camera play error:", e));
        }
    }, [mode, cameraStream]);

    // Format seconds to mm:ss
    const formatTime = (seconds) => {
        if (!seconds) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isOpen) return null;

    const stopCameraStream = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setCameraStream(null);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const reset = () => {
        setMode("select");
        setTitle("");
        setDescription("");
        setIsShorts(false);
        setFile(null);
        setPreviewUrl(null);
        setUploadProgress(0);
        setIsUploading(false);
        setIsRecording(false);
        setRecordTime(0);
        stopCameraStream();
        chunksRef.current = [];
    };

    const handleClose = () => {
        if (isUploading) return;
        reset();
        onClose();
    };

    const getVideoDuration = (fileObj) => {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                resolve(video.duration);
            };
            video.onerror = () => resolve(0);
            video.src = URL.createObjectURL(fileObj);
        });
    };

    // --- FILE HANDLING ---
    const handleFileSelect = async (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setPreviewUrl(URL.createObjectURL(selected));
            setMode("form");
            setTitle(selected.name.split('.')[0]);

            const sec = await getVideoDuration(selected);
            setDuration(formatTime(sec));
        }
    };

    // --- CAMERA & RECORDING ---
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: true
            });
            streamRef.current = stream;
            setMode("camera");
            setCameraStream(stream);
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access camera. Please check permissions.");
        }
    };

    const startRecording = () => {
        if (!streamRef.current) return;

        chunksRef.current = [];
        try {
            // Let the browser choose the best supported codec
            const recorder = new MediaRecorder(streamRef.current);

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            // Don't use timeslicing, as it can corrupt video playback length on some browsers
            recorder.start();
            mediaRecorderRef.current = recorder;
            setIsRecording(true);
            setRecordTime(0);

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("MediaRecorder error:", err);
            alert("Recording is not supported in this browser.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);

            mediaRecorderRef.current.onstop = async () => {
                // Use the recorder's reported mimeType to create the blob accurately
                const mimeType = mediaRecorderRef.current.mimeType || "video/webm";
                const blob = new Blob(chunksRef.current, { type: mimeType });

                // Keep .webm extension for general compatibility
                const recordedFile = new File([blob], `recorded-${Date.now()}.webm`, { type: mimeType });

                setFile(recordedFile);
                setPreviewUrl(URL.createObjectURL(blob));
                setDuration(formatTime(recordTime));
                setMode("form");
                setTitle(`Recording ${new Date().toLocaleTimeString()}`);

                stopCameraStream();
            };
        }
    };

    // --- UPLOAD LOGIC ---
    const handleUpload = async () => {
        if (!file || !title) {
            alert("Please add a title.");
            return;
        }
        if (!user) {
            alert("Please sign in to upload videos.");
            return;
        }

        setIsUploading(true);
        setUploadProgress(20);

        try {
            const metaData = {
                title,
                description,
                isShorts,
                duration,
                thumbnail: "",
            };

            setUploadProgress(60);
            const success = await uploadVideo(file, metaData);
            setUploadProgress(100);

            if (success) {
                alert("Video uploaded successfully! 🎉 It is now visible on the homepage.");
                handleClose();
            } else {
                alert("Upload failed. Please try again.");
            }
        } catch (error) {
            console.error("UPLOAD ERROR:", error);
            alert("Upload failed: " + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!isUploading ? handleClose : undefined} />

            <div className="relative w-full max-w-2xl bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border dark:border-gray-700 animate-fade-in">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 bg-white dark:bg-[#1e1e1e] z-10">
                    <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        {mode === "camera" && <Video size={20} className="text-red-500" />}
                        {mode === "camera" ? "Record Video" : "Create Content"}
                    </h2>
                    {!isUploading && (
                        <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full dark:text-gray-400">
                            <X size={24} />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 font-sans">
                    {mode === "select" && (
                        <div className="flex flex-col gap-6">
                            <div
                                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-10 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer group"
                                onClick={() => document.getElementById("file-upload").click()}
                            >
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                    <Upload size={40} className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold dark:text-white mb-2">Upload Video</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Drag and drop or click to browse</p>
                                <input id="file-upload" type="file" accept="video/*" className="hidden" onChange={handleFileSelect} />
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1" />
                                <span className="text-gray-400 font-medium text-sm">OR</span>
                                <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1" />
                            </div>

                            <div
                                className="flex flex-col items-center justify-center border-2 border-gray-200 dark:border-gray-700 rounded-xl p-8 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer group"
                                onClick={startCamera}
                            >
                                <div className="bg-red-50 dark:bg-red-900/20 p-5 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                    <Camera size={40} className="text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold dark:text-white mb-2">Record Short / Video</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Use your built-in camera to record</p>
                            </div>
                        </div>
                    )}

                    {mode === "camera" && (
                        <div className="flex flex-col items-center gap-6 w-full">
                            <div className="relative w-full max-w-lg aspect-video bg-black rounded-xl overflow-hidden shadow-lg border border-gray-800">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover transform scale-x-[-1]"
                                />

                                {/* Recording Overlay Indicator */}
                                {isRecording && (
                                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/10 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                                        <span className="font-mono tracking-wider">{formatTime(recordTime)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col items-center gap-3">
                                {!isRecording ? (
                                    <button
                                        onClick={startRecording}
                                        className="w-16 h-16 rounded-full border-4 border-gray-200 dark:border-gray-800 bg-red-600 hover:bg-red-700 hover:scale-105 transition-all shadow-lg flex items-center justify-center"
                                        title="Start Recording"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-white/20" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={stopRecording}
                                        className="w-16 h-16 rounded-full border-4 border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 hover:scale-105 transition-all shadow-lg flex items-center justify-center group"
                                        title="Stop Recording"
                                    >
                                        <div className="w-6 h-6 bg-red-600 rounded-sm group-hover:bg-red-700" />
                                    </button>
                                )}
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {isRecording ? "Tap to stop" : "Tap to record"}
                                </p>
                            </div>
                        </div>
                    )}

                    {mode === "form" && (
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="w-full md:w-1/3 space-y-3">
                                    <div className="aspect-video bg-black rounded-lg overflow-hidden relative group shadow-md border dark:border-gray-800 flex items-center justify-center">
                                        {previewUrl ? (
                                            <video src={previewUrl} controls className="w-full h-full object-contain bg-black" />
                                        ) : (
                                            <div className="text-gray-500 text-sm">No preview available</div>
                                        )}
                                        <button onClick={reset} className="absolute inset-0 bg-black/60 hidden group-hover:flex items-center justify-center text-white backdrop-blur-sm transition-all" title="Discard">
                                            <Trash2 className="mr-2" size={20} /> Change
                                        </button>
                                    </div>
                                    <div className="text-xs text-center text-gray-500 font-medium truncate px-2" title={file?.name}>
                                        {file?.name || 'video_recording.webm'} {duration && `• ${duration}`}
                                    </div>
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Title (Required)</label>
                                        <input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#00A3FF] focus:border-transparent outline-none transition-all shadow-sm"
                                            placeholder="Give your video a catchy title..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#00A3FF] focus:border-transparent outline-none h-28 resize-none transition-all shadow-sm"
                                            placeholder="Tell viewers about your video..."
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 p-3.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => setIsShorts(!isShorts)}>
                                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isShorts ? 'bg-[#00A3FF] border-[#00A3FF]' : 'border-gray-300 dark:border-gray-600'}`}>
                                            {isShorts && <CheckCircle size={14} className="text-white" />}
                                        </div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                                            Upload as Short (Vertical Format)
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {isUploading && (
                                <div className="space-y-2 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                    <div className="flex justify-between text-sm font-bold text-blue-700 dark:text-blue-400">
                                        <span>Uploading & Processing...</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full bg-blue-200 dark:bg-blue-900/30 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-blue-600 dark:bg-[#00A3FF] h-2 rounded-full transition-all duration-300 ease-out"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-[#121212]">
                    <button
                        onClick={handleClose}
                        className="px-5 py-2.5 text-gray-600 dark:text-gray-400 font-semibold hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        disabled={isUploading}
                    >
                        Cancel
                    </button>
                    {mode === "form" && (
                        <button
                            onClick={handleUpload}
                            disabled={!title || isUploading}
                            className="px-6 py-2.5 bg-[#00A3FF] hover:bg-blue-600 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95"
                        >
                            {isUploading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Upload size={18} />
                            )}
                            {isUploading ? "Uploading..." : "Upload Video"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateUploadModal;
