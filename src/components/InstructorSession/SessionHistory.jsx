import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { CalendarIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';

const SessionHistory = ({ isInstructor = false }) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // all, pending, approved, completed, cancelled

    useEffect(() => {
        const fetchSessions = async () => {
            if (!user) return;

            try {
                const endpoint = isInstructor
                    ? `http://localhost:5000/api/instructor-sessions/instructor/${user._id}`
                    : `http://localhost:5000/api/instructor-sessions/user/${user._id}`;

                const response = await fetch(endpoint);
                const data = await response.json();

                if (data.success) {
                    setSessions(data.data);
                } else {
                    setError(data.message);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, [user, isInstructor]);

    const handleStatusChange = async (sessionId, newStatus, additionalData = {}) => {
        try {
            const response = await fetch(`http://localhost:5000/api/instructor-sessions/${sessionId}/${newStatus}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(additionalData),
            });

            const data = await response.json();

            if (data.success) {
                setSessions(prev => prev.map(session =>
                    session._id === sessionId ? { ...session, status: newStatus, ...data.data } : session
                ));
                toast.success(t(`messages.session${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`));
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error updating session status:', error);
            toast.error(t('messages.updateFailed'));
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-500';
            case 'approved':
                return 'bg-green-500';
            case 'completed':
                return 'bg-blue-500';
            case 'cancelled':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const filteredSessions = sessions.filter(session =>
        filter === 'all' ? true : session.status === filter
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    {t('buttons.retry')}
                </button>
            </div>
        );
    }

    return (
        <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">{t('sessionHistory.title')}</h1>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {['all', 'pending', 'approved', 'completed', 'cancelled'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg ${filter === status
                                ? 'bg-red-600 text-white'
                                : theme === 'dark'
                                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                                    : 'bg-white text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            {t(`sessionHistory.status.${status}`)}
                        </button>
                    ))}
                </div>

                {/* Sessions List */}
                <div className="space-y-4">
                    {filteredSessions.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">
                            {t('sessionHistory.noSessions')}
                        </p>
                    ) : (
                        filteredSessions.map((session) => (
                            <div
                                key={session._id}
                                className={`p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">{session.title}</h3>
                                        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {session.description}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm text-white ${getStatusColor(session.status)}`}>
                                        {t(`sessionHistory.status.${session.status}`)}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div className="flex items-center space-x-2">
                                        <CalendarIcon className="w-5 h-5" />
                                        <span>{new Date(session.requestedDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <ClockIcon className="w-5 h-5" />
                                        <span>{session.requestedDuration} {t('sessionHistory.minutes')}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <UserIcon className="w-5 h-5" />
                                        <span>
                                            {isInstructor
                                                ? `${session.user?.firstName || ''} ${session.user?.lastName || ''}`
                                                : `${session.instructor?.user?.firstName || ''} ${session.instructor?.user?.lastName || ''}`}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3">
                                    {session.status === 'pending' && isInstructor && (
                                        <>
                                            <button
                                                onClick={() => handleStatusChange(session._id, 'approve', { meetingLink: 'https://meet.google.com/xxx-yyyy-zzz' })}
                                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                            >
                                                {t('buttons.approve')}
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(session._id, 'reject')}
                                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                            >
                                                {t('buttons.reject')}
                                            </button>
                                        </>
                                    )}
                                    {session.status === 'approved' && (
                                        <button
                                            onClick={() => handleStatusChange(session._id, 'complete')}
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            {t('buttons.complete')}
                                        </button>
                                    )}
                                    {['pending', 'approved'].includes(session.status) && (
                                        <button
                                            onClick={() => handleStatusChange(session._id, 'cancel')}
                                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                        >
                                            {t('buttons.cancel')}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => navigate(`/instructor-session/${session._id}`)}
                                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                                    >
                                        {t('buttons.viewChat')}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default SessionHistory; 