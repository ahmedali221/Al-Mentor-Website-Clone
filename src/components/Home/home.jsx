/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import './home.css';
import { RiArrowDropLeftLine, RiArrowDropRightLine } from "react-icons/ri";
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Home = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isRTL = i18n.language === 'ar';
  const currentLang = i18n.language;

  const [instructors, setInstructors] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [errorCourses, setErrorCourses] = useState(null);
  const [loadingInstructors, setLoadingInstructors] = useState(true);
  const [errorInstructors, setErrorInstructors] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        const res = await fetch('https://al-mentor-database-production.up.railway.app/api/courses');
        if (!res.ok) throw new Error('Failed to fetch courses');
        const data = await res.json();
        setAllCourses(data.data || data);
        setCourses(data.data || data);
      } catch (error) {
        setErrorCourses(error.message);
        setAllCourses([]);
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    fetch('https://al-mentor-database-production.up.railway.app/api/category')
      .then(res => res.json())
      .then(data => setCategories(data.data || []))
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  useEffect(() => {
    const fetchInstructors = async () => {
      setLoadingInstructors(true);
      try {
        const res = await fetch('https://al-mentor-database-production.up.railway.app/api/instructors');
        if (!res.ok) throw new Error('Failed to fetch instructors');
        const data = await res.json();
        setInstructors(data.data || []);
      } catch (error) {
        setErrorInstructors(error.message);
        setInstructors([]);
      } finally {
        setLoadingInstructors(false);
      }
    };
    fetchInstructors();
  }, []);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    const filtered = categoryId
      ? allCourses.filter(course => course.category === categoryId)
      : allCourses;
    setCourses(filtered);
  };

  const handleCourseClick = (courseId) => {
    if (!user) {
      toast.info(t('messages.pleaseLogin'));
      navigate('/loginPage');
      return;
    }
    navigate(`/courses/${courseId}`);
  };

  const handleSubscribeClick = () => {
    if (!user) {
      toast.info(t('messages.pleaseLogin'));
      navigate('/loginPage');
      return;
    }
    navigate('/subscribe');
  };

  const handleViewAllCourses = () => {
    if (!user) {
      toast.info(t('messages.pleaseLogin'));
      navigate('/loginPage');
      return;
    }
    navigate('/courses');
  };

  const handleViewAllInstructors = () => {
    if (!user) {
      toast.info(t('messages.pleaseLogin'));
      navigate('/loginPage');
      return;
    }
    navigate('/instructors');
  };

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

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
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

  return (
    <div className={`${theme === 'dark' ? 'bg-[#1A1A1A] text-white' : 'bg-white text-black'}`} dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Banner Section */}
      <main className="relative flex items-start justify-start min-h-screen px-6 pt-32" style={{
        backgroundImage: `url(/banner.webp)`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '50% 90%',
        marginTop: '3rem',
      }}>
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="banner-shadow"></div>
        <div className={`relative z-20 px-5 py-30 max-w-2xl text-white leading-none font-semibold text-xl ${isRTL ? 'mr-10' : 'ml-10'}`}>
          <h1 className="text-6xl font-bold mb-4 leading-none">{t('home.banner.title')}</h1>
          <p className="text-2xl mb-8 text-gray-300">{t('home.banner.subtitle')}</p>
          <button
            onClick={handleSubscribeClick}
            className="bg-red-500 hover:bg-red-700 text-white px-8 py-6 rounded font-semibold text-xl transition-colors"
          >
            {t('home.banner.subscribeButton')}
          </button>
        </div>
      </main>

      {/* Courses Section */}
      <section className="py-1 px-6">
        <h2 className="text-[60px] leading-[60px] font-bold text-center font-inter mb-6">
          {t('home.courses.title')}
        </h2>

        {/* Category Buttons */}
        <div className="flex justify-center gap-3 mb-8 flex-wrap max-w-4xl mx-auto text-2xl">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`px-4 py-2 rounded transition-colors duration-200 font-semibold
              ${!selectedCategory
                ? 'bg-red-600 text-white'
                : theme === 'dark'
                  ? 'bg-gray-800 text-white hover:bg-gray-700'
                  : 'bg-[#D4D4D4] text-black hover:bg-gray-300'}`}
          >
            {t('Featured Courses')}
          </button>

          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => handleCategoryClick(category._id)}
              className={`px-4 py-2 rounded transition-colors duration-200 font-semibold
                ${selectedCategory === category._id
                  ? 'bg-red-600 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-800 text-white hover:bg-gray-700'
                    : 'bg-[#D4D4D4] text-black hover:bg-gray-300'}`}
            >
              {category.name?.[currentLang] || category.name?.en}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        {loadingCourses ? (
          <p className="text-center text-xl my-10">{t('Loading Courses')}...</p>
        ) : errorCourses ? (
          <p className="text-center text-red-500 my-10">{t('Failed to load courses')}: {errorCourses}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {courses.map((course, index) => {
              const instructorObj = instructors.find(inst => inst._id === course.instructor);
              let instructorName = 'Unknown Instructor';
              let instructorImage = '/default-profile.png';

              if (instructorObj) {
                const profile = instructorObj.profile || instructorObj.user || instructorObj;
                instructorName = `${profile.firstName?.[currentLang] || profile.firstName?.en || ''} ${profile.lastName?.[currentLang] || profile.lastName?.en || ''}`.trim() || 'Unknown Instructor';
                instructorImage = profile.profilePicture || '/default-profile.png';
              }

              const title = course.title?.[currentLang] || course.title?.en;
              const image = course.thumbnail || '/default-course-img.png';

              return (
                <div
                  key={index}
                  onClick={() => handleCourseClick(course._id)}
                  className={`rounded shadow-sm overflow-hidden border transition-all duration-200 cursor-pointer hover:shadow-lg
                    ${theme === 'dark'
                      ? 'bg-[#2a2a2a] border-gray-700 text-white hover:bg-[#333333]'
                      : 'bg-gray-100 border-gray-200 text-black hover:bg-gray-200'}`}
                >
                  <img src={image} alt={title} className="w-full h-64 object-cover" />
                  <div className="p-6">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-2`}>{instructorName}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center mt-8">
          <button
            onClick={handleViewAllCourses}
            className={`rounded px-6 py-2 border-2 transition text-3xl cursor-pointer ${theme === 'dark'
              ? 'bg-transparent text-white border-white hover:bg-white hover:text-black'
              : 'bg-transparent text-black border-black hover:bg-black hover:text-white'
              }`}
          >
            {t('buttons.courses')}
          </button>
        </div>
      </section>

      {/* Instructors Section */}
      <section className="py-10 px-6 mx-auto mt-10">
        <h2 className="text-4xl font-bold mb-6 text-center">{t('home.instructors.title')}</h2>

        {loadingInstructors ? (
          <p className="text-center text-xl my-10">{t('Loading Instructors')}...</p>
        ) : errorInstructors ? (
          <p className="text-center text-red-500 my-10">{t('Failed to load instructors')}: {errorInstructors}</p>
        ) : (
          <div className="max-w-7xl mx-auto">
            <Slider {...sliderSettings}>
              {instructors.map((instructor, index) => {
                const profile = instructor.profile || instructor.user || instructor;
                const name = `${profile.firstName?.[currentLang] || profile.firstName?.en || ''} ${profile.lastName?.[currentLang] || profile.lastName?.en || ''}`.trim() || 'Unknown Instructor';
                const title = instructor.professionalTitle?.[currentLang] || instructor.professionalTitle?.en || '';
                const image = profile.profilePicture || '/default-profile.png';

                return (
                  <div
                    key={index}
                    onClick={() => handleCourseClick(instructor._id)}
                    className="px-4 min-h-72 flex flex-col items-center justify-start cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden shadow">
                      <img src={image} alt={name} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-lg font-semibold mt-4 text-center">{name}</h3>
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm text-center`}>
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
            onClick={handleViewAllInstructors}
            className={`rounded px-6 py-2 border-2 transition text-3xl cursor-pointer ${theme === 'dark'
              ? 'bg-transparent text-white border-white hover:bg-white hover:text-black'
              : 'bg-transparent text-black border-black hover:bg-black hover:text-white'
              }`}
          >
            {t('buttons.instructors')}
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
