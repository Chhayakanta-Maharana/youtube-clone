import { useRef, useEffect, useState } from "react";
import { Check, Star, Shield, Zap, X, CreditCard, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const PaymentModal = ({ plan, isOpen, onClose, onSuccess }) => {
    const [processing, setProcessing] = useState(false);

    if (!isOpen) return null;

    const handlePay = async () => {
        setProcessing(true);
        // Simulate Razorpay Gateway
        await new Promise(resolve => setTimeout(resolve, 2000));
        setProcessing(false);
        onSuccess(plan);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in-down">

                {/* Header */}
                <div className="bg-gray-100 dark:bg-gray-900 p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" className="h-6 opacity-80" />
                        <span className="text-sm text-gray-400">| Trusted Payment</span>
                    </div>
                    <button onClick={onClose}><X size={20} className="text-gray-500" /></button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <h3 className="text-xl font-bold dark:text-white mb-1">Subscribe to {plan.name}</h3>
                    <p className="text-2xl font-bold text-blue-600 mb-6">{plan.price} <span className="text-sm text-gray-500 font-normal">/ month</span></p>

                    <div className="space-y-4">
                        <div className="border p-3 rounded-lg flex items-center gap-3 cursor-pointer border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500">
                            <CreditCard className="text-blue-600" />
                            <div>
                                <p className="font-semibold text-sm dark:text-white">Card</p>
                                <p className="text-xs text-gray-500">Visa, Mastercard, RuPay</p>
                            </div>
                        </div>
                        <div className="border p-3 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600">
                            <div className="w-10 h-6 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">UPI</div>
                            <div>
                                <p className="font-semibold text-sm dark:text-white">UPI / QR</p>
                                <p className="text-xs text-gray-500">Google Pay, PhonePe, Paytm</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handlePay}
                        disabled={processing}
                        className="mt-8 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-wait"
                    >
                        {processing ? (
                            <>Processing <span className="animate-spin">⏳</span></>
                        ) : (
                            <>Pay {plan.price}</>
                        )}
                    </button>

                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                        <Lock size={12} /> SSL Encrypted & Secure
                    </div>
                </div>
            </div>
        </div>
    );
};

const SubscriptionPlans = () => {
    const { user, updateSubscription } = useAuth();
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState(null);

    const handleSelectPlan = (plan) => {
        if (!user) {
            alert("Please sign in to subscribe.");
            return;
        }
        setSelectedPlan(plan);
    };

    const handleSuccess = async (plan) => {
        await updateSubscription(plan.tier); // Update Context/DynamoDB
        alert(`Payment Successful! You are now a ${plan.name} member.`);
        setSelectedPlan(null);
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-4 pt-10 pb-20 overflow-hidden relative">
            <PaymentModal
                plan={selectedPlan}
                isOpen={!!selectedPlan}
                onClose={() => setSelectedPlan(null)}
                onSuccess={handleSuccess}
            />
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="text-center mb-12 z-10 animate-fade-in-down">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    Choose Your Premium
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                    Unlock exclusive features and support your favorite creators.
                </p>
            </div>

            {/* Podium Container */}
            <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-0 w-full max-w-5xl z-10">

                {/* 2nd Place: Standard (Silver) - Left */}
                <div className="order-2 md:order-1 w-full md:w-1/3 flex flex-col items-center animate-slide-up-delay-1">
                    <div className="w-full max-w-xs bg-gradient-to-b from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded-t-2xl border-t-4 border-gray-400 shadow-2xl transform hover:scale-105 transition-transform duration-300 relative group">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-400 text-white w-12 h-12 flex items-center justify-center rounded-full font-bold text-xl shadow-lg border-4 border-white dark:border-gray-800 z-20">
                            2
                        </div>
                        <div className="p-6 md:p-8 flex flex-col items-center text-center h-[400px]">
                            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">Standard</h2>
                            <div className="text-4xl font-bold text-gray-800 dark:text-white mb-4">$9.99<span className="text-sm font-normal text-gray-500">/mo</span></div>
                            <div className="w-16 h-1 bg-gray-400 rounded-full mb-6" />
                            <ul className="space-y-3 text-left w-full text-gray-600 dark:text-gray-300 mb-8">
                                <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Ad-free videos</li>
                                <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Background play</li>
                                <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> 1080p Downloads</li>
                            </ul>
                            <button
                                onClick={() => handleSelectPlan({ name: "Standard", price: "$9.99", tier: "silver" })}
                                className="mt-auto px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-full font-bold transition-all w-full shadow-lg"
                            >
                                Get Silver
                            </button>
                        </div>
                    </div>
                </div>

                {/* 1st Place: Premium (Gold) - Center */}
                <div className="order-1 md:order-2 w-full md:w-1/3 flex flex-col items-center z-20 -mx-0 md:-mx-4 mb-8 md:mb-0 animate-slide-up">
                    <div className="w-full max-w-sm bg-gradient-to-b from-yellow-50 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-800/20 rounded-t-3xl border-t-4 border-yellow-500 shadow-[0_20px_50px_rgba(234,179,8,0.3)] transform scale-105 relative">
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-yellow-500 text-white w-16 h-16 flex items-center justify-center rounded-full font-bold text-3xl shadow-lg border-4 border-white dark:border-gray-800 z-30 ring-4 ring-yellow-400/30">
                            1
                            <Star className="w-4 h-4 absolute -top-1 -right-1 text-yellow-200 fill-current animate-spin-slow" />
                        </div>
                        <div className="absolute top-0 right-0 p-2 bg-yellow-500 text-white text-xs font-bold rounded-bl-xl rounded-tr-2xl shadow-md">
                            BEST VALUE
                        </div>
                        <div className="p-8 md:p-10 flex flex-col items-center text-center h-[500px]">
                            <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-full">
                                <Star className="w-8 h-8 text-yellow-600 dark:text-yellow-400 fill-current" />
                            </div>
                            <h2 className="text-3xl font-extrabold text-yellow-700 dark:text-yellow-400 mb-2">Premium</h2>
                            <div className="text-5xl font-bold text-gray-900 dark:text-white mb-4">$19.99<span className="text-sm font-normal text-gray-500">/mo</span></div>
                            <div className="w-16 h-1 bg-yellow-500 rounded-full mb-8" />
                            <ul className="space-y-4 text-left w-full text-gray-700 dark:text-gray-200 mb-8 font-medium">
                                <li className="flex items-center gap-2"><Check size={18} className="text-yellow-600" /> Everything in Silver</li>
                                <li className="flex items-center gap-2"><Check size={18} className="text-yellow-600" /> 4K Ultra HD</li>
                                <li className="flex items-center gap-2"><Check size={18} className="text-yellow-600" /> Early Access to Content</li>
                            </ul>
                            <button
                                onClick={() => handleSelectPlan({ name: "Premium", price: "$19.99", tier: "gold" })}
                                className="mt-auto px-10 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-full font-bold text-lg transition-all w-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
                            >
                                Get Gold
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3rd Place: Basic (Bronze) - Right */}
                <div className="order-3 md:order-3 w-full md:w-1/3 flex flex-col items-center animate-slide-up-delay-2">
                    <div className="w-full max-w-xs bg-gradient-to-b from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/10 rounded-t-2xl border-t-4 border-orange-400 shadow-2xl transform hover:scale-105 transition-transform duration-300 relative group">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-orange-400 text-white w-12 h-12 flex items-center justify-center rounded-full font-bold text-xl shadow-lg border-4 border-white dark:border-gray-800 z-20">
                            3
                        </div>
                        <div className="p-6 md:p-8 flex flex-col items-center text-center h-[350px]">
                            <h2 className="text-2xl font-bold text-orange-800 dark:text-orange-300 mb-2">Basic</h2>
                            <div className="text-4xl font-bold text-gray-800 dark:text-white mb-4">$4.99<span className="text-sm font-normal text-gray-500">/mo</span></div>
                            <div className="w-16 h-1 bg-orange-400 rounded-full mb-6" />
                            <ul className="space-y-3 text-left w-full text-gray-600 dark:text-gray-300 mb-8">
                                <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Ad-light experience</li>
                                <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> 720p Streaming</li>
                            </ul>
                            <button
                                onClick={() => handleSelectPlan({ name: "Basic", price: "$4.99", tier: "bronze" })}
                                className="mt-auto px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold transition-all w-full shadow-lg"
                            >
                                Get Bronze
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Simulated Podium Base (Visual grounding) */}
            <div className="hidden md:flex items-end justify-center w-full max-w-4xl mx-auto -mt-4 opacity-50 pointer-events-none">
                <div className="w-1/3 h-8 bg-gradient-to-b from-gray-200 to-white dark:from-gray-700 dark:to-gray-900 rounded-tl-lg" />
                <div className="w-1/3 h-16 bg-gradient-to-b from-gray-200 to-white dark:from-gray-700 dark:to-gray-900 rounded-t-lg -mx-4 z-10" />
                <div className="w-1/3 h-4 bg-gradient-to-b from-gray-200 to-white dark:from-gray-700 dark:to-gray-900 rounded-tr-lg" />
            </div>

            <style>{`
                @keyframes slide-up {
                    from { transform: translateY(100px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up { animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-slide-up-delay-1 { animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; opacity: 0; }
                .animate-slide-up-delay-2 { animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards; opacity: 0; }
                
                @keyframes fade-in-down {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }
                
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow { animation: spin-slow 8s linear infinite; }
            `}</style>
        </div>
    );
};

export default SubscriptionPlans;
