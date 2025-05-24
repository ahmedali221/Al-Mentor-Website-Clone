import React, { useState } from 'react';
import Custom_Input_Field from '../components/custom_Input_Field';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000';

function PasswordPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const { theme } = useTheme();
    const { setUser } = useAuth();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const isRTL = i18n.language === 'ar';

    const handleChange = (e) => {
        if (e.target.id === "password") {
            setPassword(e.target.value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!location.state?.email) {
            setError(t('auth.emailRequired', 'Email is required'));
            setIsLoading(false);
            return;
        }

        try {
            console.log('Attempting login with:', {
                email: location.state.email,
                password: '***' // Don't log actual password
            });

            const response = await axios.post('/api/auth/login', {
                email: location.state.email,
                password
            });

            console.log('Login response:', response.data);

            if (response.data.token) {
                // Save token
                localStorage.setItem('token', response.data.token);
                
                // Save user data
                if (response.data.user) {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                    setUser(response.data.user);
                }

                // Set default authorization header for future requests
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                
                console.log("Login successful");
                navigate('/home');
            } else {
                setError(t('auth.loginFailed', 'Login failed: No token received'));
            }
        } catch (err) {
            console.error("Login failed:", err);
            
            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Server response:', err.response.data);
                setError(
                    err.response.data?.message || 
                    err.response.data?.error || 
                    t('auth.loginFailed', 'Login failed')
                );
            } else if (err.request) {
                // The request was made but no response was received
                console.error('No response received:', err.request);
                setError(t('auth.noResponse', 'No response from server. Please check your connection.'));
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Request setup error:', err.message);
                setError(t('auth.requestError', 'Error setting up the request'));
            }
        } finally {
            setIsLoading(false);
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
                            value={location.state?.email || ''}
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

                    {error && (
                        <div className="text-red-600 text-center p-2 bg-red-50 rounded">
                            <p className="font-medium">{error}</p>
                            {process.env.NODE_ENV === 'development' && (
                                <p className="text-sm mt-1">Check console for more details</p>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`bg-red-600 px-4 mt-1 py-2 text-white hover:bg-red-700 sm:px-8 sm:py-3 rounded-md w-100 sm:w-96 mx-auto ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? t('auth.loading', 'Loading...') : t('auth.continue', 'Continue')}
                    </button>
                </form>
            </div>
        </>
    );
}

export default PasswordPage;