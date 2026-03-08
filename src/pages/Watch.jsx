import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";
import VideoCard from "../components/VideoCard";
import { ThumbsUp, ThumbsDown, Share, Download, MoreHorizontal, Bell, Scissors, Bookmark } from "lucide-react";

const Watch = () => {
    const { id } = useParams();
    const { videos, addToHistory, isSubscribed, toggleSubscription, downloadVideo, incrementViewCount, toggleLike, toggleDislike, addComment } = useAppData();
    const { user } = useAuth(); // Need user for comment avatar and logic checks
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [commentText, setCommentText] = useState("");

    const video = videos.find(v => v.id === id);
    const recommended = videos.filter(v => v.id !== id);

    useEffect(() => {
        if (video) {
            addToHistory(video);
            incrementViewCount(video.id);
            window.scrollTo(0, 0);
        }
    }, [id, video?.id]);

    if (!video) {
        return <div className="p-10 text-center dark:text-gray-200 mt-14">Video not found.</div>;
    }

    const subscribed = isSubscribed(video.channelName);
    const isLiked = video.likedBy?.includes(user?.id);
    const isDisliked = video.dislikedBy?.includes(user?.id);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: video.title,
                text: `Check out this video: ${video.title}`,
                url: window.location.href,
            }).catch(console.error);
        } else {
            alert("Share Link Copied: " + window.location.href);
            navigator.clipboard.writeText(window.location.href);
        }
    };

    const handleCommentSubmit = (e) => {
        if (e.key === 'Enter' && commentText.trim()) {
            addComment(video.id, commentText);
            setCommentText("");
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6 lg:px-12 bg-gray-50 dark:bg-[#0f0f0f] min-h-screen">
            {/* Main Content */}
            <div className="flex-1 w-full lg:max-w-[calc(100%-400px)]">
                {/* Video Player Container */}
                <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative">
                    <video
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                        poster={video.thumbnail}
                    >
                        <source src={video.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>

                {/* Video Title */}
                <h1 className="mt-4 text-xl md:text-2xl font-bold dark:text-gray-100 line-clamp-2">
                    {video.title}
                </h1>

                {/* Channel & Actions Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mt-4 gap-4">

                    {/* Left: Channel Info */}
                    <div className="flex items-center gap-4 min-w-fit">
                        {video.channelImage ? (
                            <img
                                src={video.channelImage}
                                alt={video.channelName}
                                className="w-10 h-10 rounded-full border dark:border-gray-700 object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg">
                                {video.channelName ? video.channelName.charAt(0).toUpperCase() : "U"}
                            </div>
                        )}
                        <div>
                            <h3 className="font-bold dark:text-white text-base">
                                {video.channelName}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {video.subscribers || "0"} subscribers
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button className="px-4 py-2 rounded-full font-medium text-sm border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white transition-colors">
                                Join
                            </button>
                            <button
                                onClick={() => toggleSubscription({ name: video.channelName, img: video.channelImage })}
                                className={`px-4 py-2 rounded-full font-medium text-sm transition-colors flex items-center gap-2 ${subscribed
                                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 border dark:border-gray-700"
                                    : "bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                                    }`}
                            >
                                {subscribed ? (
                                    <>
                                        <Bell size={18} /> Subscribed
                                    </>
                                ) : "Subscribe"}
                            </button>
                        </div>
                    </div>

                    {/* Right: Actions (Like, Share, Download...) */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        <div className="flex items-center bg-gray-100 dark:bg-[#272727] rounded-full h-9">
                            <button
                                onClick={() => toggleLike(video.id)}
                                className={`flex items-center gap-2 px-4 h-full hover:bg-gray-200 dark:hover:bg-gray-600 rounded-l-full border-r border-gray-300 dark:border-gray-600 font-medium text-sm ${isLiked ? "text-blue-600 dark:text-blue-400" : "dark:text-white"}`}
                            >
                                <ThumbsUp size={18} fill={isLiked ? "currentColor" : "none"} />
                                <span>{video.likes || "0"}</span>
                            </button>
                            <button
                                onClick={() => toggleDislike(video.id)}
                                className={`px-3 h-full hover:bg-gray-200 dark:hover:bg-gray-600 rounded-r-full ${isDisliked ? "text-blue-600 dark:text-blue-400" : "dark:text-white"}`}
                            >
                                <ThumbsDown size={18} fill={isDisliked ? "currentColor" : "none"} />
                            </button>
                        </div>
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#272727] hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full dark:text-white font-medium text-sm whitespace-nowrap"
                        >
                            <Share size={18} /> Share
                        </button>
                        <button
                            onClick={() => downloadVideo(video)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#272727] hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full dark:text-white font-medium text-sm whitespace-nowrap"
                        >
                            <Download size={18} /> Download
                        </button>
                    </div>
                </div>

                {/* Description Box */}
                <div
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className={`mt-4 bg-gray-100 dark:bg-[#272727] p-3 rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-[#3f3f3f] transition-colors relative group ${isDescriptionExpanded ? "" : "h-28 overflow-hidden"}`}
                >
                    <p className="text-sm font-bold dark:text-white mb-2">
                        {video.views || "0"} views • {video.timestamp}
                    </p>
                    <p className="text-sm dark:text-gray-100 whitespace-pre-line leading-relaxed">
                        {video.description || "No description provided."}
                    </p>
                    {!isDescriptionExpanded && (
                        <div className="absolute bottom-1 right-2 font-bold text-sm dark:text-white bg-gray-100 dark:bg-[#272727] px-2 rounded">
                            ...more
                        </div>
                    )}
                </div>

                {/* Comments Section */}
                <div className="mt-6">
                    <h3 className="text-xl font-bold dark:text-white mb-6">{video.comments?.length || 0} Comments</h3>

                    {/* Add Comment */}
                    <div className="flex gap-4 mb-8">
                        <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                            {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : (user?.name?.charAt(0) || "G")}
                        </div>
                        <div className="flex-1">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={handleCommentSubmit}
                                placeholder="Add a comment..."
                                className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 py-1 text-sm dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                            />
                        </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-6">
                        {video.comments?.map((comment) => (
                            <div key={comment.id} className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 text-white flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                                    {comment.userAvatar ? <img src={comment.userAvatar} className="w-full h-full object-cover" /> : comment.userName?.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-bold dark:text-white">@{comment.userName}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{comment.timestamp}</span>
                                    </div>
                                    <p className="text-sm dark:text-gray-200">{comment.text}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <button className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white text-xs font-semibold">
                                            <ThumbsUp size={14} />
                                        </button>
                                        <button className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white text-xs font-semibold">
                                            <ThumbsDown size={14} />
                                        </button>
                                        <button className="text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-300">Reply</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recommendations Sidebar */}
            <div className="lg:w-[350px] xl:w-[400px] flex-shrink-0 w-full">
                <div className="flex flex-col gap-2">
                    {recommended.map((v, i) => (
                        <div key={i} className="w-full">
                            <VideoCard video={v} layout="horizontal" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Watch;
