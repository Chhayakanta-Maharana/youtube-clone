import VideoGrid from "../components/VideoGrid";
import CategoryBar from "../components/CategoryBar";
import { useAppData } from "../context/AppDataContext";

const Home = () => {
    const { videos, isLoading, selectedCategory } = useAppData();

    const filteredVideos = selectedCategory === "All"
        ? videos
        : videos.filter(video => {
            // Check title, description, or explicit category field if it exists
            const searchContent = (video.title + video.description + (video.category || "")).toLowerCase();
            return searchContent.includes(selectedCategory.toLowerCase());
        });

    if (isLoading) {
        return (
            <div className="flex flex-col h-full">
                <CategoryBar />
                <div className="pt-4 px-4 pb-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex flex-col gap-2">
                            <div className="w-full h-48 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                            <div className="flex gap-2">
                                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full" />
                                <div className="flex flex-col gap-2 w-full">
                                    <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
                                    <div className="w-1/2 h-3 bg-gray-200 dark:bg-gray-800 rounded" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <CategoryBar />
            <div className="pt-4 px-4 pb-20">
                <VideoGrid videos={filteredVideos} />
            </div>
        </div>
    );
}

export default Home;
