import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EmployeeRouter = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Solo empleados pueden acceder a rutas /employee
  if (user && user.rol !== 'EMPLEADO') {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};

export default EmployeeRouter;
