import { Link } from 'react-router-dom';
import { MOCK_NEWS, MOCK_STATS, MOCK_CLASSES } from '../../data/mockData';
import { FiUsers, FiBookOpen, FiUser, FiCheckSquare, FiArrowLeft } from 'react-icons/fi';
import './PublicPages.css';

export default function HomePage() {
  const latestNews = MOCK_NEWS.slice(0, 3);

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
              <div className="stat-number">{MOCK_STATS.totalStudents}</div>
              <div className="stat-label">کل طلباء</div>
            </div>
            <div className="stat-card">
              <FiUser size={28} className="stat-icon" />
              <div className="stat-number">{MOCK_STATS.totalTeachers}</div>
              <div className="stat-label">اساتذہ کرام</div>
            </div>
            <div className="stat-card">
              <FiBookOpen size={28} className="stat-icon" />
              <div className="stat-number">{MOCK_STATS.totalClasses}</div>
              <div className="stat-label">درجات</div>
            </div>
            <div className="stat-card">
              <FiCheckSquare size={28} className="stat-icon" />
              <div className="stat-number">{MOCK_STATS.attendancePercentage}%</div>
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
            {MOCK_CLASSES.map((cls) => (
              <div key={cls._id} className="class-chip">
                <span className="class-chip-name">{cls.name}</span>
                <span className="class-chip-count">{cls.studentsCount} طلباء</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">تازہ ترین اعلانات</h2>
          <div className="grid grid-3">
            {latestNews.map((item) => (
              <article key={item._id} className="news-card card">
                <div className="news-card-category">
                  {item.category === 'news' ? 'خبر' : item.category === 'announcement' ? 'اعلان' : 'تقریب'}
                </div>
                <div className="card-body">
                  <h3 className="news-card-title">{item.title}</h3>
                  <p className="news-card-text">{item.content.substring(0, 120)}...</p>
                  <div className="news-card-date">{item.publishDate}</div>
                </div>
              </article>
            ))}
          </div>
          <div className="text-center" style={{ marginTop: '32px' }}>
            <Link to="/news" className="btn btn-outline">
              تمام اعلانات دیکھیں
              <FiArrowLeft size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">فوری رسائی</h2>
          <div className="grid grid-3">
            <Link to="/admission" className="quick-link-card">
              <h3>داخلہ</h3>
              <p>نئے طلباء کے داخلے کی معلومات</p>
            </Link>
            <Link to="/exams" className="quick-link-card">
              <h3>امتحانات</h3>
              <p>امتحانات کا شیڈول اور ڈیٹ شیٹ</p>
            </Link>
            <Link to="/login" className="quick-link-card">
              <h3>پورٹل لاگ ان</h3>
              <p>طلباء، اساتذہ اور ایڈمن لاگ ان</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
