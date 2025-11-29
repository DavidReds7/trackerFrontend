import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRouter = ({ redirect = '/auth/login' }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={redirect} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default PrivateRouter;
