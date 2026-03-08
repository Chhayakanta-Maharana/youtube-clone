import { useState, useEffect } from "react";
import { Check, Star } from "lucide-react";

const Premium = () => {
    const [currency, setCurrency] = useState(() => localStorage.getItem("premium-currency") || "USD");

    useEffect(() => {
        localStorage.setItem("premium-currency", currency);
    }, [currency]);

    const pricing = {
        USD: { symbol: "$", silver: 9.99, gold: 19.99, bronze: 4.99 },
        INR: { symbol: "₹", silver: 299, gold: 699, bronze: 149 },
    };

    const currentPricing = pricing[currency];

    const tiers = [
        {
            name: "Standard",
            color: "silver",
            bg: "bg-gray-200 dark:bg-gray-800",
            border: "border-gray-400",
            text: "text-gray-700 dark:text-gray-300",
            price: currentPricing.silver,
            features: ["Ad-free videos", "Background play", "Download videos"],
            recommended: true,
        },
        {
            name: "Premium",
            color: "gold",
            bg: "bg-yellow-100 dark:bg-yellow-900/30",
            border: "border-yellow-500",
            text: "text-yellow-700 dark:text-yellow-400",
            price: currentPricing.gold,
            features: ["All Standard features", "4K Quality", "Access to Originals", "Early Access"],
            highlight: true,
        },
        {
            name: "Basic",
            color: "bronze",
            bg: "bg-orange-100 dark:bg-[#3d2b1f]",
            border: "border-orange-700",
            text: "text-orange-800 dark:text-orange-400",
            price: currentPricing.bronze,
            features: ["Ad-free music", "Standard Quality"],
            recommended: false,
        },
    ];

    return (
        <div className="min-h-screen p-8 bg-gray-50 dark:bg-[#0f0f0f] flex flex-col items-center">

            {/* Header */}
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center dark:text-white">
                Upgrade to <span className="text-red-600">Premium</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-xl">
                Enjoy uninterrupted videos, ad-free music, and exclusive content.
            </p>

            {/* Currency Toggle */}
            <div className="flex items-center space-x-4 mb-12 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md">
                <button
                    onClick={() => setCurrency("USD")}
                    className={`px-6 py-2 rounded-full transition-all duration-300 font-medium ${currency === "USD"
                        ? "bg-red-600 text-white shadow-lg"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                >
                    USD
                </button>
                <button
                    onClick={() => setCurrency("INR")}
                    className={`px-6 py-2 rounded-full transition-all duration-300 font-medium ${currency === "INR"
                        ? "bg-red-600 text-white shadow-lg"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                >
                    INR
                </button>
            </div>

            {/* Cards Container */}
            <div className="flex flex-col md:flex-row items-center md:items-stretch justify-center gap-8 w-full max-w-6xl">

                {/* Silver (Left) */}
                <PricingCard tier={tiers[0]} currencySymbol={currentPricing.symbol} />

                {/* Gold (Center - Highlighted) */}
                <PricingCard tier={tiers[1]} currencySymbol={currentPricing.symbol} />

                {/* Bronze (Right) */}
                <PricingCard tier={tiers[2]} currencySymbol={currentPricing.symbol} />

            </div>
        </div>
    );
};

const PricingCard = ({ tier, currencySymbol }) => {
    return (
        <div
            className={`relative w-full md:w-80 rounded-2xl p-6 transition-transform duration-300 hover:scale-105 shadow-xl flex flex-col ${tier.bg
                } ${tier.highlight ? "md:scale-110 md:-mt-4 border-2 z-10" : "border"} ${tier.border
                }`}
        >
            {/* Recommended Ribbon */}
            {tier.recommended && (
                <div className="absolute top-0 right-0 overflow-hidden w-32 h-32">
                    <div className="absolute top-6 -right-8 w-40 bg-red-600 text-white text-xs font-bold text-center py-1 rotate-45 shadow-md">
                        RECOMMENDED
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-6 text-center">
                {tier.highlight && <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2 fill-current" />}
                <h2 className={`text-2xl font-bold uppercase tracking-wider ${tier.text}`}>
                    {tier.name}
                </h2>
            </div>

            {/* Price */}
            <div className="text-center mb-8">
                <span className="text-4xl font-extrabold dark:text-white">
                    {currencySymbol}{tier.price}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">/mo</span>
            </div>

            {/* Features */}
            <ul className="space-y-4 mb-8 flex-1">
                {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-3">
                        <Check className={`w-5 h-5 ${tier.text}`} />
                        <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                            {feature}
                        </span>
                    </li>
                ))}
            </ul>

            {/* Action Button */}
            <button
                onClick={() => tier.onChoose()}
                className={`w-full py-3 rounded-xl font-bold transition-colors shadow-lg ${tier.highlight
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
                    : "bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-white"
                    }`}
            >
                Choose {tier.name}
            </button>
        </div>
    );
};

const PaymentModal = ({ isOpen, onClose, tier, amount, currency }) => {
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Load Razorpay script if not already loaded
            if (!document.getElementById("razorpay-script")) {
                const script = document.createElement("script");
                script.src = "https://checkout.razorpay.com/v1/checkout.js";
                script.id = "razorpay-script";
                script.async = true;
                document.body.appendChild(script);
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handlePayment = async () => {
        setProcessing(true);
        try {
            // 1. Create Order on Backend
            // Currency in paise for INR (multiply by 100). For Razorpay INR is default.
            // If currency is USD, we might need a converter or just pass as is if Razorpay account supports it.
            // For this demo, we assume INR scaling or passed direct amount.
            // But usually amount should be in smallest unit (paise/cents).
            const payAmount = currency === "INR" ? Math.round(amount * 100) : Math.round(amount * 100);

            const res = await fetch("http://localhost:5000/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: payAmount, currency })
            });

            const data = await res.json();

            if (!data.orderId) {
                alert("Failed to create order. Please try again.");
                setProcessing(false);
                return;
            }

            // 2. Open Razorpay Object
            const options = {
                key: data.key,
                amount: payAmount,
                currency: currency,
                name: "TeckTube Premium",
                description: `Subscribe to ${tier}`,
                order_id: data.orderId,
                handler: function (response) {
                    // Payment Success
                    console.log("Payment Success:", response);
                    alert(`Payment Successful! Welcome to ${tier} Premium.`);
                    onClose();
                    setProcessing(false);
                },
                prefill: {
                    name: "User Name", // You can pull this from Auth context if needed
                    email: "user@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#FF0000"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", function (response) {
                alert("Payment Failed: " + response.error.description);
                setProcessing(false);
            });
            rzp.open();

        } catch (error) {
            console.error("Payment Error:", error);
            alert("Something went wrong with the payment.");
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b dark:border-gray-700">
                    <h3 className="text-xl font-bold dark:text-white">Complete Payment</h3>
                    <p className="text-sm text-gray-500">Subscribe to {tier}</p>
                </div>

                <div className="p-6 space-y-4">
                    <div className="text-3xl font-bold text-center mb-6 dark:text-white">
                        {currency}{amount}
                    </div>

                    <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                        You will be redirected to Razorpay securely to complete your purchase.
                    </p>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800">Cancel</button>
                    <button
                        onClick={handlePayment}
                        disabled={processing}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {processing ? "Processing..." : `Pay via Razorpay`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Premium;
