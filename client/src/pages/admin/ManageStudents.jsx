import { useState, useEffect } from 'react';
import { getStudents, createStudent, deleteStudent, getClasses } from '../../services/api';
import '../dashboard/DashboardPages.css';

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', fatherName: '', className: '', phone: '', address: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [stuData, clsData] = await Promise.all([getStudents(), getClasses()]);
      setStudents(stuData || []);
      setClasses(clsData || []);
    } catch (err) {
      console.error('Load students error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = students.filter((s) =>
    (s.name || '').includes(search) || (s.fatherName || '').includes(search) || (s.rollNumber || '').includes(search)
  );

  const handleAdd = async () => {
    if (!newStudent.name || !newStudent.fatherName) return;
    const rollNum = String(1000 + students.length + 1);
    const selectedCls = classes.find((c) => c.name === newStudent.className);

    try {
      const created = await createStudent({
        name: newStudent.name,
        fatherName: newStudent.fatherName,
        rollNumber: rollNum,
        className: newStudent.className || (classes[0] ? classes[0].name : 'ناظرہ'),
        class: selectedCls ? selectedCls._id : undefined,
        phone: newStudent.phone,
        address: newStudent.address,
        status: 'active',
        enrollmentDate: new Date().toISOString().split('T')[0],
      });

      setStudents([created, ...students]);
      setNewStudent({ name: '', fatherName: '', className: '', phone: '', address: '' });
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error('Add student error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('کیا آپ واقعی اس طالب علم کو حذف کرنا چاہتے ہیں؟')) return;
    try {
      await deleteStudent(id);
      setStudents(students.filter((s) => s._id !== id));
    } catch (err) {
      console.error('Delete student error:', err);
    }
  };

  return (
    <div>
      <div className="page-title-bar">
        <h2 className="page-title" style={{ border: 'none', margin: 0, padding: 0 }}>طلباء کا انتظام</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>نیا طالب علم</button>
      </div>

      <div className="mgmt-toolbar">
        <div className="mgmt-search">
          <input
            type="text"
            placeholder="نام، والد کا نام یا رول نمبر سے تلاش کریں..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          کل: {filtered.length} طلباء
        </span>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>رول نمبر</th>
              <th>نام</th>
              <th>والد کا نام</th>
              <th>درجہ</th>
              <th>حالت</th>
              <th>اقدامات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((student) => (
              <tr key={student._id}>
                <td style={{ fontFamily: 'var(--font-english)' }}>{student.rollNumber}</td>
                <td>{student.name}</td>
                <td>{student.fatherName}</td>
                <td>{student.className || student.class?.name || student.class || '-'}</td>
                <td>
                  <span className={`badge ${student.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                    {student.status === 'active' ? 'فعال' : 'غیر فعال'}
                  </span>
                </td>
                <td>
                  <div className="action-btns">
                    <button className="action-btn action-btn-danger" onClick={() => handleDelete(student._id)}>حذف</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                  کوئی طالب علم نہیں ملا
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Student Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>نیا طالب علم شامل کریں</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>x</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">نام *</label>
                <input type="text" className="form-input" value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">والد کا نام *</label>
                <input type="text" className="form-input" value={newStudent.fatherName}
                  onChange={(e) => setNewStudent({ ...newStudent, fatherName: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">درجہ</label>
                <select className="form-select" value={newStudent.className}
                  onChange={(e) => setNewStudent({ ...newStudent, className: e.target.value })}>
                  <option value="">درجہ منتخب کریں</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">فون نمبر</label>
                <input type="tel" className="form-input" value={newStudent.phone}
                  onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                  style={{ direction: 'ltr', textAlign: 'right' }} />
              </div>
              <div className="form-group">
                <label className="form-label">پتہ</label>
                <input type="text" className="form-input" value={newStudent.address}
                  onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })} />
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
