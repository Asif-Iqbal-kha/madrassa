import { useState, useEffect } from 'react';
import { getGalleryItems, uploadGalleryItem, deleteGalleryItem } from '../../services/api';
import { FiUpload, FiTrash2, FiImage, FiX, FiCheckCircle } from 'react-icons/fi';
import '../dashboard/DashboardPages.css';

export default function ManageGallery() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('عمارت');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const loadGallery = async () => {
    setLoading(true);
    try {
      const items = await getGalleryItems();
      setGalleryItems(items || []);
    } catch (err) {
      console.error('Load gallery error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('تصویر کا عنوان درج کریں');
      return;
    }
    if (!imageFile) {
      setError('تصویر منتخب کریں');
      return;
    }

    setUploading(true);
    try {
      const newItem = await uploadGalleryItem(title.trim(), category, imageFile);
      if (newItem) {
        setGalleryItems([newItem, ...galleryItems]);
        setShowModal(false);
        setTitle('');
        setCategory('عمارت');
        setImageFile(null);
        setPreview(null);
        loadGallery();
      }
    } catch (err) {
      setError('تصویر اپلوڈ نہیں ہو سکی');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('کیا آپ واقعی اس تصویر کو حذف کرنا چاہتے ہیں؟')) return;
    try {
      await deleteGalleryItem(id);
      setGalleryItems(galleryItems.filter((g) => g._id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div>
      <div className="page-title-bar">
        <h2 className="page-title" style={{ border: 'none', margin: 0, padding: 0 }}>تصاویر کا انتظام (Gallery)</h2>
        <button className="btn btn-primary btn-sm" onClick={() => { setShowModal(true); setError(''); }}>
          <FiUpload size={14} style={{ marginLeft: '4px' }} />
          نئی تصویر اپلوڈ کریں
        </button>
      </div>

      {/* Grid of gallery photos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {galleryItems.map((item) => (
          <div key={item._id} style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ height: '160px', background: 'var(--color-bg-alt)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {item.imagePath ? (
                <img
                  src={`/uploads/${item.imagePath}`}
                  alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : item.imagePreview ? (
                <img src={item.imagePreview} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : null}
              <div style={{ display: item.imagePath || item.imagePreview ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--color-text-muted)' }}>
                <FiImage size={40} />
                <span style={{ fontSize: '0.75rem', marginTop: '4px' }}>تصویر</span>
              </div>
              <span className="badge badge-info" style={{ position: 'absolute', top: '8px', right: '8px' }}>
                {item.category}
              </span>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
              <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600 }}>{item.title}</h4>
              <button
                className="action-btn action-btn-danger"
                onClick={() => handleDelete(item._id)}
                title="حذف کریں"
                style={{ padding: '6px' }}
              >
                <FiTrash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {galleryItems.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
          <FiImage size={48} style={{ opacity: 0.5, marginBottom: '12px' }} />
          <p>ابھی تک کوئی تصویر اپلوڈ نہیں کی گئی۔ اوپر دیے گئے بٹن سے نئی تصویر شامل کریں۔</p>
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>نئی تصویر اپلوڈ کریں</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><FiX size={18} /></button>
            </div>
            <form onSubmit={handleUpload}>
              <div className="modal-body">
                {error && <div className="login-error" style={{ marginBottom: '16px' }}>{error}</div>}

                <div className="form-group">
                  <label className="form-label">تصویر کا عنوان *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="مثلاً: حفظ کلاس کی تقریب"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">زمرہ / کیٹیگری</label>
                  <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="عمارت">عمارت و کیمپس</option>
                    <option value="تعلیم">تعلیمی سرگرمیاں</option>
                    <option value="تقاریب">تقاریب و پروگرامز</option>
                    <option value="سہولیات">سہولیات و کتب خانہ</option>
                    <option value="دیگر">دیگر</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">تصویر فائل منتخب کریں *</label>
                  <div
                    style={{
                      border: '2px dashed var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '24px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: 'var(--color-bg-alt)',
                    }}
                    onClick={() => document.getElementById('gallery-file-input').click()}
                  >
                    {preview ? (
                      <div>
                        <img src={preview} alt="پیش نظارہ" style={{ maxHeight: '180px', maxWidth: '100%', borderRadius: 'var(--radius-sm)', objectFit: 'contain' }} />
                        <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: 'var(--color-primary)' }}>تصویر تبدیل کرنے کے لیے کلک کریں</p>
                      </div>
                    ) : (
                      <div>
                        <FiUpload size={32} style={{ color: 'var(--color-primary)', marginBottom: '8px' }} />
                        <p style={{ margin: 0, fontWeight: 500 }}>تصویر منتخب کرنے کے لیے کلک کریں</p>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>JPG, PNG, WebP (زیادہ سے زیادہ 5MB)</span>
                      </div>
                    )}
                    <input
                      id="gallery-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn btn-primary btn-sm" disabled={uploading}>
                  {uploading ? 'اپلوڈ ہو رہی ہے...' : 'اپلوڈ کریں'}
                </button>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowModal(false)}>
                  منسوخ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
