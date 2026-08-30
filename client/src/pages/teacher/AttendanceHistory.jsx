import { useState, useEffect } from 'react';
import { getAttendance } from '../../services/api';
import '../dashboard/DashboardPages.css';

export default function AttendanceHistory() {
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const records = await getAttendance();
        setAttendanceList(records || []);
      } catch (err) {
        console.warn('AttendanceHistory load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div>
      <h2 className="page-title">حاضری ریکارڈ</h2>

      {loading && <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>لوڈ ہو رہا ہے...</p>}
      {!loading && attendanceList.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>کوئی حاضری ریکارڈ موجود نہیں</p>
      )}

      {attendanceList.map((record) => (
        <div key={record._id || record.date} className="dash-card" style={{ marginBottom: '16px' }}>
          <div className="dash-card-header">
            {record.className || record.class?.name || 'کلاس'} - {record.date}
          </div>
          <div className="dash-card-body">
            <div className="table-container" style={{ border: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>رول نمبر</th>
                    <th>نام</th>
                    <th>حالت</th>
                  </tr>
                </thead>
                <tbody>
                  {record.records.map((r) => (
                    <tr key={r.studentId}>
                      <td style={{ fontFamily: 'var(--font-english)' }}>{r.rollNumber}</td>
                      <td>{r.name}</td>
                      <td>
                        <span className={`badge ${r.status === 'present' ? 'badge-success' : r.status === 'absent' ? 'badge-error' : 'badge-warning'}`}>
                          {r.status === 'present' ? 'حاضر' : r.status === 'absent' ? 'غیر حاضر' : 'چھٹی'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
