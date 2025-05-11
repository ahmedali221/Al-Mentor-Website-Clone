import React from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { RiArrowDropDownLine } from 'react-icons/ri';
import { CiSearch } from 'react-icons/ci';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../i18n/config'; 
import { useTheme } from '../../context/ThemeContext';
import './navbar.css'; 


const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const isRTL = i18n.language === 'ar';
  const isLoggedIn = !!localStorage.getItem('token');


  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    changeLanguage(newLang);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 px-4 py-4 z-50 shadow transition-all duration-300 text-lg font-medium ${theme === 'dark' ? 'bg-[#1a1a1a] text-white' : 'bg-white text-black'}`}>
      <div className={`flex items-center justify-start gap-12 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Logo */}
        <div className="flex items-center text-xl ml-4">
          <img src="/logo.jpeg" alt="Almentor Logo" className={`h-8 w-auto ${isRTL ? 'ml-2' : 'mr-2'}`} />
          <a href="/" className="text-xl font-semibold">
            Almentor
          </a>
        </div>

        {/* Navigation Links */}
        <ul className={`flex items-center ml-4 ${isRTL ? 'space-x-reverse space-x-6' : 'space-x-6'} text-base font-medium`}>
          <li className="cursor-pointer hover:text-red-500 flex items-center">
            {t('navigation.courses')} <RiArrowDropDownLine className="text-2xl mt-1" />
          </li>
          <li>
            <Link to="/instructors" className="hover:text-red-500">{t('navigation.instructors')}</Link>
          </li>
          <li className="flex items-center">
            <Link to="/programs" className="hover:text-red-500">{t('navigation.programs')}</Link>
            <span className="ml-2 bg-red-500 text-white text-[10px] px-1 py-0.5 rounded-full">
              NEW
            </span>
          </li>
          <li>
            <button className="bg-transparent text-black border-2 border-black rounded px-6 py-2 hover:bg-white hover:text-black transition">
              Subscribe
            </button>
          </li>
        </ul>

        {/* Right Section */}
        <div className={`flex items-center ml-auto ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
          {/* Search Bar */}
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


          {/* Theme and Language Switch */}
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
         {/* Auth Buttons */}
{isLoggedIn ? (
  <button
    onClick={() => {
      localStorage.removeItem('token');
      window.location.href = '/';
    }}
    className="bg-red-600 text-white px-4 py-1.5 rounded hover:bg-red-700 text-sm"
  >
    Logout
  </button>
) : (
  <>
    <Link to="/login" className={`text-sm ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}>
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
