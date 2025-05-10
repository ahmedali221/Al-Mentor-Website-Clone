import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:space-x-6">
                        <p className="text-sm text-gray-500">
                            © 2025 almentor.net
                        </p>
                        <a href="/terms" className="text-sm text-gray-500 hover:text-red-600" target="_blank" rel="noopener noreferrer">
                            Terms of Use
                        </a>
                        <a href="/privacy" className="text-sm text-gray-500 hover:text-red-600" target="_blank" rel="noopener noreferrer">
                            Privacy Policy
                        </a>
                        <a href="/help" className="text-sm text-gray-500 hover:text-red-600" target="_blank" rel="noopener noreferrer">
                            Help Center
                        </a>
                    </div>
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-500">
                            <FaFacebook className="h-5 w-5" />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-500">
                            <FaTwitter className="h-5 w-5" />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-500">
                            <FaInstagram className="h-5 w-5" />
                        </a>
                        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-500">
                            <FaYoutube className="h-5 w-5" />
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-500">
                            <FaLinkedin className="h-5 w-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;