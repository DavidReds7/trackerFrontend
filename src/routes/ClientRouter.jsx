import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ClientRouter = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (user && user.rol !== 'CLIENTE') {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
};

export default ClientRouter;
