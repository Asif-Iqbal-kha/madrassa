import { useState, useEffect } from 'react';
import { getNews, createNews, deleteNews, toggleNewsPopup } from '../../services/api';
import { FiBell, FiBellOff } from 'react-icons/fi';
import '../dashboard/DashboardPages.css';

export default function ManageNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', content: '', category: 'news' });
  const [togglingId, setTogglingId] = useState(null);

  const loadNews = async () => {
    setLoading(true);
    try {
      const data = await getNews(false); // all news including unpublished
      setNews(data || []);
    } catch (err) {
      console.error('Load news error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const handleAdd = async () => {
    if (!newItem.title || !newItem.content) return;
    try {
      await createNews({
        title: newItem.title,
        content: newItem.content,
        category: newItem.category,
      });
      setNewItem({ title: '', content: '', category: 'news' });
      setShowModal(false);
      loadNews();
    } catch (err) {
      console.error('Create news error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('کیا آپ واقعی اس اعلان کو حذف کرنا چاہتے ہیں؟')) return;
    try {
      await deleteNews(id);
      setNews(news.filter((n) => n._id !== id));
    } catch (err) {
      console.error('Delete news error:', err);
    }
  };

  const handleTogglePopup = async (item) => {
    setTogglingId(item._id);
    try {
      const newVal = !item.isPopup;
      await toggleNewsPopup(item._id, newVal);
      // Update local state: if enabling, disable all others
      setNews((prev) =>
        prev.map((n) => ({
          ...n,
          isPopup: n._id === item._id ? newVal : newVal ? false : n.isPopup,
        }))
      );
    } catch (err) {
      console.error('Toggle popup error:', err);
      alert('پاپ اپ تبدیل کرنے میں خرابی ہوئی');
    } finally {
      setTogglingId(null);
    }
  };

  const categoryLabel = (cat) => {
    if (cat === 'news') return 'خبر';
    if (cat === 'announcement') return 'اعلان';
    return 'تقریب';
  };

  return (
    <div>
      <div className="page-title-bar">
        <h2 className="page-title" style={{ border: 'none', margin: 0, padding: 0 }}>اعلانات کا انتظام</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>نیا اعلان</button>
      </div>

      {/* Info banner about popup feature */}
      <div style={{
        background: 'rgba(15, 118, 110, 0.06)',
        border: '1px solid rgba(15, 118, 110, 0.2)',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '16px',
        fontSize: '0.875rem',
        color: 'var(--color-text-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <FiBell size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
        <span>
          <strong>پاپ اپ اعلان:</strong> کسی بھی اعلان کے آگے گھنٹی کے بٹن کو دبا کر اسے ویب سائٹ پر پاپ اپ کے طور پر نمایاں کریں۔ بیک وقت صرف ایک اعلان پاپ اپ کے طور پر فعال ہو سکتا ہے۔
        </span>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>عنوان</th>
              <th>قسم</th>
              <th>تاریخ</th>
              <th style={{ textAlign: 'center', width: '110px' }}>پاپ اپ</th>
              <th>اقدامات</th>
            </tr>
          </thead>
          <tbody>
            {news.map((item) => (
              <tr key={item._id}>
                <td>{item.title}</td>
                <td><span className="badge badge-info">{categoryLabel(item.category)}</span></td>
                <td style={{ fontFamily: 'var(--font-english)' }}>{item.publishDate}</td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    title={item.isPopup ? 'پاپ اپ بند کریں' : 'پاپ اپ فعال کریں'}
                    onClick={() => handleTogglePopup(item)}
                    disabled={togglingId === item._id}
                    style={{
                      background: item.isPopup
                        ? 'rgba(15, 118, 110, 0.12)'
                        : 'transparent',
                      border: `1px solid ${item.isPopup ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      borderRadius: '6px',
                      padding: '6px 10px',
                      cursor: 'pointer',
                      color: item.isPopup ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.8rem',
                      transition: 'all 0.2s',
                    }}
                  >
                    {item.isPopup ? (
                      <><FiBell size={14} /> فعال</>
                    ) : (
                      <><FiBellOff size={14} /> بند</>
                    )}
                  </button>
                </td>
                <td>
                  <div className="action-btns">
                    <button
                      className="action-btn action-btn-danger"
                      onClick={() => handleDelete(item._id)}
                    >
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {news.length === 0 && !loading && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                  کوئی اعلان نہیں ملا
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>نیا اعلان</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>x</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">عنوان *</label>
                <input type="text" className="form-input" value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">قسم</label>
                <select className="form-select" value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}>
                  <option value="news">خبر</option>
                  <option value="announcement">اعلان</option>
                  <option value="event">تقریب</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">مواد *</label>
                <textarea className="form-textarea" rows="4" value={newItem.content}
                  onChange={(e) => setNewItem({ ...newItem, content: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary btn-sm" onClick={handleAdd}>شائع کریں</button>
              <button className="btn btn-outline btn-sm" onClick={() => setShowModal(false)}>منسوخ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
