import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import DashboardPage from '../features/admin/pages/DashboardPage';
import ReportsPage from '../features/admin/pages/ReportsPage';
import ProfilePage from '../features/admin/pages/ProfilePage';
import LoginPage from '../features/auth/pages/LoginPage';
import RecoveryPage from '../features/auth/pages/RecoveryPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import PrivateRouter from './PrivateRouter';
import PublicRouter from './PublicRouter';

const NotFoundPage = () => (
  <section>
    <h2>Página no encontrada</h2>
    <p>Regresa al inicio o accede al panel si ya estás autenticado.</p>
  </section>
);

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth/login" replace />} />
      <Route element={<PublicRouter />}>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/recuperar" element={<RecoveryPage />} />
        <Route path="/auth/crear" element={<RegisterPage />} />
      </Route>
      <Route element={<PrivateRouter />}>
        <Route path="/admin" element={<DashboardPage />} />
        <Route path="/admin/reportes" element={<ReportsPage />} />
        <Route path="/admin/perfil" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRouter;
