import { createContext, useContext, useState, useEffect } from 'react';
import { TEST_CREDENTIALS, MOCK_USER_PROFILES } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('madrassa_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem('madrassa_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    const cred = Object.values(TEST_CREDENTIALS).find(
      (c) => c.username === username && c.password === password
    );
    if (!cred) {
      return { success: false, message: 'صارف نام یا پاسورڈ غلط ہے' };
    }
    const profile = MOCK_USER_PROFILES[cred.role];
    const userData = { ...profile, role: cred.role };
    setUser(userData);
    localStorage.setItem('madrassa_user', JSON.stringify(userData));
    return { success: true, role: cred.role };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('madrassa_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
