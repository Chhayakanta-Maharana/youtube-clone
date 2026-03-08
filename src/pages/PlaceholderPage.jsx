import React from "react";
import { useLocation } from "react-router-dom";

const PlaceholderPage = () => {
    const location = useLocation();
    const title = location.pathname.split("/")[1].replace("-", " ").toUpperCase();

    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] dark:text-white">
            <h1 className="text-3xl font-bold mb-4">{title || "PAGE"}</h1>
            <p className="text-gray-500">This page is under construction.</p>
        </div>
    );
};

export default PlaceholderPage;
