import { useState } from 'react';
import { MOCK_CLASSES } from '../../data/mockData';
import { submitAdmission } from '../../services/api';
import { FiCheckCircle, FiCopy, FiSend } from 'react-icons/fi';
import './PublicPages.css';

export default function AdmissionPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    studentName: '',
    fatherName: '',
    cnic: '',
    phone: '',
    desiredClass: '',
    previousEducation: '',
    address: '',
    dateOfBirth: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.studentName.trim()) newErrors.studentName = 'نام ضروری ہے';
    if (!form.fatherName.trim()) newErrors.fatherName = 'والد کا نام ضروری ہے';
    if (!form.phone.trim()) newErrors.phone = 'فون نمبر ضروری ہے';
    if (!form.desiredClass) newErrors.desiredClass = 'درجہ منتخب کریں';
    if (!form.dateOfBirth) newErrors.dateOfBirth = 'تاریخ پیدائش ضروری ہے';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await submitAdmission(form);
      if (res.success) {
        setTrackingNumber(res.trackingNumber);
        setShowSuccess(true);
      }
    } catch (err) {
      console.error('Admission submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setForm({
      studentName: '',
      fatherName: '',
      cnic: '',
      phone: '',
      desiredClass: '',
      previousEducation: '',
      address: '',
      dateOfBirth: '',
    });
    setShowSuccess(false);
    setShowForm(false);
    setTrackingNumber('');
    setErrors({});
  };

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>داخلہ</h1>
          <p>نئے طلباء کے لیے داخلہ کی معلومات اور آن لائن درخواست</p>
        </div>
      </div>

      <div className="content-page">
        <div className="container">
          <div className="content-block">
            <h2>داخلہ کی شرائط</h2>
            <p>
              مدرسہ سیدنا صدیق اکبرؓ میں داخلہ کے لیے درج ذیل شرائط کا پورا کرنا ضروری ہے:
            </p>
            <ul style={{ listStyle: 'disc', paddingRight: '24px', marginTop: '8px' }}>
              <li style={{ marginBottom: '8px', color: 'var(--color-text-secondary)' }}>طالب علم مسلمان ہو</li>
              <li style={{ marginBottom: '8px', color: 'var(--color-text-secondary)' }}>ناظرہ کے لیے عمر 5 سال سے زیادہ ہو</li>
              <li style={{ marginBottom: '8px', color: 'var(--color-text-secondary)' }}>حفظ کے لیے ناظرہ مکمل ہو</li>
              <li style={{ marginBottom: '8px', color: 'var(--color-text-secondary)' }}>درجات میں داخلے کے لیے پچھلے درجے کا امتحان پاس ہو</li>
              <li style={{ marginBottom: '8px', color: 'var(--color-text-secondary)' }}>والد یا سرپرست کی شناختی کارڈ کی کاپی</li>
              <li style={{ marginBottom: '8px', color: 'var(--color-text-secondary)' }}>طالب علم کی تصاویر (2 عدد)</li>
            </ul>
          </div>

          <div className="content-block">
            <h2>داخلہ کی تاریخیں</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>تفصیل</th>
                    <th>تاریخ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>داخلہ فارم کی دستیابی</td>
                    <td>یکم شوال 1447 ھ</td>
                  </tr>
                  <tr>
                    <td>داخلہ فارم جمع کرانے کی آخری تاریخ</td>
                    <td>15 شوال 1447 ھ</td>
                  </tr>
                  <tr>
                    <td>داخلہ ٹیسٹ</td>
                    <td>20 شوال 1447 ھ</td>
                  </tr>
                  <tr>
                    <td>نتائج کا اعلان</td>
                    <td>25 شوال 1447 ھ</td>
                  </tr>
                  <tr>
                    <td>کلاسز کا آغاز</td>
                    <td>یکم ذوالقعدہ 1447 ھ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Apply Button */}
          {!showForm && !showSuccess && (
            <div className="admission-apply-banner">
              <div className="admission-apply-content">
                <h3>آن لائن داخلہ درخواست</h3>
                <p>ابھی آن لائن درخواست دیں اور ٹریکنگ نمبر حاصل کریں</p>
              </div>
              <button className="btn btn-accent btn-lg" onClick={() => setShowForm(true)}>
                <FiSend size={18} />
                داخلہ فارم بھریں
              </button>
            </div>
          )}

          {/* Admission Form */}
          {showForm && !showSuccess && (
            <div className="content-block">
              <h2>داخلہ درخواست فارم</h2>
              <div className="donation-form-wrapper">
                <form onSubmit={handleSubmit}>
                  <div className="donation-form-grid">
                    <div className="form-group">
                      <label className="form-label">طالب علم کا نام *</label>
                      <input
                        type="text"
                        className={`form-input ${errors.studentName ? 'form-input-error' : ''}`}
                        placeholder="طالب علم کا مکمل نام"
                        value={form.studentName}
                        onChange={(e) => handleChange('studentName', e.target.value)}
                      />
                      {errors.studentName && <span className="form-error-text">{errors.studentName}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">والد / سرپرست کا نام *</label>
                      <input
                        type="text"
                        className={`form-input ${errors.fatherName ? 'form-input-error' : ''}`}
                        placeholder="والد یا سرپرست کا نام"
                        value={form.fatherName}
                        onChange={(e) => handleChange('fatherName', e.target.value)}
                      />
                      {errors.fatherName && <span className="form-error-text">{errors.fatherName}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">CNIC نمبر</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="والد / سرپرست کا CNIC"
                        value={form.cnic}
                        onChange={(e) => handleChange('cnic', e.target.value)}
                        style={{ direction: 'ltr', textAlign: 'right' }}
                        maxLength="13"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">فون نمبر *</label>
                      <input
                        type="tel"
                        className={`form-input ${errors.phone ? 'form-input-error' : ''}`}
                        placeholder="03001234567"
                        value={form.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        style={{ direction: 'ltr', textAlign: 'right' }}
                      />
                      {errors.phone && <span className="form-error-text">{errors.phone}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">مطلوبہ درجہ *</label>
                      <select
                        className={`form-select ${errors.desiredClass ? 'form-input-error' : ''}`}
                        value={form.desiredClass}
                        onChange={(e) => handleChange('desiredClass', e.target.value)}
                      >
                        <option value="">درجہ منتخب کریں</option>
                        {MOCK_CLASSES.map((c) => (
                          <option key={c._id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                      {errors.desiredClass && <span className="form-error-text">{errors.desiredClass}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">تاریخ پیدائش *</label>
                      <input
                        type="date"
                        className={`form-input ${errors.dateOfBirth ? 'form-input-error' : ''}`}
                        value={form.dateOfBirth}
                        onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                        style={{ direction: 'ltr', textAlign: 'right' }}
                      />
                      {errors.dateOfBirth && <span className="form-error-text">{errors.dateOfBirth}</span>}
                    </div>

                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">پچھلی تعلیم</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="مثلاً ناظرہ مکمل، پرائمری پاس"
                        value={form.previousEducation}
                        onChange={(e) => handleChange('previousEducation', e.target.value)}
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">پتہ</label>
                      <textarea
                        className="form-textarea"
                        placeholder="مکمل پتہ"
                        value={form.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        rows="2"
                        style={{ minHeight: '60px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }}>
                      <FiSend size={18} />
                      درخواست جمع کروائیں
                    </button>
                    <button type="button" className="btn btn-outline btn-lg" onClick={() => setShowForm(false)}>
                      منسوخ
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="content-block">
            <h2>رابطہ</h2>
            <p>
              مزید معلومات کے لیے مدرسہ کے دفتر سے رابطہ کریں:
              <br />
              فون: 0937-123456
              <br />
              پتہ: مردان، خیبر پختونخوا
            </p>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="tracking-success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tracking-success-icon" style={{ color: 'var(--color-success)' }}>
              <FiCheckCircle size={56} />
            </div>
            <h3>درخواست کامیابی سے جمع ہو گئی!</h3>
            <p>آپ کی داخلہ درخواست موصول ہو گئی ہے۔ ایڈمن جائزہ لینے کے بعد فیصلہ کرے گا۔</p>

            <div className="tracking-number-display">
              <span className="tracking-label">ٹریکنگ نمبر</span>
              <div className="tracking-number-box">
                <span className="tracking-number-value">{trackingNumber}</span>
                <button type="button" className="tracking-copy-btn" onClick={handleCopy}>
                  <FiCopy size={16} />
                  {copied ? 'کاپی ہو گیا!' : 'کاپی'}
                </button>
              </div>
            </div>

            <div className="tracking-note">
              <strong>اہم:</strong> یہ ٹریکنگ نمبر محفوظ رکھیں۔ "ٹریکنگ" صفحے پر جا کر اپنی درخواست کی حالت اور قطار میں نمبر چیک کر سکتے ہیں۔
            </div>

            <button className="btn btn-primary" onClick={resetForm} style={{ width: '100%', marginTop: '16px' }}>
              بند کریں
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
