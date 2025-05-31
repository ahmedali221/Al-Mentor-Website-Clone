import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

function Subscribe() {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
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
    return t("subscription.duration", {
      value: duration.value,
      unit: t(`subscription.units.${duration.unit.toLowerCase()}`),
    });
  };

  const handleSubscribe = (planId) => {
    if (!user) {
      navigate("/loginPage", {
        state: {
          from: "/subscribe",
          message: t("messages.loginRequired"),
          planId: planId,
        },
      });
      return;
    }

    if (!planId) {
      setError(t("messages.invalidPlan"));
      return;
    }

    navigate(`/payment/${planId}`);
  };

  useEffect(() => {
    if (authLoading) return;

    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          "https://al-mentor-database-production.up.railway.app/api/subscriptions",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data && Array.isArray(response.data)) {
          setSubscriptions(response.data);
        } else {
          throw new Error(t("messages.invalidData"));
        }
      } catch (err) {
        console.error("Error fetching subscriptions:", err);
        setError(
          err.response?.data?.message ||
          t("messages.error", "Failed to load subscriptions")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [t, authLoading]);

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${theme === "dark"
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
        className={`min-h-screen flex items-center justify-center ${theme === "dark"
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
      className={`min-h-screen flex items-center justify-center ${theme === "dark"
        ? "bg-[#1A1A1A] text-white"
        : "bg-gray-50 text-gray-900"
        }`}
      dir={isRTL ? "rtl" : "ltr"}>
      <div className='w-full max-w-7xl px-2 pt-28 pb-12'>
        <div className='text-center mb-8 sm:mb-16'>
          <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 px-4'>
            {t("subscription.mainTitle", "Subscribe now and start learning")}
          </h1>
          <p
            className={`text-lg sm:text-xl ${theme === "dark" ? "text-gray-300" : "text-gray-600"
              } max-w-3xl mx-auto px-4`}>
            {t(
              "subscription.subtitle",
              "Choose a plan and get unlimited access to the best learning content in the Arab world for the best price."
            )}
          </p>
        </div>

        {subscriptions.length === 0 && !loading && !error ? (
          <div className='text-center py-10'>
            <p className='text-xl text-gray-500'>
              {t(
                "subscription.noPlans",
                "No subscription plans available at the moment."
              )}
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-6 lg:px-8'>
            {subscriptions.map((plan) => (
              <div
                key={plan._id}
                className={`rounded-lg p-4 sm:p-6 ${theme === "dark" ? "bg-[#2C2C2C]" : "bg-white"
                  } shadow-lg transform transition-transform duration-300 hover:scale-105`}>
                <div className='text-center'>
                  <h3 className='text-xl sm:text-2xl font-bold mb-2'>
                    {getLocalizedContent(plan.displayName, plan.name)}
                  </h3>
                  <p className='text-3xl sm:text-4xl font-bold mb-3 sm:mb-4'>
                    {formatPrice(plan.price)}
                  </p>
                  <p
                    className={`mb-4 sm:mb-6 ${theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}>
                    {getDurationText(plan.duration)}
                  </p>
                  {plan.features && (
                    <ul className='text-left space-y-2 sm:space-y-3 mb-6 sm:mb-8'>
                      {plan.features.map((feature, index) => (
                        <li key={index} className='flex items-start sm:items-center'>
                          <svg
                            className='w-5 h-5 text-green-500 mr-2 mt-1 sm:mt-0 flex-shrink-0'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'>
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M5 13l4 4L19 7'
                            />
                          </svg>
                          <span className='text-sm sm:text-base'>
                            {getLocalizedContent(feature)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <button
                    onClick={() => handleSubscribe(plan._id)}
                    className='w-full py-2.5 sm:py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200 text-sm sm:text-base'>
                    {t("subscription.subscribe")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Subscribe;
