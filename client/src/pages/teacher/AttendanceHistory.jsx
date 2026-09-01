import { useState, useEffect } from 'react';
import { getAttendance, getClasses } from '../../services/api';
import { FiPrinter, FiCalendar, FiBookOpen } from 'react-icons/fi';
import '../dashboard/DashboardPages.css';

export default function AttendanceHistory() {
  const [attendanceList, setAttendanceList] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filterClass, setFilterClass] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [selectedRecordForPrint, setSelectedRecordForPrint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [records, clsData] = await Promise.all([getAttendance(), getClasses()]);
        setAttendanceList(records || []);
        setClasses(clsData || []);
      } catch (err) {
        console.warn('AttendanceHistory load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredRecords = attendanceList.filter((rec) => {
    const clsName = rec.className || rec.class?.name || '';
    const matchClass = filterClass === 'all' || clsName === filterClass || (rec.class?._id && rec.class._id === filterClass);
    const matchDate = !filterDate || rec.date === filterDate;
    return matchClass && matchDate;
  });

  const handlePrintRecord = (record) => {
    setSelectedRecordForPrint(record);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div>
      <div className="no-print">
        <div className="page-title-bar">
          <h2 className="page-title" style={{ border: 'none', margin: 0, padding: 0 }}>
            سابقہ حاضری ریکارڈ (Attendance Records)
          </h2>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            کل ریکارڈز: {filteredRecords.length}
          </span>
        </div>

        {/* Filter Toolbar */}
        <div className="mgmt-toolbar" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiBookOpen size={16} style={{ color: 'var(--color-primary)' }} />
              <select
                className="form-select"
                style={{ width: 'auto', minWidth: '150px' }}
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
              >
                <option value="all">تمام درجات</option>
                {classes.map((c) => (
                  <option key={c._id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiCalendar size={16} style={{ color: 'var(--color-primary)' }} />
              <input
                type="date"
                className="form-input"
                style={{ width: 'auto', direction: 'ltr', textAlign: 'right' }}
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
              {filterDate && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setFilterDate('')}
                  style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                >
                  صاف کریں
                </button>
              )}
            </div>
          </div>
        </div>

        {loading && <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>لوڈ ہو رہا ہے...</p>}
        {!loading && filteredRecords.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
            <p>کوئی حاضری ریکارڈ موجود نہیں</p>
          </div>
        )}

        {filteredRecords.map((record) => {
          const presentCount = (record.records || []).filter((r) => r.status === 'present').length;
          const totalInRecord = (record.records || []).length;
          const pct = totalInRecord > 0 ? Math.round((presentCount / totalInRecord) * 100) : 0;

          return (
            <div key={record._id || record.date} className="dash-card" style={{ marginBottom: '20px' }}>
              <div className="dash-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-primary)' }}>
                    {record.className || record.class?.name || 'کلاس'}
                  </span>
                  <span style={{ margin: '0 8px', color: 'var(--color-text-muted)' }}>|</span>
                  <span style={{ fontFamily: 'var(--font-english)', fontSize: '0.9rem' }}>{record.date}</span>
                  <span style={{ margin: '0 8px', color: 'var(--color-text-muted)' }}>|</span>
                  <span style={{ fontSize: '0.85rem' }}>حاضر: {presentCount} / {totalInRecord} ({pct}%)</span>
                </div>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => handlePrintRecord(record)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <FiPrinter size={15} />
                  <span>پرنٹ / PDF ڈاؤنلوڈ</span>
                </button>
              </div>
              <div className="dash-card-body">
                <div className="table-container" style={{ border: 'none' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>رول نمبر</th>
                        <th>طالب علم کا نام</th>
                        <th>کیفیت</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(record.records || []).map((r, idx) => (
                        <tr key={r.student || idx}>
                          <td style={{ fontFamily: 'var(--font-english)', fontWeight: 600 }}>{r.rollNumber || '-'}</td>
                          <td style={{ fontWeight: 600 }}>{r.studentName || r.name || 'طالب علم'}</td>
                          <td>
                            <span className={`badge ${r.status === 'present' ? 'badge-success' : r.status === 'absent' ? 'badge-error' : 'badge-warning'}`}>
                              {r.status === 'present' ? 'حاضر' : r.status === 'absent' ? 'غیر حاضر' : 'چھٹی'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PRINT-ONLY ATTENDANCE SHEET FOR HISTORY PRINTING */}
      {selectedRecordForPrint && (
        <div className="print-only-attendance" style={{ display: 'none' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '16px' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: '1.4rem' }}>مدرسہ عربیہ سیدنا صدیق اکبر رضی اللہ تعالیٰ عنہ</h2>
            <p style={{ margin: '0 0 4px', fontSize: '0.9rem' }}>صدیق اکبر کالونی نزد توحید کالونی چارسدہ روڈ مردان</p>
            <h3 style={{ margin: '8px 0 0', fontSize: '1.15rem', textDecoration: 'underline' }}>
              حاضری ریکارڈ شیٹ (Attendance Report Sheet)
            </h3>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.95rem' }}>
            <div><strong>درجہ:</strong> {selectedRecordForPrint.className || selectedRecordForPrint.class?.name || '—'}</div>
            <div><strong>تاریخ:</strong> <span style={{ fontFamily: 'monospace' }}>{selectedRecordForPrint.date}</span></div>
            <div><strong>استاذ / نگران:</strong> {selectedRecordForPrint.teacherName || '—'}</div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #000' }}>
                <th style={{ border: '1px solid #000', padding: '8px', width: '10%' }}>شمار</th>
                <th style={{ border: '1px solid #000', padding: '8px', width: '20%' }}>رول نمبر</th>
                <th style={{ border: '1px solid #000', padding: '8px', width: '40%' }}>طالب علم کا نام</th>
                <th style={{ border: '1px solid #000', padding: '8px', width: '30%' }}>حاضری کیفیت</th>
              </tr>
            </thead>
            <tbody>
              {(selectedRecordForPrint.records || []).map((r, idx) => (
                <tr key={idx}>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{idx + 1}</td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontFamily: 'monospace' }}>
                    {r.rollNumber || '-'}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 600 }}>
                    {r.studentName || r.name || 'طالب علم'}
                  </td>
                  <td style={{
                    border: '1px solid #000',
                    padding: '6px',
                    textAlign: 'center',
                    fontWeight: 700,
                    color: r.status === 'present' ? '#15803d' : r.status === 'absent' ? '#b91c1c' : '#b45309',
                  }}>
                    {r.status === 'present' ? 'حاضر (P)' : r.status === 'absent' ? 'غیر حاضر (A)' : 'چھٹی (L)'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f9fafb', fontWeight: 700 }}>
                <td colSpan="2" style={{ border: '1px solid #000', padding: '8px' }}>
                  کل طلباء: {(selectedRecordForPrint.records || []).length}
                </td>
                <td style={{ border: '1px solid #000', padding: '8px', color: '#15803d' }}>
                  حاضر: {(selectedRecordForPrint.records || []).filter((r) => r.status === 'present').length} | 
                  غیر حاضر: {(selectedRecordForPrint.records || []).filter((r) => r.status === 'absent').length}
                </td>
                <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>
                  تناسب: {
                    (selectedRecordForPrint.records || []).length > 0
                      ? Math.round(
                          ((selectedRecordForPrint.records || []).filter((r) => r.status === 'present').length /
                            (selectedRecordForPrint.records || []).length) *
                            100
                        )
                      : 0
                  }%
                </td>
              </tr>
            </tfoot>
          </table>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '20px' }}>
            <div style={{ textAlign: 'center', width: '200px', borderTop: '1px dashed #000' }}>
              دستخط استاذِ درجہ
            </div>
            <div style={{ textAlign: 'center', width: '200px', borderTop: '1px dashed #000' }}>
              دستخط ناظمِ تعلیمات
            </div>
            <div style={{ textAlign: 'center', width: '200px', borderTop: '1px dashed #000' }}>
              دستخط ناظمِ دفتر / مہتمم
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
