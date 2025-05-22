import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { FiSend, FiCopy, FiCheck, FiPaperclip, FiImage, FiFile, FiDownload } from 'react-icons/fi';
import { RiRobot2Line, RiUser3Line } from 'react-icons/ri';
import { IoSend } from 'react-icons/io5';

const AIChatPage = () => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const isRTL = i18n.language === 'ar';
  
  useEffect(() => {
    if (messages.length > 0) {
      chatContainerRef.current?.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Convert file to base64 for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile({
          file,
          preview: reader.result,
          type: file.type,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
      setShowAttachMenu(false);
    }
  };

  const handleAttachClick = () => {
    setShowAttachMenu(!showAttachMenu);
  };

  const handleImageClick = () => {
    fileInputRef.current.accept = 'image/*';
    fileInputRef.current.click();
  };

  const handleDocumentClick = () => {
    fileInputRef.current.accept = '.pdf,.doc,.docx,.txt';
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim() && !selectedFile) return;

    let newMessage = { 
      role: 'user', 
      content: userInput,
      timestamp: new Date().toISOString()
    };
    
    // If there's a file, add it to the message
    if (selectedFile) {
      newMessage.attachment = {
        name: selectedFile.name,
        type: selectedFile.type,
        url: selectedFile.preview, // Using the base64 preview as the URL
        preview: selectedFile.preview
      };
    }

    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);
    setSelectedFile(null);

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
          "messages": [...messages, newMessage]
        })
      });

      const data = await response.json();
      if (data.choices && data.choices[0]?.message) {
        setMessages(prev => [...prev, data.choices[0].message]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, there was an error processing your request.' }]);
    }

    setIsLoading(false);
    setUserInput('');
  };
  
  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  const renderMessage = (message, index) => {
    const isUser = message.role === 'user';
    
    return (
      <div
        key={index}
        className={`flex items-start gap-4 ${isUser ? (isRTL ? 'flex-row-reverse' : 'justify-end') : ''}`}
      >
        {!isUser && (
          <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center ${
            theme === 'dark'
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
              {/* Message Content */}
              {message.content && (
                <p className={`whitespace-pre-wrap leading-relaxed text-sm mb-2 ${
                  isUser 
                    ? 'text-white' 
                    : theme === 'dark' ? 'text-gray-100' : 'text-gray-700'
                }`}>
                  {message.content}
                </p>
              )}

              {/* Attachment Display */}
              {message.attachment && (
                <div className="mt-2">
                  {message.attachment.type.startsWith('image/') ? (
                    // Image attachment
                    <div className="relative group">
                      <img 
                        src={message.attachment.preview || message.attachment.url} 
                        alt={message.attachment.name}
                        className="max-w-full rounded-lg max-h-[300px] object-contain"
                      />
                      <a
                        href={message.attachment.url}
                        download={message.attachment.name}
                        className={`absolute top-2 right-2 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                          theme === 'dark' 
                            ? 'bg-gray-800/80 hover:bg-gray-700/80 text-white' 
                            : 'bg-white/80 hover:bg-gray-100/80 text-gray-700'
                        }`}
                      >
                        <FiDownload className="text-lg" />
                      </a>
                    </div>
                  ) : (
                    // Document attachment
                    <div className={`flex items-center gap-3 p-3 rounded-lg ${
                      theme === 'dark' 
                        ? 'bg-gray-800/50 border border-gray-700' 
                        : 'bg-gray-50 border border-gray-200'
                    }`}>
                      <FiFile className={`text-xl ${
                        theme === 'dark' ? 'text-red-400' : 'text-red-600'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          {message.attachment.name}
                        </p>
                        <p className={`text-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {(message.attachment.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <a
                        href={message.attachment.url}
                        download={message.attachment.name}
                        className={`p-2 rounded-lg transition-colors ${
                          theme === 'dark'
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
                className={`absolute top-2 right-2 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 ${
                  theme === 'dark' 
                    ? 'hover:bg-red-500/20 text-gray-400 hover:text-red-400' 
                    : 'hover:bg-red-100 text-gray-500 hover:text-red-600'
                }`}
              >
                {copied === index ? (
                  <div className="flex items-center gap-1 text-xs">
                    <FiCheck className="text-sm" />
                    <span>Copied!</span>
                  </div>
                ) : (
                  <FiCopy className="text-sm" />
                )}
              </button>
            )}
          </div>
          
          <div className={`flex items-center gap-2 text-xs mt-1 ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            <span>{isUser ? 'You' : 'AI Assistant'}</span>
            <span>•</span>
            <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        
        {isUser && (
          <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center ${
            theme === 'dark'
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
      className={`min-h-screen pt-30 flex flex-col items-center ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 via-[#1a1f35] to-[#17153a]' 
          : 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Website Title */}
      <div className="w-full max-w-4xl mx-4 mb-4">
        <div className={`flex items-center gap-3 ${
          theme === 'dark' 
            ? 'text-white' 
            : 'text-gray-900'
        }`}>
          <div className={`p-2 rounded-xl ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-red-500/20 to-red-800/20 border border-red-500/30'
              : 'bg-gradient-to-r from-red-100 to-red-200 border border-red-200'
          }`}>
            <img 
              src="public\logo.jpeg" 
              alt="Al-Mentor" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <h1 className={`text-2xl font-bold ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-red-400 to-red-600 text-transparent bg-clip-text'
              : 'bg-gradient-to-r from-red-600 to-red-800 text-transparent bg-clip-text'
          }`}>
            Al-Mentor
          </h1>
        </div>
      </div>

      {/* Chat Container */}
      <div className="w-full max-w-4xl h-[70vh] mx-4">
        <div className={`h-full rounded-2xl shadow-2xl overflow-hidden border ${
          theme === 'dark' 
            ? 'bg-[#1e2338]/50 border-gray-800 shadow-black/30 backdrop-blur-xl' 
            : 'bg-white/90 border-gray-200 shadow-gray-200/30 backdrop-blur-xl'
        }`}>
          {/* Messages */}
          <div 
            ref={chatContainerRef}
            className={`h-[calc(100%-70px)] overflow-y-auto p-5 space-y-6 scroll-smooth
              scrollbar-thin ${
                theme === 'dark'
                  ? 'scrollbar-thumb-red-600/40 scrollbar-track-transparent hover:scrollbar-thumb-red-500/50'
                  : 'scrollbar-thumb-red-300 scrollbar-track-transparent hover:scrollbar-thumb-red-400'
              }
              scrollbar-thumb-rounded-full scrollbar-track-rounded-full`}
          >
            {messages.length === 0 && (
              <div className={`text-center py-16 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className={`p-6 rounded-2xl mx-auto w-24 h-24 flex items-center justify-center mb-6 ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-br from-red-500/20 to-red-800/20 border border-red-500/30' 
                    : 'bg-gradient-to-br from-red-100 to-red-200 border border-red-200'
                }`}>
                  <RiRobot2Line className={`text-5xl ${
                    theme === 'dark' ? 'text-red-400' : 'text-red-600'
                  }`} />
                </div>
                <p className="text-xl font-medium mb-3">{t('ai.chat.welcome', 'Welcome! How can I assist you today?')}</p>
                <p className={`max-w-md mx-auto ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  Ask me anything - from quick questions to complex problems, I'm here to help.
                </p>
              </div>
            )}
            
            {messages.map((message, index) => renderMessage(message, index))}
            
            {isLoading && (
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-red-800/20 to-red-900/20 border border-red-700/30'
                    : 'bg-gradient-to-br from-red-100 to-red-200 border border-red-200'
                }`}>
                  <RiRobot2Line className={`text-xl ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
                </div>
                <div className={`p-6 rounded-2xl ${
                  theme === 'dark' 
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

          {/* Input Form */}
          <div className={`h-[70px] p-3 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={t('ai.chat.placeholder', 'Type your message...')}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
                    theme === 'dark'
                      ? 'bg-[#1e2338]/80 text-white placeholder-gray-400 focus:ring-red-500/50 border border-gray-700 focus:border-red-500/50'
                      : 'bg-gray-50 text-gray-900 placeholder-gray-500 focus:ring-red-500/30 border border-gray-200 focus:border-red-400'
                  }`}
                />
                
                {/* Attachment Button */}
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                  <button
                    type="button"
                    onClick={handleAttachClick}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      theme === 'dark'
                        ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/20'
                        : 'text-gray-500 hover:text-red-600 hover:bg-red-100'
                    }`}
                  >
                    <FiPaperclip className="text-lg" />
                  </button>

                  {/* Attachment Menu */}
                  {showAttachMenu && (
                    <div className={`absolute bottom-full left-0 mb-2 p-2 rounded-lg shadow-lg ${
                      theme === 'dark'
                        ? 'bg-[#2a2f42] border border-gray-700'
                        : 'bg-white border border-gray-200'
                    }`}>
                      <button
                        type="button"
                        onClick={handleImageClick}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md w-full ${
                          theme === 'dark'
                            ? 'hover:bg-red-500/20 text-gray-300'
                            : 'hover:bg-red-50 text-gray-700'
                        }`}
                      >
                        <FiImage className="text-lg" />
                        <span>Image</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDocumentClick}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md w-full ${
                          theme === 'dark'
                            ? 'hover:bg-red-500/20 text-gray-300'
                            : 'hover:bg-red-50 text-gray-700'
                        }`}
                      >
                        <FiFile className="text-lg" />
                        <span>Document</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* File Input (hidden) */}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Selected File Indicator */}
                {selectedFile && (
                  <div className={`absolute left-12 top-1/2 transform -translate-y-1/2 flex items-center gap-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {selectedFile.type.startsWith('image/') ? <FiImage className="text-sm" /> : <FiFile className="text-sm" />}
                    <span className="text-xs truncate max-w-[100px]">{selectedFile.name}</span>
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading || (!userInput.trim() && !selectedFile)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isLoading || (!userInput.trim() && !selectedFile)
                    ? theme === 'dark' ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'
                    : theme === 'dark' 
                      ? 'bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800' 
                      : 'bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800'
                }`}
              >
                <span>{t('ai.chat.send', 'Send')}</span>
                <FiSend className={`text-base ${isRTL ? 'transform rotate-180' : ''}`} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatPage;