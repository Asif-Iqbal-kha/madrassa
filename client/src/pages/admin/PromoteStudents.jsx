import { useState, useEffect } from 'react';
import { getClasses, getStudents, promoteStudents } from '../../services/api';
import { FiCheckCircle, FiArrowLeft, FiUsers, FiAlertCircle } from 'react-icons/fi';
import '../dashboard/DashboardPages.css';

export default function PromoteStudents() {
  const [classes, setClasses] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [fromClass, setFromClass] = useState('');
  const [toClass, setToClass] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [clsData, stuData] = await Promise.all([getClasses(), getStudents()]);
      setClasses(clsData || []);
      setAllStudents(stuData || []);
    } catch (err) {
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter students who are currently in the selected fromClass
  const classStudents = allStudents.filter((s) => {
    if (!fromClass) return false;
    const currentClassName = s.className || s.class?.name || s.class;
    return currentClassName === fromClass;
  });

  // Calculate target class info
  const targetClassObj = classes.find((c) => c.name === toClass);
  const targetClassCurrentStudents = allStudents.filter((s) => {
    if (!toClass) return false;
    const currentClassName = s.className || s.class?.name || s.class;
    return currentClassName === toClass;
  });

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

  const handlePromote = async () => {
    if (!fromClass || !toClass || selectedStudents.length === 0) {
      setErrorMessage('براہ کرم طلباء اور اگلا درجہ منتخب کریں');
      return;
    }

    if (fromClass === toClass) {
      setErrorMessage('موجودہ درجہ اور اگلا درجہ ایک ہی نہیں ہو سکتے');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await promoteStudents(
        selectedStudents,
        toClass,
        targetClassObj ? targetClassObj._id : undefined
      );

      if (res.success) {
        setSuccessMessage(
          `${selectedStudents.length} طلباء کو کامیابی سے "${fromClass}" سے "${toClass}" میں ترقی دے دی گئی!`
        );
        setSelectedStudents([]);
        await loadData();
      } else {
        setErrorMessage(res.message || 'ترقی دینے میں خرابی ہوئی');
      }
    } catch (err) {
      setErrorMessage('سرور سے رابطہ نہیں ہو سکا');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-title-bar">
        <h2 className="page-title" style={{ border: 'none', margin: 0, padding: 0 }}>
          طلباء کی ترقی (Class Promotion)
        </h2>
        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          کل درجات: {classes.length} | کل فعال طلباء: {allStudents.length}
        </span>
      </div>

      {successMessage && (
        <div className="alert alert-success" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiCheckCircle size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-danger" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', background: '#ffebee', color: '#c62828', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid #ef9a9a' }}>
          <FiAlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Promotion Action Card */}
      <div className="dash-card" style={{ marginBottom: '24px' }}>
        <div className="dash-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>طلباء کو اگلے درجے میں ترقی دیں</span>
        </div>
        <div className="dash-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            {/* From Class */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>موجودہ درجہ (From Class) *</label>
              <select
                className="form-select"
                value={fromClass}
                onChange={(e) => {
                  setFromClass(e.target.value);
                  setSelectedStudents([]);
                  setSuccessMessage('');
                  setErrorMessage('');
                }}
              >
                <option value="">درجہ منتخب کریں</option>
                {classes.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name} ({c.studentsCount || 0} طلباء)
                  </option>
                ))}
              </select>
            </div>

            {/* To Class */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>اگلا درجہ (To Class) *</label>
              <select
                className="form-select"
                value={toClass}
                onChange={(e) => {
                  setToClass(e.target.value);
                  setSuccessMessage('');
                  setErrorMessage('');
                }}
              >
                <option value="">اگلا درجہ منتخب کریں</option>
                {classes.map((c) => (
                  <option key={c._id} value={c.name} disabled={c.name === fromClass}>
                    {c.name} ({c.studentsCount || 0} طلباء پہلے سے موجود)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Transfer Preview Banner */}
          {fromClass && toClass && (
            <div style={{
              background: 'var(--color-bg-alt)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>منتقلی کا جائزہ:</span>
                <div style={{ fontWeight: 600, fontSize: '1rem', marginTop: '4px' }}>
                  {fromClass} ({classStudents.length} طلباء) ➔ {toClass} ({targetClassCurrentStudents.length} طلباء موجود)
                </div>
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                ترقی کے بعد {toClass} میں کل طلباء: {targetClassCurrentStudents.length + selectedStudents.length}
              </div>
            </div>
          )}

          {/* Students List in Current Class */}
          {fromClass && (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: 'var(--color-bg-alt)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '12px',
              }}>
                <label className="checkbox-row" style={{ cursor: 'pointer', fontWeight: 600, margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={classStudents.length > 0 && selectedStudents.length === classStudents.length}
                    onChange={selectAll}
                    disabled={classStudents.length === 0}
                  />
                  <span>سب منتخب کریں ({selectedStudents.length} / {classStudents.length} منتخب شدہ)</span>
                </label>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  {fromClass} میں کل: {classStudents.length} طلباء
                </span>
              </div>

              {classStudents.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '12px',
                  maxHeight: '340px',
                  overflowY: 'auto',
                  padding: '8px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '20px',
                }}>
                  {classStudents.map((s) => (
                    <label
                      key={s._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        background: selectedStudents.includes(s._id) ? 'rgba(15, 118, 110, 0.08)' : 'var(--color-surface)',
                        border: selectedStudents.includes(s._id) ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(s._id)}
                        onChange={() => toggleStudent(s._id)}
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{s.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          رول نمبر: <span style={{ fontFamily: 'var(--font-english)' }}>{s.rollNumber}</span> | والد: {s.fatherName}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                  <FiUsers size={32} style={{ opacity: 0.5, marginBottom: '8px' }} />
                  <p>اس درجے ("{fromClass}") میں فی الوقت کوئی طالب علم داخل نہیں ہے</p>
                </div>
              )}

              <button
                className="btn btn-primary"
                onClick={handlePromote}
                disabled={submitting || !toClass || selectedStudents.length === 0}
                style={{ padding: '10px 24px', fontSize: '0.9375rem' }}
              >
                {submitting
                  ? 'ترقی دی جا رہی ہے...'
                  : `${selectedStudents.length} منتخب طلباء کو "${toClass || 'اگلے درجے'}" میں ترقی دیں`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Class Statistics Overview */}
      <div className="dash-card">
        <div className="dash-card-header">تمام درجات میں طلباء کی موجودہ تعداد (Live Roster)</div>
        <div className="dash-card-body">
          <div className="table-container" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>درجہ</th>
                  <th>سال</th>
                  <th>طلباء کی تعداد</th>
                  <th>حالت</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls) => {
                  const count = allStudents.filter(
                    (s) => (s.className || s.class?.name || s.class) === cls.name
                  ).length;
                  return (
                    <tr key={cls._id}>
                      <td style={{ fontWeight: 600 }}>{cls.name}</td>
                      <td style={{ fontFamily: 'var(--font-english)' }}>{cls.year}</td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          background: count > 0 ? 'rgba(15, 118, 110, 0.1)' : 'var(--color-bg-alt)',
                          color: count > 0 ? 'var(--color-primary)' : 'var(--color-text-muted)',
                          fontWeight: 700,
                          fontFamily: 'var(--font-english)',
                        }}>
                          {count} طلباء
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-success">فعال</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
