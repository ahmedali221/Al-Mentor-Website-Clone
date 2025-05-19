import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { FaBookmark } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const SavedCourses = () => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const navigate = useNavigate();
  const [savedCourses, setSavedCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);

  useEffect(() => {
    // Get saved course IDs from localStorage
    const saved = localStorage.getItem('savedCourses');
    setSavedCourses(saved ? JSON.parse(saved) : []);
  }, []);

  useEffect(() => {
    // Fetch all courses (could be optimized to fetch only needed ones)
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => setAllCourses(data.data || data))
      .catch(() => setAllCourses([]));
  }, []);

  // Helper function to get localized text
  const getLocalizedText = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[currentLang] || obj.en || Object.values(obj)[0] || '';
  };

  // Filter only saved courses
  const filteredCourses = allCourses.filter(course => savedCourses.includes(course._id));

  return (
    <div className={`${theme === 'dark' ? 'bg-[#181818] text-white' : 'bg-gray-50 text-gray-900'} min-h-screen py-12 px-4`}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t('Saved Courses')}</h1>
        {filteredCourses.length === 0 ? (
          <div className="text-center text-gray-400 text-xl py-24">{t('No saved courses found.')}</div>
        ) : (
          <div className="flex flex-col gap-10">
            {filteredCourses.map((course) => {
              const title = getLocalizedText(course.title);
              const description = getLocalizedText(course.description);
              const instructorProfile = course.instructorDetails?.profile || {};
              const instructorName = instructorProfile
                ? `${instructorProfile.firstName?.[currentLang] || instructorProfile.firstName?.en || ''} ${instructorProfile.lastName?.[currentLang] || instructorProfile.lastName?.en || ''}`
                : t('Unknown Instructor');
              const image = course.thumbnail || 'https://placehold.co/600x340';
              const duration = course.duration || '';
              const lessonsCount = course.lessonsCount || '';
              const language = getLocalizedText(course.language);
              return (
                <div key={course._id} className={`flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-lg ${theme === 'dark' ? 'bg-[#232323]' : 'bg-white'} transition-all`}>
                  <div className="md:w-2/5 w-full h-64 md:h-auto flex-shrink-0 relative">
                    <img src={image} alt={title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 p-8 flex flex-col justify-between">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold mb-2">{title}</h2>
                      <div className="text-lg font-medium mb-2">{instructorName}</div>
                      <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{description}</p>
                    </div>
                    <div className="flex flex-wrap gap-6 items-center mt-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span role="img" aria-label="duration">⏱️</span>
                        {t('Duration')}: {duration} {lessonsCount ? `/ ${lessonsCount} ${t('lessons')}` : ''}
                      </div>
                      <div className="flex items-center gap-2">
                        <span role="img" aria-label="language">🔊</span>
                        {t('Course Language')}: {language}
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-6 right-6">
                    <FaBookmark className="text-white bg-black bg-opacity-30 rounded-full p-2 w-10 h-10" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedCourses; 