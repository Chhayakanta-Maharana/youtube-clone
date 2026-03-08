import React, { useState } from 'react';
import { Send, HelpCircle } from 'lucide-react';

const Help = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => {
            setSubmitted(true);
            setFormData({ name: '', email: '', message: '' });
            // Reset success message after 3 seconds
            setTimeout(() => setSubmitted(false), 3000);
        }, 1000);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="p-8 max-w-2xl mx-auto dark:text-gray-100">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                    <HelpCircle size={32} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Help Center</h1>
                    <p className="text-gray-600 dark:text-gray-400">We're here to help. Send us your query.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-lg p-6 border dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Send size={20} />
                    Send a Message
                </h2>

                {submitted ? (
                    <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 p-4 rounded-lg mb-6 text-center animate-fade-in">
                        Message sent successfully! We'll get back to you soon.
                    </div>
                ) : null}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            required
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-[#0f0f0f] focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                            placeholder="Your Name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            required
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-[#0f0f0f] focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                            placeholder="your@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Message</label>
                        <textarea
                            required
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            rows="5"
                            className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-[#0f0f0f] focus:ring-2 focus:ring-blue-500 outline-none transition-colors resize-none"
                            placeholder="Describe your issue..."
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Send size={18} />
                        Send Message
                    </button>
                </form>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-[#1e1e1e] rounded-lg border dark:border-gray-700">
                    <h3 className="font-semibold mb-2">Community Guidelines</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Learn about what is allowed on our platform.</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-[#1e1e1e] rounded-lg border dark:border-gray-700">
                    <h3 className="font-semibold mb-2">Safety Center</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tips and tools to help you stay safe.</p>
                </div>
            </div>
        </div>
    );
};

export default Help;
