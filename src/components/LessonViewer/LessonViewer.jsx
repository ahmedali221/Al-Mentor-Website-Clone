import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { ChevronRight, ChevronDown, ChevronLeft, Star, Clock, FileText, Bell, X, PlayCircle, Volume2, Maximize, Settings } from 'lucide-react';

// =====================
// Context
// =====================
const CourseContext = createContext();

// =====================
// Helper Functions
// =====================
const getLessonById = (modules, moduleId, lessonId) => {
  const module = modules.find(m => m.id === moduleId);
  return module?.lessons.find(l => l.id === lessonId);
};

const getNextLesson = (modules, moduleId, lessonId) => {
  const module = modules.find(m => m.id === moduleId);
  const index = module.lessons.findIndex(l => l.id === lessonId);
  return index < module.lessons.length - 1 ? module.lessons[index + 1] : null;
};

const getPreviousLesson = (modules, moduleId, lessonId) => {
  const module = modules.find(m => m.id === moduleId);
  const index = module.lessons.findIndex(l => l.id === lessonId);
  return index > 0 ? module.lessons[index - 1] : null;
};

// =====================
// Mock Data
// =====================
const mockCourseData = {
  id: 'course-123',
  title: '100 Essential Management Concepts',
  progress: 0,
  modules: [
    {
      id: 'module-1',
      title: 'Course Introduction',
      expanded: true,
      lessons: []
    },
    {
      id: 'module-2',
      title: '1. 100 Essential Management Concepts',
      expanded: true,
      lessons: [
        {
          id: 'lesson-1-1',
          title: '1.1 Life Journey',
          watched: true,
          starred: true,
          duration: '12:30',
          content: {
            videoUrl: '',
            articleText: 'This is the article text for Life Journey.',
            attachments: []
          }
        },
        {
          id: 'lesson-1-2',
          title: '1.2 What Is Management',
          watched: true,
          starred: true,
          duration: '15:45',
          content: {
            videoUrl: '',
            articleText: 'This is the article text for What Is Management.',
            attachments: []
          }
        },
        {
          id: 'lesson-1-3',
          title: '1.3 The Full Picture',
          watched: true,
          starred: true,
          duration: '08:20',
          content: {
            videoUrl: '',
            articleText: 'This is the article text for The Full Picture.',
            attachments: []
          }
        },
        {
          id: 'lesson-1-4',
          title: '1.4 Mastery for Mastery',
          watched: false,
          starred: false,
          duration: '10:15',
          content: {
            videoUrl: '',
            articleText: 'This is the article text for Mastery for Mastery.',
            attachments: []
          }
        }
      ]
    }
  ],
  introduction: {
    description: "In this training course, you will be introduced to the top 100 essential management concepts in detail. You will learn about different topics such as leadership, time management, communication skills, objective setting, marketing of ideas, etc.",
    watchingProgressRequired: 90,
    watchingProgress: 90
  },
  notes: [
    {
      id: 'note-1',
      lessonId: 'lesson-1-1',
      content: 'Important points about the life journey in management',
      timestamp: '2025-05-10T14:30:00'
    }
  ],
  announcements: [
    {
      id: 'announcement-1',
      title: 'Course Update',
      content: 'New lessons added to Module 3',
      date: '2025-05-12T09:00:00',
      read: false
    }
  ]
};

// =====================
// Main Component
// =====================
export default function LessonViewer() {
  const [courseData, setCourseData] = useState(mockCourseData);
  const [activeTab, setActiveTab] = useState('Course Viewer');
  const [sidebarView, setSidebarView] = useState('Course Outline');
  const [currentLesson, setCurrentLesson] = useState({
    moduleId: 'module-2',
    lessonId: 'lesson-1-1',
    title: '1.1 Life Journey'
  });
  const [toastMessage, setToastMessage] = useState(null);
  const [activeNote, setActiveNote] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime] = useState('00:10/05:31');
  const [favoriteLessons, setFavoriteLessons] = useState(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem('favoriteLessons');
    return stored ? JSON.parse(stored) : [];
  });

  // Persist favoriteLessons to localStorage
  useEffect(() => {
    localStorage.setItem('favoriteLessons', JSON.stringify(favoriteLessons));
  }, [favoriteLessons]);
  
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleStarLesson = (moduleId, lessonId) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId
          ? {
              ...module,
              lessons: module.lessons.map(lesson =>
                lesson.id === lessonId ? { ...lesson, starred: !lesson.starred } : lesson
              )
            }
          : module
      )
    }));
    showToast('Star toggled');
  };

  const toggleModuleExpansion = (moduleId) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId ? { ...m, expanded: !m.expanded } : m
      )
    }));
  };

  const saveNote = () => {
    if (!newNote.trim()) return;
    setCourseData(prev => ({
      ...prev,
      notes: [
        ...prev.notes,
        {
          id: `note-${Date.now()}`,
          lessonId: currentLesson.lessonId,
          content: newNote,
          timestamp: new Date().toISOString()
        }
      ]
    }));
    setNewNote('');
    setActiveNote(null);
    showToast('Note saved');
  };

  const markAnnouncementAsRead = (announcementId) => {
    setCourseData(prev => ({
      ...prev,
      announcements: prev.announcements.map(a =>
        a.id === announcementId ? { ...a, read: true } : a
      )
    }));
  };

  const goToNextLesson = () => {
    const next = getNextLesson(courseData.modules, currentLesson.moduleId, currentLesson.lessonId);
    if (next) {
      setCurrentLesson({
        moduleId: currentLesson.moduleId,
        lessonId: next.id,
        title: next.title
      });
    }
  };

  const goToPreviousLesson = () => {
    const prev = getPreviousLesson(courseData.modules, currentLesson.moduleId, currentLesson.lessonId);
    if (prev) {
        setCurrentLesson({
        moduleId: currentLesson.moduleId,
        lessonId: prev.id,
        title: prev.title
        });
    } else {
      setCurrentLesson(null);
      }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleFavoriteLesson = (lessonId) => {
    setFavoriteLessons(prev =>
      prev.includes(lessonId)
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  const contextValue = {
    courseData,
    toggleStarLesson,
    toggleModuleExpansion,
    currentLesson,
    setCurrentLesson,
    favoriteLessons,
    toggleFavoriteLesson,
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

  const currentLessonData = useMemo(() => {
    return getLessonById(courseData.modules, currentLesson?.moduleId, currentLesson?.lessonId);
  }, [courseData, currentLesson]);

  return (
    <CourseContext.Provider value={contextValue}>
      <div className="min-h-screen bg-black text-white">
        {/* Top Bar */}
        <div className="h-2 bg-gray-800">
          <div className="h-2 bg-red-500" style={{ width: `${courseData.introduction.watchingProgress}%` }}></div>
            </div>

        {/* Tabs */}
        <div className="flex justify-between items-center border-b border-gray-800 p-4">
          <div className="flex space-x-4">
            {['Course Viewer', 'Notes', 'Announcements'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={activeTab === tab ? 'text-white border-b-2 border-red-500' : 'text-gray-400'}
              >
                {tab}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-400">Progress: {courseData.introduction.watchingProgress}%</span>
        </div>
        
        {/* Main Content */}
        <div className="flex">
          <div className="w-1/4 bg-gray-900 border-r border-gray-800 p-4">
            {/* Sidebar - Add your own sidebar components here */}
            <h2 className="font-bold mb-4">Modules</h2>
            {courseData.modules.map(module => (
              <div key={module.id}>
                <div className="cursor-pointer font-semibold" onClick={() => toggleModuleExpansion(module.id)}>
                  {module.expanded ? '▼' : '▶'} {module.title}
                </div>
                {module.expanded && module.lessons.map(lesson => (
                  <div
                    key={lesson.id}
                    onClick={() => setCurrentLesson({ moduleId: module.id, lessonId: lesson.id, title: lesson.title })}
                    className={`ml-4 cursor-pointer ${currentLesson?.lessonId === lesson.id ? 'text-red-400' : ''}`}
                  >
                    {lesson.title}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="flex-1 p-8">
            {activeTab === 'Course Viewer' && currentLessonData && (
              <>
                <h1 className="text-2xl mb-4">{currentLessonData.title}</h1>
                <p className="text-gray-300 mb-4">{currentLessonData.content.articleText}</p>
                <div className="flex justify-between mt-8">
                  <button onClick={goToPreviousLesson} className="bg-gray-700 px-4 py-2 rounded">
                    <ChevronLeft size={16} className="inline-block" /> Previous
                  </button>
                  <button onClick={goToNextLesson} className="bg-red-600 px-4 py-2 rounded">
                    Next <ChevronRight size={16} className="inline-block" />
                  </button>
                </div>
              </>
            )}
            {activeTab === 'Notes' && (
              <div>
                <h2 className="text-xl mb-4">Notes</h2>
                <textarea
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder="Write a note..."
                  className="w-full p-2 rounded bg-gray-800 text-white mb-2"
                />
                <button onClick={saveNote} className="bg-blue-600 px-4 py-2 rounded">Save Note</button>
              </div>
            )}
            {activeTab === 'Announcements' && (
              <div>
                <h2 className="text-xl mb-4">Announcements</h2>
                {courseData.announcements.map(ann => (
                  <div key={ann.id} className="mb-4 p-4 bg-gray-800 rounded">
                    <h3 className="font-bold">{ann.title}</h3>
                    <p className="text-sm text-gray-400">{new Date(ann.date).toLocaleDateString()}</p>
                    <p>{ann.content}</p>
                    {!ann.read && <button onClick={() => markAnnouncementAsRead(ann.id)} className="text-blue-400 underline mt-2 text-sm">Mark as read</button>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-4 right-4 bg-gray-700 text-white px-4 py-2 rounded shadow">
            {toastMessage}
            <button onClick={() => setToastMessage(null)} className="ml-2 text-white">
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </CourseContext.Provider>
  );
}

function CourseOutline() {
  const { courseData, favoriteLessons, toggleFavoriteLesson, setCurrentLesson, currentLesson } = useContext(CourseContext);
  return (
    <>
      {courseData.modules.map(module => (
        <div key={module.id}>
          <div className="font-bold mt-2 mb-1">{module.title}</div>
          {module.lessons.map(lesson => (
            <div
              key={lesson.id} 
              className={`flex items-center px-2 py-1 cursor-pointer ${currentLesson?.lessonId === lesson.id ? 'bg-gray-800 font-bold' : ''}`}
              onClick={() => setCurrentLesson({ moduleId: module.id, lessonId: lesson.id, title: lesson.title })}
            >
              <span className="flex-1 text-sm">{lesson.title}</span>
              <button
                className="ml-2"
                onClick={e => { e.stopPropagation(); toggleFavoriteLesson(lesson.id); }}
                aria-label={favoriteLessons.includes(lesson.id) ? 'Unstar lesson' : 'Star lesson'}
              >
                <Star size={16} className={favoriteLessons.includes(lesson.id) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'} />
              </button>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

function StarredLessons() {
  const { courseData, favoriteLessons, setCurrentLesson, currentLesson } = useContext(CourseContext);
  // Flatten all lessons and filter by favoriteLessons
  const allLessons = courseData.modules.flatMap(module =>
    module.lessons.map(lesson => ({ ...lesson, moduleId: module.id }))
  );
  const starred = allLessons.filter(lesson => favoriteLessons.includes(lesson.id));
  return (
    <div>
      {starred.length === 0 ? (
        <div className="p-4 text-center text-gray-400">No starred lessons yet</div>
      ) : (
        starred.map(lesson => (
          <div
            key={lesson.id} 
            className={`flex items-center px-2 py-1 cursor-pointer ${currentLesson?.lessonId === lesson.id ? 'bg-gray-800 font-bold' : ''}`}
            onClick={() => setCurrentLesson({ moduleId: lesson.moduleId, lessonId: lesson.id, title: lesson.title })}
          >
            <span className="flex-1 text-sm">{lesson.title}</span>
            <Star size={16} className="text-yellow-400 fill-yellow-400" />
          </div>
        ))
      )}
    </div>
  );
}
