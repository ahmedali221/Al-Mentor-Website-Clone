import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "./home.css";
import { RiArrowDropLeftLine, RiArrowDropRightLine } from "react-icons/ri";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import axios from "axios";
import { FaBookmark, FaSpinner } from "react-icons/fa";
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const Home = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const isRTL = i18n.language === "ar";
  const currentLang = i18n.language;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [instructors, setInstructors] = useState([]);
  const [loadingInstructors, setLoadingInstructors] = useState(true);
  const [errorInstructors, setErrorInstructors] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [savedCourses, setSavedCourses] = useState([]);
  const [savingCourse, setSavingCourse] = useState(false);

  const [freeCourses, setFreeCourses] = useState([]);
  const [trendingCourses, setTrendingCourses] = useState([]);
  const [loadingFreeCourses, setLoadingFreeCourses] = useState(true);
  const [loadingTrendingCourses, setLoadingTrendingCourses] = useState(true);

  // Fetch saved courses
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
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        toast.error(t('Failed to fetch saved courses'));
      }
    };

    fetchSavedCourses();
  }, [user, t]);

  // Toggle save/unsave course
  const toggleSaveCourse = async (courseId, e) => {
    e.stopPropagation();

    if (!user) {
      navigate('/loginPage');
      return;
    }

    if (savingCourse) return;

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
          console.error('Unsave error response:', errorData);
          throw new Error('Failed to unsave course');
        }

        setSavedCourses(prev => prev.filter(id => id !== courseId));
        toast.success(t('Course removed from saved courses'));
      } else {
        // Save course
        const payload = {
          userId: user?._id,
          courseId,
          savedAt: new Date().toISOString()
        };
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
          console.error('Save error response:', data);
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

  // Fetch instructors
  useEffect(() => {
    setLoadingInstructors(true);
    axios
      .get("https://al-mentor-database-production.up.railway.app/api/instructors")
      .then((res) => {
        setInstructors(res.data.data);
      })
      .catch((err) => {
        console.error("Error fetching instructors:", err);
        setErrorInstructors(err.message || "Unknown error");
      })
      .finally(() => {
        setLoadingInstructors(false);
      });
  }, []);

  // Fetch courses
  useEffect(() => {
    axios
      .get("https://al-mentor-database-production.up.railway.app/api/courses")
      .then((res) => {
        const courseData = res.data.data || res.data;
        setAllCourses(courseData);
        setCourses(courseData);

        // Filter for free courses
        setLoadingFreeCourses(true);
        const free = courseData.filter(course => course.isFree);
        setFreeCourses(free);
        setLoadingFreeCourses(false);

        // Filter for trending courses
        setLoadingTrendingCourses(true);
        const trending = courseData.slice(0, 10);
        setTrendingCourses(trending);
        setLoadingTrendingCourses(false);
      })
      .catch((err) => {
        console.error("Error fetching courses:", err);
        setLoadingFreeCourses(false);
        setLoadingTrendingCourses(false);
      });
  }, []);

  // Fetch programs
  useEffect(() => {
    axios
      .get("https://al-mentor-database-production.up.railway.app/api/programs")
      .then((res) => {
        const programData = res.data.data || res.data;
        setPrograms(programData);
      })
      .catch((err) => console.error("Error fetching programs:", err));
  }, []);

  // Fetch categories
  useEffect(() => {
    axios
      .get("https://al-mentor-database-production.up.railway.app/api/category")
      .then((res) => setCategories(res.data.data))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  // Handle category selection
  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    const filteredCourses = categoryId
      ? allCourses.filter((course) => course.category === categoryId)
      : allCourses;
    setCourses(filteredCourses);
  };

  // Custom arrow components for the slider
  const CustomPrevArrow = ({ onClick }) => (
    <div className="custom-arrow left" onClick={onClick}>
      <RiArrowDropLeftLine size={50} />
    </div>
  );

  const CustomNextArrow = ({ onClick }) => (
    <div className="custom-arrow right" onClick={onClick}>
      <RiArrowDropRightLine size={50} />
    </div>
  );

  // Slider configuration
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 6,
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

  // Course slider configuration (4 items per slide)
  const courseSliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  // Helper function to get localized text
  const getLocalizedText = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[currentLang] || obj.en || '';
  };

  // Course card component for sliders
  const CourseCard = ({ course }) => {
    if (!course) return null;

    const title = getLocalizedText(course?.title);
    const instructorProfile = course.instructorDetails?.profile ||
      (course.instructor?.user || course.instructor || {});
    const instructorName = instructorProfile
      ? `${getLocalizedText(instructorProfile.firstName)} ${getLocalizedText(instructorProfile.lastName)}`
      : 'Unknown Instructor';
    const image = course.thumbnail || '/default-course-img.png';
    const isNew = course.isNew || false;

    return (
      <div
        className="course-card mx-2 relative cursor-pointer transition-transform duration-200 hover:scale-100"
        onClick={() => navigate(`/courses/${course._id}`)}
      >
        <div className={`rounded-lg overflow-hidden shadow-lg ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
          <div className="relative">
            <img src={image} alt={title} className="w-full h-40 object-cover" />
            {isNew && (
              <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                {t('New')}
              </span>
            )}
            {course.isFree && (
              <span className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                {t('home.freespan')}
              </span>
            )}
          </div>
          <div className="p-4">
            <h3 className={`text-base font-semibold mb-1 h-12 overflow-hidden ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              {title}
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {instructorName}
            </p>
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center">
                <span className="text-yellow-500 mr-1">★★★★★</span>
              </div>
              <button
                className={`bg-transparent border-none p-0 ml-2 ${savingCourse ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={(e) => toggleSaveCourse(course._id, e)}
                disabled={savingCourse}
              >
                <FaBookmark className={savedCourses.includes(course._id) ? "text-red-600" : theme === 'dark' ? "text-white" : "text-gray-600"} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Apply theme and RTL direction
  const containerClassName = `${theme === "dark" ? "bg-[#121212] text-white" : "bg-white text-black"}`;

  return (
    <div className={containerClassName} dir={isRTL ? "rtl" : "ltr"}>
      {/* Banner Section */}
      <section className={`relative px-20 pt-32 ${theme === "dark" ? "bg-[#121212]" : "bg-white"}`}>
        <div
          className="relative rounded-xl overflow-hidden max-w-[1500] mx-auto"

        >
          <img
            src="/authorized-home-banner.jpg"
            alt="banner"
            className="w-full h-auto object-cover opacity-60 rounded-xl"
            style={{ maxHeight: "800px" }}
          />
          <div className="absolute inset-0 flex flex-col justify-center items-start p-10 text-white z-10">
            <h1 className={`text-4xl font-bold mb-4 leading-none ${theme === "dark" ? "text-white" : "text-black"}`}>
              {t("home2.banner.title")}
            </h1>
            <p className={`text-2xl mb-8  ${theme === "dark" ? "text-gray-300" : "text-[#000000]"}`}>
              {t("home2.banner.subtitle")}
            </p>
            <button className="bg-red-500 hover:bg-red-700 text-white px-8 py-4 rounded font-semibold text-lg"
              onClick={() => navigate('/subscribe')}>
              {t("home2.banner.subscribeButton")}
            </button>
          </div>
        </div>
      </section>

      {/* Trending Courses Section */}
      <section className="py-20 px-20">
        <div className="flex justify-between items-center mb-6 max-w-[1500] mx-auto">
          <h2 className="text-3xl font-bold px-10">{t('home.trend')}</h2>
          <button
            onClick={() => navigate('/all-courses')}
            className={`text-sm px-10 py-2 rounded transition ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}
          >
            {t('buttons.viewAll')}
          </button>
        </div>
        {loadingTrendingCourses ? (
          <div className="text-center py-8">
            <p>{t('Loading trending courses...')}</p>
          </div>
        ) : trendingCourses.length === 0 ? (
          <div className="text-center py-8">
            <p>{t('No trending courses available')}</p>
          </div>
        ) : (
          <div className="max-w-[1500] mx-auto">
            <Slider className="px-10" {...courseSliderSettings}>
              {trendingCourses.map((course, idx) => (
                <CourseCard key={idx} course={course} />
              ))}
            </Slider>
          </div>
        )}
      </section>

      {/* Free Courses Section */}
      <section className="py-15 px-20 bg-opacity-5">
        <div className="flex justify-between items-center mb-6 max-w-[1500] mx-auto">
          <h2 className="text-3xl font-bold px-10">{t('home.free')}</h2>
          <button
            onClick={() => navigate('/all-courses')}
            className={`text-sm px-10 py-2 rounded transition ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}
          >
            {t('buttons.viewAll')}
          </button>
        </div>
        {loadingFreeCourses ? (
          <div className="text-center py-8">
            <p>{t('Loading free courses...')}</p>
          </div>
        ) : freeCourses.length === 0 ? (
          <div className="text-center py-8">
            <p>{t('No free courses available')}</p>
          </div>
        ) : (
          <div className="max-w-[1500] mx-auto">
            <Slider className="px-10" {...courseSliderSettings}>
              {freeCourses.map((course, idx) => (
                <CourseCard key={idx} course={course} />
              ))}
            </Slider>
          </div>
        )}
      </section>

      {/* Programs Section */}
      <section className={`py-10 px-20`}>
        <h2 className={`text-4xl font-bold mb-6 ${isRTL ? 'mr-20' : 'ml-20'}`}>{t('home2.programs.title')}</h2>
        <h5 className={`text-2xl mb-6 ${isRTL ? 'mr-20' : 'ml-20'}`}>{t('home2.programs.subtitle')}</h5>
        <div className="max-w-[1500] mx-auto">
          <Slider
            gap={20}
            dots={false}
            infinite={true}
            speed={500}
            slidesToShow={2}
            slidesToScroll={1}
            arrows={true}
            prevArrow={<CustomPrevArrow />}
            nextArrow={<CustomNextArrow />}
            responsive={[
              { breakpoint: 1024, settings: { slidesToShow: 2 } },
              { breakpoint: 768, settings: { slidesToShow: 1 } },
              { breakpoint: 480, settings: { slidesToShow: 1 } },
            ]}
            className="px-10"
          >
            {programs.slice(0, 2).map((program, idx) => (
              <div key={idx} className={`rounded-lg shadow-md overflow-hidden ${theme === 'dark' ? 'bg-[#141717]' : 'bg-white'} py-10 min-h-[420px]`}>
                <div className="flex flex-col md:flex-row">
                  <div className="relative md:w-1/3">
                    <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-md flex items-center gap-2">
                      {t('navigation.programs')}
                    </div>
                    <img
                      src={program.thumbnail}
                      alt={program.title[currentLang]}
                      className="w-full h-[300px] object-cover"
                    />
                    <div className="absolute bottom-4 left-4 bg-gray-900/75 text-white px-3 py-1 rounded-md flex items-center gap-2">
                      {program.courses.length} {t('navigation.courses')}
                    </div>
                  </div>
                  <div className="p-8 md:w-2/3">
                    <h2 className="text-2xl font-semibold mb-4">{program.title[currentLang]}</h2>
                    <p className={`mb-6 line-clamp-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {program.description[currentLang]}
                    </p>
                    <button
                      onClick={() => navigate(`/programs/${program._id}`)}
                      className={`inline-block border-2 px-20 py-2 rounded-md transition-colors ${theme === 'dark'
                        ? 'border-gray-300 text-gray-300 hover:bg-gray-700'
                        : ' border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
                        }`}
                    >
                      {t('courses.viewDetails')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-1 px-20">
        <div className="flex justify-center gap-3 mb-8 flex-wrap max-w-[1500] mx-auto text-2xl">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`px-4 py-2 rounded font-semibold transition-colors duration-200
              ${!selectedCategory
                ? "bg-red-600 text-white"
                : theme === "dark"
                  ? "bg-[#252a2a] text-white hover:bg-gray-700"
                  : "bg-[#D4D4D4] text-black hover:bg-gray-300"
              }`}
          >
            {t("Featured Courses")}
          </button>

          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => handleCategoryClick(category._id)}
              className={`px-4 py-2 rounded transition-colors duration-200
                ${selectedCategory === category._id
                  ? "bg-red-600 text-white"
                  : theme === "dark"
                    ? "bg-[#252a2a] text-white hover:bg-gray-700"
                    : "bg-[#D4D4D4] text-black hover:bg-gray-300"
                }`}
            >
              {category.name?.[currentLang] || category.name?.en}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-[1500] mx-auto">
          {courses.map((course, index) => {
            const title = course.title?.[currentLang] || course.title?.en;
            const instructorProfile = course.instructorDetails?.profile ||
              (course.instructor?.user || course.instructor || {});
            const instructorName = instructorProfile
              ? `${getLocalizedText(instructorProfile.firstName)} ${getLocalizedText(instructorProfile.lastName)}`
              : 'Unknown Instructor';
            const image = course.thumbnail || "/default-course-img.png";

            return (
              <div
                key={index}
                className={`rounded shadow-sm overflow-hidden border transition-all duration-200 cursor-pointer
                ${theme === "dark"
                    ? "bg-[#2a2a2a] border-gray-700 text-white"
                    : "bg-gray-100 border-gray-200 text-black"
                  }`}
                onClick={() => navigate(`/courses/${course._id}`)}
              >
                <div className="relative">
                  <img
                    src={image}
                    alt={title}
                    className="w-full h-64 object-cover"
                  />
                  {course.isFree && (
                    <span className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                      {t('home.freespan')}
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    {instructorName}
                  </p>
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-1">★★★★★</span>
                    </div>
                    <button
                      className={`bg-transparent border-none p-0 ml-2 ${savingCourse ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={(e) => toggleSaveCourse(course._id, e)}
                      disabled={savingCourse}
                    >
                      <FaBookmark className={savedCourses.includes(course._id) ? "text-red-600" : theme === 'dark' ? "text-white" : "text-gray-600"} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/courses")}
            className={`rounded px-20 py-2 border-2 transition text-3xl ${theme === "dark"
              ? "bg-transparent text-white border-white hover:bg-white hover:text-black"
              : "bg-transparent text-black border-black hover:bg-black hover:text-white"
              }`}
          >
            {t("buttons.courses")}
          </button>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`relative py-16 ${theme === "dark" ? "bg-[##121212] text-white" : "bg-[#ffffff] text-black"}`}>
        <div className="relative z-10 max-w-2xl mx-auto px-1 text-center">
          <div className="p-8">
            <h1 className="text-4xl font-bold mb-3 leading-tight">
              {t("home.cta.title")}
            </h1>

            <button
              onClick={() => navigate('/subscribe')}
              className="bg-red-500 hover:bg-red-700 text-white px-8 py-4 my-5 rounded font-medium text-lg">
              {t("home.cta.button")}
            </button>
          </div>
        </div>
      </section>

      {/* Instructors Section */}
      <section className="py-10 px-20 mx-auto mt-10">
        <h2 className="text-4xl font-bold mb-6 text-center">
          {t("home.instructors.title")}
        </h2>

        {loadingInstructors ? (
          <p className="text-center text-xl my-10">
            {t("Loading Instructors")}...
          </p>
        ) : errorInstructors ? (
          <p className="text-center text-red-500 my-10">
            {t("Failed to load instructors")}: {errorInstructors}
          </p>
        ) : (
          <div className="max-w-[1500] mx-auto">
            <Slider className="px-10" {...sliderSettings}>
              {instructors.map((instructor, index) => {
                const profile = instructor.profile || instructor.user || instructor;
                const name = `${profile.firstName?.[currentLang] || profile.firstName?.en || ''} ${profile.lastName?.[currentLang] || profile.lastName?.en || ''}`.trim() || 'Unknown Instructor';
                const title = instructor.professionalTitle?.[currentLang] || instructor.professionalTitle?.en || '';
                const image = profile.profilePicture || '/default-profile.png';

                return (
                  <div key={index} className="px-4 min-h-72 flex flex-col items-center justify-start">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden shadow">
                      <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <h3 className="text-lg font-semibold mt-4 text-center">
                      {name}
                    </h3>
                    <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"} text-sm text-center`}>
                      {title}
                    </p>
                  </div>
                );
              })}
            </Slider>
          </div>
        )}

        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/instructors")}
            className={`rounded px-20 py-2 border-2 transition text-3xl ${theme === "dark"
              ? "bg-transparent text-white border-white hover:bg-white hover:text-black"
              : "bg-transparent text-black border-black hover:bg-black hover:text-white"
              }`}
          >
            {t("buttons.instructors")}
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;