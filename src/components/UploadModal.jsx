import { useState, useRef } from "react";
import { X, Upload, Camera, Trash2 } from "lucide-react";
import { useAppData } from "../context/AppDataContext";

const UploadModal = ({ isOpen, onClose }) => {
    const [mode, setMode] = useState("select"); // select, file, camera
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isShorts, setIsShorts] = useState(false); // Shorts Toggle

    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recordedChunks, setRecordedChunks] = useState([]);

    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const { uploadVideo } = useAppData();

    if (!isOpen) return null;

    const reset = () => {
        setMode("select");
        setTitle("");
        setDescription("");
        setIsShorts(false);
        setFile(null);
        setPreviewUrl(null);
        setRecordedChunks([]);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleFileSelect = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setPreviewUrl(URL.createObjectURL(selected));
            setMode("form");
            setTitle(selected.name.split('.')[0]);
        }
    };

    const startCamera = async () => {
        setMode("camera");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access camera. Please check permissions.");
        }
    };

    const startRecording = () => {
        if (!streamRef.current) return;
        const recorder = new MediaRecorder(streamRef.current);
        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                setRecordedChunks(prev => [...prev, e.data]);
            }
        };
        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setIsRecording(false);
            // Wait a bit for the last chunk
            setTimeout(() => {
                const blob = new Blob(recordedChunks, { type: "video/webm" });
                setFile(blob);
                setPreviewUrl(URL.createObjectURL(blob));
                setMode("form");
                setTitle(`Recording ${new Date().toLocaleTimeString()}`);

                // Stop camera stream
                streamRef.current.getTracks().forEach(track => track.stop());
            }, 500);
        }
    };

    const handleUpload = async () => {
        if (!title || !file) return;

        const metaData = {
            title,
            description,
            isShorts, // Pass this flag
            thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
        };

        const success = await uploadVideo(file, metaData); // Pass file object for S3 mock
        if (success) {
            handleClose();
            alert("Video uploaded successfully to S3 and DynamoDB!");
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

            <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold dark:text-white">Create</h2>
                    <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full dark:text-gray-400">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {mode === "select" && (
                        <div className="flex flex-col gap-6">
                            <div
                                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-10 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                                onClick={() => document.getElementById("file-upload").click()}
                            >
                                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-4">
                                    <Upload size={40} className="text-gray-500 dark:text-gray-300" />
                                </div>
                                <h3 className="text-lg font-semibold dark:text-white">Upload Video</h3>
                                <p className="text-gray-500 text-sm mt-2">Select video files to upload</p>
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                            </div>

                            <div className="text-center text-gray-500 dark:text-gray-400 font-medium">OR</div>

                            <div
                                className="flex flex-col items-center justify-center border-2 border-gray-200 dark:border-gray-700 rounded-xl p-8 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                                onClick={startCamera}
                            >
                                <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full mb-4">
                                    <Camera size={40} className="text-red-600 dark:text-red-400" />
                                </div>
                                <h3 className="text-lg font-semibold dark:text-white">Record Short / Video</h3>
                                <p className="text-gray-500 text-sm mt-2">Use your camera to record directly</p>
                            </div>
                        </div>
                    )}

                    {mode === "camera" && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                                {isRecording && (
                                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm animate-pulse">
                                        <div className="w-2 h-2 bg-white rounded-full" />
                                        Recording...
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4">
                                {!isRecording ? (
                                    <button
                                        onClick={startRecording}
                                        className="w-16 h-16 rounded-full border-4 border-white bg-red-600 hover:scale-105 transition-transform shadow-lg focus:outline-none ring-2 ring-red-500 ring-offset-2 dark:ring-offset-gray-800"
                                    />
                                ) : (
                                    <button
                                        onClick={stopRecording}
                                        className="w-16 h-16 rounded-full border-4 border-white bg-gray-800 flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                                    >
                                        <div className="w-6 h-6 bg-red-600 rounded-sm" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {mode === "form" && (
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-1/3 aspect-video bg-black rounded-lg overflow-hidden relative group">
                                    {previewUrl && <video src={previewUrl} className="w-full h-full object-cover" />}
                                    <button onClick={reset} className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center text-white">
                                        <Trash2 /> Change
                                    </button>
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                        <input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Video title"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                                            placeholder="Tell viewers about your video"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="shorts-toggle"
                                            checked={isShorts}
                                            onChange={(e) => setIsShorts(e.target.checked)}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <label htmlFor="shorts-toggle" className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload as Short</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50">
                    <button onClick={handleClose} className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={mode !== "form" || !title}
                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Upload size={18} /> Upload
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadModal;
