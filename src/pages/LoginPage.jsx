import React, { useEffect } from 'react'
import Custom_Input_Field from '../components/custom_Input_Field'
import { useState } from 'react'
import SocialLoginButton from '../components/SocialLoginButton'
import { FaFacebook, FaGoogle } from 'react-icons/fa'

import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../context/ThemeContext'

function LoginPage() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { theme } = useTheme();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const isRTL = i18n.language === 'ar';

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            axios.get('/api/auth/check', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then(response => {
                    if (response.data.message === "Authenticated") {
                        navigate('/home');
                    } else {
                        setIsLoading(false);
                    }
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }
    }, [navigate]);

    if (isLoading) {
        return <div className={`flex justify-center items-center min-h-screen pt-28 pb-12 ${theme === 'dark' ? 'bg-[#1A1A1A] text-white' : 'bg-gray-50 text-gray-900'}`}>
            {t('messages.loading', 'Loading...')}
        </div>;
    }

    const handleChange = (e) => {
        if (e.target.id === "email") {
            setEmail(e.target.value)
        }
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://al-mentor-database-production.up.railway.app/auth/checkEmail', { email });
            if (response.data.exists) {
                alert(t('auth.emailVerified', 'Email verified! Please enter your password.'));
                navigate('/password', { state: { email: email } });
            }
            else {
                setError(t('auth.emailNotFound', 'Email not found. Please check your email or sign up.'));
            }
        } catch (err) {
            console.error("Login failed:", err.response?.data || err.message);
            setError(err.response?.data?.message || t('messages.error', 'An error occurred. Please try again.'));
        }
    }

    return (
        <>
            <div className={`flex justify-center items-center min-h-screen pt-16 ${theme === 'dark' ? 'bg-[#1A1A1A] text-white' : 'bg-gray-50 text-gray-900'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <form onSubmit={handleSubmit} className='flex flex-col gap-3 w-100'>
                    <h1 className='text-3xl font-semibold mb-4 text-center w-96 mx-auto'>{t('auth.welcomeMessage', 'Welcome to almentor!')}</h1>

                    <SocialLoginButton
                        provider={t('auth.facebook', 'Facebook')}
                        icon={<FaFacebook className="text-xl" />}
                    />
                    <SocialLoginButton
                        provider={t('auth.google', 'Google')}
                        icon={<FaGoogle className="text-xl" />}
                    />

                    <div className="relative flex py-5 items-center w-96 mx-auto">
                        <div className={`flex-grow border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-800'}`}></div>
                    </div>

                    <div className="w-96 mx-auto">
                        <Custom_Input_Field
                            Label={t('auth.enterEmail', 'Enter Your Email')}
                            id="email"
                            type="email"
                            onChange={handleChange}
                            value={email}
                            placeholder={t('auth.emailPlaceholder', 'Type Your Email...')}
                        ></Custom_Input_Field>

                    </div>

                    {error && <p className="text-red-600 text-center">{error}</p>}

                    <button
                        type="submit"
                        className='bg-red-600 px-4 mt-1 py-2 text-white hover:bg-red-700 sm:px-8 sm:py-3 rounded-md w-100 sm:w-96 mx-auto'
                    >
                        {t('common.login', 'Login')}
                    </button>
                    <p className={`text-center mt-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {t('auth.noAccount', "Don't Have An Account?")}{' '}
                        <a
                            href="/signup-Email"
                            className="text-red-600 font-medium hover:text-red-700 hover:underline"
                        >
                            {t('common.signup', 'Signup')}
                        </a>
                    </p>
                </form>
            </div>

        </>
    )
}

export default LoginPage