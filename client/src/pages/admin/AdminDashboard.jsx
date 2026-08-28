import { useState, useEffect } from 'react';
import { MOCK_STATS, MOCK_NEWS, MOCK_CLASSES } from '../../data/mockData';
import { getDonations, getAdmissions } from '../../services/api';
import { FiUsers, FiUser, FiBookOpen, FiCheckSquare, FiHeart, FiUserPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import '../dashboard/DashboardPages.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    ...MOCK_STATS,
    pendingDonations: 2,
    pendingAdmissions: 3,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [donations, admissions] = await Promise.all([
          getDonations('pending'),
          getAdmissions(),
        ]);
        const pendingAdm = (admissions || []).filter(
          (a) => a.status === 'pending' || a.status === 'under_review'
        ).length;

        setStats((prev) => ({
          ...prev,
          pendingDonations: (donations || []).length,
          pendingAdmissions: pendingAdm,
        }));
      } catch (err) {
        console.warn('Stats fetch error:', err);
      }
    }
    loadStats();
  }, []);

  return (
    <div>
      <h2 className="page-title">ڈیش بورڈ</h2>

      {/* Stats */}
      <div className="dash-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="dash-stat-card">
          <FiUsers size={24} className="dash-stat-icon" />
          <div className="stat-number">{stats.totalStudents}</div>
          <div className="stat-label">کل طلباء</div>
        </div>
        <div className="dash-stat-card">
          <FiUser size={24} className="dash-stat-icon" />
          <div className="stat-number">{stats.totalTeachers}</div>
          <div className="stat-label">اساتذہ</div>
        </div>
        <div className="dash-stat-card">
          <FiBookOpen size={24} className="dash-stat-icon" />
          <div className="stat-number">{stats.totalClasses}</div>
          <div className="stat-label">درجات</div>
        </div>
        <div className="dash-stat-card">
          <FiCheckSquare size={24} className="dash-stat-icon" />
          <div className="stat-number">{stats.attendancePercentage}%</div>
          <div className="stat-label">آج کی حاضری</div>
        </div>
        <Link to="/admin/donations" className="dash-stat-card" style={{ textDecoration: 'none', borderRight: '4px solid var(--color-accent)' }}>
          <FiHeart size={24} className="dash-stat-icon" style={{ color: 'var(--color-primary)' }} />
          <div className="stat-number" style={{ color: stats.pendingDonations > 0 ? 'var(--color-warning)' : 'inherit' }}>
            {stats.pendingDonations}
          </div>
          <div className="stat-label">زیر غور عطیات</div>
        </Link>
        <Link to="/admin/admissions" className="dash-stat-card" style={{ textDecoration: 'none', borderRight: '4px solid var(--color-info)' }}>
          <FiUserPlus size={24} className="dash-stat-icon" style={{ color: 'var(--color-info)' }} />
          <div className="stat-number" style={{ color: stats.pendingAdmissions > 0 ? 'var(--color-info)' : 'inherit' }}>
            {stats.pendingAdmissions}
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
            {MOCK_NEWS.slice(0, 3).map((item) => (
              <div key={item._id} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border-light)' }}>
                <h4 style={{ fontSize: '0.9375rem', marginBottom: '4px' }}>{item.title}</h4>
                <p style={{ fontSize: '0.8125rem', margin: 0 }}>{item.content.substring(0, 80)}...</p>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-english)' }}>{item.publishDate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Classes Overview */}
        <div className="dash-card">
          <div className="dash-card-header">درجات کا جائزہ</div>
          <div className="dash-card-body">
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
                  {MOCK_CLASSES.slice(0, 6).map((cls) => (
                    <tr key={cls._id}>
                      <td>{cls.name}</td>
                      <td>{cls.studentsCount}</td>
                      <td style={{ fontFamily: 'var(--font-english)' }}>{cls.year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
