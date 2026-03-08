import React from "react";

import { useAppData } from "../context/AppDataContext";

const CategoryBar = () => {
    const { selectedCategory, setSelectedCategory } = useAppData();

    const categories = [
        "All", "Computer Science", "Music", "Mixes", "Live", "Cinema",
        "Tech", "Podcasts", "Gaming", "Cricket", "Cooking", "Trailers",
        "Recently uploaded", "Watched", "New to you"
    ];

    return (
        <div className="flex overflow-x-auto gap-3 py-3 px-4 no-scrollbar sticky top-0 bg-white z-10 dark:bg-gray-900 border-b dark:border-gray-800">
            {categories.map((category, index) => (
                <button
                    key={index}
                    onClick={() => setSelectedCategory(category)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-sm font-medium transition-colors
                        ${selectedCategory === category
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200"
                        }`}
                >
                    {category}
                </button>
            ))}
        </div>
    );
};

export default CategoryBar;
