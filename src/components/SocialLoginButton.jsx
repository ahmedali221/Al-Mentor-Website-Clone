import React from 'react';

const SocialLoginButton = ({ provider, icon, onClick }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className='px-4 mt-2 py-2 text-sm text-red-500 font-medium hover:bg-gray-100 hover:border-0 border border-red-600 sm:px-8 sm:py-3 rounded-md w-100 sm:w-96 mx-auto flex items-center justify-center gap-2'
        >
            <span className="text-inherit">{icon}</span>
            <span>Sign in with {provider}</span>
        </button>
    );
};

export default SocialLoginButton;