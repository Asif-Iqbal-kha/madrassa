import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchStudentResult } from '../../services/api';
import {
  FiSearch,
  FiPrinter,
  FiX,
  FiCheckCircle,
  FiFileText,
  FiAward,
  FiCheck,
  FiAlertCircle,
} from 'react-icons/fi';
import './PublicPages.css';

export default function ResultPage() {
  const [searchParams] = useSearchParams();
  const [rollInput, setRollInput] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [resultsData, setResultsData] = useState(null);
  const [resultError, setResultError] = useState('');
  const [searchedRoll, setSearchedRoll] = useState('');
  const resultCardRef = useRef(null);

  const handleSearch = async (roll) => {
    const targetRoll = (roll || rollInput).trim();
    if (!targetRoll) {
      setResultError('برائے مہربانی طالب علم کا رول نمبر درج کریں');
      return;
    }

    setResultError('');
    setSearchLoading(true);
    setResultsData(null);
    setSearchedRoll(targetRoll);

    try {
      const data = await searchStudentResult(targetRoll);
      if (data && !data.error && Array.isArray(data) && data.length > 0) {
        setResultsData(data);
        setTimeout(() => {
          if (resultCardRef.current) {
            resultCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      } else {
        setResultError(data?.error || `رول نمبر ${targetRoll} کا کوئی نتیجہ دستیاب نہیں ہے`);
      }
    } catch (err) {
      setResultError('رزلٹ تلاش کرنے میں خرابی ہوئی، دوبارہ کوشش کریں');
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const initialRoll = searchParams.get('roll');
    if (initialRoll) {
      setRollInput(initialRoll);
      handleSearch(initialRoll);
    }
  }, [searchParams]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="results-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1>امتحانی نتائج</h1>
          <p>مدرسہ عربیہ سیدنا صدیق اکبر رضی اللہ تعالیٰ عنہ — کشف الدرجات و امتحانی رزلٹ پورٹل</p>
        </div>
      </div>

      <div className="content-page">
        <div className="container">
          {/* Search Box */}
          <div className="result-search-box-wrapper no-print">
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)', margin: '0 0 6px' }}>
                طالب علم کا رزلٹ معلوم کریں
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: 0 }}>
                رول نمبر درج کر کے سالانہ و ششماہی امتحانات کا تفصیلی رزلٹ کارڈ حاصل کریں
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="result-search-form"
            >
              <div className="result-search-input-group">
                <FiSearch className="result-search-icon" size={20} />
                <input
                  type="text"
                  className="result-search-input"
                  placeholder="رول نمبر درج کریں (مثلاً: 1001)"
                  value={rollInput}
                  onChange={(e) => setRollInput(e.target.value)}
                  style={{ fontFamily: 'var(--font-english)', direction: 'ltr', textAlign: 'right' }}
                />
                {rollInput && (
                  <button
                    type="button"
                    className="result-search-clear"
                    onClick={() => {
                      setRollInput('');
                      setResultsData(null);
                      setResultError('');
                    }}
                  >
                    <FiX size={18} />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="btn btn-primary result-search-btn"
                disabled={searchLoading}
              >
                {searchLoading ? (
                  <span>تلاش جاری ہے...</span>
                ) : (
                  <>
                    <FiSearch size={18} /> نتیجہ تلاش کریں
                  </>
                )}
              </button>
            </form>

            {/* Sample Roll Numbers */}
            <div className="result-demo-chips">
              <span className="chips-label">نمونہ رول نمبرز:</span>
              {['1001', '1002', '1003'].map((sampleRoll) => (
                <button
                  key={sampleRoll}
                  type="button"
                  className="chip-btn"
                  onClick={() => {
                    setRollInput(sampleRoll);
                    handleSearch(sampleRoll);
                  }}
                >
                  رول نمبر {sampleRoll}
                </button>
              ))}
            </div>

            {/* Error Display */}
            {resultError && (
              <div className="result-error-alert">
                <FiAlertCircle size={20} />
                <span>{resultError}</span>
              </div>
            )}
          </div>

          {/* DIGNIFIED RESULT CARD / SANAD */}
          {resultsData && resultsData.length > 0 && (
            <div ref={resultCardRef} className="result-card-container">
              {resultsData.map((resItem, idx) => {
                const isPassed = (resItem.percentage || 0) >= 33;
                return (
                  <div key={resItem._id || idx} className="official-result-card print-target">
                    {/* Background Watermark */}
                    <div className="result-watermark">
                      <img src="./logo.png" alt="مدرسہ واٹرمارک" />
                    </div>

                    {/* Bismillah & Calligraphic Ornament */}
                    <div className="result-card-header-ornament">
                      <div className="ornament-line"></div>
                      <div className="ornament-bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
                      <div className="ornament-line"></div>
                    </div>

                    {/* Official Madrassa Header */}
                    <div className="result-madrassa-header">
                      <img src="./logo.png" alt="لوگو مدرسہ" className="result-madrassa-logo" />
                      <div className="result-madrassa-info">
                        <h3 className="result-madrassa-name">مدرسہ عربیہ سیدنا صدیق اکبر رضی اللہ تعالیٰ عنہ</h3>
                        <p className="result-madrassa-sub">توحید کالونی، چارسدہ روڈ، مردان، خیبر پختونخوا</p>
                        <div className="result-sheet-title">
                          <span>کشف الدرجات (امتحانی سند و رزلٹ کارڈ)</span>
                        </div>
                      </div>
                    </div>

                    {/* Student Metadata Box */}
                    <div className="result-student-meta-box">
                      <div className="meta-item">
                        <span className="meta-label">امتحان کا نام</span>
                        <span className="meta-val highlight">{resItem.examName || 'سالانہ امتحان'}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">تعلیمی سال</span>
                        <span className="meta-val eng">{resItem.year || '1446ھ'}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">طالب علم کا نام</span>
                        <span className="meta-val strong">{resItem.studentName}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">رول نمبر</span>
                        <span className="meta-val roll-val eng">{resItem.rollNumber}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">درجہ / کلاس</span>
                        <span className="meta-val">{resItem.className}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">تاریخ اجراء</span>
                        <span className="meta-val eng">{new Date().toISOString().split('T')[0]}</span>
                      </div>
                    </div>

                    {/* Marks Table */}
                    <div className="result-marks-table-wrapper">
                      <table className="result-marks-table">
                        <thead>
                          <tr>
                            <th style={{ width: '60px' }}>شمار</th>
                            <th>مضمون</th>
                            <th style={{ width: '100px' }}>کل نمبر</th>
                            <th style={{ width: '120px' }}>حاصل کردہ نمبر</th>
                            <th style={{ width: '110px' }}>فیصد</th>
                            <th style={{ width: '90px' }}>کیفیت</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(resItem.marks || []).map((m, mIdx) => {
                            const subPct = Math.round((m.obtainedMarks / m.totalMarks) * 100);
                            const subPassed = subPct >= 33;
                            return (
                              <tr key={mIdx}>
                                <td className="text-center eng">{mIdx + 1}</td>
                                <td className="subject-name">{m.subject}</td>
                                <td className="text-center eng">{m.totalMarks}</td>
                                <td className="text-center eng obtained-mark">{m.obtainedMarks}</td>
                                <td>
                                  <div className="sub-progress-box">
                                    <div className="sub-progress-bar">
                                      <div
                                        className={`sub-progress-fill ${subPct >= 80 ? 'gold' : subPct >= 60 ? 'teal' : 'normal'}`}
                                        style={{ width: `${Math.min(subPct, 100)}%` }}
                                      ></div>
                                    </div>
                                    <span className="sub-pct-text eng">{subPct}%</span>
                                  </div>
                                </td>
                                <td className="text-center">
                                  <span className={`mark-status-pill ${subPassed ? 'pass' : 'fail'}`}>
                                    {subPassed ? 'کامیاب' : 'ناکام'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="result-total-row">
                            <td colSpan="2" className="text-right total-title">
                              مجموعی میزان (Grand Total):
                            </td>
                            <td className="text-center eng total-val">{resItem.totalMarks}</td>
                            <td className="text-center eng total-val obtained">{resItem.totalObtained}</td>
                            <td colSpan="2" className="text-center">
                              <span className="total-pct-badge eng">{resItem.percentage}%</span>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Summary Metric Cards */}
                    <div className="result-summary-cards">
                      <div className="summary-badge-card">
                        <div className="badge-card-data">
                          <span className="badge-card-label">کل حاصل کردہ نمبر</span>
                          <span className="badge-card-value eng">
                            {resItem.totalObtained} / {resItem.totalMarks}
                          </span>
                        </div>
                      </div>

                      <div className="summary-badge-card">
                        <div className="badge-card-data">
                          <span className="badge-card-label">مجموعی فیصد</span>
                          <span className="badge-card-value eng">{resItem.percentage}%</span>
                        </div>
                      </div>

                      <div className="summary-badge-card highlight-gold">
                        <div className="badge-card-data">
                          <span className="badge-card-label">حتمی درجہ بندی</span>
                          <span className="badge-card-value">{resItem.grade || 'الف+ (ممتاز)'}</span>
                        </div>
                      </div>

                      <div className={`summary-badge-card ${isPassed ? 'highlight-green' : 'highlight-red'}`}>
                        <div className="badge-card-data">
                          <span className="badge-card-label">حتمی کیفیت</span>
                          <span className="badge-card-value">{isPassed ? 'کامیاب با امتیاز' : 'ناکام'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Official Signatures & Verification Seal */}
                    <div className="result-card-signatures">
                      <div className="sig-block">
                        <div className="sig-line"></div>
                        <span className="sig-title">دستخط ممتحن / ناظم امتحانات</span>
                      </div>
                      <div className="sig-stamp-box">
                        <div className="stamp-circle">
                          <FiCheck size={18} />
                          <span>تصدیق شدہ امتحانی ریکارڈ</span>
                        </div>
                      </div>
                      <div className="sig-block">
                        <div className="sig-line"></div>
                        <span className="sig-title">دستخط مہتمم / صدر مدرس</span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="result-card-action-bar no-print">
                      <button type="button" className="btn btn-primary" onClick={handlePrint}>
                        <FiPrinter size={18} style={{ marginLeft: '6px' }} /> رزلٹ کارڈ پرنٹ / PDF محفوظ کریں
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => {
                          setResultsData(null);
                          setRollInput('');
                        }}
                      >
                        بند کریں
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
