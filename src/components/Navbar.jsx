import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useState } from'react';

const Navbar = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        // Add theme switching logic here
    };

    return (
        <nav className="bg-white fixed top-0 w-full z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <img src="/logo.jpeg" alt="Almentor Logo" className="h-8 w-auto mr-2" />
                        <a href="/" className="text-xl font-semibold text-black-600">
                            Almentor
                        </a>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={toggleTheme}
                            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                        >
                            {isDarkMode ? (
                                <FaMoon className="text-gray-700" />
                            ) : (
                                <FaSun className="text-yellow-500" />
                            )}
                        </button>
                        <button
                            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors text-xl font-medium text-gray-700"
                        >
                            ع
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;