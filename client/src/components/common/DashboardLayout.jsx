import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './DashboardLayout.css';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const roleLabels = {
    master_admin: 'لوحہ ایڈمن',
    teacher: 'لوحہ استاذ',
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="dashboard-topbar-inner">
            <h2 className="dashboard-topbar-title">{roleLabels[user?.role] || 'ڈیش بورڈ'}</h2>
            <div className="dashboard-topbar-info">
              <span className="dashboard-topbar-name">{user?.name}</span>
              <button
                className="dashboard-topbar-logout"
                onClick={handleLogout}
                title="لاگ آؤٹ"
                aria-label="لاگ آؤٹ"
              >
                <FiLogOut size={16} />
                <span>لاگ آؤٹ</span>
              </button>
            </div>
          </div>
        </header>
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
