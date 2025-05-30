import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext"; // Add this import at the top

export default function Instructors() {
  const { user } = useAuth();
  const [isInstructor, setIsInstructor] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`http://localhost:5000/api/instructors?page=${page}&limit=${limit}`)
      .then((res) => {
        if (!res.ok) {
          return res
            .json()
            .then((errData) => {
              throw new Error(errData.message || t("failedToFetchInstructors"));
            })
            .catch(() => {
              throw new Error(
                `${t("failedToFetchInstructors")} (${res.status})`
              );
            });
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          const fetchedInstructors = data.data || [];
          setInstructors(fetchedInstructors);
          setTotalPages(Math.ceil((data.total || 0) / limit));
        } else {
          setError(data.message || t("failedToLoadInstructors"));
          setInstructors([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || t("errorFetchingData"));
        setInstructors([]);
        setLoading(false);
      });
  }, [page, limit, t, i18n.language]);

  useEffect(() => {
    const checkInstructorStatus = async () => {
      if (!user) {
        setIsChecking(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/instructors?page=1&limit=100`);
        const data = await response.json();

        if (data.success) {
          const instructorStatus = data.data.some(instructor => instructor.user === user._id);
          setIsInstructor(instructorStatus);
        }
      } catch (error) {
        console.error("Error checking instructor status:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkInstructorStatus();
  }, [user]);

  const themeClasses = {
    bg: theme === "dark" ? "bg-[#121212]" : "bg-gray-50",
    text: theme === "dark" ? "text-white" : "text-gray-900",
    textMuted: theme === "dark" ? "text-gray-400" : "text-gray-500",
    cardBg: theme === "dark" ? "bg-gray-800" : "bg-white",
    placeholderBg: theme === "dark" ? "374151" : "e5e7eb",
    placeholderColor: theme === "dark" ? "fff" : "1f2937",
    placeholderDivBg: theme === "dark" ? "bg-gray-700" : "bg-gray-200",
    buttonHover: theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-300",
    retryButton:
      theme === "dark"
        ? "bg-gray-700 hover:bg-gray-600 text-white"
        : "bg-gray-300 hover:bg-gray-400 text-black",
    focusRingOffset:
      theme === "dark"
        ? "focus:ring-offset-black/50"
        : "focus:ring-offset-white",
  };

  if (loading && page === 1 && instructors.length === 0)
    return (

      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#1A1A1A] text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4">{t('loading', 'Loading...')}</p>
        </div>
      </div>

    );

  if (error && instructors.length === 0)
    return (
      <div
        className={`flex flex-col justify-center items-center min-h-screen ${themeClasses.bg} ${themeClasses.text} px-6 text-center`}
      >
        <p className="text-xl text-red-500 mb-4">
          {t("errorLoadingInstructors")}
        </p>
        <p className={`${themeClasses.textMuted}`}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className={`mt-6 px-4 py-2 rounded transition-colors ${themeClasses.retryButton}`}
        >
          {t("Retry")}
        </button>
      </div>
    );

  return (
    <div
      className={`${themeClasses.bg} ${themeClasses.text} min-h-screen py-12 md:py-16 lg:py-20 transition-colors duration-300`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1
          key={i18n.language}
          className={`text-3xl lg:text-4xl font-bold mb-10 md:mb-12 ${isRTL ? "text-right" : "text-left"
            }`}
        >
          {t("home.instructors.title")}
        </h1>

        <div
          className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-8 mb-12 md:mb-16 relative ${loading ? "opacity-50 pointer-events-none" : ""
            }`}
        >
          {loading && (
            <div
              className={`absolute inset-0 flex justify-center items-center ${theme === "dark" ? "bg-black" : "bg-white"
                } bg-opacity-50 z-10 rounded-md`}
            >
              <svg
                className={`animate-spin h-8 w-8 ${theme === "dark" ? "text-white" : "text-gray-700"
                  }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          )}

          {instructors.map((ins) => {
            const profile = ins.profile || {};
            const firstName =
              profile.firstName?.[i18n.language] || profile.firstName?.en || "";
            const lastName =
              profile.lastName?.[i18n.language] || profile.lastName?.en || "";
            const fullName = `${firstName} ${lastName}`.trim();
            const professionalTitle =
              ins.professionalTitle?.[i18n.language] ||
              ins.professionalTitle?.en ||
              t("common.instructor");
            const placeholderAvatar = `https://ui-avatars.com/api/?name=${fullName || "N A"
              }&background=${themeClasses.placeholderBg}&color=${themeClasses.placeholderColor
              }&size=128`;
            const picture = profile.profilePicture || placeholderAvatar;

            return (
              <div
                key={ins._id}
                className="text-center flex flex-col items-center cursor-pointer"
                onClick={() => navigate(`/instructors/${ins._id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    navigate(`/instructors/${ins._id}`);
                  }
                }}
              >
                <div
                  className={`w-28 h-28 lg:w-32 lg:h-32 mx-auto rounded-full overflow-hidden shadow-lg mb-3 ${themeClasses.placeholderDivBg}`}
                >
                  <img
                    src={picture}
                    alt={fullName || t("common.instructorName")}
                    className="object-cover w-full h-full"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = placeholderAvatar;
                    }}
                  />
                </div>
                <div
                  className={`font-semibold text-base leading-tight mb-1 px-1 truncate w-full ${themeClasses.text}`}
                  title={fullName || t("common.instructorName")}
                >
                  {fullName || t("common.instructorName")}
                </div>
                <div
                  className={`text-xs ${themeClasses.textMuted} px-1 truncate w-full`}
                  title={professionalTitle}
                >
                  {professionalTitle}
                </div>
              </div>
            );
          })}

          {!loading && instructors.length === 0 && !error && (
            <p
              className={`col-span-full text-center ${themeClasses.textMuted} py-8`}
            >
              {t("messages.noInstructorsFound")}
            </p>
          )}

          {error && instructors.length > 0 && (
            <p className="col-span-full text-center text-red-500 py-8">
              {t("messages.errorLoadingNextPage")} {error}
            </p>
          )}
        </div>

        <div className="flex justify-center items-center mb-16 md:mb-20 gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className={`p-2 rounded-full ${page === 1 || loading
              ? "opacity-30 cursor-not-allowed"
              : `opacity-70 ${themeClasses.buttonHover} hover:opacity-100`
              }`}
          >
            {isRTL ? (
              <ChevronRightIcon className="h-6 w-6" />
            ) : (
              <ChevronLeftIcon className="h-6 w-6" />
            )}
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1 rounded text-sm font-medium ${p === page
                ? "bg-red-600 text-white"
                : `${themeClasses.buttonHover} ${themeClasses.text}`
                }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            className={`p-2 rounded-full ${page === totalPages || loading
              ? "opacity-30 cursor-not-allowed"
              : `opacity-70 ${themeClasses.buttonHover} hover:opacity-100`
              }`}
          >
            {isRTL ? (
              <ChevronLeftIcon className="h-6 w-6" />
            ) : (
              <ChevronRightIcon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Conditionally render the "Become an Instructor" section */}
        {!isChecking && !isInstructor && !user?.isAdmin && (
          <div
            className="relative max-w-4xl mx-auto rounded-lg overflow-hidden h-52 md:h-60 w-500 mb-12 shadow-xl"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80 flex flex-col justify-center items-center text-center px-6 text-white">
              <h3 className="text-2xl md:text-3xl font-bold mb-2">
                {t("home.instructors.title2")}
              </h3>
              <p className="mt-1 md:mt-2 text-base md:text-lg mb-5 max-w-lg">
                {t("home.instructors.subtitle")}
              </p>
              <button
                onClick={() => navigate("/become-instructo")}
                className={`mt-2 bg-[#E4002B] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 inline-block px-8 py-2.5 rounded text-base font-semibold transition-colors duration-200 ease-in-out`}
              >
                {t("home.instructors.button")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
