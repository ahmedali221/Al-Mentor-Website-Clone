import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { EyeIcon, BookOpenIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import RequestSession from "../components/InstructorSession/RequestSession";

function getLocalizedString(obj = {}, lang = "en", defaultStr = "") {
  if (typeof obj === "string") return obj;
  return obj[lang] || obj.en || defaultStr;
}

export default function InstructorDetails() {
  const { id } = useParams();
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [instructor, setInstructor] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loadingInstructor, setLoadingInstructor] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [showFullBio, setShowFullBio] = useState(false);
  const [showRequestSession, setShowRequestSession] = useState(false);

  useEffect(() => {
    // Fetch the instructor details
    const fetchInstructor = async () => {
      try {
        const res = await fetch(`https://al-mentor-database-production.up.railway.app/api/instructors/${id}`);
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
        const res = await fetch(`https://al-mentor-database-production.up.railway.app/api/courses/instructor/${id}`);
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
    <div className={`min-h-screen py-20 ${bgColor} ${textColor}`}>
      {/* Request Session Modal */}
      {showRequestSession && (
        <RequestSession
          instructorId={id}
          onClose={() => setShowRequestSession(false)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column - Profile */}
          <div className="flex-1">
            <div className="flex flex-col items-center md:items-start">
              <img
                src={avatar}
                alt={name}
                className="w-48 h-48 rounded-full object-cover mb-6"
              />
              <h1 className="text-3xl font-bold mb-2">{name}</h1>
              <p className={`text-xl ${mutedText} mb-6`}>{title}</p>

              {/* Request Session Button */}
              <button
                onClick={() => setShowRequestSession(true)}
                className="w-full md:w-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {t("buttons.requestSession")}
              </button>
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

          {/* Right Column - Bio and Courses */}
          <div className="flex-1">
            {/* Biography */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">{t("instructorDetails.biography")}</h2>
              <p className={`${mutedText} leading-relaxed`}>{bioPreview}</p>
              {bioText.length > 300 && (
                <button
                  onClick={() => setShowFullBio(!showFullBio)}
                  className="text-red-600 hover:text-red-700 mt-2"
                >
                  {showFullBio ? t("buttons.showLess") : t("buttons.showMore")}
                </button>
              )}
            </div>

            {/* Expertise Areas */}
            {expertiseAreas && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">{t("instructorDetails.expertise")}</h2>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    let areas = [];
                    if (typeof expertiseAreas === 'string') {
                      areas = expertiseAreas.split(',');
                    } else if (Array.isArray(expertiseAreas)) {
                      areas = expertiseAreas;
                    } else if (typeof expertiseAreas === 'object') {
                      areas = Object.values(expertiseAreas);
                    }
                    return areas.map((area, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm ${theme === "dark"
                          ? "bg-gray-700 text-white"
                          : "bg-gray-200 text-gray-800"
                          }`}
                      >
                        {area.trim()}
                      </span>
                    ));
                  })()}
                </div>
              </div>
            )}

            {/* Courses */}
            <div>
              <h2 className="text-2xl font-bold mb-4">{t("instructorDetails.courses")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <div
                    key={course._id}
                    className={`p-4 rounded-lg shadow-lg cursor-pointer ${theme === "dark" ? "bg-gray-800" : "bg-white"
                      }`}
                    onClick={() => navigate(`/courses/${course._id}`)}
                  >
                    <img
                      src={course.thumbnail || "/default-course.jpg"}
                      alt={getLocalizedString(course.title, lang)}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                    <h3 className="font-semibold mb-2">
                      {getLocalizedString(course.title, lang)}
                    </h3>
                    <p className={`text-sm ${mutedText}`}>
                      {getLocalizedString(course.description, lang)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}