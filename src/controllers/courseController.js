const Course = require("../../models/Topics & Courses/course");
const Category = require("../../models/Topics & Courses/category");

const getAllCourses = async (req, res) => {
  try {
    console.log('🔍 Starting to fetch all courses...');
    
    // First, let's check the raw courses without population
    const rawCourses = await Course.find();
    console.log('📦 Raw courses found:', rawCourses.length);
    console.log('📝 Sample raw course:', rawCourses[0] ? {
      id: rawCourses[0]._id,
      title: rawCourses[0].title,
      instructorId: rawCourses[0].instructor
    } : 'No courses found');

    // Now fetch with proper population
    const courses = await Course.find()
      .populate({
        path: 'instructor',
        model: 'Instructor',
        populate: {
          path: 'user',
          model: 'User',
          select: 'firstName lastName profilePicture'
        }
      });

    console.log('📦 Populated courses found:', courses.length);
    if (courses.length > 0) {
      const firstCourse = courses[0];
      console.log('📝 Sample populated course:', {
        id: firstCourse._id,
        title: firstCourse.title,
        instructor: firstCourse.instructor ? {
          id: firstCourse.instructor._id,
          user: firstCourse.instructor.user ? {
            id: firstCourse.instructor.user._id,
            firstName: firstCourse.instructor.user.firstName,
            lastName: firstCourse.instructor.user.lastName,
            hasProfilePicture: !!firstCourse.instructor.user.profilePicture
          } : 'No user data'
        } : 'No instructor data'
      });
    }

    // Log the actual data structure
    console.log('🔍 Course data structure:', JSON.stringify(courses[0], null, 2));

    res.status(200).json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('❌ Error in getAllCourses:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const getCourseById = async (req, res) => {
  try {
    console.log('🔍 Fetching course by ID:', req.params.id);
    const course = await Course.findById(req.params.id)
      .populate({
        path: "instructor",
        populate: {
          path: "user",
          select: "firstName lastName profilePicture"
        }
      });
    
    console.log('📦 Course found:', course ? {
      title: course.title,
      instructor: course.instructor,
      hasUser: !!course.instructor?.user
    } : 'Course not found');
    
    if (!course) {
      return res.status(404).json({ 
        success: false,
        message: "Course not found" 
      });
    }
    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('❌ Error fetching course:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const createCourse = async (req, res) => {
  try {
    console.log('🔍 Creating new course:', req.body);
    
    // Create the course
    const course = await Course.create(req.body);
    console.log('📦 Course created:', course);

    // If the course has a category, add it to that category
    if (course.category) {
      console.log('🔍 Adding course to category:', course.category);
      const category = await Category.findById(course.category);
      
      if (category) {
        // Add course to category's courses array if not already present
        if (!category.courses.includes(course._id)) {
          category.courses.push(course._id);
          await category.save();
          console.log('✅ Course added to category');
        }
      } else {
        console.log('⚠️ Category not found:', course.category);
      }
    }

    // Populate the instructor data before sending response
    const populatedCourse = await Course.findById(course._id)
      .populate({
        path: 'instructor',
        model: 'Instructor',
        populate: {
          path: 'user',
          model: 'User',
          select: 'firstName lastName profilePicture'
        }
      });

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: populatedCourse
    });
  } catch (error) {
    console.error('❌ Error creating course:', error);
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

const updateCourseCategories = async (req, res) => {
  try {
    console.log('🔍 Starting to update course categories...');
    
    // Get all courses
    const courses = await Course.find();
    console.log('📦 Found courses:', courses.length);
    
    // Get all categories
    const categories = await Category.find();
    console.log('📦 Found categories:', categories.length);
    
    // Create a map of categories for quick lookup
    const categoryMap = new Map(categories.map(cat => [cat._id.toString(), cat]));
    
    // Track updates
    let updatedCategories = 0;
    let skippedCourses = 0;
    
    // Process each course
    for (const course of courses) {
      if (course.category) {
        const category = categoryMap.get(course.category.toString());
        if (category) {
          // Add course to category if not already present
          if (!category.courses.includes(course._id)) {
            category.courses.push(course._id);
            await category.save();
            updatedCategories++;
            console.log(`✅ Added course ${course._id} to category ${category._id}`);
          } else {
            skippedCourses++;
          }
        } else {
          console.log(`⚠️ Category not found for course ${course._id}:`, course.category);
        }
      } else {
        console.log(`⚠️ Course ${course._id} has no category`);
      }
    }
    
    res.status(200).json({
      success: true,
      message: "Course categories updated successfully",
      stats: {
        totalCourses: courses.length,
        updatedCategories,
        skippedCourses
      }
    });
  } catch (error) {
    console.error('❌ Error updating course categories:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getCoursesByInstructor,
  updateCourseCategories
}; 