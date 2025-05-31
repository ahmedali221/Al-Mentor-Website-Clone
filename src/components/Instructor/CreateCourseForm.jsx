import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';

const CreateCourseForm = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const currentLang = i18n.language;

  // Extract instructor ID from state, if available
  const instructorIdFromState = location.state?.instructorId || '';

  // Form States
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [createdCourseId, setCreatedCourseId] = useState(null);

  // Course Form State
  const [courseForm, setCourseForm] = useState({
    title: { en: '', ar: '' },
    slug: { en: '', ar: '' },
    topic: '',
    category: '',
    instructor: instructorIdFromState,
    thumbnail: '',
    description: { en: '', ar: '' },
    level: { en: 'beginner', ar: 'مبتدئ' },
    language: { en: 'Arabic', ar: 'العربية' }
  });

  // Fetch Categories and Topics
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching categories and topics...');
        const [categoriesRes, topicsRes] = await Promise.all([
          axios.get('/api/category'),
          axios.get('/api/topics')
        ]);

        if (categoriesRes.data.success) {
          setCategories(categoriesRes.data.data || []);
        }
        if (topicsRes.data) {
          setTopics(topicsRes.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error.response || error);
        toast.error(t('messages.fetchError'));
      }
    };
    fetchData();
  }, [t]);

  // Handle Form Input Changes
  const handleInputChange = (field, value, lang = null) => {
    if (lang) {
      setCourseForm(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [lang]: value
        }
      }));

      if (field === 'title' && lang === 'en') {
        const slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        setCourseForm(prev => ({
          ...prev,
          slug: {
            ...prev.slug,
            en: slug
          }
        }));
      }
    } else {
      setCourseForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const courseData = {
        ...courseForm,
        instructor: instructorIdFromState || courseForm.instructor,
        slug: {
          ...courseForm.slug,
          en: `${courseForm.slug.en}-${Date.now()}`
        }
      };

      console.log('Submitting course data:', courseData);

      const response = await axios.post('/api/courses', courseData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Raw server response:', response);
      console.log('Response data:', response.data);

      const courseId = response.data._id || (response.data.data && response.data.data._id);

      if (courseId) {
        console.log('Successfully created course with ID:', courseId);

        setCreatedCourseId(courseId);

        toast.success(t('messages.courseCreated'));

        setTimeout(() => {
          navigate(`/instructor-module-form/${courseId}`, {
            state: {
              courseId: courseId,
              courseDetails: response.data
            }
          });
        }, 500);
      } else {
        console.error('Course ID not found in response:', response.data);
        toast.error(t('messages.createError'));
      }
    } catch (error) {
      console.error('Error creating course:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      if (error.response?.data?.code === 11000) {
        toast.error(t('messages.slugExistsRetrying'));
        handleSubmit(e);
      } else {
        toast.error(error.response?.data?.message || t('messages.createError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkipToModule = () => {
    if (createdCourseId) {
      console.log('Navigating to module form with course ID:', createdCourseId);
      navigate(`/instructor-module-form/${createdCourseId}`, {
        state: {
          courseId: createdCourseId,
          courseDetails: courseForm
        }
      });
    } else {
      toast.error(t('messages.createCourseFirst'));
    }
  };

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t('instructor.createCourse')}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">{t('instructorForms.basicInfo')}</h2>

            {/* Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('instructorForms.titleEn')}</label>
                <input
                  type="text"
                  value={courseForm.title.en}
                  onChange={(e) => handleInputChange('title', e.target.value, 'en')}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  required
                  maxLength={120}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('instructorForms.titleAr')}</label>
                <input
                  type="text"
                  value={courseForm.title.ar}
                  onChange={(e) => handleInputChange('title', e.target.value, 'ar')}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  dir="rtl"
                  required
                  maxLength={120}
                />
              </div>
            </div>

            {/* Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('instructorForms.slugEn')}</label>
                <input
                  type="text"
                  value={courseForm.slug.en}
                  onChange={(e) => handleInputChange('slug', e.target.value.toLowerCase(), 'en')}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('instructorForms.slugAr')}</label>
                <input
                  type="text"
                  value={courseForm.slug.ar}
                  onChange={(e) => handleInputChange('slug', e.target.value.toLowerCase(), 'ar')}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  dir="rtl"
                  required
                />
              </div>
            </div>

            {/* Category and Topic Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('instructorForms.category')}</label>
                <select
                  value={courseForm.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  required
                >
                  <option value="">{t('instructorForms.selectCategory')}</option>
                  {Array.isArray(categories) && categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name[currentLang] || category.name.en}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('instructorForms.topic')}</label>
                <select
                  value={courseForm.topic}
                  onChange={(e) => handleInputChange('topic', e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  required
                >
                  <option value="">{t('instructorForms.selectTopic')}</option>
                  {Array.isArray(topics) && topics.map(topic => (
                    <option key={topic._id} value={topic._id}>
                      {topic.name[currentLang] || topic.name.en}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Content Information */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">{t('instructorForms.contentInfo')}</h2>

            {/* Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('instructorForms.descriptionEn')}</label>
                <textarea
                  value={courseForm.description.en}
                  onChange={(e) => handleInputChange('description', e.target.value, 'en')}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  rows="4"
                  required
                  maxLength={2000}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('instructorForms.descriptionAr')}</label>
                <textarea
                  value={courseForm.description.ar}
                  onChange={(e) => handleInputChange('description', e.target.value, 'ar')}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  dir="rtl"
                  rows="4"
                  required
                  maxLength={2000}
                />
              </div>
            </div>

            {/* Thumbnail URL Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">{t('instructorForms.thumbnail')}</label>
              <input
                type="text"
                value={courseForm.thumbnail}
                onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                placeholder="أدخل رابط الصورة"
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
          </div>

          {/* Course Settings */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">{t('instructorForms.courseSettings')}</h2>

            {/* Level and Language */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('instructorForms.level')}</label>
                <select
                  value={courseForm.level[currentLang]}
                  onChange={(e) => handleInputChange('level', {
                    ...courseForm.level,
                    [currentLang]: e.target.value
                  })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  required
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
                <label className="block text-sm font-medium mb-2">{t('instructorForms.language')}</label>
                <select
                  value={courseForm.language[currentLang]}
                  onChange={(e) => handleInputChange('language', {
                    ...courseForm.language,
                    [currentLang]: e.target.value
                  })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  required
                >
                  {currentLang === 'en' ? (
                    <>
                      <option value="English">English</option>
                      <option value="Arabic">Arabic</option>
                      <option value="French">French</option>
                    </>
                  ) : (
                    <>
                      <option value="الإنجليزية">الإنجليزية</option>
                      <option value="العربية">العربية</option>
                      <option value="الفرنسية">الفرنسية</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-between pt-4">
            <div className="space-x-4">
              <button
                type="button"
                onClick={handleSkipToModule}
                className={`px-6 py-2 rounded-lg text-white ${createdCourseId
                  ? 'bg-blue-600 hover:bg-blue-700 transition'
                  : 'bg-gray-400 cursor-not-allowed'
                  }`}
                title={createdCourseId ? t('common.skipToModule') : t('messages.createCourseFirst')}
              >
                {t('common.skipToModule')}
              </button>

              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 rounded-lg text-white ${loading ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
                  }`}
              >
                {loading ? t('common.loading') : t('instructor.createCourse')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourseForm;