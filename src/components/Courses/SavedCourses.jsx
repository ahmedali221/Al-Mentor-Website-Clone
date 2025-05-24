import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { FaBookmark } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const SavedCourses = () => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const navigate = useNavigate();
  const { user } = useAuth();
  const [savedCourses, setSavedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingCourse, setSavingCourse] = useState(false);

  const getInstructorName = (profile) => {
    if (!profile) return t('Unknown Instructor');
    const firstName = profile.firstName?.[currentLang] || profile.firstName?.en || '';
    const lastName = profile.lastName?.[currentLang] || profile.lastName?.en || '';
    return `${firstName} ${lastName}`;
  };

  useEffect(() => {
    if (!user) {
      navigate('/loginPage');
      return;
    }

    const fetchSavedCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/saved-courses/user/${user._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        console.log('DEBUG: fetchSavedCourses response status:', response.status);
        const text = await response.text();
        console.log('DEBUG: fetchSavedCourses raw response text:', text);
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error('DEBUG: fetchSavedCourses failed to parse JSON:', e);
          setError(t('messages.failedToFetchSavedCourses'));
          return;
        }
        console.log('DEBUG: fetchSavedCourses parsed data:', data);

        // Support both array and object with data field
        const items = Array.isArray(data) ? data : data.data;
        if (!Array.isArray(items)) {
          setError(t('messages.failedToFetchSavedCourses'));
          console.error('DEBUG: fetchSavedCourses items is not an array:', items);
          return;
        }
        setSavedCourses(items);
        setError(null);
      } catch (err) {
        setError(t('messages.failedToFetchSavedCourses'));
        toast.error(t('messages.failedToFetchSavedCourses'));
        console.error('DEBUG: fetchSavedCourses error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedCourses();
  }, [user, navigate, t]);

  const toggleSaveCourse = async (courseId, e) => {
    e.stopPropagation();
    
    if (!user) {
      navigate('/loginPage');
      return;
    }

    if (savingCourse) return;

    // Debug logs
    console.log('DEBUG: user =', user);
    console.log('DEBUG: courseId =', courseId);
    console.log('DEBUG: token =', localStorage.getItem('token'));
    const payload = {
      userId: user?._id,
      courseId,
      savedAt: new Date().toISOString()
    };
    console.log('DEBUG: payload =', payload);

    try {
      setSavingCourse(true);
      const isCurrentlySaved = savedCourses.some(course => course._id === courseId);

      if (isCurrentlySaved) {
        // Unsave course
        const response = await fetch(`http://localhost:5000/api/saved-courses/${user._id}/${courseId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('DEBUG: Unsave error response:', errorData);
          throw new Error(t('messages.failedToUpdateSavedCourses'));
        }

        setSavedCourses(prev => prev.filter(course => course._id !== courseId));
        toast.success(t('messages.courseRemovedFromSaved'));
      } else {
        // Save course
        const response = await fetch('http://localhost:5000/api/saved-courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) {
          console.error('DEBUG: Save error response:', data);
          if (
            response.status === 409 ||
            (response.status === 400 && data.message && data.message.toLowerCase().includes('already saved'))
          ) {
            toast.info(t('messages.courseAlreadySaved'));
            return;
          }
          throw new Error(data.message || t('messages.failedToUpdateSavedCourses'));
        }

        setSavedCourses(prev => [...prev, data]);
        toast.success(t('messages.courseAddedToSaved'));
      }
    } catch (err) {
      toast.error(err.message || t('messages.failedToUpdateSavedCourses'));
    } finally {
      setSavingCourse(false);
    }
  };

  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  const getLocalizedText = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[currentLang] || obj.en || Object.values(obj)[0] || '';
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className={`${theme === 'dark' ? 'bg-[#181818] text-white' : 'bg-gray-50 text-gray-900'} min-h-screen py-12 px-4 mt-24`}>
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-xl">{t('messages.loading')}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${theme === 'dark' ? 'bg-[#181818] text-white' : 'bg-gray-50 text-gray-900'} min-h-screen py-12 px-4 mt-24`}>
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-xl text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${theme === 'dark' ? 'bg-[#181818] text-white' : 'bg-gray-50 text-gray-900'} min-h-screen py-12 px-4 mt-24`}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t('profile.savedCourses')}</h1>
        {savedCourses.length === 0 ? (
          <div className="text-center text-gray-400 text-xl py-24">{t('messages.noResults')}</div>
        ) : (
          <div className="flex flex-col gap-10">
            {savedCourses.map((course) => {
              if (!course || typeof course !== 'object') return null;

              const title = getLocalizedText(course.title);
              const description = getLocalizedText(course.description);
              const instructorProfile = course.instructorDetails?.profile || course.instructor?.profile || {};
              const instructorName = getInstructorName(instructorProfile);
              const image = course.thumbnail || 'https://placehold.co/600x340';
              const duration = course.duration || '';
              const lessonsCount = course.lessonsCount || '';
              const language = getLocalizedText(course.language);

              return (
                <div
                  key={course._id}
                  className={`flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-lg ${theme === 'dark' ? 'bg-[#232323]' : 'bg-white'} transition-all cursor-pointer hover:shadow-xl relative`}
                  onClick={() => handleCourseClick(course._id)}
                >
                  <div className="md:w-2/5 w-full h-64 md:h-auto flex-shrink-0 relative">
                    <img
                      src={image}
                      alt={title}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.target.src = 'https://placehold.co/600x340')}
                    />
                  </div>
                  <div className="flex-1 p-8 flex flex-col justify-between">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold mb-2">{title}</h2>
                      <div className="text-lg font-medium mb-2">{instructorName}</div>
                      <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} line-clamp-3`}>
                        {description}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-6 items-center mt-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span role="img" aria-label="duration">⏱️</span>
                        {t('courses.duration')}: {duration} {lessonsCount ? `/ ${lessonsCount} ${t('courses.lessons')}` : ''}
                      </div>
                      <div className="flex items-center gap-2">
                        <span role="img" aria-label="language">🔊</span>
                        {t('courses.language')}: {language}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => toggleSaveCourse(course._id, e)}
                    disabled={savingCourse}
                    className={`absolute top-6 right-6 bg-transparent border-none p-0 ${savingCourse ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <FaBookmark className="text-red-600 bg-black bg-opacity-30 rounded-full p-2 w-10 h-10" />
                  </button>
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