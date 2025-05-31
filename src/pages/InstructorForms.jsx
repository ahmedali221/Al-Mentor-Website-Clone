/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const InstructorForms = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const currentLang = i18n.language;

  // Form States
  const [activeForm, setActiveForm] = useState('course');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);

  // Course Form State
  const [courseForm, setCourseForm] = useState({
    title: { en: '', ar: '' },
    slug: { en: '', ar: '' },
    topic: '',
    subtopic: '',
    category: '',
    thumbnail: '',
    description: { en: '', ar: '' },
    shortDescription: { en: '', ar: '' },
    level: { en: 'beginner', ar: 'مبتدئ' },
    language: { en: 'Arabic', ar: 'العربية' },
    isFree: false,
  });

  // Fetch Categories, Topics, and Subtopics
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, topicsRes] = await Promise.all([
          axios.get('https://al-mentor-database-production.up.railway.app/api/categories'),
          axios.get('https://al-mentor-database-production.up.railway.app/api/topics')
        ]);
        setCategories(categoriesRes.data);
        setTopics(topicsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error(t('messages.fetchError'));
      }
    };
    fetchData();
  }, [t]);

  // Handle Topic Change
  const handleTopicChange = async (topicId) => {
    try {
      const response = await axios.get(`https://al-mentor-database-production.up.railway.app/api/topics/${topicId}/subtopics`);
      setSubtopics(response.data);
    } catch (error) {
      console.error('Error fetching subtopics:', error);
      toast.error(t('messages.fetchError'));
    }
  };

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
    } else {
      setCourseForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('thumbnail', file);

    try {
      const response = await axios.post('https://al-mentor-database-production.up.railway.app/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      handleInputChange('thumbnail', response.data.url);
      toast.success(t('messages.uploadSuccess'));
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(t('messages.uploadError'));
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const courseData = {
        ...courseForm,
        instructor: user._id,
        duration: 0, // Will be calculated from modules
        enrollmentCount: 0,
        rating: { average: 0, count: 0 }
      };

      const response = await axios.post('https://al-mentor-database-production.up.railway.app/api/courses', courseData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      toast.success(t('messages.courseCreated'));
      // Reset form or redirect
      setCourseForm({
        title: { en: '', ar: '' },
        slug: { en: '', ar: '' },
        topic: '',
        subtopic: '',
        category: '',
        thumbnail: '',
        description: { en: '', ar: '' },
        shortDescription: { en: '', ar: '' },
        level: { en: 'beginner', ar: 'مبتدئ' },
        language: { en: 'Arabic', ar: 'العربية' },
        isFree: false,
      });
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error(error.response?.data?.message || t('messages.createError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t('instructorForms.createCourse')}</h1>

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
                  onChange={(e) => handleInputChange('slug', e.target.value, 'en')}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('instructorForms.slugAr')}</label>
                <input
                  type="text"
                  value={courseForm.slug.ar}
                  onChange={(e) => handleInputChange('slug', e.target.value, 'ar')}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  dir="rtl"
                  required
                />
              </div>
            </div>

            {/* Category and Topic Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('instructorForms.category')}</label>
                <select
                  value={courseForm.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  required
                >
                  <option value="">{t('instructorForms.selectCategory')}</option>
                  {categories.map(category => (
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
                  onChange={(e) => {
                    handleInputChange('topic', e.target.value);
                    handleTopicChange(e.target.value);
                  }}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  required
                >
                  <option value="">{t('instructorForms.selectTopic')}</option>
                  {topics.map(topic => (
                    <option key={topic._id} value={topic._id}>
                      {topic.name[currentLang] || topic.name.en}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('instructorForms.subtopic')}</label>
                <select
                  value={courseForm.subtopic}
                  onChange={(e) => handleInputChange('subtopic', e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">{t('instructorForms.selectSubtopic')}</option>
                  {subtopics.map(subtopic => (
                    <option key={subtopic._id} value={subtopic._id}>
                      {subtopic.name[currentLang] || subtopic.name.en}
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
                />
              </div>
            </div>

            {/* Short Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('instructorForms.shortDescriptionEn')}</label>
                <textarea
                  value={courseForm.shortDescription.en}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value, 'en')}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  rows="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('instructorForms.shortDescriptionAr')}</label>
                <textarea
                  value={courseForm.shortDescription.ar}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value, 'ar')}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  dir="rtl"
                  rows="2"
                />
              </div>
            </div>

            {/* Thumbnail Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">{t('instructorForms.thumbnail')}</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                required
              />
              {courseForm.thumbnail && (
                <img
                  src={courseForm.thumbnail}
                  alt="Thumbnail preview"
                  className="mt-2 h-32 object-cover rounded"
                />
              )}
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

            {/* Free Course Toggle */}
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="isFree"
                checked={courseForm.isFree}
                onChange={(e) => handleInputChange('isFree', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="isFree" className="text-sm font-medium">
                {t('instructorForms.isFree')}
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-lg text-white ${loading ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
                }`}
            >
              {loading ? t('common.loading') : t('instructorForms.createCourse')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstructorForms; 