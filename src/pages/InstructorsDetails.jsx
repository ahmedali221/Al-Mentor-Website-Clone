import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { EyeIcon, BookOpenIcon, UserGroupIcon } from "@heroicons/react/24/outline";

function getLocalizedString(obj = {}, lang = "en", defaultStr = "") {
  if (typeof obj === "string") return obj;
  return obj[lang] || obj.en || defaultStr;
}

export default function InstructorDetails() {
  const { id } = useParams();
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();

  const [instructor, setInstructor] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loadingInstructor, setLoadingInstructor] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [showFullBio, setShowFullBio] = useState(false);

  useEffect(() => {
    // Fetch the instructor details
    const fetchInstructor = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/instructors/${id}`);
        const data = await res.json();
        setInstructor(data.data || data || null);
      } catch (err) {
        console.error("Error loading instructor", err);
        setInstructor(null);
      } finally {
        setLoadingInstructor(false);
      }
    };

    fetchInstructor();
  }, [id]);

  useEffect(() => {
    // Fetch courses by instructor id
    if (!id) return;
    const fetchCourses = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/courses/instructor/${id}`);
        const data = await res.json();
        setCourses(data || []);
      } catch (err) {
        console.error("Error loading instructor courses", err);
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [id]);

  if (loadingInstructor || loadingCourses)
    return <div className="p-10 text-center">{t("messages.loading")}</div>;

  if (!instructor)
    return <div className="p-10 text-center">{t("messages.error")}</div>;

  const profile = instructor.profile || instructor.user || {};
  const professionalTitle = instructor.professionalTitle || {};
  const biography = instructor.biography || instructor.bio || {};
  const stats = instructor.stats || {};

  const lang = i18n.language;

  const name =
    (
      getLocalizedString(profile.firstName, lang) +
      " " +
      getLocalizedString(profile.lastName, lang)
    ).trim() || t("instructors.title");

  const avatar =
    profile.profilePicture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&size=256&background=374151&color=fff`;

  const title = getLocalizedString(professionalTitle, lang, t("instructors.title"));

  const expertiseAreas =
    instructor.expertiseAreas && (instructor.expertiseAreas[lang] || instructor.expertiseAreas.en);

  const bioText = getLocalizedString(biography, lang, t("messages.noResults"));
  const bioPreview =
    bioText.length > 300 && !showFullBio ? bioText.slice(0, 300) + "..." : bioText;

  const bgColor = theme === "dark" ? "bg-black" : "bg-white";
  const textColor = theme === "dark" ? "text-white" : "text-gray-900";
  const mutedText = theme === "dark" ? "text-gray-400" : "text-gray-700";
  const statBg = theme === "dark" ? "bg-[#141717]" : "bg-[#eeeeee]";

  return (
    <div
      className={`${bgColor} ${textColor} min-h-screen pt-24 pb-15 gap-50`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-5xl mx-auto px-4 space-y-10 bt-6">
        <div className="md:flex md:items-center md:justify-between md:gap-8">
          <div className="flex items-center gap-6">
            <img
              src={avatar}
              alt={name}
              className="w-32 h-32 rounded-full shadow-lg object-cover"
              loading="lazy"
            />
            <div>
              <h1 className="text-3xl font-semibold">{name}</h1>
              <p className="mt-1 text-lg font-medium text-light">{title}</p>
              {expertiseAreas && (
                <p className="mt-2 text-sm text-light">{expertiseAreas.join(" • ")}</p>
              )}
            </div>
          </div>

          {/* Stats Box */}
          <div
            className={`${statBg} rounded-lg p-6 flex justify-around mt-6 md:mt-0 shadow-lg w-full md:w-[280px]`}
            role="region"
            aria-label={t("instructorStats.title")}
          >
            <div className="flex flex-col items-center">
              <EyeIcon className={`${textColor} h-6 w-6`} />
              <span className="mt-1 text-sm font-semibold">
                {stats.views?.toLocaleString() || 0}
              </span>
              <span className="text-xs text-gray-400">{t("instructorStats.views")}</span>
            </div>
            <div className="flex flex-col items-center">
              <BookOpenIcon className={`${textColor} h-6 w-6`} />
              <span className="mt-1 text-sm font-semibold">{courses.length}</span>
              <span className="text-xs text-gray-400">{t("instructorStats.courses")}</span>
            </div>
            <div className="flex flex-col items-center">
              <UserGroupIcon className={`${textColor} h-6 w-6`} />
              <span className="mt-1 text-sm font-semibold">
                {stats.learners?.toLocaleString() || 0}
              </span>
              <span className="text-xs text-gray-400">{t("instructorStats.learners")}</span>
            </div>
          </div>
        </div>

        {/* CTA Subscribe */}
        <div
          className={`rounded-lg p-6 shadow-md ${
            theme === "dark" ? "bg-[#0c1b20] text-[#afdde1]" : "bg-[#e6f3f7] text-[#000000]"
          } text-center`}
          role="region"
          aria-label={t("subscriptionCTA.label")}
        >
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <p className="text-lg font-semibold m-0">{t("subscriptionCTA.label")}</p>
            <button
              className="inline-block px-8 py-3 font-bold rounded bg-red-600 hover:bg-red-700 transition-colors focus:outline-none focus:ring-4 focus:ring-red-400 focus:ring-opacity-50 text-white"
              aria-label={t("subscriptionCTA.button")}
              onClick={() => alert(t("subscriptionCTA.button") + " clicked!")}
            >
              {t("subscriptionCTA.button")}
            </button>
          </div>
        </div>

        {/* About Mentor with Read More */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 border-b border-gray-300 pb-2">
            {t("home.instructors.about")}
          </h2>
          <p className={`${mutedText} leading-relaxed whitespace-pre-line`}>
            {bioPreview}
            {bioText.length > 300 && (
              <button
                onClick={() => setShowFullBio(!showFullBio)}
                className="text-[#fffbff] font-semibold ml-1 focus:outline-none"
                aria-expanded={showFullBio}
              >
                {showFullBio ? t("messages.readLess") : t("messages.readMore")}
              </button>
            )}
          </p>
        </div>

        {/* Courses Grid */}
        <div>
          <h2 className="text-2xl font-semibold mb-6 border-b border-gray-300 pb-2">
            {t("courses.title")}
          </h2>
          {courses.length === 0 && (
            <p className={mutedText}>{t("courses.noCoursesAvailable")}</p>
          )}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {courses.map((course) => {
              const courseTitle = getLocalizedString(course.title, lang, t("messages.noResults"));
              return (
                <div
                  key={course._id}
                  className={`relative rounded-lg overflow-hidden shadow-lg group cursor-pointer ${
                    theme === "dark" ? "bg-gray-800" : "bg-white"
                  }`}
                  onClick={() => {
                    navigate(`/courses/${course._id}`);
                  }}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      navigate(`/courses/${course._id}`);
                    }
                  }}
                  aria-label={courseTitle}
                >
                  <img
                    src={course.thumbnail || ""}
                    alt={courseTitle}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                    <h3 className="text-lg font-semibold truncate">{courseTitle}</h3>
                    <p className="text-sm opacity-75 truncate">{name}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}