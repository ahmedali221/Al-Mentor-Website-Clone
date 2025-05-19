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

const Courses = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const isRTL = i18n.language === 'ar';
  const currentLang = i18n.language;
  const location = useLocation();
  const navigate = useNavigate();

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

  const [savedCourses, setSavedCourses] = useState(() => {
    // Load from localStorage or start with empty array
    const saved = localStorage.getItem('savedCourses');
    return saved ? JSON.parse(saved) : [];
  });

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
    localStorage.setItem('savedCourses', JSON.stringify(savedCourses));
  }, [savedCourses]);

  const toggleSaveCourse = (courseId) => {
    setSavedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  useEffect(() => {
    axios.get('/api/instructors')
      .then((res) => setInstructors(res.data.data))
      .catch((err) => console.error('Error fetching instructors:', err));
  }, []);

  useEffect(() => {
    // Get search query from URL
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    setSearchQuery(search || '');

    axios.get('/api/courses')
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
    axios.get('/api/category')
      .then((res) => setCategories(res.data.data))
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  useEffect(() => {
    // Fetch subscription plans
    const fetchSubscriptionPlans = async () => {
      try {
        setSubscriptionLoading(true);
        const response = await axios.get('/api/subscriptions');
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
        const response = await axios.get('/api/topics');
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
        const response = await axios.get('/api/courses');
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
          const response = await axios.get('/api/courses');
          console.log('All courses response:', response.data);
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
        const topicResponse = await axios.get(`/api/topics/${selectedTopic}`);
        console.log('Topic response:', topicResponse.data);

        // Get all courses and filter by topic
        const coursesResponse = await axios.get('/api/courses');
        console.log('Courses response:', coursesResponse.data);

        // Debug the first course structure
        if (coursesResponse.data.length > 0) {
          console.log('First course structure:', coursesResponse.data[0]);
        }

        // Filter courses based on topic
        const coursesWithTopic = coursesResponse.data.filter(course => {
          // Check if course has category field that matches topic's category
          const courseCategory = course.category?._id || course.category;
          const topicCategory = topicResponse.data.category;

          console.log('Comparing categories:', {
            courseCategory,
            topicCategory,
            matches: courseCategory === topicCategory
          });

          return courseCategory === topicCategory;
        });

        console.log('Filtered courses:', coursesWithTopic);
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
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  // Category slider settings
  const categorySliderSettings = {
    ...sliderSettings,
    slidesToShow: 6,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 5 } },
      { breakpoint: 1024, settings: { slidesToShow: 4 } },
      { breakpoint: 768, settings: { slidesToShow: 3 } },
      { breakpoint: 480, settings: { slidesToShow: 2 } },
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
      { breakpoint: 1024, settings: { slidesToShow: 1, rows: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1, rows: 1 } },
    ],
  };

  // Helper function to get localized text
  const getLocalizedText = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[currentLang] || obj.en || '';
  };

  // Course card
  const CourseCard = ({ course }) => {
    if (!course) return null;

    const title = getLocalizedText(course?.title);
    const instructorProfile = course.instructorDetails?.profile || {};
    const instructorName = instructorProfile
      ? `${instructorProfile.firstName?.[currentLang] || instructorProfile.firstName?.en || ''} ${instructorProfile.lastName?.[currentLang] || instructorProfile.lastName?.en || ''}`
      : 'Unknown Instructor';
    const image = course.thumbnail || 'https://placehold.co/280x160';
    const isNew = course.isNew || false;

    // After you have course and allInstructors loaded:
    const courseInstructorIds = Array.isArray(course?.instructors)
      ? course.instructors.map(inst => inst._id || inst)
      : course?.instructorDetails
        ? [course.instructorDetails._id || course.instructorDetails]
        : [];
    const instructorDetails = instructors.filter(inst => courseInstructorIds.includes(inst._id));

    return (
      <div
        className="course-card mx-1 relative mt-10 cursor-pointer"
        onClick={() => navigate(`/courses/${course._id}`)}
      >
        <div className="rounded overflow-hidden bg-[#1a1a1a] shadow-lg mt-10">
          <div className="relative">
            <img src={image} alt={title} className="w-full h-40 object-cover" />
            {isNew && (
              <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                New
              </span>
            )}
          </div>
          <div className="p-3 mt-10">
            <h3 className="text-base font-semibold text-white mb-1 h-12 overflow-hidden">{title}</h3>
            <p className="text-gray-400 text-sm">{instructorName}</p>
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center">
                <span className="text-yellow-500 mr-1">★★★★★</span>
              </div>
              <button
                className={`bg-transparent border-none p-0 ml-2`}
                onClick={e => {
                  e.stopPropagation();
                  toggleSaveCourse(course._id);
                }}
              >
                <FaBookmark className={savedCourses.includes(course._id) ? "text-red-600" : "text-white"} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Instructor card
  const InstructorCard = ({ instructor }) => {
    if (!instructor) return null;
    // Support both .user and direct fields
    const user = instructor.user || instructor;
    const name =
      (user.firstName?.[currentLang] || user.firstName?.en || user.firstName || '') +
      ' ' +
      (user.lastName?.[currentLang] || user.lastName?.en || user.lastName || '');
    const title =
      instructor.professionalTitle?.[currentLang] ||
      instructor.professionalTitle?.en ||
      instructor.professionalTitle ||
      'Instructor Title';
    const image = user.profilePicture || 'https://placehold.co/150x150';

    return (
      <div className="flex flex-col items-center justify-start px-3">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-700">
          <img src={image} alt={name} className="w-full h-full object-cover" />
        </div>
        <h3 className="text-base font-semibold mt-3 text-white text-center">{name.trim() || 'Unknown Instructor'}</h3>
        <p className="text-gray-400 text-xs text-center">{title}</p>
      </div>
    );
  };

  // Category card
  const CategoryCard = ({ title, image }) => {
    return (
      <div className="mx-1">
        <div className="relative rounded overflow-hidden">
          <img src={image} alt={title} className="w-full h-28 object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <h3 className="text-white text-center font-semibold">{title}</h3>
          </div>
        </div>
      </div>
    );
  };

  // Category data
  const categoryData = [
    { title: "Business & Professional Skills", image: "https://via.placeholder.com/280x160" },
    { title: "Technology & Innovation", image: "https://via.placeholder.com/280x160" },
    { title: "Marketing", image: "https://via.placeholder.com/280x160" },
    { title: "Lifestyle", image: "https://via.placeholder.com/280x160" },
    { title: "Education & Academics", image: "https://via.placeholder.com/280x160" },
    { title: "Family & Relationships", image: "https://via.placeholder.com/280x160" },
    { title: "Arts, Design & Media", image: "https://via.placeholder.com/280x160" }
  ];

  const handlePlanSelection = (planId) => {
    setSelectedPlan(planId);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    try {
      // Navigate to subscription page with selected plan
      navigate(`/subscription/${selectedPlan}`);
    } catch (err) {
      console.error('Error handling subscription:', err);
    }
  };

  // Category Hero Card (for the top section)
  const CategoryHeroCard = ({ category }) => {
    const title = category.name?.ar || category.name?.en || category.name;
    const image = category.thumbnailImgUrl || 'https://placehold.co/400x300';
    return (
      <div
        className="relative cursor-pointer rounded-xl overflow-hidden group h-[340px] flex items-end transition-all duration-300 shadow-lg"
        style={{ minWidth: 320, maxWidth: 400 }}
        onClick={() => navigate(`/categories/${category._id}`)}
      >
        <img
          src={image}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="relative z-10 p-6 w-full flex items-end justify-center h-full">
          <h3 className="text-white text-2xl font-bold text-center drop-shadow-lg" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
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
      : 'Unknown Instructor';
    const image = course.thumbnail || 'https://placehold.co/280x160';
    const isNew = course.isNew || false;
    return (
      <div
        className="flex bg-[#181f1f] hover:bg-[#232b2b] transition rounded-2xl overflow-hidden shadow-lg min-h-[160px] max-h-[200px] w-full cursor-pointer"
        onClick={() => navigate(`/courses/${course._id}`)}
      >
        <div className="relative min-w-[260px] max-w-[300px] h-[180px] flex-shrink-0 border-2 border-gray-700 shadow-xl">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            style={{ borderRadius: '16px 0 0 16px' }}
          />
          {isNew && (
            <span className="absolute top-2 left-2 bg-[#ff5722] text-white text-xs px-2 py-1 rounded">New</span>
          )}
        </div>
        <div className="flex flex-col justify-center p-6 flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white mb-2 truncate" title={title}>{title}</h3>
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm truncate">{instructorName}</p>
            <button
              className={`bg-transparent border-none p-0 ml-2`}
              onClick={e => {
                e.stopPropagation();
                toggleSaveCourse(course._id);
              }}
            >
              <FaBookmark className={savedCourses.includes(course._id) ? "text-red-600" : "text-white"} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  console.log('newlyReleased:', newlyReleased);

  return (
    <div className={`${theme === 'dark' ? 'bg-[#121212] text-white' : 'bg-white text-black'} min-h-screen`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Category Hero Carousel (NEW) */}
      <section className="py-12 px-6 mt-10">
        <h2 className="text-3xl font-bold mb-8 text-right">تصنيفات الدورات التدريبية</h2>
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
      {/* Course Categories */}
      {/* <section className="py-8 px-6">
        <h2 className="text-2xl font-bold mb-4">Course Categories</h2>
        <div className="flex overflow-x-auto space-x-4 scrollbar-hide pb-2">
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => handleCategoryClick(category._id)}
              className={`whitespace-nowrap px-6 py-3 rounded-full font-semibold text-base transition border-2 focus:outline-none ${selectedCategory === category._id ? 'bg-white text-black border-white' : 'bg-black text-white border-gray-700 hover:bg-gray-800'}`}
            >
              {category.name?.[currentLang] || category.name?.en || category.name}
            </button>
          ))}
        </div>
      </section> */}
      {/* Picks Section */}
      <section id="course-list-section" className="py-6 px-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{t('Picks')}</h2>
          <div className="flex items-center">
            {topicLoading ? (
              <div className="flex items-center gap-2">
                <FaSpinner className="animate-spin" />
                <span className="text-sm text-gray-400">{t('Loading topics...')}</span>
              </div>
            ) : topicError ? (
              <div className="text-red-500 text-sm">{topicError}</div>
            ) : (
              <div className="flex items-center overflow-x-auto scrollbar-hide">
                {topics.map((topic, index) => (
                  <React.Fragment key={topic._id}>
                    <button
                      onClick={() => {
                        console.log('Selected topic:', topic);
                        handleTopicClick(topic._id);
                      }}
                      className={`
                        text-sm mx-3 whitespace-nowrap transition-colors
                        ${selectedTopic === topic._id
                          ? 'text-[#00ffd0] font-semibold'
                          : 'text-white hover:text-gray-300'}
                      `}
                    >
                      {getLocalizedText(topic.name)}
                    </button>
                    {index < topics.length - 1 && (
                      <div className="border-r border-gray-600 h-4" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
        {topicCoursesLoading ? (
          <div className="flex justify-center items-center py-8">
            <FaSpinner className="animate-spin text-2xl text-[#00ffd0]" />
          </div>
        ) : filteredPicks.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {selectedTopic
              ? t('No courses found for this topic')
              : t('No courses available')}
          </div>
        ) : (
          filteredPicks.length < 4 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
      <section className="py-6 px-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{t('Trending Courses')}</h2>
          <button onClick={() => navigate('/all-courses')} className="text-gray-400 hover:text-white">
            {t('View all')}
          </button>
        </div>
        <Slider {...sliderSettings}>
          {getFiltered(trending).map((course, idx) => <CourseCard key={idx} course={course} />)}
        </Slider>
      </section>
      {/* Newly Released */}
      <section className="py-6 px-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{t('Newly Released')}</h2>
          <button onClick={() => navigate('/all-courses')} className="text-gray-400 hover:text-white flex items-center gap-1">
            {t('View all')} <span className="ml-1">&rarr;</span>
          </button>
        </div>
        <Slider {...newlyReleasedSliderSettings} className="newly-released-slider">
          {getFiltered(newlyReleased).map((course, idx) => (
            <div key={idx} className="px-3 py-3">
              <NewlyReleasedCard course={course} />
            </div>
          ))}
        </Slider>
      </section>
      {/* Start with Free Courses */}
      <section className="py-6 px-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{t('Start with free courses')}</h2>
          <button onClick={() => navigate('/all-courses')} className="text-gray-400 hover:text-white">
            {t('View all')}
          </button>
        </div>
        <Slider {...sliderSettings}>
          {getFiltered(freeCourses).map((course, idx) => <CourseCard key={idx} course={course} />)}
        </Slider>
      </section>
      {/* Subscription Section */}
      <section className="py-8 px-6 bg-[#101c1c] my-8 rounded-xl max-w-6xl mx-auto flex items-center justify-between relative overflow-visible">
        {/* Left: Title, subtitle, button */}
        <div className="flex-1 min-w-[260px]">
          <h2 className="text-lg md:text-xl font-bold mb-1">{t('Subscribe for a great price')}</h2>
          <p className="text-gray-400 mb-4 text-sm md:text-base">
            {t('And get access to all almentor courses whenever you like')}
          </p>
          <button
            onClick={handleSubscribe}
            disabled={!selectedPlan || subscriptionLoading}
            className={`
              bg-transparent border border-gray-400 text-white px-4 py-2 rounded 
              transition hover:bg-gray-800
              ${(!selectedPlan || subscriptionLoading) ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {subscriptionLoading ? (
              <span className="flex items-center gap-2">
                <FaSpinner className="animate-spin" />
                {t('Loading...')}
              </span>
            ) : (
              t('Choose Plan')
            )}
          </button>
        </div>

        {/* Center: Plans */}
        <div className="flex-1 flex justify-center items-center gap-2 md:gap-4">
          {subscriptionLoading ? (
            <div className="flex items-center justify-center w-full py-8">
              <FaSpinner className="animate-spin text-2xl text-[#00ffd0]" />
            </div>
          ) : subscriptionError ? (
            <div className="text-red-500 text-center w-full">
              {subscriptionError}
            </div>
          ) : subscriptionPlans.length === 0 ? (
            <div className="text-gray-400 text-center w-full">
              {t('No subscription plans available')}
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
                  className={`
                    cursor-pointer transition
                    ${isSelected
                      ? 'bg-[#1e2b2b] border-2 border-[#00ffd0] shadow-lg'
                      : 'bg-[#181f1f] border-2 border-transparent'}
                    rounded-lg p-4 w-32 md:w-40 flex flex-col items-center relative
                  `}
                >
                  <p className="text-xs mb-1 text-gray-300">{getLocalizedText(plan.name)}</p>
                  <div className="flex items-baseline mb-1">
                    {oldPrice && (
                      <span className="text-xs text-gray-500 line-through mr-1">
                        {oldPrice} {currency}
                      </span>
                    )}
                    <span className={`text-xl md:text-2xl font-bold ${isSelected ? 'text-[#00ffd0]' : ''}`}>
                      {price}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">
                      {currency}/{period}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{getLocalizedText(plan.description)}</p>
                  {plan.isBestValue && isSelected && (
                    <span className="absolute top-2 right-2 bg-[#00ffd0] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {t('Best Value')}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
      {/* Popular Courses */}
      <section className="py-6 px-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Popular Courses</h2>
          <button onClick={() => navigate('/all-courses')} className="text-gray-400 hover:text-white">View all</button>
        </div>
        <Slider {...sliderSettings}>
          {getFiltered(allCourses).map((course, idx) => <CourseCard key={idx} course={course} />)}
        </Slider>
      </section>
      {/* Instructors Section */}
      <section className="py-10 px-6 mx-auto mt-6">
        <h2 className="text-2xl font-bold mb-6">Our Instructors</h2>
        <div className="max-w-6xl mx-auto">
          <Slider {...sliderSettings}>
            {instructors.map((instructor, index) => (
              <InstructorCard key={index} instructor={instructor} />
            ))}
          </Slider>
        </div>
        <div className="text-center mt-8">
          <button
            className="rounded px-6 py-2 border border-white text-white hover:bg-white hover:text-black transition"
            onClick={() => navigate('/instructors')}
          >
            See all instructors
          </button>
        </div>
      </section>
    </div>
  );
};

export default Courses;