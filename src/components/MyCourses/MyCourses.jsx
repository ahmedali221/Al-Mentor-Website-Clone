import React from 'react';
import { useMyCourses } from '../../context/MyCoursesContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { FaBookmark, FaClock, FaLayerGroup, FaPlay, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const MyCourses = () => {
  const { myCourses, removeCourse } = useMyCourses();
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const navigate = useNavigate();

  const handleCourseClick = (courseId) => {
    navigate(`/lesson-viewer/${courseId}`);
  };

  const handleBrowseCourses = () => {
    navigate('/courses');
  };

  // Helper function to get localized text
  const getLocalizedText = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    if (obj && typeof obj === 'object') {
      return obj[currentLang] || obj.en || obj.ar || '';
    }
    return '';
  };

  if (myCourses.length === 0) {
    return (
      <div className={`min-h-[60vh] flex items-center justify-center ${theme === 'dark' ? 'bg-[#0d232b] text-white' : 'bg-white text-black'}`}>
        <div className="text-center">
          <FaBookmark className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">{t('No Saved Courses')}</h2>
          <p className="text-gray-500 mb-4">{t('You haven\'t saved any courses yet.')}</p>
          <button
            onClick={handleBrowseCourses}
            className="bg-[#00bcd4] text-white px-6 py-2 rounded-lg hover:bg-[#0097a7] transition"
          >
            {t('Browse Courses')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-[60vh] py-12 px-4 md:px-8 ${theme === 'dark' ? 'bg-[#0d232b] text-white' : 'bg-white text-black'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{t('My Courses')}</h1>
          <span className="bg-[#00bcd4] text-white px-4 py-2 rounded-full">
            {myCourses.length} {t('Courses')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myCourses.map((course) => (
            <div
              key={course._id}
              className={`rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl ${
                theme === 'dark' ? 'bg-[#181f1f]' : 'bg-white'
              }`}
            >
              <div className="relative group">
                <img
                  src={course.thumbnail || 'https://placehold.co/600x340'}
                  alt={getLocalizedText(course.title)}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleCourseClick(course._id)}
                    className="bg-[#00bcd4] text-white px-6 py-2 rounded-lg hover:bg-[#0097a7] transition flex items-center gap-2"
                  >
                    <FaPlay className="w-4 h-4" />
                    {t('Continue Learning')}
                  </button>
                </div>
                <button
                  onClick={() => removeCourse(course._id)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                  aria-label={t('Remove from My Courses')}
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2 line-clamp-2">{getLocalizedText(course.title)}</h3>
                <p className="text-sm text-gray-500 mb-4">{getLocalizedText(course.instructor)}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <FaClock className="text-[#00bcd4]" />
                    <span>{course.duration || '0h 0m'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaLayerGroup className="text-[#00bcd4]" />
                    <span>{getLocalizedText(course.level) || 'All Levels'}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleCourseClick(course._id)}
                    className="text-[#00bcd4] hover:text-[#0097a7] transition flex items-center gap-2"
                  >
                    <FaPlay className="w-4 h-4" />
                    {t('Continue Learning')}
                  </button>
                  <span className="text-sm text-gray-500">
                    {t('Last accessed')}: {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyCourses; 