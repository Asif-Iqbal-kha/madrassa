import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import './Header.css';

export default function Header() {
  const { user } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile menu whenever location changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { path: '/', label: 'صفحہ اول' },
    { path: '/about', label: 'تعارف' },
    { path: '/admission', label: 'داخلہ' },
    { path: '/donation', label: 'عطیات' },
    { path: '/exams', label: 'امتحانات' },
    { path: '/results', label: 'امتحانی نتائج' },
    { path: '/news', label: 'اعلانات' },
    { path: '/gallery', label: 'تصاویر' },
    { path: '/contact', label: 'رابطہ' },
    { path: '/track', label: 'ٹریکنگ' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="site-header">
      {/* Top Bar */}
      <div className="header-top-bar">
        <div className="container header-top-inner">
          <div className="header-top-info">
            <span>فون / واٹس ایپ: <a href="tel:03153044992" style={{ color: 'inherit', fontWeight: 600 }}><span dir="ltr" className="ltr-text">0315 3044992</span></a></span>
            <span className="header-top-divider">|</span>
            <span><a href="https://maps.app.goo.gl/VNxyjrHUKwRC9v2U7" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>📍 مردان، خیبر پختونخوا (گوگل میپ)</a></span>
          </div>
          <div className="header-top-actions">
            {user && (user.role === 'master_admin' || user.role === 'teacher') ? (
              <Link to={`/${user.role === 'master_admin' ? 'admin' : 'teacher'}/dashboard`} className="header-login-link">
                ڈیش بورڈ
              </Link>
            ) : (
              <Link to="/login" className="header-login-link">لاگ ان</Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="header-main">
        <div className="container header-main-inner">
          <Link to="/" className="header-brand">
            <img src="./logo.png" alt="لوگو مدرسہ عربیہ سیدنا صدیق اکبر رضی اللہ تعالیٰ عنہ" className="header-logo-img" />
            <div className="header-title-group">
              <h1 className="header-title">مدرسہ عربیہ سیدنا صدیق اکبر رضی اللہ تعالیٰ عنہ</h1>
              <p className="header-subtitle">
                <a href="https://maps.app.goo.gl/VNxyjrHUKwRC9v2U7" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                  توحید کالونی، چارسدہ روڈ، مردان
                </a> | Madrassa Arabia Sayedina Sadeeq-e-Akbar (RA)
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="header-nav">
        <div className="container header-nav-inner">
          <button
            className="nav-toggle"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? 'مینو بند کریں' : 'مینو کھولیں'}
            title={menuOpen ? 'مینو بند کریں' : 'مینو کھولیں'}
          >
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <ul className={`nav-links ${menuOpen ? 'nav-open' : ''}`}>
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`nav-link ${isActive(link.path) ? 'nav-active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Backdrop to close menu when tapping outside */}
      {menuOpen && (
        <div
          className="nav-backdrop"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
}
