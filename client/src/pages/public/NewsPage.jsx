import { useState, useEffect } from 'react';
import { getNews } from '../../services/api';
import { MOCK_NEWS } from '../../data/mockData';
import './PublicPages.css';

export default function NewsPage() {
  const [news, setNews] = useState(MOCK_NEWS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadNews() {
      setLoading(true);
      const data = await getNews(true);
      if (data && data.length > 0) {
        setNews(data);
      }
      setLoading(false);
    }
    loadNews();
  }, []);

  const categoryLabel = (cat) => {
    if (cat === 'news') return 'خبر';
    if (cat === 'announcement') return 'اعلان';
    return 'تقریب';
  };

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>اعلانات و خبریں</h1>
          <p>مدرسہ کی تازہ ترین خبریں اور اعلانات</p>
        </div>
      </div>

      <div className="content-page">
        <div className="container">
          {news.map((item) => (
            <div key={item._id} className="news-list-item">
              <div className="news-list-date">
                <div>{item.publishDate}</div>
                <div className="badge badge-info" style={{ marginTop: '4px' }}>
                  {categoryLabel(item.category)}
                </div>
              </div>
              <div className="news-list-content">
                <h3>{item.title}</h3>
                <p>{item.content}</p>
              </div>
            </div>
          ))}
          {news.length === 0 && !loading && (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '32px' }}>کوئی اعلان موجود نہیں</p>
          )}
        </div>
      </div>
    </div>
  );
}
