import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';

const CreateLessonForm = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const navigate = useNavigate();
  const { moduleId } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [moduleDetails, setModuleDetails] = useState(null);

  useEffect(() => {
    console.log('Module ID from params:', moduleId);
    console.log('Location state:', location.state);

    if (!moduleId) {
      toast.error(t('messages.moduleIdRequired'));
      navigate('/instructor-form');
      return;
    }

    if (location.state?.moduleDetails) {
      console.log('Using module details from state:', location.state.moduleDetails);
      setModuleDetails(location.state.moduleDetails);
      setLessonForm(prev => ({
        ...prev,
        module: moduleId,
        course: location.state.courseId
      }));
      return;
    }

    const fetchModuleDetails = async () => {
      try {
        console.log('Fetching module details for ID:', moduleId);
        const response = await axios.get(`http://localhost:5000/api/modules/${moduleId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data.success && response.data.data) {
          console.log('Module details fetched successfully:', response.data.data);
          const moduleData = response.data.data;
          setModuleDetails(moduleData);
          setLessonForm(prev => ({
            ...prev,
            module: moduleId,
            course: moduleData.course
          }));
        } else {
          console.error('Module not found in database');
          toast.error(t('messages.moduleNotFound'));
          navigate('/instructor-form');
        }
      } catch (error) {
        console.error('Error fetching module details:', error);
        if (error.response?.status === 404) {
          toast.error(t('messages.moduleNotFound'));
          navigate('/instructor-form');
        } else {
          toast.error(t('messages.fetchError'));
        }
      }
    };

    if (!location.state?.courseId) {
      fetchModuleDetails();
    } else {
      setLessonForm(prev => ({
        ...prev,
        module: moduleId,
        course: location.state.courseId
      }));
    }
  }, [moduleId, location.state, navigate, t]);

  const [lessonForm, setLessonForm] = useState({
    title: { en: '', ar: '' },
    module: moduleId || '',
    course: location.state?.courseId || '',
    description: { en: '', ar: '' },
    order: 0,
    duration: 0,
    content: {
      videoUrl: '',
      articleText: { en: '', ar: '' },
      attachments: []
    },
    isFree: false,
    isPublished: false
  });

  const handleInputChange = (field, value, lang = null) => {
    if (lang) {
      setLessonForm(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [lang]: value
        }
      }));
    } else {
      if (field === 'order' || field === 'duration') {
        const numValue = value === '' ? 0 : parseInt(value) || 0;
        setLessonForm(prev => ({
          ...prev,
          [field]: numValue
        }));
      } else {
        setLessonForm(prev => ({
          ...prev,
          [field]: value
        }));
      }
    }
  };

  const handleContentChange = (field, value, lang = null) => {
    if (lang) {
      setLessonForm(prev => ({
        ...prev,
        content: {
          ...prev.content,
          [field]: {
            ...prev.content[field],
            [lang]: value
          }
        }
      }));
    } else {
      setLessonForm(prev => ({
        ...prev,
        content: {
          ...prev.content,
          [field]: value
        }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Submitting lesson data:', lessonForm);
      
      if (!lessonForm.module) {
        toast.error(t('messages.moduleIdRequired'));
        setLoading(false);
        return;
      }

      if (!lessonForm.course) {
        toast.error(t('messages.courseIdRequired'));
        setLoading(false);
        return;
      }

      if (!lessonForm.title.en || !lessonForm.title.ar) {
        toast.error(t('messages.titleRequired'));
        setLoading(false);
        return;
      }

      const response = await axios.post('http://localhost:5000/api/lessons', {
        ...lessonForm,
        module: lessonForm.module.toString(),
        course: lessonForm.course.toString(),
        order: parseInt(lessonForm.order) || 0,
        duration: parseInt(lessonForm.duration) || 0
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Server response:', response.data);

      if (response.data && response.data._id) {
        const newLessonId = response.data._id;
        console.log('Created lesson with ID:', newLessonId);
        toast.success(t('messages.lessonCreated'));
        
        toast.info(
          `${t('instructor.lessonTitleEn')}: ${response.data.title.en}\n` +
          `${t('instructor.lessonTitleAr')}: ${response.data.title.ar}`
        );

        setTimeout(() => {
          navigate(`/instructor-module/${lessonForm.module}`, {
            state: { 
              courseId: lessonForm.course,
              moduleId: lessonForm.module,
              moduleDetails: moduleDetails,
              courseDetails: response.data.course
            }
          });
        }, 1000);
      } else {
        console.error('Lesson creation response structure:', response.data);
        toast.error(t('messages.createError'));
      }
    } catch (error) {
      console.error('Error creating lesson:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      toast.error(error.response?.data?.message || t('messages.createError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 shadow-md dark:shadow-lg rounded-lg">
      {moduleDetails ? (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h2 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
            {t('instructor.moduleDetails')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('instructor.moduleName')}: {moduleDetails.title?.[currentLang] || moduleDetails.title?.en || ''}
          </p>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
          <p className="text-yellow-700 dark:text-yellow-300">
            {t('messages.loadingModuleDetails')}
          </p>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
        {t('instructor.createLesson')}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {t('instructor.lessonTitleEn')} *
            </label>
            <input
              type="text"
              value={lessonForm.title.en}
              onChange={(e) => handleInputChange('title', e.target.value, 'en')}
              maxLength={100}
              required
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {t('instructor.lessonTitleAr')} *
            </label>
            <input
              type="text"
              value={lessonForm.title.ar}
              onChange={(e) => handleInputChange('title', e.target.value, 'ar')}
              dir="rtl"
              maxLength={100}
              required
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {t('instructor.descriptionEn')}
            </label>
            <textarea
              value={lessonForm.description.en}
              onChange={(e) => handleInputChange('description', e.target.value, 'en')}
              rows={4}
              maxLength={500}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {t('instructor.descriptionAr')}
            </label>
            <textarea
              value={lessonForm.description.ar}
              onChange={(e) => handleInputChange('description', e.target.value, 'ar')}
              dir="rtl"
              rows={4}
              maxLength={500}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Order and Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {t('instructor.lessonOrder')} *
            </label>
            <input
              type="number"
              value={lessonForm.order || 0}
              onChange={(e) => handleInputChange('order', e.target.value)}
              min={0}
              required
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {t('instructor.duration')} ({t('instructor.minutes')})
            </label>
            <input
              type="number"
              value={lessonForm.duration || 0}
              onChange={(e) => handleInputChange('duration', e.target.value)}
              min={0}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">
            {t('instructor.content')}
          </h3>

          {/* Video URL */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {t('instructor.videoUrl')}
            </label>
            <input
              type="text"
              value={lessonForm.content.videoUrl}
              onChange={(e) => handleContentChange('videoUrl', e.target.value)}
              placeholder="https://example.com/video.mp4"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Article Text */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                {t('instructor.articleTextEn')}
              </label>
              <textarea
                value={lessonForm.content.articleText.en}
                onChange={(e) => handleContentChange('articleText', e.target.value, 'en')}
                rows={4}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                {t('instructor.articleTextAr')}
              </label>
              <textarea
                value={lessonForm.content.articleText.ar}
                onChange={(e) => handleContentChange('articleText', e.target.value, 'ar')}
                dir="rtl"
                rows={4}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={lessonForm.isPublished}
              onChange={(e) => handleInputChange('isPublished', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              {t('instructor.publishLesson')}
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={lessonForm.isFree}
              onChange={(e) => handleInputChange('isFree', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              {t('instructor.freeLesson')}
            </label>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => navigate(`/instructor-module/${moduleId}`, {
              state: { courseId: lessonForm.course }
            })}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {t('common.backToModule')}
          </button>

          <div className="space-x-4">
            <button
              type="button"
              onClick={() => navigate('/instructor-dashboard')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {t('common.skipToDashboard')}
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-lg text-white ${
                loading ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {loading ? t('common.loading') : t('instructorForms.createLesson')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateLessonForm;
