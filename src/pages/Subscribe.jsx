import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Subscribe() {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getLocalizedContent = (content, fallback = "") => {
    if (!content) return fallback;
    return content[i18n.language] || content["en"] || fallback;
  };

  const formatPrice = (price) => {
    if (!price) return "0";
    return `${price.amount} ${price.currency}`;
  };

  const getDurationText = (duration) => {
    if (!duration) return "";
    return `${duration.value} ${duration.unit}`;
  };

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/subscriptions");
        setSubscriptions(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching subscriptions:", err);
        setError(t("messages.error", "Failed to load subscriptions"));
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [t]);

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === "dark"
            ? "bg-[#1A1A1A] text-white"
            : "bg-gray-50 text-gray-900"
        }`}>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto'></div>
          <p className='mt-4'>{t("messages.loading", "Loading...")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === "dark"
            ? "bg-[#1A1A1A] text-white"
            : "bg-gray-50 text-gray-900"
        }`}>
        <div className='text-center'>
          <p className='text-red-600 text-xl'>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen pt-16 ${
        theme === "dark"
          ? "bg-[#1A1A1A] text-white"
          : "bg-gray-50 text-gray-900"
      }`}
      dir={isRTL ? "rtl" : "ltr"}>
      <div className='container mx-auto px-4 py-12 max-w-7xl'>
        <div className='text-center mb-16'>
          <h1 className='text-5xl font-bold mb-4'>
            {t("subscription.mainTitle", "Subscribe now and start learning")}
          </h1>
          <p
            className={`text-xl ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            } max-w-3xl mx-auto`}>
            {t(
              "subscription.subtitle",
              "Choose a plan and get unlimited access to the best learning content in the Arab world for the best price."
            )}
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-16'>
          {subscriptions.map((plan, index) => (
            <div
              key={plan._id}
              className={`rounded-xl p-8 ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              } shadow-lg relative transform hover:scale-105 transition-transform duration-300`}>
              <div className='text-center mb-8'>
                <h3 className='text-2xl font-bold mb-2'>
                  {getLocalizedContent(plan.displayName, plan.name)}
                </h3>
                <p
                  className={`${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}>
                  {getLocalizedContent(plan.description)}
                </p>
              </div>

              <div className='text-center mb-8'>
                <div className='text-4xl font-bold mb-2'>
                  {formatPrice(plan.price)}
                </div>
                <div
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}>
                  {t("subscription.duration", getDurationText(plan.duration))}
                </div>
              </div>

              {plan.features && plan.features.length > 0 && (
                <ul className='space-y-4 mb-8'>
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className='flex items-center'>
                      <svg
                        className='w-5 h-5 text-green-500 mr-3'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M5 13l4 4L19 7'
                        />
                      </svg>
                      <span
                        className={
                          theme === "dark" ? "text-gray-300" : "text-gray-600"
                        }>
                        {getLocalizedContent(feature)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <button
                onClick={() => navigate('/payment', { 
                  state: { 
                    planId: plan._id || plan.id // Handle both _id and id formats
                  } 
                })}
                className={`w-full py-3 px-6 rounded-lg text-lg font-semibold transition-all duration-300 
                bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl`}>
                {t("subscription.selectPlan", "Select plan")}
              </button>
            </div>
          ))}
        </div>

        <div className='mt-20'>
          <h2 className='text-3xl font-bold text-center mb-12'>
            {t("subscription.features", "What Every Plan Gets You")}
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
            <div
              className={`p-8 rounded-lg ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              } shadow-lg`}>
              <h3 className='font-bold mb-4'>
                {t("subscription.feature1", "Unlimited access to all courses")}
              </h3>
              <p
                className={`${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}>
                {t(
                  "subscription.feature1Desc",
                  "Enjoy unlimited access to all our courses. Learn at your own pace and explore new subjects anytime."
                )}
              </p>
            </div>
            <div
              className={`p-8 rounded-lg ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              } shadow-lg`}>
              <h3 className='font-bold mb-4'>
                {t("subscription.feature2", "Ad-free learning journey")}
              </h3>
              <p
                className={`${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}>
                {t(
                  "subscription.feature2Desc",
                  "Focus on your studies without interruptions. Our platform is completely ad-free for a seamless experience."
                )}
              </p>
            </div>
            <div
              className={`p-8 rounded-lg ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              } shadow-lg`}>
              <h3 className='font-bold mb-4'>
                {t("subscription.feature3", "Access on multiple devices")}
              </h3>
              <p
                className={`${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}>
                {t(
                  "subscription.feature3Desc",
                  "Learn on any device. Our platform works smoothly across laptops, tablets, and smartphones."
                )}
              </p>
            </div>
            <div
              className={`p-8 rounded-lg ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              } shadow-lg`}>
              <h3 className='font-bold mb-4'>
                {t("subscription.feature4", "Download to watch offline")}
              </h3>
              <p
                className={`${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}>
                {t(
                  "subscription.feature4Desc",
                  "Download courses to watch offline. Learn wherever you are, even without an internet connection."
                )}
              </p>
            </div>
          </div>
        </div>

        <div className='mt-16 text-center'>
          <p
            className={`text-lg mb-6 ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}>
            {t(
              "subscription.paymentMethods",
              "Pay in various ways — Cancel anytime."
            )}
          </p>
          <div className='flex justify-center items-center gap-8'>
            <img src='public\hq720.jpg' alt='Vodafone Cash' className='h-8' />
            <img
              src='public\png-clipart-mastercard-logo-logo-payment-visa-mastercard-paypal-mastercard-icon-text-service.png'
              alt='Mastercard'
              className='h-8'
            />
            <img src='public\images.png' className='h-8' />
            <img
              src='public\65a7a1ee0fb200379b7133e3_New Vodafone payment method.png'
              className='h-8'
            />
            <img src='public\فوري باي.png' alt='Visa' className='h-8' />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Subscribe;
