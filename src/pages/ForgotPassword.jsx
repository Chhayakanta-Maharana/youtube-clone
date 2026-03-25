import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lock, Mail, ArrowRight, CheckCircle } from "lucide-react";
import AuthLayout from "../components/AuthLayout";

const ForgotPassword = () => {
    const { requestPasswordReset, confirmPasswordReset } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1 = request reset, 2 = confirm code and new password
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRequestReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await requestPasswordReset(email);
            setStep(2);
        } catch (error) {
            alert(error.message || "Failed to send reset code");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await confirmPasswordReset(email, code, newPassword);
            alert("Password has been reset successfully. You can now login.");
            navigate("/login");
        } catch (error) {
            alert(error.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title={step === 1 ? "Reset Password" : "New Password"}
            subtitle={step === 1 ? "Enter your email to receive a reset code" : "Check your email for the verification code"}
        >
            {step === 1 ? (
                <form onSubmit={handleRequestReset} className="space-y-6">
                    <div className="relative">
                        <Mail className="absolute left-4 top-4 text-gray-400" size={22} />
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#00A3FF] hover:bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                        {loading ? "Sending..." : "Send Reset Code"}
                        <ArrowRight size={18} />
                    </button>
                </form>
            ) : (
                <form onSubmit={handleConfirmReset} className="space-y-6">
                    <div className="relative">
                        <CheckCircle className="absolute left-4 top-4 text-gray-400" size={22} />
                        <input
                            type="text"
                            placeholder="Verification Code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-4 text-gray-400" size={22} />
                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#00A3FF] hover:bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                        <ArrowRight size={18} />
                    </button>
                </form>
            )}

            <div className="mt-8 text-center">
                <button
                    onClick={() => navigate("/login")}
                    className="text-sm font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                    Back to Login
                </button>
            </div>
        </AuthLayout>
    );
};

export default ForgotPassword;
