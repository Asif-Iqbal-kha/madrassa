import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getNews, getStats, getClasses } from '../../services/api';
import { MOCK_NEWS, MOCK_STATS, MOCK_CLASSES } from '../../data/mockData';
import { FiUsers, FiBookOpen, FiUser, FiCheckSquare, FiArrowLeft } from 'react-icons/fi';
import './PublicPages.css';

export default function HomePage() {
  const [news, setNews] = useState(MOCK_NEWS.slice(0, 3));
  const [stats, setStats] = useState(MOCK_STATS);
  const [classes, setClasses] = useState(MOCK_CLASSES);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [newsData, statsData, classesData] = await Promise.all([
          getNews(true),
          getStats(),
          getClasses(),
        ]);
        if (newsData && newsData.length > 0) setNews(newsData.slice(0, 3));
        if (statsData) setStats(statsData);
        if (classesData && classesData.length > 0) setClasses(classesData);
      } catch (e) {
        console.warn('Home data load error:', e);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Banner */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <div className="hero-logo-wrapper">
            <img src="./logo.png" alt="مدرسہ سیدنا صدیق اکبر رضی اللہ عنہ" className="hero-logo-img" />
          </div>
          <h1 className="hero-title">مدرسہ سیدنا صدیق اکبر رضی اللہ عنہ</h1>
          <p className="hero-subtitle-en">Madrassa Syedina Sadeeq-e-Akbar (RA)</p>
          <p className="hero-desc">توحید کالونی، چارسدہ روڈ، مردان، خیبر پختونخوا — تعلیم القرآن و حفظ اور دینی علوم کا مرکز</p>
          <div className="hero-actions">
            <Link to="/admission" className="btn btn-accent btn-lg">داخلہ معلومات</Link>
            <Link to="/about" className="btn btn-outline btn-lg hero-btn-outline">تعارف</Link>
          </div>
        </div>
      </section>

      {/* Statistics Bar */}
      <section className="stats-bar">
        <div className="container">
          <div className="grid grid-4">
            <div className="stat-card">
              <FiUsers size={28} className="stat-icon" />
              <div className="stat-number">{stats.totalStudents}</div>
              <div className="stat-label">کل طلباء</div>
            </div>
            <div className="stat-card">
              <FiUser size={28} className="stat-icon" />
              <div className="stat-number">{stats.totalTeachers}</div>
              <div className="stat-label">اساتذہ کرام</div>
            </div>
            <div className="stat-card">
              <FiBookOpen size={28} className="stat-icon" />
              <div className="stat-number">{stats.totalClasses}</div>
              <div className="stat-label">درجات</div>
            </div>
            <div className="stat-card">
              <FiCheckSquare size={28} className="stat-icon" />
              <div className="stat-number">{stats.attendancePercentage}%</div>
              <div className="stat-label">حاضری شرح</div>
            </div>
          </div>
        </div>
      </section>

      {/* Classes Section */}
      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">ہمارے درجات</h2>
          <div className="classes-grid">
            {classes.map((cls) => (
              <div key={cls._id} className="class-card">
                <h3>{cls.name}</h3>
                <p>تعلیمی سال: <span style={{ fontFamily: 'var(--font-english)' }}>{cls.year}</span></p>
                <div className="class-card-footer">
                  <span>طلباء: <strong style={{ fontFamily: 'var(--font-english)' }}>{cls.studentsCount || 0}</strong></span>
                  <span className="badge badge-success">فعال</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News & Announcements */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 className="section-title" style={{ margin: 0 }}>تازہ ترین اعلانات</h2>
            <Link to="/news" className="btn btn-outline btn-sm">
              تمام اعلانات <FiArrowLeft style={{ marginRight: '4px' }} />
            </Link>
          </div>
          <div className="grid grid-3">
            {news.map((item) => (
              <div key={item._id} className="news-card">
                <div className="news-card-date">{item.publishDate}</div>
                <h3>{item.title}</h3>
                <p>{item.content ? item.content.substring(0, 100) : ''}...</p>
                <Link to="/news" className="news-card-link">
                  مزید پڑھیں <FiArrowLeft />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
