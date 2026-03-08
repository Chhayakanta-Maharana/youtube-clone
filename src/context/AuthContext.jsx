import { createContext, useContext, useState, useEffect } from "react";
import { loginUser } from "../auth/login";
import { signupUser, confirmUser } from "../auth/signup";
import { userPool } from "../auth/cognitoConfig";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Handle Google Auth redirect hash
        if (window.location.hash.includes("id_token=")) {
            const hashPrefix = window.location.hash.substring(1);
            const params = new URLSearchParams(hashPrefix);
            const idToken = params.get("id_token");

            if (idToken) {
                localStorage.setItem("idToken", idToken);
                window.history.replaceState(null, "", window.location.pathname);
            }
        }

        checkUser();
    }, []);

    const checkUser = async () => {
        // Timeout to prevent infinite loading
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve('TIMEOUT'), 2000));

        try {
            const cognitoUser = userPool.getCurrentUser();

            if (!cognitoUser) {
                // Check local storage for Google IdToken
                const storedToken = localStorage.getItem("idToken");
                if (storedToken) {
                    try {
                        const payload = jwtDecode(storedToken);
                        // Check if token is not expired
                        if (payload.exp * 1000 > Date.now()) {
                            setUser({
                                id: payload.sub || payload.email,
                                email: payload.email,
                                name: payload.name || payload.email,
                                subscriptionTier: "free"
                            });
                            setLoading(false);
                            return;
                        } else {
                            localStorage.removeItem("idToken");
                        }
                    } catch (e) {
                        console.error("Failed to parse local stored token", e);
                        localStorage.removeItem("idToken");
                    }
                }

                setUser(null);
                setLoading(false);
                return;
            }

            const sessionPromise = new Promise((resolve, reject) => {
                cognitoUser.getSession((err, session) => {
                    if (err) reject(err);
                    else resolve(session);
                });
            });

            // Race between session fetch and timeout
            const result = await Promise.race([sessionPromise, timeoutPromise]);

            if (result === 'TIMEOUT') {
                console.warn("Auth check timed out, assuming unauthenticated.");
                setUser(null);
            } else if (result && result.isValid()) {
                setUser({
                    id: cognitoUser.getUsername(),
                    email: result.getIdToken().payload.email,
                    name: result.getIdToken().payload.name || cognitoUser.getUsername(),
                    subscriptionTier: "free" // Defaulting to free for now
                });
            } else {
                setUser(null);
            }
        } catch (error) {
            console.log("Not signed in or error:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        setLoading(true);
        try {
            await loginUser(email, password);
            await checkUser();
            return { success: true };
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signup = async (email, password, name) => {
        setLoading(true);
        try {
            const result = await signupUser(email, password, name);
            return result;
        } catch (error) {
            console.error("Signup failed:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const confirm = async (email, code) => {
        setLoading(true);
        try {
            const result = await confirmUser(email, code);
            return result;
        } catch (error) {
            console.error("Confirmation failed:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        const cognitoUser = userPool.getCurrentUser();
        if (cognitoUser) {
            cognitoUser.signOut();
        }
        localStorage.removeItem("idToken");
        setUser(null);
    };

    // Process Google login credential (JWT)
    const loginWithGoogleCredential = (credential) => {
        try {
            const payload = jwtDecode(credential);
            localStorage.setItem("idToken", credential);
            setUser({
                id: payload.sub || payload.email,
                email: payload.email,
                name: payload.name || payload.email,
                subscriptionTier: "free"
            });
            return true;
        } catch (error) {
            console.error("Failed to login with Google credential", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            signup,
            confirmUser: confirm,
            loginWithGoogleCredential,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};
