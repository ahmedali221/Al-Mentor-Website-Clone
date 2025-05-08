import React, { useState } from 'react';
import Custom_Input_Field from '../components/custom_Input_Field';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function PasswordPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        if (e.target.id === "password") {
            setPassword(e.target.value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/auth/login', {
                email: location.state.email,
                password
            });
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                console.log("Login successful, token saved");
                
                navigate('/home');
            } else {
                setError("Login failed: No token received");
            }
        } catch (err) {
            console.error("Login failed:", err.response?.data || err.message);
            setError(err.response?.data?.message || "An error occurred");
        }
    };

    return (
        <>
            <div className="flex justify-center items-center min-h-screen pt-16">
                <form onSubmit={handleSubmit} className='flex flex-col gap-3 w-100'>
                    <h1 className='text-3xl font-semibold mb-4 text-center w-96 mx-auto'>Welcome back!</h1>

                    <div className="w-96 mx-auto">
                        <Custom_Input_Field
                            Label="Email"
                            id="email"
                            type="email"
                            value={location.state.email}
                            readOnly
                        />
                        <Custom_Input_Field
                            Label="Enter Your Password"
                            id="password"
                            type="password"
                            onChange={handleChange}
                            value={password}
                            placeholder="Type Your Password..."
                        />
                    </div>

                    {error && <p className="text-red-600 text-center">{error}</p>}

                    <button
                        type="submit"
                        className='bg-red-600 px-4 mt-1 py-2 text-white hover:bg-red-700 sm:px-8 sm:py-3 rounded-md w-100 sm:w-96 mx-auto'
                    >
                        Continue
                    </button>
                </form>
            </div>
        </>
    );
}

export default PasswordPage;