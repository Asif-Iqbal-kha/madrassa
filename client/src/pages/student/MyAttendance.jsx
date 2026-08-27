import { MOCK_STUDENT_ATTENDANCE } from '../../data/mockData';
import '../dashboard/DashboardPages.css';

export default function MyAttendance() {
  const att = MOCK_STUDENT_ATTENDANCE;

  return (
    <div>
      <h2 className="page-title">حاضری</h2>

      {/* Summary Cards */}
      <div className="attendance-summary-cards">
        <div className="att-summary-card" style={{ borderTop: '3px solid var(--color-accent)' }}>
          <div className="att-summary-number">{att.totalDays}</div>
          <div className="att-summary-label">کل دن</div>
        </div>
        <div className="att-summary-card" style={{ borderTop: '3px solid var(--color-success)' }}>
          <div className="att-summary-number" style={{ color: 'var(--color-success)' }}>{att.presentDays}</div>
          <div className="att-summary-label">حاضر</div>
        </div>
        <div className="att-summary-card" style={{ borderTop: '3px solid var(--color-error)' }}>
          <div className="att-summary-number" style={{ color: 'var(--color-error)' }}>{att.absentDays}</div>
          <div className="att-summary-label">غیر حاضر</div>
        </div>
        <div className="att-summary-card" style={{ borderTop: '3px solid var(--color-warning)' }}>
          <div className="att-summary-number" style={{ color: 'var(--color-warning)' }}>{att.leaveDays}</div>
          <div className="att-summary-label">چھٹی</div>
        </div>
      </div>

      {/* Percentage */}
      <div className="dash-card" style={{ marginBottom: '24px' }}>
        <div className="dash-card-header">مجموعی حاضری شرح</div>
        <div className="dash-card-body" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', fontFamily: 'var(--font-english)', fontWeight: '700', color: att.percentage >= 75 ? 'var(--color-success)' : 'var(--color-error)' }}>
            {att.percentage}%
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '8px' }}>
            {att.percentage >= 75 ? 'حاضری تسلی بخش ہے' : 'حاضری بہتر کریں'}
          </p>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="dash-card">
        <div className="dash-card-header">ماہانہ تفصیل</div>
        <div className="dash-card-body">
          <div className="table-container" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>مہینہ</th>
                  <th>کل دن</th>
                  <th>حاضر</th>
                  <th>غیر حاضر</th>
                  <th>چھٹی</th>
                </tr>
              </thead>
              <tbody>
                {att.monthly.map((m, idx) => (
                  <tr key={idx}>
                    <td>{m.month}</td>
                    <td style={{ fontFamily: 'var(--font-english)' }}>{m.total}</td>
                    <td style={{ fontFamily: 'var(--font-english)', color: 'var(--color-success)' }}>{m.present}</td>
                    <td style={{ fontFamily: 'var(--font-english)', color: 'var(--color-error)' }}>{m.absent}</td>
                    <td style={{ fontFamily: 'var(--font-english)', color: 'var(--color-warning)' }}>{m.leave}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
