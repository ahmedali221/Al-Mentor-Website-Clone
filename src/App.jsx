import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/LoginPage';
import PasswordPage from './pages/PasswordPage';
import Navbar from './components/Navbar/navbar';
import Footer from './components/Footer/footer';
import React from 'react';
import SignupPage from './pages/SignupPage';
import SignEmail from './pages/SignEmail';
import Home from './components/Home/home';
import { ThemeProvider } from './context/ThemeContext'; 
import './i18n/config'

function App() {
  return (
    <ThemeProvider> {}
      <BrowserRouter>
        <Navbar />
        <div className="min-h-[calc(100vh-128px)] py-8">
          <Routes>
            {/* <Route path="/" element={<LoginPage />} /> */}
            
            <Route path="/" element={<Home />} />
            {/* <Route path="/signup-Email" element={<SignEmail />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/password" element={<PasswordPage />} /> */}
          </Routes>
        </div>
        <Footer />
      </BrowserRouter>
    </ThemeProvider> 
  );
}

export default App;
