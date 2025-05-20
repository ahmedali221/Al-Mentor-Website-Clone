import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins, faHeadset, faGlobe, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../context/ThemeContext'; // Adjust path as needed

function BecomeInstructor() {
  const { i18n } = useTranslation();
  const { theme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  return (
    <div className={`${theme === 'dark' ? 'bg-[#121212]' : 'bg-white'} w-full min-h-screen`}>
      <LanguageSwitcher />
      <Header theme={theme} onApplyClick={() => setIsModalOpen(true)} />
      <CourseProduction theme={theme} />
      <InstructorResources theme={theme} onApplyClick={() => setIsModalOpen(true)}  />
      <RevenueSection theme={theme} onApplyClick={() => setIsModalOpen(true)} />
      <AccordionSection theme={theme} />
      {isModalOpen && <MentorApplicationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const changeLanguage = (lng) => i18n.changeLanguage(lng);

  return (
    <div className="p-4 flex justify-end gap-4 bg-white">
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1 rounded ${i18n.language === 'en' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
      >
        English
      </button>
      <button
        onClick={() => changeLanguage('ar')}
        className={`px-3 py-1 rounded ${i18n.language === 'ar' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
      >
        عربي
      </button>
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
          className={`mt-6 px-4 py-2 rounded transition duration-200 ${
            theme === 'dark' ? 'bg-red-500 text-white hover:bg-red-700' : 'bg-red-500 text-white hover:bg-red-600'
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

function InstructorResources({ theme,onApplyClick }) {
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
      <button  onClick={onApplyClick} className={`mt-6 px-4 py-2 rounded transition duration-200 ${btnClass}`}>
        {t('becomeInstructor.instructorResources.applyButton')}
      </button>
    </section>
  );
}

function RevenueSection({ theme ,onApplyClick}) {
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

  // State for each field
  const [fields, setFields] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    nationality: "",
    countryOfResidence: "",
    yearsExperience: "",
    linkedin: "",
    facebook: "",
    company: "",
    topics: "",
  });
  const [sampleVideo, setSampleVideo] = useState(null);
  const [cv, setCv] = useState(null);


  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  if (!isOpen) return null;


  function handleChange(e) {
    const { name, value } = e.target;
    setFields((prev) => ({
      ...prev,
      [name]: value,
    }));
  }


  function handleFileChange(e) {
    const { name, files } = e.target;
    if (name === "sampleVideo") setSampleVideo(files[0]);
    if (name === "cv") setCv(files[0]);
  }

  
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setServerError("");
    setSuccess(false);


    const data = new FormData();
    Object.entries(fields).forEach(([key, value]) => data.append(key, value));
    if (sampleVideo) data.append("sampleVideo", sampleVideo);
    if (cv) data.append("cv", cv);

    try {
      const response = await fetch("http://localhost:5000/api/instructors", {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Submission failed");
      }
      setSuccess(true);
      
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 relative overflow-y-auto max-h-[95vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-xl font-bold"
          aria-label={t("close", "Close modal")}
        >
          &times;
        </button>

        <div className="mb-6">
          <img
            src="logo.jpeg"
            alt={t("logo_alt", "almentor logo")}
            className="h-10 mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-center mb-2">
            {t("mentorForm.title", "Apply as a Mentor")}
          </h2>
          <p className="text-center text-gray-600">
            {t("mentorForm.subtitle", "Please tell us more about yourself and how we can reach you:")}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} encType="multipart/form-data">
          {success && (
            <div className="bg-green-200 text-green-700 p-3 rounded mb-2 text-center">
              {t("mentorForm.applicationSuccess", "Application submitted successfully!")}
            </div>
          )}
          {serverError && (
            <div className="bg-red-200 text-red-700 p-3 rounded mb-2 text-center">
              {serverError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">
              {t("mentorForm.firstName", "First name")} *
            </label>
            <input
              name="firstName"
              type="text"
              value={fields.firstName}
              onChange={handleChange}
              required
              className="w-full rounded-md border p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              {t("mentorForm.lastName", "Last name")} *
            </label>
            <input
              name="lastName"
              type="text"
              value={fields.lastName}
              onChange={handleChange}
              required
              className="w-full rounded-md border p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              {t("mentorForm.phone", "Mobile phone number")} *
            </label>
            <input
              name="phone"
              type="tel"
              value={fields.phone}
              onChange={handleChange}
              required
              className="w-full rounded-md border p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              {t("mentorForm.email", "Email")} *
            </label>
            <input
              name="email"
              type="email"
              value={fields.email}
              onChange={handleChange}
              required
              className="w-full rounded-md border p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              {t("mentorForm.nationality", "Nationality")} *
            </label>
            <input
              name="nationality"
              type="text"
              value={fields.nationality}
              onChange={handleChange}
              required
              className="w-full rounded-md border p-2"
            />
          </div>
          {/* Additional Info */}
          <div>
            <label className="block text-sm font-medium">
              {t("mentorForm.countryOfResidence", "Country of Residence")} *
            </label>
            <select
              name="countryOfResidence"
              value={fields.countryOfResidence}
              onChange={handleChange}
              required
              className="w-full rounded-md border p-2 bg-white"
            >
              <option value="">{t("mentorForm.chooseCountry", "Please Select")}</option>
              <option value="Egypt">{t("mentorForm.egypt", "Egypt")}</option>
              <option value="UAE">{t("mentorForm.uae", "UAE")}</option>
              <option value="Saudi Arabia">{t("mentorForm.saudiArabia", "Saudi Arabia")}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">
              {t("mentorForm.yearsExperience", "How many years of experience do you have in the field of training?")} *
            </label>
            <input
              name="yearsExperience"
              type="number"
              value={fields.yearsExperience}
              onChange={handleChange}
              required
              className="w-full rounded-md border p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              {t("mentorForm.linkedin", "LinkedIn Profile")} *
            </label>
            <input
              name="linkedin"
              type="url"
              value={fields.linkedin}
              onChange={handleChange}
              required
              className="w-full rounded-md border p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              {t("mentorForm.facebook", "Facebook Page")} *
            </label>
            <input
              name="facebook"
              type="url"
              value={fields.facebook}
              onChange={handleChange}
              required
              className="w-full rounded-md border p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              {t("mentorForm.company", "Company (if applying as partner)")}
            </label>
            <input
              name="company"
              type="text"
              value={fields.company}
              onChange={handleChange}
              className="w-full rounded-md border p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              {t("mentorForm.topics", "What are the topics that you would like to introduce on the platform?")} *
            </label>
            <textarea
              name="topics"
              value={fields.topics}
              onChange={handleChange}
              required
              rows="3"
              className="w-full rounded-md border p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              {t("mentorForm.sampleVideo", "Sample video of you")} *
            </label>
            <input
              name="sampleVideo"
              type="file"
              accept="video/*"
              required
              onChange={handleFileChange}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              {t("mentorForm.cv", "CV (Company profile for companies)")} *
            </label>
            <input
              name="cv"
              type="file"
              accept=".pdf,.doc,.docx"
              required
              onChange={handleFileChange}
              className="w-full"
            />
          </div>
          {/* Submit Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className={`bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ${submitting ? "opacity-70 cursor-wait" : ""}`}
              disabled={submitting}
            >
              {submitting ? t("mentorForm.submitting", "Submitting...") : t("mentorForm.submit", "Submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BecomeInstructor;
