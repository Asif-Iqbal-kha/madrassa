import { useState, useEffect } from 'react';
import { getStudents, getStudentById, createStudent, updateStudent, deleteStudent, getClasses, getTodayPresentStudents } from '../../services/api';
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
  FiCamera,
  FiUpload,
} from 'react-icons/fi';
import { compressImage } from '../../utils/imageCompressor';
import '../dashboard/DashboardPages.css';

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [statusTab, setStatusTab] = useState('all'); // 'all', 'active', 'present', 'graduated', 'kharij'
  const [todayPresentData, setTodayPresentData] = useState({ date: '', totalPresent: 0, students: [] });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetailsCache, setStudentDetailsCache] = useState({});
  const [loadingStudentDetail, setLoadingStudentDetail] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [printReportType, setPrintReportType] = useState('all'); // 'all' or 'present_list'

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
    studentPhotoData: '',
    admissionFee: 1000,
    paymentMethod: 'JazzCash',
  });

  const [editingStudent, setEditingStudent] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [stuData, clsData, presData] = await Promise.all([
        getStudents(),
        getClasses(),
        getTodayPresentStudents().catch(() => ({ date: '', totalPresent: 0, students: [] })),
      ]);
      setStudents(stuData || []);
      setClasses(clsData || []);
      setTodayPresentData(presData || { date: '', totalPresent: 0, students: [] });
    } catch (err) {
      console.error('Load students error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeStudents = students.filter(
    (s) => s.status === 'active' || (!s.status && s.status !== 'inactive' && s.status !== 'graduated' && s.status !== 'kharij')
  );
  const graduatedStudents = students.filter((s) => s.status === 'graduated');
  const kharijStudents = students.filter((s) => s.status === 'kharij');

  const activeStudentsToPrint = classFilter === 'all'
    ? activeStudents
    : activeStudents.filter((s) => (s.className || s.class?.name || s.class) === classFilter);

  const filtered = students.filter((s) => {
    const sClass = s.className || s.class?.name || s.class;
    const matchesSearch =
      (s.name || '').includes(search) ||
      (s.fatherName || '').includes(search) ||
      (s.rollNumber || '').includes(search) ||
      (s.cnic || '').includes(search) ||
      (s.phone || '').includes(search);
    const matchesClass = classFilter === 'all' || sClass === classFilter;

    let matchesTab = true;
    if (statusTab === 'active') {
      matchesTab = s.status === 'active' || (!s.status && s.status !== 'inactive' && s.status !== 'graduated' && s.status !== 'kharij');
    } else if (statusTab === 'graduated') {
      matchesTab = s.status === 'graduated';
    } else if (statusTab === 'kharij') {
      matchesTab = s.status === 'kharij';
    }

    return matchesSearch && matchesClass && matchesTab;
  });

  const handlePrintPresentList = () => {
    setPrintReportType('present_list');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintGraduatesList = () => {
    setPrintReportType('graduates_list');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintKharijList = () => {
    setPrintReportType('kharij_list');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintActiveStudentsList = () => {
    setPrintReportType('active_list');
    setTimeout(() => {
      window.print();
    }, 150);
  };

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

  const handleSelectStudent = async (student) => {
    if (!student) return;
    const cached = studentDetailsCache[student._id];
    if (cached) {
      setSelectedStudent(cached);
      return;
    }

    setSelectedStudent(student);

    // If studentPhotoData not loaded yet, lazily fetch complete single-student data
    if (student.studentPhotoData === undefined) {
      setLoadingStudentDetail(true);
      try {
        const fullData = await getStudentById(student._id);
        if (fullData) {
          setSelectedStudent(fullData);
          setStudentDetailsCache((prev) => ({ ...prev, [student._id]: fullData }));
        }
      } catch (err) {
        console.warn('Lazy-load student photo failed:', err);
      } finally {
        setLoadingStudentDetail(false);
      }
    }
  };

  const handleEditOpen = async (student) => {
    const cached = studentDetailsCache[student._id];
    const baseStudent = cached || student;

    setEditingStudent({
      ...baseStudent,
      className: baseStudent.className || baseStudent.class?.name || baseStudent.class || '',
    });
    setError('');
    setShowEditModal(true);

    // If full data with photo not yet loaded, lazily fetch it for edit modal
    if (baseStudent.studentPhotoData === undefined) {
      try {
        const fullData = await getStudentById(student._id);
        if (fullData) {
          setEditingStudent((prev) => (prev && prev._id === student._id ? {
            ...fullData,
            className: fullData.className || fullData.class?.name || fullData.class || '',
          } : prev));
          setStudentDetailsCache((prev) => ({ ...prev, [student._id]: fullData }));
        }
      } catch (err) {
        console.warn('Lazy-load student for edit failed:', err);
      }
    }
  };

  const handleSaveEdit = async () => {
    if (!editingStudent) return;
    setError('');
    setSaving(true);
    const selectedCls = classes.find((c) => c.name === editingStudent.className);

    try {
      const updated = await updateStudent(editingStudent._id, {
        ...editingStudent,
        class: selectedCls ? selectedCls._id : undefined,
      });

      setShowEditModal(false);
      // Keep cache and selected student synced
      if (updated) {
        setStudentDetailsCache((prev) => ({ ...prev, [editingStudent._id]: updated }));
        if (selectedStudent && selectedStudent._id === editingStudent._id) {
          setSelectedStudent(updated);
        }
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
      setStudentDetailsCache((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      if (selectedStudent && selectedStudent._id === id) {
        setSelectedStudent(null);
      }
    } catch (err) {
      alert('حذف کرنے میں خرابی: ' + (err.message || 'سرور ایرر'));
    }
  };

  const handlePhotoUpload = async (file, isEditing = false) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('برائے مہربانی درست تصویری فائل منتخب کریں');
      return;
    }
    try {
      const { dataUrl } = await compressImage(file, { maxWidth: 600, maxHeight: 800, quality: 0.8 });
      if (isEditing) {
        setEditingStudent((prev) => ({ ...prev, studentPhotoData: dataUrl }));
      } else {
        setNewStudent((prev) => ({ ...prev, studentPhotoData: dataUrl }));
      }
    } catch (err) {
      console.warn('Image compression fallback:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEditing) {
          setEditingStudent((prev) => ({ ...prev, studentPhotoData: reader.result }));
        } else {
          setNewStudent((prev) => ({ ...prev, studentPhotoData: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePhotoChange = async (file) => {
    if (!file || !file.type.startsWith('image/') || !selectedStudent) return;
    try {
      const { dataUrl } = await compressImage(file, { maxWidth: 600, maxHeight: 800, quality: 0.8 });
      const updated = await updateStudent(selectedStudent._id, {
        ...selectedStudent,
        studentPhotoData: dataUrl,
      });
      const studentWithPhoto = updated || { ...selectedStudent, studentPhotoData: dataUrl };
      setSelectedStudent(studentWithPhoto);
      setStudentDetailsCache((prev) => ({ ...prev, [selectedStudent._id]: studentWithPhoto }));
    } catch (err) {
      console.error('Failed to update student photo:', err);
      alert('تصویر اپلوڈ کرنے میں خرابی ہوئی');
    }
  };

  return (
    <div>
      <div className="page-title-bar no-print">
        <h2 className="page-title" style={{ border: 'none', margin: 0, padding: 0 }}>طلباء کا انتظام (ریکارڈ و کوائف)</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-outline btn-sm" onClick={handlePrintActiveStudentsList} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FiPrinter size={14} /> زیرِ تعلیم طلباء رپورٹ PDF
          </button>
          <Link to="/admin/promote" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FiTrendingUp size={14} /> طلباء کو ترقی دیں
          </Link>
          <button className="btn btn-primary btn-sm" onClick={() => { setError(''); setShowModal(true); }}>
            <FiPlus size={14} style={{ marginLeft: '4px' }} /> نیا طالب علم
          </button>
        </div>
      </div>

      {/* Status Category Tabs (Unified Filtering & PDF reporting) */}
      <div className="no-print" style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        borderBottom: '2px solid var(--color-border-light)',
        paddingBottom: '12px',
        flexWrap: 'wrap',
      }}>
        <button
          className={`btn btn-sm ${statusTab === 'all' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setStatusTab('all')}
        >
          تمام طلباء ({students.length})
        </button>
        <button
          className={`btn btn-sm ${statusTab === 'active' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setStatusTab('active')}
        >
          فعال / زیرِ تعلیم ({activeStudents.length})
        </button>
        <button
          className={`btn btn-sm ${statusTab === 'present' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setStatusTab('present')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span>آج کے حاضر طلباء ({todayPresentData.totalPresent})</span>
          <span style={{ fontSize: '0.72rem', background: '#22c55e', color: '#fff', padding: '1px 6px', borderRadius: '10px' }}>لائیو</span>
        </button>
        <button
          className={`btn btn-sm ${statusTab === 'graduated' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setStatusTab('graduated')}
        >
          🎓 فارغ التحصیل طلباء ({graduatedStudents.length})
        </button>
        <button
          className={`btn btn-sm ${statusTab === 'kharij' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setStatusTab('kharij')}
        >
          🚫 خارج کردہ طلباء ({kharijStudents.length})
        </button>

        {/* Quick Report Print Buttons */}
        <div style={{ marginRight: 'auto', display: 'flex', gap: '8px' }}>
          {(statusTab === 'active' || statusTab === 'all') && activeStudents.length > 0 && (
            <button className="btn btn-outline btn-sm" onClick={handlePrintActiveStudentsList}>
              <FiPrinter size={15} style={{ marginLeft: '4px' }} /> زیرِ تعلیم طلباء رپورٹ PDF
            </button>
          )}
          {statusTab === 'present' && todayPresentData.totalPresent > 0 && (
            <button className="btn btn-outline btn-sm" onClick={handlePrintPresentList}>
              <FiPrinter size={15} style={{ marginLeft: '4px' }} /> حاضر طلباء رپورٹ PDF
            </button>
          )}
          {statusTab === 'graduated' && graduatedStudents.length > 0 && (
            <button className="btn btn-outline btn-sm" onClick={handlePrintGraduatesList}>
              <FiPrinter size={15} style={{ marginLeft: '4px' }} /> تمام فارغین رپورٹ PDF
            </button>
          )}
          {statusTab === 'kharij' && kharijStudents.length > 0 && (
            <button className="btn btn-outline btn-sm" onClick={handlePrintKharijList}>
              <FiPrinter size={15} style={{ marginLeft: '4px' }} /> خارج کردہ طلباء رپورٹ PDF
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="admin-loading-screen">
          <div className="admin-loading-spinner"></div>
          <p className="admin-loading-text">طلباء کا ریکارڈ لوڈ ہو رہا ہے...</p>
          <div className="admin-loading-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      ) : (
        <>
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

      {/* Currently Present Students Tab View */}
      {statusTab === 'present' ? (
        <div className="table-container no-print">
          <div style={{
            padding: '14px 18px',
            background: 'var(--color-bg-alt)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}>
            <div>
              <strong style={{ fontSize: '1rem', color: 'var(--color-primary-dark)' }}>
                آج کے حاضر طلباء کا ریکارڈ (حاضری رجسٹر)
              </strong>
              <span style={{ margin: '0 8px', color: 'var(--color-text-muted)' }}>|</span>
              <span>تاریخ: <strong style={{ fontFamily: 'var(--font-english)' }}>{todayPresentData.date}</strong></span>
              <span style={{ margin: '0 8px', color: 'var(--color-text-muted)' }}>|</span>
              <span>کل حاضر طلباء: <strong style={{ color: '#15803d', fontFamily: 'var(--font-english)' }}>{todayPresentData.totalPresent}</strong></span>
            </div>
            {todayPresentData.totalPresent > 0 && (
              <button className="btn btn-primary btn-sm" onClick={handlePrintPresentList}>
                <FiPrinter size={15} style={{ marginLeft: '4px' }} /> حاضر طلباء رپورٹ PDF ڈاؤنلوڈ / پرنٹ
              </button>
            )}
          </div>

          <table>
            <thead>
              <tr>
                <th>شمار</th>
                <th>رول نمبر</th>
                <th>نام طالب علم</th>
                <th>درجہ</th>
                <th>تاریخ</th>
                <th>حاضری کیفیت</th>
              </tr>
            </thead>
            <tbody>
              {todayPresentData.students.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                    اس تاریخ میں کوئی حاضر طالب علم درج نہیں ہے
                  </td>
                </tr>
              )}
              {todayPresentData.students.map((ps, idx) => (
                <tr key={idx}>
                  <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                  <td style={{ fontFamily: 'var(--font-english)', fontWeight: 700 }}>{ps.rollNumber}</td>
                  <td><strong style={{ color: 'var(--color-primary-dark)' }}>{ps.studentName}</strong></td>
                  <td>{ps.className}</td>
                  <td style={{ fontFamily: 'var(--font-english)' }}>{ps.date}</td>
                  <td><span className="badge badge-success">حاضر (Present)</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-container no-print">
          {statusTab === 'active' && (
            <div style={{
              padding: '12px 18px',
              background: 'var(--color-bg-alt)',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <strong>زیرِ تعلیم طلباء کا رجسٹر:</strong>
                <span style={{ marginRight: '8px' }}>
                  کل زیرِ تعلیم: {activeStudents.length}
                  {classFilter !== 'all' && ` (درجہ: ${classFilter})`}
                </span>
              </div>
              {activeStudents.length > 0 && (
                <button className="btn btn-outline btn-sm" onClick={handlePrintActiveStudentsList}>
                  <FiPrinter size={14} style={{ marginLeft: '4px' }} /> تمام زیرِ تعلیم طلباء کی فہرست پرنٹ کریں
                </button>
              )}
            </div>
          )}

          {statusTab === 'all' && (
            <div style={{
              padding: '12px 18px',
              background: 'var(--color-bg-alt)',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <strong>طلباء کا عمومی رجسٹر:</strong>
                <span style={{ marginRight: '8px' }}>
                  کل طلباء: {students.length} | زیرِ تعلیم: {activeStudents.length}
                  {classFilter !== 'all' && ` (درجہ: ${classFilter})`}
                </span>
              </div>
              {activeStudents.length > 0 && (
                <button className="btn btn-outline btn-sm" onClick={handlePrintActiveStudentsList}>
                  <FiPrinter size={14} style={{ marginLeft: '4px' }} /> زیرِ تعلیم طلباء کی فہرست پرنٹ کریں
                </button>
              )}
            </div>
          )}

          {statusTab === 'graduated' && (
            <div style={{
              padding: '12px 18px',
              background: 'var(--color-bg-alt)',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <strong>فارغ التحصیل طلباء کا رجسٹر:</strong>
                <span style={{ marginRight: '8px' }}>کل فارغین: {graduatedStudents.length}</span>
              </div>
              {graduatedStudents.length > 0 && (
                <button className="btn btn-outline btn-sm" onClick={handlePrintGraduatesList}>
                  <FiPrinter size={14} style={{ marginLeft: '4px' }} /> تمام فارغین کی فہرست پرنٹ کریں
                </button>
              )}
            </div>
          )}

          {statusTab === 'kharij' && (
            <div style={{
              padding: '12px 18px',
              background: 'var(--color-bg-alt)',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <strong>خارج / نکالے گئے طلباء کا رجسٹر:</strong>
                <span style={{ marginRight: '8px' }}>کل خارج شدہ: {kharijStudents.length}</span>
              </div>
              {kharijStudents.length > 0 && (
                <button className="btn btn-outline btn-sm" onClick={handlePrintKharijList}>
                  <FiPrinter size={14} style={{ marginLeft: '4px' }} /> خارج کردہ طلباء کی فہرست پرنٹ کریں
                </button>
              )}
            </div>
          )}

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
                  onClick={() => handleSelectStudent(student)}
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
                    <span className={`badge ${
                      student.status === 'graduated'
                        ? 'badge-info'
                        : student.status === 'kharij'
                        ? 'badge-danger'
                        : student.status === 'active'
                        ? 'badge-success'
                        : 'badge-warning'
                    }`}>
                      {student.status === 'graduated'
                        ? 'فارغ التحصیل'
                        : student.status === 'kharij'
                        ? 'خارج کردہ'
                        : student.status === 'active'
                        ? 'جاری / زیرِ تعلیم'
                        : 'غیر فعال'}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="action-btns">
                      <button
                        className="action-btn action-btn-primary"
                        onClick={() => handleSelectStudent(student)}
                        title="مکمل کوائف دیکھیں"
                        style={{ padding: '6px' }}
                      >
                        <FiEye size={14} />
                      </button>
                      <button
                        className="action-btn action-btn-outline"
                        onClick={() => {
                          handleSelectStudent(student);
                          setTimeout(() => window.print(), 250);
                        }}
                        title={student.status === 'graduated' ? 'سندِ فراغت پرنٹ کریں' : 'کوائف پرنٹ کریں'}
                        style={{ padding: '6px' }}
                      >
                        <FiPrinter size={14} />
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
      )}
      </>
      )}

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
                <p>صدیق اکبر کالونی عقب توحید کالونی چارسدہ روڈ مردان خیبرپختونخوا پاکستان — طالب علم کا دفتری و تعلیمی ریکارڈ فائل</p>
              </div>
              <div className="student-modal-print-date">
                تاریخِ پرنٹ: {new Date().toISOString().split('T')[0]}
              </div>
            </div>

            {/* Header Banner with Student Photo / Avatar */}
            <div className="student-profile-header-banner">
              <div className="student-profile-identity">
                <div className="student-profile-avatar" style={{ position: 'relative' }}>
                  {selectedStudent.studentPhotoData ? (
                    <img src={selectedStudent.studentPhotoData} alt={selectedStudent.name} />
                  ) : loadingStudentDetail ? (
                    <span style={{ fontSize: '0.7rem', color: '#fff', textAlign: 'center', padding: '4px' }}>لوڈ ہو رہا ہے...</span>
                  ) : (
                    <span>{selectedStudent.name.charAt(0)}</span>
                  )}
                  <label
                    className="no-print"
                    title="طالب علم کی تصویر تبدیل کریں (خودکار کمپریشن)"
                    style={{
                      position: 'absolute',
                      bottom: '-6px',
                      left: '-6px',
                      background: 'var(--color-primary)',
                      color: '#fff',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    }}
                  >
                    <FiCamera size={12} />
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleProfilePhotoChange(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
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
                      کیفیت: {
                        selectedStudent.status === 'active'
                          ? 'جاری / زیرِ تعلیم'
                          : selectedStudent.status === 'graduated'
                          ? 'فارغ التحصیل'
                          : selectedStudent.status === 'kharij'
                          ? 'خارج کردہ'
                          : 'غیر فعال'
                      }
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

                {/* Admin Note — shown for graduated or kharij students */}
                {selectedStudent.adminNote && (
                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed #ddd' }}>
                    <span className="student-info-label" style={{ display: 'block', marginBottom: '6px' }}>
                      ایڈمن نوٹ:
                    </span>
                    <div style={{
                      background: selectedStudent.status === 'kharij' ? 'rgba(239,68,68,0.06)' : 'rgba(15,118,110,0.06)',
                      border: `1px solid ${selectedStudent.status === 'kharij' ? 'rgba(239,68,68,0.25)' : 'rgba(15,118,110,0.25)'}`,
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '0.875rem',
                      color: 'var(--color-text)',
                    }}>
                      {selectedStudent.adminNote}
                    </div>
                  </div>
                )}

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

              {/* Photo Upload with Automatic Compression */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px', padding: '12px', background: 'var(--color-bg-alt)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <div style={{ width: '64px', height: '76px', borderRadius: '6px', border: '2px dashed var(--color-primary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', flexShrink: 0 }}>
                  {newStudent.studentPhotoData ? (
                    <img src={newStudent.studentPhotoData} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <FiCamera size={24} style={{ color: 'var(--color-text-muted)' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: '4px' }}>طالب علم کی تازہ تصویر (خودکار کمپریشن)</span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', margin: 0, padding: '4px 12px', fontSize: '0.8rem' }}>
                      <FiUpload size={13} style={{ marginLeft: '4px' }} />
                      {newStudent.studentPhotoData ? 'تصویر تبدیل کریں' : 'تصویر منتخب کریں'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handlePhotoUpload(e.target.files[0], false);
                          }
                        }}
                      />
                    </label>
                    {newStudent.studentPhotoData && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)', padding: '4px 10px', fontSize: '0.8rem' }}
                        onClick={() => setNewStudent((prev) => ({ ...prev, studentPhotoData: '' }))}
                      >
                        حذف کریں
                      </button>
                    )}
                  </div>
                </div>
              </div>

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

              {/* Photo Upload with Automatic Compression */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px', padding: '12px', background: 'var(--color-bg-alt)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <div style={{ width: '64px', height: '76px', borderRadius: '6px', border: '2px dashed var(--color-primary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', flexShrink: 0 }}>
                  {editingStudent.studentPhotoData ? (
                    <img src={editingStudent.studentPhotoData} alt={editingStudent.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <FiCamera size={24} style={{ color: 'var(--color-text-muted)' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: '4px' }}>طالب علم کی تصویر (خودکار کمپریشن)</span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', margin: 0, padding: '4px 12px', fontSize: '0.8rem' }}>
                      <FiUpload size={13} style={{ marginLeft: '4px' }} />
                      {editingStudent.studentPhotoData ? 'تصویر تبدیل کریں' : 'تصویر اپلوڈ کریں'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handlePhotoUpload(e.target.files[0], true);
                          }
                        }}
                      />
                    </label>
                    {editingStudent.studentPhotoData && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)', padding: '4px 10px', fontSize: '0.8rem' }}
                        onClick={() => setEditingStudent((prev) => ({ ...prev, studentPhotoData: '' }))}
                      >
                        حذف کریں
                      </button>
                    )}
                  </div>
                </div>
              </div>

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
                  <label className="form-label">طالب علم کی کیفیت *</label>
                  <select
                    className="form-select"
                    value={editingStudent.status}
                    onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value, adminNote: e.target.value === 'active' ? '' : (editingStudent.adminNote || '') })}
                  >
                    <option value="active">جاری / زیرِ تعلیم (Running)</option>
                    <option value="graduated">فارغ التحصیل (Graduated)</option>
                    <option value="kharij">خارج / نکالا گیا (Khārij / Struck Off)</option>
                  </select>
                </div>
                {/* Conditional Admin Note — appears for Graduated or Kharij */}
                {(editingStudent.status === 'graduated' || editingStudent.status === 'kharij') && (
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">
                      ایڈمن نوٹ
                      <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-text-muted)', marginRight: '6px' }}>
                        (اختیاری — وجہ، تاریخ، یا دیگر تفصیل)
                      </span>
                    </label>
                    <textarea
                      className="form-input"
                      rows={2}
                      style={{ resize: 'vertical', minHeight: '52px' }}
                      placeholder={editingStudent.status === 'kharij' ? 'مثلاً: بد اخلاقی کی بنا پر خارج کیا گیا، تاریخ...' : 'مثلاً: فارغ التحصیل، سنہ...'}
                      value={editingStudent.adminNote || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, adminNote: e.target.value })}
                    />
                  </div>
                )}
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
      {/* PRINT-ONLY: CURRENTLY PRESENT STUDENTS REPORT */}
      {printReportType === 'present_list' && (
        <div className="print-only-attendance" style={{ display: 'none' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '16px' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: '1.4rem' }}>مدرسہ عربیہ سیدنا صدیق اکبر رضی اللہ تعالیٰ عنہ</h2>
            <p style={{ margin: '0 0 4px', fontSize: '0.9rem' }}>صدیق اکبر کالونی عقب توحید کالونی چارسدہ روڈ مردان خیبرپختونخوا پاکستان</p>
            <h3 style={{ margin: '8px 0 0', fontSize: '1.15rem', textDecoration: 'underline' }}>
              حاضر طلباء کی یومیہ دفتری رپورٹ (Currently Present Students Report)
            </h3>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.95rem' }}>
            <div><strong>تاریخ:</strong> <span style={{ fontFamily: 'monospace' }}>{todayPresentData.date}</span></div>
            <div><strong>کل حاضر طلباء:</strong> <strong style={{ color: '#15803d' }}>{todayPresentData.totalPresent}</strong></div>
            <div><strong>پرنٹ کی تاریخ:</strong> {new Date().toISOString().split('T')[0]}</div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr style={{ background: '#060a13', color: '#ffffff', borderBottom: '2px solid #000' }}>
                <th style={{ border: '1px solid #000', padding: '8px', width: '8%', color: '#ffffff' }}>شمار</th>
                <th style={{ border: '1px solid #000', padding: '8px', width: '15%', color: '#ffffff' }}>رول نمبر</th>
                <th style={{ border: '1px solid #000', padding: '8px', width: '35%', color: '#ffffff' }}>طالب علم کا نام</th>
                <th style={{ border: '1px solid #000', padding: '8px', width: '22%', color: '#ffffff' }}>درجہ</th>
                <th style={{ border: '1px solid #000', padding: '8px', width: '20%', color: '#ffffff' }}>کیفیت</th>
              </tr>
            </thead>
            <tbody>
              {todayPresentData.students.map((ps, idx) => (
                <tr key={idx}>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{idx + 1}</td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontFamily: 'monospace' }}>
                    {ps.rollNumber}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 600 }}>{ps.studentName}</td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{ps.className}</td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 700, color: '#15803d' }}>
                    حاضر (Present)
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f9fafb', fontWeight: 700 }}>
                <td colSpan="3" style={{ border: '1px solid #000', padding: '8px' }}>
                  مجموعی تعدادِ حاضر طلباء: {todayPresentData.totalPresent}
                </td>
                <td colSpan="2" style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', color: '#15803d' }}>
                  تصدیق شدہ برائے تاریخ {todayPresentData.date}
                </td>
              </tr>
            </tfoot>
          </table>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '20px' }}>
            <div style={{ textAlign: 'center', width: '200px', borderTop: '1px dashed #000' }}>
              دستخط ناظمِ حاضری
            </div>
            <div style={{ textAlign: 'center', width: '200px', borderTop: '1px dashed #000' }}>
              دستخط ناظمِ تعلیمات
            </div>
            <div style={{ textAlign: 'center', width: '200px', borderTop: '1px dashed #000' }}>
              دستخط مہتممِ جامعہ
            </div>
          </div>
        </div>
      )}

      {/* PRINT-ONLY: GRADUATED STUDENTS REGISTRY REPORT */}
      {printReportType === 'graduates_list' && (
        <div className="print-only-attendance" style={{ display: 'none' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '16px' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: '1.4rem' }}>مدرسہ عربیہ سیدنا صدیق اکبر رضی اللہ تعالیٰ عنہ</h2>
            <p style={{ margin: '0 0 4px', fontSize: '0.9rem' }}>صدیق اکبر کالونی عقب توحید کالونی چارسدہ روڈ مردان خیبرپختونخوا پاکستان</p>
            <h3 style={{ margin: '8px 0 0', fontSize: '1.15rem', textDecoration: 'underline' }}>
              فارغ التحصیل حفاظ و علماء کرام کا رجسٹر (Graduated Students Registry)
            </h3>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.95rem' }}>
            <div><strong>کل فارغ التحصیل طلباء:</strong> {graduatedStudents.length}</div>
            <div><strong>تاریخِ پرنٹ:</strong> {new Date().toISOString().split('T')[0]}</div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr style={{ background: '#000000', color: '#ffffff', borderBottom: '2px solid #000' }}>
                <th style={{ border: '1px solid #000', padding: '8px', width: '8%', color: '#ffffff' }}>شمار</th>
                <th style={{ border: '1px solid #000', padding: '8px', width: '15%', color: '#ffffff' }}>رول نمبر</th>
                <th style={{ border: '1px solid #000', padding: '8px', width: '25%', color: '#ffffff' }}>نام فارغ التحصیل</th>
                <th style={{ border: '1px solid #000', padding: '8px', width: '22%', color: '#ffffff' }}>والد کا نام</th>
                <th style={{ border: '1px solid #000', padding: '8px', width: '15%', color: '#ffffff' }}>شعبہ / درجہ</th>
                <th style={{ border: '1px solid #000', padding: '8px', width: '15%', color: '#ffffff' }}>حالت</th>
              </tr>
            </thead>
            <tbody>
              {graduatedStudents.map((s, idx) => (
                <tr key={s._id}>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{idx + 1}</td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontFamily: 'monospace' }}>
                    {s.rollNumber}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 600 }}>{s.name}</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{s.fatherName}</td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                    {s.className || s.class?.name || 'حفظ قرآن کریم'}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 700, color: '#0f766e' }}>
                    فارغ التحصیل
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f9fafb', fontWeight: 700 }}>
                <td colSpan="6" style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>
                  اللہ تعالیٰ تمام فارغین کے علم و عمل میں برکت عطا فرمائے — آمین
                </td>
              </tr>
            </tfoot>
          </table>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '20px' }}>
            <div style={{ textAlign: 'center', width: '200px', borderTop: '1px dashed #000' }}>
              دستخط ناظمِ امتحانات
            </div>
            <div style={{ textAlign: 'center', width: '200px', borderTop: '1px dashed #000' }}>
              دستخط ناظمِ تعلیمات
            </div>
            <div style={{ textAlign: 'center', width: '200px', borderTop: '1px dashed #000' }}>
              دستخط مہتممِ جامعہ
            </div>
          </div>
        </div>
      )}

      {/* PRINT-ONLY: KHARIJ / STRUCK-OFF STUDENTS REGISTRY REPORT */}
      {printReportType === 'kharij_list' && (
        <div className="print-only-attendance" style={{ display: 'none' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '16px' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: '1.4rem' }}>مدرسہ عربیہ سیدنا صدیق اکبر رضی اللہ تعالیٰ عنہ</h2>
            <p style={{ margin: '0 0 4px', fontSize: '0.9rem' }}>صدیق اکبر کالونی عقب توحید کالونی چارسدہ روڈ مردان خیبرپختونخوا پاکستان</p>
            <h3 style={{ margin: '8px 0 0', fontSize: '1.15rem', textDecoration: 'underline' }}>
              خارج / نکالے گئے طلباء کا دفتری رجسٹر (Struck-Off Students Registry)
            </h3>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.95rem' }}>
            <div><strong>کل خارج شدہ طلباء:</strong> {kharijStudents.length}</div>
            <div><strong>تاریخِ پرنٹ:</strong> {new Date().toISOString().split('T')[0]}</div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr style={{ background: '#7f1d1d', color: '#ffffff', borderBottom: '2px solid #000' }}>
                <th style={{ border: '1px solid #000', padding: '8px', width: '6%', color: '#ffffff' }}>شمار</th>
                <th style={{ border: '1px solid #000', padding: '8px', width: '12%', color: '#ffffff' }}>رول نمبر</th>
                <th style={{ border: '1px solid #000', padding: '8px', width: '20%', color: '#ffffff' }}>نام طالب علم</th>
                <th style={{ border: '1px solid #000', padding: '8px', width: '18%', color: '#ffffff' }}>والد کا نام</th>
                <th style={{ border: '1px solid #000', padding: '8px', width: '14%', color: '#ffffff' }}>درجہ</th>
                <th style={{ border: '1px solid #000', padding: '8px', width: '20%', color: '#ffffff' }}>ایڈمن نوٹ</th>
                <th style={{ border: '1px solid #000', padding: '8px', width: '10%', color: '#ffffff' }}>حالت</th>
              </tr>
            </thead>
            <tbody>
              {kharijStudents.map((s, idx) => (
                <tr key={s._id}>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{idx + 1}</td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontFamily: 'monospace' }}>
                    {s.rollNumber}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 600 }}>{s.name}</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{s.fatherName}</td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                    {s.className || s.class?.name || '—'}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px', fontSize: '0.85rem', color: '#555' }}>
                    {s.adminNote || '—'}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 700, color: '#991b1b' }}>
                    خارج کردہ
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f9fafb', fontWeight: 700 }}>
                <td colSpan="7" style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>
                  اللہ تعالیٰ انہیں ہدایت عطا فرمائے اور مدرسے کو محفوظ رکھے — آمین
                </td>
              </tr>
            </tfoot>
          </table>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '20px' }}>
            <div style={{ textAlign: 'center', width: '200px', borderTop: '1px dashed #000' }}>
              دستخط ناظمِ نظم و ضبط
            </div>
            <div style={{ textAlign: 'center', width: '200px', borderTop: '1px dashed #000' }}>
              دستخط ناظمِ تعلیمات
            </div>
            <div style={{ textAlign: 'center', width: '200px', borderTop: '1px dashed #000' }}>
              دستخط مہتممِ جامعہ
            </div>
          </div>
        </div>
      )}

      {/* PRINT-ONLY: ACTIVE / CURRENTLY STUDYING STUDENTS REPORT */}
      {printReportType === 'active_list' && (
        <div className="print-only-attendance" style={{ display: 'none' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '16px' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: '1.4rem' }}>مدرسہ عربیہ سیدنا صدیق اکبر رضی اللہ تعالیٰ عنہ</h2>
            <p style={{ margin: '0 0 4px', fontSize: '0.9rem' }}>صدیق اکبر کالونی عقب توحید کالونی چارسدہ روڈ مردان خیبرپختونخوا پاکستان</p>
            <h3 style={{ margin: '8px 0 0', fontSize: '1.15rem', textDecoration: 'underline' }}>
              زیرِ تعلیم طلباء کی فہرست (Currently Studying Students List)
            </h3>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.95rem' }}>
            <div>
              <strong>کل زیرِ تعلیم طلباء:</strong> {activeStudentsToPrint.length}
              {classFilter !== 'all' && <span> (درجہ: {classFilter})</span>}
            </div>
            <div><strong>تاریخِ پرنٹ:</strong> {new Date().toISOString().split('T')[0]}</div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr style={{ background: '#030508', color: '#ffffff', borderBottom: '2px solid #000' }}>
                <th style={{ border: '1px solid #000', padding: '8px', width: '6%', color: '#ffffff' }}>شمار</th>
                <th style={{ border: '1px solid #000', padding: '8px', width: '12%', color: '#ffffff' }}>رول نمبر</th>
                <th style={{ border: '1px solid #000', padding: '8px', width: '22%', color: '#ffffff' }}>نام طالب علم</th>
                <th style={{ border: '1px solid #000', padding: '8px', width: '20%', color: '#ffffff' }}>والد کا نام</th>
                <th style={{ border: '1px solid #000', padding: '8px', width: '15%', color: '#ffffff' }}>درجہ</th>
                <th style={{ border: '1px solid #000', padding: '8px', width: '15%', color: '#ffffff' }}>رابطہ نمبر</th>
                <th style={{ border: '1px solid #000', padding: '8px', width: '10%', color: '#ffffff' }}>حالت</th>
              </tr>
            </thead>
            <tbody>
              {activeStudentsToPrint.map((s, idx) => (
                <tr key={s._id}>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{idx + 1}</td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontFamily: 'monospace' }}>
                    {s.rollNumber}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 600 }}>{s.name}</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{s.fatherName}</td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                    {s.className || s.class?.name || '-'}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontFamily: 'monospace' }}>
                    {s.phone || s.guardianPhone || '-'}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 700, color: '#15803d' }}>
                    فعال
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f9fafb', fontWeight: 700 }}>
                <td colSpan="7" style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>
                  مجموعی زیرِ تعلیم طلباء: {activeStudentsToPrint.length} {classFilter !== 'all' ? `(${classFilter}) ` : ''}— اللہ تعالیٰ سب کو کامیابی عطا فرمائے — آمین
                </td>
              </tr>
            </tfoot>
          </table>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '20px' }}>
            <div style={{ textAlign: 'center', width: '200px', borderTop: '1px dashed #000' }}>
              دستخط ناظمِ تعلیمات
            </div>
            <div style={{ textAlign: 'center', width: '200px', borderTop: '1px dashed #000' }}>
              دستخط مہتممِ جامعہ
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
