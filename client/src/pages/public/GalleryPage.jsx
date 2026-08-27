import './PublicPages.css';

export default function GalleryPage() {
  const galleryItems = [
    'مدرسہ کی عمارت',
    'تلاوت قرآن',
    'حفظ کلاس',
    'سالانہ تقریب',
    'کتب خانہ',
    'کلاس روم',
    'تقسیم اسناد',
    'اساتذہ کرام',
    'مسجد',
  ];

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>تصاویر</h1>
          <p>مدرسہ کی تصاویر اور سرگرمیاں</p>
        </div>
      </div>

      <div className="content-page">
        <div className="container">
          <div className="gallery-grid">
            {galleryItems.map((item, index) => (
              <div key={index} className="gallery-item">
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
