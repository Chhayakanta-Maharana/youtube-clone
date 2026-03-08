import { useAppData } from "../context/AppDataContext";
import { Play, ThumbsUp, MessageSquare, Share2 } from "lucide-react";
import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Shorts = () => {
    const { videos } = useAppData();
    const navigate = useNavigate();

    // Filter only shorts
    const shortVideos = videos.filter(video => video.isShorts === true);

    if (shortVideos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 dark:text-white h-[80vh]">
                <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mb-6 rotate-3">
                    <Play size={32} fill="white" className="text-white ml-1" />
                </div>
                <h2 className="text-2xl font-bold mb-2">No Shorts yet</h2>
                <p className="text-gray-400 mb-6">Upload vertical videos or mark them as "Shorts" to see them here.</p>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate("/")}
                        className="px-6 py-2 bg-gray-100 dark:bg-gray-800 rounded-full font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    >
                        Go Home
                    </button>
                    {/* The upload modal is in Navbar, so we guide them there or they can just click create */}
                </div>
            </div>
        );
    }

    return (
        <div className="snap-y snap-mandatory h-[calc(100vh-3.5rem)] overflow-y-scroll no-scrollbar bg-black flex justify-center">
            <div className="w-full max-w-sm sm:max-w-md h-full">
                {shortVideos.map((video) => (
                    <ShortItem key={video.id} video={video} />
                ))}
            </div>
        </div>
    );
};

const ShortItem = ({ video }) => {
    const videoRef = useRef(null);

    const togglePlay = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
            } else {
                videoRef.current.pause();
            }
        }
    };

    // Auto-play when in view using IntersectionObserver
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!videoRef.current) return;

                if (entry.isIntersecting) {
                    videoRef.current.play().catch(e => console.log("Autoplay blocked", e));
                    videoRef.current.currentTime = 0; // Restart on scroll into view like TikTok/Reels
                } else {
                    videoRef.current.pause();
                }
            },
            { threshold: 0.6 } // Play when 60% visible
        );

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => {
            if (videoRef.current) {
                observer.unobserve(videoRef.current);
            }
        };
    }, []);

    return (
        <div className="snap-start h-[calc(100vh-3.5rem)] w-full relative flex items-center justify-center bg-black py-4">
            {/* Video Container - Aspect Ratio 9:16 approx */}
            <div className="relative h-full w-full bg-[#111] rounded-xl overflow-hidden shadow-2xl group">
                <video
                    ref={videoRef}
                    onClick={togglePlay}
                    src={video.videoUrl}
                    poster={video.thumbnail || ""}
                    className="h-full w-full object-cover cursor-pointer"
                    loop
                    playsInline
                />

                {/* Play/Pause Overlay Icon (Optional) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Add play icon here if paused */}
                </div>

                {/* Overlay Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent pt-20">
                    <div className="flex items-end justify-between">
                        {/* Info */}
                        <div className="text-white flex-1 pr-12">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-full bg-gray-500 overflow-hidden border border-white/20">
                                    {video.channelImage ? (
                                        <img src={video.channelImage} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-purple-600 flex items-center justify-center font-bold text-xs">{video.channelName?.charAt(0)}</div>
                                    )}
                                </div>
                                <span className="font-bold text-sm">@{video.channelName}</span>
                                <button className="px-3 py-1 bg-white text-black text-xs font-bold rounded-full hover:bg-gray-200 transition">Subscribe</button>
                            </div>
                            <h3 className="font-medium text-sm line-clamp-2 mb-2">{video.title}</h3>
                            <p className="text-xs text-gray-300 line-clamp-1">{video.description}</p>
                        </div>

                        {/* Side Actions */}
                        <div className="flex flex-col gap-6 items-center w-12 pb-2">
                            <div className="flex flex-col items-center gap-1 group cursor-pointer">
                                <div className="w-10 h-10 bg-gray-800/60 rounded-full flex items-center justify-center group-hover:bg-gray-700 backdrop-blur-sm transition">
                                    <ThumbsUp size={20} className="text-white" />
                                </div>
                                <span className="text-xs font-bold text-white">Like</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 group cursor-pointer">
                                <div className="w-10 h-10 bg-gray-800/60 rounded-full flex items-center justify-center group-hover:bg-gray-700 backdrop-blur-sm transition">
                                    <MessageSquare size={20} className="text-white" />
                                </div>
                                <span className="text-xs font-bold text-white">245</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 group cursor-pointer">
                                <div className="w-10 h-10 bg-gray-800/60 rounded-full flex items-center justify-center group-hover:bg-gray-700 backdrop-blur-sm transition">
                                    <Share2 size={20} className="text-white" />
                                </div>
                                <span className="text-xs font-bold text-white">Share</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Shorts;
