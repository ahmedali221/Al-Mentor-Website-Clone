import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { FaBookmark } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
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
        
        if (!response.ok) throw new Error('Failed to fetch saved courses');
        
        const data = await response.json();
        setSavedCourses(data.map(item => item.courseId));
      } catch (err) {
        setError(err.message);
        toast.error(t('Failed to fetch saved courses'));
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

        if (!response.ok) throw new Error('Failed to unsave course');

        setSavedCourses(prev => prev.filter(course => course._id !== courseId));
        toast.success(t('Course removed from saved courses'));
      } else {
        // Save course
        const response = await fetch('http://localhost:5000/api/saved-courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            userId: user._id,
            courseId: courseId,
            savedAt: new Date().toISOString()
          })
        });

        if (!response.ok) {
          if (response.status === 409) {
            toast.info(t('Course is already in your saved courses'));
            return;
          }
          throw new Error('Failed to save course');
        }

        const savedCourse = await response.json();
        setSavedCourses(prev => [...prev, savedCourse.courseId]);
        toast.success(t('Course added to saved courses'));
      }
    } catch (err) {
      toast.error(err.message || t('Failed to update saved courses'));
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

  if (loading) {
    return (
      <div className={`${theme === 'dark' ? 'bg-[#181818] text-white' : 'bg-gray-50 text-gray-900'} min-h-screen py-12 px-4`}>
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-xl">{t('Loading...')}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${theme === 'dark' ? 'bg-[#181818] text-white' : 'bg-gray-50 text-gray-900'} min-h-screen py-12 px-4`}>
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-xl text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${theme === 'dark' ? 'bg-[#181818] text-white' : 'bg-gray-50 text-gray-900'} min-h-screen py-12 px-4`}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t('Saved Courses')}</h1>
        {savedCourses.length === 0 ? (
          <div className="text-center text-gray-400 text-xl py-24">{t('No saved courses found.')}</div>
        ) : (
          <div className="flex flex-col gap-10">
            {savedCourses.map((course) => {
              const title = getLocalizedText(course.title);
              const description = getLocalizedText(course.description);
              const instructorProfile = course.instructorDetails?.profile || course.instructor?.profile || {};
              const instructorName = instructorProfile
                ? `${instructorProfile.firstName?.[currentLang] || instructorProfile.firstName?.en || ''} ${instructorProfile.lastName?.[currentLang] || instructorProfile.lastName?.en || ''}`
                : t('Unknown Instructor');
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
                    <img src={image} alt={title} className="w-full h-full object-cover" />
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
                        {t('Duration')}: {duration} {lessonsCount ? `/ ${lessonsCount} ${t('lessons')}` : ''}
                      </div>
                      <div className="flex items-center gap-2">
                        <span role="img" aria-label="language">🔊</span>
                        {t('Course Language')}: {language}
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