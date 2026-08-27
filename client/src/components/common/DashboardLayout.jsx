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
    student: 'لوحہ طالب علم',
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
