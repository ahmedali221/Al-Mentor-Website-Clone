import React, { useState } from 'react';
import Custom_Input_Field from '../components/custom_Input_Field';
import { useLocation } from 'react-router-dom';
import { useNavigate } from'react-router-dom'; // Import useNavigate from react-router-dom for navigation
import axios from 'axios';


function SignupPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: location.state?.email || '',
        password: '',
        fullNameEn: '',
        fullNameAr: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const [firstNameEn, lastNameEn] = formData.fullNameEn.split(' ');
            const [firstNameAr, lastNameAr] = formData.fullNameAr.split(' ');
            
            const response = await axios.post('/api/auth/register', {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                firstName: {
                    en: firstNameEn || '',
                    ar: firstNameAr || ''
                },
                lastName: {
                    en: lastNameEn || '',
                    ar: lastNameAr || ''
                }
            });
            alert("Signup successful!");
            console.log("Signup successful:", response.data);
            navigate('/');
        } catch (err) {
            console.error("Signup failed:", err.response?.data || err.message);
            setError(err.response?.data?.message || "An error occurred");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen pt-16">
            <form onSubmit={handleSubmit} className='flex flex-col gap-3 w-100'>
                <div className="text-center mb-6">
                    <h1 className='text-3xl font-semibold'>Create Your Account</h1>
                    <h5 className="text-gray-600 mt-2">Signup and start learning</h5>
                </div>
                <div className="w-96 mx-auto space-y-4">
                    <Custom_Input_Field
                        Label="Full Name (English)"
                        id="fullNameEn"
                        type="text"
                        onChange={handleChange}
                        value={formData.fullNameEn}
                        placeholder="Enter your full name in English"
                    />
                    <Custom_Input_Field
                        Label="Full Name (Arabic)"
                        id="fullNameAr"
                        type="text"
                        onChange={handleChange}
                        value={formData.fullNameAr}
                        placeholder="Enter your full name in Arabic"
                    />
                    <Custom_Input_Field
                        Label="Username"
                        id="username"
                        type="text"
                        onChange={handleChange}
                        value={formData.username}
                        placeholder="Choose a username"
                    />
                    <Custom_Input_Field
                        Label="Email"
                        id="email"
                        type="email"
                        onChange={handleChange}
                        value={formData.email}
                        placeholder="Enter your email"
                    />
                    <Custom_Input_Field
                        Label="Password"
                        id="password"
                        type="password"
                        onChange={handleChange}
                        value={formData.password}
                        placeholder="Create a password"
                    />
                </div>


                {error && <p className="text-red-600 text-center">{error}</p>}

                 <div className="text-center mt-6">
                    <p className="text-gray-600">
                        By signing up, I agree with almentor's 
                        <a href="/terms" className="text-gray-600 underline hover:text-gray-700"> Terms & Conditions </a>
                        and 
                        <a href="/privacy" className="text-gray-600 underline hover:text-gray-700"> Privacy Policy</a>
                    </p>
                 </div>

                <button
                    type="submit"
                    className='bg-red-600 px-4 mt-4 py-2 text-white hover:bg-red-700 sm:px-8 sm:py-3 rounded-md w-100 sm:w-96 mx-auto'
                >
                    Sign Up
                </button>

               
                    
                    <p className="text-gray-600 mt-4 text-center">
                        Already have an account?{' '}
                        <a 
                            href="/login" 
                            className="text-black font-medium hover:underline"
                        >
                            Login
                        </a>
                    </p>
            </form>
        </div>
    );
}

export default SignupPage;