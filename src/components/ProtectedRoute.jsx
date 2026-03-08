import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        // console.log("ProtectedRoute: Loading user...");
        return <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-500">Loading...</div>;
    }

    if (!user) {
        console.log("ProtectedRoute: No user found, redirecting to login.");
        return <Navigate to="/login" replace />;
    }

    // console.log("ProtectedRoute: Access granted");
    return children;
};

export default ProtectedRoute;
