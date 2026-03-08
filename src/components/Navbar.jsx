import { Search, Sun, Moon, Menu, Video, Bell, User, Mic, ArrowLeft, LogOut, Sparkles } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import LoginModal from "./LoginModal";
import CreateUploadModal from "./CreateUploadModal";
import TeckyChat from "./TeckyChat";
import logo from "../assets/logo.png";

const Navbar = ({ toggleSidebar }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Initialize query from URL if available
    const [query, setQuery] = useState(() => {
        const params = new URLSearchParams(location.search);
        return params.get("q") || "";
    });

    // Update query when URL changes (e.g. back button)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get("q");
        if (q !== null) {
            setQuery(q);
        }
    }, [location.search]);

    const [isMobileSearch, setIsMobileSearch] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
    const [isTeckyOpen, setIsTeckyOpen] = useState(false);

    const { dark, setDark } = useTheme();
    const { user, logout } = useAuth();

    const handleSearch = () => {
        if (query.trim()) {
            navigate(`/search?q=${query}`);
            setIsMobileSearch(false);
        }
    };

    return (
        <>
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
            <CreateUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
            <TeckyChat isOpen={isTeckyOpen} onClose={() => setIsTeckyOpen(false)} />

            <div className="flex items-center justify-between px-4 md:px-6 h-14 fixed w-full bg-white dark:bg-[#0f0f0f] z-50 border-b dark:border-gray-700 font-sans">
                {/* Mobile Search Overlay */}
                {isMobileSearch ? (
                    <div className="flex w-full items-center gap-4 animate-fade-in">
                        <button onClick={() => setIsMobileSearch(false)} className="p-2 dark:text-white">
                            <ArrowLeft size={24} />
                        </button>
                        <div className="flex flex-1 items-center">
                            <input
                                className="w-full border border-gray-300 px-4 py-2 rounded-l-full focus:outline-none focus:border-[#00A3FF] dark:bg-[#121212] dark:border-gray-700 dark:text-white h-10"
                                placeholder="Search Tecktube"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                autoFocus
                            />
                            <button
                                onClick={handleSearch}
                                className="bg-gray-100 border border-l-0 border-gray-300 px-5 rounded-r-full hover:bg-gray-200 dark:bg-gray-800 dark:border-gray-700 h-10 flex items-center justify-center hover:bg-[#00A3FF] hover:text-white transition-colors"
                            >
                                <Search size={20} className="dark:text-white hover:text-white" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-2 md:gap-4">
                            <button
                                onClick={toggleSidebar}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full md:hidden"
                            >
                                <Menu size={24} className="dark:text-white" />
                            </button>
                            <button
                                onClick={toggleSidebar}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full hidden md:block hover-glow transition-all"
                            >
                                <Menu size={24} className="dark:text-white" />
                            </button>
                            <div
                                onClick={() => navigate("/")}
                                className="flex items-center gap-2 cursor-pointer group"
                            >
                                <img src={logo} alt="Tecktube Logo" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
                                <span className="text-xl font-bold tracking-tighter dark:text-white relative font-sans">
                                    Teck<span className="text-[#00A3FF]">tube</span>
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center w-1/2 gap-4 hidden md:flex">
                            <div className="flex flex-1 items-center">
                                <input
                                    className="w-full border border-gray-300 px-4 py-2 rounded-l-full focus:outline-none focus:border-[#00A3FF] dark:bg-gray-900 dark:border-gray-700 dark:text-white h-10 transition-colors"
                                    placeholder="Search"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                />
                                <button
                                    onClick={handleSearch}
                                    className="bg-gray-100 border border-l-0 border-gray-300 px-5 rounded-r-full hover:bg-gray-200 dark:bg-gray-800 dark:border-gray-700 h-10 flex items-center justify-center transition-colors group"
                                >
                                    <Search size={20} className="dark:text-white group-hover:text-[#00A3FF]" />
                                </button>
                            </div>
                            <button
                                onClick={() => {
                                    if ('webkitSpeechRecognition' in window) {
                                        const recognition = new window.webkitSpeechRecognition();
                                        recognition.continuous = false;
                                        recognition.lang = 'en-US';

                                        recognition.onstart = () => {
                                            // Optional: Show listening UI state here if wanted
                                            // For now we just rely on browser permission popup
                                        };

                                        recognition.onresult = (event) => {
                                            const transcript = event.results[0][0].transcript;
                                            setQuery(transcript);
                                            navigate(`/search?q=${transcript}`);
                                        };

                                        recognition.onerror = (event) => {
                                            console.error("Speech recognition error", event.error);
                                            alert("Voice search failed. Please try again.");
                                        };

                                        recognition.start();
                                    } else {
                                        alert("Voice search is not supported in this browser.");
                                    }
                                }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full bg-gray-100 dark:bg-gray-800 transition-colors"
                            >
                                <Mic size={20} className="dark:text-white" />
                            </button>

                            {/* Ask Tecky Button */}
                            <button
                                onClick={() => setIsTeckyOpen(!isTeckyOpen)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#00A3FF] to-[#0077FF] text-white rounded-full hover:shadow-lg hover:brightness-110 transition-all transform hover:-translate-y-0.5"
                            >
                                <Sparkles size={16} />
                                <span className="text-sm font-semibold hidden lg:inline">Ask Tecky</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-1 md:gap-3">
                            <button
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full dark:text-white md:hidden"
                                onClick={() => setIsMobileSearch(true)}
                            >
                                <Search size={24} />
                            </button>

                            {/* SHOW CAMERA ONLY IF LOGGED IN */}
                            {user && (
                                <button
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full dark:text-white hidden md:block hover:text-[#00A3FF] transition-colors"
                                    onClick={() => setIsUploadModalOpen(true)}
                                    title="Create"
                                >
                                    <Video size={24} />
                                </button>
                            )}

                            <div className="relative group hidden md:block">
                                <button
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full dark:text-white hover:text-[#00A3FF] transition-colors"
                                    title="Notifications"
                                >
                                    <Bell size={24} />
                                </button>
                                <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-xl rounded-xl p-4 hidden group-hover:block group-focus-within:block z-50 animate-fade-in">
                                    <h3 className="font-semibold mb-2 dark:text-white">Notifications</h3>
                                    <p className="text-sm text-gray-500">Latest recommendations will appear here.</p>
                                </div>
                            </div>

                            <button onClick={() => setDark(!dark)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full dark:text-white hover:text-[#00A3FF] transition-colors">
                                {dark ? <Sun size={24} /> : <Moon size={24} />}
                            </button>

                            {user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                                        className="focus:outline-none"
                                    >
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt="Avatar"
                                                className="w-8 h-8 rounded-full cursor-pointer border-2 border-transparent hover:border-[#00A3FF] transition-colors"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-[#00A3FF] text-white flex items-center justify-center font-bold text-sm cursor-pointer select-none ring-2 ring-transparent hover:ring-[#0077FF] transition-all">
                                                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                                            </div>
                                        )}
                                    </button>

                                    {isAccountDropdownOpen && (
                                        <div className="absolute right-0 top-12 w-64 bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-xl rounded-xl py-2 z-50 animate-fade-in">
                                            <div className="px-4 py-3 border-b dark:border-gray-700">
                                                <p className="text-sm font-semibold dark:text-white">{user.name || "User"}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    navigate("/account");
                                                    setIsAccountDropdownOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-gray-200"
                                            >
                                                <User size={18} />
                                                My Account
                                            </button>

                                            <button
                                                onClick={() => {
                                                    logout();
                                                    setIsAccountDropdownOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                <LogOut size={18} />
                                                Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsLoginModalOpen(true)}
                                    className="p-1 px-3 text-[#00A3FF] border border-[#00A3FF]/30 rounded-full flex gap-1 items-center font-medium hover:bg-[#00A3FF]/10 dark:border-[#00A3FF]/50 transition-colors"
                                >
                                    <User size={20} />
                                    <span className="hidden sm:inline">Sign in</span>
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default Navbar;
