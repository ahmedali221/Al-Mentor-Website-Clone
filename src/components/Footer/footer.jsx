import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#1a1a1a] text-white">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Column 1 */}
        <div className="flex flex-col space-y-4">
          <div className="bg-white p-3 rounded-md w-max">
            <img
             src="/logo.jpeg"
              alt="Logo"
              className="w-8 h-8"
            />
          </div>
          <a href="#" className="hover:underline">Blog</a>
          <a href="#" className="hover:underline">About</a>
          <a href="#" className="hover:underline">Press</a>
          <a href="#" className="hover:underline">Team</a>
          <a href="#" className="hover:underline">Contact</a>
        </div>

        {/* Column 2 */}
        <div>
          <h3 className="text-gray-400 font-semibold mb-6">Explore</h3>
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
          <h3 className="text-gray-400 font-semibold mb-6">Business</h3>
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
          <h3 className="text-gray-400 font-semibold mb-6">Download App</h3>
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
      <div className="bg-[#000000] border-t border-[#000000] py-4">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-gray-400 text-sm space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <span>© 2025 almentor.net</span>
            <a href="#" className="hover:underline">Terms of use</a>
            <a href="#" className="hover:underline">Privacy policy</a>
            <a href="#" className="text-[#3f8e9b] hover:underline">Help Center</a>
          </div>

          <div className="flex items-center space-x-6">
            {/* Icons */}
            <a href="#" aria-label="LinkedIn" className="text-white hover:text-blue-600 text-xl font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
                <path d="M4.98 3.5C4.98 4.88 3.9 6 2.5 6S0 4.88 0 3.5 1.08 1 2.5 1 4.98 2.12 4.98 3.5zM.5 23.5h5v-13h-5v13zm9.5 0h5v-7c0-5-6-4.8-6 0v7h5v-10h7v10z" />
              </svg>
            </a>
            <a href="#" aria-label="Facebook" className="text-white hover:text-blue-600 text-xl font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
                <path d="M22.675 0h-21.35C.6 0 0 .6 0 1.35v21.3c0 .75.6 1.35 1.325 1.35h11.495v-9.294H9.632v-3.622h3.183V8.413c0-3.156 1.926-4.875 4.735-4.875 1.34 0 2.49.099 2.828.144v3.288H17.42c-1.58 0-1.888.754-1.888 1.858v2.436h3.77l-.49 3.622h-3.28V24h6.426c.725 0 1.325-.6 1.325-1.35V1.35c0-.75-.6-1.35-1.325-1.35z"/>
              </svg>
            </a>
            <a href="#" aria-label="Instagram" className="text-white hover:text-pink-600 text-xl font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
                <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 3.5a4.75 4.75 0 1 1 0 9.5 4.75 4.75 0 0 1 0-9.5zm0 1.5a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5zm5.5-.73a1.23 1.23 0 1 1-2.46 0 1.23 1.23 0 0 1 2.46 0z"/>
              </svg>
            </a>

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