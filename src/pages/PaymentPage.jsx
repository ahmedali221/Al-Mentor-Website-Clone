import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { PhoneNumberForm, CreditCardForm } from '../components/PaymentForms';
import axios from 'axios';

function PaymentPage() {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";
  const planId = location.state?.planId;
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [planDetails, setPlanDetails] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Static data
  const userEmail = 'alaamostafaomar55@gmail.com';

  useEffect(() => {
    const fetchPlanDetails = async () => {
      if (!planId) {
        navigate('/subscribe');
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/subscriptions/${planId}`);
        setPlanDetails(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching plan details:', err);
        setError('Failed to load plan details');
        setLoading(false);
        setTimeout(() => navigate('/subscribe'), 3000);
      }
    };

    fetchPlanDetails();
  }, [planId, navigate]);

  const handlePaymentMethodClick = (methodId) => {
    setSelectedPaymentMethod(prevMethod => {
      const newMethod = prevMethod === methodId ? '' : methodId;
      setShowPaymentForm(!!newMethod);
      return newMethod;
    });
  };

  const handlePaymentSubmit = (data) => {
    // Here you would handle the payment submission
    console.log('Payment data:', data);
    // Add your payment processing logic here
  };

  const paymentMethods = [
    { 
      id: 'credit', 
      label: t('payment.paymentMethods.creditCard'),
      icons: ['mastercard.png', 'visa.png']
    },
    { 
      id: 'fawry', 
      label: t('payment.paymentMethods.fawry'),
      icons: ['fawry.png']
    },
    { 
      id: 'vodafone', 
      label: t('payment.paymentMethods.vodafone'),
      icons: ['vodafone.png']
    },
    { 
      id: 'valu', 
      label: t('payment.paymentMethods.valu'),
      icons: ['valu.png']
    }
  ];

  const renderPaymentForm = () => {
    if (!showPaymentForm) return null;

    switch (selectedPaymentMethod) {
      case 'credit':
        return <CreditCardForm onSubmit={handlePaymentSubmit} />;
      case 'fawry':
      case 'vodafone':
      case 'valu':
        return <PhoneNumberForm onSubmit={handlePaymentSubmit} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === "dark" ? "bg-[#1A1A1A] text-white" : "bg-gray-50 text-gray-900"
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4">{t("messages.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === "dark" ? "bg-[#1A1A1A] text-white" : "bg-gray-50 text-gray-900"
      }`}>
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">{error}</p>
          <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
            {t("messages.redirecting")}
          </p>
        </div>
      </div>
    );
  }

  if (!planDetails) {
    return null;
  }

  return (
    <div 
      className={`min-h-screen py-8 flex items-center justify-center ${
        theme === "dark" ? "bg-[#1A1A1A] text-white" : "bg-gray-50 text-gray-900"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex gap-8">
          {/* Left Section */}
          <div className="flex-1">
            {/* Title */}
            <h1 className="text-2xl font-semibold mb-6">
              {t("payment.title")}
            </h1>

            {/* Email Section */}
            <div className={`mb-6 ${
              theme === "dark" ? "bg-[#222222]" : "bg-white"
            } rounded-lg p-6`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                    {t("payment.loggedInWith")}
                  </span>
                  <span className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {userEmail}
                  </span>
                </div>
                <button className="text-[#00A7E7] hover:text-[#0090c8] whitespace-nowrap">
                  {t("payment.buttons.change")}
                </button>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">
                {t("payment.details")}
              </h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="rounded-lg overflow-hidden">
                    <div
                      onClick={() => handlePaymentMethodClick(method.id)}
                      className={`flex items-center justify-between p-4 cursor-pointer ${
                        selectedPaymentMethod === method.id
                          ? `${theme === "dark" ? "bg-[#2C2C2C]" : "bg-white"} border border-red-500`
                          : theme === "dark" ? "bg-[#222222]" : "bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedPaymentMethod === method.id
                            ? 'border-red-500'
                            : 'border-gray-400'
                        }`}>
                          {selectedPaymentMethod === method.id && (
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                          )}
                        </div>
                        <span className="text-white">{method.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {method.icons.map((icon, index) => (
                          <img
                            key={index}
                            src={`/public/${icon}`}
                            alt=""
                            className="h-6 object-contain"
                          />
                        ))}
                      </div>
                    </div>
                    {selectedPaymentMethod === method.id && (
                      <div className={`p-4 ${
                        theme === "dark" ? "bg-[#2C2C2C]" : "bg-white"
                      }`}>
                        {renderPaymentForm()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Section - Order Summary */}
          <div className="w-[400px]">
            <div className={`${
              theme === "dark" ? "bg-[#1A1A1A]" : "bg-white"
            } rounded-lg p-6`}>
              {/* Plan Header */}
              <div className={`${
                theme === "dark" ? "bg-[#222222]" : "bg-gray-100"
              } -mx-6 -mt-6 p-6 rounded-lg mb-6`}>
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl text-white">
                      {planDetails.displayName?.[i18n.language] || planDetails.name}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      {t("payment.planDuration", {
                        value: planDetails.duration?.value,
                        unit: planDetails.duration?.unit.toLowerCase()
                      })}
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate('/subscribe')}
                    className="text-[#00A7E7] text-sm hover:text-[#0090c8]"
                  >
                    {t("changePlan")}
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>{t("payment.orderSummary.price")}</span>
                  <span>
                    {planDetails.price?.amount} {planDetails.price?.currency}
                  </span>
                </div>

                {/* Total */}
                <div className="pt-3 border-t border-gray-700">
                  <div className="flex justify-between font-semibold mb-2">
                    <span>{t("payment.orderSummary.total")}</span>
                    <span>{planDetails.price?.amount} {planDetails.price?.currency}</span>
                  </div>
                </div>
              </div>

              {/* Proceed Button */}
              <button 
                className="w-full mt-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200"
              >
                {t("payment.buttons.proceed")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage; 