import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('srp_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  // Initialize and verify session on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('srp_token');
        if (token || document.cookie.includes('token')) {
          const res = await authService.getMe();
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('srp_user', JSON.stringify(res.data.user));
          }
        } else {
          setUser(null);
          localStorage.removeItem('srp_user');
        }
      } catch (err) {
        // Not authenticated
        setUser(null);
        localStorage.removeItem('srp_user');
        localStorage.removeItem('srp_token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    const loggedInUser = res.data.user;
    setUser(loggedInUser);
    return loggedInUser;
  };

  const signup = async (userData) => {
    const res = await authService.signup(userData);
    const newUser = res.data.user;
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Clean up even if network error
    } finally {
      setUser(null);
      localStorage.removeItem('srp_user');
      localStorage.removeItem('srp_token');
      toast.success('Logged out successfully.');
    }
  };

  const changePassword = async (passwordData) => {
    const res = await authService.changePassword(passwordData);
    setUser(null);
    localStorage.removeItem('srp_user');
    localStorage.removeItem('srp_token');
    return res;
  };

  const getDashboardPath = (role) => {
    const userRole = role || user?.role;
    switch (userRole) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'OWNER':
        return '/owner/dashboard';
      case 'USER':
      default:
        return '/dashboard';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        signup,
        logout,
        changePassword,
        getDashboardPath,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isOwner: user?.role === 'OWNER',
        isUser: user?.role === 'USER'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
