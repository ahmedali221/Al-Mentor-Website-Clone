import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaUserCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import './Profile.css';

const Profile = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const currentLang = i18n.language;

  // Load initial state from localStorage or user data
  const [nameAr] = useState(user ? `${user.firstName?.ar || ''} ${user.lastName?.ar || ''}`.trim() : '');
  const [nameEn] = useState(user ? `${user.firstName?.en || ''} ${user.lastName?.en || ''}`.trim() : '');
  const [gender, setGender] = useState(() => localStorage.getItem('userGender') || 'Female');
  const [dateOfBirth, setDateOfBirth] = useState(() => {
    const saved = localStorage.getItem('userDateOfBirth');
    return saved ? JSON.parse(saved) : { day: '', month: '', year: '' };
  });
  const [activeSection, setActiveSection] = useState('Personal Information');
  const [email] = useState(user ? user.email : '');

  useEffect(() => {
    localStorage.setItem('userGender', gender);
    localStorage.setItem('userDateOfBirth', JSON.stringify(dateOfBirth));
  }, [gender, dateOfBirth]);

  const handleSave = () => {
    console.log('Saved Personal Information:', { 
      nameAr, 
      nameEn, 
      gender, 
      dateOfBirth 
    });
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'Personal Information':
        return (
          <form className={`profile-form ${theme === 'dark' ? 'dark' : ''}`}>
            <h2>{t('profile.personalInfo')}</h2>
            <div className="form-group">
              <label htmlFor="nameAr">{t('profile.name')} (العربية)</label>
              <input
                id="nameAr"
                type="text"
                value={nameAr}
                className="input-field"
                dir="rtl"
                disabled
              />
            </div>
            <div className="form-group">
              <label htmlFor="nameEn">{t('profile.name')} (English)</label>
              <input
                id="nameEn"
                type="text"
                value={nameEn}
                className="input-field"
                dir="ltr"
                disabled
              />
            </div>
            <div className="form-group">
              <label>{t('profile.gender')}</label>
              <div className="gender-options">
                {['Male', 'Female'].map((option) => (
                  <label key={option} className={gender === option ? 'selected' : ''}>
                    <input
                      type="radio"
                      value={option}
                      checked={gender === option}
                      onChange={(e) => setGender(e.target.value)}
                    />
                    {t(`profile.${option.toLowerCase()}`)}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>{t('profile.dateOfBirth')}</label>
              <div className="date-inputs">
                <select
                  value={dateOfBirth.day}
                  onChange={(e) => setDateOfBirth({ ...dateOfBirth, day: e.target.value })}
                  className="date-select"
                >
                  <option value="">{t('profile.day')}</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <select
                  value={dateOfBirth.month}
                  onChange={(e) => setDateOfBirth({ ...dateOfBirth, month: e.target.value })}
                  className="date-select"
                >
                  <option value="">{t('profile.month')}</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
                <select
                  value={dateOfBirth.year}
                  onChange={(e) => setDateOfBirth({ ...dateOfBirth, year: e.target.value })}
                  className="date-select"
                >
                  <option value="">{t('profile.year')}</option>
                  {Array.from({ length: 100 }, (_, i) => 2025 - i).map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="button" onClick={handleSave} className="save-button">
              {t('profile.saveChanges')}
            </button>
          </form>
        );
      case 'Account Information':
        return (
          <div className={`account-info-form ${theme === 'dark' ? 'dark' : ''}`}>
            <h2>{t('profile.accountInfo')}</h2>
            <div className="form-group">
              <label htmlFor="name">{t('profile.name')}</label>
              <input
                id="name"
                type="text"
                value={currentLang === 'ar' ? nameAr : nameEn}
                className="input-field"
                disabled
                dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">{t('profile.email')}</label>
              <input
                id="email"
                type="email"
                value={email}
                className="input-field"
                disabled
              />
            </div>
          </div>
        );
      default:
        return <h2>{t('profile.selectSection')}</h2>;
    }
  };

  return (
    <div className={`profile-wrapper ${theme === 'dark' ? 'dark' : ''}`}>
      <div className={`profile-header ${theme === 'dark' ? 'dark' : ''}`}>
        <div className="profile-avatar">
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt="User Avatar" />
          ) : (
            <FaUserCircle className="default-avatar-icon" />
          )}
          <div className="camera-icon" />
        </div>
        <div className="profile-info">
          <p className="profile-name">{currentLang === 'ar' ? nameAr : nameEn}</p>
          <p className="profile-email">{email}</p>
        </div>
      </div>
      <div className="content-wrapper">
        <aside className={`sidebar ${theme === 'dark' ? 'dark' : ''}`}>
          <nav>
            <ul>
              {[
                { id: 'Personal Information', label: t('profile.personalInfo') },
                { id: 'Account Information', label: t('profile.accountInfo') }
              ].map((section) => (
                <li
                  key={section.id}
                  className={activeSection === section.id ? 'active' : ''}
                  onClick={() => setActiveSection(section.id)}
                >
                  {section.label}
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <main className={`main-content ${theme === 'dark' ? 'dark' : ''}`}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Profile;