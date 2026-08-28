import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getNews, getStats, getClasses, searchStudentResult } from '../../services/api';
import { MOCK_NEWS, MOCK_STATS, MOCK_CLASSES } from '../../data/mockData';
import {
  FiUsers,
  FiBookOpen,
  FiUser,
  FiCheckSquare,
  FiArrowLeft,
  FiSearch,
  FiAward,
  FiPrinter,
  FiX,
  FiCheckCircle,
  FiCalendar,
} from 'react-icons/fi';
import './PublicPages.css';

export default function HomePage() {
  const [news, setNews] = useState(MOCK_NEWS.slice(0, 3));
  const [stats, setStats] = useState(MOCK_STATS);
  const [classes, setClasses] = useState(MOCK_CLASSES);

  // Result Search State
  const [rollInput, setRollInput] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [resultsData, setResultsData] = useState(null);
  const [resultError, setResultError] = useState('');
  const [searchedRoll, setSearchedRoll] = useState('');
  const resultCardRef = useRef(null);

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

  const handleSearch = async (roll) => {
    const targetRoll = (roll || rollInput).trim();
    if (!targetRoll) {
      setResultError('برائے مہربانی رول نمبر درج کریں');
      return;
    }

    setResultError('');
    setSearchLoading(true);
    setResultsData(null);
    setSearchedRoll(targetRoll);

    try {
      const data = await searchStudentResult(targetRoll);
      if (data && !data.error && Array.isArray(data) && data.length > 0) {
        setResultsData(data);
        // Smooth scroll to result card
        setTimeout(() => {
          if (resultCardRef.current) {
            resultCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      } else {
        setResultError(data?.error || `رول نمبر ${targetRoll} کا کوئی نتیجہ دستیاب نہیں ہے`);
      }
    } catch (err) {
      setResultError('رزلٹ تلاش کرنے میں خرابی ہوئی، دوبارہ کوشش کریں');
    } finally {
      setSearchLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

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
            <a href="#result-search-section" className="btn btn-accent btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiAward size={20} /> آن لائن رزلٹ دیکھیں
            </a>
            <Link to="/admission" className="btn btn-outline btn-lg hero-btn-outline">داخلہ معلومات</Link>
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

      {/* ONLINE RESULT SEARCH & RESULT CARD SECTION */}
      <section id="result-search-section" className="section result-portal-section">
        <div className="container">
          <div className="result-section-header">
            <div className="badge-pill">امتحانی پورٹل</div>
            <h2 className="section-title" style={{ marginTop: '8px', marginBottom: '8px' }}>
              آن لائن امتحانی رزلٹ کارڈ
            </h2>
            <p className="section-subtitle">
              طالب علم اپنا رول نمبر درج کر کے سالانہ و ششماہی امتحانی نتیجہ اور تفصیلی مارکس شیٹ حاصل کریں
            </p>
          </div>

          {/* Search Box */}
          <div className="result-search-box-wrapper">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="result-search-form"
            >
              <div className="result-search-input-group">
                <FiSearch className="result-search-icon" size={22} />
                <input
                  type="text"
                  className="result-search-input"
                  placeholder="طالب علم کا رول نمبر درج کریں (مثلاً: 1001)"
                  value={rollInput}
                  onChange={(e) => setRollInput(e.target.value)}
                  style={{ fontFamily: 'var(--font-english)', direction: 'ltr', textAlign: 'right' }}
                />
                {rollInput && (
                  <button
                    type="button"
                    className="result-search-clear"
                    onClick={() => {
                      setRollInput('');
                      setResultsData(null);
                      setResultError('');
                    }}
                  >
                    <FiX size={18} />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="btn btn-primary result-search-btn"
                disabled={searchLoading}
              >
                {searchLoading ? (
                  <span>تلاش جاری ہے...</span>
                ) : (
                  <>
                    <FiSearch size={18} /> تلاش کریں
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Chips */}
            <div className="result-demo-chips">
              <span className="chips-label">نمونہ رول نمبرز:</span>
              {['1001', '1002', '1003'].map((sampleRoll) => (
                <button
                  key={sampleRoll}
                  type="button"
                  className="chip-btn"
                  onClick={() => {
                    setRollInput(sampleRoll);
                    handleSearch(sampleRoll);
                  }}
                >
                  رول نمبر {sampleRoll}
                </button>
              ))}
            </div>

            {/* Error Message */}
            {resultError && (
              <div className="result-error-alert">
                <FiX size={20} />
                <span>{resultError}</span>
              </div>
            )}
          </div>

          {/* RESULT CARD DISPLAY */}
          {resultsData && resultsData.length > 0 && (
            <div ref={resultCardRef} className="result-card-container">
              {resultsData.map((resItem, idx) => {
                const isPassed = (resItem.percentage || 0) >= 33;
                return (
                  <div key={resItem._id || idx} className="official-result-card print-target">
                    {/* Watermark Logo */}
                    <div className="result-watermark">
                      <img src="./logo.png" alt="مدرسہ واٹرمارک" />
                    </div>

                    {/* Card Top Border Accent */}
                    <div className="result-card-header-ornament">
                      <div className="ornament-line"></div>
                      <div className="ornament-bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
                      <div className="ornament-line"></div>
                    </div>

                    {/* Madrassa Official Header */}
                    <div className="result-madrassa-header">
                      <img src="./logo.png" alt="لوگو مدرسہ" className="result-madrassa-logo" />
                      <div className="result-madrassa-info">
                        <h3 className="result-madrassa-name">مدرسہ سیدنا صدیق اکبر رضی اللہ عنہ</h3>
                        <p className="result-madrassa-sub">توحید کالونی، چارسدہ روڈ، مردان، خیبر پختونخوا</p>
                        <div className="result-sheet-title">
                          <span>کشف الدرجات (امتحانی سند و رزلٹ کارڈ)</span>
                        </div>
                      </div>
                    </div>

                    {/* Student Meta Grid */}
                    <div className="result-student-meta-box">
                      <div className="meta-item">
                        <span className="meta-label">امتحان کا نام:</span>
                        <span className="meta-val highlight">{resItem.examName || 'سالانہ امتحان'}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">تعلیمی سال:</span>
                        <span className="meta-val eng">{resItem.year || '1446ھ'}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">طالب علم کا نام:</span>
                        <span className="meta-val strong">{resItem.studentName}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">رول نمبر:</span>
                        <span className="meta-val roll-val eng">{resItem.rollNumber}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">درجہ / کلاس:</span>
                        <span className="meta-val">{resItem.className}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">تاریخ اجراء:</span>
                        <span className="meta-val eng">{new Date().toISOString().split('T')[0]}</span>
                      </div>
                    </div>

                    {/* Marks Table */}
                    <div className="result-marks-table-wrapper">
                      <table className="result-marks-table">
                        <thead>
                          <tr>
                            <th style={{ width: '60px' }}>نمبر شمار</th>
                            <th>مضمون</th>
                            <th style={{ width: '110px' }}>کل نمبر</th>
                            <th style={{ width: '130px' }}>حاصل کردہ نمبر</th>
                            <th style={{ width: '120px' }}>کارکردگی</th>
                            <th style={{ width: '100px' }}>کیفیت</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(resItem.marks || []).map((m, mIdx) => {
                            const subPct = Math.round((m.obtainedMarks / m.totalMarks) * 100);
                            const subPassed = subPct >= 33;
                            return (
                              <tr key={mIdx}>
                                <td className="text-center eng">{mIdx + 1}</td>
                                <td className="subject-name">{m.subject}</td>
                                <td className="text-center eng">{m.totalMarks}</td>
                                <td className="text-center eng obtained-mark">{m.obtainedMarks}</td>
                                <td>
                                  <div className="sub-progress-box">
                                    <div className="sub-progress-bar">
                                      <div
                                        className={`sub-progress-fill ${subPct >= 80 ? 'gold' : subPct >= 60 ? 'teal' : 'normal'}`}
                                        style={{ width: `${Math.min(subPct, 100)}%` }}
                                      ></div>
                                    </div>
                                    <span className="sub-pct-text eng">{subPct}%</span>
                                  </div>
                                </td>
                                <td className="text-center">
                                  <span className={`mark-status-pill ${subPassed ? 'pass' : 'fail'}`}>
                                    {subPassed ? 'کامیاب' : 'ناکام'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="result-total-row">
                            <td colSpan="2" className="text-right total-title">
                              مجموعی میزان (Grand Total):
                            </td>
                            <td className="text-center eng total-val">{resItem.totalMarks}</td>
                            <td className="text-center eng total-val obtained">{resItem.totalObtained}</td>
                            <td colSpan="2" className="text-center">
                              <span className="total-pct-badge eng">{resItem.percentage}%</span>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Result Summary Badges */}
                    <div className="result-summary-cards">
                      <div className="summary-badge-card">
                        <div className="badge-card-icon">🎯</div>
                        <div className="badge-card-data">
                          <span className="badge-card-label">کل نمبرات</span>
                          <span className="badge-card-value eng">
                            {resItem.totalObtained} / {resItem.totalMarks}
                          </span>
                        </div>
                      </div>

                      <div className="summary-badge-card">
                        <div className="badge-card-icon">📊</div>
                        <div className="badge-card-data">
                          <span className="badge-card-label">مجموعی فیصد</span>
                          <span className="badge-card-value eng">{resItem.percentage}%</span>
                        </div>
                      </div>

                      <div className="summary-badge-card highlight-gold">
                        <div className="badge-card-icon">🏆</div>
                        <div className="badge-card-data">
                          <span className="badge-card-label">حتمی درجہ بندی</span>
                          <span className="badge-card-value">{resItem.grade || 'الف+ (ممتاز)'}</span>
                        </div>
                      </div>

                      <div className={`summary-badge-card ${isPassed ? 'highlight-green' : 'highlight-red'}`}>
                        <div className="badge-card-icon">{isPassed ? '✅' : '❌'}</div>
                        <div className="badge-card-data">
                          <span className="badge-card-label">نتیجہ</span>
                          <span className="badge-card-value">{isPassed ? 'کامیاب با امتیاز' : 'ناکام'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Official Signatures & Verification */}
                    <div className="result-card-signatures">
                      <div className="sig-block">
                        <div className="sig-line"></div>
                        <span className="sig-title">دستخط ممتحن / ناظم تعلیمات</span>
                      </div>
                      <div className="sig-stamp-box">
                        <div className="stamp-circle">
                          <FiCheckCircle size={28} />
                          <span>تصدیق شدہ امتحانی ریکارڈ</span>
                        </div>
                      </div>
                      <div className="sig-block">
                        <div className="sig-line"></div>
                        <span className="sig-title">دستخط مہتمم / صدر مدرس</span>
                      </div>
                    </div>

                    {/* Action Bar (Print / Share) */}
                    <div className="result-card-action-bar no-print">
                      <button type="button" className="btn btn-primary" onClick={handlePrint}>
                        <FiPrinter size={18} style={{ marginLeft: '6px' }} /> رزلٹ کارڈ پرنٹ / PDF ڈاؤنلوڈ کریں
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => {
                          setResultsData(null);
                          setRollInput('');
                        }}
                      >
                        بند کریں
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
                <p>
                  تعلیمی سال: <span style={{ fontFamily: 'var(--font-english)' }}>{cls.year}</span>
                </p>
                <div className="class-card-footer">
                  <span>
                    طلباء: <strong style={{ fontFamily: 'var(--font-english)' }}>{cls.studentsCount || 0}</strong>
                  </span>
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
