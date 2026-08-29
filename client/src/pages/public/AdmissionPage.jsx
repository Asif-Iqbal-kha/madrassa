import { useState, useRef } from 'react';
import { MOCK_CLASSES } from '../../data/mockData';
import { submitAdmission } from '../../services/api';
import {
  FiCheckCircle,
  FiCopy,
  FiSend,
  FiUploadCloud,
  FiPrinter,
  FiPhone,
  FiMapPin,
  FiCamera,
  FiCheck,
} from 'react-icons/fi';
import './PublicPages.css';

export default function AdmissionPage() {
  const [form, setForm] = useState({
    studentName: '',
    fatherName: '',
    dateOfBirth: '',
    identificationMark: '',
    maritalStatus: 'مجرد',
    permanentAddress: '',
    currentAddress: '',
    cnic: '',
    phone: '',
    desiredClass: 'حفظ قرآن کریم',
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
    transactionId: '',
  });

  const [studentPhoto, setStudentPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [paymentProof, setPaymentProof] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [agreePledge, setAgreePledge] = useState(true);
  const [showPledgeDetails, setShowPledgeDetails] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const photoInputRef = useRef(null);
  const proofInputRef = useRef(null);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handlePhotoChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('برائے مہربانی صرف تصویر (JPG یا PNG) منتخب فرمائیں');
      return;
    }
    setStudentPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleProofChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, paymentProof: 'برائے مہربانی صرف تصویری فائل منتخب فرمائیں' }));
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

  const validate = () => {
    const newErrors = {};
    if (!form.studentName.trim()) newErrors.studentName = 'طالب علم کا نام درج فرمائیں';
    if (!form.fatherName.trim()) newErrors.fatherName = 'والد کا نام درج فرمائیں';
    if (!form.phone.trim()) newErrors.phone = 'رابطہ نمبر درج فرمائیں';
    if (!form.desiredClass) newErrors.desiredClass = 'مطلوبہ درجہ منتخب فرمائیں';
    if (!form.dateOfBirth) newErrors.dateOfBirth = 'تاریخ پیدائش درج فرمائیں';
    if (!paymentProof) newErrors.paymentProof = 'رقم منتقلی کی رسید یا اسکرین شاٹ منسلک کرنا لازمی ہے';
    if (!agreePledge) newErrors.agreePledge = 'جامعہ کے قواعد و ضوابط اور عہد نامہ کی توثیق لازمی ہے';
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
        address: form.currentAddress || form.permanentAddress || '',
        admissionFee: 1000,
        screenshotData: proofPreview || '',
        studentPhotoData: photoPreview || '',
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

  const handlePrint = () => {
    window.print();
  };

  const resetForm = () => {
    setForm({
      studentName: '',
      fatherName: '',
      dateOfBirth: '',
      identificationMark: '',
      maritalStatus: 'مجرد',
      permanentAddress: '',
      currentAddress: '',
      cnic: '',
      phone: '',
      desiredClass: 'حفظ قرآن کریم',
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
      transactionId: '',
    });
    setStudentPhoto(null);
    setPhotoPreview(null);
    setPaymentProof(null);
    setProofPreview(null);
    setShowSuccess(false);
    setTrackingNumber('');
    setErrors({});
  };

  const currentDate = new Date().toISOString().split('T')[0];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header no-print">
        <div className="container">
          <h1>داخلہ فارم</h1>
          <p>مدرسہ عربیہ سیدنا صدیق اکبر رضی اللہ تعالیٰ عنہ — تعلیمی سال 1447-1448ھ / 2026ء</p>
        </div>
      </div>

      <div className="content-page">
        <div className="container">
          <div className="madrassa-admission-container">
            {/* MAIN COLUMN: EXACT REPLICA OF THE OFFICIAL PHYSICAL ADMISSION FORM */}
            <div className="official-admission-sheet">
              {/* Form Top Header */}
              <div className="sheet-top-header">
                {/* Photo Upload Box (Left) */}
                <div
                  className="sheet-photo-box"
                  onClick={() => photoInputRef.current && photoInputRef.current.click()}
                  title="طالب علم کی تازہ تصویر اپلوڈ کرنے کے لیے کلک کریں"
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="طالب علم کی تصویر" />
                  ) : (
                    <div className="sheet-photo-placeholder">
                      <FiCamera size={22} style={{ marginBottom: '4px', color: '#6b7280' }} />
                      <div>یہاں پر</div>
                      <div style={{ fontWeight: 700 }}>تازہ تصویر</div>
                      <div>لگائیں</div>
                    </div>
                  )}
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoChange(e.target.files[0])}
                    style={{ display: 'none' }}
                  />
                </div>

                {/* Center Title & Madrassa Info */}
                <div className="sheet-header-center">
                  <h1 className="sheet-title-main">داخلہ فارم</h1>
                  <h2 className="sheet-madrassa-name">مدرسہ عربیہ سیدنا صدیق اکبر رضی اللہ تعالیٰ عنہ</h2>
                  <p className="sheet-madrassa-location">صدیق اکبر کالونی نزد توحید کالونی چارسدہ روڈ مردان</p>
                  <div className="sheet-class-badge">
                    <span>برائے درجہ: </span>
                    <select
                      value={form.desiredClass}
                      onChange={(e) => handleChange('desiredClass', e.target.value)}
                      style={{
                        background: 'transparent',
                        color: '#fff',
                        border: 'none',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        outline: 'none',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      <option value="حفظ قرآن کریم" style={{ color: '#000' }}>حفظ قرآن کریم</option>
                      <option value="ناظرہ قرآن کریم" style={{ color: '#000' }}>ناظرہ قرآن کریم</option>
                      <option value="درجہ اولیٰ" style={{ color: '#000' }}>درجہ اولیٰ (عامہ سال اول)</option>
                      <option value="درجہ ثانیہ" style={{ color: '#000' }}>درجہ ثانیہ (عامہ سال دوم)</option>
                      <option value="درجہ ثالثہ" style={{ color: '#000' }}>درجہ ثالثہ (خاصہ سال اول)</option>
                      <option value="درجہ رابعہ" style={{ color: '#000' }}>درجہ رابعہ (خاصہ سال دوم)</option>
                      <option value="تجوید و قرأت" style={{ color: '#000' }}>تجوید و قرأت</option>
                    </select>
                  </div>
                </div>

                {/* Madrassa Logo (Right) */}
                <div className="sheet-logo-box">
                  <img src="./logo.png" alt="جامعہ لوگو" />
                </div>
              </div>

              {/* FORM FIELDS */}
              <form onSubmit={handleSubmit}>
                {/* SECTION 1: STUDENT INFORMATION */}
                <div style={{ textAlign: 'right' }}>
                  <div className="sheet-section-pill">طالب علم کی معلومات</div>
                </div>

                {/* Row 1: Form No & Date */}
                <div className="sheet-form-row">
                  <div className="sheet-field-half">
                    <span className="sheet-label">فارم نمبر:</span>
                    <input
                      type="text"
                      className="sheet-input-dotted"
                      value="ADM-2026-AUTO"
                      readOnly
                      disabled
                      style={{ color: '#6b7280', fontFamily: 'var(--font-english)' }}
                    />
                  </div>
                  <div className="sheet-field-half">
                    <span className="sheet-label">تاریخ:</span>
                    <input
                      type="text"
                      className="sheet-input-dotted"
                      value={currentDate}
                      readOnly
                      disabled
                      style={{ direction: 'ltr', textAlign: 'right', fontFamily: 'var(--font-english)' }}
                    />
                  </div>
                </div>

                {/* Row 2: Admission No & Code No (Office Record) */}
                <div className="sheet-form-row">
                  <div className="sheet-field-half">
                    <span className="sheet-label">داخلہ نمبر:</span>
                    <input
                      type="text"
                      className="sheet-input-dotted"
                      placeholder="(برائے دفتری ریکارڈ)"
                      readOnly
                      disabled
                      style={{ color: '#9ca3af' }}
                    />
                  </div>
                  <div className="sheet-field-half">
                    <span className="sheet-label">کوڈ نمبر:</span>
                    <input
                      type="text"
                      className="sheet-input-dotted"
                      placeholder="(برائے دفتری ریکارڈ)"
                      readOnly
                      disabled
                      style={{ color: '#9ca3af' }}
                    />
                  </div>
                </div>

                {/* Row 3: Name & Father Name */}
                <div className="sheet-form-row">
                  <div className="sheet-field-half">
                    <span className="sheet-label">نام: *</span>
                    <input
                      type="text"
                      className={`sheet-input-dotted ${errors.studentName ? 'sheet-input-error' : ''}`}
                      placeholder="طالب علم کا مکمل نام درج کریں"
                      value={form.studentName}
                      onChange={(e) => handleChange('studentName', e.target.value)}
                    />
                  </div>
                  <div className="sheet-field-half">
                    <span className="sheet-label">ولدیت: *</span>
                    <input
                      type="text"
                      className={`sheet-input-dotted ${errors.fatherName ? 'sheet-input-error' : ''}`}
                      placeholder="والد محترم کا نام درج کریں"
                      value={form.fatherName}
                      onChange={(e) => handleChange('fatherName', e.target.value)}
                    />
                  </div>
                </div>

                {/* Row 4: Date of Birth, ID Mark & Marital Status */}
                <div className="sheet-form-row">
                  <div className="sheet-field-half" style={{ flex: '1.2' }}>
                    <span className="sheet-label">تاریخِ پیدائش: *</span>
                    <input
                      type="date"
                      className={`sheet-input-dotted ${errors.dateOfBirth ? 'sheet-input-error' : ''}`}
                      value={form.dateOfBirth}
                      onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                      style={{ direction: 'ltr', textAlign: 'right' }}
                    />
                  </div>
                  <div className="sheet-field-half">
                    <span className="sheet-label">شناختی علامت:</span>
                    <input
                      type="text"
                      className="sheet-input-dotted"
                      placeholder="چہرے یا ہاتھ پر کوئی علامت"
                      value={form.identificationMark}
                      onChange={(e) => handleChange('identificationMark', e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="sheet-label">حالت:</span>
                    <select
                      value={form.maritalStatus}
                      onChange={(e) => handleChange('maritalStatus', e.target.value)}
                      style={{
                        border: 'none',
                        borderBottom: '1px dotted #374151',
                        background: 'transparent',
                        padding: '4px',
                        outline: 'none',
                        fontSize: '0.88rem',
                      }}
                    >
                      <option value="مجرد">مجرد (غیر شادی شدہ)</option>
                      <option value="متزوج">متزوج (شادی شدہ)</option>
                    </select>
                  </div>
                </div>

                {/* Row 5: Permanent Address */}
                <div className="sheet-form-row">
                  <div className="sheet-field-full">
                    <span className="sheet-label">مستقل پتہ: *</span>
                    <input
                      type="text"
                      className="sheet-input-dotted"
                      placeholder="گاؤں / محلہ، ڈاکخانہ، تحصیل و ضلع"
                      value={form.permanentAddress}
                      onChange={(e) => handleChange('permanentAddress', e.target.value)}
                    />
                  </div>
                </div>

                {/* Row 6: Present Address */}
                <div className="sheet-form-row">
                  <div className="sheet-field-full">
                    <span className="sheet-label">موجودہ پتہ:</span>
                    <input
                      type="text"
                      className="sheet-input-dotted"
                      placeholder="موجودہ رہائش کا پتہ (اگر مستقل سے مختلف ہو)"
                      value={form.currentAddress}
                      onChange={(e) => handleChange('currentAddress', e.target.value)}
                    />
                  </div>
                </div>

                {/* Row 7: CNIC & Phone */}
                <div className="sheet-form-row">
                  <div className="sheet-field-half" style={{ flex: 1.3 }}>
                    <span className="sheet-label">طالب علم کا قومی شناختی کارڈ / ب فارم:</span>
                    <input
                      type="text"
                      className="sheet-input-dotted"
                      placeholder="12345-1234567-1"
                      value={form.cnic}
                      onChange={(e) => handleChange('cnic', e.target.value)}
                      style={{ direction: 'ltr', textAlign: 'right', fontFamily: 'var(--font-english)' }}
                      maxLength="15"
                    />
                  </div>
                  <div className="sheet-field-half">
                    <span className="sheet-label">رابطہ کیلئے فون نمبر: *</span>
                    <input
                      type="tel"
                      className={`sheet-input-dotted ${errors.phone ? 'sheet-input-error' : ''}`}
                      placeholder="03001234567"
                      value={form.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      style={{ direction: 'ltr', textAlign: 'right', fontFamily: 'var(--font-english)' }}
                    />
                  </div>
                </div>

                {/* Previous Education */}
                <div className="sheet-form-row">
                  <div className="sheet-field-full">
                    <span className="sheet-label">سابقہ تعلیم:</span>
                    <input
                      type="text"
                      className="sheet-input-dotted"
                      placeholder="مثلاً ناظرہ مکمل، پرائمری پاس یا حفظ مکمل مع مدرسہ کا نام"
                      value={form.previousEducation}
                      onChange={(e) => handleChange('previousEducation', e.target.value)}
                    />
                  </div>
                </div>

                {/* SECTION 2: GUARDIAN INFORMATION */}
                <div style={{ textAlign: 'right', marginTop: '10px' }}>
                  <div className="sheet-section-pill">سرپرست کی معلومات</div>
                </div>

                {/* Row 1: Guardian Name, Father Name & Relation */}
                <div className="sheet-form-row">
                  <div className="sheet-field-half">
                    <span className="sheet-label">سرپرست کا نام:</span>
                    <input
                      type="text"
                      className="sheet-input-dotted"
                      placeholder="سرپرست کا نام"
                      value={form.guardianName}
                      onChange={(e) => handleChange('guardianName', e.target.value)}
                    />
                  </div>
                  <div className="sheet-field-half">
                    <span className="sheet-label">ولدیت:</span>
                    <input
                      type="text"
                      className="sheet-input-dotted"
                      placeholder="سرپرست کے والد کا نام"
                      value={form.guardianFatherName}
                      onChange={(e) => handleChange('guardianFatherName', e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span className="sheet-label">امیدوار سے رشتہ:</span>
                    <select
                      value={form.guardianRelation}
                      onChange={(e) => handleChange('guardianRelation', e.target.value)}
                      style={{
                        border: 'none',
                        borderBottom: '1px dotted #374151',
                        background: 'transparent',
                        padding: '4px',
                        outline: 'none',
                        fontSize: '0.88rem',
                      }}
                    >
                      <option value="والد">والد</option>
                      <option value="چچا">چچا</option>
                      <option value="دادا">دادا</option>
                      <option value="بڑا بھائی">بڑا بھائی</option>
                      <option value="ماموں">ماموں</option>
                    </select>
                  </div>
                </div>

                {/* Row 2: Guardian Phone & CNIC */}
                <div className="sheet-form-row">
                  <div className="sheet-field-half">
                    <span className="sheet-label">سرپرست کا فون نمبر:</span>
                    <input
                      type="tel"
                      className="sheet-input-dotted"
                      placeholder="03001234567"
                      value={form.guardianPhone}
                      onChange={(e) => handleChange('guardianPhone', e.target.value)}
                      style={{ direction: 'ltr', textAlign: 'right', fontFamily: 'var(--font-english)' }}
                    />
                  </div>
                  <div className="sheet-field-half">
                    <span className="sheet-label">شناختی کارڈ نمبر:</span>
                    <input
                      type="text"
                      className="sheet-input-dotted"
                      placeholder="12345-1234567-1"
                      value={form.guardianCnic}
                      onChange={(e) => handleChange('guardianCnic', e.target.value)}
                      style={{ direction: 'ltr', textAlign: 'right', fontFamily: 'var(--font-english)' }}
                      maxLength="15"
                    />
                  </div>
                </div>

                {/* Row 3: Guardian Permanent Address */}
                <div className="sheet-form-row">
                  <div className="sheet-field-full">
                    <span className="sheet-label">سرپرست کا مستقل پتہ:</span>
                    <input
                      type="text"
                      className="sheet-input-dotted"
                      placeholder="مکمل مستقل پتہ"
                      value={form.guardianPermanentAddress}
                      onChange={(e) => handleChange('guardianPermanentAddress', e.target.value)}
                    />
                  </div>
                </div>

                {/* Row 4: Guardian Present Address */}
                <div className="sheet-form-row">
                  <div className="sheet-field-full">
                    <span className="sheet-label">سرپرست کا موجودہ پتہ:</span>
                    <input
                      type="text"
                      className="sheet-input-dotted"
                      placeholder="مکمل موجودہ پتہ"
                      value={form.guardianCurrentAddress}
                      onChange={(e) => handleChange('guardianCurrentAddress', e.target.value)}
                    />
                  </div>
                </div>

                {/* Row 5: Relative in Mardan */}
                <div className="sheet-form-row">
                  <div className="sheet-field-full">
                    <span className="sheet-label">مردان میں قریبی رشتہ دار؟</span>
                    <input
                      type="text"
                      className="sheet-input-dotted"
                      placeholder="اس کا نام، پتہ اور فون نمبر درج فرمائیں"
                      value={form.mardanRelative}
                      onChange={(e) => handleChange('mardanRelative', e.target.value)}
                    />
                  </div>
                </div>

                {/* Guardian Instruction Footnote */}
                <p
                  style={{
                    fontSize: '0.78rem',
                    color: '#6b7280',
                    textAlign: 'center',
                    lineHeight: '1.6',
                    marginTop: '8px',
                    marginBottom: '16px',
                    padding: '6px 12px',
                    background: '#f9fafb',
                    borderRadius: '4px',
                  }}
                >
                  <strong>نوٹ:</strong> سرپرست سے مراد والد، چچا، دادا، بڑا بھائی اور ماموں ہیں جن کی نگرانی اور سرپرستی میں آپ مدرسے میں ہیں اور بوقتِ ضرورت جامعہ کو ان سے رابطہ کرنا ہے۔ محرم رشتہ دار کے علاوہ کسی اور کو سرپرست وغیرہ بطور سرپرست نہ لکھیں۔
                </p>

                {/* SECTION 3: EXAMINERS EVALUATION TABLE (Exact replica from the bottom of physical form) */}
                <div style={{ textAlign: 'right', marginTop: '10px' }}>
                  <div className="sheet-section-pill">برائے ممتحنین (امتحانی و دفتری ریکارڈ)</div>
                </div>

                <table className="examiners-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40%' }}>عنوان</th>
                      <th style={{ width: '30%' }}>کل نمبر</th>
                      <th style={{ width: '30%' }}>حاصل کردہ نمبر</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>ناظرہ</td>
                      <td style={{ fontFamily: 'var(--font-english)' }}>40</td>
                      <td style={{ color: '#9ca3af' }}>(بوقتِ انٹرویو)</td>
                    </tr>
                    <tr>
                      <td>تلفظ</td>
                      <td style={{ fontFamily: 'var(--font-english)' }}>10</td>
                      <td style={{ color: '#9ca3af' }}>(بوقتِ انٹرویو)</td>
                    </tr>
                    <tr>
                      <td>پرائمری</td>
                      <td style={{ fontFamily: 'var(--font-english)' }}>50</td>
                      <td style={{ color: '#9ca3af' }}>(بوقتِ انٹرویو)</td>
                    </tr>
                    <tr style={{ background: '#f9fafb', fontWeight: 700 }}>
                      <td>کل میزان</td>
                      <td style={{ fontFamily: 'var(--font-english)' }}>100</td>
                      <td>—</td>
                    </tr>
                  </tbody>
                </table>

                {/* Examiner Signature Lines (Office Use) */}
                <div className="examiners-signatures-grid">
                  <div className="examiners-sig-item">
                    <span>ممتحن کی رائے:</span>
                    <div className="examiners-sig-line"></div>
                  </div>
                  <div className="examiners-sig-item">
                    <span>تجویز کا نام:</span>
                    <div className="examiners-sig-line"></div>
                  </div>
                  <div className="examiners-sig-item">
                    <span>ممتحن کے دستخط:</span>
                    <div className="examiners-sig-line"></div>
                  </div>
                  <div className="examiners-sig-item">
                    <span>تجویز کی رائے:</span>
                    <div className="examiners-sig-line"></div>
                  </div>
                  <div className="examiners-sig-item">
                    <span>دستخط ناظم مہتمم:</span>
                    <div className="examiners-sig-line"></div>
                  </div>
                  <div className="examiners-sig-item">
                    <span>تجویز کے دستخط:</span>
                    <div className="examiners-sig-line"></div>
                  </div>
                  <div className="examiners-sig-item">
                    <span>دستخط ناظم تعلیمات:</span>
                    <div className="examiners-sig-line"></div>
                  </div>
                  <div className="examiners-sig-item">
                    <span>تاریخِ داخلہ:</span>
                    <div className="examiners-sig-line"></div>
                  </div>
                </div>

                {/* SECTION 4: ADMISSION FEE & PAYMENT PROOF (MODEST & PROFESSIONAL) */}
                <div style={{ textAlign: 'right', marginTop: '16px' }}>
                  <div className="sheet-section-pill">داخلہ فیس و رقم منتقلی کی رسید</div>
                </div>

                <div className="sheet-fee-box">
                  <p style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#4b5563', lineHeight: '1.7' }}>
                    داخلہ فارم کی پروسیسنگ و دفتری اندراج کے لیے فیس مبلغ <strong>1,000 روپے</strong> مختص ہے۔ رقم مدرسہ کے اکاؤنٹ (JazzCash / EasyPaisa: 0315-3044992 یا میزان بینک) میں جمع کروا کر رسید کا عکس لازمی منسلک فرمائیں۔
                  </p>

                  <div className="sheet-form-row" style={{ marginBottom: '10px' }}>
                    <div className="sheet-field-half">
                      <span className="sheet-label">مقررہ فیس:</span>
                      <input
                        type="text"
                        className="sheet-input-dotted"
                        value="1,000 روپے"
                        readOnly
                        disabled
                        style={{ color: '#143223', fontWeight: 700 }}
                      />
                    </div>
                    <div className="sheet-field-half">
                      <span className="sheet-label">ادائیگی کا ذریعہ: *</span>
                      <select
                        value={form.paymentMethod}
                        onChange={(e) => handleChange('paymentMethod', e.target.value)}
                        style={{
                          border: 'none',
                          borderBottom: '1px dotted #374151',
                          background: 'transparent',
                          padding: '4px',
                          outline: 'none',
                          fontSize: '0.88rem',
                          flex: 1,
                        }}
                      >
                        <option value="JazzCash">JazzCash (0315-3044992)</option>
                        <option value="EasyPaisa">EasyPaisa (0315-3044992)</option>
                        <option value="بینک ٹرانسفر">بینک ٹرانسفر (میزان بینک: PK12MEZN0012345678)</option>
                      </select>
                    </div>
                  </div>

                  <div className="sheet-form-row">
                    <div className="sheet-field-full">
                      <span className="sheet-label">ٹرانزیکشن ID / حوالہ نمبر (اگر ہو):</span>
                      <input
                        type="text"
                        className="sheet-input-dotted"
                        placeholder="اختیاری"
                        value={form.transactionId}
                        onChange={(e) => handleChange('transactionId', e.target.value)}
                        style={{ direction: 'ltr', textAlign: 'right', fontFamily: 'var(--font-english)' }}
                      />
                    </div>
                  </div>

                  {/* Payment Receipt Upload Box */}
                  <div style={{ marginTop: '12px' }}>
                    <span className="sheet-label" style={{ display: 'block', marginBottom: '6px' }}>
                      رقم منتقلی کا تصدیقی ثبوت (رسید یا اسکرین شاٹ) *
                    </span>
                    <div
                      className={`file-upload-area ${errors.paymentProof ? 'file-upload-error' : ''} ${proofPreview ? 'file-upload-has-file' : ''}`}
                      onClick={() => proofInputRef.current && proofInputRef.current.click()}
                      style={{ padding: '16px', minHeight: '95px' }}
                    >
                      {proofPreview ? (
                        <div className="file-upload-preview" style={{ textAlign: 'center' }}>
                          <img
                            src={proofPreview}
                            alt="رسید"
                            style={{ maxHeight: '130px', maxWidth: '100%', borderRadius: '4px', objectFit: 'contain' }}
                          />
                          <div style={{ marginTop: '6px' }}>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPaymentProof(null);
                                setProofPreview(null);
                              }}
                              style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                            >
                              رسید تبدیل کریں
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="file-upload-placeholder" style={{ padding: '6px 0' }}>
                          <FiUploadCloud size={28} style={{ color: '#6b7280', marginBottom: '4px' }} />
                          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>
                            رسید کی تصویر منتخب کرنے کے لیے یہاں کلک کریں
                          </p>
                          <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                            (معاون فائل: JPG یا PNG)
                          </span>
                        </div>
                      )}
                      <input
                        ref={proofInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleProofChange(e.target.files[0])}
                        style={{ display: 'none' }}
                      />
                    </div>
                    {errors.paymentProof && (
                      <span className="form-error-text" style={{ marginTop: '4px' }}>
                        {errors.paymentProof}
                      </span>
                    )}
                  </div>
                </div>

                {/* SECTION 5: PLEDGE & CODE OF CONDUCT (Exact from Page 2 of official form) */}
                <div className="pledge-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, color: '#143223', fontSize: '0.95rem', fontWeight: 700 }}>
                      عہد نامہ از طالب علم و سرپرست (مختصر قواعد و ضوابط)
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowPledgeDetails(!showPledgeDetails)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#143223',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                      }}
                    >
                      {showPledgeDetails ? 'مختصر کریں ▲' : 'مکمل 16 نکات پڑھیں ▼'}
                    </button>
                  </div>

                  {showPledgeDetails ? (
                    <ol className="pledge-list">
                      <li>جامعہ کے تمام اصول و ضوابط اور وُقتاً فوقتاً جاری ہونے والی ہدایات کی پابندی کروں گا۔</li>
                      <li>تمام احکاماتِ شرعیہ کی پابندی کروں گا، بالخصوص نماز باجماعت کا اہتمام کروں گا اور محرماتِ شرعیہ سے اجتناب کروں گا۔</li>
                      <li>اپنی وضع قطع علماء و صلحاء کے مطابق رکھوں گا، بالخصوص ڈاڑھی منڈوانے یا ایک مشت سے کم ترشوانے سے اجتناب کروں گا۔</li>
                      <li>حصولِ تعلیم اور اصلاحِ اعمال و اخلاق پر توجہ مرکوز رکھوں گا، اور سیاسی سرگرمیوں سے کلی اجتناب کروں گا۔</li>
                      <li>جامعہ کے تمام اساتذہ و ملازمین کا ادب و احترام کروں گا اور ساتھی طلباء سے حسنِ اخلاق سے پیش آؤں گا۔</li>
                      <li>جامعہ کے اندر اسلحہ یا نقصان دہ اشیاء ہرگز نہیں رکھوں گا۔</li>
                      <li>مسجد و جامعہ کی دیواروں، کمروں اور اثاثہ جات کی صفائی و حفاظت کا مکمل اہتمام کروں گا۔</li>
                      <li>روزمرہ اسباق، تکرار اور مطالعہ کے اوقات کی پابندی کروں گا اور بلا رخصت غیر حاضر نہیں رہوں گا۔</li>
                      <li>موبائل فون سے متعلق جامعہ کی پالیسی کی مکمل پابندی کروں گا۔</li>
                      <li>والدین/سرپرست وقتاً فوقتاً جامعہ کے ناظم اور کلاس انچارج سے طالب علم کی خیریت و کارکردگی معلوم کرتے رہیں گے۔</li>
                    </ol>
                  ) : (
                    <p style={{ margin: '8px 0 0', fontSize: '0.82rem', color: '#4b5563', lineHeight: '1.7' }}>
                      طالب علم تمام شرعی احکامات، باجماعت نماز، وضع قطع سنت کے مطابق رکھنے، اساتذہ کا ادب، اور سیاسی سرگرمیوں و غیر حاضری سے کلی اجتناب کرنے کا پابند ہوگا۔
                    </p>
                  )}

                  <label className="pledge-checkbox-label">
                    <input
                      type="checkbox"
                      checked={agreePledge}
                      onChange={(e) => setAgreePledge(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#143223' }}
                    />
                    <span>
                      میں صدقِ دل سے جامعہ کے تمام قواعد و ضوابط کو پڑھ کر ان پر کاربند رہنے کا عہد کرتا ہوں۔
                    </span>
                  </label>
                  {errors.agreePledge && (
                    <span className="form-error-text" style={{ marginTop: '4px' }}>
                      {errors.agreePledge}
                    </span>
                  )}
                </div>

                {/* SUBMIT BUTTON & PRINT BAR */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }} className="no-print">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    style={{ flex: 1 }}
                    disabled={submitting}
                  >
                    <FiSend size={16} />
                    {submitting ? 'درخواست ارسال ہو رہی ہے...' : 'درخواستِ داخلہ جمع فرمائیں'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-lg"
                    onClick={handlePrint}
                    title="فارم پرنٹ کریں"
                  >
                    <FiPrinter size={16} /> پرنٹ فارم
                  </button>
                </div>
              </form>
            </div>

            {/* SIDEBAR: Concise guidelines & accounts info */}
            <div className="admission-sidebar no-print">
              {/* Rules Card */}
              <div className="admission-sidebar-card">
                <h3 className="admission-sidebar-title">شرائط و ہدایاتِ داخلہ</h3>
                <ul className="admission-rules-list">
                  <li>طالب علم کا مسلمان اور صحیح العقیدہ ہونا لازمی ہے۔</li>
                  <li>شعبہ ناظرہ کے لیے کم از کم عمر 5 سال ہونی چاہیے۔</li>
                  <li>شعبہ حفظ کے لیے ناظرہ قرآن مع تجوید مکمل ہونا ضروری ہے۔</li>
                  <li>درجاتِ کتب کے لیے پچھلے درجے کی سند یا کشف الدرجات لازم ہے۔</li>
                  <li>داخلہ فارم کے ہمراہ فیس 1,000 روپے کی رسید منسلک فرمائیں۔</li>
                  <li>ٹیسٹ و انٹرویو کے وقت 2 عدد تازہ تصاویر اور شناختی کارڈ کی کاپی ہمراہ لائیں۔</li>
                </ul>
              </div>

              {/* Payment Accounts Card */}
              <div className="admission-sidebar-card">
                <h3 className="admission-sidebar-title">فیس ادائیگی کے اکاؤنٹس</h3>
                <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: '0 0 10px', lineHeight: '1.6' }}>
                  داخلہ فیس (1,000 روپے) مندرجہ ذیل اکاؤنٹ میں منتقل فرما سکتے ہیں:
                </p>

                <div className="admission-account-row">
                  <div>
                    <strong>JazzCash:</strong>
                    <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>مدرسہ عربیہ سیدنا صدیق اکبر</div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-english)', fontWeight: 600, direction: 'ltr' }}>0315-3044992</span>
                </div>

                <div className="admission-account-row">
                  <div>
                    <strong>EasyPaisa:</strong>
                    <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>مدرسہ عربیہ سیدنا صدیق اکبر</div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-english)', fontWeight: 600, direction: 'ltr' }}>0315-3044992</span>
                </div>

                <div className="admission-account-row">
                  <div>
                    <strong>میزان بینک (Meezan):</strong>
                    <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>جامعہ عربیہ صدیق اکبر</div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-english)', fontSize: '0.76rem', fontWeight: 600, direction: 'ltr' }}>PK12MEZN0012345678</span>
                </div>
              </div>

              {/* Admission Schedule */}
              <div className="admission-sidebar-card">
                <h3 className="admission-sidebar-title">داخلہ شیڈول</h3>
                <div style={{ fontSize: '0.84rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #eee' }}>
                    <span style={{ color: '#6b7280' }}>فارم کی وصولی:</span>
                    <span>یکم شوال تا 15 شوال</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #eee' }}>
                    <span style={{ color: '#6b7280' }}>ٹیسٹ و انٹرویو:</span>
                    <span>20 شوال</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #eee' }}>
                    <span style={{ color: '#6b7280' }}>نتائج کا اعلان:</span>
                    <span>25 شوال</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                    <span style={{ color: '#6b7280' }}>تعلیمی آغاز:</span>
                    <span>یکم ذوالقعدہ</span>
                  </div>
                </div>
              </div>

              {/* Office Contact */}
              <div className="admission-sidebar-card">
                <h3 className="admission-sidebar-title">دفتری رہنمائی و رابطہ</h3>
                <div style={{ fontSize: '0.84rem', color: '#4b5563', lineHeight: '1.8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <FiPhone size={14} style={{ color: '#143223' }} />
                    <a href="tel:03153044992" style={{ fontFamily: 'var(--font-english)', direction: 'ltr', color: 'inherit' }}>
                      0315 3044992
                    </a>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <FiMapPin size={14} style={{ color: '#143223', flexShrink: 0, marginTop: '4px' }} />
                    <span>توحید کالونی، چارسدہ روڈ، مردان</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Confirmation Modal */}
      {showSuccess && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="tracking-success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tracking-success-icon" style={{ color: 'var(--color-success)' }}>
              <FiCheckCircle size={52} />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.3rem' }}>درخواستِ داخلہ موصول ہو گئی</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
              طالب علم <strong>{form.studentName}</strong> کی درخواست اور فیس رسید کا ریکارڈ محفوظ کر لیا گیا ہے۔
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
              <strong>اہم نوٹ:</strong> اس ٹریکنگ نمبر کو محفوظ فرمائیں۔ ویب سائٹ کے "ٹریکنگ" صفحے پر جا کر آپ کسی بھی وقت اپنی درخواست کی صورتحال معلوم کر سکتے ہیں۔
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
