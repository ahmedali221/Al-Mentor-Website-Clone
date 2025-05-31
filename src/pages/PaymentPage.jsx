import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { PhoneNumberForm, CreditCardForm } from "../components/PaymentForms";
import axios from "axios";
import PayPalButton from "../components/PayPalButton";
import Swal from "sweetalert2";

function PaymentPage() {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const { user, loading: authLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { planId } = useParams();
  const isRTL = i18n.language === "ar";

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [error, setError] = useState(null);
  const [planDetails, setPlanDetails] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [planLoading, setPlanLoading] = useState(true);
  const [showCancelled, setShowCancelled] = useState(false);

  // Static data
  const userEmail = user?.email || "";
  const isLoggedIn = !!user;

  const handlePayment = async (details) => {
    if (!user) {
      navigate("/loginPage");

      return;
    }
    console.log("details:", details);

    try {
      // Validate required data
      if (!details?.purchase_units?.[0]?.payments?.captures?.[0]?.status) {
        throw new Error("Invalid payment details received from PayPal");
      }

      if (!planDetails?.price?.amount) {
        throw new Error("Invalid plan details");
      }

      // Convert PayPal status to lowercase and validate
      const paypalStatus = details.purchase_units[0].payments.captures[0].status.toLowerCase();
      let statusEn = "pending";
      let statusAr = "قيد الانتظار";

      if (paypalStatus === "completed") {
        statusEn = "completed";
        statusAr = "مكتمل";
      } else if (paypalStatus === "failed") {
        statusEn = "failed";
        statusAr = "فشل";
      } else if (paypalStatus === "declined") {
        throw new Error("payment.error.declined");
      }

      // Validate amount matches plan price
      const paypalAmount = Number(details.purchase_units[0].amount.value);
      const planAmount = Number(planDetails.price.amount);

      if (paypalAmount !== planAmount) {
        throw new Error("payment.error.amountMismatch");
      }

      // Create payment data object matching the required format exactly
      const paymentData = {
        user: user._id,
        subscription: planId,
        amount: Number(planDetails.price.amount),
        transactionId: details.id,
        currency: details.purchase_units[0].amount.currency_code,
        paymentMethod: "paypal",
        status: {
          en: statusEn,
          ar: statusAr,
        },
      };



      const response = await axios.post("/api/payments/", paymentData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data) {
        try {
          await axios.post(
            "/api/user-subscriptions/user",
            {
              userId: user._id,
              subscriptionId: planId
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
        } catch (subscriptionErr) {
          console.error(t("messages.error"), subscriptionErr);
        }

        // Show success message
        await Swal.fire({
          icon: "success",
          title: t("payment.success.title"),
          text: t("payment.success.message"),
          confirmButtonText: t("buttons.submit"),
        });

        // Redirect to home page after successful payment
        navigate("/");
      }
    } catch (err) {
      console.error(t("messages.error"), err);
      console.log("err.response:", err.response);
      Swal.close();

      let errorMessage = t("payment.error.message");

      if (err.message === "payment.error.declined") {
        errorMessage = t("payment.error.declined");
      } else if (err.message === "payment.error.amountMismatch") {
        errorMessage = t("payment.error.amountMismatch");
      } else if (err.response?.status === 422) {
        errorMessage = t("payment.error.validation");
      } else if (err.response?.status === 400) {
        errorMessage = t("payment.error.invalidRequest");
      } else if (err.response?.status === 401) {
        errorMessage = t("payment.error.unauthorized");
        // Redirect to login if unauthorized
        setTimeout(() => navigate("/loginPage"), 2000);
      }

      // Show error message
      await Swal.fire({
        icon: "error",
        title: t("payment.error.title"),
        text: errorMessage,
        confirmButtonText: t("buttons.submit"),
      });
    }
  };
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/loginPage", {
        state: {
          from: location.pathname,
          message: t("messages.loginRequired")
        }
      });
      return;
    }

    const fetchPlanDetails = async () => {
      if (!planId) {
        navigate("/subscribe");
        return;
      }

      try {
        setPlanLoading(true);
        const response = await axios.get(
          `/api/subscriptions/${planId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setPlanDetails(response.data);
        setPlanLoading(false);
      } catch (err) {
        console.error("Error fetching plan details:", err);
        setError(t("messages.failedToLoadPlan"));
        setPlanLoading(false);
        setTimeout(() => navigate("/subscribe"), 3000);
      }
    };

    console.log("planId:", planId);
    fetchPlanDetails();
  }, [user, authLoading, navigate, planId, location.pathname, t]);

  const handlePaymentMethodClick = (methodId) => {
    setSelectedPaymentMethod((prevMethod) => {
      const newMethod = prevMethod === methodId ? "" : methodId;
      setShowPaymentForm(!!newMethod);
      return newMethod;
    });
  };

  const handlePaymentSubmit = (data) => {
    // Here you would handle the payment submission
    console.log("Payment data:", data);
    // Add your payment processing logic here



  };

  const paymentMethods = [
    {
      id: "credit",
      label: t("payment.paymentMethods.creditCard"),
      icons: ["mastercard.png", "visa.png"],
    },
    {
      id: "vodafone",
      label: t("payment.paymentMethods.vodafone"),
      icons: ["vodafone.png"],
    },
    {
      id: "valu",
      label: t("payment.paymentMethods.valu"),
      icons: ["valu.png"],
    },
  ];

  const renderPaymentForm = () => {
    if (!showPaymentForm) return null;

    switch (selectedPaymentMethod) {
      case "credit":
        return <CreditCardForm onSubmit={handlePaymentSubmit} />;
      case "vodafone":
      case "valu":
        return <PhoneNumberForm onSubmit={handlePaymentSubmit} />;
      default:
        return null;
    }
  };

  if (authLoading || planLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${theme === "dark"
          ? "bg-[#1A1A1A] text-white"
          : "bg-gray-50 text-gray-900"
          }`}>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto'></div>
          <p className='mt-4'>{t("messages.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${theme === "dark"
          ? "bg-[#1A1A1A] text-white"
          : "bg-gray-50 text-gray-900"
          }`}>
        <div className='text-center'>
          <p className='text-red-500 text-xl mb-4'>{error}</p>
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
      className={`min-h-screen flex items-center justify-center mt-16 ${theme === "dark"
        ? "bg-[#1A1A1A] text-white"
        : "bg-gray-50 text-gray-900"
        }`}
      dir={isRTL ? "rtl" : "ltr"}>
      <div className='w-full max-w-[1200px] px-2 pt-28 pb-12'>
        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Left Section */}
          <div className='flex-1'>
            {/* Title */}
            <h1 className='text-2xl font-semibold mb-6'>
              {t("payment.title")}
            </h1>

            {/* Email Section */}
            <div
              className={`mb-6 ${theme === "dark" ? "bg-[#222222]" : "bg-white"
                } rounded-lg p-6`}>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                <div className='flex flex-col gap-1'>
                  <span
                    className={
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }>
                    {t("payment.loggedInWith")}
                  </span>
                  <span
                    className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"
                      }`}>
                    {userEmail}
                  </span>
                </div>
                <button
                  className='text-[#00A7E7] hover:text-[#0090c8] whitespace-nowrap'
                  onClick={() => {
                    logout();
                    window.location.href = "/loginPage";
                  }}
                >
                  {t("payment.buttons.change")}
                </button>
              </div>
            </div>

            {/* Payment Methods */}
            <div className='mb-6'>
              <h2 className='text-xl font-semibold mb-4'>
                {t("payment.details")}
              </h2>
              <div className='space-y-3'>
                {paymentMethods.map((method) => (
                  <div key={method.id} className='rounded-lg overflow-hidden'>
                    <div
                      onClick={() => handlePaymentMethodClick(method.id)}
                      className={`flex items-center justify-between p-4 cursor-pointer ${selectedPaymentMethod === method.id
                        ? `${theme === "dark" ? "bg-[#2C2C2C]" : "bg-white"
                        } border border-red-500`
                        : theme === "dark"
                          ? "bg-[#222222]"
                          : "bg-gray-100"
                        }`}>
                      <div className='flex items-center gap-4'>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPaymentMethod === method.id
                            ? "border-red-500"
                            : "border-gray-400"
                            }`}>
                          {selectedPaymentMethod === method.id && (
                            <div className='w-2.5 h-2.5 rounded-full bg-red-500' />
                          )}
                        </div>
                        <span className={theme === "dark" ? "text-white" : "text-gray-900"}>{method.label}</span>
                      </div>
                      <div className='flex items-center gap-3'>
                        {method.icons.map((icon, index) => (
                          <img
                            key={index}
                            src={`/public/${icon}`}
                            alt=''
                            className='h-6 object-contain'
                          />
                        ))}
                      </div>
                    </div>
                    {selectedPaymentMethod === method.id && (
                      <div
                        className={`p-4 ${theme === "dark" ? "bg-[#2C2C2C]" : "bg-white"
                          }`}>
                        {renderPaymentForm()}
                      </div>
                    )}
                  </div>
                ))}
                <PayPalButton
                  amountval={planDetails.price.amount}
                  onSuccess={(details) => {
                    handlePayment(details);
                  }}
                  onCancel={() => setShowCancelled(true)}
                />
              </div>
            </div>
          </div>

          {/* Right Section - Order Summary */}
          <div className='w-full lg:w-[400px]'>
            <div
              className={`${theme === "dark" ? "bg-[#1A1A1A]" : "bg-white"
                } rounded-lg p-6`}>
              {/* Plan Header */}
              <div
                className={`${theme === "dark" ? "bg-[#222222]" : "bg-gray-100"
                  } -mx-6 -mt-6 p-6 rounded-lg mb-6`}>
                <div className='flex justify-between items-center'>
                  <div>
                    <h2 className='text-xl text-white'>
                      {planDetails.displayName?.[i18n.language] ||
                        planDetails.name}
                    </h2>
                    <p className='text-gray-500 text-sm mt-1'>
                      {t("subscription.duration", {
                        value: planDetails.duration?.value,
                        unit: t(`subscription.units.${planDetails.duration?.unit.toLowerCase()}`)
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/subscribe")}
                    className='text-[#00A7E7] text-sm hover:text-[#0090c8]'>
                    {t("changePlan")}
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className='space-y-3'>
                <div className={`flex justify-between ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  <span>{t("payment.orderSummary.price")}</span>
                  <span>
                    {planDetails.price?.amount} {planDetails.price?.currency}
                  </span>
                </div>

                {/* Total */}
                <div className={`pt-3 border-t ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                  <div className={`flex justify-between font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    <span>{t("payment.orderSummary.total")}</span>
                    <span>
                      {planDetails.price?.amount} {planDetails.price?.currency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Proceed Button */}
              <button className='w-full mt-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200'>
                {t("subscription.subscribe")}
              </button>
            </div>
          </div>
        </div>
      </div>
      {showCancelled && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{
            background: "#fff", borderRadius: 10, padding: 32, minWidth: 320, textAlign: "center", boxShadow: "0 2px 16px #0002"
          }}>
            <h2 style={{ color: "#2196f3", fontSize: 48, margin: 0 }}>ⓘ</h2>
            <h2 style={{ margin: "16px 0 8px" }}>{t("payment.cancelled.title")}</h2>
            <p style={{ marginBottom: 24 }}>{t("payment.cancelled.message")}</p>
            <button
              style={{
                background: "#7c5dfa", color: "#fff", border: "none", borderRadius: 6, padding: "10px 32px", fontSize: 18, cursor: "pointer"
              }}
              onClick={() => setShowCancelled(false)}
            >
              {t("buttons.submit")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentPage;
