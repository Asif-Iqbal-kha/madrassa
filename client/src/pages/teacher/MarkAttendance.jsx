import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getClasses, getStudents, markAttendance, searchAttendance } from '../../services/api';
import { FiPrinter, FiCheck, FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import '../dashboard/DashboardPages.css';

export default function MarkAttendance() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [isExistingRecord, setIsExistingRecord] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
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

  const currentClass = classes.find((c) => c._id === selectedClass);

  useEffect(() => {
    async function loadAttendanceAndStudents() {
      if (!selectedClass) {
        setStudents([]);
        return;
      }
      setLoading(true);
      setSubmittedMessage('');
      setErrorMessage('');

      try {
        const [allStudents, existingAtt] = await Promise.all([
          getStudents(),
          searchAttendance(date, selectedClass, currentClass ? currentClass.name : ''),
        ]);

        // Filter active students belonging to this class (supporting aliases)
        const targetName = (currentClass?.name || '').trim().toLowerCase();
        const filtered = (allStudents || []).filter((s) => {
          if (s.status === 'graduated' || s.status === 'inactive') return false;
          const sId = s.class?._id || s.class;
          if (sId && sId.toString() === selectedClass) return true;
          const sName = (s.className || s.class?.name || '').trim().toLowerCase();
          if (sName === targetName) return true;
          if ((targetName === 'حفظ' || targetName === 'حفظ قرآن کریم') && (sName === 'حفظ' || sName === 'حفظ قرآن کریم')) return true;
          if ((targetName === 'ناظرہ' || targetName === 'ناظرہ قرآن کریم') && (sName === 'ناظرہ' || sName === 'ناظرہ قرآن کریم')) return true;
          return false;
        });

        setStudents(filtered);

        // Pre-fill attendance if existing record found in database
        if (existingAtt && Array.isArray(existingAtt.records) && existingAtt.records.length > 0) {
          setIsExistingRecord(true);
          const attMap = {};
          existingAtt.records.forEach((r) => {
            const key = r.student ? r.student.toString() : r.rollNumber;
            // Also map by student._id if present in filtered students
            const matchedStudent = filtered.find(
              (s) => s._id === key || s.rollNumber === r.rollNumber
            );
            if (matchedStudent) {
              attMap[matchedStudent._id] = r.status;
            } else {
              attMap[key] = r.status;
            }
          });
          // For any student in class not in saved record, default to present
          filtered.forEach((s) => {
            if (!attMap[s._id]) attMap[s._id] = 'present';
          });
          setAttendance(attMap);
        } else {
          setIsExistingRecord(false);
          const initial = {};
          filtered.forEach((s) => {
            initial[s._id] = 'present';
          });
          setAttendance(initial);
        }
      } catch (err) {
        console.error('Load attendance error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAttendanceAndStudents();
  }, [selectedClass, date, classes]);

  const setStatus = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status) => {
    const next = {};
    students.forEach((s) => {
      next[s._id] = status;
    });
    setAttendance(next);
  };

  const handleSubmit = async () => {
    if (!selectedClass || students.length === 0) return;

    setSaving(true);
    setSubmittedMessage('');
    setErrorMessage('');

    try {
      const records = students.map((s) => ({
        student: s._id,
        studentName: s.name,
        rollNumber: s.rollNumber,
        status: attendance[s._id] || 'present',
      }));

      const res = await markAttendance({
        date,
        classId: selectedClass,
        className: currentClass ? currentClass.name : '',
        records,
      });

      setIsExistingRecord(true);
      setSubmittedMessage(res.message || 'حاضری کامیابی سے محفوظ ہو گئی');
      setTimeout(() => setSubmittedMessage(''), 4000);
    } catch (err) {
      setErrorMessage(err.message || 'حاضری محفوظ کرنے میں خرابی ہوئی');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculations for attendance summary
  const presentCount = students.filter((s) => attendance[s._id] === 'present').length;
  const absentCount = students.filter((s) => attendance[s._id] === 'absent').length;
  const leaveCount = students.filter((s) => attendance[s._id] === 'leave').length;
  const percentage = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

  return (
    <div>
      {/* Screen Controls Header (Hidden in Print) */}
      <div className="no-print">
        <div className="page-title-bar">
          <h2 className="page-title" style={{ border: 'none', margin: 0, padding: 0 }}>
            روزنامہ حاضری (Mark Attendance)
          </h2>
          {students.length > 0 && (
            <button
              className="btn btn-outline btn-sm"
              onClick={handlePrint}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <FiPrinter size={16} />
              <span>حاضری رپورٹ پرنٹ / PDF ڈاؤنلوڈ</span>
            </button>
          )}
        </div>

        {submittedMessage && (
          <div className="alert alert-success" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiCheckCircle size={18} />
            <span>{submittedMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="alert alert-danger" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', background: '#ffebee', color: '#c62828', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid #ef9a9a' }}>
            <FiAlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="promote-row" style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>درجہ منتخب کریں *</label>
            <select
              className="form-select"
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSubmittedMessage('');
              }}
            >
              <option value="">درجہ منتخب کریں</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} ({cls.studentsCount || 0} طلباء)
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>تاریخ منتخب کریں *</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setSubmittedMessage('');
              }}
              style={{ direction: 'ltr', textAlign: 'right' }}
            />
          </div>
        </div>

        {isExistingRecord && (
          <div style={{
            background: 'rgba(15, 118, 110, 0.08)',
            border: '1px solid var(--color-primary)',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
            fontSize: '0.875rem',
            color: 'var(--color-primary-dark)',
            fontWeight: 600,
          }}>
            ✓ اس تاریخ ({date}) اور درجہ ({currentClass?.name}) کی حاضری پہلے سے ڈیٹابیس میں محفوظ ہے۔ آپ تبدیلیاں کر کے دوبارہ محفوظ کر سکتے ہیں۔
          </div>
        )}

        {selectedClass && students.length > 0 && (
          <div style={{
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            background: 'var(--color-bg-alt)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
          }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>کل طلباء: {students.length}</span>
              <span style={{ color: '#15803d', fontWeight: 600 }}>حاضر: {presentCount}</span>
              <span style={{ color: '#b91c1c', fontWeight: 600 }}>غیر حاضر: {absentCount}</span>
              <span style={{ color: '#b45309', fontWeight: 600 }}>چھٹی: {leaveCount}</span>
              <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>تناسب: {percentage}%</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-outline btn-sm" onClick={() => markAll('present')}>سب حاضر</button>
              <button className="btn btn-outline btn-sm" onClick={() => markAll('absent')}>سب غیر حاضر</button>
            </div>
          </div>
        )}

        {selectedClass && students.length > 0 && (
          <>
            <div className="attendance-grid">
              {students.map((student) => (
                <div key={student._id} className="attendance-row">
                  <div className="attendance-student-info">
                    <span className="attendance-student-name" style={{ fontWeight: 600 }}>{student.name}</span>
                    <span className="attendance-student-roll" style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      رول نمبر: <strong style={{ fontFamily: 'var(--font-english)' }}>{student.rollNumber}</strong> | والد: {student.fatherName}
                    </span>
                  </div>
                  <div className="attendance-status-btns">
                    <button
                      className={`att-btn att-present ${attendance[student._id] === 'present' ? 'att-selected' : ''}`}
                      onClick={() => setStatus(student._id, 'present')}
                    >
                      حاضر
                    </button>
                    <button
                      className={`att-btn att-absent ${attendance[student._id] === 'absent' ? 'att-selected' : ''}`}
                      onClick={() => setStatus(student._id, 'absent')}
                    >
                      غیر حاضر
                    </button>
                    <button
                      className={`att-btn att-leave ${attendance[student._id] === 'leave' ? 'att-selected' : ''}`}
                      onClick={() => setStatus(student._id, 'leave')}
                    >
                      چھٹی
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? 'محفوظ ہو رہا ہے...' : 'حاضری محفوظ کریں'}
              </button>
              <button className="btn btn-outline" onClick={handlePrint}>
                <FiPrinter size={16} style={{ marginLeft: '6px' }} />
                حاضری رپورٹ پرنٹ / PDF ڈاؤنلوڈ
              </button>
            </div>
          </>
        )}

        {selectedClass && students.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)' }}>
            <p style={{ fontSize: '1rem' }}>اس درجے ("{currentClass?.name}") میں فی الوقت کوئی فعال طالب علم موجود نہیں ہے۔</p>
          </div>
        )}
      </div>

      {/* PRINT-ONLY OFFICIAL ATTENDANCE SHEET */}
      <div className="print-only-attendance" style={{ display: 'none' }}>
        <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '16px' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: '1.4rem' }}>مدرسہ عربیہ سیدنا صدیق اکبر رضی اللہ تعالیٰ عنہ</h2>
          <p style={{ margin: '0 0 4px', fontSize: '0.9rem' }}>صدیق اکبر کالونی نزد توحید کالونی چارسدہ روڈ مردان</p>
          <h3 style={{ margin: '8px 0 0', fontSize: '1.15rem', textDecoration: 'underline' }}>
            روزنامہ حاضری ریکارڈ (Daily Attendance Sheet)
          </h3>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.95rem' }}>
          <div><strong>درجہ:</strong> {currentClass?.name || '—'}</div>
          <div><strong>تاریخ:</strong> <span style={{ fontFamily: 'monospace' }}>{date}</span></div>
          <div><strong>استاذ / نگران:</strong> {user?.name || '—'}</div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #000' }}>
              <th style={{ border: '1px solid #000', padding: '8px', width: '8%' }}>شمار</th>
              <th style={{ border: '1px solid #000', padding: '8px', width: '15%' }}>رول نمبر</th>
              <th style={{ border: '1px solid #000', padding: '8px', width: '25%' }}>طالب علم کا نام</th>
              <th style={{ border: '1px solid #000', padding: '8px', width: '22%' }}>والد کا نام</th>
              <th style={{ border: '1px solid #000', padding: '8px', width: '15%' }}>درجہ</th>
              <th style={{ border: '1px solid #000', padding: '8px', width: '15%' }}>حاضری کیفیت</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => {
              const st = attendance[student._id] || 'present';
              const stText = st === 'present' ? 'حاضر (P)' : st === 'absent' ? 'غیر حاضر (A)' : 'چھٹی (L)';
              return (
                <tr key={student._id}>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{idx + 1}</td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontFamily: 'monospace' }}>
                    {student.rollNumber}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 600 }}>{student.name}</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{student.fatherName}</td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{currentClass?.name}</td>
                  <td style={{
                    border: '1px solid #000',
                    padding: '6px',
                    textAlign: 'center',
                    fontWeight: 700,
                    color: st === 'present' ? '#15803d' : st === 'absent' ? '#b91c1c' : '#b45309'
                  }}>
                    {stText}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: '#f9fafb', fontWeight: 700 }}>
              <td colSpan="2" style={{ border: '1px solid #000', padding: '8px' }}>
                کل طلباء: {students.length}
              </td>
              <td colSpan="2" style={{ border: '1px solid #000', padding: '8px', color: '#15803d' }}>
                کل حاضر: {presentCount} | غیر حاضر: {absentCount} | رخصت: {leaveCount}
              </td>
              <td colSpan="2" style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>
                حاضری کا تناسب: {percentage}%
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Signature lines */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '20px' }}>
          <div style={{ textAlign: 'center', width: '200px', borderTop: '1px dashed #000' }}>
            دستخط استاذِ درجہ
          </div>
          <div style={{ textAlign: 'center', width: '200px', borderTop: '1px dashed #000' }}>
            دستخط ناظمِ تعلیمات
          </div>
          <div style={{ textAlign: 'center', width: '200px', borderTop: '1px dashed #000' }}>
            دستخط ناظمِ دفتر / مہتمم
          </div>
        </div>
      </div>
    </div>
  );
}
