import React, { useState, useRef, useEffect } from 'react';
import { FaSun, FaMoon, FaChevronDown } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // After fetching saved courses (if courseId is just an ID)
    const fetchCourseDetails = async (courseId) => {
        const res = await fetch(`http://localhost:5000/api/courses/${courseId}`);
        return res.ok ? res.json() : null;
    };

    const fetchAllCourseDetails = async (ids) => {
        const courses = await Promise.all(ids.map(fetchCourseDetails));
        setSavedCourses(courses.filter(Boolean));
    };

    useEffect(() => {
        console.log('DEBUG: user =', user);
        console.log('DEBUG: token =', localStorage.getItem('token'));
        if (!user) {
            navigate('/loginPage');
            return;
        }
        // ...rest of your code
    }, [navigate, user]);

    return (
        <nav className={`fixed top-0 w-full z-50 shadow ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <img src="/logo.jpeg" alt="Almentor Logo" className="h-8 w-auto mr-2" />
                        <a href="/" className="text-xl font-semibold">
                            Almentor
                        </a>
                        {/* Dropdown Example */}
                        <div
                            className="relative ml-6"
                            ref={dropdownRef}
                            onMouseEnter={() => setDropdownOpen(true)}
                            onMouseLeave={() => setDropdownOpen(false)}
                        >
                            <button
                                className="flex items-center gap-1 px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                onClick={() => setDropdownOpen((open) => !open)}
                                aria-haspopup="true"
                                aria-expanded={dropdownOpen}
                            >
                                Courses <FaChevronDown className="ml-1 text-xs" />
                            </button>
                            <div
                                className={`absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 transition-all duration-200 ${dropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}
                                style={{ zIndex: 100 }}
                                role="menu"
                                tabIndex={-1}
                            >
                                <a href="/courses" className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" role="menuitem">All Courses</a>
                                <a href="/categories/business" className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" role="menuitem">Business</a>
                                <a href="/categories/technology" className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" role="menuitem">Technology</a>
                                {/* Add more categories as needed */}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={toggleTheme}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                                theme === 'dark'
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
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-xl font-medium transition-colors ${
                                theme === 'dark'
                                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            aria-label="Switch language to Arabic"
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