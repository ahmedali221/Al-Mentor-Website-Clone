import React, { createContext, useState } from 'react';

export const CourseContext = createContext();

export function CourseProvider({ children }) {
  const [courseData, setCourseData] = useState({
    modules: [],
    progress: 0
  });

  const setCurrentLesson = (moduleId, lessonId, lessonTitle) => {
    // Update the current lesson in the course data
    setCourseData(prevData => ({
      ...prevData,
      currentModule: moduleId,
      currentLesson: lessonId,
      currentLessonTitle: lessonTitle
    }));
  };

  const toggleStarLesson = (moduleId, lessonId) => {
    setCourseData(prevData => {
      const updatedModules = prevData.modules.map(module => {
        if (module.id === moduleId) {
          const updatedLessons = module.lessons.map(lesson => {
            if (lesson.id === lessonId) {
              return { ...lesson, starred: !lesson.starred };
            }
            return lesson;
          });
          return { ...module, lessons: updatedLessons };
        }
        return module;
      });
      return { ...prevData, modules: updatedModules };
    });
  };

  const markLessonAsWatched = (moduleId, lessonId) => {
    setCourseData(prevData => {
      const updatedModules = prevData.modules.map(module => {
        if (module.id === moduleId) {
          const updatedLessons = module.lessons.map(lesson => {
            if (lesson.id === lessonId) {
              return { ...lesson, watched: true };
            }
            return lesson;
          });
          return { ...module, lessons: updatedLessons };
        }
        return module;
      });

      // Calculate new progress
      const totalLessons = updatedModules.reduce((acc, module) => acc + module.lessons.length, 0);
      const watchedLessons = updatedModules.reduce((acc, module) => 
        acc + module.lessons.filter(lesson => lesson.watched).length, 0
      );
      const newProgress = Math.round((watchedLessons / totalLessons) * 100);

      return { 
        ...prevData, 
        modules: updatedModules,
        progress: newProgress
      };
    });
  };

  return (
    <CourseContext.Provider value={{
      courseData,
      setCourseData,
      setCurrentLesson,
      toggleStarLesson,
      markLessonAsWatched
    }}>
      {children}
    </CourseContext.Provider>
  );
} 