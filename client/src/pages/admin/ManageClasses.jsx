import { useState, useEffect } from 'react';
import { getClasses, createClass, deleteClass, getTeachers } from '../../services/api';
import '../dashboard/DashboardPages.css';

export default function ManageClasses() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', year: '1447', teacher: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [clsData, tchData] = await Promise.all([getClasses(), getTeachers()]);
      setClasses(clsData || []);
      setTeachers(tchData || []);
    } catch (err) {
      console.error('Load classes error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getTeacherName = (teacherField) => {
    if (!teacherField) return '-';
    if (typeof teacherField === 'object' && teacherField.name) return teacherField.name;
    const t = teachers.find((tch) => tch._id === teacherField);
    return t ? t.name : '-';
  };

  const handleAdd = async () => {
    if (!newClass.name) return;
    try {
      const created = await createClass({
        name: newClass.name,
        year: newClass.year,
        teacher: newClass.teacher || undefined,
        studentsCount: 0,
        isActive: true,
      });
      setClasses([...classes, created]);
      setNewClass({ name: '', year: '1447', teacher: '' });
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error('Create class error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('کیا آپ واقعی اس درجہ کو حذف کرنا چاہتے ہیں؟')) return;
    try {
      await deleteClass(id);
      setClasses(classes.filter((c) => c._id !== id));
    } catch (err) {
      console.error('Delete class error:', err);
    }
  };

  return (
    <div>
      <div className="page-title-bar">
        <h2 className="page-title" style={{ border: 'none', margin: 0, padding: 0 }}>درجات کا انتظام</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>نیا درجہ</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>درجہ</th>
              <th>سال</th>
              <th>استاذ</th>
              <th>طلباء</th>
              <th>حالت</th>
              <th>اقدامات</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((cls) => (
              <tr key={cls._id}>
                <td>{cls.name}</td>
                <td style={{ fontFamily: 'var(--font-english)' }}>{cls.year}</td>
                <td>{getTeacherName(cls.teacher)}</td>
                <td style={{ fontFamily: 'var(--font-english)' }}>{cls.studentsCount || 0}</td>
                <td>
                  <span className={`badge ${cls.isActive ? 'badge-success' : 'badge-warning'}`}>
                    {cls.isActive ? 'فعال' : 'غیر فعال'}
                  </span>
                </td>
                <td>
                  <div className="action-btns">
                    <button className="action-btn action-btn-danger" onClick={() => handleDelete(cls._id)}>حذف</button>
                  </div>
                </td>
              </tr>
            ))}
            {classes.length === 0 && !loading && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                  کوئی درجہ نہیں ملا
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
              <h3>نیا درجہ بنائیں</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>x</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">درجہ کا نام *</label>
                <input type="text" className="form-input" value={newClass.name}
                  onChange={(e) => setNewClass({ ...newClass, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">سال</label>
                <input type="text" className="form-input" value={newClass.year}
                  onChange={(e) => setNewClass({ ...newClass, year: e.target.value })}
                  style={{ direction: 'ltr', textAlign: 'right' }} />
              </div>
              <div className="form-group">
                <label className="form-label">استاذ</label>
                <select className="form-select" value={newClass.teacher}
                  onChange={(e) => setNewClass({ ...newClass, teacher: e.target.value })}>
                  <option value="">استاذ منتخب کریں</option>
                  {teachers.filter((t) => t.isActive).map((t) => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary btn-sm" onClick={handleAdd}>محفوظ کریں</button>
              <button className="btn btn-outline btn-sm" onClick={() => setShowModal(false)}>منسوخ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
