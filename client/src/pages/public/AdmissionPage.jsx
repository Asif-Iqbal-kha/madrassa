import { useState } from 'react';
import { MOCK_CLASSES } from '../../data/mockData';
import { submitAdmission } from '../../services/api';
import {
  FiCheckCircle,
  FiCopy,
  FiSend,
  FiUploadCloud,
  FiFileText,
  FiInfo,
  FiPhone,
  FiMapPin,
  FiCalendar,
} from 'react-icons/fi';
import './PublicPages.css';

export default function AdmissionPage() {
  const [form, setForm] = useState({
    studentName: '',
    fatherName: '',
    cnic: '',
    phone: '',
    desiredClass: '',
    previousEducation: '',
    address: '',
    dateOfBirth: '',
    admissionFee: 1000,
    paymentMethod: 'JazzCash',
    transactionId: '',
  });
  const [paymentProof, setPaymentProof] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
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

  const handleFileChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, paymentProof: 'برائے مہربانی صرف تصویری فائل (JPG یا PNG) منتخب فرمائیں' }));
      return;
    }
    setPaymentProof(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProofPreview(reader.result);
      setErrors((prev) => ({ ...prev, paymentProof: '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.studentName.trim()) newErrors.studentName = 'طالب علم کا نام درج فرمائیں';
    if (!form.fatherName.trim()) newErrors.fatherName = 'والد کا نام درج فرمائیں';
    if (!form.phone.trim()) newErrors.phone = 'رابطہ نمبر درج فرمائیں';
    if (!form.desiredClass) newErrors.desiredClass = 'مطلوبہ درجہ منتخب فرمائیں';
    if (!form.dateOfBirth) newErrors.dateOfBirth = 'تاریخ پیدائش درج فرمائیں';
    if (!form.paymentMethod) newErrors.paymentMethod = 'ادائیگی کا ذریعہ منتخب فرمائیں';
    if (!paymentProof) newErrors.paymentProof = 'رقم منتقلی کی رسید یا اسکرین شاٹ منسلک کرنا لازمی ہے';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        admissionFee: 1000,
        screenshotData: proofPreview || '',
      };
      const res = await submitAdmission(payload, paymentProof);
      if (res.success) {
        setTrackingNumber(res.trackingNumber);
        setShowSuccess(true);
      } else {
        alert(res.message || 'درخواست جمع کرنے میں خرابی ہوئی، براہ کرم دوبارہ کوشش فرمائیں۔');
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
      admissionFee: 1000,
      paymentMethod: 'JazzCash',
      transactionId: '',
    });
    setPaymentProof(null);
    setProofPreview(null);
    setShowSuccess(false);
    setTrackingNumber('');
    setErrors({});
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1>شعبہ داخلہ و رجسٹریشن</h1>
          <p>مدرسہ عربیہ سیدنا صدیق اکبر رضی اللہ تعالیٰ عنہ — آن لائن داخلہ فارم و ہدایات</p>
        </div>
      </div>

      <div className="content-page">
        <div className="container">
          <div className="madrassa-admission-container">
            {/* MAIN COLUMN: The Admission Form directly visible */}
            <div className="admission-form-paper">
              <div className="admission-form-header">
                <div className="admission-form-bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
                <h2 className="admission-form-title">درخواست برائے داخلہ جدید</h2>
                <p className="admission-form-subtitle">
                  طالب علم کے درست کوائف درج فرما کر آن لائن داخلہ فارم ارسال فرمائیں
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* 1. Student Details */}
                <div className="admission-section-divider">
                  <span className="admission-section-title">طالب علم کے کوائف</span>
                  <div className="admission-section-line"></div>
                </div>

                <div className="donation-form-grid">
                  <div className="form-group">
                    <label className="form-label">طالب علم کا مکمل نام *</label>
                    <input
                      type="text"
                      className={`form-input ${errors.studentName ? 'form-input-error' : ''}`}
                      placeholder="طالب علم کا نام"
                      value={form.studentName}
                      onChange={(e) => handleChange('studentName', e.target.value)}
                    />
                    {errors.studentName && <span className="form-error-text">{errors.studentName}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">والد یا سرپرست کا نام *</label>
                    <input
                      type="text"
                      className={`form-input ${errors.fatherName ? 'form-input-error' : ''}`}
                      placeholder="والد محترم کا نام"
                      value={form.fatherName}
                      onChange={(e) => handleChange('fatherName', e.target.value)}
                    />
                    {errors.fatherName && <span className="form-error-text">{errors.fatherName}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">تاریخِ پیدائش *</label>
                    <input
                      type="date"
                      className={`form-input ${errors.dateOfBirth ? 'form-input-error' : ''}`}
                      value={form.dateOfBirth}
                      onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                      style={{ direction: 'ltr', textAlign: 'right' }}
                    />
                    {errors.dateOfBirth && <span className="form-error-text">{errors.dateOfBirth}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">ب فارم / شناختی کارڈ نمبر</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="شناختی کارڈ یا ب فارم نمبر"
                      value={form.cnic}
                      onChange={(e) => handleChange('cnic', e.target.value)}
                      style={{ direction: 'ltr', textAlign: 'right', fontFamily: 'var(--font-english)' }}
                      maxLength="15"
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">سابقہ دینی و عصری تعلیم</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="مثلاً ناظرہ مکمل، پرائمری پاس یا حفظ مکمل"
                      value={form.previousEducation}
                      onChange={(e) => handleChange('previousEducation', e.target.value)}
                    />
                  </div>
                </div>

                {/* 2. Contact & Address */}
                <div className="admission-section-divider">
                  <span className="admission-section-title">رابطہ و رہائش</span>
                  <div className="admission-section-line"></div>
                </div>

                <div className="donation-form-grid">
                  <div className="form-group">
                    <label className="form-label">رابطہ نمبر (واٹس ایپ / موبائل) *</label>
                    <input
                      type="tel"
                      className={`form-input ${errors.phone ? 'form-input-error' : ''}`}
                      placeholder="03001234567"
                      value={form.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      style={{ direction: 'ltr', textAlign: 'right', fontFamily: 'var(--font-english)' }}
                    />
                    {errors.phone && <span className="form-error-text">{errors.phone}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">مطلوبہ درجہ / شعبہ *</label>
                    <select
                      className={`form-select ${errors.desiredClass ? 'form-input-error' : ''}`}
                      value={form.desiredClass}
                      onChange={(e) => handleChange('desiredClass', e.target.value)}
                    >
                      <option value="">درجہ منتخب فرمائیں</option>
                      {MOCK_CLASSES.map((c) => (
                        <option key={c._id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                    {errors.desiredClass && <span className="form-error-text">{errors.desiredClass}</span>}
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">مکمل مستقل پتہ *</label>
                    <textarea
                      className="form-textarea"
                      placeholder="گاؤں / محلہ، ڈاکخانہ، تحصیل و ضلع"
                      value={form.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      rows="2"
                      style={{ minHeight: '55px' }}
                    />
                  </div>
                </div>

                {/* 3. Modest Processing Fee & Proof Section */}
                <div className="admission-section-divider">
                  <span className="admission-section-title">داخلہ پروسیسنگ فیس و رسید</span>
                  <div className="admission-section-line"></div>
                </div>

                <div className="admission-payment-modest-box">
                  <p style={{ margin: '0 0 12px', fontSize: '0.86rem', color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
                    درخواست کے دفتری اندراج و کارروائی کے لیے فیس مبلغ <strong>1,000 روپے</strong> مختص ہے۔ رقم مدرسہ کے اکاؤنٹ میں جمع کروا کر رسید کا عکس منسلک فرمائیں۔
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">فیس کی رقم</label>
                      <input
                        type="text"
                        className="form-input"
                        value="1,000 روپے"
                        readOnly
                        disabled
                        style={{ background: '#FFFFFF', fontWeight: 600, color: 'var(--color-text)' }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">ادائیگی کا ذریعہ *</label>
                      <select
                        className={`form-select ${errors.paymentMethod ? 'form-input-error' : ''}`}
                        value={form.paymentMethod}
                        onChange={(e) => handleChange('paymentMethod', e.target.value)}
                      >
                        <option value="JazzCash">JazzCash (0315-3044992)</option>
                        <option value="EasyPaisa">EasyPaisa (0315-3044992)</option>
                        <option value="بینک ٹرانسفر">بینک ٹرانسفر (میزان بینک)</option>
                      </select>
                      {errors.paymentMethod && <span className="form-error-text">{errors.paymentMethod}</span>}
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">ٹرانزیکشن ID / حوالہ نمبر (اگر ہو)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="اختیاری"
                        value={form.transactionId}
                        onChange={(e) => handleChange('transactionId', e.target.value)}
                        style={{ direction: 'ltr', textAlign: 'right', fontFamily: 'var(--font-english)' }}
                      />
                    </div>
                  </div>

                  {/* Payment Receipt Upload Box */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">
                      رقم منتقلی کا تصدیقی ثبوت (رسید یا اسکرین شاٹ) *
                    </label>
                    <div
                      className={`file-upload-area ${errors.paymentProof ? 'file-upload-error' : ''} ${proofPreview ? 'file-upload-has-file' : ''}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('proof-input').click()}
                      style={{ padding: '20px', minHeight: '110px' }}
                    >
                      {proofPreview ? (
                        <div className="file-upload-preview" style={{ textAlign: 'center' }}>
                          <img
                            src={proofPreview}
                            alt="رسید"
                            style={{ maxHeight: '140px', maxWidth: '100%', borderRadius: '4px', objectFit: 'contain' }}
                          />
                          <div style={{ marginTop: '8px' }}>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPaymentProof(null);
                                setProofPreview(null);
                              }}
                              style={{ fontSize: '0.75rem', padding: '3px 10px' }}
                            >
                              تصویر تبدیل کریں
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="file-upload-placeholder" style={{ padding: '10px 0' }}>
                          <FiUploadCloud size={30} style={{ color: 'var(--color-text-muted)', marginBottom: '6px' }} />
                          <p style={{ margin: '0 0 2px', fontSize: '0.88rem', fontWeight: 600 }}>
                            رسید کا اسکرین شاٹ منتخب کرنے کے لیے یہاں کلک کریں
                          </p>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            معاون فائل: JPG یا PNG تصویر
                          </span>
                        </div>
                      )}
                      <input
                        id="proof-input"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e.target.files[0])}
                        style={{ display: 'none' }}
                      />
                    </div>
                    {errors.paymentProof && (
                      <span className="form-error-text" style={{ marginTop: '6px' }}>
                        {errors.paymentProof}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: '22px' }}>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%' }}
                    disabled={submitting}
                  >
                    <FiSend size={16} />
                    {submitting ? 'درخواست ارسال ہو رہی ہے...' : 'درخواستِ داخلہ جمع فرمائیں'}
                  </button>
                </div>
              </form>
            </div>

            {/* SIDEBAR: Modest Rules, Bank Details & Important Dates */}
            <div className="admission-sidebar">
              {/* Rules & Guidelines */}
              <div className="admission-sidebar-card">
                <h3 className="admission-sidebar-title">شرائط و ہدایاتِ داخلہ</h3>
                <ul className="admission-rules-list">
                  <li>طالب علم کا مسلمان اور صحیح العقیدہ ہونا لازمی ہے۔</li>
                  <li>شعبہ ناظرہ کے لیے کم از کم عمر 5 سال ہونی چاہیے۔</li>
                  <li>شعبہ حفظ کے لیے ناظرہ قرآن مع تجوید مکمل ہونا ضروری ہے۔</li>
                  <li>درجاتِ کتب کے لیے پچھلے درجے کی سند یا کشف الدرجات لازم ہے۔</li>
                  <li>داخلہ فارم کے ہمراہ فیس 1,000 روپے کی رسید منسلک فرمائیں۔</li>
                  <li>ٹیسٹ و انٹرویو کے وقت سرپرست کا شناختی کارڈ اور 2 تصاویر ہمراہ لائیں۔</li>
                </ul>
              </div>

              {/* Bank & Payment Accounts */}
              <div className="admission-sidebar-card">
                <h3 className="admission-sidebar-title">فیس ادائیگی کے اکاؤنٹس</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: '0 0 10px', lineHeight: '1.6' }}>
                  داخلہ فیس (1,000 روپے) درج ذیل اکاؤنٹ میں منتقل فرما سکتے ہیں:
                </p>

                <div className="admission-account-row">
                  <div>
                    <strong>JazzCash:</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>مدرسہ عربیہ سیدنا صدیق اکبر</div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-english)', fontWeight: 600, direction: 'ltr' }}>0315-3044992</span>
                </div>

                <div className="admission-account-row">
                  <div>
                    <strong>EasyPaisa:</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>مدرسہ عربیہ سیدنا صدیق اکبر</div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-english)', fontWeight: 600, direction: 'ltr' }}>0315-3044992</span>
                </div>

                <div className="admission-account-row">
                  <div>
                    <strong>میزان بینک (Meezan):</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>جامعہ عربیہ صدیق اکبر</div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-english)', fontSize: '0.78rem', fontWeight: 600, direction: 'ltr' }}>PK12MEZN0012345678</span>
                </div>
              </div>

              {/* Admission Schedule */}
              <div className="admission-sidebar-card">
                <h3 className="admission-sidebar-title">داخلہ شیڈول</h3>
                <div style={{ fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #eee' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>فارم کی وصولی:</span>
                    <span>یکم شوال تا 15 شوال</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #eee' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>ٹیسٹ و انٹرویو:</span>
                    <span>20 شوال</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #eee' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>نتائج کا اعلان:</span>
                    <span>25 شوال</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>تعلیمی آغاز:</span>
                    <span>یکم ذوالقعدہ</span>
                  </div>
                </div>
              </div>

              {/* Contact & Support */}
              <div className="admission-sidebar-card">
                <h3 className="admission-sidebar-title">دفتری رہنمائی و رابطہ</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <FiPhone size={14} style={{ color: 'var(--color-primary)' }} />
                    <a href="tel:03153044992" style={{ fontFamily: 'var(--font-english)', direction: 'ltr', color: 'inherit' }}>
                      0315 3044992
                    </a>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <FiMapPin size={14} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '4px' }} />
                    <span>توحید کالونی، چارسدہ روڈ، مردان، خیبر پختونخوا</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modest Success Confirmation Modal */}
      {showSuccess && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="tracking-success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tracking-success-icon" style={{ color: 'var(--color-success)' }}>
              <FiCheckCircle size={52} />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.3rem' }}>درخواستِ داخلہ موصول ہو گئی</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
              آپ کی درخواست اور داخلہ فیس رسید کا اندراج ہو چکا ہے۔ مدرسہ انتظامیہ جانچ پڑتال کے بعد ٹیسٹ کی تاریخ سے مطلع فرمائے گی۔
            </p>

            <div className="tracking-number-display" style={{ margin: '16px 0' }}>
              <span className="tracking-label">درخواست کا ٹریکنگ نمبر</span>
              <div className="tracking-number-box">
                <span className="tracking-number-value">{trackingNumber}</span>
                <button type="button" className="tracking-copy-btn" onClick={handleCopy}>
                  <FiCopy size={15} />
                  {copied ? 'کاپی ہو گیا' : 'کاپی'}
                </button>
              </div>
            </div>

            <div className="tracking-note" style={{ fontSize: '0.82rem', lineHeight: '1.7' }}>
              <strong>نوٹ:</strong> اس ٹریکنگ نمبر کو محفوظ فرمائیں۔ ویب سائٹ کے "ٹریکنگ" صفحے پر جا کر آپ کسی بھی وقت اپنی درخواست کی صورتحال معلوم کر سکتے ہیں۔
            </div>

            <button className="btn btn-primary" onClick={resetForm} style={{ width: '100%', marginTop: '16px' }}>
              مکمل
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
