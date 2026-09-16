import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getClasses,
  getStudents,
  saveBulkResults,
  getResults,
  deleteResult,
  togglePublishResults,
} from '../../services/api';
import {
  FiCheckCircle,
  FiAlertCircle,
  FiSave,
  FiTrash2,
  FiPlus,
  FiRefreshCw,
  FiEye,
  FiUsers,
  FiAward,
  FiGlobe,
  FiLock,
  FiUnlock,
} from 'react-icons/fi';
import '../dashboard/DashboardPages.css';

const DEFAULT_SUBJECTS_MAP = {
  hifz: ['حفظ القرآن الکریم', 'تجوید و قراءت', 'اسلامی تعلیمات', 'دعائیں و مسنون اعمال'],
  nazira: ['ناظرہ قرآن مجید', 'تجوید', 'نورانی قاعدہ', 'کلمے و دعائیں'],
  general: ['قرآن مجید و تجوید', 'حدیث شریف', 'فقہ و اصول فقہ', 'عربی گرائمر و ادب', 'اردو و انشا', 'ریاضی و حساب'],
};

const EXAM_PRESETS = [
  'سالانہ امتحان 1447ھ',
  'ششماہی امتحان 1447ھ',
  'سہ ماہی امتحان 1447ھ',
  'ماہانہ ٹیسٹ',
  'سالانہ امتحان 1446ھ',
  'ششماہی امتحان 1446ھ',
];

export default function UploadResults() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [examName, setExamName] = useState('سالانہ امتحان 1447ھ');
  const [year, setYear] = useState('1447');
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState({});
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS_MAP.general);
  const [newSubject, setNewSubject] = useState('');
  const [showAddSubject, setShowAddSubject] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingPublish, setTogglingPublish] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [existingResults, setExistingResults] = useState([]);
  const [activeTab, setActiveTab] = useState('entry'); // 'entry' | 'view'
  const [studentSearch, setStudentSearch] = useState('');

  // 1. Load Classes
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const clsData = await getClasses();
        const validClasses = clsData || [];
        setClasses(validClasses);
        if (validClasses.length > 0) {
          setSelectedClass(validClasses[0]._id);
        }
      } catch (err) {
        console.error('Failed to load classes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // 2. Adjust subjects when class changes
  useEffect(() => {
    if (!selectedClass) return;
    const currentClass = classes.find((c) => c._id === selectedClass);
    const clsName = currentClass?.name || '';
    if (clsName.includes('حفظ')) {
      setSubjects(DEFAULT_SUBJECTS_MAP.hifz);
    } else if (clsName.includes('ناظرہ')) {
      setSubjects(DEFAULT_SUBJECTS_MAP.nazira);
    } else {
      setSubjects(DEFAULT_SUBJECTS_MAP.general);
    }
  }, [selectedClass, classes]);

  // 3. Load Students & Existing Results for the Class
  const loadStudentsAndExisting = async () => {
    if (!selectedClass) return;
    try {
      setLoading(true);
      setErrorMsg('');
      const currentClass = classes.find((c) => c._id === selectedClass);
      const [allStudents, classResults] = await Promise.all([
        getStudents(),
        getResults({ className: currentClass?.name || '', examName: examName || '' }),
      ]);

      // Filter students for this class - exclude graduated and inactive students
      const eligibleStudents = (allStudents || []).filter((s) => {
        if (s.status === 'graduated' || s.status === 'inactive') return false;
        if (s.class === selectedClass || s.class?._id === selectedClass) return true;
        if (currentClass && (s.className === currentClass.name || s.class === currentClass.name)) return true;
        return false;
      });

      setStudents(eligibleStudents);

      // Pre-fill existing marks if any
      const resultsMap = {};
      const validResults = Array.isArray(classResults) ? classResults : [];
      setExistingResults(validResults);

      eligibleStudents.forEach((s) => {
        const matchedResult = validResults.find(
          (r) => String(r.rollNumber).trim() === String(s.rollNumber).trim()
        );
        if (matchedResult && Array.isArray(matchedResult.marks)) {
          const marksObj = {};
          matchedResult.marks.forEach((m) => {
            marksObj[m.subject] = m.obtainedMarks;
          });
          resultsMap[s._id] = marksObj;
        }
      });

      setResults(resultsMap);
    } catch (err) {
      console.error('Failed to load students/results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentsAndExisting();
  }, [selectedClass, classes, examName]);

  const setMark = (studentId, subject, value) => {
    let numVal = value === '' ? '' : Number(value);
    if (numVal > 100) numVal = 100;
    if (numVal < 0) numVal = 0;

    setResults((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [subject]: numVal,
      },
    }));
  };

  const calculateRowStats = (studentId) => {
    const marksObj = results[studentId] || {};
    let totalObtained = 0;
    let subjectsEntered = 0;

    subjects.forEach((sub) => {
      const val = marksObj[sub];
      if (val !== undefined && val !== '') {
        totalObtained += Number(val);
        subjectsEntered++;
      }
    });

    const totalMarks = subjects.length * 100;
    const percentage = totalMarks > 0 ? Math.round((totalObtained / totalMarks) * 100 * 10) / 10 : 0;

    let grade = '-';
    if (subjectsEntered > 0) {
      if (percentage >= 80) grade = 'الف+ (ممتاز)';
      else if (percentage >= 70) grade = 'الف (اعلیٰ)';
      else if (percentage >= 60) grade = 'ب (جید)';
      else if (percentage >= 50) grade = 'ج (مقبول)';
      else grade = 'راسب (ناکام)';
    }

    return { totalObtained, totalMarks, percentage, grade, subjectsEntered };
  };

  const handleAddSubject = (e) => {
    e.preventDefault();
    const cleanSub = newSubject.trim();
    if (!cleanSub) return;
    if (subjects.includes(cleanSub)) {
      setErrorMsg('یہ مضمون پہلے سے شامل ہے');
      return;
    }
    setSubjects([...subjects, cleanSub]);
    setNewSubject('');
    setShowAddSubject(false);
  };

  const handleRemoveSubject = (subToRemove) => {
    if (subjects.length <= 1) {
      setErrorMsg('کم از کم ایک مضمون ہونا لازمی ہے');
      return;
    }
    setSubjects(subjects.filter((s) => s !== subToRemove));
  };

  const handleFillAllZero = () => {
    const updated = { ...results };
    students.forEach((s) => {
      const currentMarks = updated[s._id] || {};
      const newMarks = { ...currentMarks };
      subjects.forEach((sub) => {
        if (newMarks[sub] === undefined || newMarks[sub] === '') {
          newMarks[sub] = 0;
        }
      });
      updated[s._id] = newMarks;
    });
    setResults(updated);
  };

  // Submit results: can save as withheld (default) or publish directly
  const handleSubmit = async (saveAsPublished = false) => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedClass) {
      setErrorMsg('برائے مہربانی پہلے درجہ منتخب کریں');
      return;
    }

    if (!examName.trim()) {
      setErrorMsg('امتحان کا نام درج کریں');
      return;
    }

    if (students.length === 0) {
      setErrorMsg('اس درجہ میں کوئی طالب علم موجود نہیں ہے');
      return;
    }

    const currentClass = classes.find((c) => c._id === selectedClass);
    const resultsToSave = [];

    students.forEach((s) => {
      const marksObj = results[s._id] || {};
      const marksArray = subjects.map((sub) => ({
        subject: sub,
        obtainedMarks: Number(marksObj[sub] || 0),
        totalMarks: 100,
      }));

      const totalObtained = marksArray.reduce((acc, m) => acc + m.obtainedMarks, 0);
      const totalMarks = marksArray.length * 100;
      const percentage = totalMarks > 0 ? Math.round((totalObtained / totalMarks) * 100 * 10) / 10 : 0;

      let grade = 'راسب (ناکام)';
      if (percentage >= 80) grade = 'الف+ (ممتاز)';
      else if (percentage >= 70) grade = 'الف (اعلیٰ)';
      else if (percentage >= 60) grade = 'ب (جید)';
      else if (percentage >= 50) grade = 'ج (مقبول)';

      resultsToSave.push({
        examName: examName.trim(),
        student: s._id,
        studentName: s.name,
        fatherName: s.fatherName || '',
        rollNumber: String(s.rollNumber || '').trim(),
        className: currentClass ? currentClass.name : (s.className || ''),
        year: year || '1447',
        marks: marksArray,
        totalObtained,
        totalMarks,
        percentage,
        grade,
        status: percentage >= 50 ? 'کامیاب' : 'ناکام',
        isPublished: Boolean(saveAsPublished),
      });
    });

    try {
      setSaving(true);
      await saveBulkResults(resultsToSave);

      if (saveAsPublished) {
        setSuccessMsg(`ماشاءاللہ! ${resultsToSave.length} طلباء کے نتائج محفوظ اور پبلک پورٹل پر لائیو شائع (Published) ہو گئے۔`);
      } else {
        setSuccessMsg(`ماشاءاللہ! ${resultsToSave.length} طلباء کے نتائج محفوظ ہو گئے ہیں (فی الوقت طلباء سے روکے گئے ہیں / Withheld)۔ آپ جب چاہیں "شائع کریں" دبا کر پبلک کر سکتے ہیں۔`);
      }

      // Refresh existing results
      const refreshed = await getResults({
        className: currentClass?.name || '',
        examName: examName.trim(),
      });
      setExistingResults(Array.isArray(refreshed) ? refreshed : []);

      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (err) {
      console.error('Save results error:', err);
      setErrorMsg(err.message || 'نتائج محفوظ کرنے میں خرابی پیش آئی۔ سرور سے رابطہ چیک کریں۔');
    } finally {
      setSaving(false);
    }
  };

  // Toggle publication for the current class & exam or specific IDs
  const handleTogglePublish = async (targetStatus, ids = null) => {
    const currentClass = classes.find((c) => c._id === selectedClass);
    if (!currentClass && !ids) {
      setErrorMsg('پہلے درجہ منتخب کریں');
      return;
    }

    const actionText = targetStatus ? 'شائع (Live)' : 'روک (Withhold / Hide)';
    const confirmPrompt = ids
      ? `کیا آپ واقعی اس نتیجہ کو ${actionText} کرنا چاہتے ہیں؟`
      : `کیا آپ واقعی درجہ "${currentClass?.name}" کے "${examName}" کے تمام نتائج کو ${actionText} کرنا چاہتے ہیں؟`;

    if (!window.confirm(confirmPrompt)) return;

    try {
      setTogglingPublish(true);
      setErrorMsg('');
      const res = await togglePublishResults({
        className: currentClass?.name,
        examName: examName.trim(),
        year: year.trim(),
        isPublished: targetStatus,
        ids: ids || undefined,
      });

      setSuccessMsg(res.message || (targetStatus ? 'نتائج کامیابی سے شائع ہو گئے۔' : 'نتائج طلباء سے روک دیے گئے۔'));

      // Update local state
      setExistingResults((prev) =>
        prev.map((item) => {
          if (!ids || ids.includes(item._id)) {
            return { ...item, isPublished: targetStatus };
          }
          return item;
        })
      );

      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error('Toggle publish error:', err);
      setErrorMsg(err.message || 'اشاعت کی کیفیت تبدیل کرنے میں خرابی ہوئی');
    } finally {
      setTogglingPublish(false);
    }
  };

  const handleDeleteExisting = async (id, studentName) => {
    if (!window.confirm(`کیا آپ واقعی ${studentName} کا یہ نتیجہ حذف کرنا چاہتے ہیں؟`)) return;
    try {
      await deleteResult(id);
      setExistingResults((prev) => prev.filter((r) => r._id !== id));
      setSuccessMsg('نتیجہ کامیابی سے حذف کر دیا گیا');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'نتیجہ حذف نہیں ہو سکا');
    }
  };

  const currentClassName = classes.find((c) => c._id === selectedClass)?.name || '';

  const displayedStudents = students.filter((s) => {
    if (!studentSearch.trim()) return true;
    const term = studentSearch.toLowerCase().trim();
    return (
      s.name?.toLowerCase().includes(term) ||
      String(s.rollNumber).includes(term) ||
      s.fatherName?.toLowerCase().includes(term)
    );
  });

  // Publication metrics
  const totalExisting = existingResults.length;
  const publishedCount = existingResults.filter((r) => r.isPublished === true).length;
  const withheldCount = totalExisting - publishedCount;
  const isAllPublished = totalExisting > 0 && publishedCount === totalExisting;
  const isPartiallyPublished = totalExisting > 0 && publishedCount > 0 && publishedCount < totalExisting;

  return (
    <div className="upload-results-container">
      {/* Page Title Bar */}
      <div className="page-title-bar">
        <div>
          <h2 className="page-title" style={{ margin: 0, paddingBottom: 0, border: 'none' }}>
            امتحانی نتائج اپلوڈ و اشاعت کا انتظام
          </h2>
          <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            طلباء کے نمبر درج کریں، نتائج محفوظ کریں اور ایک کلک سے طلباء کے لیے پبلش یا روکیں
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className={`btn ${activeTab === 'entry' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('entry')}
          >
            نمبرات درج کریں
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'view' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('view')}
          >
            <FiEye style={{ marginLeft: '4px' }} />
            محفوظ شدہ نتائج ({existingResults.length})
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <FiCheckCircle size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <FiAlertCircle size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="admin-loading-screen">
          <div className="admin-loading-spinner"></div>
          <p className="admin-loading-text">نتائج اور درجات کا ڈیٹا لوڈ ہو رہا ہے...</p>
          <div className="admin-loading-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      ) : (
      <>
      {/* Control Panel: Class, Exam, Year */}
      <div className="dash-card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
          {/* Class Select */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: 600 }}>درجہ منتخب کریں *</label>
            <select
              className="form-select"
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setResults({});
              }}
            >
              <option value="">درجہ منتخب کریں</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Name Preset / Custom */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: 600 }}>امتحان کا نام *</label>
            <input
              type="text"
              list="exam-presets"
              className="form-input"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              placeholder="مثلاً: سالانہ امتحان 1447ھ"
            />
            <datalist id="exam-presets">
              {EXAM_PRESETS.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>

          {/* Hijri Year */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: 600 }}>تعلیمی سال</label>
            <input
              type="text"
              className="form-input"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="1447"
              style={{ fontFamily: 'var(--font-english)' }}
            />
          </div>

          {/* Student Search */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: 600 }}>طالب علم تلاش کریں</label>
            <input
              type="text"
              className="form-input"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="رول نمبر یا نام لکھیں..."
            />
          </div>
        </div>
      </div>

      {/* PUBLISH & WITHHOLD CONTROL BANNER */}
      {selectedClass && (
        <div
          className={`result-publish-banner ${
            totalExisting === 0
              ? 'status-empty'
              : isAllPublished
              ? 'status-published'
              : 'status-withheld'
          }`}
        >
          <div className="publish-banner-info">
            <div className="publish-icon-box">
              {totalExisting === 0 ? (
                <FiAward />
              ) : isAllPublished ? (
                <FiGlobe />
              ) : (
                <FiLock />
              )}
            </div>
            <div>
              <div className="publish-banner-title">
                {totalExisting === 0 ? (
                  <span>درجہ "{currentClassName}" - کوئی نتیجہ محفوظ نہیں</span>
                ) : isAllPublished ? (
                  <span style={{ color: '#047857' }}>
                    🟢 نتائج لائیو شائع شدہ ہیں (Published Live) — ({publishedCount} طلباء)
                  </span>
                ) : isPartiallyPublished ? (
                  <span style={{ color: '#b45309' }}>
                    🟡 جزوی شائع شدہ ({publishedCount} شائع / {withheldCount} روکے گئے)
                  </span>
                ) : (
                  <span style={{ color: '#b45309' }}>
                    🔒 نتائج روکے گئے ہیں (Withheld / Unpublished) — ({withheldCount} طلباء)
                  </span>
                )}
              </div>
              <p className="publish-banner-desc">
                {totalExisting === 0 ? (
                  'طلباء کے نمبرات درج کر کے نیچے دیے گئے بٹن سے محفوظ کریں۔'
                ) : isAllPublished ? (
                  'اس امتحان کے تمام نتائج طلباء کے لیے پبلک رزلٹ پورٹل پر لائیو ہیں اور رول نمبر کے ذریعے تلاش کیے جا سکتے ہیں۔'
                ) : (
                  'نتائج ڈیٹا بیس میں محفوظ ہیں لیکن طلباء کے لیے پبلک پورٹل پر چھپائے گئے ہیں۔ جب آپ "شائع کریں" دبائیں گے تب ہی طلباء دیکھ سکیں گے۔'
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons for Whole Class Exam */}
          {totalExisting > 0 && (
            <div className="publish-btn-group">
              {!isAllPublished && (
                <button
                  type="button"
                  className="btn btn-publish-live"
                  disabled={togglingPublish}
                  onClick={() => handleTogglePublish(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 18px' }}
                >
                  {togglingPublish ? (
                    <FiRefreshCw className="spin" size={16} />
                  ) : (
                    <FiGlobe size={16} />
                  )}
                  <span>📢 نتائج شائع کریں (Show Results)</span>
                </button>
              )}

              {publishedCount > 0 && (
                <button
                  type="button"
                  className="btn btn-withhold-live"
                  disabled={togglingPublish}
                  onClick={() => handleTogglePublish(false)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 18px' }}
                >
                  {togglingPublish ? (
                    <FiRefreshCw className="spin" size={16} />
                  ) : (
                    <FiLock size={16} />
                  )}
                  <span>🔒 نتائج روکیں (Withhold / Hide)</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'entry' ? (
        <>
          {/* Subjects Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>مضامین ({subjects.length}):</span>
              {subjects.map((sub) => (
                <span
                  key={sub}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: 'var(--color-bg-secondary)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {sub}
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(sub)}
                    title="مضمون ہٹائیں"
                    style={{
                      border: 'none',
                      background: 'none',
                      color: 'var(--color-danger)',
                      cursor: 'pointer',
                      padding: '0 2px',
                      fontSize: '12px',
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: '3px 8px', fontSize: '0.85rem' }}
                onClick={() => setShowAddSubject(!showAddSubject)}
              >
                <FiPlus size={14} style={{ marginLeft: '4px' }} />
                نیا مضمون شامل کریں
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ fontSize: '0.85rem', padding: '4px 10px' }}
                onClick={handleFillAllZero}
                title="تمام خالی خانے 0 سے بھریں"
              >
                خالی خانے 0 کریں
              </button>
            </div>
          </div>

          {/* Add Subject Popover */}
          {showAddSubject && (
            <div className="dash-card" style={{ marginBottom: '16px', padding: '12px 16px', background: '#f8f9fa' }}>
              <form onSubmit={handleAddSubject} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="مضمون کا نام درج کریں (مثلاً: صرف و نحو، اخلاقیات)"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  style={{ maxWidth: '300px' }}
                  autoFocus
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '6px 14px' }}>
                  شامل کریں
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ padding: '6px 14px' }}
                  onClick={() => setShowAddSubject(false)}
                >
                  منسوخ
                </button>
              </form>
            </div>
          )}

          {/* Students Marks Table */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <FiRefreshCw className="spin" size={28} style={{ color: 'var(--color-primary)' }} />
              <p style={{ marginTop: '12px', color: 'var(--color-text-secondary)' }}>طلباء کا ڈیٹا لوڈ ہو رہا ہے...</p>
            </div>
          ) : displayedStudents.length === 0 ? (
            <div className="dash-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              <FiUsers size={36} style={{ opacity: 0.5, marginBottom: '8px' }} />
              <p style={{ fontSize: '1.1rem' }}>
                {studentSearch ? 'تلاش کے مطابق کوئی طالب علم نہیں ملا' : `درجہ "${currentClassName || 'منتخب'}" میں کوئی طالب علم نہیں ملا`}
              </p>
            </div>
          ) : (
            <>
              <div className="table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th style={{ minWidth: '70px', textAlign: 'center' }}>رول نمبر</th>
                      <th style={{ minWidth: '150px' }}>طالب علم کا نام</th>
                      {subjects.map((sub) => (
                        <th key={sub} style={{ minWidth: '90px', textAlign: 'center' }}>
                          {sub}
                          <div style={{ fontSize: '0.75rem', fontWeight: 'normal', opacity: 0.8 }}>(100)</div>
                        </th>
                      ))}
                      <th style={{ minWidth: '90px', textAlign: 'center' }}>حاصل کردہ</th>
                      <th style={{ minWidth: '70px', textAlign: 'center' }}>فیصد</th>
                      <th style={{ minWidth: '90px', textAlign: 'center' }}>گریڈ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedStudents.map((student) => {
                      const stats = calculateRowStats(student._id);
                      return (
                        <tr key={student._id}>
                          <td style={{ fontFamily: 'var(--font-english)', textAlign: 'center', fontWeight: 600 }}>
                            {student.rollNumber}
                          </td>
                          <td>
                            <strong>{student.name}</strong>
                            {student.fatherName && (
                              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                ولدیت: {student.fatherName}
                              </div>
                            )}
                          </td>
                          {subjects.map((sub) => (
                            <td key={sub} style={{ textAlign: 'center' }}>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                style={{
                                  width: '65px',
                                  padding: '6px 4px',
                                  border: '1px solid var(--color-border)',
                                  borderRadius: '4px',
                                  fontFamily: 'var(--font-english)',
                                  textAlign: 'center',
                                  fontWeight: 600,
                                  fontSize: '0.95rem',
                                }}
                                value={results[student._id]?.[sub] ?? ''}
                                onChange={(e) => setMark(student._id, sub, e.target.value)}
                                placeholder="-"
                              />
                            </td>
                          ))}
                          <td style={{ fontFamily: 'var(--font-english)', textAlign: 'center', fontWeight: 700 }}>
                            {stats.totalObtained} / {stats.totalMarks}
                          </td>
                          <td style={{ fontFamily: 'var(--font-english)', textAlign: 'center', fontWeight: 700 }}>
                            {stats.percentage}%
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span
                              className={`badge ${
                                stats.percentage >= 80
                                  ? 'badge-success'
                                  : stats.percentage >= 60
                                  ? 'badge-primary'
                                  : stats.percentage >= 50
                                  ? 'badge-warning'
                                  : 'badge-danger'
                              }`}
                              style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                            >
                              {stats.grade}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Submit Buttons Section */}
              <div
                style={{
                  marginTop: '24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  padding: '16px 20px',
                  backgroundColor: 'var(--color-bg)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                  کل طلباء: <strong style={{ fontFamily: 'var(--font-english)', color: 'var(--color-primary)' }}>{displayedStudents.length}</strong> | 
                  مضامین: <strong style={{ fontFamily: 'var(--font-english)', color: 'var(--color-primary)' }}>{subjects.length}</strong>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {/* Save as Withheld / Draft */}
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => handleSubmit(false)}
                    disabled={saving || displayedStudents.length === 0}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                    }}
                    title="نتائج محفوظ کریں لیکن پبلک پورٹل پر روکے رکھیں"
                  >
                    {saving ? (
                      <>
                        <FiRefreshCw className="spin" size={18} />
                        <span>محفوظ ہو رہا ہے...</span>
                      </>
                    ) : (
                      <>
                        <FiLock size={18} />
                        <span>محفوظ کریں (روکے رکھیں / Withhold)</span>
                      </>
                    )}
                  </button>

                  {/* Save & Publish Live directly */}
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleSubmit(true)}
                    disabled={saving || displayedStudents.length === 0}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 22px',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      backgroundColor: '#10b981',
                      borderColor: '#10b981',
                    }}
                    title="نتائج محفوظ کر کے فوری پبلک رزلٹ پورٹل پر شائع کریں"
                  >
                    {saving ? (
                      <>
                        <FiRefreshCw className="spin" size={18} />
                        <span>شائع ہو رہا ہے...</span>
                      </>
                    ) : (
                      <>
                        <FiGlobe size={18} />
                        <span>محفوظ اور براہِ راست شائع کریں (Publish)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        /* Saved Results Tab */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-primary)' }}>
              درجہ "{currentClassName}" - {examName} کے محفوظ شدہ نتائج ({existingResults.length})
            </h3>

            {existingResults.length > 0 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => handleTogglePublish(true)}
                  disabled={togglingPublish}
                  style={{ color: '#047857', borderColor: '#10b981' }}
                >
                  <FiGlobe style={{ marginLeft: '4px' }} /> تمام شائع کریں
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => handleTogglePublish(false)}
                  disabled={togglingPublish}
                  style={{ color: '#b45309', borderColor: '#f59e0b' }}
                >
                  <FiLock style={{ marginLeft: '4px' }} /> تمام روکیں (Withhold)
                </button>
              </div>
            )}
          </div>

          {existingResults.length === 0 ? (
            <div className="dash-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              <FiAward size={36} style={{ opacity: 0.5, marginBottom: '8px' }} />
              <p>اس درجہ اور امتحان کے لئے فی الحال کوئی نتیجہ محفوظ نہیں ہے</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'center' }}>رول نمبر</th>
                    <th>نام</th>
                    <th>درجہ</th>
                    <th>امتحان</th>
                    <th style={{ textAlign: 'center' }}>مضامین کی تفصیل</th>
                    <th style={{ textAlign: 'center' }}>کل نمبرات</th>
                    <th style={{ textAlign: 'center' }}>فیصد</th>
                    <th style={{ textAlign: 'center' }}>گریڈ</th>
                    <th style={{ textAlign: 'center' }}>اشاعت کی حیثیت</th>
                    <th style={{ textAlign: 'center' }}>کارروائی</th>
                  </tr>
                </thead>
                <tbody>
                  {existingResults.map((item) => {
                    const isItemPublished = item.isPublished === true;
                    return (
                      <tr key={item._id}>
                        <td style={{ fontFamily: 'var(--font-english)', textAlign: 'center', fontWeight: 600 }}>
                          {item.rollNumber}
                        </td>
                        <td>
                          <strong>{item.studentName}</strong>
                          {item.fatherName && <div style={{ fontSize: '0.8rem', color: '#666' }}>ولدیت: {item.fatherName}</div>}
                        </td>
                        <td>{item.className}</td>
                        <td>{item.examName}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {item.marks?.map((m) => (
                              <span
                                key={m.subject}
                                style={{
                                  fontSize: '0.75rem',
                                  background: 'var(--color-bg-secondary)',
                                  padding: '2px 6px',
                                  borderRadius: '3px',
                                  border: '1px solid var(--color-border)',
                                }}
                              >
                                {m.subject}: <strong style={{ fontFamily: 'var(--font-english)' }}>{m.obtainedMarks}</strong>
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-english)', textAlign: 'center', fontWeight: 600 }}>
                          {item.totalObtained} / {item.totalMarks}
                        </td>
                        <td style={{ fontFamily: 'var(--font-english)', textAlign: 'center', fontWeight: 600 }}>
                          {item.percentage}%
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            className={`badge ${
                              item.percentage >= 80
                                ? 'badge-success'
                                : item.percentage >= 60
                                ? 'badge-primary'
                                : item.percentage >= 50
                                ? 'badge-warning'
                                : 'badge-danger'
                            }`}
                          >
                            {item.grade}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {isItemPublished ? (
                            <span className="publish-pill-published" title="طلباء کے لیے پبلک پورٹل پر لائیو ہے">
                              <FiGlobe size={12} /> شائع شدہ
                            </span>
                          ) : (
                            <span className="publish-pill-withheld" title="طلباء کے لیے روکا گیا ہے">
                              <FiLock size={12} /> روکا گیا
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                            {/* Toggle single item */}
                            <button
                              type="button"
                              className="btn btn-sm btn-outline"
                              style={{
                                padding: '3px 8px',
                                fontSize: '0.75rem',
                                color: isItemPublished ? '#b45309' : '#047857',
                                borderColor: isItemPublished ? '#f59e0b' : '#10b981',
                              }}
                              onClick={() => handleTogglePublish(!isItemPublished, [item._id])}
                              title={isItemPublished ? 'نتیجہ روکیں' : 'نتیجہ شائع کریں'}
                            >
                              {isItemPublished ? <FiLock size={12} /> : <FiGlobe size={12} />}
                              <span style={{ marginRight: '3px' }}>{isItemPublished ? 'روکیں' : 'شائع کریں'}</span>
                            </button>

                            <button
                              type="button"
                              className="btn btn-outline"
                              style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)', padding: '4px 8px' }}
                              onClick={() => handleDeleteExisting(item._id, item.studentName)}
                              title="نتیجہ حذف کریں"
                            >
                              <FiTrash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      </>
      )}
    </div>
  );
}

