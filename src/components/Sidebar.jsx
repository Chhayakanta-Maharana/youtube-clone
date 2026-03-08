import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
    mainMenuItems,
    subscriptionItems as dummySubscriptions,
    youItems,
    exploreItems,
    moreItems,
    helpItems
} from "../data/sidebarData";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";
import { Home, Compass, PlaySquare, Clock, Download, Trophy } from "lucide-react";

// Mini Sidebar Items
const miniItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Compass, label: "Shorts", path: "/" },
    { icon: PlaySquare, label: "Subs", path: "/subscriptions" },
    { icon: Download, label: "Downloads", path: "/downloads" }, // New Download Item
    { icon: Clock, label: "You", path: "/history" },
];

const MiniItem = ({ item, navigate }) => (
    <div
        onClick={() => navigate(item.path)}
        className="flex flex-col items-center justify-center p-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer gap-1"
    >
        <item.icon size={24} className="dark:text-white" />
        <span className="text-[10px] dark:text-gray-300 text-center truncate w-full">{item.label}</span>
    </div>
);

const SidebarSection = ({ title, items, isSubscription = false, navigate }) => (
    <div className="py-2 border-b dark:border-gray-700">
        {title && (
            <h3 className="px-4 py-2 text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {title} {title === "You" && <span className="text-xs">›</span>}
            </h3>
        )}
        {items.map((item, index) => (
            <div
                key={index}
                onClick={() => item.path && navigate(item.path)}
                className="flex items-center gap-4 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded-lg mx-2"
            >
                {isSubscription ? (
                    (item.img || item.channelImage) ? (
                        <img
                            src={item.img || item.channelImage}
                            alt={item.label || item.name}
                            className="w-6 h-6 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                            {(item.label || item.name || "U").charAt(0).toUpperCase()}
                        </div>
                    )
                ) : (
                    <item.icon size={22} className={title === "Home" && index === 0 ? "fill-current" : ""} />
                )}
                <span className="text-sm font-medium truncate flex-1 dark:text-gray-100">
                    {item.label || item.name}
                </span>
                {item.isLive && <div className="w-1 h-1 bg-red-600 rounded-full" />}
            </div>
        ))}
        {/* Removed duplicate Show more from here */}
    </div>
);

const Sidebar = ({ isMobileOpen, closeMobileMenu, isExpanded }) => {
    const navigate = useNavigate();
    const { subscriptions } = useAppData();
    const { user } = useAuth();
    const [isSubsExpanded, setIsSubsExpanded] = useState(false);

    // STRICT: Only show subscriptions if logged in. No dummy data for guests.
    const effectiveSubscriptions = user ? subscriptions : [];

    return (
        <>
            {/* Mobile Drawer (Overlay) */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={closeMobileMenu}
            />
            <div className={`fixed top-14 left-0 h-full w-60 bg-white dark:bg-[#0f0f0f] z-50 transform transition-transform duration-300 md:hidden ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} overflow-y-auto pb-20`}>
                <SidebarSection items={mainMenuItems} navigate={navigate} />
                <SidebarSection title="You" items={youItems} navigate={navigate} />
                {effectiveSubscriptions.length > 0 ? (
                    <SidebarSection title="Subscriptions" items={effectiveSubscriptions} isSubscription={true} navigate={navigate} />
                ) : (
                    <div className="py-2 border-b dark:border-gray-700 px-6">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Subscriptions</h3>
                        <p className="text-sm text-gray-500">Sign in to subscribe to channels.</p>
                    </div>
                )}
                <SidebarSection title="Explore" items={exploreItems} navigate={navigate} />
                <SidebarSection title="More from Tecktube" items={moreItems} navigate={navigate} />
                <SidebarSection items={helpItems} navigate={navigate} />
            </div>

            {/* Desktop Sidebar (Fixed) */}
            {!isExpanded ? (
                <aside className="w-20 bg-white dark:bg-[#0f0f0f] h-[calc(100vh-3.5rem)] fixed left-0 top-14 hidden md:flex flex-col z-20 overflow-hidden hover:overflow-y-auto scrollbar-thin">
                    {miniItems.map((item, i) => <MiniItem key={i} item={item} navigate={navigate} />)}
                </aside>
            ) : (
                <aside className="w-60 bg-white dark:bg-[#0f0f0f] h-[calc(100vh-3.5rem)] overflow-y-auto fixed left-0 top-14 pb-4 hidden md:block scrollbar-hover z-20 border-r dark:border-gray-800 animate-slide-up">
                    <SidebarSection items={mainMenuItems} navigate={navigate} />

                    <div className="py-2 border-b dark:border-gray-700">
                        <h3 onClick={() => navigate('/feed/you')} className="px-4 py-2 text-base font-semibold text-gray-900 dark:text-white flex items-center gap-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg mx-2 transition-colors">
                            You <span className="text-sm">›</span>
                        </h3>
                        {youItems.map((item, index) => (
                            <div
                                key={index}
                                onClick={() => navigate(item.path)}
                                className="flex items-center gap-4 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded-lg mx-2 transition-transform hover:scale-105"
                            >
                                <item.icon size={22} className="group-hover:text-[#00A3FF] transition-colors" />
                                <span className="text-sm font-medium truncate flex-1 dark:text-gray-100">
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {effectiveSubscriptions.length > 0 ? (
                        <>
                            <SidebarSection
                                title="Subscriptions"
                                items={isSubsExpanded ? effectiveSubscriptions : effectiveSubscriptions.slice(0, 5)}
                                isSubscription={true}
                                navigate={navigate}
                            />
                            {effectiveSubscriptions.length > 5 && (
                                <div
                                    onClick={() => setIsSubsExpanded(!isSubsExpanded)}
                                    className="flex items-center gap-4 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded-lg mx-2 transition-colors"
                                >
                                    <div className="w-6 flex justify-center">
                                        <span className="text-xl dark:text-gray-300">{isSubsExpanded ? "⌃" : "⌄"}</span>
                                    </div>
                                    <span className="text-sm font-medium dark:text-gray-100">{isSubsExpanded ? "Show less" : "Show more"}</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="py-2 border-b dark:border-gray-700 px-6">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Subscriptions</h3>
                            <p className="text-sm text-gray-500">Sign in to subscribe to channels.</p>
                        </div>
                    )}
                    <SidebarSection title="Explore" items={exploreItems} navigate={navigate} />
                    <SidebarSection title="More from Tecktube" items={moreItems} navigate={navigate} />
                    <SidebarSection items={helpItems} navigate={navigate} />

                    <div className="px-6 py-4 text-[13px] font-semibold text-[#606060] dark:text-[#AAAAAA] space-y-3">
                        <p>About Press Copyright Contact us Creators Advertise Developers</p>
                        <p>Terms Privacy Policy & Safety How Tecktube works Test new features</p>
                        <p className="font-normal text-[#909090] dark:text-[#717171]">© 2026 Tecktube Inc.</p>
                    </div>
                </aside>
            )}
        </>
    );
};

export default Sidebar;
