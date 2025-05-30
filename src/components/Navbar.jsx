import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from "react-i18next";
import { changeLanguage } from '../i18n/config';



const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ar' : 'en';
        changeLanguage(newLang);
    };


    return (
        <nav className={`fixed top-0 w-full z-50 shadow ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <img src="/logo.jpeg" alt="Almentor Logo" className="h-8 w-auto mr-2" />
                        <a href="/" className="text-xl font-semibold">
                            Almentor
                        </a>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={toggleTheme}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${theme === 'dark'
                                ? 'bg-gray-700 hover:bg-gray-600'
                                : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? (
                                <FaMoon className="text-yellow-400" />
                            ) : (
                                <FaSun className="text-yellow-500" />
                            )}
                        </button>
                        <button
                            onClick={toggleLanguage}
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-xl font-medium transition-colors ${theme === 'dark'
                                ? 'bg-gray-700 text-white hover:bg-gray-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            aria-label="Switch language to Arabic">
                            {i18n.language === 'en' ? 'ع' : 'EN'}
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;