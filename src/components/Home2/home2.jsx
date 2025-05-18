import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "./home.css";
import { RiArrowDropLeftLine, RiArrowDropRightLine } from "react-icons/ri";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import axios from "axios";
import { BookOpenIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const Home = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const isRTL = i18n.language === "ar";
  const currentLang = i18n.language;
  const navigate = useNavigate();

  // State hooks for API data storage
  const [instructors, setInstructors] = useState([]);
  const [loadingInstructors, setLoadingInstructors] = useState(true);
  const [errorInstructors, setErrorInstructors] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fetch instructors data
  useEffect(() => {
    setLoadingInstructors(true);
    axios
      .get("/api/instructors")
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

  // Fetch courses data
  useEffect(() => {
    axios
      .get("/api/courses")
      .then((res) => {
        const courseData = res.data.data || res.data;
        setAllCourses(courseData);
        setCourses(courseData);
      })
      .catch((err) => console.error("Error fetching courses:", err));
  }, []);

  // Fetch programs data
  useEffect(() => {
    axios
      .get("/api/programs")
      .then((res) => {
        const programData = res.data.data || res.data;
        setPrograms(programData);
      })
      .catch((err) => console.error("Error fetching programs:", err));
  }, []);

  // Fetch categories data
  useEffect(() => {
    axios
      .get("/api/category")
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

  // Apply theme and RTL direction
  const containerClassName = `${
    theme === "dark" ? "bg-[#121212] text-white" : "bg-white text-black"
  }`;

  return (
    <div className={containerClassName} dir={isRTL ? "rtl" : "ltr"}>
      {/* Banner Section */}
      <main
        className="relative flex items-start justify-start min-h-screen px-6 pt-32"
        style={{
          backgroundImage: `url(/banner.webp)`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "50% 90%",
          marginTop: "3rem",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="banner-shadow"></div>

        <div
          className={`relative z-20 px-5 py-30 max-w-2xl text-white leading-none font-semibold text-xl ${
            isRTL ? "mr-20" : "ml-20"
          }`}
        >
          <h1 className="text-4xl font-bold mb-4 leading-none">
            {t("home2.banner.title")}
          </h1>
          <p className="text-2xl mb-8 text-gray-300">
            {t("home2.banner.subtitle")}
          </p>
          <button className="bg-red-500 hover:bg-red-700 text-white px-8 py-6 rounded font-semibold text-l">
            {t("home2.banner.subscribeButton")}
          </button>
        </div>
      </main>

      {/* Programs Section */}
      <section className={`py-10 px-6`}>
  <h2 className={`text-4xl font-bold mb-6 ${isRTL ? 'mr-20' : 'ml-20'}`}>{t('home2.programs.title')}</h2>
  <h5 className={`text-2xl  mb-6 ${isRTL ? 'mr-20' : 'ml-20'}`}>{t('home2.programs.subtitle')}</h5>
  <div className="max-w-6xl mx-auto">
    <Slider
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
      {programs.map((program, idx) => (
        <div key={idx} className={`rounded-lg shadow-md overflow-hidden ${theme === 'dark' ? 'bg-[#141717]' : 'bg-white'}py-10 `}>
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
                className={`inline-block border-2 px-6 py-2 rounded-md transition-colors ${theme === 'dark'
                  ? 'border-gray-300 text-gray-300 hover:bg-gray-700'
                  : ' border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
                  }`}
              >
                {t('courses.viewDetails')}
              </button>
            </div>
          </div>
        </div>
      )).slice(0, 2)} {/* Render only the first 2 programs */}
    </Slider>
  </div>
</section>

      {/* Courses Section */}
      <section className={`py-10 px-6`}>
        <h2 className={`text-4xl font-bold mb-6 ${isRTL ? "mr-20" : "ml-20"}`}>
          {t("home2.courses.title")}
        </h2>
        <div className="max-w-6xl mx-auto relative">
        <Slider
  dots={false}
  infinite={true}
  speed={500}
  slidesToShow={4}
  slidesToScroll={1}
  arrows={true}
  prevArrow={<CustomPrevArrow />}
  nextArrow={<CustomNextArrow />}
  responsive={[
    { breakpoint: 1024, settings: { slidesToShow: 3 } },
    { breakpoint: 768, settings: { slidesToShow: 2 } },
    { breakpoint: 480, settings: { slidesToShow: 1 } },
  ]}
  className="px-10" // Add horizontal padding to the entire slider container
>
  {courses.map((course, index) => {
    const title = course.title?.[currentLang] || course.title?.en;
    const instructor = course.instructor?.user;
    const instructorName = instructor
      ? `${instructor.firstName?.[currentLang] || instructor.firstName?.en || ''} ${instructor.lastName?.[currentLang] || instructor.lastName?.en || ''}`
      : 'Unknown Instructor';
    const image = course.thumbnail || '/default-course-img.png';

    return (
      <div
        key={index}
        className={`rounded-xl shadow-lg overflow-hidden border border-gray-300 relative transition-all duration-200 gap-20
          ${theme === 'dark' ? 'bg-[#1e1e1e] border-gray-800 text-white' : 'bg-white border-gray-300 text-black'}
          w-80 h-96 mx-2`}  
      >
        <img src={image} alt={title} className="w-full h-2/3 object-cover" />
        {course.isNew && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold rounded px-2 py-1">
            New
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 rounded-full p-1">
          <BookOpenIcon className="text-white w-6 h-6" />
        </div>
        <div className="p-4 h-1/3 overflow-y-auto">
          <h3 className="text-lg font-bold">{title}</h3>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm`}>
            {instructorName}
          </p>
        </div>
      </div>
    );
  })}
</Slider>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-1 px-6">
        <h2 className="text-[60px] leading-[60px] font-bold text-center font-inter mb-6"></h2>

        {/* Category Buttons */}
        <div className="flex justify-center gap-3 mb-8 flex-wrap max-w-4xl mx-auto text-2xl">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`px-4 py-2 rounded font-semibold transition-colors duration-200
              ${
                !selectedCategory
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
                ${
                  selectedCategory === category._id
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

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {courses.map((course, index) => {
            const title = course.title?.[currentLang] || course.title?.en;
            const instructor = course.instructor?.user;
            const instructorName = instructor
              ? `${
                  instructor.firstName?.[currentLang] ||
                  instructor.firstName?.en ||
                  ""
                } ${
                  instructor.lastName?.[currentLang] ||
                  instructor.lastName?.en ||
                  ""
                }`
              : "Unknown Instructor";
            const image = course.thumbnail || "/default-course-img.png";

            return (
              <div
                key={index}
                className={`rounded shadow-sm overflow-hidden border transition-all duration-200 
                ${
                  theme === "dark"
                    ? "bg-[#2a2a2a] border-gray-700 text-white"
                    : "bg-gray-100 border-gray-200 text-black"
                }`}
              >
                <img
                  src={image}
                  alt={title}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p
                    className={`${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {instructorName}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/courses")}
            className={`rounded px-6 py-2 border-2 transition text-3xl ${
              theme === "dark"
                ? "bg-transparent text-white border-white hover:bg-white hover:text-black"
                : "bg-transparent text-black border-black hover:bg-black hover:text-white"
            }`}
          >
            {t("See all courses")}
          </button>
        </div>
      </section>

      {/* Instructors Section */}
      <section className="py-10 px-6 mx-auto mt-10">
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
          <div className="max-w-6xl mx-auto">
            <Slider {...sliderSettings}>
              {instructors.map((instructor, index) => {
                const profile = instructor.profile || {};
                const name = `${profile.firstName?.[currentLang] || ""} ${
                  profile.lastName?.[currentLang] || ""
                }`;
                const title = instructor.professionalTitle?.[currentLang] || "";
                const image = profile.profilePicture || "/default-profile.png";

                return (
                  <div
                    key={index}
                    className="px-4 min-h-72 flex flex-col items-center justify-start"
                  >
                    <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden shadow">
                      <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-lg font-semibold mt-4 text-center">
                      {name}
                    </h3>
                    <p
                      className={`${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      } text-sm text-center`}
                    >
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
            className={`rounded px-6 py-2 border-2 transition text-3xl ${
              theme === "dark"
                ? "bg-transparent text-white border-white hover:bg-white hover:text-black"
                : "bg-transparent text-black border-black hover:bg-black hover:text-white"
            }`}
          >
            {t("See all instructors")}
          </button>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className={`relative py-16 ${
          theme === "dark"
            ? "bg-[#1a1a1a] text-white"
            : "bg-gray-100 text-black"
        }`}
      >
        <div className="relative z-10 max-w-2xl mx-auto px-1 text-center">
          <div className="p-8">
            <h1 className="text-4xl font-bold mb-3 leading-tight">
              {t("home.cta.title")}
            </h1>
            <p
              className={`text-2xl mb-6 ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {t("home.cta.subtitle")}
            </p>
            <button className="bg-red-500 hover:bg-red-700 text-white px-8 py-4 rounded font-medium text-lg">
              {t("home.cta.button")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;