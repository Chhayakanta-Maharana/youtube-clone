import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile drawer
    const [isExpanded, setIsExpanded] = useState(true); // Desktop sidebar

    const toggleSidebar = () => {
        // Toggle based on screen size could be handled here or just simple toggles
        // For now, let's assume this button toggles both contexts depending on view, 
        // but typically the navbar button toggles the mobile drawer on mobile and the desktop collapse on desktop.
        if (window.innerWidth < 768) {
            setIsSidebarOpen(!isSidebarOpen);
        } else {
            setIsExpanded(!isExpanded);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#0f0f0f] text-black dark:text-white">
            <Navbar toggleSidebar={toggleSidebar} />

            <div className="flex flex-1 pt-14">
                <Sidebar
                    isMobileOpen={isSidebarOpen}
                    closeMobileMenu={() => setIsSidebarOpen(false)}
                    isExpanded={isExpanded}
                />

                <main
                    className={`flex-1 transition-all duration-300 ${isExpanded ? "md:ml-60" : "md:ml-20"
                        } overflow-x-hidden`}
                >
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
