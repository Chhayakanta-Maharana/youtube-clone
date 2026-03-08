import { useAppData } from "../context/AppDataContext";
import { Trash2, PlayCircle, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Downloads = () => {
    const { downloads, removeDownload } = useAppData();
    const navigate = useNavigate();

    return (
        <div className="p-6 md:p-12 min-h-screen bg-gray-50 dark:bg-[#0f0f0f]">
            <div className="mb-8 border-b dark:border-gray-700 pb-4">
                <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
                    <Download className="text-red-600" size={32} />
                    Downloads
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Access your saved videos offline.
                </p>
            </div>

            {downloads.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {downloads.map((video) => (
                        <div key={video.id} className="group relative bg-white dark:bg-[#1e1e1e] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                            {/* Thumbnail */}
                            <div className="aspect-video bg-black relative">
                                {video.thumbnail ? (
                                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                ) : (
                                    <video src={video.videoUrl} className="w-full h-full object-cover" muted />
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
                                    <button
                                        onClick={() => navigate(`/watch/${video.id}`)}
                                        className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform shadow-xl"
                                        title="Watch Now"
                                    >
                                        <PlayCircle size={28} fill="currentColor" className="text-white bg-black rounded-full" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm("Remove this video from downloads?")) {
                                                removeDownload(video.id);
                                            }
                                        }}
                                        className="p-3 bg-red-600 text-white rounded-full hover:scale-110 transition-transform shadow-xl hover:bg-red-700"
                                        title="Delete Download"
                                    >
                                        <Trash2 size={24} />
                                    </button>
                                </div>
                                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-medium">
                                    Downloaded
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight mb-2">
                                    {video.title}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {video.channelName}
                                    </div>
                                    <span className="text-gray-400">•</span>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {video.views} views
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95">
                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                        <Download size={48} className="text-gray-400 dark:text-gray-600" />
                    </div>
                    <h2 className="text-xl font-bold dark:text-white mb-2">No downloads yet</h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                        Download videos to watch them later without an internet connection.
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="mt-6 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-full transition-colors shadow-lg shadow-red-600/20"
                    >
                        Explore Videos
                    </button>
                </div>
            )}
        </div>
    );
};

export default Downloads;
