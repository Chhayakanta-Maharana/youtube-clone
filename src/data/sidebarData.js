import { Home, Compass, PlaySquare, Clock, ThumbsUp, ShoppingBag, Music, Film as Movie, Gamepad2, Trophy, Flame, Newspaper, Lightbulb, Shirt, Podcast, HelpCircle, MessageSquare, Flag, MonitorPlay, History, Settings, Clapperboard, Radio } from "lucide-react";

export const mainMenuItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Compass, label: "Shorts", path: "/shorts" },
    { icon: MonitorPlay, label: "Subscriptions", path: "/subscriptions" }
];

export const subscriptionItems = [
    { label: "Anna Comedy", img: "https://i.pravatar.cc/150?u=anna", path: "/feed/Anna Comedy" },
    { label: "The Sham Sharma Show", img: "https://i.pravatar.cc/150?u=sham", path: "/feed/The Sham Sharma Show" },
    { label: "Debashish Sir's Academy", img: "https://i.pravatar.cc/150?u=debashish", path: "/feed/Debashish Sir's Academy" },
    { label: "take U forward", img: "https://i.pravatar.cc/150?u=tuf", path: "/feed/take U forward" },
    { label: "Gate Smashers", img: "https://i.pravatar.cc/150?u=gate", path: "/feed/Gate Smashers" },
    { label: "TechBar", img: "https://i.pravatar.cc/150?u=techbar", path: "/feed/TechBar" },
    { label: "Coding With Sagar", img: "https://i.pravatar.cc/150?u=sagar", path: "/feed/Coding With Sagar" }
];

export const youItems = [
    { icon: History, label: "History", path: "/history" },
    { icon: PlaySquare, label: "Playlists", path: "/playlists" },
    { icon: Clock, label: "Watch later", path: "/watch-later" },
    { icon: ThumbsUp, label: "Liked videos", path: "/liked" },
    { icon: MonitorPlay, label: "Your videos", path: "/your-videos" },
    { icon: Clapperboard, label: "Downloads", path: "/downloads" }
];

export const exploreItems = [
    { icon: Flame, label: "Trending", path: "/trending" },
    { icon: ShoppingBag, label: "Shopping", path: "/shopping" },
    { icon: Music, label: "Music", path: "/music" },
    { icon: Movie, label: "Movies", path: "/movies" },
    { icon: Radio, label: "Live", path: "/live" },
    { icon: Gamepad2, label: "Gaming", path: "/gaming" },
    { icon: Newspaper, label: "News", path: "/news" },
    { icon: Trophy, label: "Sports", path: "/sports" },
    { icon: Lightbulb, label: "Courses", path: "/courses" }, // Changed 'Learning' to 'Courses' or similar if needed, keeping generic icon
    { icon: Shirt, label: "Fashion & Beauty", path: "/fashion" },
    { icon: Podcast, label: "Podcasts", path: "/podcasts" }
];

export const moreItems = [
    { icon: MonitorPlay, label: "YouTube Premium", path: "/premium" },
    { icon: MonitorPlay, label: "YouTube Studio", path: "/studio" },
    { icon: Music, label: "YouTube Music", path: "/music-app" },
    { icon: MonitorPlay, label: "YouTube Kids", path: "/kids" }
];

export const helpItems = [
    { icon: Settings, label: "Settings", path: "/settings" },
    { icon: Flag, label: "Report history", path: "/report" },
    { icon: HelpCircle, label: "Help", path: "/help" },
    { icon: MessageSquare, label: "Send feedback", path: "/feedback" }
];
