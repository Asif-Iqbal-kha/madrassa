import { MOCK_ATTENDANCE } from '../../data/mockData';
import '../dashboard/DashboardPages.css';

export default function AttendanceHistory() {
  return (
    <div>
      <h2 className="page-title">حاضری ریکارڈ</h2>

      {MOCK_ATTENDANCE.map((record) => (
        <div key={record.date} className="dash-card" style={{ marginBottom: '16px' }}>
          <div className="dash-card-header">
            {record.className} - {record.date}
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
