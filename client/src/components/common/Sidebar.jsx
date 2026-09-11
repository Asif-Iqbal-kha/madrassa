import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllFatwaAdmin } from '../../services/api';
import { FiHome, FiUsers, FiBookOpen, FiFileText, FiImage, FiSettings, FiLogOut, FiCheckSquare, FiClipboard, FiUser, FiCalendar, FiArrowUpCircle, FiHeart, FiUserPlus, FiMessageSquare } from 'react-icons/fi';
import './Sidebar.css';

const menuItems = {
  master_admin: [
    { path: '/admin/dashboard', label: 'ڈیش بورڈ', icon: FiHome },
    { path: '/admin/students', label: 'طلباء', icon: FiUsers },
    { path: '/admin/teachers', label: 'اساتذہ', icon: FiUser },
    { path: '/admin/classes', label: 'درجات', icon: FiBookOpen },
    { path: '/admin/promote', label: 'ترقی / داخلہ', icon: FiArrowUpCircle },
    { path: '/admin/results', label: 'امتحانی نتائج', icon: FiClipboard },
    { path: '/admin/donations', label: 'عطیات', icon: FiHeart },
    { path: '/admin/admissions', label: 'داخلہ درخواستیں', icon: FiUserPlus },
    { path: '/admin/news', label: 'اعلانات', icon: FiFileText },
    { path: '/admin/gallery', label: 'تصاویر', icon: FiImage },
    { path: '/admin/fatwa', label: 'فتاویٰ', icon: FiMessageSquare },
  ],
  teacher: [
    { path: '/teacher/dashboard', label: 'ڈیش بورڈ', icon: FiHome },
    { path: '/teacher/attendance', label: 'حاضری لگائیں', icon: FiCheckSquare },
    { path: '/teacher/attendance-history', label: 'حاضری ریکارڈ', icon: FiCalendar },
    { path: '/teacher/results', label: 'نتائج اپلوڈ', icon: FiClipboard },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingFatwaCount, setPendingFatwaCount] = useState(0);

  useEffect(() => {
    if (user?.role !== 'master_admin') return;

    let isMounted = true;
    const fetchPendingCount = async () => {
      try {
        const list = await getAllFatwaAdmin({ status: 'pending' });
        if (isMounted && Array.isArray(list)) {
          setPendingFatwaCount(list.length);
        }
      } catch (err) {
        // ignore
      }
    };

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000);
    window.addEventListener('fatwaUpdated', fetchPendingCount);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('fatwaUpdated', fetchPendingCount);
    };
  }, [user?.role, location.pathname]);

  if (!user) return null;

  const items = menuItems[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabels = {
    master_admin: 'ماسٹر ایڈمن',
    teacher: 'استاذ',
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-header-brand">
          <img src="./logo.png" alt="لوگو" className="sidebar-madrassa-logo" />
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user.name}</p>
            <p className="sidebar-user-role">{roleLabels[user.role] || user.role}</p>
          </div>
        </div>
        <button className="sidebar-header-logout" onClick={handleLogout} title="لاگ آؤٹ" aria-label="لاگ آؤٹ">
          <FiLogOut size={16} />
          <span>لاگ آؤٹ</span>
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {items.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-active' : ''}`}
              >
                <span className="sidebar-icon-wrapper">
                  <item.icon className="sidebar-icon" size={18} />
                  {item.path === '/admin/fatwa' && pendingFatwaCount > 0 && (
                    <span className="sidebar-badge" title={`${pendingFatwaCount} نئے سوالات`}>
                      {pendingFatwaCount > 99 ? '99+' : pendingFatwaCount}
                    </span>
                  )}
                </span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={handleLogout}>
          <FiLogOut size={18} />
          <span>لاگ آؤٹ</span>
        </button>
      </div>
    </aside>
  );
}
