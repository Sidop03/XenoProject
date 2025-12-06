import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, logout as logoutApi, getProfile } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Token found in localStorage, checking auth...');
        const response = await getProfile();
        const tenant = response.data.data?.tenant || response.data.tenant;
        setUser(tenant);
        console.log('Auth check successful:', tenant.email);
      } else {
        console.log('No token found in localStorage');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await loginApi(credentials);
      console.log('📥 Login response:', response.data);
      
      const { token, data } = response.data;
      const tenant = data?.tenant;
      
      if (token) {
        console.log('Storing token in localStorage');
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(tenant));
        setUser(tenant);
        return { success: true };
      } else {
        console.error('No token in login response');
        throw new Error('No token received from server');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
