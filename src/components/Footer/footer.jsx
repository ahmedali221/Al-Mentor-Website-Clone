import React from 'react';
import { useTheme } from '../../context/ThemeContext'; 

const Footer = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <footer className={`${isDark ? 'bg-[#1a1a1a] text-white' : 'bg-gray-100 text-black'}`}>
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Column 1 */}
        <div className="flex flex-col space-y-4">
          <div className={`${isDark ? 'bg-white' : 'bg-black'} p-3 rounded-md w-max`}>
            <img src="/logo.jpeg" alt="Logo" className="w-8 h-8" />
          </div>
          <a href="#" className="hover:underline">Blog</a>
          <a href="#" className="hover:underline">About</a>
          <a href="#" className="hover:underline">Press</a>
          <a href="#" className="hover:underline">Team</a>
          <a href="#" className="hover:underline">Contact</a>
        </div>

        {/* Column 2 */}
        <div>
          <h3 className={`${isDark ? 'text-gray-400' : 'text-gray-700'} font-semibold mb-6`}>Explore</h3>
          <ul className="space-y-3">
            <li><a href="#" className="hover:underline font-semibold">Browse Courses</a></li>
            <li><a href="#" className="hover:underline font-semibold">Popular Courses</a></li>
            <li><a href="#" className="hover:underline font-semibold">Subscription Plans</a></li>
            <li><a href="#" className="hover:underline font-semibold">Instructors</a></li>
            <li><a href="#" className="hover:underline font-semibold">Learning Partners</a></li>
          </ul>
        </div>

        {/* Column 3 */}
        <div>
          <h3 className={`${isDark ? 'text-gray-400' : 'text-gray-700'} font-semibold mb-6`}>Business</h3>
          <div className="flex flex-col space-y-4">
            <a href="#" className="underline font-semibold hover:text-red-500 transition-colors duration-300">
              Become an instructor
            </a>
            <button className="border border-red-500 text-red-500 px-6 py-2 rounded hover:bg-red-500 hover:text-white transition-colors duration-300">
              Train Your Team
            </button>
          </div>
        </div>

        {/* Column 4 */}
        <div>
          <h3 className={`${isDark ? 'text-gray-400' : 'text-gray-700'} font-semibold mb-6`}>Download App</h3>
          <div className="flex flex-col space-y-4">
            <a href="#" className="block max-w-max">
              <img
                src="https://developer.android.com/images/brand/en_app_rgb_wo_60.png"
                alt="Google Play"
                className="h-12 object-contain"
              />
            </a>
            <a href="#" className="block max-w-max">
              <img
                src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                alt="App Store"
                className="h-12 object-contain"
              />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={`${isDark ? 'bg-black border-t border-[#222]' : 'bg-white border-t border-gray-300'} py-4`}>
        <div className={`max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between ${isDark ? 'text-gray-400' : 'text-gray-700'} text-sm space-y-4 md:space-y-0`}>
          <div className="flex items-center space-x-4">
            <span>© 2025 almentor.net</span>
            <a href="#" className="hover:underline">Terms of use</a>
            <a href="#" className="hover:underline">Privacy policy</a>
            <a href="#" className="text-[#3f8e9b] hover:underline">Help Center</a>
          </div>

          <div className="flex items-center space-x-6">
            {/* Icons */}
            {/* ... social icons stay the same ... */}

            {/* Support Button */}
            <button
              type="button"
              className="fixed bottom-6 right-6 z-50 bg-[#3f8e9b] hover:bg-[#4b9fb1] text-white font-semibold px-6 py-2 rounded-full flex items-center space-x-2 shadow-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 10h.01M12 14a2 2 0 10-4 0 2 2 0 004 0zM12 20h.01M18 10h.01M16.5 15a7.5 7.5 0 11-9 0"
                />
              </svg>
              <span className="font-bold">Support</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
