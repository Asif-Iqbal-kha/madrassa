import './PublicPages.css';

export default function AdmissionPage() {
  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>داخلہ</h1>
          <p>نئے طلباء کے لیے داخلہ کی معلومات</p>
        </div>
      </div>

      <div className="content-page">
        <div className="container">
          <div className="content-block">
            <h2>داخلہ کی شرائط</h2>
            <p>
              مدرسہ سیدنا صدیق اکبرؓ میں داخلہ کے لیے درج ذیل شرائط کا پورا کرنا ضروری ہے:
            </p>
            <ul style={{ listStyle: 'disc', paddingRight: '24px', marginTop: '8px' }}>
              <li style={{ marginBottom: '8px', color: 'var(--color-text-secondary)' }}>طالب علم مسلمان ہو</li>
              <li style={{ marginBottom: '8px', color: 'var(--color-text-secondary)' }}>ناظرہ کے لیے عمر 5 سال سے زیادہ ہو</li>
              <li style={{ marginBottom: '8px', color: 'var(--color-text-secondary)' }}>حفظ کے لیے ناظرہ مکمل ہو</li>
              <li style={{ marginBottom: '8px', color: 'var(--color-text-secondary)' }}>درجات میں داخلے کے لیے پچھلے درجے کا امتحان پاس ہو</li>
              <li style={{ marginBottom: '8px', color: 'var(--color-text-secondary)' }}>والد یا سرپرست کی شناختی کارڈ کی کاپی</li>
              <li style={{ marginBottom: '8px', color: 'var(--color-text-secondary)' }}>طالب علم کی تصاویر (2 عدد)</li>
            </ul>
          </div>

          <div className="content-block">
            <h2>داخلہ کا طریقہ کار</h2>
            <p>
              داخلہ حاصل کرنے کے لیے والدین یا سرپرست کو مدرسہ کے دفتر میں تشریف لانا ہوگا۔ 
              داخلہ فارم دفتر سے حاصل کیا جا سکتا ہے۔ فارم پُر کرنے کے بعد مطلوبہ دستاویزات 
              کے ساتھ دفتر میں جمع کرائیں۔ داخلہ کمیٹی جائزہ لینے کے بعد فیصلہ کرے گی۔
            </p>
          </div>

          <div className="content-block">
            <h2>داخلہ کی تاریخیں</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>تفصیل</th>
                    <th>تاریخ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>داخلہ فارم کی دستیابی</td>
                    <td>یکم شوال 1447 ھ</td>
                  </tr>
                  <tr>
                    <td>داخلہ فارم جمع کرانے کی آخری تاریخ</td>
                    <td>15 شوال 1447 ھ</td>
                  </tr>
                  <tr>
                    <td>داخلہ ٹیسٹ</td>
                    <td>20 شوال 1447 ھ</td>
                  </tr>
                  <tr>
                    <td>نتائج کا اعلان</td>
                    <td>25 شوال 1447 ھ</td>
                  </tr>
                  <tr>
                    <td>کلاسز کا آغاز</td>
                    <td>یکم ذوالقعدہ 1447 ھ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="content-block">
            <h2>رابطہ</h2>
            <p>
              مزید معلومات کے لیے مدرسہ کے دفتر سے رابطہ کریں:
              <br />
              فون: 0937-123456
              <br />
              پتہ: مردان، خیبر پختونخوا
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
