import React, { useState, useEffect } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { RiArrowDropDownLine } from 'react-icons/ri';
import { CiSearch } from 'react-icons/ci';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../i18n/config';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import './navbar.css';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const isRTL = i18n.language === 'ar';
  const isLoggedIn = !!localStorage.getItem('token');

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryCourses, setCategoryCourses] = useState([]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    changeLanguage(newLang);
  };

  useEffect(() => {
    axios
      .get('/api/category')
      .then((res) => setCategories(res.data.data || []))
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  const handleCategoryHover = (categoryId) => {
    setSelectedCategory(categoryId);

    axios
      .get(`/api/category/${categoryId}`)
      .then((res) => {
        setCategoryCourses(res.data.data?.courses || []);
      })
      .catch((err) => {
        console.error('Error fetching category courses:', err);
        setCategoryCourses([]);
      });
  };

  const handleDropdownEnter = () => setIsDropdownVisible(true);
  const handleDropdownLeave = () => setIsDropdownVisible(false);

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

        {/* Navigation */}
        <ul className={`flex items-center ml-1 ${isRTL ? 'space-x-reverse space-x-6' : 'space-x-6'} text-3xl font-medium`}>
          <li className="relative">
            <button
              onMouseEnter={handleDropdownEnter}
              className="hover:text-red-500 flex items-center focus:outline-none"
            >
              {t('navigation.courses')}
              <RiArrowDropDownLine className="text-5xl mt-3" />
            </button>

            {/* Dropdown */}
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
                        {category.name[i18n.language] || category.name.en}
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
                    <>
                      <ul>
                        {categoryCourses.slice(0, 4).map((course) => {
                          const lang = i18n.language;
                          const title =
                            typeof course.title === 'object'
                              ? course.title[lang] || course.title.en || 'Untitled Course'
                              : course.title || 'Untitled Course';

                          const image = course.thumbnail || '/default-course-img.png';

                          const instructor = course.instructor?.user;
                          const instructorName = instructor
                            ? `${instructor.firstName?.[lang] || instructor.firstName?.en || ''} ${instructor.lastName?.[lang] || instructor.lastName?.en || ''}`
                            : 'Unknown';

                          return (
                            <li key={course._id} className="flex items-center gap-4 mb-5">
                              <img
                                src={image}
                                alt={title}
                                className="w-20 h-14 object-cover rounded"
                              />
                              <div>
                                <h4 className="text-base font-semibold text-black text-red-600">
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
                    </>
                  )}
                </div>
              </div>
            )}
          </li>

          <li>
            <Link to="/instructors" className="hover:text-red-500">
              Instructors
            </Link>
          </li>

          <li className="flex items-center">
            <Link to="/programs" className="hover:text-red-500">
              {t('navigation.programs')}
            </Link>
            <span className="ml-2 bg-red-500 text-white text-[10px] px-1 py-0.5 rounded-full">
              NEW
            </span>
          </li>

          <li>
            <button
              className={`rounded px-6 text-2xl py-2 border-2 transition ${
                theme === 'dark'
                  ? 'bg-transparent text-white border-white hover:bg-white hover:text-black'
                  : 'bg-transparent text-black border-black hover:bg-black hover:text-white'
              }`}
            >
              Subscribe
            </button>
          </li>
        </ul>

        {/* Right Side: Search + Theme + Language + Auth */}
        <div className={`flex items-center ml-auto ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder={t('common.search')}
              className={`text-lg px-5 py-3 w-[360px] focus:outline-none focus:ring-2 placeholder-gray-500 transition-all duration-300 rounded-md
                ${theme === 'dark' ? 'bg-[#2a2a2a] text-white focus:ring-gray-600' : 'bg-gray-200 text-gray-700 focus:ring-gray-300'}`}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            <button className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'left-4' : 'right-4'} text-gray-400 hover:text-red-500`}>
              <CiSearch size={25} />
            </button>
          </div>

          {/* Theme + Language Switch */}
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

          {/* Auth Buttons */}
          {isLoggedIn ? (
            <button
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/loginPage';
              }}
              className="bg-red-600 text-white px-4 py-1.5 rounded hover:bg-red-700 text-sm"
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/loginPage" className={`text-sm ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}>
                {t('common.login')}
              </Link>
              <Link to="/signup" className="bg-red-500 text-white px-4 py-1.5 rounded hover:bg-red-600 text-sm">
                {t('common.signup')}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;