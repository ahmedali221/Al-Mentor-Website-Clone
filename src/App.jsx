import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { ToastContainer } from 'react-toastify';
import MainLayout from './components/Layout/MainLayout';
import AuthLayout from './components/Layout/AuthLayout';

import LoginPage from './pages/LoginPage';
import PasswordPage from './pages/PasswordPage';
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
import CertificatePage from './components/Certificate/CertificatePage';
import SavedCourses from './components/Courses/SavedCourses';
import Profie from './components/Profile/profile';
import BecomeInstructor from './pages/BecomeInstructor';
import Home2 from './components/Home2/home2';
import ProgramDetailPage from './pages/ProgramDetailPage';
import InstructorDetails from './pages/InstructorsDetails';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from "./routes/ProtectedRoute"; 

function App() {
  const { user } = useAuth(); 

  return (
    <ThemeProvider>
      <BrowserRouter>
        <MyCoursesProvider>
          <CourseProvider>
            <ToastContainer position="top-right" autoClose={3000} />
            <Routes>
              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/loginPage" element={<LoginPage />} />
                <Route path="/signup-Email" element={<SignEmail />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/password" element={<PasswordPage />} />
              </Route>

              {/* Main Routes */}
              <Route element={<MainLayout />}>
                {/* Root route */}
                <Route path="/" element={
                  user ? <Navigate to="/home" /> : <Home />
                } />

                {/* Regular routes */}
                <Route path="/home" element={<Home2 />} />
                <Route path="/programs" element={<ProgramsPage />} />
                <Route path="/programs/:programId" element={<ProgramDetailPage />} />
                <Route path="/instructors" element={<Instructors />} />
                <Route path="/instructors/:id" element={<InstructorDetails />} />
                <Route path="/categories/:id" element={<CategoryPage />} />

                {/* Protected routes */}
                <Route path="/courses" element={
                  <ProtectedRoute>
                    <Courses />
                  </ProtectedRoute>
                } />

                <Route path="/courses/:id" element={
                  <ProtectedRoute>
                    <CourseDetailsPage />
                  </ProtectedRoute>
                } />

                <Route path="/all-courses" element={
                  <ProtectedRoute>
                    <AllCourses />
                  </ProtectedRoute>
                } />

                <Route path="/lesson-viewer/:courseId" element={
                  <ProtectedRoute>
                    <LessonViewerPage />
                  </ProtectedRoute>
                } />

                <Route path="/my-courses" element={
                  <ProtectedRoute>
                    <MyCourses />
                  </ProtectedRoute>
                } />

                <Route path="/certificate/:courseId" element={
                  <ProtectedRoute>
                    <CertificatePage />
                  </ProtectedRoute>
                } />

                <Route path="/certificates" element={
                  <ProtectedRoute>
                    <CertificatePage />
                  </ProtectedRoute>
                } />

                <Route path="/saved-courses" element={
                  <ProtectedRoute>
                    <SavedCourses />
                  </ProtectedRoute>
                } />

                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profie />
                  </ProtectedRoute>
                } />

                <Route path="/my-progress" element={
                  <ProtectedRoute>
                    <MyCourses />
                  </ProtectedRoute>
                } />

                <Route path="/become-instructor" element={
                  <ProtectedRoute>
                    <BecomeInstructor />
                  </ProtectedRoute>
                } />
              </Route>
            </Routes>
          </CourseProvider>
        </MyCoursesProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
