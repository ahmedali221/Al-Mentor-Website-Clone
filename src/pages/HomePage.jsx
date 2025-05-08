import React from 'react';

function HomePage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-8">Welcome to Almentor!</h1>
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <p className="text-gray-700 mb-4">
                    You have successfully logged in. Start exploring our courses and resources!
                </p>
                <button
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                    onClick={() => {
                        localStorage.removeItem('token');
                        window.location.href = '/';
                    }}
                >
                    Logout
                </button>
            </div>
        </div>
    );
}

export default HomePage;