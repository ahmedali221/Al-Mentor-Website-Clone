import React from 'react';
import Slider from 'react-slick';
import './home.css';
import Footer from '../Footer/footer';
import { RiArrowDropLeftLine, RiArrowDropRightLine } from "react-icons/ri";
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

const courses = [
  {
    title: {
      en: 'Web Development Fundamentals',
      ar: 'أساسيات تطوير الويب'
    },
    author: 'Dr. Mohamed Taha',
    image: '/6ab7792b9ab289b6f769320908ae9509fc9414d6227502ba91c8fa92c9653672.png',
  },
  {
    title: {
      en: '10 Lessons in Relationships',
      ar: '10 دروس في العلاقات'
    },
    author: 'Dr. Mohamed Taha',
    image: '/6ab7792b9ab289b6f769320908ae9509fc9414d6227502ba91c8fa92c9653672.png',
  },
  {
    title: {
      en: 'Using AI in Marketing',
      ar: 'استخدام الذكاء الاصطناعي في التسويق'
    },
    author: 'Yasser Challab',
    image: '/8fbe3dff646e4bfe263fd3ceaa4a3f5f3eb1494e7234329d9b284999a1cdcc45.png',
  },
  {
    title: {
      en: 'A Complete ChatGPT Guide for Beginners',
      ar: 'دليل ChatGPT الكامل للمبتدئين'
    },
    author: 'Moamen Said',
    image: '/d62db8e9f11d966ce06b8bee1c686ae03cd99bc333e37c592b0c0e9c7438326a.png',
  },
  {
    title: {
      en: 'When Overthinking Becomes a Problem',
      ar: 'عندما يصبح التفكير المفرط مشكلة'
    },
    author: 'Dr. Emad Rashad',
    image: '/a88f64170e91197c47ab8e1579feb030b269703aa39cc13685947b3f07528b9b.png',
  },
  {
    title: {
      en: 'English from Zero to 7',
      ar: 'الإنجليزية من الصفر إلى 7'
    },
    author: 'Dr. Mohamed Taha',
    image: '/97f162368d2c57db95d73f97e702f5cbc900e711d12ea3e40b10b48c65fa2c9f.png',
  },
  {
    title: {
      en: 'Make Peace with Life 2',
      ar: 'تصالح مع الحياة 2'
    },
    author: 'Yasmin',
    image: '/8fbe3dff646e4bfe263fd3ceaa4a3f5f3eb1494e7234329d9b284999a1cdcc45.png',
  },
  {
    title: {
      en: 'The Entrepreneur Gospel',
      ar: 'إنجيل ريادة الأعمال'
    },
    author: 'Ahmed',
    image: '/d62db8e9f11d966ce06b8bee1c686ae03cd99bc333e37c592b0c0e9c7438326a.png',
  },
  {
    title: {
      en: 'Pitching Your Business',
      ar: 'تقديم مشروعك'
    },
    author: 'Sara',
    image: '/0519527e7d12df781d2ea2bc84bba9afde09cadcce8d5e4e393ffb3ea6e2363b.png',
  },
];

const instructors = [
  {
    name: 'Omar El-Monayar',
    title: {
      en: 'Sigma-Fit CEO',
      ar: 'الرئيس التنفيذي لشركة سيجما فيت'
    },
    image: '/public/teacher1.png',
  },
  {
    name: 'Chris Hafner',
    title: {
      en: 'Assistant Professor of Leadership, Business...',
      ar: 'أستاذ مساعد في القيادة والأعمال...'
    },
    image: '/public/teacher2.png',
  },
  {
    name: 'Dr. Maged Iskander',
    title: {
      en: 'Corporate Health and Wellbeing Expert',
      ar: 'خبير الصحة والرفاهية المؤسسية'
    },
    image: '/public/teacher3.png',
  },
  {
    name: 'Chantal Srour',
    title: {
      en: 'TV Presenter, Producer and Publ...',
      ar: 'مقدمة برامج، منتجة وناشرة...'
    },
    image: '/public/teacher4.png',
  },
  {
    name: 'Hossam Refaat',
    title: {
      en: 'Senior Sales Director',
      ar: 'مدير مبيعات أول'
    },
    image: '/public/teacher5.png',
  },
];

const Home = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const currentLang = i18n.language;
  const { theme } = useTheme();

  const categories = [
    'featured',
    'business',
    'technology',
    'arts',
    'wellbeing',
    'lifestyle',
    'education',
    'humanities',
    'family',
    'languages',
    'softSkills'
  ];

  const CustomPrevArrow = ({ onClick }) => (
    <div className={`custom-arrow ${isRTL ? 'right' : 'left'}`} onClick={onClick}>
      <RiArrowDropLeftLine />
    </div>
  );

  const CustomNextArrow = ({ onClick }) => (
    <div className={`custom-arrow ${isRTL ? 'left' : 'right'}`} onClick={onClick}>
      <RiArrowDropRightLine />
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
    rtl: isRTL,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-[#121212]' : 'bg-gray-50'} transition-colors duration-200`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Banner Section */}
      <main
        className={`relative flex items-start justify-start min-h-screen px-6 pt-32 ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-50'} transition-colors duration-200`}
        style={{
          backgroundImage: `url(/banner.webp)`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: '50% 90%',
          marginTop: '3rem',
        }}
      >
        <div className="hero-overlay"></div>
        <div className="banner-shadow"></div>
        <div className={`relative z-20 px-5 py-30 max-w-2xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'} leading-none font-semibold text-xl ${isRTL ? 'mr-10' : 'ml-10'} transition-colors duration-200`}>
          <h1 className={`text-6xl font-bold mb-4 leading-none ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('home.banner.title')}
          </h1>
          <p className={`text-2xl mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {t('home.banner.subtitle')}
          </p>
          <button className="bg-red-500 hover:bg-red-700 text-white px-8 py-6 rounded font-semibold text-xl transition-colors duration-200">
            {t('home.banner.subscribeButton')}
          </button>
        </div>
      </main>

      {/* Courses Section */}
      <section className={`py-10 px-6 ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'} transition-colors duration-200`}>
        <h2 className={`text-4xl font-bold mb-6 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('home.courses.title')}
        </h2>

        {/* Categories */}
        <div className="flex justify-center gap-5 mb-8 flex-wrap max-w-4xl mx-auto">
          {categories.map((category, index) => (
            <button
              key={index}
              className={`${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} px-4 py-2 rounded text-sm font-medium transition-colors duration-200`}
            >
              {t(`home.courses.categories.${category}`)}
            </button>
          ))}
        </div>

        {/* Featured Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {courses.map((course, index) => (
            <div key={index} className={`${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} rounded-lg shadow-md border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-hidden transition-all duration-200`}>
              <img
                src={course.image}
                alt={course.title[currentLang]}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{course.title[currentLang]}</h3>
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{course.author}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Instructors Section */}
      <section className={`py-10 px-6 ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'} mx-auto mt-10 transition-colors duration-200`}>
        <h2 className={`text-4xl font-bold mb-6 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('home.instructors.title')}</h2>
        <div className="max-w-6xl mx-auto">
          <Slider {...sliderSettings}>
            {instructors.map((instructor, index) => (
              <div key={index} className="px-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden shadow">
                  <img
                    src={instructor.image}
                    alt={instructor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className={`text-lg font-semibold mt-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{instructor.name}</h3>
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm`}>{instructor.title[currentLang]}</p>
              </div>
            ))}
          </Slider>
        </div>
      </section>

      {/* New Banner Section */}
      <section className={`relative py-16 ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'} transition-colors duration-200`}>
        <div className="relative z-10 max-w-2xl mx-auto px-1 text-center">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} p-8 rounded-lg shadow-lg transition-colors duration-200`}>
            <h1 className={`text-4xl font-bold mb-3 leading-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('home.cta.title')}
            </h1>
            <p className={`text-2xl mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('home.cta.subtitle')}
            </p>
            <button className="bg-red-500 hover:bg-red-700 text-white px-8 py-4 rounded font-medium text-lg transition-colors duration-200">
              {t('home.cta.button')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
