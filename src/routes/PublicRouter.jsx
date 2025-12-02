import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const mapRoleToPath = (rol) => {
  if (!rol) return '/login';
  const normalized = String(rol).toUpperCase();
  switch (normalized) {
    case 'ADMINISTRADOR':
      return '/admin';
    case 'EMPLEADO':
      return '/employee';
    case 'CLIENTE':
      return '/client/packages';
    default:
      return '/admin';
  }
};

const PublicRouter = ({ checkAuth = true }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (checkAuth && isAuthenticated) {
    const redirect = mapRoleToPath(user && user.rol);
    return <Navigate to={redirect} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default PublicRouter;
