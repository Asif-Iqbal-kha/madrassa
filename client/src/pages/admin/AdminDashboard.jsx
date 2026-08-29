import { useState, useEffect } from 'react';
import {
  getStats,
  getNews,
  getClasses,
  getStudents,
  getTeachers,
  getDonations,
  getAdmissions,
} from '../../services/api';
import { FiUsers, FiUser, FiBookOpen, FiCheckSquare, FiHeart, FiUserPlus } from 'react-icons/fi';
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

        const actualStudentsCount = studentsData?.length || statsData?.totalStudents || 0;
        const actualTeachersCount = teachersData?.length || statsData?.totalTeachers || 0;
        const actualClassesCount = classesData?.length || statsData?.totalClasses || 0;

        setStats({
          totalStudents: actualStudentsCount,
          totalTeachers: actualTeachersCount,
          totalClasses: actualClassesCount,
          attendancePercentage: statsData?.attendancePercentage || 92,
          pendingDonations: statsData?.pendingDonations || 0,
          pendingAdmissions: statsData?.pendingAdmissions || 0,
        });

        setRecentNews((newsData || []).slice(0, 3));
        setClasses((classesData || []).slice(0, 6));
      } catch (err) {
        console.warn('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  return (
    <div>
      <h2 className="page-title">ڈیش بورڈ</h2>

      {/* Stats */}
      <div className="dash-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="dash-stat-card">
          <FiUsers size={24} className="dash-stat-icon" />
          <div className="stat-number">{loading ? '...' : stats.totalStudents}</div>
          <div className="stat-label">کل طلباء</div>
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
                        <td>{cls.studentsCount ?? 0}</td>
                        <td style={{ fontFamily: 'var(--font-english)' }}>{cls.year || new Date().getFullYear()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
