import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/navbar'; // استورد النافبار الأساسي
import Footer from '../Footer'; // نستخدم الفوتر الجديد

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20">
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default MainLayout;