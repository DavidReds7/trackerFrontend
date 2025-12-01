import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const mapRoleToPath = (rol) => {
  if (!rol) return '/admin'; // fallback
  const normalized = String(rol).toUpperCase();
  switch (normalized) {
    case 'ADMINISTRADOR':
      return '/admin';
    case 'EMPLEADO':
      return '/employee';
    case 'CLIENTE':
    case 'CLIENT':
      return '/admin'; // no client dashboard yet — send to admin/profile as fallback
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
