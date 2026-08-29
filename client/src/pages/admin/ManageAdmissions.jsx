import { useState, useEffect } from 'react';
import { getAdmissions, updateAdmissionStatus } from '../../services/api';
import { FiCheckCircle, FiXCircle, FiEye, FiX, FiSearch } from 'react-icons/fi';
import '../dashboard/DashboardPages.css';

const STATUS_LABELS = {
  pending: 'زیر غور',
  under_review: 'جائزہ جاری',
  admitted: 'داخلہ منظور',
  rejected: 'مسترد',
};

const STATUS_BADGE = {
  pending: 'badge-warning',
  under_review: 'badge-info',
  admitted: 'badge-success',
  rejected: 'badge-error',
};

export default function ManageAdmissions() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDetail, setShowDetail] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [actionError, setActionError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadAdmissions = async () => {
    setLoading(true);
    try {
      const data = await getAdmissions();
      setApplications(data || []);
    } catch (err) {
      console.error('Load admissions error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmissions();
  }, []);

  const filtered = applications.filter((a) => {
    const matchSearch = (a.studentName || '').includes(search) || (a.fatherName || '').includes(search) || (a.trackingNumber || '').includes(search.toUpperCase()) || (a.phone || '').includes(search);
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const pendingCount = applications.filter((a) => a.status === 'pending' || a.status === 'under_review').length;

  const handleStatusChange = async (id, newStatus) => {
    setActionError('');
    setSaving(true);
    try {
      await updateAdmissionStatus(id, newStatus, adminNote);
      setApplications((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: newStatus, adminNotes: adminNote || a.adminNotes } : a))
      );
      setShowDetail(null);
      setAdminNote('');
      loadAdmissions();
    } catch (err) {
      console.error('Update admission status error:', err);
      setActionError(err.message || 'حالت تبدیل کرنے میں خرابی ہوئی');
    } finally {
      setSaving(false);
    }
  };

  const openDetail = (app) => {
    setShowDetail(app);
    setAdminNote(app.adminNotes || '');
    setActionError('');
  };

  return (
    <div>
      <div className="page-title-bar">
        <h2 className="page-title" style={{ border: 'none', margin: 0, padding: 0 }}>
          داخلہ درخواستیں
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
          <option value="under_review">جائزہ جاری</option>
          <option value="admitted">داخلہ منظور</option>
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
              <th>والد کا نام</th>
              <th>مطلوبہ درجہ</th>
              <th>داخلہ فیس</th>
              <th>نمبر</th>
              <th>تاریخ</th>
              <th>حالت</th>
              <th>اقدامات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((app) => (
              <tr key={app._id}>
                <td style={{ fontFamily: 'var(--font-english)', fontWeight: 600 }}>{app.trackingNumber}</td>
                <td>{app.studentName}</td>
                <td>{app.fatherName}</td>
                <td>{app.desiredClass}</td>
                <td style={{ fontFamily: 'var(--font-english)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                    Rs. {(app.admissionFee || 1000).toLocaleString()}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                    {app.paymentMethod || 'JazzCash'}
                  </span>
                </td>
                <td style={{ fontFamily: 'var(--font-english)', fontWeight: 700, color: 'var(--color-primary)' }}>#{app.queuePosition}</td>
                <td style={{ fontFamily: 'var(--font-english)' }}>{app.date}</td>
                <td>
                  <span className={`badge ${STATUS_BADGE[app.status]}`}>
                    {STATUS_LABELS[app.status]}
                  </span>
                </td>
                <td>
                  <div className="action-btns">
                    <button className="action-btn" onClick={() => openDetail(app)}>
                      <FiEye size={14} style={{ marginLeft: '4px' }} />
                      تفصیل
                    </button>
                    {(app.status === 'pending' || app.status === 'under_review') && (
                      <>
                        <button
                          className="action-btn"
                          style={{ color: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                          onClick={() => handleStatusChange(app._id, 'admitted')}
                        >
                          منظور
                        </button>
                        <button
                          className="action-btn action-btn-danger"
                          onClick={() => handleStatusChange(app._id, 'rejected')}
                        >
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
                <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                  کوئی درخواست نہیں ملی
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>داخلہ درخواست — {showDetail.trackingNumber}</h3>
              <button className="modal-close" onClick={() => setShowDetail(null)}><FiX size={18} /></button>
            </div>
            <div className="modal-body">
              {/* Queue Position */}
              <div style={{
                textAlign: 'center',
                padding: '16px',
                marginBottom: '20px',
                background: 'var(--color-bg-alt)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-light)',
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>قطار نمبر</span>
                <div style={{ fontFamily: 'var(--font-english)', fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  #{showDetail.queuePosition}
                </div>
                <span className={`badge ${STATUS_BADGE[showDetail.status]}`}>{STATUS_LABELS[showDetail.status]}</span>
              </div>

              {/* Admission Fee & Payment Proof Card */}
              <div style={{
                background: 'rgba(184, 150, 12, 0.07)',
                border: '1.5px solid var(--color-accent)',
                borderRadius: 'var(--radius-md, 8px)',
                padding: '14px 16px',
                marginBottom: '20px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-primary-dark)', fontWeight: 700 }}>
                    داخلہ رجسٹریشن فیس کی تفصیلات
                  </h4>
                  <span style={{
                    fontFamily: 'var(--font-english)',
                    fontWeight: 800,
                    fontSize: '1rem',
                    color: 'var(--color-primary-dark)',
                    background: '#fff',
                    padding: '2px 10px',
                    borderRadius: '4px',
                    border: '1px solid var(--color-accent)',
                  }}>
                    Rs. {(showDetail.admissionFee || 1000).toLocaleString()}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>ادائیگی کا ذریعہ</span>
                    <p style={{ margin: '2px 0 0', fontWeight: 600 }}>{showDetail.paymentMethod || 'JazzCash'}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>ٹرانزیکشن ID / حوالہ</span>
                    <p style={{ margin: '2px 0 0', fontFamily: 'var(--font-english)', fontWeight: 600 }}>
                      {showDetail.transactionId || 'درج نہیں'}
                    </p>
                  </div>
                </div>

                {/* Proof Screenshot */}
                <div style={{ borderTop: '1px dashed rgba(184, 150, 12, 0.4)', paddingTop: '10px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: '8px' }}>
                    ادائیگی کا تصدیقی ثبوت (Payment Receipt):
                  </span>
                  {showDetail.screenshotData || (showDetail.screenshotPath && showDetail.screenshotPath.startsWith('data:')) ? (
                    <div style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '8px',
                      textAlign: 'center',
                      background: '#fff',
                    }}>
                      <img
                        src={showDetail.screenshotData || showDetail.screenshotPath}
                        alt="فیس رسید"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '240px',
                          borderRadius: '4px',
                          objectFit: 'contain',
                          display: 'block',
                          margin: '0 auto',
                        }}
                      />
                      <a
                        href={showDetail.screenshotData || showDetail.screenshotPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-block', marginTop: '6px', fontSize: '0.75rem', color: 'var(--color-primary)', textDecoration: 'underline' }}
                      >
                        بڑی تصویر دیکھنے کے لیے کلک کریں
                      </a>
                    </div>
                  ) : showDetail.screenshotPath ? (
                    <div style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '8px',
                      textAlign: 'center',
                      background: '#fff',
                    }}>
                      <a href={`/uploads/${showDetail.screenshotPath}`} target="_blank" rel="noopener noreferrer">
                        <img
                          src={`/uploads/${showDetail.screenshotPath}`}
                          alt="فیس رسید"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '240px',
                            borderRadius: '4px',
                            objectFit: 'contain',
                            display: 'block',
                            margin: '0 auto',
                          }}
                        />
                      </a>
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                      اسکرین شاٹ فائل موجود نہیں ہے
                    </p>
                  )}
                </div>
              </div>

              {/* Student Photo & Identity if present */}
              {showDetail.studentPhotoData && (
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <img
                    src={showDetail.studentPhotoData}
                    alt={showDetail.studentName}
                    style={{ width: '90px', height: '110px', objectFit: 'cover', borderRadius: '6px', border: '2px solid var(--color-primary)' }}
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>طالب علم کی تازہ تصویر</div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px', fontSize: '0.88rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>طالب علم کا نام</span>
                  <p style={{ margin: '2px 0 0', fontWeight: 700, color: 'var(--color-primary-dark)' }}>{showDetail.studentName}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>والد کا نام</span>
                  <p style={{ margin: '2px 0 0', fontWeight: 600 }}>{showDetail.fatherName}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>ب فارم / شناختی کارڈ</span>
                  <p style={{ margin: '2px 0 0', fontFamily: 'var(--font-english)' }}>{showDetail.cnic || 'درج نہیں'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>رابطہ فون</span>
                  <p style={{ margin: '2px 0 0', fontFamily: 'var(--font-english)' }}>{showDetail.phone}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>مطلوبہ درجہ</span>
                  <p style={{ margin: '2px 0 0', fontWeight: 600, color: 'var(--color-primary)' }}>{showDetail.desiredClass}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>تاریخ پیدائش</span>
                  <p style={{ margin: '2px 0 0', fontFamily: 'var(--font-english)' }}>{showDetail.dateOfBirth || 'درج نہیں'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>شناختی علامت</span>
                  <p style={{ margin: '2px 0 0' }}>{showDetail.identificationMark || 'کوئی نہیں'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>ازدواجی حیثیت</span>
                  <p style={{ margin: '2px 0 0' }}>{showDetail.maritalStatus || 'مجرد'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>سابقہ تعلیم</span>
                  <p style={{ margin: '2px 0 0' }}>{showDetail.previousEducation || 'درج نہیں'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>تاریخ درخواست</span>
                  <p style={{ margin: '2px 0 0', fontFamily: 'var(--font-english)' }}>{showDetail.date}</p>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>مستقل پتہ</span>
                  <p style={{ margin: '2px 0 0' }}>{showDetail.permanentAddress || showDetail.address || 'درج نہیں'}</p>
                </div>
              </div>

              {/* Guardian Info Card */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px 14px', marginBottom: '16px' }}>
                <h5 style={{ margin: '0 0 8px', color: 'var(--color-primary-dark)', fontSize: '0.88rem' }}>والد و سرپرست کی معلومات</h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)' }}>سرپرست کا نام:</span>
                    <p style={{ margin: '2px 0 0', fontWeight: 600 }}>{showDetail.guardianName || showDetail.fatherName}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)' }}>سرپرست کی ولدیت:</span>
                    <p style={{ margin: '2px 0 0' }}>{showDetail.guardianFatherName || 'درج نہیں'}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)' }}>امیدوار سے رشتہ:</span>
                    <p style={{ margin: '2px 0 0' }}>{showDetail.guardianRelation || 'والد'}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)' }}>سرپرست کا فون:</span>
                    <p style={{ margin: '2px 0 0', fontFamily: 'var(--font-english)' }}>{showDetail.guardianPhone || showDetail.phone}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)' }}>سرپرست کا شناختی کارڈ:</span>
                    <p style={{ margin: '2px 0 0', fontFamily: 'var(--font-english)' }}>{showDetail.guardianCnic || 'درج نہیں'}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)' }}>مردان میں رشتہ دار:</span>
                    <p style={{ margin: '2px 0 0' }}>{showDetail.mardanRelative || 'کوئی درج نہیں'}</p>
                  </div>
                </div>
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
              {actionError && (
                <div style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid var(--color-error)',
                  color: 'var(--color-error)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginTop: '12px',
                  fontSize: '0.875rem',
                }}>
                  {actionError}
                </div>
              )}
            </div>
            {(showDetail.status === 'pending' || showDetail.status === 'under_review') && (
              <div className="modal-footer">
                {showDetail.status === 'pending' && (
                  <button
                    className="btn btn-sm"
                    style={{ background: 'var(--color-info)', borderColor: 'var(--color-info)', color: '#fff' }}
                    onClick={() => handleStatusChange(showDetail._id, 'under_review')}
                    disabled={saving}
                  >
                    <FiSearch size={14} style={{ marginLeft: '4px' }} />
                    {saving ? '...' : 'جائزہ شروع'}
                  </button>
                )}
                <button
                  className="btn btn-primary btn-sm"
                  style={{ background: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                  onClick={() => handleStatusChange(showDetail._id, 'admitted')}
                  disabled={saving}
                >
                  <FiCheckCircle size={14} style={{ marginLeft: '4px' }} />
                  {saving ? '...' : 'داخلہ منظور'}
                </button>
                <button
                  className="btn btn-sm"
                  style={{ background: 'var(--color-error)', borderColor: 'var(--color-error)', color: '#fff' }}
                  onClick={() => handleStatusChange(showDetail._id, 'rejected')}
                  disabled={saving}
                >
                  <FiXCircle size={14} style={{ marginLeft: '4px' }} />
                  {saving ? '...' : 'مسترد'}
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => setShowDetail(null)} disabled={saving}>بند کریں</button>
              </div>
            )}
            {showDetail.status !== 'pending' && showDetail.status !== 'under_review' && (
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
