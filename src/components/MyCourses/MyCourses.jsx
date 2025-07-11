import React, { useState, useEffect } from 'react';
import { useMyCourses } from '../../context/MyCoursesContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { FaBookmark, FaClock, FaLayerGroup, FaPlay, FaTrash, FaCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MyCourses = () => {
  const { myCourses, removeCourse } = useMyCourses();
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const navigate = useNavigate();
  const [completedCourses, setCompletedCourses] = useState(() => {
    const stored = localStorage.getItem('completedCourses');
    return stored ? JSON.parse(stored) : [];
  });
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch course details for completed courses
  const fetchCourseDetails = async (courseId) => {
    try {
      const response = await axios.get(`https://al-mentor-database-production.up.railway.app/api/courses/${courseId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching course ${courseId}:`, error);
      return null;
    }
  };

  useEffect(() => {
    const loadCompletedCourses = async () => {
      setLoading(true);
      try {
        // Get completed courses from localStorage
        const stored = localStorage.getItem('completedCourses');
        if (stored) {
          const completedIds = JSON.parse(stored);
          setCompletedCourses(completedIds);

          // Fetch details for completed courses that aren't in myCourses
          const completedCoursesData = await Promise.all(
            completedIds
              .filter(id => !myCourses.some(course => course._id === id))
              .map(id => fetchCourseDetails(id))
          );

          // Filter out any null results from failed fetches
          const validCompletedCourses = completedCoursesData.filter(course => course !== null);

          // Merge myCourses with completed courses
          const merged = [...myCourses, ...validCompletedCourses];
          setAllCourses(merged);
        } else {
          setAllCourses(myCourses);
        }
      } catch (error) {
        console.error('Error loading completed courses:', error);
        setAllCourses(myCourses);
      } finally {
        setLoading(false);
      }
    };

    loadCompletedCourses();
  }, [myCourses]);

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

  const isCourseCompleted = (courseId) => {
    return completedCourses.includes(courseId);
  };

  if (loading) {
    return (
      <div className={`min-h-[60vh] flex items-center justify-center py-12 ${theme === 'dark' ? 'bg-[#0d232b] text-white' : 'bg-white text-black'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00bcd4] mx-auto"></div>
          <p className="mt-4">{t('Loading courses...')}</p>
        </div>
      </div>
    );
  }

  if (allCourses.length === 0) {
    return (
      <div className={`min-h-[60vh] flex items-center justify-center py-12 ${theme === 'dark' ? 'bg-[#0d232b] text-white' : 'bg-white text-black'}`}>
        <div className="text-center">
          <FaBookmark className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2 mt-5">{t('No Saved Courses')}</h2>
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
    <div className={`min-h-[60vh] py-12 mt-12 px-4 md:px-8 ${theme === 'dark' ? 'bg-[#0d232b] text-white' : 'bg-white text-black'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">{t('My Courses')}</h1>
          <div className="flex gap-4">
            <span className="bg-[#00bcd4] text-white px-4 py-2 rounded-full">
              {allCourses.length} {t('Courses')}
            </span>
            <span className="bg-green-500 text-white px-4 py-2 rounded-full">
              {completedCourses.length} {t('Completed')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allCourses.map((course) => {
            const completed = isCourseCompleted(course._id);
            return (
              <div
                key={course._id}
                className={`rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl ${
                  theme === 'dark' ? 'bg-[#181f1f]' : 'bg-white'
                } ${completed ? 'border-2 border-green-500' : ''}`}
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
                      {completed ? (
                        <>
                          <FaPlay className="w-4 h-4" />
                          {t('Watch Again')}
                        </>
                      ) : (
                        <>
                          <FaPlay className="w-4 h-4" />
                          {t('Continue Learning')}
                        </>
                      )}
                    </button>
                  </div>
                  {!completed && (
                    <button
                      onClick={() => removeCourse(course._id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                      aria-label={t('Remove from My Courses')}
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  )}
                  {completed && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full flex items-center gap-2">
                      <FaCheck className="w-4 h-4" />
                      <span className="text-sm">{t('Completed')}</span>
                    </div>
                  )}
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
                      {completed ? (
                        <>
                          <FaPlay className="w-4 h-4" />
                          {t('Watch Again')}
                        </>
                      ) : (
                        <>
                          <FaPlay className="w-4 h-4" />
                          {t('Continue Learning')}
                        </>
                      )}
                    </button>
                    <span className="text-sm text-gray-500">
                      {t('Last accessed')}: {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyCourses; 