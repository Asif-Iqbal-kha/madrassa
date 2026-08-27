import { useState } from 'react';
import { MOCK_CLASSES, MOCK_STUDENTS } from '../../data/mockData';
import '../dashboard/DashboardPages.css';

export default function PromoteStudents() {
  const [fromClass, setFromClass] = useState('');
  const [toClass, setToClass] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [promoted, setPromoted] = useState([]);

  const classStudents = MOCK_STUDENTS.filter((s) => s.class === fromClass);

  const toggleStudent = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedStudents.length === classStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(classStudents.map((s) => s._id));
    }
  };

  const handlePromote = () => {
    if (!fromClass || !toClass || selectedStudents.length === 0) return;
    setPromoted(selectedStudents);
    setSelectedStudents([]);
  };

  return (
    <div>
      <h2 className="page-title">ترقی اور داخلہ</h2>

      {/* Promote Section */}
      <div className="promote-section">
        <h3>طلباء کو اگلے درجے میں ترقی دیں</h3>
        <div className="promote-row">
          <div className="form-group">
            <label className="form-label">موجودہ درجہ</label>
            <select className="form-select" value={fromClass} onChange={(e) => { setFromClass(e.target.value); setSelectedStudents([]); setPromoted([]); }}>
              <option value="">درجہ منتخب کریں</option>
              {MOCK_CLASSES.map((c) => (
                <option key={c._id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">اگلا درجہ</label>
            <select className="form-select" value={toClass} onChange={(e) => setToClass(e.target.value)}>
              <option value="">درجہ منتخب کریں</option>
              {MOCK_CLASSES.map((c) => (
                <option key={c._id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {fromClass && classStudents.length > 0 && (
          <>
            <div style={{ marginBottom: '12px' }}>
              <label className="checkbox-row" style={{ cursor: 'pointer', fontWeight: '600' }}>
                <input type="checkbox" checked={selectedStudents.length === classStudents.length} onChange={selectAll} />
                سب منتخب کریں ({classStudents.length} طلباء)
              </label>
            </div>
            {classStudents.map((s) => (
              <label key={s._id} className="checkbox-row" style={{ cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedStudents.includes(s._id)} onChange={() => toggleStudent(s._id)} />
                <span>{s.name} - {s.rollNumber}</span>
              </label>
            ))}
            <div style={{ marginTop: '16px' }}>
              <button className="btn btn-primary btn-sm" onClick={handlePromote}
                disabled={!toClass || selectedStudents.length === 0}>
                {selectedStudents.length} طلباء کو ترقی دیں
              </button>
            </div>
          </>
        )}

        {fromClass && classStudents.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>اس درجے میں کوئی طالب علم نہیں ملا</p>
        )}

        {promoted.length > 0 && (
          <div className="alert alert-success" style={{ marginTop: '16px' }}>
            {promoted.length} طلباء کو کامیابی سے ترقی دے دی گئی
          </div>
        )}
      </div>

      {/* New Enrollment */}
      <div className="promote-section">
        <h3>نیا داخلہ</h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '16px' }}>
          نئے طلباء کو درجے میں داخل کرنے کے لیے "طلباء" صفحے پر جائیں اور نیا طالب علم شامل کریں۔
        </p>
      </div>
    </div>
  );
}
