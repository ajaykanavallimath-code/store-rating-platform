import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected & Role Route Guards
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
import OwnerLayout from './layouts/OwnerLayout';

// Public & Shared Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ChangePassword from './pages/ChangePassword';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import AddUser from './pages/admin/AddUser';
import UserDetails from './pages/admin/UserDetails';
import ManageStores from './pages/admin/ManageStores';
import AddStore from './pages/admin/AddStore';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import StoreDetails from './pages/user/StoreDetails';

// Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';

// Root index redirector based on authenticated role
const RootRedirector = () => {
  const { user, loading, getDashboardPath } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getDashboardPath(user.role)} replace />;
};

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0f172a',
              color: '#f8fafc',
              fontSize: '13px',
              fontWeight: 500,
              borderRadius: '16px',
              padding: '12px 16px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff'
              }
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff'
              }
            }
          }}
        />

        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Root redirector */}
          <Route path="/" element={<RootRedirector />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['ADMIN']}>
                  <AdminLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="users/new" element={<AddUser />} />
            <Route path="users/:id" element={<UserDetails />} />
            <Route path="stores" element={<ManageStores />} />
            <Route path="stores/new" element={<AddStore />} />
          </Route>

          {/* User / Shopper Routes */}
          <Route
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['USER']}>
                  <UserLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/stores/:id" element={<StoreDetails />} />
          </Route>

          {/* Store Owner Routes */}
          <Route
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['OWNER']}>
                  <OwnerLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          </Route>

          {/* Shared Authenticated Password Change Route */}
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ChangePassword />} />
          </Route>

          {/* 404 Catch All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
