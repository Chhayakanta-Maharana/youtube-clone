import { useAppData } from "../context/AppDataContext";
import VideoCard from "../components/VideoCard";

const History = () => {
    const { history } = useAppData();

    if (history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-10 mt-10 text-center">
                <div className="text-6xl mb-4">📜</div>
                <h2 className="text-2xl font-bold dark:text-white mb-2">Keep track of what you watch</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                    Watch history isn't viewable when signed out. Sign in to track your history.
                    (Actually, it works locally now!)
                </p>
                <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <p className="font-semibold dark:text-gray-200">Start watching videos to see them here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6">
            <h1 className="text-2xl font-bold mb-6 dark:text-white">Watch History</h1>
            <div className="space-y-4">
                {history.map((video, index) => (
                    // Displaying as a list (horizontal card style) could be better, reuse VideoCard or custom
                    <div key={`${video.id}-${index}`} className="flex gap-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-xl transition-colors">
                        <div className="w-40 md:w-64 aspect-video relative rounded-xl overflow-hidden flex-shrink-0">
                            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                            <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                                {video.duration}
                            </span>
                        </div>
                        <div className="flex flex-col flex-1 py-1">
                            <h3 className="text-base md:text-lg font-semibold line-clamp-2 dark:text-white leading-tight mb-1">
                                {video.title}
                            </h3>
                            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 flex flex-col gap-1">
                                <span className="hover:text-gray-900 dark:hover:text-white transition-colors">
                                    {video.channelName}
                                </span>
                                <span>{video.views} views • {video.timestamp}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-2 line-clamp-1 md:line-clamp-2 dark:text-gray-400 hidden md:block">
                                {video.description || "No description available for this video."}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default History;
