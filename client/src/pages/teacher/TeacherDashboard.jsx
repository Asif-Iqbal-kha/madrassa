import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudents } from '../../services/api';
import { FiBookOpen, FiUsers, FiCheckSquare } from 'react-icons/fi';
import '../dashboard/DashboardPages.css';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const assignedClasses = user?.classes || [];
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const students = await getStudents();
        setTotalStudents(students?.length || 0);
      } catch (err) {
        console.warn('TeacherDashboard error:', err);
      }
    }
    loadData();
  }, []);

  return (
    <div>
      <h2 className="page-title">خوش آمدید، {user?.name}</h2>

      <div className="dash-stats">
        <div className="dash-stat-card">
          <FiBookOpen size={24} className="dash-stat-icon" />
          <div className="stat-number">{assignedClasses.length}</div>
          <div className="stat-label">تفویض شدہ درجات</div>
        </div>
        <div className="dash-stat-card">
          <FiUsers size={24} className="dash-stat-icon" />
          <div className="stat-number">{totalStudents}</div>
          <div className="stat-label">کل طلباء</div>
        </div>
        <div className="dash-stat-card">
          <FiCheckSquare size={24} className="dash-stat-icon" />
          <div className="stat-number">92%</div>
          <div className="stat-label">اوسط حاضری</div>
        </div>
      </div>

      {/* Assigned Classes */}
      <div className="dash-card">
        <div className="dash-card-header">تفویض شدہ درجات</div>
        <div className="dash-card-body">
          {assignedClasses.length > 0 ? (
            <div className="table-container" style={{ border: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>درجہ</th>
                    <th>حالت</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedClasses.map((cls) => (
                    <tr key={cls._id}>
                      <td>{cls.name}</td>
                      <td><span className="badge badge-success">فعال</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-muted)' }}>کوئی درجہ تفویض نہیں</p>
          )}
        </div>
      </div>
    </div>
  );
}
