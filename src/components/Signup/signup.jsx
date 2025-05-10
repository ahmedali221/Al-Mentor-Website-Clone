import React, { useState } from 'react';


export default function SignUpPage() {
  const [email, setEmail] = useState('');

  const handleGoogle = () => {
    alert('Continue with Google');
  };

  const handleFacebook = () => {
    alert('Continue with Facebook');
  };

  const handleEmailSignUp = (e) => {
    e.preventDefault();
    if (!email) return alert("Please enter a valid email.");
    alert(`Continue with Email: ${email}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md text-center">
       
        <h1 className="text-2xl font-semibold mb-8">Welcome to almentor!</h1>

        <button
          onClick={handleGoogle}
          className="w-full border border-red-500 text-red-600 rounded-lg py-3 mb-4 flex items-center justify-center gap-2 hover:bg-red-50 transition"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        <button
          onClick={handleFacebook}
          className="w-full border border-red-500 text-red-600 rounded-lg py-3 mb-6 flex items-center justify-center gap-2 hover:bg-red-50 transition"
        >
          <img src="https://www.svgrepo.com/show/512120/facebook-176.svg" alt="Facebook" className="w-5 h-5" />
          Continue with Facebook
        </button>

        <hr className="mb-6 border-gray-300" />

        <form onSubmit={handleEmailSignUp}>
          <label htmlFor="email" className="block text-left mb-2 font-medium text-gray-800">
            Email address / User Identifier
          </label>
          <input
            id="email"
            type="email"
            placeholder="Type your email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition"
          >
            Continue with Email
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-black font-semibold underline">Log in here</a>
        </p>
      </div>
    </div>

  );

}
