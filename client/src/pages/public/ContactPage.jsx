import './PublicPages.css';

export default function ContactPage() {
  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>رابطہ</h1>
          <p>ہم سے رابطہ کریں</p>
        </div>
      </div>

      <div className="content-page">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info-card">
              <h3>دفتر مدرسہ</h3>
              <p>
                <strong>پتہ: </strong>
                <a href="https://maps.app.goo.gl/VNxyjrHUKwRC9v2U7" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-dark)', textDecoration: 'underline' }}>
                  توحید کالونی، چارسدہ روڈ، مردان، خیبر پختونخوا (گوگل میپ پر دیکھیں)
                </a>
              </p>
              <p><strong>فون / واٹس ایپ: </strong><a href="tel:03153044992"><span dir="ltr" className="ltr-text">0315 3044992</span></a></p>
              <p><strong>ای میل: </strong>info@madrassasadeeq.pk</p>
              <div style={{ marginTop: '12px' }}>
                <a
                  href="https://maps.app.goo.gl/VNxyjrHUKwRC9v2U7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  📍 گوگل میپ پر لوکیشن کھولیں
                </a>
              </div>
            </div>

            <div className="contact-info-card">
              <h3>دفتری اوقات</h3>
              <p>پیر تا جمعرات: صبح 8 بجے سے شام 5 بجے تک</p>
              <p>جمعہ: صبح 8 بجے سے دوپہر 12 بجے تک</p>
              <p>ہفتہ و اتوار: بند</p>
            </div>
          </div>

          <div className="content-block" style={{ marginTop: '40px' }}>
            <h2>پیغام بھیجیں</h2>
            <form onSubmit={(e) => e.preventDefault()} style={{ maxWidth: '600px' }}>
              <div className="form-group">
                <label className="form-label">نام</label>
                <input type="text" className="form-input" placeholder="اپنا نام لکھیں" />
              </div>
              <div className="form-group">
                <label className="form-label">فون نمبر</label>
                <input type="tel" className="form-input" placeholder="فون نمبر" style={{ direction: 'ltr', textAlign: 'right' }} />
              </div>
              <div className="form-group">
                <label className="form-label">پیغام</label>
                <textarea className="form-textarea" placeholder="اپنا پیغام لکھیں"></textarea>
              </div>
              <button type="submit" className="btn btn-primary">پیغام بھیجیں</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
