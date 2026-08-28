import { useState, useEffect } from 'react';
import { getDonations, updateDonationStatus } from '../../services/api';
import { FiCheckCircle, FiXCircle, FiEye, FiX } from 'react-icons/fi';
import '../dashboard/DashboardPages.css';

const STATUS_LABELS = {
  pending: 'زیر غور',
  approved: 'منظور شدہ',
  rejected: 'مسترد',
};

const STATUS_BADGE = {
  pending: 'badge-warning',
  approved: 'badge-success',
  rejected: 'badge-error',
};

export default function ManageDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDetail, setShowDetail] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [actionError, setActionError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadDonations = async () => {
    setLoading(true);
    try {
      const data = await getDonations();
      setDonations(data || []);
    } catch (err) {
      console.error('Load donations error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, []);

  const filtered = donations.filter((d) => {
    const matchSearch = (d.donorName || '').includes(search) || (d.trackingNumber || '').includes(search.toUpperCase()) || (d.phone || '').includes(search);
    const matchStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const pendingCount = donations.filter((d) => d.status === 'pending').length;

  const handleStatusChange = async (id, newStatus) => {
    setActionError('');
    setSaving(true);
    try {
      await updateDonationStatus(id, newStatus, adminNote);
      setDonations((prev) =>
        prev.map((d) => (d._id === id ? { ...d, status: newStatus, adminNotes: adminNote || d.adminNotes } : d))
      );
      setShowDetail(null);
      setAdminNote('');
      loadDonations();
    } catch (err) {
      console.error('Update donation status error:', err);
      setActionError(err.message || 'حالت تبدیل کرنے میں خرابی ہوئی');
    } finally {
      setSaving(false);
    }
  };

  const openDetail = (donation) => {
    setShowDetail(donation);
    setAdminNote(donation.adminNotes || '');
    setActionError('');
  };

  return (
    <div>
      <div className="page-title-bar">
        <h2 className="page-title" style={{ border: 'none', margin: 0, padding: 0 }}>
          عطیات کا انتظام
          {pendingCount > 0 && (
            <span className="badge badge-warning" style={{ marginRight: '12px', fontSize: '0.75rem' }}>
              {pendingCount} زیر غور
            </span>
          )}
        </h2>
      </div>

      <div className="mgmt-toolbar">
        <div className="mgmt-search">
          <input
            type="text"
            placeholder="نام، ٹریکنگ نمبر یا فون سے تلاش..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '140px' }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">تمام</option>
          <option value="pending">زیر غور</option>
          <option value="approved">منظور شدہ</option>
          <option value="rejected">مسترد</option>
        </select>
        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          کل: {filtered.length}
        </span>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ٹریکنگ نمبر</th>
              <th>نام</th>
              <th>رقم</th>
              <th>طریقہ</th>
              <th>تاریخ</th>
              <th>حالت</th>
              <th>اقدامات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((don) => (
              <tr key={don._id}>
                <td style={{ fontFamily: 'var(--font-english)', fontWeight: 600 }}>{don.trackingNumber}</td>
                <td>{don.donorName}</td>
                <td style={{ fontFamily: 'var(--font-english)', fontWeight: 600 }}>Rs. {don.amount.toLocaleString()}</td>
                <td>{don.method}</td>
                <td style={{ fontFamily: 'var(--font-english)' }}>{don.date}</td>
                <td>
                  <span className={`badge ${STATUS_BADGE[don.status]}`}>
                    {STATUS_LABELS[don.status]}
                  </span>
                </td>
                <td>
                  <div className="action-btns">
                    <button className="action-btn" onClick={() => openDetail(don)}>
                      <FiEye size={14} style={{ marginLeft: '4px' }} />
                      تفصیل
                    </button>
                    {don.status === 'pending' && (
                      <>
                        <button
                          className="action-btn"
                          style={{ color: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                          onClick={() => handleStatusChange(don._id, 'approved')}
                        >
                          <FiCheckCircle size={14} style={{ marginLeft: '4px' }} />
                          منظور
                        </button>
                        <button
                          className="action-btn action-btn-danger"
                          onClick={() => handleStatusChange(don._id, 'rejected')}
                        >
                          <FiXCircle size={14} style={{ marginLeft: '4px' }} />
                          مسترد
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                  کوئی عطیہ نہیں ملا
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h3>عطیہ کی تفصیلات — {showDetail.trackingNumber}</h3>
              <button className="modal-close" onClick={() => setShowDetail(null)}><FiX size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>نام</span>
                  <p style={{ margin: '4px 0 0', fontWeight: 600 }}>{showDetail.donorName}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>فون</span>
                  <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-english)' }}>{showDetail.phone}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>رقم</span>
                  <p style={{ margin: '4px 0 0', fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'var(--font-english)' }}>Rs. {showDetail.amount.toLocaleString()}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>طریقہ</span>
                  <p style={{ margin: '4px 0 0' }}>{showDetail.method}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>تاریخ</span>
                  <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-english)' }}>{showDetail.date}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>حالت</span>
                  <p style={{ margin: '4px 0 0' }}>
                    <span className={`badge ${STATUS_BADGE[showDetail.status]}`}>{STATUS_LABELS[showDetail.status]}</span>
                  </p>
                </div>
              </div>

              {/* Uploaded Donation Receipt Screenshot */}
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: '8px' }}>
                  ادائیگی کا تصدیقی اسکرین شاٹ (Payment Proof)
                </span>

                {showDetail.screenshotData || (showDetail.screenshotPath && showDetail.screenshotPath.startsWith('data:')) ? (
                  <div style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px',
                    textAlign: 'center',
                    background: '#000',
                  }}>
                    <img
                      src={showDetail.screenshotData || showDetail.screenshotPath}
                      alt="ادائیگی کی رسید"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '260px',
                        borderRadius: 'var(--radius-sm)',
                        objectFit: 'contain',
                        display: 'block',
                        margin: '0 auto',
                      }}
                    />
                  </div>
                ) : showDetail.screenshotPath ? (
                  <div style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px',
                    textAlign: 'center',
                    background: '#000',
                  }}>
                    <a href={`/uploads/${showDetail.screenshotPath}`} target="_blank" rel="noopener noreferrer" title="بڑی تصویر دیکھنے کے لیے کلک کریں">
                      <img
                        src={`/uploads/${showDetail.screenshotPath}`}
                        alt="ادائیگی کی رسید"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '260px',
                          borderRadius: 'var(--radius-sm)',
                          objectFit: 'contain',
                          display: 'block',
                          margin: '0 auto',
                        }}
                      />
                    </a>
                  </div>
                ) : showDetail.screenshotPreview ? (
                  <div style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px',
                    textAlign: 'center',
                    background: '#000',
                  }}>
                    <img
                      src={showDetail.screenshotPreview}
                      alt="ادائیگی کی رسید"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '260px',
                        borderRadius: 'var(--radius-sm)',
                        objectFit: 'contain',
                        display: 'block',
                        margin: '0 auto',
                      }}
                    />
                  </div>
                ) : (
                  <div style={{
                    border: '2px dashed var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '24px',
                    textAlign: 'center',
                    color: 'var(--color-text-muted)',
                    background: 'var(--color-bg-alt)',
                  }}>
                    📷 {showDetail.screenshotFile || 'کوئی اسکرین شاٹ منسلک نہیں ہے'}
                  </div>
                )}
              </div>

              {/* Admin Notes */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">ایڈمن نوٹ</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="نوٹ لکھیں (اختیاری)"
                  style={{ minHeight: '60px' }}
                />
              </div>
            </div>
            {showDetail.status === 'pending' && (
              <div className="modal-footer">
                <button
                  className="btn btn-primary btn-sm"
                  style={{ background: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                  onClick={() => handleStatusChange(showDetail._id, 'approved')}
                >
                  <FiCheckCircle size={14} style={{ marginLeft: '4px' }} />
                  منظور کریں
                </button>
                <button
                  className="btn btn-sm"
                  style={{ background: 'var(--color-error)', borderColor: 'var(--color-error)', color: '#fff' }}
                  onClick={() => handleStatusChange(showDetail._id, 'rejected')}
                >
                  <FiXCircle size={14} style={{ marginLeft: '4px' }} />
                  مسترد کریں
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => setShowDetail(null)}>بند کریں</button>
              </div>
            )}
            {showDetail.status !== 'pending' && (
              <div className="modal-footer">
                <button className="btn btn-outline btn-sm" onClick={() => setShowDetail(null)}>بند کریں</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
