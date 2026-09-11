import { useState, useEffect, useCallback } from 'react';
import { getAllFatwaAdmin, updateFatwaAdmin, deleteFatwa } from '../../services/api';
import { FiEye, FiCheck, FiTrash2, FiX, FiSearch } from 'react-icons/fi';
import '../dashboard/DashboardPages.css';

const CATEGORIES = ['طہارت', 'نماز', 'زکوٰۃ', 'روزہ', 'حج', 'نکاح و طلاق', 'تجارت', 'کھانا پینا', 'متفرقات'];

const STATUS_LABELS = {
  pending: 'زیر انتظار',
  answered: 'جواب دیا گیا',
  published: 'شائع شدہ',
};

const STATUS_BADGE = {
  pending: 'badge-warning',
  answered: 'badge-info',
  published: 'badge-success',
};

export default function ManageFatwa() {
  const [fatwas, setFatwas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Detail / answer modal state
  const [selected, setSelected] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [answerCategory, setAnswerCategory] = useState('متفرقات');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveError, setSaveError] = useState('');

  // Delete confirm
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadFatwas = useCallback(async () => {
    setLoading(true);
    const data = await getAllFatwaAdmin({ status: filterStatus === 'all' ? '' : filterStatus, search });
    setFatwas(data || []);
    setLoading(false);
  }, [filterStatus, search]);

  useEffect(() => {
    loadFatwas();
  }, [loadFatwas]);

  const pendingCount = fatwas.filter((f) => f.status === 'pending').length;
  const answeredCount = fatwas.filter((f) => f.status === 'answered').length;
  const publishedCount = fatwas.filter((f) => f.status === 'published').length;

  const handleOpen = (fatwa) => {
    setSelected(fatwa);
    setAnswerText(fatwa.answer || '');
    setAnswerCategory(fatwa.category || 'متفرقات');
    setSaveMsg('');
    setSaveError('');
  };

  const handleClose = () => {
    setSelected(null);
    setSaveMsg('');
    setSaveError('');
  };

  const handleSave = async (newStatus) => {
    if (!selected) return;
    setSaving(true);
    setSaveMsg('');
    setSaveError('');
    try {
      await updateFatwaAdmin(selected._id, {
        answer: answerText,
        category: answerCategory,
        status: newStatus || selected.status,
      });
      setSaveMsg(newStatus === 'published' ? 'فتویٰ شائع ہو گیا!' : 'جواب محفوظ ہو گیا۔');
      await loadFatwas();
      window.dispatchEvent(new Event('fatwaUpdated'));
      // update selected in-place
      setSelected((prev) => ({ ...prev, answer: answerText, category: answerCategory, status: newStatus || prev.status }));
    } catch (err) {
      setSaveError(err.message || 'محفوظ کرنے میں خرابی آئی');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await deleteFatwa(confirmDelete._id);
      setFatwas((prev) => prev.filter((f) => f._id !== confirmDelete._id));
      setConfirmDelete(null);
      window.dispatchEvent(new Event('fatwaUpdated'));
    } catch (err) {
      alert('حذف کرنے میں خرابی آئی: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  return (
    <div className="dashboard-page">
      <div className="page-title-bar">
        <h2>فتاویٰ انتظام</h2>
      </div>

      {/* Stats */}
      <div className="dash-stats" style={{ marginBottom: '24px' }}>
        <div className="dash-stat-card">
          <div className="stat-number">{fatwas.length}</div>
          <div className="stat-label">کل فتاویٰ</div>
        </div>
        <div className="dash-stat-card">
          <div className="stat-number">{pendingCount}</div>
          <div className="stat-label">زیر انتظار</div>
        </div>
        <div className="dash-stat-card">
          <div className="stat-number">{answeredCount}</div>
          <div className="stat-label">جواب دیا گیا</div>
        </div>
        <div className="dash-stat-card">
          <div className="stat-number">{publishedCount}</div>
          <div className="stat-label">شائع شدہ</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar" style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        {['all', 'pending', 'answered', 'published'].map((s) => (
          <button
            key={s}
            className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilterStatus(s)}
          >
            {s === 'all' ? 'تمام' : STATUS_LABELS[s]}
          </button>
        ))}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '6px', marginRight: 'auto' }}>
          <input
            className="form-input"
            style={{ padding: '6px 12px', fontSize: '0.875rem', minWidth: '200px' }}
            placeholder="سوال یا نام سے تلاش..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="btn btn-sm btn-outline">
            <FiSearch size={15} />
          </button>
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>سوال (خلاصہ)</th>
                <th>زمرہ</th>
                <th>پوچھنے والا</th>
                <th>تاریخ</th>
                <th>حالت</th>
                <th>اقدامات</th>
              </tr>
            </thead>
            <tbody>
              {fatwas.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                    کوئی فتویٰ نہیں ملا
                  </td>
                </tr>
              )}
              {fatwas.map((fatwa, idx) => (
                <tr key={fatwa._id}>
                  <td style={{ fontFamily: 'var(--font-english)', fontSize: '0.8125rem' }}>{idx + 1}</td>
                  <td style={{ maxWidth: '260px' }}>
                    <span style={{ fontSize: '0.9375rem', lineHeight: 1.8 }}>
                      {fatwa.question.length > 80 ? fatwa.question.slice(0, 80) + '...' : fatwa.question}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-info">{fatwa.category}</span>
                  </td>
                  <td style={{ fontSize: '0.875rem' }}>
                    {fatwa.askerName || '—'}
                    {fatwa.askerCity ? ` (${fatwa.askerCity})` : ''}
                  </td>
                  <td style={{ fontFamily: 'var(--font-english)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                    {fatwa.createdAt ? new Date(fatwa.createdAt).toLocaleDateString('en-GB') : '—'}
                  </td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[fatwa.status] || 'badge-warning'}`}>
                      {STATUS_LABELS[fatwa.status] || fatwa.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap' }}>
                      <button
                        className="btn btn-sm btn-outline"
                        title="جواب دیں / دیکھیں"
                        onClick={() => handleOpen(fatwa)}
                      >
                        <FiEye size={14} />
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{ background: 'var(--color-error)', color: '#fff', border: 'none' }}
                        title="حذف کریں"
                        onClick={() => setConfirmDelete(fatwa)}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail / Answer Modal */}
      {selected && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>فتویٰ — جواب دیں / شائع کریں</h3>
              <button className="modal-close" onClick={handleClose}><FiX size={20} /></button>
            </div>
            <div className="card-body">
              {/* Question */}
              <div className="form-group">
                <label className="form-label">سوال</label>
                <div style={{
                  background: 'var(--color-bg-alt)',
                  border: '1px solid var(--color-border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  fontSize: '1rem',
                  lineHeight: 2,
                  color: 'var(--color-text)',
                }}>
                  {selected.question}
                </div>
                {selected.askerName && (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '6px', marginBottom: 0 }}>
                    — {selected.askerName}{selected.askerCity ? `، ${selected.askerCity}` : ''}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label">زمرہ</label>
                <select
                  className="form-select"
                  value={answerCategory}
                  onChange={(e) => setAnswerCategory(e.target.value)}
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Answer */}
              <div className="form-group">
                <label className="form-label">جواب</label>
                <textarea
                  className="form-textarea"
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  rows={7}
                  placeholder="جواب یہاں درج کریں..."
                />
              </div>

              {saveMsg && <div className="alert alert-success">{saveMsg}</div>}
              {saveError && <div className="alert alert-error">{saveError}</div>}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button className="btn btn-outline" onClick={handleClose}>بند کریں</button>
                <button
                  className="btn btn-primary"
                  disabled={saving}
                  onClick={() => handleSave('answered')}
                >
                  {saving ? 'محفوظ...' : <><FiCheck size={15} /> جواب محفوظ کریں</>}
                </button>
                <button
                  className="btn btn-accent"
                  disabled={saving || !answerText.trim()}
                  onClick={() => handleSave('published')}
                >
                  {saving ? 'شائع...' : 'شائع کریں'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="card-header">
              <h3 style={{ margin: 0 }}>فتویٰ حذف کریں؟</h3>
            </div>
            <div className="card-body">
              <p style={{ marginBottom: 'var(--space-lg)' }}>
                کیا آپ واقعی یہ فتویٰ حذف کرنا چاہتے ہیں؟ یہ عمل واپس نہیں ہو سکتا۔
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button className="btn btn-outline" onClick={() => setConfirmDelete(null)}>منسوخ</button>
                <button
                  className="btn"
                  style={{ background: 'var(--color-error)', color: '#fff', border: 'none' }}
                  disabled={deleting}
                  onClick={handleDeleteConfirm}
                >
                  {deleting ? 'حذف...' : <><FiTrash2 size={15} /> حذف کریں</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
