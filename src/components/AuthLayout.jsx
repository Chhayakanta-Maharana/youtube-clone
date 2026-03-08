import { Play, Sparkles } from "lucide-react";
import logo from "../assets/logo.png";

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-[#050505] px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">

            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] bg-[#00A3FF]/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute -bottom-[20%] -left-[10%] w-[70vw] h-[70vw] bg-purple-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />
            </div>

            {/* Main Card */}
            <div className="bg-white dark:bg-[#0f0f0f] w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden relative z-10 flex flex-col md:flex-row min-h-[700px] transition-all duration-300 border dark:border-gray-800">

                {/* Brand Side */}
                <div className="w-full md:w-5/12 bg-gradient-to-br from-[#0f0f0f] via-[#121212] to-[#001a2c] p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#00A3FF]/20 rounded-full blur-3xl" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <img src={logo} alt="Tecktube Logo" className="w-12 h-12 object-contain" />
                            <span className="text-2xl font-bold tracking-tighter">Teck<span className="text-[#00A3FF]">tube</span></span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
                            Future of <br /> <span className="text-[#00A3FF]">Tech Streaming.</span>
                        </h1>
                        <p className="text-gray-400 text-lg font-light opacity-90">
                            Join the premier community for developers, innovators, and creators.
                        </p>
                    </div>

                    <div className="relative z-10 mt-12 md:mt-0 space-y-4 hidden md:block">
                        {[
                            { text: "Curated Tech Content", icon: <Play size={18} /> },
                            { text: "AI-Powered Assistance", icon: <Sparkles size={18} /> },
                            { text: "Premium 4K Streaming", icon: <Play size={18} /> }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default group">
                                <div className="w-10 h-10 rounded-full bg-[#00A3FF]/20 text-[#00A3FF] flex items-center justify-center font-bold shadow-sm group-hover:bg-[#00A3FF] group-hover:text-white transition-all">
                                    {item.icon}
                                </div>
                                <span className="font-medium text-lg text-gray-200">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Side Container */}
                <div className="w-full md:w-7/12 p-8 md:p-16 flex flex-col justify-center bg-white dark:bg-[#0f0f0f]">
                    <div className="mb-10 text-center md:text-left">
                        <h2 className="text-4xl font-bold dark:text-white mb-3 tracking-tight">
                            {title}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                            {subtitle}
                        </p>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
