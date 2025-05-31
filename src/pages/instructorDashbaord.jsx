/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';

function InstructorDashboard() {
    const { t, i18n } = useTranslation();
    const { theme } = useTheme();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isAlreadyInstructor, setIsAlreadyInstructor] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const isRTL = i18n.language === "ar";

    useEffect(() => {
        document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    }, [i18n.language]);

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        // Check if user is already an instructor
        const checkInstructorStatus = async () => {
            try {
                const response = await fetch(`https://al-mentor-database-production.up.railway.app/instructors?page=1&limit=100`);
                const data = await response.json();

                if (data.success) {
                    const isInstructor = data.data.some(instructor => instructor.user === user._id);
                    console.log("Is user already an instructor:", isInstructor);
                    setIsAlreadyInstructor(isInstructor);
                }
            } catch (error) {
                console.error("Error checking instructor status:", error);
            } finally {
                setIsChecking(false);
            }
        };

        checkInstructorStatus();
    }, [user, navigate]);

    if (isChecking) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#1A1A1A] text-white' : 'bg-gray-50 text-gray-900'}`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-4">{t('loading', 'Loading...')}</p>
                </div>
            </div>
        );
    }

    if (!isAlreadyInstructor) {
        navigate("/become-instructor");
        return null;
    }

    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#1A1A1A] text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Instructor Profile Section */}
                <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="relative">
                            <img
                                src={user?.profilePicture || "https://via.placeholder.com/150  "}
                                alt={user?.firstName}
                                className="w-32 h-32 rounded-full object-cover border-4 border-red-500"
                            />
                            <div className="absolute bottom-0 right-0 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-2xl font-bold mb-2">{`${user?.firstName} ${user?.lastName}`}</h1>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">{user?.professionalTitle || t('instructorDashboard.defaultTitle')}</p>
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">0 {t('instructorDashboard.totalStudents')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">0 {t('instructorDashboard.totalCourses')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">0.0 {t('instructorDashboard.rating')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('instructorDashboard.totalStudents')}</p>
                                <h3 className="text-2xl font-bold mt-1">0</h3>
                            </div>
                            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('instructorDashboard.totalCourses')}</p>
                                <h3 className="text-2xl font-bold mt-1">0</h3>
                            </div>
                            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                                <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('instructorDashboard.totalRevenue')}</p>
                                <h3 className="text-2xl font-bold mt-1">$0</h3>
                            </div>
                            <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
                                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('instructorDashboard.rating')}</p>
                                <h3 className="text-2xl font-bold mt-1">0.0</h3>
                            </div>
                            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                                <svg className="w-6 h-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <button
                        onClick={() => navigate('/create-course')}
                        className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-left hover:shadow-xl transition-shadow ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                    >
                        <div className="flex items-center">
                            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg mr-4">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">{t('instructorDashboard.createCourse')}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('instructorDashboard.createCourseDesc')}</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/my-courses')}
                        className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-left hover:shadow-xl transition-shadow ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                    >
                        <div className="flex items-center">
                            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg mr-4">
                                <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">{t('instructorDashboard.myCourses')}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('instructorDashboard.myCoursesDesc')}</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/instructor-profile')}
                        className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-left hover:shadow-xl transition-shadow ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                    >
                        <div className="flex items-center">
                            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg mr-4">
                                <svg className="w-6 h-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">{t('instructorDashboard.editProfile')}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('instructorDashboard.editProfileDesc')}</p>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Recent Activity */}
                <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <h2 className="text-xl font-bold mb-4">{t('instructorDashboard.recentActivity')}</h2>
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">{t('instructorDashboard.noActivity')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InstructorDashboard;