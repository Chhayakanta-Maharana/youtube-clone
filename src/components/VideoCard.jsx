import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const VideoCard = ({ video, layout = "vertical" }) => {
    const navigate = useNavigate();

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
                    {video.duration || "10:00"}
                </span>
            </div>

            {/* Content */}
            <div className="flex gap-3 items-start flex-1 min-w-0">
                {/* Avatar (Only for vertical layout) */}
                {!isHorizontal && (
                    video.channelImage ? (
                        <img
                            src={video.channelImage}
                            alt={video.channelName}
                            className="w-9 h-9 rounded-full mt-1 flex-shrink-0 object-cover"
                        />
                    ) : (
                        <div className="w-9 h-9 rounded-full mt-1 flex-shrink-0 bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                            {video.channelName ? video.channelName.charAt(0).toUpperCase() : "U"}
                        </div>
                    )
                )}

                <div className="flex flex-col">
                    <h3 className={`font-semibold dark:text-white leading-tight ${isHorizontal ? "text-sm line-clamp-2" : "text-base line-clamp-2"}`}>
                        {video.title}
                    </h3>

                    <div className="text-gray-600 dark:text-gray-400 mt-1">
                        <div className="flex items-center gap-1 text-xs md:text-sm">
                            <span className="hover:text-gray-900 dark:hover:text-white transition-colors">
                                {video.channel || video.channelName}
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
