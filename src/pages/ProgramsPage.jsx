import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import { MdPlayCircle } from 'react-icons/md';

function ProgramsPage() {
    const { t, i18n } = useTranslation();
    const { theme } = useTheme();
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const currentLanguage = i18n.language;
    const isRTL = currentLanguage === 'ar';

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                setLoading(true);
                const response = await axios.get('https://al-mentor-database-production.up.railway.app/api/programs');
                setPrograms(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching programs:', err);
                setError(t('messages.error', 'Failed to load programs'));
                setLoading(false);
            }
        };

        fetchPrograms();
    }, [t]);

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#1A1A1A] text-white' : 'bg-gray-50 text-gray-900'}`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-4">{t('messages.loading', 'Loading...')}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#1A1A1A] text-white' : 'bg-gray-50 text-gray-900'}`}>
                <div className="text-center">
                    <p className="text-red-600 text-xl">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full min-h-screen pt-28 pb-12 ${theme === 'dark' ? 'bg-[#1A1A1A] text-white' : 'bg-gray-50 text-gray-900'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="w-full px-2">
                <div className={`${isRTL ? 'text-right' : 'text-left'} mb-8`}>
                    <h1 className="text-5xl font-bold">{t('navigation.programs')}</h1>
                    <p className="text-2xl mt-2">{t('programs.subtitle', 'Structured Learning for Deeper Skill Mastery')}</p>
                    <p className={`mt-2 text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {t('programs.description', 'Take your learning to the next level with almentor Learning Programs—carefully curated course series designed to help you build your skills step by step, guiding you progressively toward your goals.')}
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-8">
                    {programs.map((program, idx) => (
                        <div key={idx} className={`rounded-lg shadow-md overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className="flex flex-col md:flex-row">
                                <div className="relative md:w-1/3">
                                    <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-md flex items-center gap-2">
                                        <MdPlayCircle className="text-sm" />
                                        {t('navigation.programs')}
                                    </div>
                                    <img
                                        src={program.thumbnail}
                                        alt={program.title[currentLanguage]}
                                        className="w-full h-[300px] object-cover"
                                    />
                                    <div className="absolute bottom-4 left-4 bg-gray-900/75 text-white px-3 py-1 rounded-md flex items-center gap-2">
                                        <MdPlayCircle className="text-sm" />
                                        {program.courses.length} {t('navigation.courses')}
                                    </div>
                                </div>
                                <div className="p-8 md:w-2/3">
                                    <h2 className="text-2xl font-semibold mb-4">{program.title[currentLanguage]}</h2>
                                    <p className={`mb-6 line-clamp-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                        {program.description[currentLanguage]}
                                    </p>
                                    <Link
                                        to={`/programs/${program._id}`}
                                        className={`inline-block border-2 px-6 py-2 rounded-md transition-colors ${theme === 'dark'
                                            ? 'border-gray-300 text-gray-300 hover:bg-gray-700'
                                            : 'border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
                                            }`}
                                    >
                                        {t('courses.viewDetails')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ProgramsPage;