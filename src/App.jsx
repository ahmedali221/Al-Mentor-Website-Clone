import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/LoginPage';
import PasswordPage from './pages/PasswordPage';
import Navbar from './components/Navbar/navbar';
import Footer from './components/Footer/footer';
import BecomeInstructor from './pages/becomeInstructor';
import SignupPage from './pages/SignupPage';
import SignEmail from './pages/SignEmail';
import Home from './components/Home/home';
import Instructors from './pages/Instructors';
import { ThemeProvider } from './context/ThemeContext';
import { MyCoursesProvider } from './context/MyCoursesContext';
import './i18n/config'
import ProgramsPage from './pages/ProgramsPage';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Courses from './components/Courses/courses';
import CategoryPage from './pages/CategoryPage';
import CourseDetailsPage from './components/CourseDetails/CourseDetails';
import AllCourses from './components/Courses/AllCourses';
import LessonViewerPage from './components/LessonViewer/LessonViewerPage';
import { CourseProvider } from './components/LessonViewer/CourseContext';
import MyCourses from './components/MyCourses/MyCourses';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <MyCoursesProvider>
          <CourseProvider>
            <Navbar />
            <div className="min-h-[calc(100vh-128px)] py-8">
              <Routes>
                <Route path="/loginPage" element={<LoginPage />} />
                <Route path="/programs" element={<ProgramsPage />} />
                <Route path='/instructors' element={<Instructors />} />
                <Route path="/" element={<Home />} />
                <Route path="/signup-Email" element={<SignEmail />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/password" element={<PasswordPage />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/categories/:id" element={<CategoryPage />} />
                <Route path="/courses/:id" element={<CourseDetailsPage />} />
                <Route path="/all-courses" element={<AllCourses />} />
                <Route path="/lesson-viewer/:courseId" element={<LessonViewerPage />} />
                <Route path="/my-courses" element={<MyCourses />} />
              </Routes>
            </div>
            <Footer />
          </CourseProvider>
        </MyCoursesProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
