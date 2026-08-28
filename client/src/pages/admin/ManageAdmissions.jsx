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
    try {
      await updateAdmissionStatus(id, newStatus, adminNote);
      setApplications((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: newStatus, adminNotes: adminNote || a.adminNotes } : a))
      );
      loadAdmissions();
    } catch (err) {
      console.error('Update admission status error:', err);
    }
    setShowDetail(null);
    setAdminNote('');
  };

  const openDetail = (app) => {
    setShowDetail(app);
    setAdminNote(app.adminNotes || '');
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
                <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>طالب علم کا نام</span>
                  <p style={{ margin: '4px 0 0', fontWeight: 600 }}>{showDetail.studentName}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>والد کا نام</span>
                  <p style={{ margin: '4px 0 0', fontWeight: 600 }}>{showDetail.fatherName}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>CNIC</span>
                  <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-english)' }}>{showDetail.cnic}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>فون</span>
                  <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-english)' }}>{showDetail.phone}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>مطلوبہ درجہ</span>
                  <p style={{ margin: '4px 0 0' }}>{showDetail.desiredClass}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>پچھلی تعلیم</span>
                  <p style={{ margin: '4px 0 0' }}>{showDetail.previousEducation}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>تاریخ پیدائش</span>
                  <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-english)' }}>{showDetail.dateOfBirth}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>تاریخ درخواست</span>
                  <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-english)' }}>{showDetail.date}</p>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>پتہ</span>
                  <p style={{ margin: '4px 0 0' }}>{showDetail.address}</p>
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
            </div>
            {(showDetail.status === 'pending' || showDetail.status === 'under_review') && (
              <div className="modal-footer">
                {showDetail.status === 'pending' && (
                  <button
                    className="btn btn-sm"
                    style={{ background: 'var(--color-info)', borderColor: 'var(--color-info)', color: '#fff' }}
                    onClick={() => handleStatusChange(showDetail._id, 'under_review')}
                  >
                    <FiSearch size={14} style={{ marginLeft: '4px' }} />
                    جائزہ شروع
                  </button>
                )}
                <button
                  className="btn btn-primary btn-sm"
                  style={{ background: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                  onClick={() => handleStatusChange(showDetail._id, 'admitted')}
                >
                  <FiCheckCircle size={14} style={{ marginLeft: '4px' }} />
                  داخلہ منظور
                </button>
                <button
                  className="btn btn-sm"
                  style={{ background: 'var(--color-error)', borderColor: 'var(--color-error)', color: '#fff' }}
                  onClick={() => handleStatusChange(showDetail._id, 'rejected')}
                >
                  <FiXCircle size={14} style={{ marginLeft: '4px' }} />
                  مسترد
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => setShowDetail(null)}>بند کریں</button>
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
