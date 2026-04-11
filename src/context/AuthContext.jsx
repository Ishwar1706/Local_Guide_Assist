import { createContext, useContext, useState, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

const loadFromStorage = () => {
  try {
    const token = localStorage.getItem('lg_token');
    const user = JSON.parse(localStorage.getItem('lg_user') || 'null');
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
};

export function AuthProvider({ children }) {
  const stored = loadFromStorage();
  const [user, setUser] = useState(stored.user);
  const [token, setToken] = useState(stored.token);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const saveSession = (userData, jwt) => {
    localStorage.setItem('lg_token', jwt);
    localStorage.setItem('lg_user', JSON.stringify(userData));
    setUser(userData);
    setToken(jwt);
  };

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.login({ email, password });
      saveSession(res.data.user, res.data.token);
      return res.data.user;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password, role) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.register({ name, email, password, role });
      saveSession(res.data.user, res.data.token);
      return res.data.user;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('lg_token');
    localStorage.removeItem('lg_user');
    setUser(null);
    setToken(null);
  }, []);

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, clearError, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
