import React, { useState, useEffect, useRef } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { RiArrowDropDownLine, RiRobot2Line, RiArrowDropLeftLine, RiArrowDropRightLine } from 'react-icons/ri';
import { CiSearch } from 'react-icons/ci';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FaUserCircle } from "react-icons/fa";
import './navbar.css';
import { ChatBubbleLeftRightIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState({ courses: [], instructors: [], programs: [] });
  const [allData, setAllData] = useState({ courses: [], instructors: [], programs: [] });
  const [categories, setCategories] = useState([]);
  const [showCoursesDropdown, setShowCoursesDropdown] = useState(false);
  const coursesDropdownRef = useRef(null);
  const searchDropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const isRTL = i18n.language === 'ar';
  const { theme, toggleTheme } = useTheme();
  const currentLang = i18n.language;
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isDropdownHovered, setIsDropdownHovered] = useState(false);
  const panelWidth = 440;
  const coursesPanelWidth = 700;
  const panelHeight = 750;
  const [isInstructor, setIsInstructor] = useState(false);

  // Fetch all data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [coursesRes, instructorsRes, programsRes, categoriesRes] = await Promise.all([
          axios.get('https://al-mentor-database-production.up.railway.app/courses'),
          axios.get('https://al-mentor-database-production.up.railway.app/instructors'),
          axios.get('https://al-mentor-database-production.up.railway.app/programs'),
          axios.get('https://al-mentor-database-production.up.railway.app/category')
        ]);

        setAllData({
          courses: coursesRes.data.data || coursesRes.data,
          instructors: instructorsRes.data.data || instructorsRes.data,
          programs: programsRes.data.data || programsRes.data
        });
        setCategories(categoriesRes.data.data || categoriesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchAllData();
  }, []);

  const getLocalizedText = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[currentLang] || obj.en || '';
  };

  const handleSearch = (query) => {
    if (!query.trim()) {
      setSearchResults({ courses: [], instructors: [], programs: [] });
      setShowSearchDropdown(false);
      return;
    }

    const searchLower = query.toLowerCase();

    // Search in courses
    const matchedCourses = allData.courses.filter(course => {
      const title = getLocalizedText(course.title);
      const description = getLocalizedText(course.description);
      return title.toLowerCase().includes(searchLower) ||
        description.toLowerCase().includes(searchLower);
    });

    // Search in instructors
    const matchedInstructors = allData.instructors.filter(instructor => {
      const profile = instructor.profile || instructor.user || instructor;
      const firstName = getLocalizedText(profile.firstName);
      const lastName = getLocalizedText(profile.lastName);
      const title = getLocalizedText(instructor.professionalTitle);
      return `${firstName} ${lastName}`.toLowerCase().includes(searchLower) ||
        title.toLowerCase().includes(searchLower);
    });

    // Search in programs
    const matchedPrograms = allData.programs.filter(program => {
      const title = getLocalizedText(program.title);
      const description = getLocalizedText(program.description);
      return title.toLowerCase().includes(searchLower) ||
        description.toLowerCase().includes(searchLower);
    });

    setSearchResults({
      courses: matchedCourses.slice(0, 5),
      instructors: matchedInstructors.slice(0, 5),
      programs: matchedPrograms.slice(0, 5)
    });
    setShowSearchDropdown(true);
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/loginPage');
  };

  const getLocalizedName = (nameObj) => {
    if (!nameObj) return '';
    if (typeof nameObj === 'string') return nameObj;
    return nameObj[currentLang] || nameObj.en || '';
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSearchDropdown(false);
      }
      if (
        coursesDropdownRef.current &&
        !coursesDropdownRef.current.contains(event.target)
      ) {
        setShowCoursesDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const checkInstructorStatus = async () => {
      if (!user) return;

      try {
        const response = await fetch(`https://al-mentor-database-production.up.railway.app/instructors?page=1&limit=100`);
        const data = await response.json();

        if (data.success) {
          const instructorStatus = data.data.some(instructor => instructor.user === user._id);
          setIsInstructor(instructorStatus);
        }
      } catch (error) {
        console.error("Error checking instructor status:", error);
      }
    };

    checkInstructorStatus();
  }, [user]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 px-4 py-4 z-50 shadow transition-all duration-300 text-lg font-medium ${theme === 'dark' ? 'bg-[#1a1a1a] text-white' : 'bg-white text-black'}`}
    >
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Logo */}
        <div className="flex items-center text-3xl">
          <img src="/logo.jpeg" alt="Almentor Logo" className={`h-12 w-auto ${isRTL ? 'ml-2' : 'mr-2'}`} />
          <a href="/" className="text-3xl font-semibold">
            Almentor
          </a>
        </div>

        {/* Navigation Items */}
        <ul className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse space-x-6' : 'flex-row space-x-6'} text-1xl font-medium`}>
          {/* Courses Dropdown */}
          <li>
            <div
              ref={coursesDropdownRef}
              className="relative"
              onMouseEnter={() => { setShowCoursesDropdown(true); setIsDropdownHovered(true); }}
              onMouseLeave={() => { setIsDropdownHovered(false); setTimeout(() => { if (!isDropdownHovered) { setShowCoursesDropdown(false); setHoveredCategory(null); } }, 100); }}
            >
              <Link to="/courses" className="hover:text-red-500 flex items-center relative">
                {t('navigation.courses')}
                <RiArrowDropDownLine className="ml-1" />
              </Link>
              {showCoursesDropdown && (
                <div
                  className={`absolute ${isRTL ? 'right-0' : 'left-0'} mt-2 z-50 flex rounded-2xl shadow-2xl`
                    + ` ${theme === 'dark' ? 'bg-[#232323] text-white' : 'bg-white text-black'}`}
                  style={{ minWidth: `${panelWidth + coursesPanelWidth}px`, height: `${panelHeight}px`, width: `${panelWidth + coursesPanelWidth}px` }}
                  onMouseEnter={() => setIsDropdownHovered(true)}
                  onMouseLeave={() => { setIsDropdownHovered(false); setHoveredCategory(null); setShowCoursesDropdown(false); }}
                >
                  {/* Categories Panel */}
                  <div className={`flex flex-col justify-between ${theme === 'dark' ? 'bg-[#232323]' : 'bg-white'}`}
                    style={{ width: `${panelWidth}px`, height: `${panelHeight}px`, borderTopRightRadius: '20px', borderBottomRightRadius: '20px' }}>
                    <div>
                      <div className={`px-10 pt-8 pb-6 text-2xl font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('navigation.categories')}</div>
                      <div className="flex flex-col overflow-y-auto" style={{ maxHeight: `${panelHeight - 140}px` }}>
                        {categories.map((category) => (
                          <div
                            key={category._id}
                            className={`flex items-center justify-between px-10 py-5 text-xl cursor-pointer transition-colors ${theme === 'dark' ? 'hover:bg-[#18191a]' : 'hover:bg-gray-100'}`}
                            onMouseEnter={() => setHoveredCategory(category._id)}
                            style={{ color: theme === 'dark' ? '#fff' : '#222', background: theme === 'dark' ? 'inherit' : 'inherit' }}
                          >
                            <span>{getLocalizedText(category.name)}</span>
                            {isRTL ? (
                              <RiArrowDropLeftLine size={32} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                            ) : (
                              <RiArrowDropRightLine size={32} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="px-10 pb-8">
                      <Link
                        to="/courses"
                        className={`block w-full text-center py-4 rounded-lg text-xl font-semibold transition-colors ${theme === 'dark' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                        onClick={() => { setShowCoursesDropdown(false); setHoveredCategory(null); }}
                      >
                        {t('navigation.viewAllCourses')}
                      </Link>
                    </div>
                  </div>
                  {/* Courses Panel */}
                  <div className={`flex flex-col justify-between ${theme === 'dark' ? 'bg-[#18191a]' : 'bg-gray-50'}`}
                    style={{ width: `${coursesPanelWidth}px`, height: `${panelHeight}px`, borderTopLeftRadius: '20px', borderBottomLeftRadius: '20px' }}>
                    <div>
                      <div className={`px-10 pt-8 pb-6 text-2xl font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{hoveredCategory ? getLocalizedText(categories.find(c => c._id === hoveredCategory)?.name) : t('navigation.courses')}</div>
                      <div className="flex flex-col gap-3 max-h-[570px] overflow-y-auto px-6">
                        {(hoveredCategory && allData.courses.filter(course => course.category === hoveredCategory).length === 0) ? (
                          <div className="px-4 py-12 text-gray-400 text-center text-lg">{t('messages.noCoursesForTopic') || 'No courses available for this category'}</div>
                        ) : (
                          allData.courses.filter(course => course.category === hoveredCategory).slice(0, 8).map(course => {
                            const instructor = course.instructorDetails?.profile || course.instructorDetails || {};
                            const instructorName = `${getLocalizedText(instructor.firstName)} ${getLocalizedText(instructor.lastName)}`.trim();
                            return (
                              <Link
                                key={course._id}
                                to={`/courses/${course._id}`}
                                className={`flex items-center gap-5 px-2 py-4 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-[#232323]' : 'hover:bg-gray-100'} ${isRTL ? 'flex-row-reverse' : ''}`}
                                onClick={() => { setShowCoursesDropdown(false); setHoveredCategory(null); }}
                                style={{ color: theme === 'dark' ? '#fff' : '#222', background: theme === 'dark' ? 'inherit' : 'inherit' }}
                              >
                                <div className="flex-shrink-0 w-64 h-36 bg-white rounded-xl flex items-center justify-center overflow-hidden">
                                  <img src={course.thumbnail || '/default-course-img.png'} alt={getLocalizedText(course.title)} className="w-full h-full object-cover rounded-xl" />
                                </div>
                                <div className={`flex flex-col flex-1 ${isRTL ? 'items-end' : ''}`}>
                                  <span className="font-semibold text-lg line-clamp-1">{getLocalizedText(course.title)}</span>
                                  <span className="text-sm text-gray-400 mt-1 line-clamp-1">{instructorName}</span>
                                </div>
                              </Link>
                            );
                          })
                        )}
                      </div>
                    </div>
                    <div className="px-10 pb-8 text-center">
                      <Link
                        to={hoveredCategory ? `/categories/${hoveredCategory}` : '/courses'}
                        className={`text-blue-400 hover:underline text-lg font-medium`}
                        onClick={() => { setShowCoursesDropdown(false); setHoveredCategory(null); }}
                      >
                        {t('navigation.showAll') || 'اعرض الكل'}
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </li>
          {/* Instructors */}
          <li><Link to="/instructors" className="hover:text-red-500">{t('navigation.instructors')}</Link></li>
          {/* Programs with badge */}
          <li className="relative">
            <Link to="/programs" className="hover:text-red-500 flex items-center">
              {t('navigation.programs')}
              <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">{t('badges.new')}</span>
            </Link>
          </li>
          {/* Sessions with badge */}
          <li className="relative">
            <Link to="/my-sessions" className="hover:text-red-500 flex items-center">
              {t('navigation.mySessions')}
              <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">{t('badges.new')}</span>
            </Link>
          </li>
          {/* AI Chat with badge */}
          <li className="relative">
            <Link to="/AIChatPage" className="hover:text-red-500 flex items-center">
              {t('navigation.aiChat')}
              <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">{t('badges.new')}</span>
            </Link>
          </li>
          {/* Subscribe outlined button */}
          <li>
            <Link to="/subscribe" className={`rounded px-6 text-2xl py-2 border-2 transition ${theme === 'dark' ? 'bg-transparent text-white border-white hover:bg-white hover:text-black' : 'bg-transparent text-black border-black hover:bg-black hover:text-white'}`}>{t('navigation.subscribe')}</Link>
          </li>
        </ul>

        {/* Search Bar */}
        <div className="mx-6 flex-1 max-w-xl">
          <div className="relative">
            <input
              type="text"
              placeholder={t('common.search')}
              className={`text-lg px-5 py-3 w-[360px] focus:outline-none focus:ring-2 placeholder-gray-500 transition-all duration-300 rounded-md
                ${theme === 'dark' ? 'bg-[#2a2a2a] text-white focus:ring-gray-600' : 'bg-gray-200 text-gray-700 focus:ring-gray-300'}`}
              dir={isRTL ? 'rtl' : 'ltr'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowSearchDropdown(true)}
              ref={searchInputRef}
            />
            <button className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'left-4' : 'right-4'} text-gray-400 hover:text-red-500`}>
              <CiSearch size={25} />
            </button>
            {showSearchDropdown && (
              <div
                ref={searchDropdownRef}
                className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-[520px] max-h-[520px] overflow-y-auto rounded-md shadow-lg z-50 ${theme === 'dark' ? 'bg-[#232323] text-white' : 'bg-white text-black'}`}
                style={{ direction: isRTL ? 'rtl' : 'ltr' }}
              >
                {searchResults.courses.length === 0 && searchResults.instructors.length === 0 && searchResults.programs.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">{t('common.noResults') || 'No results found'}</div>
                ) : (
                  <>
                    {searchResults.programs.length > 0 && (
                      <div>
                        <div className="px-4 pt-3 pb-1 text-xs font-bold uppercase text-gray-500">{t('navigation.programs')}</div>
                        {searchResults.programs.map(program => {
                          const title = getLocalizedText(program.title);
                          return (
                            <div
                              key={program._id}
                              className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333] rounded"
                              onClick={() => {
                                setShowSearchDropdown(false);
                                setSearchQuery('');
                                navigate(`/programs/${program._id}`);
                              }}
                            >
                              <img src={program.thumbnail || '/default-program-img.png'} alt={title} className="w-10 h-8 object-cover rounded" />
                              <span className="font-medium">{title}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {searchResults.courses.length > 0 && (
                      <div>
                        <div className="px-4 pt-3 pb-1 text-xs font-bold uppercase text-gray-500">{t('navigation.courses')}</div>
                        {searchResults.courses.map(course => {
                          const title = getLocalizedText(course.title);
                          return (
                            <div
                              key={course._id}
                              className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333] rounded"
                              onClick={() => {
                                setShowSearchDropdown(false);
                                setSearchQuery('');
                                navigate(`/courses/${course._id}`);
                              }}
                            >
                              <img src={course.thumbnail || '/default-course-img.png'} alt={title} className="w-10 h-8 object-cover rounded" />
                              <span className="font-medium">{title}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {searchResults.instructors.length > 0 && (
                      <div>
                        <div className="px-4 pt-3 pb-1 text-xs font-bold uppercase text-gray-500">{t('navigation.instructors')}</div>
                        {searchResults.instructors.map(inst => {
                          const profile = inst.profile || inst.user || inst;
                          const instructorName = `${getLocalizedText(profile.firstName)} ${getLocalizedText(profile.lastName)}`.trim() || 'Unknown Instructor';
                          const instructorImage = profile.profilePicture || '/default-profile.png';

                          return (
                            <div
                              key={inst._id}
                              className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333] rounded"
                              onClick={() => {
                                setShowSearchDropdown(false);
                                setSearchQuery('');
                                navigate(`/instructors/${inst._id}`);
                              }}
                            >
                              <img src={instructorImage} alt={instructorName} className="w-10 h-10 object-cover rounded-full" />
                              <span className="font-medium">{instructorName}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions: Language, Theme, Auth */}
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse space-x-4' : 'flex-row space-x-4'}`}>
          {/* Language Toggle */}
          <button onClick={toggleLanguage} className={`w-10 h-10 rounded-full text-xl font-medium flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{i18n.language === 'en' ? 'ع' : 'EN'}</button>
          {/* Theme Toggle */}
          <button onClick={toggleTheme} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}>{theme === 'dark' ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-700" />}</button>
          {/* Auth Buttons */}
          {!isAuthenticated ? (
            <>
              <Link to="/loginPage" className={`text-sm transition-colors ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}>{t('common.login')}</Link>
              <Link to="/subscribe" className={`bg-red-500 text-white px-5 py-2 rounded transition-colors hover:bg-red-600 text-sm text-center`}>{t('common.signup')}</Link>
            </>
          ) : (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center hover:opacity-80 transition-opacity p-2"
              >
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={getLocalizedName(user.firstName)}
                    className={`h-10 w-10 rounded-full object-cover border-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}
                  />
                ) : (
                  <FaUserCircle className={`text-4xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                )}
              </button>

              {isProfileOpen && (
                <div className={`absolute top-full ${isRTL ? 'left-0' : 'right-0'} mt-2 w-72 rounded-lg shadow-xl z-50 overflow-hidden ${theme === 'dark' ? 'bg-[#1a1a1a] border border-gray-700' : 'bg-white border border-gray-200'}`}>
                  <div className={`p-4 border-b ${theme === 'dark' ? 'bg-[#232323] border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {user?.firstName ? getLocalizedName(user.firstName) : ''} {user?.lastName ? getLocalizedName(user.lastName) : ''}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                      {user?.email || ''}
                    </p>
                    <Link
                      to="/subscribe"
                      className="mt-3 block w-full text-center bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors"
                    >
                      {t('profile.subscribe')}
                    </Link>
                  </div>

                  <div className="py-2">
                    <Link
                      to="/my-progress"
                      className={`flex items-center px-4 py-2 transition-colors ${theme === 'dark' ? 'hover:bg-[#232323] text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                        } ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <svg className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'} ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {t('profile.myProgress')}
                    </Link>

                    <Link
                      to="/saved-courses"
                      className={`flex items-center px-4 py-2 transition-colors ${theme === 'dark' ? 'hover:bg-[#232323] text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                        } ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <svg className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'} ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5h14v14H5z" />
                      </svg>
                      {t('profile.savedCourses')}
                    </Link>

                    <Link
                      to="/certificates"
                      className={`flex items-center px-4 py-2 transition-colors ${theme === 'dark' ? 'hover:bg-[#232323] text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                        } ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <svg className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'} ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m-4-4h8" />
                      </svg>
                      {t('profile.certificates')}
                    </Link>

                    <Link
                      to="/profile"
                      className={`flex items-center px-4 py-2 transition-colors ${theme === 'dark' ? 'hover:bg-[#232323] text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                        } ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <svg className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'} ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      {t('profile.accountSettings')}
                    </Link>

                    {!user?.isAdmin && (
                      isInstructor ? (
                        <Link
                          to="/instructor-dashboard"
                          className={`flex items-center px-4 py-2 text-sm ${theme === 'dark'
                              ? 'text-gray-300 hover:bg-gray-700'
                              : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          <svg
                            className={`mr-3 h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                              }`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18h8a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17h-6v-3.777a8.935 8.935 0 00-2 .712V17a1 1 0 001 1z" />
                          </svg>
                          {t('navbar.instructorDashboard')}
                        </Link>
                      ) : (
                        <Link
                          to="/instructor-application"
                          className={`flex items-center px-4 py-2 text-sm ${theme === 'dark'
                              ? 'text-gray-300 hover:bg-gray-700'
                              : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          <svg
                            className={`mr-3 h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                              }`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          {t('navbar.becomeInstructor')}
                        </Link>
                      )
                    )}

                    <button
                      onClick={handleLogout}
                      className={`w-full flex items-center px-4 py-2 transition-colors ${theme === 'dark' ? 'text-red-400 hover:bg-[#232323] hover:text-red-300' : 'text-red-500 hover:bg-red-50'
                        } ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <svg className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'} ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      {t('logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;