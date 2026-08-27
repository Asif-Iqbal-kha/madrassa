import { useState } from 'react';
import { MOCK_TEACHERS } from '../../data/mockData';
import '../dashboard/DashboardPages.css';

export default function ManageTeachers() {
  const [teachers, setTeachers] = useState(MOCK_TEACHERS);
  const [showModal, setShowModal] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ name: '', subject: '', phone: '', qualification: '' });

  const handleAdd = () => {
    if (!newTeacher.name) return;
    const id = 't' + (teachers.length + 1);
    setTeachers([...teachers, {
      _id: id,
      name: newTeacher.name,
      subject: newTeacher.subject,
      phone: newTeacher.phone,
      qualification: newTeacher.qualification,
      classes: [],
      isActive: true,
    }]);
    setNewTeacher({ name: '', subject: '', phone: '', qualification: '' });
    setShowModal(false);
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
                <td>{teacher.classes.join('، ') || '-'}</td>
                <td>
                  <span className={`badge ${teacher.isActive ? 'badge-success' : 'badge-warning'}`}>
                    {teacher.isActive ? 'فعال' : 'غیر فعال'}
                  </span>
                </td>
                <td>
                  <div className="action-btns">
                    <button className="action-btn">ترمیم</button>
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
              <h3>نیا استاذ شامل کریں</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>x</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">نام</label>
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
