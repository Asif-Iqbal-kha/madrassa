import { useState, useEffect } from 'react';
import {
  getStats,
  getNews,
  getClasses,
  getStudents,
  getTeachers,
  getDonations,
  getAdmissions,
  optimizeDatabase,
} from '../../services/api';
import {
  FiUsers,
  FiUser,
  FiBookOpen,
  FiCheckSquare,
  FiHeart,
  FiUserPlus,
  FiDatabase,
  FiCheckCircle,
  FiRefreshCw,
  FiZap,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import '../dashboard/DashboardPages.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    attendancePercentage: 0,
    pendingDonations: 0,
    pendingAdmissions: 0,
  });
  const [recentNews, setRecentNews] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [optimizationError, setOptimizationError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsData, newsData, classesData, studentsData, teachersData] = await Promise.all([
          getStats(),
          getNews(false),    // false = fetch all news for admin view
          getClasses(),
          getStudents().catch(() => []),
          getTeachers().catch(() => []),
        ]);

        const activeStudents = (studentsData || []).filter(
          (s) => s.status === 'active' || (!s.status && s.status !== 'inactive' && s.status !== 'graduated')
        );
        const graduatedCount = statsData?.graduatedStudents ?? (studentsData || []).filter((s) => s.status === 'graduated').length;
        const activeCount = statsData?.activeStudents ?? activeStudents.length;
        const totalCount = statsData?.totalStudents ?? (studentsData?.length || 0);

        setStats({
          totalStudents: totalCount,
          activeStudents: activeCount,
          graduatedStudents: graduatedCount,
          totalTeachers: statsData?.totalTeachers ?? teachersData?.length ?? 0,
          totalClasses: statsData?.totalClasses ?? (classesData?.length || 0),
          attendancePercentage: statsData?.attendancePercentage ?? 0,
          pendingDonations: statsData?.pendingDonations ?? 0,
          pendingAdmissions: statsData?.pendingAdmissions ?? 0,
        });

        setRecentNews((newsData || []).slice(0, 5));
        setClasses(classesData || []);
      } catch (err) {
        console.warn('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const handleRunOptimization = async () => {
    setOptimizing(true);
    setOptimizationError('');
    try {
      const res = await optimizeDatabase();
      setOptimizationResult(res);
    } catch (err) {
      setOptimizationError(err.message || 'ڈیٹا بیس آپٹیمائزیشن میں خرابی ہوئی');
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div>
      <h2 className="page-title">ڈیش بورڈ</h2>

      {loading ? (
        <div className="admin-loading-screen">
          <div className="admin-loading-spinner"></div>
          <p className="admin-loading-text">ڈیش بورڈ لوڈ ہو رہا ہے...</p>
          <div className="admin-loading-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      ) : (
      <>
      {/* Stats */}
      <div className="dash-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="dash-stat-card">
          <FiUsers size={24} className="dash-stat-icon" />
          <div className="stat-number">{loading ? '...' : stats.totalStudents}</div>
          <div className="stat-label">
            کل طلباء {stats.graduatedStudents > 0 ? `(${stats.activeStudents} فعال + ${stats.graduatedStudents} فارغ)` : ''}
          </div>
        </div>
        <div className="dash-stat-card">
          <FiUser size={24} className="dash-stat-icon" />
          <div className="stat-number">{loading ? '...' : stats.totalTeachers}</div>
          <div className="stat-label">اساتذہ</div>
        </div>
        <div className="dash-stat-card">
          <FiBookOpen size={24} className="dash-stat-icon" />
          <div className="stat-number">{loading ? '...' : stats.totalClasses}</div>
          <div className="stat-label">درجات</div>
        </div>
        <div className="dash-stat-card">
          <FiCheckSquare size={24} className="dash-stat-icon" />
          <div className="stat-number">{loading ? '...' : `${stats.attendancePercentage}%`}</div>
          <div className="stat-label">آج کی حاضری</div>
        </div>
        <Link to="/admin/donations" className="dash-stat-card" style={{ textDecoration: 'none', borderRight: '4px solid var(--color-accent)' }}>
          <FiHeart size={24} className="dash-stat-icon" style={{ color: 'var(--color-primary)' }} />
          <div className="stat-number" style={{ color: stats.pendingDonations > 0 ? 'var(--color-warning)' : 'inherit' }}>
            {loading ? '...' : stats.pendingDonations}
          </div>
          <div className="stat-label">زیر غور عطیات</div>
        </Link>
        <Link to="/admin/admissions" className="dash-stat-card" style={{ textDecoration: 'none', borderRight: '4px solid var(--color-info)' }}>
          <FiUserPlus size={24} className="dash-stat-icon" style={{ color: 'var(--color-info)' }} />
          <div className="stat-number" style={{ color: stats.pendingAdmissions > 0 ? 'var(--color-info)' : 'inherit' }}>
            {loading ? '...' : stats.pendingAdmissions}
          </div>
          <div className="stat-label">داخلہ درخواستیں</div>
        </Link>
      </div>

      {/* Grid */}
      <div className="dash-grid">
        {/* Latest News */}
        <div className="dash-card">
          <div className="dash-card-header">تازہ ترین اعلانات</div>
          <div className="dash-card-body">
            {loading && <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>لوڈ ہو رہا ہے...</p>}
            {!loading && recentNews.length === 0 && (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>کوئی اعلان نہیں</p>
            )}
            {recentNews.map((item) => (
              <div key={item._id} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border-light)' }}>
                <h4 style={{ fontSize: '0.9375rem', marginBottom: '4px' }}>{item.title}</h4>
                <p style={{ fontSize: '0.8125rem', margin: 0 }}>{(item.content || '').substring(0, 80)}...</p>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-english)' }}>{item.publishDate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Classes Overview */}
        <div className="dash-card">
          <div className="dash-card-header">درجات کا جائزہ</div>
          <div className="dash-card-body">
            {loading && <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>لوڈ ہو رہا ہے...</p>}
            {!loading && (
              <div className="table-container" style={{ border: 'none' }}>
                <table>
                  <thead>
                    <tr>
                      <th>درجہ</th>
                      <th>طلباء</th>
                      <th>سال</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.length === 0 && (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                          کوئی درجہ نہیں
                        </td>
                      </tr>
                    )}
                    {classes.map((cls) => (
                      <tr key={cls._id}>
                        <td>{cls.name}</td>
                        <td style={{ fontFamily: 'var(--font-english)', fontWeight: 600 }}>{cls.studentsCount ?? 0}</td>
                        <td style={{ fontFamily: 'var(--font-english)' }}>{cls.year || new Date().getFullYear()}</td>
                      </tr>
                    ))}
                  </tbody>
                  {classes.length > 0 && (
                    <tfoot>
                      <tr style={{ fontWeight: 700, background: 'var(--color-bg-alt)', borderTop: '2px solid var(--color-border-light)' }}>
                        <td>کل طلباء (تمام درجات)</td>
                        <td style={{ fontFamily: 'var(--font-english)', color: 'var(--color-primary)', fontWeight: 700 }}>
                          {classes.reduce((sum, c) => sum + (c.studentsCount || 0), 0)}
                        </td>
                        <td>—</td>
                      </tr>
                      {stats.graduatedStudents > 0 && (
                        <tr style={{ fontWeight: 600, background: 'var(--color-bg-alt)' }}>
                          <td>فارغ التحصیل طلباء (Graduated)</td>
                          <td style={{ fontFamily: 'var(--font-english)', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
                            {stats.graduatedStudents}
                          </td>
                          <td>—</td>
                        </tr>
                      )}
                    </tfoot>
                  )}
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Database Operations & Optimization Section */}
      <div className="dash-card" style={{ marginTop: '24px' }}>
        <div className="dash-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiDatabase size={20} style={{ color: 'var(--color-primary)' }} />
            <span>ڈیٹا بیس آپریشنز (Database Operations)</span>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleRunOptimization}
            disabled={optimizing}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {optimizing ? (
              <>
                <FiRefreshCw size={14} className="spin" />
                <span>انڈیکسنگ ہو رہی ہے...</span>
              </>
            ) : (
              <>
                <FiZap size={14} />
                <span>Database Indexing & Optimization چلائیں</span>
              </>
            )}
          </button>
        </div>
        <div className="dash-card-body">
          <p style={{ margin: '0 0 14px', fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            یہ محفوظ عمل طلباء کے ریکارڈ، رول نمبر، درجات، اور حاضری کے ضروری ڈیٹا بیس انڈیکس کو چیک اور تیار کرتا ہے۔ یہ آپریشن بغیر کسی ڈیٹا کو ضائع یا تبدیل کیے بار بار محفوظ طریقے سے چلایا جا سکتا ہے۔
          </p>

          {optimizationError && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--color-error)',
              color: 'var(--color-error)',
              fontSize: '0.875rem',
              marginBottom: '12px',
            }}>
              {optimizationError}
            </div>
          )}

          {optimizationResult && (
            <div style={{
              background: 'var(--color-bg-alt)',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid var(--color-border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <FiCheckCircle size={18} style={{ color: 'var(--color-success)' }} />
                <strong style={{ color: 'var(--color-primary-dark)', fontSize: '0.95rem' }}>
                  {optimizationResult.message}
                </strong>
                <span style={{ marginRight: 'auto', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-english)' }}>
                  {optimizationResult.durationMs}ms
                </span>
              </div>

              {/* Summary Badges */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
                <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '6px 12px', fontSize: '0.8rem' }}>
                  کل چیک شدہ: <strong style={{ fontFamily: 'var(--font-english)' }}>{optimizationResult.summary?.totalChecked}</strong>
                </div>
                <div style={{ background: '#ecfdf5', border: '1px solid #10b981', borderRadius: '6px', padding: '6px 12px', fontSize: '0.8rem', color: '#047857' }}>
                  نئے بنائے گئے انڈیکس: <strong style={{ fontFamily: 'var(--font-english)' }}>{optimizationResult.summary?.created}</strong>
                </div>
                <div style={{ background: '#eff6ff', border: '1px solid #3b82f6', borderRadius: '6px', padding: '6px 12px', fontSize: '0.8rem', color: '#1d4ed8' }}>
                  پہلے سے موجود انڈیکس: <strong style={{ fontFamily: 'var(--font-english)' }}>{optimizationResult.summary?.alreadyExists}</strong>
                </div>
              </div>

              {/* Details list */}
              {Array.isArray(optimizationResult.details) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {optimizationResult.details.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: '#fff',
                        borderRadius: '6px',
                        border: '1px solid var(--color-border-light)',
                        fontSize: '0.82rem',
                        gap: '8px',
                      }}
                    >
                      <div>
                        <strong style={{ color: 'var(--color-primary)' }}>{item.displayName || item.collection}</strong>: {item.description}
                      </div>
                      <span className={`badge ${item.action === 'created' ? 'badge-success' : 'badge-info'}`}>
                        {item.action === 'created' ? 'نیا انڈیکس تیار شدہ' : 'پہلے سے موجود'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </>
      )}
    </div>
  );
}
