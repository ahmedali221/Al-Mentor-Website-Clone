import React from 'react';
import { FaMoon, FaSun } from 'react-icons/fa'; // Import the icons
import { Link } from 'react-router-dom';
import { RiArrowDropDownLine } from "react-icons/ri";
import { CiSearch } from "react-icons/ci";
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../i18n/config';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { theme, toggleTheme } = useTheme();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    changeLanguage(newLang);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-[#1a1a1a] text-white px-6 py-4 z-50 shadow">
      <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-around`}>
        {/* Logo */}
        <div className="flex items-center">
          <img src="/logo.jpeg" alt="Almentor Logo" className={`h-8 w-auto ${isRTL ? 'ml-2' : 'mr-2'}`} />
          <a href="/" className="text-xl font-semibold text-white">
            Almentor
          </a>
        </div>

        {/* Navigation Links */}
        <ul className={`flex items-center ${isRTL ? 'space-x-reverse space-x-6' : 'space-x-6'} text-sm`}>
          <li className="cursor-pointer hover:text-red-500 flex items-center">
            {t('navigation.courses')} <RiArrowDropDownLine style={{ fontSize: '36px' }} />
          </li>
          <li>
            <Link to="/instructors" className="hover:text-red-500">{t('navigation.instructors')}</Link>
          </li>
          <li className="flex items-center">
            <Link to="/programs" className="hover:text-red-500">{t('navigation.programs')}</Link>
            <span className={`${isRTL ? 'ml-0 mr-2' : 'ml-2'} bg-red-500 text-white text-[10px] px-1 py-0.5 rounded-full`}>NEW</span>
          </li>
          <li>
            <Link to="/subscribe" className="hover:text-red-500">{t('navigation.subscribe')}</Link>
          </li>
        </ul>

        {/* Right Section */}
        <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
          <div className="relative">
            <input
              type="text"
              placeholder={t('common.search')}
              className="bg-[#2a2a2a] text-sm text-white px-3 py-1 rounded-full focus:outline-none placeholder-gray-400 w-64"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            <button className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white`}>
              <CiSearch />
            </button>
          </div>
          <div className={`flex ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'} items-center`}>
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              {theme === 'light' ? (
                <FaMoon className="text-gray-700" />
              ) : (
                <FaSun className="text-yellow-500" />
              )}
            </button>
            <button
              onClick={toggleLanguage}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors text-xl font-medium text-gray-700"
            >
              {i18n.language === 'en' ? 'ع' : 'EN'}
            </button>
          </div>
          <Link to="/login" className="text-gray-400 hover:text-white">{t('common.login')}</Link>
          <Link to="/signup" className="bg-red-500 text-white px-4 py-1.5 rounded hover:bg-red-600">{t('common.signup')}</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;