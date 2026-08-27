import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MOCK_STUDENTS } from '../../data/mockData';
import '../dashboard/DashboardPages.css';

export default function MarkAttendance() {
  const { user } = useAuth();
  const assignedClasses = user?.classes || [];
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const students = selectedClass
    ? MOCK_STUDENTS.filter((s) => {
        const cls = assignedClasses.find((c) => c._id === selectedClass);
        return cls && s.class === cls.name;
      })
    : [];

  // If no students match assigned classes, show all for demo
  const displayStudents = students.length > 0 ? students : (selectedClass ? MOCK_STUDENTS.slice(0, 5) : []);

  const setStatus = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const markAllPresent = () => {
    const all = {};
    displayStudents.forEach((s) => { all[s._id] = 'present'; });
    setAttendance(all);
  };

  return (
    <div>
      <h2 className="page-title">حاضری لگائیں</h2>

      <div className="promote-row" style={{ marginBottom: '24px' }}>
        <div className="form-group">
          <label className="form-label">درجہ</label>
          <select className="form-select" value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setAttendance({}); setSubmitted(false); }}>
            <option value="">درجہ منتخب کریں</option>
            {assignedClasses.map((cls) => (
              <option key={cls._id} value={cls._id}>{cls.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">تاریخ</label>
          <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)}
            style={{ direction: 'ltr', textAlign: 'right' }} />
        </div>
      </div>

      {selectedClass && displayStudents.length > 0 && (
        <>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              کل طلباء: {displayStudents.length}
            </span>
            <button className="btn btn-outline btn-sm" onClick={markAllPresent}>سب حاضر</button>
          </div>

          <div className="attendance-grid">
            {displayStudents.map((student) => (
              <div key={student._id} className="attendance-row">
                <div className="attendance-student-info">
                  <span className="attendance-student-name">{student.name}</span>
                  <span className="attendance-student-roll">{student.rollNumber}</span>
                </div>
                <div className="attendance-status-btns">
                  <button className={`att-btn att-present ${attendance[student._id] === 'present' ? 'att-selected' : ''}`}
                    onClick={() => setStatus(student._id, 'present')}>حاضر</button>
                  <button className={`att-btn att-absent ${attendance[student._id] === 'absent' ? 'att-selected' : ''}`}
                    onClick={() => setStatus(student._id, 'absent')}>غیر حاضر</button>
                  <button className={`att-btn att-leave ${attendance[student._id] === 'leave' ? 'att-selected' : ''}`}
                    onClick={() => setStatus(student._id, 'leave')}>چھٹی</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '24px' }}>
            <button className="btn btn-primary" onClick={handleSubmit}>حاضری محفوظ کریں</button>
          </div>

          {submitted && (
            <div className="alert alert-success" style={{ marginTop: '16px' }}>
              حاضری کامیابی سے محفوظ ہو گئی
            </div>
          )}
        </>
      )}

      {selectedClass && displayStudents.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)' }}>اس درجے میں کوئی طالب علم نہیں</p>
      )}
    </div>
  );
}
