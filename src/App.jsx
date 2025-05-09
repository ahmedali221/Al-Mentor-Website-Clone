import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/navbar';
import LoginPage from './pages/LoginPage';
import Home from './components/Home/home';
import SignUpPage from './components/Signup/signup';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Footer from './components/Footer/footer';
import LanguageSwitcher from './components/LanguageSwitcher';
import './i18n/config';
import { ThemeProvider } from './context/ThemeContext';
import { useTheme } from './context/ThemeContext';

function AppContent() {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-[#121212]' : 'bg-gray-50'} transition-colors duration-200`}>
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/instructors" element={<h1>Instructors Page</h1>} />
          <Route path="/programs" element={<h1>Programs Page</h1>} />
          <Route path="/subscribe" element={<h1>Subscribe Page</h1>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage/>} />
          <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
