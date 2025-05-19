const express = require('express');
const router = express.Router();
const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getCoursesByInstructor,
  updateCourseCategories
} = require('../controllers/courseController');

// ... existing routes ...

// Add new route for updating course categories
router.post('/update-categories', updateCourseCategories);

module.exports = router; 