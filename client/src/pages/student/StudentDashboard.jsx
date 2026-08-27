import { useAuth } from '../../context/AuthContext';
import { MOCK_STUDENT_ATTENDANCE, MOCK_RESULTS } from '../../data/mockData';
import { FiBookOpen, FiBarChart2, FiCalendar } from 'react-icons/fi';
import '../dashboard/DashboardPages.css';

export default function StudentDashboard() {
  const { user } = useAuth();
  const latestResult = MOCK_RESULTS[0];

  return (
    <div>
      <h2 className="page-title">خوش آمدید، {user?.name}</h2>

      {/* Student Info */}
      <div className="dash-card" style={{ marginBottom: '24px' }}>
        <div className="dash-card-header">ذاتی معلومات</div>
        <div className="dash-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>نام: </span>{user?.name}</div>
            <div><span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>والد کا نام: </span>{user?.fatherName}</div>
            <div><span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>رول نمبر: </span><span style={{ fontFamily: 'var(--font-english)' }}>{user?.rollNumber}</span></div>
            <div><span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>درجہ: </span>{user?.className}</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="dash-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="dash-stat-card">
          <FiCalendar size={24} className="dash-stat-icon" />
          <div className="stat-number">{MOCK_STUDENT_ATTENDANCE.percentage}%</div>
          <div className="stat-label">حاضری شرح</div>
        </div>
        <div className="dash-stat-card">
          <FiBarChart2 size={24} className="dash-stat-icon" />
          <div className="stat-number">{latestResult?.percentage}%</div>
          <div className="stat-label">آخری نتیجہ</div>
        </div>
        <div className="dash-stat-card">
          <FiBookOpen size={24} className="dash-stat-icon" />
          <div className="stat-number">{latestResult?.grade}</div>
          <div className="stat-label">درجہ بندی</div>
        </div>
      </div>
    </div>
  );
}
