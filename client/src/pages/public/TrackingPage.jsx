import { useState } from 'react';
import { trackDonation, trackAdmission } from '../../services/api';
import { FiSearch, FiCheckCircle, FiClock, FiXCircle, FiEye, FiHash, FiUser, FiPhone, FiDollarSign, FiCalendar, FiBookOpen } from 'react-icons/fi';
import './PublicPages.css';

const STATUS_CONFIG = {
  // Donation statuses
  pending: { label: 'زیر غور', icon: FiClock, color: 'var(--color-warning)', bgColor: '#FFF8E1', badgeClass: 'badge-warning' },
  approved: { label: 'منظور شدہ', icon: FiCheckCircle, color: 'var(--color-success)', bgColor: '#E8F5E9', badgeClass: 'badge-success' },
  rejected: { label: 'مسترد', icon: FiXCircle, color: 'var(--color-error)', bgColor: '#FFEBEE', badgeClass: 'badge-error' },
  // Admission statuses
  under_review: { label: 'جائزہ جاری', icon: FiEye, color: 'var(--color-info)', bgColor: '#E3F2FD', badgeClass: 'badge-info' },
  admitted: { label: 'داخلہ منظور', icon: FiCheckCircle, color: 'var(--color-success)', bgColor: '#E8F5E9', badgeClass: 'badge-success' },
};

export default function TrackingPage() {
  const [activeTab, setActiveTab] = useState('donation');
  const [trackingInput, setTrackingInput] = useState('');
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [resultType, setResultType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = trackingInput.trim().toUpperCase();
    if (!query) return;

    setLoading(true);
    setSearched(true);

    try {
      if (activeTab === 'donation') {
        const found = await trackDonation(query);
        setResult(found || null);
        setResultType('donation');
      } else {
        const found = await trackAdmission(query);
        setResult(found || null);
        setResultType('admission');
      }
    } catch (err) {
      console.error('Tracking query error:', err);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setResult(null);
    setSearched(false);
    setTrackingInput('');
  };

  const getStatusConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>ٹریکنگ</h1>
          <p>اپنے عطیہ یا داخلہ درخواست کی حالت جانیں</p>
        </div>
      </div>

      <div className="content-page">
        <div className="container">
          {/* Tabs */}
          <div className="tracking-tabs">
            <button
              className={`tracking-tab ${activeTab === 'donation' ? 'tracking-tab-active' : ''}`}
              onClick={() => switchTab('donation')}
            >
              <FiDollarSign size={18} />
              عطیات ٹریکنگ
            </button>
            <button
              className={`tracking-tab ${activeTab === 'admission' ? 'tracking-tab-active' : ''}`}
              onClick={() => switchTab('admission')}
            >
              <FiBookOpen size={18} />
              داخلہ ٹریکنگ
            </button>
          </div>

          {/* Search Box */}
          <div className="tracking-search-wrapper">
            <form onSubmit={handleSearch} className="tracking-search-form">
              <div className="tracking-search-input-wrapper">
                <FiHash size={20} className="tracking-search-icon" />
                <input
                  type="text"
                  className="form-input tracking-search-input"
                  placeholder={activeTab === 'donation' ? 'مثلاً DON-2026-0001' : 'مثلاً ADM-2026-0001'}
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  style={{ direction: 'ltr', textAlign: 'center', fontSize: '1.125rem', letterSpacing: '1px' }}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg tracking-search-btn">
                <FiSearch size={18} />
                تلاش کریں
              </button>
            </form>
          </div>

          {/* Results */}
          {searched && !result && (
            <div className="tracking-not-found">
              <FiXCircle size={48} />
              <h3>کوئی ریکارڈ نہیں ملا</h3>
              <p>یہ ٹریکنگ نمبر ہمارے ریکارڈ میں موجود نہیں ہے۔ براہ کرم نمبر دوبارہ چیک کریں۔</p>
            </div>
          )}

          {result && resultType === 'donation' && (
            <div className="tracking-result-card">
              <div className="tracking-result-header" style={{ borderColor: getStatusConfig(result.status).color }}>
                <div className="tracking-result-status" style={{ background: getStatusConfig(result.status).bgColor, color: getStatusConfig(result.status).color }}>
                  {(() => { const Icon = getStatusConfig(result.status).icon; return <Icon size={24} />; })()}
                  <span>{getStatusConfig(result.status).label}</span>
                </div>
                <span className="tracking-result-number">{result.trackingNumber}</span>
              </div>
              <div className="tracking-result-body">
                <div className="tracking-detail-row">
                  <FiUser size={16} />
                  <span className="tracking-detail-label">نام:</span>
                  <span className="tracking-detail-value">{result.donorName}</span>
                </div>
                <div className="tracking-detail-row">
                  <FiPhone size={16} />
                  <span className="tracking-detail-label">فون:</span>
                  <span className="tracking-detail-value" style={{ direction: 'ltr' }}>{result.phone}</span>
                </div>
                <div className="tracking-detail-row">
                  <FiDollarSign size={16} />
                  <span className="tracking-detail-label">رقم:</span>
                  <span className="tracking-detail-value tracking-amount">Rs. {result.amount.toLocaleString()}</span>
                </div>
                <div className="tracking-detail-row">
                  <FiCalendar size={16} />
                  <span className="tracking-detail-label">تاریخ:</span>
                  <span className="tracking-detail-value" style={{ fontFamily: 'var(--font-english)' }}>{result.date}</span>
                </div>
                {result.adminNotes && (
                  <div className="tracking-admin-note">
                    <strong>ایڈمن نوٹ:</strong> {result.adminNotes}
                  </div>
                )}
              </div>
              <div className="tracking-result-footer">
                {result.status === 'pending' && 'آپ کے عطیہ کا جائزہ لیا جا رہا ہے۔ براہ کرم تھوڑا انتظار کریں۔'}
                {result.status === 'approved' && '✅ آپ کا عطیہ کامیابی سے موصول ہو گیا ہے۔ جزاک اللہ خیراً!'}
                {result.status === 'rejected' && '❌ بدقسمتی سے آپ کا عطیہ تصدیق نہیں ہو سکا۔ براہ کرم دوبارہ کوشش کریں۔'}
              </div>
            </div>
          )}

          {result && resultType === 'admission' && (
            <div className="tracking-result-card">
              <div className="tracking-result-header" style={{ borderColor: getStatusConfig(result.status).color }}>
                <div className="tracking-result-status" style={{ background: getStatusConfig(result.status).bgColor, color: getStatusConfig(result.status).color }}>
                  {(() => { const Icon = getStatusConfig(result.status).icon; return <Icon size={24} />; })()}
                  <span>{getStatusConfig(result.status).label}</span>
                </div>
                <span className="tracking-result-number">{result.trackingNumber}</span>
              </div>
              <div className="tracking-result-body">
                <div className="tracking-detail-row">
                  <FiUser size={16} />
                  <span className="tracking-detail-label">طالب علم:</span>
                  <span className="tracking-detail-value">{result.studentName}</span>
                </div>
                <div className="tracking-detail-row">
                  <FiUser size={16} />
                  <span className="tracking-detail-label">والد:</span>
                  <span className="tracking-detail-value">{result.fatherName}</span>
                </div>
                <div className="tracking-detail-row">
                  <FiBookOpen size={16} />
                  <span className="tracking-detail-label">مطلوبہ درجہ:</span>
                  <span className="tracking-detail-value">{result.desiredClass}</span>
                </div>
                <div className="tracking-detail-row">
                  <FiCalendar size={16} />
                  <span className="tracking-detail-label">تاریخ:</span>
                  <span className="tracking-detail-value" style={{ fontFamily: 'var(--font-english)' }}>{result.date}</span>
                </div>

                {/* Queue Position */}
                <div className="tracking-queue-box">
                  <span className="tracking-queue-label">قطار میں آپ کا نمبر</span>
                  <span className="tracking-queue-number">{result.queuePosition}</span>
                </div>

                {result.adminNotes && (
                  <div className="tracking-admin-note">
                    <strong>ایڈمن نوٹ:</strong> {result.adminNotes}
                  </div>
                )}
              </div>
              <div className="tracking-result-footer">
                {result.status === 'pending' && 'آپ کی درخواست موصول ہو گئی ہے۔ جلد ہی جائزہ لیا جائے گا۔'}
                {result.status === 'under_review' && '🔍 آپ کی درخواست کا جائزہ لیا جا رہا ہے۔'}
                {result.status === 'admitted' && '✅ مبارک ہو! آپ کا داخلہ منظور ہو گیا ہے۔ مدرسہ کے دفتر سے رابطہ کریں۔'}
                {result.status === 'rejected' && '❌ بدقسمتی سے آپ کی درخواست منظور نہیں ہو سکی۔'}
              </div>
            </div>
          )}

          {/* Sample Tracking Numbers (for testing) */}
          {!searched && (
            <div className="tracking-sample-info">
              <h4>ٹیسٹ ٹریکنگ نمبر</h4>
              <p>آزمائش کے لیے یہ نمبر استعمال کریں:</p>
              <div className="tracking-sample-list">
                {activeTab === 'donation' ? (
                  <>
                    <code>DON-2026-0001</code>
                    <code>DON-2026-0002</code>
                    <code>DON-2026-0004</code>
                  </>
                ) : (
                  <>
                    <code>ADM-2026-0001</code>
                    <code>ADM-2026-0002</code>
                    <code>ADM-2026-0003</code>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
