import { useState, useEffect } from 'react';
import { getTeachers, createTeacher, deleteTeacher } from '../../services/api';
import '../dashboard/DashboardPages.css';

export default function ManageTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ name: '', subject: '', phone: '', qualification: '' });

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const data = await getTeachers();
      setTeachers(data || []);
    } catch (err) {
      console.error('Load teachers error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const handleAdd = async () => {
    if (!newTeacher.name) return;
    try {
      const created = await createTeacher({
        name: newTeacher.name,
        subject: newTeacher.subject,
        phone: newTeacher.phone,
        qualification: newTeacher.qualification,
        classes: [],
        isActive: true,
      });
      setTeachers([created, ...teachers]);
      setNewTeacher({ name: '', subject: '', phone: '', qualification: '' });
      setShowModal(false);
      loadTeachers();
    } catch (err) {
      console.error('Create teacher error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('کیا آپ واقعی اس استاذ کو حذف کرنا چاہتے ہیں؟')) return;
    try {
      await deleteTeacher(id);
      setTeachers(teachers.filter((t) => t._id !== id));
    } catch (err) {
      console.error('Delete teacher error:', err);
    }
  };

  return (
    <div>
      <div className="page-title-bar">
        <h2 className="page-title" style={{ border: 'none', margin: 0, padding: 0 }}>اساتذہ کا انتظام</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>نیا استاذ</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>نام</th>
              <th>مضمون</th>
              <th>قابلیت</th>
              <th>فون</th>
              <th>درجات</th>
              <th>حالت</th>
              <th>اقدامات</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr key={teacher._id}>
                <td>{teacher.name}</td>
                <td>{teacher.subject}</td>
                <td>{teacher.qualification}</td>
                <td style={{ fontFamily: 'var(--font-english)', direction: 'ltr', textAlign: 'right' }}>{teacher.phone}</td>
                <td>
                  {Array.isArray(teacher.classes)
                    ? teacher.classes.map((c) => (typeof c === 'object' ? c.name : c)).join('، ') || '-'
                    : (teacher.classNames ? teacher.classNames.join('، ') : '-')}
                </td>
                <td>
                  <span className={`badge ${teacher.isActive ? 'badge-success' : 'badge-warning'}`}>
                    {teacher.isActive ? 'فعال' : 'غیر فعال'}
                  </span>
                </td>
                <td>
                  <div className="action-btns">
                    <button className="action-btn action-btn-danger" onClick={() => handleDelete(teacher._id)}>حذف</button>
                  </div>
                </td>
              </tr>
            ))}
            {teachers.length === 0 && !loading && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                  کوئی استاذ نہیں ملا
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
              <h3>نیا استاذ شامل کریں</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>x</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">نام *</label>
                <input type="text" className="form-input" value={newTeacher.name}
                  onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">مضمون</label>
                <input type="text" className="form-input" value={newTeacher.subject}
                  onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">قابلیت</label>
                <input type="text" className="form-input" value={newTeacher.qualification}
                  onChange={(e) => setNewTeacher({ ...newTeacher, qualification: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">فون</label>
                <input type="tel" className="form-input" value={newTeacher.phone}
                  onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                  style={{ direction: 'ltr', textAlign: 'right' }} />
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
