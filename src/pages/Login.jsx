import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lock, Mail, ArrowRight } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import AuthLayout from "../components/AuthLayout";

const Login = () => {
    const { login, loginWithGoogleCredential, loading } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate("/main");
        } catch (error) {
            alert(error.message || "Login failed");
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
            title="Welcome Back"
            subtitle="Enter your credentials to access your account"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
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

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#00A3FF] hover:bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                >
                    {loading ? "Signing in..." : "Sign In"}
                    <ArrowRight size={18} />
                </button>
            </form>

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

            <p className="mt-6 text-center text-gray-500">
                New here?
                <button
                    onClick={() => navigate("/signup")}
                    className="ml-2 text-[#00A3FF] font-bold hover:underline"
                >
                    Create account
                </button>
            </p>
        </AuthLayout >
    );
};

export default Login;
