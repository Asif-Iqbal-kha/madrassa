import { useAuth } from '../../context/AuthContext';
import { MOCK_RESULTS } from '../../data/mockData';
import '../dashboard/DashboardPages.css';

export default function MyResults() {
  const { user } = useAuth();

  return (
    <div>
      <h2 className="page-title">نتائج</h2>

      {MOCK_RESULTS.map((result) => (
        <div key={result._id} className="result-card">
          <div className="result-card-header">
            <img src="./logo.png" alt="لوگو" style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fff', padding: '2px', border: '2px solid var(--color-accent)', marginBottom: '8px' }} />
            <h3>مدرسہ سیدنا صدیق اکبر رضی اللہ عنہ</h3>
            <p>توحید کالونی، چارسدہ روڈ، مردان</p>
            <p style={{ marginTop: '4px', color: 'var(--color-accent-light)' }}>{result.examName} - {result.year}</p>
          </div>

          <div className="result-card-info">
            <div className="result-card-info-item">
              <span>نام: </span> {result.studentName}
            </div>
            <div className="result-card-info-item">
              <span>رول نمبر: </span> <span style={{ fontFamily: 'var(--font-english)' }}>{result.rollNumber}</span>
            </div>
            <div className="result-card-info-item">
              <span>درجہ: </span> {result.className}
            </div>
            <div className="result-card-info-item">
              <span>سال: </span> <span style={{ fontFamily: 'var(--font-english)' }}>{result.year}</span>
            </div>
          </div>

          <div className="result-card-body">
            <table>
              <thead>
                <tr>
                  <th>مضمون</th>
                  <th>کل نمبر</th>
                  <th>حاصل نمبر</th>
                </tr>
              </thead>
              <tbody>
                {result.marks.map((m, idx) => (
                  <tr key={idx}>
                    <td>{m.subject}</td>
                    <td style={{ fontFamily: 'var(--font-english)' }}>{m.totalMarks}</td>
                    <td style={{ fontFamily: 'var(--font-english)' }}>{m.obtainedMarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="result-card-footer">
            <div className="result-total">
              مجموعی: <span style={{ fontFamily: 'var(--font-english)' }}>{result.totalObtained} / {result.totalMarks}</span>
              {' '}({result.percentage}%)
            </div>
            <div className="result-grade">{result.grade}</div>
          </div>
        </div>
      ))}

      <div className="text-center" style={{ marginTop: '16px' }}>
        <button className="btn btn-outline btn-sm" onClick={() => window.print()}>
          پرنٹ کریں
        </button>
      </div>
    </div>
  );
}
