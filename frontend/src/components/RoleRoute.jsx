import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export const RoleRoute = ({ allowedRoles = [], children }) => {
  const { user, loading, getDashboardPath } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage message="Checking permissions..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to the dashboard appropriate for their actual role
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return children;
};

export default RoleRoute;
