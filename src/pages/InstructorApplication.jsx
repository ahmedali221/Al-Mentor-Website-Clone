/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const InstructorApplication = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState({
        resume: null,
        profilePicture: null
    });

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();

    const onSubmit = async (data) => {
        if (!user) {
            toast.error(t('messages.loginRequired'));
            navigate('/login');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('userId', user._id);
            Object.keys(data).forEach(key => {
                if (key === 'resume' || key === 'profilePicture') {
                    if (data[key][0]) {
                        formData.append(key, data[key][0]);
                    }
                } else {
                    formData.append(key, data[key]);
                }
            });

            const response = await fetch('https://al-mentor-database-production.up.railway.app/instructors', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                toast.success(t('messages.instructorApplicationSubmitted'));
                navigate('/home');
            } else {
                toast.error(result.message || t('messages.applicationSubmissionFailed'));
            }
        } catch (error) {
            toast.error(t('messages.errorSubmittingApplication'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e, type) => {
        if (e.target.files[0]) {
            setUploadedFiles(prev => ({
                ...prev,
                [type]: e.target.files[0]
            }));
        }
    };

    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#121212] text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-4xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold text-center mb-8">
                    {t('instructorApplication.title')}
                </h1>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {/* Professional Information */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {t('instructorApplication.professionalTitle')}
                                </label>
                                <input
                                    type="text"
                                    {...register('professionalTitle', { required: true })}
                                    className={`w-full px-3 py-2 border rounded-md ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                />
                                {errors.professionalTitle && (
                                    <p className="mt-1 text-sm text-red-500">{t('validation.required')}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {t('instructorApplication.bio')}
                                </label>
                                <textarea
                                    {...register('bio', { required: true })}
                                    rows={4}
                                    className={`w-full px-3 py-2 border rounded-md ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                />
                                {errors.bio && (
                                    <p className="mt-1 text-sm text-red-500">{t('validation.required')}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {t('instructorApplication.expertise')}
                                </label>
                                <input
                                    type="text"
                                    {...register('expertise', { required: true })}
                                    className={`w-full px-3 py-2 border rounded-md ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                />
                                {errors.expertise && (
                                    <p className="mt-1 text-sm text-red-500">{t('validation.required')}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {t('instructorApplication.experience')}
                                </label>
                                <textarea
                                    {...register('experience', { required: true })}
                                    rows={3}
                                    className={`w-full px-3 py-2 border rounded-md ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                />
                                {errors.experience && (
                                    <p className="mt-1 text-sm text-red-500">{t('validation.required')}</p>
                                )}
                            </div>
                        </div>

                        {/* File Uploads */}
                        <div className="mt-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {t('instructorApplication.resume')}
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    {...register('resume', { required: true })}
                                    onChange={(e) => handleFileChange(e, 'resume')}
                                    className={`w-full px-3 py-2 border rounded-md ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                />
                                {errors.resume && (
                                    <p className="mt-1 text-sm text-red-500">{t('validation.required')}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {t('instructorApplication.profilePicture')}
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    {...register('profilePicture', { required: true })}
                                    onChange={(e) => handleFileChange(e, 'profilePicture')}
                                    className={`w-full px-3 py-2 border rounded-md ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                />
                                {errors.profilePicture && (
                                    <p className="mt-1 text-sm text-red-500">{t('validation.required')}</p>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="mt-8">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-3 px-4 rounded-md font-medium ${isSubmitting
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-red-600 hover:bg-red-700'
                                    } text-white transition-colors`}
                            >
                                {isSubmitting
                                    ? t('instructorApplication.submitting')
                                    : t('instructorApplication.submit')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InstructorApplication;