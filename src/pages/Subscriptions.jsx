import { useAppData } from "../context/AppDataContext";
import VideoCard from "../components/VideoCard";
import { Crown, Sparkles } from "lucide-react";

const Subscriptions = () => {
    const { videos, subscriptions } = useAppData();

    // Mock "Premium Content" - just filtering or picking specific high-quality looking videos
    // In a real app, this would be a specific API call.
    const premiumContent = [
        {
            id: "prem-1",
            title: "Cobra Kai - Season 6 Trailer",
            thumbnail: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=800&q=80",
            channelName: "Netflix",
            channelImage: "https://i.pravatar.cc/150?u=netflix",
            views: "5.4M",
            timestamp: "2 days ago",
            duration: "2:45",
            verified: true,
            isPremium: true
        },
        {
            id: "prem-2",
            title: "Origin - Official Movie",
            thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80",
            channelName: "YouTube Originals",
            channelImage: "https://i.pravatar.cc/150?u=yt",
            views: "1.2M",
            timestamp: "1 week ago",
            duration: "1:54:30",
            verified: true,
            isPremium: true
        },
        {
            id: "prem-3",
            title: "Mind Field: Isolation",
            thumbnail: "https://images.unsplash.com/photo-1590845947698-8924d7409b56?w=800&q=80",
            channelName: "Vsauce",
            channelImage: "https://i.pravatar.cc/150?u=vsauce",
            views: "12M",
            timestamp: "3 years ago",
            duration: "24:10",
            verified: true,
            isPremium: true
        }
    ];

    // Filter videos matching subscribed channels
    const subscribedVideos = videos.filter(v =>
        subscriptions.some(sub => sub.name === v.channelName || sub.name === v.channel)
    );

    return (
        <div className="p-4 md:p-6 lg:px-8 max-w-7xl mx-auto">

            {/* YouTube Premium Section */}
            <div className="mb-10 animate-fade-in-down">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-gradient-to-r from-yellow-500 to-red-600 rounded-lg text-white shadow-lg">
                        <Crown size={24} fill="currentColor" />
                    </div>
                    <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        YouTube Premium <span className="text-xs font-normal px-2 py-0.5 border border-yellow-500 text-yellow-500 rounded uppercase">Originals</span>
                    </h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {premiumContent.map((video, idx) => (
                        <div key={idx} className="relative group cursor-pointer hover:scale-[1.02] transition-transform duration-300">
                            <div className="rounded-xl overflow-hidden aspect-video shadow-xl relative">
                                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                <span className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                    <Sparkles size={12} /> PREMIUM
                                </span>
                                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 rounded font-medium">
                                    {video.duration}
                                </span>
                            </div>
                            <h3 className="mt-3 font-bold dark:text-white text-lg leading-tight">{video.title}</h3>
                            <p className="text-gray-400 text-sm mt-1">{video.channelName} • {video.views} views</p>
                        </div>
                    ))}
                </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-800 mb-8" />

            {/* Subscribed Feed */}
            <div>
                <h2 className="text-xl font-bold dark:text-white mb-6">Latest from your subscriptions</h2>

                {subscribedVideos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {subscribedVideos.map(video => (
                            <VideoCard key={video.id} video={video} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                        <p>You haven't subscribed to any channels yet.</p>
                        <p className="text-sm mt-2">Subscribe to channels to see their latest videos here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Subscriptions;
