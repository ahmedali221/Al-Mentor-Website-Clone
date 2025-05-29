import React, { useState, useEffect, useRef } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { RiArrowDropDownLine, RiRobot2Line } from 'react-icons/ri';
import { CiSearch } from 'react-icons/ci';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FaUserCircle } from "react-icons/fa";
import './navbar.css';
import { ChatBubbleLeftRightIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchResults] = useState({ courses: [], instructors: [] });
  const searchDropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const isRTL = i18n.language === 'ar';
  const { theme, toggleTheme } = useTheme();
  const currentLang = i18n.language;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navigationItems = [
    {
      name: t('navigation.courses'),
      href: '/courses',
      icon: RiArrowDropDownLine,
      showWhen: 'authenticated',
    },
    {
      name: t('navigation.instructors'),
      href: '/instructors',
      icon: RiRobot2Line,
      showWhen: 'authenticated',
    },
    {
      name: t('navigation.programs'),
      href: '/programs',
      icon: RiRobot2Line,
      showWhen: 'authenticated',
    },
    {
      name: t('navigation.aiChat'),
      href: '/AIChatPage',
      icon: RiRobot2Line,
      showWhen: 'authenticated',
      badge: t('badges.new'),
    },
    {
      name: t('navigation.subscribe'),
      href: '/subscribe',
      icon: RiRobot2Line,
      showWhen: 'authenticated',
    },
    {
      name: t('navigation.mySessions'),
      href: '/my-sessions',
      icon: ChatBubbleLeftRightIcon,
      showWhen: 'authenticated',
      badge: t('badges.new'),
    },
    {
      name: t('navigation.instructorSessions'),
      href: '/instructor-sessions',
      icon: AcademicCapIcon,
      showWhen: 'instructor',
    },
  ];

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
        !searchInputRef.current.contains(event.target) &&
        searchDropdownRef.current
      ) {
        setShowSearchDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    if (showSearchDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearchDropdown, searchDropdownRef, searchInputRef]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 px-4 py-4 z-50 shadow transition-all duration-300 text-lg font-medium ${theme === 'dark' ? 'bg-[#1a1a1a] text-white' : 'bg-white text-black'
        }`}
    >
      <div className={`flex items-center justify-start gap-12 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Logo */}
        <div className="flex items-center text-3xl ml-4">
          <img src="/logo.jpeg" alt="Almentor Logo" className={`h-12 w-auto ${isRTL ? 'ml-2' : 'mr-2'}`} />
          <a href="/" className="text-3xl font-semibold">
            Almentor
          </a>
        </div>

        <ul className={`flex items-center ml-1 ${isRTL ? 'space-x-reverse space-x-6' : 'space-x-6'} text-1xl font-medium`}>
          {navigationItems.map((item) => (
            <li key={item.name} className={`relative ${item.showWhen === 'authenticated' ? '' : 'hidden'}`}>
              <Link to={item.href} className="hover:text-red-500 flex items-center relative">
                {item.name}
                {item.badge && (
                  <span className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full transform translate-x-1/2 -translate-y-1/2">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}

          <li>
            <Link
              to="/subscribe"
              className={`rounded px-6 text-2xl py-2 border-2 transition ${theme === 'dark'
                ? 'bg-transparent text-white border-white hover:bg-white hover:text-black'
                : 'bg-transparent text-black border-black hover:bg-black hover:text-white'
                }`}
            >
              {t('buttons.subscribe')}
            </Link>
          </li>
        </ul>

        <div className={`flex items-center ml-auto ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
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
                className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-[360px] max-h-96 overflow-y-auto rounded-md shadow-lg z-50 ${theme === 'dark' ? 'bg-[#232323] text-white' : 'bg-white text-black'}`}
                style={{ direction: isRTL ? 'rtl' : 'ltr' }}
              >
                {searchResults.courses.length === 0 && searchResults.instructors.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">{t('common.noResults') || 'No results found'}</div>
                ) : (
                  <>
                    {searchResults.courses.length > 0 && (
                      <div>
                        <div className="px-4 pt-3 pb-1 text-xs font-bold uppercase text-gray-500">{t('Courses')}</div>
                        {searchResults.courses.map(course => {
                          const lang = i18n.language;
                          const title = typeof course.title === 'object'
                            ? course.title[lang] || course.title.en || ''
                            : course.title || '';
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
                        <div className="px-4 pt-3 pb-1 text-xs font-bold uppercase text-gray-500">{t('Instructors')}</div>
                        {searchResults.instructors.map(inst => {
                          const lang = i18n.language;
                          let instructorName = 'Unknown Instructor';
                          let instructorImage = '/default-profile.png';

                          if (inst && inst.profile) {
                            instructorName = `${inst.profile.firstName?.[lang] || inst.profile.firstName?.en || ''} ${inst.profile.lastName?.[lang] || inst.profile.lastName?.en || ''}`.trim() || 'Unknown Instructor';
                            instructorImage = inst.profile.profilePicture || '/default-profile.png';
                          } else if (inst && typeof inst === 'object') {
                            const profile = inst.profile || inst.user || inst;
                            instructorName = `${profile.firstName?.[lang] || profile.firstName?.en || ''} ${profile.lastName?.[lang] || profile.lastName?.en || ''}`.trim() || 'Unknown Instructor';
                            instructorImage = profile.profilePicture || '/default-profile.png';
                          }

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

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
                ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              {theme === 'dark' ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-700" />}
            </button>

            <button
              onClick={toggleLanguage}
              className={`w-10 h-10 rounded-full text-xl font-medium flex items-center justify-center transition-colors
                ${theme === 'dark' ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {i18n.language === 'en' ? 'ع' : 'EN'}
            </button>
          </div>

          {isAuthenticated ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity p-2"
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
                <div className={`absolute top-full right-0 mt-2 w-72 rounded-lg shadow-xl z-50 overflow-hidden ${theme === 'dark' ? 'bg-[#1a1a1a] border border-gray-700' : 'bg-white border border-gray-200'}`}>
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
                        }`}
                    >
                      <svg className={`w-5 h-5 mr-3 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {t('profile.myProgress')}
                    </Link>

                    <Link
                      to="/saved-courses"
                      className={`flex items-center px-4 py-2 transition-colors ${theme === 'dark' ? 'hover:bg-[#232323] text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                    >
                      <svg className={`w-5 h-5 mr-3 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5h14v14H5z" />
                      </svg>
                      {t('profile.savedCourses')}
                    </Link>

                    <Link
                      to="/certificates"
                      className={`flex items-center px-4 py-2 transition-colors ${theme === 'dark' ? 'hover:bg-[#232323] text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                    >
                      <svg className={`w-5 h-5 mr-3 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m-4-4h8" />
                      </svg>
                      {t('profile.certificates')}
                    </Link>

                    <Link
                      to="/profile"
                      className={`flex items-center px-4 py-2 transition-colors ${theme === 'dark' ? 'hover:bg-[#232323] text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                    >
                      <svg className={`w-5 h-5 mr-3 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      {t('profile.accountSettings')}
                    </Link>

                    <Link
                      to="/become-instructor"
                      className={`flex items-center px-4 py-2 transition-colors ${theme === 'dark' ? 'hover:bg-[#232323] text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                    >
                      <svg className={`w-5 h-5 mr-3 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {t('profile.becomeInstructor')}
                    </Link>

                    <button
                      onClick={handleLogout}
                      className={`w-full flex items-center px-4 py-2 transition-colors ${theme === 'dark' ? 'text-red-400 hover:bg-[#232323] hover:text-red-300' : 'text-red-500 hover:bg-red-50'
                        }`}
                    >
                      <svg className={`w-5 h-5 mr-3 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      {t('logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/loginPage"
                className={`text-sm transition-colors ${theme === 'dark'
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-black'
                  }text-lg`}
              >
                {t('common.login')}
              </Link>
              <Link
                to="/subscribe"
                className={`bg-red-500 text-white px-5 py-2 rounded transition-colors ${theme === 'dark'
                  ? 'hover:bg-red-600'
                  : 'hover:bg-red-600'
                  } text-sm text-center`}
              >{t('common.signup')}
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${isMenuOpen ? 'block' : 'hidden'
          } md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-800 shadow-lg z-50`}
      >
        {/* ... existing mobile menu content ... */}
      </div>
    </nav>
  );
};

export default Navbar;