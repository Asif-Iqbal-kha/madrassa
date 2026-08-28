import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getClasses, getStudents, uploadResult } from '../../services/api';
import '../dashboard/DashboardPages.css';

export default function UploadResults() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [examName, setExamName] = useState('ششماہی امتحان');
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const subjects = ['قرآن مجید', 'حدیث شریف', 'فقہ', 'عربی', 'اردو', 'ریاضی'];

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
      if (!selectedClass) return;
      const allStudents = await getStudents();
      const currentClass = classes.find((c) => c._id === selectedClass);
      const filtered = (allStudents || []).filter((s) => {
        if (s.class === selectedClass || s.class?._id === selectedClass) return true;
        if (currentClass && (s.className === currentClass.name || s.class === currentClass.name)) return true;
        return false;
      });
      setStudents(filtered.length > 0 ? filtered : allStudents.slice(0, 5));
    }
    loadStudentsForClass();
  }, [selectedClass, classes]);

  const setMark = (studentId, subject, value) => {
    setResults((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [subject]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    const currentClass = classes.find((c) => c._id === selectedClass);
    const promises = students.map((s) => {
      const marksObj = results[s._id] || {};
      const marksArray = subjects.map((sub) => ({
        subject: sub,
        obtainedMarks: Number(marksObj[sub] || 0),
        totalMarks: 100,
      }));
      const totalObtained = marksArray.reduce((acc, m) => acc + m.obtainedMarks, 0);
      const totalMarks = marksArray.length * 100;
      const percentage = Math.round((totalObtained / totalMarks) * 100);

      return uploadResult({
        examName: examName || 'امتحان',
        student: s._id,
        studentName: s.name,
        rollNumber: s.rollNumber,
        className: currentClass ? currentClass.name : '',
        year: '1447',
        marks: marksArray,
        totalObtained,
        totalMarks,
        percentage,
        grade: percentage >= 80 ? 'ممتاز' : percentage >= 60 ? 'جید جداً' : 'مقبول',
      });
    });

    await Promise.all(promises);
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
            {classes.map((cls) => (
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

      {selectedClass && students.length > 0 && (
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
                {students.map((student) => (
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
