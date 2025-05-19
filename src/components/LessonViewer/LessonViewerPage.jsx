import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { ChevronRight, ChevronDown, ChevronLeft, Star, Clock, FileText, 
         Bell, X, PlayCircle, Volume2, Maximize, Settings, Book, 
         BookOpen, Menu, Bookmark, Video, Share, Download, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Course Context
const CourseContext = createContext();

// Main component
export default function EnhancedLessonViewer() {
  const { courseId } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [activeTab, setActiveTab] = useState('Course Viewer');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [activeNote, setActiveNote] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [favoriteLessons, setFavoriteLessons] = useState(() => {
    const stored = localStorage.getItem('favoriteLessons');
    return stored ? JSON.parse(stored) : [];
  });
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem(`course_${courseId}_notes`);
    return savedNotes ? JSON.parse(savedNotes) : [];
  });
  
  // Fetch course data
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/courses/${courseId}`);
        console.log('Fetched course data:', response.data);
        setCourseData(response.data);
        
        // Set first lesson as current if none selected
        if (response.data.lessons && response.data.lessons.length > 0) {
          setCurrentLesson({ 
            lessonId: response.data.lessons[0]._id, 
            title: response.data.lessons[0].title 
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load course data');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);
  
  // Fetch lessons for the course
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLessonsLoading(true);
        const response = await axios.get(`/api/lessons/course/${courseId}`);
        console.log('Fetched lessons:', response.data);
        setLessons(response.data);
      } catch (err) {
        console.error('Failed to load lessons:', err);
      } finally {
        setLessonsLoading(false);
      }
    };

    if (courseId) {
      fetchLessons();
    }
  }, [courseId]);
  
  // Persist favoriteLessons to localStorage
  useEffect(() => {
    localStorage.setItem('favoriteLessons', JSON.stringify(favoriteLessons));
  }, [favoriteLessons]);
  
  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`course_${courseId}_notes`, JSON.stringify(notes));
  }, [notes, courseId]);
  
  // Toast message helper
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };
  
  // Favorite lessons toggle
  const toggleFavoriteLesson = (lessonId) => {
    setFavoriteLessons(prev =>
      prev.includes(lessonId)
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    );
    showToast(favoriteLessons.includes(lessonId) ? "Removed from favorites" : "Added to favorites");
  };
  
  // Save note
  const saveNote = () => {
    if (!newNote.trim() || !currentLesson?.lessonId) return;
    
    const note = {
      id: Date.now(),
      lessonId: currentLesson.lessonId,
      content: newNote.trim(),
      timestamp: new Date().toISOString(),
      lessonTitle: getLocalizedText(currentLessonData?.title)
    };

    setNotes(prev => [note, ...prev]);
    setNewNote('');
    showToast('Note saved successfully');
  };

  // Delete note
  const deleteNote = (noteId) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    showToast('Note deleted successfully');
  };

  // Edit note
  const editNote = (note) => {
    setActiveNote(note);
    setNewNote(note.content);
  };

  // Update note
  const updateNote = () => {
    if (!newNote.trim() || !activeNote) return;

    setNotes(prev => prev.map(note => 
      note.id === activeNote.id 
        ? { ...note, content: newNote.trim(), timestamp: new Date().toISOString() }
        : note
    ));

    setNewNote('');
    setActiveNote(null);
    showToast('Note updated successfully');
  };

  // Cancel editing
  const cancelEdit = () => {
    setNewNote('');
    setActiveNote(null);
  };

  // Get current lesson notes
  const currentLessonNotes = useMemo(() => {
    if (!currentLesson?.lessonId) return [];
    return notes.filter(note => note.lessonId === currentLesson.lessonId);
  }, [notes, currentLesson]);
  
  // Mark announcement as read
  const markAnnouncementAsRead = async (announcementId) => {
    try {
      await axios.patch(`/api/courses/${courseId}/announcements/${announcementId}/read`);
      
      setCourseData(prev => ({
        ...prev,
        announcements: prev.announcements.map(a =>
          a._id === announcementId ? { ...a, read: true } : a
        )
      }));
      
      showToast('Marked as read');
    } catch (err) {
      showToast('Failed to mark announcement as read');
    }
  };
  
  // Helper for localization
  const getLocalizedText = (obj) => {
    console.log('Localizing text:', obj);
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    if (obj && typeof obj === 'object') {
      if (obj.en || obj.ar) {
        return obj[currentLang] || obj.en || obj.ar || '';
      }
      return obj[currentLang] || obj.en || '';
    }
    return '';
  };
  
  // Set first lesson as current if none selected
  useEffect(() => {
    if (!currentLesson && lessons && lessons.length > 0) {
      setCurrentLesson({ lessonId: lessons[0]._id, title: getLocalizedText(lessons[0].title) });
    }
  }, [lessons, currentLesson]);
  
  // Navigation functions
  const goToNextLesson = () => {
    if (!currentLesson || !lessons) return;
    const idx = lessons.findIndex(l => l._id === currentLesson.lessonId);
    if (idx >= 0 && idx < lessons.length - 1) {
      const next = lessons[idx + 1];
      setCurrentLesson({ lessonId: next._id, title: getLocalizedText(next.title) });
      showToast(`Now viewing: ${getLocalizedText(next.title)}`);
    }
  };
  
  const goToPreviousLesson = () => {
    if (!currentLesson || !lessons) return;
    const idx = lessons.findIndex(l => l._id === currentLesson.lessonId);
    if (idx > 0) {
      const prev = lessons[idx - 1];
      setCurrentLesson({ lessonId: prev._id, title: getLocalizedText(prev.title) });
      showToast(`Now viewing: ${getLocalizedText(prev.title)}`);
    }
  };
  
  // Toggle play state
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Current lesson data
  const currentLessonData = useMemo(() => {
    if (!currentLesson?.lessonId || !lessons) return null;
    return lessons.find(l => l._id === currentLesson.lessonId) || null;
  }, [lessons, currentLesson]);
  
  // Context value
  const contextValue = {
    courseData,
    currentLesson,
    setCurrentLesson,
    favoriteLessons,
    toggleFavoriteLesson,
    currentLessonNotes,
    saveNote,
    activeNote,
    setActiveNote,
    newNote,
    setNewNote,
    markAnnouncementAsRead,
    goToNextLesson,
    goToPreviousLesson,
    isPlaying,
    togglePlay
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#181818] text-white flex items-center justify-center mt-10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mt-10"></div>
          <p className="mt-4">Loading course data...</p>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#181818] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
            <p>Error loading course: {error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-black-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render empty state
  if (!courseData) {
    return (
      <div className="min-h-screen bg-[#181818] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl">No course data available</p>
        </div>
      </div>
    );
  }

  return (
    <CourseContext.Provider value={contextValue}>
      <div className="min-h-screen bg-[#181818] text-white flex flex-col mt-10">
        {/* Header */}
        <header className="bg-[#181818] border-b border-[#222] p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-bold">
              {typeof courseData.title === 'object' ? courseData.title.en : courseData.title}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-400 hover:text-white transition-colors">
              <Share size={20} />
            </button>
          </div>
        </header>
        
        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          {sidebarOpen && (
            <div className="w-80 bg-[#232323] border-r border-[#222] flex flex-col overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-700">
                <button 
                  className={`flex-1 p-4 text-sm font-medium ${activeTab === 'Course Viewer' ? 'text-[#ff3a30] border-b-2 border-[#ff3a30]' : 'text-gray-400'}`}
                  onClick={() => setActiveTab('Course Viewer')}
                >
                  <BookOpen size={16} className="inline-block mr-2" />
                  Course
                </button>
                <button 
                  className={`flex-1 p-4 text-sm font-medium ${activeTab === 'Starred' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400'}`}
                  onClick={() => setActiveTab('Starred')}
                >
                  <Star size={16} className="inline-block mr-2" />
                  Starred
                </button>
                <button 
                  className={`flex-1 p-4 text-sm font-medium ${activeTab === 'Notes' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
                  onClick={() => setActiveTab('Notes')}
                >
                  <FileText size={16} className="inline-block mr-2" />
                  Notes
                </button>
              </div>
              
              {/* Lessons List */}
              <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'Course Viewer' && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="font-bold">Lessons</h2>
                      <span className="text-xs text-gray-400">
                        {lessons.filter(l => l.progress === 100).length}/{lessons.length} complete
                      </span>
                    </div>
                    
                    {lessonsLoading ? (
                      <div>Loading lessons...</div>
                    ) : lessons.length === 0 ? (
                      <div>No lessons available</div>
                    ) : (
                      lessons.map(lesson => (
                        <div 
                          key={lesson._id}
                          className={`p-3 rounded-lg ${currentLesson?.lessonId === lesson._id ? 'bg-blue-500 bg-opacity-20 border border-blue-500' : 'hover:bg-gray-700 border border-transparent'} cursor-pointer transition-colors`}
                          onClick={() => setCurrentLesson({ 
                            lessonId: lesson._id, 
                            title: getLocalizedText(lesson.title) 
                          })}
                        >
                          <div className="flex justify-between mb-1">
                            <h3 className="font-medium flex-1 truncate">{getLocalizedText(lesson.title)}</h3>
                            <button
                              onClick={e => { e.stopPropagation(); toggleFavoriteLesson(lesson._id); }}
                              className="text-gray-400 hover:text-yellow-400 transition-colors"
                            >
                              <Star size={16} className={favoriteLessons.includes(lesson._id) ? 'text-yellow-400 fill-yellow-400' : ''} />
                            </button>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400">{lesson.duration}</span>
                            <span className="text-xs text-gray-400">{lesson.progress}% complete</span>
                          </div>
                          <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#00bcd4] rounded-full" 
                              style={{ width: `${lesson.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
                
                {activeTab === 'Starred' && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="font-bold">Starred Lessons</h2>
                      <span className="text-xs text-gray-400">
                        {favoriteLessons.length} starred
                      </span>
                    </div>
                    {lessons.filter(lesson => favoriteLessons.includes(lesson._id)).length > 0 ? (
                      lessons.filter(lesson => favoriteLessons.includes(lesson._id)).map(lesson => (
                        <div 
                          key={lesson._id}
                          className={`p-3 rounded-lg ${currentLesson?.lessonId === lesson._id ? 'bg-blue-500 bg-opacity-20 border border-blue-500' : 'hover:bg-gray-700 border border-transparent'} cursor-pointer transition-colors`}
                          onClick={() => setCurrentLesson({ 
                            lessonId: lesson._id, 
                            title: getLocalizedText(lesson.title) 
                          })}
                        >
                          <div className="flex justify-between mb-1">
                            <h3 className="font-medium flex-1 truncate">{getLocalizedText(lesson.title)}</h3>
                            <button
                              onClick={e => { e.stopPropagation(); toggleFavoriteLesson(lesson._id); }}
                              className="text-gray-400 hover:text-yellow-400 transition-colors"
                            >
                              <Star size={16} className={favoriteLessons.includes(lesson._id) ? 'text-yellow-400 fill-yellow-400' : ''} />
                            </button>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400">{lesson.duration}</span>
                            <span className="text-xs text-gray-400">{lesson.progress}% complete</span>
                          </div>
                          <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#00bcd4] rounded-full" 
                              style={{ width: `${lesson.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-400 py-8">No starred lessons yet.</div>
                    )}
                  </div>
                )}
                
                {activeTab === 'Notes' && (
                  <div>
                    <h2 className="font-bold mb-4">My Notes</h2>
                    <div className="mb-4">
                      <textarea
                        value={newNote}
                        onChange={e => setNewNote(e.target.value)}
                        placeholder={activeNote ? "Edit your note..." : "Write a new note..."}
                        className="w-full p-3 rounded-lg bg-gray-700 text-white mb-3 resize-none border border-gray-600 focus:border-blue-500 focus:outline-none"
                        rows={4}
                      ></textarea>
                      <div className="flex gap-2">
                        {activeNote ? (
                          <>
                            <button 
                              onClick={updateNote}
                              className="px-4 py-2 bg-[#ff3a30] rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Update Note
                            </button>
                            <button 
                              onClick={cancelEdit}
                              className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={saveNote}
                            className="px-4 py-2 bg-[#ff3a30] rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Save Note
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-6 space-y-3">
                      {currentLessonNotes.length > 0 ? (
                        currentLessonNotes.map(note => (
                          <div key={note.id} className="p-3 bg-gray-700 rounded-lg">
                            <p className="text-sm mb-2">{note.content}</p>
                            <div className="flex justify-between items-center text-xs text-gray-400">
                              <span>{new Date(note.timestamp).toLocaleDateString()}</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => editNote(note)}
                                  className="text-blue-400 hover:text-blue-300"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => deleteNote(note.id)}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-400 py-8">
                          No notes for this lesson yet. Add your first note above!
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            {currentLessonData && (
              <div className="p-6 max-w-4xl mx-auto">
                {/* Lesson Header */}
                <div className="mb-6">
                  <h1 className="text-3xl font-bold mb-2">{getLocalizedText(currentLessonData.title)}</h1>
                  <div className="flex items-center text-gray-400 text-sm">
                    <Clock size={14} className="mr-1" />
                    <span className="mr-4">{currentLessonData.duration}</span>
                    
                    <button 
                      onClick={() => toggleFavoriteLesson(currentLessonData._id)}
                      className="flex items-center hover:text-yellow-400 transition-colors"
                    >
                      <Star size={14} className={`mr-1 ${favoriteLessons.includes(currentLessonData._id) ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                      <span>{favoriteLessons.includes(currentLessonData._id) ? 'Favorited' : 'Add to favorites'}</span>
                    </button>
                  </div>
                </div>
                
                {/* Video Player */}
                <div className="aspect-video bg-gray-800 rounded-lg mb-8 relative overflow-hidden flex items-center justify-center group">
                  {currentLessonData?.content?.videoUrl ? (
                    currentLessonData.content.videoUrl.includes('youtube.com') || currentLessonData.content.videoUrl.includes('youtu.be') ? (
                      <iframe
                        className="w-full h-full"
                        src={currentLessonData.content.videoUrl.replace('watch?v=', 'embed/')}
                        title={getLocalizedText(currentLessonData.title)}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <video 
                        className="w-full h-full object-cover"
                        controls
                        src={currentLessonData.content.videoUrl}
                      >
                        Your browser does not support the video tag.
                      </video>
                    )
                  ) : (
                    <img src="/api/placeholder/800/450" alt="Video placeholder" className="w-full h-full object-cover" />
                  )}
                  
                  {/* Video Controls - Only show if no video URL */}
                  {!currentLessonData?.content?.videoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button 
                        onClick={togglePlay}
                        className="bg-[#ff3a30] hover:bg-blue-700 text-white rounded-full p-4 transform transition-transform group-hover:scale-110"
                      >
                        <PlayCircle size={36} />
                      </button>
                    </div>
                  )}
                  
                  {/* Progress Bar - Only show if no video URL */}
                  {!currentLessonData?.content?.videoUrl && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="relative h-1 bg-gray-700 rounded-full">
                        <div className="absolute h-full bg-[#00bcd4] rounded-full" style={{ width: `${currentLessonData.progress}%` }}></div>
                        <div className="absolute h-3 w-3 bg-white rounded-full -top-1" style={{ left: `${currentLessonData.progress}%` }}></div>
                      </div>
                      <div className="flex justify-between mt-2 text-xs">
                        <span>00:00</span>
                        <div className="flex space-x-4">
                          <button className="text-white hover:text-blue-400">
                            <Volume2 size={16} />
                          </button>
                          <button className="text-white hover:text-blue-400">
                            <Maximize size={16} />
                          </button>
                        </div>
                        <span>{currentLessonData.duration}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between mb-8">
                  <button 
                    onClick={goToPreviousLesson}
                    className={`px-6 py-3 rounded-lg flex items-center ${currentLessonData && currentLessonData._id === lessons[0]?._id ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                    disabled={currentLessonData && currentLessonData._id === lessons[0]?._id}
                  >
                    <ChevronLeft size={20} className="mr-2" />
                    Previous Lesson
                  </button>
                  
                  <button 
                    onClick={goToNextLesson}
                    className={`px-6 py-3 rounded-lg flex items-center ${currentLessonData && currentLessonData._id === lessons[lessons.length - 1]?._id ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                    disabled={currentLessonData && currentLessonData._id === lessons[lessons.length - 1]?._id}
                  >
                    Next Lesson
                    <ChevronRight size={20} className="ml-2" />
                  </button>
                </div>
                
                {/* Lesson Description */}
                <div className="prose prose-invert max-w-none mb-8">
                  <h2 className="text-2xl font-bold mb-4">Description</h2>
                  <p className="text-gray-300">{getLocalizedText(currentLessonData.description)}</p>
                  
                  {/* Sample content - would be dynamic in real app */}
                  <p className="text-gray-300 mt-4">
                    The World Wide Web is a system of interconnected documents and resources that can be accessed via the internet. It was invented by Tim Berners-Lee in 1989 while working at CERN. The web has revolutionized how we access information, communicate, and conduct business.
                  </p>
                  
                  <h3 className="text-xl font-bold mt-6 mb-3">Key Components</h3>
                  <ul className="list-disc pl-5 text-gray-300 space-y-2">
                    <li>Web browsers - Applications that retrieve and display web content</li>
                    <li>Web servers - Computers that host websites and respond to requests</li>
                    <li>HTTP - The protocol used for communication between browsers and servers</li>
                    <li>HTML - The markup language used to structure web pages</li>
                    <li>URLs - Addresses used to locate resources on the web</li>
                  </ul>
                </div>
                
                {/* Resources */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">Resources</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a href="#" className="flex items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                      <div className="bg-blue-500 p-3 rounded-lg mr-4">
                        <FileText size={24} />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Web Fundamentals Cheat Sheet</h3>
                        <p className="text-xs text-gray-400">PDF, 2.3 MB</p>
                      </div>
                    </a>
                    <a href="#" className="flex items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                      <div className="bg-green-500 p-3 rounded-lg mr-4">
                        <ExternalLink size={24} />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Interactive HTTP Demo</h3>
                        <p className="text-xs text-gray-400">External Website</p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg shadow-lg animate-fade-in flex items-center">
          {toastMessage}
          <button 
            onClick={() => setToastMessage(null)} 
            className="ml-4 text-gray-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </CourseContext.Provider>
  );
}