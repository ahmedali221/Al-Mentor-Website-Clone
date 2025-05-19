import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import { Award, Download, Share, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const CertificatePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const currentLang = i18n.language;
  const [certificateData, setCertificateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [instructorData, setInstructorData] = useState(null);

  useEffect(() => {
    const fetchCertificateData = async () => {
      try {
        setLoading(true);
        // Fetch course data
        const courseResponse = await axios.get(`/api/courses/${courseId}`);
        
        // Fetch user data from localStorage or context
        const userData = JSON.parse(localStorage.getItem('userData'));
        
        // Fetch instructor data
        let instructorId;
        if (courseResponse.data.instructor) {
          if (typeof courseResponse.data.instructor === 'object') {
            instructorId = courseResponse.data.instructor._id || courseResponse.data.instructor.$oid;
          } else {
            instructorId = courseResponse.data.instructor;
          }
        }

        if (instructorId) {
          try {
            const instructorResponse = await axios.get(`/api/instructors/${instructorId}`);
            setInstructorData(instructorResponse.data);
          } catch (err) {
            console.error('Error fetching instructor data:', err);
          }
        }
        
        setCertificateData(courseResponse.data);
        setUserData(userData);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load certificate data');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCertificateData();
    }
  }, [courseId]);

  const getLocalizedText = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[currentLang] || obj.en || obj.ar || '';
  };

  const getInstructorName = () => {
    if (!instructorData) return 'Course Instructor';
    
    const firstName = getLocalizedText(instructorData.user?.firstName);
    const lastName = getLocalizedText(instructorData.user?.lastName);
    const title = getLocalizedText(instructorData.professionalTitle);
    
    return `${firstName} ${lastName}${title ? ` - ${title}` : ''}`;
  };

  const handleDownloadPDF = async () => {
    const certificateElement = document.getElementById('certificate');
    if (!certificateElement) return;

    try {
      const canvas = await html2canvas(certificateElement, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = (pdfHeight - imgHeight * ratio) / 2;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`certificate-${courseId}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Course Certificate',
          text: `I completed the course "${getLocalizedText(certificateData?.title)}" on Al-Mentor!`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181818] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#181818] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
            <p>Error: {error}</p>
          </div>
          <button 
            onClick={() => navigate(-1)} 
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Certificate Actions */}
        <div className="flex justify-end gap-4 mb-8">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={20} />
            <span>Download PDF</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Printer size={20} />
            <span>Print</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Share size={20} />
            <span>Share</span>
          </button>
        </div>

        {/* Certificate */}
        <div 
          id="certificate"
          className="bg-white text-black rounded-lg overflow-hidden shadow-2xl"
          style={{
            backgroundImage: 'url("/certificate-bg.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '600px',
            position: 'relative',
          }}
        >
          {/* Certificate Border */}
          <div className="absolute inset-4 border-8 border-[#00bcd4] rounded-lg"></div>

          {/* Certificate Content */}
          <div className="relative p-12 text-center">
            {/* Logo */}
            <div className="mb-8">
              <img src="/logo.png" alt="Al-Mentor" className="h-16 mx-auto" />
            </div>

            {/* Title */}
            <h1 className="text-4xl font-serif mb-8 text-[#00bcd4]">Certificate of Completion</h1>

            {/* This is to certify */}
            <p className="text-xl mb-8">This is to certify that</p>

            {/* Student Name */}
            <h2 className="text-3xl font-bold mb-8 border-b-2 border-[#00bcd4] pb-4 inline-block">
              {userData?.firstName?.[currentLang]} {userData?.lastName?.[currentLang]}
            </h2>

            {/* Course Name */}
            <p className="text-xl mb-8">has successfully completed the course</p>
            <h3 className="text-2xl font-bold mb-8 text-[#00bcd4]">
              {getLocalizedText(certificateData?.title)}
            </h3>

            {/* Date */}
            <p className="text-xl mb-8">
              on {new Date().toLocaleDateString(currentLang === 'ar' ? 'ar-SA' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>

            {/* Signature */}
            <div className="mt-12 flex justify-between items-end">
              <div className="text-center">
                <div className="border-t-2 border-black w-48 mx-auto mb-2"></div>
                <p className="font-bold">Course Instructor</p>
                <p className="text-sm">
                  {getInstructorName()}
                </p>
              </div>
              <div className="text-center">
                <div className="border-t-2 border-black w-48 mx-auto mb-2"></div>
                <p className="font-bold">Al-Mentor Director</p>
                <p className="text-sm">Al-Mentor Education</p>
              </div>
            </div>

            {/* Certificate ID */}
            <div className="absolute bottom-8 left-0 right-0 text-center">
              <p className="text-sm text-gray-600">
                Certificate ID: {courseId}-{Date.now().toString(36)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificatePage; 