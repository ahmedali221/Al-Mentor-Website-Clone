import React from 'react';
import { FaLinkedin, FaFacebook, FaInstagram } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const { theme } = useTheme();

  return (
    <footer className={`py-6 ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm">
          <p>© 2025 almentor.net</p>
          <a
            href="/terms"
            className={`hover:underline ${theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-700'}`}
          >
            Terms of Use
          </a>
          <a
            href="/privacy"
            className={`hover:underline ${theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-700'}`}
          >
            Privacy Policy
          </a>
          <a
            href="/help"
            className={`text-teal-600 hover:underline ${theme === 'dark' ? 'hover:text-gray-300' : 'hover:text-gray-700'}`}
          >
            Help Center
          </a>
        </div>
        <div className="flex space-x-6 mt-4 sm:mt-0 text-lg">
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className={theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-700'}
          >
            <FaLinkedin />
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className={theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-700'}
          >
            <FaFacebook />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className={theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-700'}
          >
            <FaInstagram />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;