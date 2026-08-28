import { useState, useEffect } from 'react';
import { getStudents, createStudent, updateStudent, deleteStudent, getClasses } from '../../services/api';
import { Link } from 'react-router-dom';
import { FiTrendingUp, FiEdit2, FiTrash2, FiPlus, FiFilter } from 'react-icons/fi';
import '../dashboard/DashboardPages.css';

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', fatherName: '', className: '', phone: '', address: '' });
  const [editingStudent, setEditingStudent] = useState(null);

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

  const filtered = students.filter((s) => {
    const sClass = s.className || s.class?.name || s.class;
    const matchesSearch =
      (s.name || '').includes(search) ||
      (s.fatherName || '').includes(search) ||
      (s.rollNumber || '').includes(search);
    const matchesClass = classFilter === 'all' || sClass === classFilter;
    return matchesSearch && matchesClass;
  });

  const handleAdd = async () => {
    if (!newStudent.name || !newStudent.fatherName) return;
    const rollNum = String(1000 + students.length + 1);
    const selectedClassName = newStudent.className || (classes[0] ? classes[0].name : 'ناظرہ');
    const selectedCls = classes.find((c) => c.name === selectedClassName);

    try {
      const created = await createStudent({
        name: newStudent.name,
        fatherName: newStudent.fatherName,
        rollNumber: rollNum,
        className: selectedClassName,
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

  const handleEditOpen = (student) => {
    setEditingStudent({
      ...student,
      className: student.className || student.class?.name || student.class || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingStudent) return;
    const selectedCls = classes.find((c) => c.name === editingStudent.className);

    try {
      await updateStudent(editingStudent._id, {
        name: editingStudent.name,
        fatherName: editingStudent.fatherName,
        className: editingStudent.className,
        class: selectedCls ? selectedCls._id : undefined,
        phone: editingStudent.phone,
        address: editingStudent.address,
        status: editingStudent.status,
      });

      setShowEditModal(false);
      setEditingStudent(null);
      await loadData();
    } catch (err) {
      console.error('Update student error:', err);
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
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/admin/promote" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FiTrendingUp size={14} /> طلباء کو ترقی دیں
          </Link>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            <FiPlus size={14} style={{ marginLeft: '4px' }} /> نیا طالب علم
          </button>
        </div>
      </div>

      <div className="mgmt-toolbar" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div className="mgmt-search" style={{ flex: '1 1 240px' }}>
          <input
            type="text"
            placeholder="نام، والد کا نام یا رول نمبر سے تلاش کریں..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter by class */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiFilter size={16} style={{ color: 'var(--color-text-muted)' }} />
          <select
            className="form-select"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            style={{ width: 'auto', minWidth: '150px' }}
          >
            <option value="all">تمام درجات ({students.length})</option>
            {classes.map((c) => {
              const count = students.filter(
                (s) => (s.className || s.class?.name || s.class) === c.name
              ).length;
              return (
                <option key={c._id} value={c.name}>
                  {c.name} ({count})
                </option>
              );
            })}
          </select>
        </div>

        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          نمائش: {filtered.length} طلباء
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
                <td>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: 'rgba(15, 118, 110, 0.08)',
                    color: 'var(--color-primary)',
                    fontWeight: 600,
                  }}>
                    {student.className || student.class?.name || student.class || '-'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${student.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                    {student.status === 'active' ? 'فعال' : 'غیر فعال'}
                  </span>
                </td>
                <td>
                  <div className="action-btns">
                    <button
                      className="action-btn action-btn-info"
                      onClick={() => handleEditOpen(student)}
                      title="تبدیل کریں / درجہ بدلیں"
                      style={{ padding: '6px' }}
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      className="action-btn action-btn-danger"
                      onClick={() => handleDelete(student._id)}
                      title="حذف کریں"
                      style={{ padding: '6px' }}
                    >
                      <FiTrash2 size={14} />
                    </button>
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
                <label className="form-label">درجہ *</label>
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

      {/* Edit Student / Change Class Modal */}
      {showEditModal && editingStudent && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>طالب علم کی معلومات تبدیل کریں / درجہ بدلیں</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>x</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">نام</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">والد کا نام</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingStudent.fatherName}
                  onChange={(e) => setEditingStudent({ ...editingStudent, fatherName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                  موجودہ درجہ (Class) *
                </label>
                <select
                  className="form-select"
                  value={editingStudent.className}
                  onChange={(e) => setEditingStudent({ ...editingStudent, className: e.target.value })}
                >
                  <option value="">درجہ منتخب کریں</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">حالت</label>
                <select
                  className="form-select"
                  value={editingStudent.status}
                  onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value })}
                >
                  <option value="active">فعال (Active)</option>
                  <option value="inactive">غیر فعال (Inactive)</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary btn-sm" onClick={handleSaveEdit}>محفوظ کریں</button>
              <button className="btn btn-outline btn-sm" onClick={() => setShowEditModal(false)}>منسوخ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
