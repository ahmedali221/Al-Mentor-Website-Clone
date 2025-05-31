import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import { FaRegBookmark, FaBookmark, FaClock, FaVideo } from 'react-icons/fa';

function ProgramDetailPage() {
  const { programId } = useParams();
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [program, setProgram] = useState(null);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedCourses, setSavedCourses] = useState([]);

  const currentLanguage = i18n.language;
  const isRTL = currentLanguage === 'ar';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        console.log("Fetching program:", `https://al-mentor-database-production.up.railway.app/programs/${programId}`);
        const programRes = await axios.get(`https://al-mentor-database-production.up.railway.app/programs/${programId}`);
        const programData = programRes.data;
        console.log("Fetched program data:", programData);

        const courseRequests = programData.courses.map(courseId => {
          const url = `https://al-mentor-database-production.up.railway.app/courses/${courseId}`;
          console.log("Fetching course:", url);
          return axios.get(url);
        });

        const courseResponses = await Promise.all(courseRequests);
        const courseData = courseResponses.map(res => res.data);
        console.log("Fetched course data:", courseData);

        // Extract instructors from course data
        const instructorData = courseData
          .map(course => {
            console.log(`Course ${course._id} instructor:`, course.instructor);
            return course.instructor;
          })
          .filter(Boolean);

        // Deduplicate by _id
        const uniqueInstructors = Object.values(
          instructorData.reduce((acc, inst) => {
            if (inst && inst._id && !acc[inst._id]) {
              acc[inst._id] = inst;
            }
            return acc;
          }, {})
        );

        console.log("Unique instructors:", uniqueInstructors);

        setProgram(programData);
        setCourses(courseData);
        setInstructors(uniqueInstructors);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching program or courses:", err);
        setError(t('messages.error', 'Failed to load program details'));
        setLoading(false);
      }
    };

    fetchData();
  }, [programId, t]);

  const toggleSaveCourse = (courseId) => {
    if (savedCourses.includes(courseId)) {
      setSavedCourses(savedCourses.filter(id => id !== courseId));
    } else {
      setSavedCourses([...savedCourses, courseId]);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#1A1A1A] text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4">{t('messages.loading', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className={`min-h-screen py-10 ${theme === 'dark' ? 'bg-[#1A1A1A] text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="container mx-auto px-8">
          <h1 className="text-3xl font-bold">{t('messages.noResults')}</h1>
          <p>{error || t('messages.error')}</p>
          <button
            onClick={() => navigate('/programs')}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
          >
            {t('navigation.backToPrograms', 'Back to Programs')}
          </button>
        </div>
      </div>
    );
  }

  const totalMinutes = program.totalDuration || 0;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#1A1A1A] text-white' : 'bg-gray-50 text-gray-900'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <div className="relative w-full h-[600px]">
        <img
          src={program.thumbnail}
          alt={program.title[currentLanguage]}
          className="w-full h-full object-cover absolute inset-0 z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/80 z-10"></div>
        <div className="absolute inset-0 z-20 flex items-center p-15">
          <div className="container mx-auto px-8 py-12">
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">{program.title[currentLanguage]}</h1>
            <p className="text-xl text-white mb-8 leading-relaxed">
              <span className="font-semibold">{courses.length}</span>{' '}
              <span className="capitalize">{t('navigation.courses')}</span>{' • '}
              <span className="inline-flex items-center gap-2">
                <span className="font-semibold">{hours}</span>{' '}
                <span className="capitalize">{t('programs.hours')}</span>{' '}
                <span className="font-semibold">{minutes}</span>{' '}
                <span className="capitalize">{t('programs.minutes')}</span>
              </span>{' • '}
              <span className="capitalize">{program.level[currentLanguage]}</span>
            </p>
            <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-md text-lg font-semibold transition-colors">
              {t('home.banner.subscribeButton')}
            </button>
          </div>
        </div>
      </div>

      <div className='p-15'>

        {/* Learning Outcomes and Description */}
        <div className="container mx-auto px-8 py-16 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold mb-8">{t('auth.skills', 'Skills You Will Gain')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {program.learningOutcomes.map((outcome, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-opacity-50">
                  {outcome[currentLanguage]}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-6">{t('programs.aboutUs', 'About This Program')}</h2>
            <div className={`p-8 rounded-lg`}>
              <p className="text-lg leading-relaxed">{program.description[currentLanguage]}</p>
            </div>
          </div>
        </div>

        {/* Course Cards */}
        {courses.length > 0 && (
          <div className={`w-full ${theme === 'dark' ? 'bg-[#1A1A1A]' : 'bg-white'} py-16`}>
            <div className="container mx-auto px-8">
              <h2 className="text-3xl font-bold mb-10">
                {courses.length} {t('navigation.courses')}
              </h2>
              <div className="grid grid-cols-1 gap-8">
                {courses.map((course, index) => {
                  const instructor = course.instructor; // already populated
                  return (
                    <div key={index} className={`rounded-lg overflow-hidden ${theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-white'} shadow-md`}>
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3">
                          <img
                            src={course.thumbnail || '/placeholder-course.jpg'}
                            alt={course.title[currentLanguage]}
                            className="w-full h-full object-cover min-h-[220px]"
                          />
                        </div>
                        <div className="p-8 md:w-2/3">
                          <div className="flex justify-between items-start">
                            <h3 className="text-2xl font-semibold mb-4">{course.title[currentLanguage]}</h3>
                            <button
                              onClick={() => toggleSaveCourse(course._id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              {savedCourses.includes(course._id) ?
                                <FaBookmark className="text-red-500 text-xl" /> :
                                <FaRegBookmark className="text-xl" />
                              }
                            </button>
                          </div>
                          <div className="flex items-center gap-4 mb-6">
                            <img
                              src={instructor?.user?.profilePicture || '/placeholder-avatar.jpg'}
                              alt={`${instructor?.user?.firstName?.[currentLanguage] || ''} ${instructor?.user?.lastName?.[currentLanguage] || ''}`}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                            <div>
                              <p className="text-lg font-semibold">
                                {`${instructor?.user?.firstName?.[currentLanguage] || ''} ${instructor?.user?.lastName?.[currentLanguage] || ''}`}
                              </p>
                              <p className="text-sm text-gray-500">{instructor?.professionalTitle?.[currentLanguage]}</p>
                            </div>
                          </div>
                          <p className={`mb-6 leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {course.description[currentLanguage]}
                          </p>
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                              <FaClock className="text-gray-500" />
                              {course.duration} {t('courses.duration')}
                            </div>
                            <div className="flex items-center gap-2">
                              <FaVideo className="text-gray-500" />
                              {course.lectureCount} {t('programs.lectures')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Instructors Section */}
        {instructors.length > 0 && (
          <div className="container mx-auto px-8 py-16">
            <h2 className="text-3xl font-bold mb-10">{t('programs.mentors', 'Mentors')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {instructors.map((instructor, index) => (
                <div key={index} className="flex items-center gap-6">
                  <div className="flex-shrink-0">
                    <img
                      src={instructor?.user?.profilePicture || '/placeholder-avatar.jpg'}
                      alt={`${instructor?.user?.firstName?.[currentLanguage] || ''} ${instructor?.user?.lastName?.[currentLanguage] || ''}`}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {`${instructor?.user?.firstName?.[currentLanguage] || ''} ${instructor?.user?.lastName?.[currentLanguage] || ''}`}
                    </h3>
                    <p className={`mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {instructor?.professionalTitle?.[currentLanguage]}
                    </p>
                    <div className="flex gap-4 text-sm">
                      <span>
                        {instructor?.studentsCount || 0} {t('programs.learners', 'Learners')}
                      </span>
                      <span>
                        {instructor?.coursesCount || 0} {t('navigation.courses')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProgramDetailPage;