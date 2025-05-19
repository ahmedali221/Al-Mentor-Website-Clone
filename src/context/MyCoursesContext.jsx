import React, { createContext, useContext, useState, useEffect } from 'react';

const MyCoursesContext = createContext();

export const useMyCourses = () => {
  return useContext(MyCoursesContext);
};

export const MyCoursesProvider = ({ children }) => {
  const [myCourses, setMyCourses] = useState(() => {
    // Load courses from localStorage on initial render
    const savedCourses = localStorage.getItem('myCourses');
    return savedCourses ? JSON.parse(savedCourses) : [];
  });

  // Save to localStorage whenever myCourses changes
  useEffect(() => {
    localStorage.setItem('myCourses', JSON.stringify(myCourses));
  }, [myCourses]);

  const addCourse = (course) => {
    setMyCourses(prevCourses => {
      // Check if course already exists
      if (prevCourses.some(c => c._id === course._id)) {
        return prevCourses;
      }
      return [...prevCourses, course];
    });
  };

  const removeCourse = (courseId) => {
    setMyCourses(prevCourses => 
      prevCourses.filter(course => course._id !== courseId)
    );
  };

  const isCourseAdded = (courseId) => {
    return myCourses.some(course => course._id === courseId);
  };

  const getMyCourses = () => {
    return myCourses;
  };

  return (
    <MyCoursesContext.Provider value={{ 
      myCourses, 
      addCourse, 
      removeCourse, 
      isCourseAdded,
      getMyCourses 
    }}>
      {children}
    </MyCoursesContext.Provider>
  );
}; 