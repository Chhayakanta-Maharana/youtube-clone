import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, User, CheckCircle, ArrowRight } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import AuthLayout from "../components/AuthLayout";

const Signup = () => {
    const { signup, confirmUser, resendCode, loginWithGoogleCredential, loading } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (step === 2) {
                await confirmUser(email, code);
                alert("Email verified! Please login.");
                navigate("/login");
                return;
            }

            await signup(email, password, name);
            setStep(2);
            alert("Verification code sent to your email.");
        } catch (error) {
            alert(error.message || "Signup failed");
        }
    };

    const handleGoogleLoginSuccess = async (credentialResponse) => {
        try {
            await loginWithGoogleCredential(credentialResponse.credential);
            navigate("/main");
        } catch (error) {
            alert(error.message || "Google Login failed");
        }
    };

    return (
        <AuthLayout
            title={step === 1 ? "Create Account" : "Verify Email"}
            subtitle={
                step === 1
                    ? "Start your creator journey today"
                    : `Enter the code sent to ${email}`
            }
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {step === 1 && (
                    <>
                        <div className="relative">
                            <User className="absolute left-4 top-4 text-gray-400" size={22} />
                            <input
                                type="text"
                                placeholder="Full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none"
                            />
                        </div>

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

                        <div className="relative">
                            <Lock className="absolute left-4 top-4 text-gray-400" size={22} />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none"
                            />
                        </div>
                    </>
                )}

                {step === 2 && (
                    <div className="relative">
                        <CheckCircle className="absolute left-4 top-4 text-green-500" size={22} />
                        <input
                            type="text"
                            placeholder="Verification code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none tracking-widest"
                        />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#00A3FF] hover:bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                >
                    {loading ? "Please wait..." : step === 2 ? "Verify" : "Sign Up"}
                    <ArrowRight size={18} />
                </button>
            </form>

            {step === 1 && (
                <>
                    <div className="my-8 flex items-center gap-4">
                        <div className="flex-1 h-px bg-gray-300" />
                        <span className="text-sm text-gray-500">OR</span>
                        <div className="flex-1 h-px bg-gray-300" />
                    </div>

                    <div className="flex justify-center w-full">
                        <GoogleLogin
                            onSuccess={handleGoogleLoginSuccess}
                            onError={() => alert("Google sign in failed.")}
                            theme="outline"
                            size="large"
                            className="w-full"
                        />
                    </div>
                </>
            )}

            {step === 2 && (
                <p className="mt-6 text-center text-gray-500">
                    Didn’t receive code?
                    <button
                        className="ml-2 text-[#00A3FF] font-bold hover:underline"
                    >
                        Resend
                    </button>
                </p>
            )}

            <p className="mt-6 text-center text-gray-500">
                Already have an account?
                <button
                    className="ml-2 text-[#00A3FF] font-bold hover:underline"
                >
                    Login
                </button>
            </p>
        </AuthLayout>
    );
};

export default Signup;
