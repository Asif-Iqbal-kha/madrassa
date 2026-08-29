import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* About */}
            <div className="footer-col">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <img src="./logo.png" alt="لوگو" style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff', padding: '2px', border: '1px solid var(--color-accent)' }} />
                <h4 className="footer-heading" style={{ margin: 0, paddingBottom: '4px' }}>مدرسہ عربیہ سیدنا صدیق اکبر رضی اللہ عنہ</h4>
              </div>
              <p className="footer-text">
                توحید کالونی، چارسدہ روڈ، مردان میں واقع ایک معتبر دینی تعلیمی ادارہ جو ناظرہ، حفظ القرآن اور
                درجہ اول سے ہشتم تک دینی تعلیم فراہم کرتا ہے۔
              </p>
            </div>

            {/* Quick Links */}
            <div className="footer-col">
              <h4 className="footer-heading">فوری روابط</h4>
              <ul className="footer-links">
                <li><Link to="/about">تعارف و مقاصد</Link></li>
                <li><Link to="/admission">داخلہ</Link></li>
                <li><Link to="/exams">امتحانات</Link></li>
                <li><Link to="/news">اعلانات</Link></li>
                <li><Link to="/gallery">تصاویر</Link></li>
              </ul>
            </div>

            {/* Portal Links */}
            <div className="footer-col">
              <h4 className="footer-heading">پورٹل</h4>
              <ul className="footer-links">
                <li><Link to="/login">لاگ ان</Link></li>
                <li><Link to="/contact">رابطہ</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="footer-col">
              <h4 className="footer-heading">رابطہ معلومات</h4>
              <div className="footer-contact">
                <p>مردان، خیبر پختونخوا، پاکستان</p>
                <p>فون: 0937-123456</p>
                <p>ای میل: info@madrassasadeeq.pk</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>جملہ حقوق محفوظ ہیں &copy; {new Date().getFullYear()} مدرسہ عربیہ سیدنا صدیق اکبرؓ، مردان</p>
        </div>
      </div>
    </footer>
  );
}
