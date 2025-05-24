import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/navbar'; // استورد النافبار الأساسي
import Footer from '../Footer/footer'; 

const MainLayout = () => {
  return (
    <>
      <Navbar />
        <Outlet />
      <Footer />
    </>
  );
};

export default MainLayout;