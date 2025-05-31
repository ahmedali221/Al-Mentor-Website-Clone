import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { VideoCameraIcon, PhoneIcon, XMarkIcon } from '@heroicons/react/24/outline';

const InstructorSessionChat = () => {
    const { sessionId } = useParams();
    const { user } = useAuth();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isVideoChat, setIsVideoChat] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const wsRef = useRef(null);

    // WebSocket connection
    useEffect(() => {
        if (!sessionId || !user) return;

        let retryCount = 0;
        const maxRetries = 3;
        const retryDelay = 2000; // 2 seconds
        let reconnectTimeout;

        const connectWebSocket = () => {
            try {
                console.log('Attempting WebSocket connection...');
                const ws = new WebSocket(`ws:https://al-mentor-database-production.up.railway.app/?userId=${user._id}&sessionId=${sessionId}`);
                wsRef.current = ws;

                ws.onopen = () => {
                    console.log('WebSocket connected successfully');
                    retryCount = 0; // Reset retry count on successful connection
                };

                ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        console.log('Received WebSocket message:', data);

                        if (data.type === 'chat_history') {
                            setMessages(data.data);
                        } else if (data.type === 'new_message') {
                            setMessages(prev => [...prev, data.data]);
                        } else if (data.type === 'error') {
                            console.error('WebSocket error message:', data.message);
                            toast.error(data.message);
                        }
                    } catch (error) {
                        console.error('Error parsing WebSocket message:', error);
                        toast.error(t('messages.chatError'));
                    }
                };

                ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    toast.error(t('messages.chatError'));
                };

                ws.onclose = (event) => {
                    console.log('WebSocket disconnected:', {
                        code: event.code,
                        reason: event.reason,
                        wasClean: event.wasClean
                    });

                    // Clear any existing reconnect timeout
                    if (reconnectTimeout) {
                        clearTimeout(reconnectTimeout);
                    }

                    // Attempt to reconnect if not closed normally and haven't exceeded max retries
                    if (event.code !== 1000 && retryCount < maxRetries) {
                        retryCount++;
                        console.log(`Attempting to reconnect (${retryCount}/${maxRetries})...`);
                        toast.info(t('messages.reconnecting', { count: retryCount, max: maxRetries }));
                        reconnectTimeout = setTimeout(connectWebSocket, retryDelay);
                    } else if (retryCount >= maxRetries) {
                        console.error('Max reconnection attempts reached');
                        toast.error(t('messages.maxRetriesReached'));
                    }
                };
            } catch (error) {
                console.error('Error creating WebSocket connection:', error);
                toast.error(t('messages.chatError'));
            }
        };

        connectWebSocket();

        return () => {
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }
            if (wsRef.current) {
                wsRef.current.close(1000, 'Component unmounting');
            }
        };
    }, [sessionId, user, t]);

    // Fetch session details
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await fetch(`https://al-mentor-database-production.up.railway.app/instructor-sessions/${sessionId}`);
                const data = await response.json();
                if (data.success) {
                    setSession(data.data);
                } else {
                    setError(data.message);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSession();
    }, [sessionId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !wsRef.current) return;

        const messageData = {
            content: newMessage.trim(),
            role: 'user'
        };

        wsRef.current.send(JSON.stringify(messageData));
        setNewMessage('');
    };

    const toggleVideoChat = () => {
        setIsVideoChat(!isVideoChat);
    };

    if (isLoading) {
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
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    {t('buttons.goBack')}
                </button>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>{t('messages.sessionNotFound')}</p>
            </div>
        );
    }

    return (
        <div className={`flex flex-col h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Header */}
            <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <img
                            src={session.instructor?.user?.profilePicture || '/default-profile.png'}
                            alt="Instructor"
                            className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                            <h2 className="text-lg font-semibold">
                                {`${session.instructor?.user?.firstName || ''} ${session.instructor?.user?.lastName || ''}`}
                            </h2>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {session.title}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={toggleVideoChat}
                            className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                        >
                            {isVideoChat ? (
                                <XMarkIcon className="w-6 h-6" />
                            ) : (
                                <VideoCameraIcon className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Video Chat Section */}
            {isVideoChat && (
                <div className="p-4 border-b border-gray-200">
                    <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                        <p className="text-white">{t('messages.videoChatPlaceholder')}</p>
                    </div>
                </div>
            )}

            {/* Messages Section */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col-reverse">
                <div className="flex flex-col space-y-4">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[70%] rounded-lg p-3 ${message.role === 'user'
                                    ? 'bg-red-600 text-white rounded-br-none'
                                    : theme === 'dark'
                                        ? 'bg-gray-700 rounded-bl-none'
                                        : 'bg-gray-200 rounded-bl-none'
                                    }`}
                            >
                                <p>{message.content}</p>
                                <span className={`text-xs mt-1 block ${message.role === 'user'
                                    ? 'text-red-100'
                                    : theme === 'dark'
                                        ? 'text-gray-400'
                                        : 'text-gray-500'
                                    }`}>
                                    {new Date(message.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={t('placeholders.typeMessage')}
                        className={`flex-1 p-2 rounded-full ${theme === 'dark'
                            ? 'bg-gray-700 text-white placeholder-gray-400'
                            : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                            }`}
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                        {t('buttons.send')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InstructorSessionChat; 