import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, getUserProfile } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const saved = localStorage.getItem('madrassa_user');
      const token = localStorage.getItem('madrassa_token');

      // Without a valid JWT token, user is not authenticated for API operations
      if (!token) {
        setUser(null);
        localStorage.removeItem('madrassa_user');
        setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile();
        if (profile) {
          setUser(profile);
          localStorage.setItem('madrassa_user', JSON.stringify(profile));
        } else if (saved) {
          setUser(JSON.parse(saved));
        } else {
          setUser(null);
          localStorage.removeItem('madrassa_user');
          localStorage.removeItem('madrassa_token');
        }
      } catch (err) {
        console.warn('Auth check error:', err);
        if (saved) {
          try {
            setUser(JSON.parse(saved));
          } catch {
            setUser(null);
            localStorage.removeItem('madrassa_user');
          }
        }
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (username, password) => {
    const apiResult = await loginUser(username, password);
    if (apiResult.success) {
      setUser(apiResult.user);
      return apiResult;
    }
    return { success: false, message: apiResult.message || 'صارف نام یا پاسورڈ غلط ہے' };
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
