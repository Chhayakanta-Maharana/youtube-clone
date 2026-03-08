import { useLocation } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import VideoCard from "../components/VideoCard";

const Search = () => {
    const query = new URLSearchParams(useLocation().search).get("q");
    const { videos } = useAppData();

    const results = videos.filter(video =>
        (video.title + video.description + video.channelName).toLowerCase().includes((query || "").toLowerCase())
    );

    return (
        <div className="p-6">
            <h2 className="mb-4 text-lg font-semibold">
                Search results for "{query}"
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {results.length ? (
                    results.map(video => (
                        <VideoCard key={video.id} video={video} />
                    ))
                ) : (
                    <p>No videos found</p>
                )}
            </div>
        </div>
    );
};

export default Search;
