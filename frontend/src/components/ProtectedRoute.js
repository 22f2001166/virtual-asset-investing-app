import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element: Component, allowedRoles }) => {
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');

  if (!token) {
    // Not logged in → redirect to login
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(role)) {
    // Logged in but wrong role → redirect to homepage
    return <Navigate to="/" />;
  }

  // Authorized → show the component
  return <Component />;
};

export default ProtectedRoute;
