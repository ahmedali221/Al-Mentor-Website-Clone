import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import './courses.css';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaBookmark } from 'react-icons/fa';

const AllCourses = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const isRTL = i18n.language === 'ar';
  const currentLang = i18n.language;
  const location = useLocation();
  const navigate = useNavigate();

  const [instructors, setInstructors] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedCourses, setSavedCourses] = useState(() => {
    const saved = localStorage.getItem('savedCourses');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');

  useEffect(() => {
    localStorage.setItem('savedCourses', JSON.stringify(savedCourses));
  }, [savedCourses]);

  const toggleSaveCourse = (courseId) => {
    setSavedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  useEffect(() => {
    axios.get('/api/instructors')
      .then((res) => setInstructors(res.data.data))
      .catch((err) => console.error('Error fetching instructors:', err));
  }, []);

  useEffect(() => {
    // Get search query from URL
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    setSearchQuery(search || '');

    axios.get('/api/courses')
      .then((res) => {
        setAllCourses(res.data);
      })
      .catch((err) => console.error('Error fetching courses:', err));
  }, [location.search]);

  useEffect(() => {
    axios.get('/api/category')
      .then((res) => setCategories(res.data.data))
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  // Helper function to get localized text
  const getLocalizedText = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[currentLang] || obj.en || Object.values(obj)[0] || '';
  };

  // Extract unique levels and languages as strings
  const levels = ['All', ...Array.from(new Set(allCourses.map(c => getLocalizedText(c.level)).filter(Boolean)))];
  const languages = ['All', ...Array.from(new Set(allCourses.map(c => getLocalizedText(c.language)).filter(Boolean)))];

  // Filtered courses by category, search, level, and language
  const getFiltered = (list) => {
    let filtered = list;
    if (selectedCategory) {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(course => {
        const title = getLocalizedText(course.title);
        const description = getLocalizedText(course.description);
        return (
          title.toLowerCase().includes(searchLower) ||
          description.toLowerCase().includes(searchLower)
        );
      });
    }
    if (selectedLevel !== 'All') {
      filtered = filtered.filter(course => getLocalizedText(course.level) === selectedLevel);
    }
    if (selectedLanguage !== 'All') {
      filtered = filtered.filter(course => getLocalizedText(course.language) === selectedLanguage);
    }
    return filtered;
  };

  // Course card
  const CourseCard = ({ course }) => {
    if (!course) return null;
    const title = getLocalizedText(course?.title);
    const instructorProfile = course.instructorDetails?.profile || {};
    const instructorName = instructorProfile
      ? `${instructorProfile.firstName?.[currentLang] || instructorProfile.firstName?.en || ''} ${instructorProfile.lastName?.[currentLang] || instructorProfile.lastName?.en || ''}`
      : 'Unknown Instructor';
    const image = course.thumbnail || 'https://placehold.co/280x160';
    const isNew = course.isNew || false;
    return (
      <div
        className="course-card mx-1 relative mt-10 cursor-pointer"
        onClick={() => navigate(`/courses/${course._id}`)}
      >
        <div className="rounded overflow-hidden bg-[#1a1a1a] shadow-lg mt-10">
          <div className="relative">
            <img src={image} alt={title} className="w-full h-40 object-cover" />
            {isNew && (
              <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                New
              </span>
            )}
          </div>
          <div className="p-3 mt-10">
            <h3 className="text-base font-semibold text-white mb-1 h-12 overflow-hidden">{title}</h3>
            <p className="text-gray-400 text-sm">{instructorName}</p>
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center">
                <span className="text-yellow-500 mr-1">★★★★★</span>
              </div>
              <button
                className={`bg-transparent border-none p-0 ml-2`}
                onClick={e => {
                  e.stopPropagation();
                  toggleSaveCourse(course._id);
                }}
              >
                <FaBookmark className={savedCourses.includes(course._id) ? "text-red-600" : "text-white"} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-[#121212] text-white' : 'bg-white text-black'} min-h-screen`} dir={isRTL ? 'rtl' : 'ltr'}>
      <section className="py-12 px-6 mt-10">
        <h2 className="text-3xl font-bold mb-8 text-right">All Courses</h2>
        {/* Filters Row */}
        <div className="flex flex-wrap gap-4 mb-8 items-center">
          {/* Category Filter */}
          <div className="flex overflow-x-auto space-x-4 scrollbar-hide pb-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`whitespace-nowrap px-6 py-3 rounded-full font-semibold text-base transition border-2 focus:outline-none ${selectedCategory === null ? 'bg-white text-black border-white' : 'bg-black text-white border-gray-700 hover:bg-gray-800'}`}
            >
              {t('All')}
            </button>
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => handleCategoryClick(category._id)}
                className={`whitespace-nowrap px-6 py-3 rounded-full font-semibold text-base transition border-2 focus:outline-none ${selectedCategory === category._id ? 'bg-white text-black border-white' : 'bg-black text-white border-gray-700 hover:bg-gray-800'}`}
              >
                {getLocalizedText(category.name) || getLocalizedText(category.title) || ''}
              </button>
            ))}
          </div>
          {/* Level Filter */}
          <div>
            <select
              value={selectedLevel}
              onChange={e => setSelectedLevel(e.target.value)}
              className="bg-[#181f1f] text-white border border-gray-600 rounded px-4 py-2 focus:outline-none min-w-[150px]"
            >
              {levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          {/* Language Filter */}
          <div>
            <select
              value={selectedLanguage}
              onChange={e => setSelectedLanguage(e.target.value)}
              className="bg-[#181f1f] text-white border border-gray-600 rounded px-4 py-2 focus:outline-none min-w-[150px]"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          {/* Search Filter */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full max-w-md px-4 py-2 rounded border border-gray-600 bg-[#181f1f] text-white focus:outline-none"
            />
          </div>
        </div>
        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {getFiltered(allCourses).map((course, idx) => (
            <CourseCard key={idx} course={course} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default AllCourses; 