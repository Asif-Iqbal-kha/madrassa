import '../dashboard/DashboardPages.css';

export default function ManageGallery() {
  const galleryItems = [
    { _id: 'g1', title: 'مدرسہ کی عمارت', category: 'عمارت' },
    { _id: 'g2', title: 'تلاوت قرآن', category: 'تعلیم' },
    { _id: 'g3', title: 'حفظ کلاس', category: 'تعلیم' },
    { _id: 'g4', title: 'سالانہ تقریب', category: 'تقاریب' },
    { _id: 'g5', title: 'کتب خانہ', category: 'سہولیات' },
  ];

  return (
    <div>
      <div className="page-title-bar">
        <h2 className="page-title" style={{ border: 'none', margin: 0, padding: 0 }}>تصاویر کا انتظام</h2>
        <button className="btn btn-primary btn-sm">نئی تصویر اپلوڈ</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>عنوان</th>
              <th>زمرہ</th>
              <th>اقدامات</th>
            </tr>
          </thead>
          <tbody>
            {galleryItems.map((item) => (
              <tr key={item._id}>
                <td>{item.title}</td>
                <td><span className="badge badge-info">{item.category}</span></td>
                <td>
                  <div className="action-btns">
                    <button className="action-btn action-btn-danger">حذف</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
