/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import './courses.css';
import { RiArrowDropLeftLine, RiArrowDropRightLine } from "react-icons/ri";
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaBell, FaShoppingCart, FaUserCircle, FaBookmark, FaPlayCircle, FaSpinner } from 'react-icons/fa';
import { Route } from 'react-router-dom';
import CourseDetailsPage from '../CourseDetails/CourseDetails';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Courses = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const isRTL = i18n.language === 'ar';
  const currentLang = i18n.language;
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [instructors, setInstructors] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Sectioned courses
  const [picks, setPicks] = useState([]);
  const [trending, setTrending] = useState([]);
  const [newlyReleased, setNewlyReleased] = useState([]);
  const [freeCourses, setFreeCourses] = useState([]);
  const [popular, setPopular] = useState([]);

  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState(null);

  const [savedCourses, setSavedCourses] = useState([]);
  const [savingCourse, setSavingCourse] = useState(false);

  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicLoading, setTopicLoading] = useState(true);
  const [topicError, setTopicError] = useState(null);
  const [filteredPicks, setFilteredPicks] = useState([]);
  const [topicCoursesLoading, setTopicCoursesLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  useEffect(() => {
    const fetchSavedCourses = async () => {
      if (!user) return;

      try {
        const response = await fetch(`https://al-mentor-database-production.up.railway.app/api/saved-courses/user/${user._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch saved courses');

        const data = await response.json();
        setSavedCourses(data.map(item => item.courseId._id));
      } catch (err) {
        toast.error(t('Failed to fetch saved courses'));
      }
    };

    fetchSavedCourses();
  }, [user, t]);

  const toggleSaveCourse = async (courseId, e) => {
    e.stopPropagation();

    if (!user) {
      navigate('/loginPage');
      return;
    }

    if (savingCourse) return;

    // Debug logs
    console.log('DEBUG: user =', user);
    console.log('DEBUG: courseId =', courseId);
    console.log('DEBUG: token =', localStorage.getItem('token'));
    const payload = {
      userId: user?._id,
      courseId,
      savedAt: new Date().toISOString()
    };
    console.log('DEBUG: payload =', payload);

    try {
      setSavingCourse(true);
      const isCurrentlySaved = savedCourses.includes(courseId);

      if (isCurrentlySaved) {
        // Unsave course
        const response = await fetch(`https://al-mentor-database-production.up.railway.app/api/saved-courses/${user._id}/${courseId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('DEBUG: Unsave error response:', errorData);
          throw new Error('Failed to unsave course');
        }

        setSavedCourses(prev => prev.filter(id => id !== courseId));
        toast.success(t('Course removed from saved courses'));
      } else {
        // Save course
        const response = await fetch('https://al-mentor-database-production.up.railway.app/api/saved-courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) {
          console.error('DEBUG: Save error response:', data);
          if (
            response.status === 409 ||
            (response.status === 400 && data.message && data.message.toLowerCase().includes('already saved'))
          ) {
            toast.info(t('Course is already in your saved courses'));
            return;
          }
          throw new Error(data.message || 'Failed to save course');
        }

        setSavedCourses(prev => [...prev, courseId]);
        toast.success(t('Course added to saved courses'));
      }
    } catch (err) {
      toast.error(err.message || t('Failed to update saved courses'));
    } finally {
      setSavingCourse(false);
    }
  };

  useEffect(() => {
    axios.get('https://al-mentor-database-production.up.railway.app/api/instructors')
      .then((res) => setInstructors(res.data.data))
      .catch((err) => console.error('Error fetching instructors:', err));
  }, []);

  useEffect(() => {
    // Get search query from URL
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    setSearchQuery(search || '');

    axios.get('https://al-mentor-database-production.up.railway.app/api/courses')
      .then((res) => {
        const coursesData = res.data;
        setAllCourses(coursesData);
        // Mock filtering for sections (replace with real tags/fields if available)
        setPicks(coursesData.slice(0, 5));
        setTrending(coursesData.slice(5, 10));
        setNewlyReleased(coursesData.slice(10, 15));
        setFreeCourses(coursesData.filter(c => c.isFree).slice(0, 5));
        setPopular(coursesData.slice(15, 20));
      })
      .catch((err) => console.error('Error fetching courses:', err));
  }, [location.search]);

  useEffect(() => {
    axios.get('https://al-mentor-database-production.up.railway.app/api/category')
      .then((res) => setCategories(res.data.data))
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  useEffect(() => {
    // Fetch subscription plans
    const fetchSubscriptionPlans = async () => {
      try {
        setSubscriptionLoading(true);
        const response = await axios.get('https://al-mentor-database-production.up.railway.app/api/subscriptions');
        setSubscriptionPlans(response.data);
        // Set the first plan as selected by default
        if (response.data.length > 0) {
          setSelectedPlan(response.data[0]._id);
        }
      } catch (err) {
        console.error('Error fetching subscription plans:', err);
        setSubscriptionError('Failed to load subscription plans');
      } finally {
        setSubscriptionLoading(false);
      }
    };

    fetchSubscriptionPlans();
  }, []);

  // Fetch topics
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setTopicLoading(true);
        const response = await axios.get('https://al-mentor-database-production.up.railway.app/api/topics');
        setTopics(response.data);
      } catch (err) {
        console.error('Error fetching topics:', err);
        setTopicError('Failed to load topics');
      } finally {
        setTopicLoading(false);
      }
    };

    fetchTopics();
  }, []);

  // Fetch initial courses
  useEffect(() => {
    const fetchInitialCourses = async () => {
      try {
        const response = await axios.get('https://al-mentor-database-production.up.railway.app/api/courses');
        setFilteredPicks(response.data);
      } catch (err) {
        console.error('Error fetching initial courses:', err);
        setTopicError('Failed to load courses');
      }
    };

    fetchInitialCourses();
  }, []);

  // Handle topic selection and filtering
  useEffect(() => {
    const filterCoursesByTopic = async () => {
      if (!selectedTopic) {
        // If no topic selected, fetch all courses
        try {
          const response = await axios.get('https://al-mentor-database-production.up.railway.app/api/courses');
          setFilteredPicks(response.data);
        } catch (err) {
          console.error('Error fetching courses:', err);
          setTopicError('Failed to load courses');
        }
        return;
      }

      try {
        setTopicCoursesLoading(true);
        // Get courses for the selected topic
        const topicResponse = await axios.get(`https://al-mentor-database-production.up.railway.app/api/topics/${selectedTopic}`);

        // Get all courses and filter by topic
        const coursesResponse = await axios.get('https://al-mentor-database-production.up.railway.app/api/courses');

        // Filter courses based on topic
        const coursesWithTopic = coursesResponse.data.filter(course => {
          // Check if course has category field that matches topic's category
          const courseCategory = course.category?._id || course.category;
          const topicCategory = topicResponse.data.category;
          return courseCategory === topicCategory;
        });

        setFilteredPicks(coursesWithTopic);
      } catch (err) {
        console.error('Error filtering courses by topic:', err);
        setTopicError('Failed to load courses for this topic');
        setFilteredPicks([]);
      } finally {
        setTopicCoursesLoading(false);
      }
    };

    filterCoursesByTopic();
  }, [selectedTopic]);

  const handleTopicClick = (topicId) => {
    setSelectedTopic(prevTopic => prevTopic === topicId ? null : topicId);
  };

  // Original getFiltered function for other sections
  const getFiltered = (list) => {
    let filtered = list;

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(course => {
        const title = course.title?.[currentLang] || course.title?.en || '';
        const description = course.description?.[currentLang] || course.description?.en || '';
        return (
          title.toLowerCase().includes(searchLower) ||
          description.toLowerCase().includes(searchLower)
        );
      });
    }

    return filtered;
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  // Custom carousel arrows
  const CustomPrevArrow = ({ onClick }) => (
    <div className="custom-arrow left" onClick={onClick}>
      <RiArrowDropLeftLine size={40} color="white" />
    </div>
  );

  const CustomNextArrow = ({ onClick }) => (
    <div className="custom-arrow right" onClick={onClick}>
      <RiArrowDropRightLine size={40} color="white" />
    </div>
  );

  // Carousel settings
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  // Category slider settings
  const categorySliderSettings = {
    ...sliderSettings,
    slidesToShow: 6,
    responsive: [
      { breakpoint: 1536, settings: { slidesToShow: 5 } },
      { breakpoint: 1280, settings: { slidesToShow: 4 } },
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  const newlyReleasedSliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 2,
    rows: 2,
    arrows: true,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 2, rows: 2 } },
      { breakpoint: 1024, settings: { slidesToShow: 1, rows: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1, rows: 1 } },
      { breakpoint: 640, settings: { slidesToShow: 1, rows: 1 } },
    ],
  };

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

  // Course card
  const CourseCard = ({ course }) => {
    if (!course) return null;

    const title = getLocalizedText(course?.title);
    const instructorProfile = course.instructorDetails?.profile || {};
    const instructorName = instructorProfile
      ? `${instructorProfile.firstName?.[currentLang] || instructorProfile.firstName?.en || ''} ${instructorProfile.lastName?.[currentLang] || instructorProfile.lastName?.en || ''}`
      : t('Unknown Instructor');
    const image = course.thumbnail || 'https://placehold.co/280x160';
    const isNew = course.isNew || false;

    return (
      <div
        className={`course-card mx-2 relative rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-105 cursor-pointer shadow-lg ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'}`}
        onClick={() => navigate(`/courses/${course._id}`)}
      >
        <div className="relative">
          <img src={image} alt={title} className="w-full h-48 object-cover" />
          {isNew && (
            <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
              {t('New')}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className={`text-base font-semibold mb-2 h-12 overflow-hidden ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{title}</h3>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>{instructorName}</p>
          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center">
              <span className="text-yellow-500 mr-1">★★★★★</span>
            </div>
            <button
              className={`bg-transparent border-none p-0 ml-2 ${savingCourse ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={e => toggleSaveCourse(course._id, e)}
              disabled={savingCourse}
            >
              <FaBookmark className={
                savedCourses.includes(course._id)
                  ? 'text-red-600'
                  : theme === 'dark'
                    ? 'text-white'
                    : 'text-gray-400'
              } />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Instructor card
  const InstructorCard = ({ instructor }) => {
    if (!instructor) return null;
    // Try to get the profile object, fallback to user, fallback to instructor itself
    const profile = instructor.profile || instructor.user || instructor;
    const name = `${profile.firstName?.[currentLang] || profile.firstName?.en || profile.firstName || ''} ${profile.lastName?.[currentLang] || profile.lastName?.en || profile.lastName || ''}`.trim() || 'Unknown Instructor';
    const title = instructor.professionalTitle?.[currentLang] || instructor.professionalTitle?.en || instructor.professionalTitle || '';
    const image = profile.profilePicture || '/default-profile.png';

    return (
      <div className="px-4 min-h-72 flex flex-col items-center justify-start">
        <div className={`w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden shadow transition-all duration-300 hover:scale-105 ${theme === 'dark' ? 'shadow-gray-800' : 'shadow-gray-200'
          }`}>
          <img src={image} alt={name} className="w-full h-full object-cover" />
        </div>
        <h3 className={`text-lg font-semibold mt-4 text-center ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{name}</h3>
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm text-center mt-1`}>
          {title}
        </p>
      </div>
    );
  };

  // Category Hero Card (for the top section)
  const CategoryHeroCard = ({ category }) => {
    const title = getLocalizedText(category.name);
    const image = category.thumbnailImgUrl || 'https://placehold.co/400x300';
    return (

      <div
        className="relative cursor-pointer rounded-xl overflow-hidden group h-60 sm:h-72 md:h-80 flex items-end transition-all duration-300 shadow-lg hover:shadow-xl"
        onClick={() => navigate(`/categories/${category._id}`)}
      >
        <img
          src={image}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="relative z-10 p-6 w-full flex items-end justify-center">
          <h3 className="text-white text-xl sm:text-2xl font-bold text-center drop-shadow-lg" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
            {title}
          </h3>
        </div>
      </div>
    );
  };

  // Custom card for Newly Released section
  const NewlyReleasedCard = ({ course }) => {
    if (!course) return null;

    const title = getLocalizedText(course?.title);
    const instructorProfile = course.instructorDetails?.profile || {};
    const instructorName = instructorProfile
      ? `${instructorProfile.firstName?.[currentLang] || instructorProfile.firstName?.en || ''} ${instructorProfile.lastName?.[currentLang] || instructorProfile.lastName?.en || ''}`
      : t('Unknown Instructor');
    const image = course.thumbnail || 'https://placehold.co/280x160';
    const isNew = course.isNew || false;
    return (
      <div
        className={`flex rounded-2xl overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-xl hover:scale-102 cursor-pointer
        ${theme === 'dark' ? 'bg-[#181f1f] hover:bg-[#232b2b]' : 'bg-white hover:bg-gray-50'}`}
        onClick={() => navigate(`/courses/${course._id}`)}
      >
        <div className="relative w-2/5 md:w-1/3 h-40 flex-shrink-0">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
          {isNew && (
            <span className="absolute top-2 left-2 bg-[#ff5722] text-white text-xs px-2 py-1 rounded">{t('New')}</span>
          )}
        </div>
        <div className="flex flex-col justify-center p-3 sm:p-4 flex-1 min-w-0">
          <h3 className={`text-base sm:text-lg font-bold mb-1 sm:mb-2 line-clamp-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`} title={title}>{title}</h3>
          <div className="flex items-center justify-between mt-1">
            <p className={`text-sm sm:text-base font-medium truncate ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>{instructorName}</p>
            <button
              className={`bg-transparent border-none p-0 ml-2 ${savingCourse ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={e => toggleSaveCourse(course._id, e)}
              disabled={savingCourse}
            >
              <FaBookmark className={
                savedCourses.includes(course._id)
                  ? 'text-red-600'
                  : theme === 'dark'
                    ? 'text-white'
                    : 'text-gray-400'
              } />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    try {
      navigate(`/subscription/${selectedPlan}`);
    } catch (err) {
      console.error('Error handling subscription:', err);
    }
  };

  // Add plan selection handler
  const handlePlanSelection = (planId) => {
    setSelectedPlan(planId);
  };

  return (
    <div className="bg-white text-black min-h-screen transition-colors duration-200" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Category Hero Carousel */}
      <section className="mt-8 py-8 md:py-12 px-2 sm:px-4 md:px-8">
        <h2 className={`text-2xl md:text-3xl font-bold mb-12 md:mb-16 ${isRTL ? 'text-right' : 'text-left'} ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
          {t('sections.categories')}
        </h2>
        <div className="relative">
          <Slider {...categorySliderSettings}>
            {categories.map((category) => (
              <div key={category._id} className="px-2">
                <CategoryHeroCard category={category} />
              </div>
            ))}
          </Slider>
        </div>
      </section>

      {/* Course List Section */}
      <section id="course-list-section" className="py-8 md:py-12 px-2 sm:px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <h2 className={`text-xl md:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            {t('sections.picks')}
          </h2>
          <div className="flex items-center w-full md:w-auto overflow-x-auto scrollbar-hide">
            {topicLoading ? (
              <div className="flex items-center gap-2">
                <FaSpinner className="animate-spin" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('loading.topics')}
                </span>
              </div>
            ) : topicError ? (
              <div className="text-red-500 text-sm">{topicError}</div>
            ) : (
              <div className="flex items-center gap-2 pb-2">
                {topics.map((topic, index) => (
                  <React.Fragment key={topic._id}>
                    <button
                      onClick={() => handleTopicClick(topic._id)}
                      className={`whitespace-nowrap px-3 py-1 rounded-full transition-colors duration-300
                        ${selectedTopic === topic._id
                          ? 'bg-[#00ffd0] text-black font-semibold'
                          : theme === 'dark'
                            ? 'text-white hover:bg-gray-800'
                            : 'text-gray-800 hover:bg-gray-100'}
                      `}
                    >
                      {getLocalizedText(topic.name)}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
        {topicCoursesLoading ? (
          <div className="flex justify-center items-center py-12">
            <FaSpinner className="animate-spin text-3xl text-[#00ffd0]" />
          </div>
        ) : filteredPicks.length === 0 ? (
          <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {selectedTopic ? t('messages.noCoursesForTopic') : t('messages.noCoursesAvailable')}
          </div>
        ) : (
          filteredPicks.length < 4 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPicks.map((course, idx) => (
                <CourseCard key={idx} course={course} />
              ))}
            </div>
          ) : (
            <Slider {...{ ...sliderSettings, arrows: filteredPicks.length >= 4 }}>
              {filteredPicks.map((course, idx) => (
                <CourseCard key={idx} course={course} />
              ))}
            </Slider>
          )
        )}
      </section>

      {/* Trending Courses */}
      <section className="py-8 md:py-12 px-2 sm:px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <h2 className={`text-xl md:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            {t('sections.trending')}
          </h2>
          <button
            onClick={() => navigate('/all-courses')}
            className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} transition-colors duration-200 flex items-center gap-1`}
          >
            {t('buttons.viewAll')} <span className="ml-1">&rarr;</span>
          </button>
        </div>
        <Slider {...sliderSettings}>
          {getFiltered(trending).map((course, idx) => <CourseCard key={idx} course={course} />)}
        </Slider>
      </section>

      {/* Newly Released */}
      <section className="py-8 md:py-12 px-2 sm:px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <h2 className={`text-xl md:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            {t('sections.newlyReleased')}
          </h2>
          <button
            onClick={() => navigate('/all-courses')}
            className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} transition-colors duration-200 flex items-center gap-1`}
          >
            {t('buttons.viewAll')} <span className="ml-1">&rarr;</span>
          </button>
        </div>
        <div className="newly-released-slider">
          <Slider {...newlyReleasedSliderSettings}>
            {getFiltered(newlyReleased).map((course, idx) => (
              <div key={idx} className="p-2">
                <NewlyReleasedCard course={course} />
              </div>
            ))}
          </Slider>
        </div>
      </section>

      {/* Subscription Section */}
      <section className={`${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-100'} rounded-xl p-6 md:p-10 my-8 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 transition-colors duration-200`}>
        <div className="flex-1 min-w-[260px] mb-12 md:mb-16">
          <h2 className={`text-lg md:text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            {t('sections.subscription.title')}
          </h2>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4 text-sm md:text-base`}>
            {t('sections.subscription.description')}
          </p>
          <button
            onClick={handleSubscribe}
            disabled={!selectedPlan || subscriptionLoading}
            className={`px-6 py-3 rounded-lg border-2 transition font-semibold text-base
              ${theme === 'dark' ? 'bg-transparent border-[#00ffd0] text-[#00ffd0] hover:bg-[#00ffd0]/10' : 'bg-transparent border-[#00ffd0] text-black hover:bg-[#00ffd0]/10'}
              ${(!selectedPlan || subscriptionLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {subscriptionLoading ? (
              <span className="flex items-center gap-2">
                <FaSpinner className="animate-spin" />
                {t('loading.general')}
              </span>
            ) : (
              t('buttons.choosePlan')
            )}
          </button>
        </div>
        <div className="flex-1 flex flex-wrap justify-center gap-4">
          {subscriptionLoading ? (
            <div className="flex items-center justify-center w-full py-8">
              <FaSpinner className="animate-spin text-2xl text-[#00ffd0]" />
            </div>
          ) : subscriptionError ? (
            <div className="text-red-500 text-center w-full">{subscriptionError}</div>
          ) : subscriptionPlans.length === 0 ? (
            <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-center w-full`}>
              {t('messages.noSubscriptionPlans')}
            </div>
          ) : (
            subscriptionPlans.map((plan) => {
              const isSelected = selectedPlan === plan._id;
              const price = typeof plan.price === 'object' ? plan.price.amount : plan.price;
              const oldPrice = typeof plan.oldPrice === 'object' ? plan.oldPrice.amount : plan.oldPrice;
              const currency = typeof plan.price === 'object' ? plan.price.currency : plan.currency || 'EGP';
              const period = plan.period || 'mo';
              return (
                <div
                  key={plan._id}
                  onClick={() => handlePlanSelection(plan._id)}
                  className={`cursor-pointer transition-all duration-300 rounded-lg p-4 w-32 md:w-40 flex flex-col items-center relative
                    ${isSelected ? (theme === 'dark' ? 'bg-[#1e2b2b] border-2 border-[#00ffd0] shadow-lg' : 'bg-white border-2 border-[#00ffd0] shadow-lg') : (theme === 'dark' ? 'bg-[#181f1f] border-2 border-transparent' : 'bg-gray-100 border-2 border-transparent')}`}
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handlePlanSelection(plan._id); }}
                >
                  <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {getLocalizedText(plan.name)}
                  </p>
                  <div className="flex items-baseline mb-1">
                    {oldPrice && (
                      <span className={`text-xs line-through mr-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        {oldPrice} {currency}
                      </span>
                    )}
                    <span className={`text-xl md:text-2xl font-bold ${isSelected ? 'text-[#00ffd0]' : (theme === 'dark' ? 'text-white' : 'text-black')}`}>
                      {price}
                    </span>
                    <span className={`text-xs ml-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {currency}/{period}
                    </span>
                  </div>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {getLocalizedText(plan.description)}
                  </p>
                  {plan.isBestValue && isSelected && (
                    <span className="absolute top-2 right-2 bg-[#00ffd0] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {t('labels.bestValue')}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Instructors Section */}
      <section className="py-8 md:py-12 px-2 sm:px-4 md:px-8">
        <h2 className={`text-2xl font-bold mb-12 md:mb-16 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
          {t('sections.instructors')}
        </h2>
        <div className="max-w-6xl mx-auto">
          <Slider {...sliderSettings}>
            {instructors.map((instructor, index) => (
              <InstructorCard key={index} instructor={instructor} />
            ))}
          </Slider>
        </div>
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/instructors')}
            className={`rounded px-6 py-2 border transition-all duration-200 ${theme === 'dark' ? 'border-white text-white hover:bg-white hover:text-black' : 'border-black text-black hover:bg-black hover:text-white'}`}
          >
            {t('buttons.seeAllInstructors')}
          </button>
        </div>
      </section>
    </div>
  );
};

export default Courses;