import { useState, useEffect, useCallback } from 'react';
import { getFatwas, submitFatwaQuestion } from '../../services/api';
import { FiSearch, FiSend, FiChevronRight, FiChevronLeft, FiEye, FiBook } from 'react-icons/fi';
import './FitwatPage.css';

const CATEGORIES = ['تمام', 'طہارت', 'نماز', 'زکوٰۃ', 'روزہ', 'حج', 'نکاح و طلاق', 'تجارت', 'کھانا پینا', 'متفرقات'];


function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('ur-PK', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function FitwatPage() {
  // --- Public list state ---
  const [fatwas, setFatwas] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // --- Filters ---
  const [activeCategory, setActiveCategory] = useState('تمام');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // --- Selected fatwa detail ---
  const [selectedFatwa, setSelectedFatwa] = useState(null);

  // --- Ask form ---
  const [showAskForm, setShowAskForm] = useState(false);
  const [askForm, setAskForm] = useState({ askerName: '', askerCity: '', category: 'متفرقات', question: '' });
  const [askSubmitting, setAskSubmitting] = useState(false);
  const [askSuccess, setAskSuccess] = useState('');
  const [askError, setAskError] = useState('');

  const loadFatwas = useCallback(async () => {
    setLoading(true);
    const result = await getFatwas({ category: activeCategory, page, limit: 8, search: searchQuery });
    setFatwas(result.fatwas || []);
    setTotal(result.total || 0);
    setPages(result.pages || 1);
    setLoading(false);
  }, [activeCategory, page, searchQuery]);

  useEffect(() => {
    loadFatwas();
  }, [loadFatwas]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [activeCategory, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setSelectedFatwa(null);
  };

  const handleFatwaClick = (fatwa) => {
    setSelectedFatwa(fatwa);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedFatwa(null);
  };

  const handleAskChange = (e) => {
    setAskForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAskSubmit = async (e) => {
    e.preventDefault();
    setAskError('');
    setAskSuccess('');
    if (!askForm.question || askForm.question.trim().length < 10) {
      setAskError('سوال کم از کم ۱۰ حروف کا ہونا چاہیے');
      return;
    }
    setAskSubmitting(true);
    try {
      const result = await submitFatwaQuestion(askForm);
      setAskSuccess(result.message || 'آپ کا سوال موصول ہو گیا۔ جزاک اللہ خیرا۔');
      setAskForm({ askerName: '', askerCity: '', category: 'متفرقات', question: '' });
      setTimeout(() => {
        setShowAskForm(false);
        setAskSuccess('');
      }, 3500);
    } catch (err) {
      setAskError(err.message || 'سوال جمع کروانے میں خرابی آئی۔ دوبارہ کوشش کریں۔');
    } finally {
      setAskSubmitting(false);
    }
  };

  // -------- DETAIL VIEW --------
  if (selectedFatwa) {
    return (
      <div>
        <div className="page-header">
          <div className="container">
            <h1>فتاویٰ</h1>
            <p>مدرسہ عربیہ سیدنا صدیق اکبر رضی اللہ تعالیٰ عنہ — اسلامی مسائل و احکام</p>
          </div>
        </div>
        <div className="content-page">
          <div className="container">
            <button className="btn btn-outline btn-sm fitwat-back-btn" onClick={handleBackToList}>
              <FiChevronLeft size={16} />
              فتاویٰ فہرست پر واپس جائیں
            </button>

            <div className="fitwat-detail-card">
              <div className="fitwat-detail-meta">
                <span className="badge badge-info fitwat-cat-badge">{selectedFatwa.category}</span>
                {selectedFatwa.publishedAt && (
                  <span className="fitwat-detail-date">{formatDate(selectedFatwa.publishedAt)}</span>
                )}
                {selectedFatwa.views > 0 && (
                  <span className="fitwat-views">
                    <FiEye size={14} /> {selectedFatwa.views}
                  </span>
                )}
              </div>

              <div className="fitwat-detail-section fitwat-question-block">
                <div className="fitwat-section-label">سوال</div>
                <p className="fitwat-detail-text">{selectedFatwa.question}</p>
                {selectedFatwa.askerName && selectedFatwa.askerName !== 'گمنام' && (
                  <div className="fitwat-asker">
                    — {selectedFatwa.askerName}
                    {selectedFatwa.askerCity ? `، ${selectedFatwa.askerCity}` : ''}
                  </div>
                )}
              </div>

              {selectedFatwa.answer && (
                <div className="fitwat-detail-section fitwat-answer-block">
                  <div className="fitwat-section-label fitwat-answer-label">جواب</div>
                  <div className="fitwat-answer-content">
                    {selectedFatwa.answer.split('\n').map((line, i) =>
                      line.trim() ? <p key={i} className="fitwat-detail-text">{line}</p> : <br key={i} />
                    )}
                  </div>
                  <div className="fitwat-answer-footer">
                    مدرسہ عربیہ سیدنا صدیق اکبر رضی اللہ تعالیٰ عنہ، مردان
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------- LIST / HOME VIEW --------
  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1>فتاویٰ</h1>
          <p>مدرسہ عربیہ سیدنا صدیق اکبر رضی اللہ تعالیٰ عنہ — اسلامی مسائل و احکام</p>
        </div>
      </div>

      <div className="content-page">
        <div className="container">

          {/* Search Bar */}
          <form className="fitwat-search-form" onSubmit={handleSearch}>
            <div className="fitwat-search-inner">
              <input
                type="text"
                className="form-input fitwat-search-input"
                placeholder="فتوے میں تلاش کریں..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button type="submit" className="btn btn-primary fitwat-search-btn">
                <FiSearch size={18} />
                تلاش
              </button>
            </div>
          </form>

          {/* Category Filter */}
          <div className="fitwat-categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`btn btn-sm fitwat-cat-btn ${activeCategory === cat ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Stats + Ask CTA */}
          <div className="fitwat-top-row">
            <div className="fitwat-count-label">
              {loading ? 'لوڈ ہو رہا ہے...' : total > 0 ? `${total} فتاویٰ دستیاب ہیں` : 'کوئی فتویٰ نہیں ملا'}
            </div>
            <button
              className="btn btn-accent fitwat-ask-cta"
              onClick={() => { setShowAskForm(true); setAskError(''); setAskSuccess(''); }}
            >
              <FiSend size={16} />
              سوال پوچھیں
            </button>
          </div>

          {/* Fatwa List */}
          {loading ? (
            <div className="loading-container">
              <div className="spinner" />
            </div>
          ) : fatwas.length === 0 ? (
            <div className="fitwat-empty">
              <FiBook size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }} />
              <p>اس زمرے میں ابھی کوئی فتویٰ موجود نہیں</p>
            </div>
          ) : (
            <div className="fitwat-list">
              {fatwas.map((fatwa) => (
                <div
                  key={fatwa._id}
                  className="fitwat-card"
                  onClick={() => handleFatwaClick(fatwa)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleFatwaClick(fatwa)}
                >
                  <div className="fitwat-card-body">
                    <div className="fitwat-card-meta">
                      <span className="badge badge-info">{fatwa.category}</span>
                      {fatwa.publishedAt && (
                        <span className="fitwat-card-date">{formatDate(fatwa.publishedAt)}</span>
                      )}
                    </div>
                    <p className="fitwat-card-question">{fatwa.question}</p>
                    {fatwa.answer && (
                      <p className="fitwat-card-answer-preview">
                        {fatwa.answer.length > 120 ? fatwa.answer.slice(0, 120) + '...' : fatwa.answer}
                      </p>
                    )}
                  </div>
                  <div className="fitwat-card-footer">
                    <span className="fitwat-read-more">
                      مکمل جواب پڑھیں <FiChevronRight size={14} />
                    </span>
                    {fatwa.views > 0 && (
                      <span className="fitwat-views">
                        <FiEye size={13} /> {fatwa.views}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="fitwat-pagination">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <FiChevronRight size={16} /> پچھلا
              </button>
              <span className="fitwat-page-info">صفحہ {page} / {pages}</span>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
              >
                اگلا <FiChevronLeft size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Ask Question Modal */}
      {showAskForm && (
        <div className="modal-overlay" onClick={() => setShowAskForm(false)}>
          <div className="modal fitwat-ask-modal" onClick={(e) => e.stopPropagation()}>
            <div className="card-header">
              <h3 style={{ margin: 0 }}>سوال پوچھیں</h3>
            </div>
            <div className="card-body">
              <p className="fitwat-ask-note">
                برائے مہربانی سوال واضح اور مختصر لکھیں۔ جواب مل جانے پر فتاویٰ صفحہ پر شائع کیا جائے گا۔
              </p>

              {askSuccess && <div className="alert alert-success">{askSuccess}</div>}
              {askError && <div className="alert alert-error">{askError}</div>}

              {!askSuccess && (
                <form onSubmit={handleAskSubmit}>
                  <div className="grid grid-2" style={{ gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">آپ کا نام (اختیاری)</label>
                      <input
                        name="askerName"
                        className="form-input"
                        value={askForm.askerName}
                        onChange={handleAskChange}
                        placeholder="نام درج کریں"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">شہر (اختیاری)</label>
                      <input
                        name="askerCity"
                        className="form-input"
                        value={askForm.askerCity}
                        onChange={handleAskChange}
                        placeholder="شہر کا نام"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">زمرہ</label>
                    <select
                      name="category"
                      className="form-select"
                      value={askForm.category}
                      onChange={handleAskChange}
                    >
                      {CATEGORIES.filter((c) => c !== 'تمام').map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">سوال <span style={{ color: 'var(--color-error)' }}>*</span></label>
                    <textarea
                      name="question"
                      className="form-textarea"
                      value={askForm.question}
                      onChange={handleAskChange}
                      placeholder="اپنا سوال یہاں تفصیل سے لکھیں..."
                      rows={5}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <button type="button" className="btn btn-outline" onClick={() => setShowAskForm(false)}>
                      منسوخ
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={askSubmitting}>
                      {askSubmitting ? 'جمع ہو رہا ہے...' : <><FiSend size={15} /> سوال بھیجیں</>}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
