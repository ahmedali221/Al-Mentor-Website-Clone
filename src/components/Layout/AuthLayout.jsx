import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';

const AuthLayout = () => {
  return (
    <>
      <Navbar />
        <Outlet />
      <Footer />
    </>
  );
};

export default AuthLayout; 