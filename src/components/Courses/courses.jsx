import React from 'react';

function Courses() {
  return (
    <div className="min-h-screen p-8 bg-gray-100 text-center mt-20">
      <h1 className="text-4xl font-bold text-red-600 mb-8">Our Courses</h1>

      <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-2">Sample Course Title</h2>
        <p className="text-gray-600">This is a sample description for a course. You can customize this section to show real data from your API.</p>
      </div>
    </div>
  );
}

export default Courses;
