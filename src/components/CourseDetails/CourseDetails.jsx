import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaClock, FaLayerGroup, FaLanguage, FaShareAlt, FaBookmark, FaChevronDown, FaChevronUp,
  FaCheck, FaLock, FaPlay, FaCertificate, FaInfinity, FaUserCircle, FaStar, FaUser
} from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useMyCourses } from '../../context/MyCoursesContext';


const CourseDetails = () => {
  const { id } = useParams();
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const navigate = useNavigate();
  const { myCourses, addCourse, removeCourse, isCourseAdded } = useMyCourses();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedCourses, setSavedCourses] = useState(() => {
    const saved = localStorage.getItem('savedCourses');
    return saved ? JSON.parse(saved) : [];
  });
  const [expandedSections, setExpandedSections] = useState({});
  const [instructorDetails, setInstructorDetails] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [userRating, setUserRating] = useState(() => {
    const saved = localStorage.getItem(`course_${id}_rating`);
    return saved ? parseInt(saved) : 0;
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [courseRating, setCourseRating] = useState(() => {
    const saved = localStorage.getItem(`course_${id}_ratings`);
    if (saved) {
      const data = JSON.parse(saved);
      return {
        average: data.average || 0,
        totalRatings: data.totalRatings || 0,
        ratings: data.ratings || []
      };
    }
    return {
      average: 0,
      totalRatings: 0,
      ratings: []
    };
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratingMessage, setRatingMessage] = useState('');
  const [comments, setComments] = useState(() => {
    const saved = localStorage.getItem(`course_${id}_comments`);
    return saved ? JSON.parse(saved) : [];
  });
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [allInstructors, setAllInstructors] = useState([]);

  // Helper function to get localized text
  const getLocalizedText = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    if (obj && typeof obj === 'object') {
      // Handle translation objects with en/ar keys
      if (obj.en || obj.ar) {
        return obj[currentLang] || obj.en || obj.ar || '';
      }
      // Handle other object types
      return obj[currentLang] || obj.en || '';
    }
    return '';
  };

  // Now you can safely use getLocalizedText
  const description = getLocalizedText(course?.description) || '';
  const maxDescriptionLength = 220;
  const isLongDescription = description.length > maxDescriptionLength;
  const displayedDescription = showFullDescription ? description : description.slice(0, maxDescriptionLength);

  // Save/unsave logic
  const toggleSaveCourse = (courseId) => {
    setSavedCourses(prev => {
      const updated = prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId];
      localStorage.setItem('savedCourses', JSON.stringify(updated));
      return updated;
    });
  };

  // Toggle section expansion
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/courses/${id}`)
      .then(res => {
        setCourse(res.data);
        setLoading(false);
        console.log('Fetched course:', res.data);
        console.log('course.instructors:', res.data.instructors);
        console.log('course.instructorDetails:', res.data.instructorDetails);
        console.log('course.instructor:', res.data.instructor);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // Fetch all instructors (like in home.jsx)
  useEffect(() => {
    axios.get('/api/instructors')
      .then((res) => setAllInstructors(res.data.data))
      .catch((err) => console.error('Error fetching instructors:', err));
  }, []);

  // After fetching course, match instructor(s) to allInstructors
  useEffect(() => {
    if (!course || allInstructors.length === 0) return;

    // Get instructor IDs from course (supporting both array and single)
    let courseInstructorIds = [];
    if (Array.isArray(course.instructors)) {
      courseInstructorIds = course.instructors.map(inst =>
        (typeof inst === 'object' && inst.$oid) ? inst.$oid : (inst._id || inst)
      );
    } else if (course.instructorDetails) {
      if (typeof course.instructorDetails === 'object' && course.instructorDetails.$oid) {
        courseInstructorIds = [course.instructorDetails.$oid];
      } else if (course.instructorDetails._id) {
        courseInstructorIds = [course.instructorDetails._id];
      } else {
        courseInstructorIds = [course.instructorDetails];
      }
    } else if (course.instructor) {
      if (typeof course.instructor === 'object' && course.instructor.$oid) {
        courseInstructorIds = [course.instructor.$oid];
      } else if (course.instructor._id) {
        courseInstructorIds = [course.instructor._id];
      } else {
        courseInstructorIds = [course.instructor];
      }
    }

    // Find matching instructors from allInstructors
    const matched = allInstructors.filter(inst => courseInstructorIds.includes(inst._id));
    setInstructorDetails(matched);

    console.log("Fetched instructorDetails:", matched);
    console.log("Course instructors:", course?.instructors);
    console.log("Course instructorDetails:", course?.instructorDetails);
    console.log("Course instructor:", course?.instructor);
  }, [course, allInstructors]);

  // Update lessons fetching
  useEffect(() => {
    if (!course) return;
    
    const fetchLessons = async () => {
      setLessonsLoading(true);
      try {
        const response = await axios.get(`/api/lessons/course/${id}`);
        setLessons(response.data);
      } catch (error) {
        console.error('Error fetching lessons:', error);
      } finally {
        setLessonsLoading(false);
      }
    };

    fetchLessons();
  }, [course, id]);

  // Update rating functions
  const handleRatingSubmit = async (rating) => {
    setIsSubmitting(true);
    setRatingMessage('');
    
    try {
      // Create new rating object
      const newRating = {
        rating,
        timestamp: new Date().toISOString(),
        userId: 'current-user' // Replace with actual user ID
      };

      // Update course rating state
      setCourseRating(prev => {
        const newRatings = [...prev.ratings, newRating];
        const totalRatings = newRatings.length;
        const average = newRatings.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings;

        const newData = {
          average,
          totalRatings,
          ratings: newRatings
        };

        // Save to localStorage
        localStorage.setItem(`course_${id}_ratings`, JSON.stringify(newData));
        localStorage.setItem(`course_${id}_rating`, rating.toString());

        return newData;
      });

      setUserRating(rating);
      setRatingMessage(t('Thank you for your rating!'));
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setRatingMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error submitting rating:', error);
      setRatingMessage(t('Failed to submit rating. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch course ratings
  useEffect(() => {
    if (!course) return;
    
    const fetchRatings = async () => {
      try {
        const response = await axios.get(`/api/courses/${id}/ratings`);
        setCourseRating(response.data);
      } catch (error) {
        console.error('Error fetching ratings:', error);
      }
    };

    fetchRatings();
  }, [course, id]);

  // Add comment handling functions
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    
    try {
      const comment = {
        id: Date.now(),
        text: newComment.trim(),
        timestamp: new Date().toISOString(),
        user: {
          name: 'Current User', // Replace with actual user name
          avatar: '/default-avatar.png' // Replace with actual user avatar
        }
      };

      const updatedComments = [comment, ...comments];
      setComments(updatedComments);
      localStorage.setItem(`course_${id}_comments`, JSON.stringify(updatedComments));
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleLessonClick = (lesson) => {
    // Navigate to the lesson viewer with the lesson data
    navigate(`/lesson-viewer/${id}`, {
      state: {
        lesson,
        courseId: id
      }
    });
  };

  if (loading) return <div>{t('messages.loading')}</div>;
  if (!course) return <div>{t('messages.noResults')}</div>;

  // Extract fields with proper fallbacks
  const title = getLocalizedText(course.title);
  const instructors = Array.isArray(course.instructors)
    ? course.instructors
    : course.instructorDetails
      ? [course.instructorDetails]
      : course.instructor
        ? [course.instructor]
        : [];
  const image = course.thumbnail || 'https://placehold.co/600x340';
  const isNew = course.isNew;
  
  // Calculate total duration and lesson count from actual lessons data
  const totalDuration = lessons.reduce((acc, lesson) => acc + (parseInt(lesson.duration) || 0), 0);
  const formattedDuration = `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`;
  const lessonsCount = lessons.length;
  
  const level = getLocalizedText(course.level);
  const language = getLocalizedText(course.language);
  const categories = Array.isArray(course.categories) ? course.categories : [];
  const tags = Array.isArray(course.tags) ? course.tags : [];
  const objectives = Array.isArray(course.objectives) ? course.objectives : [];
  const requirements = Array.isArray(course.requirements) ? course.requirements : [];
  const contentSections = Array.isArray(course.contentSections) ? course.contentSections : [];
  const lastUpdated = course.lastUpdated || '10/12/2023';
  const hasCertificate = course.hasCertificate !== false;
  const supportUrl = "/support"; // Change as needed

  // Get instructor details for the course from the global instructors list
  const getCourseInstructorDetails = () => {
    if (!course || !allInstructors.length) return [];
    
    let courseInstructorIds = [];
    
    // Debug log the course data with full details
    console.log('Full course data:', JSON.stringify(course, null, 2));

    // Try all possible instructor data structures
    if (course.instructor) {
      console.log('Found instructor field:', course.instructor);
      if (typeof course.instructor === 'object') {
        if (course.instructor.$oid) {
          courseInstructorIds = [course.instructor.$oid];
        } else if (course.instructor._id) {
          courseInstructorIds = [course.instructor._id];
        }
      } else if (typeof course.instructor === 'string') {
        courseInstructorIds = [course.instructor];
      }
    }

    // If no instructor found in instructor field, try instructors array
    if (courseInstructorIds.length === 0 && Array.isArray(course.instructors)) {
      console.log('Found instructors array:', course.instructors);
      courseInstructorIds = course.instructors.map(inst => {
        if (typeof inst === 'object') {
          return inst.$oid || inst._id || inst;
        }
        return inst;
      });
    }

    // If still no instructor found, try instructorDetails
    if (courseInstructorIds.length === 0 && course.instructorDetails) {
      console.log('Found instructorDetails:', course.instructorDetails);
      if (typeof course.instructorDetails === 'object') {
        courseInstructorIds = [course.instructorDetails.$oid || course.instructorDetails._id || course.instructorDetails];
      } else {
        courseInstructorIds = [course.instructorDetails];
      }
    }

    // If still no instructor found, try to get a default instructor
    if (courseInstructorIds.length === 0) {
      console.log('No instructor found in course data, using default instructor');
      // Use the first available instructor as a fallback
      if (allInstructors.length > 0) {
        courseInstructorIds = [allInstructors[0]._id];
      }
    }

    // Debug log the extracted IDs
    console.log('Extracted instructor IDs:', courseInstructorIds);
    console.log('Available instructor IDs:', allInstructors.map(i => i._id));

    // Find matching instructors from allInstructors
    const matched = allInstructors.filter(inst => courseInstructorIds.includes(inst._id));
    
    if (!matched.length) {
      console.warn('No instructor found for course. Course instructor IDs:', courseInstructorIds);
      console.warn('Available instructor IDs:', allInstructors.map(i => i._id));
    } else {
      console.log('Found matching instructor:', matched[0]);
    }
    
    return matched;
  };

  const displayInstructors = getCourseInstructorDetails();
  console.log("Final displayInstructors:", displayInstructors);

  // Get instructor details with proper fallbacks
  const getInstructorName = (instructor) => {
    if (!instructor) return 'Unknown Instructor';
    
    // Try to get name from profile object first
    if (instructor.profile) {
      const firstName = getLocalizedText(instructor.profile.firstName);
      const lastName = getLocalizedText(instructor.profile.lastName);
      return `${firstName} ${lastName}`.trim() || 'Unknown Instructor';
    }
    
    // Fallback to direct properties
    const firstName = getLocalizedText(instructor.firstName);
    const lastName = getLocalizedText(instructor.lastName);
    return `${firstName} ${lastName}`.trim() || 'Unknown Instructor';
  };

  const getInstructorImage = (instructor) => {
    if (!instructor) return '/default-course-img.png';
    
    // Try to get image from profile object first
    if (instructor.profile?.profilePicture) {
      return instructor.profile.profilePicture;
    }
    
    // Fallback to direct property
    return instructor.profilePicture || '/default-course-img.png';
  };

  const getInstructorEmail = (instructor) => {
    if (!instructor) return '';
    
    // Try to get email from profile object first
    if (instructor.profile?.email) {
      return instructor.profile.email;
    }
    
    // Fallback to direct property
    return instructor.email || '';
  };

  const getInstructorUsername = (instructor) => {
    if (!instructor) return '';
    
    // Try to get username from profile object first
    if (instructor.profile?.username) {
      return instructor.profile.username;
    }
    
    // Fallback to direct property
    return instructor.username || '';
  };

  return (
    <div className={`w-full min-h-[60vh] py-12 px-2 md:px-8 flex flex-col items-center mt-10 ${theme === 'dark' ? 'bg-gradient-to-b from-[#0d232b] to-[#121212]' : 'bg-gradient-to-b from-[#eaf6fa] to-[#fff]'}`}>
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Content (Left 2/3) */}
        <div className="col-span-2 flex flex-col gap-10">
          {/* Video/Image Preview */}
          <div className="relative w-full rounded-2xl overflow-hidden shadow-lg min-h-[340px] bg-black flex items-center justify-center">
            <img src={image} alt={title} className="w-full h-[340px] object-cover" />
            <button
              aria-label={t('Play preview')}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-40 rounded-full p-4 border-2 border-white flex items-center justify-center"
              onClick={() => navigate(`/lesson-viewer/${id}`)}
            >
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="24" fill="rgba(0,0,0,0.5)"/><polygon points="20,16 36,24 20,32" fill="#fff"/></svg>
            </button>
            {/* Instructor Names on Image */}
            {displayInstructors.length > 0 && (
              <div className="absolute bottom-6 left-6 flex gap-4 items-center">
                {(() => {
                  const instructor = displayInstructors[0];
                  const profile = instructor?.profile || instructor?.user || instructor || {};
                  const name = `${profile.firstName?.[currentLang] || profile.firstName?.en || profile.firstName || ''} ${profile.lastName?.[currentLang] || profile.lastName?.en || profile.lastName || ''}`.trim() || t('Unknown Instructor');
                  const image = profile.profilePicture || '/default-profile.png';
                  return (
                    <>
                      <img src={image} alt={name} className="w-10 h-10 rounded-full object-cover border border-gray-700" />
                      <p className="text-white font-semibold text-base drop-shadow-lg">{name}</p>
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Objectives */}
          {objectives.length > 0 && (
            <div className="mb-10">
              <h3 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{t('By the end of this course, you will be able to')}</h3>
              <ul className="list-none space-y-3">
                {objectives.map((obj, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-lg">
                    <FaCheck className="text-[#00ffd0] mt-1 min-w-[16px]" />
                    <span className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{getLocalizedText(obj)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Course Details */}
          <div className="mb-10">
            <h3 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{t('Course details')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <FaClock className="text-[#00bcd4]" />
                <span className={`${theme === 'dark' ? 'text-white' : 'text-black'}`}>{formattedDuration} / {lessonsCount} {t('lessons')}</span>
              </div>
              <div className="flex items-center gap-3">
                <FaInfinity className="text-[#00bcd4]" />
                <span className={`${theme === 'dark' ? 'text-white' : 'text-black'}`}>{t('Last updated')}: {lastUpdated}</span>
              </div>
              <div className="flex items-center gap-3">
                <FaCertificate className="text-[#00bcd4]" />
                <span className={`${theme === 'dark' ? 'text-white' : 'text-black'}`}>{hasCertificate ? t('Course completion certificate') : t('No certificate')}</span>
              </div>
            </div>
          </div>

          {/* Course Content */}
          <div className="mb-10">
            <h3 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{t('Course Content')}</h3>
            {lessonsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00bcd4] mx-auto"></div>
                <p className="mt-2 text-gray-500">{t('Loading lessons...')}</p>
              </div>
            ) : lessons.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                {t('No lessons available for this course yet.')}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {lessons.map((lesson, index) => (
                  <div
                    key={lesson._id}
                    className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} pb-6`}
                  >
                    <div
                      className="flex justify-between items-center py-4 px-2 cursor-pointer"
                      onClick={() => handleLessonClick(lesson)}
                      aria-label={expandedSections[index] ? t('Collapse lesson') : t('Expand lesson')}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">{index + 1}.</span>
                        <div className="flex flex-col">
                          <span className={`font-bold text-lg ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{getLocalizedText(lesson.title)}</span>
                          {lesson.description && (
                            <span className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                              {getLocalizedText(lesson.description)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {lesson.duration && (
                          <span className="text-sm text-gray-500">
                            <FaClock className="inline mr-1" />
                            {lesson.duration} {t('minutes')}
                          </span>
                        )}
                        {expandedSections[index] ? (
                          <FaChevronUp className="text-[#00bcd4]" />
                        ) : (
                          <FaChevronDown className="text-[#00bcd4]" />
                        )}
                      </div>
                    </div>
                    {expandedSections[index] && (
                      <div className="pl-8 pr-2">
                        <div className="flex flex-col gap-4">
                          {lesson.content && (
                            <div className="text-gray-600 dark:text-gray-300">
                              {getLocalizedText(lesson.content)}
                            </div>
                          )}
                          {lesson.resources && lesson.resources.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-semibold mb-2">{t('Resources')}</h4>
                              <ul className="list-disc pl-5 space-y-2">
                                {lesson.resources.map((resource, idx) => (
                                  <li key={idx} className="text-[#00bcd4] hover:underline">
                                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                      {getLocalizedText(resource.title)}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {lesson.videoUrl && (
                            <div className="mt-4">
                              <button
                                className="flex items-center gap-2 text-[#00bcd4] hover:text-[#0097a7]"
                                onClick={() => handleLessonClick(lesson)}
                              >
                                <FaPlay className="w-4 h-4" />
                                {t('Watch Video')}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* All Lessons */}
          {/* {lessons.length > 0 && (
            <div className="mb-10">
              <h3 className="text-2xl font-bold mb-6">All Lessons</h3>
              <div className="flex flex-col gap-4">
                {lessons.map((lessons, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="font-semibold">{idx + 1}. {getLocalizedText(lessons.title)}</span>
                    <span className="text-xs text-gray-400 ml-6 mt-1">{lessons.duration ? `${lessons.duration} Minutes` : ''}</span>
                  </div>
                ))}
              </div>
              <hr className="my-6 border-gray-700" />
            </div>
          )} */}

          {/* About This Course */}
          <div className="mb-10">
            <h3 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{t('About this course')}</h3>
            <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2 whitespace-pre-line`}>
              {displayedDescription}
              {isLongDescription && (
                <span
                  className="text-[#00bcd4] cursor-pointer ml-2"
                  onClick={() => setShowFullDescription(v => !v)}
                >
                  {showFullDescription ? t('Read less') : t('Read more')}
                </span>
              )}
            </div>
            <hr className="my-6 border-gray-700" />
          </div>

          {/* Course Requirements */}
          <div className="mb-10">
            <h3 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{t('Course requirements and prerequisites')}</h3>
            {requirements.length > 0 ? (
              <ul className="list-disc pl-5 space-y-2">
                {requirements.map((req, idx) => (
                  <li key={idx} className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {getLocalizedText(req)}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-start gap-2">
                <span className="mt-1 text-lg text-[#00ffd0]">•</span>
                <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-base`}>
                  {t('There are no requirements for this course. Your interest in the topic and your commitment to learning are all you need to achieve the utmost benefit from this course.')}
                </span>
              </div>
            )}
            <hr className="my-6 border-gray-700" />
          </div>

          {/* Mentor/Instructor Section */}
          <div className="mb-10">
            <h3 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{t('Mentor')}</h3>
            <div className="flex flex-col gap-6">
              {(displayInstructors.length > 0 ? displayInstructors : [null]).map((instructor, idx) => {
                if (!instructor) {
                  // Fallback card
                  return (
                    <div key={idx} className="flex items-center gap-5">
                      <img
                        src="https://placehold.co/150x150"
                        alt="Unknown Instructor"
                        className="w-16 h-16 object-cover rounded-full border border-gray-700"
                      />
                      <div className="flex flex-col justify-center">
                        <div className={`font-bold text-lg md:text-xl leading-tight ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{t('Unknown Instructor')}</div>
                        <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm leading-tight`}>{t('No instructor data found for this course.')}</div>
                      </div>
                    </div>
                  );
                }
                // Use robust extraction like in courses.jsx
                const profile = instructor.profile || instructor.user || instructor;
                const name = `${profile.firstName?.[currentLang] || profile.firstName?.en || profile.firstName || ''} ${profile.lastName?.[currentLang] || profile.lastName?.en || profile.lastName || ''}`.trim() || t('Unknown Instructor');
                const title = instructor.professionalTitle?.[currentLang] || instructor.professionalTitle?.en || instructor.professionalTitle || '';
                const image = profile.profilePicture || '/default-profile.png';
                return (
                  <div key={idx} className="flex items-center gap-5">
                    <img
                      src={image}
                      alt={name}
                      className="w-16 h-16 object-cover rounded-full border border-gray-700"
                    />
                    <div className="flex flex-col justify-center">
                      <div className={`font-bold text-lg md:text-xl leading-tight ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{name}</div>
                      <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm leading-tight`}>{title}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <hr className="my-6 border-gray-700" />
          </div>

          {/* Course Rating Section */}
          <div className="mb-10">
            <h3 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{t('Course Rating')}</h3>
            <div className="flex flex-col gap-6">
              {/* Average Rating Display */}
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-[#00bcd4]">
                  {courseRating.average.toFixed(1)}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(courseRating.average)
                            ? 'text-yellow-400'
                            : theme === 'dark' ? 'text-gray-700' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}> 
                    {courseRating.totalRatings} {t('ratings')}
                  </div>
                </div>
              </div>

              {/* User Rating Input */}
              <div className="flex flex-col gap-2">
                <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{t('Rate this course')}</h4>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className="focus:outline-none"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => handleRatingSubmit(star)}
                      disabled={isSubmitting}
                    >
                      <FaStar
                        className={`w-6 h-6 transition-colors ${
                          star <= (hoverRating || userRating)
                            ? 'text-yellow-400'
                            : theme === 'dark' ? 'text-gray-700' : 'text-gray-300'
                        } ${isSubmitting ? 'opacity-50' : ''}`}
                      />
                    </button>
                  ))}
                </div>
                {ratingMessage && (
                  <div className={`text-sm mt-2 ${
                    ratingMessage.includes('Thank you') 
                      ? 'text-green-500' 
                      : 'text-red-500'
                  }`}>
                    {ratingMessage}
                  </div>
                )}
              </div>

              {/* Recent Ratings */}
              {courseRating.ratings.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{t('Recent Ratings')}</h4>
                  <div className="space-y-3">
                    {courseRating.ratings.slice(-3).reverse().map((rating, index) => (
                      <div key={index} className={`flex items-center gap-2 p-2 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}> 
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                              key={star}
                              className={`w-4 h-4 ${
                                star <= rating.rating
                                  ? 'text-yellow-400'
                                  : theme === 'dark' ? 'text-gray-700' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}> 
                          {new Date(rating.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <hr className="my-6 border-gray-700" />
          </div>

          {/* Comments Section */}
          <div className="mb-10">
            <h3 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{t('Comments')}</h3>
            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <div className="flex flex-col gap-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={t('Write your comment here...')}
                  className={`w-full p-4 rounded-lg resize-none min-h-[100px] ${
                    theme === 'dark' 
                      ? 'bg-gray-800 text-white border-gray-700' 
                      : 'bg-white text-black border-gray-300'
                  } border focus:outline-none focus:ring-2 focus:ring-[#00bcd4]`}
                  disabled={isSubmittingComment}
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment || !newComment.trim()}
                  className={`self-end px-6 py-2 rounded-lg font-semibold transition ${
                    isSubmittingComment || !newComment.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#00bcd4] hover:bg-[#0097a7] text-white'
                  }`}
                >
                  {isSubmittingComment ? t('Posting...') : t('Post Comment')}
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
              {comments.length === 0 ? (
                <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('No comments yet. Be the first to comment!')}
                </div>
              ) : (
                comments.map((comment) => (
                  <div 
                    key={comment.id} 
                    className={`p-4 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                          {comment.user.avatar ? (
                            <img 
                              src={comment.user.avatar} 
                              alt={comment.user.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <FaUser className="w-6 h-6 text-gray-500" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{comment.user.name}</h4>
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}> 
                            {new Date(comment.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sticky Summary Card (Right 1/3) */}
        <aside className="col-span-1 w-full lg:sticky lg:top-24">
          <div className={`rounded-2xl shadow-xl p-6 flex flex-col gap-4 ${theme === 'dark' ? 'bg-[#181f1f] text-white' : 'bg-white text-black'}`}>
            <h2 className="text-lg font-bold mb-1">{title}</h2>
            <div className="mb-2 text-sm">
              {instructors.map((inst, idx) => (
                <span key={idx} className="text-[#00bcd4] font-semibold cursor-pointer hover:underline mr-1">
                  {getLocalizedText(inst.profile?.firstName)} {getLocalizedText(inst.profile?.lastName)}
                </span>
              ))}
            </div>
            <div className="flex flex-col gap-2 text-sm mb-2">
              <div className="flex items-center gap-2"><FaClock className="text-[#00bcd4]" /> {formattedDuration} / {lessonsCount} {t('lessons')}</div>
              <div className="flex items-center gap-2"><FaLayerGroup className="text-[#00bcd4]" /> {t('Level')}: {level}</div>
              <div className="flex items-center gap-2"><FaLanguage className="text-[#00bcd4]" /> {t('Language')}: {language}</div>
            </div>
            <button className="bg-red-600 text-white py-3 rounded-lg text-lg font-bold hover:bg-red-700 transition mb-2" aria-label={t('Subscribe Now')}>
              {t('Subscribe Now')}
            </button>
            <button
              onClick={() => {
                if (isCourseAdded(course._id)) {
                  removeCourse(course._id);
                } else {
                  addCourse({
                    _id: course._id,
                    title: course.title,
                    thumbnail: course.thumbnail,
                    duration: formattedDuration,
                    level: level,
                    instructor: instructors[0]?.profile?.firstName + ' ' + instructors[0]?.profile?.lastName
                  });
                }
              }}
              className={`flex items-center justify-center gap-2 py-3 rounded-lg text-lg font-bold transition ${
                isCourseAdded(course._id)
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-[#00bcd4] hover:bg-[#0097a7] text-white'
              }`}
            >
              <FaBookmark className={isCourseAdded(course._id) ? "text-white" : "text-white"} />
              {isCourseAdded(course._id) ? t('Added to My Courses') : t('Add to My Courses')}
            </button>
            <button 
              onClick={() => {
                navigate('/my-courses');
              }}
              className="flex items-center justify-center gap-2 py-3 rounded-lg text-lg font-bold bg-gray-600 hover:bg-gray-700 text-white transition"
            >
              <FaBookmark className="text-white" />
              {t('View My Courses')}
            </button>
            <button
              onClick={() => navigate('/saved-courses')}
              className="flex items-center justify-center gap-2 py-3 rounded-lg text-lg font-bold bg-gray-500 hover:bg-gray-700 text-white transition mb-2"
            >
              <FaBookmark className="text-white" />
              {t('View Saved Courses')}
            </button>
            <button 
              className="flex items-center justify-center gap-2 text-gray-300 hover:text-white text-sm py-2" 
              aria-label={t('Share Course')}
            >
              <FaShareAlt className="text-white" />
              {t('Share Course')}
            </button>
            <div className="text-xs text-gray-400 text-center mt-2">{t('This course is available only for')} 180 {t('days')}</div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CourseDetails;