import React, { useEffect, useState, useRef } from 'react';
import { FiSend, FiCopy, FiCheck, FiPaperclip, FiImage, FiFile, FiDownload, FiPlus, FiTrash2, FiEdit3, FiMessageSquare, FiX } from 'react-icons/fi';
import { RiRobot2Line, RiUser3Line } from 'react-icons/ri';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const AIChatHomepage = () => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();

  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);

  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserId(payload.userId || payload.id || payload._id);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    } else {
      console.warn('No token found, using mock userId');
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserChats();
    }
  }, [userId]);

  useEffect(() => {
    if (messages.length > 0) {
      chatContainerRef.current?.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const fetchUserChats = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`https://al-mentor-database-production.up.railway.app/api/chats/user/${userId}`);
      const data = await response.json();
      if (data.success) {
        setChatHistory(data.data);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const createNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setUserInput('');
    setSelectedFile(null);
  };

  const loadChat = async (chatId) => {
    try {
      const response = await fetch(`https://al-mentor-database-production.up.railway.app/api/chats/${chatId}`);
      const data = await response.json();
      if (data.success) {
        setCurrentChatId(chatId);
        setMessages(data.data.messages || []);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const deleteChat = async (chatId, e) => {
    e.stopPropagation();
    if (window.confirm(t('ai.chat.deleteChatConfirm'))) {
      try {
        const response = await fetch(`https://al-mentor-database-production.up.railway.app/api/chats/${chatId}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
          setChatHistory(prev => prev.filter(chat => chat._id !== chatId));
          if (currentChatId === chatId) {
            createNewChat();
          }
        }
      } catch (error) {
        console.error('Error deleting chat:', error);
      }
    }
  };

  const updateChatTitle = async (chatId, newTitle) => {
    try {
      const response = await fetch(`https://al-mentor-database-production.up.railway.app/api/chats/${chatId}/title`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: newTitle })
      });
      const data = await response.json();
      if (data.success) {
        setChatHistory(prev => prev.map(chat =>
          chat._id === chatId ? { ...chat, title: newTitle } : chat
        ));
        setEditingChatId(null);
        setEditingTitle('');
      }
    } catch (error) {
      console.error('Error updating chat title:', error);
    }
  };

  const saveChatMessage = async (message, role, chatId = currentChatId) => {
    try {
      const response = await fetch('https://al-mentor-database-production.up.railway.app/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          chatId,
          message,
          role
        })
      });
      const data = await response.json();
      if (data.success) {
        if (!currentChatId && data.data._id) {
          setCurrentChatId(data.data._id);
          fetchUserChats();
        }
        return data.data;
      }
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile({
          file,
          preview: reader.result,
          type: file.type,
          name: file.name,
          size: file.size
        });
      };
      reader.readAsDataURL(file);
      setShowAttachMenu(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim() && !selectedFile) return;

    let newMessage = {
      role: 'user',
      content: userInput,
      timestamp: new Date().toISOString()
    };

    if (selectedFile) {
      newMessage.attachment = {
        name: selectedFile.name,
        type: selectedFile.type,
        url: selectedFile.preview,
        size: selectedFile.size,
        preview: selectedFile.preview
      };
    }

    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);
    setSelectedFile(null);

    const chatData = await saveChatMessage(
      userInput + (selectedFile ? ` [${t('ai.chat.attachment')}: ${selectedFile.name}]` : ''),
      'user'
    );
    const chatIdToUse = currentChatId || chatData?._id;

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer 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",
          "HTTP-Referer": window.location.origin,
          "X-Title": "Al-Mentor AI Chat",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "deepseek/deepseek-chat-v3-0324:free",
          "messages": [...messages, newMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      });

      const data = await response.json();
      if (data.choices && data.choices[0]?.message) {
        const aiMessage = {
          ...data.choices[0].message,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);

        await saveChatMessage(aiMessage.content, 'assistant', chatIdToUse);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        role: 'assistant',
        content: t('ai.chat.errorProcessing'),
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      await saveChatMessage(errorMessage.content, 'assistant', chatIdToUse);
    }

    setIsLoading(false);
    setUserInput('');
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  const startEditingTitle = (chat, e) => {
    e.stopPropagation();
    setEditingChatId(chat._id);
    setEditingTitle(chat.title || t('ai.chat.newChat'));
  };

  const saveTitle = (chatId) => {
    if (editingTitle.trim()) {
      updateChatTitle(chatId, editingTitle.trim());
    } else {
      setEditingChatId(null);
      setEditingTitle('');
    }
  };

  const renderMessage = (message, index) => {
    const isUser = message.role === 'user';

    return (
      <div
        key={index}
        className={`flex items-start gap-4 ${isUser ? 'justify-end' : ''}`}
      >
        {!isUser && (
          <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center ${theme === 'dark'
            ? 'bg-gradient-to-br from-red-600/30 to-red-800/30 border border-red-500/30'
            : 'bg-gradient-to-br from-red-100 to-red-200 border border-red-200'
            }`}>
            <RiRobot2Line className={`text-xl ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
          </div>
        )}

        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
          <div className="relative group">
            <div
              className={`
                p-4 
                ${isUser ? 'rounded-t-2xl rounded-bl-2xl' : 'rounded-t-2xl rounded-bl-2xl rounded-br-md'} 
                ${isUser
                  ? theme === 'dark'
                    ? 'bg-gradient-to-r from-red-600 to-red-800 text-white'
                    : 'bg-gradient-to-r from-red-500 to-red-700 text-white'
                  : theme === 'dark'
                    ? 'bg-gradient-to-br from-[#2a2f42] to-[#1e2338] border border-gray-700'
                    : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
                }
              `}
            >
              {message.content && (
                <p className={`whitespace-pre-wrap leading-relaxed text-sm ${isUser
                  ? 'text-white'
                  : theme === 'dark' ? 'text-gray-100' : 'text-gray-700'
                  }`}>
                  {message.content}
                </p>
              )}

              {message.attachment && (
                <div className="mt-2">
                  {message.attachment.type.startsWith('image/') ? (
                    <div className="relative group">
                      <img
                        src={message.attachment.preview || message.attachment.url}
                        alt={message.attachment.name}
                        className="max-w-full rounded-lg max-h-[300px] object-contain"
                      />
                      <a
                        href={message.attachment.url}
                        download={message.attachment.name}
                        className={`absolute top-2 right-2 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${theme === 'dark'
                          ? 'bg-gray-800/80 hover:bg-gray-700/80 text-white'
                          : 'bg-white/80 hover:bg-gray-100/80 text-gray-700'
                          }`}
                      >
                        <FiDownload className="text-lg" />
                      </a>
                    </div>
                  ) : (
                    <div className={`flex items-center gap-3 p-3 rounded-lg ${theme === 'dark'
                      ? 'bg-gray-800/50 border border-gray-700'
                      : 'bg-gray-50 border border-gray-200'
                      }`}>
                      <FiFile className={`text-xl ${theme === 'dark' ? 'text-red-400' : 'text-red-600'
                        }`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                          }`}>
                          {message.attachment.name}
                        </p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                          {(message.attachment.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <a
                        href={message.attachment.url}
                        download={message.attachment.name}
                        className={`p-2 rounded-lg transition-colors ${theme === 'dark'
                          ? 'hover:bg-gray-700/50 text-gray-400 hover:text-red-400'
                          : 'hover:bg-gray-100 text-gray-500 hover:text-red-600'
                          }`}
                      >
                        <FiDownload className="text-lg" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {!isUser && (
              <button
                onClick={() => copyToClipboard(message.content, index)}
                className={`absolute top-2 right-2 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 ${theme === 'dark'
                  ? 'hover:bg-red-500/20 text-gray-400 hover:text-red-400'
                  : 'hover:bg-red-100 text-gray-500 hover:text-red-600'
                  }`}
              >
                {copied === index ? (
                  <div className="flex items-center gap-1 text-xs">
                    <FiCheck className="text-sm" />
                    <span>{t('ai.chat.copied')}</span>
                  </div>
                ) : (
                  <FiCopy className="text-sm" />
                )}
              </button>
            )}
          </div>

          <div className={`flex items-center gap-2 text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`}>
            <span>{isUser ? t('ai.chat.you') : t('ai.chat.aiAssistant')}</span>
            <span>•</span>
            <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {isUser && (
          <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center ${theme === 'dark'
            ? 'bg-gradient-to-br from-red-500/20 to-red-800/20 border border-red-500/30'
            : 'bg-gradient-to-br from-red-100 to-red-200 border border-red-200'
            }`}>
            <RiUser3Line className={`text-xl ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen mt-20 flex ${theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-[#1a1f35] to-[#17153a]'
        : 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200'
        }`}
    >
      <div className={`${showSidebar ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden flex-shrink-0`}>
        <div className={`h-full p-4 ${theme === 'dark'
          ? 'bg-[#1e2338]/50 border-r border-gray-800'
          : 'bg-white/90 border-r border-gray-200'
          }`}>
          <div className="flex items-center justify-between mb-6">
            <div className={`flex items-center gap-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
              <div className={`p-2 rounded-xl ${theme === 'dark'
                ? 'bg-gradient-to-r from-red-500/20 to-red-800/20 border border-red-500/30'
                : 'bg-gradient-to-r from-red-100 to-red-200 border border-red-200'
                }`}>
                <RiRobot2Line className="w-6 h-6 text-red-500" />
              </div>
              <h1 className={`text-xl font-bold ${theme === 'dark'
                ? 'bg-gradient-to-r from-red-400 to-red-600 text-transparent bg-clip-text'
                : 'bg-gradient-to-r from-red-600 to-red-800 text-transparent bg-clip-text'
                }`}>
                Al-Mentor
              </h1>
            </div>
            <button
              onClick={() => setShowSidebar(false)}
              className={`p-2 rounded-lg ${theme === 'dark'
                ? 'hover:bg-gray-700 text-gray-400'
                : 'hover:bg-gray-100 text-gray-600'
                }`}
            >
              <FiX className="text-lg" />
            </button>
          </div>

          <button
            onClick={createNewChat}
            className={`w-full flex items-center gap-3 p-3 rounded-xl mb-4 transition-all duration-200 ${theme === 'dark'
              ? 'bg-gradient-to-r from-red-600 to-red-800 text-white hover:from-red-700 hover:to-red-900'
              : 'bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800'
              }`}
          >
            <FiPlus className="text-lg" />
            <span className="font-medium">{t('ai.chat.newChat')}</span>
          </button>

          <div className="space-y-2">
            <h3 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
              {t('ai.chat.recentChats')}
            </h3>
            <div className="space-y-1 max-h-[60vh] overflow-y-auto">
              {chatHistory.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => loadChat(chat._id)}
                  className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${currentChatId === chat._id
                    ? theme === 'dark'
                      ? 'bg-red-600/20 border border-red-500/30'
                      : 'bg-red-100 border border-red-200'
                    : theme === 'dark'
                      ? 'hover:bg-gray-700/50'
                      : 'hover:bg-gray-100'
                    }`}
                >
                  <FiMessageSquare className={`text-lg flex-shrink-0 ${currentChatId === chat._id
                    ? theme === 'dark' ? 'text-red-400' : 'text-red-600'
                    : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} />

                  <div className="flex-1 min-w-0">
                    {editingChatId === chat._id ? (
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={() => saveTitle(chat._id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveTitle(chat._id);
                          if (e.key === 'Escape') {
                            setEditingChatId(null);
                            setEditingTitle('');
                          }
                        }}
                        className={`w-full bg-transparent border-b text-sm ${theme === 'dark'
                          ? 'text-gray-200 border-gray-600'
                          : 'text-gray-700 border-gray-300'
                          }`}
                        autoFocus
                      />
                    ) : (
                      <p className={`text-sm truncate ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                        {chat.title || `${t('ai.chat.chat')} ${new Date(chat.createdAt).toLocaleDateString()}`}
                      </p>
                    )}
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      {new Date(chat.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => startEditingTitle(chat, e)}
                      className={`p-1.5 rounded transition-colors ${theme === 'dark'
                        ? 'hover:bg-gray-600 text-gray-400'
                        : 'hover:bg-gray-200 text-gray-500'
                        }`}
                    >
                      <FiEdit3 className="text-sm" />
                    </button>
                    <button
                      onClick={(e) => deleteChat(chat._id, e)}
                      className={`p-1.5 rounded transition-colors ${theme === 'dark'
                        ? 'hover:bg-red-600/20 text-gray-400 hover:text-red-400'
                        : 'hover:bg-red-100 text-gray-500 hover:text-red-600'
                        }`}
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {!showSidebar && (
          <button
            onClick={() => setShowSidebar(true)}
            className={`absolute top-4 left-4 z-10 p-3 rounded-xl ${theme === 'dark'
              ? 'bg-[#1e2338]/80 hover:bg-[#2a2f42] border border-gray-700'
              : 'bg-white/80 hover:bg-gray-50 border border-gray-200'
              }`}
          >
            <FiMessageSquare className={`text-lg ${theme === 'dark' ? 'text-red-400' : 'text-red-600'
              }`} />
          </button>
        )}

        <div className="flex-1 p-4">
          <div className={`h-full max-w-4xl mx-auto rounded-2xl shadow-2xl overflow-hidden border ${theme === 'dark'
            ? 'bg-[#1e2338]/50 border-gray-800 shadow-black/30 backdrop-blur-xl'
            : 'bg-white/90 border-gray-200 shadow-gray-200/30 backdrop-blur-xl'
            }`}>
            <div
              ref={chatContainerRef}
              className={`h-[calc(100%-70px)] overflow-y-auto p-5 space-y-6 scroll-smooth
                scrollbar-thin ${theme === 'dark'
                  ? 'scrollbar-thumb-red-600/40 scrollbar-track-transparent hover:scrollbar-thumb-red-500/50'
                  : 'scrollbar-thumb-red-300 scrollbar-track-transparent hover:scrollbar-thumb-red-400'
                }
                scrollbar-thumb-rounded-full scrollbar-track-rounded-full`}
            >
              {messages.length === 0 && (
                <div className={`text-center py-16 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <div className={`p-6 rounded-2xl mx-auto w-24 h-24 flex items-center justify-center mb-6 ${theme === 'dark'
                    ? 'bg-gradient-to-br from-red-500/20 to-red-800/20 border border-red-500/30'
                    : 'bg-gradient-to-br from-red-100 to-red-200 border border-red-200'
                    }`}>
                    <RiRobot2Line className={`text-5xl ${theme === 'dark' ? 'text-red-400' : 'text-red-600'
                      }`} />
                  </div>
                  <p className="text-xl font-medium mb-3">{t('ai.chat.welcome')}</p>
                  <p className={`max-w-md mx-auto ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    {t('ai.chat.welcomeDesc')}
                  </p>
                </div>
              )}

              {messages.map((message, index) => renderMessage(message, index))}

              {isLoading && (
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${theme === 'dark'
                    ? 'bg-gradient-to-br from-red-800/20 to-red-900/20 border border-red-700/30'
                    : 'bg-gradient-to-br from-red-100 to-red-200 border border-red-200'
                    }`}>
                    <RiRobot2Line className={`text-xl ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
                  </div>
                  <div className={`p-6 rounded-2xl ${theme === 'dark'
                    ? 'bg-[#1e2338]/60 border border-gray-700'
                    : 'bg-white border border-gray-200'
                    }`}>
                    <div className="flex gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-bounce"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={`h-[70px] p-3 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={t('ai.chat.placeholder')}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${theme === 'dark'
                      ? 'bg-[#1e2338]/80 text-white placeholder-gray-400 focus:ring-red-500/50 border border-gray-700 focus:border-red-500/50'
                      : 'bg-gray-50 text-gray-900 placeholder-gray-500 focus:ring-red-500/30 border border-gray-200 focus:border-red-400'
                      }`}
                  />

                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                    <button
                      type="button"
                      onClick={() => setShowAttachMenu(!showAttachMenu)}
                      className={`p-2 rounded-lg transition-all duration-200 ${theme === 'dark'
                        ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/20'
                        : 'text-gray-500 hover:text-red-600 hover:bg-red-100'
                        }`}
                    >
                      <FiPaperclip className="text-lg" />
                    </button>

                    {showAttachMenu && (
                      <div className={`absolute bottom-full left-0 mb-2 p-2 rounded-lg shadow-lg ${theme === 'dark'
                        ? 'bg-[#2a2f42] border border-gray-700'
                        : 'bg-white border border-gray-200'
                        }`}>
                        <button
                          type="button"
                          onClick={() => {
                            fileInputRef.current.accept = 'image/*';
                            fileInputRef.current.click();
                          }}
                          className={`flex items-center gap-2 px-3 py-2 rounded-md w-full ${theme === 'dark'
                            ? 'hover:bg-red-500/20 text-gray-300'
                            : 'hover:bg-red-50 text-gray-700'
                            }`}
                        >
                          <FiImage className="text-lg" />
                          <span>{t('ai.chat.image')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            fileInputRef.current.accept = '.pdf,.doc,.docx,.txt';
                            fileInputRef.current.click();
                          }}
                          className={`flex items-center gap-2 px-3 py-2 rounded-md w-full ${theme === 'dark'
                            ? 'hover:bg-red-500/20 text-gray-300'
                            : 'hover:bg-red-50 text-gray-700'
                            }`}
                        >
                          <FiFile className="text-lg" />
                          <span>{t('ai.chat.document')}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {selectedFile && (
                    <div className={`absolute left-12 top-1/2 transform -translate-y-1/2 flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      {selectedFile.type.startsWith('image/') ? <FiImage className="text-sm" /> : <FiFile className="text-sm" />}
                      <span className="text-xs truncate max-w-[100px]">{selectedFile.name}</span>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isLoading || (!userInput.trim() && !selectedFile)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isLoading || (!userInput.trim() && !selectedFile)
                    ? theme === 'dark' ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'
                    : theme === 'dark'
                      ? 'bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800'
                      : 'bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800'
                    }`}
                >
                  <span>{t('ai.chat.send')}</span>
                  <FiSend className="text-base" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatHomepage;