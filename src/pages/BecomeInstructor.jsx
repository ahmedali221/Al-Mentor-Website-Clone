import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins, faHeadset, faGlobe, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

function BecomeInstructor() {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAlreadyInstructor, setIsAlreadyInstructor] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const isRTL = i18n.language === "ar";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Check if user is already an instructor
    const checkInstructorStatus = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/instructors?page=1&limit=100`);
        const data = await response.json();

        if (data.success) {
          const isInstructor = data.data.some(instructor => instructor.user === user._id);
          console.log("Is user already an instructor:", isInstructor);
          setIsAlreadyInstructor(isInstructor);
        }
      } catch (error) {
        console.error("Error checking instructor status:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkInstructorStatus();
  }, [user, navigate]);

  const onSubmit = async (data) => {
    if (!user) {
      toast.error(t("messages.loginRequired"));
      navigate("/login");
      return;
    }

    if (isAlreadyInstructor) {
      toast.error(t("messages.alreadyInstructor"));
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("userId", user._id);
      formData.append("professionalTitle", data.professionalTitle);
      formData.append("bio", data.bio);
      formData.append("expertise", data.expertise);
      formData.append("experience", data.experience);
      formData.append("education", data.education);
      formData.append("certifications", data.certifications);
      formData.append("languages", data.languages);
      formData.append("availability", data.availability);
      formData.append("hourlyRate", data.hourlyRate);
      formData.append("resume", data.resume[0]);
      formData.append("profilePicture", data.profilePicture[0]);

      const response = await fetch("http://localhost:5000/api/instructors", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success(t("messages.instructorApplicationSubmitted"));
        navigate("/instructors");
      } else {
        toast.error(result.message || t("messages.applicationSubmissionFailed"));
      }
    } catch (error) {
      toast.error(t("messages.errorSubmittingApplication"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isChecking) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#1A1A1A] text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4">{t('loading', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  if (isAlreadyInstructor) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#1A1A1A] text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Instructor Profile Section */}
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative">
                <img
                  src={user?.profilePicture || "https://via.placeholder.com/150"}
                  alt={user?.firstName}
                  className="w-32 h-32 rounded-full object-cover border-4 border-red-500"
                />
                <div className="absolute bottom-0 right-0 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold mb-2">{`${user?.firstName} ${user?.lastName}`}</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-4">{user?.professionalTitle || t('instructorDashboard.defaultTitle')}</p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-sm text-gray-500 dark:text-gray-400">0 {t('instructorDashboard.totalStudents')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="text-sm text-gray-500 dark:text-gray-400">0 {t('instructorDashboard.totalCourses')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <span className="text-sm text-gray-500 dark:text-gray-400">0.0 {t('instructorDashboard.rating')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('instructorDashboard.totalStudents')}</p>
                  <h3 className="text-2xl font-bold mt-1">0</h3>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('instructorDashboard.totalCourses')}</p>
                  <h3 className="text-2xl font-bold mt-1">0</h3>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('instructorDashboard.totalRevenue')}</p>
                  <h3 className="text-2xl font-bold mt-1">$0</h3>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
                  <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('instructorDashboard.rating')}</p>
                  <h3 className="text-2xl font-bold mt-1">0.0</h3>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <button
              onClick={() => navigate('/create-course')}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-left hover:shadow-xl transition-shadow ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            >
              <div className="flex items-center">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{t('instructorDashboard.createCourse')}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('instructorDashboard.createCourseDesc')}</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/my-courses')}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-left hover:shadow-xl transition-shadow ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            >
              <div className="flex items-center">
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{t('instructorDashboard.myCourses')}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('instructorDashboard.myCoursesDesc')}</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/instructor-profile')}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-left hover:shadow-xl transition-shadow ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            >
              <div className="flex items-center">
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{t('instructorDashboard.editProfile')}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('instructorDashboard.editProfileDesc')}</p>
                </div>
              </div>
            </button>
          </div>

          {/* Recent Activity */}
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <h2 className="text-xl font-bold mb-4">{t('instructorDashboard.recentActivity')}</h2>
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">{t('instructorDashboard.noActivity')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${theme === 'dark' ? 'bg-[#121212]' : 'bg-white'} w-full min-h-screen`}>
      <Header theme={theme} onApplyClick={() => setIsModalOpen(true)} />
      <CourseProduction theme={theme} />
      <InstructorResources theme={theme} onApplyClick={() => setIsModalOpen(true)} />
      <RevenueSection theme={theme} onApplyClick={() => setIsModalOpen(true)} />
      <AccordionSection theme={theme} />
      {isModalOpen && <MentorApplicationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}

function Header({ theme, onApplyClick }) {
  const { t } = useTranslation();
  const gradient = theme === 'dark' ? 'from-black/70 to-black/40' : 'from-gray-200/50 to-gray-400/50';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const bgOverlay = theme === 'dark' ? 'bg-[#565a5c] bg-opacity-50 text-white' : 'bg-gray-200 bg-opacity-80 text-gray-700';

  return (
    <header
      className={`relative bg-cover bg-center p-50 h-auto flex flex-col justify-center items-center ${textColor}`}
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80')",
      }}
    >
      <div className={`absolute inset-0 bg-gradient-to-b ${gradient}`}></div>
      <div className="relative z-10 p-8 text-center">
        <h1 className="text-4xl font-bold">{t('becomeInstructor.header.title')}</h1>
        <p className="mt-4 text-lg">{t('becomeInstructor.header.description')}</p>
        <button
          onClick={onApplyClick}
          className={`mt-6 px-4 py-2 rounded transition duration-200 ${theme === 'dark' ? 'bg-red-500 text-white hover:bg-red-700' : 'bg-red-500 text-white hover:bg-red-600'
            }`}
        >
          {t('becomeInstructor.header.applyButton')}
        </button>
      </div>
      <div className={`relative z-10 p-6 w-full rounded-lg shadow-md ${bgOverlay}`}>
        <div className="max-w-5xl mx-auto grid gap-6 grid-cols-1 md:grid-cols-3 text-center">
          <BenefitItem
            icon={faCoins}
            title={t('becomeInstructor.benefits.competitiveRevenueShare.title')}
            description={t('becomeInstructor.benefits.competitiveRevenueShare.description')}
            textColor={theme === 'dark' ? 'text-white' : 'text-gray-800'}
          />
          <BenefitItem
            icon={faHeadset}
            title={t('becomeInstructor.benefits.helpSupport.title')}
            description={t('becomeInstructor.benefits.helpSupport.description')}
            textColor={theme === 'dark' ? 'text-white' : 'text-gray-800'}
          />
          <BenefitItem
            icon={faGlobe}
            title={t('becomeInstructor.benefits.worldwideExposure.title')}
            description={t('becomeInstructor.benefits.worldwideExposure.description')}
            textColor={theme === 'dark' ? 'text-white' : 'text-gray-800'}
          />
        </div>
      </div>
    </header>
  );
}

function BenefitItem({ icon, title, description, textColor }) {
  return (
    <div className={`flex flex-col items-center ${textColor}`}>
      <FontAwesomeIcon icon={icon} className="text-4xl mb-2" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm">{description}</p>
    </div>
  );
}

function CourseProduction({ theme }) {
  const { t } = useTranslation();
  const steps = t('becomeInstructor.courseProduction.steps', { returnObjects: true }) || [];
  const bg = theme === 'dark' ? 'bg-[#141717]' : 'bg-gray-100';
  const text = theme === 'dark' ? 'text-white' : 'text-gray-900';

  return (
    <section className={`${bg} ${text} py-12`}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">{t('becomeInstructor.courseProduction.title')}</h2>
        <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
          {steps.map((stepTitle, index) => (
            <div key={index} className="flex flex-col items-center text-center gap-5">
              <img
                src={
                  index === 0
                    ? 'https://www.almentor.net/assets/images/typewriter.svg'
                    : index === 1
                      ? 'https://www.almentor.net/assets/images/videographer.svg'
                      : 'https://www.almentor.net/assets/images/studying.svg'
                }
                alt={stepTitle}
                className="mb-4 h-75 w-70 object-contain"
              />
              <h3 className="text-xl font-bold">
                {index + 1} - {stepTitle}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function InstructorResources({ theme, onApplyClick }) {
  const { t } = useTranslation();
  const bg =
    theme === 'dark'
      ? 'bg-gradient-to-b from-[#132e39] to-[#030608] text-white'
      : 'bg-gradient-to-b from-[#bfd9e4] to-[#f5f9fb] text-gray-900';
  const btnClass =
    theme === 'dark' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-red-500 text-white hover:bg-red-500';

  return (
    <section className={`${bg} py-12 text-center`}>
      <h2 className="text-3xl font-bold">{t('becomeInstructor.instructorResources.title')}</h2>
      <p className="mt-4">{t('becomeInstructor.instructorResources.description')}</p>
      <video controls className="mx-auto mt-8 w-full max-w-3xl h-auto">
        <source src="/vedio.mp4" type="video/mp4" />
        {t('common.videoNotSupported') || 'Your browser does not support the video tag.'}
      </video>
      <button onClick={onApplyClick} className={`mt-6 px-4 py-2 rounded transition duration-200 ${btnClass}`}>
        {t('becomeInstructor.instructorResources.applyButton')}
      </button>
    </section>
  );
}

function RevenueSection({ theme, onApplyClick }) {
  const { t } = useTranslation();
  const bg = theme === 'dark' ? 'bg-black text-white' : 'bg-gray-100 text-gray-900';
  const btnClass =
    theme === 'dark' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-red-500 text-white hover:bg-red-500';

  return (
    <section className={`${bg} py-12 text-center`}>
      <div className="max-w-lg mx-auto">
        <h2 className="text-3xl font-bold mb-4">{t('becomeInstructor.revenueSection.title')}</h2>
        <p className="mb-8">{t('becomeInstructor.revenueSection.description')}</p>
        <div className="flex justify-center mb-8">
          <img src="visual_data.png" alt={t('becomeInstructor.revenueSection.title')} className="max-w-xs" />
        </div>
        <button onClick={onApplyClick} className={`px-8 py-2 rounded transition duration-200 ${btnClass}`}>
          {t('becomeInstructor.revenueSection.applyButton')}
        </button>
      </div>
    </section>
  );
}

function AccordionSection({ theme }) {
  const { t } = useTranslation();
  const faqsObj = t('becomeInstructor.accordionSection.faqs', { returnObjects: true }) || {};
  const faqData = Object.values(faqsObj);
  const bg =
    theme === 'dark'
      ? 'bg-gradient-to-b from-[#2d3d42] to-[#202424] text-white'
      : 'bg-gradient-to-b from-[#eeeeee] to-[#eeeeee] text-gray-900';

  return (
    <section className={`${bg} py-12 px-6`}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold">{t('becomeInstructor.accordionSection.title')}</h2>
        <p className="mt-2 mb-10">{t('becomeInstructor.accordionSection.description')}</p>
        <div className="space-y-4 text-2xl">
          {faqData.map((faq, index) => (
            <Accordion key={index} question={faq.question} answer={faq.answer} theme={theme} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Accordion({ question, answer, theme }) {
  const [isOpen, setIsOpen] = useState(false);
  const borderColor = theme === 'dark' ? 'border-gray-600' : 'border-gray-300';
  const hoverBg = theme === 'dark' ? 'hover:bg-[#2c3c41]' : 'hover:bg-gray-200';

  return (
    <div className={`border-b ${borderColor}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left p-6 text-lg flex justify-between items-center ${hoverBg} transition duration-150`}
      >
        <span className="font-semibold">{question}</span>
        <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
      </button>
      {isOpen && <div className={`bg-transparent text-sm p-6 border-t ${borderColor}`}>{answer}</div>}
    </div>
  );
}

function MentorApplicationModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const auth = useAuth();
  const navigate = useNavigate();
  const i18n = useTranslation().i18n;

  // 👇 إضافة الترجمات المفقودة
  const translations = {
    en: {
      common: {
        videoNotSupported: "Your browser does not support the video tag."
      },
      mentorForm: {

      }
    },
    ar: {
      common: {
        videoNotSupported: "متصفحك لا يدعم تشغيل الفيديو"
      },
      mentorForm: {
        // ... existing translations ...
      }
    }
  };

  useEffect(() => {
    Object.keys(translations).forEach(lang => {
      i18n.addResourceBundle(lang, 'translation', translations[lang], true, true);
    });
  }, [i18n]);

  useEffect(() => {
    if (auth.user) {
      const updatedFields = {
        ...fields,
        firstName: auth.user.firstName?.en || auth.user.firstName || '',
        lastName: typeof auth.user.lastName === 'object'
          ? (auth.user.lastName?.en || auth.user.lastName?.ar || '')
          : (auth.user.lastName || ''),
        email: auth.user.email || ''
      };
      setFields(updatedFields);
    }
  }, [auth.user, isOpen]);

  const [fields, setFields] = useState({
    firstName: '',
    lastName: '',
    email: '',
    professionalTitleEn: '',
    professionalTitleAr: '',
    biographyEn: '',
    biographyAr: '',
    expertiseEn: '',
    expertiseAr: '',
    linkedin: '',
    twitter: '',
    youtube: '',
    website: '',
    yearsOfExperience: ''
  });

  const [setSampleVideo] = useState(null);
  const [setCv] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "sampleVideo") setSampleVideo(files[0]);
    if (name === "cv") setCv(files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth || !auth.user) {
      setServerError(t("mentorForm.notLoggedIn"));
      setTimeout(() => {
        onClose();
        navigate('/login');
      }, 2000);
      return;
    }

    if (!fields.professionalTitleEn || !fields.professionalTitleAr) {
      setServerError(t("mentorForm.professionalTitleRequired"));
      return;
    }

    if (!fields.biographyEn || !fields.biographyAr) {
      setServerError(t("mentorForm.biographyRequired"));
      return;
    }

    if (!fields.expertiseEn || !fields.expertiseAr) {
      setServerError(t("mentorForm.expertiseRequired"));
      return;
    }

    setSubmitting(true);
    setServerError('');
    setSuccess(false);

    try {
      const instructorData = {
        user: auth.user._id,
        professionalTitle: {
          en: fields.professionalTitleEn.trim(),
          ar: fields.professionalTitleAr.trim()
        },
        biography: {
          en: fields.biographyEn.trim(),
          ar: fields.biographyAr.trim()
        },
        expertiseAreas: {
          en: fields.expertiseEn.split(',').map(s => s.trim()).filter(Boolean),
          ar: fields.expertiseAr.split(',').map(s => s.trim()).filter(Boolean)
        },
        socialMediaLinks: {
          linkedin: fields.linkedin.trim() || undefined,
          twitter: fields.twitter.trim() || undefined,
          youtube: fields.youtube.trim() || undefined,
          website: fields.website.trim() || undefined
        },
        yearsOfExperience: parseInt(fields.yearsOfExperience) || 0
      };

      console.log("📤 البيانات المرسلة:", instructorData);

      const response = await fetch("http://localhost:5000/api/instructors", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(instructorData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Submission failed");
      }

      const result = await response.json();
      console.log("the result is ok", result);

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setServerError(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className={`${theme === 'dark' ? 'bg-black' : 'bg-white'} w-full max-w-4xl rounded-lg shadow-lg p-6 relative overflow-y-auto max-h-[95vh] ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} hover:text-red-500 text-xl font-bold`}
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold text-center mb-4">{t("mentorForm.title", "Apply as a Mentor")}</h2>

        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
          {success && <div className="bg-green-800 p-2 text-green-100 text-center rounded">{t("mentorForm.applicationSuccess")}</div>}
          {serverError && <div className="bg-red-800 p-2 text-red-100 text-center rounded">{serverError}</div>}

          <div className={`${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-100'} p-4 rounded-lg`}>
            <h3 className="text-lg font-semibold mb-4">{t("mentorForm.userInfo")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} block text-sm font-medium`}>{t("mentorForm.firstName")} *</label>
                <input
                  name="firstName"
                  type="text"
                  value={fields.firstName}
                  disabled
                  className={`w-full border p-2 rounded mt-1 ${theme === 'dark' ? 'bg-[#1a1a1a] border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                />
              </div>
              <div>
                <label className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} block text-sm font-medium`}>{t("mentorForm.lastName")} *</label>
                <input
                  name="lastName"
                  type="text"
                  value={fields.lastName}
                  disabled
                  className={`w-full border p-2 rounded mt-1 ${theme === 'dark' ? 'bg-[#1a1a1a] border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                />
              </div>
              <div className="md:col-span-2">
                <label className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} block text-sm font-medium`}>{t("mentorForm.email")} *</label>
                <input
                  name="email"
                  type="email"
                  value={fields.email}
                  disabled
                  className={`w-full border p-2 rounded mt-1 ${theme === 'dark' ? 'bg-[#1a1a1a] border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                />
              </div>
            </div>
          </div>

          <div className={`${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-100'} p-4 rounded-lg space-y-4`}>
            <h3 className="text-lg font-semibold">{t("mentorForm.professionalTitle")} *</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium ">English *</label>
                <input
                  name="professionalTitleEn"
                  type="text"
                  value={fields.professionalTitleEn}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Senior Software Engineer"
                  className={`w-full border p-2 rounded ${theme === 'dark' ? 'bg-[#1a1a1a] border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium ">العربية *</label>
                <input
                  name="professionalTitleAr"
                  type="text"
                  value={fields.professionalTitleAr}
                  onChange={handleChange}
                  required
                  placeholder="مثال: مهندس برمجيات أول"
                  className={`w-full border p-2 rounded ${theme === 'dark' ? 'bg-[#1a1a1a] border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                  dir="rtl"
                />
              </div>
            </div>
          </div>
          <div className={`${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-100'} p-4 rounded-lg space-y-4`}>
            <h3 className="text-lg font-semibold">{t("mentorForm.biography")} *</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">English *</label>
                <textarea
                  name="biographyEn"
                  value={fields.biographyEn}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Write your biography in English (50-2000 characters)"
                  className={`w-full border p-2 rounded ${theme === 'dark' ? 'bg-[#1a1a1a] border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">العربية *</label>
                <textarea
                  name="biographyAr"
                  value={fields.biographyAr}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="اكتب نبذتك التعريفية بالعربية (50-2000 حرف)"
                  className={`w-full border p-2 rounded ${theme === 'dark' ? 'bg-[#1a1a1a] border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                  dir="rtl"
                />
              </div>
            </div>
          </div>

          <div className={`${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-100'} p-4 rounded-lg space-y-4`}>
            <h3 className="text-lg font-semibold">{t("mentorForm.expertiseAreas")} *</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">English *</label>
                <input
                  name="expertiseEn"
                  type="text"
                  value={fields.expertiseEn}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Web Development, Node.js, MongoDB"
                  className={`w-full border p-2 rounded ${theme === 'dark' ? 'bg-[#1a1a1a] border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                />
                <p className="text-sm text-gray-400 mt-1">Separate areas with commas (1-10 areas)</p>
              </div>
              <div>
                <label className="block text-sm font-medium">العربية *</label>
                <input
                  name="expertiseAr"
                  type="text"
                  value={fields.expertiseAr}
                  onChange={handleChange}
                  required
                  placeholder="مثال: تطوير الويب، نود.جي إس، مونغو دي بي"
                  className={`w-full border p-2 rounded ${theme === 'dark' ? 'bg-[#1a1a1a] border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                  dir="rtl"
                />
                <p className="text-sm text-gray-400 mt-1 text-right">افصل المجالات بفواصل (1-10 مجالات)</p>
              </div>
            </div>
          </div>

          <div className={`${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-100'} p-4 rounded-lg space-y-4`}>
            <h3 className="text-lg font-semibold">{t("mentorForm.socialMedia")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">{t("mentorForm.linkedin")}</label>
                <input
                  name="linkedin"
                  type="url"
                  value={fields.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/your-profile"
                  className={`w-full border p-2 rounded ${theme === 'dark' ? 'bg-[#1a1a1a] border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium ">{t("mentorForm.twitter")}</label>
                <input
                  name="twitter"
                  type="url"
                  value={fields.twitter}
                  onChange={handleChange}
                  placeholder="https://twitter.com/your-handle"
                  className={`w-full border p-2 rounded ${theme === 'dark' ? 'bg-[#1a1a1a] border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium ">{t("mentorForm.youtube")}</label>
                <input
                  name="youtube"
                  type="url"
                  value={fields.youtube}
                  onChange={handleChange}
                  placeholder="https://youtube.com/c/your-channel"
                  className={`w-full border p-2 rounded ${theme === 'dark' ? 'bg-[#1a1a1a] border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium ">{t("mentorForm.website")}</label>
                <input
                  name="website"
                  type="url"
                  value={fields.website}
                  onChange={handleChange}
                  placeholder="https://your-website.com"
                  className={`w-full border p-2 rounded ${theme === 'dark' ? 'bg-[#1a1a1a] border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                />
              </div>
            </div>
          </div>

          <div className={`${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-100'} p-4 rounded-lg space-y-4`}>

            <label className="block text-sm font-medium ">{t("mentorForm.yearsOfExperience")}</label>
            <input
              name="yearsOfExperience"
              type="number"
              min="0"
              max="60"
              value={fields.yearsOfExperience}
              onChange={handleChange}
              className={`w-full border p-2 rounded ${theme === 'dark' ? 'bg-[#1a1a1a] border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
            />
          </div>

          <div className={`${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-100'} p-4 rounded-lg space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4`}>
            <div>
              <label className="block text-sm font-medium ">{t("mentorForm.sampleVideo")} *</label>
              <input
                name="sampleVideo"
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                required
                className={`w-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'}file:text-white file:bg-red-600 file:border-0 file:px-3 file:py-1`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium ">{t("mentorForm.cv")} *</label>
              <input
                name="cv"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                required
                className={`w-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'}file:text-white file:bg-red-600 file:border-0 file:px-3 file:py-1`}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className={`bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 ${submitting ? "opacity-70 cursor-wait" : ""}`}
              disabled={submitting}
            >
              {submitting ? t("mentorForm.submitting") : t("mentorForm.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BecomeInstructor;