import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { ToastContainer } from 'react-toastify';
import MainLayout from './components/Layout/MainLayout.jsx';
import AuthLayout from './components/Layout/AuthLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import PasswordPage from './pages/PasswordPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import SignEmail from './pages/SignEmail.jsx';
import Home from './components/Home/Home.jsx'; // Update Home casing
import Instructors from './pages/Instructors'; // Remove .jsx extension
import { ThemeProvider } from './context/ThemeContext.jsx';
import { MyCoursesProvider } from './context/MyCoursesContext.jsx';
import './i18n/config';
import ProgramsPage from './pages/ProgramsPage.jsx';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Courses from './components/Courses/Courses.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import CourseDetailsPage from './components/CourseDetails/CourseDetails.jsx';
import AllCourses from './components/Courses/AllCourses.jsx';
import LessonViewerPage from './components/LessonViewer/LessonViewerPage.jsx';
import { CourseProvider } from './components/LessonViewer/CourseContext.jsx';
import MyCourses from './components/MyCourses/MyCourses.jsx';
import CertificatePage from './components/Certificate/CertificatePage.jsx';
import SavedCourses from './components/Courses/SavedCourses.jsx';
import Profile from './components/Profile/Profile.jsx';
import BecomeInstructor from './pages/BecomeInstructor.jsx';
import Home2 from './components/Home2/Home2.jsx'; // Update Home2 casing
import ProgramDetailPage from './pages/ProgramDetailPage.jsx';
import InstructorDetails from './pages/InstructorDetails.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import AIChatPage from './pages/AIChatPage.jsx';
import Subscribe from './pages/Subscribe.jsx';
import InstructorDashboard from './pages/InstructorDashbaord.jsx'; // Fix typo in filename
import PaymentPage from './pages/PaymentPage.jsx';
import InstructorSessionChat from './components/InstructorSession/InstructorSessionChat.jsx';
import SessionHistory from './components/InstructorSession/SessionHistory.jsx';
import InstructorApplication from './pages/InstructorApplication.jsx';

// Create a separate component for routes
const AppRoutes = () => {
  const { user } = useAuth();
  return (
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


        {/* Protected routes */}
        <Route path="/programs" element={
          <ProtectedRoute>
            <ProgramsPage />
          </ProtectedRoute>
        } />
        <Route path="/programs/:programId" element={
          <ProtectedRoute>
            <ProgramDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/instructors" element={
          <ProtectedRoute>
            <Instructors />
          </ProtectedRoute>
        } />
        <Route path="/instructors/:id" element={
          <ProtectedRoute>
            <InstructorDetails />
          </ProtectedRoute>
        } />
        <Route path="/categories/:id" element={
          <ProtectedRoute>
            <CategoryPage />
          </ProtectedRoute>
        } />
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
            <Profile />
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

        <Route path="/AIChatPage" element={
          <ProtectedRoute>
            <AIChatPage />
          </ProtectedRoute>
        } />

        <Route path="/subscribe" element={
          <ProtectedRoute>
            <Subscribe />
          </ProtectedRoute>
        } />

        <Route path="/payment/:planId" element={
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        } />

        {/* Instructor Session Routes */}
        <Route path="/instructor-session/:sessionId" element={
          <ProtectedRoute>
            <InstructorSessionChat />
          </ProtectedRoute>
        } />

        <Route path="/my-sessions" element={
          <ProtectedRoute>
            <SessionHistory isInstructor={false} />
          </ProtectedRoute>
        } />

        <Route path="/instructor-sessions" element={
          <ProtectedRoute>
            <SessionHistory isInstructor={true} />
          </ProtectedRoute>
        } />

        {/* Instructor Routes */}
        <Route path="/instructor-dashboard" element={
          <ProtectedRoute>
            <InstructorDashboard />
          </ProtectedRoute>
        } />

        <Route path="/instructor-application" element={
          <ProtectedRoute>
            <InstructorApplication />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <MyCoursesProvider>
            <CourseProvider>
              <ToastContainer position="top-right" autoClose={3000} />
              <AppRoutes />
            </CourseProvider>
          </MyCoursesProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
