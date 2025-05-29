import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const RequestSession = ({ instructorId, onClose }) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requestedDate: '',
        requestedDuration: 30, // Default 30 minutes
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error(t('messages.loginRequired'));
            navigate('/loginPage');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('http://localhost:5000/api/instructor-sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user._id,
                    instructorId,
                    ...formData,
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(t('messages.sessionRequested'));
                onClose();
                // Navigate to the chat page
                navigate(`/instructor-session/${data.data._id}`);
            } else {
                toast.error(data.message || t('messages.requestFailed'));
            }
        } catch (error) {
            console.error('Error requesting session:', error);
            toast.error(t('messages.requestFailed'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50`}>
            <div className={`w-full max-w-md rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                }`}>
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-6">{t('requestSession.title')}</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                {t('requestSession.titleLabel')}
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className={`w-full p-2 rounded-lg ${theme === 'dark'
                                        ? 'bg-gray-700 text-white placeholder-gray-400'
                                        : 'bg-gray-50 text-gray-900 placeholder-gray-500'
                                    }`}
                                placeholder={t('requestSession.titlePlaceholder')}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                {t('requestSession.descriptionLabel')}
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows="4"
                                className={`w-full p-2 rounded-lg ${theme === 'dark'
                                        ? 'bg-gray-700 text-white placeholder-gray-400'
                                        : 'bg-gray-50 text-gray-900 placeholder-gray-500'
                                    }`}
                                placeholder={t('requestSession.descriptionPlaceholder')}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                {t('requestSession.dateLabel')}
                            </label>
                            <input
                                type="datetime-local"
                                name="requestedDate"
                                value={formData.requestedDate}
                                onChange={handleChange}
                                required
                                className={`w-full p-2 rounded-lg ${theme === 'dark'
                                        ? 'bg-gray-700 text-white'
                                        : 'bg-gray-50 text-gray-900'
                                    }`}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                {t('requestSession.durationLabel')}
                            </label>
                            <select
                                name="requestedDuration"
                                value={formData.requestedDuration}
                                onChange={handleChange}
                                required
                                className={`w-full p-2 rounded-lg ${theme === 'dark'
                                        ? 'bg-gray-700 text-white'
                                        : 'bg-gray-50 text-gray-900'
                                    }`}
                            >
                                <option value="15">15 {t('requestSession.minutes')}</option>
                                <option value="30">30 {t('requestSession.minutes')}</option>
                                <option value="45">45 {t('requestSession.minutes')}</option>
                                <option value="60">60 {t('requestSession.minutes')}</option>
                                <option value="90">90 {t('requestSession.minutes')}</option>
                                <option value="120">120 {t('requestSession.minutes')}</option>
                            </select>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className={`px-4 py-2 rounded-lg ${theme === 'dark'
                                        ? 'bg-gray-700 hover:bg-gray-600'
                                        : 'bg-gray-200 hover:bg-gray-300'
                                    }`}
                            >
                                {t('buttons.cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                {isSubmitting ? t('buttons.requesting') : t('buttons.request')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RequestSession; 