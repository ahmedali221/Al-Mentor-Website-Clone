import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/navbar'; // استورد النافبار الأساسي
import Footer from '../Footer/footer'; 

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-128px)] py-8">
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default MainLayout;