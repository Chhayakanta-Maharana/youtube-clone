import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { useAppData } from "../context/AppDataContext";
import UserAvatar from "./UserAvatar";

const VideoCard = ({ video, layout = "vertical" }) => {
    const navigate = useNavigate();
    const { updateVideo, usersList } = useAppData();
    const [duration, setDuration] = useState(video.duration || "0:00");

    // Self-healing metadata: If duration is 0:00, extract it and update backend
    useEffect(() => {
        if ((!video.duration || video.duration === "0:00") && video.videoUrl) {
            const vid = document.createElement("video");
            vid.src = video.videoUrl;
            vid.preload = "metadata";
            vid.onloadedmetadata = () => {
                const mins = Math.floor(vid.duration / 60);
                const secs = Math.floor(vid.duration % 60);
                const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;
                setDuration(timeStr);
                updateVideo({ ...video, duration: timeStr });
            };
        }
    }, [video.id, video.videoUrl]);

    // Aggressive Profile Sync: Always derive latest info from the global usersList (Source of Truth)
    const authorProfile = usersList?.find(u => 
        (video.userId && u.id === video.userId) || 
        (video.channelName && u.name === video.channelName && !video.channelName.startsWith("User-"))
    );
    const finalAvatar = authorProfile?.avatar || video.channelImage;
    const finalName = authorProfile?.name || video.channelName;

    const isHorizontal = layout === "horizontal";

    return (
        <div
            onClick={() => navigate(`/watch/${video.id}`)}
            className={`cursor-pointer group ${isHorizontal
                ? "flex gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-xl transition-colors"
                : "flex flex-col gap-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 rounded-xl"
                }`}
        >
            {/* Thumbnail */}
            <div className={`relative rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 ${isHorizontal ? "w-40 md:w-44 aspect-video" : "w-full aspect-video"
                }`}>
                {video.thumbnail ? (
                    <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                ) : (
                    <video
                        src={video.videoUrl}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        muted
                        loop
                        onMouseOver={(e) => e.target.play().catch(() => { })} // Auto-play preview on hover
                        onMouseOut={(e) => {
                            e.target.pause();
                            e.target.currentTime = 0; // Reset
                        }}
                    />
                )}
                <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded font-medium">
                    {duration}
                </span>
            </div>

            {/* Content */}
            <div className="flex gap-3 items-start flex-1 min-w-0">
                {/* Avatar (Only for vertical layout) */}
                {!isHorizontal && (
                    <UserAvatar 
                        name={finalName} 
                        avatar={finalAvatar} 
                        size="sm" 
                        className="mt-1"
                    />
                )}

                <div className="flex flex-col">
                    <h3 className={`font-semibold dark:text-white leading-tight ${isHorizontal ? "text-sm line-clamp-2" : "text-base line-clamp-2"}`}>
                        {video.title}
                    </h3>

                    <div className="text-gray-600 dark:text-gray-400 mt-1">
                        <div className="flex items-center gap-1 text-xs md:text-sm">
                            <span className="hover:text-gray-900 dark:hover:text-white transition-colors">
                                {finalName}
                            </span>
                            {video.verified && <CheckCircle size={12} className="text-gray-600 dark:text-gray-400" />}
                        </div>

                        <div className="text-xs md:text-sm">
                            {video.views} • {video.time || video.timestamp}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoCard;
