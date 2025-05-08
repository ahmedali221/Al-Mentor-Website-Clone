
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/LoginPage';
import PasswordPage from './pages/PasswordPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import React from 'react';
import SignupPage from './pages/SignupPage';
import SignEmail from './pages/SignEmail';
import HomePage from './pages/HomePage';


function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="min-h-[calc(100vh-128px)] py-8">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/signup-Email" element={<SignEmail />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/password" element={<PasswordPage />} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
