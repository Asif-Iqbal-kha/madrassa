import { useState } from 'react';
import { MOCK_CLASSES } from '../../data/mockData';
import { submitAdmission } from '../../services/api';
import {
  FiCheckCircle,
  FiCopy,
  FiSend,
  FiUploadCloud,
  FiCreditCard,
  FiCheck,
  FiX,
  FiFileText,
  FiInfo,
  FiDollarSign,
} from 'react-icons/fi';
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
      setErrors((prev) => ({ ...prev, paymentProof: 'صرف تصویری فائل (JPG, PNG) منتخب کریں' }));
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
    if (!form.studentName.trim()) newErrors.studentName = 'طالب علم کا نام ضروری ہے';
    if (!form.fatherName.trim()) newErrors.fatherName = 'والد کا نام ضروری ہے';
    if (!form.phone.trim()) newErrors.phone = 'فون نمبر ضروری ہے';
    if (!form.desiredClass) newErrors.desiredClass = 'مطلوبہ درجہ منتخب کریں';
    if (!form.dateOfBirth) newErrors.dateOfBirth = 'تاریخ پیدائش درج کریں';
    if (!form.paymentMethod) newErrors.paymentMethod = 'ادائیگی کا طریقہ منتخب کریں';
    if (!paymentProof) newErrors.paymentProof = 'رقم منتقلی کا ثبوت (رسید / اسکرین شاٹ) اپلوڈ کرنا لازمی ہے';
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
        alert(res.message || 'درخواست جمع کرنے میں خرابی ہوئی');
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
    setShowForm(false);
    setTrackingNumber('');
    setErrors({});
  };

  const paymentAccounts = [
    { name: 'JazzCash', number: '0315-3044992', title: 'مدرسہ عربیہ سیدنا صدیق اکبر رضی اللہ عنہ' },
    { name: 'EasyPaisa', number: '0315-3044992', title: 'مدرسہ عربیہ سیدنا صدیق اکبر رضی اللہ عنہ' },
    { name: 'بینک ٹرانسفر (Meezan Bank)', number: 'PK12MEZN0012345678', title: 'جامعہ عربیہ صدیق اکبر فنڈ' },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>داخلہ اور رجسٹریشن</h1>
          <p>نئے طلباء کے لیے داخلہ کی شرائط، فیس کی معلومات اور آن لائن داخلہ فارم</p>
        </div>
      </div>

      <div className="content-page">
        <div className="container">
          {/* Admission Fee Announcement Card */}
          <div
            className="content-block"
            style={{
              background: 'linear-gradient(135deg, rgba(20, 50, 35, 0.05) 0%, rgba(184, 150, 12, 0.12) 100%)',
              border: '2px solid var(--color-accent)',
              borderRadius: 'var(--radius-lg, 12px)',
              padding: '24px 28px',
              marginBottom: '28px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'var(--color-primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    flexShrink: 0,
                  }}
                >
                  <FiCreditCard size={28} />
                </div>
                <div>
                  <h2 style={{ margin: '0 0 4px', fontSize: '1.4rem', color: 'var(--color-primary-dark)' }}>
                    داخلہ رجسٹریشن فیس: <span style={{ color: 'var(--color-accent-dark)', fontFamily: 'var(--font-english)' }}>1,000</span> روپے
                  </h2>
                  <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                    تمام نئے داخلہ لینے والے طلباء کے لیے رجسٹریشن و پروسیسنگ فیس مبلغ <strong>1,000 روپے</strong> لازمی ہے۔ فارم جمع کراتے وقت فیس ادائیگی کی رسید / اسکرین شاٹ منسلک کرنا ضروری ہے۔
                  </p>
                </div>
              </div>
              <div
                style={{
                  background: '#fff',
                  border: '1px dashed var(--color-accent)',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>مقررہ داخلہ فیس</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary-dark)', fontFamily: 'var(--font-english)' }}>
                  Rs. 1,000
                </span>
              </div>
            </div>
          </div>

          <div className="content-block">
            <h2>داخلہ کی شرائط و ضوابط</h2>
            <p>
              مدرسہ عربیہ سیدنا صدیق اکبر رضی اللہ تعالیٰ عنہ میں داخلہ کے لیے درج ذیل شرائط کا پورا کرنا ضروری ہے:
            </p>
            <ul style={{ listStyle: 'disc', paddingRight: '24px', marginTop: '8px' }}>
              <li style={{ marginBottom: '8px', color: 'var(--color-text-secondary)' }}>طالب علم مسلمان اور صحیح العقیدہ ہو</li>
              <li style={{ marginBottom: '8px', color: 'var(--color-text-secondary)' }}>ناظرہ کے لیے کم از کم عمر 5 سال ہو</li>
              <li style={{ marginBottom: '8px', color: 'var(--color-text-secondary)' }}>حفظ کے لیے ناظرہ قرآن کریم تجوید کے ساتھ مکمل ہو</li>
              <li style={{ marginBottom: '8px', color: 'var(--color-text-secondary)' }}>درجات نظامیہ میں داخلے کے لیے پچھلے درجے کا پاس شدہ نتیجہ لازم ہے</li>
              <li style={{ marginBottom: '8px', color: 'var(--color-primary-dark)', fontWeight: 700 }}>
                داخلہ رجسٹریشن فیس: مبلغ 1,000 روپے (ناقابل واپسی) جو فارم کے ساتھ منتقلی کے ثبوت سمیت ادا کی جائے گی
              </li>
              <li style={{ marginBottom: '8px', color: 'var(--color-text-secondary)' }}>والد یا سرپرست کی شناختی کارڈ (CNIC / ب فارم) کی تفصیلات</li>
              <li style={{ marginBottom: '8px', color: 'var(--color-text-secondary)' }}>داخلہ ٹیسٹ و انٹرویو میں کامیابی</li>
            </ul>
          </div>

          {/* Payment Details Section */}
          <div className="content-block">
            <h2>فیس جمع کروانے کے لیے مدرسہ کے اکاؤنٹس</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }}>
              آپ داخلہ فیس (1,000 روپے) درج ذیل میں سے کسی بھی طریقے سے منتقل کر کے اسکرین شاٹ فارم میں لگائیں:
            </p>
            <div className="payment-details-grid">
              {paymentAccounts.map((acc, i) => (
                <div key={i} className="payment-detail-card" style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0 }}>{acc.name}</h4>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(184, 150, 12, 0.1)', color: 'var(--color-accent-dark)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      فیس: 1,000 روپے
                    </span>
                  </div>
                  <p className="payment-number">{acc.number}</p>
                  <p className="payment-name">{acc.title}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="content-block">
            <h2>داخلہ کی اہم تاریخیں</h2>
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
                    <td>داخلہ ٹیسٹ و انٹرویو</td>
                    <td>20 شوال 1447 ھ</td>
                  </tr>
                  <tr>
                    <td>نتائج کا اعلان</td>
                    <td>25 شوال 1447 ھ</td>
                  </tr>
                  <tr>
                    <td>باقاعدہ تعلیمی آغاز</td>
                    <td>یکم ذوالقعدہ 1447 ھ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Apply Button Banner */}
          {!showForm && !showSuccess && (
            <div className="admission-apply-banner">
              <div className="admission-apply-content">
                <h3>آن لائن داخلہ درخواست فارم</h3>
                <p>داخلہ فیس 1,000 روپے منتقل کرنے کا ثبوت (اسکرین شاٹ) منسلک کریں اور فوری ٹریکنگ نمبر حاصل کریں</p>
              </div>
              <button className="btn btn-accent btn-lg" onClick={() => setShowForm(true)}>
                <FiSend size={18} />
                داخلہ فارم بھریں (فیس: 1,000 روپے)
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

                    {/* Payment Fee & Proof Section */}
                    <div
                      style={{
                        gridColumn: '1 / -1',
                        marginTop: '10px',
                        padding: '20px',
                        background: 'rgba(184, 150, 12, 0.05)',
                        border: '1.5px dashed var(--color-accent)',
                        borderRadius: 'var(--radius-md, 10px)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                        <h4 style={{ margin: 0, color: 'var(--color-primary-dark)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FiCreditCard /> داخلہ فیس و رقم کی منتقلی کا ثبوت
                        </h4>
                        <span style={{ fontSize: '0.85rem', background: 'var(--color-accent)', color: '#fff', padding: '3px 10px', borderRadius: '20px', fontWeight: 700, fontFamily: 'var(--font-english)' }}>
                          فیس: Rs. 1,000 (فکسڈ)
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">مقررہ داخلہ فیس</label>
                          <input
                            type="text"
                            className="form-input"
                            value="1,000 روپے (لازمی)"
                            readOnly
                            disabled
                            style={{ background: '#fff', fontWeight: 700, color: 'var(--color-primary-dark)' }}
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">ادائیگی کا طریقہ *</label>
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
                          <label className="form-label">ٹرانزیکشن ID / TID نمبر (اختیاری)</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="مثلاً: TID-98214732"
                            value={form.transactionId}
                            onChange={(e) => handleChange('transactionId', e.target.value)}
                            style={{ direction: 'ltr', textAlign: 'right', fontFamily: 'var(--font-english)' }}
                          />
                        </div>
                      </div>

                      {/* Proof of Transfer Upload Box */}
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">
                          رقم منتقلی کا ثبوت (تصدیقی اسکرین شاٹ / رسید کی تصویر) *
                        </label>
                        <div
                          className={`file-upload-area ${errors.paymentProof ? 'file-upload-error' : ''} ${proofPreview ? 'file-upload-has-file' : ''}`}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={handleDrop}
                          onClick={() => document.getElementById('proof-input').click()}
                          style={{ minHeight: '130px', cursor: 'pointer' }}
                        >
                          {proofPreview ? (
                            <div className="file-upload-preview" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                              <img
                                src={proofPreview}
                                alt="رسید اسکرین شاٹ"
                                style={{ maxHeight: '160px', maxWidth: '100%', borderRadius: '6px', objectFit: 'contain' }}
                              />
                              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--color-success)', fontWeight: 600 }}>
                                  ✓ تصویر کامیابی سے منتخب ہو گئی ({paymentProof?.name})
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-outline btn-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPaymentProof(null);
                                    setProofPreview(null);
                                  }}
                                  style={{ padding: '2px 8px', fontSize: '0.75rem', color: 'var(--color-error)' }}
                                >
                                  تبدیل کریں
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="file-upload-placeholder" style={{ textAlign: 'center', padding: '16px' }}>
                              <FiUploadCloud size={36} style={{ color: 'var(--color-accent)', marginBottom: '8px' }} />
                              <p style={{ margin: '0 0 4px', fontWeight: 600 }}>
                                رسید یا اسکرین شاٹ یہاں ڈریگ کریں یا منتخب کرنے کے لیے کلک کریں
                              </p>
                              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                معاون فارمیٹس: JPG, PNG, WebP (زیادہ سے زیادہ 10MB)
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
                          <span className="form-error-text" style={{ display: 'block', marginTop: '6px' }}>
                            {errors.paymentProof}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={submitting}>
                      <FiSend size={18} />
                      {submitting ? 'درخواست جمع ہو رہی ہے...' : 'داخلہ درخواست جمع کروائیں (1,000 روپے)'}
                    </button>
                    <button type="button" className="btn btn-outline btn-lg" onClick={() => setShowForm(false)} disabled={submitting}>
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
              فون / واٹس ایپ: <a href="tel:03153044992"><span dir="ltr" className="ltr-text">0315 3044992</span></a>
              <br />
              پتہ: <a href="https://maps.app.goo.gl/VNxyjrHUKwRC9v2U7" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-dark)', textDecoration: 'underline' }}>توحید کالونی، چارسدہ روڈ، مردان (گوگل میپ)</a>
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
            <h3>داخلہ درخواست بمعہ فیس رسید موصول ہو گئی!</h3>
            <p>
              آپ کی داخلہ درخواست اور داخلہ فیس (<strong>1,000 روپے</strong>) کی رسید کامیابی سے جمع ہو چکی ہے۔ مدرسہ انتظامیہ جائزہ لے کر ٹیسٹ و انٹرویو کی تاریخ سے آگاہ کرے گی۔
            </p>

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
              <strong>اہم:</strong> یہ ٹریکنگ نمبر محفوظ رکھیں۔ ویب سائٹ کے "ٹریکنگ" صفحے پر جا کر آپ کسی بھی وقت اپنی داخلہ فیس اور درخواست کی پیش رفت چیک کر سکتے ہیں۔
            </div>

            <button className="btn btn-primary" onClick={resetForm} style={{ width: '100%', marginTop: '16px' }}>
              مکمل اور بند کریں
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
