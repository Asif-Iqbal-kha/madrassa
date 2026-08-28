import { useState, useEffect } from 'react';
import { getPopupNews } from '../../services/api';
import { FiX, FiBell } from 'react-icons/fi';
import './NewsPopup.css';

export default function NewsPopup() {
  const [popupItem, setPopupItem] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    async function fetchPopup() {
      try {
        const data = await getPopupNews();
        if (data && data.length > 0) {
          setPopupItem(data[0]);
          setVisible(true);
        }
      } catch (err) {
        // Silently fail — popup is non-critical
      }
    }
    fetchPopup();
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => setPopupItem(null), 300);
  };

  if (!popupItem || !visible) return null;

  const categoryLabel = (cat) => {
    if (cat === 'announcement') return 'اعلان';
    if (cat === 'event') return 'تقریب';
    return 'خبر';
  };

  return (
    <div className={`news-popup-overlay ${visible ? 'visible' : ''}`} onClick={handleClose}>
      <div className="news-popup-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="news-popup-header">
          <div className="news-popup-header-left">
            <div className="news-popup-bell">
              <FiBell size={20} />
            </div>
            <div>
              <span className="news-popup-category">{categoryLabel(popupItem.category)}</span>
              <span className="news-popup-date">{popupItem.publishDate}</span>
            </div>
          </div>
          <button className="news-popup-close" onClick={handleClose} aria-label="بند کریں">
            <FiX size={22} />
          </button>
        </div>

        {/* Ornament */}
        <div className="news-popup-ornament">
          <span className="ornament-line-sm"></span>
          <span className="ornament-dot"></span>
          <span className="ornament-line-sm"></span>
        </div>

        {/* Body */}
        <div className="news-popup-body">
          <h3 className="news-popup-title">{popupItem.title}</h3>
          <p className="news-popup-content">{popupItem.content}</p>
        </div>

        {/* Footer */}
        <div className="news-popup-footer">
          <span className="news-popup-madrassa">مدرسہ سیدنا صدیق اکبر رضی اللہ عنہ</span>
          <button className="btn btn-outline btn-sm news-popup-dismiss" onClick={handleClose}>
            بند کریں
          </button>
        </div>
      </div>
    </div>
  );
}
