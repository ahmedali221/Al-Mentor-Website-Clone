const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate({
        path: "courses",
        populate: {
          path: "instructor",
          populate: {
            path: "user",
            select: "firstName lastName profilePicture"
          }
        }
      })
      .populate("topics")
      .populate("subTopics");
    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve categories",
      error: error.message,
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    console.log('🔍 Fetching category by ID:', req.params.id);
    
    const category = await Category.findById(req.params.id)
      .populate({
        path: 'courses',
        populate: {
          path: 'instructor',
          select: 'user',
          populate: {
            path: 'user',
            select: 'firstName lastName profilePicture'
          }
        }
      });

    console.log('📦 Category data:', category ? {
      id: category._id,
      name: category.name,
      coursesCount: category.courses?.length || 0,
      firstCourse: category.courses?.[0] ? {
        id: category.courses[0]._id,
        title: category.courses[0].title,
        instructor: category.courses[0].instructor ? {
          id: category.courses[0].instructor._id,
          user: category.courses[0].instructor.user ? {
            id: category.courses[0].instructor.user._id,
            firstName: category.courses[0].instructor.user.firstName,
            lastName: category.courses[0].instructor.user.lastName,
            hasProfilePicture: !!category.courses[0].instructor.user.profilePicture
          } : 'No user data'
        } : 'No instructor data'
      } : 'No courses found'
    } : 'Category not found');

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: category,
    });
  } catch (error) {
    console.error('❌ Error in getCategoryById:', error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve category",
      error: error.message,
    });
  }
}; 