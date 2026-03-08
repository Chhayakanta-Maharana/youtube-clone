import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Plus, MessageSquare, Menu, X } from "lucide-react";

// Simulated AI "Knowledge Base" for dynamic response generation
const generateAIResponse = (input) => {
    const lower = input.toLowerCase();

    if (lower.includes("hello") || lower.includes("hi")) {
        return "Hello! I'm your YouTube AI assistant. I can help you discover videos, summarize content, or answer questions. What's on your mind today?";
    }
    if (lower.includes("recipe") || lower.includes("cook")) {
        return "Cooking sounds fun! I'd recommend checking out channels like **Bon Appétit** or **Gordon Ramsay**. I found a trending video: *'Mastering Pasta in 5 Minutes'*. Would you like me to play it?";
    }
    if (lower.includes("code") || lower.includes("program")) {
        return "For coding, I highly recommend **Traversy Media** or **Web Dev Simplified**. There's a great comprehensive course on *React 18* that just dropped. Shall I queue it up?";
    }
    if (lower.includes("music") || lower.includes("song")) {
        return "Vibe time? I can put on some *Lo-Fi Beats* or the latest *Top 50 Global*. Let me know what genre you're feeling!";
    }
    if (lower.includes("explain")) {
        return "I can certainly explain that! Based on top educational videos, here is a summary: The topic you asked about involves complex mechanisms that are best visualized. **Veritasium** has a video covering exactly this. It explains the concept using real-world experiments.";
    }

    return "That's an interesting topic! I'm analyzing millions of videos to find the best match for '" + input + "'. \n\nI found a few highly-rated videos that might answer your question. Would you like a deep-dive tutorial or a quick summary?";
};

const YouTubeAI = () => {
    const [messages, setMessages] = useState([
        { id: 1, role: "assistant", content: "Hello! I am YouTube AI. Ask me anything." }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        // Generate response content
        const fullResponse = generateAIResponse(userMsg.content);

        // Initial empty bot message for streaming
        const botMsgId = Date.now() + 1;
        setMessages(prev => [...prev, { id: botMsgId, role: "assistant", content: "" }]);

        // Stream simulation
        let currentText = "";
        const words = fullResponse.split(" ");

        for (let i = 0; i < words.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 50)); // Random typing delay
            currentText += (i === 0 ? "" : " ") + words[i];

            setMessages(prev => prev.map(msg =>
                msg.id === botMsgId ? { ...msg, content: currentText } : msg
            ));
        }

        setIsTyping(false);
    };

    return (
        <div className="flex h-[calc(100vh-64px)] bg-white dark:bg-gray-900 font-sans overflow-hidden">

            {/* AI Sidebar (History) */}
            <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-gray-50 dark:bg-black border-r dark:border-gray-800 transition-all duration-300 flex flex-col overflow-hidden shrinking-sidebar`}>
                <div className="p-4 flex items-center justify-between">
                    <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium w-full transition-colors shadow-sm">
                        <Plus size={16} /> New Chat
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-2 space-y-1">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Today</div>
                    {["React Tutorials", "Funny Cat Videos", "SpaceX Launch"].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg cursor-pointer truncate">
                            <MessageSquare size={14} />
                            {item}
                        </div>
                    ))}

                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4">Yesterday</div>
                    {["Lo-Fi Music", "Cooking Pasta"].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg cursor-pointer truncate">
                            <MessageSquare size={14} />
                            {item}
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t dark:border-gray-800">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Sparkles size={14} /> Powering YouTube AI
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative">

                {/* Header Toggle */}
                <div className="absolute top-4 left-4 z-10">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300">
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8" ref={scrollRef}>
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-4 max-w-3xl mx-auto ${msg.role === "user" ? "justify-end" : ""}`}>
                            {msg.role === "assistant" && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shrink-0 shadow-lg">
                                    <Sparkles size={16} className="text-white" />
                                </div>
                            )}

                            <div className={`leading-7 ${msg.role === "user" ? "bg-gray-100 dark:bg-gray-800 px-5 py-3 rounded-2xl rounded-tr-none text-gray-800 dark:text-white font-medium" : "text-gray-800 dark:text-gray-200 pt-1"}`}>
                                {msg.content}
                            </div>

                            {msg.role === "user" && (
                                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center shrink-0">
                                    <User size={16} className="text-gray-600 dark:text-gray-300" />
                                </div>
                            )}
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex gap-4 max-w-3xl mx-auto">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shrink-0 shadow-lg animate-pulse">
                                <Sparkles size={16} className="text-white" />
                            </div>
                            <div className="flex items-center gap-1 pt-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-gray-900 pb-8">
                    <div className="max-w-3xl mx-auto relative">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Ask me anything about videos..."
                            className="w-full pl-5 pr-12 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:border-blue-500 dark:text-white shadow-sm transition-all text-lg placeholder:text-gray-400"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:bg-gray-400"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-3">
                        YouTube AI can assist with content discovery. Model: v2.4-Turbo
                    </p>
                </div>
            </div>
        </div>
    );
};

export default YouTubeAI;
