import React, { useState, useEffect, useRef } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { RiArrowDropDownLine, RiRobot2Line } from 'react-icons/ri';
import { CiSearch } from 'react-icons/ci';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../i18n/config';
import { useTheme } from '../../context/ThemeContext';
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from '../../context/AuthContext';
import './navbar.css';

const Navbar = () => {
    // Use fallback to avoid destructuring undefined
    const auth = useAuth() || {};
    // Provide default values when destructuring
    const { user = null, setUser = () => {} } = auth;
    const { t, i18n } = useTranslation();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const isRTL = i18n.language === 'ar';
    const isLoggedIn = !!user;
    const currentLang = i18n.language;

    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [isUserDropdownVisible, setIsUserDropdownVisible] = useState(false);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryCourses, setCategoryCourses] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({ courses: [], instructors: [] });
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const searchInputRef = useRef(null);
    const searchDropdownRef = useRef(null);
    const userDropdownRef = useRef(null);

    const handleUserDropdownEnter = () => setIsUserDropdownVisible(true);
    const handleUserDropdownLeave = (e) => {
        if (userDropdownRef.current && userDropdownRef.current.contains(e.relatedTarget)) {
            return;
        }
        setIsUserDropdownVisible(false);
    };

    const handleDropdownEnter = () => setIsDropdownVisible(true);
    const handleDropdownLeave = () => setIsDropdownVisible(false);

    const handleDropdownMenuEnter = () => setIsUserDropdownVisible(true);
    const handleDropdownMenuLeave = () => setIsUserDropdownVisible(false);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ar' : 'en';
        changeLanguage(newLang);
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/loginPage');
        handleUserDropdownLeave();
    };

    const getLocalizedName = (nameObj) => {
        if (!nameObj) return '';
        if (typeof nameObj === 'string') return nameObj;
        return nameObj[currentLang] || nameObj.en || '';
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/category');
                if (!res.ok) throw new Error('Failed to fetch categories');
                const data = await res.json();
                setCategories(data.data || []);
            } catch (err) {
                console.error('Error fetching categories:', err);
                setCategories([]);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/courses');
                if (!res.ok) throw new Error('Failed to fetch courses');
                const data = await res.json();
                setAllCourses(data.data || data);
            } catch (err) {
                setAllCourses([]);
            }
        };
        fetchCourses();
    }, []);

    useEffect(() => {
        const fetchInstructors = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/instructors');
                if (!res.ok) throw new Error('Failed to fetch instructors');
                const data = await res.json();
                console.log('=== INSTRUCTOR DATA DEBUG ===');
                console.log('Full API Response:', data);
                if (data.data && data.data.length > 0) {
                    console.log('First Instructor Example:', data.data[0]);
                    console.log('First Instructor Profile:', data.data[0].profile);
                    console.log('First Instructor Name Structure:', {
                        firstName: data.data[0].profile?.firstName,
                        lastName: data.data[0].profile?.lastName
                    });
                }
                console.log('========================');
                setInstructors(data.data || []);
            } catch (err) {
                console.error('Error fetching instructors:', err);
                setInstructors([]);
            }
        };
        fetchInstructors();
    }, []);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (token && savedUser && !user) {
            try {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error('Error parsing saved user:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
    }, [user, setUser]);

    const handleCategoryHover = (categoryId) => {
        setSelectedCategory(categoryId);
        const filteredCourses = allCourses.filter(course =>
            course.category === categoryId ||
            course.category?._id === categoryId ||
            course.category?.toString() === categoryId
        );
        setCategoryCourses(filteredCourses);
    };

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults({ courses: [], instructors: [] });
            setShowSearchDropdown(false);
            return;
        }
        const q = searchQuery.trim().toLowerCase();
        const matchedCourses = allCourses.filter(course => {
            const lang = i18n.language;
            const title = typeof course.title === 'object'
                ? course.title[lang] || course.title.en || ''
                : course.title || '';
            return title.toLowerCase().includes(q);
        });
        const matchedInstructors = instructors.filter(inst => {
            const lang = i18n.language;
            let instructorName = 'Unknown Instructor';

            if (inst && inst.profile) {
                instructorName = `${inst.profile.firstName?.[lang] || inst.profile.firstName?.en || ''} ${inst.profile.lastName?.[lang] || inst.profile.lastName?.en || ''}`.trim() || 'Unknown Instructor';
            } else if (inst && typeof inst === 'object') {
                // Fallback to direct instructor data
                const profile = inst.profile || inst.user || inst;
                instructorName = `${profile.firstName?.[lang] || profile.firstName?.en || ''} ${profile.lastName?.[lang] || profile.lastName?.en || ''}`.trim() || 'Unknown Instructor';
            }

            return instructorName.toLowerCase().includes(q);
        });
        console.log('Matched instructors:', matchedInstructors);
        setSearchResults({ courses: matchedCourses, instructors: matchedInstructors });
        setShowSearchDropdown(true);
    }, [searchQuery, allCourses, instructors, i18n.language]);

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
      className={`fixed top-0 left-0 right-0 px-4 py-4 z-50 shadow transition-all duration-300 text-lg font-medium ${
        theme === 'dark' ? 'bg-[#1a1a1a] text-white' : 'bg-white text-black'
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
                    <li className="relative">
                        <button
                            onMouseEnter={handleDropdownEnter}
                            className="hover:text-red-500 flex items-center focus:outline-none"
                        >
                            {t('navigation.courses')}
                            <RiArrowDropDownLine className="text-3xl mt-1" />
                        </button>

                        {isDropdownVisible && (
                            <div
                                className="absolute top-[80px] left-0 flex w-[800px] bg-white shadow-xl rounded-lg z-50 transition-all duration-300"
                                onMouseEnter={handleDropdownEnter}
                                onMouseLeave={handleDropdownLeave}
                            >
                                <div className="absolute -top-2 left-6 w-4 h-4 bg-white rotate-45 shadow-md z-40"></div>

                                <div className="w-1/2 border-r px-4 py-5">
                                    <ul>
                                        {categories.map((category) => (
                                            <li
                                                key={category._id}
                                                onMouseEnter={() => handleCategoryHover(category._id)}
                                                className="py-2 px-2 hover:bg-gray-100 cursor-pointer text-gray-800 text-sm font-medium rounded-md transition"
                                            >
                                                {getLocalizedName(category.name)}
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-6">
                                        <Link
                                            to="/courses"
                                            className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-md text-sm hover:bg-red-600 transition"
                                        >
                                            Browse Courses <span className="text-lg">→</span>
                                        </Link>
                                    </div>
                                </div>

                <div className="w-1/2 p-5">
                  {categoryCourses.length === 0 ? (
                    <p className="text-gray-500">{t('common.noCourses')}</p>
                  ) : (
                    <ul>
                      {categoryCourses.slice(0, 4).map((course) => {
                        const lang = i18n.language;
                        const title =
                          typeof course.title === 'object'
                            ? course.title[lang] || course.title.en || 'Untitled Course'
                            : course.title || 'Untitled Course';

                        // Find instructor from the instructors array
                        const instructorObj = instructors.find(inst => inst._id === course.instructor);
                        let instructorName = 'Unknown Instructor';

                        if (instructorObj) {
                          const profile = instructorObj.profile || instructorObj.user || instructorObj;
                          instructorName = `${profile.firstName?.[lang] || profile.firstName?.en || ''} ${profile.lastName?.[lang] || profile.lastName?.en || ''}`.trim() || 'Unknown Instructor';
                        }

                        return (
                          <li 
                            key={course._id} 
                            className="flex items-center gap-4 mb-5 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
                            onClick={() => {
                              navigate(`/courses/${course._id}`);
                              setIsDropdownVisible(false);
                            }}
                          >
                            <img
                              src={course.thumbnail || '/default-course-img.png'}
                              alt={title}
                              className="w-20 h-14 object-cover rounded"
                            />
                            <div>
                              <h4 className="text-base font-semibold text-black hover:text-red-600 transition-colors">
                                {title}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {instructorName}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </li>

                    <li>
                        <Link to="/instructors" className="hover:text-red-500">
                            {t('navigation.instructors')}
                        </Link>
                    </li>

                    <li className="flex items-center">
                        <Link to="/programs" className="hover:text-red-500">
                            {t('navigation.programs')}
                        </Link>
                        <span className="ml-2 bg-red-500 text-white text-[10px] px-1 py-0.5 rounded-full">
                            {t('home.new')}
                        </span>
                    </li>

                    <li className="flex items-center">
                        <Link to="/AIChatPage" className="hover:text-red-500 flex items-center">
                            <RiRobot2Line className="mr-1" />
                            {t('buttons.aiChat')}
                        </Link>
                    </li>

          <li>
            <button
              className={`rounded px-6 text-2xl py-2 border-2 transition ${
                theme === 'dark'
                  ? 'bg-transparent text-white border-white hover:bg-white hover:text-black'
                  : 'bg-transparent text-black border-black hover:bg-black hover:text-white'
              }`}
            >
              {t('buttons.subscribe')}
            </button>
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

                    {isLoggedIn ? (
                        <div
                            className="relative"
                            onMouseEnter={handleUserDropdownEnter}
                            onMouseLeave={handleUserDropdownLeave}
                        >
                            <button className="flex items-center space-x-2 hover:opacity-80 transition-opacity p-2">
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

                            {isUserDropdownVisible && (
                                <div
                                    ref={userDropdownRef}
                                    onMouseEnter={handleDropdownMenuEnter}
                                    onMouseLeave={handleDropdownMenuLeave}
                                    className={`absolute top-full right-0 mt-2 w-72 rounded-lg shadow-xl z-50 overflow-hidden ${theme === 'dark' ? 'bg-[#1a1a1a] border border-gray-700' : 'bg-white border border-gray-200'
                                        }`}
                                >
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
                                            onClick={handleUserDropdownLeave}
                                        >
                                            {t('profile.subscribe')}
                                        </Link>
                                    </div>

                                    <div className="py-2">
                                        <Link
                                            to="/my-progress"
                                            className={`flex items-center px-4 py-2 transition-colors ${theme === 'dark' ? 'hover:bg-[#232323] text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                                                }`}
                                            onClick={handleUserDropdownLeave}
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
                                            onClick={handleUserDropdownLeave}
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
                                            onClick={handleUserDropdownLeave}
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
                                            onClick={handleUserDropdownLeave}
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
                                            onClick={handleUserDropdownLeave}
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
        </nav>
    );
};

export default Navbar;