import { useParams, useLocation } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import VideoCard from "../components/VideoCard";
import { Flame, Music, Gamepad2, Trophy, Newspaper, Clapperboard, MonitorPlay, Lightbulb, Shirt } from "lucide-react";

const categoryIcons = {
    trending: Flame,
    music: Music,
    gaming: Gamepad2,
    sports: Trophy,
    news: Newspaper,
    movies: Clapperboard,
    learning: Lightbulb,
    fashion: Shirt,
};

const Feed = () => {
    const { category: paramCategory } = useParams();
    const location = useLocation();

    // Fallback: If no param, take last part of URL path (e.g. /trending -> "trending")
    const category = paramCategory || location.pathname.substring(1);
    const { videos } = useAppData();

    // In a real app, we would fetchByTag(category). 
    // Here we just shuffle or filter dummy data for demo purposes.
    const categoryVideos = videos.filter(v =>
        v.title.toLowerCase().includes(category.toLowerCase()) ||
        v.description?.toLowerCase().includes(category.toLowerCase()) ||
        v.channelTitle?.toLowerCase().includes(category.toLowerCase()) ||
        v.channel?.toLowerCase().includes(category.toLowerCase()) ||
        v.category?.toLowerCase().includes(category.toLowerCase())
    );

    const Icon = categoryIcons[category] || Flame;
    const title = category.charAt(0).toUpperCase() + category.slice(1);

    return (
        <div className="p-4 md:p-6 lg:px-8">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <Icon size={32} className="text-red-600 dark:text-red-500" />
                </div>
                <h1 className="text-3xl font-bold dark:text-white">{title}</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {categoryVideos.map((video, index) => (
                    <VideoCard key={`${video.id}-${index}`} video={video} />
                ))}
            </div>
        </div>
    );
};

export default Feed;
