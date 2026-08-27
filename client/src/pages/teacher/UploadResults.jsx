import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MOCK_STUDENTS } from '../../data/mockData';
import '../dashboard/DashboardPages.css';

export default function UploadResults() {
  const { user } = useAuth();
  const assignedClasses = user?.classes || [];
  const [selectedClass, setSelectedClass] = useState('');
  const [examName, setExamName] = useState('');
  const [results, setResults] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const subjects = ['قرآن مجید', 'حدیث شریف', 'فقہ', 'عربی', 'اردو', 'ریاضی'];

  const students = selectedClass
    ? MOCK_STUDENTS.filter((s) => {
        const cls = assignedClasses.find((c) => c._id === selectedClass);
        return cls && s.class === cls.name;
      })
    : [];

  const displayStudents = students.length > 0 ? students : (selectedClass ? MOCK_STUDENTS.slice(0, 3) : []);

  const setMark = (studentId, subject, value) => {
    setResults((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [subject]: value,
      },
    }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div>
      <h2 className="page-title">نتائج اپلوڈ کریں</h2>

      <div className="promote-row" style={{ marginBottom: '24px' }}>
        <div className="form-group">
          <label className="form-label">درجہ</label>
          <select className="form-select" value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setResults({}); }}>
            <option value="">درجہ منتخب کریں</option>
            {assignedClasses.map((cls) => (
              <option key={cls._id} value={cls._id}>{cls.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">امتحان کا نام</label>
          <input type="text" className="form-input" value={examName}
            onChange={(e) => setExamName(e.target.value)} placeholder="مثلاً: ششماہی امتحان" />
        </div>
      </div>

      {selectedClass && displayStudents.length > 0 && (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>رول نمبر</th>
                  <th>نام</th>
                  {subjects.map((sub) => (
                    <th key={sub}>{sub}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayStudents.map((student) => (
                  <tr key={student._id}>
                    <td style={{ fontFamily: 'var(--font-english)' }}>{student.rollNumber}</td>
                    <td>{student.name}</td>
                    {subjects.map((sub) => (
                      <td key={sub}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          style={{ width: '60px', padding: '4px 6px', border: '1px solid var(--color-border)', borderRadius: '2px', fontFamily: 'var(--font-english)', textAlign: 'center' }}
                          value={results[student._id]?.[sub] || ''}
                          onChange={(e) => setMark(student._id, sub, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '24px' }}>
            <button className="btn btn-primary" onClick={handleSubmit}>نتائج محفوظ کریں</button>
          </div>

          {submitted && (
            <div className="alert alert-success" style={{ marginTop: '16px' }}>
              نتائج کامیابی سے محفوظ ہو گئے
            </div>
          )}
        </>
      )}
    </div>
  );
}
