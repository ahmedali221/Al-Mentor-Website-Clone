import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { ChevronRight, ChevronDown, ChevronLeft, Star, Clock, FileText, 
         Bell, X, PlayCircle, Volume2, Maximize, Settings, Book, 
         BookOpen, Menu, Bookmark, Video, Share, Download, ExternalLink,
         Award, Lock } from 'lucide-react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

// Course Context
const CourseContext = createContext();

// Add new subscription status types
const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  NONE: 'none'
};

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
  const { i18n, t } = useTranslation();
  const { theme } = useTheme();
  const currentLang = i18n.language;
  const isRTL = currentLang === 'ar';
  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [watchedLessons, setWatchedLessons] = useState(() => {
    const stored = localStorage.getItem(`course_${courseId}_watched`);
    return stored ? JSON.parse(stored) : [];
  });
  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem(`course_${courseId}_notes`);
    return savedNotes ? JSON.parse(savedNotes) : [];
  });
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isCourseCompleted, setIsCourseCompleted] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [savedCourses, setSavedCourses] = useState([]);
  const [savingCourse, setSavingCourse] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isCourseSaved, setIsCourseSaved] = useState(false);
  const [modalDismissed, setModalDismissed] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  
  // Fetch course data
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/courses/${courseId}`);
        setCourseData(response.data);
        
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
        setLessons(response.data);
      } catch (err) {
        setError('Failed to load lessons');
      } finally {
        setLessonsLoading(false);
      }
    };

    if (courseId) {
      fetchLessons();
    }
  }, [courseId]);
  
  // Load watched lessons from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`course_${courseId}_watched`);
    if (stored) {
      setWatchedLessons(JSON.parse(stored));
    }
  }, [courseId]);
  
  // Save watched lessons to localStorage
  useEffect(() => {
    localStorage.setItem(`course_${courseId}_watched`, JSON.stringify(watchedLessons));
  }, [watchedLessons, courseId]);
  
  // Persist favoriteLessons to localStorage
  useEffect(() => {
    localStorage.setItem('favoriteLessons', JSON.stringify(favoriteLessons));
  }, [favoriteLessons]);
  
  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`course_${courseId}_notes`, JSON.stringify(notes));
  }, [notes, courseId]);
  
  // Fetch saved courses when component mounts
  useEffect(() => {
    if (user) {
      fetchSavedCourses();
    }
  }, [user]);
  
  const fetchSavedCourses = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/saved-courses/user/${user._id}`);
      if (!response.ok) throw new Error('Failed to fetch saved courses');
      const data = await response.json();
      setSavedCourses(data.map(item => item.courseId._id));
    } catch (err) {
      console.error('Error fetching saved courses:', err);
    }
  };
  
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
      // Mark current lesson as watched before moving to next
      markLessonAsWatched(currentLesson.lessonId);
      const next = lessons[idx + 1];
      setCurrentLesson({ lessonId: next._id, title: getLocalizedText(next.title) });
      showToast(`Now viewing: ${getLocalizedText(next.title)}`);
    }
  };
  
  const goToPreviousLesson = () => {
    if (!currentLesson || !lessons) return;
    const idx = lessons.findIndex(l => l._id === currentLesson.lessonId);
    if (idx > 0) {
      // Mark current lesson as watched before moving to previous
      markLessonAsWatched(currentLesson.lessonId);
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
  
  // Mark lesson as watched
  const markLessonAsWatched = (lessonId) => {
    if (!watchedLessons.includes(lessonId)) {
      setWatchedLessons(prev => [...prev, lessonId]);
      showToast('Lesson marked as watched');
    }
  };
  
  // Calculate progress for a lesson
  const calculateLessonProgress = (lessonId) => {
    return watchedLessons.includes(lessonId) ? 100 : 0;
  };
  
  // Calculate overall course progress
  const calculateCourseProgress = () => {
    if (!lessons.length) return 0;
    const watchedCount = watchedLessons.length;
    return Math.round((watchedCount / lessons.length) * 100);
  };
  
  // Toggle save course
  const toggleSaveCourse = async (e) => {
    if (e) e.stopPropagation();
    if (!user) {
      navigate('/loginPage');
      return;
    }

    try {
      setSavingCourse(true);
      
      const response = await fetch(`http://localhost:5000/api/saved-courses/${user._id}/${courseId}`, {
        method: isSaved ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to update saved course');

      setIsSaved(!isSaved);
      showToast(isSaved ? 'Course removed from saved courses' : 'Course added to saved courses');
    } catch (err) {
      console.error('Error updating saved course:', err);
      showToast('Failed to update saved course');
    } finally {
      setSavingCourse(false);
    }
  };
  
  // Check if course is already saved
  useEffect(() => {
    const checkIfCourseSaved = async () => {
      if (!user || !courseId) return;
      
      try {
        // Get all saved courses for the user
        const response = await fetch(`http://localhost:5000/api/saved-courses/user/${user._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Check if current course is in the saved courses
          const isSaved = data.some(savedCourse => savedCourse.courseId._id === courseId);
          setIsCourseSaved(isSaved);
        }
      } catch (err) {
        // Silent fail - just don't update the saved state
      }
    };

    checkIfCourseSaved();
  }, [user, courseId]);
  
  // Add course to saved courses
  const handleAddToMyCourses = async () => {
    if (!user) {
      navigate('/loginPage');
      return;
    }

    try {
      setSavingCourse(true);
      
      console.log({
        userId: user?._id,
        courseId,
        savedAt: new Date().toISOString()
      });
      
      const response = await fetch('http://localhost:5000/api/saved-courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: user._id,
          courseId: courseId,
          savedAt: new Date().toISOString()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          showToast('Course is already in your saved courses');
          setIsCourseSaved(true);
          return;
        }
        throw new Error(data.message || 'Failed to save course');
      }

      setIsCourseSaved(true);
      showToast('Course added to your saved courses successfully');
    } catch (err) {
      showToast(err.message || 'Failed to save course');
    } finally {
      setSavingCourse(false);
    }
  };

  // Add subscription check effect
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setSubscriptionStatus(SUBSCRIPTION_STATUS.NONE);
        setSubscriptionLoading(false);
        return;
      }

      try {
    setSubscriptionLoading(true);
const response = await fetch(`http://localhost:5000/api/user-subscriptions/user/${user._id}`);
    if (!response.ok) throw new Error('Failed to fetch subscription');
    const data = await response.json();
    console.log('User subscriptions:', data);
        const currentDate = new Date();
        
        // Check if user has any active subscriptions
        const activeSubscription = data.find(sub => {
          const endDate = new Date(sub.endDate);
          const status = sub.status?.en || sub.status;
          return endDate > currentDate && status !== 'expired';
        });

        if (activeSubscription) {
          setSubscriptionStatus(SUBSCRIPTION_STATUS.ACTIVE);
        } else {
          // Check if there's an expired subscription
          const hasExpiredSubscription = data.some(sub => {
            const status = sub.status?.en || sub.status;
            return status === 'expired';
          });
          setSubscriptionStatus(hasExpiredSubscription ? SUBSCRIPTION_STATUS.EXPIRED : SUBSCRIPTION_STATUS.NONE);
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        setSubscriptionStatus(SUBSCRIPTION_STATUS.NONE);
      } finally {
        setSubscriptionLoading(false);
      }
    };

    checkSubscription();
  }, [user]);

  // Add subscription check before viewing lesson
  const handleLessonView = (lesson) => {
    if (subscriptionStatus !== SUBSCRIPTION_STATUS.ACTIVE) {
      setShowSubscriptionModal(true);
      return;
    }
    
    setCurrentLesson({ 
      lessonId: lesson._id, 
      title: getLocalizedText(lesson.title) 
    });
    markLessonAsWatched(lesson._id);
  };

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
    togglePlay,
    watchedLessons,
    markLessonAsWatched,
    calculateLessonProgress,
    calculateCourseProgress,
    savedCourses,
    toggleSaveCourse
  };
  
  // Check if all lessons are watched
  useEffect(() => {
    const allLessonsWatched = lessons.length > 0 && watchedLessons.length === lessons.length;
    setIsCourseCompleted(allLessonsWatched);

    // Only show the modal if not dismissed
    if (allLessonsWatched && !showCompletionModal && !modalDismissed) {
      setShowCompletionModal(true);
    }

    // Add to completedCourses in localStorage if completed
    if (allLessonsWatched && courseId) {
      const completedCourses = JSON.parse(localStorage.getItem('completedCourses') || '[]');
      if (!completedCourses.includes(courseId)) {
        completedCourses.push(courseId);
        localStorage.setItem('completedCourses', JSON.stringify(completedCourses));
      }
    }
  }, [watchedLessons, lessons, showCompletionModal, modalDismissed, courseId]);
  
  // Handle getting certificate
  const handleGetCertificate = () => {
    navigate(`/certificate/${courseId}`);
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#181818] text-white flex items-center justify-center mt-20">
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

  // Completion Modal
  const CompletionModal = () => {
    if (!showCompletionModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`${theme === 'dark' ? 'bg-[#232323]' : 'bg-white'} p-8 rounded-lg max-w-md w-full mx-4`}>
          <div className="text-center">
            <Award size={64} className="mx-auto text-[#00bcd4] mb-4" />
            <h2 className="text-2xl font-bold mb-2">{t('lessonViewer.congratulations')} 🎉</h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
              {t('lessonViewer.courseCompleted', { courseName: getLocalizedText(courseData?.title) })}
            </p>
            <button
              onClick={handleGetCertificate}
              className="w-full bg-[#00bcd4] hover:bg-[#0097a7] text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {t('lessonViewer.getCertificate')}
            </button>
            <button
              onClick={() => {
                setShowCompletionModal(false);
                setModalDismissed(true);
              }}
              className={`mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} hover:text-${theme === 'dark' ? 'white' : 'gray-900'} transition-colors`}
            >
              {t('lessonViewer.close')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add Subscription Modal Component
  const SubscriptionModal = () => {
    if (!showSubscriptionModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`${theme === 'dark' ? 'bg-[#232323]' : 'bg-white'} p-8 rounded-lg max-w-md w-full mx-4`}>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              {subscriptionStatus === SUBSCRIPTION_STATUS.EXPIRED 
                ? t('lessonViewer.subscriptionExpired')
                : t('lessonViewer.subscriptionRequired')}
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
              {subscriptionStatus === SUBSCRIPTION_STATUS.EXPIRED
                ? t('lessonViewer.subscriptionExpiredMessage')
                : t('lessonViewer.subscriptionRequiredMessage')}
            </p>
            <div className="flex flex-col gap-3">
              <Link
                to="/subscribe"
                className="w-full bg-[#ff3a30] hover:bg-[#ff1a1a] text-white font-bold py-3 px-6 rounded-lg transition-colors"
                onClick={() => setShowSubscriptionModal(false)}
              >
                {subscriptionStatus === SUBSCRIPTION_STATUS.EXPIRED
                  ? t('lessonViewer.renewSubscription')
                  : t('lessonViewer.getSubscription')}
              </Link>
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} hover:text-${theme === 'dark' ? 'white' : 'gray-900'} transition-colors`}
              >
                {t('lessonViewer.close')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <CourseContext.Provider value={contextValue}>
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#181818]' : 'bg-gray-100'} text-${theme === 'dark' ? 'white' : 'gray-900'} flex flex-col pt-24 ${isRTL ? 'rtl' : 'ltr'}`}>
        {/* Header */}
        <header className={`${theme === 'dark' ? 'bg-[#181818] border-[#222]' : 'bg-white border-gray-200'} border-b p-4 flex items-center justify-between`}>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`text-${theme === 'dark' ? 'gray-400' : 'gray-600'} hover:text-${theme === 'dark' ? 'white' : 'gray-900'} transition-colors`}
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-bold">
              {getLocalizedText(courseData?.title)}
              {getLocalizedText(courseData?.title)}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {isCourseCompleted && (
              <button
                onClick={() => setShowCompletionModal(true)}
                className="flex items-center space-x-2 bg-[#00bcd4] hover:bg-[#0097a7] text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Award size={20} />
                <span>{t('lessonViewer.getCertificate')}</span>
              </button>
            )}
            <button 
              onClick={handleAddToMyCourses}
              disabled={savingCourse || isCourseSaved}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors
                ${isCourseSaved 
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                  : savingCourse
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-[#ff3a30] hover:bg-[#ff1a1a] text-white'
                }
              `}
            >
              <Bookmark size={20} className={isCourseSaved ? "fill-current" : ""} />
              <span>
                {savingCourse 
                  ? 'Saving...' 
                  : isCourseSaved 
                    ? 'Added to my courses' 
                    : 'Add to my courses'
                }
              </span>
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <Share size={20} />
            </button>
          </div>
        </header>
        
        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          {sidebarOpen && (
            <div className={`w-80 ${theme === 'dark' ? 'bg-[#232323] border-[#222]' : 'bg-white border-gray-200'} border-r flex flex-col overflow-hidden`}>
              {/* Tabs */}
              <div className={`flex border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button 
                  className={`flex-1 p-4 text-sm font-medium ${activeTab === 'Course Viewer' ? 'text-[#ff3a30] border-b-2 border-[#ff3a30]' : `text-${theme === 'dark' ? 'gray-400' : 'gray-600'}`}`}
                  onClick={() => setActiveTab('Course Viewer')}
                >
                  <BookOpen size={16} className="inline-block mr-2" />
                  {t('lessonViewer.course')}
                </button>
                <button 
                  className={`flex-1 p-4 text-sm font-medium ${activeTab === 'Starred' ? 'text-yellow-400 border-b-2 border-yellow-400' : `text-${theme === 'dark' ? 'gray-400' : 'gray-600'}`}`}
                  onClick={() => setActiveTab('Starred')}
                >
                  <Star size={16} className="inline-block mr-2" />
                  {t('lessonViewer.starred')}
                </button>
                <button 
                  className={`flex-1 p-4 text-sm font-medium ${activeTab === 'Notes' ? 'text-blue-400 border-b-2 border-blue-400' : `text-${theme === 'dark' ? 'gray-400' : 'gray-600'}`}`}
                  onClick={() => setActiveTab('Notes')}
                >
                  <FileText size={16} className="inline-block mr-2" />
                  {t('lessonViewer.notes')}
                </button>
              </div>
              
              {/* Lessons List */}
              <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'Course Viewer' && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="font-bold">{t('lessonViewer.lessons')}</h2>
                      <span className={`text-xs text-${theme === 'dark' ? 'gray-400' : 'gray-600'}`}>
                        {watchedLessons.length}/{lessons.length} {t('lessonViewer.complete')} ({calculateCourseProgress()}%)
                      </span>
                    </div>
                    
                    {lessonsLoading ? (
                      <div>{t('lessonViewer.loadingLessons')}</div>
                    ) : lessons.length === 0 ? (
                      <div>{t('lessonViewer.noLessons')}</div>
                    ) : (
                      lessons.map(lesson => (
                        <div 
                          key={lesson._id}
                          className={`p-3 rounded-lg ${currentLesson?.lessonId === lesson._id ? 'bg-blue-500 bg-opacity-20 border border-blue-500' : `hover:bg-${theme === 'dark' ? 'gray-700' : 'gray-100'} border border-transparent`} cursor-pointer transition-colors`}
                          onClick={() => handleLessonView(lesson)}
                        >
                          <div className="flex justify-between mb-1">
                            <h3 className="font-medium flex-1 truncate">{getLocalizedText(lesson.title)}</h3>
                            <button
                              onClick={e => { e.stopPropagation(); toggleFavoriteLesson(lesson._id); }}
                              className={`text-${theme === 'dark' ? 'gray-400' : 'gray-600'} hover:text-yellow-400 transition-colors`}
                            >
                              <Star size={16} className={favoriteLessons.includes(lesson._id) ? 'text-yellow-400 fill-yellow-400' : ''} />
                            </button>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-xs text-${theme === 'dark' ? 'gray-400' : 'gray-600'}`}>{lesson.duration}</span>
                            <span className={`text-xs text-${theme === 'dark' ? 'gray-400' : 'gray-600'}`}>{calculateLessonProgress(lesson._id)}% {t('lessonViewer.complete')}</span>
                          </div>
                          <div className={`mt-2 h-1 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                            <div 
                              className="h-full bg-[#00bcd4] rounded-full" 
                              style={{ width: `${calculateLessonProgress(lesson._id)}%` }}
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
                      <h2 className="font-bold">{t('lessonViewer.starredLessons')}</h2>
                      <span className={`text-xs text-${theme === 'dark' ? 'gray-400' : 'gray-600'}`}>
                        {favoriteLessons.length} {t('lessonViewer.starred')}
                      </span>
                    </div>
                    {lessons.filter(lesson => favoriteLessons.includes(lesson._id)).length > 0 ? (
                      lessons.filter(lesson => favoriteLessons.includes(lesson._id)).map(lesson => (
                        <div 
                          key={lesson._id}
                          className={`p-3 rounded-lg ${currentLesson?.lessonId === lesson._id ? 'bg-blue-500 bg-opacity-20 border border-blue-500' : `hover:bg-${theme === 'dark' ? 'gray-700' : 'gray-100'} border border-transparent`} cursor-pointer transition-colors`}
                          onClick={() => setCurrentLesson({ 
                            lessonId: lesson._id, 
                            title: getLocalizedText(lesson.title) 
                          })}
                        >
                          <div className="flex justify-between mb-1">
                            <h3 className="font-medium flex-1 truncate">{getLocalizedText(lesson.title)}</h3>
                            <button
                              onClick={e => { e.stopPropagation(); toggleFavoriteLesson(lesson._id); }}
                              className={`text-${theme === 'dark' ? 'gray-400' : 'gray-600'} hover:text-yellow-400 transition-colors`}
                            >
                              <Star size={16} className={favoriteLessons.includes(lesson._id) ? 'text-yellow-400 fill-yellow-400' : ''} />
                            </button>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-xs text-${theme === 'dark' ? 'gray-400' : 'gray-600'}`}>{lesson.duration}</span>
                            <span className={`text-xs text-${theme === 'dark' ? 'gray-400' : 'gray-600'}`}>{lesson.progress}% {t('lessonViewer.complete')}</span>
                          </div>
                          <div className={`mt-2 h-1 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                            <div 
                              className="h-full bg-[#00bcd4] rounded-full" 
                              style={{ width: `${lesson.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={`text-center text-${theme === 'dark' ? 'gray-400' : 'gray-600'} py-8`}>{t('lessonViewer.noStarredLessons')}</div>
                    )}
                  </div>
                )}
                
                {activeTab === 'Notes' && (
                  <div>
                    <h2 className="font-bold mb-4">{t('lessonViewer.myNotes')}</h2>
                    <div className="mb-4">
                      <textarea
                        value={newNote}
                        onChange={e => setNewNote(e.target.value)}
                        placeholder={activeNote ? t('lessonViewer.editNote') : t('lessonViewer.writeNote')}
                        className={`w-full p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} text-${theme === 'dark' ? 'white' : 'gray-900'} mb-3 resize-none border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} focus:border-blue-500 focus:outline-none`}
                        rows={4}
                      ></textarea>
                      <div className="flex gap-2">
                        {activeNote ? (
                          <>
                            <button 
                              onClick={updateNote}
                              className="px-4 py-2 bg-[#ff3a30] rounded-lg hover:bg-blue-700 transition-colors text-white"
                            >
                              {t('lessonViewer.updateNote')}
                            </button>
                            <button 
                              onClick={cancelEdit}
                              className={`px-4 py-2 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} rounded-lg hover:${theme === 'dark' ? 'bg-gray-500' : 'bg-gray-300'} transition-colors`}
                            >
                              {t('lessonViewer.cancel')}
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={saveNote}
                            className="px-4 py-2 bg-[#ff3a30] rounded-lg hover:bg-blue-700 transition-colors text-white"
                          >
                            {t('lessonViewer.saveNote')}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-6 space-y-3">
                      {currentLessonNotes.length > 0 ? (
                        currentLessonNotes.map(note => (
                          <div key={note.id} className={`p-3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg`}>
                            <p className={`text-sm mb-2 text-${theme === 'dark' ? 'white' : 'gray-900'}`}>{note.content}</p>
                            <div className="flex justify-between items-center text-xs text-gray-400">
                              <span>{new Date(note.timestamp).toLocaleDateString()}</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => editNote(note)}
                                  className="text-blue-400 hover:text-blue-300"
                                >
                                  {t('lessonViewer.edit')}
                                </button>
                                <button
                                  onClick={() => deleteNote(note.id)}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  {t('lessonViewer.delete')}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className={`text-center text-${theme === 'dark' ? 'gray-400' : 'gray-600'} py-8`}>
                          {t('lessonViewer.noNotes')}
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
                  <div className={`flex items-center text-${theme === 'dark' ? 'gray-400' : 'gray-600'} text-sm`}>
                    <Clock size={14} className="mr-1" />
                    <span className="mr-4">{currentLessonData.duration}</span>
                    
                    <button 
                      onClick={() => toggleFavoriteLesson(currentLessonData._id)}
                      className="flex items-center hover:text-yellow-400 transition-colors"
                    >
                      <Star size={14} className={`mr-1 ${favoriteLessons.includes(currentLessonData._id) ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                      <span>{favoriteLessons.includes(currentLessonData._id) ? t('lessonViewer.favorited') : t('lessonViewer.addToFavorites')}</span>
                    </button>
                  </div>
                </div>
                
                {/* Video Player */}
                <div className={`aspect-video ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'} rounded-lg mb-8 relative overflow-hidden flex items-center justify-center group`}>
                  {subscriptionStatus === SUBSCRIPTION_STATUS.ACTIVE ? (
                    currentLessonData?.content?.videoUrl ? (
                      currentLessonData.content.videoUrl.includes('youtube.com') || currentLessonData.content.videoUrl.includes('youtu.be') ? (
                        <iframe
                          className="w-full h-full"
                          src={currentLessonData.content.videoUrl.replace('watch?v=', 'embed/') + '?autoplay=0'}
                          title={getLocalizedText(currentLessonData.title)}
                          frameBorder="0"
                          allow="accelerometer; autoplay=0; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <video 
                          className="w-full h-full object-cover"
                          controls
                          autoPlay={false}
                          src={currentLessonData.content.videoUrl}
                        >
                          {t('lessonViewer.videoNotSupported')}
                        </video>
                      )
                    ) : (
                      <img src="/api/placeholder/800/450" alt={t('lessonViewer.videoPlaceholder')} className="w-full h-full object-cover" />
                    )
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75">
                      <div className="text-center p-8">
                        <Lock size={48} className="mx-auto mb-4 text-[#ff3a30]" />
                        <h3 className="text-xl font-bold mb-2 text-white">
                          {subscriptionStatus === SUBSCRIPTION_STATUS.EXPIRED 
                            ? t('lessonViewer.subscriptionExpired')
                            : t('lessonViewer.subscriptionRequired')}
                        </h3>
                        <p className="text-gray-300 mb-6">
                          {subscriptionStatus === SUBSCRIPTION_STATUS.EXPIRED
                            ? t('lessonViewer.subscriptionExpiredMessage')
                            : t('lessonViewer.subscriptionRequiredMessage')}
                        </p>
                        <Link
                          to="/subscribe"
                          className="inline-block bg-[#ff3a30] hover:bg-[#ff1a1a] text-white font-bold py-3 px-6 rounded-lg transition-colors"
                          onClick={() => setShowSubscriptionModal(false)}
                        >
                          {subscriptionStatus === SUBSCRIPTION_STATUS.EXPIRED
                            ? t('lessonViewer.renewSubscription')
                            : t('lessonViewer.getSubscription')}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between mb-8">
                  <button 
                    onClick={goToPreviousLesson}
                    className={`px-6 py-3 rounded-lg flex items-center ${currentLessonData && currentLessonData._id === lessons[0]?._id ? `${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} text-gray-400 cursor-not-allowed` : `${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} hover:${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'} text-${theme === 'dark' ? 'white' : 'gray-900'}`}`}
                    disabled={currentLessonData && currentLessonData._id === lessons[0]?._id}
                  >
                    <ChevronLeft size={20} className="mr-2" />
                    {t('lessonViewer.previousLesson')}
                  </button>
                  
                  <button 
                    onClick={goToNextLesson}
                    className={`px-6 py-3 rounded-lg flex items-center ${currentLessonData && currentLessonData._id === lessons[lessons.length - 1]?._id ? `${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} text-gray-400 cursor-not-allowed` : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                    disabled={currentLessonData && currentLessonData._id === lessons[lessons.length - 1]?._id}
                  >
                    {t('lessonViewer.nextLesson')}
                    <ChevronRight size={20} className="ml-2" />
                  </button>
                </div>
                
                {/* Lesson Description */}
                <div className={`prose ${theme === 'dark' ? 'prose-invert' : ''} max-w-none mb-8`}>
                  <h2 className="text-2xl font-bold mb-4">{t('lessonViewer.description')}</h2>
                  <p className={`text-${theme === 'dark' ? 'gray-300' : 'gray-700'}`}>{getLocalizedText(currentLessonData.description)}</p>
                </div>
                
                {/* Resources */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">{t('lessonViewer.resources')}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a href="#" className={`flex items-center p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} transition-colors`}>
                      <div className="bg-blue-500 p-3 rounded-lg mr-4">
                        <FileText size={24} />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">{t('lessonViewer.cheatSheet')}</h3>
                        <p className={`text-xs text-${theme === 'dark' ? 'gray-400' : 'gray-600'}`}>PDF, 2.3 MB</p>
                      </div>
                    </a>
                    <a href="#" className={`flex items-center p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} transition-colors`}>
                      <div className="bg-green-500 p-3 rounded-lg mr-4">
                        <ExternalLink size={24} />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">{t('lessonViewer.interactiveDemo')}</h3>
                        <p className={`text-xs text-${theme === 'dark' ? 'gray-400' : 'gray-600'}`}>{t('lessonViewer.externalWebsite')}</p>
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
        <div className={`fixed bottom-6 right-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border text-${theme === 'dark' ? 'white' : 'gray-900'} px-4 py-3 rounded-lg shadow-lg animate-fade-in flex items-center`}>
          {toastMessage}
          <button 
            onClick={() => setToastMessage(null)} 
            className={`ml-4 text-${theme === 'dark' ? 'gray-400' : 'gray-600'} hover:text-${theme === 'dark' ? 'white' : 'gray-900'} transition-colors`}
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      {/* Completion Modal */}
      <CompletionModal />
      
      {/* Add Subscription Modal */}
      <SubscriptionModal />
    </CourseContext.Provider>
  );
}