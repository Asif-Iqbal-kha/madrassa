import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiUsers, FiBookOpen, FiFileText, FiImage, FiSettings, FiLogOut, FiCheckSquare, FiClipboard, FiBarChart2, FiUser, FiCalendar, FiArrowUpCircle } from 'react-icons/fi';
import './Sidebar.css';

const menuItems = {
  master_admin: [
    { path: '/admin/dashboard', label: 'ڈیش بورڈ', icon: FiHome },
    { path: '/admin/students', label: 'طلباء', icon: FiUsers },
    { path: '/admin/teachers', label: 'اساتذہ', icon: FiUser },
    { path: '/admin/classes', label: 'درجات', icon: FiBookOpen },
    { path: '/admin/promote', label: 'ترقی / داخلہ', icon: FiArrowUpCircle },
    { path: '/admin/news', label: 'اعلانات', icon: FiFileText },
    { path: '/admin/gallery', label: 'تصاویر', icon: FiImage },
  ],
  teacher: [
    { path: '/teacher/dashboard', label: 'ڈیش بورڈ', icon: FiHome },
    { path: '/teacher/attendance', label: 'حاضری لگائیں', icon: FiCheckSquare },
    { path: '/teacher/attendance-history', label: 'حاضری ریکارڈ', icon: FiCalendar },
    { path: '/teacher/results', label: 'نتائج اپلوڈ', icon: FiClipboard },
  ],
  student: [
    { path: '/student/dashboard', label: 'ڈیش بورڈ', icon: FiHome },
    { path: '/student/results', label: 'نتائج', icon: FiBarChart2 },
    { path: '/student/attendance', label: 'حاضری', icon: FiCalendar },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const items = menuItems[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabels = {
    master_admin: 'ماسٹر ایڈمن',
    teacher: 'استاذ',
    student: 'طالب علم',
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src="./logo.png" alt="لوگو" className="sidebar-madrassa-logo" />
        <div className="sidebar-user-info">
          <p className="sidebar-user-name">{user.name}</p>
          <p className="sidebar-user-role">{roleLabels[user.role]}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {items.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-active' : ''}`}
              >
                <item.icon className="sidebar-icon" size={18} />
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
