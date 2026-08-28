import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, getUserProfile } from '../services/api';
import { TEST_CREDENTIALS, MOCK_USER_PROFILES } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const saved = localStorage.getItem('madrassa_user');
      const token = localStorage.getItem('madrassa_token');
      if (token) {
        const profile = await getUserProfile();
        if (profile) {
          setUser(profile);
          localStorage.setItem('madrassa_user', JSON.stringify(profile));
        } else if (saved) {
          try {
            setUser(JSON.parse(saved));
          } catch {
            localStorage.removeItem('madrassa_user');
          }
        }
      } else if (saved) {
        try {
          setUser(JSON.parse(saved));
        } catch {
          localStorage.removeItem('madrassa_user');
        }
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const login = async (username, password) => {
    // 1. Try real backend login first
    const apiResult = await loginUser(username, password);
    if (apiResult.success) {
      setUser(apiResult.user);
      return apiResult;
    }

    // 2. Offline / local fallback
    const cred = Object.values(TEST_CREDENTIALS).find(
      (c) => c.username === username && c.password === password
    );
    if (!cred) {
      return { success: false, message: apiResult.message || 'صارف نام یا پاسورڈ غلط ہے' };
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
    localStorage.removeItem('madrassa_token');
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
