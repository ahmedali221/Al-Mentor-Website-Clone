import React, { useState } from 'react';
import Custom_Input_Field from '../components/custom_Input_Field';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

function PasswordPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const { theme } = useTheme();
    const { setUser } = useAuth();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const isRTL = i18n.language === 'ar';

    const handleChange = (e) => {
        if (e.target.id === "password") {
            setPassword(e.target.value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log("Attempting login with email:", location.state.email);
            const response = await axios.post('/api/auth/login', {
                email: location.state.email,
                password
            });

            console.log("Server response:", response.data);

            if (response.data.token) {
                // Save token
                localStorage.setItem('token', response.data.token);

                // If user data is not in the response, fetch it using the token
                if (!response.data.user) {
                    console.log("No user data in response, fetching user data...");
                    try {
                        const userResponse = await axios.get('/api/auth/me', {
                            headers: { Authorization: `Bearer ${response.data.token}` }
                        });
                        console.log("Fetched user data:", userResponse.data);
                        const userData = userResponse.data;
                        localStorage.setItem('user', JSON.stringify(userData));
                        setUser(userData);
                    } catch (userErr) {
                        console.error("Error fetching user data:", userErr);
                        setError(t('auth.fetchUserFailed', 'Login successful but failed to fetch user data'));
                        return;
                    }
                } else {
                    // Save user data from login response
                    console.log("Saving user data from login response:", response.data.user);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                    setUser(response.data.user);
                }

                console.log("Login successful, navigating to home...");
                navigate('/home');
            } else {
                console.error("Login failed: No token in response");
                setError(t('auth.loginFailed', 'Login failed: Invalid response from server'));
            }
        } catch (err) {
            console.error("Login failed:", err.response?.data || err.message);
            setError(err.response?.data?.message || t('messages.error', 'An error occurred'));
        }
    };

    return (
        <>
            <div className={`flex justify-center items-center min-h-screen pt-16 ${theme === 'dark' ? 'bg-[#1A1A1A] text-white' : 'bg-gray-50 text-gray-900'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <form onSubmit={handleSubmit} className='flex flex-col gap-3 w-100'>
                    <h1 className='text-3xl font-semibold mb-4 text-center w-96 mx-auto'>{t('auth.welcomeBack', 'Welcome back!')}</h1>

                    <div className="w-96 mx-auto">
                        <Custom_Input_Field
                            Label={t('auth.email', 'Email')}
                            id="email"
                            type="email"
                            value={location.state.email}
                            readOnly
                        />
                        <Custom_Input_Field
                            Label={t('auth.enterPassword', 'Enter Your Password')}
                            id="password"
                            type="password"
                            onChange={handleChange}
                            value={password}
                            placeholder={t('auth.passwordPlaceholder', 'Type Your Password...')}
                        />
                    </div>

                    {error && <p className="text-red-600 text-center">{error}</p>}

                    <button
                        type="submit"
                        className='bg-red-600 px-4 mt-1 py-2 text-white hover:bg-red-700 sm:px-8 sm:py-3 rounded-md w-100 sm:w-96 mx-auto'
                    >
                        {t('auth.continue', 'Continue')}
                    </button>
                </form>
            </div>
        </>
    );
}

export default PasswordPage;