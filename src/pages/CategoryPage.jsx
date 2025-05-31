/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaBookmark } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const defaultIllustration = 'https://t3.ftcdn.net/jpg/08/29/92/34/360_F_829923473_EOUovuUUuhuCtOLPwchtUFKIPzQCg1ZX.jpg'; // Replace with your illustration

const CategoryPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [category, setCategory] = useState(location.state?.category || null);
  const [courses, setCourses] = useState([]);
  const [sort, setSort] = useState('newest');
  const [level, setLevel] = useState('all');
  const [language, setLanguage] = useState('all');
  const [filteredCourses, setFilteredCourses] = useState([]);
  const { theme } = useTheme();
  const [savedCourses, setSavedCourses] = useState([]);
  const [savingCourse, setSavingCourse] = useState(false);

  useEffect(() => {
    if (!category) {
      axios.get(`https://al-mentor-database-production.up.railway.app/categories/${id}`)
        .then(res => setCategory(res.data.data))
        .catch(() => setCategory(null));
    }
    axios.get('https://al-mentor-database-production.up.railway.app/courses')
      .then(res => {
        const categoryCourses = res.data.filter(c => c.category === id);
        setCourses(categoryCourses);
        setFilteredCourses(categoryCourses);
      })
      .catch(() => {
        setCourses([]);
        setFilteredCourses([]);
      });
  }, [id]);

  useEffect(() => {
    let result = [...courses];
    if (level !== 'all') {
      result = result.filter(course => {
        const courseLevel = typeof course.level === 'object' ? course.level.en : course.level;
        return courseLevel?.toLowerCase() === level.toLowerCase();
      });
    }
    if (language !== 'all') {
      result = result.filter(course => {
        const courseLanguage = typeof course.language === 'object' ? course.language.en : course.language;
        return courseLanguage?.toLowerCase() === language.toLowerCase();
      });
    }
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.created_at);
      const dateB = new Date(b.createdAt || b.created_at);
      return sort === 'newest' ? dateB - dateA : dateA - dateB;
    });
    setFilteredCourses(result);
  }, [courses, level, language, sort]);

  useEffect(() => {
    // Fetch saved courses for the user
    const fetchSavedCourses = async () => {
      if (!user) return;
      try {
        const response = await fetch(`https://al-mentor-database-production.up.railway.app/saved-courses/user/${user._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) throw new Error();
        const data = await response.json();
        setSavedCourses(data.map(item => item.courseId._id));
      } catch (err) {
        setSavedCourses([]);
      }
    };
    fetchSavedCourses();
  }, [user]);

  const toggleSaveCourse = async (courseId, e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/loginPage');
      return;
    }
    if (savingCourse) return;
    try {
      setSavingCourse(true);
      const isCurrentlySaved = savedCourses.includes(courseId);
      if (isCurrentlySaved) {
        // Unsave course
        const response = await fetch(`https://al-mentor-database-production.up.railway.app/saved-courses/${user._id}/${courseId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.error('DEBUG: Unsave error response:', errorData);
          throw new Error('Failed to unsave course');
        }
        setSavedCourses(prev => prev.filter(id => id !== courseId));
        toast.success('Course removed from saved courses');
      } else {
        // Save course
        const payload = {
          userId: user._id,
          courseId,
          savedAt: new Date().toISOString()
        };
        const response = await fetch('https://al-mentor-database-production.up.railway.app/saved-courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) {
          console.error('DEBUG: Save error response:', data);
          if (
            response.status === 409 ||
            (response.status === 400 && data.message && data.message.toLowerCase().includes('already saved'))
          ) {
            toast.info('Course is already in your saved courses');
            return;
          }
          throw new Error(data.message || 'Failed to save course');
        }
        setSavedCourses(prev => [...prev, courseId]);
        toast.success('Course added to saved courses');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update saved courses');
    } finally {
      setSavingCourse(false);
    }
  };

  const bannerImage = category?.image || defaultIllustration;

  return (
    <div className={`${theme === 'dark' ? 'bg-[#121212] text-white' : 'bg-gray-50 text-black'} min-h-screen pt-28 pb-12`} dir="ltr">
      {/* Gradient Banner */}
      <div className={`w-full bg-gradient-to-b ${theme === 'dark' ? 'from-[#23272F] to-[#121212]' : 'from-[#eaf6fa] to-[#fff]'} pb-8`}>
        <div className="max-w-6xl mx-auto pt-12 px-2">
          <h1 className="text-4xl font-bold mb-8 text-left">{category?.name?.en || category?.name?.ar || ''}</h1>
        </div>
        {/* Promo Card */}
        <div className={`max-w-3xl mx-auto flex items-center justify-between ${theme === 'dark' ? 'bg-[#0d232b]' : 'bg-white'} rounded-2xl px-8 py-6 shadow-lg relative`}>
          <div className="flex-1">
            <span className="text-2xl font-bold" style={{ color: theme === 'dark' ? '#fff' : '#23272F' }}>Only at <span className="text-[#00ffd0]">199 EGP /month!</span></span>
            <span className="block text-lg" style={{ color: theme === 'dark' ? '#b3c2d1' : '#23272F' }}>Get all of this and more when you subscribe to almentor.</span>
          </div>
          <button className="bg-red-600 text-white px-8 py-3 rounded-lg text-lg font-bold ml-6 hover:bg-red-700 transition">Subscribe</button>
          {/* <img src="https://t3.ftcdn.net/jpg/08/29/92/34/360_F_829923473_EOUovuUUuhuCtOLPwchtUFKIPzQCg1ZX.jpg" alt="illustration" className="absolute right-4 bottom-0 h-24 hidden md:block" style={{zIndex:0}} /> */}
        </div>
      </div>
      {/* Filters and Sort */}
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 mt-12 px-2">
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold">Filter by</span>
          <select
            value={level}
            onChange={e => setLevel(e.target.value)}
            className={`${theme === 'dark' ? 'bg-[#23272F] text-white' : 'bg-gray-200 text-black'} rounded-full px-6 py-2 text-base focus:outline-none`}
          >
            <option value="all">Course Level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className={`${theme === 'dark' ? 'bg-[#23272F] text-white' : 'bg-gray-200 text-black'} rounded-full px-6 py-2 text-base focus:outline-none`}
          >
            <option value="all">Language</option>
            <option value="ar">Arabic</option>
            <option value="en">English</option>
          </select>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold">Sort by</span>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className={`${theme === 'dark' ? 'bg-[#23272F] text-white' : 'bg-gray-200 text-black'} rounded-full px-6 py-2 text-base focus:outline-none`}
          >
            <option value="newest">Newest to oldest</option>
            <option value="oldest">Oldest to newest</option>
          </select>
        </div>
      </div>
      {/* Courses Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-12 px-2">
        {filteredCourses.map(course => {
          const title = course.title?.en || course.title?.ar || '';
          const instructorName = course.instructorDetails?.profile?.firstName?.en || course.instructorDetails?.profile?.firstName?.ar || '';
          const instructorLast = course.instructorDetails?.profile?.lastName?.en || course.instructorDetails?.profile?.lastName?.ar || '';
          const isSaved = savedCourses.includes(course._id);
          return (
            <div
              key={course._id}
              className={`${theme === 'dark' ? 'bg-[#181f1f]' : 'bg-white'} rounded-2xl overflow-hidden shadow-lg flex flex-col transition hover:scale-[1.03] hover:shadow-2xl cursor-pointer`}
              onClick={() => navigate(`/courses/${course._id}`)}
            >
              <div className="relative">
                <img src={course.thumbnail || 'https://via.placeholder.com/280x160'} alt={title} className="w-full h-48 object-cover" />
                {course.isNew && <span className="absolute top-3 left-3 bg-[#ff5722] text-white text-sm px-3 py-1 rounded">New</span>}
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <h3 className="text-lg font-bold mb-2 text-left">{title}</h3>
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'} text-sm text-left mb-2`}>{instructorName} {instructorLast}</p>
                <div className="flex items-center justify-end mt-auto">
                  <button
                    className={`rounded-full p-2 transition ${isSaved ? 'bg-[#00ffd0] text-black' : theme === 'dark' ? 'bg-[#23272F] text-white' : 'bg-gray-200 text-black'} border-none`}
                    onClick={e => toggleSaveCourse(course._id, e)}
                    disabled={savingCourse}
                  >
                    <FaBookmark className={`text-lg ${isSaved ? 'text-black' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filteredCourses.length === 0 && <div className="col-span-full text-center text-gray-400 text-xl mt-12">No courses found matching your filters.</div>}
      </div>
    </div>
  );
};

export default CategoryPage; 