import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRouter = ({ redirect = '/admin', checkAuth = true }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (checkAuth && isAuthenticated) {
    return <Navigate to={redirect} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default PublicRouter;
