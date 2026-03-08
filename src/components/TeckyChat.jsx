import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, X, Sparkles, User, Minimize2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TeckyChat = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi! I'm Tecky. How can I help you explore the tech world today?", sender: 'bot' }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const { user } = useAuth();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            const response = await fetch("http://localhost:5000/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [{ role: "user", content: input }]
                })
            });

            const data = await response.json();

            if (data.reply) {
                let replyText = data.reply;
                // If backend gives the offline error message, use our local fallback
                if (data.reply.includes("offline mode")) {
                    replyText = generateResponse(input);
                }
                const botMsg = { id: Date.now() + 1, text: replyText, sender: 'bot' };
                setMessages(prev => [...prev, botMsg]);
            } else {
                throw new Error("No reply from AI");
            }

        } catch (error) {
            console.error("AI Chat Error:", error);
            const errorMsg = { id: Date.now() + 1, text: "I'm having trouble connecting right now. Please try again later.", sender: 'bot' };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const generateResponse = (text) => {
        const lower = text.toLowerCase();
        if (lower.includes('hello') || lower.includes('hi')) return `Hello ${user?.name || 'there'}! Ready to discover some amazing tech videos?`;
        if (lower.includes('tecktube') || lower.includes('what is')) return "Tecktube is your premium destination for the latest in technology, coding, and innovation. We feature curated content to boost your skills.";
        if (lower.includes('help')) return "I can help you navigate! Try searching for 'React', 'Python', or check out the 'Trending' section.";
        if (lower.includes('premium')) return "Tecktube Premium offers ad-free viewing, offline downloads, and exclusive badges. Check out the Premium page for more details!";
        if (lower.includes('upload')) return "To upload a video, click the camera icon in the navbar. You'll need to be signed in.";

        return "That's an interesting question! I'm still learning about the vast world of tech. Try asking about Tecktube features, finding videos, or Premium plans.";
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl flex flex-col z-50 animate-slide-up border dark:border-gray-700 overflow-hidden font-sans">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#00A3FF] to-[#0077FF] p-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                        <Bot size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Tecky AI</h3>
                        <p className="text-[10px] opacity-90 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                            Online
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                        <Minimize2 size={18} />
                    </button>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-[#0f0f0f]">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user'
                                ? 'bg-[#00A3FF] text-white rounded-br-none'
                                : 'bg-white dark:bg-[#1e1e1e] text-gray-800 dark:text-gray-200 border dark:border-gray-700 rounded-bl-none shadow-sm'
                                }`}
                        >
                            {msg.sender === 'bot' && (
                                <div className="flex items-center gap-1 mb-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                    <Sparkles size={10} className="text-[#00A3FF]" /> Tecky
                                </div>
                            )}
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start animate-fade-in">
                        <div className="bg-white dark:bg-[#1e1e1e] border dark:border-gray-700 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-white dark:bg-[#1e1e1e] border-t dark:border-gray-700">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask Tecky regarding..."
                        className="w-full pl-4 pr-12 py-3 bg-gray-100 dark:bg-[#2a2a2a] text-sm text-gray-900 dark:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-[#00A3FF] transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#00A3FF] text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-[#00A3FF] transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TeckyChat;
