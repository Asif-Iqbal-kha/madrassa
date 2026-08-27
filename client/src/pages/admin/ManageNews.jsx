import { useState } from 'react';
import { MOCK_NEWS } from '../../data/mockData';
import '../dashboard/DashboardPages.css';

export default function ManageNews() {
  const [news, setNews] = useState(MOCK_NEWS);
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', content: '', category: 'news' });

  const handleAdd = () => {
    if (!newItem.title || !newItem.content) return;
    setNews([{
      _id: 'n' + (news.length + 1),
      ...newItem,
      isPublished: true,
      publishDate: new Date().toISOString().split('T')[0],
      image: null,
    }, ...news]);
    setNewItem({ title: '', content: '', category: 'news' });
    setShowModal(false);
  };

  const handleDelete = (id) => {
    setNews(news.filter((n) => n._id !== id));
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

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>عنوان</th>
              <th>قسم</th>
              <th>تاریخ</th>
              <th>اقدامات</th>
            </tr>
          </thead>
          <tbody>
            {news.map((item) => (
              <tr key={item._id}>
                <td>{item.title}</td>
                <td><span className="badge badge-info">{categoryLabel(item.category)}</span></td>
                <td style={{ fontFamily: 'var(--font-english)' }}>{item.publishDate}</td>
                <td>
                  <div className="action-btns">
                    <button className="action-btn">ترمیم</button>
                    <button className="action-btn action-btn-danger" onClick={() => handleDelete(item._id)}>حذف</button>
                  </div>
                </td>
              </tr>
            ))}
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
                <label className="form-label">عنوان</label>
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
                <label className="form-label">مواد</label>
                <textarea className="form-textarea" value={newItem.content}
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
