import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user session
    const token = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken');
    const savedUser = localStorage.getItem('user');
    const savedAdmin = localStorage.getItem('admin');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    if (adminToken && savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch (error) {
        console.error('Error parsing admin data:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
      }
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user, requiresVerification } = response.data;

      if (requiresVerification) {
        return { success: false, requiresVerification: true, email };
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      return { success: true, user };
    } catch (error) {
      if (error.response?.data?.requiresVerification) {
        return { 
          success: false, 
          requiresVerification: true, 
          email: error.response.data.email 
        };
      }
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { requiresVerification, email } = response.data;

      if (requiresVerification) {
        return { success: true, requiresVerification: true, email };
      }

      // Fallback for old behavior (though backend is updated)
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  };

  const verifyOTP = async (email, code) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, code });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Verification failed'
      };
    }
  };

  const resendOTP = async (email) => {
    try {
      await api.post('/auth/resend-otp', { email });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to resend code'
      };
    }
  };

  const googleLogin = async (idToken) => {
    try {
      const response = await api.post('/auth/google', { idToken });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Google login failed'
      };
    }
  };

  const adminLogin = async (email, password) => {
    try {
      const response = await api.post('/admin/login', { email, password });
      const { token, admin } = response.data;

      localStorage.setItem('adminToken', token);
      localStorage.setItem('admin', JSON.stringify(admin));
      setAdmin(admin);

      return { success: true, admin };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Admin login failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const adminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    setAdmin(null);
  };

  const value = {
    user,
    admin,
    loading,
    login,
    register,
    verifyOTP,
    resendOTP,
    googleLogin,
    adminLogin,
    logout,
    adminLogout,
    isAuthenticated: !!user,
    isAdmin: !!admin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};