import { useState, useEffect } from 'react';
import { getGalleryItems } from '../../services/api';
import { FiImage, FiZoomIn, FiX } from 'react-icons/fi';
import './PublicPages.css';

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('تمام');
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getGalleryItems();
      setItems(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const categories = ['تمام', 'عمارت', 'تعلیم', 'تقاریب', 'سہولیات'];

  const filtered = activeCategory === 'تمام'
    ? items
    : items.filter((item) => item.category === activeCategory);

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>تصاویر و گیلری</h1>
          <p>مدرسہ عربیہ سیدنا صدیق اکبر رضی اللہ عنہ کی تصاویر اور تعلیمی سرگرمیاں</p>
        </div>
      </div>

      <div className="content-page">
        <div className="container">
          {/* Categories Bar */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveCategory(cat)}
                style={{ borderRadius: '20px', padding: '6px 16px' }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          <div className="gallery-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {filtered.map((item) => (
              <div
                key={item._id}
                className="gallery-item"
                style={{
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  position: 'relative',
                  height: '240px',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer',
                  border: '1px solid var(--color-border)',
                }}
                onClick={() => setLightboxImage(item)}
              >
                {item.imagePath ? (
                  <img
                    src={item.imagePath.startsWith('data:') ? item.imagePath : `/uploads/${item.imagePath}`}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : item.imagePreview ? (
                  <img src={item.imagePreview} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : null}
                <div style={{
                  display: item.imagePath || item.imagePreview ? 'none' : 'flex',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  flexDirection: 'column',
                  padding: '16px',
                  textAlign: 'center',
                }}>
                  <FiImage size={48} style={{ opacity: 0.8, marginBottom: '8px' }} />
                  <span style={{ fontWeight: 600 }}>{item.title}</span>
                </div>

                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                  padding: '24px 16px 12px',
                  color: '#fff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: '#fff' }}>{item.title}</h4>
                    <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{item.category}</span>
                  </div>
                  <FiZoomIn size={18} style={{ opacity: 0.9 }} />
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
              <p>اس زمرے میں کوئی تصویر موجود نہیں</p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div className="modal-overlay" onClick={() => setLightboxImage(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0 }}>{lightboxImage.title}</h3>
              <button className="modal-close" onClick={() => setLightboxImage(null)}><FiX size={20} /></button>
            </div>
            <div style={{ textAlign: 'center', background: '#000', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              {lightboxImage.imagePath ? (
                <img
                  src={lightboxImage.imagePath.startsWith('data:') ? lightboxImage.imagePath : `/uploads/${lightboxImage.imagePath}`}
                  alt={lightboxImage.title}
                  style={{ maxHeight: '500px', maxWidth: '100%', objectFit: 'contain' }}
                />
              ) : lightboxImage.imagePreview ? (
                <img
                  src={lightboxImage.imagePreview}
                  alt={lightboxImage.title}
                  style={{ maxHeight: '500px', maxWidth: '100%', objectFit: 'contain' }}
                />
              ) : (
                <div style={{ padding: '80px', color: '#fff' }}>
                  <FiImage size={64} />
                  <h4>{lightboxImage.title}</h4>
                </div>
              )}
            </div>
            <p style={{ margin: '12px 0 0', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              زمرہ: {lightboxImage.category}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
