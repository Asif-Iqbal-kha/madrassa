import { useState, useEffect } from 'react';
import { getStudents, createStudent, updateStudent, deleteStudent, getClasses } from '../../services/api';
import { Link } from 'react-router-dom';
import {
  FiTrendingUp,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiFilter,
  FiEye,
  FiPrinter,
  FiUser,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi';
import '../dashboard/DashboardPages.css';

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newStudent, setNewStudent] = useState({
    name: '',
    fatherName: '',
    className: '',
    phone: '',
    address: '',
    permanentAddress: '',
    currentAddress: '',
    cnic: '',
    dateOfBirth: '',
    identificationMark: '',
    maritalStatus: 'مجرد',
    previousEducation: '',
    guardianName: '',
    guardianFatherName: '',
    guardianRelation: 'والد',
    guardianPhone: '',
    guardianCnic: '',
    guardianPermanentAddress: '',
    guardianCurrentAddress: '',
    mardanRelative: '',
    admissionFee: 1000,
    paymentMethod: 'JazzCash',
  });

  const [editingStudent, setEditingStudent] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [stuData, clsData] = await Promise.all([getStudents(), getClasses()]);
      setStudents(stuData || []);
      setClasses(clsData || []);
    } catch (err) {
      console.error('Load students error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = students.filter((s) => {
    const sClass = s.className || s.class?.name || s.class;
    const matchesSearch =
      (s.name || '').includes(search) ||
      (s.fatherName || '').includes(search) ||
      (s.rollNumber || '').includes(search) ||
      (s.cnic || '').includes(search) ||
      (s.phone || '').includes(search);
    const matchesClass = classFilter === 'all' || sClass === classFilter;
    return matchesSearch && matchesClass;
  });

  const generateRollNumber = () => {
    const now = Date.now();
    return String(now).slice(-6);
  };

  const handleAdd = async () => {
    if (!newStudent.name || !newStudent.fatherName) {
      setError('طالب علم کا نام اور والد کا نام درج کرنا ضروری ہے');
      return;
    }
    setError('');
    setSaving(true);

    const selectedClassName = newStudent.className || (classes[0] ? classes[0].name : 'ناظرہ');
    const selectedCls = classes.find((c) => c.name === selectedClassName);

    try {
      await createStudent({
        ...newStudent,
        rollNumber: generateRollNumber(),
        className: selectedClassName,
        class: selectedCls ? selectedCls._id : undefined,
        guardianName: newStudent.guardianName || newStudent.fatherName,
        guardianPhone: newStudent.guardianPhone || newStudent.phone,
        status: 'active',
        enrollmentDate: new Date().toISOString().split('T')[0],
      });

      setShowModal(false);
      await loadData();
    } catch (err) {
      setError(err.message || 'طالب علم شامل کرنے میں خرابی ہوئی');
    } finally {
      setSaving(false);
    }
  };

  const handleEditOpen = (student) => {
    setEditingStudent({
      ...student,
      className: student.className || student.class?.name || student.class || '',
    });
    setError('');
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingStudent) return;
    setError('');
    setSaving(true);
    const selectedCls = classes.find((c) => c.name === editingStudent.className);

    try {
      await updateStudent(editingStudent._id, {
        ...editingStudent,
        class: selectedCls ? selectedCls._id : undefined,
      });

      setShowEditModal(false);
      // Also update selectedStudent if open
      if (selectedStudent && selectedStudent._id === editingStudent._id) {
        setSelectedStudent({ ...editingStudent });
      }
      setEditingStudent(null);
      await loadData();
    } catch (err) {
      setError(err.message || 'معلومات تبدیل کرنے میں خرابی ہوئی');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('کیا آپ واقعی اس طالب علم کا ریکارڈ حذف کرنا چاہتے ہیں؟')) return;
    try {
      await deleteStudent(id);
      setStudents(students.filter((s) => s._id !== id));
      if (selectedStudent && selectedStudent._id === id) {
        setSelectedStudent(null);
      }
    } catch (err) {
      alert('حذف کرنے میں خرابی: ' + (err.message || 'سرور ایرر'));
    }
  };

  return (
    <div>
      <div className="page-title-bar no-print">
        <h2 className="page-title" style={{ border: 'none', margin: 0, padding: 0 }}>طلباء کا انتظام (ریکارڈ و کوائف)</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/admin/promote" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FiTrendingUp size={14} /> طلباء کو ترقی دیں
          </Link>
          <button className="btn btn-primary btn-sm" onClick={() => { setError(''); setShowModal(true); }}>
            <FiPlus size={14} style={{ marginLeft: '4px' }} /> نیا طالب علم
          </button>
        </div>
      </div>

      <div className="mgmt-toolbar no-print" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div className="mgmt-search" style={{ flex: '1 1 260px' }}>
          <input
            type="text"
            placeholder="نام، والد کا نام، رول نمبر یا فون سے تلاش کریں..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiFilter size={16} style={{ color: 'var(--color-text-muted)' }} />
          <select
            className="form-select"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            style={{ width: 'auto', minWidth: '160px' }}
          >
            <option value="all">تمام درجات ({students.length})</option>
            {classes.map((c) => {
              const count = students.filter(
                (s) => (s.className || s.class?.name || s.class) === c.name
              ).length;
              return (
                <option key={c._id} value={c.name}>
                  {c.name} ({count})
                </option>
              );
            })}
          </select>
        </div>

        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          تعداد: {filtered.length} طلباء
        </span>
      </div>

      <div className="table-container no-print">
        <table>
          <thead>
            <tr>
              <th>رول نمبر</th>
              <th>نام طالب علم</th>
              <th>والد کا نام</th>
              <th>درجہ</th>
              <th>رابطہ نمبر</th>
              <th>حالت</th>
              <th>اقدامات</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                  لوڈ ہو رہا ہے...
                </td>
              </tr>
            )}
            {filtered.map((student) => (
              <tr
                key={student._id}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedStudent(student)}
                title="طالب علم و والد کے مکمل کوائف دیکھنے کے لیے کلک کریں"
              >
                <td style={{ fontFamily: 'var(--font-english)', fontWeight: 700 }}>{student.rollNumber}</td>
                <td>
                  <strong style={{ color: 'var(--color-primary-dark)' }}>{student.name}</strong>
                </td>
                <td>{student.fatherName}</td>
                <td>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '6px',
                    background: 'rgba(20, 50, 35, 0.08)',
                    color: 'var(--color-primary)',
                    fontWeight: 600,
                  }}>
                    {student.className || student.class?.name || student.class || '-'}
                  </span>
                </td>
                <td style={{ direction: 'ltr', textAlign: 'right', fontFamily: 'var(--font-english)' }}>
                  {student.phone || student.guardianPhone || '-'}
                </td>
                <td>
                  <span className={`badge ${student.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                    {student.status === 'active' ? 'فعال' : 'غیر فعال'}
                  </span>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="action-btns">
                    <button
                      className="action-btn action-btn-primary"
                      onClick={() => setSelectedStudent(student)}
                      title="مکمل کوائف دیکھیں"
                      style={{ padding: '6px' }}
                    >
                      <FiEye size={14} />
                    </button>
                    <button
                      className="action-btn action-btn-info"
                      onClick={() => handleEditOpen(student)}
                      title="ترمیم کریں"
                      style={{ padding: '6px' }}
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      className="action-btn action-btn-danger"
                      onClick={() => handleDelete(student._id)}
                      title="حذف کریں"
                      style={{ padding: '6px' }}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                  کوئی طالب علم نہیں ملا
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================================================= */}
      {/* COMPREHENSIVE STUDENT & FATHER/GUARDIAN DETAILED PROFILE MODAL             */}
      {/* ========================================================================= */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="student-detail-modal-dialog" onClick={(e) => e.stopPropagation()}>
            {/* Official Madrassa Header for Print Only */}
            <div className="student-modal-print-header">
              <img src="/logo.png" alt="مدرسہ لوگو" className="student-modal-print-logo" />
              <div className="student-modal-print-info">
                <h3>مدرسہ عربیہ سیدنا صدیق اکبر رضی اللہ تعالیٰ عنہ</h3>
                <p>توحید کالونی، چارسدہ روڈ، مردان — طالب علم کا دفتری و تعلیمی ریکارڈ فائل</p>
              </div>
              <div className="student-modal-print-date">
                تاریخِ پرنٹ: {new Date().toISOString().split('T')[0]}
              </div>
            </div>

            {/* Header Banner with Student Photo / Avatar */}
            <div className="student-profile-header-banner">
              <div className="student-profile-identity">
                <div className="student-profile-avatar">
                  {selectedStudent.studentPhotoData ? (
                    <img src={selectedStudent.studentPhotoData} alt={selectedStudent.name} />
                  ) : (
                    <span>{selectedStudent.name.charAt(0)}</span>
                  )}
                </div>
                <div className="student-profile-titles">
                  <h3>{selectedStudent.name}</h3>
                  <div className="student-profile-badges">
                    <span className="student-pill-badge student-pill-badge-gold">
                      رول نمبر: {selectedStudent.rollNumber}
                    </span>
                    <span className="student-pill-badge">
                      درجہ: {selectedStudent.className || selectedStudent.class?.name || selectedStudent.class || 'نا معلوم'}
                    </span>
                    <span className="student-pill-badge">
                      کیفیت: {selectedStudent.status === 'active' ? 'فعال (زیر تعلیم)' : 'غیر فعال'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }} className="no-print">
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => window.print()}
                  style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)' }}
                  title="ریکارڈ پرنٹ کریں"
                >
                  <FiPrinter size={14} /> پرنٹ
                </button>
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => setSelectedStudent(null)}
                  style={{ color: '#fff' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body: Sections */}
            <div style={{ padding: '24px 28px' }}>
              {/* SECTION 1: STUDENT PERSONAL DETAILS */}
              <div className="student-detail-section">
                <h4 className="student-detail-section-title">
                  <FiUser size={16} /> طالب علم کے ذاتی کوائف (طالب علم ریکارڈ)
                </h4>
                <div className="student-detail-grid">
                  <div className="student-info-item">
                    <span className="student-info-label">مکمل نام:</span>
                    <span className="student-info-value">{selectedStudent.name}</span>
                  </div>
                  <div className="student-info-item">
                    <span className="student-info-label">ولدیت:</span>
                    <span className="student-info-value">{selectedStudent.fatherName}</span>
                  </div>
                  <div className="student-info-item">
                    <span className="student-info-label">تاریخِ پیدائش:</span>
                    <span className="student-info-value" style={{ fontFamily: 'var(--font-english)' }}>
                      {selectedStudent.dateOfBirth || 'درج نہیں'}
                    </span>
                  </div>
                  <div className="student-info-item">
                    <span className="student-info-label">قومی شناختی کارڈ / ب فارم:</span>
                    <span className="student-info-value" style={{ fontFamily: 'var(--font-english)', direction: 'ltr', textAlign: 'right' }}>
                      {selectedStudent.cnic || 'درج نہیں'}
                    </span>
                  </div>
                  <div className="student-info-item">
                    <span className="student-info-label">شناختی علامت:</span>
                    <span className="student-info-value">{selectedStudent.identificationMark || 'کوئی علامت نہیں'}</span>
                  </div>
                  <div className="student-info-item">
                    <span className="student-info-label">ازدواجی حیثیت:</span>
                    <span className="student-info-value">{selectedStudent.maritalStatus || 'مجرد'}</span>
                  </div>
                  <div className="student-info-item">
                    <span className="student-info-label">رابطہ فون نمبر:</span>
                    <span className="student-info-value" style={{ fontFamily: 'var(--font-english)', direction: 'ltr', textAlign: 'right' }}>
                      {selectedStudent.phone || 'درج نہیں'}
                    </span>
                  </div>
                  <div className="student-info-item">
                    <span className="student-info-label">سابقہ دینی و عصری تعلیم:</span>
                    <span className="student-info-value">{selectedStudent.previousEducation || 'درج نہیں'}</span>
                  </div>
                  <div className="student-info-item" style={{ gridColumn: '1 / -1' }}>
                    <span className="student-info-label">مستقل رہائشی پتہ:</span>
                    <span className="student-info-value">
                      {selectedStudent.permanentAddress || selectedStudent.address || 'درج نہیں'}
                    </span>
                  </div>
                  <div className="student-info-item" style={{ gridColumn: '1 / -1' }}>
                    <span className="student-info-label">موجودہ پتہ:</span>
                    <span className="student-info-value">
                      {selectedStudent.currentAddress || selectedStudent.address || 'درج نہیں'}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: FATHER & GUARDIAN FULL DETAILS */}
              <div className="student-detail-section" style={{ borderRight: '4px solid var(--color-primary)' }}>
                <h4 className="student-detail-section-title">
                  <FiUser size={16} /> والد و سرپرست کی مکمل معلومات (Father & Guardian Details)
                </h4>
                <div className="student-detail-grid">
                  <div className="student-info-item">
                    <span className="student-info-label">والد یا سرپرست کا نام:</span>
                    <span className="student-info-value" style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                      {selectedStudent.guardianName || selectedStudent.fatherName}
                    </span>
                  </div>
                  <div className="student-info-item">
                    <span className="student-info-label">سرپرست کی ولدیت (دادا کا نام):</span>
                    <span className="student-info-value">{selectedStudent.guardianFatherName || 'درج نہیں'}</span>
                  </div>
                  <div className="student-info-item">
                    <span className="student-info-label">امیدوار سے رشتہ:</span>
                    <span className="student-info-value">{selectedStudent.guardianRelation || 'والد'}</span>
                  </div>
                  <div className="student-info-item">
                    <span className="student-info-label">سرپرست کا رابطہ فون (واٹس ایپ):</span>
                    <span className="student-info-value" style={{ fontFamily: 'var(--font-english)', direction: 'ltr', textAlign: 'right' }}>
                      {selectedStudent.guardianPhone || selectedStudent.phone || 'درج نہیں'}
                    </span>
                  </div>
                  <div className="student-info-item">
                    <span className="student-info-label">سرپرست کا قومی شناختی کارڈ (CNIC):</span>
                    <span className="student-info-value" style={{ fontFamily: 'var(--font-english)', direction: 'ltr', textAlign: 'right' }}>
                      {selectedStudent.guardianCnic || 'درج نہیں'}
                    </span>
                  </div>
                  <div className="student-info-item">
                    <span className="student-info-label">مردان میں قریبی رشتہ دار:</span>
                    <span className="student-info-value">{selectedStudent.mardanRelative || 'کوئی درج نہیں'}</span>
                  </div>
                  <div className="student-info-item" style={{ gridColumn: '1 / -1' }}>
                    <span className="student-info-label">سرپرست کا مستقل پتہ:</span>
                    <span className="student-info-value">
                      {selectedStudent.guardianPermanentAddress || selectedStudent.permanentAddress || selectedStudent.address || 'درج نہیں'}
                    </span>
                  </div>
                  <div className="student-info-item" style={{ gridColumn: '1 / -1' }}>
                    <span className="student-info-label">سرپرست کا موجودہ پتہ:</span>
                    <span className="student-info-value">
                      {selectedStudent.guardianCurrentAddress || selectedStudent.currentAddress || selectedStudent.address || 'درج نہیں'}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: ADMISSION & FEE RECORD */}
              <div className="student-detail-section">
                <h4 className="student-detail-section-title">
                  <FiDollarSign size={16} /> داخلہ اور فیس کا دفتری ریکارڈ
                </h4>
                <div className="student-detail-grid">
                  <div className="student-info-item">
                    <span className="student-info-label">تاریخِ داخلہ / اندراج:</span>
                    <span className="student-info-value" style={{ fontFamily: 'var(--font-english)' }}>
                      {selectedStudent.enrollmentDate || 'درج نہیں'}
                    </span>
                  </div>
                  <div className="student-info-item">
                    <span className="student-info-label">داخلہ فیس:</span>
                    <span className="student-info-value" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                      Rs. {(selectedStudent.admissionFee || 1000).toLocaleString()}
                    </span>
                  </div>
                  <div className="student-info-item">
                    <span className="student-info-label">ادائیگی کا طریقہ:</span>
                    <span className="student-info-value">{selectedStudent.paymentMethod || 'JazzCash'}</span>
                  </div>
                  <div className="student-info-item">
                    <span className="student-info-label">ٹرانزیکشن ID / حوالہ:</span>
                    <span className="student-info-value" style={{ fontFamily: 'var(--font-english)' }}>
                      {selectedStudent.transactionId || 'درج نہیں'}
                    </span>
                  </div>
                </div>

                {/* Screenshot if available */}
                {selectedStudent.screenshotData && (
                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed #ddd' }}>
                    <span className="student-info-label" style={{ display: 'block', marginBottom: '6px' }}>
                      فیس کی تصدیقی رسید / اسکرین شاٹ:
                    </span>
                    <a href={selectedStudent.screenshotData} target="_blank" rel="noreferrer">
                      <img
                        src={selectedStudent.screenshotData}
                        alt="رسید"
                        style={{ maxHeight: '150px', maxWidth: '250px', borderRadius: '6px', border: '1px solid #ccc' }}
                      />
                    </a>
                  </div>
                )}
              </div>

              {/* Official Signatures for Print Only */}
              <div className="student-modal-print-signatures">
                <div className="print-sig-box">
                  <div className="print-sig-line"></div>
                  <span>دستخط ناظمِ داخلہ و تعلیمات</span>
                </div>
                <div className="print-sig-box stamp-box">
                  <div className="print-stamp-badge">
                    <span>تصدیق شدہ دفتری ریکارڈ</span>
                  </div>
                </div>
                <div className="print-sig-box">
                  <div className="print-sig-line"></div>
                  <span>دستخط و مہر مہتمم صاحب مدظلہ</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer no-print" style={{ borderTop: '1px solid var(--color-border-light)' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  handleEditOpen(selectedStudent);
                  setSelectedStudent(null);
                }}
              >
                <FiEdit2 size={14} /> معلومات میں ترمیم کریں
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setSelectedStudent(null)}
              >
                بند کریں
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>نیا طالب علم شامل کریں (بمعہ والد و سرپرست کوائف)</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
              {error && (
                <div style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid var(--color-error)',
                  color: 'var(--color-error)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  fontSize: '0.875rem',
                }}>
                  {error}
                </div>
              )}

              <h4 style={{ margin: '0 0 10px', color: 'var(--color-primary)', fontSize: '0.95rem', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                طالب علم کے کوائف:
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">نام طالب علم *</label>
                  <input type="text" className="form-input" value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">والد کا نام *</label>
                  <input type="text" className="form-input" value={newStudent.fatherName}
                    onChange={(e) => setNewStudent({ ...newStudent, fatherName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">درجہ *</label>
                  <select className="form-select" value={newStudent.className}
                    onChange={(e) => setNewStudent({ ...newStudent, className: e.target.value })}>
                    <option value="">درجہ منتخب کریں</option>
                    {classes.map((c) => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">تاریخِ پیدائش</label>
                  <input type="date" className="form-input" value={newStudent.dateOfBirth}
                    onChange={(e) => setNewStudent({ ...newStudent, dateOfBirth: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">طالب علم کا شناختی کارڈ / ب فارم</label>
                  <input type="text" className="form-input" placeholder="16101-1234567-1" value={newStudent.cnic}
                    onChange={(e) => setNewStudent({ ...newStudent, cnic: e.target.value })}
                    style={{ direction: 'ltr', textAlign: 'right' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">رابطہ فون نمبر</label>
                  <input type="tel" className="form-input" value={newStudent.phone}
                    onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                    style={{ direction: 'ltr', textAlign: 'right' }} />
                </div>
              </div>

              <h4 style={{ margin: '14px 0 10px', color: 'var(--color-primary)', fontSize: '0.95rem', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                والد و سرپرست کی معلومات:
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">سرپرست کا نام</label>
                  <input type="text" className="form-input" placeholder="اگر والد کے علاوہ ہو" value={newStudent.guardianName}
                    onChange={(e) => setNewStudent({ ...newStudent, guardianName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">سرپرست سے رشتہ</label>
                  <select className="form-select" value={newStudent.guardianRelation}
                    onChange={(e) => setNewStudent({ ...newStudent, guardianRelation: e.target.value })}>
                    <option value="والد">والد</option>
                    <option value="چچا">چچا</option>
                    <option value="دادا">دادا</option>
                    <option value="بڑا بھائی">بڑا بھائی</option>
                    <option value="ماموں">ماموں</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">سرپرست کا فون نمبر</label>
                  <input type="tel" className="form-input" value={newStudent.guardianPhone}
                    onChange={(e) => setNewStudent({ ...newStudent, guardianPhone: e.target.value })}
                    style={{ direction: 'ltr', textAlign: 'right' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">سرپرست کا شناختی کارڈ (CNIC)</label>
                  <input type="text" className="form-input" value={newStudent.guardianCnic}
                    onChange={(e) => setNewStudent({ ...newStudent, guardianCnic: e.target.value })}
                    style={{ direction: 'ltr', textAlign: 'right' }} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">مستقل پتہ</label>
                  <input type="text" className="form-input" value={newStudent.permanentAddress}
                    onChange={(e) => setNewStudent({ ...newStudent, permanentAddress: e.target.value, address: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">مردان میں قریبی رشتہ دار (نام، پتہ، فون)</label>
                  <input type="text" className="form-input" value={newStudent.mardanRelative}
                    onChange={(e) => setNewStudent({ ...newStudent, mardanRelative: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={saving}>
                {saving ? 'محفوظ ہو رہا ہے...' : 'طالب علم محفوظ کریں'}
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => setShowModal(false)}>منسوخ</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && editingStudent && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>طالب علم و سرپرست کی معلومات تبدیل کریں</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
              {error && (
                <div style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid var(--color-error)',
                  color: 'var(--color-error)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  fontSize: '0.875rem',
                }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">نام</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">والد کا نام</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingStudent.fatherName}
                    onChange={(e) => setEditingStudent({ ...editingStudent, fatherName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">درجہ *</label>
                  <select
                    className="form-select"
                    value={editingStudent.className}
                    onChange={(e) => setEditingStudent({ ...editingStudent, className: e.target.value })}
                  >
                    <option value="">درجہ منتخب کریں</option>
                    {classes.map((c) => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">کیفیت (حالت)</label>
                  <select
                    className="form-select"
                    value={editingStudent.status}
                    onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value })}
                  >
                    <option value="active">فعال (Active)</option>
                    <option value="inactive">غیر فعال (Inactive)</option>
                    <option value="graduated">فارغ التحصیل (Graduated)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">فون نمبر</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={editingStudent.phone || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                    style={{ direction: 'ltr', textAlign: 'right' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">قومی شناختی کارڈ / ب فارم</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingStudent.cnic || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, cnic: e.target.value })}
                    style={{ direction: 'ltr', textAlign: 'right' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">سرپرست کا نام</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingStudent.guardianName || editingStudent.fatherName || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, guardianName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">سرپرست کا فون نمبر</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={editingStudent.guardianPhone || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, guardianPhone: e.target.value })}
                    style={{ direction: 'ltr', textAlign: 'right' }}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">مستقل پتہ</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingStudent.permanentAddress || editingStudent.address || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, permanentAddress: e.target.value, address: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">مردان میں قریبی رشتہ دار</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingStudent.mardanRelative || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, mardanRelative: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary btn-sm" onClick={handleSaveEdit} disabled={saving}>
                {saving ? 'محفوظ ہو رہا ہے...' : 'تبدیلیاں محفوظ کریں'}
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => setShowEditModal(false)}>منسوخ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
