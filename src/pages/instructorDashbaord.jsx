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
    const isRTL = i18n.language === "ar";

    // New state for instructor data
    const [instructorData, setInstructorData] = useState(null);
    const [instructorCourses, setInstructorCourses] = useState([]);
    const [loadingInstructor, setLoadingInstructor] = useState(true);
    const [loadingCourses, setLoadingCourses] = useState(true);

    useEffect(() => {
        document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    }, [i18n.language]);

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
    }, [user, navigate]);

    // Fetch instructor data based on user ID
    useEffect(() => {
        if (!user?._id) return;

        const fetchInstructorData = async () => {
            try {
                setLoadingInstructor(true);
                setLoadingCourses(true);

                // First, get all instructors and find the one matching our user ID
                const instructorsResponse = await fetch('http://localhost:5000/api/instructors?page=1&limit=100');
                const instructorsData = await instructorsResponse.json();

                console.log('User ID:', user._id);
                console.log('Instructors data:', instructorsData);

                if (instructorsData.success) {
                    const currentInstructor = instructorsData.data.find(
                        instructor => instructor.user === user._id
                    );

                    console.log('Found instructor:', currentInstructor);

                    if (currentInstructor) {
                        const instructorId = currentInstructor._id;
                        console.log('Using instructor ID for API calls:', instructorId);

                        // Fetch detailed instructor data using instructor ID
                        const instructorResponse = await fetch(
                            `http://localhost:5000/api/instructors/${instructorId}`
                        );
                        const instructorDetails = await instructorResponse.json();
                        setInstructorData(instructorDetails.data || instructorDetails);

                        // Fetch instructor's courses using the instructor ID (not user ID)
                        console.log('Fetching courses for instructor ID:', instructorId);
                        const coursesResponse = await fetch(
                            `http://localhost:5000/api/instructors/${instructorId}/courses`
                        );
                        const coursesData = await coursesResponse.json();

                        console.log('Courses response:', coursesData);

                        // Handle the response based on your API structure
                        if (coursesData.success) {
                            setInstructorCourses(coursesData.data || []);
                        } else {
                            setInstructorCourses(coursesData || []);
                        }
                    } else {
                        console.log('No instructor found for user ID:', user._id);
                    }
                }
            } catch (error) {
                console.error('Error fetching instructor data:', error);
                setInstructorCourses([]);
            } finally {
                setLoadingInstructor(false);
                setLoadingCourses(false);
            }
        };

        fetchInstructorData();
    }, [user?._id]);

    // Helper function to get localized strings
    const getLocalizedString = (obj = {}, lang = "en", defaultStr = "") => {
        if (typeof obj === "string") return obj;
        return obj[lang] || obj.en || defaultStr;
    };

    // Get the correct name based on language
    const getLocalizedName = (nameObj) => {
        if (!nameObj) return '';
        return isRTL ? nameObj.ar : nameObj.en;
    };

    // Get full name (first + last) or fallback to username
    const getDisplayName = () => {
        if (user?.firstName && user?.lastName) {
            const first = getLocalizedName(user.firstName);
            const last = getLocalizedName(user.lastName);
            return `${first} ${last}`.trim();
        }
        return user?.username || 'User';
    };

    // Get instructor specific data
    const getInstructorDisplayName = () => {
        if (instructorData?.profile) {
            const profile = instructorData.profile;
            const firstName = getLocalizedString(profile.firstName, i18n.language);
            const lastName = getLocalizedString(profile.lastName, i18n.language);
            return `${firstName} ${lastName}`.trim() || getDisplayName();
        }
        return getDisplayName();
    };

    const getInstructorTitle = () => {
        if (instructorData?.professionalTitle) {
            return getLocalizedString(instructorData.professionalTitle, i18n.language, t('instructors.title'));
        }
        return t('instructors.title');
    };

    const getInstructorBio = () => {
        if (instructorData?.biography || instructorData?.bio) {
            const bio = instructorData.biography || instructorData.bio;
            return getLocalizedString(bio, i18n.language, t('messages.noResults'));
        }
        return t('messages.noResults');
    };

    const getInstructorAvatar = () => {
        const name = getInstructorDisplayName();
        if (instructorData?.profile?.profilePicture) {
            return instructorData.profile.profilePicture;
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=256&background=374151&color=fff`;
    };

    const getInstructorStats = () => {
        const stats = instructorData?.stats || {};
        return {
            totalStudents: stats.learners || 0,
            totalCourses: instructorCourses.length || 0,
            totalViews: stats.views || 0,
            totalRevenue: stats.revenue || 0
        };
    };

    if (loadingInstructor) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#1A1A1A] text-white' : 'bg-gray-50 text-gray-900'}`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-4">{t('loading', 'Loading...')}</p>
                </div>
            </div>
        );
    }

    const stats = getInstructorStats();

    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#1A1A1A] text-white' : 'bg-gray-50 text-gray-900'} pt-20`}>
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Instructor Profile Section */}
                <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="relative">
                            <img
                                src={getInstructorAvatar()}
                                alt={getInstructorDisplayName()}
                                className="w-32 h-32 rounded-full object-cover border-4 border-red-500"
                            />
                            <div className="absolute bottom-0 right-0 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-2xl font-bold mb-2">{getInstructorDisplayName()}</h1>
                            <p className="text-lg font-medium text-red-600 mb-2">{getInstructorTitle()}</p>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">{user?.email}</p>

                            {/* Instructor Bio */}
                            {instructorData && (
                                <div className="mb-4">
                                    <h3 className="font-semibold mb-2">{t('instructorDetails.biography')}</h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                        {getInstructorBio()}
                                    </p>
                                </div>
                            )}

                            {/* Expertise Areas */}
                            {instructorData?.expertiseAreas && (
                                <div className="mb-4">
                                    <h3 className="font-semibold mb-2">{t('instructorDetails.expertise')}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {(() => {
                                            const expertiseAreas = instructorData.expertiseAreas[i18n.language] ||
                                                instructorData.expertiseAreas.en ||
                                                instructorData.expertiseAreas;
                                            let areas = [];
                                            if (typeof expertiseAreas === 'string') {
                                                areas = expertiseAreas.split(',');
                                            } else if (Array.isArray(expertiseAreas)) {
                                                areas = expertiseAreas;
                                            }
                                            return areas.map((area, index) => (
                                                <span
                                                    key={index}
                                                    className={`px-3 py-1 rounded-full text-sm ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
                                                        }`}
                                                >
                                                    {area.trim()}
                                                </span>
                                            ));
                                        })()}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {stats.totalStudents} {t('instructorDashboard.totalStudents')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {stats.totalCourses} {t('instructorDashboard.totalCourses')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {stats.totalViews.toLocaleString()} {t('instructorStats.views')}
                                    </span>
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
                                <h3 className="text-2xl font-bold mt-1">{stats.totalStudents.toLocaleString()}</h3>
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
                                <h3 className="text-2xl font-bold mt-1">{stats.totalCourses}</h3>
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
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('instructorStats.views')}</p>
                                <h3 className="text-2xl font-bold mt-1">{stats.totalViews.toLocaleString()}</h3>
                            </div>
                            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                                <svg className="w-6 h-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('instructorDashboard.totalRevenue')}</p>
                                <h3 className="text-2xl font-bold mt-1">${stats.totalRevenue.toLocaleString()}</h3>
                            </div>
                            <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
                                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <button
                        onClick={() => navigate('/instructor-form', {
                            state: { instructorId: instructorData?._id }
                        })}
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

                {/* My Courses Section */}
                {instructorCourses.length > 0 && (
                    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <h2 className="text-xl font-bold mb-4">{t('instructorDashboard.myCourses')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {instructorCourses.slice(0, 6).map((course) => (
                                <div
                                    key={course._id}
                                    className={`p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                                        }`}
                                    onClick={() => navigate(`/courses/${course._id}`)}
                                >
                                    <img
                                        src={course.thumbnail || "/default-course.jpg"}
                                        alt={getLocalizedString(course.title, i18n.language)}
                                        className="w-full h-32 object-cover rounded-lg mb-3"
                                    />
                                    <h3 className="font-semibold mb-2 line-clamp-2">
                                        {getLocalizedString(course.title, i18n.language)}
                                    </h3>
                                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} line-clamp-2`}>
                                        {getLocalizedString(course.description, i18n.language)}
                                    </p>
                                </div>
                            ))}
                        </div>
                        {instructorCourses.length > 6 && (
                            <div className="text-center mt-4">
                                <button
                                    onClick={() => navigate('/my-courses')}
                                    className="text-red-600 hover:text-red-700 font-medium"
                                >
                                    {t('buttons.viewAll')} ({instructorCourses.length} {t('instructorDashboard.totalCourses')})
                                </button>
                            </div>
                        )}
                    </div>
                )}

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