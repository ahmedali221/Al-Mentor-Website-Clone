import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';

const CreateModuleForm = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { courseId: courseIdFromParams } = useParams();
  const location = useLocation();
  const currentLang = i18n.language;
  const [loading, setLoading] = useState(false);
  const [courseDetails, setCourseDetails] = useState(null);

  useEffect(() => {
    console.log('Location state:', location.state);
    console.log('Course ID from params:', courseIdFromParams);

    const courseIdFromState = location.state?.courseId;
    const finalCourseId = courseIdFromParams || courseIdFromState;

    console.log('Course ID from state:', courseIdFromState);
    console.log('Final Course ID:', finalCourseId);

    if (!finalCourseId) {
      console.error('No courseId found in params or state');
      toast.error(t('messages.courseIdRequired'));
      navigate('/instructor-form', { replace: true });
      return;
    }

    setModuleForm(prev => ({
      ...prev,
      course: finalCourseId
    }));

    if (location.state?.courseDetails) {
      console.log('Using course details from state:', location.state.courseDetails);
      setCourseDetails(location.state.courseDetails);
      return;
    }

    const fetchCourseDetails = async () => {
      try {
        console.log('Fetching course details for ID:', finalCourseId);
        const response = await axios.get(`https://al-mentor-database-production.up.railway.app/api/courses/${finalCourseId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.data.success) {
          console.log('Course details fetched successfully:', response.data.data);
          setCourseDetails(response.data.data);
        } else {
          console.error('Course not found in database');
          toast.error(t('messages.courseNotFound'));
          navigate('/instructor-form', { replace: true });
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        toast.error(t('messages.courseNotFound'));
        navigate('/instructor-form', { replace: true });
      }
    };

    fetchCourseDetails();
  }, [courseIdFromParams, location.state, navigate, t]);

  const [moduleForm, setModuleForm] = useState({
    title: { en: '', ar: '' },
    course: courseIdFromParams || location.state?.courseId || '',
    order: 0,
    duration: 0,
    isPublished: false,
    completionCriteria: 'all-lessons',
    level: {
      en: 'beginner',
      ar: 'مبتدئ'
    }
  });

  const handleInputChange = (field, value, lang = null) => {
    if (lang) {
      setModuleForm(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [lang]: value
        }
      }));
    } else {
      setModuleForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!moduleForm.course) {
        toast.error(t('messages.courseIdRequired'));
        setLoading(false);
        return;
      }

      if (!moduleForm.title.en || !moduleForm.title.ar) {
        toast.error(t('messages.titleRequired'));
        return;
      }

      if (moduleForm.order < 0) {
        toast.error(t('messages.invalidOrder'));
        return;
      }

      console.log('Submitting module data:', moduleForm);

      const response = await axios.post('https://al-mentor-database-production.up.railway.app/api/modules', {
        ...moduleForm,
        course: moduleForm.course.toString(),
        order: parseInt(moduleForm.order),
        duration: parseInt(moduleForm.duration)
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Server response:', response.data);

      // Check if the response contains the module data directly
      if (response.data && response.data._id) {
        const newModuleId = response.data._id;
        console.log('Created module with ID:', newModuleId);
        toast.success(t('messages.moduleCreated'));

        // Navigate to lesson form with the correct module ID
        navigate(`/instructor-lesson-form/${newModuleId}`, {
          state: {
            courseId: moduleForm.course,
            moduleId: newModuleId,
            moduleDetails: response.data
          }
        });
      } else if (response.data && response.data.data && response.data.data._id) {
        // Handle case where module data is nested in data property
        const newModuleId = response.data.data._id;
        console.log('Created module with ID:', newModuleId);
        toast.success(t('messages.moduleCreated'));

        navigate(`/instructor-lesson-form/${newModuleId}`, {
          state: {
            courseId: moduleForm.course,
            moduleId: newModuleId,
            moduleDetails: response.data.data
          }
        });
      } else {
        console.error('Module creation response structure:', response.data);
        toast.error(t('messages.createError'));
      }
    } catch (error) {
      console.error('Error creating module:', error.response?.data || error);
      toast.error(
        error.response?.data?.message ||
        error.response?.data?.error ||
        t('messages.createError')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 shadow-md dark:shadow-lg rounded-lg">
      {courseDetails ? (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h2 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
            {t('instructor.courseDetails')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('instructor.courseName')}: {courseDetails.title[currentLang]}
          </p>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
          <p className="text-yellow-700 dark:text-yellow-300">
            {t('messages.loadingCourseDetails')}
          </p>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
        {t('instructor.createModule')}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {t('instructor.moduleTitleEn')} *
            </label>
            <input
              type="text"
              value={moduleForm.title.en}
              onChange={(e) => handleInputChange('title', e.target.value, 'en')}
              maxLength={100}
              required
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {t('instructor.moduleTitleAr')} *
            </label>
            <input
              type="text"
              value={moduleForm.title.ar}
              onChange={(e) => handleInputChange('title', e.target.value, 'ar')}
              dir="rtl"
              maxLength={100}
              required
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Level */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {t('instructor.level')} *
            </label>
            <select
              value={moduleForm.level[currentLang]}
              onChange={(e) => handleInputChange('level', {
                ...moduleForm.level,
                [currentLang]: e.target.value,
                [currentLang === 'en' ? 'ar' : 'en']:
                  e.target.value === 'beginner' ? 'مبتدئ' :
                    e.target.value === 'intermediate' ? 'متوسط' : 'متقدم'
              })}
              required
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {currentLang === 'en' ? (
                <>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </>
              ) : (
                <>
                  <option value="مبتدئ">مبتدئ</option>
                  <option value="متوسط">متوسط</option>
                  <option value="متقدم">متقدم</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {t('instructor.completionCriteria')}
            </label>
            <select
              value={moduleForm.completionCriteria}
              onChange={(e) => handleInputChange('completionCriteria', e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all-lessons">{t('instructor.allLessons')}</option>
              <option value="quiz-pass">{t('instructor.quizPass')}</option>
              <option value="none">{t('instructor.none')}</option>
            </select>
          </div>
        </div>

        {/* Order */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            {t('instructor.moduleOrder')} *
          </label>
          <input
            type="number"
            value={moduleForm.order}
            onChange={(e) => handleInputChange('order', Math.max(0, parseInt(e.target.value) || 0))}
            min={0}
            required
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={moduleForm.isPublished}
              onChange={(e) => handleInputChange('isPublished', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              {t('instructor.publishModule')}
            </label>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => navigate('/instructor-form')}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {t('common.backToDashboard')}
          </button>

          <div className="space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/instructor-lesson-form/${courseIdFromParams}`)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {t('common.skipToLesson')}
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-lg text-white ${loading ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
                }`}
            >
              {loading ? t('common.loading') : t('instructorForms.createModule')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateModuleForm;