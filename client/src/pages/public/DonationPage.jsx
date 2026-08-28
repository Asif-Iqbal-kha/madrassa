import { useState } from 'react';
import { submitDonation } from '../../services/api';
import { FiUpload, FiCheckCircle, FiCopy, FiHeart, FiDollarSign, FiSmartphone, FiX } from 'react-icons/fi';
import './PublicPages.css';

export default function DonationPage() {
  const [form, setForm] = useState({
    donorName: '',
    phone: '',
    amount: '',
    method: '',
    screenshot: null,
  });
  const [screenshotPreview, setScreenshotPreview] = useState(null);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, screenshot: file });
      const reader = new FileReader();
      reader.onloadend = () => setScreenshotPreview(reader.result);
      reader.readAsDataURL(file);
      if (errors.screenshot) {
        setErrors({ ...errors, screenshot: '' });
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setForm({ ...form, screenshot: file });
      const reader = new FileReader();
      reader.onloadend = () => setScreenshotPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.donorName.trim()) newErrors.donorName = 'نام ضروری ہے';
    if (!form.phone.trim()) newErrors.phone = 'فون نمبر ضروری ہے';
    if (!form.amount || Number(form.amount) <= 0) newErrors.amount = 'درست رقم درج کریں';
    if (!form.method) newErrors.method = 'ادائیگی کا طریقہ منتخب کریں';
    if (!form.screenshot) newErrors.screenshot = 'ادائیگی کا اسکرین شاٹ ضروری ہے';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await submitDonation(
        {
          donorName: form.donorName,
          phone: form.phone,
          amount: form.amount,
          method: form.method,
        },
        form.screenshot
      );

      if (res.success) {
        setTrackingNumber(res.trackingNumber);
        setShowSuccess(true);
      }
    } catch (err) {
      console.error('Submit error:', err);
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
    setForm({ donorName: '', phone: '', amount: '', method: '', screenshot: null });
    setScreenshotPreview(null);
    setShowSuccess(false);
    setTrackingNumber('');
    setErrors({});
  };

  const paymentMethods = [
    { value: 'JazzCash', label: 'JazzCash' },
    { value: 'EasyPaisa', label: 'EasyPaisa' },
    { value: 'بینک ٹرانسفر', label: 'بینک ٹرانسفر' },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>عطیات</h1>
          <p>مدرسہ سیدنا صدیق اکبرؓ کے لیے عطیہ دیں</p>
        </div>
      </div>

      <div className="content-page">
        <div className="container">
          {/* Info Section */}
          <div className="donation-info-banner">
            <div className="donation-info-icon">
              <FiHeart size={32} />
            </div>
            <div className="donation-info-text">
              <h3>آپ کا عطیہ طلباء کے مستقبل کی تعمیر ہے</h3>
              <p>
                آپ کے عطیات سے مدرسہ کے طلباء کی تعلیم، کتب کی فراہمی، اور مدرسہ کی بہتری میں مدد ملتی ہے۔
                ادائیگی کے بعد اسکرین شاٹ اپلوڈ کریں اور ٹریکنگ نمبر حاصل کریں۔
              </p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="content-block">
            <h2>ادائیگی کی تفصیلات</h2>
            <div className="payment-details-grid">
              <div className="payment-detail-card">
                <h4>JazzCash</h4>
                <p className="payment-number">0300-1234567</p>
                <p className="payment-name">مدرسہ سیدنا صدیق اکبرؓ</p>
              </div>
              <div className="payment-detail-card">
                <h4>EasyPaisa</h4>
                <p className="payment-number">0300-7654321</p>
                <p className="payment-name">مدرسہ سیدنا صدیق اکبرؓ</p>
              </div>
              <div className="payment-detail-card">
                <h4>بینک ٹرانسفر</h4>
                <p className="payment-number">PK12MEZN0012345678</p>
                <p className="payment-name">میزان بینک — مدرسہ اکاؤنٹ</p>
              </div>
            </div>
          </div>

          {/* Donation Form */}
          <div className="content-block">
            <h2>عطیہ فارم</h2>
            <div className="donation-form-wrapper">
              <form onSubmit={handleSubmit}>
                <div className="donation-form-grid">
                  <div className="form-group">
                    <label className="form-label">نام *</label>
                    <input
                      type="text"
                      className={`form-input ${errors.donorName ? 'form-input-error' : ''}`}
                      placeholder="آپ کا مکمل نام"
                      value={form.donorName}
                      onChange={(e) => handleChange('donorName', e.target.value)}
                    />
                    {errors.donorName && <span className="form-error-text">{errors.donorName}</span>}
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
                    <label className="form-label">رقم (روپے) *</label>
                    <input
                      type="number"
                      className={`form-input ${errors.amount ? 'form-input-error' : ''}`}
                      placeholder="مثلاً 5000"
                      value={form.amount}
                      onChange={(e) => handleChange('amount', e.target.value)}
                      style={{ direction: 'ltr', textAlign: 'right' }}
                      min="1"
                    />
                    {errors.amount && <span className="form-error-text">{errors.amount}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">ادائیگی کا طریقہ *</label>
                    <select
                      className={`form-select ${errors.method ? 'form-input-error' : ''}`}
                      value={form.method}
                      onChange={(e) => handleChange('method', e.target.value)}
                    >
                      <option value="">طریقہ منتخب کریں</option>
                      {paymentMethods.map((m) => (
                        <option key={m.value} value={m.value}>{m.icon} {m.label}</option>
                      ))}
                    </select>
                    {errors.method && <span className="form-error-text">{errors.method}</span>}
                  </div>
                </div>

                {/* Screenshot Upload */}
                <div className="form-group">
                  <label className="form-label">ادائیگی کا اسکرین شاٹ *</label>
                  <div
                    className={`file-upload-area ${errors.screenshot ? 'file-upload-error' : ''} ${screenshotPreview ? 'file-upload-has-file' : ''}`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('screenshot-input').click()}
                  >
                    {screenshotPreview ? (
                      <div className="file-upload-preview">
                        <img src={screenshotPreview} alt="اسکرین شاٹ" />
                        <button
                          type="button"
                          className="file-upload-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            setForm({ ...form, screenshot: null });
                            setScreenshotPreview(null);
                          }}
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="file-upload-placeholder">
                        <FiUpload size={32} />
                        <p>اسکرین شاٹ یہاں ڈراپ کریں یا کلک کریں</p>
                        <span>PNG, JPG — زیادہ سے زیادہ 5MB</span>
                      </div>
                    )}
                    <input
                      id="screenshot-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                  {errors.screenshot && <span className="form-error-text">{errors.screenshot}</span>}
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                  <FiDollarSign size={18} />
                  عطیہ جمع کروائیں
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="tracking-success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tracking-success-icon">
              <FiCheckCircle size={56} />
            </div>
            <h3>عطیہ کامیابی سے جمع ہو گیا!</h3>
            <p>آپ کا عطیہ موصول ہو گیا ہے۔ ایڈمن تصدیق کے بعد آپ کو مطلع کیا جائے گا۔</p>

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
              <strong>اہم:</strong> یہ ٹریکنگ نمبر محفوظ رکھیں۔ اس کے ذریعے آپ اپنے عطیہ کی حالت چیک کر سکتے ہیں۔
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
