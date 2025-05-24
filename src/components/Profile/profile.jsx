import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaUserCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const getLocalizedName = (nameObj) => {
    if (!nameObj) return '';
    if (typeof nameObj === 'string') return nameObj;
    return nameObj[currentLang] || nameObj.en || '';
  };

  const [name, setName] = useState(user ? `${getLocalizedName(user.firstName)} ${getLocalizedName(user.lastName)}`.trim() : '');
  const [gender, setGender] = useState('Female');
  const [dateOfBirth, setDateOfBirth] = useState({ day: '', month: '', year: '' });
  const [activeSection, setActiveSection] = useState('Personal Information');
  const [email, setEmail] = useState(user ? user.email : '');
  const [password, setPassword] = useState('********');
  const [mobile, setMobile] = useState(user ? user.mobile || '' : '');
  const [availableInterests, setAvailableInterests] = useState([
    'الموارد البشرية', 'وسائل التواصل الاجتماعي', 'التعليم', 'التواصل', 'إدارة التغيير', 'العلامة التجارية',
    'القيادة', 'التطوير الوظيفي', 'تجربة العملاء', 'ريادة الأعمال', 'الرعاية الصحية', 'مقابلات',
    'الإنتاجية', 'الرسوم المتحركة', 'التحليلات', 'الرياضة', 'الاستراتيجية', 'بينة العمل'
  ]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [purchaseHistory] = useState([
    {
      id: 1,
      date: '16/05/2025',
      status: 'قيد التنفيذ',
      packageName: 'الباقة السنوية',
      price: '2399 EGP',
      paymentMethod: 'Fawry',
      orderNumber: 'dc74a69c-612b-4721-928d-5c5dd74e3ccf',
    },
    {
      id: 2,
      date: '16/05/2025',
      status: 'قيد التنفيذ',
      packageName: 'الباقه الربع سنوية',
      price: '799 EGP',
      paymentMethod: 'Visa',
      orderNumber: '9aef29de-62ab-4d2b-b999-9eb2bf8692a8',
    },
  ]);

  // Load interests from localStorage
  useEffect(() => {
    const storedInterests = localStorage.getItem('userInterests');
    if (storedInterests) {
      setSelectedInterests(JSON.parse(storedInterests));
    }
  }, []);

  // Handlers
  const handleSave = () => {
    console.log('Saved Personal Information:', { name, gender, dateOfBirth });
  };

  const handleSaveInterests = () => {
    localStorage.setItem('userInterests', JSON.stringify(selectedInterests));
    console.log('Saved Interests:', selectedInterests);
  };

  const handleSelectInterest = (interest) => {
    if (!selectedInterests.includes(interest)) {
      setSelectedInterests([...selectedInterests, interest]);
      setAvailableInterests(availableInterests.filter(item => item !== interest));
    }
  };

  const handleRemoveInterest = (interest) => {
    setSelectedInterests(selectedInterests.filter(item => item !== interest));
    setAvailableInterests([...availableInterests, interest]);
  };

  // Render sections
  const renderContent = () => {
    switch (activeSection) {
      case 'Personal Information':
        return (
          <form className="profile-form">
            <h2>Personal Information</h2>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <div className="gender-options">
                {['Male', 'Female'].map((option) => (
                  <label key={option} className={gender === option ? 'selected' : ''}>
                    <input
                      type="radio"
                      value={option}
                      checked={gender === option}
                      onChange={(e) => setGender(e.target.value)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <div className="date-inputs">
                <select
                  value={dateOfBirth.day}
                  onChange={(e) => setDateOfBirth({ ...dateOfBirth, day: e.target.value })}
                  className="date-select"
                >
                  <option value="">Day</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <select
                  value={dateOfBirth.month}
                  onChange={(e) => setDateOfBirth({ ...dateOfBirth, month: e.target.value })}
                  className="date-select"
                >
                  <option value="">Month</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
                <select
                  value={dateOfBirth.year}
                  onChange={(e) => setDateOfBirth({ ...dateOfBirth, year: e.target.value })}
                  className="date-select"
                >
                  <option value="">Year</option>
                  {Array.from({ length: 100 }, (_, i) => 2025 - i).map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="button" onClick={handleSave} className="save-button">
              Save changes
            </button>
          </form>
        );
      case 'Account Information':
        return (
          <div className="account-info-form">
            <h2>بيانات الحساب</h2>
            <div className="form-group">
              <label htmlFor="email">الحساب</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                disabled
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">كلمة المرور</label>
              <div className="input-group">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                />
                <span className="icon">←</span>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="mobile">رقم الهاتف المحمول</label>
              <div className="input-group">
                <input
                  id="mobile"
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="input-field"
                />
                <span className="icon">←</span>
              </div>
            </div>
          </div>
        );
      case 'Interests':
        return (
          <div className="interests-section">
            <h2>الاهتمامات</h2>
            <p>اختر كل ما هو ضمن اهتماماتك</p>
            <div className="selected-interests">
              {selectedInterests.map((interest) => (
                <span
                  key={interest}
                  className="interest-tag selected"
                  onClick={() => handleRemoveInterest(interest)}
                >
                  {interest} <span className="remove-icon">×</span>
                </span>
              ))}
            </div>
            <div className="available-interests">
              {availableInterests.map((interest) => (
                <span
                  key={interest}
                  className="interest-tag"
                  onClick={() => handleSelectInterest(interest)}
                >
                  {interest}
                </span>
              ))}
            </div>
            <button onClick={handleSaveInterests} className="save-button">
              حفظ التعديلات
            </button>
          </div>
        );
      case 'Purchase Log':
        return (
          <div className="purchase-log-section">
            <h2>سجل الشراء</h2>
            <div className="purchase-items-list">
              {purchaseHistory.map((item) => (
                <div key={item.id} className="purchase-item-card">
                  <div className="item-header">
                    <span className="item-date">{item.date}</span>
                    <span className="item-status">
                      {item.status}
                      <span className="status-icon">!</span>
                    </span>
                  </div>
                  <div className="item-details">
                    <div className="package-info">
                      <div className="package-name">{item.packageName}</div>
                      <div className="package-price">{item.price}</div>
                    </div>
                    <div className={`payment-method-icon ${item.paymentMethod.toLowerCase()}`}></div>
                  </div>
                  <div className="order-info">رقم الطلب: {item.orderNumber}</div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'Payment Information':
        return <h2>Payment Information Content</h2>;
      default:
        return <h2>Select a section from the sidebar</h2>;
    }
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-header">
        <div className="profile-avatar">
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt="User Avatar" />
          ) : (
            <FaUserCircle className="default-avatar-icon" />
          )}
          <div className="camera-icon" />
        </div>
        <div className="profile-info">
          <p className="profile-name">{name}</p>
          <p className="profile-email">{email}</p>
        </div>
        <div className="subscription-info">
          <p className="subscription-text">You can subscribe on</p>
          <p className="subscription-plan">Monthly Plan with 399 EGP</p>
        </div>
      </div>
      <div className="content-wrapper">
        <aside className="sidebar">
          <nav>
            <ul>
              {['Personal Information', 'Account Information', 'Interests', 'Purchase Log', 'Payment Information'].map(
                (section) => (
                  <li
                    key={section}
                    className={activeSection === section ? 'active' : ''}
                    onClick={() => setActiveSection(section)}
                  >
                    {section}
                  </li>
                )
              )}
            </ul>
          </nav>
        </aside>
        <main className="main-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Profile;