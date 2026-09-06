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
                  صدیق اکبر کالونی عقب توحید کالونی چارسدہ روڈ مردان خیبرپختونخوا پاکستان (گوگل میپ پر دیکھیں)
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
                  گوگل میپ پر لوکیشن کھولیں
                </a>
              </div>
            </div>

            <div className="contact-info-card">
              <h3>دفتر کے اوقات 🕘</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9375rem', lineHeight: '1.7' }}>
                <div>
                  <strong style={{ color: 'var(--color-primary-dark)' }}>📌 پیر تا بدھ:</strong>
                  <div style={{ paddingRight: '16px' }}>صبح 9:00 بجے سے 11:00 بجے تک</div>
                  <div style={{ paddingRight: '16px' }}>دوپہر 3:00 بجے سے شام 7:00 بجے تک</div>
                </div>
                <div>
                  <strong style={{ color: 'var(--color-primary-dark)' }}>📌 جمعرات:</strong>
                  <div style={{ paddingRight: '16px' }}>صبح 9:00 بجے سے 11:00 بجے تک</div>
                  <div style={{ paddingRight: '16px', color: '#b91c1c', fontWeight: 600 }}>اس کے بعد دفتر بند رہے گا۔</div>
                </div>
                <div>
                  <strong style={{ color: 'var(--color-primary-dark)' }}>📌 جمعہ:</strong>
                  <div style={{ paddingRight: '16px' }}>صبح 9:00 بجے سے دوپہر 12:00 بجے تک</div>
                </div>
                <div style={{ marginTop: '8px', fontWeight: 700, color: 'var(--color-primary)' }}>
                  جزاکم اللہ خیراً 🌸
                </div>
              </div>
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
