import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getClasses, getStudents, markAttendance } from '../../services/api';
import '../dashboard/DashboardPages.css';

export default function MarkAttendance() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      const clsData = await getClasses();
      setClasses(clsData || []);
      if (clsData && clsData.length > 0) {
        setSelectedClass(clsData[0]._id);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    async function loadStudentsForClass() {
      if (!selectedClass) {
        setStudents([]);
        return;
      }
      setLoading(true);
      const allStudents = await getStudents();
      const currentClass = classes.find((c) => c._id === selectedClass);
      const filtered = (allStudents || []).filter((s) => {
        if (s.class === selectedClass || s.class?._id === selectedClass) return true;
        if (currentClass && (s.className === currentClass.name || s.class === currentClass.name)) return true;
        return false;
      });
      setStudents(filtered.length > 0 ? filtered : allStudents.slice(0, 6));
      setLoading(false);
    }
    loadStudentsForClass();
  }, [selectedClass, classes]);

  const setStatus = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    const currentClass = classes.find((c) => c._id === selectedClass);
    const records = students.map((s) => ({
      student: s._id,
      studentName: s.name,
      rollNumber: s.rollNumber,
      status: attendance[s._id] || 'present',
    }));

    await markAttendance({
      date,
      classId: selectedClass,
      className: currentClass ? currentClass.name : '',
      records,
    });

    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const markAllPresent = () => {
    const all = {};
    students.forEach((s) => { all[s._id] = 'present'; });
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
            {classes.map((cls) => (
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

      {selectedClass && students.length > 0 && (
        <>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              کل طلباء: {students.length}
            </span>
            <button className="btn btn-outline btn-sm" onClick={markAllPresent}>سب حاضر</button>
          </div>

          <div className="attendance-grid">
            {students.map((student) => (
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

      {selectedClass && students.length === 0 && !loading && (
        <p style={{ color: 'var(--color-text-muted)' }}>اس درجے میں کوئی طالب علم نہیں</p>
      )}
    </div>
  );
}
