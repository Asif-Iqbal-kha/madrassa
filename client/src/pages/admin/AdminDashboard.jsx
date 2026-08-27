import { MOCK_STATS, MOCK_NEWS, MOCK_CLASSES } from '../../data/mockData';
import { FiUsers, FiUser, FiBookOpen, FiCheckSquare } from 'react-icons/fi';
import '../dashboard/DashboardPages.css';

export default function AdminDashboard() {
  return (
    <div>
      <h2 className="page-title">ڈیش بورڈ</h2>

      {/* Stats */}
      <div className="dash-stats">
        <div className="dash-stat-card">
          <FiUsers size={24} className="dash-stat-icon" />
          <div className="stat-number">{MOCK_STATS.totalStudents}</div>
          <div className="stat-label">کل طلباء</div>
        </div>
        <div className="dash-stat-card">
          <FiUser size={24} className="dash-stat-icon" />
          <div className="stat-number">{MOCK_STATS.totalTeachers}</div>
          <div className="stat-label">اساتذہ</div>
        </div>
        <div className="dash-stat-card">
          <FiBookOpen size={24} className="dash-stat-icon" />
          <div className="stat-number">{MOCK_STATS.totalClasses}</div>
          <div className="stat-label">درجات</div>
        </div>
        <div className="dash-stat-card">
          <FiCheckSquare size={24} className="dash-stat-icon" />
          <div className="stat-number">{MOCK_STATS.attendancePercentage}%</div>
          <div className="stat-label">آج کی حاضری</div>
        </div>
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
