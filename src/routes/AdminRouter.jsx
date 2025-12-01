import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRouter = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Solo administradores pueden acceder a rutas /admin
  if (user && user.rol !== 'ADMINISTRADOR') {
    return <Navigate to="/employee" replace />;
  }

  return <Outlet />;
};

export default AdminRouter;
