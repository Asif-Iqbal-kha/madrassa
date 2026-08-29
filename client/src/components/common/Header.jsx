import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';
import './Header.css';

export default function Header() {
  const { user } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

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
            <span>فون: 0937-123456</span>
            <span className="header-top-divider">|</span>
            <span>مردان، خیبر پختونخوا</span>
          </div>
          <div className="header-top-actions">
            {user ? (
              <Link to={`/${user.role === 'master_admin' ? 'admin' : user.role}/dashboard`} className="header-login-link">
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
            <img src="./logo.png" alt="لوگو مدرسہ عربیہ سیدنا صدیق اکبرؓ" className="header-logo-img" />
            <div className="header-title-group">
              <h1 className="header-title">مدرسہ عربیہ سیدنا صدیق اکبر رضی اللہ عنہ</h1>
              <p className="header-subtitle">توحید کالونی، چارسدہ روڈ، مردان | Madrassa Arabia Sayedina Sadeeq-e-Akbar (RA)</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="header-nav">
        <div className="container header-nav-inner">
          <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
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
    </header>
  );
}
