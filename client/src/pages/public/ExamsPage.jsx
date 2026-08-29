import { Link } from 'react-router-dom';
import { FiSearch, FiFileText } from 'react-icons/fi';
import './PublicPages.css';

export default function ExamsPage() {
  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>امتحانات</h1>
          <p>امتحانات کا شیڈول اور تعلیمی معلومات</p>
        </div>
      </div>

      <div className="content-page">
        <div className="container">
          {/* Quick Result Check Banner */}
          <div
            className="donation-info-banner"
            style={{
              marginBottom: '28px',
              background: 'linear-gradient(135deg, rgba(15, 118, 110, 0.08), rgba(184, 150, 12, 0.08))',
              border: '1px solid rgba(15, 118, 110, 0.2)',
              borderRadius: '12px',
            }}
          >
            <div className="donation-info-text">
              <h3 style={{ color: 'var(--color-primary-dark)' }}>آن لائن امتحانی رزلٹ کارڈ معلوم کریں</h3>
              <p>طلباء اپنے رول نمبر کے ذریعے اپنے سالانہ اور ششماہی امتحانات کا تفصیلی رزلٹ کارڈ براہ راست آن لائن دیکھ اور پرنٹ کر سکتے ہیں۔</p>
            </div>
            <Link to="/results" className="btn btn-primary" style={{ whiteSpace: 'nowrap', alignSelf: 'center', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiSearch size={16} /> رزلٹ کارڈ دیکھیں
            </Link>
          </div>

          <div className="content-block">
            <h2>امتحانی نظام</h2>
            <p>
              مدرسہ عربیہ سیدنا صدیق اکبر رضی اللہ عنہ میں سال میں دو بار باقاعدہ امتحانات منعقد کیے جاتے ہیں۔ 
              ششماہی امتحان اور سالانہ امتحان۔ اس کے علاوہ ماہانہ ٹیسٹ بھی لیے جاتے ہیں 
              تاکہ طلباء کی تعلیمی پیشرفت کا جائزہ لیا جا سکے۔
            </p>
          </div>

          <div className="content-block">
            <h2>امتحانی شیڈول - 1447 ھ</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>امتحان</th>
                    <th>درجات</th>
                    <th>شروع</th>
                    <th>اختتام</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>ششماہی امتحان</td>
                    <td>تمام درجات</td>
                    <td>یکم جمادی الاول</td>
                    <td>15 جمادی الاول</td>
                  </tr>
                  <tr>
                    <td>سالانہ امتحان</td>
                    <td>تمام درجات</td>
                    <td>یکم شوال</td>
                    <td>15 شوال</td>
                  </tr>
                  <tr>
                    <td>حفظ امتحان</td>
                    <td>حفظ</td>
                    <td>20 شعبان</td>
                    <td>25 شعبان</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="content-block">
            <h2>مضامین</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>مضمون</th>
                    <th>کل نمبر</th>
                    <th>کامیابی کے نمبر</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>قرآن مجید</td>
                    <td>100</td>
                    <td>33</td>
                  </tr>
                  <tr>
                    <td>حدیث شریف</td>
                    <td>100</td>
                    <td>33</td>
                  </tr>
                  <tr>
                    <td>فقہ</td>
                    <td>100</td>
                    <td>33</td>
                  </tr>
                  <tr>
                    <td>عربی</td>
                    <td>100</td>
                    <td>33</td>
                  </tr>
                  <tr>
                    <td>اردو</td>
                    <td>100</td>
                    <td>33</td>
                  </tr>
                  <tr>
                    <td>ریاضی</td>
                    <td>100</td>
                    <td>33</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="content-block">
            <h2>درجہ بندی</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>درجہ</th>
                    <th>فیصد نمبر</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>الف+ (ممتاز)</td><td>90% سے زیادہ</td></tr>
                  <tr><td>الف (اعلیٰ)</td><td>80% - 89%</td></tr>
                  <tr><td>ب+ (بہت اچھا)</td><td>70% - 79%</td></tr>
                  <tr><td>ب (اچھا)</td><td>60% - 69%</td></tr>
                  <tr><td>ج (کامیاب)</td><td>33% - 59%</td></tr>
                  <tr><td>ناکام</td><td>33% سے کم</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
