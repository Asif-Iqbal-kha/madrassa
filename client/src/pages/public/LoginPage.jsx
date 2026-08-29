import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './PublicPages.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (user) {
    const paths = {
      master_admin: '/admin/dashboard',
      teacher: '/teacher/dashboard',
    };
    navigate(paths[user.role] || '/');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('صارف نام اور پاسورڈ درج کریں');
      return;
    }

    setLoading(true);
    try {
      const result = await login(username.trim(), password.trim());
      if (result.success) {
        const paths = {
          master_admin: '/admin/dashboard',
          teacher: '/teacher/dashboard',
        };
        navigate(paths[result.role] || '/');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('لاگ ان میں خرابی پیش آگئی');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo-wrapper">
            <img src="./logo.png" alt="مدرسہ عربیہ سیدنا صدیق اکبر رضی اللہ تعالیٰ عنہ" className="login-logo-img" />
          </div>
          <h2>مدرسہ عربیہ سیدنا صدیق اکبر رضی اللہ تعالیٰ عنہ</h2>
          <p>پورٹل لاگ ان</p>
        </div>

        <div className="login-body">
          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">صارف نام</label>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="صارف نام درج کریں"
                autoComplete="username"
                style={{ direction: 'ltr', textAlign: 'right' }}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">پاسورڈ</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="پاسورڈ درج کریں"
                autoComplete="current-password"
                style={{ direction: 'ltr', textAlign: 'right' }}
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
              {loading ? 'لاگ ان ہو رہا ہے...' : 'لاگ ان'}
            </button>
          </form>

          <div className="login-test-info">
            <h4>لاگ ان معلومات:</h4>
            <p>Admin: admin / admin123</p>
            <p>Teacher: teacher / teacher123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
