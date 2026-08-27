import './PublicPages.css';

export default function AboutPage() {
  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>تعارف</h1>
          <p>مدرسہ سیدنا صدیق اکبرؓ کے بارے میں</p>
        </div>
      </div>

      <div className="content-page">
        <div className="container">
          <div className="content-block">
            <h2>مدرسہ کا تعارف</h2>
            <p>
              مدرسہ سیدنا صدیق اکبرؓ مردان، خیبر پختونخوا میں واقع ایک معتبر دینی تعلیمی ادارہ ہے۔ 
              یہ مدرسہ قرآن مجید کی ناظرہ و حفظ کی تعلیم کے ساتھ ساتھ درجہ اول سے درجہ ہشتم تک 
              دینی علوم کی جامع تعلیم فراہم کرتا ہے۔ مدرسہ کا مقصد نوجوان نسل کو قرآن و سنت کی 
              روشنی میں تعلیم و تربیت فراہم کرنا ہے۔
            </p>
          </div>

          <div className="content-block">
            <h2>ہمارا مقصد</h2>
            <p>
              ہمارا بنیادی مقصد طلباء کو قرآن مجید کی تعلیم، حفظ قرآن، تجوید، حدیث، فقہ، 
              عربی زبان اور دیگر دینی علوم میں ماہر بنانا ہے تاکہ وہ معاشرے میں دین اسلام 
              کی صحیح تعلیمات کو پھیلا سکیں اور ایک مثالی مسلمان کی حیثیت سے زندگی گزار سکیں۔
            </p>
          </div>

          <div className="content-block">
            <h2>تعلیمی پروگرام</h2>
            <p>
              مدرسہ میں درج ذیل تعلیمی پروگرام چلائے جا رہے ہیں:
            </p>
            <ul style={{ listStyle: 'disc', paddingRight: '24px', marginTop: '8px' }}>
              <li style={{ marginBottom: '8px', color: 'var(--color-text-secondary)' }}>ناظرہ قرآن مجید - قرآن پاک کی صحیح تلاوت کی تعلیم</li>
              <li style={{ marginBottom: '8px', color: 'var(--color-text-secondary)' }}>حفظ القرآن - قرآن مجید مکمل حفظ کا پروگرام</li>
              <li style={{ marginBottom: '8px', color: 'var(--color-text-secondary)' }}>درجہ اول تا ہشتم - دینی علوم کی مرحلہ وار تعلیم</li>
            </ul>
          </div>

          <div className="content-block">
            <h2>انتظامیہ</h2>
            <p>
              مدرسہ کی انتظامیہ تجربہ کار علماء کرام پر مشتمل ہے جو طلباء کی تعلیم و تربیت 
              کے لیے مسلسل کوشاں ہیں۔ مدرسہ میں قابل اور تجربہ کار اساتذہ کی ٹیم موجود ہے 
              جو جدید تدریسی طریقوں کے ساتھ روایتی دینی تعلیم فراہم کرتے ہیں۔
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
