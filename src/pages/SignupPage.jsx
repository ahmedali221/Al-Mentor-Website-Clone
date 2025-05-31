import React, { useState } from 'react';
import Custom_Input_Field from '../components/custom_Input_Field';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

function SignupPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { theme } = useTheme();
    const [formData, setFormData] = useState({
        username: '',
        email: location.state?.email || '',
        password: '',
        fullNameEn: '',
        fullNameAr: ''
    });
    const [error, setError] = useState('');

    const isRTL = i18n.language === 'ar';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const [firstNameEn, lastNameEn] = formData.fullNameEn.split(' ');
            const [firstNameAr, lastNameAr] = formData.fullNameAr.split(' ');

            const response = await axios.post('https://al-mentor-database-production.up.railway.app/auth/register', {
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
            alert(t('auth.signupSuccess', 'Signup successful!'));
            console.log("Signup successful:", response.data);
            navigate('/');
        } catch (err) {
            console.error("Signup failed:", err.response?.data || err.message);
            setError(err.response?.data?.message || t('messages.error', 'An error occurred'));
        }
    };

    return (
        <div className={`flex justify-center items-center min-h-screen pt-28 pb-12 ${theme === 'dark' ? 'bg-[#1A1A1A] text-white' : 'bg-gray-50 text-gray-900'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <form onSubmit={handleSubmit} className='flex flex-col gap-3 w-100'>
                <div className="text-center mb-6">
                    <h1 className='text-3xl font-semibold'>{t('auth.createAccount', 'Create Your Account')}</h1>
                    <h5 className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-2`}>{t('auth.signupSubtitle', 'Signup and start learning')}</h5>
                </div>
                <div className="w-96 mx-auto space-y-4">
                    <Custom_Input_Field
                        Label={t('auth.fullNameEn', 'Full Name (English)')}
                        id="fullNameEn"
                        type="text"
                        onChange={handleChange}
                        value={formData.fullNameEn}
                        placeholder={t('auth.fullNameEnPlaceholder', 'Enter your full name in English')}
                    />
                    <Custom_Input_Field
                        Label={t('auth.fullNameAr', 'Full Name (Arabic)')}
                        id="fullNameAr"
                        type="text"
                        onChange={handleChange}
                        value={formData.fullNameAr}
                        placeholder={t('auth.fullNameArPlaceholder', 'Enter your full name in Arabic')}
                    />
                    <Custom_Input_Field
                        Label={t('auth.username', 'Username')}
                        id="username"
                        type="text"
                        onChange={handleChange}
                        value={formData.username}
                        placeholder={t('auth.usernamePlaceholder', 'Choose a username')}
                    />
                    <Custom_Input_Field
                        Label={t('auth.email', 'Email')}
                        id="email"
                        type="email"
                        onChange={handleChange}
                        value={formData.email}
                        placeholder={t('auth.emailPlaceholder', 'Enter your email')}
                    />
                    <Custom_Input_Field
                        Label={t('auth.password', 'Password')}
                        id="password"
                        type="password"
                        onChange={handleChange}
                        value={formData.password}
                        placeholder={t('auth.passwordCreatePlaceholder', 'Create a password')}
                    />
                </div>

                {error && <p className="text-red-600 text-center">{error}</p>}

                <div className="text-center mt-6">
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {t('auth.termsAgreement', "By signing up, I agree with almentor's")}
                        <a href="/terms" className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} underline hover:text-gray-700`}> {t('footer.terms', 'Terms & Conditions')} </a>
                        {t('auth.and', 'and')}
                        <a href="/privacy" className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} underline hover:text-gray-700`}> {t('footer.privacy', 'Privacy Policy')}</a>
                    </p>
                </div>

                <button
                    type="submit"
                    className='bg-red-600 px-4 mt-4 py-2 text-white hover:bg-red-700 sm:px-8 sm:py-3 rounded-md w-100 sm:w-96 mx-auto'
                >
                    {t('common.signup', 'Sign Up')}
                </button>

                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-4 text-center`}>
                    {t('auth.haveAccount', 'Already have an account?')}{' '}
                    <a
                        href="/loginPage"
                        className={`${theme === 'dark' ? 'text-gray-100' : 'text-black'} font-medium hover:underline`}
                    >
                        {t('common.login', 'Login')}
                    </a>
                </p>
            </form>
        </div>
    );
}

export default SignupPage;