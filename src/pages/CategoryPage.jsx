import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaBookmark } from 'react-icons/fa';

const defaultIllustration = 'https://t3.ftcdn.net/jpg/08/29/92/34/360_F_829923473_EOUovuUUuhuCtOLPwchtUFKIPzQCg1ZX.jpg'; // Replace with your illustration

const CategoryPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [category, setCategory] = useState(location.state?.category || null);
  const [courses, setCourses] = useState([]);
  const [sort, setSort] = useState('newest');
  const [level, setLevel] = useState('all');
  const [language, setLanguage] = useState('all');
  const [filteredCourses, setFilteredCourses] = useState([]);

  useEffect(() => {
    if (!category) {
      axios.get(`/api/categories/${id}`)
        .then(res => setCategory(res.data.data))
        .catch(() => setCategory(null));
    }
    axios.get('/api/courses')
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

  // Apply filters and sorting whenever any filter changes
  useEffect(() => {
    let result = [...courses];

    // Apply level filter
    if (level !== 'all') {
      result = result.filter(course => {
        const courseLevel = typeof course.level === 'object' ? course.level.en : course.level;
        return courseLevel?.toLowerCase() === level.toLowerCase();
      });
    }

    // Apply language filter
    if (language !== 'all') {
      result = result.filter(course => {
        const courseLanguage = typeof course.language === 'object' ? course.language.en : course.language;
        return courseLanguage?.toLowerCase() === language.toLowerCase();
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.created_at);
      const dateB = new Date(b.createdAt || b.created_at);
      return sort === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredCourses(result);
  }, [courses, level, language, sort]);

  const bannerImage = category?.image || defaultIllustration;

  return (
    <div className="bg-[#121212] min-h-screen text-white" dir="ltr">
      {/* Gradient Banner */}
      <div className="w-full bg-gradient-to-b from-[#23272F] to-[#121212] pb-8">
        <div className="max-w-6xl mx-auto pt-12 px-6">
          <h1 className="text-4xl font-bold mb-8 text-left">{category?.name?.en || category?.name?.ar || ''}</h1>
        </div>
        {/* Promo Card */}
        <div className="max-w-3xl mx-auto flex items-center justify-between bg-[#0d232b] rounded-2xl px-8 py-6 shadow-lg relative">
          <div className="flex-1">
            <span className="text-2xl font-bold text-white">Only at <span className="text-[#00ffd0]">199 EGP /month!</span></span>
            <span className="block text-lg text-[#b3c2d1] mt-2">Get all of this and more when you subscribe to almentor.</span>
          </div>
          <button className="bg-red-600 text-white px-8 py-3 rounded-lg text-lg font-bold ml-6 hover:bg-red-700 transition">Subscribe</button>
          {/* <img src="https://t3.ftcdn.net/jpg/08/29/92/34/360_F_829923473_EOUovuUUuhuCtOLPwchtUFKIPzQCg1ZX.jpg" alt="illustration" className="absolute right-4 bottom-0 h-24 hidden md:block" style={{zIndex:0}} /> */}
        </div>
      </div>
      {/* Filters and Sort */}
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 mt-12 px-6">
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold">Filter by</span>
          <select 
            value={level} 
            onChange={e => setLevel(e.target.value)} 
            className="bg-[#23272F] text-white rounded-full px-6 py-2 text-base focus:outline-none"
          >
            <option value="all">Course Level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <select 
            value={language} 
            onChange={e => setLanguage(e.target.value)} 
            className="bg-[#23272F] text-white rounded-full px-6 py-2 text-base focus:outline-none"
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
            className="bg-[#23272F] text-white rounded-full px-6 py-2 text-base focus:outline-none"
          >
            <option value="newest">Newest to oldest</option>
            <option value="oldest">Oldest to newest</option>
          </select>
        </div>
      </div>
      {/* Courses Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-12 px-6">
        {filteredCourses.map(course => (
          <div key={course._id} className="bg-[#181f1f] rounded-2xl overflow-hidden shadow-lg flex flex-col transition hover:scale-[1.03] hover:shadow-2xl">
            <div className="relative">
              <img src={course.thumbnail || 'https://via.placeholder.com/280x160'} alt={course.title?.en || course.title?.ar} className="w-full h-48 object-cover" />
              {course.isNew && <span className="absolute top-3 left-3 bg-[#ff5722] text-white text-sm px-3 py-1 rounded">New</span>}
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <h3 className="text-lg font-bold mb-2 text-left">{course.title?.en || course.title?.ar}</h3>
              <p className="text-gray-400 text-sm text-left mb-2">{course.instructorDetails?.profile?.firstName?.en || ''} {course.instructorDetails?.profile?.lastName?.en || ''}</p>
              <div className="flex items-center justify-end mt-auto">
                <button className="bg-[#23272F] border border-[#23272F] rounded-full p-2 hover:bg-[#00ffd0] hover:text-black transition">
                  <FaBookmark className="text-white text-lg" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredCourses.length === 0 && <div className="col-span-full text-center text-gray-400 text-xl mt-12">No courses found matching your filters.</div>}
      </div>
    </div>
  );
};

export default CategoryPage; 