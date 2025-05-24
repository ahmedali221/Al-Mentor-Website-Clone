import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";

export const PhoneNumberForm = ({ onSubmit }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(phoneNumber);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="mb-4">
        <label className={`block mb-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
          {t("payment.forms.phoneNumber")}
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className={`w-full p-3 rounded-lg ${
            theme === "dark" 
              ? "bg-[#2C2C2C] text-white border-gray-600" 
              : "bg-white text-gray-900 border-gray-300"
          } border focus:ring-2 focus:ring-red-500 focus:border-transparent`}
          placeholder="01XXXXXXXXX"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200"
      >
        {t("payment.buttons.proceed")}
      </button>
    </form>
  );
};

export const CreditCardForm = ({ onSubmit }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(cardData);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="space-y-4">
        <div>
          <label className={`block mb-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
            {t("payment.forms.cardNumber")}
          </label>
          <input
            type="text"
            value={cardData.cardNumber}
            onChange={(e) => setCardData({...cardData, cardNumber: e.target.value})}
            className={`w-full p-3 rounded-lg ${
              theme === "dark" 
                ? "bg-[#2C2C2C] text-white border-gray-600" 
                : "bg-white text-gray-900 border-gray-300"
            } border focus:ring-2 focus:ring-red-500 focus:border-transparent`}
            placeholder="XXXX XXXX XXXX XXXX"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block mb-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
              {t("payment.forms.expiryDate")}
            </label>
            <input
              type="text"
              value={cardData.expiryDate}
              onChange={(e) => setCardData({...cardData, expiryDate: e.target.value})}
              className={`w-full p-3 rounded-lg ${
                theme === "dark" 
                  ? "bg-[#2C2C2C] text-white border-gray-600" 
                  : "bg-white text-gray-900 border-gray-300"
              } border focus:ring-2 focus:ring-red-500 focus:border-transparent`}
              placeholder="MM/YY"
              required
            />
          </div>
          <div>
            <label className={`block mb-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
              {t("payment.forms.cvv")}
            </label>
            <input
              type="text"
              value={cardData.cvv}
              onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
              className={`w-full p-3 rounded-lg ${
                theme === "dark" 
                  ? "bg-[#2C2C2C] text-white border-gray-600" 
                  : "bg-white text-gray-900 border-gray-300"
              } border focus:ring-2 focus:ring-red-500 focus:border-transparent`}
              placeholder="XXX"
              required
            />
          </div>
        </div>

        <div>
          <label className={`block mb-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
            {t("payment.forms.cardholderName")}
          </label>
          <input
            type="text"
            value={cardData.cardholderName}
            onChange={(e) => setCardData({...cardData, cardholderName: e.target.value})}
            className={`w-full p-3 rounded-lg ${
              theme === "dark" 
                ? "bg-[#2C2C2C] text-white border-gray-600" 
                : "bg-white text-gray-900 border-gray-300"
            } border focus:ring-2 focus:ring-red-500 focus:border-transparent`}
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full mt-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200"
      >
        {t("payment.buttons.proceed")}
      </button>
    </form>
  );
}; 